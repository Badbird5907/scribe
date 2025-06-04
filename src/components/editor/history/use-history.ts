/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';

import {useEffect, useMemo} from 'react';
import { createEmptyHistoryState, registerHistory, type HistoryState } from '@/components/editor/history/custom-history';

export function useHistory(
  editor: LexicalEditor,
  externalHistoryState?: HistoryState,
  delay = 1000,
): void {
  const historyState: HistoryState = useMemo(
    () => externalHistoryState ?? createEmptyHistoryState(),
    [externalHistoryState],
  );

  useEffect(() => {
    return registerHistory(editor, historyState, delay);
  }, [delay, editor, historyState]);
}