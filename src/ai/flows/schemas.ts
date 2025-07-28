import { z } from 'zod';

/**
 * @fileOverview Shared schemas for file conversion AI flows.
 */

export const HtmlToWordInputSchema = z.object({
  htmlContent: z.string().describe("An HTML string to convert."),
  filename: z.string().describe('The desired name of the file.'),
});
export type HtmlToWordInput = z.infer<typeof HtmlToWordInputSchema>;

export const HtmlToWordOutputSchema = z.object({
  docxDataUri: z.string().optional().describe('The content of the document as a DOCX data uri.'),
  error: z.string().optional(),
});
export type HtmlToWordOutput = z.infer<typeof HtmlToWordOutputSchema>;
