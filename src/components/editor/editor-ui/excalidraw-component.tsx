import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import * as React from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import type { NodeKey } from 'lexical'
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import { $isExcalidrawNode } from '@/components/editor/nodes/excalidraw-node'
import type { ExcalidrawInitialElements } from '@/components/editor/editor-ui/excalidraw-modal'
import { ExcalidrawModal } from '@/components/editor/editor-ui/excalidraw-modal'
import ExcalidrawImage from '@/components/editor/editor-ui/excalidraw-image'
import { ImageResizer } from '@/components/editor/editor-ui/image-resizer'
import type { BinaryFiles } from '@excalidraw/excalidraw/types'
import type { AppState } from '@excalidraw/excalidraw/types'
import type { NonDeleted } from '@excalidraw/excalidraw/element/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export default function ExcalidrawComponent({
  nodeKey,
  data,
  width,
  height,
}: {
  data: string
  nodeKey: NodeKey
  width: 'inherit' | number
  height: 'inherit' | number
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const isEditable = useLexicalEditable()
  const [isModalOpen, setModalOpen] = useState<boolean>(
    data === '[]' && editor.isEditable()
  )
  const imageContainerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const captionButtonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [isResizing, setIsResizing] = useState<boolean>(false)

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        event.preventDefault()
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if (node) {
            node.remove()
          }
        })
      }
      return false
    },
    [editor, isSelected, nodeKey]
  )

  useEffect(() => {
    if (!isEditable) {
      if (isSelected) {
        clearSelection()
      }
      return
    }
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const buttonElem = buttonRef.current
          const eventTarget = event.target

          if (isResizing) {
            return true
          }

          if (buttonElem?.contains(eventTarget as Node)) {
            if (!event.shiftKey) {
              clearSelection()
            }
            setSelected(!isSelected)
            if (event.detail > 1) {
              setModalOpen(true)
            }
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      )
    )
  }, [
    clearSelection,
    editor,
    isSelected,
    isResizing,
    $onDelete,
    setSelected,
    isEditable,
  ])

  const deleteNode = useCallback(() => {
    setModalOpen(false)
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) {
        node.remove()
      }
    })
  }, [editor, nodeKey])

  const setData = (
    els: ExcalidrawInitialElements,
    aps: Partial<AppState>,
    fls: BinaryFiles
  ) => {
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isExcalidrawNode(node)) {
        if ((els && els.length > 0) || Object.keys(fls).length > 0) {
          node.setData(
            JSON.stringify({
              appState: aps,
              elements: els,
              files: fls,
            })
          )
        } else {
          node.remove()
        }
      }
    })
  }

  const onResizeStart = () => {
    setIsResizing(true)
  }

  const onResizeEnd = (
    nextWidth: 'inherit' | number,
    nextHeight: 'inherit' | number
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false)
    }, 200)

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)

      if ($isExcalidrawNode(node)) {
        node.setWidth(nextWidth)
        node.setHeight(nextHeight)
      }
    })
  }

  const openModal = useCallback(() => {
    setModalOpen(true)
  }, [])

  const {
    elements,
    files,
    appState ,
  } = useMemo(() => JSON.parse(data) as {
    elements: ExcalidrawInitialElements
    files: BinaryFiles
    appState: AppState
  }, [data])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    if (elements?.length === 0) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node) {
          node.remove()
        }
      })
    }
  }, [editor, nodeKey, elements])

  return (
    <>
      {isEditable && isModalOpen && (
        <ExcalidrawModal
          initialElements={elements}
          initialFiles={files}
          initialAppState={appState}
          isShown={isModalOpen}
          onDelete={deleteNode}
          onClose={closeModal}
          onSave={(els, aps, fls) => {
            setData(els, aps, fls)
            setModalOpen(false)
          }}
          closeOnClickOutside={false}
        />
      )}
      {elements && elements.length > 0 && (
        <button
          ref={buttonRef}
          className={`m-0 border-0 bg-transparent p-0 ${isSelected ? 'user-select-none ring-2 ring-primary ring-offset-2' : ''}`}
        >
          <ExcalidrawImage
            imageContainerRef={imageContainerRef}
            className="image"
            elements={elements as NonDeleted<ExcalidrawElement>[]}
            files={files}
            appState={appState}
            width={width}
            height={height}
          />
          {isSelected && isEditable && (
            <div
              className="image-edit-button"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={openModal}
            />
          )}
          {(isSelected || isResizing) && isEditable && (
            <ImageResizer
              buttonRef={captionButtonRef}
              showCaption={true}
              setShowCaption={() => null}
              imageRef={imageContainerRef}
              editor={editor}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              captionsEnabled={true}
            />
          )}
        </button>
      )}
    </>
  )
}
