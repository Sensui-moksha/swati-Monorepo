# Accessibility & Device Test Matrix

## WCAG 2.2 Validation
- [ ] **Keyboard Navigation**: All interactive elements (Reader controls, modals, forms) can be reached and activated using the `Tab` and `Enter/Space` keys. Focus states are clearly visible.
- [ ] **Screen Reader Support**: Tested with NVDA (Windows) and VoiceOver (macOS). Proper `aria-labels` on all icon-only buttons (e.g., Bookmark, Fullscreen).
- [ ] **Color Contrast**: Foreground/background contrast ratios meet or exceed 4.5:1 (AA) for normal text and 3:1 for large text.
- [ ] **Zooming & Resizing**: UI remains usable when browser zoom is set to 200%.

## Browser Support Matrix
| Browser | Version | OS | Status |
|---|---|---|---|
| Google Chrome | 115+ | Windows / macOS | [ ] |
| Mozilla Firefox | 115+ | Windows / macOS | [ ] |
| Apple Safari | 16+ | macOS | [ ] |
| Microsoft Edge | 115+ | Windows | [ ] |
| Chrome Mobile | Latest | Android | [ ] |
| Safari Mobile | Latest | iOS | [ ] |

## Device Testing Matrix
| Device Type | Viewport Size | Layout Adjustments | Status |
|---|---|---|---|
| Desktop Large | 1920x1080 | Sidebar expanded, full grid | [ ] |
| Laptop / iPad Pro | 1024x768 | Sidebar collapsible, 3-column grid | [ ] |
| Tablet (iPad) | 768x1024 | Sidebar hidden, 2-column grid | [ ] |
| Mobile (iPhone/Android) | 390x844 | Bottom navigation bar, 1-column grid, Reader adapts to swipe | [ ] |
