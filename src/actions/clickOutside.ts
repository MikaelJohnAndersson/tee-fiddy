/** Dispatch event on click outside of node */
export default (node: HTMLElement, cb: Function) => {
  const handleClickOutside = (event: Event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      cb();
    }
  };

  document.addEventListener("click", handleClickOutside, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClickOutside, true);
    },
  };
};
