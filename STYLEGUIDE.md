# Material Design 3 Style Guide — Personal Gemini Journal

This document defines the Material Design 3 (Material You) visual specification and component architecture implemented for the **Personal Gemini Journal**, matching the visual language of Google products (Gemini, Keep, and AI Studio).

---

## 1. Design Tokens

The application uses CSS Custom Properties to express semantic Material Design 3 tokens. Color roles automatically adapt between Light and Dark modes.

### 1.1 Color Tokens (Dynamic Roles)

| Token | Light Mode | Dark Mode | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--md-sys-color-primary` | `#1A73E8` (Google Blue) | `#A8C7FA` (M3 Dark Blue) | Key interactive elements, active highlights, submit buttons |
| `--md-sys-color-on-primary` | `#FFFFFF` | `#062E6F` | Text/icons placed atop primary surfaces |
| `--md-sys-color-primary-container` | `#D3E3FD` (Soft Blue Tint) | `#0842A0` | User message bubbles, FAB background, active list highlights |
| `--md-sys-color-on-primary-container` | `#041E49` | `#D3E3FD` | Text/icons on primary containers |
| `--md-sys-color-surface` | `#FFFFFF` | `#131314` (Gemini Canvas) | Base application canvas, top bar, main stream |
| `--md-sys-color-on-surface` | `#1F1F1F` | `#E3E3E3` | High-contrast body text and primary typography |
| `--md-sys-color-surface-container` | `#F0F4F9` | `#212124` | Navigation rail, suggestion chips, input containers |
| `--md-sys-color-surface-container-high` | `#E9EEF6` | `#28292A` | Floating composer background, elevated cards |
| `--md-sys-color-surface-container-highest` | `#E1E3E1` | `#333537` | Hover overlays, active chip outlines |
| `--md-sys-color-on-surface-variant` | `#444746` | `#C4C7C5` | Timestamps, secondary labels, disabled icons |
| `--md-sys-color-outline` | `#747775` | `#8E918F` | Active focus rings, borders on interactive elements |
| `--md-sys-color-outline-variant` | `#C4C7C5` | `#444746` | Hairline dividers, card outlines, subtle borders |
| `--md-sys-color-error` | `#BA1A1A` | `#FFB4AB` | Destructive actions, delete confirmations, critical alerts |
| `--md-sys-color-error-container` | `#FFDAD6` | `#93000A` | Error banner backgrounds |
| `--md-sys-color-on-error-container` | `#410002` | `#FFDAD6` | Text on error banners |

---

## 2. Typography Scale

Pairing **Google Sans** (Display/Headings/Labels) with **Roboto** (Body text) and **JetBrains Mono** (Technical hashes and code).

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Headline Medium** | Google Sans | 24px–28px | 500 (Medium) | 32px | -0.25px | Homepage empty-state greeting ("What's on your mind?") |
| **Title Large** | Google Sans | 17px–18px | 500 (Medium) | 24px | 0px | Top bar session title, modal dialog headers |
| **Title Medium** | Google Sans | 14px–15px | 500 (Medium) | 20px | +0.1px | Executive Summary title, suggestion chip titles |
| **Body Large** | Roboto | 15px | 400 (Regular) | 24px (1.6) | +0.15px | Journal chat messages, Gemini reflections |
| **Body Medium** | Roboto | 13px–14px | 400 (Regular) | 20px | +0.25px | Session titles in navigation rail, modal descriptions |
| **Label Medium** | Google Sans | 12px–13px | 500 (Medium) | 16px | +0.5px | Rail group headers ("TODAY", "YESTERDAY"), buttons |
| **Label Small** | Roboto | 10px–11px | 400 (Regular) | 14px | +0.4px | Timestamps, mood tags, cryptographic badges |
| **Code / Mono** | JetBrains Mono | 11px–12px | 500 (Medium) | 16px | 0px | Markdown code blocks, UID indicators |

---

## 3. Shape Scale & Corner Radii

Material Design 3 specifies soft, continuous corner rounding:

| Level | Corner Radius | Application |
| :--- | :--- | :--- |
| **Full (Pill)** | `9999px` (`rounded-full`) | `New entry` FAB, Composer container (`rounded-[28px]`), session list item highlights, theme toggles, sentiment chips |
| **Extra Large** | `24px` (`rounded-[24px]`) | Modal dialogs (`MoodTrendsModal`, `ExportModal`, `SecurityInspectorModal`, `AuthModal`) |
| **Large** | `16px` (`rounded-[16px]`) | `<SummaryCard>`, `<SuggestionChip>`, Account menu dropdown |
| **Medium (Bubbles)** | `20px` with `6px` tail | User message bubbles (`rounded-[20px] rounded-br-[6px]`) |
| **Small** | `8px–12px` | Code snippet boxes, keyboard shortcuts (`<kbd>`) |

---

## 4. Elevation & Shadow Scale

Shadows are soft, low-contrast, and paper-like, avoiding harsh glossy drop shadows:

- **Level 1 (Default cards & chips):**
  `0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)`
- **Level 2 (Hover states & Floating controls):**
  `0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)`
- **Level 3 (Modals & Account dropdowns):**
  `0 4px 8px 3px rgba(60,64,67,0.15), 0 1px 3px rgba(60,64,67,0.3)`

---

## 5. Motion & Transitions

- **Duration:** 150ms–250ms
- **Easing:** `cubic-bezier(0.2, 0.0, 0, 1.0)` (Standard easing)
- **Hover Transitions:** Smooth color and opacity transitions (`duration-150`, `duration-200`)
- **Drawer Transitions:** `translate-x` slide on mobile with standard ease-in-out (`duration-200`)

---

## 6. Iconography

All icons utilize Google's **Material Symbols Outlined** (`opsz: 20..24, wght: 300..400, FILL: 0`), rendered through the `<MaterialSymbol />` helper:
- `add` — "+ New entry"
- `send` — Composer submission
- `mic` / `mic_off` — Voice reflection
- `edit` / `close` / `check` — Inline session renaming
- `delete` — Secure session purging
- `bookmark` — Executive summary synthesis
- `sparkles` — Gemini AI generation
- `insights` / `trending_up` — Mood analytics
- `download` — Export archives
- `shield` / `lock` — Zero-trust encryption badges

---

## 7. Component Library Architecture

### 7.1 `<AppShell>`
- **Responsive Layout:** 288px Left navigation rail + Centered main pane (`max-width: 760px`).
- **Collapsible Rail:** Supports full desktop collapse to 68px icon rail (`menu` toggle) and auto-collapsing off-canvas drawer on mobile (`< 768px`) with scrim backdrop.
- **Top Bar:** Houses editable title inline form, "Summarize" pill button, insights trigger, and `<AccountMenu>`.

### 7.2 `<SessionListItem>`
- Displays session title with ellipsis truncation, relative timestamp, and optional sentiment tag.
- Highlights with `--md-sys-color-primary-container` when active.
- Hover reveals action icons for instant inline renaming and deletion.

### 7.3 `<MessageBubble>`
- **User Turn:** Right-aligned, encapsulated in `primary-container` pill-bubble with subtle timestamp and sentiment chip.
- **Model Turn:** Left-aligned, **no bubble background**, featuring Google Gemini 4-pointed sparkle avatar, Google Sans heading, and Markdown typography.

### 7.4 `<Composer>`
- Pill-shaped input container pinned to the bottom with subtle gradient backdrop.
- Auto-expanding textarea up to 160px (~6 lines).
- Voice dictation via `<VoiceRecorder>` with pulsing recording indicator.
- Send button activates and transitions dynamically when input is present.
- Keyboard shortcuts: `Enter` to send, `Shift+Enter` for new line.

### 7.5 `<SuggestionChip>`
- Google Gemini-style action cards on empty sessions.
- Displays an icon, title, and descriptive subtitle with elevation transitions on hover.

### 7.6 `<SummaryCard>`
- Appears at the top of a session once generated.
- Features executive synthesis, copy-to-clipboard action, regeneration trigger, and identified theme badges.

### 7.7 `<ThemeToggle>`
- Smooth toggle between Light, Dark, and System modes.
- Respects `prefers-color-scheme` by default, storing preferences in `localStorage`.
- Available in both compact icon mode and segmented pill button mode.

### 7.8 `<AccountMenu>`
- Google-style user profile dropdown displaying Google avatar / initial, authenticated email, verified UID isolation badge, theme toggle, and sign-out button.
