"use client";

import { AutocompleteExtension } from '@/components/rich-text-editor/extensions/autocomplete';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit, AutocompleteExtension],
    content: '<p>Hello World! 🌎️</p>',
  })

  return <EditorContent editor={editor} />
}

export default Tiptap