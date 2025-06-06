"use client"

import { type JSX, useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import type { LexicalNode, NodeKey, UpdateListenerPayload } from "lexical"
import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  RootNode,
} from "lexical"

import { useSharedAutocompleteContext } from "@/components/editor/context/shared-autocomplete-context"
import {
  $createAutocompleteNode,
  AutocompleteNode,
} from "@/components/editor/nodes/autocomplete-node"
import { addSwipeRightListener } from "@/components/editor/utils/swipe"
import { getModel } from "@/lib/ai"
import { streamText } from "ai"
import { generateAutocompletePrompt } from "@/lib/ai/prompt"
import debounce from "lodash.debounce"

type SearchPromise = {
  dismiss: () => void
  promise: Promise<null | string>
}

export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substr(0, 5)

const fetch = debounce(async (
  editorText: string,
  resolve: (v: null | string) => void,
  reject: (e: unknown) => void,
  dismissCheck: () => boolean
) => {
  if (!editorText.trim()) return resolve(null);
  try {
    const model = getModel();
    console.log("editorText", { editorText });
    const prompt = generateAutocompletePrompt(editorText);
    console.log("prompt", { prompt });
    const { textStream } = streamText({
      model,
      prompt,
      maxTokens: 20,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    });
    let suggestionText = "";
    for await (const part of textStream) {
      suggestionText += part;
    }
    let suggestion = suggestionText.trim();
    if (suggestion.startsWith("<output>")) {
      suggestion = suggestion.slice(8);
    }
    if (suggestion.endsWith("</output>")) {
      suggestion = suggestion.slice(0, -9);
    }
    if (suggestion.startsWith("<sp/>")) {
      suggestion = " " + suggestion.slice(5);
    }
    console.log("suggestionText", { suggestionText, suggestion });
    if (dismissCheck() || !suggestion) return resolve(null);
    resolve(suggestion);
  } catch (err) {
    console.error("Error fetching autocomplete suggestion", err);
    reject(err);
  }
}, 300);
// TODO query should be custom
function useQuery(): (editorText: string) => SearchPromise {
  // Store the latest dismiss function for each call
  const dismissRef = { current: () => {} };

  // Debounced async function to fetch suggestion
  const debouncedFetch = useCallback(
    fetch,
    []
  );

  return useCallback((editorText: string) => {
    let isDismissed = false;
    const dismiss = () => {
      isDismissed = true;
    };
    dismissRef.current = dismiss;
    const promise = new Promise<null | string>((resolve, reject) => {
      void debouncedFetch(editorText, resolve, reject, () => isDismissed);
    }).catch((e) => {
      console.error("Error fetching autocomplete suggestion", e);
      throw e;
    });
    return { dismiss, promise };
  }, [debouncedFetch]);
}

export function AutocompletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [suggestion, setSuggestion] = useSharedAutocompleteContext()
  const query = useQuery()
  const [autoNodeKeyState, setAutocompleteNodeKey] = useState<null | NodeKey>(null)

  useEffect(() => {
    let autocompleteNodeKey: null | NodeKey = autoNodeKeyState
    let lastText: null | string = null
    let lastSuggestion: null | string = null
    let searchPromise: null | SearchPromise = null
    function $clearSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey !== null ? $getNodeByKey(autocompleteNodeKey) : null
      if (autocompleteNode?.isAttached()) {
        autocompleteNode.remove()
        autocompleteNodeKey = null
        setAutocompleteNodeKey(null)
      }
      if (searchPromise !== null) {
        searchPromise.dismiss()
        searchPromise = null
      }
      lastText = null
      lastSuggestion = null
      setSuggestion(null)
    }
    function updateAsyncSuggestion(
      refSearchPromise: SearchPromise,
      newSuggestion: null | string
    ) {
      if (searchPromise !== refSearchPromise || newSuggestion === null) {
        // Outdated or no suggestion
        return
      }
      editor.update(
        () => {
          const selection = $getSelection()
          const editorText = $getRoot().getTextContent()
          if (
            !editorText.trim() ||
            editorText !== lastText ||
            !$isRangeSelection(selection)
          ) {
            // Outdated
            return
          }
          const selectionCopy = selection.clone()
          const node = $createAutocompleteNode(uuid)
          autocompleteNodeKey = node.getKey()
          selection.insertNodes([node])
          $setSelection(selectionCopy)
          lastSuggestion = newSuggestion
          setSuggestion(newSuggestion)
        },
        { tag: "history-merge" }
      )
    }

    function $handleAutocompleteNodeTransform(node: AutocompleteNode) {
      const key = node.getKey()
      if (node.__uuid === uuid && key !== autocompleteNodeKey) {
        // Max one Autocomplete node per session
        $clearSuggestion()
      }
    }
    function handleUpdate() {
      editor.update(() => {
        // only update if it was caused by a user input        
        const editorText = $getRoot().getTextContent()
        if (!editorText.trim()) {
          $clearSuggestion()
          return
        }
        if (editorText === lastText) {
          return
        }
        $clearSuggestion()
        searchPromise = query(editorText)
        searchPromise.promise
          .then((newSuggestion) => {
            if (searchPromise !== null) {
              updateAsyncSuggestion(searchPromise, newSuggestion)
            }
          })
          .catch(() => {
            console.error("Error fetching autocomplete suggestion")
          })
        lastText = editorText
      })
    }
    function $handleAutocompleteIntent(): boolean {
      if (lastSuggestion === null || autocompleteNodeKey === null) {
        return false
      }
      const autocompleteNode = $getNodeByKey(autocompleteNodeKey)
      if (autocompleteNode === null) {
        return false
      }
      let suggestionText = lastSuggestion;
      let prefix = '';
      if (suggestionText.startsWith('<sp/>')) {
        prefix = ' ';
        suggestionText = suggestionText.slice(5);
      }
      const textNode = $createTextNode(prefix + suggestionText)
      autocompleteNode.replace(textNode)
      textNode.selectNext()
      $clearSuggestion()
      return true
    }
    function $handleKeypressCommand(e: Event) {
      if ($handleAutocompleteIntent()) {
        e.preventDefault()
        return true
      }
      return false
    }
    function handleSwipeRight(_force: number, e: TouchEvent) {
      editor.update(() => {
        if ($handleAutocompleteIntent()) {
          e.preventDefault()
        }
      })
    }
    function unmountSuggestion() {
      editor.update(() => {
        $clearSuggestion();
      });
    }

    const rootElem = editor.getRootElement()
    
    setAutocompleteNodeKey(autocompleteNodeKey)

    return mergeRegister(
      editor.registerNodeTransform(
        AutocompleteNode,
        $handleAutocompleteNodeTransform
      ),
      editor.registerNodeTransform(RootNode, handleUpdate),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (autocompleteNodeKey !== null) {
            $clearSuggestion();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (autocompleteNodeKey !== null) {
            $clearSuggestion();
            return false; // Allow the backspace to proceed
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      ...(rootElem !== null
        ? [addSwipeRightListener(rootElem, handleSwipeRight)]
        : []),
      unmountSuggestion
    )
  }, [autoNodeKeyState, editor, query, setSuggestion])

  return null
}
