import { HackClubLanguageModel } from '@/lib/ai/hackclub/language-model';
import { NoSuchModelError, type ProviderV1 } from '@ai-sdk/provider';
import type { LanguageModelV1 } from 'ai';

// model factory function with additional methods and properties
export interface CustomProvider {
  (): HackClubLanguageModel;

  // explicit method for targeting a specific API in case there are several
  chat(): LanguageModelV1;
}


// provider factory function
export function createCustomProvider(): ProviderV1 {
  const createModel = () =>
    new HackClubLanguageModel(
      '1.0',
      "json",
      "hackclub",
    );

  const provider = function () {
    if (new.target) {
      throw new Error(
        'The model factory function cannot be called with the new keyword.',
      );
    }

    return createModel();
  };

  provider.chat = createModel;

  provider.languageModel = createModel;
  provider.textEmbeddingModel = () => {
    throw new NoSuchModelError({
      modelId: "not-supported",
      modelType: "textEmbeddingModel",
    });
  };
  

  return provider;
}

/**
 * Default custom provider instance.
 */
export const customProvider = createCustomProvider();