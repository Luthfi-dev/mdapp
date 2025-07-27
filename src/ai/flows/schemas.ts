
import { z } from 'zod';

/**
 * @fileOverview Shared schemas for AI flows.
 */

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
