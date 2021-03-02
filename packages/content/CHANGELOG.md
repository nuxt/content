# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.14.0](https://github.com/nuxt/content/compare/@nuxt/content@1.13.1...@nuxt/content@1.14.0) (2021-03-02)


### Bug Fixes

* **content:** avoid using commonjs for runtime (vite support) ([#805](https://github.com/nuxt/content/issues/805)) ([8de3e12](https://github.com/nuxt/content/commit/8de3e12759c37f6ff74d52c6174e8d099742e833))
* **content:** handle readable ended request ([#790](https://github.com/nuxt/content/issues/790)) ([7660d0f](https://github.com/nuxt/content/commit/7660d0fff4ef66c04ef20256251f94eb4457734b))
* **content:** remove flatmap to support node v10 ([#770](https://github.com/nuxt/content/issues/770)) ([21635e2](https://github.com/nuxt/content/commit/21635e2488c9edb899ab3dbffbcc93e6dd9a3b82))
* **content, theme-docs:** disable pathPrefix for nuxt 2.15 compat ([#804](https://github.com/nuxt/content/issues/804)) ([a93dcf4](https://github.com/nuxt/content/commit/a93dcf448355e90df4cf2a6f1f3a4977e2b786d8))


### Features

* **content:** pass document data to remark plugins ([#782](https://github.com/nuxt/content/issues/782)) ([ed56f5a](https://github.com/nuxt/content/commit/ed56f5a4c8cf5fc8b6fb7711b769b882fd73bee1))





## [1.13.1](https://github.com/nuxt/content/compare/@nuxt/content@1.13.0...@nuxt/content@1.13.1) (2021-02-10)


### Bug Fixes

* **content:** handle empty lang ([#765](https://github.com/nuxt/content/issues/765)) ([60e758c](https://github.com/nuxt/content/commit/60e758c6f1e7bff4de37f3a499284139db0a7d60))





# [1.13.0](https://github.com/nuxt/content/compare/@nuxt/content@1.12.0...@nuxt/content@1.13.0) (2021-02-10)


### Bug Fixes

* use top 2 level of nodes to generate toc ([#757](https://github.com/nuxt/content/issues/757)) ([fe4de6b](https://github.com/nuxt/content/commit/fe4de6bf09bb025878975706de4c0a2f8edbd516))
* **test:** update highlighter snapshots ([32f9f8f](https://github.com/nuxt/content/commit/32f9f8fedb1f4a6d849acaa60124bfa9f0545868))


### Features

* use diff-highlight plugin ([#755](https://github.com/nuxt/content/issues/755)) ([3c2186a](https://github.com/nuxt/content/commit/3c2186a9005c37b3b668ff0124aa77f80c989b85))





# [1.12.0](https://github.com/nuxt/content/compare/@nuxt/content@1.11.1...@nuxt/content@1.12.0) (2021-01-29)


### Bug Fixes

* **content:** codeblock parse lang should support other meta ([#691](https://github.com/nuxt/content/issues/691)) ([881f6d4](https://github.com/nuxt/content/commit/881f6d49a30c67c9151872b81771a185e393d986))
* **content:** failed ci on windows and enhance file name detection regex ([#680](https://github.com/nuxt/content/issues/680)) ([f445444](https://github.com/nuxt/content/commit/f445444b277d93ef5b9376bb1a031643d4c0329e))
* **content:** optional search parameter condition ([de4c860](https://github.com/nuxt/content/commit/de4c8607239b3e7ff1605bba698e9ef5c9bd242f))
* **types:** change types ([#732](https://github.com/nuxt/content/issues/732)) ([a6274e4](https://github.com/nuxt/content/commit/a6274e482947dc177c795cc00867aa266bd91ddb))
* properly treat falsy values in context ([#685](https://github.com/nuxt/content/issues/685)) ([228f7e0](https://github.com/nuxt/content/commit/228f7e04a5d7a5742ca92617f48ae04b98e9b277))


### Features

* **content:** improve reactivity ([#688](https://github.com/nuxt/content/issues/688)) ([1fbcbbc](https://github.com/nuxt/content/commit/1fbcbbcd20f46b360cd8476c0de53c79fb4c20cd))
* **content:** Optional search parameter ([#733](https://github.com/nuxt/content/issues/733)) ([db3fd67](https://github.com/nuxt/content/commit/db3fd67f08ff18b480b1d4afbc1269c4220995e7))
* add path for custom parsers ([#656](https://github.com/nuxt/content/issues/656)) ([955cf9f](https://github.com/nuxt/content/commit/955cf9fe1074bcc740e8e0c9695760a04703e961))
* sort by score (most relevant first) when searching ([#671](https://github.com/nuxt/content/issues/671)) ([1936a0e](https://github.com/nuxt/content/commit/1936a0eee5b929c04c666097453ef27adde7ca21))
* **content/theme-docs:** support surround by path ([#660](https://github.com/nuxt/content/issues/660)) ([92599e0](https://github.com/nuxt/content/commit/92599e0fc3910da53560e82b9bceb8a118568d84))





## [1.11.1](https://github.com/nuxt/content/compare/@nuxt/content@1.11.0...@nuxt/content@1.11.1) (2020-11-25)


### Bug Fixes

* [#653](https://github.com/nuxt/content/issues/653) - remark-gfm dependency added to manage markdown tables ([#654](https://github.com/nuxt/content/issues/654)) ([5a5c6ac](https://github.com/nuxt/content/commit/5a5c6ac06698c98972fa3053a1a66ca7202af144))





# [1.11.0](https://github.com/nuxt/content/compare/@nuxt/content@1.10.0...@nuxt/content@1.11.0) (2020-11-19)


### Bug Fixes

* **content:** add missing types ([#625](https://github.com/nuxt/content/issues/625)) ([43e5a81](https://github.com/nuxt/content/commit/43e5a819e55fa65b3b9ffc0610e3a2206a356e48))
* **content:** update highlighter spec ([8108f84](https://github.com/nuxt/content/commit/8108f84bf94727d7cb9d786c775e0b9c502d4d0f))
* set header to empty string if undefined ([#620](https://github.com/nuxt/content/issues/620)) ([5bffdf1](https://github.com/nuxt/content/commit/5bffdf11d5b499829fcb389db29c9c0f316be3ac)), closes [#136](https://github.com/nuxt/content/issues/136)
* **content:** support space after codeblock for filename ([#621](https://github.com/nuxt/content/issues/621)) ([9d900ff](https://github.com/nuxt/content/commit/9d900ff648c96aa0454986819cb31b374b451ecc))


### Features

* support dynamic table of contents ([#600](https://github.com/nuxt/content/issues/600)) ([5cf18c4](https://github.com/nuxt/content/commit/5cf18c41b3b383a4989db5eae775feb9ddf409d0))
* **lib:** support markdown excerpt ([#607](https://github.com/nuxt/content/issues/607)) ([b453ea8](https://github.com/nuxt/content/commit/b453ea8e22258a664de93ec29c71229b17bf9fd1))





# [1.10.0](https://github.com/nuxt/content/compare/@nuxt/content@1.9.0...@nuxt/content@1.10.0) (2020-10-12)


### Bug Fixes

* avoid registering `components/global` when not exists ([#548](https://github.com/nuxt/content/issues/548)) ([843a5f9](https://github.com/nuxt/content/commit/843a5f9d26af68d1d29c448e58fdc7991778ed05))
* Included types folder in files ([#525](https://github.com/nuxt/content/issues/525)) ([a42e866](https://github.com/nuxt/content/commit/a42e866df271b371767338d732cb54b45fd452db))
* Incorrect type for fetch which returns a promise ([#518](https://github.com/nuxt/content/issues/518)) ([c20345a](https://github.com/nuxt/content/commit/c20345af3b30fd12b951133457348c3fbc988132))
* **content:** fix tab key handling of editor component with IME ([#509](https://github.com/nuxt/content/issues/509)) ([c5c5e02](https://github.com/nuxt/content/commit/c5c5e02497f761f59a8299f3d54ab9b54abe77eb))


### Features

* **content:** handle json arrays ([#486](https://github.com/nuxt/content/issues/486)) ([f29daac](https://github.com/nuxt/content/commit/f29daac5dfdcd79d2401522e31b69bd39ea75f32))





# [1.9.0](https://github.com/nuxt/content/compare/@nuxt/content@1.8.1...@nuxt/content@1.9.0) (2020-09-15)


### Bug Fixes

* **types:** remark plugins and rehype plugins should accept options in array syntax ([#462](https://github.com/nuxt/content/issues/462)) ([460b0c5](https://github.com/nuxt/content/commit/460b0c537961fdc53259f058c35a5970ea97bfdd)), closes [/github.com/nuxt/content/blob/711913c4772a9aad442f093eb4ddc822771e873f/packages/content/lib/utils.js#L46-L48](https://github.com//github.com/nuxt/content/blob/711913c4772a9aad442f093eb4ddc822771e873f/packages/content/lib/utils.js/issues/L46-L48)


### Features

* **content:** add custom highlighter ([#467](https://github.com/nuxt/content/issues/467)) ([9e1d0bd](https://github.com/nuxt/content/commit/9e1d0bd85e2bef64a7a9d42dee9ffadc559e60c6))
* add content:file:beforeParse hook ([#453](https://github.com/nuxt/content/issues/453)) ([f7ac58d](https://github.com/nuxt/content/commit/f7ac58de9b743cb58fe9b7a7ab81795c4dbf3e3b))
* Added more types following [#443](https://github.com/nuxt/content/issues/443) and [#421](https://github.com/nuxt/content/issues/421) ([#444](https://github.com/nuxt/content/issues/444)) ([6a43bd2](https://github.com/nuxt/content/commit/6a43bd2e89222953a6886654752d0d001e72efea))





## [1.8.1](https://github.com/nuxt/content/compare/@nuxt/content@1.8.0...@nuxt/content@1.8.1) (2020-09-03)


### Bug Fixes

* add other missing dependencies ([39fd508](https://github.com/nuxt/content/commit/39fd5081e277dffd4f4aaff82207fb43e135c53f))





# [1.8.0](https://github.com/nuxt/content/compare/@nuxt/content@1.7.1...@nuxt/content@1.8.0) (2020-09-03)


### Bug Fixes

* missing package detab ([#449](https://github.com/nuxt/content/issues/449)) ([4cca0cb](https://github.com/nuxt/content/commit/4cca0cbac4405652d7aab454086a820404e2ec10))


### Features

* add database as second argument for beforeInsert ([#442](https://github.com/nuxt/content/issues/442)) ([90c638d](https://github.com/nuxt/content/commit/90c638d153394a284fa387f3ab868989b901b4f9))





## [1.7.1](https://github.com/nuxt/content/compare/@nuxt/content@1.7.0...@nuxt/content@1.7.1) (2020-08-31)


### Bug Fixes

* **content:** Offline mode ([#429](https://github.com/nuxt/content/issues/429)) ([277da7d](https://github.com/nuxt/content/commit/277da7d33deba4c2e5a6f6b9a25e2432d92c3b7a)), closes [#229](https://github.com/nuxt/content/issues/229)
* **content:** write db.json with hash ([#438](https://github.com/nuxt/content/issues/438)) ([0a8ed35](https://github.com/nuxt/content/commit/0a8ed35ccb72193e755aa63feb35b258cd03e921))





# [1.7.0](https://github.com/nuxt/content/compare/@nuxt/content@1.6.1...@nuxt/content@1.7.0) (2020-08-25)


### Bug Fixes

* **content:** use defu.arrayFn instead of custom merger ([#408](https://github.com/nuxt/content/issues/408)) ([9e5ba55](https://github.com/nuxt/content/commit/9e5ba558782a70269997576ed4c4242af3d0e87c))
* **types:** fix typing error ([#409](https://github.com/nuxt/content/issues/409)) ([23a84f8](https://github.com/nuxt/content/commit/23a84f81f00fa6e3c09a26cbf97a5530c79f9576))


### Features

* add custom editor API ([#312](https://github.com/nuxt/content/issues/312)) ([78fbb92](https://github.com/nuxt/content/commit/78fbb92ace7934fc15781dc592dfd2722670897a))





## [1.6.1](https://github.com/nuxt/content/compare/@nuxt/content@1.6.0...@nuxt/content@1.6.1) (2020-08-17)

**Note:** Version bump only for package @nuxt/content





# [1.6.0](https://github.com/nuxt/content/compare/@nuxt/content@1.5.3...@nuxt/content@1.6.0) (2020-08-06)


### Bug Fixes

* **content:** options were not forwarded in plugin static lazy ([#350](https://github.com/nuxt/content/issues/350)) ([36ef2e3](https://github.com/nuxt/content/commit/36ef2e39a14ce8f71d9d5ea5fcd22c91c2268f83))
* **content:** use `property-information` to convert hast attributes ([#359](https://github.com/nuxt/content/issues/359)) ([58061e0](https://github.com/nuxt/content/commit/58061e02369e3d48419b83886c02d6f29f968945))


### Features

* better typescript typings ([#327](https://github.com/nuxt/content/issues/327)) ([8d9f47c](https://github.com/nuxt/content/commit/8d9f47c38e92d8d0348d3aed6eb30d65356885b3))
* new create-nuxt-content-docs package ([#336](https://github.com/nuxt/content/issues/336)) ([34439eb](https://github.com/nuxt/content/commit/34439eb1c339c47e00280a139f8fe5725841751f))





## [1.5.3](https://github.com/nuxt/content/compare/@nuxt/content@1.5.2...@nuxt/content@1.5.3) (2020-08-01)


### Bug Fixes

* **content:** remove cycle dependency ([7700762](https://github.com/nuxt/content/commit/77007624fe179b4c3e66da5b2cc257b13d19eda7))





# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/nuxt/content/compare/v1.4.1...v1.5.0) (2020-07-27)


### Features

* **lib:** handle textarea tab / shift tab events ([#289](https://github.com/nuxt/content/issues/289)) ([67b0da7](https://github.com/nuxt/content/commit/67b0da722bb7d41ed9a4ec7eef99e146062eaaee))
* add classes for live editing ([#258](https://github.com/nuxt/content/issues/258)) ([ebc6123](https://github.com/nuxt/content/commit/ebc6123d924bf89c0c4dfbde833bf6fbdd46b675))
* add option to disable live edit ([#285](https://github.com/nuxt/content/issues/285)) ([d46daaf](https://github.com/nuxt/content/commit/d46daaf07a2bf5667e265b9af133842d03948fa9))
* add user defined parsers ([#256](https://github.com/nuxt/content/issues/256)) ([502bd26](https://github.com/nuxt/content/commit/502bd2647fbe09b61da6a63c848a926abaca179a)), closes [#230](https://github.com/nuxt/content/issues/230) [#234](https://github.com/nuxt/content/issues/234) [#235](https://github.com/nuxt/content/issues/235) [#238](https://github.com/nuxt/content/issues/238) [#242](https://github.com/nuxt/content/issues/242) [#243](https://github.com/nuxt/content/issues/243) [#245](https://github.com/nuxt/content/issues/245) [#230](https://github.com/nuxt/content/issues/230) [#234](https://github.com/nuxt/content/issues/234) [#235](https://github.com/nuxt/content/issues/235) [#238](https://github.com/nuxt/content/issues/238) [#242](https://github.com/nuxt/content/issues/242) [#243](https://github.com/nuxt/content/issues/243)


### Bug Fixes

* improve nuxt-content attrs handling ([#223](https://github.com/nuxt/content/issues/223)) ([02ad923](https://github.com/nuxt/content/commit/02ad923712a8054cad3162f0a0d77723cfca4862))
* prevent options merging fn exec without default value ([#287](https://github.com/nuxt/content/issues/287)) ([3252f39](https://github.com/nuxt/content/commit/3252f3989577838d30029c037ac3889eac16b93f))
* **lib:** ensure `path` and `extension` on dev mode ([#280](https://github.com/nuxt/content/issues/280)) ([81a151f](https://github.com/nuxt/content/commit/81a151f51bb362ffbfa231c15ede09af1e9eb1a1))
* **lib:** improve toc heading parse ([#279](https://github.com/nuxt/content/issues/279)) ([d6a5920](https://github.com/nuxt/content/commit/d6a59204fcb145384c2003b63fd0a8ba8fa6cb9a))
* 244 pass globalName to plugin client to make sure it works ([#251](https://github.com/nuxt/content/issues/251)) ([7f14a90](https://github.com/nuxt/content/commit/7f14a90a83d535884636e9453fe041eec422d14e))
* **lib:** join array props ([#248](https://github.com/nuxt/content/issues/248)) ([ee26e05](https://github.com/nuxt/content/commit/ee26e05f7f4cf88681a70b944d11067d243ba191))
* use compound sort ([#238](https://github.com/nuxt/content/issues/238)) ([e7647ef](https://github.com/nuxt/content/commit/e7647efc2b4967bd368cd2e02cac333d32fba395))

### [1.4.1](https://github.com/nuxt/content/compare/v1.4.0...v1.4.1) (2020-07-02)


### Features

* add XML support ([#182](https://github.com/nuxt/content/issues/182)) ([0a6806e](https://github.com/nuxt/content/commit/0a6806ee1e538a36e89d11bbbdef9658cb7deb94))
* global components ([#164](https://github.com/nuxt/content/issues/164)) ([0177a1d](https://github.com/nuxt/content/commit/0177a1db896e85c7bca5cc412d35eb68fc449912))

## [1.4.0](https://github.com/nuxt/content/compare/v1.3.2...v1.4.0) (2020-06-30)


### ⚠ BREAKING CHANGES

* plugins disappear in favor of remarkPlugins and rehypePlugins. basePlugins also disappear in favor of deep merging and functions override

* docs: update for rehype plugins

* feat(lib): improve plugins parser

* docs: fix code-group component

* docs: update for new plugins options

* docs: add changelog page

* feat(lib): use nuxt resolver for local plugins

* docs: update configuration

* feat(lib): remove nuxt dependency

* docs: minor improvements

* chore: add getOptions for programmatic usage

* fix(lib): add missing property after merge

* chore(lib): improve plugins parsing

* test: options merging

Co-authored-by: Sébastien Chopin <seb@nuxtjs.com>

### Features

* add .yml support for YAML ([#167](https://github.com/nuxt/content/issues/167)) ([a2b5b05](https://github.com/nuxt/content/commit/a2b5b0545c20b2a43dca53e0fb6a2db1b1db0c1b))
* allow to send back text ([#126](https://github.com/nuxt/content/issues/126)) ([e579037](https://github.com/nuxt/content/commit/e5790374d5aa8b3a66e97cc73c50e885ff9f1487))
* live editing ([#125](https://github.com/nuxt/content/issues/125)) ([2570fd0](https://github.com/nuxt/content/commit/2570fd06a206f8f8eea7d37bbae5dec41032b0dd))
* rehype plugins ([#65](https://github.com/nuxt/content/issues/65)) ([f6bb586](https://github.com/nuxt/content/commit/f6bb586435418ef954f77ddfee18d4cb0c0b4781))
* without fields ([#179](https://github.com/nuxt/content/issues/179)) ([712b743](https://github.com/nuxt/content/commit/712b7436c19c852d93694d3f9033653273677cdc))


### Bug Fixes

* **lib:** handle classes on nuxt-content component ([#165](https://github.com/nuxt/content/issues/165)) ([db9fbca](https://github.com/nuxt/content/commit/db9fbca6d5f5ff1719f6dc3998304ef0e475d3df))
* **lib:** handle spa ([#180](https://github.com/nuxt/content/issues/180)) ([09edd98](https://github.com/nuxt/content/commit/09edd983524bce5e100bfc8cd73336c2ecf87d1b))
* attributes case ([#143](https://github.com/nuxt/content/issues/143)) ([2df54ec](https://github.com/nuxt/content/commit/2df54ec859377a242b3c740b4a52dcb74b19058e))
* **lib:** remove rehype-minify-whitespace ([#124](https://github.com/nuxt/content/issues/124)) ([c267fb0](https://github.com/nuxt/content/commit/c267fb067cb1b311d1f5be37cb8030f985a0c676))

### [1.3.2](https://github.com/nuxt/content/compare/v1.3.1...v1.3.2) (2020-06-10)


### Bug Fixes

* avoid date mismatch with API ([#119](https://github.com/nuxt/content/issues/119)) ([b3346cc](https://github.com/nuxt/content/commit/b3346cc6b3554cfcc0f1ae7da974c3401326593c))
* **docs:** correct css attr ([#116](https://github.com/nuxt/content/issues/116)) ([70c70dc](https://github.com/nuxt/content/commit/70c70dc6eb5f8705f92d62d915666065fd8e2047))

### [1.3.1](https://github.com/nuxt/content/compare/v1.3.0...v1.3.1) (2020-06-04)


### Bug Fixes

* **types:** args can be string or object ([b2c2c13](https://github.com/nuxt/content/commit/b2c2c13fe5b2377ac68c905579e99ce18b8c1c5f))

## [1.3.0](https://github.com/nuxt/content/compare/v1.2.0...v1.3.0) (2020-06-04)


### Features

* support custom return types by the fetch method ([#42](https://github.com/nuxt/content/issues/42)) ([9c11915](https://github.com/nuxt/content/commit/9c11915e99c4ee0934739bc25c1ecdd5d05b3e07))


### Bug Fixes

* decodeURI before searching query ([#55](https://github.com/nuxt/content/issues/55)) ([66781a8](https://github.com/nuxt/content/commit/66781a8728c1d486081bc3554e60b99d91ca408e))

## [1.2.0](https://github.com/nuxt/content/compare/v1.1.0...v1.2.0) (2020-05-25)


### Features

* add createdAt field ([#40](https://github.com/nuxt/content/issues/40)) ([27543f1](https://github.com/nuxt/content/commit/27543f1ff3b9b28309bd808ec9e2d002a5566192))
* support remark plugins ([a64b38e](https://github.com/nuxt/content/commit/a64b38efad521b48dba6aca8209748e509cebe6f))

## [1.1.0](https://github.com/nuxt/content/compare/v1.0.2...v1.1.0) (2020-05-25)


### Features

* **docs:** add footnotes section ([1cd009d](https://github.com/nuxt/content/commit/1cd009d00004b38961495d2fa447b1bd0aa39ca7))
* add support for footnotes ([d7b7261](https://github.com/nuxt/content/commit/d7b7261ee6a76db2211f2d76eba93a1f207d2199))


### Bug Fixes

* **docs:** blockquote style ([75fbd44](https://github.com/nuxt/content/commit/75fbd44dd3b0ac0f0afbec4ce438d175ab058997))

### [1.0.2](https://github.com/nuxt/content/compare/v1.0.1...v1.0.2) (2020-05-23)
