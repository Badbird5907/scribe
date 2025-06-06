"use client";

import { useSettingsStore } from "@/lib/stores/settings";
import { providers } from "@/lib/stores/settings";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModelSelect } from "@/components/model-select";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export default function Settings() {
  const settings = useSettingsStore();
  const setApiKey = settings.setApiKey;
  // const setSelectedModel = settings.setSelectedModel;
  const { models } = settings.ai;
  const theme = useTheme();

  // Build all model options in the format provider:model
  // const modelOptions = Object.entries(providers).flatMap(([provider, providerObj]) => {
  //   const models = providerObj.models as Record<string, { name: string; description?: string }>;
  //   return Object.keys(models).map((model) => {
  //     const modelObj = models[model];
  //     return {
  //       value: `${provider}:${model}`,
  //       label: `${providerObj.name} - ${modelObj ? modelObj.name : model}`,
  //     };
  //   });
  // });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {/* Theme toggle on the top right */}
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={() => theme.setTheme(theme.theme === "dark" ? "light" : "dark")}>
          {theme.theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <form className="space-y-8" onSubmit={e => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(providers).map(([provider, providerObj]) => {
              const { apiKeyPreview, name, noApiKey } = providerObj;
              if (noApiKey) return null;
              return (
                <div key={provider} className="space-y-2">
                  <Label htmlFor={`api-key-${provider}`}>{name} API Key</Label>
                  <Input
                    id={`api-key-${provider}`}
                    type="text"
                    placeholder={apiKeyPreview ?? `Enter ${name} API Key`}
                    value={models[provider]?.apiKey ?? ""}
                    onChange={e => setApiKey(provider, e.target.value)}
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
            <Label htmlFor="model-select" className="mb-2">Select Model</Label>
            <ModelSelect />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}