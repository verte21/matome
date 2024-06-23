import { Document } from "@langchain/core/documents";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { DocumentLoader } from "./loaders";

export class UnstructuredDocumentLoader implements DocumentLoader {
  async load(path: string): Promise<Document<Record<string, any>>[]> {
    console.log("Loading unstructured file");

    const loadedUnstructured = await new UnstructuredLoader(path).load();

    console.log("Unstructured file loaded");

    return loadedUnstructured;
  }
}
