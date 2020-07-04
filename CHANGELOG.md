# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
