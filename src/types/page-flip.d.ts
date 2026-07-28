declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, setting: any);
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[] | any): void;
    flip(page: number, corner?: string): void;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    on(event: string, callback: (e: any) => void): void;
    destroy(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
  }
}
