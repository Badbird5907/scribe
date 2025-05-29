"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  FileText, 
  Download, 
  Share2, 
  History, 
  Undo, 
  Redo,
  Copy
} from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  onSave?: () => void
  onNew?: () => void
  onExport?: () => void
  onShare?: () => void
  onHistory?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDuplicate?: () => void
  className?: string
  documentName?: string
  lastSaved?: string
}

export function EditorToolbar({
  onSave,
  onNew,
  onExport,
  onShare,
  onHistory,
  onUndo,
  onRedo,
  onDuplicate,
  className,
  documentName = "Untitled Document",
  lastSaved,
}: EditorToolbarProps) {
  return (
    <div className={cn("flex items-center justify-between p-2 bg-card border-b", className)}>
      <div className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-primary" />
        <span className="font-medium truncate max-w-[200px]">{documentName}</span>
        {lastSaved && (
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            Last saved: {lastSaved}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        <TooltipProvider>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onUndo}
                  className="h-8 w-8"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onRedo}
                  className="h-8 w-8"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onHistory}
                  className="h-8 w-8"
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Version History</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onDuplicate}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
            
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onExport}
                  className="h-8 w-8 hidden sm:flex"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onShare}
                  className="h-8 w-8 hidden sm:flex"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSave}
                  className="ml-1 hidden sm:flex"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Document</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={onSave}
                  className="ml-1 sm:hidden h-8 w-8"
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Document</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
} 