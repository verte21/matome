import { Document } from "@langchain/core/documents";
import { EPubLoader } from "@langchain/community/document_loaders/fs/epub";
import { DocumentLoader } from "./loaders";

export class EpubDocumentLoader implements DocumentLoader {
  async load(path: string): Promise<Document<Record<string, any>>[]> {
    console.log("Loading EPUB");

    const loadedEpub = await new EPubLoader(path).load();

    console.log("EPUB loaded");

    return loadedEpub;
  }
}
