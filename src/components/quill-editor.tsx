"use client"

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import 'react-quill-new/dist/quill.snow.css'
import type Quill from 'quill'
import { Autocomplete } from '@/components/quill/autocomplete'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  ),
})

export interface QuillEditorProps {
  initialValue?: string
  placeholder?: string
  onChange?: (content: string) => void
  editorClassName?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', // 'bullet',
  'color', 'background',
  'link', 'image',
]
export function QuillEditor({
  initialValue = '',
  placeholder = 'Start writing...',
  onChange,
  editorClassName,
}: QuillEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<Quill>(null)
  type CompletionRef = {
    quill: Quill
    autocomplete: Autocomplete
  }
  const completionRef = useRef<CompletionRef | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (content: string) => {
    setValue(content)
    if (onChange) {
      onChange(content)
    }
  }

  useEffect(() => {
    if (editorRef.current && !completionRef.current) {
      const quill = editorRef.current.getEditor()
      completionRef.current = {
        quill,
        autocomplete: new Autocomplete(quill)
      }
    }
  }, [editorRef.current])


  if (!mounted) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <ReactQuill
      ref={editorRef}
      theme="snow"
      value={value}
      onChange={handleChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      className={cn("quill-editor", editorClassName)}
    />
  )
} 