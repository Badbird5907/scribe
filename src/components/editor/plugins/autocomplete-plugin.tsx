"use client"

import { type JSX, useCallback, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import type { NodeKey } from "lexical"
import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
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

type SearchPromise = {
  dismiss: () => void
  promise: Promise<null | string>
}

export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substr(0, 5)

// TODO query should be custom
function useQuery(): (editorText: string) => SearchPromise {
  return useCallback((editorText: string) => {
    let isDismissed = false;
    const dismiss = () => {
      isDismissed = true;
    };
    const promise = (async () => {
      if (!editorText.trim()) return null;
      try {
        const model = getModel();
        console.log("editorText", {editorText});
        const { textStream } = streamText({
          model,
          prompt: generateAutocompletePrompt(editorText),
          maxTokens: 50,
          providerOptions: {
            google: {
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          },
        });
        let suggestionText = "";
        for await (const textPart of textStream) {
          if (isDismissed) break;
          suggestionText += textPart;
        }
        let suggestion = suggestionText.trim();
        if (suggestion.startsWith("<output>")) {
          suggestion = suggestion.slice(8);
        }
        if (suggestion.endsWith("</output>")) {
          suggestion = suggestion.slice(0, -9);
        }
        console.log("suggestionText", {suggestionText, suggestion});
        return isDismissed || !suggestion ? null : suggestion;
      } catch (err) {
        return null;
      }
    })();
    return { dismiss, promise };
  }, []);
}

export function AutocompletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [, setSuggestion] = useSharedAutocompleteContext()
  const query = useQuery()

  useEffect(() => {
    let autocompleteNodeKey: null | NodeKey = null
    let lastText: null | string = null
    let lastSuggestion: null | string = null
    let searchPromise: null | SearchPromise = null
    function $clearSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey !== null ? $getNodeByKey(autocompleteNodeKey) : null
      if (autocompleteNode?.isAttached()) {
        autocompleteNode.remove()
        autocompleteNodeKey = null
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
        const selection = $getSelection()
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
      const textNode = $createTextNode(lastSuggestion)
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

    return mergeRegister(
      editor.registerNodeTransform(
        AutocompleteNode,
        $handleAutocompleteNodeTransform
      ),
      editor.registerUpdateListener(handleUpdate),
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
      ...(rootElem !== null
        ? [addSwipeRightListener(rootElem, handleSwipeRight)]
        : []),
      unmountSuggestion
    )
  }, [editor, query, setSuggestion])

  return null
}
