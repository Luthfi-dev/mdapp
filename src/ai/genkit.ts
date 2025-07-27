import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use a more available model for free tier keys.
  model: 'googleai/gemini-1.5-flash-latest',
});
