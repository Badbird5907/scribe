import { providers, useSettingsStore, type Model, type Provider } from "@/lib/stores/settings"
import type { LanguageModelV1 } from "@ai-sdk/provider";
import { create } from "zustand";

const createdModelCache: Record<string, { model: LanguageModelV1, apiKey: string }> = {};

export const getModel = (): LanguageModelV1 => {
  const { ai } = useSettingsStore.getState();
  const [provider, model] = ai.selectedModel.split(":") as [Provider, Model<Provider>];
  const apiKey = ai.models[provider]?.apiKey;
  const cacheKey = ai.selectedModel;

  if (createdModelCache[cacheKey] && createdModelCache[cacheKey].apiKey === apiKey) {
    return createdModelCache[cacheKey].model;
  }
  const providerObj = providers[provider];
  if (!providerObj) {
    console.error(`Provider ${provider} not found`);
    throw new Error(`Provider ${provider} not found`);
  }
  if (!apiKey && !providerObj.noApiKey) {
    console.error(`No API key found for provider: ${provider}`);
    throw new Error(`No API key found for provider: ${provider}`);
  }
  const providerInstance = providerObj.create(apiKey!);
  const modelId = providerObj.mutateModelId?.(model) ?? model;
  const languageModel = providerInstance.languageModel(modelId);
  createdModelCache[cacheKey] = { model: languageModel, apiKey: apiKey! };
  return languageModel;
}


type AiStateStore = {
  abortController: AbortController | null;
  isLoading: boolean;
  error: Error | null;
  suggestion: string;
  showSuggestion: boolean;
  isGenerating: boolean;

  setAbortController: (abortController: AbortController | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setSuggestion: (suggestion: string) => void;
  setShowSuggestion: (showSuggestion: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}
export const aiState = create<AiStateStore>((set) => ({
  abortController: null,
  isLoading: false,
  error: null,
  suggestion: "",
  showSuggestion: false,
  isGenerating: false,

  setAbortController: (abortController: AbortController | null) => set({ abortController }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: Error | null) => set({ error }),
  setSuggestion: (suggestion: string) => set({ suggestion }),
  setShowSuggestion: (showSuggestion: boolean) => set({ showSuggestion }),
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
}))