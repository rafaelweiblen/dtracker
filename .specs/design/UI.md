# UI Guidelines — Diet Tracker

Derived from visual references in `.specs/design/references/`.

## Design Philosophy

Clean, minimal, mobile-first. White space is a feature, not a bug. Every element must earn its place — if removing it doesn't hurt comprehension, remove it.

## Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#FFFFFF` / `oklch(1 0 0)` | Page background |
| Surface | `#F9FAFB` | Cards, sections |
| Border | `#E5E7EB` | Card borders, dividers |
| Text primary | `#111827` | Headings, labels |
| Text secondary | `#6B7280` | Subtitles, metadata |
| Text muted | `#9CA3AF` | Placeholders, disabled |
| Accent | `#16a34a` (green-600) | Primary buttons, active states, streaks |
| Accent light | `#dcfce7` (green-100) | Accent backgrounds, badges |
| Destructive | `#DC2626` | Delete actions |

Dark mode: invert surface/text, keep accent green.

## Typography

- **Heading (page title)**: `text-2xl font-bold` — e.g., "Hoje", "Calendário"
- **Section title**: `text-base font-semibold`
- **Body**: `text-sm font-normal`
- **Caption / metadata**: `text-xs text-muted-foreground`
- Font: system-ui / sans-serif (inherit from Next.js font setup)
- Line height: relaxed (1.6) for body, tight (1.2) for headings

## Spacing

- Page padding: `px-4 py-6` (16px horizontal, 24px top)
- Card padding: `p-4` (16px all sides)
- Between sections: `gap-4` (16px)
- Between list items: `gap-2` (8px)
- Bottom nav height: `64px` — add `pb-20` to page content to avoid overlap

## Cards

```
rounded-2xl border border-border bg-card p-4 shadow-sm
```

- No heavy shadows — `shadow-sm` only
- Rounded corners: `rounded-2xl` (16px)
- White background on light, slightly elevated on dark
- No gradient backgrounds

## Buttons

- **Primary**: `bg-green-600 text-white rounded-xl px-4 py-3 font-semibold` — for main actions (Salvar, Adicionar)
- **Secondary**: `border border-border bg-transparent rounded-xl px-4 py-3` — for cancel/back
- **Destructive**: `text-destructive` text-only or outlined — never filled red for mobile
- Size: full-width (`w-full`) for modal/sheet actions, auto for inline

## Icons

**Rule: icons only where they aid scanning, never decorative.**

Allowed:
- Bottom nav icons (Home, Calendar, Settings) — 20px, inactive gray / active green
- Action buttons (+ for add, trash for delete, pencil for edit)
- Status indicators (wifi-off for offline, fire for streak)

Forbidden:
- Icons next to every list item as decoration
- Icons inside input fields without function
- Emoji as UI icons (allowed only in streak/gamification copy)

Use `lucide-react` exclusively. Size: `16px` inline, `20px` nav, `24px` standalone action.

## Lists & Entries

- Each entry: two lines max — **type badge + description** on line 1, **time** on line 2
- Type badge: small pill `rounded-full px-2 py-0.5 text-xs font-medium`
  - Escape: `bg-red-100 text-red-700`
  - Exercise: `bg-green-100 text-green-700`
- No left border accents, no colored left strips
- Tap target: minimum `44px` height

## Calendar Heatmap

- Grid: 7 columns (days of week), rows per week
- Each day: circle or rounded square, `32px × 32px`
- Color states:
  - Empty: `bg-muted` (light gray)
  - Has exercise: `bg-green-200`
  - Has escape: `bg-red-200`
  - Both: `bg-orange-200`
  - Today: ring `ring-2 ring-green-600`
- No numbers inside cells (show on tap/hover only)
- Month navigation: `<` `>` arrows, month+year centered

## Bottom Navigation

- 3 items only: Home, Calendar, Settings
- No labels (icons only) — or short 1-word labels max
- Active: green-600 icon + green underline dot
- Inactive: gray-400 icon
- Background: white with top border, `backdrop-blur` if content scrolls beneath

## Forms & Inputs

- Input: `rounded-xl border border-input bg-background px-3 py-3`
- Label: above input, `text-sm font-medium mb-1`
- No floating labels
- Error: red text below field, `text-xs text-destructive`
- Textarea: same style, `min-h-[80px]`, no resize

## Bottom Sheets (Entry Form)

- Native `<dialog>` element, slides up from bottom
- Handle bar at top: `w-10 h-1 rounded-full bg-muted mx-auto mb-4`
- Max height: `80vh`, scrollable content
- Close on backdrop click or swipe down

## Empty States

- Centered illustration (simple SVG or emoji) + heading + subtext
- No icon walls, no complex graphics
- Example: "Nenhuma entrada hoje" + small muted text

## What NOT to do

- No gradient text or gradient backgrounds
- No card hover animations in mobile (no `hover:scale`)
- No `shadow-lg` or `shadow-xl` on cards
- No icons beside every piece of text as decoration
- No colored section headers with background fills
- No multiple font weights mixed in a single card
- No `text-xs` for primary content — minimum `text-sm`
