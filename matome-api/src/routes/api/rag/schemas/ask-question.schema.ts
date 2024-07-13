import { z } from "zod";
import { AvailableLoaders } from "../../../../modules/document/loaders/loaders.factory";

export const questionSchema = z.object({
  question: z.string(),
  fileName: z.string(),
  loaderType: z.nativeEnum(AvailableLoaders),
});
