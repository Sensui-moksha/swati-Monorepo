declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, setting: Record<string, unknown>);
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    flip(page: number, corner?: string): void;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    on(event: string, callback: (e: Record<string, unknown>) => void): void;
    destroy(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
  }
}
