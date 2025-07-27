
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
import htmlToDocx from 'html-to-docx';
import {
    PdfToWordInputSchema,
    PdfToWordOutputSchema,
    WordToPdfInputSchema,
    WordToPdfOutputSchema,
    type PdfToWordInput,
    type PdfToWordOutput,
    type WordToPdfInput,
    type WordToPdfOutput
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


const convertWordToPdfFlow = ai.defineFlow(
  {
    name: 'convertWordToPdfFlow',
    inputSchema: WordToPdfInputSchema,
    outputSchema: WordToPdfOutputSchema,
  },
  async (input) => {
    try {
      const buffer = Buffer.from(input.fileDataUri.split(',')[1], 'base64');
      const { value: html } = await mammoth.convertToHtml({ buffer });

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // A very basic HTML to text conversion. This is where table and layout handling needs to be improved.
      // For now, we will just strip tags. A more sophisticated parser would be needed for full layout preservation.
      const textContent = html.replace(/<\/p>/g, '\n')
                              .replace(/<\/h[1-6]>/g, '\n\n')
                              .replace(/<br\s*\/?>/g, '\n')
                              .replace(/<[^>]*>/g, '');
      
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
