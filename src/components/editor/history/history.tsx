import { useHistory } from "@/components/editor/history/use-history";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin, type HistoryState } from "@lexical/react/LexicalHistoryPlugin";
import { useEffect } from "react";
import { create } from "zustand";

const useHistoryStore = create<HistoryState>((set) => ({
  current: null,
  redoStack: [],
  undoStack: [],
}))

export const CustomHistoryPlugin = () => {
  const { current, redoStack, undoStack } = useHistoryStore()
  useEffect(() => {
    console.log("historyState", current, redoStack, undoStack)
  }, [current, redoStack, undoStack])
  
  const [editor] = useLexicalComposerContext();

  useHistory(editor, { current, redoStack, undoStack }, 1000);
  return null;
}