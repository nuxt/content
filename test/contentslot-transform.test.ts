import { test, describe, expect } from 'vitest'

describe('Content slot transform', () => {
  const transform = (code: string) => {
    if (code.includes('ContentSlot')) {
      code = code.replace(/<ContentSlot(\s)+([^/>]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"])/g, '<MDCSlot$1$2name="$5"')
      code = code.replace(/<\/ContentSlot>/g, '</MDCSlot>')
      code = code.replace(/<ContentSlot/g, '<MDCSlot')
      code = code.replace(/(['"])ContentSlot['"]/g, '$1MDCSlot$1')
      code = code.replace(/ContentSlot\(([^(]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"]|use=['"]([a-zA-Z0-9_-]*)['"])([^)]*)/g, 'MDCSlot($1name="$4"$6')
      return {
        code,
        map: { mappings: '' }
      }
    }
  }
  test('Self Closing', () => {
    expect(transform('<ContentSlot :use="$slots.foo" />')?.code).toBe('<MDCSlot name="foo" />')
    expect(transform('<ContentSlot unwrap="p" :use="$slots.foo" />')?.code).toBe('<MDCSlot unwrap="p" name="foo" />')
    expect(transform('<ContentSlot :unwrap="[\'p\']" :use="$slots.foo" />')?.code).toBe('<MDCSlot :unwrap="[\'p\']" name="foo" />')
    expect(transform('<ContentSlot some-pros="value" :use="$slots.foo" />')?.code).toBe('<MDCSlot some-pros="value" name="foo" />')

    expect(transform('<ContentSlot :use="$slots.foo" unwrap="p" />')?.code).toBe('<MDCSlot name="foo" unwrap="p" />')
    expect(transform('<ContentSlot :use="$slots.foo" :unwrap="[\'p\']" />')?.code).toBe('<MDCSlot name="foo" :unwrap="[\'p\']" />')
    expect(transform('<ContentSlot :use="$slots.foo" some-pros="value" />')?.code).toBe('<MDCSlot name="foo" some-pros="value" />')

    expect(transform('<ContentSlot\n:use="$slots.foo"\n/>')?.code).toBe('<MDCSlot\nname="foo"\n/>')
    expect(transform('<ContentSlot\nunwrap="p"\n:use="$slots.foo"\n/>')?.code).toBe('<MDCSlot\nunwrap="p"\nname="foo"\n/>')
    expect(transform('<ContentSlot\n:unwrap="[\'p\']"\n:use="$slots.foo"\n/>')?.code).toBe('<MDCSlot\n:unwrap="[\'p\']"\nname="foo"\n/>')
    expect(transform('<ContentSlot\nsome-pros="value"\n:use="$slots.foo"\n/>')?.code).toBe('<MDCSlot\nsome-pros="value"\nname="foo"\n/>')

    expect(transform('<ContentSlot\n:use="$slots.foo"\nunwrap="p"\n/>')?.code).toBe('<MDCSlot\nname="foo"\nunwrap="p"\n/>')
    expect(transform('<ContentSlot\n:use="$slots.foo"\n:unwrap="[\'p\']"\n/>')?.code).toBe('<MDCSlot\nname="foo"\n:unwrap="[\'p\']"\n/>')
    expect(transform('<ContentSlot\n:use="$slots.foo"\nsome-pros="value"\n/>')?.code).toBe('<MDCSlot\nname="foo"\nsome-pros="value"\n/>')
  })

  test('With Slot', () => {
    expect(transform('<ContentSlot :use="$slots.foo"></ContentSlot>')?.code).toBe('<MDCSlot name="foo"></MDCSlot>')
    expect(transform('<ContentSlot unwrap="p" :use="$slots.foo"></ContentSlot>')?.code).toBe('<MDCSlot unwrap="p" name="foo"></MDCSlot>')
    expect(transform('<ContentSlot :unwrap="[\'p\']" :use="$slots.foo"></ContentSlot>')?.code).toBe('<MDCSlot :unwrap="[\'p\']" name="foo"></MDCSlot>')
    expect(transform('<ContentSlot some-pros="value" :use="$slots.foo"></ContentSlot>')?.code).toBe('<MDCSlot some-pros="value" name="foo"></MDCSlot>')

    expect(transform('<ContentSlot :use="$slots.foo" unwrap="p"></ContentSlot>')?.code).toBe('<MDCSlot name="foo" unwrap="p"></MDCSlot>')
    expect(transform('<ContentSlot :use="$slots.foo" :unwrap="[\'p\']"></ContentSlot>')?.code).toBe('<MDCSlot name="foo" :unwrap="[\'p\']"></MDCSlot>')
    expect(transform('<ContentSlot :use="$slots.foo" some-pros="value"></ContentSlot>')?.code).toBe('<MDCSlot name="foo" some-pros="value"></MDCSlot>')

    const slotContent = '\n<div class="bg-black">Foo</div>\n'
    expect(transform(`<ContentSlot\n:use="$slots.foo"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nname="foo"\n>${slotContent}</MDCSlot>`)
    expect(transform(`<ContentSlot\nunwrap="p"\n:use="$slots.foo"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nunwrap="p"\nname="foo"\n>${slotContent}</MDCSlot>`)
    expect(transform(`<ContentSlot\n:unwrap="['p']"\n:use="$slots.foo"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\n:unwrap="['p']"\nname="foo"\n>${slotContent}</MDCSlot>`)
    expect(transform(`<ContentSlot\nsome-pros="value"\n:use="$slots.foo"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nsome-pros="value"\nname="foo"\n>${slotContent}</MDCSlot>`)

    expect(transform(`<ContentSlot\n:use="$slots.foo"\nunwrap="p"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nname="foo"\nunwrap="p"\n>${slotContent}</MDCSlot>`)
    expect(transform(`<ContentSlot\n:use="$slots.foo"\n:unwrap="['p']"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nname="foo"\n:unwrap="['p']"\n>${slotContent}</MDCSlot>`)
    expect(transform(`<ContentSlot\n:use="$slots.foo"\nsome-pros="value"\n>${slotContent}</ContentSlot>`)?.code).toBe(`<MDCSlot\nname="foo"\nsome-pros="value"\n>${slotContent}</MDCSlot>`)
  })
})
