
'use server';
/**
 * @fileOverview A file conversion flow using AI for layout-aware conversions.
 *
 * - convertPdfToWord: Converts a PDF file to a Word document, preserving layout.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import htmlToDocx from 'html-to-docx';
import {
    PdfToWordInputSchema,
    PdfToWordOutputSchema,
    type PdfToWordInput,
    type PdfToWordOutput,
} from './schemas';


const pdfToWordPrompt = ai.definePrompt({
    name: 'pdfToWordPrompt',
    input: { schema: z.object({ fileDataUri: z.string() }) },
    output: { schema: z.object({ htmlContent: z.string() }) },
    prompt: `You are an expert document analyst. Your task is to convert the provided PDF file into a single, clean HTML string. 
    
    Analyze the layout, structure, and content of the PDF. Preserve the following elements as accurately as possible:
    - Headings (h1, h2, h3, etc.)
    - Paragraphs (p)
    - Lists (ul, ol, li)
    - Tables (table, thead, tbody, tr, th, td)
    - Bold and italic text (strong, em)
    
    Do not include any CSS or style attributes. Focus on creating a semantically correct and well-structured HTML document that represents the PDF's content and layout.

    File: {{media url=fileDataUri}}
    
    Return ONLY the HTML content.`,
});

const convertPdfToWordFlow = ai.defineFlow(
  {
    name: 'convertPdfToWordFlow',
    inputSchema: PdfToWordInputSchema,
    outputSchema: PdfToWordOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await pdfToWordPrompt({ fileDataUri: input.fileDataUri });
        
        if (!output || !output.htmlContent) {
            return { error: 'AI failed to extract content from the PDF.' };
        }
        
        const docxBuffer = await htmlToDocx(output.htmlContent);
        const docxDataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBuffer.toString('base64')}`;

        return { docxDataUri: docxDataUri };
    } catch (e: any) {
        console.error("Error in convertPdfToWordFlow:", e);
        return { error: e.message || 'An unknown error occurred during conversion.' };
    }
  }
);

export async function convertPdfToWord(input: PdfToWordInput): Promise<PdfToWordOutput> {
  return await convertPdfToWordFlow(input);
}
