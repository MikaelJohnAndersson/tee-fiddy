export default function (node: HTMLElement, cb: Function) {
  const resizeObserver = new ResizeObserver(() => cb(node));

  resizeObserver.observe(node);

  return {
    destroy() {
      resizeObserver.unobserve(node);
    },
  };
}
