# Changelog

## [3.9.0](///compare/v3.8.2...v3.9.0) (2025-12-03)

### Features

* **amplity:** use`node:sqlite` on AWS Amplify if Node.js > 22 ([#3598](undefined/undefined/undefined/issues/3598)) e74bb6d

### Bug Fixes

* **fs-watcher:** add timeout to deal with race-condition c07336e
* prepare for NuxtHub 0.10 with hub.db ([#3624](undefined/undefined/undefined/issues/3624)) 8a9f9d3
* respect `app.baseURL` in Cloudflare database handler ([#3608](undefined/undefined/undefined/issues/3608)) 1af6adc

## [3.8.2](https://github.com/nuxt/content/compare/v3.8.1...v3.8.2) (2025-11-13)

## [3.8.1](https://github.com/nuxt/content/compare/v3.8.0...v3.8.1) (2025-11-13)

### Bug Fixes

* **deps:** nuxt 4.2 patch ([91a1de7](https://github.com/nuxt/content/commit/91a1de7391d8b010fff85befe3d75fb8e0fd1788))
* **docs:** docs collection prefix ([72cc17d](https://github.com/nuxt/content/commit/72cc17d5d912f46c0358b1af48cf44d49e18925a))
* make sure last char of column is not special char ([#3610](https://github.com/nuxt/content/issues/3610)) ([d763452](https://github.com/nuxt/content/commit/d763452db17b2e81ccae4a84c25c58e50c6a5e68))

### Performance Improvements

* replace internal object records with maps ([#3591](https://github.com/nuxt/content/issues/3591)) ([7b16de3](https://github.com/nuxt/content/commit/7b16de31106062d82654b0be9cddaaf88ac1b1fb))
* use `moduleDependencies` to install mdc module ([#3597](https://github.com/nuxt/content/issues/3597)) ([9600533](https://github.com/nuxt/content/commit/960053395ccb3c1a991f06948523558fcff62ea1))

## [3.8.0](https://github.com/nuxt/content/compare/v3.7.1...v3.8.0) (2025-10-29)

### Features

* add support for nuxthub v1 ([#3576](https://github.com/nuxt/content/issues/3576)) ([e166063](https://github.com/nuxt/content/commit/e1660637e24705d922a928ec8ca711a2fbec4e18))
* client utils ([#3506](https://github.com/nuxt/content/issues/3506)) ([2467057](https://github.com/nuxt/content/commit/24670578f859c119b717082636bd216d1a50f477))
* use Vite and Webpack server for content hot reload ([#3546](https://github.com/nuxt/content/issues/3546)) ([ee06d16](https://github.com/nuxt/content/commit/ee06d16cbcf03abd4093275fc03595169ec1dfdf))

### Bug Fixes

* extend inherited schema ([dd054ea](https://github.com/nuxt/content/commit/dd054ea9a960125af4bf9ebf696f51536e92b5dd))

### Performance Improvements

* **git:** use modern-tar over tar ([#3569](https://github.com/nuxt/content/issues/3569)) ([dd854d5](https://github.com/nuxt/content/commit/dd854d5e43648082d7f75516ecd941073c8fc380))

## [3.7.1](https://github.com/nuxt/content/compare/v3.7.0...v3.7.1) (2025-09-16)

### Bug Fixes

* remove `zod` and `zod-to-json-schema` from optional deps ([#3541](https://github.com/nuxt/content/issues/3541)) ([8e038f0](https://github.com/nuxt/content/commit/8e038f0db643b05ebde15a250d0a0262eba25d2c))

## [3.7.0](https://github.com/nuxt/content/compare/v3.6.3...v3.7.0) (2025-09-12)

### Deprecations

The following features are deprecated and will be removed in a future release:
- `z` re-export from `@nuxt/content`
- Calling `.editor()` directly on zod schemas (e.g. `z.string().editor(...)`)

Migration guide :
```diff
- import { defineContentConfig, defineCollection, z } from '@nuxt/content'
+ import { defineContentConfig, defineCollection, property } from '@nuxt/content'
+ import { z } from 'zod' // or 'zod/v3' if your setup exposes this subpath

  export default defineContentConfig({
    collections: {
      posts: defineCollection({
        type: 'page',
        source: 'blog/*.md',
        schema: z.object({
        image: z.object({
-         src: z.string().editor({ input: 'media' }),
+         src: property(z.string()).editor({ input: 'media' }),
          alt: z.string(),
        }),
      }),
    },
  })
```

### Features

* adopt standard schema spec and support different validators ([#3524](https://github.com/nuxt/content/issues/3524)) ([46a1004](https://github.com/nuxt/content/commit/46a1004c6eadae00c1c42f6f335b7dd5ac664b33))
* inherit component prop types in content collection ([#3451](https://github.com/nuxt/content/issues/3451)) ([a620a2c](https://github.com/nuxt/content/commit/a620a2c877fb79e8d8193f4146c0156dee366116))

### Bug Fixes

* `ProseCode` preview syntax highlighting ([#3491](https://github.com/nuxt/content/issues/3491)) ([4a725bd](https://github.com/nuxt/content/commit/4a725bd97d42939a00c9a3a9bd8d3a7ed1b73468))
* add dependency at Nuxt root dir ([#3525](https://github.com/nuxt/content/issues/3525)) ([71f2989](https://github.com/nuxt/content/commit/71f298942c9ca9dcbfe9129801ba76f1b198fab3))
* block experimental sqlite warning on node ([5ac31da](https://github.com/nuxt/content/commit/5ac31da07ad73ecd4f9a56e516505cd9c6f88735))
* deprecate `nitro` export in favor of `server` ([ec97064](https://github.com/nuxt/content/commit/ec97064fa3d75b8fe22b6f1923292fafd76a2d5b))
* do not register `close` hook if websocket is disabled ([#3474](https://github.com/nuxt/content/issues/3474)) ([9edcc8f](https://github.com/nuxt/content/commit/9edcc8f9331fd428a35e4419d4e13115dc6da9af))
* ignore .DS_Store files in all subdirectories ([c7a9af3](https://github.com/nuxt/content/commit/c7a9af3faed7a7dfb7303e666d650e6534cee317))
* ignore OSX meta file `.DS_Store` ([fe5d7f9](https://github.com/nuxt/content/commit/fe5d7f913faa22a85c39f0e8bcd3f8e900e83324))
* improve websocket and watcher cleanup handling ([#3478](https://github.com/nuxt/content/issues/3478)) ([8041807](https://github.com/nuxt/content/commit/8041807e81cbf9456ab92575a595f558ce85e316))
* **inherit:** cache component meta ([e9658de](https://github.com/nuxt/content/commit/e9658de3b72a41347f2b7a5480a6f18117532364))
* **inherit:** issue with property definition in arrays ([873b768](https://github.com/nuxt/content/commit/873b768741839ded833b2c5630cc6d62ea4e2951))
* **inherit:** try resolve component from root directory ([b0073f1](https://github.com/nuxt/content/commit/b0073f1d6064159e87e4d2697121a50429b708fc))
* **inherit:** type generation ([63500f3](https://github.com/nuxt/content/commit/63500f339965f05361bc975dd979293933acde7e))
* normalize source cwd ([#3532](https://github.com/nuxt/content/issues/3532)) ([0a34742](https://github.com/nuxt/content/commit/0a347423e27cb7a007df585a8e619f3b5e1318bf))
* **nuxthub:** missing line separator in database migrations ([#3464](https://github.com/nuxt/content/issues/3464)) ([4983443](https://github.com/nuxt/content/commit/4983443ad787fc122436e2e0f807081f18cd1338))
* use listhen's `publicUrl` if available ([#3500](https://github.com/nuxt/content/issues/3500)) ([fb0f022](https://github.com/nuxt/content/commit/fb0f022e2b05470a3e1061a3a94992b7d816f4d6))

## [3.6.3](https://github.com/nuxt/content/compare/v3.6.2...v3.6.3) (2025-07-04)

### Bug Fixes

* Content Hot reload ([ad4479a](https://github.com/nuxt/content/commit/ad4479aded5e3e69d9dc8637f73243a8d43a8932)), closes [#3440](https://github.com/nuxt/content/issues/3440)

## [3.6.2](https://github.com/nuxt/content/compare/v3.6.1...v3.6.2) (2025-07-02)

### Features

* **schema:** set navigation.icon of page as icon for preview ([eff825d](https://github.com/nuxt/content/commit/eff825d910f7684351e9fb4563dc4521f47ce2d7))

### Bug Fixes

* check sqlite connector only if database type is sqlite ([#3425](https://github.com/nuxt/content/issues/3425)) ([9166169](https://github.com/nuxt/content/commit/916616960288cbd5b43bd70c7d2a9791211a8c1a))
* **dev:** dont ignore subfolders ([#3421](https://github.com/nuxt/content/issues/3421)) ([78f461d](https://github.com/nuxt/content/commit/78f461da39143c208be463f8f683d2cba35f5ed2))
* **docs:** update query method to use `first()` for consistency ([#3430](https://github.com/nuxt/content/issues/3430)) ([5fed4ea](https://github.com/nuxt/content/commit/5fed4ea3a8ee525400ad129028f34add78e6030a))
* fallback to api call if webassembly is not supported ([#3399](https://github.com/nuxt/content/issues/3399)) ([cf5ca24](https://github.com/nuxt/content/commit/cf5ca24e80f3b3b07df9e819ac5b112eaffb5dde))

## [3.6.1](https://github.com/nuxt/content/compare/v3.6.0...v3.6.1) (2025-06-20)

### Features

* add `findPageHeadline` utils ([#3416](https://github.com/nuxt/content/issues/3416)) ([a966c61](https://github.com/nuxt/content/commit/a966c61d2f4cdd496ceb98026c728f7723780b51))
* **preset:** warn if nuxthub is loaded before without database ([#3405](https://github.com/nuxt/content/issues/3405)) ([f689cf0](https://github.com/nuxt/content/commit/f689cf0f08ce677ba1eaaf977f43b7336b09a819))
* support `<=` and `>=` sql operators ([#3413](https://github.com/nuxt/content/issues/3413)) ([63dbf9f](https://github.com/nuxt/content/commit/63dbf9f3bb3159cd90b765909319a258949f2552))
* support Cloudflare Workers ([#3407](https://github.com/nuxt/content/issues/3407)) ([7738aac](https://github.com/nuxt/content/commit/7738aac6b7dca2d8b510b5c8f6528878dd44fc57))

### Bug Fixes

* **dev:** support extension patterns like `**/*.md` ([#3414](https://github.com/nuxt/content/issues/3414)) ([f1b873b](https://github.com/nuxt/content/commit/f1b873ba5262bd76ddf3fafa8711bac331099376))
* disable ref strategy of JsonSchema ([#3403](https://github.com/nuxt/content/issues/3403)) ([01cfac1](https://github.com/nuxt/content/commit/01cfac1b9c695ca10f166d23d8759a10668e68fa))

## [3.6.0](https://github.com/nuxt/content/compare/v3.5.1...v3.6.0) (2025-06-12)

### Features

* add `findPageBreadcrumb`, `findPageChildren` and `findPageSiblings` utils ([#3393](https://github.com/nuxt/content/issues/3393)) ([c74ec44](https://github.com/nuxt/content/commit/c74ec44a232a0a8032dc137d3446b9c5daaee801))
* **parser:** allow extra transformers to provide components used ([#3355](https://github.com/nuxt/content/issues/3355)) ([baff541](https://github.com/nuxt/content/commit/baff541ee36073803971b787fc0487cc423aea0b))
* **source:** do not watch for excluded files ([2ee1149](https://github.com/nuxt/content/commit/2ee1149dff313b25aeec8c2bc13087c29c4d5394))
* toggle content heading extraction ([#3400](https://github.com/nuxt/content/issues/3400)) ([f01256a](https://github.com/nuxt/content/commit/f01256a2945b9b6d0dc6324051ca65a91bcdbb81))
* use json schema instead of zod for internal routines ([#3347](https://github.com/nuxt/content/issues/3347)) ([3f2ff74](https://github.com/nuxt/content/commit/3f2ff743158eec228b0a74ef4e81d720510d78c2))

### Bug Fixes

* add `sql_dump` file extension ([#3339](https://github.com/nuxt/content/issues/3339)) ([d0ceeb6](https://github.com/nuxt/content/commit/d0ceeb62bd2c03d68bbd39ead9736654be74ad5d))
* **collections:** default values ([10f3a06](https://github.com/nuxt/content/commit/10f3a06664293ff0c8182ababd36fd76976304df))
* **deps:** remove optimized brace-expansion from preview module ([d5ac591](https://github.com/nuxt/content/commit/d5ac591ce9593f35287bc6cbb4fd7059c3a9d6f0))
* do not escape newlines ([#3320](https://github.com/nuxt/content/issues/3320)) ([eb60ecb](https://github.com/nuxt/content/commit/eb60ecb9fe1f5e5c321d82cba5ecfb8b1d609577))
* **module:** check modules existence using `import` ([#3348](https://github.com/nuxt/content/issues/3348)) ([bd84992](https://github.com/nuxt/content/commit/bd84992d4ebcb87748b2874747daa5fb1080b90f))
* **module:** ignore files in content folder in nuxt building ([#3380](https://github.com/nuxt/content/issues/3380)) ([b01e307](https://github.com/nuxt/content/commit/b01e307721e3e88ae9a54997d95aaaec9a36d77f))
* **preview:** handle deleted key in object ([231ef50](https://github.com/nuxt/content/commit/231ef50b89dc68efacff2fb6004f38d0da7ffe4a))
* **templates:** populate preview template schema ([b7230cd](https://github.com/nuxt/content/commit/b7230cdbfc1e823713a30f0ed979b7b12d14aa69))
* **websocket:** client url ([#3344](https://github.com/nuxt/content/issues/3344)) ([d67b63b](https://github.com/nuxt/content/commit/d67b63b3c87b1c3b1212fc5125ee04dc795768b7))

## [3.5.1](https://github.com/nuxt/content/compare/v3.5.0...v3.5.1) (2025-04-24)

### Bug Fixes

* prevenr hydration when content contains `\r` ([c10269d](https://github.com/nuxt/content/commit/c10269d02d9a7f2d38baabcac72fd4d2186c79de))

## [3.5.0](https://github.com/nuxt/content/compare/v3.4.0...v3.5.0) (2025-04-23)

### Features

* aws amplify preset ([#3316](https://github.com/nuxt/content/issues/3316)) ([ecd345f](https://github.com/nuxt/content/commit/ecd345f0431eb2e379a789d0127937bce5a2f68b))
* **LLMS:** call hook before generating markdown ([#3323](https://github.com/nuxt/content/issues/3323)) ([fd14e32](https://github.com/nuxt/content/commit/fd14e32c024f9c19fee9a9f7ea12f07eab0ac5db))

### Bug Fixes

* **cache:** split large queries ([ef50925](https://github.com/nuxt/content/commit/ef50925b7dd3461a4bb0ed83d7c51082c4b410e3))
* **cloudflare:** load sql dump from assets ([#3275](https://github.com/nuxt/content/issues/3275)) ([453ba2e](https://github.com/nuxt/content/commit/453ba2ea6bc2200087f42911156869af6899c353))
* **collection:** avoid double update of some record by using the hash column as index ([#3304](https://github.com/nuxt/content/issues/3304)) ([ebfb6e5](https://github.com/nuxt/content/commit/ebfb6e516f02fb657382da0c8a66005831cafc95))
* **dev:** do not create hash column on local cache table ([8fff15c](https://github.com/nuxt/content/commit/8fff15c374b12dada89307e7c37e9f20f7938a71))
* Disallow crawlers from crawling `/__nuxt_content` paths. ([#3299](https://github.com/nuxt/content/issues/3299)) ([849e79d](https://github.com/nuxt/content/commit/849e79dbf23b0eba7371001318bb1a41c6603274))
* explicitly set the dump's content type ([#3302](https://github.com/nuxt/content/issues/3302)) ([e1a98d4](https://github.com/nuxt/content/commit/e1a98d4f475b2569da3c7b125e09653803c6e515))
* generate correct collection insert for object and array default values ([#3277](https://github.com/nuxt/content/issues/3277)) ([a9587ee](https://github.com/nuxt/content/commit/a9587eee2548d1c30c64422539747a5a8eb321b9))
* **module:** invalid rootDir of layer sources ([#3308](https://github.com/nuxt/content/issues/3308)) ([2579910](https://github.com/nuxt/content/commit/257991064ef69c92a8f06239fc0400eed72413de))
* **preview:** handle collection search with prefixed sources ([#3317](https://github.com/nuxt/content/issues/3317)) ([c152782](https://github.com/nuxt/content/commit/c1527826b199c48b92f7c430c9da9aead4d13b42))
* **preview:** handle strings format when generating insert query ([c18e094](https://github.com/nuxt/content/commit/c18e094365d32c0c182c9f8eb618ec91485d8d9b))
* **preview:** remove prefix when parsing files ([498168f](https://github.com/nuxt/content/commit/498168f2792301100ccd64b8bdd61c80dc4e293c))
* **preview:** transform value based on schema for sql query generation ([994ae98](https://github.com/nuxt/content/commit/994ae98cc4eb64f589cd66c839791f9b8f12076d))
* reactively load components when `body` changes ([#3283](https://github.com/nuxt/content/issues/3283)) ([b6a30aa](https://github.com/nuxt/content/commit/b6a30aaac0418bcd8ebb7938dd134dacb258f966))
* **templates:** props definition ([997fc65](https://github.com/nuxt/content/commit/997fc65200f95722c95d9afdcbb68c29d8611214))
* update csv docs & fix csv options typo ([#3300](https://github.com/nuxt/content/issues/3300)) ([2c2fc77](https://github.com/nuxt/content/commit/2c2fc77e9ee5c215506e0f50164313fe80ec7042))

## [3.4.0](https://github.com/nuxt/content/compare/v3.3.0...v3.4.0) (2025-03-20)

### Features

* **collection:** add support for Bitbucket repository  ([#3226](https://github.com/nuxt/content/issues/3226)) ([55b0e5b](https://github.com/nuxt/content/commit/55b0e5b7dd5893e74c3707d42049f8a112e82163))
* **db:** experimental `node:sqlite` under flag  ([#3230](https://github.com/nuxt/content/issues/3230)) ([e97d579](https://github.com/nuxt/content/commit/e97d579f100a8d7d26421876a1174eaa35bfb438))
* **search:** retrieve extra fields in search sections ([#3178](https://github.com/nuxt/content/issues/3178)) ([29f4b3e](https://github.com/nuxt/content/commit/29f4b3e57867be2670eb4c79aa0130f5f4e10256))

### Bug Fixes

* check for ws existence before closing ([#3238](https://github.com/nuxt/content/issues/3238)) ([6ec0eb8](https://github.com/nuxt/content/commit/6ec0eb8bc5db94760db6672e83635dcc91dfbf22))
* **module:** prevent conflict with auth & security tools ([#3245](https://github.com/nuxt/content/issues/3245)) ([dc27bc9](https://github.com/nuxt/content/commit/dc27bc94c1a4ab09adb8169a08d08ffbb85f9ddf))
* **parser:** recreate highlighter when options did change ([53875b1](https://github.com/nuxt/content/commit/53875b1eac74f4f07e381a361241446229d88d62))

## [3.3.0](https://github.com/nuxt/content/compare/v3.2.2...v3.3.0) (2025-03-05)

### Features

* page level caching ([#3158](https://github.com/nuxt/content/issues/3158)) ([f4e4f4c](https://github.com/nuxt/content/commit/f4e4f4ce9fc921c28ee7e1b960b1b16d2f01c560))

### Bug Fixes

* **collection:** detect two part branches ([b0a743b](https://github.com/nuxt/content/commit/b0a743b71cabbd5af761d98e100d216fc00239c0))
* **database:** remove comments form dump queries ([#3221](https://github.com/nuxt/content/issues/3221)) ([474c224](https://github.com/nuxt/content/commit/474c224c131806601924156e2ff8026d6c0b53e2))
* **module:** load `ts` transformers ([#3218](https://github.com/nuxt/content/issues/3218)) ([819ab7f](https://github.com/nuxt/content/commit/819ab7fa2df5c4f160f893db67493793d76cd239))
* **module:** prevent adding css modules in components template ([1a48095](https://github.com/nuxt/content/commit/1a48095503d311501f4997cebc2ab896c88ea617)), closes [#3206](https://github.com/nuxt/content/issues/3206)
* **preview:** remove db ([ad62971](https://github.com/nuxt/content/commit/ad6297105c6a844540deff3723de02726f3e0317))
* warn about using `./` and `../` in source ([7a7b3b2](https://github.com/nuxt/content/commit/7a7b3b206c8f7c28e187a732d6cd6850a86163b9)), closes [#3215](https://github.com/nuxt/content/issues/3215)

## [3.2.2](https://github.com/nuxt/content/compare/v3.2.1...v3.2.2) (2025-02-24)

### Bug Fixes

* **client-database:** separate db init from collection dump fetch ([#3188](https://github.com/nuxt/content/issues/3188)) ([82425a5](https://github.com/nuxt/content/commit/82425a56edee43d95930b456c83e108ad3859b47))
* **search:** invalid helper naming ([895c220](https://github.com/nuxt/content/commit/895c22055c382ceedbd2d9106014fdadbdfd7bee)), closes [#3186](https://github.com/nuxt/content/issues/3186)

## [3.2.1](https://github.com/nuxt/content/compare/v3.2.0...v3.2.1) (2025-02-21)

### Bug Fixes

* **bunsqlite:** polyfills not being loaded ([#3176](https://github.com/nuxt/content/issues/3176)) ([139744c](https://github.com/nuxt/content/commit/139744c9b54cd17018150b2a03cd555466672ce1))
* **client-database:** prevent concurrent initialization ([#3174](https://github.com/nuxt/content/issues/3174)) ([49531dd](https://github.com/nuxt/content/commit/49531dd5600de00c8913602875244921bc9cfe27))
* **ContentRenderer:** async loader types ([f1a9b8e](https://github.com/nuxt/content/commit/f1a9b8e1d67a4a753a184efcf536f365dbb70354))
* **llms:** add missing import for `defineNitroPlugin` ([#3170](https://github.com/nuxt/content/issues/3170)) ([b091253](https://github.com/nuxt/content/commit/b0912539029da9946693ec0d2766436ab1fdd6e3))
* **llms:** add missing import on `queryCollection` ([2fe61e6](https://github.com/nuxt/content/commit/2fe61e60fe221c66a7bbfdb194c5ebcc0020afc1))

## [3.2.0](https://github.com/nuxt/content/compare/v3.1.1...v3.2.0) (2025-02-20)

### Features

* **collection:** repair SQL query slicing for content larger than 200Kb ([#3131](https://github.com/nuxt/content/issues/3131)) ([9d6b6c3](https://github.com/nuxt/content/commit/9d6b6c338191a70fdb66a11a63e2c444a8846683))
* database version ([#3148](https://github.com/nuxt/content/issues/3148)) ([045d602](https://github.com/nuxt/content/commit/045d6022742c94b83678295e8b2d4c6bec2f979c))
* **llms:** zero config integration with `nuxt-llms` ([#3143](https://github.com/nuxt/content/issues/3143)) ([541beeb](https://github.com/nuxt/content/commit/541beebd17079303de564769a350f59e053b6c04))
* netlify preset ([#3122](https://github.com/nuxt/content/issues/3122)) ([7191516](https://github.com/nuxt/content/commit/7191516eeeb59129288677b76f1c1b34a4773857))
* **zod:** editor metadata ([#3133](https://github.com/nuxt/content/issues/3133)) ([7a9ca9e](https://github.com/nuxt/content/commit/7a9ca9ed2a874300ac73a2f9a939aa32ec41a579))

### Bug Fixes

* `queryCollectionItemSurroundings` type definition in built module ([#3121](https://github.com/nuxt/content/issues/3121)) ([808c133](https://github.com/nuxt/content/commit/808c133536e59f2549297928a1ea493e805cafa2))
* allow `count(*)` query ([71221d3](https://github.com/nuxt/content/commit/71221d33f4e1c228028818f1edc903f57b52e55d)), closes [#3136](https://github.com/nuxt/content/issues/3136)
* constant initialization of content tables ([#3146](https://github.com/nuxt/content/issues/3146)) ([b2b1b4e](https://github.com/nuxt/content/commit/b2b1b4e0b746d8e4ad6d72334f1d691a9bcd62c2))
* **database:** prevent creating multiple database connections ([#3126](https://github.com/nuxt/content/issues/3126)) ([06a7014](https://github.com/nuxt/content/commit/06a7014394056cc5e99d2640274860ad41f451a3))
* generate checksum after processing all sources ([e97c787](https://github.com/nuxt/content/commit/e97c787daeabb039d012612b7f78099d50558c19))
* manage concurent initializations ([#3132](https://github.com/nuxt/content/issues/3132)) ([c351947](https://github.com/nuxt/content/commit/c351947a93f74e68a2898c1bdc37c56b44f1ef77))
* nuxtlabs studio url in migration ([#3150](https://github.com/nuxt/content/issues/3150)) ([5e69bf2](https://github.com/nuxt/content/commit/5e69bf2f50be61c8dbe8723e4e362c0fabed84d3))
* remove zod from server bundle ([842bcd6](https://github.com/nuxt/content/commit/842bcd670550383d7987d27fa878fc33bfc4572d))
* **renderer:** do not ignore component objects ([#3127](https://github.com/nuxt/content/issues/3127)) ([8a66225](https://github.com/nuxt/content/commit/8a6622543e434ff0d7b08b4800a53ecb4ce514db))
* **type:** register module hooks types ([#3166](https://github.com/nuxt/content/issues/3166)) ([afcf815](https://github.com/nuxt/content/commit/afcf8150d14771bb55a861be899db7495efbe40f))
* **type:** type error on built package ([7be1a2b](https://github.com/nuxt/content/commit/7be1a2b197871697697aaa5fa8eb6c1cee991ce7))
* use a 90 seconds timeout to prevent Cloudflare from timing out ([#3160](https://github.com/nuxt/content/issues/3160)) ([7552090](https://github.com/nuxt/content/commit/755209056e907afa3c014e3272320598994c7c80))

## [3.1.1](https://github.com/nuxt/content/compare/v3.1.0...v3.1.1) (2025-02-11)

### Bug Fixes

* **docs:** use `bindingName` instead of `binding` ([#3109](https://github.com/nuxt/content/issues/3109)) ([311609c](https://github.com/nuxt/content/commit/311609cfff3d2e145bed0e919be511ba51454713))
* don't force pg for vercel ([#3093](https://github.com/nuxt/content/issues/3093)) ([0866008](https://github.com/nuxt/content/commit/086600852227c7704426ae77113a1a0b9a6f4ab2))
* **preset:** allow presets to provide default options ([254fd24](https://github.com/nuxt/content/commit/254fd2453058980124e9566b55fef842457fe3f0))
* **query:** allow uppercase in column names ([#3100](https://github.com/nuxt/content/issues/3100)) ([598dd13](https://github.com/nuxt/content/commit/598dd1354cfec2c5005231387e7dd9e608a72379))
* **vercel:** use `/tmp` directory for sqlite db ([#3108](https://github.com/nuxt/content/issues/3108)) ([bfc58cc](https://github.com/nuxt/content/commit/bfc58ccf2a155b48d8f585ea8bf206f93c801c27))

## [3.1.0](https://github.com/nuxt/content/compare/v3.0.1...v3.1.0) (2025-02-03)

### Features

* `node-sqlite3` connector ([#3032](https://github.com/nuxt/content/issues/3032)) ([1188550](https://github.com/nuxt/content/commit/118855015d36193e03320b12c74534591dc6e788))
* **db:** drop built-in database adapters in favor of db0 connectors ([#3010](https://github.com/nuxt/content/issues/3010)) ([1a7371a](https://github.com/nuxt/content/commit/1a7371a61383d8d2e9b8bde18f89516371e94ef1))
* integrate with NuxtHub database queries ([#3019](https://github.com/nuxt/content/issues/3019)) ([7b480c5](https://github.com/nuxt/content/commit/7b480c5cc638c6781c5e7209787ff93ee0b89acd))
* **module:** extend content transformers ([#3056](https://github.com/nuxt/content/issues/3056)) ([5ac8532](https://github.com/nuxt/content/commit/5ac85329ddeb918b89a2cff34d7c69fbf2f36745))
* **search:** allow filtering contents in search sections ([#3053](https://github.com/nuxt/content/issues/3053)) ([2dc38cf](https://github.com/nuxt/content/commit/2dc38cfcd6eada4aa65d2547d61c5c0b702ba653))

### Bug Fixes

* **changelog:** image size ([7c8e950](https://github.com/nuxt/content/commit/7c8e950a3f78ad8ccaf578ac8d66cc165bb7a58d))
* convert boolean value to number in query condition ([#2927](https://github.com/nuxt/content/issues/2927)) ([#3018](https://github.com/nuxt/content/issues/3018)) ([c11f90a](https://github.com/nuxt/content/commit/c11f90abe020e804de1620320e16d26c6b9dd5bb))
* fix broken install link ([#2990](https://github.com/nuxt/content/issues/2990)) ([b8da5ee](https://github.com/nuxt/content/commit/b8da5ee9f9e8a64dc8735654dc60bd67e9c6c618))
* **highlighter:** support custom languages ([cfc9f43](https://github.com/nuxt/content/commit/cfc9f431d8c3b33377b2a72d8cccc77fbf0091fd)), closes [#3067](https://github.com/nuxt/content/issues/3067)
* **hmr:** ignore sources without `cwd` ([1a8c2bd](https://github.com/nuxt/content/commit/1a8c2bdf85621722251a097d09931b7483185eb5))
* invalid sqlite3 connector resolve ([74dd3e1](https://github.com/nuxt/content/commit/74dd3e18efed2f44b88d1e4bc38674a9002ba3a8))
* migration doc typo ([#3017](https://github.com/nuxt/content/issues/3017)) ([ada613f](https://github.com/nuxt/content/commit/ada613ff32814add0b79e16382018aed86638d68))
* **module:** clone layers to prevent side-effect ([b4e7dec](https://github.com/nuxt/content/commit/b4e7dec2a96c02ec19125af602766bfa04ce6b14))
* **module:** collection detection on windown file-watcher ([#3006](https://github.com/nuxt/content/issues/3006)) ([3807fe9](https://github.com/nuxt/content/commit/3807fe983b925ff39955aeca3b734a90713dda72))
* **module:** content parser error handling ([#3046](https://github.com/nuxt/content/issues/3046)) ([022c385](https://github.com/nuxt/content/commit/022c38588b94b6eb210647734e77a832e6578fe3))
* **module:** remove `scule` from optimizeDps list ([ddb3bc8](https://github.com/nuxt/content/commit/ddb3bc8c4f1726df44474347b1d3e5883fe0204b)), closes [#3042](https://github.com/nuxt/content/issues/3042)
* **nuxthub:** ensure database is enabled ([b46fc37](https://github.com/nuxt/content/commit/b46fc378019d77117e301e0099cf1ca0cd039c6f))
* **nuxthub:** split queries into 1MB chunks ([083a47a](https://github.com/nuxt/content/commit/083a47a1461735a3e0196d04e4df9f828cfc36af))
* parse new content when file is modified ([5dc3429](https://github.com/nuxt/content/commit/5dc342994ede1993c39fbaae3c61dcf812370f20))
* **parser:** de-prioritise code highlighter plugin ([#3009](https://github.com/nuxt/content/issues/3009)) ([dc7d866](https://github.com/nuxt/content/commit/dc7d8661c0f8da9f7022999eb92a480fdcd058af))
* **preview:** draft ready not received event ([a8ee72e](https://github.com/nuxt/content/commit/a8ee72e6aca6d63e32478c014bbc465f129ce545))
* **preview:** handle index file in prefix folder (i18n) ([37d3008](https://github.com/nuxt/content/commit/37d30083a83ed99e7446b49ecf2fb46debffb751))
* **preview:** optimize brace-expansion ([e84e7f4](https://github.com/nuxt/content/commit/e84e7f4f7a5188b18117987dad1a3bc933961e92))
* **preview:** take exclude into account to find collection ([bddd834](https://github.com/nuxt/content/commit/bddd83430667d9852d312325e15c8159a32df417))
* **query:** handle comments and improve single selection ([8de0f14](https://github.com/nuxt/content/commit/8de0f144008d60f3e2f89d9d2e68bd3087a6e136)), closes [#3054](https://github.com/nuxt/content/issues/3054)
* **schema:** mark `ZodMap` as json field ([69a14fa](https://github.com/nuxt/content/commit/69a14faf3b915abccf91e7eb426d385a1ffd5a23))
* **studio:** return when collection not found ([454a22d](https://github.com/nuxt/content/commit/454a22db7143d26b518da0a577994f184a5bff32))
* **template:** demo url ([#2983](https://github.com/nuxt/content/issues/2983)) ([57ee33d](https://github.com/nuxt/content/commit/57ee33daa72dcd3a8e0e83b1c3f5173b4004c932))
* **templates:** handle cors form studio ([06b57ac](https://github.com/nuxt/content/commit/06b57aca8e103a11eae87e12e5a850983492f460))
* **vercel:** default database url ([042c548](https://github.com/nuxt/content/commit/042c5489157702ce832408eb25c8c0fd6a4fda03))
* **wasm:** ignore OPFS warning as Nuxt Content does not depend on it ([5d5506c](https://github.com/nuxt/content/commit/5d5506ce2f478b944bad68e82a09bafe7ced1f55))
* **wasm:** override logger functions ([#3024](https://github.com/nuxt/content/issues/3024)) ([99f5ac9](https://github.com/nuxt/content/commit/99f5ac9e9018e8cc1b8d91f3188659b28de0c95c))

## [3.0.1](https://github.com/nuxt/content/compare/v3.0.0...v3.0.1) (2025-01-27)

### Bug Fixes

* **studio:** return when collection not found ([0e0c8e7](https://github.com/nuxt/content/commit/0e0c8e7f20d2dbaa0d1adad3a833c536bce046fa))
* validate query before execute ([#3048](https://github.com/nuxt/content/issues/3048)) ([0f0da14](https://github.com/nuxt/content/commit/0f0da14bd73370a3ea9bc9957095384e64a1aca4))

## [3.0.0](https://github.com/nuxt/content/compare/v3.0.0-alpha.9...v3.0.0) (2025-01-16)

### Bug Fixes

* **templates:** demo url ([1dd5b21](https://github.com/nuxt/content/commit/1dd5b21c2ac9bdf6e99a04276fb64bd09c641842))

## [3.0.0-alpha.9](https://github.com/nuxt/content/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2025-01-15)

### Features

* **config:** enable watch for all layer configs and load in parallel ([#2929](https://github.com/nuxt/content/issues/2929)) ([c6b3bef](https://github.com/nuxt/content/commit/c6b3befb50f6d7dab28004125315fd23b0d7132b))
* **database:** add support for BunSQLite ([#2944](https://github.com/nuxt/content/issues/2944)) ([db77463](https://github.com/nuxt/content/commit/db7746369d37e0f6803ee9b66c58d9d82c3b0fa7))
* **module:** integrate with unifiedjs VFile ([#2911](https://github.com/nuxt/content/issues/2911)) ([6371a19](https://github.com/nuxt/content/commit/6371a191a59671c59d04a2eab0831d52dbbe0255))
* pre / post parsing hooks ([#2925](https://github.com/nuxt/content/issues/2925)) ([c2c98d8](https://github.com/nuxt/content/commit/c2c98d8fe93b75732d702583b1c25a6de9c78687))
* **sources:** define custom sources ([#2941](https://github.com/nuxt/content/issues/2941)) ([53bf75d](https://github.com/nuxt/content/commit/53bf75d6f2198eca664009032386ddce894de132))
* update import path for shiki languages ([#2942](https://github.com/nuxt/content/issues/2942)) ([f4f68ba](https://github.com/nuxt/content/commit/f4f68ba1317d844621254994367d1566042603ff))

### Bug Fixes

* **docs:** ensure card prose on the homepage matches the correct title ([#2919](https://github.com/nuxt/content/issues/2919)) ([67c57a7](https://github.com/nuxt/content/commit/67c57a7fec82752aa0793e7f4d34c966fe1a7cb2))
* **hooks:** generate missing dirname & extension in vFile ([e048a55](https://github.com/nuxt/content/commit/e048a55aa1ea64cd835fbc6204ac7708015172da)), closes [#2970](https://github.com/nuxt/content/issues/2970)
* **module:**  update dump template on new file creation ([e098115](https://github.com/nuxt/content/commit/e0981155997ffe5e72a6f17cce1cd01812ccca01))
* **module:** mark `build.pathMeta` as optional in module config ([8329a63](https://github.com/nuxt/content/commit/8329a633641ef071dcea86e57b2a752d624d3643))
* **module:** split big sql queries into two ([#2917](https://github.com/nuxt/content/issues/2917)) ([a27dcae](https://github.com/nuxt/content/commit/a27dcae1a6ad09a06d3ff30176f043716f4084a9))
* **navigation:** prevent duplicate nodes ([#2959](https://github.com/nuxt/content/issues/2959)) ([67d6c6b](https://github.com/nuxt/content/commit/67d6c6ba257f4bca2a9599e630c41fa77c32f374))
* **navigation:** respect user defined order ([#2974](https://github.com/nuxt/content/issues/2974)) ([b832033](https://github.com/nuxt/content/commit/b832033ace84633761b3ef8b0cf88fba02a1d516))
* prevent import cache in development ([8ea4de1](https://github.com/nuxt/content/commit/8ea4de1fbb30ba9b5a2ec4ff513a1a7096d5d48d))
* refine json and boolean fields after retrieving content ([#2957](https://github.com/nuxt/content/issues/2957)) ([0dacb1e](https://github.com/nuxt/content/commit/0dacb1ee933972e389402bde0040e7506432f8d5))
* **shiki:** inline codes syntax highlighting ([f124c95](https://github.com/nuxt/content/commit/f124c9538edcd0c7f978a0dcc58cfe399793b929))
* **shiki:** preserve style priority on compress ([b95e807](https://github.com/nuxt/content/commit/b95e807ed69a3f89097f7e7a420031594569c807))
* **sqlite:** remove extra `/` from database filename in windows ([8a9af69](https://github.com/nuxt/content/commit/8a9af695d589649eac7b318270c69534be3ec35c)), closes [#2897](https://github.com/nuxt/content/issues/2897)
* **sqlite:** remove leading `/` from file path ([85010c1](https://github.com/nuxt/content/commit/85010c11c0f622b4eaf2dac138097c32829b5fd1))
* **types:** inject content types to server tsConfig ([203ac90](https://github.com/nuxt/content/commit/203ac906ce17f8f0dffda17ddb2b77fc66998976)), closes [#2968](https://github.com/nuxt/content/issues/2968)
* **typos:** collectionQureyBuilder ([#2953](https://github.com/nuxt/content/issues/2953)) ([71036e2](https://github.com/nuxt/content/commit/71036e2027063c97c48d97c25b11ec72c832f4ab))
* undefined ssr event & and invalid column update ([#2962](https://github.com/nuxt/content/issues/2962)) ([9660776](https://github.com/nuxt/content/commit/966077622e80ddb456ab26cba8c908a604e03266))
* vfile extension format ([12aef72](https://github.com/nuxt/content/commit/12aef7230e9b52f19e70d64479bb44304fb5e3ae))

### Performance Improvements

* reduce zod bundle size ([#2900](https://github.com/nuxt/content/issues/2900)) ([f6e4607](https://github.com/nuxt/content/commit/f6e460712942daff01f71ccdad0ae5916739946c))

## [3.0.0-alpha.8](https://github.com/nuxt/content/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2024-12-09)

### Features

* **build:** allow modifying `slugify` options ([#2898](https://github.com/nuxt/content/issues/2898)) ([d05f0ed](https://github.com/nuxt/content/commit/d05f0edbab6d20b0817ef7d5be6baa2d53cecd63))
* **config:** provide defineContentConfig utility ([#2891](https://github.com/nuxt/content/issues/2891)) ([cf85cd4](https://github.com/nuxt/content/commit/cf85cd4006b6acaa56ea0f3a3150fbf3dcdb882c))
* multi source collection ([acfbe96](https://github.com/nuxt/content/commit/acfbe96a38589ee8de0a5a5b22748033d40035c9))
* **query:** support complex SQL where conditions ([#2878](https://github.com/nuxt/content/issues/2878)) ([7f8f128](https://github.com/nuxt/content/commit/7f8f1285536d1993a15f5081cbc2f68e80570029))
* **studio:** integration ([#2836](https://github.com/nuxt/content/issues/2836)) ([99f6f2f](https://github.com/nuxt/content/commit/99f6f2ff7b58978c40bdd1453e3a1972503ab614))
* support `where` & `order` in navigation & surround utils ([e8df390](https://github.com/nuxt/content/commit/e8df390c4130ce82b7171a513daf3d3de536b404))
* support authentication token for private repositories ([66cd372](https://github.com/nuxt/content/commit/66cd37275239008513bc94ddcc8fe8641389b98d))
* **watch:** watch for cahnges in all local sources ([c5b1a4f](https://github.com/nuxt/content/commit/c5b1a4f85a73f347fbd30c998f333de8d8385603))

### Bug Fixes

* **collection:** path route matching ([8ae885d](https://github.com/nuxt/content/commit/8ae885dd150536f270753739255942e9c801d904))
* **collection:** respect default value in `null` fields ([9fdc4d6](https://github.com/nuxt/content/commit/9fdc4d6371b610cc152daf5b865af3bb2b8a888e))
* **ContentRenderer:** render `empty` slot if body is empty ([c325151](https://github.com/nuxt/content/commit/c3251514a16f50a1d0692324173a016bd3100223)), closes [#2877](https://github.com/nuxt/content/issues/2877)
* correct typos in comments within mergeDraft function ([006c615](https://github.com/nuxt/content/commit/006c615e56ff3fb7c6db3f381661f3ee1be729d3))
* **docs:** prerendering issues ([c9a0cda](https://github.com/nuxt/content/commit/c9a0cda15ff30fbadb88c537059e71474c0c7e7e))
* **hot reload:** normalize files path in windows ([f883273](https://github.com/nuxt/content/commit/f8832736c5d4837615f1b0b9919cc630ac4b53df)), closes [#2872](https://github.com/nuxt/content/issues/2872)
* **lint:** single function argument ([c96fd9d](https://github.com/nuxt/content/commit/c96fd9d54def918aa48127f84c98d8579281a5a1))
* **module:** postgres database types ([36d3b08](https://github.com/nuxt/content/commit/36d3b0871c1049a8c2b6f51aeeedb5476eb8c1f5))
* **navigation:** highlight ([862a8b4](https://github.com/nuxt/content/commit/862a8b457f887851d692b1cc4f1dfca5557c43a6))
* **navigation:** mobile display ([0525e9d](https://github.com/nuxt/content/commit/0525e9d66292ed8836b2c3cfc3d88e831439cdee))
* **preview:** move comment ([72e894e](https://github.com/nuxt/content/commit/72e894e83eab4f4a1c33f7cb252e866d60cdbe35))
* **preview:** prerendering issue on load ([b955f76](https://github.com/nuxt/content/commit/b955f769a19461effb375d505c141bee057e3f75))
* **query:** ensure fields are unique in query ([9b4635e](https://github.com/nuxt/content/commit/9b4635e20c405ccee8ec912d38f4574fc4bd3787))
* **query:** no trailing slash on path ([a2e5c9f](https://github.com/nuxt/content/commit/a2e5c9f44a2c5f11539be5a2668023567a3b2914))
* **renderer:** bundle prose/alias components ([bd9e15b](https://github.com/nuxt/content/commit/bd9e15b530484362158dcc5e4ceda3604b80582a))
* **studio:** find index file collection by route path ([c3f2b9b](https://github.com/nuxt/content/commit/c3f2b9bae5948a135165d44ca71f1ab579d61839))
* **studio:** use minimatch for browser ([a1582b6](https://github.com/nuxt/content/commit/a1582b6eec4904b5f67d45462c3aca331cc2d638))
* **surround:** do not use parent item if it exists as first child ([5810fc6](https://github.com/nuxt/content/commit/5810fc690663c732ab73bc0c91aa5f2aea2be868))
* **surround:** handle missing path ([59c69bc](https://github.com/nuxt/content/commit/59c69bc491d2868d25589c3b71b21e5bb4b751fc))
* **surround:** remove all posible dupplicate paths ([d529996](https://github.com/nuxt/content/commit/d5299960e6e3239a2e36425fb6f9d6d4d8a2c2e3))
* typecheck ([4890997](https://github.com/nuxt/content/commit/48909976e81b7afc065b7cb7dbd5bb81646b7b71))
* typecheck prepack ([dae4149](https://github.com/nuxt/content/commit/dae414978f957d85606aa559c6ade5924940d41c))

### Performance Improvements

* broadcase changes before templates update ([2957772](https://github.com/nuxt/content/commit/295777219a096b9833708ebd3e3c7cf50689b2df))

## [3.0.0-alpha.7](https://github.com/nuxt/content/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2024-11-20)

### Features

* add support for LibSQL ([e345fdc](https://github.com/nuxt/content/commit/e345fdc53deac26bb6397218dfe082b323e6ab2d))
* enable `remark-mdc` automatic unwrap ([b5b7759](https://github.com/nuxt/content/commit/b5b77596c6e17093ee9cb3a5717719d7be1304c9))
* provice default value for seo title & description ([c8d8848](https://github.com/nuxt/content/commit/c8d88489b9124ebc249f5c6077d3714147070140))

### Bug Fixes

* broken util ([89352b8](https://github.com/nuxt/content/commit/89352b85fab74c28e44354fa7130d8a6cadcce6b))
* **build:** do not return database in `dropContentTables` ([668bc15](https://github.com/nuxt/content/commit/668bc157a776362bf6a539b197c322fb100801bc))
* **ContentRenderer:** typo in class props ([e817035](https://github.com/nuxt/content/commit/e81703523c487aacd9fe2d69a18e1c9a87dd18da))
* deprioritise `~/components/content` directory ([0a7077a](https://github.com/nuxt/content/commit/0a7077ab06875f845c2176a31418f561c954c574))
* **deps:** use `@nuxt/content` from workspace ([4d89141](https://github.com/nuxt/content/commit/4d8914115d454047c3ab908f67077ddef96e298c))
* **Dev:** update dump on file modification and deletion ([21a04d7](https://github.com/nuxt/content/commit/21a04d7ec3fb0015f01a01597b6009304ac71f02))
* drop `markdown.mdc` option, plugin can be controlled vie `markdown.remarkPlugins` ([1cf4cbd](https://github.com/nuxt/content/commit/1cf4cbdcef48fa0d82fcff82ec43dedb1d70233c))
* drop `useContentHead` in favor of `useSeoMeta` ([ca78aaf](https://github.com/nuxt/content/commit/ca78aaf4285e775e2b624e9015fd4a9031486062))
* drop content tables to start local server with a clean state ([#2859](https://github.com/nuxt/content/issues/2859)) ([aa4614d](https://github.com/nuxt/content/commit/aa4614d1977be8ab964fab369ca4a7544e87eddf))
* **icons:** use local server bundle ([a440e2f](https://github.com/nuxt/content/commit/a440e2fef3561e224f58191cf513ce4bcf92ba67))
* **source:** do not edit `source.include` ([fa591ff](https://github.com/nuxt/content/commit/fa591ff14d8ab0523d9c71d15eb0d481e1881b21))
* typo ([e0f7bf5](https://github.com/nuxt/content/commit/e0f7bf5bc222f0a424c1f31d77fcf2b3499fd238))
* unshift components dirs to prevent getting prefixed ([8f8b373](https://github.com/nuxt/content/commit/8f8b37397a579df124f83c18056023dfe0955428))
* use version for info collection ([a79040d](https://github.com/nuxt/content/commit/a79040d971110937b930bcd1f9ad010efa2c215b))

## v2.13.4

[compare changes](https://github.com/nuxt/content/compare/v2.13.3...v2.13.4)

### 🏡 Chore

- Upgrade `@nuxtjs/mdc` ([0c462d3f](https://github.com/nuxt/content/commit/0c462d3f))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>

## v2.13.3

[compare changes](https://github.com/nuxt/content/compare/v2.13.2...v2.13.3)

### 🩹 Fixes

- **module:** Allow using `@nuxtjs/mdc` utils via content module ([#2775](https://github.com/nuxt/content/pull/2775))
- **search:** Add `charset=utf-8` to headers of indexed mode ([#2729](https://github.com/nuxt/content/pull/2729))
- **docs:** Add warning about using `ssr: false` with Content ([#2776](https://github.com/nuxt/content/pull/2776))
- Corrected .gradient class ([#2723](https://github.com/nuxt/content/pull/2723))
- **build:** Keep parser deps out of main bundle ([#2780](https://github.com/nuxt/content/pull/2780))
- **navigation:** Respect query locale ([#2772](https://github.com/nuxt/content/pull/2772))
- Import `defineNitroPlugin` from `#imports` ([34f65172](https://github.com/nuxt/content/commit/34f65172))
- Respect `draft` key as `_draft` ([#2738](https://github.com/nuxt/content/pull/2738))
- Draft field order ([b0b5eb2d](https://github.com/nuxt/content/commit/b0b5eb2d))

### 📖 Documentation

- Fix incorrect TS types import path in documentation ([#2773](https://github.com/nuxt/content/pull/2773))
- Missing imports and typo in code blocks ([#2741](https://github.com/nuxt/content/pull/2741))
- Changed types path ([#2735](https://github.com/nuxt/content/pull/2735))
- Fix typo in SSR warning on Installation page ([#2777](https://github.com/nuxt/content/pull/2777))
- Update link to downloads count badge ([c1d6ad14](https://github.com/nuxt/content/commit/c1d6ad14))

### 🏡 Chore

- Upgrade deps ([18aa97ea](https://github.com/nuxt/content/commit/18aa97ea))
- Upgrade `@nuxtjs/mdc` ([#2781](https://github.com/nuxt/content/pull/2781))
- Upgrade `@nuxtjs/mdc` ([664ac088](https://github.com/nuxt/content/commit/664ac088))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>
- Bean Deng 邓斌 ([@HADB](http://github.com/HADB))
- Sébastien Chopin ([@atinux](http://github.com/atinux))
- EJ Fox ([@ejfox](http://github.com/ejfox))
- Oh My Neck ([@hi-zp](http://github.com/hi-zp))
- Michael DeLally ([@mdelally](http://github.com/mdelally))
- RollingTL ([@RollingTL](http://github.com/RollingTL))
- Aditya Mathur ([@MathurAditya724](http://github.com/MathurAditya724))
- 邓超 <2325690622@qq.com>
- Vilius Paliokas ([@ViliusP](http://github.com/ViliusP))

## v2.13.2

[compare changes](https://github.com/nuxt/content/compare/v2.13.1...v2.13.2)

### 🚀 Enhancements

- **home:** Update studio section ([#2696](https://github.com/nuxt/content/pull/2696))
- **landing:** Design review ([#2703](https://github.com/nuxt/content/pull/2703))

### 🩹 Fixes

- Add string type to gt/lt/gte/lte type definitions ([#2704](https://github.com/nuxt/content/pull/2704))
- **search:** Non-md file might not have dscription file ([#2706](https://github.com/nuxt/content/pull/2706))
- **module:** Disable MDC plugin if user disabled it ([#2707](https://github.com/nuxt/content/pull/2707))
- Unwatch storage on nitro `close` ([ec7105ad](https://github.com/nuxt/content/commit/ec7105ad))

### 📖 Documentation

- Add missing `await` for searchContent docs ([#2692](https://github.com/nuxt/content/pull/2692))
- Prerender home ([4253f0bf](https://github.com/nuxt/content/commit/4253f0bf))
- Update `nuxt-og-image` and add `postinstall` script ([#2705](https://github.com/nuxt/content/pull/2705))
- Update ContentSlot Documentation ([#2713](https://github.com/nuxt/content/pull/2713))

### 🤖 CI

- Add stale action ([99f6060b](https://github.com/nuxt/content/commit/99f6060b))
- Update stale.yml ([225ff460](https://github.com/nuxt/content/commit/225ff460))
- Update stale.yml ([964857d4](https://github.com/nuxt/content/commit/964857d4))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>
- Jacob Strong ([@jacstrong](http://github.com/jacstrong))
- Damien Guard <damien@envytech.co.uk>
- Florent Delerue <florentdelerue@hotmail.com>
- Benjamin Canac ([@benjamincanac](http://github.com/benjamincanac))
- Brock Wilcox ([@awwaiid](http://github.com/awwaiid))

## v2.13.1

[compare changes](https://github.com/nuxt/content/compare/v2.13.0...v2.13.1)

### 🔥 Performance

- **dev-cache:** Improve localhost markdown page navigation performance (when having 2,000+ pages) ([#2675](https://github.com/nuxt/content/pull/2675))

### 🩹 Fixes

- **module:** Do not force prerender index page ([#2681](https://github.com/nuxt/content/pull/2681))
- Hot reload on dev server for documentDriven: false ([#2686](https://github.com/nuxt/content/pull/2686))

### 📖 Documentation

- Typo in configuration ([#2677](https://github.com/nuxt/content/pull/2677))
- Add missing await keyword in search documentation ([#2687](https://github.com/nuxt/content/pull/2687))

### 🏡 Chore

- Upgrade deps ([3fb379a6](https://github.com/nuxt/content/commit/3fb379a6))
- Remove `@nuxt/ui` resolution ([29fd1489](https://github.com/nuxt/content/commit/29fd1489))

### ❤️ Contributors

- Roman Lossa <roman.lossa@lycorp.co.jp>
- Bogdan Gradinariu ([@gion](http://github.com/gion))
- Farnabaz <farnabaz@gmail.com>
- Gareth <gareth@redfern.dev>

## v2.13.0

[compare changes](https://github.com/nuxt/content/compare/v2.12.1...v2.13.0)

### 🚀 Enhancements

- Top level `content/` directory in Nuxt 4 compatibility version ([#2649](https://github.com/nuxt/content/pull/2649))

### 🩹 Fixes

- Optimise nested dependencies ([#2583](https://github.com/nuxt/content/pull/2583))
- Opt in to `import.meta.*` properties ([#2597](https://github.com/nuxt/content/pull/2597))
- Ignore unsupported files from contents list ([#2607](https://github.com/nuxt/content/pull/2607))
- **module:** Convert `content-slot` to `MDCSlot` ([#2632](https://github.com/nuxt/content/pull/2632))
- Fix typo in logger warning message ([#2626](https://github.com/nuxt/content/pull/2626))
- **search:** Keep page's beginning paragraphs ([#2658](https://github.com/nuxt/content/pull/2658))
- Add Nitro hooks types declarations ([#2655](https://github.com/nuxt/content/pull/2655))
- Filter draft files in production ([#2648](https://github.com/nuxt/content/pull/2648))
- **search:** Use page title as default title for sections ([9d81acc2](https://github.com/nuxt/content/commit/9d81acc2))
- Init storage only when used ([#2670](https://github.com/nuxt/content/pull/2670))
- Use runtimeconfig only when necessary ([6f06f356](https://github.com/nuxt/content/commit/6f06f356))
- Do not update `devDependencies` ([062fb97f](https://github.com/nuxt/content/commit/062fb97f))
- **search:** Improve sections with root node ([#2672](https://github.com/nuxt/content/pull/2672))
- **prerender:** Ensure `/` exists inside prerender rotues ([#2673](https://github.com/nuxt/content/pull/2673))

### 📖 Documentation

- Update to @nuxt/fonts ([40b3a070](https://github.com/nuxt/content/commit/40b3a070))
- Update ui-pro ui props ([#2585](https://github.com/nuxt/content/pull/2585))
- Use new `nuxi module add` command in installation ([#2603](https://github.com/nuxt/content/pull/2603))
- Add multiple slots example ([#2619](https://github.com/nuxt/content/pull/2619))
- Better excerpt description ([#2633](https://github.com/nuxt/content/pull/2633))
- Update version ([cc894eb2](https://github.com/nuxt/content/commit/cc894eb2))
- Resolution for nuxt/ui ([b581635e](https://github.com/nuxt/content/commit/b581635e))
- Fix and update transformers ([#2639](https://github.com/nuxt/content/pull/2639))
- Fix social card in README ([#2659](https://github.com/nuxt/content/pull/2659))

### 🏡 Chore

- Upgrade deps & linter ([#2611](https://github.com/nuxt/content/pull/2611))
- Indicate compatibility with new v4 major ([#2667](https://github.com/nuxt/content/pull/2667))
- Upgrade deps ([62805914](https://github.com/nuxt/content/commit/62805914))
- Prepare script ([39671369](https://github.com/nuxt/content/commit/39671369))
- Upgrade deps ([cc4f4152](https://github.com/nuxt/content/commit/cc4f4152))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>
- Benjamin Canac ([@benjamincanac](http://github.com/benjamincanac))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Gangan ([@shinGangan](http://github.com/shinGangan))
- Roryc ([@Coiggahou2002](http://github.com/Coiggahou2002))
- Jakub Sova ([@owljackob](http://github.com/owljackob))
- Corn <nice.corn.huang@gmail.com>
- Cameron Childress ([@cameroncf](http://github.com/cameroncf))
- RollingTL ([@RollingTL](http://github.com/RollingTL))
- Arash ([@arashsheyda](http://github.com/arashsheyda))

## v2.12.1

[compare changes](https://github.com/nuxt/content/compare/v2.12.0...v2.12.1)

### 🩹 Fixes

- Missing import ([#2560](https://github.com/nuxt/content/pull/2560))
- **types:** Use const type parameter for QueryBuilder only ([#2546](https://github.com/nuxt/content/pull/2546))
- Split `getContent` to chunks in `getIndexedContentsList` ([#2354](https://github.com/nuxt/content/pull/2354), [#2549](https://github.com/nuxt/content/pull/2549))
- **types:** Add const type parameter for QueryBuilder.only() and .without() ([#2573](https://github.com/nuxt/content/pull/2573))

### 📖 Documentation

- Typo in  showURL prop ([#2537](https://github.com/nuxt/content/pull/2537))
- Add descriptions of all match operators ([#2552](https://github.com/nuxt/content/pull/2552))
- Update `highlight.langs` defaults ([#2559](https://github.com/nuxt/content/pull/2559))

### 🏡 Chore

- Fix Nuxt extends in renovate.json ([#2567](https://github.com/nuxt/content/pull/2567))
- Upgrade `@nuxtjs/mdc` ([8a176f93](https://github.com/nuxt/content/commit/8a176f93))

### ❤️ Contributors

- Farnabaz ([@farnabaz](http://github.com/farnabaz))
- Gangan ([@shinGangan](http://github.com/shinGangan))
- Thunfisch987 ([@thunfisch987](http://github.com/thunfisch987))
- Aldo ([@comanche2](http://github.com/comanche2))
- Alex Liu ([@Mini-ghost](http://github.com/Mini-ghost))
- Romain 'Maz' BILLOIR <romainb@octobercms.fr>
- Wolfgang Drescher <drescher.wolfgang+git@gmail.com>
- Mathieu NICOLAS ([@mathieunicolas](http://github.com/mathieunicolas))

## v2.12.0

[compare changes](https://github.com/nuxt/content/compare/v2.11.0...v2.12.0)

### 🚀 Enhancements

- Adopt to mdc v0.4 ([#2539](https://github.com/nuxt/content/pull/2539))

### 🔥 Performance

- **content-list:** Cache contents list during generation and per-request ([#2527](https://github.com/nuxt/content/pull/2527))

### 🩹 Fixes

- **module:** Handle former props in ContentSlot transformer ([#2525](https://github.com/nuxt/content/pull/2525))
- **client-db:** Fetch dir config on legacy query ([4b9b6b7a](https://github.com/nuxt/content/commit/4b9b6b7a))
- **navigation:** Ignore extensions on navigation sort ([#2529](https://github.com/nuxt/content/pull/2529))

### 📖 Documentation

- Add `highlight.langs` ([61f6cda9](https://github.com/nuxt/content/commit/61f6cda9))

### 🏡 Chore

- **tw-support:** Get cssPath from array ([#2501](https://github.com/nuxt/content/pull/2501))
- Missing imports in playground ([e7e082c3](https://github.com/nuxt/content/commit/e7e082c3))
- Upgrade `@nuxtjs/mdc` ([d3437082](https://github.com/nuxt/content/commit/d3437082))

### ❤️ Contributors

- Farnabaz ([@farnabaz](http://github.com/farnabaz))
- Anthony Fu <anthonyfu117@hotmail.com>
- Inesh Bose <dev@inesh.xyz>

## v2.11.0

[compare changes](https://github.com/nuxt/content/compare/v2.10.0...v2.11.0)

### 🩹 Fixes

- **types:** Fields in `experimental.search` can be optional ([#2506](https://github.com/nuxt/content/pull/2506))
- **ContentSlot:** Detect multiline usage ([#2508](https://github.com/nuxt/content/pull/2508))

### 📖 Documentation

- Fix component name ([#2482](https://github.com/nuxt/content/pull/2482))
- Search result variable name ([#2485](https://github.com/nuxt/content/pull/2485))
- Updates ([d41902ad](https://github.com/nuxt/content/commit/d41902ad))
- Mention that `searchContent` is an experimental feature ([#2505](https://github.com/nuxt/content/pull/2505))
- Add carbon ads ([77163e4b](https://github.com/nuxt/content/commit/77163e4b))

### 📦 Build

- Do not emit `.mjs` in runtime directory ([#2514](https://github.com/nuxt/content/pull/2514))

### 🏡 Chore

- Move to `shikiji` for types ([#2495](https://github.com/nuxt/content/pull/2495))
- Remove unused argument ([#2496](https://github.com/nuxt/content/pull/2496))
- **dx:** Remove caching for dev HMR ([78e1eebe](https://github.com/nuxt/content/commit/78e1eebe))

### ❤️ Contributors

- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Daniel Roe <daniel@roe.dev>
- Farnabaz ([@farnabaz](http://github.com/farnabaz))
- Anthony Fu <anthonyfu117@hotmail.com>
- Adam DeHaven

## v2.10.0

[compare changes](https://github.com/nuxt/content/compare/v2.9.0...v2.10.0)

### 🚀 Enhancements

- Add homepage on package.json ([#2413](https://github.com/nuxt/content/pull/2413))
- **api:** Cache api endpoints ([d2bcf70f](https://github.com/nuxt/content/commit/d2bcf70f))

### 🩹 Fixes

- Add missing imports for search ([#2412](https://github.com/nuxt/content/pull/2412))
- Import nuxt composables from #imports ([#2418](https://github.com/nuxt/content/pull/2418))
- 7.search-content.md typo ([7bf89960](https://github.com/nuxt/content/commit/7bf89960))
- Enable cache only for clientDb ([#2425](https://github.com/nuxt/content/pull/2425))
- Remove d.ts ([#2427](https://github.com/nuxt/content/pull/2427))
- Ensure `bundler` module resolution works with runtime type imports ([#2470](https://github.com/nuxt/content/pull/2470))
- Imports ([f33f5a20](https://github.com/nuxt/content/commit/f33f5a20))

### 📖 Documentation

- Use mdc syntax highlight ([7dcbf130](https://github.com/nuxt/content/commit/7dcbf130))
- Small typo ([3ec3de44](https://github.com/nuxt/content/commit/3ec3de44))
- Update index.yml ([1f06910c](https://github.com/nuxt/content/commit/1f06910c))
- Costum components ([#2433](https://github.com/nuxt/content/pull/2433))
- Missing padding on body ([746cfce8](https://github.com/nuxt/content/commit/746cfce8))
- Update README.md ([1ce6953f](https://github.com/nuxt/content/commit/1ce6953f))
- Add templates link ([6dcf4645](https://github.com/nuxt/content/commit/6dcf4645))

### 🏡 Chore

- **perf:** Leverage ISR instead for query caching ([dee73c67](https://github.com/nuxt/content/commit/dee73c67))
- Remove routeRules added ([6b94f131](https://github.com/nuxt/content/commit/6b94f131))
- **perf:** Leverage ISR instead for query caching" ([6a56986c](https://github.com/nuxt/content/commit/6a56986c))
- Upgrade @nuxtjs/mdc^0.3.0 ([8c442665](https://github.com/nuxt/content/commit/8c442665))
- Remove `ts-ignore` as unstorage has fixed subpath export ([#2472](https://github.com/nuxt/content/pull/2472))
- Test bundler module resolution ([#2474](https://github.com/nuxt/content/pull/2474))

### ❤️ Contributors

- Daniel Roe <daniel@roe.dev>
- Farnabaz ([@farnabaz](http://github.com/farnabaz))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Estéban <e.soubiran25@gmail.com>
- Adityawarman Dewa Putra <devdewa123.sp@gmail.com>
- Benjamin Canac ([@benjamincanac](http://github.com/benjamincanac))
- Lukasz Szymanski <lukasz.szymansky@gmail.com>
- Erouax 
- Cosmin Popovici 
- Adam DeHaven 
- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))

## v2.9.0

[compare changes](https://github.com/nuxt/content/compare/v2.8.5...v2.9.0)

### 🚀 Enhancements

- Add type to layout ([#2389](https://github.com/nuxt/content/pull/2389))
- Add search ([#2146](https://github.com/nuxt/content/pull/2146))

### 🩹 Fixes

- **path-meta:** Prevent `undefined` error ([1257cb5c](https://github.com/nuxt/content/commit/1257cb5c))
- Types import ([ee4ea3ad](https://github.com/nuxt/content/commit/ee4ea3ad))
- Ignore regexes in fetchDirConfig ([#2362](https://github.com/nuxt/content/pull/2362))
- Optional experimental options ([#2391](https://github.com/nuxt/content/pull/2391))
- Update types and imports ([061192c5](https://github.com/nuxt/content/commit/061192c5))
- Prevent duplicate parses ([a208567e](https://github.com/nuxt/content/commit/a208567e))
- Prevent duplicate parses ([dae92681](https://github.com/nuxt/content/commit/dae92681))

### 📖 Documentation

- Update to latest ui-pro ([a08dc1b8](https://github.com/nuxt/content/commit/a08dc1b8))
- Remove global style ([e58855fb](https://github.com/nuxt/content/commit/e58855fb))
- Add terms ([798a0a8c](https://github.com/nuxt/content/commit/798a0a8c))
- Add data pops in ContentRendererMarkdown and varaibles binding ([#2360](https://github.com/nuxt/content/pull/2360))
- Update examples for content helpers composable ([b6ff9ba2](https://github.com/nuxt/content/commit/b6ff9ba2))
- Upgrade deps ([feca11b6](https://github.com/nuxt/content/commit/feca11b6))
- Improve home ([fe357920](https://github.com/nuxt/content/commit/fe357920))
- Add links for shiki on home ([#2386](https://github.com/nuxt/content/pull/2386))
- Update highlight.preload config ([#2395](https://github.com/nuxt/content/pull/2395))
- Grammatical tweaks on markdown page ([#2394](https://github.com/nuxt/content/pull/2394))
- Update bindings with default value ([#2397](https://github.com/nuxt/content/pull/2397))
- Update 3.search.md ([40a2e5de](https://github.com/nuxt/content/commit/40a2e5de))

### ❤️ Contributors

- Farnabaz ([@farnabaz](http://github.com/farnabaz))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Estéban <e.soubiran25@gmail.com>
- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))
- AaronBeaudoin <aaronjbeaudoin@gmail.com>
- Ashour <ashour.mohammad@gmail.com>
- Mathieu NICOLAS 
- Benjamin Canac ([@benjamincanac](http://github.com/benjamincanac))
- Vincent Giersch <vincent@giersch.fr>

## v2.8.5

[compare changes](https://github.com/nuxt/content/compare/v2.8.4...v2.8.5)

### 🩹 Fixes

- **prose-pre:** `style` prop type ([1edb3501](https://github.com/nuxt/content/commit/1edb3501))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>

## v2.8.4

[compare changes](https://github.com/nuxt/content/compare/v2.8.3...v2.8.4)

### 🩹 Fixes

- **prose-pre:** Only wrap `slot` in `pre` ([#2348](https://github.com/nuxt/content/pull/2348))

### ❤️ Contributors

- Farnabaz <farnabaz@gmail.com>

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
