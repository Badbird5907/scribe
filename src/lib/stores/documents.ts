import { create } from "zustand";
import { persistNSync } from "persist-and-sync";
import { v4 as uuidv4 } from "uuid";
import type { SerializedEditorState } from "lexical";

export type Document = {
  id: string;
  title: string;
  content: SerializedEditorState | null;
  createdAt: number;
  updatedAt: number;
}

type DocumentsStore = {
  documents: Document[];
  createDocument: (id?: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsStore>(
  persistNSync((set) => ({
    documents: [],
    createDocument: (id?: string) => set((state) => {
      const newDoc: Document = {
        id: id ?? uuidv4(),
        title: "Untitled Document",
        content: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        documents: [...state.documents, newDoc],
      };
    }),
    updateDocument: (id, updates) => set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, ...updates, updatedAt: Date.now() }
          : doc
      ),
    })),
    deleteDocument: (id) => set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
  }), { name: "scribe-documents" })
); 