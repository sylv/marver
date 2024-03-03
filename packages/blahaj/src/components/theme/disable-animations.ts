/**
 * Disable all CSS transitions for a short period of time to prevent theme flicker.
 */
export const disableAnimations = () => {
  const css = document.createElement('style');
  css.type = 'text/css';
  console.warn(`Transitions disabled to prevent theme flicker.`);
  css.append(
    document.createTextNode(
      `* {
        transition: none !important;
      }`,
    ),
  );
  document.head.append(css);

  setTimeout(() => {
    css.remove();
    console.warn(`Transitions restored.`);
  }, 200);
};
