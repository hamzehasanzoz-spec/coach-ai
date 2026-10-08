import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";

export const gatewayModel = (base44, model = "automatic") => {
  const { baseURL, token, headers } = base44.asServiceRole.aiGateway.connection();
  return openaiCompatibleText(model, { name: "base44", baseURL, apiKey: token, defaultHeaders: headers });
};