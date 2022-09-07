# Changelog


## main (v2.0.1..v2.1.0)


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

