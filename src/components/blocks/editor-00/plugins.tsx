import { useState } from 'react';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@/components/editor/editor-ui/content-editable';
import { HistoryToolbarPlugin } from '@/components/editor/plugins/toolbar/history-toolbar-plugin';
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin';
import { Separator } from '@/components/ui/separator';
import { FormatQuote } from '@/components/editor/plugins/toolbar/block-format/format-quote';
import { BlockFormatDropDown } from '@/components/editor/plugins/toolbar/block-format-toolbar-plugin';
import { FormatCheckList } from '@/components/editor/plugins/toolbar/block-format/format-check-list';
import { FormatBulletedList } from '@/components/editor/plugins/toolbar/block-format/format-bulleted-list';
import { FormatNumberedList } from '@/components/editor/plugins/toolbar/block-format/format-numbered-list';
import { FormatHeading } from '@/components/editor/plugins/toolbar/block-format/format-heading';
import { FormatParagraph } from '@/components/editor/plugins/toolbar/block-format/format-paragraph';
import { FormatCodeBlock } from '@/components/editor/plugins/toolbar/block-format/format-code-block';
import { FontFamilyToolbarPlugin } from '@/components/editor/plugins/toolbar/font-family-toolbar-plugin';
import { FontSizeToolbarPlugin } from '@/components/editor/plugins/toolbar/font-size-toolbar-plugin';
import { LinkToolbarPlugin } from '@/components/editor/plugins/toolbar/link-toolbar-plugin';
import { FontFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/font-format-toolbar-plugin';
import { ClearFormattingToolbarPlugin } from '@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin';
import { FontBackgroundToolbarPlugin } from '@/components/editor/plugins/toolbar/font-background-toolbar-plugin';
import { ElementFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/element-format-toolbar-plugin';
import { SubSuperToolbarPlugin } from '@/components/editor/plugins/toolbar/subsuper-toolbar-plugin';
import { CodeLanguageToolbarPlugin } from '@/components/editor/plugins/toolbar/code-language-toolbar-plugin';
import { FontColorToolbarPlugin } from '@/components/editor/plugins/toolbar/font-color-toolbar-plugin';
import { InsertColumnsLayout } from '@/components/editor/plugins/toolbar/block-insert/insert-columns-layout';
import { InsertHorizontalRule } from '@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule';
import { InsertPageBreak } from '@/components/editor/plugins/toolbar/block-insert/insert-page-break';
import { InsertInlineImage } from '@/components/editor/plugins/toolbar/block-insert/insert-inline-image';
import { InsertImage } from '@/components/editor/plugins/toolbar/block-insert/insert-image';
import { InsertTable } from '@/components/editor/plugins/toolbar/block-insert/insert-table';
import { InsertEmbeds } from '@/components/editor/plugins/toolbar/block-insert/insert-embeds';
import { BlockInsertPlugin } from '@/components/editor/plugins/toolbar/block-insert-plugin';
import { InsertCollapsibleContainer } from '@/components/editor/plugins/toolbar/block-insert/insert-collapsible-container';
import { InsertExcalidraw } from '@/components/editor/plugins/toolbar/block-insert/insert-excalidraw';
import { AutocompletePlugin } from '@/components/editor/plugins/autocomplete-plugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
        <ToolbarPlugin>
          {({ blockType }) => (
            <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1 bg-gray-50 dark:bg-neutral-900 px-4">
              <HistoryToolbarPlugin />
              <Separator orientation="vertical" className="h-8" />
              <BlockFormatDropDown>
                <FormatParagraph />
                <FormatHeading levels={['h1', 'h2', 'h3']} />
                <FormatNumberedList />
                <FormatBulletedList />
                <FormatCheckList />
                <FormatCodeBlock />
                <FormatQuote />
              </BlockFormatDropDown>
              {blockType === 'code' ? (
                <CodeLanguageToolbarPlugin />
              ) : (
                <>
                  <FontFamilyToolbarPlugin />
                  <FontSizeToolbarPlugin />
                  <Separator orientation="vertical" className="h-8" />
                  <FontFormatToolbarPlugin format="bold" />
                  <FontFormatToolbarPlugin format="italic" />
                  <FontFormatToolbarPlugin format="underline" />
                  <FontFormatToolbarPlugin format="strikethrough" />
                  <Separator orientation="vertical" className="h-8" />
                  <SubSuperToolbarPlugin />
                  <LinkToolbarPlugin />
                  <Separator orientation="vertical" className="h-8" />
                  <ClearFormattingToolbarPlugin />
                  <Separator orientation="vertical" className="h-8" />
                  <FontColorToolbarPlugin />
                  <FontBackgroundToolbarPlugin />
                  <Separator orientation="vertical" className="h-8" />
                  <ElementFormatToolbarPlugin />
                  <Separator orientation="vertical" className="h-8" />
                  <BlockInsertPlugin>
                    <InsertHorizontalRule />
                    <InsertPageBreak />
                    <InsertImage />
                    <InsertInlineImage />
                    <InsertCollapsibleContainer />
                    <InsertExcalidraw />
                    <InsertTable />
                    <InsertColumnsLayout />
                    <InsertEmbeds />
                  </BlockInsertPlugin>
                </>
              )}
            </div>
          )}
        </ToolbarPlugin>
        {/* toolbar plugins */}
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <div className="">
                <div className="" ref={onRef}>
                  <ContentEditable placeholder={'Start typing ...'} />
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {/* editor plugins */}
          <HistoryPlugin />
          {/* <CustomHistoryPlugin /> */}
          <AutocompletePlugin />
        </div>
        {/* actions plugins */}
    </div>
  );
}
