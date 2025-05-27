import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { EditorView } from '@tiptap/pm/view';
import type { Transaction } from '@tiptap/pm/state';
import debounce from 'lodash.debounce';
import { aiState, getModel } from '@/lib/ai';
import { streamText } from 'ai';
import { clamp } from '@/lib/utils';
import { generateAutocompletePrompt } from '@/lib/ai/prompt';

type SuggestionCallback = (suggestion: string | null) => void;
type SuggestionFunction = (previousText: string, cb: SuggestionCallback) => void;


interface SuggestionOptions {
  applySuggestionKey: string;
  suggestionDebounce: number;
  previousTextLength: number;
}

interface SuggestionStorage {
  getSuggestion: ((previousText: string, cb: (suggestion: string | null) => void) => void) | undefined;
  suggestion: string | null;
}

const defaultOptions: SuggestionOptions = {
  applySuggestionKey: 'Tab',
  suggestionDebounce: 1500,
  previousTextLength: 4000,
};

const getSuggestion = debounce(async (text: string, callback: (result: { textStream: AsyncIterable<string>, abortController: AbortController } | undefined) => void) => {
  if (!text.trim()) {
    console.log('no text');
    callback(undefined);
    return;
  }
  const { abortController: abc, setAbortController, setIsLoading, setError, setShowSuggestion } = aiState.getState();
  try {
    let abortController: AbortController | null = abc;
    // Cancel any ongoing request
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()
    setAbortController(abortController)

    setIsLoading(true)
    setError(null)
    
    console.log("prompting model:", text);
    const model = getModel()
    const { textStream } = streamText({ 
      model, 
      prompt: generateAutocompletePrompt(text),
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 0,
          }
        }
      },
      maxTokens: 50
    })
    callback({ textStream, abortController });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Ignore abort errors
      callback(undefined);
      return;
    }
    setError(err instanceof Error ? err : new Error("Failed to get suggestion"))
    setShowSuggestion(false)
    callback(undefined);
  } finally {
    setIsLoading(false)
    setAbortController(null)
  }
}, 200);

export const AutocompleteExtension = Node.create<SuggestionOptions, SuggestionStorage>({
  name: 'suggestion',

  addOptions() {
    return defaultOptions;
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey<DecorationSet>('suggestion');
    const options = (this as { options: SuggestionOptions }).options;
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            console.log('init');
            return DecorationSet.empty;
          },
          apply(tr: Transaction, oldValue: DecorationSet) {
            const meta = tr.getMeta(pluginKey) as { decorations: DecorationSet } | undefined;
            if (meta) {
              return meta.decorations;
            }
            return tr.docChanged ? oldValue.map(tr.mapping, tr.doc) : oldValue;
          },
        },
        view() {
          return {
            update(view: EditorView, prevState) {
              const start = performance ? performance.now() : Date.now();
              void (async () => {
                const selection = view.state.selection;
                const initialCursorPos = selection.$head.pos;
                const nextNode = view.state.doc.nodeAt(initialCursorPos);
                console.log("nextNode", nextNode);

                if (nextNode && !nextNode.isBlock && pluginKey.getState(view.state)?.find().length) {
                  const tr = view.state.tr;
                  tr.setMeta('addToHistory', false);
                  tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                  view.dispatch(tr);
                  return;
                }

                if (prevState?.doc.eq(view.state.doc)) {
                  return;
                }

                setTimeout(() => {
                  const tr = view.state.tr;
                  tr.setMeta('addToHistory', false);
                  tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                  view.dispatch(tr);
                }, 0);

                const previousText = view.state.doc.textBetween(0, view.state.doc.content.size, ' ').slice(-4000);
                void getSuggestion(previousText, (suggestion) => {
                  if (!suggestion) {
                    console.log("No suggestion");
                    return;
                  }
                  console.log("Generating suggestion for", previousText);
                  const { textStream, abortController } = suggestion;
                  console.log("textStream", textStream);
                  if (!textStream) return;
                  
                  void (async () => {
                    let suggestionText = "";
                    try {
                      for await (const textPart of textStream) {
                        if (!abortController) {
                          console.log('abortController', abortController);
                          break;
                        }
                        suggestionText += textPart;
                        console.log('suggestionText', suggestionText);
                        const { setSuggestion, setShowSuggestion } = aiState.getState();
                        setSuggestion(suggestionText);
                        setShowSuggestion(true);
                      }
                      // remove <output> tags around
                      if (suggestionText.startsWith("<output>")) {
                        suggestionText = suggestionText.slice(8);
                      }
                      if (suggestionText.endsWith("</output>")) {
                        suggestionText = suggestionText.slice(0, -9);
                      }
                      if (suggestionText.endsWith("\n")) { // the model generates a \n at the end of the suggestion
                        suggestionText = suggestionText.slice(0, -1);
                      }

                      const updatedState = view.state;
                      const finalCursorPos = updatedState.selection.$head.pos;
                      const suggestionDecoration = Decoration.widget(
                        finalCursorPos,
                        () => {
                          const parentNode = document.createElement('span');
                          // const addSpace = previousText.endsWith(" ") ? '' : ' ';
                          parentNode.innerHTML = `${suggestionText}`;
                          parentNode.classList.add('autocomplete-suggestion', 'text-primary/50');
                          return parentNode;
                        },
                        { side: 1 },
                      );

                      const decorations = DecorationSet.create(updatedState.doc, [suggestionDecoration]);
                      const tr = view.state.tr;
                      tr.setMeta('addToHistory', false);
                      tr.setMeta(pluginKey, { decorations });
                      view.dispatch(tr);
                    } catch (error) {
                      console.error('Error processing suggestion:', error);
                      const { setError, setShowSuggestion } = aiState.getState();
                      setError(error instanceof Error ? error : new Error('Failed to process suggestion'));
                      setShowSuggestion(false);
                    }
                  })();
                });
              })();
              const end = performance ? performance.now() : Date.now();
              console.log("update:end", end - start);
            },
          };
        },
        props: {
          decorations(editorState) {
            return pluginKey.getState(editorState);
          },
          handleKeyDown: (view, event) => {
            if (event.key === options.applySuggestionKey) {
              const decorations = pluginKey.getState(view.state);
              if (!decorations?.find().length) {
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              const suggestionElement = view.dom.querySelector('.autocomplete-suggestion');
              if (!suggestionElement) {
                return false;
              }

              const suggestion = suggestionElement.textContent ?? '';
              if (!suggestion) {
                return false;
              }

              // eslint-disable-next-line @typescript-eslint/unbound-method
              const { state, dispatch } = view;
              const { selection } = state;
              const { $head } = selection;
              const addSpace = "" // state.doc.textBetween(clamp($head.pos - 1, 0, state.doc.content.size), $head.pos, " ").endsWith(" ") ? '' : ' ';
              const tr = state.tr.insertText(addSpace + suggestion, $head.pos);
              tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
              tr.setMeta('addToHistory', false);
              
              dispatch(tr);
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});