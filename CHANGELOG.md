# Changelog


## v2.8.3

[compare changes](https://github.com/nuxt/content/compare/v2.8.2...v2.8.3)

### 🚀 Enhancements

- Update types ([#2156](https://github.com/nuxt/content/pull/2156))
- Docs rework with Nuxt UI ([#2310](https://github.com/nuxt/content/pull/2310))
- Add binding for external data ([#2296](https://github.com/nuxt/content/pull/2296))

### 🩹 Fixes

- **findSurround:** Use filtered contents to find surround ([#2291](https://github.com/nuxt/content/pull/2291))
- Remove deletion of `prerenderedAt` key ([#2280](https://github.com/nuxt/content/pull/2280))
- **module:** Remove deprecated `resolveModule` ([#2298](https://github.com/nuxt/content/pull/2298))
- **surround:** Respect `only` and `without` filters ([#2311](https://github.com/nuxt/content/pull/2311))
- Add missing dependencies ([#2313](https://github.com/nuxt/content/pull/2313))
- **tailwindcss:** Tailwindcss HMR support for content files ([#2315](https://github.com/nuxt/content/pull/2315))
- Fetch content chunked ([#2321](https://github.com/nuxt/content/pull/2321))
- **storage:** Prevent duplicate parsing ([#2326](https://github.com/nuxt/content/pull/2326))
- Add regex to match ContentSlot in Pug templates ([#2344](https://github.com/nuxt/content/pull/2344))

### 📖 Documentation

- Remove `count` helper alert ([faff26bc](https://github.com/nuxt/content/commit/faff26bc))
- Update badge position ([0b85e881](https://github.com/nuxt/content/commit/0b85e881))
- Fix links ([#2267](https://github.com/nuxt/content/pull/2267))
- Add warning about prettier compatibility ([#2325](https://github.com/nuxt/content/pull/2325))
- Add link to image ([58e13b41](https://github.com/nuxt/content/commit/58e13b41))
- Update .env.example ([5a483922](https://github.com/nuxt/content/commit/5a483922))
- Fix page overflow ([#2332](https://github.com/nuxt/content/pull/2332))

### 🏡 Chore

- Upgrade @nuxtjs/mdc ([#2308](https://github.com/nuxt/content/pull/2308))
- Upgrade `@nuxtjs/mdc` ([e3ffac95](https://github.com/nuxt/content/commit/e3ffac95))

### ❤️ Contributors

- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))
- Jbmolle <jbmolle@hotmail.com>
- Nobkd 
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Florent Delerue <florentdelerue@hotmail.com>
- Farnabaz <farnabaz@gmail.com>
- Patryk Padus <patryk@webo.agency>
- Estéban <e.soubiran25@gmail.com>
- Alexander Lichter ([@manniL](http://github.com/manniL))

## v2.8.2

[compare changes](https://github.com/nuxt/content/compare/v2.8.1...v2.8.2)

### 🩹 Fixes

- **query:** Prevent `undefined` error ([b680b47c](https://github.com/nuxt/content/commit/b680b47c))
- **navigation:** Prevent client-db conflict ([fd8e3b82](https://github.com/nuxt/content/commit/fd8e3b82))
- **serverQueryContent:** Do not expose advanced query typing ([09e37c19](https://github.com/nuxt/content/commit/09e37c19))
- **document-driven:** Invalid composable import ([e56f71dc](https://github.com/nuxt/content/commit/e56f71dc))
- **ContentList:** Component slot typechecking ([#2277](https://github.com/nuxt/content/pull/2277))

### ❤️ Contributors

- Cédric Exbrayat 
- Farnabaz <farnabaz@gmail.com>

## v2.8.1

[compare changes](https://github.com/nuxt/content/compare/v2.8.0...v2.8.1)

### 🩹 Fixes

- Cannot read properties of undefined ([11c3b09f](https://github.com/nuxt/content/commit/11c3b09f))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>

## v2.8.0

[compare changes](https://github.com/nuxt/content/compare/v2.7.2...v2.8.0)

### 🚀 Enhancements

- Add count method ([#1924](https://github.com/nuxt/content/pull/1924))
- **nuxt-mdc:** Extract markdown parser ([#2187](https://github.com/nuxt/content/pull/2187))
- Advanced query schema ([#2213](https://github.com/nuxt/content/pull/2213))
- Allow to disable content head ([#2142](https://github.com/nuxt/content/pull/2142))

### 🩹 Fixes

- Markdown render compatiblity ([d81a08a2](https://github.com/nuxt/content/commit/d81a08a2))
- **slot:** Rename ContentSlot to MDCSlot in render function ([efc60481](https://github.com/nuxt/content/commit/efc60481))
- **module:** Slot transform sourcemap ([7558cf0d](https://github.com/nuxt/content/commit/7558cf0d))
- **ProseImg:** Prevent conflict between `src` and baseURL ([#2242](https://github.com/nuxt/content/pull/2242))
- Custom drivers failed on build ([#2193](https://github.com/nuxt/content/pull/2193))
- **ContentRenderer:** Render contents only with excerpt ([#2246](https://github.com/nuxt/content/pull/2246))
- **content-slot:** Better slot name regex ([329cf3bc](https://github.com/nuxt/content/commit/329cf3bc))

### 📖 Documentation

- Pre-render pages ([#2196](https://github.com/nuxt/content/pull/2196))
- **v1:** Link button wrapping for small screens ([#2199](https://github.com/nuxt/content/pull/2199))
- Add count method ([#2200](https://github.com/nuxt/content/pull/2200))
- Add edge alert ([c582469c](https://github.com/nuxt/content/commit/c582469c))
- Update README.md ([#2226](https://github.com/nuxt/content/pull/2226))
- **mdc:** Fix `{attribute}` examples ([#2228](https://github.com/nuxt/content/pull/2228))
- Add warning for `<NuxtPage/>` existence in `app.vue` ([#2244](https://github.com/nuxt/content/pull/2244))
- `<ContentDoc>` slot example ([0bfc275d](https://github.com/nuxt/content/commit/0bfc275d))
- Fix prose links ([aa61d9fd](https://github.com/nuxt/content/commit/aa61d9fd))
- Update prose source links ([9720a333](https://github.com/nuxt/content/commit/9720a333))

### 🏡 Chore

- Upgrade `nuxt-mdc` ([1fef2137](https://github.com/nuxt/content/commit/1fef2137))
- Update social card ([a7e308ae](https://github.com/nuxt/content/commit/a7e308ae))
- Upgrade deps ([cf3e927c](https://github.com/nuxt/content/commit/cf3e927c))
- Upgrade `nuxt-mdc` ([3db06b23](https://github.com/nuxt/content/commit/3db06b23))
- Update to micromark v4 ([#2253](https://github.com/nuxt/content/pull/2253))
- Use `@nuxtjs/mdc` ([ba4d0118](https://github.com/nuxt/content/commit/ba4d0118))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>
- Cédric Exbrayat 
- Yarrow 
- Mathieu DARTIGUES ([@mdartic](http://github.com/mdartic))
- Estéban <e.soubiran25@gmail.com>
- Nobkd 
- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))

## v2.7.2

[compare changes](https://github.com/nuxt/content/compare/v2.7.1...v2.7.2)

### 🩹 Fixes

- Remark plugins deprecated warning ([#2188](https://github.com/nuxt/content/pull/2188))
- Allow `]` in filename code block ([#2169](https://github.com/nuxt/content/pull/2169))

### 📖 Documentation

- Update slots example for the `content-query` component ([#2190](https://github.com/nuxt/content/pull/2190))

### ❤️  Contributors

- Estéban <e.soubiran25@gmail.com>
- Farnabaz <farnabaz@gmail.com>

## v2.7.1

[compare changes](https://github.com/nuxt/content/compare/v2.7.0...v2.7.1)

### 🚀 Enhancements

- Add studio banner ([#2165](https://github.com/nuxt/content/pull/2165))

### 🔥 Performance

- Keep document-drive state in `shallowRef` and prefetch pages/components ([#2118](https://github.com/nuxt/content/pull/2118))

### 🩹 Fixes

- Replace crlf line endings with lf ([#2120](https://github.com/nuxt/content/pull/2120))
- Use `consola.withTag` instead of `kit.useLogger` ([#2140](https://github.com/nuxt/content/pull/2140))
- **module:** Add `yml` / `json` extensions to tailwind content files ([#2147](https://github.com/nuxt/content/pull/2147))
- Remove unneeded await ([#2175](https://github.com/nuxt/content/pull/2175))
- Use unstorage types ([#2136](https://github.com/nuxt/content/pull/2136))
- Uppercase in path ([#2170](https://github.com/nuxt/content/pull/2170))
- **markdown:** Allow plugin with array type option ([#2114](https://github.com/nuxt/content/pull/2114))
- Allow empty string in `$contains` ([#2179](https://github.com/nuxt/content/pull/2179))
- Remove favicon handling ([#2157](https://github.com/nuxt/content/pull/2157))

### 📖 Documentation

- Reorder document-driven page slots components description ([#2108](https://github.com/nuxt/content/pull/2108))
- Add utm_source in banner link ([f9a0113e](https://github.com/nuxt/content/commit/f9a0113e))
- Use lowercase typings, use ` ([` instead of `or` in type declaration (#2167)](https://github.com/nuxt/content/commit/` instead of `or` in type declaration (#2167)))
- Add warning about windows development ([#2180](https://github.com/nuxt/content/pull/2180))

### ❤️  Contributors

- Estéban <e.soubiran25@gmail.com>
- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))
- Jianqi Pan ([@Jannchie](http://github.com/Jannchie))
- Nobkd 
- 12a90c4b ([@nobkd](http://github.com/nobkd))
- Daniel Roe <daniel@roe.dev>
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Florent Delerue <florentdelerue@hotmail.com>
- Benjamin Canac ([@benjamincanac](http://github.com/benjamincanac))
- Farnabaz <farnabaz@gmail.com>
- AnaelBonnafous

## v2.7.0

[compare changes](https://github.com/nuxt/content/compare/v2.6.0...v2.7.0)


### 🚀 Enhancements

  - **shiki:** Support italic, bold and underline styles ([#2079](https://github.com/nuxt/content/pull/2079))
  - **config:** Update ignores to advanced pattern ([#2035](https://github.com/nuxt/content/pull/2035))

### 🩹 Fixes

  - **link:** Remove hash before checking if ending by '.md' ([#2033](https://github.com/nuxt/content/pull/2033))
  - **markdown:** Prevent script execution ([#2040](https://github.com/nuxt/content/pull/2040))
  - **code-block:** Pass language as class name ([#2064](https://github.com/nuxt/content/pull/2064))
  - **tailwind-integration:** Allow content as object ([#2060](https://github.com/nuxt/content/pull/2060))
  - **code-block:** Meta property ([#2067](https://github.com/nuxt/content/pull/2067))
  - **markdown:** Respect `_draft` key in frontmatter ([#2077](https://github.com/nuxt/content/pull/2077))

### 📖 Documentation

  - Guide for adding custom grammars for syntax highlighting ([7da9b286](https://github.com/nuxt/content/commit/7da9b286))
  - Add example of additional sorting options for queryContent ([#2042](https://github.com/nuxt/content/pull/2042))
  - Explain useasyncdata wrapping ([#2054](https://github.com/nuxt/content/pull/2054))
  - Update url ([#2055](https://github.com/nuxt/content/pull/2055))
  - Add latest to nuxi command ([2939b793](https://github.com/nuxt/content/commit/2939b793))
  - Update `Content Wind` live demo url ([#2080](https://github.com/nuxt/content/pull/2080))
  - Update links ([#2085](https://github.com/nuxt/content/pull/2085))
  - Remove outdated description ([#2098](https://github.com/nuxt/content/pull/2098))

### 🏡 Chore

  - Use caret dependency for kit ([#2044](https://github.com/nuxt/content/pull/2044))

### ❤️  Contributors

- TomatoGuy0502 <H34066131@gs.ncku.edu.tw>
- Dave Stewart <dave@davestewart.co.uk>
- Kricsleo 
- Nobkd 
- Mukund Shah 
- Farnabaz <farnabaz@gmail.com>
- Inesh Bose 
- Stefanprobst <stefanprobst@posteo.de>
- Sébastien Chopin <seb@nuxtlabs.com>
- Clément Ollivier ([@clemcode](http://github.com/clemcode))
- YannC 
- James Tyner 
- Ashour <ashour.mohammad@gmail.com>
- Daniel Roe <daniel@roe.dev>

## v2.6.0

[compare changes](https://github.com/nuxt/content/compare/v2.5.2...v2.6.0)


### 🚀 Enhancements

  - **CodeBlock:** Add line number attribute to code block lines ([#1973](https://github.com/nuxt/content/pull/1973))
  - More flexible ignores configuration ([#2022](https://github.com/nuxt/content/pull/2022))

### 🩹 Fixes

  - **type:** Content locale ([#1965](https://github.com/nuxt/content/pull/1965))
  - **markdown:** Html ids in markdown headings should not start with a digit ([#1961](https://github.com/nuxt/content/pull/1961))
  - **useContentHead:** Set `property` instead of `name` for OG metadata ([#1981](https://github.com/nuxt/content/pull/1981))
  - Access config from `public` key ([#2005](https://github.com/nuxt/content/pull/2005))
  - **ContentRendererMarkdown:** Prevent `undefiend` error on component resolve ([#2021](https://github.com/nuxt/content/pull/2021))
  - **code-block:** Use span with `\n`  instead of div for lines ([#2008](https://github.com/nuxt/content/pull/2008))
  - **preview:** Use `sessionStorage` to keep token ([#2020](https://github.com/nuxt/content/pull/2020))
  - **shiki:** Add `\n` to empty lines ([46f3d79f](https://github.com/nuxt/content/commit/46f3d79f))
  - **markdown-renderer:** Document reactivity ([e46309fe](https://github.com/nuxt/content/commit/e46309fe))
  - **query:** Prevent adding duplicate conditions to query ([#2027](https://github.com/nuxt/content/pull/2027))
  - **document-driven:** Ensure layout is set on hydration ([#2032](https://github.com/nuxt/content/pull/2032))

### 📖 Documentation

  - Add Nuxt Studio link ([bc329334](https://github.com/nuxt/content/commit/bc329334))
  - Fix link to nitro plugins ([#1969](https://github.com/nuxt/content/pull/1969))
  - Format docs & update links & fix mistakes ([#1982](https://github.com/nuxt/content/pull/1982))
  - Fix template syntax ([9d8478de](https://github.com/nuxt/content/commit/9d8478de))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Dave Stewart <info@davestewart.co.uk>
- Nobkd 
- Daniel Roe <daniel@roe.dev>
- Thomas Lamant 
- Electrolinux <electrolinux@gmail.com>
- Artyom 
- Sébastien Chopin <seb@nuxtjs.com>

## v2.5.2

[compare changes](https://github.com/nuxt/content/compare/v2.5.1...v2.5.2)


### 🩹 Fixes

  - Revert navDirFromPath behavior ([049c356d](https://github.com/nuxt/content/commit/049c356d))

### ❤️  Contributors

- Sébastien Chopin ([@Atinux](http://github.com/Atinux))

## v2.5.1

[compare changes](https://github.com/nuxt/content/compare/v2.5.0...v2.5.1)


### 🩹 Fixes

  - **client-db:** Ensure `ignoreSources` is an array ([45b44a69](https://github.com/nuxt/content/commit/45b44a69))
  - **document-driven:** Page layout detection ([#1955](https://github.com/nuxt/content/pull/1955))

### 🏡 Chore

  - **release:** Release v2.5.0 ([2bce04c8](https://github.com/nuxt/content/commit/2bce04c8))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>

## v2.5.0

[compare changes](https://github.com/nuxt/content/compare/v2.4.3...v2.5.0)


### 🚀 Enhancements

  - Introduce `component-resolver` transformer ([#1907](https://github.com/nuxt/content/pull/1907))
  - **client-db:** Allow possibility to ignore some sources from client storage ([#1917](https://github.com/nuxt/content/pull/1917))

### 🩹 Fixes

  - Add anchorLinks type ([#1894](https://github.com/nuxt/content/pull/1894))
  - **headings:** Don't generate link if `id` is missing ([#1893](https://github.com/nuxt/content/pull/1893))
  - **code block:** Use div instead of span ([#1885](https://github.com/nuxt/content/pull/1885))
  - Types ([#1912](https://github.com/nuxt/content/pull/1912))
  - Db access time issue ([#1838](https://github.com/nuxt/content/pull/1838))
  - Refresh content-index on nitro start ([#1947](https://github.com/nuxt/content/pull/1947))
  - **findSurround:** Allow before and after to be 0 ([#1922](https://github.com/nuxt/content/pull/1922))
  - **module:** Close dev server on nitro close ([#1952](https://github.com/nuxt/content/pull/1952))

### 📖 Documentation

  - Remove extraneous comma ([#1878](https://github.com/nuxt/content/pull/1878))
  - Update link to useHead ([#1895](https://github.com/nuxt/content/pull/1895))
  - Update get-started description ([13a2e1cf](https://github.com/nuxt/content/commit/13a2e1cf))
  - Update content list query example ([#1901](https://github.com/nuxt/content/pull/1901))
  - Fix deployment ([#1913](https://github.com/nuxt/content/pull/1913))
  - Update documentDriven config ([#1915](https://github.com/nuxt/content/pull/1915))
  - Add examples for JSON string for inline props ([#1882](https://github.com/nuxt/content/pull/1882))
  - Update badges ([737d5c54](https://github.com/nuxt/content/commit/737d5c54))
  - Add github in sources ([#1946](https://github.com/nuxt/content/pull/1946))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Barbapapazes ([@Barbapapazes](http://github.com/Barbapapazes))
- Sébastien Chopin <seb@nuxtjs.com>
- Wolfgang Drescher <drescher.wolfgang@gmail.com>
- Estéban 
- Patrik 
- Nobkd 
- Clément Ollivier ([@clemcode](http://github.com/clemcode))
- Ben Hong ([@bencodezen](http://github.com/bencodezen))

## v2.4.3

[compare changes](https://github.com/nuxt/content/compare/v2.4.2...v2.4.3)


### 🚀 Enhancements

  - **pnpm:** Switch to pnpm (local / ci) ([#1868](https://github.com/nuxt/content/pull/1868))

### 🩹 Fixes

  - **query:** Decode unicode params ([#1871](https://github.com/nuxt/content/pull/1871))

### 🏡 Chore

  - **scripts:** Prepare script ([66e22c5d](https://github.com/nuxt/content/commit/66e22c5d))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Yaël Guilloux <yael.guilloux@gmail.com>

## v2.4.2

[compare changes](https://github.com/nuxt/content/compare/v2.4.1...v2.4.2)


### 🩹 Fixes

  - **useContentHead:** Disable host detection ([f6a429dc](https://github.com/nuxt/content/commit/f6a429dc))

### 📖 Documentation

  - Improvements ([f1991939](https://github.com/nuxt/content/commit/f1991939))
  - Lint fix ([a11e908d](https://github.com/nuxt/content/commit/a11e908d))

### 🏡 Chore

  - Update release config ([801535d2](https://github.com/nuxt/content/commit/801535d2))

### ❤️  Contributors

- Sébastien Chopin <seb@nuxtjs.com>
- Farnabaz <farnabaz@gmail.com>

## v2.4.1

[compare changes](https://github.com/nuxt/content/compare/v2.4.0...v2.4.1)


### 🩹 Fixes

  - **useContentHead:** `undefined` url ([b157500b](https://github.com/nuxt/content/commit/b157500b))

### 📖 Documentation

  - Update edit path ([#1853](https://github.com/nuxt/content/pull/1853))

### 🏡 Chore

  - Update changelog ([8e7733a0](https://github.com/nuxt/content/commit/8e7733a0))
  - Update release config ([1bb477d8](https://github.com/nuxt/content/commit/1bb477d8))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Barbapapazes <e.soubiran25@gmail.com>

## v2.4.0

[compare changes](https://github.com/nuxt/content/compare/v2.3.0...v2.4.0)


### 🚀 Enhancements

  - **shiki-highlighter:** Improve performance & auto load new languages ([#1775](https://github.com/nuxt/content/pull/1775))
  - **shiki:** Highlight excerpt ([#1802](https://github.com/nuxt/content/pull/1802))
  - **markdown:** Keep meta from fenced code block ([#1800](https://github.com/nuxt/content/pull/1800))
  - **markdown:** Don't create excerpt if there is no `<!--more-->` ([#1801](https://github.com/nuxt/content/pull/1801))

### 🩹 Fixes

  - **build:** Do not register web-socket plugin on non-dev env ([#1768](https://github.com/nuxt/content/pull/1768))
  - **document-driven:** Prevent `404` error on redirected pages ([#1770](https://github.com/nuxt/content/pull/1770))
  - **query:** Ensure default values always apply to query params ([#1778](https://github.com/nuxt/content/pull/1778))
  - **examples:** Layout duplication ([#1808](https://github.com/nuxt/content/pull/1808))
  - **Shiki:** Sanitize highlighted text ([#1818](https://github.com/nuxt/content/pull/1818))
  - **markdown-link:** Replacing `blank` prop with `target` ([#1828](https://github.com/nuxt/content/pull/1828))
  - **highlighter:** Define missing env in Vite ([#1830](https://github.com/nuxt/content/pull/1830))
  - **shiki:** Issue with JSON import ([#1824](https://github.com/nuxt/content/pull/1824))
  - **markdown:** XSS Prevention ([#1832](https://github.com/nuxt/content/pull/1832))
  - Handle uri encoded `_path `query ([#1794](https://github.com/nuxt/content/pull/1794))
  - Add `og:title,url,description` meta tags and prefix `og:image` with host ([#1769](https://github.com/nuxt/content/pull/1769))
  - **navigation:** Missing import ([6a1e854e](https://github.com/nuxt/content/commit/6a1e854e))
  - **navigation:** Missing import ([1f7d3a2b](https://github.com/nuxt/content/commit/1f7d3a2b))
  - **markdown:** Images src with `baseURL` ([#1833](https://github.com/nuxt/content/pull/1833))

### 📖 Documentation

  - Update badges ([5a2d2871](https://github.com/nuxt/content/commit/5a2d2871))
  - Update outdated link in `sitemap.md` ([#1772](https://github.com/nuxt/content/pull/1772))
  - Fix broken quickstart link ([#1785](https://github.com/nuxt/content/pull/1785))
  - Fix `ContentRenderer` source link ([#1790](https://github.com/nuxt/content/pull/1790))
  - Fix broken nuxt link ([#1789](https://github.com/nuxt/content/pull/1789))
  - Fix ContentDoc multi-slot example ([#1815](https://github.com/nuxt/content/pull/1815))
  - Add note about transformer ([#1826](https://github.com/nuxt/content/pull/1826))
  - Update logo ([f77d7703](https://github.com/nuxt/content/commit/f77d7703))

### 🏡 Chore

  - Fix typos ([b4750ed0](https://github.com/nuxt/content/commit/b4750ed0))
  - Update favicon ([1cb91f5d](https://github.com/nuxt/content/commit/1cb91f5d))
  - Add release-it ([9a565fde](https://github.com/nuxt/content/commit/9a565fde))

### ✅ Tests

  - Disable `autoImport` ([#1842](https://github.com/nuxt/content/pull/1842))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Daniel Roe <daniel@roe.dev>
- ハン / Han 
- Sébastien Chopin <seb@nuxtjs.com>
- SheetJSDev <dev@sheetjs.com>
- Arash 
- Horu 
- Valery Qwertovsky 
- GanymedeNil <ganymedenil@gmail.com>
- Nobkd 
- Issayah <github.me.mzu5a@simplelogin.com>
- PickleNik 
- Philipp Wagner <mail@philipp-wagner.com>
- Yuki Inoue <inoueyuworks@gmail.com>

## v2.3.0

[compare changes](https://github.com/nuxt/content/compare/v2.2.2...v2.3.0)


### 🚀 Enhancements

  - **module:** Introduce `api.baseURL` and deprecate `base` ([#1695](https://github.com/nuxt/content/pull/1695))
  - Unique api calls per build ([#1705](https://github.com/nuxt/content/pull/1705))
  - **shiki:** Expose highlighting utils ([#1727](https://github.com/nuxt/content/pull/1727))
  - **document-driven:** Introduce `start` and `finish` hooks ([#1744](https://github.com/nuxt/content/pull/1744))
  - **query:** Fully cacheable api ([#1752](https://github.com/nuxt/content/pull/1752))

### 🩹 Fixes

  - **markdown:** Resolve custom shiki languages ([#1692](https://github.com/nuxt/content/pull/1692))
  - **clientDB:** Disable clientDB if token is set and has falsy value ([#1700](https://github.com/nuxt/content/pull/1700))
  - **shiki:** Issue with merging multiple themes ([#1703](https://github.com/nuxt/content/pull/1703))
  - **query:** Invalid response on missing content ([#1706](https://github.com/nuxt/content/pull/1706))
  - **test:** Typo ([#1707](https://github.com/nuxt/content/pull/1707))
  - **markdown:** Remove double and trailing dashes from heading ids ([#1711](https://github.com/nuxt/content/pull/1711))
  - **ws:** Prevent port conflict on running multiple instances ([#1721](https://github.com/nuxt/content/pull/1721))
  - **markdown:** Remove extra dash from heading id ([4c376587](https://github.com/nuxt/content/commit/4c376587))
  - Typo ([a7912af1](https://github.com/nuxt/content/commit/a7912af1))
  - **build:** Invalid cache route handler ([ae138a87](https://github.com/nuxt/content/commit/ae138a87))
  - **ContentRendererMarkdown:** Recreate vNodes in render function ([#1734](https://github.com/nuxt/content/pull/1734))
  - **query:** Fallback to default locale if query has no filter on `_locale` ([#1748](https://github.com/nuxt/content/pull/1748))
  - **module:** Put query parameters removal under an experimental flag ([#1757](https://github.com/nuxt/content/pull/1757))
  - Add missing imports ([5285db01](https://github.com/nuxt/content/commit/5285db01))

### 💅 Refactors

  - **ContentRenderer:** Simplify conditions ([#1715](https://github.com/nuxt/content/pull/1715))
  - **Shiki:** Prepare Shiki highlighter for external usage ([#1720](https://github.com/nuxt/content/pull/1720))

### 📖 Documentation

  - Update deps ([#1684](https://github.com/nuxt/content/pull/1684))
  - Update studio module ([fe55ff28](https://github.com/nuxt/content/commit/fe55ff28))
  - Revert studio module to 0.2.2 ([e26ffd01](https://github.com/nuxt/content/commit/e26ffd01))
  - Update studio module ([#1686](https://github.com/nuxt/content/pull/1686))
  - Fix typo ([#1693](https://github.com/nuxt/content/pull/1693))
  - Upgrade studio module ([ff2edddc](https://github.com/nuxt/content/commit/ff2edddc))
  - Update code inline ([#1730](https://github.com/nuxt/content/pull/1730))
  - Update module options ([#1755](https://github.com/nuxt/content/pull/1755))

### 🏡 Chore

  - Upgrade deps ([#1691](https://github.com/nuxt/content/pull/1691))
  - **logging:** Cleanup logging ([#1733](https://github.com/nuxt/content/pull/1733))

### ❤️  Contributors

- Ahad Birang <farnabaz@gmail.com>
- Farnabaz <farnabaz@gmail.com>
- Yaël Guilloux <yael.guilloux@gmail.com>
- Sébastien Chopin <seb@nuxtjs.com>
- Levi (Nguyễn Lương Huy) <huy.nguyen.luong96@gmail.com>
- Nobkd 
- Onur Dumangöz 
- Baptiste Leproux <leproux.baptiste@gmail.com>

## v2.2.2

[compare changes](https://github.com/nuxt/content/compare/v2.2.1...v2.2.2)


### 🩹 Fixes

  - **ContentRenderer:** Empty content detection ([#1653](https://github.com/nuxt/content/pull/1653))
  - **ContentList:** Handle props change and fix slots default ([#1668](https://github.com/nuxt/content/pull/1668))

### 💅 Refactors

  - Improve typings and simplify logic ([#1669](https://github.com/nuxt/content/pull/1669))

### 📖 Documentation

  - Fix error in ContentQuery where clause example ([#1643](https://github.com/nuxt/content/pull/1643))
  - Update sources ([#1664](https://github.com/nuxt/content/pull/1664))
  - **a11y:** Use list for nav example ([#1670](https://github.com/nuxt/content/pull/1670))

### 🏡 Chore

  - Add #content/context virtual file ([6e205703](https://github.com/nuxt/content/commit/6e205703))
  - No need for virtual file ([37e2caf9](https://github.com/nuxt/content/commit/37e2caf9))
  - Upgrade deps ([#1682](https://github.com/nuxt/content/pull/1682))

### ❤️  Contributors

- Farnabaz <farnabaz@gmail.com>
- Novellac 
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Brett Ormsby

## v2.2.1

[compare changes](https://github.com/nuxt/content/compare/v2.2.0...v2.2.1)


### 🩹 Fixes

  - **module:** Do not warn when sources is empty ([42fffc98](https://github.com/nuxt/content/commit/42fffc98))
  - **module:** Set default hostname for dev socket ([#1624](https://github.com/nuxt/content/pull/1624))
  - **Document Driven:** Layout prefetching ([#1637](https://github.com/nuxt/content/pull/1637))
  - **MarkdownParser:** Refine content path in anchor link ([#1629](https://github.com/nuxt/content/pull/1629))

### 📖 Documentation

  - Fix typo ([#1632](https://github.com/nuxt/content/pull/1632))
  - Fix apostrophe character ([#1633](https://github.com/nuxt/content/pull/1633))
  - Fix typo ([#1634](https://github.com/nuxt/content/pull/1634))

### 🏡 Chore

  - Move algolia keys to env ([138bb7d4](https://github.com/nuxt/content/commit/138bb7d4))
  - Upgrade remark-mdc ([#1627](https://github.com/nuxt/content/pull/1627))
  - Upgrade deps ([#1640](https://github.com/nuxt/content/pull/1640))

### ❤️  Contributors

- Ahad Birang
- Nobkd
- Selemondev
- Sébastien Chopin

## v2.2.0

[compare changes](https://github.com/nuxt/content/compare/v2.1.1...v2.2.0)


### 🚀 Enhancements

  - **document-driven:** Support `navigation.redirect` from `_dir` files ([#1545](https://github.com/nuxt/content/pull/1545))
  - Spa mode ([#1525](https://github.com/nuxt/content/pull/1525))
  - Config for anchor link generation of headings ([#1564](https://github.com/nuxt/content/pull/1564))
  - **parser:** Introduce `_dir` field in contents ([#1613](https://github.com/nuxt/content/pull/1613))

### 🔥 Performance

  - **build:** Build caches before pre-rendering contents ([#1530](https://github.com/nuxt/content/pull/1530))

### 🩹 Fixes

  - **module:** Make `documentDriven` configs optional ([#1539](https://github.com/nuxt/content/pull/1539))
  - Add missing imports ([451b000e](https://github.com/nuxt/content/commit/451b000e))
  - Missing imports on preview mode ([f9f161b1](https://github.com/nuxt/content/commit/f9f161b1))
  - Use relative `.md` link ([#1556](https://github.com/nuxt/content/pull/1556))
  - **module:** Multi-source array ([#1578](https://github.com/nuxt/content/pull/1578))
  - **navigation:** Missing composable when navigation is disabled ([#1577](https://github.com/nuxt/content/pull/1577))
  - Ignore built content in preview mode ([bc01cde3](https://github.com/nuxt/content/commit/bc01cde3))
  - **ClientDB:** Drop LocalStorage ([7afd857b](https://github.com/nuxt/content/commit/7afd857b))
  - **client-db:** Race-condition on multiple calls ([c11a4800](https://github.com/nuxt/content/commit/c11a4800))
  - **`<ContentList>`:** Respect `query.path` when `path` is missing ([#1598](https://github.com/nuxt/content/pull/1598))
  - **`<ContentDoc>`:** Render blink in SSG ([#1600](https://github.com/nuxt/content/pull/1600))
  - Update h3 usage with explicit `defineEventHandler` ([#1603](https://github.com/nuxt/content/pull/1603))
  - **anchorLinks:** Add useRuntimeConfig imports ([#1605](https://github.com/nuxt/content/pull/1605))
  - **runtime:** Detect 404 api responses in SSG ([#1608](https://github.com/nuxt/content/pull/1608))
  - **`queryContent`:** Use path argument as prefix if there is another condition ([#1612](https://github.com/nuxt/content/pull/1612))

### 📖 Documentation

  - Fix type `client only` -> `client-only` ([#1535](https://github.com/nuxt/content/pull/1535))
  - **content-list:** Updated query reference and added example ([#1548](https://github.com/nuxt/content/pull/1548))
  - Add search ([#1575](https://github.com/nuxt/content/pull/1575))
  - Update algolia key ([9e91948e](https://github.com/nuxt/content/commit/9e91948e))
  - Cleanup deps ([#1582](https://github.com/nuxt/content/pull/1582))
  - Upgrade Content version ([c76c5a75](https://github.com/nuxt/content/commit/c76c5a75))
  - Broken link on Markdown API page ([#1588](https://github.com/nuxt/content/pull/1588))
  - **composables:** Fix close tag ContentRenderer ([#1597](https://github.com/nuxt/content/pull/1597))
  - Update badge style ([49b1c4cc](https://github.com/nuxt/content/commit/49b1c4cc))
  - Update cover ([ba2aeb45](https://github.com/nuxt/content/commit/ba2aeb45))
  - No need to register manually nitro plugin ([b6bbb42c](https://github.com/nuxt/content/commit/b6bbb42c))
  - Fix nitro plugins link ([0259a901](https://github.com/nuxt/content/commit/0259a901))
  - Update `findSurround` usage ([#1609](https://github.com/nuxt/content/pull/1609))
  - Guidance on using local images ([#1617](https://github.com/nuxt/content/pull/1617))

### 🏡 Chore

  - Update deps ([d3e9aa70](https://github.com/nuxt/content/commit/d3e9aa70))
  - Update Docus ([428cf8f8](https://github.com/nuxt/content/commit/428cf8f8))
  - Add missing dep ([5d29a377](https://github.com/nuxt/content/commit/5d29a377))
  - Remove preview plugin ([558add0c](https://github.com/nuxt/content/commit/558add0c))

### ❤️  Contributors

- Ahad Birang
- Jan-Henrik Damaschke
- Michel EDIGHOFFER
- Nobkd
- Percy Ma
- Pooya Parsa
- Ramses Garate
- Remiconnesson
- Sai Deepesh
- Sébastien Chopin

## v2.1.1

[compare changes](https://github.com/nuxt/content/compare/v2.1.0...v2.1.1)

### 🩹 Fixes

  - **document-driven:** Sync page layout (#1519)
  - **document-driven:** Disable static payload (#1526)

### 📖 Documentation

  - **document-driven:** Remove edge channel info (#1462)
  - Update title & description (#1505)
  - **document-driven:** Fix typo (#1512)

### ❤️  Contributors

- Ahad Birang
- Nobkd
- Okoro Redemption
- Sébastien Chopin

## v2.1.0

### 🚀 Enhancements

  - **types:** Provide augmentations for `only` and `without` (#1200)
  - **types:** Expose `MarkdownParsedContent` for improved type generics (#1199)
  - **navigation:** Allow passing QueryBuilder or QueryBuilderParams in `fetchNavigation` or `<ContentNavigation>` (#1206)
  - **markdown:** Allow overwriting plugins (#1226)
  - **config:** Allow ws config (#1249)
  - **markdown:** Support multiple themes for code highlighter (#1251)
  - **navigation:** Allow _dir.yml to filter navigation (#1261)
  - **source:** Allow overwriting default source (#1273)
  - Variable binding (#1266)
  - **document-driven:** Add document-driven as a @nuxt/content feature (#1279)
  - **docs:** Upgrade docus (3adf4e5d)
  - **use-content-head:** Add helper for <head> binding (#1295)
  - **document-driven:** Add caching layer on client-side (#1312)
  - Add web-types.json for WebStorm (#1288)
  - Support navigation field in content and _dir.yml (#1328)
  - Disable document driven with route meta (#1333)
  - **tailwindcss:** Support tailwindcss classes in content (with hmr) (#1351)
  - Improve where query types (#1359)
  - Export transformers (#1374)
  - DocumentDriven configuration (#1378)
  - **`<markdown>`:** Support fallback default slot (#1405)
  - Create index for path base search (#1401)
  - Pre fetch contents on build (#1411)
  - Per-page components (#1429)
  - Implement csv parser with unist/mircomark stack (#1468)
  - **generate:** Use nitro header instead of header link (#1502)

### 🩹 Fixes

  - **navigation:** Allow navigation opt-out with `navigation: false` (#1208)
  - **types:** More accurately represent `ParsedContentMeta` (#1196)
  - **types:** Change `QueryBuilderParams` keys to partial (#1203)
  - **ContentQuery:** Handle `null` data (#1230)
  - **markdown:** Issue with `h1-6` tags (#1223)
  - **markdown:** Detect inline component followed non whitespace characters (#1227)
  - **query:** Use exact match for `findOne` (#1224)
  - **query:** Surround and only cannot be used at the same time (#1238)
  - **storage:** Warn & ignore files with invalid characters (#1239)
  - **lint:** Fix linting (ellipsis.vue) (855bb383)
  - **ContentQuery:** Add condition if value is undefined (6a055081)
  - **mdc-parser:** Minor fixes in markdown generation (caf9b83d)
  - **highlight:** Preload common languages (#1278)
  - **query:** Handle array fields in `$in` operator (#1277)
  - **document-driven:** Update documentDriven feature (#1294)
  - **highlight:** Warn about languages dynamic loading (#1291)
  - **markdown:** Generate depth field in TOC for h5 & h6 (#1296)
  - Support layout from defined vue page in DDM (48fc30b0)
  - **ignore:** Fix ignore paths injected from the module (97f1d74c)
  - **runtime:** ContentRenderer extra props (#1300)
  - Remove _theme.yml fetch with doc driven by default (#1310)
  - **ContentRendererMarkdown:** Preload components used in content (#1309)
  - **markdown:** Attributes of span inside headings (#1307)
  - Handler files with `index` as substring (#1334)
  - **document-driven:** Rendering flash (#1336)
  - DocumentDrivenNotFound shall use the layout (d41205aa)
  - **highlight:** Remove `@nuxt/kit` from runtime bundle (#1346)
  - **document-driven:** Add empty promise for disabled features (#1356)
  - **hot:** Mitigate empty code blocks (hotfix) (a13cca98)
  - **lint:** Fix linting (cbf08ad9)
  - **highlight:** Respect `highlight` option (#1372)
  - Clone `head.meta` before manipulating (#1370)
  - **prose-components:** Use html anchor link in headings (#1381)
  - Support components/content in layers for extends (#1404)
  - **document-driven:** Throw 404 error when content is missing (#1394)
  - Import `useRoute` (#1408)
  - **document-driven:** Only set 404 status on SSR (#1409)
  - **query:** Do not create empty `where` (c71c79bd)
  - **content-index:** Files in `content` directory has higher priority (#1414)
  - **markdown:** Add missing task list class (#1416)
  - Make sure `components/content` is on top in layers (#1418)
  - Remove (now deprecated) template utils (#1423)
  - **pre-fetch:** Support github driver (#1433)
  - **query:** Ensure where is set (10709ee2)
  - **json:** Handle parsed content (#1437)
  - Avoid mutating `_layers` (#1455)
  - **prerender:** Add extension to pre-rendered queries (#1456)
  - **`<ContentRenderer>`:** Prioritize default slot (#1460)
  - `useContentHead` was not respecting `og:image` props (#1461)
  - **document-driven:** Avoid calling middleware on hash change (5a64f469)
  - **runtime:** Allow to give instance of the remark plugin (#1466)
  - **useContentHead:** Set title only if defined (9b9b6489)
  - **module:** Do not add vue files to ignore list (#1476)
  - **`<MarkDown>`:** Prevent multiple deprecation log (#1497)

### 💅 Refactors

  - ⚠️  Spell `extensions` correctly (#1204)
  - Use `remark-mdc` package (#1315)
  - Extract nitro logic from transformers (#1352)

### 📖 Documentation

  - Fix typo (fff00b19)
  - Remove config redirect (04fe4248)
  - Upgrade with latest docus (#1250)
  - Update playground (96c161d5)
  - Update driverOptions (7adaed10)
  - Note about rendering content in Get Started (#1255)
  - Small typo (1b7fd920)
  - **get-started:** Minor fixes (#1274)
  - Add edge releases channel (58cae1d2)
  - **edge-channel:** Update edge package name (fe1ebb59)
  - Upgrade @nuxt/content (3dc1f25d)
  - Update document-driven page (90d04bb3)
  - Move example of doc driven (6426160e)
  - Improve examples (#1302)
  - Fix inline code block (#1303)
  - Fix missing slash (#1306)
  - Generate blog too (#1311)
  - Fix link to document-driven example (6e1ff3b1)
  - Add template for doc-driven mode (a4ab9444)
  - Fix the link-id for the surround EN v1 docs (#1321)
  - Missing `,` (#1330)
  - Specify version in v1 installation guide (85e22aca)
  - Remove doubled . from filename (docs FR v1) (#1323)
  - Add edge channel for document-driven mode (4b23370c)
  - Improve catch-all section in document-driven mode (93813f9a)
  - Fix typo (e82fed4b)
  - **sitemap:** Add npm and pnpm install script (#1349)
  - Add deploy section (#1347)
  - **api:** QueryContent().sort() descending sorting (#1364)
  - Add article 'a' to sentence (#1395)
  - Move fetchContentNavigation into function (#1403)
  - Upgrade deps (#1424)
  - Upgrade deps " (#1424)
  - Fix typo 'Convent' -> 'Content' (#1442)
  - Describe `highlight.preload` (#1436)
  - Add pnpm as project start option (#1450)
  - Excerpt (#1441)
  - Document transformers (#1453)
  - Temporary use `<Markdown>` (ac95d137)
  - **README:** Fix link to MDC syntax (#1467)
  - **querying:** Add `_params` to api routes (#1463)
  - Playground content from query (#1499)
  - Upgrade docus (#1503)
  - Update home page (d7bd2b1a)
  - Update social image (8cdae3e2)

### 🏡 Chore

  - Typo (fd1c56dc)
  - **docs:** Upgrade docs (d0ee386e)
  - **prepare:** Prepare for 2.1.0 release (update version) (3dd85b57)
  - **playground:** Add example with ddm and vue page (07d79882)
  - Remove style and rename document-driven class (8bf91546)
  - Add page:content:start hook (45f696ba)
  - Rename to content:middleware:start (63749d2b)
  - Remove `unctx` from dependencies (#1413)
  - Deprecate markdown component (#1435)
  - Upgrade to nuxt rc9 (#1498)
  - Use latest docus (ef5c3ec9)

#### ⚠️  Breaking Changes

  - ⚠️  Spell `extensions` correctly (#1204)

### ❤️  Contributors

- Ahad Birang
- Alexey Tuzov
- Benjamin Canac
- Clément Ollivier
- Daniel Roe
- Farnabaz
- Gregor Becker
- Gustavo Alfredo Marín Sáez
- Harlan Wilton
- Itshizhan
- Kot
- Kotaro Yabe
- Lukas Von Blarer
- Maciej Błędkowski
- Nobkd
- Pooya Parsa
- Rem
- Sébastien Chopin
- Vinayak Kulkarni
- Vinccool96
- Yaël Guilloux

