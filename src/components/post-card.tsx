"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { onValue, ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Post, Comment } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");

  useEffect(() => {
    if (post.comments) {
      const commentsArray: Comment[] = Object.entries(post.comments)
        .map(([id, commentData]) => ({
          id,
          ...commentData,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setComments(commentsArray);
    } else {
      setComments([]);
    }
  }, [post.comments]);

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
    <Card className="glassmorphism w-full animate-in fade-in-50 duration-500 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-4xl">{post.title}</CardTitle>
                <CardDescription className="text-base">
                Posted on {format(new Date(post.date), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
            </div>
            {isAdmin && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post and all its comments.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                            Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {post.image && (
          <div className="relative w-full h-80 mb-6 rounded-2xl overflow-hidden shadow-inner">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint="school event"
            />
          </div>
        )}
        <p className="whitespace-pre-wrap font-body text-lg leading-relaxed">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-sm bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 rounded-full px-4 py-1">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <h4 className="font-headline text-xl">Comments</h4>
        <div className="w-full space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20">{comment.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{comment.name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(comment.date), "p, MMM d")}</p>
                  </div>
                  <p className="text-sm mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>}
        </div>
        <form onSubmit={handleAddComment} className="w-full flex flex-col sm:flex-row items-start gap-2 pt-4 mt-4 border-t">
          <Input 
            placeholder="Your name (optional)" 
            className="w-full sm:w-1/3 rounded-full"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
          />
          <div className="w-full flex-1 flex gap-2">
            <Input 
                placeholder="Write a comment..." 
                className="flex-1 rounded-full"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit" size="icon" variant="default" className="bg-primary hover:bg-primary/90 rounded-full">
                <Send className="h-4 w-4" />
                <span className="sr-only">Add comment</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
