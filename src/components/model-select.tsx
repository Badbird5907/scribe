"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { providers, useSettingsStore } from "@/lib/stores/settings";

export const ModelSelect = () => {
  const store = useSettingsStore();
  const selectedModel = store.ai.selectedModel;
  const setSelectedModel = store.setSelectedModel;
  const [open, setOpen] = useState(false);
  const { model, provider } = useMemo(() => {
    const [provider, model] = selectedModel.split(":");
    console.log(model, provider);
    return { model, provider };
  }, [selectedModel])
  const currentModelName = useMemo(() => {
    if (!model || !provider) return null;
    const providerObj = providers[provider];
    if (!providerObj) return null;
    type ModelValue = { name: string; description?: string };
    const modelObj = providerObj.models[model] as ModelValue | undefined;
    if (!modelObj) return null;
    return { provider: providerObj.name, model: modelObj.name };
  }, [model, provider]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {model
            ? `${currentModelName?.provider} - ${currentModelName?.model}`
            : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            {Object.entries(providers).map(([provider, value]) => (
              <CommandGroup key={provider} heading={value.name}>
                {Object.keys(value.models).map((model) => (
                  <CommandItem key={model} value={`${provider}:${model}`} onSelect={() => {
                    setOpen(false)
                    setSelectedModel(`${provider}:${model}`)
                  }}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedModel === `${provider}:${model}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {(value.models[model] as { name: string }).name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}