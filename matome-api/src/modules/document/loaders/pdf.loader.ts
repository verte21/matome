import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocumentLoader } from "./loaders";

export class PdfDocumentLoader implements DocumentLoader {
  async load(path: string): Promise<Document<Record<string, any>>[]> {
    console.log("Loading pdf file");

    const loadedUnstructured = await new PDFLoader(path).load();

    console.log("Pdf file loaded");

    return loadedUnstructured;
  }
}
