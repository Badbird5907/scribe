'use client'


import * as React from 'react'
import { type JSX } from 'react'

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

import { validateUrl } from '@/components/editor/utils/url'

export function LinkPlugin(): JSX.Element {
  return <LexicalLinkPlugin validateUrl={validateUrl} />
}

