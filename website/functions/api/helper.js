import knowledge from "../../content/helper-knowledge.json";
import { applyConnectPaymentCopy, connectPaymentsPublished } from "../../src/commercial-offer.mjs";
import { handlePublicHelperRequest } from "../lib/public-helper.mjs";

export const onRequest = (context) => {
  const publicKnowledge = JSON.parse(applyConnectPaymentCopy(
    JSON.stringify(knowledge),
    connectPaymentsPublished(context.env)
  ));
  return handlePublicHelperRequest({
    request: context.request,
    env: context.env,
    fetchImpl: fetch,
    knowledge: publicKnowledge
  });
};
