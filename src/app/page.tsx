"use client";

import { useState } from "react";
import { QuillEditor } from "@/components/quill-editor";
import { EditorToolbar } from "@/components/editor-toolbar";

export default function Home() {
  const [content, setContent] = useState("");

  return (
    <div className="w-full h-screen">
      <QuillEditor
        editorClassName="w-full h-full"
        initialValue={content}
        onChange={setContent}
      />
    </div>
  );
}
