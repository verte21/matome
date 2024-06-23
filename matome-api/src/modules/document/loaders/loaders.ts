import { Document } from "@langchain/core/documents";

export interface DocumentLoader {
  load(input: unknown): Promise<Document<Record<string, any>>[]>;
}
