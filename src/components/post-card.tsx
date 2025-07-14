"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { onValue, ref, push, serverTimestamp, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Post, Comment } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");

  useEffect(() => {
    const commentsRef = ref(db, `posts/${post.id}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentsArray: Comment[] = Object.entries(data)
          .map(([id, commentData]) => ({
            id,
            ...(commentData as Omit<Comment, "id">),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setComments(commentsArray);
      } else {
        setComments([]);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const commentsRef = ref(db, `posts/${post.id}/comments`);
    const newCommentRef = push(commentsRef);
    
    await set(newCommentRef, {
      name: commenterName.trim() || "Anonymous",
      text: newComment.trim(),
      date: new Date().toISOString(),
      userId: user?.uid || null,
    });
    
    setNewComment("");
  };

  return (
    <Card className="glassmorphism w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{post.title}</CardTitle>
        <CardDescription>
          Posted on {format(new Date(post.date), "MMMM d, yyyy 'at' h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {post.image && (
          <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="school event"
            />
          </div>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <h4 className="font-headline text-lg">Comments</h4>
        <div className="w-full space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-background/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{comment.name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(comment.date), "p, MMM d")}</p>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>}
        </div>
        <form onSubmit={handleAddComment} className="w-full flex flex-col sm:flex-row items-start gap-2 pt-4 border-t">
          <Input 
            placeholder="Your name (optional)" 
            className="w-full sm:w-1/3"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
          />
          <div className="w-full flex-1 flex gap-2">
            <Input 
                placeholder="Write a comment..." 
                className="flex-1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit" size="icon" variant="default">
                <Send className="h-4 w-4" />
                <span className="sr-only">Add comment</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
