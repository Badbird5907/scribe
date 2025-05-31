import { type Klass, type LexicalNode, type LexicalNodeReplacement, ParagraphNode, TextNode } from 'lexical'
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode } from '@lexical/list'
import { TableRowNode } from '@lexical/table'
import { ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { TableCellNode } from '@lexical/table'
import { OverflowNode } from '@lexical/overflow'
import { HashtagNode } from '@lexical/hashtag'
import { TableNode } from '@lexical/table'
import { CodeNode } from '@lexical/code'
import { CodeHighlightNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    OverflowNode,
    HashtagNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
  ]
