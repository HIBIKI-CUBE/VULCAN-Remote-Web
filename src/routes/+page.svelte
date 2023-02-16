<script lang="ts">
  import JoyStick from './joy-stick.svelte';
  import { browser } from '$app/environment';

  const SERVICE_UUID = '2ba23aa3-f921-451e-a54b-e3093e5e3112';
  const CHARACTERISTIC_UUID = 'f46a5236-5e85-4933-b171-48b7461722c3';

  let connect: () => void;
  let characteristic: BluetoothRemoteGATTCharacteristic;

  let active = false;
  let remote = true;
  let fast = false;
  let lidarFront = true;
  let lidarSide = true;
  let lastBleSend = 0;
  const bleDelay = 100;
  let video: HTMLVideoElement;
  let angle = 0,
    distance = 0;

  function sendFlags(calibrate = false, reset = false) {
    setTimeout(() => {
      const flags = [active, remote, !remote, fast, lidarFront, lidarSide, calibrate, reset].map(
        (flag) => Number(flag),
      );
      let data = 0;
      flags.forEach((flag, index) => {
        data += flag << (flags.length - index - 1);
      });
      lastBleSend = performance.now();
      return characteristic.writeValueWithoutResponse(new TextEncoder().encode(`{"f":${data}}`));
    }, bleDelay - (performance.now() - lastBleSend));
  }

  function sendControl() {
    if (active && remote) {
      setTimeout(() => {
        lastBleSend = performance.now();
        characteristic.writeValueWithoutResponse(
          new TextEncoder().encode(`{"d":${distance * 1000},"a":${angle}}`),
        );
        requestAnimationFrame(sendControl);
      }, bleDelay - (performance.now() - lastBleSend));
    }
  }

  function toggleActive() {
    active = !active;
    sendFlags();
    if (active) {
      requestAnimationFrame(sendControl);
    }
  }

  function toggleMode() {
    remote = !remote;
    sendFlags();
  }

  function toggleFast() {
    fast = !fast;
    sendFlags();
  }

  function toggleLidarFront() {
    lidarFront = !lidarFront;
    sendFlags();
  }

  function toggleLidarSide() {
    lidarSide = !lidarSide;
    sendFlags();
  }

  function calibrate() {
    sendFlags(true, false);
  }

  function reset() {
    sendFlags(false, true);
  }

  function read() {
    characteristic.readValue().then((value) => {
      console.log(new TextDecoder().decode(value));
    });
  }

  if (browser) {
    if (
      (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) &&
      navigator.userAgent.includes('Safari')
    ) {
      window.location.href = `bluefy://open?url=${window.location.href}`;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      });
    connect = () => {
      navigator.bluetooth
        .requestDevice({
          filters: [{ services: [SERVICE_UUID] }],
        })
        .then((device) => {
          return device.gatt?.connect();
        })
        .then((server) => {
          return server?.getPrimaryService(SERVICE_UUID);
        })
        .then((service) => {
          return service?.getCharacteristic(CHARACTERISTIC_UUID);
        })
        .then((c) => {
          if (c) {
            return (characteristic = c);
          }
        });
    };
  }
</script>

<video bind:this={video} autoplay muted playsinline />
<div class="UI">
  <JoyStick bind:angle bind:distance />
  <button on:click={connect}>Connect</button>
  <button on:click={toggleActive}>Active</button>
  <button on:click={toggleFast}>Fast</button>
  <button on:click={toggleLidarFront}>Front</button>
  <button on:click={toggleLidarSide}>Side</button>
  <button on:click={toggleMode}>{remote ? 'Remote' : 'Ride'} mode now.</button>
  <button on:click={calibrate}>Calibrate</button>
  <button on:click={reset}>Reset</button>
  <button on:click={read}>Read</button>
</div>

<style lang="stylus">
  :global(html, body)
    margin 0
    overflow hidden
    touch-action manipulation
    background-color white

    @media (prefers-color-scheme dark)
      background-color black

  video
    position fixed
    top 0
    left 0
    width 100%
    height 100%
    // filter blur(10px)
    scale 1.05
    object-fit cover

  .UI
    position fixed
    top 0
    left 0
    width 100%
    height 100%
    padding-top calc(env(safe-area-inset-top) + 8.8vh)
    background-color #ddd5

    @media (prefers-color-scheme dark)
      background-color #4445
</style>
