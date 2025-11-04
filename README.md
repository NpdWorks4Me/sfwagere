# Lostchild — Next.js Migration (App Router + TypeScript)

This is a minimal Next.js scaffold to migrate the static site into a componentized, state-driven app with SSG/SSR options. No CMS is required.

## Stack
- Next.js 14 (App Router) + TypeScript
- React 18
- Optional GSAP via dynamic import (client components)
- Static export mode initially (CDN deploy), with an easy path to SSR later

## Getting started

```bash
cd next
npm install
npm run dev
```

Open http://localhost:3000

## Build and deploy

Static export (compatible with your current host/CDN):

```bash
npm run build
# Upload the contents of out/ to your host
```

Upgrade to SSR later (for dynamic forum, etc.):
- Remove `output: 'export'` from `next.config.mjs`.
- Deploy with a Node runtime (Vercel/Render/Hostinger Node plan).

## Where things live
- `src/app/layout.tsx` – global layout + nav
- `src/app/page.tsx` – homepage
- `src/app/{blog,forum,faq,join,moderator,admin-setup}/page.tsx` – core pages
- `src/app/posts/[slug]/page.tsx` – placeholder for individual posts (SSG-ready)
- `src/components/Navigation.tsx` – nav + A+ text size button
- `src/hooks/useTextResize.ts` – site-wide text size state with persistence
- `src/components/Logo.tsx` – GSAP-enhanced logo block (client-only)
- `src/styles/globals.css` – fonts, base styles, nav, and text-size CSS rules

No CMS: Content can remain static now, or you can adopt MD/MDX later if desired.

## Next steps
- Port your existing page content and styles into the pages/components above
- Bring over the homepage title styles and glitch gradient
- For blog posts, use static content (HTML/MDX) and pre-render via SSG
- Add forum shell (client interactions), upgrade to SSR if needed later

## Environment
No env vars are required for static export.

