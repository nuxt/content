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
          <ProseCodeInline>{{ prop.type && prop.type.name }}</ProseCodeInline>
        </ProseTd>
        <ProseTd v-if="showRequired">{{ prop.required ? 'Yes' : 'No' }}</ProseTd>
        <ProseTd v-if="showDefault">
          <ProseCodeInline v-if="prop.defaultValue">{{ prop.defaultValue && prop.defaultValue.value }}</ProseCodeInline>
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
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    of: {
      type: String,
      default: undefined
    },
    /**
     * @ignore
     */
    data: {
      type: Object,
      default: () => ({})
    },
    /**
     * Toggle required column.
     */
    required: {
      type: Boolean,
      default: undefined
    },
    /**
     * Toggle values column.
     */
    values: {
      type: Boolean,
      default: undefined
    },
    /**
     * Toggle description column.
     */
    description: {
      type: Boolean,
      default: undefined
    },
    /**
     * Toglle default column.
     */
    defaultValue: {
      type: Boolean,
      default: undefined
    }
  },
  setup(props) {
    const component = computed(() => props.data)

    const properties = computed(() => component.value.props?.filter(prop => !prop.tags?.ignore))

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
      if (props.defaultValue !== undefined) {
        return props.defaultValue
      }

      return properties.value?.find(prop => prop.defaultValue)
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
