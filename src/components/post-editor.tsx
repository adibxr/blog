"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { push, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { suggestTags } from "@/ai/flows/suggest-tags";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, LoaderCircle, Sparkles, Tag, Newspaper } from "lucide-react";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  image: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type PostFormValues = z.infer<typeof postSchema>;

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default function PostEditor() {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", image: "" },
  });
  const contentValue = form.watch("content");

  const getTagSuggestions = useCallback(async (postContent: string) => {
    if (postContent.trim().length < 50) {
      setSuggestedTags([]);
      return;
    }
    setIsLoadingTags(true);
    try {
      const result = await suggestTags({ postContent });
      setSuggestedTags(result.tags.filter(t => !tags.includes(t)));
    } catch (error) {
      console.error("Failed to suggest tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [tags]);

  const debouncedSuggestTags = useMemo(() => debounce(getTagSuggestions, 1000), [getTagSuggestions]);

  useEffect(() => {
    debouncedSuggestTags(contentValue);
  }, [contentValue, debouncedSuggestTags]);


  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };
  
  const onSubmit = async (data: PostFormValues) => {
    try {
      await set(push(ref(db, "posts")), {
        title: data.title,
        content: data.content,
        image: data.image || "",
        tags: tags,
        date: new Date().toISOString(),
      });
      toast({ title: "Post published successfully!" });
      form.reset();
      setTags([]);
      setSuggestedTags([]);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to publish post", description: (error as Error).message });
    }
  };

  return (
    <Card className="glassmorphism animate-in fade-in-50 duration-500 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          <Newspaper /> Create New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Exciting news from the school!" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl><Textarea placeholder="Tell everyone what's happening..." className="min-h-[150px] font-body" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><ImagePlus size={18}/> Image URL (Optional)</FormLabel>
                    <FormControl>
                        <Input type="url" placeholder="https://placehold.co/600x400.png" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            
            <div className="space-y-4">
              <div>
                <FormLabel className="flex items-center gap-2 mb-2"><Tag size={18}/> Tags</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer text-sm bg-primary/10 text-primary-foreground border-primary/20 hover:bg-primary/20" onClick={() => toggleTag(tag)}>{tag}</Badge>
                  ))}
                  {tags.length === 0 && <p className="text-sm text-muted-foreground">Add some tags to categorize your post.</p>}
                </div>
              </div>

              {(isLoadingTags || suggestedTags.length > 0) && (
                <div>
                   <FormLabel className="flex items-center gap-2 mb-2 text-foreground/80"><Sparkles className="text-amber-500" size={18}/> Suggested Tags</FormLabel>
                   <div className="flex flex-wrap gap-2 items-center">
                    {isLoadingTags && <LoaderCircle className="w-5 h-5 animate-spin" />}
                    {suggestedTags.map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer text-sm border-dashed hover:bg-accent/10" onClick={() => toggleTag(tag)}>+ {tag}</Badge>
                    ))}
                   </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting} size="lg" className="bg-primary hover:bg-primary/90">
              {form.formState.isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Publish Post
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
