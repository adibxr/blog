"use client";

import { useState, useEffect } from "react";
import { onValue, ref, query, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";

import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import PostEditor from "@/components/post-editor";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { School } from "lucide-react";

export default function Home() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const postsRef = query(ref(db, "posts"));
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray: Post[] = Object.entries(data)
          .map(([id, postData]) => ({
            id,
            ...(postData as Omit<Post, "id">),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleDeletePost = async (postId: string) => {
    try {
      await remove(ref(db, `posts/${postId}`));
      toast({
        title: "Post Deleted",
        description: "The post has been successfully removed.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Post",
        description: "There was an error deleting the post. Please try again.",
      });
      console.error("Error deleting post: ", error);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {isAdmin && <PostEditor />}
          {loading ? (
            <div className="space-y-10">
              <Skeleton className="h-80 w-full rounded-2xl" />
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)
          ) : (
            <div className="text-center text-muted-foreground py-24 flex flex-col items-center gap-6">
              <School className="w-24 h-24 text-primary/30" />
              <h2 className="text-3xl font-headline">No news yet!</h2>
              <p className="mt-2 text-lg">Check back later for updates from the hive.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
