# Firefox userChrome customization

This folder is the `chrome/` directory of a Firefox profile (`8h6lxwb8.default-release`). It restyles the browser UI (not web pages) via `userChrome.css`, backed by the fx-autoconfig script loader for the few things CSS can't do.

Firefox version: **152.0.4**. Full Firefox source (dev 153, close enough for selector/API lookup) is checked out at `D:\My OpenSource\ff-development\ff-src-part-master\firefox-src-part`. When a selector, DOM structure, or internal API is uncertain, grep that tree instead of guessing.

## Primary focus: CSS

`userChrome.css` is the main file and where almost all work happens. It is a **user sheet**, so it loses the cascade to Firefox's built-in author styles unless declarations use `!important` — treat `!important` as mandatory on nearly every property here.

### Section map of userChrome.css
- **Context menus** — hides unwanted items in `#tabContextMenu`, `#contentAreaContextMenu`, `#placesContext` with `display: none`.
- **Bookmark toolbar** — `#PersonalToolbar`, `#PlacesToolbarItems` (pill outline), and the per-item hover-reveal effect (icon hidden, slides in on hover).
- **Top part / navbar / tabs** — `#navigator-toolbox`/`#nav-bar` backgrounds, `#tabbrowser-arrowscrollbox` container, tab backgrounds (selected vs unselected), hides Firefox View button.
- **Menu bar** — `#menubar-items`, `#main-menubar`.
- **URL bar** — `#urlbar`, `.urlbar-background`, the breakout suggestions popup, `#identity-box`, and manual `#urlbar-container` width.
- **Pinned extensions group background** — the overlapping `::before` band behind nav-bar extension buttons.
- **Top part layout shifter** — a 2x2 `#navigator-toolbox` grid experiment, currently commented out.

### Conventions and hard-won gotchas
- **Bookmark toolbar: use the child combinator.** Target `#PlacesToolbarItems > .bookmark-item`, never a descendant space. Folder popup entries are `menuitem.bookmark-item` nested in a `<menupopup>` and are descendants of `#PlacesToolbarItems`; a space selector bleeds into them, `>` hits only the real toolbar buttons.
- **Extension buttons.** A nav-bar-placed extension is `.toolbaritem-combined-buttons.unified-extensions-item.chromeclass-toolbar-additional`; `.chromeclass-toolbar-additional` is what distinguishes it from the same item inside the unified-extensions panel. Widget/element IDs are the extension ID with non-alphanumerics replaced by `_` (e.g. `uBlock0@raymondhill.net` becomes `ublock0_raymondhill_net`), suffixed `-browser-action` for the button and `#<sanitized>-menuitem-...` for context-menu entries.
- **Group background trick.** To put one continuous background behind a run of separate buttons, give each a wider absolutely-positioned `::before` (currently `175%`) that overlaps its neighbours into a single band. Needs `z-index: 0` on the item (new stacking context) and `z-index: -1` on the pseudo so it sits above the toolbar background, not behind it.
- **CSS nesting with `&` is supported** in this Firefox and used throughout (e.g. tab backgrounds, breakout popup).
- **Never write `-webkit-backdrop-filter`.** Standard `backdrop-filter` only — some Gecko builds mishandle the prefixed form.

### Design language
Dark theme. Base backgrounds `#131316` / `#080808`; accent blue `#26c3fc` / `hsl(203, 100%, 50%)`; pill radius `999px`; thin inset `box-shadow` used as outlines instead of borders.

## Loading and testing
- **CSS hotloads.** `JS/refresh.uc.mjs` re-registers `userChrome.css` every second, so saving the file applies changes with no restart. This is the normal edit loop.
- **JS does NOT hotload.** `.uc.js` scripts only run at startup; after editing one, fully restart via the Tools/hamburger menu → userScripts → "Restart and clear startup cache".
- **Inspecting the chrome.** Open the Browser Toolbox (Ctrl+Alt+Shift+I); a remote debugger server is also enabled on `127.0.0.1:6000`. Use its element picker to read the real classes/attributes of a UI node, or paste JS into its console for quick tests. Claude cannot see the browser, so rely on the user to pick nodes / report results.

## userChrome.js (secondary, kept minimal on purpose)
- Loader is **fx-autoconfig** (MrOtherGuy) in `utils/`. Scripts live in `JS/`; `.uc.js` are injected per browser window with `window`, `document`, `gBrowser`, `Cc/Ci/Cu`, `ChromeUtils`, and a lazy `UC_API` in scope.
- **Module import paths changed in FF 152+**: browser modules load from `moz-src:///browser/components/...`, not the old `resource:///modules/...`. `CustomizableUI` is `moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs`.
- `JS/test.uc.js.txt` is a shelved experiment (a pinned-extensions panel via a custom `CustomizableUI` `TYPE_PANEL` area). Renamed to `.txt` to disable it. It worked but was judged too fragile against Firefox updates — the standing preference is to solve things in CSS and reserve userChrome.js for what CSS genuinely can't reach.
- `JS/bookmark-on-hover.uc.txt` is a disabled `.uc.mjs`, kept as a template for future window-scoped scripts. Its hover effect on `#navigator-toolbox` now lives in CSS (`userChrome.css`, the `.chrome-block` rules), so the `.txt` is not loaded — it just preserves the reference skeleton: the fx-autoconfig `// ==UserScript==` header (no `@onlyonce`, so per-window at `DOMContentLoaded` with `document` in scope) plus the `getElementById` + `mouseenter`/`mouseleave` inline-style pattern.

## Additional sheets
`resources/` and `CSS/` hold author- and agent-level sheets loaded by the fx-autoconfig scripts (`JS/userChrome_au_css.uc.js`, `JS/userChrome_ag_css.sys.mjs`), for rules that need a higher cascade origin than the user sheet. `userChrome.css` remains the default place for changes.
