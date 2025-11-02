
# Artifisi Design Guidelines

## Foundations

### Brand

* Tone: technical, direct, local-first.
* Corner radius: `rounded-2xl` for cards and buttons. Inputs `rounded-xl`.
* Shadows: soft elevation. Default `shadow-sm`. Hover `shadow-md`.
* Borders: subtle `border border-slate-200/60`.

### Typography

* Fonts: Inter for body, Manrope for display.
* Scale:

  * Display: `text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight`
  * H2: `text-2xl md:text-3xl font-semibold`
  * H3: `text-xl font-semibold`
  * Body: `text-slate-600`
  * Small: `text-sm text-slate-500`
  * Links: `text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline`
* Line-length: 60–74ch.

### Color Palette

* App shell: `#f5f7fb` → `bg-slate-50`
* Surfaces: `#ffffff` → `bg-white`
* Primary gradient: `from-[#615bff] to-[#3d32ff]`
* Secondary accent: `#2563eb` → `text-blue-600`
* Text:

  * Titles: `text-slate-900`
  * Body: `text-slate-600`
  * Muted: `text-slate-500`
* States:

  * Success: `emerald-500`
  * Warning: `amber-500`
  * Danger: `rose-500`

### Spacing and Grid

* Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
* Vertical rhythm: section padding `py-16 md:py-20`
* Card padding: `p-5 md:p-6`
* Grid:

  * Two-up: `grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8`
  * Three-up: `grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8`
  * Four-up (icons/values): `grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6`

### Motion

* Use `transition-all duration-200`
* Hover translate: `hover:-translate-y-0.5`
* Reduce motion: honor `motion-reduce` and disable transforms.

### Accessibility

* Color contrast ≥ 4.5:1 for text.
* Focus: `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`
* Hit areas ≥ 44×44 px.
* Images: descriptive `alt`.
* Keyboard support for menus, dialogs, and tabs.

---

## Page Shell

### Header

* Top bar height: 64px.
* Left: logo. Center: nav. Right: auth and CTA.
* Classes: `sticky top-0 z-50 backdrop-blur bg-slate-50/80 border-b`
* Nav link: `px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white`

### Footer

* Light divider. Small type. Social to the left, legal to the right.
* Grid: `grid grid-cols-1 md:grid-cols-3 gap-8`

---

## Core Components

### Button

* Primary (gradient):

  * `inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#615bff] to-[#3d32ff] shadow-sm hover:shadow-md transition`
* Secondary (outline):

  * `rounded-2xl px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50`
* Tertiary (link):

  * `text-sm font-medium text-indigo-600 hover:text-indigo-700`

### Badge / “What’s new”

* `inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 border border-indigo-100`

### Card

* Wrapper: `bg-white rounded-2xl border border-slate-200/60 shadow-sm`
* Content: `p-5 md:p-6`
* Hover: `hover:shadow-md hover:-translate-y-0.5`

### Icon Tile (Core Values)

* Tile: `rounded-2xl border bg-white p-4 md:p-5`
* Icon circle: `size-10 rounded-full bg-slate-100 flex items-center justify-center`

### Media Block

* Image: `rounded-2xl border shadow-sm`
* Caption small and muted.

### CTA Banner

* `rounded-2xl border bg-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4`

### Blog Teaser

* `flex flex-col gap-2 p-4 rounded-2xl border bg-white hover:bg-slate-50`

### Form Controls

* Input: `w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500`
* Textarea same tokens with `min-h-[120px]`
* Help text: `text-xs text-slate-500 mt-1`

---

## Layout Patterns

### Hero

* Two-column layout.
* Left: badge, H1, subcopy, actions.
* Right: monochrome AI artwork.
* Classes:

  * Section: `relative overflow-hidden`
  * Grid: `grid grid-cols-1 md:grid-cols-2 gap-8 items-center`
  * H1: `text-5xl md:text-6xl font-semibold text-slate-900`
  * Subcopy: `mt-4 text-lg text-slate-600`
  * Actions: `mt-6 flex items-center gap-3`

### Values Section

* Four to six tiles in grid.
* Keep each tile ≤ 70 words.

### Services

* Icon + title + one-liner bullets.
* Use three or four-up grid.

### Projects

* Side-by-side cards with image headers.
* Use short CTA links: “Learn more →”, “Test demo →”.

### Blog Row

* Three compact cards. Titles wrap to two lines.

### Contact

* Minimal form or status panel. Use success icon in `emerald-500`.

---

## Page With Sidebar Navigation

Use for docs, policies, long case studies, or “About”.

* Shell: `grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8`
* Sidebar:

  * Container: `lg:sticky lg:top-24 self-start`
  * Nav group title: `text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2`
  * Link: `block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100`
  * Active link: `bg-slate-100 text-slate-900 border border-slate-200`
  * Search (optional): input with `rounded-xl`
* Content:

  * Article width: `prose prose-slate max-w-3xl` with Tailwind Typography or custom:

    * `space-y-6`
    * H2 `mt-10`
    * H3 `mt-8`
    * Code blocks in `bg-slate-900 text-slate-100 rounded-xl p-4`
* Mobile:

  * Collapsible sidebar using `Disclosure` or `Accordion`.
  * Trigger button: `lg:hidden sticky top-16 z-40`

---

## Imagery

* Monochrome, abstract AI art. High contrast shapes. Rounded-2xl corners.
* Use subtle Malaysian motifs when relevant.
* Do not mix with saturated stock photos on the same page.
* Aspect ratios:

  * Hero image: `4:5` or square in a fixed column.
  * Feature banner: `16:9` or `3:1`.

---

## Content Rules

* Headlines: benefit first. ≤ 8 words when possible.
* Subcopy: one or two sentences. Avoid jargon.
* Buttons: verbs. “Get started”, “Learn more”, “Test demo”.
* Blog teasers: 22–32 words.

---

## Breakpoints

* `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`
* Hero stacks at `md`.
* Grids upgrade at `md` and `lg`.
* Sticky sidebar activates at `lg`.

---

## States and Feedback

* Loading: skeletons `animate-pulse bg-slate-100 rounded`
* Empty states: icon + one sentence + primary button inside card.
* Success toast: `bg-emerald-50 text-emerald-700 border-emerald-200`
* Error: `bg-rose-50 text-rose-700 border-rose-200`

---

## Component Inventory (build-first list)

1. Header with gradient CTA.
2. Hero.
3. Section header block: eyebrow + title + subcopy.
4. Card, card-list, media-card.
5. Icon tile.
6. Badge.
7. Buttons (primary, secondary, link).
8. Form controls + inline validation.
9. CTA banner.
10. Footer.
11. Sidebar nav (desktop sticky, mobile drawer).

---

## Code Snippets

### Container and Section

```html
<section class="bg-slate-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
    <!-- content -->
  </div>
</section>
```

### Primary Gradient Button

```html
<a class="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#615bff] to-[#3d32ff] shadow-sm hover:shadow-md transition">
  Request a demo
</a>
```

### Card

```html
<div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition">
  <!-- body -->
</div>
```

### Sidebar Layout

```html
<div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
  <aside class="lg:sticky lg:top-24 self-start space-y-2">
    <a class="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">Intro</a>
    <a class="block px-3 py-2 rounded-lg bg-slate-100 text-slate-900 border border-slate-200">Getting Started</a>
  </aside>
  <article class="max-w-3xl mx-auto space-y-6">
    <!-- headings, paragraphs -->
  </article>
</div>
```

---

## QA Checklist

* [ ] Uses container and section spacing tokens.
* [ ] Titles in Manrope, body in Inter.
* [ ] Primary actions use gradient button.
* [ ] Cards use `rounded-2xl`, soft border, soft shadow.
* [ ] Images rounded with borders and alt text.
* [ ] Contrast and focus states pass checks.
* [ ] Layouts responsive at `md` and `lg`.
* [ ] Motion reduced on `prefers-reduced-motion`.

This guideline matches the current site and scales to new pages without drift.
