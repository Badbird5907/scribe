import type { LanguageModelV1FunctionToolCall, LanguageModelV1FinishReason, LanguageModelV1CallWarning, LanguageModelV1ProviderMetadata, LanguageModelV1Source, LanguageModelV1LogProbs } from "@ai-sdk/provider";
import type { LanguageModelV1, LanguageModelV1CallOptions, LanguageModelV1StreamPart } from "ai";
import type { LanguageModelV1Message } from "@ai-sdk/provider";

interface HackClubAPIResponse {
    id?: string;
    model?: string;
    choices?: Array<{
        message?: { content?: string };
        finish_reason?: LanguageModelV1FinishReason;
    }>;
}

export class HackClubLanguageModel implements LanguageModelV1 {
    readonly specificationVersion = 'v1';
    readonly supportsImageUrls = false;
    readonly supportsStructuredOutputs = false;
    readonly defaultObjectGenerationMode: 'json' | 'tool' | undefined;

    constructor(
        public modelId: string,
        defaultObjectGenerationMode: 'json' | 'tool' | undefined = 'json',
        public provider: string,
    ) {
        this.defaultObjectGenerationMode = defaultObjectGenerationMode;
    }

    supportsUrl?(): boolean {
        return false;
    }

    async doGenerate(options: LanguageModelV1CallOptions): Promise<{
        text?: string;
        reasoning?: string | Array<{ type: "text"; text: string; signature?: string } | { type: "redacted"; data: string }>;
        files?: Array<{ data: string | Uint8Array; mimeType: string }>;
        toolCalls?: Array<LanguageModelV1FunctionToolCall>;
        finishReason: LanguageModelV1FinishReason;
        usage: { promptTokens: number; completionTokens: number };
        rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
        rawResponse?: { headers?: Record<string, string>; body?: unknown };
        request?: { body?: string };
        response?: { id?: string; timestamp?: Date; modelId?: string };
        warnings?: LanguageModelV1CallWarning[];
        providerMetadata?: LanguageModelV1ProviderMetadata;
        sources?: LanguageModelV1Source[];
        logprobs?: LanguageModelV1LogProbs;
    }> {
        console.log("options", options);
        let messages: { role: string; content: string }[] = [];
        let warnings: LanguageModelV1CallWarning[] | undefined = undefined;
        if (options.inputFormat === 'messages') {
            messages = (options.prompt as LanguageModelV1Message[]).map((msg) => {
                if (msg.role === 'system') {
                    return { role: 'system', content: msg.content };
                } else if (msg.role === 'user' || msg.role === 'assistant') {
                    // content is an array of parts, join text parts
                    const contentArr = Array.isArray(msg.content) ? msg.content : [];
                    const content = contentArr.map((part) => {
                        if (typeof part === 'object' && 'text' in part) {
                            return part.text;
                        }
                        return '';
                    }).join('');
                    return { role: msg.role, content };
                }
                // Ignore tool messages for now
                return null;
            }).filter((m): m is { role: string; content: string } => m !== null);
        } else if (options.inputFormat === 'prompt') {
            if (Array.isArray(options.prompt)) {
              /* 
              [
    {
        "role": "system",
        "content": "You are a helpful assistant that generates text."
    },
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Hello"
            }
        ]
    }
]
              */
              messages = options.prompt.map((p: LanguageModelV1Message) => {
                const toText = () => {
                  if (typeof p.content === 'string') {
                    return p.content;
                  } else if (Array.isArray(p.content)) {
                    return p.content.map((c) => c.type === "text" ? c.text : "").join('');
                  }
                  return '';
                }
                if (p.role === 'system') {
                    return { role: 'system', content: toText() };
                } else if (p.role === 'user') {
                    return { role: 'user', content: toText() };
                }
                return null;
              }).filter((m): m is { role: string; content: string } => m !== null);
            } else {
                // prompt is a string
                const promptStr = options.prompt as unknown as string;
                messages = [{ role: 'user', content: promptStr }];
            }
        } else {
            warnings = [{ type: 'other', message: 'inputFormat ' + String(options.inputFormat) + ' is not supported' }];
        }

        const body = JSON.stringify({ messages });
        console.log(messages);
        const response = await fetch('https://ai.hackclub.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        let raw: HackClubAPIResponse | undefined = undefined;
        let text: string | undefined = undefined;
        const warningsOut = warnings ? [...warnings] : [];
        let rawBody: unknown = undefined;

        try {
            rawBody = await response.text();
            try {
                raw = JSON.parse(rawBody as string) as HackClubAPIResponse;
                text = raw.choices?.[0]?.message?.content ?? undefined;
            } catch (jsonErr) {
                warningsOut.push({
                    type: 'other',
                    message: 'Failed to parse JSON from Hack Club API: ' + (jsonErr instanceof Error ? jsonErr.message : String(jsonErr)),
                });
            }
        } catch (err) {
            warningsOut.push({
                type: 'other',
                message: 'Failed to read response body: ' + (err instanceof Error ? err.message : String(err)),
            });
        }

        if (!response.ok) {
            warningsOut.push({
                type: 'other',
                message: `Hack Club API returned HTTP ${response.status}: ${response.statusText}`,
            });
        }

        return {
            text,
            finishReason: raw?.choices?.[0]?.finish_reason ?? 'stop',
            usage: { promptTokens: 0, completionTokens: 0 },
            rawCall: { rawPrompt: messages, rawSettings: options },
            rawResponse: {
                headers: Object.fromEntries(response.headers.entries()),
                body: raw ?? (typeof rawBody === 'string' ? rawBody : undefined),
            },
            request: { body },
            response: { id: raw?.id ?? undefined, modelId: raw?.model ?? undefined },
            warnings: warningsOut.length > 0 ? warningsOut : undefined,
        };
    }

    doStream(options: LanguageModelV1CallOptions): Promise<{ stream: ReadableStream<LanguageModelV1StreamPart>; rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> }; rawResponse?: { headers?: Record<string, string> }; request?: { body?: string }; warnings?: Array<LanguageModelV1CallWarning> }> {
        let messages: { role: string; content: string }[] = [];
        let warnings: LanguageModelV1CallWarning[] | undefined = undefined;
        if (options.inputFormat === 'messages') {
            messages = (options.prompt as LanguageModelV1Message[]).map((msg) => {
                if (msg.role === 'system') {
                    return { role: 'system', content: msg.content };
                } else if (msg.role === 'user' || msg.role === 'assistant') {
                    const contentArr = Array.isArray(msg.content) ? msg.content : [];
                    const content = contentArr.map((part) => {
                        if (typeof part === 'object' && 'text' in part) {
                            return part.text;
                        }
                        return '';
                    }).join('');
                    return { role: msg.role, content };
                }
                return null;
            }).filter((m): m is { role: string; content: string } => m !== null);
        } else if (options.inputFormat === 'prompt') {
            if (Array.isArray(options.prompt)) {
                messages = options.prompt.map((p: LanguageModelV1Message) => {
                    const toText = () => {
                        if (typeof p.content === 'string') {
                            return p.content;
                        } else if (Array.isArray(p.content)) {
                            return p.content.map((c) => c.type === "text" ? c.text : "").join('');
                        }
                        return '';
                    };
                    if (p.role === 'system') {
                        return { role: 'system', content: toText() };
                    } else if (p.role === 'user') {
                        return { role: 'user', content: toText() };
                    }
                    return null;
                }).filter((m): m is { role: string; content: string } => m !== null);
            } else {
                const promptStr = options.prompt as unknown as string;
                messages = [{ role: 'user', content: promptStr }];
            }
        } else {
            warnings = [{ type: 'other', message: 'inputFormat ' + String(options.inputFormat) + ' is not supported' }];
        }

        const body = JSON.stringify({ messages, stream: true });
        const fetchPromise = fetch('https://ai.hackclub.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        return fetchPromise.then(async (response) => {
            const warningsOut = warnings ? [...warnings] : [];
            if (!response.ok) {
                warningsOut.push({
                    type: 'other',
                    message: `Hack Club API returned HTTP ${response.status}: ${response.statusText}`,
                });
            }
            const stream = new ReadableStream<LanguageModelV1StreamPart>({
                async start(controller) {
                    const decoder = new TextDecoder();
                    const reader = response.body?.getReader();
                    let buffer = '';
                    if (!reader) {
                        controller.error(new Error('No response body'));
                        return;
                    }
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split(/\r?\n/);
                            buffer = lines.pop() ?? '';
                            for (const line of lines) {
                                if (!line.trim()) continue;
                                try {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                                    const json: any = JSON.parse(line);
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                                    const text = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? json.choices?.[0]?.content ?? json.content ?? '';
                                    if (text) {
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        controller.enqueue({ type: 'text-delta', textDelta: text });
                                    }
                                    // Optionally handle finish_reason, tool calls, etc.
                                } catch (err) {
                                    // Optionally push a warning
                                    warningsOut.push({ type: 'other', message: 'Failed to parse NDJSON chunk: ' + String(err) });
                                }
                            }
                        }
                        if (buffer.trim()) {
                            try {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                                const json: any = JSON.parse(buffer);
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                                const text = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? json.choices?.[0]?.content ?? json.content ?? '';
                                if (text) {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    controller.enqueue({ type: 'text-delta', textDelta: text });
                                }
                            } catch (err) {
                                warningsOut.push({ type: 'other', message: 'Failed to parse final NDJSON chunk: ' + String(err) });
                            }
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                }
            });
            return {
                stream,
                rawCall: { rawPrompt: messages, rawSettings: options },
                rawResponse: { headers: Object.fromEntries(response.headers.entries()) },
                request: { body },
                warnings: warningsOut.length > 0 ? warningsOut : undefined,
            };
        });
    }
}