/**
 * Teeny helpers for building DOM without a framework.
 */

type Attrs = Record<string, string | number | boolean | EventListener>;

/** Create an element with attributes/handlers and children. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === 'class') {
      node.className = String(value);
    } else if (typeof value === 'boolean') {
      if (value) node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Remove all children from a node. */
export function clear(node: HTMLElement): void {
  node.replaceChildren();
}

/** Briefly add a CSS class to trigger a one-shot animation, then remove it. */
export function pulse(node: HTMLElement, className: string, ms = 400): void {
  node.classList.remove(className);
  // Force reflow so re-adding the class restarts the animation.
  void node.offsetWidth;
  node.classList.add(className);
  window.setTimeout(() => node.classList.remove(className), ms);
}
