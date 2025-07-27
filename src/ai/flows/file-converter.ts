
'use server';
/**
 * @fileOverview A file conversion flow using AI for layout-aware conversions.
 *
 * - convertPdfToWord: Converts a PDF file to a Word document, preserving layout.
 * - convertWordToPdf: Converts a Word file to a PDF document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Schema for PDF to Word
export const PdfToWordInputSchema = z.object({
  fileDataUri: z.string().describe("A PDF file encoded as a data URI."),
  filename: z.string().describe('The original name of the file.'),
});
export type PdfToWordInput = z.infer<typeof PdfToWordInputSchema>;

export const PdfToWordOutputSchema = z.object({
  htmlContent: z.string().optional().describe('The content of the document as an HTML string.'),
  error: z.string().optional(),
});
export type PdfToWordOutput = z.infer<typeof PdfToWordOutputSchema>;


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
        return { htmlContent: output.htmlContent };
    } catch (e: any) {
        console.error("Error in convertPdfToWordFlow:", e);
        return { error: e.message || 'An unknown error occurred during conversion.' };
    }
  }
);

export async function convertPdfToWord(input: PdfToWordInput): Promise<PdfToWordOutput> {
  return await convertPdfToWordFlow(input);
}


// Schema for Word to PDF
export const WordToPdfInputSchema = z.object({
  fileDataUri: z.string().describe("A DOCX file encoded as a data URI."),
  filename: z.string().describe('The original name of the file.'),
});
export type WordToPdfInput = z.infer<typeof WordToPdfInputSchema>;

export const WordToPdfOutputSchema = z.object({
  fileDataUri: z.string().optional().describe('The converted PDF file as a data URI.'),
  error: z.string().optional(),
});
export type WordToPdfOutput = z.infer<typeof WordToPdfOutputSchema>;


const convertWordToPdfFlow = ai.defineFlow(
  {
    name: 'convertWordToPdfFlow',
    inputSchema: WordToPdfInputSchema,
    outputSchema: WordToPdfOutputSchema,
  },
  async (input) => {
    try {
      const buffer = Buffer.from(input.fileDataUri.split(',')[1], 'base64');
      const { value: html } = await mammoth.extractRawText({ buffer });

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const textContent = html.replace(/<[^>]*>/g, ''); // Basic HTML tag stripping
      
      page.drawText(textContent, {
        x: 50,
        y: height - 50,
        font,
        size: 11,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
        lineHeight: 14,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfDataUri = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
      
      return { fileDataUri: pdfDataUri };

    } catch (e: any) {
      console.error("Error in convertWordToPdfFlow:", e);
      return { error: e.message || 'An unknown error occurred during Word to PDF conversion.' };
    }
  }
);

export async function convertWordToPdf(input: WordToPdfInput): Promise<WordToPdfOutput> {
  return await convertWordToPdfFlow(input);
}
