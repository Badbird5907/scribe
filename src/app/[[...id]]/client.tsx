"use client";

import { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useDocumentsStore } from "@/lib/stores/documents";
import { Editor } from "@/components/blocks/editor-00/editor";
import { DocumentsList } from "@/components/documents-list";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorState } from "lexical";
import debounce from "lodash.debounce";
import Settings from "@/app/[[...id]]/settings";
import { SidebarProvider } from "@/components/ui/sidebar";

function DocumentEditor({ settings }: { settings?: boolean }) {
  const { id } = useParams();
  const { documents, updateDocument } = useDocumentsStore();
  const navigate = useNavigate();
  const doc = documents.find((d) => d.id === id);

  // Redirect to first doc if no id and docs exist
  useEffect(() => {
    if (!settings && !id && documents.length > 0) {
      void navigate(`/${documents[0]?.id}`, { replace: true });
    }
  }, [id, documents, navigate, settings]);

  const debouncedEditorChange = useMemo(() => debounce((editorState: EditorState) => {
    if (doc) {
      updateDocument(doc.id, {
        content: editorState.toJSON(),
      });
    }
  }, 450), [doc, updateDocument]);
  return (
    <SidebarProvider>
      <div className="w-full h-screen flex">
        <DocumentsList />
        <div className="flex-1 h-screen">
          <AnimatePresence mode="wait">
            {settings ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Settings />
              </motion.div>
            ) : doc ? (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Editor
                  editorSerializedState={doc.content ?? undefined}
                  onChange={debouncedEditorChange}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center text-gray-500"
              >
                <p>Document not found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentEditor />} />
        <Route path="/settings" element={<DocumentEditor settings />} />
        <Route path=":id" element={<DocumentEditor />} />
        <Route path="*" element={<DocumentEditor />} />
      </Routes>
    </BrowserRouter>
  );
} 