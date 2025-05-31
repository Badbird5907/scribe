

export function setDomHiddenUntilFound(dom: HTMLElement): void {
  // @ts-expect-error - aa
  dom.hidden = 'until-found'
}

export function domOnBeforeMatch(dom: HTMLElement, callback: () => void): void {
  // @ts-expect-error - aa
  dom.onbeforematch = callback
}