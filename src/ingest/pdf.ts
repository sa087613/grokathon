import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function pdfText(data: Buffer): Promise<string> {
  return (await pdf(data)).text.trim();
}
