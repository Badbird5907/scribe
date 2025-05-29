import debounce from 'lodash.debounce';
import type Quill from 'quill';

interface CompletionSuggestion {
  text: string;
  range: {
    index: number;
    length: number;
  };
}

export class Autocomplete {
 private quill: Quill;
  private ghostOverlay: HTMLDivElement;
  private currentSuggestion: CompletionSuggestion | null = null;
  
  constructor(quill: Quill) {
    this.quill = quill;
    this.ghostOverlay = this.createGhostOverlay();
    this.setupEventListeners();
  }

  private createGhostOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'ghost-completion-overlay';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.color = 'rgba(115, 115, 115, 0.8)';
    overlay.style.userSelect = 'none';
    overlay.style.whiteSpace = 'pre';
    this.quill.container.querySelector('.ql-editor')?.appendChild(overlay);
    return overlay;
  }

  private setupEventListeners(): void {
    // Listen for text changes with debounce
    this.quill.on('text-change', debounce(this.handleTextChange.bind(this), 300));

    // Listen for selection changes
    this.quill.on('selection-change', this.handleSelectionChange.bind(this));

    // Listen for Tab key
    this.quill.root.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Listen for scroll events to update suggestion position
    this.quill.root.addEventListener('scroll', debounce(() => {
      if (this.currentSuggestion) {
        this.updateSuggestionPosition();
      }
    }, 100));
  }

  private async handleTextChange(): Promise<void> {
    try {
      const selection = this.quill.getSelection();
      if (!selection) return;

      const [line] = this.quill.getLine(selection.index);
      const lineText = line.text();
      const cursorPosition = selection.index - line.offset();
      
      // Get completion suggestion
      const suggestion = await this.getCompletion(lineText, cursorPosition);
      
      if (suggestion) {
        this.showSuggestion(suggestion);
      } else {
        this.hideSuggestion();
      }
    } catch (error) {
      console.error('Error getting completion:', error);
      this.hideSuggestion();
    }
  }

  private handleSelectionChange(range: { index: number; length: number } | null): void {
    if (!range) {
      this.hideSuggestion();
      return;
    }

    if (this.currentSuggestion) {
      this.updateSuggestionPosition();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.currentSuggestion) {
      event.preventDefault();
      this.acceptSuggestion();
    } else if (event.key === 'Escape') {
      this.hideSuggestion();
    }
  }

  private updateSuggestionPosition(): void {
    if (!this.currentSuggestion) return;

    const selection = this.quill.getSelection();
    if (!selection) return;

    const bounds = this.quill.getBounds(selection.index);
    
    // Position the overlay right after the cursor
    if (bounds) {
      this.ghostOverlay.style.left = `${bounds.left}px`;
      this.ghostOverlay.style.top = `${bounds.top}px`;
    }
  }

  private async getCompletion(text: string, cursorPosition: number): Promise<CompletionSuggestion | null> {
    // Get the word being typed
    const textBeforeCursor = text.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] ?? '';

    if (currentWord.length < 2) return null;

    // Simple example completions
    const completions: { [key: string]: string } = {
      'con': 'const',
      'fun': 'function',
      'ret': 'return',
      'imp': 'import',
      'exp': 'export',
      'let': 'let',
      'cla': 'class',
      'int': 'interface',
      'typ': 'type',
      'asy': 'async',
      'awa': 'await',
    };

    for (const [prefix, completion] of Object.entries(completions)) {
      if (currentWord.toLowerCase().startsWith(prefix.toLowerCase()) && currentWord !== completion) {
        return {
          text: completion.slice(currentWord.length),
          range: {
            index: selection.index,
            length: completion.length - currentWord.length
          }
        };
      }
    }

    return null;
  }

  private showSuggestion(suggestion: CompletionSuggestion): void {
    this.currentSuggestion = suggestion;
    this.ghostOverlay.textContent = suggestion.text;
    this.ghostOverlay.style.display = 'block';
    this.updateSuggestionPosition();
  }

  private hideSuggestion(): void {
    this.currentSuggestion = null;
    this.ghostOverlay.style.display = 'none';
  }

  private acceptSuggestion(): void {
    if (!this.currentSuggestion) return;

    const { range, text } = this.currentSuggestion;
    this.quill.insertText(range.index, text, 'user');
    this.hideSuggestion();
  }
}