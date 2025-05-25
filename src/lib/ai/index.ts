import { providers, useSettingsStore, type Model, type Provider } from "@/lib/stores/settings"
import type { LanguageModelV1 } from "@ai-sdk/provider";

const createdModelCache: Record<string, { model: LanguageModelV1, apiKey: string }> = {};

export const getModel = (): LanguageModelV1 => {
  const { ai } = useSettingsStore.getState();
  const [provider, model] = ai.selectedModel.split(":") as [Provider, Model<Provider>];
  const apiKey = ai.models[provider]?.apiKey;
  const cacheKey = ai.selectedModel;

  if (createdModelCache[cacheKey] && createdModelCache[cacheKey].apiKey === apiKey) {
    return createdModelCache[cacheKey].model;
  }

  if (!apiKey) {
    throw new Error(`No API key found for provider: ${provider}`);
  }
  const providerObj = providers[provider];
  if (!providerObj) {
    throw new Error(`Provider ${provider} not found`);
  }
  const providerInstance = providerObj.create(apiKey);
  const modelId = providerObj.mutateModelId?.(model) ?? model;
  const languageModel = providerInstance.languageModel(modelId);
  createdModelCache[cacheKey] = { model: languageModel, apiKey };
  return languageModel;
}