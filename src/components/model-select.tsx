"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { providers, useSettingsStore } from "@/lib/stores/settings";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ModelDetailsCard from "@/components/model-details-card";

export const ModelSelect = () => {
  const store = useSettingsStore();
  const selectedModel = store.ai.selectedModel;
  const setSelectedModel = store.setSelectedModel;
  const [open, setOpen] = useState(false);
  const { model, provider } = useMemo(() => {
    const [provider, model] = selectedModel.split(":");
    return { model, provider };
  }, [selectedModel])

  const currentModelName = useMemo(() => {
    if (!model || !provider) return null;
    const providerObj = providers[provider];
    if (!providerObj) return null;
    type ModelValue = { name: string; description?: string };
    const modelObj = providerObj.models[model] as ModelValue | undefined;
    if (!modelObj) return null;
    return { provider: providerObj.name, model: modelObj.name, logo: providerObj.logo };
  }, [model, provider]);

  const { availableModels, unavailableModels } = useMemo(() => {
    const available: Array<{ provider: string; model: string; name: string }> = [];
    const unavailable: Array<{ provider: string; model: string; name: string }> = [];

    Object.entries(providers).forEach(([providerKey, providerObj]) => {
      const hasApiKey = store.ai.models[providerKey]?.apiKey ?? providerObj.noApiKey;

      Object.entries(providerObj.models).forEach(([modelKey, modelObj]) => {
        const modelInfo = {
          provider: providerKey,
          model: modelKey,
          name: modelObj.name
        };

        if (hasApiKey) {
          available.push(modelInfo);
        } else {
          unavailable.push(modelInfo);
        }
      });
    });

    return { availableModels: available, unavailableModels: unavailable };
  }, [store.ai.models]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-0 justify-between hover:cursor-pointer"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="truncate overflow-hidden whitespace-nowrap block" title={model ? `${currentModelName?.provider} - ${currentModelName?.model}` : "Select model..."}>
                {model
                  ? <div className="flex flex-row gap-2 items-center min-w-0">
                    {currentModelName?.logo && <currentModelName.logo className="h-4 w-4" />}
                    <span className="truncate overflow-hidden whitespace-nowrap block" title={currentModelName?.model}>
                      {currentModelName?.model}
                    </span>
                  </div>
                  : "Select model..."}
              </span>
            </HoverCardTrigger>
            <HoverCardContent>
              {currentModelName ? (
                <ModelDetailsCard provider={provider} model={model} />
              ) : (
                <p className="text-sm text-muted-foreground">No model selected</p>
              )}
            </HoverCardContent>
          </HoverCard>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>

            {/* Available Models */}
            {Object.entries(providers).map(([providerKey, providerObj]) => {
              const providerModels = availableModels.filter(m => m.provider === providerKey);
              if (providerModels.length === 0) return null;
              
              const Logo = providerObj.logo;
              return (
                <CommandGroup key={providerKey} heading={
                  <div className="flex items-center gap-2">
                    {Logo && <Logo className="h-4 w-4" />}
                    {providerObj.name}
                  </div>
                }>
                  {providerModels.map(({ provider, model, name }) => (
                    <HoverCard key={`${provider}:${model}`}>
                      <HoverCardTrigger asChild>
                        <CommandItem
                          value={`${provider}:${model}`}
                          onSelect={() => {
                            setOpen(false);
                            setSelectedModel(`${provider}:${model}`);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedModel === `${provider}:${model}` ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {name}
                        </CommandItem>
                      </HoverCardTrigger>
                      <HoverCardContent side="right" align="start">
                        <ModelDetailsCard provider={provider} model={model} />
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </CommandGroup>
              );
            })}

            {/* Unavailable Models */}
            {unavailableModels.length > 0 && (
              <CommandGroup heading="Unavailable Models">
                {unavailableModels.map(({ provider, model, name }) => (
                  <CommandItem
                    key={`${provider}:${model}`}
                    value={`${provider}:${model}`}
                    className="opacity-50 cursor-not-allowed"
                    disabled
                  >
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}