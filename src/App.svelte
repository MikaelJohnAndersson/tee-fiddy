<script context="module" lang="ts">
  async function loadImageFile(src: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  function downloadImageFromBlob(blob: Blob, filename: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }
</script>

<script lang="ts">
  import whiteTee from "./assets/tee_white.png";
  import blackTee from "./assets/tee_black.png";
  import GithubLogo from "./assets/github.svelte";
  import HelpCircle from "./assets/help-circle.svelte";
  import Select from "./lib/Select.svelte";
  import Canvas, { copyCanvas } from "./lib/Canvas.svelte";
  import { debounce } from "./utils";
  import clickOutside from "./actions/clickOutside";
  import resize from "./actions/resize";

  let rootCanvas: Canvas;
  let rootImage: HTMLImageElement;

  let selectedRootImgSrc: string;
  $: if (selectedRootImgSrc) {
    loadImageFile(selectedRootImgSrc)
      .then((img: HTMLImageElement) => (rootImage = img))
      .catch(console.error);
  }

  let selectedBaseColor: string = "#ffffff";
  const updateBaseColor = debounce((hex: string) => rootCanvas.colorize(hex));
  $: if (selectedBaseColor) updateBaseColor(selectedBaseColor);

  let overlayCanvas: Canvas;
  let overlayImage: HTMLImageElement;
  let overlayContainer: HTMLElement;
  let overlayIsActive = false;
  let overlayPosition: "top" | "center" | "bottom";

  let files: FileList;
  $: if (files && files[0]) {
    const src = URL.createObjectURL(files[0]);
    loadImageFile(src)
      .then((img: HTMLImageElement) => {
        overlayImage = img;
        overlayIsActive = true;
      })
      .catch(console.error);
  }

  function onResize(node: HTMLElement) {
    const { clientWidth, clientHeight } = node;
    overlayCanvas.resize(clientWidth, clientHeight);
  }

  function onSubmit() {
    // Create a temporary copied canvas from root canvas
    const _rootCanvas = rootCanvas.getCanvas();
    const c = copyCanvas(_rootCanvas);
    const ctx = c.getContext("2d");
    ctx.drawImage(_rootCanvas, 0, 0);

    // Get the overlay offsets in relation to the root canvas
    const _overlayCanvas = overlayCanvas.getCanvas();
    const { offsetLeft, offsetTop } = overlayContainer;
    // Draw the overlay on the temporary canvas
    ctx.drawImage(
      _overlayCanvas,
      offsetLeft,
      offsetTop,
      _overlayCanvas.width,
      _overlayCanvas.height
    );

    c.toBlob((blob) => downloadImageFromBlob(blob, "tee.png"));
  }
</script>

<header class="p-6 mb-4 flex justify-between">
  <div class="logo">Tee Fiddy</div>
  <a
    href="https://github.com/MikaelJohnAndersson/tee-fiddy"
    target="_blank"
    class="opacity-80 hover:opacity-100 transition-opacity"
  >
    <GithubLogo />
  </a>
</header>
<main class="w-fit m-auto flex flex-col md:flex-row gap-4">
  <div
    class="relative w-full h-full max-w-[500px] max-h-[510px] p-2 mb-4 bg-grid"
  >
    <span
      class="tooltip absolute right-0 top-0 m-2"
      data-tooltip="Adjust print layer size by dragging the bottom right corner of the print overlay."
      ><HelpCircle /></span
    >
    <Canvas bind:this={rootCanvas} image={rootImage} />
    {#if overlayImage}
      <div
        class={`overlay-container absolute left-0 right-0 w-1/2 h-1/2 max-w-full max-h-full m-auto overflow-hidden fixed-${overlayPosition}`}
        class:active={overlayIsActive}
        bind:this={overlayContainer}
        on:click={() => (overlayIsActive = true)}
        use:clickOutside={() => (overlayIsActive = false)}
        use:resize={onResize}
      >
        <Canvas bind:this={overlayCanvas} image={overlayImage} />
      </div>
    {/if}
  </div>
  <form
    on:submit|preventDefault={onSubmit}
    class="grid gap-4 grid-cols-1 w-fit"
  >
    <fieldset>
      <legend class="flex">Base</legend>
      <Select
        label="Variant"
        options={[
          { label: "White", value: whiteTee },
          { label: "Black", value: blackTee },
        ]}
        title="Tee base color"
        bind:value={selectedRootImgSrc}
      />
      <label>
        Color
        <input
          type="color"
          title="Optional color blend"
          bind:value={selectedBaseColor}
        />
      </label>
    </fieldset>
    <fieldset>
      <legend>Print</legend>
      <label>
        Image
        <input type="file" bind:files />
      </label>
      <Select
        label="Position"
        options={[
          { label: "Top", value: "top" },
          { label: "Center", value: "center" },
          { label: "Bottom", value: "bottom" },
        ]}
        bind:value={overlayPosition}
        title="Overlay center position"
      />
    </fieldset>
    <button type="submit" disabled={!overlayImage}>Download</button>
  </form>
</main>

<style>
  header .logo {
    font-family: "Bombing";
    font-size: 3rem;
    filter: var(--text-shadow);
  }

  .overlay-container.fixed-top {
    top: 0;
  }

  .overlay-container.fixed-center {
    top: 0;
    bottom: 0;
  }

  .overlay-container.fixed-bottom {
    bottom: 0;
  }

  .overlay-container:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.25);
    outline: 2px dashed rgba(192, 192, 192, 0.25);
  }

  .overlay-container.active {
    background-color: rgba(0, 0, 0, 0.25);
    outline: 2px dashed rgb(192, 192, 192);
    resize: both;
  }

  legend {
    font-size: 1.1rem;
    font-weight: 600;
  }
</style>
