"use client";

import { useSettingsStore, type AllModelKeys } from "@/lib/stores/settings";
import { providers, type Provider } from "@/lib/stores/settings";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Popover } from "@/components/ui/popover";
import { ModelSelect } from "@/components/model-select";

export default function Page() {
  const settings = useSettingsStore();
  const setApiKey = settings.setApiKey;
  const setSelectedModel = settings.setSelectedModel;
  const { models, selectedModel } = settings.ai;

  // Build all model options in the format provider:model
  const modelOptions = Object.entries(providers).flatMap(([provider, providerObj]) => {
    const models = providerObj.models as Record<string, { name: string; description?: string }>;
    return Object.keys(models).map((model) => {
      const modelObj = models[model];
      return {
        value: `${provider}:${model}`,
        label: `${providerObj.name} - ${modelObj ? modelObj.name : model}`,
      };
    });
  });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form className="space-y-8" onSubmit={e => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(providers).map(([provider, providerObj]) => {
              const { apiKeyPreview, name } = providerObj;
              return (
                <div key={provider} className="space-y-2">
                  <Label htmlFor={`api-key-${provider}`}>{name} API Key</Label>
                  <Input
                    id={`api-key-${provider}`}
                    type="text"
                    placeholder={(apiKeyPreview as string | undefined) ?? `Enter ${name} API Key`}
                    value={models[provider as Provider]?.apiKey || ""}
                    onChange={e => setApiKey(provider as Provider, e.target.value)}
                    autoComplete="off"
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Model Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="model-select">Select Model</Label>
            <ModelSelect />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}