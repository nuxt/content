// @ts-nocheck
import { watch, type Ref, unref, ref } from 'vue'
import type { editor as Editor } from 'monaco-editor-core'
import { createSingletonPromise } from '@vueuse/core'
import { language as mdcLanguage } from '@nuxtlabs/monarch-mdc'

declare global {
  interface Window {
    require: any
    MonacoEnvironment: {
      getWorkerUrl: (moduleId: string, label: string) => string
    }
  }
}
const MONACO_CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/'

const loadMonacoScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const loaderScript = window.document.createElement('script')
    loaderScript.type = 'text/javascript'
    loaderScript.src = MONACO_CDN_BASE + src
    loaderScript.addEventListener('load', resolve)
    loaderScript.addEventListener('error', reject)
    window.document.body.appendChild(loaderScript)
  })
}

const setupMonaco = createSingletonPromise(async () => {
  await loadMonacoScript('vs/loader.min.js')
  window.require.config({ paths: { vs: `${MONACO_CDN_BASE}/vs` } })
  const monaco = await new Promise<any>(resolve => window.require(['vs/editor/editor.main'], resolve))

  window.MonacoEnvironment = {
    getWorkerUrl: function () {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: '${MONACO_CDN_BASE}'
        };
        importScripts('${MONACO_CDN_BASE}vs/base/worker/workerMain.js');`
      )}`
    }
  }

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    allowUnusedLabels: true,
    strict: true
  })

  monaco.languages.register({ id: 'mdc' })
  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider('mdc', mdcLanguage)

  return { monaco }
})

export function useMonaco (
  target: Ref,
  options: { readOnly?: boolean, code: string; language: string; onChanged?: (content: string) => void, onDidCreateEditor?: () => void }
) {
  const isSetup = ref(false)
  let editor: Editor.IStandaloneCodeEditor

  const setContent = (content: string) => {
    if (!isSetup.value) { return }
    if (editor) { editor.setValue(content) }
  }

  const init = async () => {
    const { monaco } = await setupMonaco()

    watch(
      target,
      () => {
        const el = unref(target)

        if (!el) { return }

        const extension = () => {
          if (options.language === 'typescript') { return 'ts' } else if (options.language === 'javascript') { return 'js' } else if (options.language === 'html') { return 'html' }
        }

        const model = monaco.editor.createModel(
          options.code,
          options.language,
          monaco.Uri.parse(`file:///root/${Date.now()}.${extension()}`)
        )

        editor = monaco.editor.create(el, {
          readOnly: options.readOnly,
          model,
          tabSize: 2,
          wordWrap: 'on',
          insertSpaces: true,
          autoClosingQuotes: 'always',
          detectIndentation: false,
          folding: false,
          glyphMargin: false,
          lineNumbersMinChars: 3,
          overviewRulerLanes: 0,
          automaticLayout: true,
          theme: 'vs-dark',
          minimap: {
            enabled: false
          },
          onDidCreateEditor: options?.onDidCreateEditor
        })

        setTimeout(() => {
          options?.onDidCreateEditor?.()
        }, 1000)

        isSetup.value = true

        editor.getModel()?.onDidChangeContent(() => {
          options.onChanged?.(editor.getValue())
        })
      },
      {
        flush: 'post',
        immediate: true
      }
    )
  }

  init()

  return {
    setContent
  }
}
