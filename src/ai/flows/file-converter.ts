
'use server';
/**
 * @fileOverview A file conversion flow using AI.
 *
 * - convertPdfToWord - Converts a PDF file to a Word document.
 */

import { ai } from '@/ai/genkit';
import { 
    FileConversionInput, 
    FileConversionInputSchema, 
    FileConversionOutput, 
    FileConversionOutputSchema 
} from './schemas';


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
