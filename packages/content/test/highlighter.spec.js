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
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"line-numbers language-js\\"><code><span class=\\"token console class-name\\">console</span><span class=\\"token punctuation\\">.</span><span class=\\"token method function property-access\\">log</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">'Highlighter'</span><span class=\\"token punctuation\\">)</span>
        </code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><span class=\\"filename\\">index.ts</span><pre data-line=\\"1\\" class=\\"line-numbers language-typescript\\"><code><span class=\\"token comment\\">// @errors: 2322</span>
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
              if (!lang || lang === "null") {
                return wrapHighlightjs(
                  highlightjs.highlightAuto(rawCode).value,
                  lang
                )
              }
              return wrapHighlightjs(
                highlightjs.highlight(rawCode, { language: lang }).value,
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
        "<div class=\\"nuxt-content-highlight\\"><pre><code class=\\"hljs js\\"><span class=\\"hljs-variable language_\\">console</span>.<span class=\\"hljs-title function_\\">log</span>(<span class=\\"hljs-string\\">'Highlighter'</span>)
        </code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre><code class=\\"hljs typescript\\"><span class=\\"hljs-comment\\">// @errors: 2322</span>
        <span class=\\"hljs-keyword\\">function</span> <span class=\\"hljs-title function_\\">sum</span>(<span class=\\"hljs-params\\">a: <span class=\\"hljs-built_in\\">number</span>, b: <span class=\\"hljs-built_in\\">number</span></span>): <span class=\\"hljs-built_in\\">string</span> {
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
                if (!lang || lang === "null") {
                  lang = "typescript"
                }
                return highlighter
                  .codeToHtml(rawCode, lang)
                  .replace(/<a[^>]*>([^<]+)<\/a>/g, "")
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
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440ff;\\"><code><span class=\\"line\\"><span style=\\"color:#D8DEE9;\\">console</span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\">log</span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></span>
        <span class=\\"line\\"></span></code></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440ff;\\"><code><span class=\\"line\\"><span style=\\"color:#616E88;\\">// @errors: 2322</span></span>
        <span class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\">sum</span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\">a</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\">b</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></span>
        <span class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></span>
        <span class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></span>
        <span class=\\"line\\"></span></code></pre></div>"
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
                if (!lang || lang === "null") {
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
                ).replace(/<a[^>]*>([^<]+)<\/a>/g, "")
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
        "<div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki twoslash lsp\\" style=\\"background-color:#2e3440ff;color:#d8dee9ff;\\"><div class=\\"language-id\\">js</div><div class=\\"code-container\\"><code><div class=\\"line\\"><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"var console: Console\\" class=\\"data-lsp\\">console</span></span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"(method) Console.log(...data: any[]): void\\" class=\\"data-lsp\\">log</span></span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></div><div class=\\"line\\">&nbsp;</div></code></div></pre></div>
        <div class=\\"nuxt-content-highlight\\"><pre class=\\"shiki twoslash lsp\\" style=\\"background-color:#2e3440ff;color:#d8dee9ff;\\"><div class=\\"language-id\\">typescript</div><div class=\\"code-container\\"><code><div class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"function sum(a: number, b: number): string\\" class=\\"data-lsp\\">sum</span></span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) a: number\\" class=\\"data-lsp\\">a</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) b: number\\" class=\\"data-lsp\\">b</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></div><div class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></div><span class=\\"error\\"><span>Type 'boolean' is not assignable to type 'string'.</span><span class=\\"code\\">2322</span></span><span class=\\"error-behind\\">Type 'boolean' is not assignable to type 'string'.</span><div class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></div><div class=\\"line\\">&nbsp;</div></code></div></pre></div>"
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
              if (!lang || lang === "null") {
                code = highlightjs.highlightAuto(rawCode).value
              } else {
                code = highlightjs.highlight(rawCode, { language: lang }).value
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
        "<div class=\\"highlighted-using-highlightjs\\"><pre><code class=\\"hljs undefined\\"><span class=\\"hljs-variable language_\\">console</span>.<span class=\\"hljs-title function_\\">log</span>(<span class=\\"hljs-string\\">'Highlighter'</span>)
        </code></pre></div>
        <div data-line=\\"1\\" class=\\"highlighted-using-highlightjs index.ts\\"><pre><code class=\\"hljs undefined\\"><span class=\\"hljs-comment\\">// @errors: 2322</span>
        <span class=\\"hljs-keyword\\">function</span> <span class=\\"hljs-title function_\\">sum</span>(<span class=\\"hljs-params\\">a: <span class=\\"hljs-built_in\\">number</span>, b: <span class=\\"hljs-built_in\\">number</span></span>): <span class=\\"hljs-built_in\\">string</span> {
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
                if (!lang || lang === "null") {
                  lang = "typescript"
                }
                const code = highlighter
                  .codeToHtml(rawCode, lang)
                  .replace(/<a[^>]*>([^<]+)<\/a>/g, "")
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
        "<div class=\\"highlighted-using-shiki\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440ff;\\"><code><span class=\\"line\\"><span style=\\"color:#D8DEE9;\\">console</span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\">log</span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></span>
        <span class=\\"line\\"></span></code></pre></div>
        <div data-line=\\"1\\" class=\\"highlighted-using-shiki index.ts\\"><pre class=\\"shiki\\" style=\\"background-color:#2e3440ff;\\"><code><span class=\\"line\\"><span style=\\"color:#616E88;\\">// @errors: 2322</span></span>
        <span class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\">sum</span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\">a</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\">b</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></span>
        <span class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></span>
        <span class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></span>
        <span class=\\"line\\"></span></code></pre></div>"
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
                if (!lang || lang === "null") {
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
                ).replace(/<a[^>]*>([^<]+)<\/a>/g, "")
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
        "<div class=\\"highlighted-using-shiki-twoslash\\"><pre class=\\"shiki twoslash lsp\\" style=\\"background-color:#2e3440ff;color:#d8dee9ff;\\"><div class=\\"language-id\\">js</div><div class=\\"code-container\\"><code><div class=\\"line\\"><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"var console: Console\\" class=\\"data-lsp\\">console</span></span><span style=\\"color:#ECEFF4;\\">.</span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"(method) Console.log(...data: any[]): void\\" class=\\"data-lsp\\">log</span></span><span style=\\"color:#D8DEE9FF;\\">(</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#A3BE8C;\\">Highlighter</span><span style=\\"color:#ECEFF4;\\">'</span><span style=\\"color:#D8DEE9FF;\\">)</span></div><div class=\\"line\\">&nbsp;</div></code></div></pre></div>
        <div data-line=\\"1\\" class=\\"highlighted-using-shiki-twoslash index.ts\\"><pre class=\\"shiki twoslash lsp\\" style=\\"background-color:#2e3440ff;color:#d8dee9ff;\\"><div class=\\"language-id\\">typescript</div><div class=\\"code-container\\"><code><div class=\\"line\\"><span style=\\"color:#81A1C1;\\">function</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#88C0D0;\\"><span data-lsp=\\"function sum(a: number, b: number): string\\" class=\\"data-lsp\\">sum</span></span><span style=\\"color:#ECEFF4;\\">(</span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) a: number\\" class=\\"data-lsp\\">a</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">,</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#D8DEE9;\\"><span data-lsp=\\"(parameter) b: number\\" class=\\"data-lsp\\">b</span></span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">number</span><span style=\\"color:#ECEFF4;\\">)</span><span style=\\"color:#81A1C1;\\">:</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#8FBCBB;\\">string</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#ECEFF4;\\">{</span></div><div class=\\"line\\"><span style=\\"color:#D8DEE9FF;\\">  </span><span style=\\"color:#81A1C1;\\">return</span><span style=\\"color:#D8DEE9FF;\\"> </span><span style=\\"color:#81A1C1;\\">true</span></div><span class=\\"error\\"><span>Type 'boolean' is not assignable to type 'string'.</span><span class=\\"code\\">2322</span></span><span class=\\"error-behind\\">Type 'boolean' is not assignable to type 'string'.</span><div class=\\"line\\"><span style=\\"color:#ECEFF4;\\">}</span></div><div class=\\"line\\">&nbsp;</div></code></div></pre></div>"
      `)
    })
  })
})
