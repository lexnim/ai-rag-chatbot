import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  UIMessage,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { searchDocuments } from "@/lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant information",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found in the knowlege base";
        }

        const formattedResults = results
          .map((result, idx) => `[${idx + 1}] ${result.content}`)
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Err", error);
        return "Error searching the knowledge base";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(request: Request) {
  try {
    const {
      model,
      messages,
      useWebSearch,
    }: { model: string; messages: ChatMessage[]; useWebSearch?: boolean } =
      await request.json();

    const result = streamText({
      model: google(model),
      messages: await convertToModelMessages(messages),
      tools: useWebSearch
        ? {
            ...tools,
            google_search: google.tools.googleSearch({}),
          }
        : tools,
      system: `You are a helpful assistant for a chat app where users can:
- Send text messages and ask questions
- Upload files (images, PDFs, audio, video) and ask questions about them

You have access to:
1. Knowledge base search (RAG): Search over documents the user has uploaded. Use this when the question might relate to their uploaded content—always search the knowledge base before answering in those cases.
2. Web search (when enabled): Search the web for current or general information. Use it when the user needs up-to-date facts or when the knowledge base does not have relevant content.

Guidelines:
- For questions that may relate to uploaded documents, search the knowledge base first and base your answer on those results when available.
- When web search is available, use it when you need current information or when the knowledge base has no relevant results.
- For images, answer based on what you can see in the image and any accompanying text.
- Give concise, direct answers that address what the user asked. Do not dump long excerpts from search results; summarize and cite when useful.`,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
