import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocumentLoader } from "./loaders";

export class CsvDocumentLoader implements DocumentLoader {
  async load(path: string) {
    console.log("Loading CSV");

    const loadedCsv = new CSVLoader(path).load();

    console.log("Loaded CSV");

    return loadedCsv;
  }
}
