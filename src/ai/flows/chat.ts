'use server';
/**
 * @fileOverview A simple chat flow for an AI assistant.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(ChatMessageSchema);

export async function chat(history: ChatMessage[]): Promise<ChatMessage> {
  return chatFlow(history);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatHistorySchema },
  output: { schema: z.string().nullable() },
  prompt: `You are a friendly and helpful AI assistant named Maudigi.
Your role is to assist users of the "All-in-One Toolkit" application.
Be concise and helpful.

Here is the conversation history:
{{#each input}}
{{role}}: {{content}}
{{/each}}
model:`,
  // Loosen safety settings for free-tier keys.
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatHistorySchema,
    outputSchema: ChatMessageSchema,
  },
  async (history) => {
    const { output } = await prompt(history);
    return {
        role: 'model',
        content: output || "Maaf, saya tidak bisa merespon saat ini. Coba lagi nanti.",
    };
  }
);
