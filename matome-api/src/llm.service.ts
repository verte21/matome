import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TiktokenModel, encoding_for_model } from "tiktoken";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { pull } from "langchain/hub";
import * as fs from "node:fs";

export interface LLMServiceDependencies {
  model: ChatOpenAI;
  vectorStorePath: string;
  modelName: TiktokenModel;
}

export class LLMService {
  // private VECTOR_STORE_PATH = "Documents.index";

  constructor(readonly dependencies: LLMServiceDependencies) {}

  async humanMessage(message: HumanMessage) {
    const response = await this.dependencies.model.invoke([
      new HumanMessage({ content: message.content }),
    ]);

    return response.content;
  }

  async loadCsv(path: string) {
    console.log("Loading CSV");

    const loaded = new CSVLoader(path).load();

    console.log("Loaded CSV");

    return loaded;
  }

  async calculateCost(input: string) {
    const modelName: TiktokenModel = this.dependencies.modelName;
    const encoder = encoding_for_model(modelName);

    const tokens = encoder.encode(input);
    const tokenCount = tokens.length;

    // 0,50 USD / 1M tokens
    const ratePerToken = 0.0000005;

    const estimatedCost = tokenCount * ratePerToken;
    encoder.free();

    console.log("Estimated cost", estimatedCost);

    return estimatedCost;
  }

  async normalizeDocuments(docs: { pageContent: string | string[] }[]) {
    return docs.map((doc) => {
      if (typeof doc.pageContent === "string") {
        return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join("\n");
      }
    });
  }

  async getSummary(question: string, path: string) {
    const { model } = this.dependencies;

    const document = await this.loadCsv(path);

    const estimateCost = await this.calculateCost(JSON.stringify(document));

    if (estimateCost > 0.003) {
      return;
    }

    const vectorStore = await this.getVectorStore(document);
    const retriever = vectorStore.asRetriever();

    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    console.log(prompt.promptMessages.map((msg) => msg).join("\n"));

    const declarativeRagChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const response = await declarativeRagChain.invoke(question);

    return response;
  }

  async getVectorStore(document: Awaited<ReturnType<CSVLoader["load"]>>) {
    const { vectorStorePath } = this.dependencies;
    if (fs.existsSync(vectorStorePath)) {
      console.log("Loading vector store");

      const vectorStore = await HNSWLib.load(vectorStorePath, new OpenAIEmbeddings());
      return vectorStore;
    } else {
      const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

      const normalizedDocuments = await this.normalizeDocuments(document);

      if (!isArrayOfStrings(normalizedDocuments)) {
        throw new Error("Documents must be an array of strings");
      }

      const splitDocs = await textSplitter.createDocuments(normalizedDocuments);

      const vectorStore = await HNSWLib.fromDocuments(splitDocs, new OpenAIEmbeddings());

      await vectorStore.save(vectorStorePath);

      return vectorStore;
    }
  }
}

const isArrayOfStrings = (input: any): input is string[] => {
  return Array.isArray(input) && input.every((item) => typeof item === "string");
};
