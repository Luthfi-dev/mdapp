
import { z } from 'zod';

/**
 * @fileOverview Shared schemas for file conversion AI flows.
 */

// Schema for PDF to Word
export const PdfToWordInputSchema = z.object({
  fileDataUri: z.string().describe("A PDF file encoded as a data URI."),
  filename: z.string().describe('The original name of the file.'),
});
export type PdfToWordInput = z.infer<typeof PdfToWordInputSchema>;

export const PdfToWordOutputSchema = z.object({
  docxDataUri: z.string().optional().describe('The content of the document as a DOCX data uri.'),
  error: z.string().optional(),
});
export type PdfToWordOutput = z.infer<typeof PdfToWordOutputSchema>;


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
