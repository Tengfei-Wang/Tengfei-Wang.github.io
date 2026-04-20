# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tengfei Wang's academic personal website (`Tengfei-Wang.github.io`), a **static site hosted on GitHub Pages** with no build step. The main page was refactored from the Jon Barron `<table>` template to a modern Tailwind CDN + card grid layout.

## Files

- `index.html` — main page: nav, hero, news, research highlights, open-source projects, publications, services, awards
- `stylesheet.css` — design tokens (CSS variables for light/dark), `.pcard`, `.thumb` hover pattern, `.badge`, `.topic-tab`, `.year-divider`
- `script.js` — theme toggle (persists to `localStorage`), publication topic filter, news show-all toggle
- `index.old.html` — pre-refactor backup, kept for reference
- `images/` — all media (thumbnails + hover videos)
- `Dual-Camera-SR/`, `EII/`, `HFGI/`, `Implicit-Internal-Video-Inpainting/`, `PITI/`, `Restorable-Image-Operator/` — individual sub-project pages (Bootstrap-based, **not** refactored); linked from main page via relative paths

## Tech stack

**Tailwind CDN** (`https://cdn.tailwindcss.com`) runs in the browser — no build needed. Dark mode is class-based (`darkMode: 'class'`), toggled by adding/removing `.dark` on `<html>`.

## Key patterns

**Thumbnail** — three variants, pick by what media you have:

1. **Default (static image + hover-reveal video)** — use when you have both a poster image and a demo video:
   ```html
   <div class="thumb">
     <img src="images/foo.jpg" alt="...">
     <video autoplay muted loop playsinline><source src="images/foo.mp4" type="video/mp4"></video>
   </div>
   ```
   The `<img>` shows by default; on hover, `.thumb:hover > video { opacity: 1 }` swaps to the video.

2. **`.video-only`** — use when you only have a video (no static poster):
   ```html
   <div class="thumb video-only">
     <video autoplay muted loop playsinline><source src="images/foo.mp4" type="video/mp4"></video>
   </div>
   ```
   The video plays always. A blue→purple gradient shows through while the video loads or if autoplay is blocked, so there's never a white/broken thumbnail.

3. **`.placeholder`** — use as a temporary stand-in when the media file is still missing:
   ```html
   <div class="thumb placeholder"><span>PREPRINT</span></div>
   ```
   Dark slate gradient with centered label.

**Never** use `<img src="foo.mp4#t=0.5">` — browsers cannot render video files via `<img>`, you'll get a broken-image icon.

**Paper card** — every publication is an `<article class="pcard" data-topics="...">`. `data-topics` is a space-separated list drawn from `{world-models, 3d, image-video}`. Cards can belong to multiple topics; the filter tabs (`<button class="topic-tab" data-topic-filter="3d">`) toggle visibility via `script.js`. Cards with empty `data-topics=""` (e.g., the PhD thesis) appear under **All** but not under any topic.

**Year divider** — `<div class="year-divider" data-year-divider>2025</div>` between year groups. `script.js` hides dividers that have no visible cards after filtering.

**Badges** — inline spans after the title for awards: `.badge-oral`, `.badge-highlight`, `.badge-award`. Keep them short (e.g., `Oral`, `Highlight · 2.5%`, `Top-5 Influential`).

**Author notation** — `*` equal contribution, `^` intern, `†` corresponding author. Tengfei Wang's name is wrapped in `<strong>...</strong>` inside `<p class="pauthors">`, which the CSS styles with full text color to stand out against the muted author line.

## Adding a new publication

1. Copy an existing `<article class="pcard" ...>` block in the relevant year section.
2. Set `data-topics` with one or more of `world-models`, `3d`, `image-video`.
3. Add thumbnail (160×160-ish) and optional hover `.mp4` to `images/`.
4. Fill in title, authors (wrap own name in `<strong>`), venue + year, link pills, one-line summary.
5. If the year does not yet have a divider, add `<div class="year-divider" data-year-divider>YYYY</div>` above the first entry of that year.
6. To add to News, prepend an `<li class="news-item">` (or `<li class="news-item hidden-extra">` if it should be hidden behind the "Show all" toggle).

## Deployment

Push to the default branch — GitHub Pages serves automatically. Local preview: open `index.html` directly in a browser; everything is static.

## Known quirks

- `images/ttc.mp4` is missing from `images/`. The Pathwise TTC paper card currently uses a `.placeholder` stand-in. When the video arrives, replace the `<div class="thumb placeholder">...</div>` block at the TTC card with the standard `.video-only` pattern.
- Sub-project directories (`HFGI/`, `PITI/`, etc.) still use the old Bootstrap templates and are intentionally not refactored — they are linked from the main page as `project` pills. Touch only if explicitly asked.
