"use client";

import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect, useCallback } from "react"
import debounce from "lodash.debounce"
import { getModel } from "@/lib/ai";
import { streamText } from "ai";

interface AITextAreaProps {
  placeholder?: string;
  className?: string;
}

export const AITextArea = ({ placeholder = "Start typing...", className = "" }: AITextAreaProps) => {
  const [text, setText] = useState("")
  const [suggestion, setSuggestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSuggestion = useCallback(debounce(async (text: string) => {
    if (!text.trim()) {
      setSuggestion("")
      setShowSuggestion(false)
      return
    }

    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError(null)
      console.log("Getting suggestion for", text)
      
      const model = getModel()
      const { textStream } = streamText({ 
        model, 
        system: `You are a helpful AI writing assistant. Complete the given text with a few words that would naturally continue the sentence. Be concise and contextually appropriate. Do not add punctuation unless necessary. Only provide the completion, do not repeat the input text. Keep the completion concise and relevant to the context`,
        prompt: text,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 0,
            }
          }
        }
      })

      let suggestionText = ""
      for await (const textPart of textStream) {
        if (!abortControllerRef.current) {
          break
        }
        suggestionText += textPart
        setSuggestion(suggestionText)
        setShowSuggestion(true)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore abort errors
        return
      }
      setError(err instanceof Error ? err : new Error("Failed to get suggestion"))
      setShowSuggestion(false)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, 500), [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    void getSuggestion(newText)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && showSuggestion && suggestion) {
      e.preventDefault()
      const newText = text + (text.endsWith(" ") ? "" : " ") + suggestion
      setText(newText)
      setSuggestion("")
      setShowSuggestion(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          style={{ fontFamily: "monospace" }}
          rows={10}
          placeholder={placeholder}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        {/* AI Suggestion Overlay */}
        {showSuggestion && suggestion && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: "12px",
              top: "12px",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              color: "transparent",
            }}
          >
            <span>{text}</span>
            <span className="text-gray-400">{text.endsWith(" ") ? suggestion : " " + suggestion}</span>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <div>
          {isLoading && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              AI thinking...
            </span>
          )}
          {error && <span className="text-red-600">Error: {error?.message}</span>}
          {showSuggestion && suggestion && <span className="text-blue-600">Press Tab to accept suggestion</span>}
        </div>
        <div className="text-xs">{text.length} characters</div>
      </div>
    </div>
  )
}