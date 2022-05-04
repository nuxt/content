<script setup>
const props = defineProps({
  throttle: {
    type: Number,
    default: 200
  },
  duration: {
    type: Number,
    default: 2000
  },
  height: {
    type: Number,
    default: 3
  }
})
// Options & Data
const data = reactive({
  percent: 0,
  show: false,
  canSucceed: true
})
// Local variables
let _timer = null
let _throttle = null
let _cut

// Functions
const clear = () => {
  _timer && clearInterval(_timer)
  _throttle && clearTimeout(_throttle)
  _timer = null
}
const start = () => {
  clear()
  data.percent = 0
  data.canSucceed = true

  if (props.throttle) {
    _throttle = setTimeout(startTimer, props.throttle)
  } else {
    startTimer()
  }
}
const increase = (num) => {
  data.percent = Math.min(100, Math.floor(data.percent + num))
}
const finish = () => {
  data.percent = 100
  hide()
}
const hide = () => {
  clear()
  setTimeout(() => {
    data.show = false
    setTimeout(() => {
      data.percent = 0
    }, 400)
  }, 500)
}
const startTimer = () => {
  data.show = true
  _cut = 10000 / Math.floor(props.duration)
  _timer = setInterval(() => {
    increase(_cut)
  }, 100)
}

// Hooks
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:start', start)
nuxtApp.hook('page:finish', finish)

onBeforeUnmount(() => clear)
</script>

<template>
  <div
    class="nuxt-progress"
    :class="{
      'nuxt-progress-failed': !data.canSucceed,
    }"
    :style="{
      width: data.percent + '%',
      left: data.left,
      height: props.height + 'px',
      opacity: data.show ? 1 : 0,
      backgroundSize: (100 / data.percent) * 100 + '% auto',
    }"
  />
</template>

<style>
.nuxt-progress {
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  width: 0%;
  opacity: 1;
  transition: width 0.1s, height 0.4s, opacity 0.4s;
  background: repeating-linear-gradient(
    to right,
    #00dc82 0%,
    #34cdfe 50%,
    #0047e1 100%
  );
  z-index: 999999;
}
</style>
