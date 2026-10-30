/**
 * Bounded DOM scene -> compositor source image.
 *
 * A shared snapshot includes *all* painted DOM, not just a canvas or image.
 * Each lens gets an inert visual mirror of that snapshot inside a padded,
 * lens-sized paint viewport. CSS filter rasterizes the complete subtree into
 * SourceGraphic. This avoids foreignObject screenshot/CORS limitations.
 */
export interface ScenePaint {
  version: number;
  nodes: number;
  reason: "content" | "geometry";
}
export interface SceneMirrorOptions {
  frameRate?: number;
  onPaint: (paint: ScenePaint) => void;
}
export interface SceneMirror {
  setVisible(visible: boolean): void;
  updateGeometry(): void;
  destroy(): void;
}
interface Pair {
  source: Element;
  copy: Element;
}
interface Snapshot {
  root: HTMLElement;
  pairs: Pair[];
}
interface Sink {
  host: HTMLElement;
  surface: HTMLElement;
  pad: number;
  visible: boolean;
  pairs: Pair[];
  prefix: string;
  layered: boolean;
  geometryKey: string;
  ids: Map<string, string>;
  geometryElements: HTMLElement[];
  onPaint: SceneMirrorOptions["onPaint"];
}
const records = new WeakMap<HTMLElement, SceneRecord>();
let nextMirror = 0;
const OMIT =
  "script,style,link,iframe,object,embed,[data-liquid-glass],[data-glass-ignore],[data-glass-mirror]";
function copyAttributes(source: Element, copy: Element) {
  const safe = (name: string) =>
    !/^on/i.test(name) &&
    ![
      "style",
      "name",
      "autofocus",
      "form",
      "action",
      "formaction",
      "srcset",
      "sizes",
    ].includes(name);
  for (const attr of [...source.attributes])
    if (safe(attr.name)) {
      if (
        source instanceof HTMLVideoElement &&
        ["src", "poster", "controls", "autoplay", "loop"].includes(attr.name)
      )
        continue;
      copy.setAttribute(attr.name, attr.value);
    }
  for (const attr of [...copy.attributes]) {
    if (
      safe(attr.name) &&
      !source.hasAttribute(attr.name) &&
      !attr.name.startsWith("data-glass-") &&
      attr.name !== "tabindex"
    )
      copy.removeAttribute(attr.name);
  }
}
function syncPseudos(source: Element, copy: Element) {
  if (!(copy instanceof HTMLElement)) return;
  for (const pseudo of ["::before", "::after"] as const) {
    copy.querySelector(`:scope > [data-glass-generated="${pseudo}"]`)?.remove();
    const computed = getComputedStyle(source, pseudo);
    const content = computed.content;
    if (!content || content === "none" || content === "normal") continue;
    const span = document.createElement("span");
    span.dataset.glassGenerated = pseudo;
    let css = "";
    for (let i = 0; i < computed.length; i++) {
      const key = computed.item(i);
      css += `${key}:${computed.getPropertyValue(key)};`;
    }
    span.style.cssText = css;
    span.style.animation = "none";
    span.style.transition = "none";
    span.style.pointerEvents = "none";
    const attribute = /^attr\(([^)]+)\)$/.exec(content);
    span.textContent = attribute
      ? (source.getAttribute(attribute[1]) ?? "")
      : content.replace(/^["']|["']$/g, "");
    if (pseudo === "::before") copy.prepend(span);
    else copy.append(span);
  }
}
function transferPseudos(template: Element, copy: Element) {
  for (const child of [...copy.children])
    if (child.hasAttribute("data-glass-generated")) child.remove();
  for (const child of [...template.children]) {
    const pseudo = child.getAttribute("data-glass-generated");
    if (!pseudo) continue;
    if (pseudo === "::before") copy.prepend(child.cloneNode(true));
    else copy.append(child.cloneNode(true));
  }
}

function isOmitted(node: Element, root: HTMLElement) {
  return node !== root && Boolean(node.closest(OMIT));
}
function styleText(source: Element, pseudo?: "::before" | "::after") {
  const computed = getComputedStyle(source, pseudo);
  let text = "";
  for (let i = 0; i < computed.length; i++) {
    const key = computed.item(i);
    text += `${key}:${computed.getPropertyValue(key)};`;
  }
  return { text, computed };
}
function syncState(source: Element, copy: Element) {
  if (source instanceof HTMLInputElement && copy instanceof HTMLInputElement) {
    copy.value = source.value;
    copy.checked = source.checked;
    copy.indeterminate = source.indeterminate;
  } else if (
    source instanceof HTMLTextAreaElement &&
    copy instanceof HTMLTextAreaElement
  ) {
    copy.value = source.value;
    copy.textContent = source.value;
  } else if (
    source instanceof HTMLSelectElement &&
    copy instanceof HTMLSelectElement
  ) {
    for (let i = 0; i < source.options.length; i++) {
      if (copy.options[i])
        copy.options[i].selected = source.options[i].selected;
    }
  }
  if (source instanceof HTMLElement && copy instanceof HTMLElement) {
    copy.scrollLeft = source.scrollLeft;
    copy.scrollTop = source.scrollTop;
  }
}
function readStyles(source: Element, copy: Element) {
  if (!(copy instanceof HTMLElement || copy instanceof SVGElement)) return;
  const { text } = styleText(source);
  copy.style.cssText = text;
  // Freeze compositor animations at the sampled presentation value. The shared
  // scheduler updates animated nodes on the main thread for WebKit filters.
  copy.style.setProperty("animation", "none", "important");
  copy.style.setProperty("transition", "none", "important");
  copy.style.setProperty("pointer-events", "none", "important");
  if (source instanceof HTMLImageElement && copy instanceof HTMLImageElement) {
    copy.removeAttribute("srcset");
    copy.removeAttribute("sizes");
    copy.src = source.currentSrc || source.src;
    copy.loading = "eager";
  }
}
function copyMedia(source: Element, copy: Element) {
  if (!(copy instanceof HTMLCanvasElement)) return;
  if (!(
    source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement
  ))
    return;
  if (source instanceof HTMLVideoElement && source.readyState < 2) return;
  const width =
    source instanceof HTMLCanvasElement ? source.width : source.videoWidth;
  const height =
    source instanceof HTMLCanvasElement ? source.height : source.videoHeight;
  if (!width || !height) return;
  if (copy.width !== width) copy.width = width;
  if (copy.height !== height) copy.height = height;
  const context = copy.getContext("2d");
  if (!context) return;
  try {
    context.clearRect(0, 0, width, height);
    // No pixel readback: cross-origin media may taint this canvas, but ordinary
    // painted frames can still be displayed and filtered. Protected video can
    // remain unavailable, as with any browser capture technique.
    context.drawImage(source, 0, 0, width, height);
  } catch {
    copy.dataset.glassMediaUnavailable = "";
  }
}
/** Compare the first divergent stacking ancestors, then DOM paint order. */
function paintedBefore(a: HTMLElement, b: HTMLElement) {
  const path = (node: HTMLElement) => {
    const result: HTMLElement[] = [];
    for (
      let current: HTMLElement | null = node;
      current;
      current = current.parentElement
    )
      result.unshift(current);
    return result;
  };
  const left = path(a),
    right = path(b);
  let i = 0;
  while (left[i] && left[i] === right[i]) i++;
  const z = (nodes: HTMLElement[]) => {
    for (const node of nodes.slice(i)) {
      const style = getComputedStyle(node);
      if (style.zIndex !== "auto" && style.zIndex !== "")
        return Number(style.zIndex) || 0;
      if (
        style.isolation === "isolate" ||
        (style.transform && style.transform !== "none")
      )
        return 0;
    }
    return 0;
  };
  const difference = z(left) - z(right);
  return difference
    ? difference < 0
    : Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function lowerGlassLayers(root: HTMLElement, surface: HTMLElement) {
  const scene = root.closest("[data-glass-scene]");
  const area = surface.getBoundingClientRect();
  const coversSurface = (node: HTMLElement) => {
    if (!intersects(node.getBoundingClientRect(), area, 0)) return false;
    if (!node.hasAttribute("data-glass-atlas")) return true;
    // The atlas rectangle includes transparent gaps. Only its actual member
    // silhouettes can be lower glass; capturing an empty gap copies every
    // filter/mirror in the atlas into an otherwise unrelated small button.
    const owner = node.closest("[data-glass-atlas-root]");
    return [
      ...(owner?.querySelectorAll<HTMLElement>(
        '[data-glass-compositor="atlas"]',
      ) ?? []),
    ].some(
      (member) =>
        member.closest("[data-glass-atlas-root]") === owner &&
        !member.closest("[data-glass-mirror]") &&
        intersects(member.getBoundingClientRect(), area, 0),
    );
  };
  const layers = [
    ...(scene?.querySelectorAll<HTMLElement>("[data-liquid-glass]") ?? []),
  ].filter(
    (node) =>
      !node.closest("[data-glass-mirror]") &&
      node.closest("[data-glass-scene]") === scene &&
      node !== surface &&
      !node.contains(surface) &&
      !surface.contains(node) &&
      !node.parentElement?.closest("[data-liquid-glass]") &&
      coversSurface(node) &&
      paintedBefore(node, surface),
  );
  layers.sort((a, b) => (paintedBefore(a, b) ? -1 : 1));
  return layers;
}

/** Bounded DOM classification, performed on source paints rather than an idle timer. */
export function classifyGlassBackdrop(
  root: HTMLElement,
  surface: HTMLElement,
): "plain" | "image" | "content" {
  const area = surface.getBoundingClientRect();
  if (
    lowerGlassLayers(root, surface).some(
      (node) => !node.hasAttribute("data-glass-atlas"),
    )
  )
    return "content";
  const visible = (node: Element) => {
    if (!intersects(node.getBoundingClientRect(), area, 0)) return false;
    for (
      let current: Element | null = node;
      current && root.contains(current);
      current = current.parentElement
    ) {
      const style = getComputedStyle(current);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      )
        return false;
    }
    return true;
  };
  if ([...root.querySelectorAll("input,textarea,select,button")].some(visible))
    return "content";
  const text = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let visited = 0;
  while (text.nextNode()) {
    if (++visited > 256) return "content";
    const parent = text.currentNode.parentElement;
    if (
      text.currentNode.textContent?.trim() &&
      parent &&
      !parent.closest(
        "script,style,svg,[data-liquid-glass],[data-glass-ignore]",
      ) &&
      visible(parent)
    )
      return "content";
  }
  if ([...root.querySelectorAll("img,video,canvas")].some(visible))
    return "image";
  return "plain";
}

function buildSnapshot(root: HTMLElement, surface?: HTMLElement): Snapshot {
  const pairs: Pair[] = [];
  function clone(source: Node, composed = false): Node | null {
    if (!(source instanceof Element)) return source.cloneNode(false);
    if (
      composed
        ? source.matches(
            "script,style,link,iframe,object,embed,[data-glass-ignore]",
          )
        : isOmitted(source, root)
    )
      return null;
    let copy: Element;
    if (source instanceof HTMLVideoElement)
      copy = document.createElement("canvas");
    else if (source.localName.includes("-"))
      copy = document.createElement("div");
    else copy = source.cloneNode(false) as Element;
    for (const attr of [...copy.attributes]) {
      if (
        /^on/i.test(attr.name) ||
        ["name", "autofocus", "form", "action", "formaction"].includes(
          attr.name,
        )
      )
        copy.removeAttribute(attr.name);
    }
    if (copy instanceof HTMLElement) copy.setAttribute("tabindex", "-1");
    copyAttributes(source, copy);
    readStyles(source, copy);
    pairs.push({ source, copy });
    const assigned =
      source instanceof HTMLSlotElement
        ? source.assignedNodes({ flatten: true })
        : [];
    const children = assigned.length
      ? assigned
      : (source.shadowRoot?.childNodes ?? source.childNodes);
    if (!(
      source instanceof HTMLVideoElement || source instanceof HTMLCanvasElement
    )) {
      for (const child of [...children]) {
        const cloned = clone(child, composed);
        if (cloned) copy.appendChild(cloned);
      }
    }
    syncState(source, copy);
    copyMedia(source, copy);
    syncPseudos(source, copy);
    return copy;
  }
  const copy = clone(root) as HTMLElement;
  // Root layout is reproduced in its own scene coordinates, independent of
  // the lens wrapper, page scroll, and the root's original positioning.
  normalizeRoot(root, copy);
  if (surface) {
    const origin = root.getBoundingClientRect();
    // Copy already-composited lower lenses, including their filter definitions.
    // Never include this lens, its descendants, or an ancestor: no feedback loop.
    const layers = lowerGlassLayers(root, surface);
    for (const node of layers) {
      const layer = clone(node, true) as HTMLElement;
      const rect = node.getBoundingClientRect();
      Object.assign(layer.style, {
        position: "absolute",
        left: `${rect.left - origin.left}px`,
        top: `${rect.top - origin.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        transform: "none",
        zIndex: "auto",
      });
      layer.dataset.glassCapturedLayer = "";
      copy.append(layer);
    }
  }
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.setAttribute("inert", "");
  copy.dataset.glassMirror = "";
  return { root: copy, pairs };
}
function normalizeRoot(source: HTMLElement, copy: HTMLElement) {
  const rect = source.getBoundingClientRect();
  const width = source.offsetWidth || rect.width;
  const height = source.offsetHeight || rect.height;
  Object.assign(copy.style, {
    position: "relative",
    left: "0px",
    top: "0px",
    right: "auto",
    bottom: "auto",
    margin: "0px",
    width: `${width}px`,
    height: `${height}px`,
    minWidth: "0px",
    minHeight: "0px",
    maxWidth: "none",
    maxHeight: "none",
    boxSizing: "border-box",
    transform: "none",
    contentVisibility: "visible",
  });
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
}
function rewriteReferences(element: Element, ids: Map<string, string>) {
  for (const attr of [...element.attributes]) {
    let value = attr.value;
    if (attr.name === "id") value = ids.get(value) ?? value;
    else if (attr.name === "href" || attr.name === "xlink:href") {
      if (value.startsWith("#"))
        value = `#${ids.get(value.slice(1)) ?? value.slice(1)}`;
    } else if (attr.name === "for" || attr.name.startsWith("aria-")) {
      value = value
        .split(" ")
        .map((id) => ids.get(id) ?? id)
        .join(" ");
    }
    value = value.replace(
      /url\((['"]?)([^)]*?)#([\w:.-]+)\1\)/g,
      (match, quote, before, id) =>
        ids.has(id) ? `url(${quote}#${ids.get(id)}${quote})` : match,
    );
    if (value !== attr.value) element.setAttribute(attr.name, value);
  }
}
function installSnapshot(snapshot: Snapshot, sink: Sink) {
  const root = snapshot.root.cloneNode(true) as HTMLElement;
  const originals = [snapshot.root, ...snapshot.root.querySelectorAll("*")];
  const copies = [root, ...root.querySelectorAll("*")];
  const index = new Map(originals.map((element, i) => [element, i]));
  sink.pairs = snapshot.pairs.map((pair) => ({
    source: pair.source,
    copy: copies[index.get(pair.copy as HTMLElement)!],
  }));
  sink.ids.clear();
  for (const node of copies)
    if (node.id) sink.ids.set(node.id, `${sink.prefix}-${node.id}`);
  for (const node of copies) rewriteReferences(node, sink.ids);
  const suppress = document.createElement("style");
  suppress.textContent =
    "[data-glass-mirror]::before,[data-glass-mirror]::after,[data-glass-mirror] *::before,[data-glass-mirror] *::after{content:none!important;animation:none!important;}";
  root.prepend(suppress);
  sink.host.replaceChildren(root);
  for (const pair of sink.pairs) {
    syncState(pair.source, pair.copy);
    copyMedia(pair.source, pair.copy);
  }
}
function intersects(a: DOMRect, b: DOMRect, pad: number) {
  return (
    a.left < b.right + pad &&
    a.right > b.left - pad &&
    a.top < b.bottom + pad &&
    a.bottom > b.top - pad
  );
}

class SceneRecord {
  sinks = new Set<Sink>();
  snapshot: Snapshot | null = null;
  dirty = new Set<Element>();
  bounds = new WeakMap<Element, DOMRect>();
  rebuild = true;
  geometry = true;
  frame = 0;
  last = -Infinity;
  version = 0;
  observer: MutationObserver;
  ancestors: MutationObserver;
  layers: MutationObserver;
  resize: ResizeObserver;
  observedSizes = new Map<Element, { width: number; height: number }>();
  media: Element[] = [];
  animated = new Set<Element>();
  geometryMotion = false;
  active = true;
  constructor(
    public root: HTMLElement,
    public frameRate: number,
  ) {
    this.observer = new MutationObserver((mutations) => {
      this.markMutations(mutations);
      this.schedule();
    });
    this.observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    // Theme classes, inherited variables, and container layout can change
    // outside the source subtree without mutating any of its own nodes.
    this.ancestors = new MutationObserver(() => {
      this.rebuild = true;
      this.geometry = true;
      this.schedule();
    });
    for (let parent = root.parentElement; parent; parent = parent.parentElement)
      this.ancestors.observe(parent, { attributes: true });
    this.layers = new MutationObserver((mutations) => {
      const meaningful = mutations.some(({ target }) => {
        const node = target instanceof Element ? target : target.parentElement;
        return (
          node &&
          !root.contains(node) &&
          !node.closest("[data-glass-mirror-host],[data-glass-clip],svg") &&
          [...this.sinks].some(
            (sink) =>
              sink.visible &&
              sink.layered &&
              !sink.surface.contains(node) &&
              !node.contains(sink.surface),
          )
        );
      });
      if (!meaningful) return;
      this.rebuild = true;
      this.schedule();
    });
    const scene = root.closest("[data-glass-scene]");
    if (scene) {
      this.layers.observe(scene, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      scene.addEventListener("input", this.onLayerState, true);
      scene.addEventListener("change", this.onLayerState, true);
      scene.addEventListener("scroll", this.onLayerState, true);
    }
    this.resize = new ResizeObserver((entries) => {
      let changed = false;
      for (const { target } of entries) {
        const current = target.getBoundingClientRect();
        const previous = this.observedSizes.get(target);
        if (
          !previous ||
          previous.width !== current.width ||
          previous.height !== current.height
        )
          changed = true;
        this.observedSizes.set(target, {
          width: current.width,
          height: current.height,
        });
      }
      // A changed child can reflow siblings without mutating those siblings.
      // Resample layout styles together, preserving the existing mirror nodes.
      if (changed) {
        this.dirty.add(this.root);
        this.geometry = true;
        this.schedule();
      }
    });
    root.addEventListener("input", this.onState, true);
    root.addEventListener("change", this.onState, true);
    root.addEventListener("toggle", this.onState, true);
    root.addEventListener("load", this.onLoad, true);
    root.addEventListener("animationstart", this.onAnimation, true);
    root.addEventListener("transitionrun", this.onAnimation, true);
    root.addEventListener("play", this.onAnimation, true);
    root.addEventListener("pause", this.onState, true);
    root.addEventListener("seeked", this.onState, true);
    root.addEventListener("loadeddata", this.onLoad, true);
    root.addEventListener("pointerover", this.onPresentation, true);
    root.addEventListener("pointerout", this.onPresentation, true);
    root.addEventListener("focusin", this.onPresentation, true);
    root.addEventListener("focusout", this.onPresentation, true);
    root.addEventListener("scroll", this.onScroll, true);
    window.addEventListener("scroll", this.onWindowScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
    document.fonts?.addEventListener("loadingdone", this.onLoad);
  }
  onLayerState = (event: Event) => {
    const node = event.target;
    if (
      !(node instanceof Element) ||
      this.root.contains(node) ||
      node.closest("[data-glass-mirror-host]")
    )
      return;
    if (
      [...this.sinks].some(
        (sink) => sink.visible && sink.layered && !sink.surface.contains(node),
      )
    ) {
      this.rebuild = true;
      this.schedule();
    }
  };
  markMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      const element =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement;
      if (!element || isOmitted(element, this.root)) continue;
      if (
        mutation.type === "childList" ||
        mutation.type === "characterData" ||
        mutation.attributeName === "id"
      )
        this.rebuild = true;
      else this.dirty.add(element);
    }
  }
  get visible() {
    return (
      this.active &&
      !document.hidden &&
      [...this.sinks].some((sink) => sink.visible)
    );
  }
  onState = (event: Event) => {
    if (event.target instanceof Element && !isOmitted(event.target, this.root))
      this.dirty.add(event.target);
    this.schedule();
  };
  onPresentation = (event: Event) => {
    if (event.target instanceof Element && isOmitted(event.target, this.root))
      return;
    this.dirty.add(this.root);
    this.schedule();
  };
  onLoad = (event: Event) => {
    if (event.target instanceof Element && isOmitted(event.target, this.root))
      return;
    this.rebuild = true;
    this.schedule();
  };
  onScroll = (event: Event) => {
    if (event.target instanceof Element) {
      if (isOmitted(event.target, this.root)) return;
      this.dirty.add(event.target);
    }
    this.geometry = true;
    this.schedule();
  };
  onWindowScroll = (event: Event) => {
    if (event.target instanceof Element && isOmitted(event.target, this.root))
      return;
    this.geometry = true;
    this.schedule();
  };
  onResize = () => {
    this.rebuild = true;
    this.geometry = true;
    this.schedule();
  };
  onVisibility = () => {
    if (this.visible) {
      this.rebuild = true;
      this.geometry = true;
      this.schedule();
    } else this.cancel();
  };
  onAnimation = () => {
    this.findAnimations();
    this.schedule();
  };
  findAnimations() {
    this.animated.clear();
    for (const animation of this.root.getAnimations?.({ subtree: true }) ??
      []) {
      if (animation.playState !== "running") continue;
      const effect = animation.effect;
      const target =
        typeof KeyframeEffect !== "undefined" &&
        effect instanceof KeyframeEffect
          ? effect.target
          : null;
      if (target instanceof Element && !isOmitted(target, this.root))
        this.animated.add(target);
    }
  }
  schedule() {
    if (this.frame || !this.visible) return;
    this.frame = requestAnimationFrame(this.tick);
  }
  tick = (time: number) => {
    this.frame = 0;
    if (!this.visible) return;
    if (time - this.last + 0.5 < 1000 / this.frameRate) {
      this.schedule();
      return;
    }
    this.last = time;
    const previousAnimations = [...this.animated];
    this.findAnimations();
    // Sample the final presentation value once after an animation finishes.
    for (const target of previousAnimations) this.dirty.add(target);
    for (const target of this.animated) this.dirty.add(target);
    for (const target of this.media) {
      if (
        target instanceof HTMLCanvasElement ||
        (target instanceof HTMLVideoElement && !target.paused && !target.ended)
      )
        this.dirty.add(target);
    }
    const moving = [...this.sinks].some(
      (sink) =>
        sink.visible &&
        sink.geometryElements.some((element) =>
          element
            .getAnimations?.()
            .some((animation) => animation.playState === "running"),
        ),
    );
    if (moving || this.geometryMotion) this.geometry = true;
    this.geometryMotion = moving;
    this.flush();
    if (
      moving ||
      this.animated.size ||
      this.media.some(
        (element) =>
          element instanceof HTMLCanvasElement ||
          (element instanceof HTMLVideoElement &&
            !element.paused &&
            !element.ended),
      )
    )
      this.schedule();
  };
  geometryKey(sink: Sink) {
    const source = this.root.getBoundingClientRect();
    const lens = sink.surface.getBoundingClientRect();
    return [
      source.left,
      source.top,
      source.width,
      source.height,
      lens.left,
      lens.top,
      lens.width,
      lens.height,
      sink.surface.clientLeft,
      sink.surface.clientTop,
    ].join(":");
  }
  align(sink: Sink) {
    const scene = this.root.getBoundingClientRect();
    const surface = sink.surface.getBoundingClientRect();
    const x = scene.left - surface.left - sink.surface.clientLeft + sink.pad;
    const y = scene.top - surface.top - sink.surface.clientTop + sink.pad;
    sink.geometryKey = this.geometryKey(sink);
    Object.assign(sink.host.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${this.root.offsetWidth || scene.width}px`,
      height: `${this.root.offsetHeight || scene.height}px`,
    });
  }
  flush() {
    if (!this.visible || (!this.rebuild && !this.geometry && !this.dirty.size))
      return;
    const rebuilt = this.rebuild || !this.snapshot;
    if (rebuilt) {
      this.snapshot = buildSnapshot(this.root);
      // MutationObserver's subtree option does not cross shadow boundaries.
      // Reconnect to the currently captured open roots, releasing detached ones.
      this.observer.disconnect();
      this.observer.observe(this.root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      for (const { source } of this.snapshot.pairs)
        if (source.shadowRoot)
          this.observer.observe(source.shadowRoot, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
          });
      const elements = new Set(
        this.snapshot.pairs
          .map(({ source }) => source)
          .filter((source) => source instanceof HTMLElement),
      );
      for (const element of this.observedSizes.keys())
        if (!elements.has(element as HTMLElement)) {
          this.resize.unobserve(element);
          this.observedSizes.delete(element);
        }
      for (const element of elements)
        if (!this.observedSizes.has(element)) {
          const { width, height } = element.getBoundingClientRect();
          this.observedSizes.set(element, { width, height });
          this.resize.observe(element, { box: "border-box" });
        }
      this.media = this.snapshot.pairs
        .map((pair) => pair.source)
        .filter(
          (node) =>
            node instanceof HTMLCanvasElement ||
            node instanceof HTMLVideoElement,
        );
      this.findAnimations();
    }
    const dirty = [...this.dirty];
    const changes = new Map<
      Element,
      { previous?: DOMRect; current: DOMRect }
    >();
    const changedPairs = this.snapshot!.pairs.filter(
      (pair) =>
        rebuilt ||
        dirty.some(
          (target) => target === pair.source || target.contains(pair.source),
        ),
    );
    for (const pair of changedPairs) {
      changes.set(pair.source, {
        previous: this.bounds.get(pair.source),
        current: pair.source.getBoundingClientRect(),
      });
      if (!rebuilt) {
        copyAttributes(pair.source, pair.copy);
        readStyles(pair.source, pair.copy);
        syncState(pair.source, pair.copy);
        syncPseudos(pair.source, pair.copy);
      }
      this.bounds.set(pair.source, changes.get(pair.source)!.current);
    }
    if (!rebuilt) normalizeRoot(this.root, this.snapshot!.root);
    this.version++;
    const templates = new Map(
      this.snapshot!.pairs.map((pair) => [pair.source, pair.copy]),
    );
    for (const sink of [...this.sinks].sort((a, b) =>
      paintedBefore(a.surface, b.surface) ? -1 : 1,
    )) {
      if (!sink.visible) continue;
      // A lens-specific snapshot adds only glass painted beneath this surface.
      // Install in paint order so an upper lens receives the current lower image.
      const layered = lowerGlassLayers(this.root, sink.surface).length > 0;
      if (layered)
        installSnapshot(buildSnapshot(this.root, sink.surface), sink);
      else if (rebuilt || sink.layered || !sink.pairs.length)
        installSnapshot(this.snapshot!, sink);
      else
        for (const { source, copy } of sink.pairs) {
          if (!changes.has(source)) continue;
          const template = templates.get(source);
          if (template && copy instanceof Element) {
            copyAttributes(source, copy);
            copy.setAttribute("style", template.getAttribute("style") ?? "");
            transferPseudos(template, copy);
            if (
              source instanceof HTMLImageElement &&
              copy instanceof HTMLImageElement
            )
              copy.src = source.currentSrc || source.src;
            rewriteReferences(copy, sink.ids);
          }
          syncState(source, copy);
          copyMedia(source, copy);
        }
      sink.layered = layered;
      normalizeRoot(this.root, sink.host.firstElementChild as HTMLElement);
      const surface = sink.surface.getBoundingClientRect();
      const affectsLens =
        rebuilt ||
        this.geometry ||
        [...changes.values()].some(
          ({ previous, current }) =>
            intersects(current, surface, sink.pad + 24) ||
            (previous && intersects(previous, surface, sink.pad + 24)),
        );
      this.align(sink);
      sink.host.dataset.glassSceneVersion = String(this.version);
      sink.host.dataset.glassSceneNodes = String(this.snapshot!.pairs.length);
      if (affectsLens)
        sink.onPaint({
          version: this.version,
          nodes: this.snapshot!.pairs.length,
          reason: this.geometry ? "geometry" : "content",
        });
    }
    this.rebuild = false;
    this.geometry = false;
    this.dirty.clear();
  }
  cancel() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
  destroy() {
    this.active = false;
    this.cancel();
    this.observer.disconnect();
    this.ancestors.disconnect();
    this.layers.disconnect();
    const scene = this.root.closest("[data-glass-scene]");
    scene?.removeEventListener("input", this.onLayerState, true);
    scene?.removeEventListener("change", this.onLayerState, true);
    scene?.removeEventListener("scroll", this.onLayerState, true);
    this.resize.disconnect();
    this.root.removeEventListener("input", this.onState, true);
    this.root.removeEventListener("change", this.onState, true);
    this.root.removeEventListener("toggle", this.onState, true);
    this.root.removeEventListener("load", this.onLoad, true);
    this.root.removeEventListener("animationstart", this.onAnimation, true);
    this.root.removeEventListener("transitionrun", this.onAnimation, true);
    this.root.removeEventListener("play", this.onAnimation, true);
    this.root.removeEventListener("pause", this.onState, true);
    this.root.removeEventListener("seeked", this.onState, true);
    this.root.removeEventListener("loadeddata", this.onLoad, true);
    this.root.removeEventListener("pointerover", this.onPresentation, true);
    this.root.removeEventListener("pointerout", this.onPresentation, true);
    this.root.removeEventListener("focusin", this.onPresentation, true);
    this.root.removeEventListener("focusout", this.onPresentation, true);
    this.root.removeEventListener("scroll", this.onScroll, true);
    window.removeEventListener("scroll", this.onWindowScroll, true);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    document.fonts?.removeEventListener("loadingdone", this.onLoad);
  }
}

export function attachSceneMirror(
  root: HTMLElement,
  host: HTMLElement,
  surface: HTMLElement,
  pad: number,
  options: SceneMirrorOptions,
): SceneMirror {
  let record = records.get(root);
  if (!record) {
    const coarse =
      typeof matchMedia === "function" &&
      matchMedia("(pointer: coarse)").matches;
    const requested = options.frameRate;
    const frameRate =
      typeof requested === "number" && Number.isFinite(requested)
        ? Math.max(1, Math.min(60, requested))
        : coarse
          ? 30
          : 60;
    record = new SceneRecord(root, frameRate);
    records.set(root, record);
  }
  const geometryElements: HTMLElement[] = [];
  for (
    let element: HTMLElement | null = surface;
    element;
    element = element.parentElement
  )
    geometryElements.push(element);
  const sink: Sink = {
    host,
    surface,
    pad,
    visible: true,
    pairs: [],
    prefix: `glass-mirror-${++nextMirror}`,
    layered: false,
    geometryKey: "",
    ids: new Map(),
    geometryElements,
    onPaint: options.onPaint,
  };
  record.sinks.add(sink);
  record.rebuild = true;
  record.geometry = true;
  record.flush();
  const observer =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          sink.visible = entry.isIntersecting;
          if (sink.visible) {
            record!.rebuild = true;
            record!.geometry = true;
            record!.schedule();
          } else if (!record!.visible) record!.cancel();
        })
      : null;
  observer?.observe(surface);
  // Portaled dialogs and gesture-driven drawers can move without a React
  // render. Track their own style changes and active ancestor transitions.
  const geometryObserver = new MutationObserver(() => {
    record!.geometry = true;
    record!.schedule();
  });
  const wakeGeometry = (event: Event) => {
    if (
      !(event.target instanceof HTMLElement) ||
      !geometryElements.includes(event.target)
    )
      return;
    record!.geometry = true;
    record!.schedule();
  };
  for (const element of geometryElements) {
    geometryObserver.observe(element, {
      attributes: true,
      attributeFilter: ["style", "class", "data-state"],
    });
    element.addEventListener("transitionrun", wakeGeometry);
    element.addEventListener("animationstart", wakeGeometry);
  }
  record.schedule();
  let disposed = false;
  return {
    setVisible(value) {
      if (disposed) return;
      sink.visible = value;
      if (value) {
        record!.rebuild = true;
        record!.schedule();
      } else if (!record!.visible) record!.cancel();
    },
    updateGeometry() {
      if (disposed) return;
      if (sink.geometryKey === record!.geometryKey(sink)) return;
      record!.geometry = true;
      record!.flush();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      geometryObserver.disconnect();
      for (const element of geometryElements) {
        element.removeEventListener("transitionrun", wakeGeometry);
        element.removeEventListener("animationstart", wakeGeometry);
      }
      observer?.disconnect();
      record!.sinks.delete(sink);
      host.replaceChildren();
      if (!record!.sinks.size) {
        record!.destroy();
        records.delete(root);
      }
    },
  };
}

/** Call after imperative/WAAPI/canvas changes. Immediate mode mirrors a JS-driven
 * animation before the browser paints that frame, avoiding a frame of lag.
 */
export function invalidateGlassScene(
  root: HTMLElement | null,
  options: { target?: Element; immediate?: boolean } = {},
) {
  if (!root) return;
  const record = records.get(root);
  if (!record) return;
  if (options.target) record.dirty.add(options.target);
  else record.rebuild = true;
  record.findAnimations();
  if (
    options.immediate &&
    performance.now() - record.last + 0.5 >= 1000 / record.frameRate
  ) {
    record.markMutations(record.observer.takeRecords());
    for (const target of record.animated) record.dirty.add(target);
    for (const target of record.media) record.dirty.add(target);
    record.cancel();
    record.last = performance.now();
    record.flush();
    if (record.animated.size || record.media.length) record.schedule();
  } else record.schedule();
}
