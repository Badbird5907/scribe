"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getModel } from "@/lib/ai";
import { useState } from "react";
import { streamText } from "ai";
import type { LanguageModelV1 } from "@ai-sdk/provider";

export default function TestPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleGenerate = async () => {
    setIsLoading(true);
    const model: LanguageModelV1 = getModel();
    // const result = await generateText({ model, prompt }) as { text: string };
    // setResult(result.text);
    const { textStream } = streamText({ model, prompt, providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        }
      }
    } });
    let result = "";
    for await (const textPart of textStream) {
      result += textPart;
      console.log(textPart);
      setResult(result);
    }
    setIsLoading(false);
  };
  return (
    <div>
      <h1>Test Page</h1>
      <Textarea placeholder="Enter your prompt here" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Button onClick={handleGenerate}>Generate</Button>
      {isLoading && <p>Loading...</p>}
      {result && <p>{result}</p>}
    </div>
  );
}
