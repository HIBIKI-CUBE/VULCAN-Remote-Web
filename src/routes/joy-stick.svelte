<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let angle = 0,
    distance = 0;

  const x = tweened(0, {
    duration: 250,
    easing: cubicOut,
  });
  const y = tweened(0, {
    duration: 250,
    easing: cubicOut,
  });

  let circle: HTMLElement;

  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

  function handleTouch(event: TouchEvent) {
    if (event.type === 'touchend') {
      x.set(0);
      y.set(0);
      angle = 0;
      distance = 0;
    } else {
      const ex =
          event.touches[0].clientX -
          circle?.getBoundingClientRect().x -
          circle?.getBoundingClientRect().width / 2,
        ey =
          event.touches[0].clientY -
          circle?.getBoundingClientRect().y -
          circle?.getBoundingClientRect().height / 2;
      angle = ex === 0 && ey === 0 ? 0 : (Math.atan2(ex, -ey) * 180) / Math.PI;
      distance = clamp(
        Math.sqrt(Math.pow(ex, 2) + Math.pow(ey, 2)) / (circle.getBoundingClientRect().width / 2),
        0,
        1,
      );
      x.set(
        distance * (circle.getBoundingClientRect().width / 2) * Math.sin((angle / 180) * Math.PI),
      );
      y.set(
        -distance * (circle.getBoundingClientRect().width / 2) * Math.cos((angle / 180) * Math.PI),
      );
    }
  }
</script>

<div
  class="joyStick"
  on:touchstart={handleTouch}
  on:touchmove={handleTouch}
  on:touchend={handleTouch}
>
  <div class="circle" bind:this={circle} />
  <div class="knob" style="translate: {$x}px {$y}px" />
</div>

<style lang="stylus">
.joyStick
  position relative
  width 100%
  aspect-ratio 1
  -webkit-user-select none
  user-select none

.circle, .knob
  position absolute
  top 0
  right 0
  bottom 0
  left 0
  aspect-ratio 1
  margin auto
  border-radius 50%

.circle
  width 90%
  background radial-gradient(circle, #fff3, #fff3, #fffd, #ffff)

.knob
  width 25%
  background blue

</style>
