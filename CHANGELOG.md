# Changelog

## 3.5.3 (2025-05-17)

### ⚠ BREAKING CHANGES

* spell `extensions` correctly (#1204)
* **components:** update and improve components (#1088)
* update json & yml transformers (#1095)
* Refactor for a great DX (#1073)
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

* @docus/mdc ([#53](https://github.com/nuxt/content/issues/53)) ([bf231ee](https://github.com/nuxt/content/commit/bf231ee2d3c03ee900bdb9fbdd3a8d936cb2228b))
* **#1073:** improve [#1073](https://github.com/nuxt/content/issues/1073) runtime components ([6a871d5](https://github.com/nuxt/content/commit/6a871d5d1e9b1f4f058f8ef7e1a6703c2158a9c2))
* `.navigation` files ([915be40](https://github.com/nuxt/content/commit/915be409be8d052fe6ec3d48ffe3d0a1883164c5))
* **`<markdown>`:** support fallback default slot ([#1405](https://github.com/nuxt/content/issues/1405)) ([4ea3719](https://github.com/nuxt/content/commit/4ea3719f76b621b7887ae78b4253f1ddc69e2943))
* `d1` adapter, improved navigation and query ([513c95a](https://github.com/nuxt/content/commit/513c95a27b9b16d0deb048e5edcf112d923feea0))
* `head` key for pages ([75d430c](https://github.com/nuxt/content/commit/75d430c5adb6184bcbf996127ccd8c3b542aa332))
* `node-sqlite3` connector ([#3032](https://github.com/nuxt/content/issues/3032)) ([1188550](https://github.com/nuxt/content/commit/118855015d36193e03320b12c74534591dc6e788))
* add .yml support for YAML ([#167](https://github.com/nuxt/content/issues/167)) ([a2b5b05](https://github.com/nuxt/content/commit/a2b5b0545c20b2a43dca53e0fb6a2db1b1db0c1b))
* add binding for external data ([#2296](https://github.com/nuxt/content/issues/2296)) ([4b9b954](https://github.com/nuxt/content/commit/4b9b954b3ec2791e8ef538f66069e53467818e8b))
* add classes for live editing ([#258](https://github.com/nuxt/content/issues/258)) ([ebc6123](https://github.com/nuxt/content/commit/ebc6123d924bf89c0c4dfbde833bf6fbdd46b675))
* add components/content global directory ([#170](https://github.com/nuxt/content/issues/170)) ([494bca5](https://github.com/nuxt/content/commit/494bca5eada75ae1fc548519c1e037a1a5c53bf6))
* add content:file:beforeParse hook ([#453](https://github.com/nuxt/content/issues/453)) ([f7ac58d](https://github.com/nuxt/content/commit/f7ac58de9b743cb58fe9b7a7ab81795c4dbf3e3b))
* add count method ([#1924](https://github.com/nuxt/content/issues/1924)) ([beaa64f](https://github.com/nuxt/content/commit/beaa64f123f42bc22351fb95ac813a05f6af73fe))
* add createdAt field ([#40](https://github.com/nuxt/content/issues/40)) ([27543f1](https://github.com/nuxt/content/commit/27543f1ff3b9b28309bd808ec9e2d002a5566192))
* add custom editor API ([#312](https://github.com/nuxt/content/issues/312)) ([78fbb92](https://github.com/nuxt/content/commit/78fbb92ace7934fc15781dc592dfd2722670897a))
* add database as second argument for beforeInsert ([#442](https://github.com/nuxt/content/issues/442)) ([90c638d](https://github.com/nuxt/content/commit/90c638d153394a284fa387f3ab868989b901b4f9))
* add homepage on package.json ([#2413](https://github.com/nuxt/content/issues/2413)) ([3bac6b8](https://github.com/nuxt/content/commit/3bac6b843b63a5d5ca5bcce595d393f0f0106a06))
* add option to disable live edit ([#285](https://github.com/nuxt/content/issues/285)) ([d46daaf](https://github.com/nuxt/content/commit/d46daaf07a2bf5667e265b9af133842d03948fa9))
* add path for custom parsers ([#656](https://github.com/nuxt/content/issues/656)) ([955cf9f](https://github.com/nuxt/content/commit/955cf9fe1074bcc740e8e0c9695760a04703e961))
* add search ([#2146](https://github.com/nuxt/content/issues/2146)) ([f40e1a1](https://github.com/nuxt/content/commit/f40e1a13c6e6800d90f1dae0c874884fb72436ae))
* add studio banner ([#2165](https://github.com/nuxt/content/issues/2165)) ([2ee6de5](https://github.com/nuxt/content/commit/2ee6de5cae3285d2fc30e72ef533d7e22a06f973))
* add support for footnotes ([d7b7261](https://github.com/nuxt/content/commit/d7b7261ee6a76db2211f2d76eba93a1f207d2199))
* add support for LibSQL ([e345fdc](https://github.com/nuxt/content/commit/e345fdc53deac26bb6397218dfe082b323e6ab2d))
* add type to layout ([#2389](https://github.com/nuxt/content/issues/2389)) ([e5d0029](https://github.com/nuxt/content/commit/e5d002906e68345cb269bde35808858aeed7275d))
* add types ([10c5ae0](https://github.com/nuxt/content/commit/10c5ae0a2ad7ee631b82eaf01c3c1612263a41b3))
* add user defined parsers ([#256](https://github.com/nuxt/content/issues/256)) ([502bd26](https://github.com/nuxt/content/commit/502bd2647fbe09b61da6a63c848a926abaca179a)), closes [#230](https://github.com/nuxt/content/issues/230) [#234](https://github.com/nuxt/content/issues/234) [#235](https://github.com/nuxt/content/issues/235) [#238](https://github.com/nuxt/content/issues/238) [#242](https://github.com/nuxt/content/issues/242) [#243](https://github.com/nuxt/content/issues/243) [#245](https://github.com/nuxt/content/issues/245) [#230](https://github.com/nuxt/content/issues/230) [#234](https://github.com/nuxt/content/issues/234) [#235](https://github.com/nuxt/content/issues/235) [#238](https://github.com/nuxt/content/issues/238) [#242](https://github.com/nuxt/content/issues/242) [#243](https://github.com/nuxt/content/issues/243)
* add web-types.json for WebStorm ([#1288](https://github.com/nuxt/content/issues/1288)) ([dad69b8](https://github.com/nuxt/content/commit/dad69b8423ad08acd4ad313a8faf7bc9e736b824))
* add XML support ([#182](https://github.com/nuxt/content/issues/182)) ([0a6806e](https://github.com/nuxt/content/commit/0a6806ee1e538a36e89d11bbbdef9658cb7deb94))
* add yarn v2 (berry) support ([#820](https://github.com/nuxt/content/issues/820)) ([971c36f](https://github.com/nuxt/content/commit/971c36f685e2ef8bc66529c8124aa40969ab8402))
* Added more types following [#443](https://github.com/nuxt/content/issues/443) and [#421](https://github.com/nuxt/content/issues/421) ([#444](https://github.com/nuxt/content/issues/444)) ([6a43bd2](https://github.com/nuxt/content/commit/6a43bd2e89222953a6886654752d0d001e72efea))
* adopt to mdc v0.4 ([#2539](https://github.com/nuxt/content/issues/2539)) ([a0e74d1](https://github.com/nuxt/content/commit/a0e74d1ada97a4e6f130d938004aa1a0fb71fcb7))
* advanced query schema ([#2213](https://github.com/nuxt/content/issues/2213)) ([9c2f3be](https://github.com/nuxt/content/commit/9c2f3bec6dd0b0d652695e01a8a9d1ef097751ca))
* allow `<markdown>` to accept class ([#88](https://github.com/nuxt/content/issues/88)) ([98d246f](https://github.com/nuxt/content/commit/98d246f8f1d86fad737f4762699d8bdcf8beafc8))
* allow semantic versions as part of content url ([249cdfb](https://github.com/nuxt/content/commit/249cdfb8f6626f5ef0ab8b97bd78f8cf2e1c59d3))
* allow to disable content head ([#2142](https://github.com/nuxt/content/issues/2142)) ([89862d7](https://github.com/nuxt/content/commit/89862d75d9c7a3d1922be34d1b0eb20e77decd41))
* allow to send back text ([#126](https://github.com/nuxt/content/issues/126)) ([e579037](https://github.com/nuxt/content/commit/e5790374d5aa8b3a66e97cc73c50e885ff9f1487))
* **api:** cache api endpoints ([d2bcf70](https://github.com/nuxt/content/commit/d2bcf70ff5102e2e717565499bee9663e7295bcd))
* **app:** create a module from @docus/app ([#86](https://github.com/nuxt/content/issues/86)) ([5ea38ef](https://github.com/nuxt/content/commit/5ea38ef6dfbc777639dcb46e4f1add4d244fea3a))
* auto detect preview mode ([#64](https://github.com/nuxt/content/issues/64)) ([cfd0925](https://github.com/nuxt/content/commit/cfd092593eeda94251b46b3100e314915368d221))
* auto generate conten config & handle sqlite keywords ([9726493](https://github.com/nuxt/content/commit/97264938afc815dea332852655137321985f9055))
* aws amplify preset ([#3316](https://github.com/nuxt/content/issues/3316)) ([ecd345f](https://github.com/nuxt/content/commit/ecd345f0431eb2e379a789d0127937bce5a2f68b))
* better typescript typings ([#327](https://github.com/nuxt/content/issues/327)) ([8d9f47c](https://github.com/nuxt/content/commit/8d9f47c38e92d8d0348d3aed6eb30d65356885b3))
* **build:** allow modifying `slugify` options ([#2898](https://github.com/nuxt/content/issues/2898)) ([d05f0ed](https://github.com/nuxt/content/commit/d05f0edbab6d20b0817ef7d5be6baa2d53cecd63))
* **cache:** respect module version ([#1099](https://github.com/nuxt/content/issues/1099)) ([ab3d41a](https://github.com/nuxt/content/commit/ab3d41aee4f606eb6c8789474c10a42ea66c2239))
* caching layer for production ([#107](https://github.com/nuxt/content/issues/107)) ([3ae7200](https://github.com/nuxt/content/commit/3ae7200038cdcaae22728dc0e47e8874d0821b8a))
* call hooks before and after parse ([#1160](https://github.com/nuxt/content/issues/1160)) ([71d5640](https://github.com/nuxt/content/commit/71d5640be169ca65a248f7b679a2be42c6c703df))
* **client-db:** allow possibility to ignore some sources from client storage ([#1917](https://github.com/nuxt/content/issues/1917)) ([3c4ac26](https://github.com/nuxt/content/commit/3c4ac26454025163e8e8d2459e6447e473526540))
* **CodeBlock:** add line number attribute to code block lines ([#1973](https://github.com/nuxt/content/issues/1973)) ([7bb8b10](https://github.com/nuxt/content/commit/7bb8b10c5e02520d9e107021094d60939e09a0a5))
* collection definition and navigation ([adec5d9](https://github.com/nuxt/content/commit/adec5d93ada53aa190631eb5d523742ff9b37431))
* collection full text search ([afe1d3c](https://github.com/nuxt/content/commit/afe1d3cab2927eb68a3bbf96eed65715fee428b6))
* **collection:** add support for Bitbucket repository  ([#3226](https://github.com/nuxt/content/issues/3226)) ([55b0e5b](https://github.com/nuxt/content/commit/55b0e5b7dd5893e74c3707d42049f8a112e82163))
* **collection:** repair SQL query slicing for content larger than 200Kb ([#3131](https://github.com/nuxt/content/issues/3131)) ([9d6b6c3](https://github.com/nuxt/content/commit/9d6b6c338191a70fdb66a11a63e2c444a8846683))
* compatibility improvements ([#67](https://github.com/nuxt/content/issues/67)) ([f724808](https://github.com/nuxt/content/commit/f72480835c6c0c4110a5e7a8e0ddd798282b62a3))
* **components:** add $attrs fallthrough on renderers ([07c3679](https://github.com/nuxt/content/commit/07c3679001f9ed333053909c942ddfba16055a95))
* **components:** also add fallthrough on slots ([649a93c](https://github.com/nuxt/content/commit/649a93cdd3061700ab98b684bcacebdb75b7a54b))
* **components:** implement empty props ; fix components ; update playground ([842d751](https://github.com/nuxt/content/commit/842d7513dfd455345bcebcc3b8be56cdad7719b4))
* **components:** update and improve components ([#1088](https://github.com/nuxt/content/issues/1088)) ([a43b552](https://github.com/nuxt/content/commit/a43b55278a43e831e3588dc6ed1d24789f360fd3))
* config for anchor link generation of headings ([#1564](https://github.com/nuxt/content/issues/1564)) ([b455d0c](https://github.com/nuxt/content/commit/b455d0c75d36293f01797d9bb44dfadf40105e32))
* **config:** allow ws config ([#1249](https://github.com/nuxt/content/issues/1249)) ([6c903de](https://github.com/nuxt/content/commit/6c903de286ee77e1d443d53973e9413fdf4b358d))
* **config:** enable watch for all layer configs and load in parallel ([#2929](https://github.com/nuxt/content/issues/2929)) ([c6b3bef](https://github.com/nuxt/content/commit/c6b3befb50f6d7dab28004125315fd23b0d7132b))
* **config:** provide defineContentConfig utility ([#2891](https://github.com/nuxt/content/issues/2891)) ([cf85cd4](https://github.com/nuxt/content/commit/cf85cd4006b6acaa56ea0f3a3150fbf3dcdb882c))
* **config:** update ignores to advanced pattern ([#2035](https://github.com/nuxt/content/issues/2035)) ([0fb0d63](https://github.com/nuxt/content/commit/0fb0d6333c6bf59fd15849c3c5cb17879a404aba))
* content parsing ([#31](https://github.com/nuxt/content/issues/31)) ([36055da](https://github.com/nuxt/content/commit/36055da70581655c907c17be26418a3cb6206b1c))
* content plugins ([#38](https://github.com/nuxt/content/issues/38)) ([4a5cb83](https://github.com/nuxt/content/commit/4a5cb8321277302621489ddd9ea61debd1bcd494))
* content query layer ([#34](https://github.com/nuxt/content/issues/34)) ([442c30f](https://github.com/nuxt/content/commit/442c30f3ae0f264a6c7d88eaead17aed9fcbe97c))
* content sources ([#29](https://github.com/nuxt/content/issues/29)) ([61788e4](https://github.com/nuxt/content/commit/61788e42d48c107bc6ddab99bdaa091174dc2977))
* **content/theme-docs:** support surround by path ([#660](https://github.com/nuxt/content/issues/660)) ([92599e0](https://github.com/nuxt/content/commit/92599e0fc3910da53560e82b9bceb8a118568d84))
* **content:** add custom highlighter ([#467](https://github.com/nuxt/content/issues/467)) ([9e1d0bd](https://github.com/nuxt/content/commit/9e1d0bd85e2bef64a7a9d42dee9ffadc559e60c6))
* **ContentDoc:** add title & description is defined in page and no slot provided ([4dd2f43](https://github.com/nuxt/content/commit/4dd2f4373d678361624dc8ada939cee80c52a465))
* **content:** handle json arrays ([#486](https://github.com/nuxt/content/issues/486)) ([f29daac](https://github.com/nuxt/content/commit/f29daac5dfdcd79d2401522e31b69bd39ea75f32))
* **content:** improve reactivity ([#688](https://github.com/nuxt/content/issues/688)) ([1fbcbbc](https://github.com/nuxt/content/commit/1fbcbbcd20f46b360cd8476c0de53c79fb4c20cd))
* **content:** Optional search parameter ([#733](https://github.com/nuxt/content/issues/733)) ([db3fd67](https://github.com/nuxt/content/commit/db3fd67f08ff18b480b1d4afbc1269c4220995e7))
* **content:** pass document data to remark plugins ([#782](https://github.com/nuxt/content/issues/782)) ([ed56f5a](https://github.com/nuxt/content/commit/ed56f5a4c8cf5fc8b6fb7711b769b882fd73bee1))
* contents HMR & dynamic components import ([baac860](https://github.com/nuxt/content/commit/baac860811c0f171868980e47089495495324f4b))
* **content:** support `useCache` option ([#772](https://github.com/nuxt/content/issues/772)) ([9d7f3a0](https://github.com/nuxt/content/commit/9d7f3a008bb08fae5670d9842fd81832fcfe3beb))
* **context:** move from $docus to useDocus ([#60](https://github.com/nuxt/content/issues/60)) ([e99e001](https://github.com/nuxt/content/commit/e99e001e1f0a5596b4bbb524492e65a20ac1cf99))
* count query ([691b2e3](https://github.com/nuxt/content/commit/691b2e33825f2c11150f4343083ff3f0496207ac))
* create deployment cache ([#132](https://github.com/nuxt/content/issues/132)) ([b5bb4b3](https://github.com/nuxt/content/commit/b5bb4b394b76626cee1deca6fef50fe33403fd73))
* create index for path base search ([#1401](https://github.com/nuxt/content/issues/1401)) ([2602c07](https://github.com/nuxt/content/commit/2602c07d489c93faf0ea5b1f629f76957b3aa01b))
* create tests and CI workflow ([9a4bb74](https://github.com/nuxt/content/commit/9a4bb743215c49ad9366a1c19f0aaad74ace1cc1))
* **ctx:** export contexts ([c754fc5](https://github.com/nuxt/content/commit/c754fc53039a630692c34a59daa6815f640b0035))
* database version ([#3148](https://github.com/nuxt/content/issues/3148)) ([045d602](https://github.com/nuxt/content/commit/045d6022742c94b83678295e8b2d4c6bec2f979c))
* **database:** add support for BunSQLite ([#2944](https://github.com/nuxt/content/issues/2944)) ([db77463](https://github.com/nuxt/content/commit/db7746369d37e0f6803ee9b66c58d9d82c3b0fa7))
* **db:** drop built-in database adapters in favor of db0 connectors ([#3010](https://github.com/nuxt/content/issues/3010)) ([1a7371a](https://github.com/nuxt/content/commit/1a7371a61383d8d2e9b8bde18f89516371e94ef1))
* **db:** experimental `node:sqlite` under flag  ([#3230](https://github.com/nuxt/content/issues/3230)) ([e97d579](https://github.com/nuxt/content/commit/e97d579f100a8d7d26421876a1174eaa35bfb438))
* **deps:** upgrade deps ([88c30b1](https://github.com/nuxt/content/commit/88c30b19f9220f6099f9910f585c9da90c7f6783))
* disable document driven with route meta ([#1333](https://github.com/nuxt/content/issues/1333)) ([d5d23c9](https://github.com/nuxt/content/commit/d5d23c955580629ca614a56b122c3e9b1225dcdc))
* docs rework with Nuxt UI ([#2310](https://github.com/nuxt/content/issues/2310)) ([f2dae5b](https://github.com/nuxt/content/commit/f2dae5b8934817c63fb9fd378db2b6d2289e4184))
* docs-theme ([#33](https://github.com/nuxt/content/issues/33)) ([cd4992e](https://github.com/nuxt/content/commit/cd4992e0e968df79678a0b6b4b622bdc3b607065))
* **docs:** add docs/ directory with working website ([#143](https://github.com/nuxt/content/issues/143)) ([9a6b1fe](https://github.com/nuxt/content/commit/9a6b1fe093e25c5d7e527f4aa3c828041b4154df))
* **docs:** add footnotes section ([1cd009d](https://github.com/nuxt/content/commit/1cd009d00004b38961495d2fa447b1bd0aa39ca7))
* **docs:** improve docs (upgrade docus ; add releases) ([03411a8](https://github.com/nuxt/content/commit/03411a82ffabb4131b1eaa6778c8792b36fbe557))
* **docs:** update article ; change layout name ([1c8be58](https://github.com/nuxt/content/commit/1c8be58bc9a53cebdf3bb5ca8a3d9e98beee919d))
* **docs:** update docs branding ([#145](https://github.com/nuxt/content/issues/145)) ([beb1f98](https://github.com/nuxt/content/commit/beb1f984ecc4f5691877e4ea3124800b74d346ed))
* **docs:** upgrade docus ([3adf4e5](https://github.com/nuxt/content/commit/3adf4e5d8befadede234f77980714f1612570f94))
* **document-driven:** add caching layer on client-side ([#1312](https://github.com/nuxt/content/issues/1312)) ([d654826](https://github.com/nuxt/content/commit/d654826ee3a1e764844d8cbde72da7838ba8bbad))
* **document-driven:** add document-driven as a @nuxt/content feature ([#1279](https://github.com/nuxt/content/issues/1279)) ([2880bee](https://github.com/nuxt/content/commit/2880bee12d3d029607380d620d4eff5806e56008))
* **document-driven:** introduce `start` and `finish` hooks ([#1744](https://github.com/nuxt/content/issues/1744)) ([d2e59c2](https://github.com/nuxt/content/commit/d2e59c212e5abfba2f76097e3162fcc44a172da1))
* **document-driven:** support `navigation.redirect` from `_dir` files ([#1545](https://github.com/nuxt/content/issues/1545)) ([5fc042b](https://github.com/nuxt/content/commit/5fc042bd4d77dfddba66087d49fc63df58f72e65))
* **documentation:** update documentation ([#1062](https://github.com/nuxt/content/issues/1062)) ([de0b91b](https://github.com/nuxt/content/commit/de0b91b9db8b9d23c9aeb62b8a782ede6335cfaf))
* **documentation:** update homepage ([46a07ec](https://github.com/nuxt/content/commit/46a07ece04a81b4482c5244297891f9b7f2df324))
* **documentation:** update theme data ([65e58cd](https://github.com/nuxt/content/commit/65e58cde8a9c17c6e9b6dff98286ba17f96fe9d9))
* documentDriven configuration ([#1378](https://github.com/nuxt/content/issues/1378)) ([6cf2094](https://github.com/nuxt/content/commit/6cf2094b02612c1334525e1f16da5fea15daa373))
* **DocusContent:** support tag props ([a6a42c0](https://github.com/nuxt/content/commit/a6a42c0560313b3f3cda9ab8d666dceafc9aec14)), closes [#68](https://github.com/nuxt/content/issues/68)
* enable `remark-mdc` automatic unwrap ([b5b7759](https://github.com/nuxt/content/commit/b5b77596c6e17093ee9cb3a5717719d7be1304c9))
* enable client-db by default and ship/cache compressed dump ([#2](https://github.com/nuxt/content/issues/2)) ([32df86f](https://github.com/nuxt/content/commit/32df86f9fce2e1ecf1b5b793d5a16d6a96db8287))
* environment presets ([f32632e](https://github.com/nuxt/content/commit/f32632e5ff90d38ba55cbedb6862aa92a1760204))
* **example:** cleanup example ; use debug-theme ([26cdacb](https://github.com/nuxt/content/commit/26cdacb578adb8fd26764c0083f96e4c129af391))
* **example:** init ([4f8bd53](https://github.com/nuxt/content/commit/4f8bd53e7a64660e8974741a13fda448ff7cf8ff))
* export `queryContents` to server ([a8ee06c](https://github.com/nuxt/content/commit/a8ee06cf81ce132cd9e087f94b144ad41e58e99d))
* export `useContentHead` for seo header ([0e02c09](https://github.com/nuxt/content/commit/0e02c09155033baa8fc642af9637f444b4ead57f))
* export transformers ([#1374](https://github.com/nuxt/content/issues/1374)) ([e7bb0aa](https://github.com/nuxt/content/commit/e7bb0aae5df1c54ff320e2b7ba733801382dfdc4))
* expose collection types from module ([e3b6a32](https://github.com/nuxt/content/commit/e3b6a326e2a175469df2779ca85f1377483fed02))
* expose collections schema in json format ([7a31913](https://github.com/nuxt/content/commit/7a3191360118c34c11c7046b5a3d789e929c6b9a))
* expose server utils in `[#content](https://github.com/nuxt/content/issues/content)/server` ([#1071](https://github.com/nuxt/content/issues/1071)) ([ead13d3](https://github.com/nuxt/content/commit/ead13d35ecb438994810e7b1f223be9e9a5a7bee))
* externalize Database and middleware and add etag ([54ea0ef](https://github.com/nuxt/content/commit/54ea0ef8388a43560055f89874e20e282aec9147))
* **find:** introduce `find`, `findOne` and `findSurround` ([#18](https://github.com/nuxt/content/issues/18)) ([278f8a2](https://github.com/nuxt/content/commit/278f8a23df6382a1b71de98118c7f8f29157817d))
* generate full database sql dump ([1cfdbe9](https://github.com/nuxt/content/commit/1cfdbe94e785caf48d97bb26a2593c99c02efd0f))
* **generate:** use nitro header instead of header link ([#1502](https://github.com/nuxt/content/issues/1502)) ([96e3fcb](https://github.com/nuxt/content/commit/96e3fcbdbd9775ace3a9325396a32e851d846448))
* global components ([#164](https://github.com/nuxt/content/issues/164)) ([0177a1d](https://github.com/nuxt/content/commit/0177a1db896e85c7bca5cc412d35eb68fc449912))
* handle markdown options and external links ([a5dbb18](https://github.com/nuxt/content/commit/a5dbb18052278ac2b5784d4fe38ac3515d31c66c))
* handle tags mapping in `<ContentRendererMarkdown>` ([#41](https://github.com/nuxt/content/issues/41)) ([00ccd39](https://github.com/nuxt/content/commit/00ccd39ef971506d4695223c6b3aa12262df6b88))
* handling variables in components in Markdown ([d449da9](https://github.com/nuxt/content/commit/d449da97ecab26fd1b58530f387a12abee62ee89))
* head management for ContentDoc and docs ([f0d248c](https://github.com/nuxt/content/commit/f0d248c2f081e4fe4eca171b0549987b5e8ded28))
* **highlighter:** allow configuration of highlighter from content key in nuxt.config ([#77](https://github.com/nuxt/content/issues/77)) ([5d62684](https://github.com/nuxt/content/commit/5d626845d6eeb65aeb52b791323b56e1d5f9428a))
* **home:** update studio section ([#2696](https://github.com/nuxt/content/issues/2696)) ([1adba91](https://github.com/nuxt/content/commit/1adba91ee1b94a825182e332dbe328f51d28876a))
* implement csv parser with unist/mircomark stack ([#1468](https://github.com/nuxt/content/issues/1468)) ([ce5397d](https://github.com/nuxt/content/commit/ce5397d4ac15364f5d5375602b8c400f47ace031))
* improve markdown parser and add playground ([#1105](https://github.com/nuxt/content/issues/1105)) ([d315223](https://github.com/nuxt/content/commit/d3152234d3d6095558d030cc48095d949fc6f4e3))
* improve where query types ([#1359](https://github.com/nuxt/content/issues/1359)) ([04f9dad](https://github.com/nuxt/content/commit/04f9dad5e84c253cd44ca9cda164c82a1ebc1312))
* inherit layout from parents ([#13](https://github.com/nuxt/content/issues/13)) ([2bebc74](https://github.com/nuxt/content/commit/2bebc740174e49e70b970e31d237d786852faa7d))
* init content components ([#36](https://github.com/nuxt/content/issues/36)) ([f917900](https://github.com/nuxt/content/commit/f917900ffa69e184527c4754b51583a0464c1226))
* inline transformer, remove content module from deps ([5250bad](https://github.com/nuxt/content/commit/5250bad789af3509dd70942eb770f67dd4f846cf))
* integrate with NuxtHub database queries ([#3019](https://github.com/nuxt/content/issues/3019)) ([7b480c5](https://github.com/nuxt/content/commit/7b480c5cc638c6781c5e7209787ff93ee0b89acd))
* internal cache version ([#1114](https://github.com/nuxt/content/issues/1114)) ([58f2d50](https://github.com/nuxt/content/commit/58f2d5099c69127732bbf37d47e280803341ef52))
* introduce `component-resolver` transformer ([#1907](https://github.com/nuxt/content/issues/1907)) ([3f6efe8](https://github.com/nuxt/content/commit/3f6efe8c84d0150bf922c4d53f3dbec9b0a51773))
* introduce `contentNavigation` ([#91](https://github.com/nuxt/content/issues/91)) ([2ccc909](https://github.com/nuxt/content/commit/2ccc909c31bb8408c2999f16ed856e7c782fc341))
* introduce `previewKey` ([68b238c](https://github.com/nuxt/content/commit/68b238cfa960231615bebe209d5a573fa2910a12))
* introduce preview storage ([#60](https://github.com/nuxt/content/issues/60)) ([aadf33b](https://github.com/nuxt/content/commit/aadf33b9444aac89bc07ed805a4056a8a82bb331))
* **landing:** design review ([#2703](https://github.com/nuxt/content/issues/2703)) ([67df705](https://github.com/nuxt/content/commit/67df705720f02e2cdca1c4c3524411f97ed6b53f))
* **lib:** add new hook ([48f2d14](https://github.com/nuxt/content/commit/48f2d149602a2a5b7701a4b14e0bddade40c8573))
* **lib:** fix toc when heading has code ([904a16a](https://github.com/nuxt/content/commit/904a16ac4001e83fff8f4b211f1571e02a89f462))
* **lib:** full-text search field text defined in options ([8a62d1a](https://github.com/nuxt/content/commit/8a62d1a0a63020b0c3849406de4bb8dcf3c3acc3))
* **lib:** handle csv ([0f8ad4b](https://github.com/nuxt/content/commit/0f8ad4b4b448afdefcf9611522fc9cc5837caecc))
* **lib:** handle get middleware ([0ecbf1b](https://github.com/nuxt/content/commit/0ecbf1b8bf5dd4f23ccbf02385c1d3a34e128113))
* **lib:** handle json files ([bc2425e](https://github.com/nuxt/content/commit/bc2425e97781fb7b2bc3fcb1989cd48de43ef871))
* **lib:** handle json5 ([b159a32](https://github.com/nuxt/content/commit/b159a3278628342cf3457e2d533ae4aa50a4243a))
* **lib:** handle markdown highlight ([797dc6f](https://github.com/nuxt/content/commit/797dc6f64ffe8abb5810a06e77af6b3488024f36))
* **lib:** handle md custom html ([b7cf163](https://github.com/nuxt/content/commit/b7cf16338acec1c0d1cc6952f42c30f3f6334eca))
* **lib:** handle nuxt-link if relative link ([244a863](https://github.com/nuxt/content/commit/244a86314e4fa1906eca90f00f012526e167ab65))
* **lib:** handle root directory fetch ([d7d513a](https://github.com/nuxt/content/commit/d7d513a64dfb5d5ab8a737a8151519b112ab5b62))
* **lib:** handle ssg ([c7a4f40](https://github.com/nuxt/content/commit/c7a4f40fdec0a00b2e3ec29e3992b81b6be9e54a))
* **lib:** handle textarea tab / shift tab events ([#289](https://github.com/nuxt/content/issues/289)) ([67b0da7](https://github.com/nuxt/content/commit/67b0da722bb7d41ed9a4ec7eef99e146062eaaee))
* **lib:** implement QueryBuilder ([b9e8683](https://github.com/nuxt/content/commit/b9e868307bfa20dc78c6988714ae9b238995e153))
* **lib:** improve markdown parsing ([f2c0a24](https://github.com/nuxt/content/commit/f2c0a24a623e4d7d1bd2389c054c67cdcf294580))
* **lib:** improve search ([dbadf0a](https://github.com/nuxt/content/commit/dbadf0a1feab91457b50f9c96d5238f80f974975))
* **lib:** improve watch ([0fecacf](https://github.com/nuxt/content/commit/0fecacf30a8afb0f8b0d22adf650283e5d51a26a))
* **lib:** init ([e116cd3](https://github.com/nuxt/content/commit/e116cd3e051495b553844b11e422bcb1a7b21879))
* **lib:** support markdown excerpt ([#607](https://github.com/nuxt/content/issues/607)) ([b453ea8](https://github.com/nuxt/content/commit/b453ea8e22258a664de93ec29c71229b17bf9fd1))
* **lib:** update ([d6fe260](https://github.com/nuxt/content/commit/d6fe260761d16c5b1a30d0153d1bd97bc98beeb6))
* **lib:** update ([92d3c3f](https://github.com/nuxt/content/commit/92d3c3fd8c2c031cfd2aff0398716bab03f0314c))
* **lib:** update NuxtContent component ([13c498c](https://github.com/nuxt/content/commit/13c498ce1c26bdbfda4282bc154018f0997694d1))
* **lib:** use fetch syntax and handle directories ([0cbf148](https://github.com/nuxt/content/commit/0cbf1482f9d8e604c1821e62b910da5573b64464))
* live editing ([#125](https://github.com/nuxt/content/issues/125)) ([2570fd0](https://github.com/nuxt/content/commit/2570fd06a206f8f8eea7d37bbae5dec41032b0dd))
* **LLMS:** call hook before generating markdown ([#3323](https://github.com/nuxt/content/issues/3323)) ([fd14e32](https://github.com/nuxt/content/commit/fd14e32c024f9c19fee9a9f7ea12f07eab0ac5db))
* **llms:** zero config integration with `nuxt-llms` ([#3143](https://github.com/nuxt/content/issues/3143)) ([541beeb](https://github.com/nuxt/content/commit/541beebd17079303de564769a350f59e053b6c04))
* load content config of each Nuxt layer ([6a9eb83](https://github.com/nuxt/content/commit/6a9eb83891c79dd2c8b3fac86b5e3a6dce7743f0))
* local database provider ([#74](https://github.com/nuxt/content/issues/74)) ([c6f2969](https://github.com/nuxt/content/commit/c6f296940464301506bca4b07cd9943b3ab10502))
* locale support ([#36](https://github.com/nuxt/content/issues/36)) ([0825e9b](https://github.com/nuxt/content/commit/0825e9bc8d428231e0b438cbce54cd770660be8b))
* markdown between ([#34](https://github.com/nuxt/content/issues/34)) ([c67a5c7](https://github.com/nuxt/content/commit/c67a5c7c449fa02722cc00926598261e3a03cc07))
* **markdown:** allow overwriting plugins ([#1226](https://github.com/nuxt/content/issues/1226)) ([ede65e8](https://github.com/nuxt/content/commit/ede65e8337ca3eb597af95c17cfc609e4015238c))
* **markdown:** don't create excerpt if there is no `<!--more-->` ([#1801](https://github.com/nuxt/content/issues/1801)) ([2ba0776](https://github.com/nuxt/content/commit/2ba07760ae04042e2ca20d230a8d8d33ab6a29d1))
* **markdown:** keep meta from fenced code block ([#1800](https://github.com/nuxt/content/issues/1800)) ([0aa922c](https://github.com/nuxt/content/commit/0aa922c89dc5f87916b2e1318a0aa84b4b9ca525))
* **markdown:** support multiple themes for code highlighter ([#1251](https://github.com/nuxt/content/issues/1251)) ([cd80cf8](https://github.com/nuxt/content/commit/cd80cf83485d750cde8da3f523db63094102bd32))
* **markdown:** web-friendly excerpt delimiter (case & space insensitive) ([#1116](https://github.com/nuxt/content/issues/1116)) ([6403e35](https://github.com/nuxt/content/commit/6403e352ea048555f72c85948019b02cb2e44dd9))
* **module:** add `watch` option to disable content watchers on dev ([#57](https://github.com/nuxt/content/issues/57)) ([e6148c2](https://github.com/nuxt/content/commit/e6148c270ac241a5998cd60b98ea50af058b809b))
* **module:** add prefix support for content sources ([#32](https://github.com/nuxt/content/issues/32)) ([4ff4148](https://github.com/nuxt/content/commit/4ff4148ede21cc33f05977e2bf02fa2f586e4876))
* **module:** extend content transformers ([#3056](https://github.com/nuxt/content/issues/3056)) ([5ac8532](https://github.com/nuxt/content/commit/5ac85329ddeb918b89a2cff34d7c69fbf2f36745))
* **module:** integrate with unifiedjs VFile ([#2911](https://github.com/nuxt/content/issues/2911)) ([6371a19](https://github.com/nuxt/content/commit/6371a191a59671c59d04a2eab0831d52dbbe0255))
* **module:** introduce `api.baseURL` and deprecate `base` ([#1695](https://github.com/nuxt/content/issues/1695)) ([6ff3cf4](https://github.com/nuxt/content/commit/6ff3cf4dedeb830c009d7d0b81bd0d24841a66ce))
* **module:** module options and extendibility ([#22](https://github.com/nuxt/content/issues/22)) ([38b6589](https://github.com/nuxt/content/commit/38b6589c886f495e5aa501c8f9e3a22204896f40))
* monorepo Docus module ([0b94b98](https://github.com/nuxt/content/commit/0b94b981107cf76bb6e492eef3146d00848602ee))
* more flexible ignores configuration ([#2022](https://github.com/nuxt/content/issues/2022)) ([12d5a21](https://github.com/nuxt/content/commit/12d5a21e62b380889bc0767bb08d7c9b18ff26bd))
* multi source collection ([acfbe96](https://github.com/nuxt/content/commit/acfbe96a38589ee8de0a5a5b22748033d40035c9))
* navigation config using `_dir` files ([#124](https://github.com/nuxt/content/issues/124)) ([b9018d4](https://github.com/nuxt/content/commit/b9018d45f5d7268269fe3e186f5958536e742a61))
* **navigation:** allow _dir.yml to filter navigation ([#1261](https://github.com/nuxt/content/issues/1261)) ([fa45652](https://github.com/nuxt/content/commit/fa45652bd4a45bb5e2b3eef03a3a7cd12a72c571))
* **navigation:** allow passing QueryBuilder or QueryBuilderParams in `fetchNavigation` or `<ContentNavigation>` ([#1206](https://github.com/nuxt/content/issues/1206)) ([afb791b](https://github.com/nuxt/content/commit/afb791b982a74311b43d52c050bb25190bc38aaa))
* **navigation:** generate navigation based on custom search ([#38](https://github.com/nuxt/content/issues/38)) ([5e27b32](https://github.com/nuxt/content/commit/5e27b32b89c0832daed7604ab464f3827c0039f3))
* **navigation:** introduce navigation api and composable ([#13](https://github.com/nuxt/content/issues/13)) ([fc730e7](https://github.com/nuxt/content/commit/fc730e7871dbb5281789e19ee3cec1c71ec61755))
* **navigation:** re-introduce `parent` key temporarily (waiting for _dir.yml) ([4612b72](https://github.com/nuxt/content/commit/4612b724a7d633e645abb1be3404fafa1bf9edca))
* **navigation:** update navigation ([#35](https://github.com/nuxt/content/issues/35)) ([7cb8de4](https://github.com/nuxt/content/commit/7cb8de40f47bb7e208f9aef3e8fcdf960a523f09))
* netlify preset ([#3122](https://github.com/nuxt/content/issues/3122)) ([7191516](https://github.com/nuxt/content/commit/7191516eeeb59129288677b76f1c1b34a4773857))
* new create-nuxt-content-docs package ([#336](https://github.com/nuxt/content/issues/336)) ([34439eb](https://github.com/nuxt/content/commit/34439eb1c339c47e00280a139f8fe5725841751f))
* new merging strategy ([#1097](https://github.com/nuxt/content/issues/1097)) ([8870aeb](https://github.com/nuxt/content/commit/8870aeb5b002a5460f909c0c14ed9cb6b2868dbc))
* nitropack ([#75](https://github.com/nuxt/content/issues/75)) ([1fe3e5b](https://github.com/nuxt/content/commit/1fe3e5b2579c8ef3aa045d2009db01509b1dab14))
* numerical operators ([#1092](https://github.com/nuxt/content/issues/1092)) ([dd62629](https://github.com/nuxt/content/commit/dd626293153cbec6f9a344e82a5ce4d453578998))
* nuxt 3 compatibility improvements ([#70](https://github.com/nuxt/content/issues/70)) ([41f3ac4](https://github.com/nuxt/content/commit/41f3ac438f8736475e448c2f3cefe28d496f44f0))
* **nuxt-mdc:** extract markdown parser ([#2187](https://github.com/nuxt/content/issues/2187)) ([b675446](https://github.com/nuxt/content/commit/b675446bdaa46650888eb259b959a32abdbd54d8))
* order ([e2aaa5f](https://github.com/nuxt/content/commit/e2aaa5f4c621233e705eb5258d9696e7250d61a5))
* page level caching ([#3158](https://github.com/nuxt/content/issues/3158)) ([f4e4f4c](https://github.com/nuxt/content/commit/f4e4f4ce9fc921c28ee7e1b960b1b16d2f01c560))
* parser options ([6721dbd](https://github.com/nuxt/content/commit/6721dbd2f51e51b06d9583c2a1d24d21d1dca53f))
* **parser:** introduce `_dir` field in contents ([#1613](https://github.com/nuxt/content/issues/1613)) ([98271a7](https://github.com/nuxt/content/commit/98271a74d976448cf437996f4b12f206935e0499))
* **path-meta:** store `source`, `path` and `extension` in meta ([#70](https://github.com/nuxt/content/issues/70)) ([ae9a771](https://github.com/nuxt/content/commit/ae9a771baced7041759654545ba6b67d7f03af48))
* per-page components ([#1429](https://github.com/nuxt/content/issues/1429)) ([e95d512](https://github.com/nuxt/content/commit/e95d5120cb9615e1a332b28dae015da01814d4b5))
* **plausible:** add plausible ; fix landing page ([5fd673e](https://github.com/nuxt/content/commit/5fd673e4f73c64a4a91179cd809407d422130abc))
* **playground:** use remote parser from playground ([df10828](https://github.com/nuxt/content/commit/df10828ba034ba3cc889a84f5612dd87f0755314))
* **pnpm:** switch to pnpm (local / ci) ([#1868](https://github.com/nuxt/content/issues/1868)) ([01ccc9d](https://github.com/nuxt/content/commit/01ccc9dc5b380a79afb1e7fcfcc5bffcfc0e9a45))
* postgresql database adapter ([c5667d4](https://github.com/nuxt/content/commit/c5667d4132d51459b6d94acb95504d4a0665d1a6))
* pre / post parsing hooks ([#2925](https://github.com/nuxt/content/issues/2925)) ([c2c98d8](https://github.com/nuxt/content/commit/c2c98d8fe93b75732d702583b1c25a6de9c78687))
* pre fetch contents on build ([#1411](https://github.com/nuxt/content/issues/1411)) ([84b036d](https://github.com/nuxt/content/commit/84b036de214c8c3c3436c8630621e20f1382a19c))
* prefix content tables with `content_` ([5e6fe3b](https://github.com/nuxt/content/commit/5e6fe3b170e2f0da8eb38a236f3cd4c67e3dfe0a))
* prevent including unused adapters in app bundle ([2082970](https://github.com/nuxt/content/commit/2082970044ad36faf030514f46fd412a6de75a10))
* preview mode ([#1094](https://github.com/nuxt/content/issues/1094)) ([b8ae700](https://github.com/nuxt/content/commit/b8ae7001bb09c150d62f607ae2b82476069baa31))
* provice default value for seo title & description ([c8d8848](https://github.com/nuxt/content/commit/c8d88489b9124ebc249f5c6077d3714147070140))
* provide syntax highlighting ([#24](https://github.com/nuxt/content/issues/24)) ([8ec7010](https://github.com/nuxt/content/commit/8ec70107dfe4709fdd03c6f90894902e14aff000))
* **query:** allow chaining multiple `where` conditions ([#52](https://github.com/nuxt/content/issues/52)) ([2a4b9bf](https://github.com/nuxt/content/commit/2a4b9bf3a94c8eb54477af6b9748674f74b3c1e1))
* **query:** fully cacheable api ([#1752](https://github.com/nuxt/content/issues/1752)) ([0683ade](https://github.com/nuxt/content/commit/0683adea4908e74538afe47e194beb3d403614a4))
* **query:** support complex SQL where conditions ([#2878](https://github.com/nuxt/content/issues/2878)) ([7f8f128](https://github.com/nuxt/content/commit/7f8f1285536d1993a15f5081cbc2f68e80570029))
* **query:** support regex ([#121](https://github.com/nuxt/content/issues/121)) ([df73c48](https://github.com/nuxt/content/commit/df73c480196bf0e072ba0883deab388e81d95e45))
* **query:** surround query ([#9](https://github.com/nuxt/content/issues/9)) ([daa44c3](https://github.com/nuxt/content/commit/daa44c33ace5d2f2a7657be4c0b95e80f4cb6f85))
* **readme:** update readme (publish latest commit) ([92c3342](https://github.com/nuxt/content/commit/92c334293da145149b10aeab8a5f2c84f8585dc8))
* reduce page jank ([#433](https://github.com/nuxt/content/issues/433)) ([b5b419f](https://github.com/nuxt/content/commit/b5b419f8af421c034b5207af321cdf266abedd64))
* refactor content storages ([#87](https://github.com/nuxt/content/issues/87)) ([c0a39f6](https://github.com/nuxt/content/commit/c0a39f63515f024ae2402dfcae7734a01be75568))
* Refactor for a great DX ([#1073](https://github.com/nuxt/content/issues/1073)) ([2eb9bd5](https://github.com/nuxt/content/commit/2eb9bd5c6701f1f1bd3112cacb47fc0d821f5de3))
* refactor markdown transformer ([#10](https://github.com/nuxt/content/issues/10)) ([d5b286f](https://github.com/nuxt/content/commit/d5b286f07dbd91edf191d3ec540790568587c9e7))
* refactor to queryContent() composable ([#83](https://github.com/nuxt/content/issues/83)) ([20e1694](https://github.com/nuxt/content/commit/20e16948e9508804b734c8d0696cc66dcc701982))
* register `component/content` as non-global components ([cda951f](https://github.com/nuxt/content/commit/cda951f1139ee92e4b9862ad17cf823b71d56af8))
* rehype plugins ([#65](https://github.com/nuxt/content/issues/65)) ([f6bb586](https://github.com/nuxt/content/commit/f6bb586435418ef954f77ddfee18d4cb0c0b4781))
* replace `fields` with `only` ([22adb30](https://github.com/nuxt/content/commit/22adb30d57343095f464330c75b12968a1ff2218))
* rewrite runtime API and better exports ([#67](https://github.com/nuxt/content/issues/67)) ([18f9401](https://github.com/nuxt/content/commit/18f9401e68af0d1546ed747dcdf3a6b6ee2f27a2))
* runtime props detection ([#72](https://github.com/nuxt/content/issues/72)) ([c5247a2](https://github.com/nuxt/content/commit/c5247a287010216f4a57a8ae9c577bea7a618247))
* **search:** allow filtering contents in search sections ([#3053](https://github.com/nuxt/content/issues/3053)) ([2dc38cf](https://github.com/nuxt/content/commit/2dc38cfcd6eada4aa65d2547d61c5c0b702ba653))
* **search:** retrieve extra fields in search sections ([#3178](https://github.com/nuxt/content/issues/3178)) ([29f4b3e](https://github.com/nuxt/content/commit/29f4b3e57867be2670eb4c79aa0130f5f4e10256))
* separate collections chunks ([384d3a2](https://github.com/nuxt/content/commit/384d3a2f8624cbcba296ec2961dbca70dd8b11f9))
* **shiki-highlighter:** improve performance & auto load new languages ([#1775](https://github.com/nuxt/content/issues/1775)) ([b40d1a3](https://github.com/nuxt/content/commit/b40d1a381069c9ce48eea5991bf91ed472e01bb0))
* **shiki-transformer:** highlight code blocks and inline code on pars stage ([#113](https://github.com/nuxt/content/issues/113)) ([de3b70c](https://github.com/nuxt/content/commit/de3b70cbc051a82c3bc07486d6254c6e9d7d826e))
* **shiki:** expose highlighting utils ([#1727](https://github.com/nuxt/content/issues/1727)) ([4ab5e05](https://github.com/nuxt/content/commit/4ab5e05328797ee0312a0ceaa99e6be120e17bac))
* **shiki:** highlight excerpt ([#1802](https://github.com/nuxt/content/issues/1802)) ([1eace98](https://github.com/nuxt/content/commit/1eace984a57f8a972c7c42d856b06bfe0304ffee))
* **shiki:** highlight MDC syntax ([#142](https://github.com/nuxt/content/issues/142)) ([d5acde2](https://github.com/nuxt/content/commit/d5acde2d744b43b3bab6898deae1a731fee364ab))
* **shiki:** Support italic, bold and underline styles ([#2079](https://github.com/nuxt/content/issues/2079)) ([ec73bda](https://github.com/nuxt/content/commit/ec73bdac70704fdc47b78a801efb7e9524f0d7ea))
* short hash for query API ([#151](https://github.com/nuxt/content/issues/151)) ([ef240af](https://github.com/nuxt/content/commit/ef240af6f7c9098126904ca25faa921b094383fa))
* sort by score (most relevant first) when searching ([#671](https://github.com/nuxt/content/issues/671)) ([1936a0e](https://github.com/nuxt/content/commit/1936a0eee5b929c04c666097453ef27adde7ca21))
* **sort:** replace `sortBy()` with advanced `sort()` ([#1090](https://github.com/nuxt/content/issues/1090)) ([1211d43](https://github.com/nuxt/content/commit/1211d43235408660eed9e3d7ccb81d70e46fa386))
* **source:** allow overwriting default source ([#1273](https://github.com/nuxt/content/issues/1273)) ([c21f5f1](https://github.com/nuxt/content/commit/c21f5f17c88d39da5afa1836b48c715e09c2e1ff))
* **sources:** define custom sources ([#2941](https://github.com/nuxt/content/issues/2941)) ([53bf75d](https://github.com/nuxt/content/commit/53bf75d6f2198eca664009032386ddce894de132))
* spa mode ([#1525](https://github.com/nuxt/content/issues/1525)) ([0cfc71c](https://github.com/nuxt/content/commit/0cfc71cb711051cfacc18ea7ed4aa2b05eea4b9a))
* **starter:** docs code group ([#1](https://github.com/nuxt/content/issues/1)) ([09b93aa](https://github.com/nuxt/content/commit/09b93aa524774c624651077caa9c36168fa50449))
* **starter:** footer; move icons to footer; fixes ([afcbdba](https://github.com/nuxt/content/commit/afcbdbafc331126359debba25fbafa6ae28bccb9))
* **starters:** add arrow keys and transitions on slides ([7ae44ec](https://github.com/nuxt/content/commit/7ae44ec8b7a4b0765ca36a3dc8501b0eb3fbbc25))
* **starters:** add blog ([21cb862](https://github.com/nuxt/content/commit/21cb862c4ffbb1f4e348d73184342a3ec4d9b81b))
* **starters:** add slides starter template ([5210d7e](https://github.com/nuxt/content/commit/5210d7ed50fc57ecd19ff59af34d92c0ab49779f))
* **studio:** integration ([#2836](https://github.com/nuxt/content/issues/2836)) ([99f6f2f](https://github.com/nuxt/content/commit/99f6f2ff7b58978c40bdd1453e3a1972503ab614))
* support `where` & `order` in navigation & surround utils ([e8df390](https://github.com/nuxt/content/commit/e8df390c4130ce82b7171a513daf3d3de536b404))
* support authentication token for private repositories ([66cd372](https://github.com/nuxt/content/commit/66cd37275239008513bc94ddcc8fe8641389b98d))
* support csv files ([#134](https://github.com/nuxt/content/issues/134)) ([a3318aa](https://github.com/nuxt/content/commit/a3318aaeab019783fc6d07e49447090f1833e017))
* support custom return types by the fetch method ([#42](https://github.com/nuxt/content/issues/42)) ([9c11915](https://github.com/nuxt/content/commit/9c11915e99c4ee0934739bc25c1ecdd5d05b3e07))
* support dynamic table of contents ([#600](https://github.com/nuxt/content/issues/600)) ([5cf18c4](https://github.com/nuxt/content/commit/5cf18c41b3b383a4989db5eae775feb9ddf409d0))
* support github custom domain ([#458](https://github.com/nuxt/content/issues/458)) ([d01e134](https://github.com/nuxt/content/commit/d01e1347f88006948929ced9dfa6dd97e3fa2008))
* support glob patterns in collection's source ([233c296](https://github.com/nuxt/content/commit/233c296fc2326935a225f75466bf32703ff9afb3))
* support json/json5 files ([#123](https://github.com/nuxt/content/issues/123)) ([0bca367](https://github.com/nuxt/content/commit/0bca36796cc6eb6d1b36ac70e86e91ad2f5aafdc))
* support multiple highlight themes ([#48](https://github.com/nuxt/content/issues/48)) ([49f0c33](https://github.com/nuxt/content/commit/49f0c339ad063203c27a222740b154ce8d96cf89))
* support navigation field in content and _dir.yml ([#1328](https://github.com/nuxt/content/issues/1328)) ([4267bf2](https://github.com/nuxt/content/commit/4267bf24087f669b736b8c40d114efece829d3f0))
* support remark plugins ([a64b38e](https://github.com/nuxt/content/commit/a64b38efad521b48dba6aca8209748e509cebe6f))
* support remote git repository as collection source ([9583dff](https://github.com/nuxt/content/commit/9583dffe57bcd2976a007da145370b1adf0570ac))
* supports meta of markdown slots ([#95](https://github.com/nuxt/content/issues/95)) ([9d5530c](https://github.com/nuxt/content/commit/9d5530cced03386d6cb8f7870833b6124292254e))
* surround and navigation ([4a952ad](https://github.com/nuxt/content/commit/4a952ad685fefddf37898d965a613cb5da335c8c))
* **tailwindcss:** support tailwindcss classes in content (with hmr) ([#1351](https://github.com/nuxt/content/issues/1351)) ([56a234c](https://github.com/nuxt/content/commit/56a234c44c49a66ef4a727b17fc73ff4a2a09418))
* theme initialize ([#30](https://github.com/nuxt/content/issues/30)) ([4a8da6e](https://github.com/nuxt/content/commit/4a8da6e04a4e849d486b52d30343083e49db8905))
* **theme-docs:** add `defaultDir` options ([#468](https://github.com/nuxt/content/issues/468)) ([e4bae6c](https://github.com/nuxt/content/commit/e4bae6cf779e38e8238766d038d4febe2386b602))
* **theme-docs:** add algolia integration (similar to vuepress) ([#523](https://github.com/nuxt/content/issues/523)) ([7c83d96](https://github.com/nuxt/content/commit/7c83d96463aaa56a7660c700bfd92f6a16190248))
* **theme-docs:** add badge component ([71a7e29](https://github.com/nuxt/content/commit/71a7e29dff3db169e3e824c65bfbe8d8131d5df8))
* **theme-docs:** add Brazilian Portuguese translation file ([#915](https://github.com/nuxt/content/issues/915)) ([329ca8e](https://github.com/nuxt/content/commit/329ca8e477698038f7ae1bfba3390682780bc258))
* **theme-docs:** add default `generate` property in config ([#354](https://github.com/nuxt/content/issues/354)) ([12615a6](https://github.com/nuxt/content/commit/12615a6a8297a982c034fc0cf4843d8e7a1bf198))
* **theme-docs:** add german locale ([#334](https://github.com/nuxt/content/issues/334)) ([0dd7750](https://github.com/nuxt/content/commit/0dd77507324bfe42ddab47cc146278d7f748ce1e))
* **theme-docs:** add korean locale ([#709](https://github.com/nuxt/content/issues/709)) ([7fda834](https://github.com/nuxt/content/commit/7fda834b4e926f3ec288702b439c6a9185ae23e1))
* **theme-docs:** add locale polish support ([#571](https://github.com/nuxt/content/issues/571)) ([ff54d11](https://github.com/nuxt/content/commit/ff54d1134a1bd938d7ebe65438ac8968e9031a08))
* **theme-docs:** add locale simplified chinese support ([#471](https://github.com/nuxt/content/issues/471)) ([17850f7](https://github.com/nuxt/content/commit/17850f77addd2e0046f62588dfc4a0cbcf7361e4))
* **theme-docs:** add locale spanish support ([#348](https://github.com/nuxt/content/issues/348)) ([4103f50](https://github.com/nuxt/content/commit/4103f500b566703e155e84d12d29bf11037f4a3e))
* **theme-docs:** add locale turkish support ([#570](https://github.com/nuxt/content/issues/570)) ([35d79fe](https://github.com/nuxt/content/commit/35d79fe75b5f7d201e2106c153241086693305fa))
* **theme-docs:** Add new tailwindcss future flags ([#573](https://github.com/nuxt/content/issues/573)) ([9daa645](https://github.com/nuxt/content/commit/9daa6457eeced893f423a8a45766807cc20b16f3))
* **theme-docs:** add single page layout setting ([#355](https://github.com/nuxt/content/issues/355)) ([090cfde](https://github.com/nuxt/content/commit/090cfdeea4e88e1b416ae7e00926fa78e8a819e3))
* **theme-docs:** add variant and icon support in `list` component ([#490](https://github.com/nuxt/content/issues/490)) ([19ee400](https://github.com/nuxt/content/commit/19ee400704f8d76cc7c5a09b2f9302794b8eb827))
* **theme-docs:** Added nl-BE.js localization file to docs theme ([#739](https://github.com/nuxt/content/issues/739)) ([10fbaaf](https://github.com/nuxt/content/commit/10fbaaff4ff990e26309853f4e4f5bfccc1ef59c))
* **theme-docs:** allow customising default branch ([#324](https://github.com/nuxt/content/issues/324)) ([f7d3f44](https://github.com/nuxt/content/commit/f7d3f4405f6d4d92376d4b108953bb95a74466d4))
* **theme-docs:** display updatedAt date in bottom of page ([#687](https://github.com/nuxt/content/issues/687)) ([51619dd](https://github.com/nuxt/content/commit/51619dd866f5b4b89645935d6c26bc010ebf9bfe))
* **theme-docs:** handle badge and subtitle in main page ([27d9422](https://github.com/nuxt/content/commit/27d94224ea2ff1d3d79879e97bfaaa9519458129))
* **theme-docs:** improve alert component ([#352](https://github.com/nuxt/content/issues/352)) ([da70756](https://github.com/nuxt/content/commit/da70756746535a8b0f8a518aff2bbd29d813c4e9))
* **theme-docs:** register root components dir ([5e16c2b](https://github.com/nuxt/content/commit/5e16c2bf55f895607f9e975ed7c44f421687b9eb))
* **theme-docs:** support `docs.primaryColor` ([#507](https://github.com/nuxt/content/issues/507)) ([cefb24e](https://github.com/nuxt/content/commit/cefb24efeb8e8f05d91e1acd3528aa556296acd5))
* **theme-docs:** support `release-it` default release syntax ([#323](https://github.com/nuxt/content/issues/323)) ([44b3769](https://github.com/nuxt/content/commit/44b37690911bbef32901e9cca925de83fcf7213f))
* **theme-docs:** transform subdirectories into routes ([395e3b8](https://github.com/nuxt/content/commit/395e3b8242f2df0a6b82a43fa53d61510bffe6c1))
* **theme-docs:** update locale simplified Chinese translation ([#838](https://github.com/nuxt/content/issues/838)) ([d33bd68](https://github.com/nuxt/content/commit/d33bd681e394b9e33100c7061786c552a1ef6807))
* **theme:** add themePath to theme config on boot ([3b34cf6](https://github.com/nuxt/content/commit/3b34cf684795fab09fd724892b22eaae9cbc5bd9))
* **theme:** change merge order for theme & user project ([f4928e8](https://github.com/nuxt/content/commit/f4928e807a7a31899146bc9efc000740fdab1603))
* **theme:** improve theme loading ([04dcc82](https://github.com/nuxt/content/commit/04dcc821e5f464200a479e679ed1f6c1b3b43c79))
* **theme:** lighten and refact theme loading ([ed179eb](https://github.com/nuxt/content/commit/ed179eb844e15a006321beac7b3e828967a81661))
* top level `content/` directory in Nuxt 4 compatibility version ([#2649](https://github.com/nuxt/content/issues/2649)) ([3162639](https://github.com/nuxt/content/commit/316263956086f093d0d4c0db22f26c99eefaa2cb))
* **types:** expose `MarkdownParsedContent` for improved type generics ([#1199](https://github.com/nuxt/content/issues/1199)) ([0329ac9](https://github.com/nuxt/content/commit/0329ac92c3b9bb4c24205beca750b82b28c5172b))
* **types:** provide augmentations for `only` and `without` ([#1200](https://github.com/nuxt/content/issues/1200)) ([51a1620](https://github.com/nuxt/content/commit/51a162035ea47e664e68a86484a311a0bc96796a))
* unique api calls per build ([#1705](https://github.com/nuxt/content/issues/1705)) ([3e2e6eb](https://github.com/nuxt/content/commit/3e2e6eb8d3d2069b945536f7a7a5a56e1c29734a))
* unwrap Vue 3 components ([#12](https://github.com/nuxt/content/issues/12)) ([07d1073](https://github.com/nuxt/content/commit/07d10736d8a653b8b87b684f35ee3aa4ace1aad0))
* update import path for shiki languages ([#2942](https://github.com/nuxt/content/issues/2942)) ([f4f68ba](https://github.com/nuxt/content/commit/f4f68ba1317d844621254994367d1566042603ff))
* update json & yml transformers ([#1095](https://github.com/nuxt/content/issues/1095)) ([378044d](https://github.com/nuxt/content/commit/378044d9210e3fe2b6fe8d805bfc273ffcfd8497))
* update types ([#2156](https://github.com/nuxt/content/issues/2156)) ([5f059f8](https://github.com/nuxt/content/commit/5f059f81478ef6e64c5a63db9da24b80ae337176))
* use `<nuxt-link>` instead of `<a>` ([#95](https://github.com/nuxt/content/issues/95)) ([15164ec](https://github.com/nuxt/content/commit/15164ecbf2d4055e1312a7bc26c31bcf253c87ba))
* use diff-highlight plugin ([#755](https://github.com/nuxt/content/issues/755)) ([3c2186a](https://github.com/nuxt/content/commit/3c2186a9005c37b3b668ff0124aa77f80c989b85))
* use pathe ([#71](https://github.com/nuxt/content/issues/71)) ([c350901](https://github.com/nuxt/content/commit/c3509012bd9cfbf18d956298036c06b46bac8d9c))
* use shiki highlighter from latest `@docus/mdc` ([143ff48](https://github.com/nuxt/content/commit/143ff48ed602e1400452daa6c79bdb0504138e83))
* use tailwind css module v3 ([#341](https://github.com/nuxt/content/issues/341)) ([ea12515](https://github.com/nuxt/content/commit/ea125153df920b8f04ac3cc97c9c6fa292d432c7))
* **use-content-head:** add helper for <head> binding ([#1295](https://github.com/nuxt/content/issues/1295)) ([105f690](https://github.com/nuxt/content/commit/105f69058dc0bf9588ff20a2ce345c7b235e5385))
* variable binding ([#1266](https://github.com/nuxt/content/issues/1266)) ([b2d775b](https://github.com/nuxt/content/commit/b2d775bb764fe9196c16fa8656d0c3cbe76c8297))
* vercel preset ([0b6c950](https://github.com/nuxt/content/commit/0b6c9502ef5a4056583e097879cd0c2526f75aff))
* watch content config and cache files ([5917d8a](https://github.com/nuxt/content/commit/5917d8ae545a32d8f594100d36b0f934ef00ee9c))
* watch contents in development ([a06d7c4](https://github.com/nuxt/content/commit/a06d7c4b5aecf184b662a8772c0498c92c8eee7e))
* **watch:** watch for cahnges in all local sources ([c5b1a4f](https://github.com/nuxt/content/commit/c5b1a4f85a73f347fbd30c998f333de8d8385603))
* **withdocus:** push module at top of buildModules instead of modules ([5c8e088](https://github.com/nuxt/content/commit/5c8e088ceb5d9a326dc590138e01fa061f95655d))
* without fields ([#179](https://github.com/nuxt/content/issues/179)) ([712b743](https://github.com/nuxt/content/commit/712b7436c19c852d93694d3f9033653273677cdc))
* **ws:** use refreshNuxtdata() on websocket update (content) ([fba1bbd](https://github.com/nuxt/content/commit/fba1bbdd68ee395942448fb827178a3173f7acf8))
* **zod:** editor metadata ([#3133](https://github.com/nuxt/content/issues/3133)) ([7a9ca9e](https://github.com/nuxt/content/commit/7a9ca9ed2a874300ac73a2f9a939aa32ec41a579))

### Bug Fixes

*  refactor structor ([#18](https://github.com/nuxt/content/issues/18)) ([88ff98e](https://github.com/nuxt/content/commit/88ff98eb19ce4408a05e94f1672d47c759a08b25))
* [#653](https://github.com/nuxt/content/issues/653) - remark-gfm dependency added to manage markdown tables ([#654](https://github.com/nuxt/content/issues/654)) ([5a5c6ac](https://github.com/nuxt/content/commit/5a5c6ac06698c98972fa3053a1a66ca7202af144))
* **`<ContentDoc>`:** render blink in SSG ([#1600](https://github.com/nuxt/content/issues/1600)) ([2f410e8](https://github.com/nuxt/content/commit/2f410e8071ac9f5702127136fce538d91ae6e86a))
* **`<ContentList>`:** respect `query.path` when `path` is missing ([#1598](https://github.com/nuxt/content/issues/1598)) ([4a2937c](https://github.com/nuxt/content/commit/4a2937c601bc64f864a61cc2bfb1e9b24ed9bc57))
* **`<ContentRenderer>`:** prioritize default slot ([#1460](https://github.com/nuxt/content/issues/1460)) ([bf35a81](https://github.com/nuxt/content/commit/bf35a8152ba2db791687772adfa5bea7dfa4238a))
* **`<MarkDown>`:** prevent multiple deprecation log ([#1497](https://github.com/nuxt/content/issues/1497)) ([2b4fcd0](https://github.com/nuxt/content/commit/2b4fcd00c63e5570fc94c7b93a8aa51546b56a9b))
* `$content.preview` type ([e7dba00](https://github.com/nuxt/content/commit/e7dba008fb0aa0b9a209cc9bd4c0013e78de2d5b))
* `queryCollectionItemSurroundings` type definition in built module ([#3121](https://github.com/nuxt/content/issues/3121)) ([808c133](https://github.com/nuxt/content/commit/808c133536e59f2549297928a1ea493e805cafa2))
* `queryContent` type ([baf214c](https://github.com/nuxt/content/commit/baf214cbc4a85220f1a38e4ad169465734af6abf))
* **`queryContent`:** use path argument as prefix if there is another condition ([#1612](https://github.com/nuxt/content/issues/1612)) ([5ec049d](https://github.com/nuxt/content/commit/5ec049d3eae339d53a1e070d2352ed8535d905c0))
* `useContentHead` was not respecting `og:image` props ([#1461](https://github.com/nuxt/content/issues/1461)) ([bcf241a](https://github.com/nuxt/content/commit/bcf241a368398b9c28ec8a1cd23f298c33004fc0))
* `weight` generation ([303030a](https://github.com/nuxt/content/commit/303030aedb6e6e574e1b4ee2b52c3135c2387b93))
* **<Markdown>:** prevent vdom manipulation ([#1104](https://github.com/nuxt/content/issues/1104)) ([ec0b04d](https://github.com/nuxt/content/commit/ec0b04dedf78a3080de9fffdaeb5306ece807d6b))
* 244 pass globalName to plugin client to make sure it works ([#251](https://github.com/nuxt/content/issues/251)) ([7f14a90](https://github.com/nuxt/content/commit/7f14a90a83d535884636e9453fe041eec422d14e))
* 7.search-content.md typo ([7bf8996](https://github.com/nuxt/content/commit/7bf89960f3c6714942d5b7a23cb0f6d23d74c273))
* a push for a release ([cabfa01](https://github.com/nuxt/content/commit/cabfa01038181a5fd5b207979559609ae5536897))
* access config from `public` key ([#2005](https://github.com/nuxt/content/issues/2005)) ([bd1cbb4](https://github.com/nuxt/content/commit/bd1cbb46392b8804f0c9baefa34b0e1b5f5403b4))
* activate cache for production too ([54b95dc](https://github.com/nuxt/content/commit/54b95dcd253917c2e46c22be5992ad8708ea00f2))
* add `bash` language ([25274c1](https://github.com/nuxt/content/commit/25274c1aeefc703b03de615fb2bf646dae86b9a7))
* add `og:title,url,description` meta tags and prefix `og:image` with host ([#1769](https://github.com/nuxt/content/issues/1769)) ([383f707](https://github.com/nuxt/content/commit/383f707a6327367563447a63e78757597e0c3a96))
* add anchorLinks type ([#1894](https://github.com/nuxt/content/issues/1894)) ([8d06196](https://github.com/nuxt/content/commit/8d061968101b4216d6245ceb8ac238aee700357f))
* add base64-js to optimizeDeps ([b257b52](https://github.com/nuxt/content/commit/b257b521aaf3ee35f8c686a6ffc7b7d336ad1b47))
* add content prefix for cache storage ([#92](https://github.com/nuxt/content/issues/92)) ([3418493](https://github.com/nuxt/content/commit/3418493ac891c1053767d71534861a558ed5ddf3))
* add missing dependencies ([#2313](https://github.com/nuxt/content/issues/2313)) ([76260da](https://github.com/nuxt/content/commit/76260daaa5610c27d9f38550c6a9a67c77c4b04e))
* add missing import for withContentBase ([e01d0c6](https://github.com/nuxt/content/commit/e01d0c66fcd7b378f169662c36f5e31a37f429b9))
* add missing imports ([5285db0](https://github.com/nuxt/content/commit/5285db0186eb440bdd74c34ac4f6236adcc22f96))
* add missing imports ([451b000](https://github.com/nuxt/content/commit/451b000e4d7ce943782387e3bd45713b6d93349b))
* add missing imports for search ([#2412](https://github.com/nuxt/content/issues/2412)) ([dcafe11](https://github.com/nuxt/content/commit/dcafe11813056f48913cdf2e5ba6a1f4ea539ab1))
* add Nitro hooks types declarations ([#2655](https://github.com/nuxt/content/issues/2655)) ([ac66984](https://github.com/nuxt/content/commit/ac66984be166fcc9601d4939b1b64fb328babb01))
* add other missing dependencies ([39fd508](https://github.com/nuxt/content/commit/39fd5081e277dffd4f4aaff82207fb43e135c53f))
* add regex to match ContentSlot in Pug templates ([#2344](https://github.com/nuxt/content/issues/2344)) ([6163210](https://github.com/nuxt/content/commit/61632106b20c3928d3cfec0f3c1b68a28bf6a4e1))
* add route for language homes ([#35](https://github.com/nuxt/content/issues/35)) ([3ca5050](https://github.com/nuxt/content/commit/3ca5050b6dcba54956d7c31f93e08275b1cbb628))
* add string type to gt/lt/gte/lte type definitions  ([#2704](https://github.com/nuxt/content/issues/2704)) ([233533d](https://github.com/nuxt/content/commit/233533dcacf741eff30cdbcc353f1f0896c99cc1))
* allow `]` in filename code block ([#2169](https://github.com/nuxt/content/issues/2169)) ([7a6ab10](https://github.com/nuxt/content/commit/7a6ab10749df2cff72a107140172cda33983f309))
* allow `count(*)` query ([71221d3](https://github.com/nuxt/content/commit/71221d33f4e1c228028818f1edc903f57b52e55d)), closes [#3136](https://github.com/nuxt/content/issues/3136)
* allow empty string in `$contains` ([#2179](https://github.com/nuxt/content/issues/2179)) ([2c76e2d](https://github.com/nuxt/content/commit/2c76e2d2a67011409d07f707127a6537e79382c0))
* allow inline components ends with comma & dot ([c4089fc](https://github.com/nuxt/content/commit/c4089fcfebd1032da949335f67cf2f0e2a5f59b8)), closes [docusgen/core#47](https://github.com/docusgen/core/issues/47)
* **anchorLinks:** add useRuntimeConfig imports ([#1605](https://github.com/nuxt/content/issues/1605)) ([005fdfd](https://github.com/nuxt/content/commit/005fdfd19aa9658f821cb64a868d7f4d09582e1f))
* article overflow ([b8a3715](https://github.com/nuxt/content/commit/b8a37157956e201ceb896c72cc1f7de00044f56c))
* attributes case ([#143](https://github.com/nuxt/content/issues/143)) ([2df54ec](https://github.com/nuxt/content/commit/2df54ec859377a242b3c740b4a52dcb74b19058e))
* avoid date mismatch with API ([#119](https://github.com/nuxt/content/issues/119)) ([b3346cc](https://github.com/nuxt/content/commit/b3346cc6b3554cfcc0f1ae7da974c3401326593c))
* avoid error of function component with props ([26c9cb1](https://github.com/nuxt/content/commit/26c9cb1500bd8a2ea575bfa5a64542ee713bbd74))
* avoid mutating `_layers` ([#1455](https://github.com/nuxt/content/issues/1455)) ([f592e7b](https://github.com/nuxt/content/commit/f592e7bc75cda37a1ae2b6174f9bbf5a9a9713e5))
* avoid registering `components/global` when not exists ([#548](https://github.com/nuxt/content/issues/548)) ([843a5f9](https://github.com/nuxt/content/commit/843a5f9d26af68d1d29c448e58fdc7991778ed05))
* avoid using [#import](https://github.com/nuxt/content/issues/import) in composables ([#80](https://github.com/nuxt/content/issues/80)) ([24a85cb](https://github.com/nuxt/content/commit/24a85cbc927403ed12b8eac59431213c423fa4c6))
* avoid using named export for defu ([8fb12fb](https://github.com/nuxt/content/commit/8fb12fb2a40fcfd77e998571346f16d953d04b18))
* await bridge install ([6be6a6a](https://github.com/nuxt/content/commit/6be6a6ae2572de99cf4fa4a1150338ba551cd22e))
* body parsing on POST requests ([1725dd8](https://github.com/nuxt/content/commit/1725dd8eadc6161d73698ac92a9a874921cdfeb0))
* bridge compatibility, refactor dynamic imports ([44a2bc3](https://github.com/nuxt/content/commit/44a2bc3cadfc7827e1098fe64b56cf27f18afa6b))
* broken util ([89352b8](https://github.com/nuxt/content/commit/89352b85fab74c28e44354fa7130d8a6cadcce6b))
* **build:** do not register web-socket plugin on non-dev env ([#1768](https://github.com/nuxt/content/issues/1768)) ([6f0c622](https://github.com/nuxt/content/commit/6f0c622d5dc5d5d243919b8bea54e1dd5faf45a1))
* **build:** do not return database in `dropContentTables` ([668bc15](https://github.com/nuxt/content/commit/668bc157a776362bf6a539b197c322fb100801bc))
* **build:** inline module runtime on nitro build ([#33](https://github.com/nuxt/content/issues/33)) ([2835f21](https://github.com/nuxt/content/commit/2835f2124e09ec0dcf5602362c937e299e2b0713))
* **build:** invalid cache route handler ([ae138a8](https://github.com/nuxt/content/commit/ae138a879e11def0919dd2fa90e2b6d24164e7c7))
* **build:** keep parser deps out of main bundle ([#2780](https://github.com/nuxt/content/issues/2780)) ([b429b18](https://github.com/nuxt/content/commit/b429b1810ba90dad557aa6392c18c0c9b2cc51a3))
* **build:** restore docs in tsconfig ([c01e25d](https://github.com/nuxt/content/commit/c01e25d9d622fda0be970cb2aa6be9ab92a66558))
* **bunsqlite:** polyfills not being loaded ([#3176](https://github.com/nuxt/content/issues/3176)) ([139744c](https://github.com/nuxt/content/commit/139744c9b54cd17018150b2a03cd555466672ce1))
* **cache:** split large queries ([ef50925](https://github.com/nuxt/content/commit/ef50925b7dd3461a4bb0ed83d7c51082c4b410e3))
* Cannot read properties of undefined ([11c3b09](https://github.com/nuxt/content/commit/11c3b09f692c5436e013d6df249377843db2a381))
* centralize templates usage ([202b2c9](https://github.com/nuxt/content/commit/202b2c90cb0c3615d543e38dc90c138a319c83a2))
* change config key to `content` ([d5f75ca](https://github.com/nuxt/content/commit/d5f75cac8e38eac768791a3a2e6392b7cb05addb))
* change tag extraction to match minimal tree syntax ([2ccb526](https://github.com/nuxt/content/commit/2ccb5262f792cd6caf509a6d62f992a65f1c9372))
* **changelog:** image size ([7c8e950](https://github.com/nuxt/content/commit/7c8e950a3f78ad8ccaf578ac8d66cc165bb7a58d))
* check for ws existence before closing ([#3238](https://github.com/nuxt/content/issues/3238)) ([6ec0eb8](https://github.com/nuxt/content/commit/6ec0eb8bc5db94760db6672e83635dcc91dfbf22))
* **ci:** update dependencies ([bc67b77](https://github.com/nuxt/content/commit/bc67b7708086f20b2d2ca5cd3a328d260909c1d3))
* **client-database:** prevent concurrent initialization ([#3174](https://github.com/nuxt/content/issues/3174)) ([49531dd](https://github.com/nuxt/content/commit/49531dd5600de00c8913602875244921bc9cfe27))
* **client-database:** separate db init from collection dump fetch ([#3188](https://github.com/nuxt/content/issues/3188)) ([82425a5](https://github.com/nuxt/content/commit/82425a56edee43d95930b456c83e108ad3859b47))
* **client-db:** ensure `ignoreSources` is an array ([45b44a6](https://github.com/nuxt/content/commit/45b44a69491ed94a1b467c74afe3cbd813569fee))
* **client-db:** fetch dir config on legacy query ([4b9b6b7](https://github.com/nuxt/content/commit/4b9b6b7ad813aed0170985f8aee361f98ea4080e))
* **client-db:** race-condition on multiple calls ([c11a480](https://github.com/nuxt/content/commit/c11a480006f14654928fbbe64efff8d6ba666c97))
* **clientDB:** disable clientDB if token is set and has falsy value ([#1700](https://github.com/nuxt/content/issues/1700)) ([7c424d3](https://github.com/nuxt/content/commit/7c424d3430942230eca2093f6bfd378e543a7767))
* **ClientDB:** drop LocalStorage ([7afd857](https://github.com/nuxt/content/commit/7afd857bd28a765a1a773ee64276c3a197b3331d))
* **client:** fetch collections info alonside db dump and parse json fields ([f542aff](https://github.com/nuxt/content/commit/f542aff9fffcdd161388a0bbe44e20a359d1c906))
* clone `head.meta` before manipulating ([#1370](https://github.com/nuxt/content/issues/1370)) ([5c6d51f](https://github.com/nuxt/content/commit/5c6d51f129346eaa43f906c5b0d25a8529e941e0))
* **cloudflare:** load sql dump from assets ([#3275](https://github.com/nuxt/content/issues/3275)) ([453ba2e](https://github.com/nuxt/content/commit/453ba2ea6bc2200087f42911156869af6899c353))
* **code block:** use div instead of span ([#1885](https://github.com/nuxt/content/issues/1885)) ([246bad9](https://github.com/nuxt/content/commit/246bad91f6fc6ae647512c03a7430fc1f15f8ded))
* **code-block:** meta property ([#2067](https://github.com/nuxt/content/issues/2067)) ([e19113d](https://github.com/nuxt/content/commit/e19113d536c7b74e4fbbfbaad3c1414bd37814db))
* **code-block:** pass language as class name ([#2064](https://github.com/nuxt/content/issues/2064)) ([cfe0afc](https://github.com/nuxt/content/commit/cfe0afc2d75dc4739920b7b90f671bbf00d5bb5a))
* **code-block:** use span with `\n`  instead of div for lines ([#2008](https://github.com/nuxt/content/issues/2008)) ([e946c42](https://github.com/nuxt/content/commit/e946c424ec4f93d0332e15557b4c0a944338c2c9))
* **collection:** avoid double update of some record by using the hash column as index ([#3304](https://github.com/nuxt/content/issues/3304)) ([ebfb6e5](https://github.com/nuxt/content/commit/ebfb6e516f02fb657382da0c8a66005831cafc95))
* **collection:** detect two part branches ([b0a743b](https://github.com/nuxt/content/commit/b0a743b71cabbd5af761d98e100d216fc00239c0))
* **collection:** path route matching ([8ae885d](https://github.com/nuxt/content/commit/8ae885dd150536f270753739255942e9c801d904))
* **collection:** respect default value in `null` fields ([9fdc4d6](https://github.com/nuxt/content/commit/9fdc4d6371b610cc152daf5b865af3bb2b8a888e))
* collections default value ([705aab7](https://github.com/nuxt/content/commit/705aab775acfd312281940d83496bd526184fb0c))
* CommonJS imports ([803a084](https://github.com/nuxt/content/commit/803a08469b60f1ba3a735df84a347cd334be84a6))
* **components:** add missing import ([78bdb13](https://github.com/nuxt/content/commit/78bdb136d07e39c7cf478634940a1803e8a006a2))
* **components:** improvements on Content components ([c5591b3](https://github.com/nuxt/content/commit/c5591b3e39512d83324a0de750e48a90851609b4))
* **components:** only show components/content warn message if `components/` exists ([1409ec6](https://github.com/nuxt/content/commit/1409ec6d8a90f4af74b16795df666e8099711528))
* **composables:** `useContent` should become reactive to input changes and rename composables ([#5](https://github.com/nuxt/content/issues/5)) ([ebc2608](https://github.com/nuxt/content/commit/ebc26085dde0cd34f0f62fd8efeccc3770f61d37))
* **composables:** fix missing vue import ([e4a2479](https://github.com/nuxt/content/commit/e4a2479d31e0c979685f2a40cc2bb13f78f115d3))
* **composables:** memorize `basePath` for async calls ([#20](https://github.com/nuxt/content/issues/20)) ([8fc29c6](https://github.com/nuxt/content/commit/8fc29c64d883333e05beb853ec25cd01c279d682))
* **composables:** Revert "memorize `basePath` for async calls" ([#25](https://github.com/nuxt/content/issues/25)) ([d2842d5](https://github.com/nuxt/content/commit/d2842d50b7860ffa3bf107dbdb48594cf2aa5e6e))
* compress dump ([ccb32c5](https://github.com/nuxt/content/commit/ccb32c523f2087612a57e625cf427743285e2aa5))
* **config:** add missing subpaths ([b175994](https://github.com/nuxt/content/commit/b1759940ff990ade6eca620743f452981bca5c15))
* constant initialization of content tables ([#3146](https://github.com/nuxt/content/issues/3146)) ([b2b1b4e](https://github.com/nuxt/content/commit/b2b1b4e0b746d8e4ad6d72334f1d691a9bcd62c2))
* content plugins import ([ad59ba7](https://github.com/nuxt/content/commit/ad59ba796ba173e744404ba4446d3b294f4a6e85))
* content schema ([e5f5640](https://github.com/nuxt/content/commit/e5f5640558cfcc1d1a1f1a8d6dac84afe062fad4))
* **content-doc:** also follow excerpt to default slot ([c07e0a6](https://github.com/nuxt/content/commit/c07e0a61119fdd3c284eaa1c0ead720177a7501b))
* **content-index:** files in `content` directory has higher priority ([#1414](https://github.com/nuxt/content/issues/1414)) ([cacee66](https://github.com/nuxt/content/commit/cacee6668ca8325de4e3ea2b06cefa7c69dc5146))
* **content-renderer:** fix reactivity on markdown renderer ([#152](https://github.com/nuxt/content/issues/152)) ([abd964f](https://github.com/nuxt/content/commit/abd964f181b604f70bf68adbdc95ac6fef10993b))
* **content-slot:** better slot name regex ([329cf3b](https://github.com/nuxt/content/commit/329cf3bc8426a3e58ae00cc925aedc5a4ec16f5a))
* **content, theme-docs:** disable pathPrefix for nuxt 2.15 compat ([#804](https://github.com/nuxt/content/issues/804)) ([a93dcf4](https://github.com/nuxt/content/commit/a93dcf448355e90df4cf2a6f1f3a4977e2b786d8))
* **content:** add missing `:is="tag"` to `nuxt-content-container` ([ef7b18d](https://github.com/nuxt/content/commit/ef7b18dde22e9c10db4d8ad4f6c1ab0a0c7b1790))
* **content:** add missing types ([#625](https://github.com/nuxt/content/issues/625)) ([43e5a81](https://github.com/nuxt/content/commit/43e5a819e55fa65b3b9ffc0610e3a2206a356e48))
* **content:** avoid using commonjs for runtime (vite support) ([#805](https://github.com/nuxt/content/issues/805)) ([8de3e12](https://github.com/nuxt/content/commit/8de3e12759c37f6ff74d52c6174e8d099742e833))
* **content:** bad link to github ([faa71f9](https://github.com/nuxt/content/commit/faa71f9fb265000863f8e1b5e5573a349a60f9f5))
* **content:** codeblock parse lang should support other meta ([#691](https://github.com/nuxt/content/issues/691)) ([881f6d4](https://github.com/nuxt/content/commit/881f6d49a30c67c9151872b81771a185e393d986))
* **content:** export `FetchReturn` type ([#987](https://github.com/nuxt/content/issues/987)) ([18c8c50](https://github.com/nuxt/content/commit/18c8c50f34b473d9e4f3bd8285ef6756507c0408))
* **content:** failed ci on windows and enhance file name detection regex ([#680](https://github.com/nuxt/content/issues/680)) ([f445444](https://github.com/nuxt/content/commit/f445444b277d93ef5b9376bb1a031643d4c0329e))
* **content:** fix tab key handling of editor component with IME ([#509](https://github.com/nuxt/content/issues/509)) ([c5c5e02](https://github.com/nuxt/content/commit/c5c5e02497f761f59a8299f3d54ab9b54abe77eb))
* **content:** handle empty lang ([#765](https://github.com/nuxt/content/issues/765)) ([60e758c](https://github.com/nuxt/content/commit/60e758c6f1e7bff4de37f3a499284139db0a7d60))
* **content:** handle readable ended request ([#790](https://github.com/nuxt/content/issues/790)) ([7660d0f](https://github.com/nuxt/content/commit/7660d0fff4ef66c04ef20256251f94eb4457734b))
* **ContentList:** component slot typechecking ([#2277](https://github.com/nuxt/content/issues/2277)) ([467b757](https://github.com/nuxt/content/commit/467b7573a155a2ca798e682e3090cf4fe62036e6))
* **ContentList:** handle props change and fix slots default ([#1668](https://github.com/nuxt/content/issues/1668)) ([3b5a80e](https://github.com/nuxt/content/commit/3b5a80e5c20a057dc436761b23930f231a6dec54))
* **content:** merge class and style attribute ([#905](https://github.com/nuxt/content/issues/905)) ([d905ffe](https://github.com/nuxt/content/commit/d905ffe35bfba8ccfb4db534d6571fcabff8ef8c))
* **content:** Offline mode ([#429](https://github.com/nuxt/content/issues/429)) ([277da7d](https://github.com/nuxt/content/commit/277da7d33deba4c2e5a6f6b9a25e2432d92c3b7a)), closes [#229](https://github.com/nuxt/content/issues/229)
* **content:** optional search parameter condition ([de4c860](https://github.com/nuxt/content/commit/de4c8607239b3e7ff1605bba698e9ef5c9bd242f))
* **content:** options were not forwarded in plugin static lazy ([#350](https://github.com/nuxt/content/issues/350)) ([36ef2e3](https://github.com/nuxt/content/commit/36ef2e39a14ce8f71d9d5ea5fcd22c91c2268f83))
* **content:** prevent editor extending on typing ([#933](https://github.com/nuxt/content/issues/933)) ([d4dce1e](https://github.com/nuxt/content/commit/d4dce1eabc66d19f31ee412e9eb844517cc60586))
* ContentQuery `_path` not used properly ([#1141](https://github.com/nuxt/content/issues/1141)) ([#1143](https://github.com/nuxt/content/issues/1143)) ([1dc7377](https://github.com/nuxt/content/commit/1dc7377ec48834be2ab92e9aa97d1673e5fb33a7))
* **ContentQuery:** add condition if value is undefined ([6a05508](https://github.com/nuxt/content/commit/6a0550812e0498ece7a218a3299ff54389b99282))
* **ContentQuery:** generate cache key based on props ([#1174](https://github.com/nuxt/content/issues/1174)) ([4bc07dc](https://github.com/nuxt/content/commit/4bc07dc4880d97e2211019ee4ff5d40d7f3466e5))
* **ContentQuery:** handle `null` data ([#1230](https://github.com/nuxt/content/issues/1230)) ([a7d3f4d](https://github.com/nuxt/content/commit/a7d3f4d154ec29fa8dc7388d30f4bc59032c8f92))
* **ContentQuery:** path shall be undefined by default ([80fc39f](https://github.com/nuxt/content/commit/80fc39f10a2c506daf85bbc33d47ed3f0f513427))
* **content:** remove cycle dependency ([7700762](https://github.com/nuxt/content/commit/77007624fe179b4c3e66da5b2cc257b13d19eda7))
* **content:** remove flatmap to support node v10 ([#770](https://github.com/nuxt/content/issues/770)) ([21635e2](https://github.com/nuxt/content/commit/21635e2488c9edb899ab3dbffbcc93e6dd9a3b82))
* **ContentRenderer:** async loader types ([f1a9b8e](https://github.com/nuxt/content/commit/f1a9b8e1d67a4a753a184efcf536f365dbb70354))
* **ContentRenderer:** empty content detection ([#1653](https://github.com/nuxt/content/issues/1653)) ([dee9ae1](https://github.com/nuxt/content/commit/dee9ae1ef59d69e36c19c3f9f28dac723d275832))
* **ContentRendererMarkdown:** preload components used in content ([#1309](https://github.com/nuxt/content/issues/1309)) ([a77bbd9](https://github.com/nuxt/content/commit/a77bbd9ecae02aee57da415ba2ee3b67655e308a))
* **ContentRendererMarkdown:** prevent `undefiend` error on component resolve ([#2021](https://github.com/nuxt/content/issues/2021)) ([c12c707](https://github.com/nuxt/content/commit/c12c707b5cc08ca672bf5d6ed6cb35050fa796b6))
* **ContentRendererMarkdown:** recreate vNodes in render function ([#1734](https://github.com/nuxt/content/issues/1734)) ([7ff1018](https://github.com/nuxt/content/commit/7ff1018247d7589e5cca577199a5d052ec50dc1a))
* **ContentRenderer:** render `empty` slot if body is empty ([c325151](https://github.com/nuxt/content/commit/c3251514a16f50a1d0692324173a016bd3100223)), closes [#2877](https://github.com/nuxt/content/issues/2877)
* **ContentRenderer:** render contents only with excerpt ([#2246](https://github.com/nuxt/content/issues/2246)) ([aea5e58](https://github.com/nuxt/content/commit/aea5e58bfe0a126ea9c6c0660073a57925df9588))
* **ContentRenderer:** typo in class props ([e817035](https://github.com/nuxt/content/commit/e81703523c487aacd9fe2d69a18e1c9a87dd18da))
* **ContentRenderer:** update existed entries in componets map ([92adce3](https://github.com/nuxt/content/commit/92adce37fceb920085b40719646b49e9308a1b9c))
* contents hot reload ([0aec8fc](https://github.com/nuxt/content/commit/0aec8fc459f91d7264de0b20900d5c29223c1f18))
* **ContentSlot:** detect multiline usage ([#2508](https://github.com/nuxt/content/issues/2508)) ([58f96db](https://github.com/nuxt/content/commit/58f96db6828f93db608bc275d9f94e4e62fa3ffd))
* **content:** support space after codeblock for filename ([#621](https://github.com/nuxt/content/issues/621)) ([9d900ff](https://github.com/nuxt/content/commit/9d900ff648c96aa0454986819cb31b374b451ecc))
* **content:** update highlighter spec ([8108f84](https://github.com/nuxt/content/commit/8108f84bf94727d7cb9d786c775e0b9c502d4d0f))
* **content:** update type definition for `QueryBuilder.fetch()` ([#825](https://github.com/nuxt/content/issues/825)) ([4cc224e](https://github.com/nuxt/content/commit/4cc224ef2779d2000092333ab9b5ac3f99171674))
* **content:** use `property-information` to convert hast attributes ([#359](https://github.com/nuxt/content/issues/359)) ([58061e0](https://github.com/nuxt/content/commit/58061e02369e3d48419b83886c02d6f29f968945))
* **content:** use defu.arrayFn instead of custom merger ([#408](https://github.com/nuxt/content/issues/408)) ([9e5ba55](https://github.com/nuxt/content/commit/9e5ba558782a70269997576ed4c4242af3d0e87c))
* **content:** write db.json with hash ([#438](https://github.com/nuxt/content/issues/438)) ([0a8ed35](https://github.com/nuxt/content/commit/0a8ed35ccb72193e755aa63feb35b258cd03e921))
* convert `NULL` column to undefined ([4a80424](https://github.com/nuxt/content/commit/4a80424ce821f94947646a70aea96235f1af9427))
* convert boolean value to number in query condition ([#2927](https://github.com/nuxt/content/issues/2927)) ([#3018](https://github.com/nuxt/content/issues/3018)) ([c11f90a](https://github.com/nuxt/content/commit/c11f90abe020e804de1620320e16d26c6b9dd5bb))
* correct type comment for navigation property ([#1182](https://github.com/nuxt/content/issues/1182)) ([82efc23](https://github.com/nuxt/content/commit/82efc232738c796c3db3a8ae95862305b3dca4d9))
* correct typos in comments within mergeDraft function ([006c615](https://github.com/nuxt/content/commit/006c615e56ff3fb7c6db3f381661f3ee1be729d3))
* corrected .gradient class ([#2723](https://github.com/nuxt/content/issues/2723)) ([482cad0](https://github.com/nuxt/content/commit/482cad07c5a7dec509e221eb02d4e2b926340c32))
* create default error page ([#53](https://github.com/nuxt/content/issues/53)) ([3162bd2](https://github.com/nuxt/content/commit/3162bd217be1ef7e26f61e276d69b9a85b5c3d95))
* **create-nuxt-content-docs:** respect npm client answer ([#779](https://github.com/nuxt/content/issues/779)) ([1670c5b](https://github.com/nuxt/content/commit/1670c5b01f442cf3212c81cc17cff9232b6265f8))
* Custom drivers failed on build ([#2193](https://github.com/nuxt/content/issues/2193)) ([5002a37](https://github.com/nuxt/content/commit/5002a37cd387fab79426f72cabd4ee73cac15844))
* **database:** prevent creating multiple database connections ([#3126](https://github.com/nuxt/content/issues/3126)) ([06a7014](https://github.com/nuxt/content/commit/06a7014394056cc5e99d2640274860ad41f451a3))
* **database:** remove comments form dump queries ([#3221](https://github.com/nuxt/content/issues/3221)) ([474c224](https://github.com/nuxt/content/commit/474c224c131806601924156e2ff8026d6c0b53e2))
* db access time issue ([#1838](https://github.com/nuxt/content/issues/1838)) ([20d8288](https://github.com/nuxt/content/commit/20d82886fb26afa7dc3fc88ea3d16ab8ca19a082))
* **dd:** layout prefetching ([#1637](https://github.com/nuxt/content/issues/1637)) ([6463e46](https://github.com/nuxt/content/commit/6463e460641e1dbdaabb71cdc39f610e163c2303))
* debounce storage watcher events ([#24](https://github.com/nuxt/content/issues/24)) ([3582f76](https://github.com/nuxt/content/commit/3582f76ce33e572a3574219b269dc0cef7d5c635))
* decodeURI before searching query ([#55](https://github.com/nuxt/content/issues/55)) ([66781a8](https://github.com/nuxt/content/commit/66781a8728c1d486081bc3554e60b99d91ca408e))
* delete checksum row before inserting ([d4199e5](https://github.com/nuxt/content/commit/d4199e5aa73970ecfb0dbaff5b2bf4aa7bcada16))
* deprioritise `~/components/content` directory ([0a7077a](https://github.com/nuxt/content/commit/0a7077ab06875f845c2176a31418f561c954c574))
* **deps:** remove unnecessary dep ; fix linter ([8196248](https://github.com/nuxt/content/commit/81962489cd9e226641e1c57dfff93e54932e4552))
* **deps:** use `@nuxt/content` from workspace ([4d89141](https://github.com/nuxt/content/commit/4d8914115d454047c3ab908f67077ddef96e298c))
* **dev:** do not create hash column on local cache table ([8fff15c](https://github.com/nuxt/content/commit/8fff15c374b12dada89307e7c37e9f20f7938a71))
* **Dev:** update dump on file modification and deletion ([21a04d7](https://github.com/nuxt/content/commit/21a04d7ec3fb0015f01a01597b6009304ac71f02))
* directly use `route.path` for preview detection ([dccf4e3](https://github.com/nuxt/content/commit/dccf4e31fcbd06ae3c42a28d709a9d74d793c6ab))
* **dirs:** use `dirname` in ESM ([f2eb1d9](https://github.com/nuxt/content/commit/f2eb1d92dacea3343eac558c2c42ba7f7999c2a8))
* Disallow crawlers from crawling `/__nuxt_content` paths. ([#3299](https://github.com/nuxt/content/issues/3299)) ([849e79d](https://github.com/nuxt/content/commit/849e79dbf23b0eba7371001318bb1a41c6603274))
* do not escape newlines ([#3320](https://github.com/nuxt/content/issues/3320)) ([eb60ecb](https://github.com/nuxt/content/commit/eb60ecb9fe1f5e5c321d82cba5ecfb8b1d609577))
* do not generate `content.config.ts` ([936879d](https://github.com/nuxt/content/commit/936879d493237102063338e02d63cb7e167c6517))
* do not manipulate gitignore ([3610ab3](https://github.com/nuxt/content/commit/3610ab34b0a6ceb227d0c19d87ecbf599d36f80b))
* do not update `devDependencies` ([062fb97](https://github.com/nuxt/content/commit/062fb97f0eac18308ac8673c764815d0c7ecbfcc))
* do not use `eval` for props evaluation ([#81](https://github.com/nuxt/content/issues/81)) ([edc4373](https://github.com/nuxt/content/commit/edc4373fd085b7f0dfa36c90a556130a06fe83dc))
* docs link point to localhost ([#329](https://github.com/nuxt/content/issues/329)) ([8f53a4e](https://github.com/nuxt/content/commit/8f53a4e9bef6e322eb31a4149954356a9500e1d6))
* **docs-theme:** support overwriting hooks ([#619](https://github.com/nuxt/content/issues/619)) ([5b8cb40](https://github.com/nuxt/content/commit/5b8cb40fb814c3f3aedd41c26948f53d46987a75))
* **docs:** accessibility improvements ([f19f933](https://github.com/nuxt/content/commit/f19f9330db1d23160c22ffa433fbaa48d87321f1))
* **docs:** add warning about using `ssr: false` with Content ([#2776](https://github.com/nuxt/content/issues/2776)) ([3c753c5](https://github.com/nuxt/content/commit/3c753c5510223c548ee6c52c57f3711c56da2061))
* **docs:** blockquote style ([75fbd44](https://github.com/nuxt/content/commit/75fbd44dd3b0ac0f0afbec4ce438d175ab058997))
* **docs:** close menu on page change ([9b0ace9](https://github.com/nuxt/content/commit/9b0ace9f08710ce78abc86fb7cf06094cd0225cf))
* **docs:** correct css attr ([#116](https://github.com/nuxt/content/issues/116)) ([70c70dc](https://github.com/nuxt/content/commit/70c70dc6eb5f8705f92d62d915666065fd8e2047))
* **docs:** ensure card prose on the homepage matches the correct title ([#2919](https://github.com/nuxt/content/issues/2919)) ([67c57a7](https://github.com/nuxt/content/commit/67c57a7fec82752aa0793e7f4d34c966fe1a7cb2))
* **docs:** es6 flat not working on netlify ([3a7645c](https://github.com/nuxt/content/commit/3a7645c32e72401c871ffda11d348e2380b89c0d))
* **docs:** fix a typo ([#986](https://github.com/nuxt/content/issues/986)) ([689c023](https://github.com/nuxt/content/commit/689c0231986165286c3d0f0a679e9a1e4edc27f1))
* **docs:** fix deployment (use npm package for production) ([ae310b1](https://github.com/nuxt/content/commit/ae310b1a842d852f43483d18f6129f77c03405b4))
* **docs:** minor capitalization fix ([#1021](https://github.com/nuxt/content/issues/1021)) ([a150cc6](https://github.com/nuxt/content/commit/a150cc6b6f0b9f27a83d1b5f5f4676c671a1e3ef))
* **docs:** prerendering issues ([c9a0cda](https://github.com/nuxt/content/commit/c9a0cda15ff30fbadb88c537059e71474c0c7e7e))
* **docs:** prevent generate of empty path ([5bb18d7](https://github.com/nuxt/content/commit/5bb18d7b135d8f7b17f21a3d798e3d3093d4b61f))
* **docs:** remove emojis that breaks PrismJS ([8d32d1e](https://github.com/nuxt/content/commit/8d32d1e10e8e62d95dbdce2fd76ce8cee0da94da))
* **docs:** use `bindingName` instead of `binding` ([#3109](https://github.com/nuxt/content/issues/3109)) ([311609c](https://github.com/nuxt/content/commit/311609cfff3d2e145bed0e919be511ba51454713))
* **docs:** use latest docus / nuxt on each deployment ([c7e4b14](https://github.com/nuxt/content/commit/c7e4b14ca451853aa414daa4496e4cab2eb19486))
* **docs:** wrap with pre ([13be672](https://github.com/nuxt/content/commit/13be672208b43459c70e2978caa3516f9407ba2c))
* **document-driven:** add empty promise for disabled features ([#1356](https://github.com/nuxt/content/issues/1356)) ([9582f8c](https://github.com/nuxt/content/commit/9582f8c9e9b49dd2d7352548215601bc73d4a0a6))
* **document-driven:** avoid calling middleware on hash change ([5a64f46](https://github.com/nuxt/content/commit/5a64f4690edff7330a91ba551c7869e1183b8be6))
* **document-driven:** disable static payload ([#1526](https://github.com/nuxt/content/issues/1526)) ([4414b91](https://github.com/nuxt/content/commit/4414b91051b6043ac9bcbe8361849823d77da696))
* **document-driven:** ensure layout is set on hydration ([#2032](https://github.com/nuxt/content/issues/2032)) ([05dc079](https://github.com/nuxt/content/commit/05dc07984eb8fa6dcf20e44b2e30314d75a86ddc))
* **document-driven:** invalid composable import ([e56f71d](https://github.com/nuxt/content/commit/e56f71dcaf8067beec50451e927e076338203a9b))
* **document-driven:** Only set 404 status on SSR ([#1409](https://github.com/nuxt/content/issues/1409)) ([066c341](https://github.com/nuxt/content/commit/066c341f454a8f3ce1d5662ec6bb8f6f7cda0b06))
* **document-driven:** page layout detection ([#1955](https://github.com/nuxt/content/issues/1955)) ([b92d18a](https://github.com/nuxt/content/commit/b92d18a29a00628ce6ea40c86f0cd488360db587))
* **document-driven:** prevent `404` error on redirected pages ([#1770](https://github.com/nuxt/content/issues/1770)) ([b98cb11](https://github.com/nuxt/content/commit/b98cb11b7b34edc00e7920f507e9579f58837c77))
* **document-driven:** rendering flash ([#1336](https://github.com/nuxt/content/issues/1336)) ([230bbad](https://github.com/nuxt/content/commit/230bbad9c7ade0bee1de53ba062facb04fe72146))
* **document-driven:** sync page layout ([#1519](https://github.com/nuxt/content/issues/1519)) ([2813d35](https://github.com/nuxt/content/commit/2813d355725dd552acc16be14ae392f51c8fbce1))
* **document-driven:** throw 404 error when content is missing ([#1394](https://github.com/nuxt/content/issues/1394)) ([343db3e](https://github.com/nuxt/content/commit/343db3e52454eaee96004a8511bebebfafdb2be0))
* **document-driven:** update documentDriven feature ([#1294](https://github.com/nuxt/content/issues/1294)) ([cfd8782](https://github.com/nuxt/content/commit/cfd8782cb22e6fecf946cf2512a99d6912faf8c8))
* **documentation:** fix documentation static deployment ([f95b10c](https://github.com/nuxt/content/commit/f95b10c59e4c9698da7784ef04f91740b6f4ff8b))
* DocumentDrivenNotFound shall use the layout ([d41205a](https://github.com/nuxt/content/commit/d41205aab7434646463edeb68cb014ad6d1e0b52))
* **document:** fix document component ([5badbf0](https://github.com/nuxt/content/commit/5badbf0c38aa3c316d42aaf099aa588f8f2bb12c))
* **DocusContent:** better value evaluation ([d30ce5b](https://github.com/nuxt/content/commit/d30ce5b547e9d1c9824f2539b0c0a3bf671d9e67))
* don't force pg for vercel ([#3093](https://github.com/nuxt/content/issues/3093)) ([0866008](https://github.com/nuxt/content/commit/086600852227c7704426ae77113a1a0b9a6f4ab2))
* don't overwrite preview storage if defined ([f99b48b](https://github.com/nuxt/content/commit/f99b48bb7e551fa512b7fda18eebf837081dbfd4))
* don't show url of ws server ([#82](https://github.com/nuxt/content/issues/82)) ([3b116b8](https://github.com/nuxt/content/commit/3b116b84a8dd553c9dfd89dddc4beaeb544487a9))
* draft field order ([b0b5eb2](https://github.com/nuxt/content/commit/b0b5eb2da8ad9ea69ac8a88979178a66e047fd50))
* drop `markdown.mdc` option, plugin can be controlled vie `markdown.remarkPlugins` ([1cf4cbd](https://github.com/nuxt/content/commit/1cf4cbdcef48fa0d82fcff82ec43dedb1d70233c))
* drop `useContentHead` in favor of `useSeoMeta` ([ca78aaf](https://github.com/nuxt/content/commit/ca78aaf4285e775e2b624e9015fd4a9031486062))
* drop content tables to start local server with a clean state ([#2859](https://github.com/nuxt/content/issues/2859)) ([aa4614d](https://github.com/nuxt/content/commit/aa4614d1977be8ab964fab369ca4a7544e87eddf))
* drop json5 support ([1a4d144](https://github.com/nuxt/content/commit/1a4d144053c7d706af536aa1cbeab725b8701c53))
* empty search sections ([b5dc7f9](https://github.com/nuxt/content/commit/b5dc7f9369c340b9216b315829574ddab0488d02))
* enable cache only for clientDb ([#2425](https://github.com/nuxt/content/issues/2425)) ([f76ed94](https://github.com/nuxt/content/commit/f76ed9419b695e3e3f63a9aaa8d130909c2f1f0d))
* enable wasm loader ([#81](https://github.com/nuxt/content/issues/81)) ([eceaf51](https://github.com/nuxt/content/commit/eceaf5193767662cdcc9968cec17f6a171b9f8ee))
* encode regex in query params ([#1032](https://github.com/nuxt/content/issues/1032)) ([e56a536](https://github.com/nuxt/content/commit/e56a536ad8a2896096193b26226df59f661a36ce))
* ensure `bundler` module resolution works with runtime type imports ([#2470](https://github.com/nuxt/content/issues/2470)) ([dff252b](https://github.com/nuxt/content/commit/dff252b275228a3d9bef0309db6b741e07a6c7b9))
* **examples:** layout duplication ([#1808](https://github.com/nuxt/content/issues/1808)) ([486fcd4](https://github.com/nuxt/content/commit/486fcd4756c9c8681c680088b5cabbae4b93b8cb))
* explicit imports ([94afd5f](https://github.com/nuxt/content/commit/94afd5f142ff11b90b9692781cd11b16c798a44d))
* explicitly set the dump's content type ([#3302](https://github.com/nuxt/content/issues/3302)) ([e1a98d4](https://github.com/nuxt/content/commit/e1a98d4f475b2569da3c7b125e09653803c6e515))
* export Toc & TocLink type ([76b41bb](https://github.com/nuxt/content/commit/76b41bb8fd791315c321ff76e8ab9cae24c696af))
* fetch content chunked ([#2321](https://github.com/nuxt/content/issues/2321)) ([84874c5](https://github.com/nuxt/content/commit/84874c5c02b114b49ff97fe51008bf2730b288b5))
* filter draft files in production ([#2648](https://github.com/nuxt/content/issues/2648)) ([1787d8b](https://github.com/nuxt/content/commit/1787d8b40a91e6272b3aaef5ffba7a4ac43cd5e7))
* **findSurround:** allow before and after to be 0 ([#1922](https://github.com/nuxt/content/issues/1922)) ([0829c64](https://github.com/nuxt/content/commit/0829c6497dff240dc365ff30b7c4ac09df9e35e3))
* **findSurround:** use filtered contents to find surround ([#2291](https://github.com/nuxt/content/issues/2291)) ([6d70135](https://github.com/nuxt/content/commit/6d7013533b54eff4478a4bb1a5070af6e6b0d3c4))
* fix broken install link ([#2990](https://github.com/nuxt/content/issues/2990)) ([b8da5ee](https://github.com/nuxt/content/commit/b8da5ee9f9e8a64dc8735654dc60bd67e9c6c618))
* fix server options ([#15](https://github.com/nuxt/content/issues/15)) ([4238142](https://github.com/nuxt/content/commit/423814200d1ed2c028e1c06ea6e580760f30d4ce))
* fix typo in logger warning message ([#2626](https://github.com/nuxt/content/issues/2626)) ([0fca4ac](https://github.com/nuxt/content/commit/0fca4ac736ce5d01870c93594f4207fe928a9179))
* force json option for YAML ([f4a2557](https://github.com/nuxt/content/commit/f4a2557ff8a897249702505185dfed1ab82a7b90))
* fowards attrs to root element ([d808b9e](https://github.com/nuxt/content/commit/d808b9e7a8ec78b4f79982a9e2717f11783963d5))
* **frontmatter:** issue with windows carriage return ([#1161](https://github.com/nuxt/content/issues/1161)) ([047b2f2](https://github.com/nuxt/content/commit/047b2f21dca4f436a72b6ebaebfc06f454512a6e))
* generate checksum after processing all sources ([e97c787](https://github.com/nuxt/content/commit/e97c787daeabb039d012612b7f78099d50558c19))
* generate correct collection insert for object and array default values ([#3277](https://github.com/nuxt/content/issues/3277)) ([a9587ee](https://github.com/nuxt/content/commit/a9587eee2548d1c30c64422539747a5a8eb321b9))
* **generate:** externalize `@vue/composition-api` ([d697aae](https://github.com/nuxt/content/commit/d697aaeab33871523175d4d869db0a9bc5bfe565))
* github link ([42df3b5](https://github.com/nuxt/content/commit/42df3b50c18d22c22fbf9662efb4f37b517055af))
* give database to middleware ([00ce9cf](https://github.com/nuxt/content/commit/00ce9cf08cc94a9fb0e976d84b55ed95e3e3753a))
* handle external links ([#51](https://github.com/nuxt/content/issues/51)) ([be8f59c](https://github.com/nuxt/content/commit/be8f59c6882a80d6a831e15e1b47fe5e90f92770))
* handle local sources ([c1d99e9](https://github.com/nuxt/content/commit/c1d99e9f323c735cf223b6c440c4e6b747e7655a))
* handle mapped tags in `<Markdown>` ([a04074a](https://github.com/nuxt/content/commit/a04074a2b59803c67886f6d69f8e38130a1bfeda)), closes [#75](https://github.com/nuxt/content/issues/75)
* handle missing root content ([46e2fbb](https://github.com/nuxt/content/commit/46e2fbbb83475c685bb98839e75b3fa9f71289e9))
* handle numeric position ([8529749](https://github.com/nuxt/content/commit/852974915e10aef18908a7ad5709e40c78309167))
* handle pascal case component name ([9a18441](https://github.com/nuxt/content/commit/9a18441764a11d02c7a69748ac4cc01303a07f02)), closes [docusgen/core#45](https://github.com/docusgen/core/issues/45)
* handle query without condition ([faee72c](https://github.com/nuxt/content/commit/faee72c16b68bc7325c62f7fa970d17ce85e3322))
* handle slashes in live preview refs ([#69](https://github.com/nuxt/content/issues/69)) ([98169e0](https://github.com/nuxt/content/commit/98169e0a8f7582256dd71c2f591ed2fc41d40e86))
* handle special characters in file names ([#42](https://github.com/nuxt/content/issues/42)) ([d01200f](https://github.com/nuxt/content/commit/d01200f684c4800119474ec76b8e769415a07fda))
* handle special contents ([90abdda](https://github.com/nuxt/content/commit/90abdda37cc41d06525ef60f7600a1c32e2cb736))
* handle uri encoded `_path `query ([#1794](https://github.com/nuxt/content/issues/1794)) ([3465ea7](https://github.com/nuxt/content/commit/3465ea7d860f4dc831c71ff484a82ab489e6837d))
* handler files with `index` as substring ([#1334](https://github.com/nuxt/content/issues/1334)) ([bf14411](https://github.com/nuxt/content/commit/bf14411fd95494bd28099aab47fbb7361036c178))
* **headings:** don't generate link if `id` is missing ([#1893](https://github.com/nuxt/content/issues/1893)) ([ee83de8](https://github.com/nuxt/content/commit/ee83de8cf8568056794b4ffb8c21029564c19395))
* hide releases if empty ([#365](https://github.com/nuxt/content/issues/365)) ([50dfc37](https://github.com/nuxt/content/commit/50dfc377e2e379cc00566a43923b79016cef08c7))
* **highlighter:** define missing env in Vite ([#1830](https://github.com/nuxt/content/issues/1830)) ([ee6eb99](https://github.com/nuxt/content/commit/ee6eb9919e0fd00157935e73bc89406b3097e702))
* **highlighter:** support custom languages ([cfc9f43](https://github.com/nuxt/content/commit/cfc9f431d8c3b33377b2a72d8cccc77fbf0091fd)), closes [#3067](https://github.com/nuxt/content/issues/3067)
* **highlight:** handle special chars ([#114](https://github.com/nuxt/content/issues/114)) ([3e15ded](https://github.com/nuxt/content/commit/3e15ded6ed28c30a24ef7e87a917b038029bd318))
* **highlight:** missing import ([576eb87](https://github.com/nuxt/content/commit/576eb87d35812d6df0f3c3ad2a6ae75b5e3608e4))
* **highlight:** preload common languages ([#1278](https://github.com/nuxt/content/issues/1278)) ([863a36f](https://github.com/nuxt/content/commit/863a36fa9618cf4300c4cce7403099e114423509))
* **highlight:** preload typescript language ([36953f5](https://github.com/nuxt/content/commit/36953f5c9688940d23cd283f5e135d2579733236))
* **highlight:** remove `@nuxt/kit` from runtime bundle ([#1346](https://github.com/nuxt/content/issues/1346)) ([772f48f](https://github.com/nuxt/content/commit/772f48f277bbd116be7e4d630407c5b2321df903))
* **highlight:** respect `highlight` option ([#1372](https://github.com/nuxt/content/issues/1372)) ([32eec9c](https://github.com/nuxt/content/commit/32eec9c7489b37a42cedca77323a1d71b62d81a6))
* **highlight:** warn about languages dynamic loading ([#1291](https://github.com/nuxt/content/issues/1291)) ([514e5cc](https://github.com/nuxt/content/commit/514e5ccd158e86134c69d8fb5f04781de3d17f27))
* HMR ([276ce0f](https://github.com/nuxt/content/commit/276ce0f618b06539466e8ca1bbdf3effcaadc2f1))
* **hmr:** ignore sources without `cwd` ([1a8c2bd](https://github.com/nuxt/content/commit/1a8c2bdf85621722251a097d09931b7483185eb5))
* **HMR:** prevent full page reload on content edit ([9a271fc](https://github.com/nuxt/content/commit/9a271fc2463b1a4d7b2eaea4a17f70642b70fbf9))
* **hooks:** generate missing dirname & extension in vFile ([e048a55](https://github.com/nuxt/content/commit/e048a55aa1ea64cd835fbc6204ac7708015172da)), closes [#2970](https://github.com/nuxt/content/issues/2970)
* hot reload on dev server for documentDriven: false ([#2686](https://github.com/nuxt/content/issues/2686)) ([5d6d7ca](https://github.com/nuxt/content/commit/5d6d7ca278647b1258c3cb4198b84bfc6670a7bd))
* **hot reload:** normalize files path in windows ([f883273](https://github.com/nuxt/content/commit/f8832736c5d4837615f1b0b9919cc630ac4b53df)), closes [#2872](https://github.com/nuxt/content/issues/2872)
* **hotfix:** fix plugin-navigation by hardcoding basepath (temporary) ([0326615](https://github.com/nuxt/content/commit/0326615f1e6b75d2327e8a68d2ef1a0a33196315))
* **hot:** mitigate empty code blocks (hotfix) ([a13cca9](https://github.com/nuxt/content/commit/a13cca987ded75ee8ee8bef2d2402e006246f8d5))
* **icons:** use local server bundle ([a440e2f](https://github.com/nuxt/content/commit/a440e2fef3561e224f58191cf513ce4bcf92ba67))
* ignore . prefixed files ([4bc5aeb](https://github.com/nuxt/content/commit/4bc5aebbf8011914bff3156662335dc6d47d17b2))
* ignore built content in preview mode ([bc01cde](https://github.com/nuxt/content/commit/bc01cde3c677cc4225afedea4a1cefc3c82d652c))
* ignore regexes in fetchDirConfig ([#2362](https://github.com/nuxt/content/issues/2362)) ([9ec555e](https://github.com/nuxt/content/commit/9ec555e41649bb470cfcecec1a440e4082eacc6d))
* ignore source for server build ([992c47a](https://github.com/nuxt/content/commit/992c47ab5a06fb215d06aa212e067bf2ba62197a))
* ignore unsupported files from contents list ([#2607](https://github.com/nuxt/content/issues/2607)) ([9870b42](https://github.com/nuxt/content/commit/9870b428dd2d4693df865ddfbab204a8337e02e0))
* **ignore:** comply with possible custom dir ([#311](https://github.com/nuxt/content/issues/311)) ([10dc3bd](https://github.com/nuxt/content/commit/10dc3bd2833384c9310f8f50c4d1861cdf2c1be3))
* **ignore:** fix ignore paths injected from the module ([97f1d74](https://github.com/nuxt/content/commit/97f1d74c0aff36766b810528f509287bc6156665))
* import `defineNitroPlugin` from `[#imports](https://github.com/nuxt/content/issues/imports)` ([34f6517](https://github.com/nuxt/content/commit/34f651723d365a29219676ea0b7b67b368141d0f))
* import `useRoute` ([#1408](https://github.com/nuxt/content/issues/1408)) ([a587a1d](https://github.com/nuxt/content/commit/a587a1de310af0ee43ea2af4eacd5ef7b775a4a5))
* import nuxt composables from [#imports](https://github.com/nuxt/content/issues/imports) ([#2418](https://github.com/nuxt/content/issues/2418)) ([a33ca21](https://github.com/nuxt/content/commit/a33ca219b3190cc916c39436b695d2de40ec7a27))
* **import:** fix vue imports ([eceb8a3](https://github.com/nuxt/content/commit/eceb8a37279cde991af31d46e45467d1227452b0))
* imports ([f33f5a2](https://github.com/nuxt/content/commit/f33f5a20d64249466e5a8c15ffbc8fd43cbdb1bf))
* **imports:** fix missing import ([6aeba1b](https://github.com/nuxt/content/commit/6aeba1b1bfce5a5c06499ba83847c2b8d9d0d1db))
* improve cache ([#85](https://github.com/nuxt/content/issues/85)) ([4f59e12](https://github.com/nuxt/content/commit/4f59e12f3bcfca92ec3b7cd3de84f2ce35e8aaf9))
* improve compatibility of sql queries ([af2cc8b](https://github.com/nuxt/content/commit/af2cc8b24b44f97775bb3bdc8ac571d9bfaaa468))
* improve consistency between client and server ([8e8193e](https://github.com/nuxt/content/commit/8e8193eeb122087dad3a87e21b53f777d3ab7379))
* improve module options, avoid bad practices ([#26](https://github.com/nuxt/content/issues/26)) ([6704643](https://github.com/nuxt/content/commit/6704643017cebc2c4e6be1b2fe4fe713686cbb8b))
* improve module typings ([#37](https://github.com/nuxt/content/issues/37)) ([1c48d95](https://github.com/nuxt/content/commit/1c48d953f5f87e5a789525a7c1c86f1a706a7113))
* improve nuxt-content attrs handling ([#223](https://github.com/nuxt/content/issues/223)) ([02ad923](https://github.com/nuxt/content/commit/02ad923712a8054cad3162f0a0d77723cfca4862))
* improve on query as path ([0edd969](https://github.com/nuxt/content/commit/0edd969764fff3431fff26ff87ad62fc89f592d2))
* improve page detection ([d729ea8](https://github.com/nuxt/content/commit/d729ea89472cd034c553600cda809cbddd255f1f))
* improve parser utils types ([#43](https://github.com/nuxt/content/issues/43)) ([1f2efd4](https://github.com/nuxt/content/commit/1f2efd4c30b77b37b7bff2d1128ce22b43090754))
* improve tests ([#109](https://github.com/nuxt/content/issues/109)) ([61fab49](https://github.com/nuxt/content/commit/61fab497dab521e2a1ec825cd86195cb2cb920d5))
* improve typings ([05cb817](https://github.com/nuxt/content/commit/05cb817629d822eb34a1ad3b01def9a4600aee5f))
* Included types folder in files ([#525](https://github.com/nuxt/content/issues/525)) ([a42e866](https://github.com/nuxt/content/commit/a42e866df271b371767338d732cb54b45fd452db))
* Incorrect type for fetch which returns a promise ([#518](https://github.com/nuxt/content/issues/518)) ([c20345a](https://github.com/nuxt/content/commit/c20345af3b30fd12b951133457348c3fbc988132))
* init storage only when used ([#2670](https://github.com/nuxt/content/issues/2670)) ([8080ed1](https://github.com/nuxt/content/commit/8080ed1c35e3e83948e565107e5d69aa65035b28))
* invalid sqlite3 connector resolve ([74dd3e1](https://github.com/nuxt/content/commit/74dd3e18efed2f44b88d1e4bc38674a9002ba3a8))
* **issue-template:** update issue tempaltes ; don't block release with `chore` tag ([4a6061f](https://github.com/nuxt/content/commit/4a6061fe87803649e642286975d2c38f7f23707e))
* **json:** handle parsed content ([#1437](https://github.com/nuxt/content/issues/1437)) ([6aad636](https://github.com/nuxt/content/commit/6aad636b853deba8a6ebeb308c86c655619dbc31))
* **layout:** fix get-started layout ([c9b5f72](https://github.com/nuxt/content/commit/c9b5f721ae18d8c6194e626666abcbf467b4725d))
* **lib:** add json5 to extensions ([3a8f0a6](https://github.com/nuxt/content/commit/3a8f0a64bc3e3208b94c8f8f4fd9a3317f6ebf9d))
* **lib:** default object ([38c18b4](https://github.com/nuxt/content/commit/38c18b4a0206a68ed17f33a46f6c4abf2e287845))
* **lib:** document update in database on change ([4b3417e](https://github.com/nuxt/content/commit/4b3417edde4faed1cc92153881e2527575d3e28e))
* **lib:** ensure `path` and `extension` on dev mode ([#280](https://github.com/nuxt/content/issues/280)) ([81a151f](https://github.com/nuxt/content/commit/81a151f51bb362ffbfa231c15ede09af1e9eb1a1))
* **lib:** fix tests for windows ([ce291bc](https://github.com/nuxt/content/commit/ce291bc21b0f39a98c528b40b61cc2c9718f0385))
* **lib:** handle classes on nuxt-content component ([#165](https://github.com/nuxt/content/issues/165)) ([db9fbca](https://github.com/nuxt/content/commit/db9fbca6d5f5ff1719f6dc3998304ef0e475d3df))
* **lib:** handle spa ([#180](https://github.com/nuxt/content/issues/180)) ([09edd98](https://github.com/nuxt/content/commit/09edd983524bce5e100bfc8cd73336c2ecf87d1b))
* **lib:** improve toc heading parse ([#279](https://github.com/nuxt/content/issues/279)) ([d6a5920](https://github.com/nuxt/content/commit/d6a59204fcb145384c2003b63fd0a8ba8fa6cb9a))
* **lib:** join array props ([#248](https://github.com/nuxt/content/issues/248)) ([ee26e05](https://github.com/nuxt/content/commit/ee26e05f7f4cf88681a70b944d11067d243ba191))
* **lib:** only method now handles surround in any case ([c37d811](https://github.com/nuxt/content/commit/c37d8117907ddd85a4d219b9a247d1d4f5beeb59))
* **lib:** prevent crash when missing content directory ([8def9d7](https://github.com/nuxt/content/commit/8def9d794c1f9596cdfe28adcf80b73e11f36098))
* **lib:** remove filename from line highlights ([460c85b](https://github.com/nuxt/content/commit/460c85bf7090555cea15a778ad712a4732a2570f))
* **lib:** remove rehype-minify-whitespace ([#124](https://github.com/nuxt/content/issues/124)) ([c267fb0](https://github.com/nuxt/content/commit/c267fb067cb1b311d1f5be37cb8030f985a0c676))
* **lib:** remove unique on collection ([afe5af8](https://github.com/nuxt/content/commit/afe5af8dbbf1559a628eb632c642350635fd6588))
* **lib:** sortBy direction client-side defaults to asc ([7ed31e9](https://github.com/nuxt/content/commit/7ed31e9b4dfcf25feba63ed7e61cc543516d1427))
* **lib:** surround returns filled array if slug not found ([8ecb17a](https://github.com/nuxt/content/commit/8ecb17a38f5f6c94ceca9ddaf841b68a19650500))
* **link:** remove hash before checking if ending by '.md' ([#2033](https://github.com/nuxt/content/issues/2033)) ([c65a2b4](https://github.com/nuxt/content/commit/c65a2b41fcf1fc23beac5408854dda668b8fbf00))
* lint ([55151fc](https://github.com/nuxt/content/commit/55151fc371323c0f819ffb4f12d8c7389cfbedc9))
* lint ([4352ca4](https://github.com/nuxt/content/commit/4352ca40e0132eb9821ee782f577105defd46d3b))
* lint issues for CI ([79f2cbb](https://github.com/nuxt/content/commit/79f2cbb4f0bd6ffd9e03dc3d971adbe73c455606))
* **lint:** fix linting ([cbf08ad](https://github.com/nuxt/content/commit/cbf08ad9814ed2594a74073932437db52cbc9278))
* **lint:** fix linting (ellipsis.vue) ([855bb38](https://github.com/nuxt/content/commit/855bb3837020f24870c870b908246d00daa61af8))
* **lint:** single function argument ([c96fd9d](https://github.com/nuxt/content/commit/c96fd9d54def918aa48127f84c98d8579281a5a1))
* live preview is back :fire: ([40a7720](https://github.com/nuxt/content/commit/40a7720a80ce5d2d2243d037889f4b560f4ef3d4))
* **llms:** add missing import for `defineNitroPlugin` ([#3170](https://github.com/nuxt/content/issues/3170)) ([b091253](https://github.com/nuxt/content/commit/b0912539029da9946693ec0d2766436ab1fdd6e3))
* **llms:** add missing import on `queryCollection` ([2fe61e6](https://github.com/nuxt/content/commit/2fe61e60fe221c66a7bbfdb194c5ebcc0020afc1))
* locale detection ([153ee0e](https://github.com/nuxt/content/commit/153ee0e60d5a88cb2f05b81796178553a2e28312))
* Lokijs sort direction ([#43](https://github.com/nuxt/content/issues/43)) ([fd42120](https://github.com/nuxt/content/commit/fd42120f0b360759f4a65df3ba6260edbf9b7e34))
* make sure `components/content` is on top in layers ([#1418](https://github.com/nuxt/content/issues/1418)) ([19bcce5](https://github.com/nuxt/content/commit/19bcce573bbafaca3af8d28ceaac1aba82f491cd))
* manage concurent initializations ([#3132](https://github.com/nuxt/content/issues/3132)) ([c351947](https://github.com/nuxt/content/commit/c351947a93f74e68a2898c1bdc37c56b44f1ef77))
* mark redirected contents as page ([70c142d](https://github.com/nuxt/content/commit/70c142d8a0313447bb10c74023c87c1be85a9989))
* markdown highlight themes ([0075896](https://github.com/nuxt/content/commit/00758966a81807a25a6d53b4aa9647bd404fcdac))
* markdown render compatiblity ([d81a08a](https://github.com/nuxt/content/commit/d81a08a26a001698807344c1cbe080f3b8cef5d0))
* **Markdown:**  static generation with wrappers ([beb874a](https://github.com/nuxt/content/commit/beb874ad611d4ec361d344081e832b3dbee9b81a))
* **markdown-link:** replacing `blank` prop with `target` ([#1828](https://github.com/nuxt/content/issues/1828)) ([541cca9](https://github.com/nuxt/content/commit/541cca95f4ae2dcc0f4e9c0d49f6f651f08e46d5))
* **markdown-parser:** change html `<code>` info `code-inline` ([#60](https://github.com/nuxt/content/issues/60)) ([c97d925](https://github.com/nuxt/content/commit/c97d92560df7d0b3a650ea3b90661a0b172357ea))
* **markdown-parser:** do not add `d-heading-*` class to content body ([#40](https://github.com/nuxt/content/issues/40)) ([118b06a](https://github.com/nuxt/content/commit/118b06ae58a70a2b954fa44146bc274ba54e815d))
* **markdown-parser:** do not evaluate normal props ([#135](https://github.com/nuxt/content/issues/135)) ([ff18428](https://github.com/nuxt/content/commit/ff184283afbcae6bfcb462acc5d2ae1161a7b231))
* **markdown-parser:** prevent `undefined` exception ([#133](https://github.com/nuxt/content/issues/133)) ([200a622](https://github.com/nuxt/content/commit/200a62276c4daec4e09c8e9614bef4f839ef5548))
* **markdown-parser:** prevent passing `null` language to code component ([3fef263](https://github.com/nuxt/content/commit/3fef2636f5322242725b07c4eb06021487a53bca))
* **markdown-parser:** prevent using absolute path for plugins ([#167](https://github.com/nuxt/content/issues/167)) ([dacba4c](https://github.com/nuxt/content/commit/dacba4c9d88eb4ef656395ba9562436822510aaf))
* **markdown-parser:** refine code handler props, `undefined` default, simpler highlights ([52f6ccf](https://github.com/nuxt/content/commit/52f6ccf6cffbd720e27bc4bf720b642c0608194a))
* **markdown-parser:** unwrap readonly object ([5ee016a](https://github.com/nuxt/content/commit/5ee016a007e0aab11df8e54f23cba455ff4422fa))
* **markdown-renderer:** do not evaluate values of normal props ([#96](https://github.com/nuxt/content/issues/96)) ([95767cd](https://github.com/nuxt/content/commit/95767cdf40b53cf10a8fe0568ffbfb8d56d38e74))
* **markdown-renderer:** do not stringify non-string arrays ([3dc880b](https://github.com/nuxt/content/commit/3dc880b18e91633c54da531d4fc4a93b2238b98e))
* **markdown-renderer:** document reactivity ([e46309f](https://github.com/nuxt/content/commit/e46309feff15c18d4fdcbd35294da94de624509d))
* **markdown:** add missing task list class ([#1416](https://github.com/nuxt/content/issues/1416)) ([91d257e](https://github.com/nuxt/content/commit/91d257e8c3644cbe062e3fc6646d0563bb678293))
* **markdown:** allow plugin with array type option ([#2114](https://github.com/nuxt/content/issues/2114)) ([8469ecd](https://github.com/nuxt/content/commit/8469ecddb02842c5ca372a4dbf8ad53a3b154e00))
* **markdown:** attributes of span inside headings ([#1307](https://github.com/nuxt/content/issues/1307)) ([965a56b](https://github.com/nuxt/content/commit/965a56be8fd6f91753e0fa3f391528e222e002fe))
* **markdown:** detect inline component followed non whitespace characters ([#1227](https://github.com/nuxt/content/issues/1227)) ([3535738](https://github.com/nuxt/content/commit/3535738ce4f19f074de4d4e229d176fa169b7aa0))
* **markdown:** do not render comments ([#1040](https://github.com/nuxt/content/issues/1040)) ([2e7fb92](https://github.com/nuxt/content/commit/2e7fb9238a4f235b30dddc2fe269721158267d83))
* **markdown:** generate depth field in TOC for h5 & h6 ([#1296](https://github.com/nuxt/content/issues/1296)) ([0396252](https://github.com/nuxt/content/commit/039625273bf18e4cbaece1d57f522238086eea2a))
* **Markdown:** handle text nodes ([b6d9e54](https://github.com/nuxt/content/commit/b6d9e54d02df3f7bad47fbd8c880bc1a2e9e2aae))
* **markdown:** html ids in markdown headings should not start with a digit ([#1961](https://github.com/nuxt/content/issues/1961)) ([884f5d8](https://github.com/nuxt/content/commit/884f5d8260dd4c297abaa87bb6a60a355e03978d))
* **markdown:** images src with `baseURL` ([#1833](https://github.com/nuxt/content/issues/1833)) ([d2e2fba](https://github.com/nuxt/content/commit/d2e2fbac77f92d0c380d03650227af407bd5a9d9))
* **markdown:** improve parser and prose components compatibility ([#23](https://github.com/nuxt/content/issues/23)) ([678c762](https://github.com/nuxt/content/commit/678c76260338fc84c4bcccded7bb0b10795bc60d))
* **markdown:** issue with `h1-6` tags ([#1223](https://github.com/nuxt/content/issues/1223)) ([1777fd7](https://github.com/nuxt/content/commit/1777fd74bc6e92735fdf1c25062b8f03674e6a7c))
* **MarkdownParser:** refine content path in anchor link ([#1629](https://github.com/nuxt/content/issues/1629)) ([f045abe](https://github.com/nuxt/content/commit/f045abe1f5ea42b8bef84201fe7b91a39fbeb7df))
* **markdown:** prevent script execution ([#2040](https://github.com/nuxt/content/issues/2040)) ([28cfa85](https://github.com/nuxt/content/commit/28cfa85a066723b18e354c9af4903ac0817a585d))
* **markdown:** remove double and trailing dashes from heading ids ([#1711](https://github.com/nuxt/content/issues/1711)) ([67e1f53](https://github.com/nuxt/content/commit/67e1f531b007c332e2c823c9fa35997a5045ee06))
* **markdown:** remove duplicate children and props ([#130](https://github.com/nuxt/content/issues/130)) ([762d3ec](https://github.com/nuxt/content/commit/762d3ec6a0c14736260e9bb112a0275fb881aae5))
* **markdown:** remove extra dash from heading id ([4c37658](https://github.com/nuxt/content/commit/4c37658771663867f4570a442d729d0d820a92f1))
* **markdown:** resolve custom shiki languages ([#1692](https://github.com/nuxt/content/issues/1692)) ([8d4a3ca](https://github.com/nuxt/content/commit/8d4a3ca7ede0af12d6cf472816c67a67f5bd4d43))
* **markdown:** respect `_draft` key in frontmatter ([#2077](https://github.com/nuxt/content/issues/2077)) ([8e2cd51](https://github.com/nuxt/content/commit/8e2cd518b7fb228ef602995e092e99b88efc264a))
* **markdown:** XSS Prevention ([#1832](https://github.com/nuxt/content/issues/1832)) ([67c9fcf](https://github.com/nuxt/content/commit/67c9fcfafeb4c695e58a4f4ee01dcc3b69eee77b))
* **mdc-parser:** minor fixes in markdown generation ([caf9b83](https://github.com/nuxt/content/commit/caf9b83dbef90d355d9d9c6ff58a2de4e5dd8e76))
* migration doc typo ([#3017](https://github.com/nuxt/content/issues/3017)) ([ada613f](https://github.com/nuxt/content/commit/ada613ff32814add0b79e16382018aed86638d68))
* minify AST tree to reduce dump size ([a040e42](https://github.com/nuxt/content/commit/a040e42d28cb6485e85fbfeb5b5bf717ebbc1030))
* missing import  ([#2560](https://github.com/nuxt/content/issues/2560)) ([716424d](https://github.com/nuxt/content/commit/716424da296f92797dd10dd0bd3505611c852ae9))
* missing imports on preview mode ([f9f161b](https://github.com/nuxt/content/commit/f9f161b1bffe533666f62d84329a4fe1ec7aa950))
* missing package detab ([#449](https://github.com/nuxt/content/issues/449)) ([4cca0cb](https://github.com/nuxt/content/commit/4cca0cbac4405652d7aab454086a820404e2ec10))
* module build ([eecdb18](https://github.com/nuxt/content/commit/eecdb188ba473d0c29423d4b17bd3d9d60693c80))
* module options & adapter options ([9fdea10](https://github.com/nuxt/content/commit/9fdea10c29bf8e3d8c58cbbc7635d3585be24e56))
* **module:**  update dump template on new file creation ([e098115](https://github.com/nuxt/content/commit/e0981155997ffe5e72a6f17cce1cd01812ccca01))
* **module:** add `yml` / `json` extensions to tailwind content files ([#2147](https://github.com/nuxt/content/issues/2147)) ([f9ca7fe](https://github.com/nuxt/content/commit/f9ca7fefde0b3e959aa78f19e67067e801153702))
* **module:** allow using `@nuxtjs/mdc` utils via content module ([#2775](https://github.com/nuxt/content/issues/2775)) ([7731cf8](https://github.com/nuxt/content/commit/7731cf888fe1a116ac8295051f5e3ac81e00a732))
* **module:** check modules existence using `import` ([#3348](https://github.com/nuxt/content/issues/3348)) ([bd84992](https://github.com/nuxt/content/commit/bd84992d4ebcb87748b2874747daa5fb1080b90f))
* **module:** clone layers to prevent side-effect ([b4e7dec](https://github.com/nuxt/content/commit/b4e7dec2a96c02ec19125af602766bfa04ce6b14))
* **module:** close dev server on nitro close ([#1952](https://github.com/nuxt/content/issues/1952)) ([ee434ef](https://github.com/nuxt/content/commit/ee434eff8c588bbdc1405ad713c418985c42ff53))
* **module:** collection detection on windown file-watcher ([#3006](https://github.com/nuxt/content/issues/3006)) ([3807fe9](https://github.com/nuxt/content/commit/3807fe983b925ff39955aeca3b734a90713dda72))
* **module:** Content module options has priority over MDC module options ([19f1b5d](https://github.com/nuxt/content/commit/19f1b5de2b68fbfefca212c82a71d710d06e9fbc))
* **module:** content parser error handling ([#3046](https://github.com/nuxt/content/issues/3046)) ([022c385](https://github.com/nuxt/content/commit/022c38588b94b6eb210647734e77a832e6578fe3))
* **module:** convert `content-slot` to `MDCSlot` ([#2632](https://github.com/nuxt/content/issues/2632)) ([22fcaae](https://github.com/nuxt/content/commit/22fcaaec980e575324ff52530fab99e953ee7908))
* **module:** disable MDC plugin if user disabled it ([#2707](https://github.com/nuxt/content/issues/2707)) ([d420dd8](https://github.com/nuxt/content/commit/d420dd8fd8ef0e08533e6bdf03681ddb877d0921))
* **module:** do not add vue files to ignore list ([#1476](https://github.com/nuxt/content/issues/1476)) ([ec3c61f](https://github.com/nuxt/content/commit/ec3c61f3ce6dfd79624551bb3ec9bf3e1330ea59))
* **module:** do not force prerender index page ([#2681](https://github.com/nuxt/content/issues/2681)) ([bad9b73](https://github.com/nuxt/content/commit/bad9b73f7616691d32680191972fbc03b31273d4))
* **module:** do not warn when sources is empty ([42fffc9](https://github.com/nuxt/content/commit/42fffc9838ed1dc5add7ea22df6856cd37d85462))
* **module:** handle former props in ContentSlot transformer ([#2525](https://github.com/nuxt/content/issues/2525)) ([d2afac3](https://github.com/nuxt/content/commit/d2afac3403be86916bcfc2b71187c8e9c570c9ab))
* **module:** invalid rootDir of layer sources ([#3308](https://github.com/nuxt/content/issues/3308)) ([2579910](https://github.com/nuxt/content/commit/257991064ef69c92a8f06239fc0400eed72413de))
* **module:** invalidate cache on options change ([#1129](https://github.com/nuxt/content/issues/1129)) ([78c84cc](https://github.com/nuxt/content/commit/78c84ccb2dd938122b2ffc8e9d215f43f67f36b8))
* **module:** load `ts` transformers ([#3218](https://github.com/nuxt/content/issues/3218)) ([819ab7f](https://github.com/nuxt/content/commit/819ab7fa2df5c4f160f893db67493793d76cd239))
* **module:** make `documentDriven` configs optional ([#1539](https://github.com/nuxt/content/issues/1539)) ([7b74e70](https://github.com/nuxt/content/commit/7b74e707985b5c7edce20592eb7c700677521c4b))
* **module:** mark `build.pathMeta` as optional in module config ([8329a63](https://github.com/nuxt/content/commit/8329a633641ef071dcea86e57b2a752d624d3643))
* **module:** multi-source array ([#1578](https://github.com/nuxt/content/issues/1578)) ([b88b557](https://github.com/nuxt/content/commit/b88b557c7c317b3c86a5f1851bda75085fb3c738))
* **module:** pass highlight config to mdc module ([841e928](https://github.com/nuxt/content/commit/841e9285bc28a58908e9ea169afc9e2b75423350))
* **module:** postgres database types ([36d3b08](https://github.com/nuxt/content/commit/36d3b0871c1049a8c2b6f51aeeedb5476eb8c1f5))
* **module:** prevent adding css modules in components template ([1a48095](https://github.com/nuxt/content/commit/1a48095503d311501f4997cebc2ab896c88ea617)), closes [#3206](https://github.com/nuxt/content/issues/3206)
* **module:** prevent conflict with auth & security tools ([#3245](https://github.com/nuxt/content/issues/3245)) ([dc27bc9](https://github.com/nuxt/content/commit/dc27bc94c1a4ab09adb8169a08d08ffbb85f9ddf))
* **module:** put query parameters removal under an experimental flag ([#1757](https://github.com/nuxt/content/issues/1757)) ([4ec1621](https://github.com/nuxt/content/commit/4ec162174b96a3a605280a64017888e673fc7e9a))
* **module:** re-parse contents when change is detected in parser options ([1668284](https://github.com/nuxt/content/commit/166828440a57c5f3965ed4fe6c3f37cf1950d483))
* **module:** remove `scule` from optimizeDps list ([ddb3bc8](https://github.com/nuxt/content/commit/ddb3bc8c4f1726df44474347b1d3e5883fe0204b)), closes [#3042](https://github.com/nuxt/content/issues/3042)
* **module:** remove deprecated `resolveModule` ([#2298](https://github.com/nuxt/content/issues/2298)) ([1cebdab](https://github.com/nuxt/content/commit/1cebdab33cd672a2823dce2df634803aa8314675))
* **module:** set default hostname for dev socket ([#1624](https://github.com/nuxt/content/issues/1624)) ([30f3b8c](https://github.com/nuxt/content/commit/30f3b8c0222c83a576349253564d10333d8d8f0d))
* **module:** slot transform sourcemap ([7558cf0](https://github.com/nuxt/content/commit/7558cf0d527f1c063953f3fbb0757ab8857f9cef))
* **module:** split big sql queries into two ([#2917](https://github.com/nuxt/content/issues/2917)) ([a27dcae](https://github.com/nuxt/content/commit/a27dcae1a6ad09a06d3ff30176f043716f4084a9))
* move `components.ts` back to `.nuxt` directory ([a3b91f3](https://github.com/nuxt/content/commit/a3b91f3f604e84393538e6b11bc2f8356e34f01b))
* move presets into runtime ([716e94e](https://github.com/nuxt/content/commit/716e94e40ad91a71b833e8c631487221b458079c))
* navigation generation ([efaa00a](https://github.com/nuxt/content/commit/efaa00a29413f50d4b7b05932e1f176551e99ca3))
* navigation ordering ([a134c0a](https://github.com/nuxt/content/commit/a134c0a15963b76128d4da819ee4c4a61f3e07ff))
* navigation ordering ([#20](https://github.com/nuxt/content/issues/20)) ([f2cd741](https://github.com/nuxt/content/commit/f2cd7417dd0eb9739dd9617432f45cda929575eb))
* navigation searching ([dac1eeb](https://github.com/nuxt/content/commit/dac1eeb1b4746a29cae19a1dc13bc26ae79d46e0))
* **navigation:** add `.navigation.yml` contents into navigation item ([9bbd9b6](https://github.com/nuxt/content/commit/9bbd9b67c0c51de34951df50d621e173338ce36f))
* **navigation:** allow navigation opt-out with `navigation: false` ([#1208](https://github.com/nuxt/content/issues/1208)) ([bda0cd0](https://github.com/nuxt/content/commit/bda0cd0bd09574740cc831010f9bd7f4f6d8ffa3))
* **navigation:** convert parts title ti pascal case ([8225eb2](https://github.com/nuxt/content/commit/8225eb229634d331c2a3aa890bc129ce93f57632))
* **navigation:** do not nest home page ([#1179](https://github.com/nuxt/content/issues/1179)) ([fa702b7](https://github.com/nuxt/content/commit/fa702b7d1e7a1b2c9da986ab302d3f956678c8d9))
* **navigation:** drop id for directories ([186f1d1](https://github.com/nuxt/content/commit/186f1d162bd641109eccf0165e749d036b10b5fd))
* **navigation:** filter out partial contents from navigation ([#53](https://github.com/nuxt/content/issues/53)) ([4b965ab](https://github.com/nuxt/content/commit/4b965abc5ef07e3b97fd6569daca4c88994b3cd4))
* **navigation:** fix  `_dir` detection for index pages ([#1124](https://github.com/nuxt/content/issues/1124)) ([99af5aa](https://github.com/nuxt/content/commit/99af5aa4fe4aaaf838e0933df249d56bcac4ba9c))
* **navigation:** highlight ([862a8b4](https://github.com/nuxt/content/commit/862a8b457f887851d692b1cc4f1dfca5557c43a6))
* **navigation:** ignore extensions on navigation sort ([#2529](https://github.com/nuxt/content/issues/2529)) ([5a9e7d9](https://github.com/nuxt/content/commit/5a9e7d9d25b9bcfcf8b21e1f844cbe29d9f749c9))
* **navigation:** missing composable when navigation is disabled ([#1577](https://github.com/nuxt/content/issues/1577)) ([eecf41f](https://github.com/nuxt/content/commit/eecf41f37218683cea18e5e226b8f4b1614fad81))
* **navigation:** missing import ([1f7d3a2](https://github.com/nuxt/content/commit/1f7d3a2b958bc91ab310292ac321940e15a71176))
* **navigation:** missing import ([6a1e854](https://github.com/nuxt/content/commit/6a1e854e7c8bcea8960bedf209703356d3a08b73))
* **navigation:** mobile display ([0525e9d](https://github.com/nuxt/content/commit/0525e9d66292ed8836b2c3cfc3d88e831439cdee))
* **navigation:** navigation item should extend record ([5893e91](https://github.com/nuxt/content/commit/5893e91ee00444748b16e27dce53ff983ff7a720))
* **navigation:** page issue with directory items ([7308002](https://github.com/nuxt/content/commit/7308002b92a414cf0ae5716d4af0fff0508624be))
* **navigation:** parent position generation ([0cf6b46](https://github.com/nuxt/content/commit/0cf6b46f25b128b00f0bd17ceb15f9b92fc98e33))
* **navigation:** prevent client-db conflict ([fd8e3b8](https://github.com/nuxt/content/commit/fd8e3b82c1a0cf51fdae8b60f4363743427e895e))
* **navigation:** prevent duplicate nodes ([#2959](https://github.com/nuxt/content/issues/2959)) ([67d6c6b](https://github.com/nuxt/content/commit/67d6c6ba257f4bca2a9599e630c41fa77c32f374))
* **navigation:** respect `navigation: false` front matter ([7882f1b](https://github.com/nuxt/content/commit/7882f1b4d535f7c18d2115d685bda6f5e7d09415))
* **navigation:** respect navigation field in pages collection ([ce682f8](https://github.com/nuxt/content/commit/ce682f8c1d5c822fb23969f881f7309e290a890b))
* **navigation:** respect query locale ([#2772](https://github.com/nuxt/content/issues/2772)) ([f36d854](https://github.com/nuxt/content/commit/f36d8542bcd21dfea8e50b40f2c6bb4ae18a1a7a))
* **navigation:** respect user defined order ([#2974](https://github.com/nuxt/content/issues/2974)) ([b832033](https://github.com/nuxt/content/commit/b832033ace84633761b3ef8b0cf88fba02a1d516))
* **navigation:** sort contents by path ([#1080](https://github.com/nuxt/content/issues/1080)) ([40705ae](https://github.com/nuxt/content/commit/40705ae9747bef77dc3e61b46199fef96c35dea2))
* **navigation:** sort items numerically ([#1122](https://github.com/nuxt/content/issues/1122)) ([4c365fc](https://github.com/nuxt/content/commit/4c365fc7050827862f1c75c6d57940ee24882220))
* **nuxthub:** ensure database is enabled ([b46fc37](https://github.com/nuxt/content/commit/b46fc378019d77117e301e0099cf1ca0cd039c6f))
* **nuxthub:** split queries into 1MB chunks ([083a47a](https://github.com/nuxt/content/commit/083a47a1461735a3e0196d04e4df9f828cfc36af))
* nuxtlabs studio url in migration ([#3150](https://github.com/nuxt/content/issues/3150)) ([5e69bf2](https://github.com/nuxt/content/commit/5e69bf2f50be61c8dbe8723e4e362c0fabed84d3))
* opt in to `import.meta.*` properties ([#2597](https://github.com/nuxt/content/issues/2597)) ([9943c00](https://github.com/nuxt/content/commit/9943c00a68c62852c79d5889d32c6cc2d974b919))
* optimise nested dependencies ([#2583](https://github.com/nuxt/content/issues/2583)) ([f5ac6f5](https://github.com/nuxt/content/commit/f5ac6f53f6bd1c1b7301a4984c673da9c0a7f546))
* optional experimental options ([#2391](https://github.com/nuxt/content/issues/2391)) ([1e3549b](https://github.com/nuxt/content/commit/1e3549b62b7215b26d74d52ad5b37745b1f01f82))
* optional schema for page collections ([f84af8d](https://github.com/nuxt/content/commit/f84af8d7a345568e0333978100264651ef9ea3ad))
* parse new content when file is modified ([5dc3429](https://github.com/nuxt/content/commit/5dc342994ede1993c39fbaae3c61dcf812370f20))
* **parser:** de-prioritise code highlighter plugin ([#3009](https://github.com/nuxt/content/issues/3009)) ([dc7d866](https://github.com/nuxt/content/commit/dc7d8661c0f8da9f7022999eb92a480fdcd058af))
* **parser:** recreate highlighter when options did change ([53875b1](https://github.com/nuxt/content/commit/53875b1eac74f4f07e381a361241446229d88d62))
* **parser:** use replace for multi syntax not matching ([4427464](https://github.com/nuxt/content/commit/44274648da62f83459824e9a2a27e3bf52ff22c1))
* **path-meta:** prevent `undefined` error ([1257cb5](https://github.com/nuxt/content/commit/1257cb5c93d00e091e7b17d4449154af185834a3))
* **playground:** fix playground fetching ([8a62e64](https://github.com/nuxt/content/commit/8a62e644f8169abb6abc2ff70d7b431c947c1b14))
* **playground:** update playground (prose-code fix, update lock, fix nuxt-link) ([aed1c38](https://github.com/nuxt/content/commit/aed1c380014068c1ee28a52f3a32a702f09daca8))
* plugin injection ([f16f821](https://github.com/nuxt/content/commit/f16f8212483b222536aede65d095cfcd42cf99c8))
* **pre-fetch:** support github driver ([#1433](https://github.com/nuxt/content/issues/1433)) ([58ba46f](https://github.com/nuxt/content/commit/58ba46f5deb47271dfe041c04b58ad593f87d04d))
* prerender database dump ([3e77ee3](https://github.com/nuxt/content/commit/3e77ee3628c8547cbdafbd01bd44787c443b468e))
* **prerender:** add extension to pre-rendered queries ([#1456](https://github.com/nuxt/content/issues/1456)) ([57ab0af](https://github.com/nuxt/content/commit/57ab0afba5027f9bd2ad82e79ee0db3571b1daf2))
* **prerender:** ensure `/` exists inside prerender rotues ([#2673](https://github.com/nuxt/content/issues/2673)) ([fa124d3](https://github.com/nuxt/content/commit/fa124d3665e3e1129efb94219841b3edcc1d5acd))
* **preset:** allow presets to provide default options ([254fd24](https://github.com/nuxt/content/commit/254fd2453058980124e9566b55fef842457fe3f0))
* prevenr hydration when content contains `\r` ([c10269d](https://github.com/nuxt/content/commit/c10269d02d9a7f2d38baabcac72fd4d2186c79de))
* prevent `undefined` error ([6efaf35](https://github.com/nuxt/content/commit/6efaf356a542180d33384bd99d1efcc017fb2159))
* prevent database api caching on development ([29e4354](https://github.com/nuxt/content/commit/29e4354732aa6b4d686d1a6c44ae2f7d76e71d10))
* prevent duplicate parses ([dae9268](https://github.com/nuxt/content/commit/dae92681a3e04df8323fd4dc2b9ca6c8d30e68d3))
* prevent duplicate parses ([a208567](https://github.com/nuxt/content/commit/a208567ef5d483fcea7272fd0cc80ac4b2b599c7))
* prevent hydration mismatches when unwrapping ([87292e8](https://github.com/nuxt/content/commit/87292e8532019c659413a397caadcb35ba7f5030)), closes [#88](https://github.com/nuxt/content/issues/88)
* prevent import cache in development ([8ea4de1](https://github.com/nuxt/content/commit/8ea4de1fbb30ba9b5a2ec4ff513a1a7096d5d48d))
* prevent layout early update ([#36](https://github.com/nuxt/content/issues/36)) ([e887bc7](https://github.com/nuxt/content/commit/e887bc7c27583fb695c4a3e8e3437db429f32827))
* prevent options merging fn exec without default value ([#287](https://github.com/nuxt/content/issues/287)) ([3252f39](https://github.com/nuxt/content/commit/3252f3989577838d30029c037ac3889eac16b93f))
* **preview:** draft ready not received event ([a8ee72e](https://github.com/nuxt/content/commit/a8ee72e6aca6d63e32478c014bbc465f129ce545))
* **preview:** handle collection search with prefixed sources ([#3317](https://github.com/nuxt/content/issues/3317)) ([c152782](https://github.com/nuxt/content/commit/c1527826b199c48b92f7c430c9da9aead4d13b42))
* **preview:** handle index file in prefix folder (i18n) ([37d3008](https://github.com/nuxt/content/commit/37d30083a83ed99e7446b49ecf2fb46debffb751))
* **preview:** handle strings format when generating insert query ([c18e094](https://github.com/nuxt/content/commit/c18e094365d32c0c182c9f8eb618ec91485d8d9b))
* **preview:** move comment ([72e894e](https://github.com/nuxt/content/commit/72e894e83eab4f4a1c33f7cb252e866d60cdbe35))
* **preview:** optimize brace-expansion ([e84e7f4](https://github.com/nuxt/content/commit/e84e7f4f7a5188b18117987dad1a3bc933961e92))
* **preview:** prerendering issue on load ([b955f76](https://github.com/nuxt/content/commit/b955f769a19461effb375d505c141bee057e3f75))
* **preview:** remove db ([ad62971](https://github.com/nuxt/content/commit/ad6297105c6a844540deff3723de02726f3e0317))
* **preview:** remove prefix when parsing files ([498168f](https://github.com/nuxt/content/commit/498168f2792301100ccd64b8bdd61c80dc4e293c))
* **preview:** take exclude into account to find collection ([bddd834](https://github.com/nuxt/content/commit/bddd83430667d9852d312325e15c8159a32df417))
* **preview:** transform value based on schema for sql query generation ([994ae98](https://github.com/nuxt/content/commit/994ae98cc4eb64f589cd66c839791f9b8f12076d))
* **preview:** use `sessionStorage` to keep token ([#2020](https://github.com/nuxt/content/issues/2020)) ([5599f27](https://github.com/nuxt/content/commit/5599f27b86a18e37270be6844f48825be010b834))
* properly treat falsy values in context ([#685](https://github.com/nuxt/content/issues/685)) ([228f7e0](https://github.com/nuxt/content/commit/228f7e04a5d7a5742ca92617f48ae04b98e9b277))
* **props:** use `nuxt-component-meta` ([#76](https://github.com/nuxt/content/issues/76)) ([9650e95](https://github.com/nuxt/content/commit/9650e95b2d3b36d5bb5483d909d74205ae457b1b))
* prose components ([eb1be92](https://github.com/nuxt/content/commit/eb1be9291adf4290ca31229904b1c18749da9ea3))
* **prose-code:** fix prose code styling ([4ad9eec](https://github.com/nuxt/content/commit/4ad9eece07de3dd0958801834758eed4aa3bb1b1))
* **prose-components:** use html anchor link in headings ([#1381](https://github.com/nuxt/content/issues/1381)) ([1593ad7](https://github.com/nuxt/content/commit/1593ad72d37ee870b348d8d66852223d551bd123))
* **prose-pre:** `style` prop type ([1edb350](https://github.com/nuxt/content/commit/1edb3501578542e237d97f0ef5d15bcc8135973a))
* **prose-pre:** only wrap `slot` in `pre` ([#2348](https://github.com/nuxt/content/issues/2348)) ([e783efd](https://github.com/nuxt/content/commit/e783efd9261215b8afd19f06945ce1742065170a))
* **prose:** fix prose code useAsyncData import ([d96255c](https://github.com/nuxt/content/commit/d96255cd2d4cef02281d19ebf013ee49eabc32e2))
* **ProseImg:** prevent conflict between `src` and baseURL ([#2242](https://github.com/nuxt/content/issues/2242)) ([2745604](https://github.com/nuxt/content/commit/2745604b106310a2656ac0de646b02bbf29dc5ad))
* **prose:** remove default style ([#1109](https://github.com/nuxt/content/issues/1109)) ([7d51329](https://github.com/nuxt/content/commit/7d51329ca897cd0a697d4e0e6be2c95a2c112130))
* query behavior & types ([#1030](https://github.com/nuxt/content/issues/1030)) ([61e4b1f](https://github.com/nuxt/content/commit/61e4b1f9c1c92e71d5f9012dee5addfd87bbbadb))
* **query:** allow uppercase in column names ([#3100](https://github.com/nuxt/content/issues/3100)) ([598dd13](https://github.com/nuxt/content/commit/598dd1354cfec2c5005231387e7dd9e608a72379))
* **query:** decode unicode params ([#1871](https://github.com/nuxt/content/issues/1871)) ([2fb6596](https://github.com/nuxt/content/commit/2fb65965c18f379787d477e58d26fd9f8af419b6))
* **query:** do not create empty `where` ([c71c79b](https://github.com/nuxt/content/commit/c71c79bd454d8413f123f1253b32b5cbf84078c2))
* **query:** ensure default values always apply to query params ([#1778](https://github.com/nuxt/content/issues/1778)) ([30c26e3](https://github.com/nuxt/content/commit/30c26e394a3bde2fdfc30fd691e5e3cc1eec3b59))
* **query:** ensure fields are unique in query ([9b4635e](https://github.com/nuxt/content/commit/9b4635e20c405ccee8ec912d38f4574fc4bd3787))
* **query:** ensure where is set ([10709ee](https://github.com/nuxt/content/commit/10709ee2d79e72101b77a68f9eef46b9fd49aea2))
* **query:** escape special chars in path ([#1185](https://github.com/nuxt/content/issues/1185)) ([87fab34](https://github.com/nuxt/content/commit/87fab34301f8d92073bf897834efd69195209dba))
* **query:** fallback to default locale if query has no filter on `_locale` ([#1748](https://github.com/nuxt/content/issues/1748)) ([90b358a](https://github.com/nuxt/content/commit/90b358af5fa35cf554aadffc48859a8a5ed541c0))
* **query:** handle array fields in `$in` operator ([#1277](https://github.com/nuxt/content/issues/1277)) ([85ca12a](https://github.com/nuxt/content/commit/85ca12a05241f9bcc84b8feb1c6e3a46d47abe0b))
* **query:** handle comments and improve single selection ([8de0f14](https://github.com/nuxt/content/commit/8de0f144008d60f3e2f89d9d2e68bd3087a6e136)), closes [#3054](https://github.com/nuxt/content/issues/3054)
* **query:** handle nullable fields in sort ([#1108](https://github.com/nuxt/content/issues/1108)) ([9e621e8](https://github.com/nuxt/content/commit/9e621e8a9e27fe70d0807182c383888fbe61f4db))
* **query:** invalid response on missing content ([#1706](https://github.com/nuxt/content/issues/1706)) ([5197dab](https://github.com/nuxt/content/commit/5197daba0d7504e18e597b1f3a4bcadb01f83102))
* **query:** no trailing slash on path ([a2e5c9f](https://github.com/nuxt/content/commit/a2e5c9f44a2c5f11539be5a2668023567a3b2914))
* **query:** prevent `undefined` error ([b680b47](https://github.com/nuxt/content/commit/b680b47ce11d8648a55e2f88cf2ccd4bcecd3369))
* **query:** prevent adding duplicate conditions to query ([#2027](https://github.com/nuxt/content/issues/2027)) ([2250d2d](https://github.com/nuxt/content/commit/2250d2dbab822fb30f85c918c8f34294bdf4f626))
* **query:** support multi arguments slug ([#65](https://github.com/nuxt/content/issues/65)) ([4c29d40](https://github.com/nuxt/content/commit/4c29d40f698d19cbc307c006b66eb9b352c15221))
* **query:** surround and only cannot be used at the same time ([#1238](https://github.com/nuxt/content/issues/1238)) ([56c5228](https://github.com/nuxt/content/commit/56c522844a829a44bf569ef0d68c12154486eb38))
* **query:** use exact match for `findOne` ([#1224](https://github.com/nuxt/content/issues/1224)) ([46c3957](https://github.com/nuxt/content/commit/46c3957df1b3c225f109d36da4c50379dea8eff5))
* reactively load components when `body` changes ([#3283](https://github.com/nuxt/content/issues/3283)) ([b6a30aa](https://github.com/nuxt/content/commit/b6a30aaac0418bcd8ebb7938dd134dacb258f966))
* reactivity ([a6f4008](https://github.com/nuxt/content/commit/a6f40083c62711663464f6fa9005d242a4f13f73))
* reduce dump insert queries size ([72003e7](https://github.com/nuxt/content/commit/72003e7452ca556b38577d03a2af67fa0c65b196))
* refine json and boolean fields after retrieving content ([#2957](https://github.com/nuxt/content/issues/2957)) ([0dacb1e](https://github.com/nuxt/content/commit/0dacb1ee933972e389402bde0040e7506432f8d5))
* refresh content-index on nitro start ([#1947](https://github.com/nuxt/content/issues/1947)) ([e1506ed](https://github.com/nuxt/content/commit/e1506edb8c4d3a97ff597792f2cad27ba9ce80ed))
* register user global components ([2d76ab3](https://github.com/nuxt/content/commit/2d76ab3f088759b400020ec81d7454d8dbc650e0))
* rehype/remark plugin in module options ([3c376d6](https://github.com/nuxt/content/commit/3c376d6c5ea52a99b8f5364d3ba1ece8a523ccb5))
* remark plugins deprecated warning ([#2188](https://github.com/nuxt/content/issues/2188)) ([1c4c6ab](https://github.com/nuxt/content/commit/1c4c6ab0da56b09de9102236e530922e203da1b3))
* remove _theme.yml fetch with doc driven by default ([#1310](https://github.com/nuxt/content/issues/1310)) ([9cebc36](https://github.com/nuxt/content/commit/9cebc36237da1a7a64c5638e3e257fe5274300d1))
* remove (now deprecated) template utils ([#1423](https://github.com/nuxt/content/issues/1423)) ([0375c14](https://github.com/nuxt/content/commit/0375c145e496335badea266055240990cedef9e8))
* remove `postinstall` script ([e44a3af](https://github.com/nuxt/content/commit/e44a3afb1b43e5dda62fec4c90a692200a2b7282))
* remove `weight` and improve module options ([b119cc7](https://github.com/nuxt/content/commit/b119cc7b702bb04d9a5d419b0a07c3acb48a84cc))
* remove c12 default value ([606c73e](https://github.com/nuxt/content/commit/606c73e665452caa0b9cfcaea7e062abd23db4c8))
* remove console.log ([20830da](https://github.com/nuxt/content/commit/20830dadb4e52b0fbe40dee73f23b787ba3e54d0))
* remove d.ts ([#2427](https://github.com/nuxt/content/issues/2427)) ([7ed3b07](https://github.com/nuxt/content/commit/7ed3b07c7fa6fc8d2643f73d4aa8ec2833abecb2))
* remove deletion of `prerenderedAt` key ([#2280](https://github.com/nuxt/content/issues/2280)) ([9e17fed](https://github.com/nuxt/content/commit/9e17fedf0b795301550847058e9c6347a6fac562))
* remove duplicate socket upgrade ([7766681](https://github.com/nuxt/content/commit/77666812aabe21a25a39d5001ca50f1273d768f3))
* remove favicon handling ([#2157](https://github.com/nuxt/content/issues/2157)) ([6f5e98e](https://github.com/nuxt/content/commit/6f5e98e0c8f1503381a89d7a36be6163b140d9e5))
* remove highlighter options ([4494d41](https://github.com/nuxt/content/commit/4494d41ed4c8b327261930fa434fff6ed127c58a))
* remove postinstall script ([9e0b0f7](https://github.com/nuxt/content/commit/9e0b0f76d193da923d8b7e05a5d312a8df385404))
* remove trailing slash to support nuxt generate ([#1127](https://github.com/nuxt/content/issues/1127)) ([a958db7](https://github.com/nuxt/content/commit/a958db7c980748e61de3d83f71fa80fdc5f2bb45))
* remove unneeded await ([#2175](https://github.com/nuxt/content/issues/2175)) ([434596c](https://github.com/nuxt/content/commit/434596c8b98a3abd25e2d812a1e2396e4bd7003a))
* remove zod from server bundle ([842bcd6](https://github.com/nuxt/content/commit/842bcd670550383d7987d27fa878fc33bfc4572d))
* rename `contentId` to `_id` ([3538991](https://github.com/nuxt/content/commit/35389914f71e9193e098e9c311737e3ff33b4246))
* rename api to `/api/content/database.sql` ([602e789](https://github.com/nuxt/content/commit/602e78917c9f31eb6d28dfd6043e27848a10085e))
* rename surround util ([dfaf318](https://github.com/nuxt/content/commit/dfaf318b82cf25fd713e258ed3eff48d5f753204))
* **renderer:** bundle prose/alias components ([bd9e15b](https://github.com/nuxt/content/commit/bd9e15b530484362158dcc5e4ceda3604b80582a))
* **renderer:** do not ignore component objects ([#3127](https://github.com/nuxt/content/issues/3127)) ([8a66225](https://github.com/nuxt/content/commit/8a6622543e434ff0d7b08b4800a53ecb4ce514db))
* **renderer:** fix renderer spread usage ([040ac76](https://github.com/nuxt/content/commit/040ac76c115fea60caffad67887845c51468d8c1))
* replace crlf line endings with lf ([#2120](https://github.com/nuxt/content/issues/2120)) ([2ac3616](https://github.com/nuxt/content/commit/2ac36169b131b030a4607deffba46e8fcd5e9884))
* respect `draft` key as `_draft` ([#2738](https://github.com/nuxt/content/issues/2738)) ([d6d10db](https://github.com/nuxt/content/commit/d6d10db76baee771a37386d57bee6b06d3846d4b))
* respect default value on db insert ([8cd1221](https://github.com/nuxt/content/commit/8cd12214e04fe013c945160416d790394ca425bd))
* respect highlight preload languages ([4bfa3b7](https://github.com/nuxt/content/commit/4bfa3b70ecf7ab76b3047d6fc276bc8bd1a1fe12))
* respect user defined mdc module  options ([2662b89](https://github.com/nuxt/content/commit/2662b8904ebda84169412b1379cb574f5f638a14))
* revert navDirFromPath behavior ([049c356](https://github.com/nuxt/content/commit/049c356ddbe3c97a233489a81b9f8c996a11a9ea))
* revert template naming ([a262118](https://github.com/nuxt/content/commit/a26211861de08b5ee831a2af9180af1a86083b55))
* run presets on `module:done` to receive other module config ([ddda0d4](https://github.com/nuxt/content/commit/ddda0d4d0a0d4c267e45ff084829ae9274a1877a))
* **runtime:** allow to give instance of the remark plugin ([#1466](https://github.com/nuxt/content/issues/1466)) ([61c3032](https://github.com/nuxt/content/commit/61c3032c7d71da9588029ce771adbb3aa2fd031a))
* **runtime:** ContentRenderer extra props ([#1300](https://github.com/nuxt/content/issues/1300)) ([711eced](https://github.com/nuxt/content/commit/711ecedae5e63318273e9ced18185c5386d85409))
* **runtime:** detect 404 api responses in SSG ([#1608](https://github.com/nuxt/content/issues/1608)) ([15842a4](https://github.com/nuxt/content/commit/15842a4d3f5ba015ea4bb19601e11f5f74a618c9))
* **schema:** mark `ZodMap` as json field ([69a14fa](https://github.com/nuxt/content/commit/69a14faf3b915abccf91e7eb426d385a1ffd5a23))
* **search:** add `charset=utf-8` to headers of indexed mode ([#2729](https://github.com/nuxt/content/issues/2729)) ([4e87b06](https://github.com/nuxt/content/commit/4e87b061ac509053de62c54253397a3bdcd9f909))
* **search:** improve sections with root node ([#2672](https://github.com/nuxt/content/issues/2672)) ([e33de6a](https://github.com/nuxt/content/commit/e33de6a0089df06f5375de7ecd90eb7d5f5c61c2))
* **search:** invalid helper naming ([895c220](https://github.com/nuxt/content/commit/895c22055c382ceedbd2d9106014fdadbdfd7bee)), closes [#3186](https://github.com/nuxt/content/issues/3186)
* **search:** keep page's beginning paragraphs ([#2658](https://github.com/nuxt/content/issues/2658)) ([adefdd2](https://github.com/nuxt/content/commit/adefdd29913870d6b95adbc6bb9dc63cd49bfa38))
* **search:** non-md file might not have dscription file ([#2706](https://github.com/nuxt/content/issues/2706)) ([75208f1](https://github.com/nuxt/content/commit/75208f12e03e03fbbedd8f68eeda60456e9b5da2))
* **search:** query markdown file in search section generation ([bcb9f87](https://github.com/nuxt/content/commit/bcb9f87eee189b13cc4e4203a4a77d71748cc669))
* **search:** use page title as default title for sections ([9d81acc](https://github.com/nuxt/content/commit/9d81acc2cd2d2f2a00db31d0ecdb0c171cf77c7b))
* separate cache version from integrity ([#1132](https://github.com/nuxt/content/issues/1132)) ([de3a57c](https://github.com/nuxt/content/commit/de3a57c7b27bc7e534c4ad56ab8a4d61a249e9da))
* serialize import names ([f311246](https://github.com/nuxt/content/commit/f3112467d218416dd2015e27ea2cdd89c73f817f))
* **serverQueryContent:** do not expose advanced query typing ([09e37c1](https://github.com/nuxt/content/commit/09e37c19feb7e2abb08b2bd5ece99fe7ef289e0a))
* **server:** rename `queryContent` to `serverQueryContent` ([#1069](https://github.com/nuxt/content/issues/1069)) ([966ecec](https://github.com/nuxt/content/commit/966ececf5253f3600acbccf712a75155a5111c74))
* set components level to 100 ([c289bb8](https://github.com/nuxt/content/commit/c289bb827b45ffc1378e53c4706d40a10b1012dd))
* set global true for runtime components ([#46](https://github.com/nuxt/content/issues/46)) ([cbec9e9](https://github.com/nuxt/content/commit/cbec9e9d1cbec8f9d325466fe638b5b22c1f2003))
* set header to empty string if undefined ([#620](https://github.com/nuxt/content/issues/620)) ([5bffdf1](https://github.com/nuxt/content/commit/5bffdf11d5b499829fcb389db29c9c0f316be3ac)), closes [#136](https://github.com/nuxt/content/issues/136)
* set Nuxt primary color and seo homepage ([7dd71fa](https://github.com/nuxt/content/commit/7dd71fa7b5fd9b36f1c5e9c73033d72886ca2e06))
* **shiki:** add `\n` to empty lines ([46f3d79](https://github.com/nuxt/content/commit/46f3d79f0f2272fd8f9db218a756ff2aac18d080))
* **shiki:** inline codes syntax highlighting ([f124c95](https://github.com/nuxt/content/commit/f124c9538edcd0c7f978a0dcc58cfe399793b929))
* **shiki:** issue with JSON import ([#1824](https://github.com/nuxt/content/issues/1824)) ([1cc86bd](https://github.com/nuxt/content/commit/1cc86bd20c48905de6f9c22f7dbf9703f4a405c3))
* **shiki:** issue with merging multiple themes ([#1703](https://github.com/nuxt/content/issues/1703)) ([29f088c](https://github.com/nuxt/content/commit/29f088c7eea720370381613d36a1dc360fcf596d))
* **shiki:** preserve style priority on compress ([b95e807](https://github.com/nuxt/content/commit/b95e807ed69a3f89097f7e7a420031594569c807))
* **Shiki:** sanitize highlighted text ([#1818](https://github.com/nuxt/content/issues/1818)) ([bb33b58](https://github.com/nuxt/content/commit/bb33b58f52d81519bf71dd4334d42f0414a970d8))
* simplify database integirity check ([34b2f9b](https://github.com/nuxt/content/commit/34b2f9bbffa110c772937cb3ba3188cc89b05866))
* simplify types ([a47a4fb](https://github.com/nuxt/content/commit/a47a4fb24906846cb59b74dbc0a8a80fc526567a))
* simplity and improve collection's source types ([74e388b](https://github.com/nuxt/content/commit/74e388bb798ff7687f363b18fd4edf4fd859836f))
* **slot:** rename ContentSlot to MDCSlot in render function ([efc6048](https://github.com/nuxt/content/commit/efc604813786a22f3c5f7b20487712b8b3e3cab4))
* **sort:** `-1` for descending same as mongo syntax ([#1176](https://github.com/nuxt/content/issues/1176)) ([564b2e8](https://github.com/nuxt/content/commit/564b2e8598e2f30f3247d9d1fd438300bd329cad))
* **sort:** convert Date to ISO string ([#1175](https://github.com/nuxt/content/issues/1175)) ([0002a38](https://github.com/nuxt/content/commit/0002a38e13dd2a1b62ee9a77f8f6f916247240fe))
* **source:** do not edit `source.include` ([fa591ff](https://github.com/nuxt/content/commit/fa591ff14d8ab0523d9c71d15eb0d481e1881b21))
* **source:** rename `base` to `path` ([a98bab6](https://github.com/nuxt/content/commit/a98bab6c65f05e981df2891216e96108d6ebe964))
* spa db generation ([43fc0af](https://github.com/nuxt/content/commit/43fc0af13ef5dde35b38f28c0ac893bf421a00e9))
* split `getContent` to chunks in `getIndexedContentsList` ([#2354](https://github.com/nuxt/content/issues/2354)) ([#2549](https://github.com/nuxt/content/issues/2549)) ([a0ab377](https://github.com/nuxt/content/commit/a0ab3776618fa1c30bc6d4b65f0f901390546557))
* **sqlite:** remove extra `/` from database filename in windows ([8a9af69](https://github.com/nuxt/content/commit/8a9af695d589649eac7b318270c69534be3ec35c)), closes [#2897](https://github.com/nuxt/content/issues/2897)
* **sqlite:** remove leading `/` from file path ([85010c1](https://github.com/nuxt/content/commit/85010c11c0f622b4eaf2dac138097c32829b5fd1))
* SSG data fetching ([#19](https://github.com/nuxt/content/issues/19)) ([e0d8a5f](https://github.com/nuxt/content/commit/e0d8a5ff8e095dc34a3f98081b2f25a44d7ed273))
* **starter:** main logo dark mode & on page load ([812f12d](https://github.com/nuxt/content/commit/812f12dd5a27210fbba0a4eab3eea9456ad9ab88))
* **starter:** move search input to overlay menu on mobile ([09c79f3](https://github.com/nuxt/content/commit/09c79f3fd8cb903ba3114976e9c4a91ae6f995cb))
* **starter:** nuxt logo dark mode color ([b443771](https://github.com/nuxt/content/commit/b44377178efb8fb27db14da7d168936929a6f11e))
* **starters:** purgecss for code highlight ([d568765](https://github.com/nuxt/content/commit/d56876507264d63f01dcfa9170e3c4b8882faa51))
* **starters:** update blog style ([6e20693](https://github.com/nuxt/content/commit/6e2069316f6f966ad9b63b3f93af95a7820c69d6))
* **starters:** update docs style ([687279e](https://github.com/nuxt/content/commit/687279e4cc3e9fa56d000a15df921a8e3e81a24e))
* **starter:** user v-bind to escape html (vue 2 bug) ([ce87e1f](https://github.com/nuxt/content/commit/ce87e1f78afc1725876212086c2a6c071aee7532))
* **storage:** do not use cache storage to list contents in dev ([#160](https://github.com/nuxt/content/issues/160)) ([73b5fb4](https://github.com/nuxt/content/commit/73b5fb45f1f785fdba5086c7da45cfb45e22a731))
* **storage:** prevent duplicate parsing ([#2326](https://github.com/nuxt/content/issues/2326)) ([a4891d8](https://github.com/nuxt/content/commit/a4891d886482f22e2ed33919151a09f6a06593d6))
* **storage:** warn & ignore files with invalid characters ([#1239](https://github.com/nuxt/content/issues/1239)) ([b52f678](https://github.com/nuxt/content/commit/b52f678cde76ec7f18ec3f023161c0c3716a3b4a))
* **studio:** find index file collection by route path ([c3f2b9b](https://github.com/nuxt/content/commit/c3f2b9bae5948a135165d44ca71f1ab579d61839))
* **studio:** return when collection not found ([0e0c8e7](https://github.com/nuxt/content/commit/0e0c8e7f20d2dbaa0d1adad3a833c536bce046fa))
* **studio:** return when collection not found ([454a22d](https://github.com/nuxt/content/commit/454a22db7143d26b518da0a577994f184a5bff32))
* **studio:** use minimatch for browser ([a1582b6](https://github.com/nuxt/content/commit/a1582b6eec4904b5f67d45462c3aca331cc2d638))
* support class on vue components and more ([fd1043b](https://github.com/nuxt/content/commit/fd1043b3cf42c0d265202fc5c579ab8743128f99))
* support components/content in layers for extends ([#1404](https://github.com/nuxt/content/issues/1404)) ([f439178](https://github.com/nuxt/content/commit/f439178309c37d61b2269923fba3fd1a70b82f3d))
* support layout from defined vue page in DDM ([48fc30b](https://github.com/nuxt/content/commit/48fc30b00f4052d15a45eb767bdaa024821888fe))
* surround ([6d4a8c8](https://github.com/nuxt/content/commit/6d4a8c8e20206fcfbe8b1edee7c5c197abc40d76))
* **surround:** do not use parent item if it exists as first child ([5810fc6](https://github.com/nuxt/content/commit/5810fc690663c732ab73bc0c91aa5f2aea2be868))
* **surround:** handle missing path ([59c69bc](https://github.com/nuxt/content/commit/59c69bc491d2868d25589c3b71b21e5bb4b751fc))
* **surround:** remove all posible dupplicate paths ([d529996](https://github.com/nuxt/content/commit/d5299960e6e3239a2e36425fb6f9d6d4d8a2c2e3))
* **surround:** respect `only` and `without` filters ([#2311](https://github.com/nuxt/content/issues/2311)) ([604b881](https://github.com/nuxt/content/commit/604b8817d13e20054d1f221ef3d49044628245df))
* **tailwind-integration:** allow content as object ([#2060](https://github.com/nuxt/content/issues/2060)) ([52c7659](https://github.com/nuxt/content/commit/52c7659954812df800039cdcbf544b4146e9b9cb))
* **tailwindcss:** Tailwindcss HMR support for content files ([#2315](https://github.com/nuxt/content/issues/2315)) ([6eeb719](https://github.com/nuxt/content/commit/6eeb719af800e0f88bfa84aaa4cb204e22a7aa93))
* take MDC configs into action ([0633e58](https://github.com/nuxt/content/commit/0633e5815eae906438d670252b54ed654b62bfd4))
* template loading ([#28](https://github.com/nuxt/content/issues/28)) ([eda8c04](https://github.com/nuxt/content/commit/eda8c04aaf0363c15da85caff38a6978c37021eb))
* **template:** demo url ([#2983](https://github.com/nuxt/content/issues/2983)) ([57ee33d](https://github.com/nuxt/content/commit/57ee33daa72dcd3a8e0e83b1c3f5173b4004c932))
* **templates:** demo url ([1dd5b21](https://github.com/nuxt/content/commit/1dd5b21c2ac9bdf6e99a04276fb64bd09c641842))
* **templates:** handle cors form studio ([06b57ac](https://github.com/nuxt/content/commit/06b57aca8e103a11eae87e12e5a850983492f460))
* **templates:** props definition ([997fc65](https://github.com/nuxt/content/commit/997fc65200f95722c95d9afdcbb68c29d8611214))
* temporary disable hook type check ([1ee30af](https://github.com/nuxt/content/commit/1ee30afd08f96b51add938e4559dff8f59e2fa63))
* terminal time log information display error ([#891](https://github.com/nuxt/content/issues/891)) ([1f12dd5](https://github.com/nuxt/content/commit/1f12dd59bc0055ec0eb4b333edde0dd4433780ef))
* **test:** init port ([08c9b2d](https://github.com/nuxt/content/commit/08c9b2d0a98b07fa09e7a217448ff3ef7017b797))
* **tests:** update navigation snapshot ([282bb0e](https://github.com/nuxt/content/commit/282bb0efc586adbc7ecf108676a94a6df7eb3053))
* **test:** typo ([#1707](https://github.com/nuxt/content/issues/1707)) ([ef92b20](https://github.com/nuxt/content/commit/ef92b203165f3034543e2e1ee9925015b060ce96))
* **test:** update highlighter snapshots ([32f9f8f](https://github.com/nuxt/content/commit/32f9f8fedb1f4a6d849acaa60124bfa9f0545868))
* **test:** update home content ([711bbd2](https://github.com/nuxt/content/commit/711bbd23c5312f528e0923184f8cc7d16c3711b7))
* **theme-docs:** add scroll on toc ([95c69f4](https://github.com/nuxt/content/commit/95c69f41bbbd60f9c4db39b122b1a0b1ada7d26a))
* **theme-docs:** add tailwind typography table style for dark mode ([142562e](https://github.com/nuxt/content/commit/142562e4004530a6748d3c5e6da077f5069d176c))
* **theme-docs:** Add updatedAt keypath to tr-TR.js ([#989](https://github.com/nuxt/content/issues/989)) ([b97cf54](https://github.com/nuxt/content/commit/b97cf549577cb8ded2ecb3400aaa8e0fb9845f89))
* **theme-docs:** allow overriding theme components ([#963](https://github.com/nuxt/content/issues/963)) ([1f4a5d2](https://github.com/nuxt/content/commit/1f4a5d2c4bae36a84b656c93d77cb523ec6a37ff))
* **theme-docs:** appLangSwitcher wrap every Chinese characters ([#395](https://github.com/nuxt/content/issues/395)) ([9e3eb0d](https://github.com/nuxt/content/commit/9e3eb0d8269687b3ee83eabdd80259b91d008321))
* **theme-docs:** avoid exposing `GITHUB_TOKEN` ([#549](https://github.com/nuxt/content/issues/549)) ([206e778](https://github.com/nuxt/content/commit/206e778fac72c67d8edf29b7ddfc273bd6b51bf5))
* **theme-docs:** concat with i18nSeo meta ([0790199](https://github.com/nuxt/content/commit/0790199f51c647b3011b6653d659a62e892acf1b))
* **theme-docs:** correct margin on navigation last element ([1a1c152](https://github.com/nuxt/content/commit/1a1c152d3e06cd7c865f7aedf94e0daf2e656ba8))
* **theme-docs:** correct releases link ([#690](https://github.com/nuxt/content/issues/690)) ([d34f92b](https://github.com/nuxt/content/commit/d34f92b8d8952c1b63595e553eb3496213584687))
* **theme-docs:** dark mode link color ([0e9575f](https://github.com/nuxt/content/commit/0e9575f6ffe9bd4ca55380789277aebb02aeabf7))
* **theme-docs:** extend `/` route ([#422](https://github.com/nuxt/content/issues/422)) ([19451b7](https://github.com/nuxt/content/commit/19451b7e4eb2e079656341716a781adf1894eb29))
* **theme-docs:** fix aside background in dark mode ([#424](https://github.com/nuxt/content/issues/424)) ([6f0de2a](https://github.com/nuxt/content/commit/6f0de2adb4e6f671cbd0c6066e5a4c3b443edf1d))
* **theme-docs:** fix code block's filename style ([#472](https://github.com/nuxt/content/issues/472)) ([afc3eb3](https://github.com/nuxt/content/commit/afc3eb34ff4788e0a345b55ceb08393d9cd5fa38))
* **theme-docs:** fix code display inside alert ([#426](https://github.com/nuxt/content/issues/426)) ([a6f1974](https://github.com/nuxt/content/commit/a6f1974e92904f83e01ef0395c67b30b93688ac7))
* **theme-docs:** fix empty title on links ([#447](https://github.com/nuxt/content/issues/447)) ([7b761e8](https://github.com/nuxt/content/commit/7b761e844d10e5b8b868da330d752a9e024a9d5c))
* **theme-docs:** fix syntax highlighting in alert ([#427](https://github.com/nuxt/content/issues/427)) ([7275487](https://github.com/nuxt/content/commit/72754870bc33de071df02f509b4e2296d271f5f5))
* **theme-docs:** fix Twitter link ([#418](https://github.com/nuxt/content/issues/418)) ([f94291b](https://github.com/nuxt/content/commit/f94291b360d5e679bd07333f4f97143943bb8466))
* **theme-docs:** fix when no github repo specified ([3cd5b82](https://github.com/nuxt/content/commit/3cd5b82010c166bf78199929be8eb8365b9419f4))
* **theme-docs:** fixed incorrect Github URL for navbar ([#489](https://github.com/nuxt/content/issues/489)) ([769c10a](https://github.com/nuxt/content/commit/769c10a07321e05820e8e4fe1f13ce0d2f721fb1))
* **theme-docs:** handle not found ([51fa45c](https://github.com/nuxt/content/commit/51fa45c32ba6a0fac557ee2dac64c5ac4369891a))
* **theme-docs:** handle purgecss in rootDir components ([#559](https://github.com/nuxt/content/issues/559)) ([08d3c75](https://github.com/nuxt/content/commit/08d3c75986b99ba13b8237753f5b3627d273c0dc))
* **theme-docs:** handle single layout on releases ([#482](https://github.com/nuxt/content/issues/482)) ([6033987](https://github.com/nuxt/content/commit/60339876df6ba44e616a86711441e4e6a676bfe9))
* **theme-docs:** header links hover ([0e00bf7](https://github.com/nuxt/content/commit/0e00bf782b367389046948c157948b5d792332cc))
* **theme-docs:** improve dynamic routing ([af1a538](https://github.com/nuxt/content/commit/af1a538344c5d386c4e405f9690297ca3cf3713c))
* **theme-docs:** improve live edit styles ([#428](https://github.com/nuxt/content/issues/428)) ([50bd5b1](https://github.com/nuxt/content/commit/50bd5b136acacc2c425d6535e0a2678783d5bc37))
* **theme-docs:** improve search ([f54871c](https://github.com/nuxt/content/commit/f54871cc97b9af2530aa9a23e011bfc2262aed37))
* **theme-docs:** improve TOC hover ([#420](https://github.com/nuxt/content/issues/420)) ([138f67c](https://github.com/nuxt/content/commit/138f67ccb002a8f52bdb081aac2764f61c8d72f9))
* **theme-docs:** minor graphic updates ([ff2f62e](https://github.com/nuxt/content/commit/ff2f62e6b2d2b7864c79ec8f563f988eea91b7cb))
* **theme-docs:** missing dependency ([140bc07](https://github.com/nuxt/content/commit/140bc078cdd562316c9ac6bf595ecaeda94c5c66))
* **theme-docs:** move unused global components ([#423](https://github.com/nuxt/content/issues/423)) ([162d54b](https://github.com/nuxt/content/commit/162d54b8074b4777434f213e90ddc47300b6b27a))
* **theme-docs:** pin @nuxtjs/google-fonts dependency ([74dbdc7](https://github.com/nuxt/content/commit/74dbdc72ae14a97af60884a77e5307f4a6efe22b))
* **theme-docs:** pin @tailwindcss/typography to 0.2.0 ([a8f57f3](https://github.com/nuxt/content/commit/a8f57f37d093a1c3e473c656af383417c1093578))
* **theme-docs:** prevent warning when global components missing ([#542](https://github.com/nuxt/content/issues/542)) ([1c84288](https://github.com/nuxt/content/commit/1c84288f02b1ef868f1a3360f23f4a7bf25df3aa))
* **theme-docs:** push dev css in modules:before hook ([83b13f5](https://github.com/nuxt/content/commit/83b13f58c435498ca57fc921e29b6b7d152e9587))
* **theme-docs:** remove duplicate tailwind classes ([#322](https://github.com/nuxt/content/issues/322)) ([a24319c](https://github.com/nuxt/content/commit/a24319cf85d8fee21729743846787f228ccb50fe))
* **theme-docs:** remove redundant header ([#722](https://github.com/nuxt/content/issues/722)) ([e85daf0](https://github.com/nuxt/content/commit/e85daf0bfc6491e96555fad9bb1a9772be2a323a))
* **theme-docs:** rename ja locale file ([#707](https://github.com/nuxt/content/issues/707)) ([28006fd](https://github.com/nuxt/content/commit/28006fd83b28b5dbf81234b9f72d419f97aeda94))
* **theme-docs:** responsive menu links ([28dd4dc](https://github.com/nuxt/content/commit/28dd4dc4a99a68b353d3fe17b093d6b91287ded2))
* **theme-docs:** revert @tailwindcss/typography bump ([5adf1a2](https://github.com/nuxt/content/commit/5adf1a295d1c33cbac3a6ea7a3ae32e94a73f9c7))
* **theme-docs:** revert @tailwindcss/typography bump ([#953](https://github.com/nuxt/content/issues/953)) ([95a4afa](https://github.com/nuxt/content/commit/95a4afa0d18d919c33578a06e9a525fcea476499))
* **theme-docs:** spa fallback settings ([05c2244](https://github.com/nuxt/content/commit/05c22447c3063593c0dbbc34eeee3e09bee51f90))
* **theme-docs:** twitter preview when trailing slash on url ([#574](https://github.com/nuxt/content/issues/574)) ([ba0b8b1](https://github.com/nuxt/content/commit/ba0b8b15135428b538208f7ae5e8a8a6284d5a58))
* **theme-docs:** updated german locale ([#853](https://github.com/nuxt/content/issues/853)) ([be84bbd](https://github.com/nuxt/content/commit/be84bbdd6adb0ce1fa0c8720e714a44d3388da98))
* **theme:** module path ([3621dee](https://github.com/nuxt/content/commit/3621dee905db25ba56d783e6443e33647b25e54b))
* **theme:** move nuxt to devDependencies ([9bcd214](https://github.com/nuxt/content/commit/9bcd21404811528dc4be2ddc3f19df0be13deb44))
* **theme:** remove useless alert styles ([#413](https://github.com/nuxt/content/issues/413)) ([1dff4e9](https://github.com/nuxt/content/commit/1dff4e9e9c4bcff03396d711c37f5eee70b8690c))
* **transformers:** case-insensitive search ([#128](https://github.com/nuxt/content/issues/128)) ([b921615](https://github.com/nuxt/content/commit/b921615e92f04de84a0461529a8cdd80ec7c29ae))
* transpile `[@docus](https://github.com/docus)` packages ([#29](https://github.com/nuxt/content/issues/29)) ([2485618](https://github.com/nuxt/content/commit/2485618c90033aacd46e3f404b86a321d45c1187))
* typecheck ([4890997](https://github.com/nuxt/content/commit/48909976e81b7afc065b7cb7dbd5bb81646b7b71))
* typecheck prepack ([dae4149](https://github.com/nuxt/content/commit/dae414978f957d85606aa559c6ade5924940d41c))
* **type:** content locale ([#1965](https://github.com/nuxt/content/issues/1965)) ([38f76c6](https://github.com/nuxt/content/commit/38f76c6f6530dc1cfc783cd3119f1ba25966c798))
* **type:** register module hooks types ([#3166](https://github.com/nuxt/content/issues/3166)) ([afcf815](https://github.com/nuxt/content/commit/afcf8150d14771bb55a861be899db7495efbe40f))
* **type:** remove generic type variable from`QueryBuilder` ([9f32e2f](https://github.com/nuxt/content/commit/9f32e2f2794c4d9919f1b07bf294cd8401603fb5))
* types ([2334b91](https://github.com/nuxt/content/commit/2334b914f2dbb42e90b23f9519fd7059b004f29a))
* types ([285b1a3](https://github.com/nuxt/content/commit/285b1a362f6c775b18caa2b808ddba31d4bc6e4e))
* types ([d941622](https://github.com/nuxt/content/commit/d941622a22dc0fff85ce1dace5f7fcbcd7575dc9))
* types ([#1912](https://github.com/nuxt/content/issues/1912)) ([e82af75](https://github.com/nuxt/content/commit/e82af75360c19e9ad345466e81931dbc5861a31e))
* types import ([ee4ea3a](https://github.com/nuxt/content/commit/ee4ea3ad99721a53a8b79d412a933d18abd44716))
* **types:** `_title` rename to `title` ([#1181](https://github.com/nuxt/content/issues/1181)) ([5b81839](https://github.com/nuxt/content/commit/5b81839590ea3560b3f6694f82a1594c913b9657))
* **types:** add const type parameter for QueryBuilder.only() and .without() ([#2573](https://github.com/nuxt/content/issues/2573)) ([8f560c6](https://github.com/nuxt/content/commit/8f560c692bd1b63cecfa3fb9ea0d99e1691907d3))
* **types:** args can be string or object ([b2c2c13](https://github.com/nuxt/content/commit/b2c2c13fe5b2377ac68c905579e99ce18b8c1c5f))
* **types:** change `QueryBuilderParams` keys to partial ([#1203](https://github.com/nuxt/content/issues/1203)) ([32d5236](https://github.com/nuxt/content/commit/32d523650705594414504661f83c13f25d52995d))
* **types:** change types ([#732](https://github.com/nuxt/content/issues/732)) ([a6274e4](https://github.com/nuxt/content/commit/a6274e482947dc177c795cc00867aa266bd91ddb))
* **types:** fields in `experimental.search` can be optional ([#2506](https://github.com/nuxt/content/issues/2506)) ([2d7188b](https://github.com/nuxt/content/commit/2d7188b8f976aaf325c0c592ff4b76abb2710a97))
* **types:** fix typing error ([#409](https://github.com/nuxt/content/issues/409)) ([23a84f8](https://github.com/nuxt/content/commit/23a84f81f00fa6e3c09a26cbf97a5530c79f9576))
* **types:** hotfix for typings ([3cdc85c](https://github.com/nuxt/content/commit/3cdc85c91e6260c2c33c45f6cbba64e3e542cad5))
* **types:** ignore runtime config type error ([31009a5](https://github.com/nuxt/content/commit/31009a564f980d60e66c16915ba2fea6bdc36208))
* **types:** inject content types to server tsConfig ([203ac90](https://github.com/nuxt/content/commit/203ac906ce17f8f0dffda17ddb2b77fc66998976)), closes [#2968](https://github.com/nuxt/content/issues/2968)
* **types:** more accurately represent `ParsedContentMeta` ([#1196](https://github.com/nuxt/content/issues/1196)) ([3fbcd22](https://github.com/nuxt/content/commit/3fbcd22a17eee6bb1c8224b2cfb436539cda0a6b))
* **types:** remark plugins and rehype plugins should accept options in array syntax ([#462](https://github.com/nuxt/content/issues/462)) ([460b0c5](https://github.com/nuxt/content/commit/460b0c537961fdc53259f058c35a5970ea97bfdd)), closes [/github.com/nuxt/content/blob/711913c4772a9aad442f093eb4ddc822771e873f/packages/content/lib/utils.js#L46-L48](https://github.com/nuxt//github.com/nuxt/content/blob/711913c4772a9aad442f093eb4ddc822771e873f/packages/content/lib/utils.js/issues/L46-L48)
* **types:** theme and preload are optional ([302ad9b](https://github.com/nuxt/content/commit/302ad9b79e7da519d2312944325da769249c66fc))
* **types:** use const type parameter for QueryBuilder only ([#2546](https://github.com/nuxt/content/issues/2546)) ([7966323](https://github.com/nuxt/content/commit/7966323baa52fc66fafe45286d42f6aae7f7ed67))
* **type:** type error on built package ([7be1a2b](https://github.com/nuxt/content/commit/7be1a2b197871697697aaa5fa8eb6c1cee991ce7))
* typings ([965d393](https://github.com/nuxt/content/commit/965d39341edac348260586fafd1856271e8090cd))
* typo ([e0f7bf5](https://github.com/nuxt/content/commit/e0f7bf5bc222f0a424c1f31d77fcf2b3499fd238))
* typo ([a7912af](https://github.com/nuxt/content/commit/a7912af16c12695842a2eb6826f15b4e0ccda1bd))
* typo ([4e71aa0](https://github.com/nuxt/content/commit/4e71aa06be2483192333c5e3f33c209a2514445e))
* **typos:** collectionQureyBuilder ([#2953](https://github.com/nuxt/content/issues/2953)) ([71036e2](https://github.com/nuxt/content/commit/71036e2027063c97c48d97c25b11ec72c832f4ab))
* **ui:** add sticky only for desktop ([063f181](https://github.com/nuxt/content/commit/063f18107f72590f0282a6964b497f261b0113ea))
* undefined ssr event & and invalid column update ([#2962](https://github.com/nuxt/content/issues/2962)) ([9660776](https://github.com/nuxt/content/commit/966077622e80ddb456ab26cba8c908a604e03266))
* unshift components dirs to prevent getting prefixed ([8f8b373](https://github.com/nuxt/content/commit/8f8b37397a579df124f83c18056023dfe0955428))
* unwatch storage on nitro `close` ([ec7105a](https://github.com/nuxt/content/commit/ec7105ad2280624e07529bdedc822bb97344d3c4))
* update `@nuxtjs/mdc` optimizeDeps options ([cfdc580](https://github.com/nuxt/content/commit/cfdc580c2fe2cfea2c7fa3f2d275308ec6faecb5))
* update `nuxt.config.ts` ([2086f39](https://github.com/nuxt/content/commit/2086f399dff70792c9b15ca7f210d988626f9696))
* update `nuxtApp` usage ([#80](https://github.com/nuxt/content/issues/80)) ([6a68d90](https://github.com/nuxt/content/commit/6a68d9085d978a95d4c40a19229c0129ff350d81))
* update cover logo ([0e64bf0](https://github.com/nuxt/content/commit/0e64bf0d494108f8b137967c771495f52a7a120d))
* update csv docs & fix csv options typo ([#3300](https://github.com/nuxt/content/issues/3300)) ([2c2fc77](https://github.com/nuxt/content/commit/2c2fc77e9ee5c215506e0f50164313fe80ec7042))
* update exports ([23cfa9c](https://github.com/nuxt/content/commit/23cfa9ca4c84bcfefe5cddeac6c63d4b392ea3b5))
* update h3 usage with explicit `defineEventHandler` ([#1603](https://github.com/nuxt/content/issues/1603)) ([0b781f1](https://github.com/nuxt/content/commit/0b781f16d4b9ec3331fb9245273d148e739c8023))
* update mdc tagmap on client rendering ([e37498f](https://github.com/nuxt/content/commit/e37498f15d2e759e084126c82950092725d58579))
* update tsconfig extend path ([fd39203](https://github.com/nuxt/content/commit/fd392030cd714cbb5f7c0a4e7732e2762094849b))
* update types and imports ([061192c](https://github.com/nuxt/content/commit/061192c551593fd1398c89662bd7a9b68ea0ec06))
* uppercase in path ([#2170](https://github.com/nuxt/content/issues/2170)) ([9bd31d6](https://github.com/nuxt/content/commit/9bd31d61d335dd10d6c540b4fe1cc1b18a44964e))
* use `@nuxtjs/mdc` types ([84f3bc4](https://github.com/nuxt/content/commit/84f3bc4af0f3d2a78f00c573c636aad1ed74baaf))
* use `consola.withTag` instead of `kit.useLogger` ([#2140](https://github.com/nuxt/content/issues/2140)) ([9efb4e1](https://github.com/nuxt/content/commit/9efb4e152834a602ba60ca27e4aa6600010d98a3))
* use `jiti@2` to import `content.config.ts` ([8f60928](https://github.com/nuxt/content/commit/8f60928088506ea788436d57220b4925bec0abeb))
* use `useRuntimeConfig` composable ([f07ccba](https://github.com/nuxt/content/commit/f07ccba3fc266ae40404a245adb05f217b56ac1b))
* use `useRuntimeConfig` to get `@nuxtjs/mdc` config ([76d6562](https://github.com/nuxt/content/commit/76d65626be3639524ff5932d29f81c19061fd30c))
* use a 90 seconds timeout to prevent Cloudflare from timing out ([#3160](https://github.com/nuxt/content/issues/3160)) ([7552090](https://github.com/nuxt/content/commit/755209056e907afa3c014e3272320598994c7c80))
* use builtin storage to watch contents ([#1052](https://github.com/nuxt/content/issues/1052)) ([0545714](https://github.com/nuxt/content/commit/0545714e24a82cc2f8322a4ba13d5f071922c33c))
* use cache around content utils ([#83](https://github.com/nuxt/content/issues/83)) ([79eb9b2](https://github.com/nuxt/content/commit/79eb9b298d15b7b7c51d183ebc36926acb05a211))
* use compound sort ([#238](https://github.com/nuxt/content/issues/238)) ([e7647ef](https://github.com/nuxt/content/commit/e7647efc2b4967bd368cd2e02cac333d32fba395))
* use core-js 3 ([e4d49e8](https://github.com/nuxt/content/commit/e4d49e86a5d2f0f0053bd569673984691c85e9e6))
* use date for db.json for workbox ([5926b6e](https://github.com/nuxt/content/commit/5926b6e0afcfe1329dcd555360643fd4f0724e92))
* use defu extend ([#342](https://github.com/nuxt/content/issues/342)) ([1e596e9](https://github.com/nuxt/content/commit/1e596e99494124217e124ebc474693084e996d04))
* use jiti to import mdc config ([75cc297](https://github.com/nuxt/content/commit/75cc2970d4acdc3babd066806f30964890115d49))
* use kit logger ([06f29d1](https://github.com/nuxt/content/commit/06f29d1d0e9784ef97376fb2c778387bb1c7d021))
* use minimatch for better ESM support ([f3d7582](https://github.com/nuxt/content/commit/f3d7582c2fe024a3a9ad11d32cbeb70bac71e77e))
* use new docs link ([#414](https://github.com/nuxt/content/issues/414)) ([524b7e1](https://github.com/nuxt/content/commit/524b7e100f76a8a2910c047a2e5be1bf13eb8d59))
* use parsed key in get as well ([5686dd6](https://github.com/nuxt/content/commit/5686dd6b9f486f17408f1d06f6b901426705dfa6)), closes [#81](https://github.com/nuxt/content/issues/81)
* use relative `.md` link ([#1556](https://github.com/nuxt/content/issues/1556)) ([cb7679e](https://github.com/nuxt/content/commit/cb7679e3acbad6dc2e51aa351f2350447d20eeec))
* use remark-external-links for external link options ([33811e1](https://github.com/nuxt/content/commit/33811e173b5b0b3e4fc11c7a6c5b6db2090c9742))
* use runtimeconfig only when necessary ([6f06f35](https://github.com/nuxt/content/commit/6f06f35694f45ac399fb60533b93f16335c1525d))
* use shiki was engine ([4bee4a6](https://github.com/nuxt/content/commit/4bee4a680ea76419b8c860aa8b6b0f1a9215c36f))
* use ssrContext instead of req ([76d3621](https://github.com/nuxt/content/commit/76d3621f76bc42cbc3eaa330167b0367fec2517a))
* use the correct driver ([419523b](https://github.com/nuxt/content/commit/419523ba6b72158c21ab25399cb74d9fe3ef5cf6)), closes [#104](https://github.com/nuxt/content/issues/104)
* use top 2 level of nodes to generate toc ([#757](https://github.com/nuxt/content/issues/757)) ([fe4de6b](https://github.com/nuxt/content/commit/fe4de6bf09bb025878975706de4c0a2f8edbd516))
* use unstorage types ([#2136](https://github.com/nuxt/content/issues/2136)) ([383f9ee](https://github.com/nuxt/content/commit/383f9ee2607cbc1078dde9216e65cfe09562c87e))
* use version for info collection ([a79040d](https://github.com/nuxt/content/commit/a79040d971110937b930bcd1f9ad010efa2c215b))
* **useContentHead:** `undefined` url ([b157500](https://github.com/nuxt/content/commit/b157500b2576ac3385db896fa4babac9b100639d))
* **useContentHead:** disable host detection ([f6a429d](https://github.com/nuxt/content/commit/f6a429dc0ec2c935e9713b55b7ee043522255863))
* **useContentHead:** set `property` instead of `name` for OG metadata ([#1981](https://github.com/nuxt/content/issues/1981)) ([4dd4cb9](https://github.com/nuxt/content/commit/4dd4cb9b7fe657a63e493d63e2c19a534739206b))
* **useContentHead:** set title only if defined ([9b9b648](https://github.com/nuxt/content/commit/9b9b6489aeceea8468eb53a6b067193318bc3397))
* validate collections name ([099b694](https://github.com/nuxt/content/commit/099b69479d1df2bd8caa53d32e7bc657625185dc))
* validate query before execute ([#3048](https://github.com/nuxt/content/issues/3048)) ([0f0da14](https://github.com/nuxt/content/commit/0f0da14bd73370a3ea9bc9957095384e64a1aca4))
* **vercel:** default database url ([042c548](https://github.com/nuxt/content/commit/042c5489157702ce832408eb25c8c0fd6a4fda03))
* **vercel:** use `/tmp` directory for sqlite db ([#3108](https://github.com/nuxt/content/issues/3108)) ([bfc58cc](https://github.com/nuxt/content/commit/bfc58ccf2a155b48d8f585ea8bf206f93c801c27))
* vfile extension format ([12aef72](https://github.com/nuxt/content/commit/12aef7230e9b52f19e70d64479bb44304fb5e3ae))
* wait for closing for close hook ([3f8635a](https://github.com/nuxt/content/commit/3f8635abdcbdbfb218188a384a8b6fb3394564aa))
* warn about missing `content.config.ts` ([43fe4a3](https://github.com/nuxt/content/commit/43fe4a3bf2967a453bce7a8c19c68eaafc3d4d8f))
* warn about using `./` and `../` in source ([7a7b3b2](https://github.com/nuxt/content/commit/7a7b3b206c8f7c28e187a732d6cd6850a86163b9)), closes [#3215](https://github.com/nuxt/content/issues/3215)
* warn when parsing fails ([07d5084](https://github.com/nuxt/content/commit/07d5084e54e03a8d774cbbc66b37445078e6351d))
* **wasm:** ignore OPFS warning as Nuxt Content does not depend on it ([5d5506c](https://github.com/nuxt/content/commit/5d5506ce2f478b944bad68e82a09bafe7ced1f55))
* **wasm:** override logger functions ([#3024](https://github.com/nuxt/content/issues/3024)) ([99f5ac9](https://github.com/nuxt/content/commit/99f5ac9e9018e8cc1b8d91f3188659b28de0c95c))
* **wasm:** use return value of `db.exec` ([d4f6dfe](https://github.com/nuxt/content/commit/d4f6dfefe001672f722f4e5780c847b6b9e41435))
* **watcher:** Ignore non-content events ([273fa72](https://github.com/nuxt/content/commit/273fa72e6662fb24567e7cea06aa6001a1c77bf2))
* **websocket:** disconnect clients on close ([#1115](https://github.com/nuxt/content/issues/1115)) ([ff1492e](https://github.com/nuxt/content/commit/ff1492ef5d828a95ec0b2489584c5de41d45feab))
* **websocket:** import `defineNuxtPlugin` from `nuxt/app` ([3286478](https://github.com/nuxt/content/commit/3286478d01fe9aff877f2ab640389bb3a329ce5e))
* **websocket:** packages imports ([cfd4a41](https://github.com/nuxt/content/commit/cfd4a413973deeb6c79ad42babf097ff8ecae11c))
* **weight:** `1.x` should be lighter that `10.` ([8feeb6a](https://github.com/nuxt/content/commit/8feeb6aa230773d0665bb63b822d04be9c68a11e))
* **ws:** prevent port conflict on running multiple instances ([#1721](https://github.com/nuxt/content/issues/1721)) ([14ab287](https://github.com/nuxt/content/commit/14ab2872ad28c8224c7dfbd05fd2e52a59882788))

### Performance Improvements

* broadcase changes before templates update ([2957772](https://github.com/nuxt/content/commit/295777219a096b9833708ebd3e3c7cf50689b2df))
* **build:** build caches before pre-rendering contents ([#1530](https://github.com/nuxt/content/issues/1530)) ([af8c7b8](https://github.com/nuxt/content/commit/af8c7b8625dcccda59424a491d1414702a6f253f))
* **content-list:** cache contents list during generation and per-request ([#2527](https://github.com/nuxt/content/issues/2527)) ([3555edc](https://github.com/nuxt/content/commit/3555edc0f11ce09423b8ab9b0d214135fe7fa964))
* **dev-cache:** improve localhost markdown page navigation performance (when having 2,000+ pages) ([#2675](https://github.com/nuxt/content/issues/2675)) ([5672457](https://github.com/nuxt/content/commit/567245715f9a24653a051c7c8e6fd2599c938cb2))
* keep document-drive state in `shallowRef` and prefetch pages/components ([#2118](https://github.com/nuxt/content/issues/2118)) ([b88cc2f](https://github.com/nuxt/content/commit/b88cc2f4301bda608037afd995116cd06801f021))
* reduce zod bundle size ([#2900](https://github.com/nuxt/content/issues/2900)) ([f6e4607](https://github.com/nuxt/content/commit/f6e460712942daff01f71ccdad0ae5916739946c))

### Reverts

* Revert "chore(perf): leverage ISR instead for query caching" ([6a56986](https://github.com/nuxt/content/commit/6a56986c2a19323bfb9d95dc9278a1a7b5318a17))
* Revert "docs: upgrade deps (#1424)" ([d46f4ff](https://github.com/nuxt/content/commit/d46f4ff5a8f5a7c6ed0ced3e795b00d44117b191)), closes [#1424](https://github.com/nuxt/content/issues/1424)
* Revert "Update package.json" ([0af39c3](https://github.com/nuxt/content/commit/0af39c3fff1aa7d0ecc11618b1a7d575d57432bb))
* Revert "chore: update gitignore" ([1760126](https://github.com/nuxt/content/commit/176012618eddc37c73185704256965154f717d90))

### Code Refactoring

* spell `extensions` correctly ([#1204](https://github.com/nuxt/content/issues/1204)) ([adc0143](https://github.com/nuxt/content/commit/adc0143ca72b094fad908262f6fb0185ddbc07e4))

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
