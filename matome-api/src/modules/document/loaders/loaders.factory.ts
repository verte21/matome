import { CsvDocumentLoader } from "./csv.loader";
import { DocxDocumentLoader } from "./docx.loader";
import { EpubDocumentLoader } from "./epub.loader";
import { DocumentLoader } from "./loaders";
import { PdfDocumentLoader } from "./pdf.loader";
import { UnstructuredDocumentLoader } from "./unstructured.loader";
import { WebDocumentLoader } from "./web.loader";

export const AvailableLoaders = {
  CSV: "csv",
  DOCX: "docx",
  EPUB: "epub",
  PDF: "pdf",
  UNSTRUCTURED: "unstructured",
  WEB: "web",
} as const;

export type AvailableLoadersType = (typeof AvailableLoaders)[keyof typeof AvailableLoaders];

export class LoadersFactory {
  private loaders: Record<AvailableLoadersType, DocumentLoader>;
  constructor() {
    this.loaders = {
      [AvailableLoaders.CSV]: new CsvDocumentLoader(),
      [AvailableLoaders.DOCX]: new DocxDocumentLoader(),
      [AvailableLoaders.EPUB]: new EpubDocumentLoader(),
      [AvailableLoaders.PDF]: new PdfDocumentLoader(),
      [AvailableLoaders.WEB]: new WebDocumentLoader(),
      [AvailableLoaders.UNSTRUCTURED]: new UnstructuredDocumentLoader(),
    };
  }

  getLoader(type: AvailableLoadersType): DocumentLoader {
    return this.loaders[type];
  }
}
