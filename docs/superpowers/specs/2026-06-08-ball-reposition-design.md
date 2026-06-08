# Ball Position: Top-Right → Bottom-Right

**Date**: 2026-06-08  
**Status**: Implemented (v1.4.2)

## Context

Selection trigger ball was positioned at top-right of the selection (rect.top - 14px, rect.right + 2px). This overlapped with other browser extensions' floating panels (e.g., 豆包) that also anchor to top of selected text, causing the ball to be blocked.

## Design

Move the ball from top-right to **bottom-right** of the selection:

| | Before | After |
|---|---|---|
| Vertical | `rect.top - 14` | `rect.bottom + 2` |
| Horizontal | `rect.right + 2` | `rect.right + 2` (unchanged) |

### Overflow flips

| Overflow | Strategy |
|---|---|
| Bottom edge | Flip above: `rect.top - 14` |
| Right edge | Flip left: `rect.left - 14` |
| Both | `rect.left - 14, rect.top - 14` |

### Unchanged

Ball CSS, z-index (99997), size (12px), hover 1s trigger, inflation animation, diagnostic logging.

## Scope

Single function: `positionBall()` in `src/content/selection.ts`.
