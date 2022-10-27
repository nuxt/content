# Changelog


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

