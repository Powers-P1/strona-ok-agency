# OK Agency — instructions for contributors and coding agents

## Workspace boundary

- Work only inside `C:\Wizytówka OK Agency`.
- Do not modify the empty Codex workspace in OneDrive or any unrelated project.
- Preserve generated design concepts in `docs/concepts/` and verified screenshots in `docs/screenshots/`.

## Authoritative business facts

- Project: Strona OK Agency
- Brand: OK Agency
- Business type: agencja marketingowa
- Main offer: usługi marketingu online (digitalowego) oraz tworzenie stron internetowych
- Audience: małe firmy i MŚP
- Services derived directly from the offer: Marketing online; Strony internetowe
- Language: `pl-PL`
- Contact email: not supplied; treat as `NONE`
- Phone, location and social media: not supplied; treat as `NONE`
- Primary custom domain: `https://okagency.pl`
- Primary CTA chosen for the no-contact state: `Poznaj zakres współpracy`, linking to `#uslugi`

Do not invent clients, awards, testimonials, certifications, case studies, years of experience, performance statistics, addresses, social accounts, partnerships, phone numbers, email addresses or unverifiable claims. Do not add a fake contact form.

## Architecture

- Astro 7 with TypeScript and static generation.
- Modern CSS with project-owned tokens; no Tailwind or component library.
- Minimal client-side TypeScript only for the responsive navigation and small progressive enhancements.
- Local npm font packages: Instrument Sans and Instrument Serif.
- Static GitHub Pages deployment at the domain root `/`.

## Selected design direction

Use the “Editorial Signal” direction documented in `docs/design-decisions.md` and pictured in `docs/concepts/`.

- True white page, near-black ink, vivid cobalt and one acid-lime highlight.
- Strong editorial typography, open layout and thin signal-line geometry.
- A large code-native `OK` hero motif is the signature visual.
- Services are horizontal editorial rows, not cards.
- Process is a connected rail, not a grid of panels.
- Mostly square corners and minimal shadow.
- The dark closing section may use Instrument Serif for one deliberate editorial contrast.
- Do not add hero eyebrows, pills, badges, fake metrics, default card grids, glassmorphism, decorative blobs or stock-looking imagery.

## Coding conventions

- Keep components focused and semantic; keep `src/pages/index.astro` as composition glue.
- Use landmarks and one logical heading hierarchy.
- Prefer reusable components for navigation, arrows, service rows, the signal mark, process rail and footer.
- Keep all interface text code-native.
- Use design tokens from `src/styles/tokens.css`; avoid one-off colors and spacing values.
- Keep focus states clearly visible and preserve keyboard operation.
- Respect `prefers-reduced-motion`.
- Do not add trackers, analytics, cookies or remote assets.
- Do not leave TODOs, sample files, placeholder copy or dead code.

## Required checks

Run before committing:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test:e2e
npm run build
```

Browser QA must cover 1440×900, 1024×768 and 390×844, with desktop and mobile screenshots in `docs/screenshots/`. Check the first viewport, heading wraps, navigation, CTA targets, mobile menu, focus states, console, overflow, links and reduced motion.

## Deployment

- Primary branch: `main`.
- Repository: public GitHub repository `Powers-P1/strona-ok-agency` unless the name is no longer available.
- CI: `.github/workflows/ci.yml` with read-only permissions.
- Pages: `.github/workflows/deploy-pages.yml` with minimal Pages/id-token permissions.
- Build output: `dist/`.
- After deployment, verify the HTTPS URL in a browser and update README, canonical URL, Open Graph URL, sitemap and repository homepage.

## Visual acceptance

The implementation must be compared directly to the generated concept and pass agency-signoff review. Preserve the first viewport composition, content order, exact above-the-fold copy, palette, type hierarchy, line motif, open container model and section rhythm. Record any unavoidable deviation in `docs/design-decisions.md`; otherwise fix visible drift before handoff.
