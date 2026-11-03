# Comply design system

Dark only, with no light toggle. Terminal meets newspaper: square corners, no shadows, no gradients. Values are CSS variables in `src/app/globals.css`, mapped in `tailwind.config.ts`.

| Tailwind | Variable | Value | Use |
| --- | --- | --- | --- |
| `paper` | `--paper` | `#121110` | Page background |
| `panel` | `--panel` | `#1A1917` | Cards, raised panels |
| `raise` | `--raise` | `#23211E` | Hover and selected rows |
| `ink` | `--ink` | `#ECE8E1` | Primary text, thick rules, active tab fill |
| `muted` | `--muted` | `#9B958A` | Meta and secondary text |
| `line` | `--line` | `#34312C` | Hairlines |
| `line-strong` | `--line-strong` | `#5C574F` | Outlined tags and chips |
| `brick` | `--coral` | `#E5645A` | Urgency: badge, flagged counts, alert text and border |
| `brick-soft` | `--coral-soft` | `#2A1614` | Alert strip fill |
| `link` / `link-soft` | `--link` / `--link-soft` | `#7AA7FF` / `#1E273A` | Links, focus, action hover |
| `accent` | `--accent` | `#FFB48A` | Logomark, active nav underline, chat button only |
| `job.*` | coral, amber, link, muted | | Map markers and legend: street, repaving, no-dig, building |

**Filled controls.** Text on coral, accent and off-white fills is dark `paper`, never white.

**Contrast.** `tests/contrast.test.ts` reads the variables and fails below 4.5:1. Hairlines and borders are decorative and exempt.

**Type.** Schibsted Grotesk for headings and body; IBM Plex Mono for labels. `.hero` is the tight bold headline, `.label` the mono caps with wide tracking.

**Rules.** `.section-head` has a 2px `ink` rule, rows a 1px `line` hairline, and `.dotted` closes a page hero. Only the avatar and chat button are round.

**Map.** CARTO Dark Matter when `NEXT_PUBLIC_CARTO_API_KEY` is set. CARTO answers keyless requests with an "API KEY REQUIRED" tile, so the default is OpenStreetMap tiles darkened by the `.osm-dark` CSS filter.

**Layout.** Content max 1180px. Overview is `1fr 320px` from `lg`, stacked below. Everything works at 390px with a 16px gutter.
