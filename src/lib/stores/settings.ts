import { create } from "zustand";
import { persistNSync } from "persist-and-sync";
import type { DeepPartial } from "@/types";
import { deepMerge } from "@/lib/utils";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderV1 } from "@ai-sdk/provider";
import { createOllama } from "ollama-ai-provider";

type LLMProvider = {
  name: string;
  apiKeyPreview: string;
  create: (apiKey: string) => ProviderV1;
  mutateModelId?: (modelId: string) => string;
  models: Record<string, { name: string; description?: string }>;
}

export const providers: Record<string, LLMProvider> = {
  openai: {
    name: "OpenAI",
    apiKeyPreview: "sk-proj-...",
    create: (apiKey: string) => createOpenAI({ apiKey }),
    models: {
      "gpt-4o": {
        name: "GPT-4o",
        description: "The latest and most powerful OpenAI model",
      },
      "gpt-4o-mini": {
        name: "GPT-4o Mini",
        description: "The smaller and faster OpenAI model, costs less than gpt-4o",
      }
    }
  },
  anthropic: {
    name: "Anthropic",
    apiKeyPreview: "sk-ant-api03-...",
    create: (apiKey: string) => createAnthropic({ apiKey }),
    models: {
      "claude-3-5-sonnet": {
        name: "Claude 3.5 Sonnet",
      }
    }
  },
  google: {
    name: "Google",
    apiKeyPreview: "AIzaSyB...",
    create: (apiKey: string) => createGoogleGenerativeAI({ apiKey }),
    mutateModelId: (modelId: string) => `models/${modelId}`,
    models: {
      "gemini-2.5-flash-preview-04-17": {
        name: "Gemini 2.5 Flash Exp",
        description: "A really fast and cheap model.",
      },
      "gemini-2.0-flash-lite": {
        name: "Gemini 2.0 Flash Lite",
        description: "A really fast and cheap model.",
      }
    }
  },
  // ollama: {
  //   name: "Ollama",
  //   apiKeyPreview: "http://127.0.0.1:11434/api",
  //   create: (apiKey: string) => createOllama({ baseURL: apiKey }),
  //   models: {
  //     "llama3.1:8b": {
  //       name: "Llama 3.1 8B",
  //       description: "A really fast and cheap model.",
  //     },
  //     "llama3.2:1b": {
  //       name: "Llama 3.2 1B",
  //       description: "A really fast and cheap model.",
  //     }
  //   }
  // }
} as const;

export type Provider = keyof typeof providers;
export type Model<P extends Provider> = keyof typeof providers[P]['models'];

export type AllModelKeys = 
  { [P in keyof typeof providers]: 
      `${P & string}:${keyof typeof providers[P]['models']}` 
  }[keyof typeof providers];

export type SettingsStore = {
  ai: {
    models: Record<Provider, {
      apiKey: string;
    }>;
    selectedModel: AllModelKeys;
  }
  setSelectedModel: (model: AllModelKeys) => void;
  setApiKey: (provider: Provider, apiKey: string) => void;
}
export const useSettingsStore = create<SettingsStore>(
  persistNSync((_set, get) => {
    const set = (values: DeepPartial<SettingsStore>) => {
      // only apply values to current store, as persistNSync only stores the most recently updated values
      // so if I wanted to set {ai: { selectedModel: "..." }}, I need to input _set({ ai: { models: { ... }, selectedModel: "..." } }) 
      const currentState = get();
      const mergedState = deepMerge<SettingsStore>(currentState, values as Partial<SettingsStore>);
      _set(mergedState);
    }
    return (
      {
        ai: {
          models: {
            openai: { apiKey: "" },
            anthropic: { apiKey: "" },
            mistral: { apiKey: "" },
            google: { apiKey: "" },
          },
          selectedModel: "openai:gpt-4o-mini" as AllModelKeys,
        },
        setSelectedModel: (model) => set({ 
          ai: { 
            selectedModel: model 
          } 
        }),
        setApiKey: (provider, apiKey) => set({ 
          ai: {
            models: {
              [provider]: { apiKey } 
            } 
          } 
        }),
      }
    )
  }, { name: "scribe-settings" })
);