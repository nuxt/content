/* eslint-disable quotes */
const { createBrowser } = require("tib")
const { setup, loadConfig, url } = require("@nuxtjs/module-test-utils")

const wrapHighlightjs = (code, lang) =>
  `<pre><code class="hljs ${lang}">${code}</code></pre>`

describe("highlighter", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe("has generated code highlighting html using default prism.js", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup(loadConfig(__dirname)))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("inject default prism.js CSS theme styling", () => {
      expect(html).toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"line-numbers language-text\\"><code>console.log('Highlighter')
        </code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><span class=\\"filename\\">index.ts</span><pre class=\\"line-numbers language-ts\\" data-line=\\"1\\"><code><span class=\\"token comment\\">// @errors: 2322</span>
        <span class=\\"token keyword\\">function</span> <span class=\\"token function\\">sum</span><span class=\\"token punctuation\\">(</span>a<span class=\\"token operator\\">:</span> <span class=\\"token builtin\\">number</span><span class=\\"token punctuation\\">,</span> b<span class=\\"token operator\\">:</span> <span class=\\"token builtin\\">number</span><span class=\\"token punctuation\\">)</span><span class=\\"token operator\\">:</span> <span class=\\"token builtin\\">string</span> <span class=\\"token punctuation\\">{</span>
          <span class=\\"token keyword\\">return</span> <span class=\\"token boolean\\">true</span>
        <span class=\\"token punctuation\\">}</span>
        </code></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using highlight.js", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            highlighter (rawCode, lang) {
              if (lang === "vue") {
                lang = "html"
              }
              const highlightjs = require("highlight.js")
              if (!lang) {
                return wrapHighlightjs(
                  highlightjs.highlightAuto(rawCode).value,
                  lang
                )
              }
              return wrapHighlightjs(
                highlightjs.highlight(lang, rawCode).value,
                lang
              )
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"nuxt-content-highlight\\"><pre><code class=\\"hljs null\\">console.<span class=\\"hljs-built_in\\">log</span>('Highlighter')
        </code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre><code class=\\"hljs ts\\"><span class=\\"hljs-comment\\">// @errors: 2322</span>
        <span class=\\"hljs-function\\"><span class=\\"hljs-keyword\\">function</span> <span class=\\"hljs-title\\">sum</span>(<span class=\\"hljs-params\\">a: <span class=\\"hljs-built_in\\">number</span>, b: <span class=\\"hljs-built_in\\">number</span></span>): <span class=\\"hljs-title\\">string</span> </span>{
          <span class=\\"hljs-keyword\\">return</span> <span class=\\"hljs-literal\\">true</span>
        }
        </code></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using shiki", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            async highlighter () {
              const highlighter = await require("shiki").getHighlighter({
                theme: "nord"
              })
              return (rawCode, lang) => {
                if (!lang) {
                  lang = "typescript"
                }
                return highlighter.codeToHtml(rawCode, lang)
              }
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440;\\"><code><span class=\\"line\\"><span style=\\"color:#D8DEE9;\\">console</span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\">log</span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></span></code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440;\\"><code><span class=\\"line\\"><span style=\\"color:#616E88;\\">// @errors: 2322</span></span>
        <span class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\">sum</span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\">a</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\">b</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></span>
        <span class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></span>
        <span class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></span></code></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using shiki twoslash", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            async highlighter () {
              const {
                createShikiHighlighter,
                runTwoSlash,
                renderCodeToHTML
              } = require("shiki-twoslash")
              const highlighter = await createShikiHighlighter({
                theme: "nord"
              })
              return (rawCode, lang) => {
                if (!lang) {
                  lang = "typescript"
                }
                const twoslashResults = runTwoSlash(rawCode, lang)
                return renderCodeToHTML(
                  twoslashResults.code,
                  lang,
                  ["twoslash"],
                  {},
                  highlighter,
                  twoslashResults
                )
              }
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki twoslash lsp\\"><div class=\\"code-container\\"><code><span style=\\"color:#8FBCBB;\\"><span data-lsp=\\"var console: Console\\" class=\\"data-lsp\\">console</span></span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"(method) Console.log(...data: any[]): void\\" class=\\"data-lsp\\">log</span></span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></code><a href=\\"https://www.typescriptlang.org/play/#code/MYewdgziA2CmB00QHMAUByAEgS2QC2lzwBdYAndASgCgg\\">Try</a></div></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki twoslash lsp\\"><div class=\\"code-container\\"><code><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"function sum(a: number, b: number): string\\" class=\\"data-lsp\\">sum</span></span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) a: number\\" class=\\"data-lsp\\">a</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) b: number\\" class=\\"data-lsp\\">b</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span>
        <span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span>
        <span class=\\"error\\"><span>Type 'boolean' is not assignable to type 'string'.</span><span class=\\"code\\">2322</span></span><span class=\\"error-behind\\">Type 'boolean' is not assignable to type 'string'.</span><span style=\\"color:#ECEFF4;\\">}</span></code><a href=\\"https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oFADMBXAOwGMAXASziNEQIFsAKAQ1SIYCMYAaUDtzjACUqRGWgUiAc1ABvHKFDRIZAtBriCkHAF8cQA\\">Try</a></div></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using highlight.js with thematic block and ast utility", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            highlighter (
              rawCode,
              lang,
              { lineHighlights, fileName },
              { h, node, u }
            ) {
              if (lang === "vue") {
                lang = "html"
              }
              const highlightjs = require("highlight.js")
              let code
              if (!lang) {
                code = highlightjs.highlightAuto(rawCode).value
              } else {
                code = highlightjs.highlight(lang, rawCode).value
              }
              return h(
                node,
                "div",
                {
                  className: ["highlighted-using-highlightjs", fileName || ""],
                  dataLine: lineHighlights
                },
                [u("raw", wrapHighlightjs(code))]
              )
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"highlighted-using-highlightjs\\"><pre><code class=\\"hljs undefined\\">console.<span class=\\"hljs-built_in\\">log</span>('Highlighter')
        </code></pre></div>
        <div class=\\"highlighted-using-highlightjs index.ts\\" data-line=\\"1\\"><pre><code class=\\"hljs undefined\\"><span class=\\"hljs-comment\\">// @errors: 2322</span>
        <span class=\\"hljs-function\\"><span class=\\"hljs-keyword\\">function</span> <span class=\\"hljs-title\\">sum</span>(<span class=\\"hljs-params\\">a: <span class=\\"hljs-built_in\\">number</span>, b: <span class=\\"hljs-built_in\\">number</span></span>): <span class=\\"hljs-title\\">string</span> </span>{
          <span class=\\"hljs-keyword\\">return</span> <span class=\\"hljs-literal\\">true</span>
        }
        </code></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using shiki with thematic block and ast utility", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            async highlighter () {
              const highlighter = await require("shiki").getHighlighter({
                theme: "nord"
              })
              return (
                rawCode,
                lang,
                { lineHighlights, fileName },
                { h, node, u }
              ) => {
                if (!lang) {
                  lang = "typescript"
                }
                const code = highlighter.codeToHtml(rawCode, lang)
                return h(
                  node,
                  "div",
                  {
                    className: ["highlighted-using-shiki", fileName || ""],
                    dataLine: lineHighlights
                  },
                  [u("raw", code)]
                )
              }
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"highlighted-using-shiki\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440;\\"><code><span class=\\"line\\"><span style=\\"color:#D8DEE9;\\">console</span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\">log</span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></span></code></pre></div>
        <div class=\\"highlighted-using-shiki index.ts\\" data-line=\\"1\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440;\\"><code><span class=\\"line\\"><span style=\\"color:#616E88;\\">// @errors: 2322</span></span>
        <span class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\">sum</span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\">a</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\">b</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></span>
        <span class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></span>
        <span class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></span></code></pre></div>"
      `)
    })
  })

  describe("has generated code highlighting html using shiki twoslash with thematic block and ast utility", () => {
    let nuxt, browser, page, html, nuxtContent

    beforeAll(async () => {
      ({ nuxt } = await setup({
        ...loadConfig(__dirname),
        content: {
          markdown: {
            async highlighter () {
              const {
                createShikiHighlighter,
                runTwoSlash,
                renderCodeToHTML
              } = require("shiki-twoslash")
              const highlighter = await createShikiHighlighter({
                theme: "nord"
              })
              return (
                rawCode,
                lang,
                { lineHighlights, fileName },
                { h, node, u }
              ) => {
                if (!lang) {
                  lang = "typescript"
                }
                const twoslashResults = runTwoSlash(rawCode, lang)
                const code = renderCodeToHTML(
                  twoslashResults.code,
                  lang,
                  ["twoslash"],
                  {},
                  highlighter,
                  twoslashResults
                )
                return h(
                  node,
                  "div",
                  {
                    className: [
                      "highlighted-using-shiki-twoslash",
                      fileName || ""
                    ],
                    dataLine: lineHighlights
                  },
                  [u("raw", code)]
                )
              }
            }
          }
        }
      }))
      browser = await createBrowser("puppeteer")
      page = await browser.page(url("/highlighter"))
      html = await page.getHtml()
      nuxtContent = await page.evaluate(
        () => document.querySelector(".nuxt-content").innerHTML
      )
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test("not inject default prism.js CSS theme styling", () => {
      expect(html).not.toContain(
        `code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-]::selection,code[class*=language-] ::selection,pre[class*=language-]::selection,pre[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}`
      )
    })

    test("renders correctly", () => {
      expect(nuxtContent).toMatchInlineSnapshot(`
        "<div class=\\"highlighted-using-shiki-twoslash\\"><pre class=\\"shiki twoslash lsp\\"><div class=\\"code-container\\"><code><span style=\\"color:#8FBCBB;\\"><span data-lsp=\\"var console: Console\\" class=\\"data-lsp\\">console</span></span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"(method) Console.log(...data: any[]): void\\" class=\\"data-lsp\\">log</span></span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></code><a href=\\"https://www.typescriptlang.org/play/#code/MYewdgziA2CmB00QHMAUByAEgS2QC2lzwBdYAndASgCgg\\">Try</a></div></pre></div>
        <div class=\\"highlighted-using-shiki-twoslash index.ts\\" data-line=\\"1\\"><pre class=\\"shiki twoslash lsp\\"><div class=\\"code-container\\"><code><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"function sum(a: number, b: number): string\\" class=\\"data-lsp\\">sum</span></span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) a: number\\" class=\\"data-lsp\\">a</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) b: number\\" class=\\"data-lsp\\">b</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span>
        <span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span>
        <span class=\\"error\\"><span>Type 'boolean' is not assignable to type 'string'.</span><span class=\\"code\\">2322</span></span><span class=\\"error-behind\\">Type 'boolean' is not assignable to type 'string'.</span><span style=\\"color:#ECEFF4;\\">}</span></code><a href=\\"https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oFADMBXAOwGMAXASziNEQIFsAKAQ1SIYCMYAaUDtzjACUqRGWgUiAc1ABvHKFDRIZAtBriCkHAF8cQA\\">Try</a></div></pre></div>"
      `)
    })
  })
})
