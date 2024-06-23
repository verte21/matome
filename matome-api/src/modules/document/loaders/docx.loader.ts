import { Document } from "@langchain/core/documents";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { DocumentLoader } from "./loaders";

export class DocxDocumentLoader implements DocumentLoader {
  async load(path: string): Promise<Document<Record<string, any>>[]> {
    console.log("Loading docx");

    const loadedDocx = await new DocxLoader(path).load();

    console.log("Document loaded");

    return loadedDocx;
  }
}
