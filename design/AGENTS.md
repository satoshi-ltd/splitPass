# Design kit — agent instructions

`design/` is SplitPass's visual reference and a self-contained module: its generator, its sources, its outputs and this
contract live here, and every project of the creator (@soyjavi) uses the same layout. It is a design kit, not a
document: `README.md`, `SPEC.md` and `ROADMAP.md` own the rest. The SPEC's design-system section says what the product
looks like; this file says how the kit is kept.

## Layout

```
design/
  AGENTS.md, CLAUDE.md          this contract; CLAUDE.md is exactly `@AGENTS.md`
  build.mjs                     the single generator entry point
  src/pages.mjs                 ROADMAP parser, board checks, shared header, Proposals page, favicon copy
  src/tokens.mjs                mobile-tokens.css, extension-tokens.css, mobile-icons.css
  src/proposals.mjs             every proposal board, in this one file
  src/draw.mjs                  drawing helpers shared by boards and views
  src/paths.mjs                 ROOT, DESIGN and read()
  index.html, browser-extension.html, mobile.html     hand-drawn views, header and favicon stamped
  proposals.html                generated from src/proposals.mjs
  kit.css, kit.js, mobile.css   the kit's own chrome and phone frames, hand-written
  mobile-tokens.css, extension-tokens.css, mobile-icons.css   generated, never edited
  favicon.png                   copy of assets/favicon.png made by the generator
```

## Commands

- `yarn design` (`node design/build.mjs`) regenerates everything under `design/`. Run it after any visible change.
- `node design/build.mjs --check` writes nothing and exits 1 naming each stale file.
- `node design/build.mjs --validate [ROADMAP.md]` parses a roadmap and checks it against the boards; it is how the test
  proves the parser.
- `scripts/__tests__/design-kit.test.js` (Jest) is where the suite lives and calls `build.mjs`; `scripts/` holds no
  design file. `yarn test` fails until `design/` matches the code.

## Tabs

`System` (brand, colour, type, spacing, primitives, components), `Browser extension` (popup and in-page panel drawn
with the real extension CSS), `Mobile` (every app screen), `Proposals`. A new interface adds its tab before Proposals.
There is no Open work page and no page that mirrors ROADMAP. The views show what ships; Proposals shows what is
proposed. The generator stamps the shared header, the package version banner (`v<version> · production`, read from
`package.json`) and the favicon into every page, so the nav is the same on all of them.

## Proposals

Proposals holds purely visual ideas that are not shipped, as boards. A board has an ID, an area, a title, why, a Now
drawing, a Proposed drawing and an accept, all in `src/proposals.mjs`; the drawings use the kit's own classes through
`src/draw.mjs`. A board is the whole proposal. A purely visual idea is never a ROADMAP Proposed task, and a task with
any behaviour, data or infrastructure component lives only in ROADMAP and gets no board.

Lifecycle:

- Idea: the board alone.
- Approved: the creator queues one ROADMAP line of type `ui` with the same ID and accept "the board".
- Shipped: the board and the line are deleted together, the views are regenerated so they show the new design, and the
  changelog and SPEC record it.

Split rule: when a task mixes logic and a screen, the screen is the board `UI-<TASKID>` and the logic stays under its
own ID with the line "the interface follows board UI-<TASKID>" in its accept. A board ID never equals a non-`ui` task
ID; the parser refuses it.

## Views in sync

A board left standing after its change shipped, or a view that still draws the old look, fails the adversarial review
before the commit. After a visible change to a token, a component, a screen or an extension view, update the affected
view or board and regenerate.

## Favicon

Every page carries `<link rel="icon" href="favicon.png">`. `design/favicon.png` is a copy of `assets/favicon.png`, made
by the generator, so the kit keeps its icon when `design/` is opened or published alone. Never edit the copy.

## What the test enforces

- Generated files match: tokens against `src/theme` and `browser-extension/theme.css`, pages against the boards,
  ROADMAP.md, `package.json` and the shared header.
- The nav of every page lists exactly the tabs, ending in Proposals; there is no Open work page; every page has both
  theme buttons and one current tab; links and stylesheet `url()`s point at existing files.
- Every class on a page is defined by a stylesheet it links; kit styles use only defined variables and no hex colour;
  pages carry no inline style or script; hand-written kit sources carry no comments.
- Every palette colour appears on the System page; the theme switch reads `data-theme` and guards storage.
- Boards: every `ui` task has a board; no board is also a non-`ui` task; no `ui` task sits in Proposed; the board
  count equals the raw markers; each board draws Now and Accept; the page has no ROADMAP mirror.
- The module: `AGENTS.md` exists, the generator files are in place and `scripts/` holds no design file. `CLAUDE.md`, here and at the root, is a local pointer listed in `.gitignore` and never committed; tests read it only where it exists.

## Particular to SplitPass

- Boards of the extension draw it with the real extension CSS (`../browser-extension/*.css`) plus the generated
  `extension-tokens.css`; `src/draw.mjs` lifts figures out of `browser-extension.html`, so a renamed figure fails the
  build.
- Copy in boards comes from the `EN` dictionary in `src/modules/l10n.dictionaries.js`, never retyped.
- Tokens come from `src/theme` and the extension's `theme.css`; icons come from the MaterialCommunityIcons font in
  `node_modules`, so `yarn install` precedes a build.
- The banner version is `package.json`'s; `node scripts/bump-version.mjs` runs the generator after a bump.
- Colours in kit styles come from the generated variables, never literals; the UI is square, flat and set in Doto.
