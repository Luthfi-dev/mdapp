
'use server';
/**
 * @fileOverview A file conversion flow using AI.
 *
 * - convertPdfToWord - Converts a PDF file to a Word document.
 * - FileConversionInput - The input type for the file conversion function.
 * - FileConversionOutput - The return type for the file conversion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const FileConversionInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  filename: z.string().describe('The original name of the file.'),
});
export type FileConversionInput = z.infer<typeof FileConversionInputSchema>;

export const FileConversionOutputSchema = z.object({
  htmlContent: z.string().describe('The content of the document as an HTML string.'),
});
export type FileConversionOutput = z.infer<typeof FileConversionOutputSchema>;

const pdfToWordPrompt = ai.definePrompt({
    name: 'pdfToWordPrompt',
    input: { schema: FileConversionInputSchema },
    output: { schema: FileConversionOutputSchema },
    prompt: `You are an expert document converter. Your task is to extract all the text content from the provided PDF file and format it into a clean HTML structure that can be saved as a Word document.

    Preserve paragraphs, headings, and lists as best as you can. Do not worry about complex styling, focus on clean, readable, and structured text content.

    File: {{media url=pdfDataUri}}
    Filename: {{{filename}}}
    
    Return ONLY the HTML content.`,
});


const convertPdfToWordFlow = ai.defineFlow(
  {
    name: 'convertPdfToWordFlow',
    inputSchema: FileConversionInputSchema,
    outputSchema: FileConversionOutputSchema,
  },
  async (input) => {
    const { output } = await pdfToWordPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a conversion.');
    }
    return output;
  }
);

export async function convertPdfToWord(input: FileConversionInput): Promise<FileConversionOutput> {
  return await convertPdfToWordFlow(input);
}
