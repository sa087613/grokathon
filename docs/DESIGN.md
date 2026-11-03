# Peachtree design system

Flat and printed. Square corners, no shadows, no gradients. Tokens live in `tailwind.config.ts`; shared classes in `src/app/globals.css`.

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#EEECE4` | Page background |
| `panel` | `#E5E2D7` | Item cards, hover rows |
| `ink` | `#171614` | Text, thick rules, active states |
| `muted` | `#67645C` | Secondary text |
| `line` / `line-strong` | `#CBC8BD` / `#A9A69B` | Hairlines, outlined tags |
| `brick` / `brick-deep` / `brick-soft` | `#BE4A47` / `#8E1F1F` / `#FBEFEC` | The only urgency color: badge, flagged counts, alert strip |
| `link` / `link-soft` | `#1F5FA8` / `#D5E2F2` | Links, focus and action hover only |
| `job.*` | street, repaving, nodig, building | Map legend only |

**Type.** Schibsted Grotesk for headings and body; IBM Plex Mono for labels. `.hero` is the tight bold headline, `.label` the mono caps with wide tracking.

**Rules.** `.section-head` has a 3px ink rule, rows a 1px `line` hairline, and `.dotted` closes a page hero. Only the avatar and chat button are round.

**Layout.** Content max 1180px. Overview is `1fr 320px` from `lg`, stacked below. Everything works at 390px with a 16px gutter.

**Components.** shadcn-style primitives are in `src/components/ui`. Item buttons come from `src/actions/registry.ts`.
