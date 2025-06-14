import { clsx, type ClassValue } from "clsx"
import type { SerializedEditorState, SerializedElementNode, SerializedLexicalNode, SerializedParagraphNode, SerializedTextNode } from "lexical"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target }
  
  for (const source of sources) {
    for (const key in source) {
      const value = source[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = deepMerge(result[key] as object || {}, value as object) as T[Extract<keyof T, string>]
      } else {
        result[key] = value as T[Extract<keyof T, string>]
      }
    }
  }
  
  return result
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
}

export const getBadLexicalTextContent = (state: SerializedEditorState<SerializedLexicalNode>): string => {
  const extract = (node: SerializedLexicalNode): string => {
    if (node.type === "text") {
      return (node as SerializedTextNode).text;
    }
    if ("children" in node) {
      return (node as SerializedElementNode).children.map((child) => extract(child)).join(" ");
    }
    return "";
  }
  return extract(state.root);
}