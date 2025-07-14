'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tags based on post content.
 * It exports the `suggestTags` function, the `SuggestTagsInput` type, and the `SuggestTagsOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  postContent: z.string().describe('The content of the post for which tags are to be suggested.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the post content.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are a school newsletter administrator. Based on the content of the post provided, suggest 5 relevant tags that can be used to categorize the post.

Post Content: {{{postContent}}}

Tags:`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
