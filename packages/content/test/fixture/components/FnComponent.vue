<script>
export default {
  functional: true,
  render (h, { data }) {
    return h('AppLayout', {
      ...data,
      scopedSlots: {
        header: () => h('Header content'),
        footer: () => h('Footer content')
      }
    }, [])
  }
}
</script>
