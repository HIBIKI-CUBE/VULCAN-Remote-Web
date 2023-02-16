<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let angle = 0,
    distance = 0;

  const x = tweened(0, {
    duration: 300,
    easing: cubicOut,
  });
  const y = tweened(0, {
    duration: 300,
    easing: cubicOut,
  });

  let circle: HTMLElement;
  function handleTouch(event: TouchEvent) {
    if (event.type === 'touchend') {
      x.set(0);
      y.set(0);
      angle = 0;
      distance = 0;
    } else {
      x.set(
        event.touches[0].clientX -
          circle?.getBoundingClientRect().x -
          circle?.getBoundingClientRect().width / 2,
      );
      y.set(
        event.touches[0].clientY -
          circle?.getBoundingClientRect().y -
          circle?.getBoundingClientRect().height / 2,
      );
      angle = $x === 0 && $y === 0 ? 0 : (Math.atan2($x, -$y) * 180) / Math.PI;
      distance =
        Math.sqrt(Math.pow($x, 2) + Math.pow($y, 2)) / (circle.getBoundingClientRect().width / 2);
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
