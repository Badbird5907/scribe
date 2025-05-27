"use client"

import { MinimalTiptapEditor } from "@/components/rich-text-editor"
import type { Content } from "@tiptap/react"
import { useState } from "react"

export default function Home() {
  const [value, setValue] = useState<Content>("")
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rich Text Editor</h1>
      <MinimalTiptapEditor value={value}
        onChange={setValue} className="w-full"
        editorContentClassName="p-5"
        output="html"
        placeholder="Enter your description..."
        autofocus={true}
        editable={true}
        editorClassName="focus:outline-hidden"
      />
    </main>
  )
}
