"use server";

import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";

export async function processPdfFile(formData: FormData) {
  try {
    const file = formData.get("pdf") as File;

    const bytes = await file.arrayBuffer();
    const parser = new PDFParse({ data: bytes });
    const textResult = await parser.getText();
    await parser.destroy();

    if (!textResult.text || textResult.text.trim().length === 0) {
      return {
        success: false,
        error: "No text found in PDF",
      };
    }

    const chunks = await chunkContent(textResult.text);
    const embeddngs = await generateEmbeddings(chunks);

    const records = chunks.map((chunk, index) => {
      return {
        content: chunk,
        embedding: embeddngs[index],
      };
    });

    await db.insert(documents).values(records);

    return {
      success: true,
      message: `Created ${records.length} searchable chunks`,
    };
  } catch (error) {
    console.error("PDF processing error", error);
    return {
      success: false,
      error: "Failed to process PDF",
    };
  }
}
