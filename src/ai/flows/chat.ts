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

// This is the schema the Gemini API expects for chat history.
const ModelContentSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});

export async function chat(history: ChatMessage[]): Promise<ChatMessage> {
  return chatFlow(history);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatHistorySchema,
    outputSchema: ChatMessageSchema,
  },
  async (history) => {
    // Transform the simple chat history into the format the model expects.
    const modelHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    // The last message is the prompt, the rest is history.
    const lastMessage = modelHistory.pop(); // Use pop to get and remove the last message

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      history: modelHistory,
      prompt: lastMessage?.parts[0].text ?? '',
      config: {
        safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });
    
    const textResponse = response.text ?? "Maaf, saya tidak bisa merespon saat ini. Coba lagi nanti.";

    return {
      role: 'model',
      content: textResponse,
    };
  }
);
