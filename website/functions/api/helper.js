import knowledge from "../../content/helper-knowledge.json";
import { handlePublicHelperRequest } from "../lib/public-helper.mjs";

export const onRequest = (context) => handlePublicHelperRequest({
  request: context.request,
  env: context.env,
  fetchImpl: fetch,
  knowledge
});
