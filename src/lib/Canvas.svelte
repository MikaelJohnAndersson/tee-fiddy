<script context="module" lang="ts">
  export function copyCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const { width, height } = canvas;
    const copy = document.createElement("canvas");
    copy.width = width;
    copy.height = height;
    return copy;
  }

  const hexToRgb = (h: string) => [
    ("0x" + h[1] + h[2]) | 0,
    ("0x" + h[3] + h[4]) | 0,
    ("0x" + h[5] + h[6]) | 0,
  ];
</script>

<script lang="ts">
  let width: number = 500;
  let height: number = 510;

  let canvas: HTMLCanvasElement;
  $: if (canvas) draw();
  export function getCanvas() {
    return canvas;
  }

  export let image: HTMLImageElement;
  $: if (image) draw();

  export function draw() {
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    const { naturalWidth: imgWidth, naturalHeight: imgHeight } = image;
    const { width: canvasWidth, height: canvasHeight } = canvas;

    ctx.save();
    // Reset scale and clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    ctx.setTransform(scale, 0, 0, scale, canvasWidth / 2, canvasHeight / 2);

    //const output = color ? _colorize(_img, color) : _img;
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    ctx.restore();
  }

  export function colorize(hex: string) {
    if (!canvas || !image) return;
    const { width, height } = canvas;

    // Create a grayscaled copy of the canvas to maintain shadows
    const c = copyCanvas(canvas);
    const ctx = c.getContext("2d");
    ctx.filter = "grayscale(1)";
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const rgb = hexToRgb(hex);

    // Convert to unitary values for calculations
    const _rgb = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];

    // Multiply grayscaled with rgb values
    let r: number, g: number, b: number;
    for (let i = 0; i < imgData.data.length; i += 4) {
      // Convert to unitary values for calculations
      r = imgData.data[i] / 255;
      g = imgData.data[i + 1] / 255;
      b = imgData.data[i + 2] / 255;

      imgData.data[i] = Math.floor(255 * r * _rgb[0]); // Red
      imgData.data[i + 1] = Math.floor(255 * g * _rgb[1]); // Green
      imgData.data[i + 2] = Math.floor(255 * b * _rgb[2]); // Blue
    }

    // Finally, apply colorized imagedata to canvas
    const rootCtx = canvas.getContext("2d");
    rootCtx.putImageData(imgData, 0, 0);
  }

  export function resize(width: number, height: number) {
    canvas.width = width;
    canvas.height = height;
  }
</script>

<canvas bind:this={canvas} {width} {height} />

<style>
  canvas {
    width: 100%;
    height: auto;
  }
</style>
