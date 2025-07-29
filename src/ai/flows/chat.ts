
'use server';
/**
 * @fileOverview A simple chat flow for an AI assistant.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

import apps from '@/data/apps.json';
import assistant from '@/data/assistant.json';

// Schemas for the App Suggestion Tool
const AppSuggestionSchema = z.object({
    introText: z.string().describe("Engaging intro text to suggest the user try one of the apps. Must be in Indonesian."),
    title: z.string().describe("The exact title of the suggested app."),
    description: z.string().describe("The exact description of the suggested app."),
    href: z.string().describe("The exact URL endpoint of the suggested app."),
    buttonText: z.string().describe("A cheerful and inviting call to action text for the button, e.g., 'Yuk, coba!'. Must be in Indonesian."),
});

export type AppSuggestion = z.infer<typeof AppSuggestionSchema>;

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.union([z.string(), AppSuggestionSchema]),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(), // For history, we simplify to string
}));


// Tool definition
const findRelevantApp = ai.defineTool(
    {
        name: 'findRelevantApp',
        description: 'Searches the list of available applications to find a tool that can help with the user\'s request. Use this if the user mentions needing to convert files, scan something, calculate, etc.',
        inputSchema: z.object({
            query: z.string().describe('A summary of the user\'s problem or what they are trying to do.'),
        }),
        outputSchema: z.union([AppSuggestionSchema, z.null()]),
    },
    async (input) => {
        const query = input.query.toLowerCase();
        const relevantApp = apps.find(app => 
            app.title.toLowerCase().includes(query) || 
            app.description.toLowerCase().includes(query)
        );

        if (relevantApp) {
            return {
                introText: `Oh, sepertinya aku punya alat yang pas banget buat kamu! ✨ Coba deh pakai ini:`,
                title: relevantApp.title,
                description: relevantApp.description,
                href: relevantApp.href,
                buttonText: 'Yuk, coba!',
            };
        }
        
        // Return null if no app is found instead of throwing an error.
        return null;
    }
);


export async function chat(history: ChatMessage[]): Promise<ChatMessage> {
  // Convert rich history to simple string history for the model
  const simpleHistory = history.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : `[Suggested app: ${msg.content.title}]`,
  }));

  return chatFlow(simpleHistory);
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
    const lastMessage = modelHistory.pop(); 

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: assistant.systemPrompt,
      tools: [findRelevantApp],
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

    const toolCall = response.toolCalls?.[0];
    // Check if the tool was called and if its output is not null
    if (toolCall?.name === 'findRelevantApp' && toolCall.output) {
        return {
            role: 'model',
            content: toolCall.output as AppSuggestion,
        }
    }
    
    const textResponse = response.text ?? "Maaf, aku lagi bingung nih. Boleh coba tanya lagi dengan cara lain?";

    return {
      role: 'model',
      content: textResponse,
    };
  }
);
