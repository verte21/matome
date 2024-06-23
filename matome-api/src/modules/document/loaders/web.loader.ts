import { Document } from "@langchain/core/documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { DocumentLoader } from "./loaders";

export class WebDocumentLoader implements DocumentLoader {
  async load(webPath: string): Promise<Document<Record<string, any>>[]> {
    console.log("Loading website document");

    const loadedWebsiteDocument = await new CheerioWebBaseLoader(webPath).load();

    console.log("Website document loaded");

    return loadedWebsiteDocument;
  }
}
