'use server';
/**
 * @fileOverview A file converter AI agent.
 *
 * - convertFile - A function that handles the file conversion process.
 * - ConvertFileInput - The input type for the convertFile function.
 * - ConvertFileOutput - The return type for the convertFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetFormat: z.string().describe('The target format to convert the file to (e.g., docx, png).'),
});
export type ConvertFileInput = z.infer<typeof ConvertFileInputSchema>;

const ConvertFileOutputSchema = z.object({
  convertedFileDataUri: z
    .string()
    .describe("The converted file, as a data URI in Base64 encoding."),
});
export type ConvertFileOutput = z.infer<typeof ConvertFileOutputSchema>;

export async function convertFile(input: ConvertFileInput): Promise<ConvertFileOutput> {
  return convertFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertFilePrompt',
  input: {schema: ConvertFileInputSchema},
  output: {schema: ConvertFileOutputSchema},
  prompt: `You are a file conversion expert. You take a file in one format, and convert it to another format.

You will receive the file as a data URI, and the target format.

Convert the file to the target format, and return the converted file as a data URI.

Original File: {{media url=fileDataUri}}
Target Format: {{{targetFormat}}}`,
});

const convertFileFlow = ai.defineFlow(
  {
    name: 'convertFileFlow',
    inputSchema: ConvertFileInputSchema,
    outputSchema: ConvertFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
