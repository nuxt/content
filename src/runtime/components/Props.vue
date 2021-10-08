<template>
  <ProseTable v-if="component">
    <ProseThead>
      <ProseTr>
        <ProseTh>Prop</ProseTh>
        <ProseTh>Type</ProseTh>
        <ProseTh v-if="showRequired">Required</ProseTh>
        <ProseTh v-if="showDefault">Default</ProseTh>
        <ProseTh v-if="showValues">Values</ProseTh>
        <ProseTh v-if="showDescription">Description</ProseTh>
      </ProseTr>
    </ProseThead>
    <ProseTbody>
      <ProseTr v-for="prop in properties" :key="prop.name">
        <ProseTd>
          <ProseCodeInline>{{ prop.name }}</ProseCodeInline>
        </ProseTd>
        <ProseTd>
          <ProseCodeInline>{{ prop.type.join(' | ') }}</ProseCodeInline>
        </ProseTd>
        <ProseTd v-if="showRequired">{{ prop.required ? 'Yes' : 'No' }}</ProseTd>
        <ProseTd v-if="showDefault">
          <ProseCodeInline v-if="prop.default">{{ prop.default }}</ProseCodeInline>
        </ProseTd>
        <ProseTd v-if="showValues">
          <ProseCodeInline v-if="prop.values">{{
            prop.values && JSON.stringify(prop.values).replace(/,/g, ', ')
          }}</ProseCodeInline>
          <span v-else>-</span>
        </ProseTd>
        <ProseTd v-if="showDescription">
          <div v-html="prop.description"></div>
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>

<script>
import Vue from 'vue'
import { pascalCase } from 'scule'
import { computed, defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    of: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: undefined,
      description: 'Toggle required column.'
    },
    values: {
      type: Boolean,
      default: undefined,
      description: 'Toggle values column.'
    },
    description: {
      type: Boolean,
      default: undefined,
      description: 'Toggle description column.'
    },
    default: {
      type: Boolean,
      default: undefined,
      description: 'Toggle default column.'
    }
  },
  setup(props) {
    const component = computed(() => Vue.component(pascalCase(props.of)))

    const properties = computed(() =>
      Object.entries(component.value.options.props)
        .map(([name, prop]) => ({
          name,
          type: Array.isArray(prop.type) ? prop.type.map(type => type.name) : [prop.type.name],
          default: prop.default && JSON.stringify(typeof prop.default === 'function' ? prop.default() : prop.default),
          required: prop.required,
          values: prop.values,
          description: prop.description,
          internal: prop.internal
        }))
        .filter(prop => prop.internal !== true)
    )

    const showRequired = computed(() => {
      if (props.required !== undefined) {
        return props.required
      }

      return properties.value?.find(prop => prop.required !== undefined)
    })

    const showValues = computed(() => {
      if (props.values !== undefined) {
        return props.values
      }

      return properties.value?.find(prop => prop.values)
    })

    const showDescription = computed(() => {
      if (props.description !== undefined) {
        return props.description
      }

      return properties.value?.find(prop => prop.description)
    })

    const showDefault = computed(() => {
      if (props.default !== undefined) {
        return props.default
      }

      return properties.value?.find(prop => prop.default)
    })

    return {
      component,
      properties,
      showRequired,
      showValues,
      showDescription,
      showDefault
    }
  }
})
</script>
