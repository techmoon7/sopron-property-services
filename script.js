(() => {
  const phone = "+36 20 667 1832";
  const tel = "tel:+36206671832";
  const storageKey = "sps-lang";
  const supportedLanguages = [
    { code: "de", label: "Deutsch", short: "DE", html: "de", flag: "de", complete: "Vollständige Website" },
    { code: "hu", label: "Magyar", short: "HU", html: "hu", flag: "hu", complete: "Teljes weboldal" },
  ];
  const fallbackLanguage = "de";
  const languageCodes = new Set(supportedLanguages.map((language) => language.code));
  const assetBuildId = "card-row-fix-v1-2026-08-24-02";
  const paintDebugBuild = assetBuildId;
  const scriptBaseUrl = document.currentScript?.src || new URL("script.js", document.baseURI).href;
  try {
    window.dataLayer = window.dataLayer || [];
  } catch {
    /* Analytics is optional and must never block site interactions. */
  }
  const routePairs = {
    home: { de: "/", hu: "/hu/" },
    maintenance: { de: "/property-maintenance-sopron.html", hu: "/hu/ingatlan-karbantartas-sopron.html" },
    painting: { de: "/painting-wall-repairs-sopron.html", hu: "/hu/szobafestes-faljavitas-sopron.html" },
    garden: { de: "/garden-maintenance-sopron.html", hu: "/hu/kertfenntartas-sopron.html" },
    handyman: { de: "/handyman-services-sopron.html", hu: "/hu/ezermester-sopron.html" },
    cleaning: { de: "/cleaning-services-sopron.html", hu: "/hu/takaritas-sopron.html" },
    airbnb: { de: "/airbnb-property-maintenance-sopron.html", hu: "/hu/airbnb-karbantartas-sopron.html" },
    foreignOwners: {
      de: "/property-management-for-foreign-owners-sopron.html",
      hu: "/hu/ingatlankezeles-kulfoldi-tulajdonosoknak-sopron.html",
    },
  };
  const routeLookup = new Map();
  Object.entries(routePairs).forEach(([key, pair]) => {
    Object.entries(pair).forEach(([lang, href]) => routeLookup.set(href, { key, lang }));
  });
  routeLookup.set("/index.html", { key: "home", lang: "de" });
  routeLookup.set("/hu/index.html", { key: "home", lang: "hu" });

  const paintDebugError = (error) => ({
    name: error?.name || "Error",
    message: error?.message || String(error),
    stack: error?.stack || null,
  });

  const paintDebugPanelEnabled = () => /(?:^|[?&])paintDebug=1(?:&|$)/.test(window.location.search);

  const formatPaintDebugValue = (value) => {
    if (value === undefined || value === null || value === "") return "n/a";
    if (typeof value === "boolean") return value ? "yes" : "no";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const latestPaintDebugEvent = (debug, matcher) => {
    for (let index = debug.events.length - 1; index >= 0; index -= 1) {
      const event = debug.events[index];
      if (matcher(event)) return event;
    }
    return null;
  };

  const paintInputEventNames = [
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
  ];

  const createPaintInputCounts = () =>
    paintInputEventNames.reduce((counts, eventName) => {
      counts[eventName] = 0;
      return counts;
    }, {});

  const normalizePaintInputTrace = (trace = {}) => ({
    selectedInputMode: trace.selectedInputMode || "n/a",
    counts: {
      ...createPaintInputCounts(),
      ...(trace.counts || {}),
    },
    probeCounts: {
      window: {
        ...createPaintInputCounts(),
        ...(trace.probeCounts?.window || {}),
      },
      document: {
        ...createPaintInputCounts(),
        ...(trace.probeCounts?.document || {}),
      },
      "paint-root": {
        ...createPaintInputCounts(),
        ...(trace.probeCounts?.["paint-root"] || {}),
      },
      canvas: {
        ...createPaintInputCounts(),
        ...(trace.probeCounts?.canvas || {}),
      },
    },
    latestInput: trace.latestInput || null,
    latestProbe: trace.latestProbe || null,
    initialContact: trace.initialContact || null,
    latestEarlyReturn: trace.latestEarlyReturn || null,
    latestFunction: trace.latestFunction || "n/a",
    activeGestureCreated: trace.activeGestureCreated || false,
    beginPaintingEntered: trace.beginPaintingEntered || false,
    revealAtCalled: trace.revealAtCalled || false,
    canvasPixelsModified: trace.canvasPixelsModified || false,
    paintStartPipeline: trace.paintStartPipeline || null,
  });

  const formatPaintDebugNodeSummary = (node) => node?.summary || node?.target?.summary || "none";

  const formatPaintDebugStyle = (styles) => {
    if (!styles) return "n/a";
    return `pe:${formatPaintDebugValue(styles.pointerEvents)} ta:${formatPaintDebugValue(styles.touchAction)} z:${formatPaintDebugValue(styles.zIndex)} pos:${formatPaintDebugValue(styles.position)}`;
  };

  const serializePaintDebug = (debug) =>
    JSON.stringify(
      debug,
      (key, value) => {
        if (key === "panel") return undefined;
        if (typeof value === "function") return undefined;
        return value;
      },
      2
    );

  const paintDebugPlainText = (debug) =>
    [
      "Sopron Property Services paint diagnostics",
      `build: ${debug?.build || "n/a"}`,
      `url: ${window.location.href}`,
      `created: ${new Date().toISOString()}`,
      "",
      serializePaintDebug(debug),
    ].join("\n");

  const updatePaintInputTrace = (debug, entry) => {
    const trace = normalizePaintInputTrace(debug.inputTrace);
    const traceRelevantEvent =
      /^(pointer|touch|mouse|beginPainting|buildPaintMaterial|revealAt|canvas-pixels|active-gesture|finishInput|paint-start|paint-finish|paint-cancel|renderPaintedWall)/.test(
        entry.event || ""
      ) || entry.event?.endsWith("-early-return");
    if (traceRelevantEvent) trace.latestFunction = entry.event || "n/a";
    if (entry.inputMode) trace.selectedInputMode = entry.inputMode;

    const actualInput = entry.event?.match(
      /^(pointerdown|pointermove|pointerup|pointercancel|touchstart|touchmove|touchend|touchcancel)-received$/
    );
    if (actualInput) {
      trace.counts[actualInput[1]] = (trace.counts[actualInput[1]] || 0) + 1;
      trace.latestInput = entry;
      if ((actualInput[1] === "pointerdown" || actualInput[1] === "touchstart") && !trace.initialContact) {
        trace.initialContact = entry;
      }
    }

    const probeInput = entry.event?.match(
      /^input-probe-(window|document|paint-root|canvas)-(pointerdown|pointermove|pointerup|pointercancel|touchstart|touchmove|touchend|touchcancel)$/
    );
    if (probeInput) {
      const [, scope, eventName] = probeInput;
      trace.probeCounts[scope][eventName] = (trace.probeCounts[scope][eventName] || 0) + 1;
      trace.latestProbe = entry;
      if ((eventName === "pointerdown" || eventName === "touchstart") && !trace.initialContact) {
        trace.initialContact = entry;
      }
    }

    if (entry.event?.endsWith("-early-return")) trace.latestEarlyReturn = entry;
    if (entry.event === "active-gesture-state-created") trace.activeGestureCreated = true;
    if (entry.event === "beginPainting-entered" || entry.event === "paint-start") trace.beginPaintingEntered = true;
    if (entry.event === "revealAt-called") trace.revealAtCalled = true;
    if (entry.event === "canvas-pixels-modified") trace.canvasPixelsModified = true;
    if (entry.event === "paint-start-pipeline") trace.paintStartPipeline = entry;

    debug.inputTrace = trace;
  };

  const createPaintDebugPanel = (debug) => {
    if (!paintDebugPanelEnabled() || debug.panel?.isConnected) return;

    const panel = document.createElement("section");
    panel.id = "paintDebugPanel";
    panel.setAttribute("aria-label", "Paint diagnostics");
    panel.style.cssText = [
      "position:fixed",
      "right:max(8px, env(safe-area-inset-right))",
      "bottom:max(8px, env(safe-area-inset-bottom))",
      "z-index:2147483647",
      "width:min(360px, calc(100vw - 16px))",
      "max-height:min(56vh, 460px)",
      "overflow:auto",
      "padding:10px",
      "pointer-events:none",
      "border:1px solid rgba(255,255,255,.22)",
      "border-radius:14px",
      "background:rgba(10,24,18,.92)",
      "color:#fffaf2",
      "box-shadow:0 18px 50px rgba(0,0,0,.28)",
      "font:12px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      "-webkit-backdrop-filter:blur(14px)",
      "backdrop-filter:blur(14px)",
    ].join(";");
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <strong style="font:700 12px/1.2 system-ui,sans-serif;">Paint diagnostics</strong>
        <button type="button" data-paint-debug-copy style="appearance:none;border:0;border-radius:999px;background:#fffaf2;color:#102c21;padding:6px 9px;font:700 11px/1 system-ui,sans-serif;pointer-events:auto;">Copy diagnostics</button>
      </div>
      <dl data-paint-debug-fields style="display:grid;grid-template-columns:max-content minmax(0,1fr);gap:4px 8px;margin:0;"></dl>
      <div data-paint-debug-copy-state style="margin-top:7px;color:#d8f3dc;font:700 11px/1.25 system-ui,sans-serif;" aria-live="polite"></div>
    `;

    const copyButton = panel.querySelector("[data-paint-debug-copy]");
    const copyState = panel.querySelector("[data-paint-debug-copy-state]");
    copyButton?.addEventListener("click", async () => {
      const payload = paintDebugPlainText(window.__paintDebug);
      try {
        await navigator.clipboard.writeText(payload);
        copyState.textContent = "Diagnostics copied";
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = payload;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          copyState.textContent = "Diagnostics copied";
        } catch {
          copyState.textContent = "Copy failed";
        } finally {
          textarea.remove();
        }
      }
    });

    document.body.appendChild(panel);
    debug.panel = panel;
  };

  const updatePaintDebugPanel = (debug) => {
    if (!paintDebugPanelEnabled()) return;
    if (!debug.panel?.isConnected) {
      if (!document.body) return;
      createPaintDebugPanel(debug);
    }

    const latest = debug.latest || {};
    const component =
      latest.componentId && debug.components?.[latest.componentId]
        ? debug.components[latest.componentId]
        : Object.values(debug.components || {}).find(Boolean);
    const currentRoot =
      [...document.querySelectorAll("[data-paint-reveal]")].find(
        (root) => latest.componentId && root.dataset.paintDebugId === latest.componentId
      ) || document.querySelector("[data-paint-reveal]");
    const currentCanvas = currentRoot?.querySelector("canvas.paint-reveal-canvas");
    const currentImage = currentRoot?.querySelector("img");
    const currentCanvasRect = currentCanvas?.getBoundingClientRect();
    const currentImageRect = currentImage?.getBoundingClientRect();
    const liveSnapshot = {
      image: currentImage
        ? {
            complete: currentImage.complete,
            naturalWidth: currentImage.naturalWidth || 0,
            naturalHeight: currentImage.naturalHeight || 0,
            currentSrc: currentImage.currentSrc || currentImage.src || "",
            rect: currentImageRect
              ? {
                  width: Math.round(currentImageRect.width),
                  height: Math.round(currentImageRect.height),
                }
              : null,
          }
        : null,
      canvas: currentCanvas
        ? {
            cssWidth: Math.round(currentCanvasRect?.width || 0),
            cssHeight: Math.round(currentCanvasRect?.height || 0),
            backingWidth: currentCanvas.width,
            backingHeight: currentCanvas.height,
            ratio: currentCanvasRect?.width ? currentCanvas.width / currentCanvasRect.width : null,
            rect: currentCanvasRect
              ? {
                  left: Math.round(currentCanvasRect.left),
                  top: Math.round(currentCanvasRect.top),
                  width: Math.round(currentCanvasRect.width),
                  height: Math.round(currentCanvasRect.height),
                }
              : null,
          }
        : null,
      gesture: currentRoot
        ? {
            ready: currentRoot.classList.contains("paint-reveal-ready"),
            active: currentRoot.classList.contains("paint-reveal-active"),
            hit: currentRoot.classList.contains("paint-reveal-hit"),
            paintGesture: currentRoot.dataset.paintGesture || "",
          }
        : null,
    };
    const snapshot = {
      ...(latest.snapshot || component?.snapshot || {}),
      ...(liveSnapshot.image ? { image: { ...((latest.snapshot || component?.snapshot || {}).image || {}), ...liveSnapshot.image } } : {}),
      ...(liveSnapshot.canvas ? { canvas: { ...((latest.snapshot || component?.snapshot || {}).canvas || {}), ...liveSnapshot.canvas } } : {}),
      ...(liveSnapshot.gesture ? { gesture: { ...((latest.snapshot || component?.snapshot || {}).gesture || {}), ...liveSnapshot.gesture } } : {}),
    };
    const latestProbe = latestPaintDebugEvent(debug, (event) => event.event.startsWith("input-probe-"));
    const latestException = latestPaintDebugEvent(debug, (event) => event.event === "caught-exception");
    const decodeEvent = latestPaintDebugEvent(debug, (event) => event.event.startsWith("image-decode-"));
    const trace = normalizePaintInputTrace(debug.inputTrace);
    const latestInput = trace.latestInput || latestPaintDebugEvent(debug, (event) =>
      /^(?:pointerdown|pointermove|pointerup|pointercancel|touchstart|touchmove|touchend|touchcancel)-received$/.test(event.event)
    );
    const initialContact = trace.initialContact || latestInput || latestProbe;
    const latestSurface = latestInput?.surface || latestProbe || {};
    const latestPoint = latestInput || latestProbe || {};
    const probeCounts = trace.probeCounts || {};
    const actualCounts = trace.counts || {};
    const pointerCounts = `${formatPaintDebugValue(actualCounts.pointerdown)} / ${formatPaintDebugValue(actualCounts.pointermove)} / ${formatPaintDebugValue(actualCounts.pointerup)}`;
    const touchCounts = `${formatPaintDebugValue(actualCounts.touchstart)} / ${formatPaintDebugValue(actualCounts.touchmove)} / ${formatPaintDebugValue(actualCounts.touchend)}`;
    const documentPointerCounts = `${formatPaintDebugValue(probeCounts.document?.pointerdown)} / ${formatPaintDebugValue(probeCounts.document?.pointermove)} / ${formatPaintDebugValue(probeCounts.document?.pointerup)}`;
    const documentTouchCounts = `${formatPaintDebugValue(probeCounts.document?.touchstart)} / ${formatPaintDebugValue(probeCounts.document?.touchmove)} / ${formatPaintDebugValue(probeCounts.document?.touchend)}`;
    const overlayStack = latestSurface.elementsFromPoint || latestProbe?.elementsFromPoint || [];
    const topOverlay = overlayStack.find((item) => !item.isCanvas && !item.isImage && !item.isRoot) || overlayStack[0];

    const rows = {
      build: debug.build,
      stage: latest.event,
      "selected input": trace.selectedInputMode || currentRoot?.dataset.paintInputMode || component?.latest?.inputMode || component?.snapshot?.gesture?.activeInputFamily || "n/a",
      "handler ptr d/m/u": pointerCounts,
      "handler touch s/m/e": touchCounts,
      "doc ptr d/m/u": documentPointerCounts,
      "doc touch s/m/e": documentTouchCounts,
      "event target": formatPaintDebugNodeSummary(latestPoint.target),
      "initial hit": formatPaintDebugNodeSummary(initialContact?.elementFromPoint || initialContact?.target),
      "latest hit": formatPaintDebugNodeSummary(latestSurface.elementFromPoint || latestProbe?.elementFromPoint),
      pointerId: latestPoint.pointerId,
      pointerType: latestPoint.pointerType,
      isPrimary: latestPoint.isPrimary,
      buttons: latestPoint.buttons,
      "client x/y": `${formatPaintDebugValue(latestPoint.clientX)} / ${formatPaintDebugValue(latestPoint.clientY)}`,
      "beginPainting": trace.beginPaintingEntered,
      pipeline: trace.paintStartPipeline
        ? `${trace.paintStartPipeline.stage || trace.paintStartPipeline.pipelineStage || trace.paintStartPipeline.event}: ${trace.paintStartPipeline.reason || "ok"}`
        : "none",
      "early return": trace.latestEarlyReturn
        ? `${trace.latestEarlyReturn.stage || trace.latestEarlyReturn.event}: ${trace.latestEarlyReturn.reason || "n/a"}`
        : "none",
      "gesture created": trace.activeGestureCreated,
      "revealAt called": trace.revealAtCalled,
      "pixels modified": trace.canvasPixelsModified,
      "image.complete": snapshot.image?.complete,
      "image natural": `${formatPaintDebugValue(snapshot.image?.naturalWidth)} / ${formatPaintDebugValue(snapshot.image?.naturalHeight)}`,
      decode: decodeEvent?.event?.replace("image-decode-", "") || "pending",
      "canvas CSS": `${formatPaintDebugValue(snapshot.canvas?.cssWidth)} x ${formatPaintDebugValue(snapshot.canvas?.cssHeight)}`,
      "canvas backing": `${formatPaintDebugValue(snapshot.canvas?.backingWidth)} x ${formatPaintDebugValue(snapshot.canvas?.backingHeight)}`,
      dpr: `${formatPaintDebugValue(window.devicePixelRatio)} (ratio ${formatPaintDebugValue(snapshot.canvas?.ratio)})`,
      ready: snapshot.gesture?.ready ?? latest.ready,
      "active input": snapshot.gesture?.activeInputFamily,
      "latest input": latestInput ? `${latestInput.event} ${formatPaintDebugValue(latestInput.pointerType || latestInput.touchIdentifier || "")}` : "none",
      "hit target": latestProbe?.elementFromPoint?.summary || latestProbe?.target?.summary || "none",
      "probe scope": latestProbe?.scope || "none",
      "image style": formatPaintDebugStyle(latestSurface.imageComputed),
      "canvas style": formatPaintDebugStyle(latestSurface.canvasComputed || latestProbe?.canvasComputed),
      "wrapper style": formatPaintDebugStyle(latestSurface.wrapperComputed || latestSurface.rootComputed || latestProbe?.rootComputed || latestProbe?.paintRootComputed),
      "top overlay": `${formatPaintDebugNodeSummary(topOverlay)} ${formatPaintDebugStyle(topOverlay?.computed)}`,
      "latest function": trace.latestFunction || latest.event,
      exception: latestException?.error?.message || latestException?.source || "none",
    };

    const fields = debug.panel?.querySelector("[data-paint-debug-fields]");
    if (!fields) return;
    fields.innerHTML = Object.entries(rows)
      .map(
        ([label, value]) =>
          `<dt style="color:rgba(255,250,242,.72);font-weight:700;">${label}</dt><dd style="margin:0;min-width:0;overflow-wrap:anywhere;">${formatPaintDebugValue(value)}</dd>`
      )
      .join("");
  };

  const ensurePaintDebug = () => {
    const existing =
      window.__paintDebug && typeof window.__paintDebug === "object" ? window.__paintDebug : {};
    const events = Array.isArray(existing.events) ? existing.events : [];
    const components =
      existing.components && typeof existing.components === "object" ? existing.components : {};
    const debug = {
      ...existing,
      build: paintDebugBuild,
      loadedAt: existing.loadedAt || new Date().toISOString(),
      latest: existing.latest || null,
      events,
      components,
      inputTrace: normalizePaintInputTrace(existing.inputTrace),
      maxEvents: existing.maxEvents || 500,
    };

    debug.log = (event, details = {}) => {
      const entry = {
        event,
        build: paintDebugBuild,
        at: new Date().toISOString(),
        t: Math.round(window.performance?.now?.() || 0),
        path: window.location.pathname,
        ...details,
      };
      events.push(entry);
      while (events.length > debug.maxEvents) events.shift();
      debug.latest = entry;
      updatePaintInputTrace(debug, entry);
      if (entry.componentId) {
        components[entry.componentId] = {
          ...(components[entry.componentId] || {}),
          lastEvent: event,
          latest: entry,
          ...(entry.snapshot ? { snapshot: entry.snapshot } : {}),
        };
      }
      updatePaintDebugPanel(debug);
      return entry;
    };

    debug.clear = () => {
      events.length = 0;
      Object.keys(components).forEach((key) => delete components[key]);
      debug.latest = null;
      return true;
    };

    window.__paintDebug = debug;
    return debug;
  };

  const paintDebug = ensurePaintDebug();
  paintDebug.log("script-loaded", {
    href: window.location.href,
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    pointerCoarse: window.matchMedia?.("(pointer: coarse)")?.matches === true,
  });

  const describeGlobalPaintDebugNode = (node) => {
    if (!node) return { summary: "none" };
    if (node === window) return { summary: "window" };
    if (node === document) return { summary: "document" };
    if (node === document.documentElement) return { summary: "html", tag: "HTML" };
    if (node === document.body) return { summary: "body", tag: "BODY" };
    const tag = node.tagName || node.nodeName || "node";
    const id = node.id ? `#${node.id}` : "";
    const className =
      typeof node.className === "string"
        ? node.className.trim()
        : typeof node.getAttribute === "function"
          ? node.getAttribute("class") || ""
          : "";
    const classes = className
      ? `.${className
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 5)
          .join(".")}`
      : "";
    const paintRoot = typeof node.closest === "function" ? node.closest("[data-paint-reveal]") : null;
    return {
      summary: `${String(tag).toLowerCase()}${id}${classes}`,
      tag,
      id: node.id || "",
      className,
      role: typeof node.getAttribute === "function" ? node.getAttribute("role") || "" : "",
      href: typeof node.getAttribute === "function" ? node.getAttribute("href") || "" : "",
      dataPaintReveal: typeof node.hasAttribute === "function" ? node.hasAttribute("data-paint-reveal") : false,
      dataHeroLightbox: typeof node.hasAttribute === "function" ? node.hasAttribute("data-hero-lightbox") : false,
      dataPaintDebugId: paintRoot?.dataset.paintDebugId || "",
      insidePaintRoot: !!paintRoot,
    };
  };

  const globalPaintDebugPoint = (event) => {
    if (event.changedTouches?.length) {
      const touch = event.changedTouches[0];
      return { clientX: Math.round(touch.clientX), clientY: Math.round(touch.clientY) };
    }
    if (event.touches?.length) {
      const touch = event.touches[0];
      return { clientX: Math.round(touch.clientX), clientY: Math.round(touch.clientY) };
    }
    if (typeof event.clientX === "number" && typeof event.clientY === "number") {
      return { clientX: Math.round(event.clientX), clientY: Math.round(event.clientY) };
    }
    return { clientX: null, clientY: null };
  };

  const globalPaintDebugComputed = (node) => {
    if (!node || node === window || node === document || node.nodeType !== 1) return null;
    const rect = node.getBoundingClientRect();
    const styles = window.getComputedStyle(node);
    return {
      rect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      position: styles.position,
      zIndex: styles.zIndex,
      pointerEvents: styles.pointerEvents,
      touchAction: styles.touchAction,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
    };
  };

  const installGlobalPaintInputProbe = () => {
    if (!paintDebugPanelEnabled() || window.__paintGlobalInputProbeBound === true) return;
    window.__paintGlobalInputProbeBound = true;
    const logProbe = (scope) => (event) => {
      const point = globalPaintDebugPoint(event);
      const hit =
        point.clientX === null || point.clientY === null
          ? null
          : document.elementFromPoint(point.clientX, point.clientY);
      const hitStack =
        point.clientX === null || point.clientY === null || typeof document.elementsFromPoint !== "function"
          ? []
          : document.elementsFromPoint(point.clientX, point.clientY)
              .slice(0, 14)
              .map((node) => ({
                ...describeGlobalPaintDebugNode(node),
                computed: globalPaintDebugComputed(node),
              }));
      const paintRoot =
        hit && typeof hit.closest === "function"
          ? hit.closest("[data-paint-reveal]")
          : event.target && typeof event.target.closest === "function"
            ? event.target.closest("[data-paint-reveal]")
            : null;
      const canvas = paintRoot?.querySelector(".paint-reveal-canvas") || null;
      paintDebug.log(`input-probe-${scope}-${event.type}`, {
        scope,
        componentId: paintRoot?.dataset.paintDebugId || "",
        eventType: event.type,
        pointerId: event.pointerId,
        pointerType: event.pointerType || (event.type.startsWith("touch") ? "touch" : ""),
        clientX: point.clientX,
        clientY: point.clientY,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        target: describeGlobalPaintDebugNode(event.target),
        currentTarget: scope,
        currentTargetNode: describeGlobalPaintDebugNode(event.currentTarget),
        elementFromPoint: describeGlobalPaintDebugNode(hit),
        elementsFromPoint: hitStack,
        paintRoot: describeGlobalPaintDebugNode(paintRoot),
        canvas: describeGlobalPaintDebugNode(canvas),
        hitComputed: globalPaintDebugComputed(hit),
        paintRootComputed: globalPaintDebugComputed(paintRoot),
        canvasComputed: globalPaintDebugComputed(canvas),
        ready: paintRoot?.classList.contains("paint-reveal-ready") ?? false,
      });
    };
    const options = { capture: true, passive: true };
    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
      window.addEventListener(eventName, logProbe("window"), options);
      document.addEventListener(eventName, logProbe("document"), options);
    });
    ["touchstart", "touchmove", "touchend", "touchcancel"].forEach((eventName) => {
      window.addEventListener(eventName, logProbe("window"), options);
      document.addEventListener(eventName, logProbe("document"), options);
    });
    paintDebug.log("global-input-probe-installed", {
      scopes: ["window", "document"],
      events: paintInputEventNames,
    });
  };

  installGlobalPaintInputProbe();
  const uiText = {
    languageLabel: {
      hu: "Nyelv",
      en: "Language",
      de: "Sprache",
      uk: "Мова",
      "zh-CN": "语言",
    },
    languageBadge: {
      hu: "Elérhető magyarul és németül",
      de: "Verfügbar auf Deutsch und Ungarisch",
    },
    languageSelectorHint: {
      hu: "HU / DE",
      de: "HU / DE",
    },
    openLanguageMenu: {
      hu: "Nyelv kiválasztása",
      en: "Choose language",
      de: "Sprache auswählen",
      uk: "Вибрати мову",
      "zh-CN": "选择语言",
    },
    closeLanguageMenu: {
      hu: "Nyelvválasztó bezárása",
      en: "Close language selector",
      de: "Sprachauswahl schließen",
      uk: "Закрити вибір мови",
      "zh-CN": "关闭语言选择器",
    },
    menuOpen: {
      hu: "Menü megnyitása",
      en: "Open menu",
      de: "Menü öffnen",
      uk: "Відкрити меню",
      "zh-CN": "打开菜单",
    },
    menuClose: {
      hu: "Menü bezárása",
      en: "Close menu",
      de: "Menü schließen",
      uk: "Закрити меню",
      "zh-CN": "关闭菜单",
    },
    services: {
      hu: "Szolgáltatások",
      en: "Services",
      de: "Dienstleistungen",
      uk: "Послуги",
      "zh-CN": "服务",
    },
    servicesOverview: {
      hu: "Szolgáltatások áttekintése",
      en: "Services overview",
      de: "Leistungen im Überblick",
      uk: "Огляд послуг",
      "zh-CN": "服务概览",
    },
    copyPhone: {
      hu: "Telefonszám másolása",
      en: "Copy phone number",
      de: "Telefonnummer kopieren",
      uk: "Скопіювати номер телефону",
      "zh-CN": "复制电话号码",
    },
    callNow: {
      hu: "Hívás indítása",
      en: "Call now",
      de: "Jetzt anrufen",
      uk: "Зателефонувати",
      "zh-CN": "立即拨打",
    },
    phoneCopied: {
      hu: "Telefonszám másolva.",
      en: "Phone number copied.",
      de: "Telefonnummer kopiert.",
      uk: "Номер телефону скопійовано.",
      "zh-CN": "电话号码已复制。",
    },
    phoneFallback: {
      hu: `Telefonszám: ${phone}`,
      en: `Phone: ${phone}`,
      de: `Telefon: ${phone}`,
      uk: `Телефон: ${phone}`,
      "zh-CN": `电话：${phone}`,
    },
    detailsLabel: {
      hu: "Részletek +",
      en: "Details +",
      de: "Mehr erfahren +",
      uk: "Детальніше +",
      "zh-CN": "详情 +",
    },
    closeLabel: {
      hu: "Bezárás −",
      en: "Close −",
      de: "Schließen −",
      uk: "Закрити −",
      "zh-CN": "关闭 −",
    },
    compareBefore: {
      hu: "Előtte",
      en: "Before",
      de: "Vorher",
      uk: "До",
      "zh-CN": "之前",
    },
    compareAfter: {
      hu: "Utána",
      en: "After",
      de: "Nachher",
      uk: "Після",
      "zh-CN": "之后",
    },
    compareSliderName: {
      hu: "Előtte-utána összehasonlító csúszka",
      en: "Before and after comparison slider",
      de: "Vorher-Nachher-Vergleichsschieber",
      uk: "Повзунок порівняння до і після",
      "zh-CN": "前后对比滑块",
    },
    viewFullComparison: {
      hu: "Teljes összehasonlítás megnyitása",
      en: "View full comparison",
      de: "Vollständigen Vergleich ansehen",
      uk: "Переглянути повне порівняння",
      "zh-CN": "查看完整对比",
    },
    fullComparisonTitle: {
      hu: "Teljes előtte-utána összehasonlítás",
      en: "Full before and after comparison",
      de: "Vollständiger Vorher-Nachher-Vergleich",
      uk: "Повне порівняння до і після",
      "zh-CN": "完整前后对比",
    },
    fullComparisonDescription: {
      hu: "Húzza a választóvonalat, vagy használja a nyílbillentyűket. A képek illusztratív példák, a konkrét feladatot mindig a helyszín állapota alapján egyeztetjük.",
      en: "Drag the divider or use the arrow keys. Images are illustrative examples; the actual task is always agreed from the condition of the property.",
      de: "Ziehen Sie die Trennlinie oder verwenden Sie die Pfeiltasten. Die Bilder sind illustrative Beispiele; die konkrete Aufgabe wird immer anhand des Zustands der Immobilie abgestimmt.",
      uk: "Перетягніть розділювач або використовуйте клавіші зі стрілками. Зображення є ілюстративними прикладами; конкретне завдання завжди узгоджується за фактичним станом об’єкта.",
      "zh-CN": "拖动分隔线或使用方向键。图片为示意示例；具体工作始终根据物业实际状况确认。",
    },
    closeImage: {
      hu: "Kép bezárása",
      en: "Close image",
      de: "Bild schließen",
      uk: "Закрити зображення",
      "zh-CN": "关闭图片",
    },
    closeImageGallery: {
      hu: "Képgaléria bezárása",
      en: "Close image gallery",
      de: "Bildergalerie schließen",
      uk: "Закрити галерею зображень",
      "zh-CN": "关闭图片画廊",
    },
    previousImage: {
      hu: "Előző kép",
      en: "Previous image",
      de: "Vorheriges Bild",
      uk: "Попереднє зображення",
      "zh-CN": "上一张图片",
    },
    nextImage: {
      hu: "Következő kép",
      en: "Next image",
      de: "Nächstes Bild",
      uk: "Наступне зображення",
      "zh-CN": "下一张图片",
    },
  };
  const phraseRows = [
    ["Services", "Dienstleistungen", "Послуги", "服务"],
    ["Services overview", "Leistungen im Überblick", "Огляд послуг", "服务概览"],
    ["Clients", "Kunden", "Клієнти", "客户"],
    ["Work examples", "Arbeitsbeispiele", "Приклади робіт", "工作示例"],
    ["Images", "Bilder", "Зображення", "图片"],
    ["Contact", "Kontakt", "Контакт", "联系"],
    ["Maintenance", "Instandhaltung", "Обслуговування", "维护"],
    ["Painting & Wall Repairs", "Malerarbeiten & Wandreparaturen", "Фарбування та ремонт стін", "粉刷与墙面维修"],
    ["Garden Maintenance", "Gartenpflege", "Догляд за садом", "园艺维护"],
    ["Handyman", "Hausmeisterservice", "Майстер на дрібні роботи", "维修服务"],
    ["Cleaning", "Reinigung", "Прибирання", "清洁"],
    ["Airbnb Maintenance", "Airbnb-Instandhaltung", "Обслуговування Airbnb", "Airbnb 维护"],
    ["Owner Support", "Eigentümerbetreuung", "Підтримка власників", "业主支持"],
    ["Foreign owner property support", "Immobilienbetreuung für ausländische Eigentümer", "Підтримка нерухомості для іноземних власників", "海外业主物业支持"],
    ["Airbnb property maintenance", "Airbnb-Immobilieninstandhaltung", "Обслуговування нерухомості Airbnb", "Airbnb 物业维护"],
    ["Details +", "Mehr erfahren +", "Детальніше +", "详情 +"],
    ["Close −", "Schließen −", "Закрити −", "关闭 −"],
    ["Typical situation", "Typische Situation", "Типова ситуація", "典型情况"],
    ["Recommended next step", "Empfohlener nächster Schritt", "Рекомендований наступний крок", "建议的下一步"],
    ["Related service", "Passende Leistung", "Пов’язана послуга", "相关服务"],
    ["View example photos", "Beispielfotos ansehen", "Переглянути приклади фото", "查看示例照片"],
    ["Foreign owner", "Eigentümer im Ausland", "Власник за кордоном", "海外业主"],
    ["Airbnb turnover", "Airbnb-Gästewechsel", "Зміна гостей Airbnb", "Airbnb 换客"],
    ["After a tenant moves out", "Nach dem Auszug eines Mieters", "Після виїзду орендаря", "租客搬出后"],
    ["Property manager task list", "Aufgabenliste für die Immobilienverwaltung", "Список завдань для управителя нерухомості", "物业经理任务清单"],
    ["Neglected yard or garden", "Vernachlässigter Hof oder Garten", "Занедбаний двір або сад", "疏于维护的院子或花园"],
    ["Office or representative space before a visit", "Büro oder repräsentativer Bereich vor einem Besuch", "Офіс або представницький простір перед візитом", "访客到来前的办公室或接待空间"],
    ["The job can begin with photos and a short brief, so the owner can understand the situation even when they are not in Sopron.", "Der Auftrag kann mit Fotos und einer kurzen Beschreibung beginnen, damit der Eigentümer die Situation auch außerhalb von Sopron nachvollziehen kann.", "Роботу можна розпочати з фото та короткого опису, щоб власник розумів ситуацію навіть тоді, коли він не в Шопроні.", "工作可以从照片和简短说明开始，因此即使业主不在肖普朗，也能了解情况。"],
    ["Visible defects, wall marks and small repairs can be prioritised around the next arrival.", "Sichtbare Mängel, Wandspuren und kleine Reparaturen können passend zur nächsten Ankunft priorisiert werden.", "Помітні дефекти, сліди на стінах і дрібні ремонти можна пріоритезувати з урахуванням наступного приїзду.", "可根据下一次入住时间优先处理明显瑕疵、墙面痕迹和小修。"],
    ["Wall marks, minor damage, fittings and pre-handover touch-ups can be organised into one trackable scope.", "Wandspuren, kleinere Schäden, Montagen und Ausbesserungen vor der Übergabe können in einem nachvollziehbaren Umfang gebündelt werden.", "Сліди на стінах, дрібні пошкодження, кріплення та підготовчі виправлення перед передачею можна об’єднати в один зрозумілий обсяг.", "墙面痕迹、轻微损坏、安装事项和交付前修补可整理为一个可跟进的范围。"],
    ["Several small maintenance items can be handled in one coordination flow, reducing separate follow-ups and misunderstandings.", "Mehrere kleine Instandhaltungspunkte können in einem Abstimmungsablauf bearbeitet werden, wodurch Rückfragen und Missverständnisse reduziert werden.", "Кілька дрібних пунктів обслуговування можна вести в одному процесі координації, зменшуючи кількість окремих уточнень і непорозумінь.", "多个小型维护事项可在一个协调流程中处理，减少反复跟进和误解。"],
    ["Mowing, pruning and tidying paths can restore an orderly, presentable outdoor area.", "Mähen, Rückschnitt und das Ordnen von Wegen können den Außenbereich wieder gepflegt und präsentabel wirken lassen.", "Косіння, обрізка та впорядкування доріжок допомагають повернути зовнішній території доглянутий і презентабельний вигляд.", "割草、修剪和整理步道可以恢复户外区域整洁、可展示的状态。"],
    ["Minor wall repairs, painting and fittings can be scheduled around daily operations and access requirements.", "Kleinere Wandreparaturen, Malerarbeiten und Montagen können rund um den laufenden Betrieb und die Zugangsregeln geplant werden.", "Дрібний ремонт стін, фарбування та монтаж можна запланувати з урахуванням щоденної роботи й правил доступу.", "小型墙面维修、粉刷和安装可根据日常运营和进入要求安排。"],
    ["Cleaning and maintenance", "Reinigung und Instandhaltung", "Прибирання та обслуговування", "清洁与维护"],
    ["Handyman and property maintenance", "Hausmeisterservice und Immobilieninstandhaltung", "Майстер і обслуговування нерухомості", "维修服务与物业维护"],
    ["Painting, wall repairs and fittings", "Malerarbeiten, Wandreparaturen und Montagen", "Фарбування, ремонт стін і монтаж", "粉刷、墙面维修和安装"],
    ["Send a few overview photos, the Sopron address or area and access details. This makes it clear whether the task can start from photos or needs an on-site check.", "Senden Sie ein paar Übersichtsaufnahmen, die Soproner Adresse und die Zugangsinformationen. So wird klar, ob die Aufgabe anhand von Fotos starten kann oder eine Besichtigung vor Ort braucht.", "Надішліть кілька загальних фото, територію Шопрона та деталі доступу. Так буде зрозуміло, чи можна почати за фото, чи потрібна перевірка на місці.", "请发送几张整体照片、肖普朗所在区和进入方式。这样可以判断任务能否从照片开始，或是否需要现场查看。"],
    ["Share the next guest arrival time, send photos of visible issues and mark what is urgent.", "Teilen Sie die nächste Gästeankunft mit, senden Sie Fotos der sichtbaren Punkte und markieren Sie, was dringend ist.", "Повідомте час наступного прибуття гостя, надішліть фото видимих проблем і позначте термінові пункти.", "请告知下一位客人的到达时间，发送可见问题照片，并标明紧急事项。"],
    ["Send photos of the wall defects, the room and the handover deadline. From there we can clarify whether touch-up painting or a fuller refresh makes sense.", "Senden Sie Fotos der Wandmängel, des Raums und der Übergabefrist. Danach lässt sich klären, ob Ausbesserungsanstrich oder eine umfassendere Auffrischung sinnvoll ist.", "Надішліть фото дефектів стін, кімнати та строку передачі. Після цього можна уточнити, чи достатньо локального підфарбування, чи потрібне повніше оновлення.", "请发送墙面问题、房间和交付期限的照片。之后我们可以明确局部修补还是更完整翻新更合适。"],
    ["Prepare a short task list, attach photos and note who can approve any scope changes.", "Erstellen Sie eine kurze Aufgabenliste, fügen Sie Fotos hinzu und nennen Sie, wer Änderungen am Umfang freigeben kann.", "Підготуйте короткий список завдань, додайте фото й зазначте, хто може погоджувати зміни в обсязі.", "请准备简短任务清单、附上照片，并注明谁可以批准范围变化。"],
    ["Send outdoor photos, access details and any weather-sensitive deadline. This helps set a realistic schedule.", "Senden Sie Außenfotos, Zugangsinformationen und wetterabhängige Fristen. So lässt sich ein realistischer Zeitplan festlegen.", "Надішліть фото зовнішньої зони, деталі доступу та строки, які залежать від погоди. Це допоможе скласти реалістичний графік.", "请发送户外照片、进入方式和任何受天气影响的期限。这有助于制定现实的时间安排。"],
    ["Send photos of the details that matter before the visit, plus operating hours and access rules. The work can then be scheduled discreetly.", "Senden Sie Fotos der Details, die vor dem Besuch wichtig sind, sowie Betriebszeiten und Zugangsregeln. Die Arbeit kann dann diskret eingeplant werden.", "Надішліть фото важливих деталей перед візитом, а також робочий час і правила доступу. Тоді роботу можна запланувати непомітно.", "请发送访客到来前需要处理的细节照片，以及运营时间和进入规则。随后可低调安排工作。"],
    ["An illustrative before-and-after comparison showing the type of work and the expected result. Click or focus the slider, then drag the handle or use the arrow keys.", "Ein illustrativer Vorher-Nachher-Vergleich, der die Art der Arbeit und das erwartete Ergebnis zeigt. Klicken oder fokussieren Sie den Schieberegler, ziehen Sie dann den Griff oder nutzen Sie die Pfeiltasten.", "Ілюстративне порівняння до і після, яке показує тип роботи та очікуваний результат. Спочатку клацніть або сфокусуйте повзунок, потім перетягніть ручку чи використовуйте клавіші зі стрілками.", "用于展示工作类型和预期效果的示意性前后对比。请先点击或聚焦滑块，然后拖动手柄或使用方向键。"],
    ["What we do", "Leistungen", "Що ми робимо", "服务内容"],
    ["Process", "Ablauf", "Процес", "流程"],
    ["FAQ", "FAQ", "Поширені запитання", "常见问题"],
    ["Request a quote on WhatsApp", "Anfrage per WhatsApp senden", "Надіслати запит у WhatsApp", "通过 WhatsApp 询价"],
    ["Send photos on WhatsApp", "Fotos per WhatsApp senden", "Надіслати фото у WhatsApp", "通过 WhatsApp 发送照片"],
    ["View property maintenance", "Instandhaltung ansehen", "Переглянути обслуговування нерухомості", "查看物业维护"],
    ["Back to homepage", "Zurück zur Startseite", "Повернутися на головну", "返回首页"],
    ["Homepage contact section", "Kontaktbereich der Startseite", "Контактний розділ головної сторінки", "首页联系区域"],
    ["Next step", "Nächster Schritt", "Наступний крок", "下一步"],
    ["First step", "Erster Schritt", "Перший крок", "第一步"],
    ["Why choose Sopron Property Services?", "Warum Sopron Property Services?", "Чому Sopron Property Services?", "为什么选择 Sopron Property Services？"],
    ["Clear communication", "Klare Kommunikation", "Зрозуміла комунікація", "清晰沟通"],
    ["Organised workflow", "Strukturierter Ablauf", "Організований процес", "有序流程"],
    ["Sopron focus", "Fokus auf Sopron", "Фокус на Шопроні", "专注肖普朗"],
    ["Photo updates", "Foto-Updates", "Фотооновлення", "照片更新"],
    ["Hungarian and English communication", "Kommunikation auf Ungarisch und Deutsch", "Комунікація угорською та англійською", "匈牙利语和英语沟通"],
    ["Hungarian and English coordination", "Abstimmung auf Ungarisch und Deutsch", "Координація угорською та англійською", "匈牙利语和英语协调"],
    ["Property maintenance in Sopron", "Immobilieninstandhaltung in Sopron", "Обслуговування нерухомості в Шопроні", "肖普朗物业维护"],
    ["Handyman services in Sopron", "Hausmeister- und Reparaturservice in Sopron", "Послуги майстра в Шопроні", "肖普朗维修服务"],
    ["Painting and wall repairs in Sopron", "Malerarbeiten und Wandreparaturen in Sopron", "Фарбування та ремонт стін у Шопроні", "肖普朗粉刷与墙面维修"],
    ["Garden maintenance in Sopron", "Gartenpflege in Sopron", "Догляд за садом у Шопроні", "肖普朗园艺维护"],
    ["Cleaning services in Sopron", "Reinigungsservice in Sopron", "Послуги прибирання в Шопроні", "肖普朗清洁服务"],
    ["Property services in Sopron", "Immobiliendienstleistungen in Sopron", "Послуги для нерухомості в Шопроні", "肖普朗物业服务"],
    ["Professional Property Maintenance in Sopron", "Professionelle Immobilieninstandhaltung in Sopron", "Професійне обслуговування нерухомості в Шопроні", "肖普朗专业物业维护"],
    ["Fast, reliable maintenance, repairs and property management for homeowners, landlords, Airbnb hosts and international property owners.", "Schnelle, zuverlässige Instandhaltung, Reparaturen und Immobilienbetreuung für Hauseigentümer, Vermieter, Airbnb-Gastgeber und internationale Immobilieneigentümer.", "Швидке й надійне обслуговування, ремонт і підтримка управління нерухомістю для власників житла, орендодавців, Airbnb-господарів та міжнародних власників нерухомості.", "为房主、房东、Airbnb 房东和国际业主提供快速、可靠的维护、维修和物业管理支持。"],
    ["English-speaking service", "Deutschsprachiger Service", "Обслуговування англійською мовою", "英语服务"],
    ["Photo updates during every job", "Foto-Updates während jedes Auftrags", "Фотооновлення під час кожної роботи", "每项工作期间提供照片更新"],
    ["Fast response via WhatsApp", "Schnelle Antwort per WhatsApp", "Швидка відповідь через WhatsApp", "通过 WhatsApp 快速回复"],
    ["Get a Free Quote", "Kostenloses Angebot anfordern", "Отримати безкоштовну пропозицію", "获取免费报价"],
    ["Chat on WhatsApp", "Per WhatsApp schreiben", "Написати у WhatsApp", "通过 WhatsApp 咨询"],
    ["Send us a few photos and we'll tell you the best solution.", "Senden Sie uns ein paar Fotos, und wir nennen Ihnen die beste Lösung.", "Надішліть нам кілька фото, і ми підкажемо найкраще рішення.", "发给我们几张照片，我们会告诉您最合适的解决方案。"],
    ["Professional property maintenance in Sopron you can follow from anywhere.", "Professionelle Immobilieninstandhaltung in Sopron, die Sie von überall mitverfolgen können.", "Професійне обслуговування нерухомості в Шопроні, за яким можна стежити з будь-якого місця.", "可在任何地点跟进的肖普朗专业物业维护。"],
    ["Reliable Sopron property maintenance you can follow from anywhere.", "Zuverlässige Immobilieninstandhaltung in Sopron, die Sie von überall mitverfolgen können.", "Надійне обслуговування нерухомості в Шопроні, за яким можна стежити дистанційно.", "可靠的肖普朗物业维护，可远程跟进。"],
    ["Reliable handyman services in Sopron for practical property repairs.", "Zuverlässiger Hausmeisterservice in Sopron für praktische Reparaturen an Immobilien.", "Надійні послуги майстра в Шопроні для практичного ремонту нерухомості.", "肖普朗可靠维修服务，适用于实用型物业修理。"],
    ["Clean, well-prepared walls before rental, guest arrival or handover.", "Saubere, gut vorbereitete Wände vor Vermietung, Gästeankunft oder Übergabe.", "Чисті, добре підготовлені стіни перед орендою, приїздом гостей або передачею.", "出租、客人入住或交付前，让墙面整洁并准备充分。"],
    ["Well-kept gardens, courtyards and outdoor areas for Sopron properties.", "Gepflegte Gärten, Höfe und Außenbereiche für Immobilien in Sopron.", "Доглянуті сади, двори та зовнішні зони для нерухомості в Шопроні.", "为肖普朗物业维护整洁的花园、庭院和户外区域。"],
    ["Cleaning Services Sopron for apartments, Airbnb homes and offices.", "Reinigungsservice in Sopron für Wohnungen, Airbnb-Unterkünfte und Büros.", "Послуги прибирання в Шопроні для квартир, Airbnb-житла та офісів.", "肖普朗清洁服务，适用于公寓、Airbnb 房源和办公室。"],
    ["View visual work processes", "Bildbasierte Arbeitsabläufe ansehen", "Переглянути візуальні робочі процеси", "查看可视化工作流程"],
    ["Examples and process", "Beispiele und Ablauf", "Приклади та процес", "示例与流程"],
    ["One contact, a workflow you can follow", "Ein Ansprechpartner, ein nachvollziehbarer Ablauf", "Один контакт і процес, який можна відстежувати", "一个联系人，可跟进的工作流程"],
    ["Why it works", "Warum es funktioniert", "Чому це працює", "为什么有效"],
    ["Why it helps", "Warum es hilft", "Чим це корисно", "为什么有帮助"],
    ["What matters", "Worauf es ankommt", "Що важливо", "重点关注"],
    ["Photo update", "Foto-Update", "Фотооновлення", "照片更新"],
    ["2-3 photos", "2-3 Fotos", "2-3 фото", "2-3 张照片"],
    ["3-5 photos", "3-5 Fotos", "3-5 фото", "3-5 张照片"],
    ["Sopron address or area", "Adresse oder Gegend in Sopron", "Адреса або територія у Шопроні", "肖普朗地址或所在区"],
    ["Deadline", "Frist", "Термін", "截止时间"],
    ["Access", "Zugang", "Доступ", "进入方式"],
    ["Timing", "Zeitplanung", "Часові рамки", "时间安排"],
    ["Primary service area: Sopron and nearby locations. Hungarian and English communication.", "Hauptgebiet: Sopron und nahe Umgebung. Kommunikation auf Ungarisch und Deutsch.", "Основна зона обслуговування: Шопрон і найближчі території. Комунікація угорською та англійською.", "主要服务区域：肖普朗及周边地区。可用匈牙利语和英语沟通。"],
    ["A short message is enough: photos, location and timing. Primary service area: Sopron and nearby locations.", "Eine kurze Nachricht genügt: Fotos, Standort und Zeitrahmen. Hauptgebiet: Sopron und Umgebung.", "Достатньо короткого повідомлення: фото, місце та терміни. Основна зона: Шопрон і околиці.", "简短信息即可：照片、位置和时间。主要服务区域为肖普朗及周边。"],
    ["Send a few photos and let’s clarify the next practical step.", "Senden Sie ein paar Fotos, dann klären wir den nächsten sinnvollen Schritt.", "Надішліть кілька фото, і ми уточнимо наступний практичний крок.", "发送几张照片，我们会明确下一步实际可行的方案。"],
    ["Send a few photos of the property and let us clarify the right cleaning scope.", "Senden Sie ein paar Fotos der Immobilie, damit wir den passenden Reinigungsumfang klären können.", "Надішліть кілька фото нерухомості, і ми уточнимо потрібний обсяг прибирання.", "发送几张物业照片，我们会明确合适的清洁范围。"],
    ["Send a few photos, and we will clarify what should realistically be done before painting.", "Senden Sie ein paar Fotos, dann klären wir realistisch, was vor dem Streichen zu tun ist.", "Надішліть кілька фото, і ми реалістично уточнимо, що потрібно зробити перед фарбуванням.", "发送几张照片，我们会实际评估粉刷前需要完成的工作。"],
    ["Send a few photos of the outdoor area, and we will clarify the realistic next step.", "Senden Sie ein paar Fotos des Außenbereichs, dann klären wir den realistischen nächsten Schritt.", "Надішліть кілька фото зовнішньої зони, і ми уточнимо реалістичний наступний крок.", "发送几张户外区域照片，我们会明确实际下一步。"],
    ["Send a few photos and let us clarify the right cleaning scope.", "Senden Sie ein paar Fotos, damit wir den passenden Reinigungsumfang klären können.", "Надішліть кілька фото, і ми уточнимо потрібний обсяг прибирання.", "发送几张照片，我们会明确合适的清洁范围。"],
    ["The images on this website are illustrative examples showing typical work processes and expected results.", "Die Bilder auf dieser Website sind illustrative Beispiele für typische Arbeitsabläufe und erwartbare Ergebnisse.", "Зображення на цьому сайті є ілюстративними прикладами типових робочих процесів і очікуваних результатів.", "本网站图片为示意示例，展示典型工作流程和预期效果。"],
    ["What can property maintenance include?", "Was kann die Immobilieninstandhaltung umfassen?", "Що може входити в обслуговування нерухомості?", "物业维护可以包括哪些内容？"],
    ["What handyman tasks can we help with?", "Bei welchen kleineren Reparaturen können wir helfen?", "З якими дрібними ремонтними роботами ми можемо допомогти?", "我们可以协助哪些维修事项？"],
    ["What painting and wall repair work can we help with?", "Bei welchen Maler- und Wandreparaturarbeiten können wir helfen?", "З якими роботами з фарбування та ремонту стін ми можемо допомогти?", "我们可以协助哪些粉刷和墙面维修工作？"],
    ["What garden maintenance work can we help with?", "Bei welcher Gartenpflege können wir helfen?", "З якими роботами з догляду за садом ми можемо допомогти?", "我们可以协助哪些园艺维护工作？"],
    ["What cleaning work can we help with?", "Welche Reinigungsarbeiten können wir übernehmen?", "З яким прибиранням ми можемо допомогти?", "我们可以协助哪些清洁工作？"],
    ["How the process works", "So funktioniert der Ablauf", "Як працює процес", "服务流程"],
    ["Step-by-step process", "Schritt-für-Schritt-Ablauf", "Покроковий процес", "分步流程"],
    ["Photos and short brief", "Fotos und kurze Beschreibung", "Фото та короткий опис", "照片和简要说明"],
    ["Task list and next step", "Aufgabenliste und nächster Schritt", "Список завдань і наступний крок", "任务清单和下一步"],
    ["Scope clarification", "Klärung des Umfangs", "Уточнення обсягу робіт", "明确工作范围"],
    ["Organised work", "Organisierte Ausführung", "Організоване виконання", "有序施工"],
    ["Organised cleaning", "Organisierte Reinigung", "Організоване прибирання", "有序清洁"],
    ["Photo update and handover", "Foto-Update und Übergabe", "Фотооновлення та передача", "照片更新与交付"],
    ["Photos and next step", "Fotos und nächster Schritt", "Фото та наступний крок", "照片和下一步"],
    ["Who we support and when it helps", "Wen wir unterstützen und wann es hilft", "Кому ми допомагаємо і коли це корисно", "我们服务的人群和适用场景"],
    ["Who we help", "Wem wir helfen", "Кому ми допомагаємо", "我们帮助谁"],
    ["Owners living abroad", "Eigentümer im Ausland", "Власники, які живуть за кордоном", "居住在国外的业主"],
    ["Foreign owners", "Ausländische Eigentümer", "Іноземні власники", "外国业主"],
    ["Airbnb hosts and apartment investors", "Airbnb-Gastgeber und Wohnungsinvestoren", "Airbnb-господарі та інвестори в квартири", "Airbnb 房东和公寓投资者"],
    ["Airbnb hosts", "Airbnb-Gastgeber", "Airbnb-господарі", "Airbnb 房东"],
    ["Offices, cross-border businesses and commercial properties", "Büros, grenzüberschreitende Unternehmen und Gewerbeimmobilien", "Офіси, транскордонний бізнес та комерційна нерухомість", "办公室、跨境企业和商业物业"],
    ["Private homeowners and apartment owners", "Private Haus- und Wohnungseigentümer", "Власники приватних будинків і квартир", "私人住宅和公寓业主"],
    ["Property managers", "Immobilienverwalter", "Керуючі нерухомістю", "物业经理"],
    ["Office refresh", "Büroauffrischung", "Оновлення офісу", "办公室翻新"],
    ["Apartment upkeep", "Wohnungspflege", "Догляд за квартирою", "公寓维护"],
    ["Courtyard and garden", "Hof und Garten", "Двір і сад", "庭院和花园"],
    ["Regular condition checks", "Regelmäßige Zustandskontrollen", "Регулярні перевірки стану", "定期状况检查"],
    ["Minor repairs and preventive maintenance", "Kleinreparaturen und vorbeugende Instandhaltung", "Дрібний ремонт і профілактичне обслуговування", "小修与预防性维护"],
    ["Painting and wall touch-ups", "Malerarbeiten und Wandausbesserungen", "Фарбування та локальний ремонт стін", "粉刷和墙面修补"],
    ["Drywall and practical repairs", "Trockenbau und praktische Reparaturen", "Гіпсокартон і практичний ремонт", "石膏板和实用维修"],
    ["Garden, courtyard and outdoor care", "Garten-, Hof- und Außenpflege", "Догляд за садом, двором і зовнішніми зонами", "花园、庭院和户外维护"],
    ["Photo updates and reporting", "Foto-Updates und Berichterstattung", "Фотооновлення та звітність", "照片更新和汇报"],
    ["Small apartment repairs", "Kleine Wohnungsreparaturen", "Дрібний ремонт у квартирі", "公寓小修"],
    ["Furniture assembly and adjustment", "Möbelmontage und Anpassung", "Складання та регулювання меблів", "家具组装和调整"],
    ["Shelves, curtain rails and fittings", "Regale, Gardinenstangen und Befestigungen", "Полиці, карнизи та кріплення", "搁板、窗帘杆和固定件"],
    ["Door, handle and lock-area fixes", "Reparaturen an Türen, Griffen und Schlossbereichen", "Ремонт дверей, ручок і зон біля замків", "门、把手和锁具周边维修"],
    ["Wall repairs and touch-ups", "Wandreparaturen und Ausbesserungen", "Ремонт і підфарбування стін", "墙面维修和修补"],
    ["Airbnb and owner support", "Unterstützung für Airbnb und Eigentümer", "Підтримка Airbnb і власників", "Airbnb 和业主支持"],
    ["Interior repainting", "Innenanstrich", "Фарбування інтер’єру", "室内重新粉刷"],
    ["Crack repair and patching", "Rissreparatur und Ausbesserung", "Ремонт тріщин і шпаклювання", "裂缝修补和局部修复"],
    ["Plastering and surface preparation", "Spachteln und Untergrundvorbereitung", "Штукатурка та підготовка поверхонь", "抹灰和表面准备"],
    ["Rental and Airbnb refresh", "Auffrischung für Miet- und Airbnb-Objekte", "Оновлення для оренди та Airbnb", "出租房和 Airbnb 翻新"],
    ["Minor cosmetic repairs", "Kleine kosmetische Reparaturen", "Дрібний косметичний ремонт", "轻微外观修复"],
    ["Clean handover", "Saubere Übergabe", "Чиста передача", "整洁交付"],
    ["Lawn mowing and edging", "Rasenmähen und Kantenschnitt", "Косіння газону та обробка країв", "修剪草坪和边缘"],
    ["Hedge trimming and shrub pruning", "Heckenschnitt und Strauchschnitt", "Стрижка живоплоту та обрізка кущів", "修剪树篱和灌木"],
    ["Weed removal and outdoor tidying", "Unkrautentfernung und Außenordnung", "Видалення бур’янів і прибирання зовнішніх зон", "除草和户外整理"],
    ["Seasonal cleanup", "Saisonale Reinigung", "Сезонне прибирання", "季节性清理"],
    ["Airbnb and rental outdoor presentation", "Außenbereiche für Airbnb und Vermietung", "Зовнішній вигляд для Airbnb та оренди", "Airbnb 和出租物业户外呈现"],
    ["Scheduled visits and photo updates", "Geplante Einsätze und Foto-Updates", "Заплановані візити та фотооновлення", "预约上门和照片更新"],
    ["Regular apartment cleaning", "Regelmäßige Wohnungsreinigung", "Регулярне прибирання квартири", "定期公寓清洁"],
    ["Deep cleaning", "Grundreinigung", "Генеральне прибирання", "深度清洁"],
    ["Move-in and move-out cleaning", "Einzugs- und Auszugsreinigung", "Прибирання перед заселенням і після виїзду", "入住和退房清洁"],
    ["Airbnb turnover cleaning", "Airbnb-Wechselreinigung", "Прибирання між гостями Airbnb", "Airbnb 换客清洁"],
    ["Office cleaning", "Büroreinigung", "Прибирання офісів", "办公室清洁"],
    ["After renovation cleaning", "Reinigung nach Renovierung", "Прибирання після ремонту", "装修后清洁"],
    ["Property preparation before guests", "Vorbereitung der Immobilie vor Gästen", "Підготовка нерухомості перед гостями", "客人到达前的物业准备"],
    ["Cleaning services FAQ", "FAQ zu Reinigungsleistungen", "Поширені запитання про прибирання", "清洁服务常见问题"],
    ["Property maintenance FAQ", "FAQ zur Immobilieninstandhaltung", "Поширені запитання про обслуговування нерухомості", "物业维护常见问题"],
    ["Handyman services FAQ", "FAQ zum Hausmeisterservice", "Поширені запитання про послуги майстра", "维修服务常见问题"],
    ["Painting and wall repair FAQ", "FAQ zu Malerarbeiten und Wandreparaturen", "Поширені запитання про фарбування та ремонт стін", "粉刷与墙面维修常见问题"],
    ["Garden maintenance FAQ", "FAQ zur Gartenpflege", "Поширені запитання про догляд за садом", "园艺维护常见问题"],
    ["Do you work with owners living abroad?", "Arbeiten Sie mit Eigentümern im Ausland?", "Чи працюєте ви з власниками, які живуть за кордоном?", "你们为居住在国外的业主服务吗？"],
    ["Is English communication available?", "Ist Kommunikation auf Deutsch möglich?", "Чи доступна комунікація англійською?", "可以用英语沟通吗？"],
    ["Do you send photos of the work?", "Senden Sie Fotos der Arbeiten?", "Чи надсилаєте ви фото виконаних робіт?", "你们会发送工作照片吗？"],
    ["How do I request a quote?", "Wie kann ich ein Angebot anfragen?", "Як запросити пропозицію?", "如何询价？"],
    ["Do you handle urgent work?", "Übernehmen Sie dringende Arbeiten?", "Чи виконуєте ви термінові роботи?", "可以处理紧急工作吗？"],
    ["Can I arrange cleaning while I am abroad?", "Kann ich die Reinigung aus dem Ausland organisieren?", "Чи можу я організувати прибирання, перебуваючи за кордоном?", "我在国外也可以安排清洁吗？"],
    ["Do you offer regular apartment cleaning?", "Bieten Sie regelmäßige Wohnungsreinigung an?", "Чи пропонуєте регулярне прибирання квартир?", "你们提供定期公寓清洁吗？"],
    ["Do you handle Airbnb turnover cleaning?", "Übernehmen Sie Airbnb-Wechselreinigungen?", "Чи виконуєте прибирання між гостями Airbnb?", "你们做 Airbnb 换客清洁吗？"],
    ["Do you clean offices?", "Reinigen Sie auch Büros?", "Чи прибираєте ви офіси?", "你们清洁办公室吗？"],
  ];
  const phraseTranslations = Object.fromEntries(
    phraseRows.map(([en, de, uk, zh]) => [en, { de, uk, "zh-CN": zh }])
  );

  const supplementalPhraseTranslations =   {
      "Painting, wall and drywall repair, small maintenance jobs and garden care for foreign owners, Airbnb hosts, property managers, offices and representative properties. Hungarian and English communication, photo updates and an organised workflow in Sopron.": {
          "de": "Malerarbeiten, Wand- und Trockenbaureparaturen, kleinere Instandhaltungsarbeiten und Gartenpflege für ausländische Eigentümer, Airbnb-Gastgeber, Immobilienverwalter, Büros und repräsentative Immobilien. Ungarische und deutsche Kommunikation, Foto-Updates und ein organisierter Ablauf in Sopron.",
          "uk": "Фарбування, ремонт стін і гіпсокартону, дрібні роботи з обслуговування та догляд за садом для іноземних власників, Airbnb-господарів, керуючих нерухомістю, офісів і представницьких об'єктів. Комунікація угорською й англійською, фотозвіти та організований робочий процес у Шопроні.",
          "zh-CN": "为外国业主、Airbnb 房东、物业管理者、办公室和代表性物业提供粉刷、墙面和石膏板维修、小型维护以及庭院养护。支持匈牙利语和英语沟通、照片更新，并在肖普朗以有序流程推进。"
      },
      "A reliable maintenance partner for owners living abroad, apartment investors, Airbnb hosts, offices and representative properties in Sopron. Minor repairs, painting, drywall work, garden care, photo updates and Hungarian-English coordination, handled through a clear workflow.": {
          "de": "Ein verlässlicher Wartungspartner für Eigentümer im Ausland, Wohnungsinvestoren, Airbnb-Gastgeber, Büros und repräsentative Immobilien in Sopron. Kleinere Reparaturen, Malerarbeiten, Trockenbau, Gartenpflege, Fotoberichte und ungarisch-deutsche Abstimmung in einem klaren Ablauf.",
          "uk": "Надійний партнер з обслуговування для власників за кордоном, інвесторів у квартири, Airbnb-господарів, офісів і представницьких об'єктів у Шопроні. Дрібні ремонти, фарбування, гіпсокартон, догляд за садом, фотозвіти та узгодження угорською й англійською в прозорому процесі.",
          "zh-CN": "为海外业主、公寓投资者、Airbnb 房东、办公室和肖普朗代表性物业提供可靠的维护支持。小型维修、粉刷、石膏板、庭院养护、照片更新，以及清晰流程中的匈牙利语和英语沟通。"
      },
      "Apartment cleaning Sopron, property cleaning Sopron, Airbnb cleaning Sopron, deep cleaning Sopron, office cleaning Sopron and move out cleaning Sopron, organised for owners, hosts and managers who need clear communication, photo updates and reliable preparation before use.": {
          "de": "Wohnungsreinigung, Immobilienreinigung, Airbnb-Reinigung, Grundreinigung, Büroreinigung und Auszugsreinigung in Sopron, organisiert für Eigentümer, Gastgeber und Verwalter, die klare Kommunikation, Foto-Updates und zuverlässige Vorbereitung vor der Nutzung benötigen.",
          "uk": "Прибирання квартир, нерухомості, Airbnb-житла, генеральне прибирання, офісне прибирання та прибирання після виїзду в Шопроні для власників, господарів і керуючих, яким потрібні чітка комунікація, фотозвіти та надійна підготовка перед використанням.",
          "zh-CN": "肖普朗公寓清洁、物业清洁、Airbnb 清洁、深度清洁、办公室清洁和退租清洁，适合需要清晰沟通、照片更新和可靠使用前准备的业主、房东和管理者。"
      },
      "Cleaning, property maintenance, painting, small repairs and garden care in Sopron, with Hungarian and English coordination.": {
          "de": "Reinigung, Immobilieninstandhaltung, Malerarbeiten, kleinere Reparaturen und Gartenpflege in Sopron, mit ungarischer und deutscher Abstimmung.",
          "uk": "Прибирання, обслуговування нерухомості, фарбування, дрібні ремонти та догляд за садом у Шопроні з узгодженням угорською й англійською.",
          "zh-CN": "肖普朗清洁、物业维护、粉刷、小型维修和园艺养护，支持匈牙利语和英语沟通。"
      },
      "Handyman work is not about major renovation. It is about practical issues that make an apartment feel unfinished, an Airbnb less guest-ready or an office less professional.": {
          "de": "Dieser Reparaturservice ist keine große Renovierung. Es geht um praktische Punkte, durch die eine Wohnung unfertig wirkt, eine Airbnb-Unterkunft weniger gastbereit ist oder ein Büro weniger professionell erscheint.",
          "uk": "Такі роботи не є великим ремонтом. Йдеться про практичні дрібниці, через які квартира здається незавершеною, Airbnb-житло менш готовим до гостей, а офіс менш професійним.",
          "zh-CN": "这类维修并不是大型翻新，而是处理让公寓显得未完成、Airbnb 房源不够待客、办公室不够专业的实际问题。"
      },
      "Handyman-style small repairs, fittings, wall repairs and property maintenance in Sopron, with Hungarian and English coordination.": {
          "de": "Kleinere Reparaturen, Montagen, Wandreparaturen und Immobilieninstandhaltung in Sopron, mit ungarischer und deutscher Abstimmung.",
          "uk": "Дрібні ремонти, монтажні роботи, ремонт стін і обслуговування нерухомості в Шопроні з узгодженням угорською й англійською.",
          "zh-CN": "肖普朗小型维修、安装、墙面修补和物业维护，支持匈牙利语和英语沟通。"
      },
      "Interior painting, crack repair, plastering, minor drywall and surface repairs for Sopron apartments, Airbnb homes, offices and properties being prepared for rental or sale. Hungarian and English coordination, photo updates and organised scheduling.": {
          "de": "Innenanstrich, Rissreparatur, Spachtelarbeiten sowie kleinere Trockenbau- und Oberflächenreparaturen für Soproner Wohnungen, Airbnb-Unterkünfte, Büros und Immobilien vor Vermietung oder Verkauf. Ungarische und deutsche Abstimmung, Foto-Updates und organisierte Terminplanung.",
          "uk": "Інтер'єрне фарбування, ремонт тріщин, шпаклювання, дрібний ремонт гіпсокартону та поверхонь для будапештських квартир, Airbnb-житла, офісів і об'єктів перед орендою або продажем. Узгодження угорською й англійською, фотозвіти та організований графік.",
          "zh-CN": "为肖普朗公寓、Airbnb 房源、办公室以及准备出租或出售的物业提供室内粉刷、裂缝修补、抹灰、小型石膏板和表面修复。支持匈牙利语和英语沟通、照片更新和有序排期。"
      },
      "Lawn mowing, hedge trimming, weed removal, seasonal cleanup and practical outdoor maintenance for homes, apartment gardens, Airbnb properties, offices and Sopron properties owned from abroad. Hungarian and English coordination, photo updates and clear scheduling.": {
          "de": "Rasenmähen, Heckenschnitt, Unkrautentfernung, saisonale Aufräumarbeiten und praktische Außenpflege für Häuser, Wohnungsgärten, Airbnb-Objekte, Büros und Soproner Immobilien von Eigentümern im Ausland. Ungarische und deutsche Abstimmung, Foto-Updates und klare Terminplanung.",
          "uk": "Косіння газону, підрізання живоплоту, видалення бур'янів, сезонне прибирання та практичний догляд за зовнішніми зонами для будинків, квартирних садів, Airbnb-об'єктів, офісів і будапештської нерухомості власників за кордоном. Узгодження угорською й англійською, фотозвіти та чітке планування.",
          "zh-CN": "为住宅、公寓花园、Airbnb 物业、办公室以及海外业主在肖普朗的物业提供割草、修剪绿篱、除草、季节性清理和实用户外维护。支持匈牙利语和英语沟通、照片更新和清晰排期。"
      },
      "Organised support for apartments, Airbnb properties, offices and owners living abroad. Shelves, curtain rails, small fittings, furniture assembly, door and lock-area fixes, wall marks and practical pre-handover maintenance, coordinated in Hungarian and English.": {
          "de": "Organisierte Unterstützung für Wohnungen, Airbnb-Objekte, Büros und Eigentümer im Ausland. Regale, Gardinenschienen, kleinere Befestigungen, Möbelmontage, Tür- und Schlossbereich, Wandspuren und praktische Instandhaltung vor der Übergabe, koordiniert auf Ungarisch und Deutsch.",
          "uk": "Організована підтримка для квартир, Airbnb-об'єктів, офісів і власників за кордоном. Полиці, карнизи, дрібні кріплення, складання меблів, ремонт біля дверей і замків, сліди на стінах та практичне обслуговування перед передачею з координацією угорською й англійською.",
          "zh-CN": "为公寓、Airbnb 物业、办公室和海外业主提供有序支持。包括搁板、窗帘杆、小型固定件、家具组装、门和锁周边修理、墙面痕迹以及交接前的实用维护，支持匈牙利语和英语沟通。"
      },
      "Reliable handyman services in Sopron for practical property repairs.": {
          "de": "Zuverlässige Reparatur- und Montageservices in Sopron für praktische Arbeiten an Immobilien.",
          "uk": "Надійні послуги майстра в Шопроні для практичних ремонтів нерухомості.",
          "zh-CN": "肖普朗可靠的维修服务，适用于实用型物业修理。"
      },
      "Send a WhatsApp message": {
          "de": "WhatsApp-Nachricht senden",
          "uk": "Надіслати повідомлення у WhatsApp",
          "zh-CN": "发送 WhatsApp 消息"
      },
      "11-photo gallery": {
          "de": "Galerie mit 11 Fotos",
          "uk": "11-фотогалерея",
          "zh-CN": "11 张照片库"
      },
      "12-photo gallery": {
          "de": "12-Foto-Galerie",
          "uk": "12-фотогалерея",
          "zh-CN": "12 张照片库"
      },
      "A core task after use, moving or maintenance work.": {
          "de": "Eine Kernaufgabe nach Einsatz, Umzug oder Wartungsarbeiten.",
          "uk": "Основне завдання після використання, переміщення або технічного обслуговування.",
          "zh-CN": "使用、移动或维护工作后的核心任务。"
      },
      "A credible cleaning result is realistic: less dust, a cleaner kitchen, usable bathroom, orderly floors and a property ready for handover.": {
          "de": "Ein glaubwürdiges Reinigungsergebnis ist realistisch: weniger Staub, eine sauberere Küche, ein nutzbares Badezimmer, ordentliche Böden und eine übergabebereite Immobilie.",
          "uk": "Надійний результат прибирання є реалістичним: менше пилу, чистіша кухня, зручна ванна кімната, упорядковані підлоги та майно, готове до передачі.",
          "zh-CN": "可信的清洁结果是现实的：更少的灰尘、更干净的厨房、可用的浴室、整齐的地板和准备移交的财产。"
      },
      "A fast, tidy refresh of gardens, entrances and courtyards before guest arrival, photography, tenant change or viewing.": {
          "de": "Eine schnelle, ordentliche Auffrischung von Gärten, Eingängen und Innenhöfen vor der Ankunft der Gäste, dem Fotografieren, dem Mieterwechsel oder der Besichtigung.",
          "uk": "Швидке, акуратне оновлення садів, входів і дворів перед приїздом гостей, фотографуванням, зміною орендаря або оглядом.",
          "zh-CN": "在客人抵达、摄影、更换租户或参观之前，快速、整洁地刷新花园、入口和庭院。"
      },
      "A few clear photos, a short description and the location or area are usually enough to start clarifying painting and wall repair work. Hidden or larger defects may require an on-site assessment.": {
          "de": "Ein paar klare Fotos, eine kurze Beschreibung und der Adresse oder Gegend genügen meist, um mit der Klärung von Maler- und Wandreparaturarbeiten zu beginnen. Versteckte oder größere Mängel können eine Begutachtung vor Ort erfordern.",
          "uk": "Кількох чітких фотографій, короткого опису та місця розташування або території зазвичай достатньо, щоб почати уточнювати роботи з фарбування та ремонту стін. Приховані або великі дефекти можуть потребувати оцінки на місці.",
          "zh-CN": "几张清晰的照片、简短的描述以及位置或区域通常足以开始澄清油漆和墙壁修复工作。隐藏的或较大的缺陷可能需要现场评估。"
      },
      "A few photos, a short description, address or area and access details are usually enough to clarify garden maintenance tasks. Weather-dependent work may require flexible scheduling.": {
          "de": "Zur Klärung von Gartenpflegeaufgaben genügen in der Regel ein paar Fotos, eine kurze Beschreibung, Adresse oder Gegend und Zugangsdaten. Wetterabhängige Arbeiten können eine flexible Planung erfordern.",
          "uk": "Кілька фотографій, короткий опис, адреса чи територія і відомості про доступ зазвичай достатньо, щоб прояснити завдання догляду за садом. Погодозалежна робота може вимагати гнучкого графіку.",
          "zh-CN": "几张照片、简短描述、地址或地区和访问详细信息通常足以阐明花园维护任务。取决于天气的工作可能需要灵活的安排。"
      },
      "a few photos, the location and the preferred timing.": {
          "de": "ein paar Fotos, den Ort und den bevorzugten Zeitpunkt.",
          "uk": "кілька фотографій, місце та бажаний час.",
          "zh-CN": "几张照片、地点和首选时间。"
      },
      "A final review of visible points so the property feels orderly for guests, tenants or owners.": {
          "de": "Eine abschließende Überprüfung der sichtbaren Punkte, damit sich die Immobilie für Gäste, Mieter oder Eigentümer ordentlich anfühlt.",
          "uk": "Остаточний огляд видимих ​​місць, щоб гості, орендарі чи власники відчували порядок у власності.",
          "zh-CN": "对可见点进行最终审查，让房客、租户或业主感觉酒店井然有序。"
      },
      "A garden makes a better impression when the lawn, hedges, paths and entrance areas are kept in order. The goal is practical outdoor presentation: not overbuilt landscaping, but regular and well-organised maintenance.": {
          "de": "Ein Garten macht einen besseren Eindruck, wenn Rasen, Hecken, Wege und Eingangsbereiche in Ordnung gehalten werden. Das Ziel ist eine praktische Präsentation im Freien: keine überbaute Landschaftsgestaltung, sondern regelmäßige und gut organisierte Pflege.",
          "uk": "Сад справляє краще враження, коли газон, живоплоти, доріжки та вхідні майданчики містяться в порядку. Мета – практична зовнішня презентація: не надмірно забудований ландшафт, а регулярний і добре організований догляд.",
          "zh-CN": "当草坪、树篱、小路和入口区域保持整齐时，花园会给人留下更好的印象。目标是实用的户外展示：不是过度建造的景观，而是定期且组织良好的维护。"
      },
      "A good result starts with understanding the wall condition, preparing the surface and clarifying the realistic scope. The goal is not a dramatic promise, but a clean, consistent and usable room.": {
          "de": "Ein gutes Ergebnis beginnt damit, den Wandzustand zu verstehen, den Untergrund vorzubereiten und den realistischen Umfang abzuklären. Das Ziel ist kein dramatisches Versprechen, sondern ein sauberer, einheitlicher und nutzbarer Raum.",
          "uk": "Гарний результат починається з розуміння стану стіни, підготовки поверхні та уточнення реалістичного масштабу. Метою є не драматична обіцянка, а чисте, послідовне та зручне приміщення.",
          "zh-CN": "良好的结果始于了解墙壁状况、准备表面并明确实际范围。我们的目标不是一个戏剧性的承诺，而是一个干净、一致且可用的房间。"
      },
      "A photo summary of the finished condition, important details and possible next steps can be sent on request.": {
          "de": "Eine Fotozusammenfassung des fertigen Zustands, wichtige Details und mögliche weitere Schritte können auf Anfrage zugesandt werden.",
          "uk": "Фотозвіт готового стану, важливі деталі та можливі подальші дії можуть бути надіслані за запитом.",
          "zh-CN": "可根据要求发送成品状况、重要细节和可能的后续步骤的照片摘要。"
      },
      "A short message is enough: photos, location or area, timing, access and the goal of the repair. In reply, we help clarify the next sensible step.": {
          "de": "Eine kurze Nachricht genügt: Fotos, Adresse oder Gegend, Zeitpunkt, Anfahrt und das Ziel der Reparatur. Als Antwort helfen wir bei der Klärung des nächsten sinnvollen Schrittes.",
          "uk": "Досить короткого повідомлення: фото, місце або територію, час, доступ і мета ремонту. У відповідь ми допомагаємо прояснити наступний розумний крок.",
          "zh-CN": "一条短信就足够了：照片、位置或区域、时间、访问和修复目标。作为答复，我们帮助阐明下一步的合理步骤。"
      },
      "A short message is enough: photos, location or area, timing, access and the main goal. In reply, we help clarify whether photos are enough or whether an on-site assessment is the better first step.": {
          "de": "Eine kurze Nachricht genügt: Fotos, Ort bzw. Stadtteil, Zeitpunkt, Anfahrt und das Hauptziel. Als Antwort helfen wir bei der Klärung, ob Fotos ausreichen oder ob eine Begutachtung vor Ort der bessere erste Schritt ist.",
          "uk": "Досить короткого повідомлення: фотографії, місцезнаходження або територію, час, доступ і головна мета. У відповідь ми допомагаємо уточнити, чи достатньо фотографій, чи кращим першим кроком є ​​оцінка на місці.",
          "zh-CN": "一条短信就足够了：照片、位置或区域、时间、访问和主要目标。作为答复，我们帮助澄清照片是否足够，或者现场评估是否是更好的第一步。"
      },
      "A tidier outdoor impression after mowing and edging.": {
          "de": "Ein aufgeräumterer Außeneindruck nach dem Mähen und Kantenschneiden.",
          "uk": "Охайніше враження на відкритому повітрі після косіння та обробки краю.",
          "zh-CN": "修剪和修边后的户外印象更加整洁。"
      },
      "A tidy, clean impression for offices and apartments.": {
          "de": "Ein aufgeräumter, sauberer Eindruck für Büros und Wohnungen.",
          "uk": "Охайність, чистота для офісів і квартир.",
          "zh-CN": "给办公室和公寓留下整洁、干净的印象。"
      },
      "A useful first step:": {
          "de": "Ein nützlicher erster Schritt:",
          "uk": "Корисний перший крок:",
          "zh-CN": "有用的第一步："
      },
      "Adapted to Sopron apartments, offices, short-term rentals and properties owned from abroad.": {
          "de": "Abgestimmt auf Soproner Wohnungen, Büros, Kurzzeitvermietungen und Immobilien von Eigentümern im Ausland.",
          "uk": "Адаптовано до квартир, офісів, короткострокової оренди та нерухомості в Шопроні, якою власники керують з-за кордону.",
          "zh-CN": "适用于肖普朗公寓、办公室、短租房源，以及由海外业主管理的物业。"
      },
      "Adapted to Sopron gardens, apartment courtyards, smaller green areas and office outdoor spaces.": {
          "de": "Geeignet für Soproner Gärten, Wohnungshöfe, kleinere Grünflächen und Büroaußenflächen.",
          "uk": "Адаптований до будапештських садів, дворів квартир, невеликих зелених зон та офісних приміщень на відкритому повітрі.",
          "zh-CN": "适合肖普朗花园、公寓庭院、较小的绿地和办公室室外空间。"
      },
      "Adapted to city apartments, rental properties, offices and typical Sopron wall repair situations.": {
          "de": "Geeignet für Stadtwohnungen, Mietobjekte, Büros und typische Soproner Mauerreparatursituationen.",
          "uk": "Адаптований для міських квартир, орендованих приміщень, офісів і типових ситуацій ремонту стін Шопрона.",
          "zh-CN": "适合城市公寓、出租物业、办公室和典型的肖普朗墙壁维修情况。"
      },
      "Adapted to city apartments, residential buildings, offices and short-term rental situations in Sopron.": {
          "de": "Angepasst an Stadtwohnungen, Wohngebäude, Büros und kurzfristige Mietsituationen in Sopron.",
          "uk": "Адаптований під міські квартири, житлові будинки, офіси та умови короткострокової оренди в Шопроні.",
          "zh-CN": "适应肖普朗城市公寓、住宅、写字楼及短租情况。"
      },
      "Adapted to everyday painting and wall repair needs in rentals, city apartments, offices and homes.": {
          "de": "Angepasst an den alltäglichen Maler- und Wandreparaturbedarf in Mietwohnungen, Stadtwohnungen, Büros und Privathäusern.",
          "uk": "Адаптований для повсякденного фарбування та ремонту стін в орендованих, міських квартирах, офісах і будинках.",
          "zh-CN": "适应出租屋、城市公寓、办公室和家庭的日常油漆和墙壁修复需求。"
      },
      "Adapted to everyday repair needs in Sopron apartments, offices, short-term rentals and private homes.": {
          "de": "Angepasst an den täglichen Reparaturbedarf in Soproner Wohnungen, Büros, Kurzzeitmieten und Privathäusern.",
          "uk": "Пристосований до повсякденних потреб у ремонті квартир, офісів, короткострокової оренди та приватних будинків Шопрона.",
          "zh-CN": "适应肖普朗公寓、办公室、短期租赁和私人住宅的日常维修需求。"
      },
      "Address or area": {
          "de": "Adresse oder Gegend",
          "uk": "Адреса або територія",
          "zh-CN": "地址或地区"
      },
      "After a tenant moves out": {
          "de": "Nach dem Auszug eines Mieters",
          "uk": "Після виїзду орендаря",
          "zh-CN": "租客搬出后"
      },
      "After painting, drilling or small repairs, fine dust often remains on floors, skirting, counters and around switches.": {
          "de": "Nach dem Streichen, Bohren oder kleinen Reparaturen bleibt oft Feinstaub auf Böden, Sockelleisten, Theken und um Schalter herum zurück.",
          "uk": "Після фарбування, свердління або невеликого ремонту дрібний пил часто залишається на підлозі, плінтусах, стійках і навколо вимикачів.",
          "zh-CN": "喷漆、钻孔或小规模维修后，细小的灰尘通常会残留在地板、踢脚板、柜台和开关周围。"
      },
      "After painting, wall repair or small installation work, fine dust and residue often need a dedicated cleaning pass.": {
          "de": "Nach Malerarbeiten, Wandreparaturen oder kleinen Installationsarbeiten benötigen Feinstaub und Rückstände oft einen speziellen Reinigungsdurchgang.",
          "uk": "Після фарбування, ремонту стін або невеликих монтажних робіт дрібний пил і залишки часто потребують спеціального очищення.",
          "zh-CN": "油漆、墙壁维修或小型安装工作后，细小的灰尘和残留物通常需要专用的清洁通道。"
      },
      "After renovation": {
          "de": "Nach der Renovierung",
          "uk": "Після ремонту",
          "zh-CN": "装修后"
      },
      "Agreed execution": {
          "de": "Vereinbarte Ausführung",
          "uk": "Узгоджене виконання",
          "zh-CN": "同意执行"
      },
      "agreed scheduling": {
          "de": "Terminvereinbarung vereinbart",
          "uk": "узгоджений графік",
          "zh-CN": "商定的日程安排"
      },
      "All service types": {
          "de": "Alle Leistungsbereiche",
          "uk": "Усі види послуг",
          "zh-CN": "所有服务类型"
      },
      "Apartment courtyards and small green areas": {
          "de": "Wohnungshöfe und kleine Grünflächen",
          "uk": "Квартирні дворики та невеликі зелені зони",
          "zh-CN": "公寓庭院和小绿地"
      },
      "Apartment painting": {
          "de": "Wohnungsmalerei",
          "uk": "Фарбування квартири",
          "zh-CN": "公寓画"
      },
      "Apartment refresh before guest arrival": {
          "de": "Auffrischung des Apartments vor Ankunft der Gäste",
          "uk": "Оновлення квартири до приїзду гостей",
          "zh-CN": "客人抵达前更新公寓"
      },
      "Are photos enough to request a quote?": {
          "de": "Reichen Fotos aus, um ein Angebot anzufordern?",
          "uk": "Чи достатньо фотографій, щоб запитати ціну?",
          "zh-CN": "照片足以请求报价吗？"
      },
      "Are the website images completed client projects?": {
          "de": "Handelt es sich bei den Website-Bildern um abgeschlossene Kundenprojekte?",
          "uk": "Чи є зображення веб-сайтів завершеними клієнтськими проектами?",
          "zh-CN": "网站图片是否已完成客户项目？"
      },
      "Assembly or adjustment of flat-pack furniture, smaller cabinets, beds, tables and practical interior elements.": {
          "de": "Montage oder Anpassung von zerlegbaren Möbeln, kleineren Schränken, Betten, Tischen und praktischen Innenelementen.",
          "uk": "Збірка або налаштування плоских меблів, шаф, ліжок, столів і практичних елементів інтер'єру.",
          "zh-CN": "组装或调整平板家具、小型橱柜、床、桌子和实用的室内元件。"
      },
      "Bathroom": {
          "de": "Badezimmer",
          "uk": "Ванна кімната",
          "zh-CN": "浴室"
      },
      "Before": {
          "de": "Vorher",
          "uk": "До",
          "zh-CN": "之前"
      },
      "Before / After cleaning examples": {
          "de": "Vorher/Nachher-Reinigungsbeispiele",
          "uk": "Приклади до/після очищення",
          "zh-CN": "清洁前/清洁后示例"
      },
      "Before a guest turnover, even small defects are noticeable. The priority is clearly scheduled, tidy and documented work.": {
          "de": "Vor einem Gästewechsel fallen schon kleine Mängel auf. Im Vordergrund steht eine klar geplante, ordentliche und dokumentierte Arbeit.",
          "uk": "Перед гостьовим оборотом помітні навіть невеликі дефекти. Пріоритет – чітко розписана, акуратна та документально оформлена робота.",
          "zh-CN": "在客人流失之前，即使是很小的缺陷也会被注意到。首要任务是安排明确、整齐且记录在案的工作。"
      },
      "Before a tenant change or guest arrival, wall defects are immediately visible. The goal is to make the room presentable again quickly.": {
          "de": "Vor einem Mieterwechsel oder Gästeanreise sind Wandmängel sofort sichtbar. Ziel ist es, den Raum schnell wieder ansehnlich zu machen.",
          "uk": "Перед зміною орендаря або приходом гостей дефекти стін помітні відразу. Мета — швидко повернути кімнату презентабельному вигляду.",
          "zh-CN": "在租户更换或客人到来之前，墙壁缺陷立即可见。目标是让房间尽快恢复美观。"
      },
      "Before and after photo updates": {
          "de": "Vorher-Nachher-Foto-Updates",
          "uk": "Оновлення фото до і після",
          "zh-CN": "照片更新之前和之后"
      },
      "Before guest arrival, photography or tenant change, when the entrance and garden need to look tidy.": {
          "de": "Vor der Ankunft von Gästen, beim Fotografieren oder beim Mieterwechsel, wenn der Eingang und der Garten aufgeräumt aussehen müssen.",
          "uk": "Перед приїздом гостей, фотографуванням або зміною орендаря, коли під'їзд і сад повинні виглядати охайними.",
          "zh-CN": "在客人抵达、摄影或更换租户之前，入口和花园需要看起来整洁。"
      },
      "before guest turnover": {
          "de": "vor Gästewechsel",
          "uk": "до обороту гостей",
          "zh-CN": "客人流失前"
      },
      "Before move-in, guest turnover or viewing, clean floors, bathroom, kitchen, glass surfaces and dust-free furniture make a meaningful difference.": {
          "de": "Vor dem Einzug, dem Gästewechsel oder der Besichtigung machen saubere Böden, Badezimmer, Küche, Glasoberflächen und staubfreie Möbel einen bedeutenden Unterschied.",
          "uk": "Перед заселенням, прийомом гостей або оглядом чисті підлоги, ванна кімната, кухня, скляні поверхні та чисті меблі мають суттєве значення.",
          "zh-CN": "在入住之前，客人周转或参观之前，清洁地板、浴室、厨房、玻璃表面和无尘家具会产生有意义的变化。"
      },
      "Before moving in, selling, renting or seasonal maintenance when a room needs to feel fresh and cared for.": {
          "de": "Vor dem Einzug, dem Verkauf, der Vermietung oder der saisonalen Wartung, wenn sich ein Raum frisch und gepflegt anfühlen muss.",
          "uk": "Перед заїздом, продажем, орендою чи сезонним обслуговуванням, коли кімната потребує свіжості та догляду.",
          "zh-CN": "在搬入、出售、出租或季节性维护之前，当房间需要感觉清新和受到照顾时。"
      },
      "Before moving in, selling, renting or seasonal tidying, small repairs often make the biggest visible difference.": {
          "de": "Vor dem Einzug, dem Verkauf, der Vermietung oder dem saisonalen Aufräumen machen kleine Reparaturen oft den größten sichtbaren Unterschied.",
          "uk": "Перед переїздом, продажем, орендою чи сезонним прибиранням невеликий ремонт часто робить найбільшу видиму зміну.",
          "zh-CN": "在搬入、出售、出租或季节性整理之前，小规模的维修往往会产生最大的明显差异。"
      },
      "before tenant handover": {
          "de": "vor Mieterübergabe",
          "uk": "перед передачею орендарю",
          "zh-CN": "租户移交前"
      },
      "Before visitors": {
          "de": "Vor Besuchern",
          "uk": "Перед відвідувачами",
          "zh-CN": "访客之前"
      },
      "Before visits, handover or daily operation when the outdoor presentation also needs to look professional.": {
          "de": "Vor Besichtigungen, Übergaben oder im täglichen Betrieb, wenn auch die Außenpräsentation professionell aussehen soll.",
          "uk": "Перед візитами, передачею або щоденною роботою, коли зовнішня презентація також має виглядати професійно.",
          "zh-CN": "在参观之前、交接或日常操作时，户外演示也需要看起来专业。"
      },
      "Before work starts, we clarify what is included and what needs separate approval.": {
          "de": "Vor Beginn der Arbeiten klären wir, was enthalten ist und was einer gesonderten Genehmigung bedarf.",
          "uk": "Перед початком роботи ми уточнюємо, що включено, а що потребує окремого погодження.",
          "zh-CN": "在工作开始之前，我们会澄清其中包括哪些内容以及哪些内容需要单独批准。"
      },
      "Before, work-in-progress and finished images organised only for this service type.": {
          "de": "Zuvor wurden in Arbeit befindliche und fertige Bilder nur für diesen Servicetyp organisiert.",
          "uk": "Раніше незавершені та готові зображення організовувалися лише для цього типу послуг.",
          "zh-CN": "之前，仅针对此服务类型组织正在进行的工作和已完成的图像。"
      },
      "Better handover condition": {
          "de": "Besserer Übergabezustand",
          "uk": "Кращий стан передачі",
          "zh-CN": "更好的交接条件"
      },
      "Browse image sequences organised by service type. Each opens a focused view with the full gallery and before-and-after comparison.": {
          "de": "Durchsuchen Sie Bildsequenzen, sortiert nach Diensttyp. Jedes öffnet eine fokussierte Ansicht mit der vollständigen Galerie und einem Vorher-Nachher-Vergleich.",
          "uk": "Переглядайте послідовності зображень, упорядковані за типом послуги. Кожен відкриває сфокусований перегляд із повною галереєю та порівнянням до та після.",
          "zh-CN": "浏览按服务类型组织的图像序列。每个都打开一个集中视图，包含完整的画廊和前后比较。"
      },
      "Sopron": {
          "de": "Sopron",
          "uk": "Шопрон",
          "zh-CN": "肖普朗"
      },
      "Sopron is the primary service area. Jobs in the nearby area can be considered depending on distance, scope and timing. Include the exact location in the first message so feasibility can be assessed quickly.": {
          "de": "Sopron ist das wichtigste Versorgungsgebiet. Jobs in der näheren Umgebung können je nach Entfernung, Umfang und Zeitpunkt in Betracht gezogen werden. Geben Sie in der ersten Nachricht den genauen Standort an, damit die Machbarkeit schnell beurteilt werden kann.",
          "uk": "Шопрон є основною зоною обслуговування. Роботи в прилеглій області можна розглядати залежно від відстані, обсягу та часу. Включіть точне місце розташування в перше повідомлення, щоб можна було швидко оцінити здійсненність.",
          "zh-CN": "肖普朗是主要服务区。根据距离、范围和时间安排，可以考虑附近地区的工作。在第一条消息中包含确切位置，以便快速评估可行性。"
      },
      "Sopron local focus": {
          "de": "Lokaler Schwerpunkt Sopron",
          "uk": "Місцевий фокус Шопрона",
          "zh-CN": "肖普朗本地焦点"
      },
      "Sopron office": {
          "de": "Büro in Sopron",
          "uk": "Шопронський офіс",
          "zh-CN": "肖普朗办事处"
      },
      "Sopron rental apartment": {
          "de": "Mietwohnung in Sopron",
          "uk": "Оренда квартири в Шопроні",
          "zh-CN": "肖普朗出租公寓"
      },
      "Sopron rental property": {
          "de": "Mietobjekt in Sopron",
          "uk": "Оренда нерухомості в Шопроні",
          "zh-CN": "肖普朗出租物业"
      },
      "Sopron residents and owners": {
          "de": "Einwohner und Eigentümer von Sopron",
          "uk": "Жителі та власники Шопрона",
          "zh-CN": "肖普朗居民和业主"
      },
      "Sopron yard and entrance area": {
          "de": "Soproner Hof und Eingangsbereich",
          "uk": "Шопронський двір та вхідна зона",
          "zh-CN": "肖普朗庭院和入口区"
      },
      "Can apartment courtyards be discussed?": {
          "de": "Können Wohnungshöfe besprochen werden?",
          "uk": "Чи може йти мова про двори квартир?",
          "zh-CN": "公寓庭院可以讨论吗？"
      },
      "Can cracks and small damage be repaired before painting?": {
          "de": "Können Risse und kleine Schäden vor dem Lackieren repariert werden?",
          "uk": "Чи можна усунути тріщини та невеликі пошкодження перед фарбуванням?",
          "zh-CN": "裂缝和小损伤可以在涂漆前修复吗？"
      },
      "Can I arrange regular visits?": {
          "de": "Kann ich regelmäßige Besuche vereinbaren?",
          "uk": "Чи можу я організувати регулярні візити?",
          "zh-CN": "我可以安排定期拜访吗？"
      },
      "Can I coordinate this from abroad?": {
          "de": "Kann ich das vom Ausland aus koordinieren?",
          "uk": "Чи можу я скоординувати це з-за кордону?",
          "zh-CN": "我可以从国外协调吗？"
      },
      "Can I request a small job?": {
          "de": "Kann ich einen Kleinauftrag anfordern?",
          "uk": "Чи можу я запросити невелику роботу?",
          "zh-CN": "我可以要求一份小工作吗？"
      },
      "Can I request photo updates?": {
          "de": "Kann ich Foto-Updates anfordern?",
          "uk": "Чи можу я подати запит на оновлення фотографій?",
          "zh-CN": "我可以请求更新照片吗？"
      },
      "Can I request urgent cleaning?": {
          "de": "Kann ich eine dringende Reinigung anfordern?",
          "uk": "Чи можу я вимагати термінового прибирання?",
          "zh-CN": "我可以要求紧急清洁吗？"
      },
      "Can I send photos first?": {
          "de": "Kann ich zuerst Fotos senden?",
          "uk": "Чи можу я спочатку надіслати фотографії?",
          "zh-CN": "我可以先发照片吗？"
      },
      "Can you clean after a move-out?": {
          "de": "Darf man nach einem Auszug putzen?",
          "uk": "Чи можете ви прибрати після виїзду?",
          "zh-CN": "搬出后可以打扫卫生吗？"
      },
      "Can you inspect a property before starting?": {
          "de": "Können Sie eine Immobilie vor Beginn besichtigen?",
          "uk": "Чи можете ви оглянути нерухомість перед початком?",
          "zh-CN": "您可以在开始之前检查房产吗？"
      },
      "Can you install shelves or curtain rails?": {
          "de": "Können Regale oder Vorhangschienen montiert werden?",
          "uk": "Чи можете ви встановити полиці або карнизи?",
          "zh-CN": "可以安装架子或窗帘导轨吗？"
      },
      "Can you maintain gardens and courtyards?": {
          "de": "Können Gärten und Innenhöfe gepflegt werden?",
          "uk": "Чи можете ви доглядати за садами та дворами?",
          "zh-CN": "你能维护花园和庭院吗？"
      },
      "Care for shrubs, bushes and smaller greenery.": {
          "de": "Pflegen Sie Sträucher, Büsche und kleinere Grünflächen.",
          "uk": "Догляд за кущами, чагарниками та дрібнішими зеленими насадженнями.",
          "zh-CN": "照顾灌木、矮树丛和较小的绿化植物。"
      },
      "Clean handover, clear task list and photo updates.": {
          "de": "Saubere Übergabe, klare Aufgabenliste und Fotoaktualisierungen.",
          "uk": "Чиста передача, чіткий список завдань і оновлення фотографій.",
          "zh-CN": "干净的交接、清晰的任务列表和照片更新。"
      },
      "Clean work area and photo updates": {
          "de": "Sauberer Arbeitsbereich und Fotoaktualisierungen",
          "uk": "Чисте робоче місце та оновлення фото",
          "zh-CN": "清洁工作区域和照片更新"
      },
      "Cleaner meeting rooms, workstations and visitor-facing areas.": {
          "de": "Sauberere Besprechungsräume, Arbeitsplätze und Besucherbereiche.",
          "uk": "Чистіші конференц-зали, робочі станції та зони для відвідувачів.",
          "zh-CN": "更干净的会议室、工作站和面向访客的区域。"
      },
      "Cleaner paths, steps and entrance areas.": {
          "de": "Sauberere Wege, Treppen und Eingangsbereiche.",
          "uk": "Чистіші доріжки, сходинки та вхідні зони.",
          "zh-CN": "道路、台阶和入口区域更加干净。"
      },
      "Cleaner, more consistent wall colour before rental or handover.": {
          "de": "Sauberere, gleichmäßigere Wandfarbe vor der Vermietung oder Übergabe.",
          "uk": "Чистіший і однорідніший колір стін перед орендою чи передачею.",
          "zh-CN": "租赁或移交前墙壁颜色更干净、更一致。"
      },
      "Cleaning after renovation, painting or minor repair work, with focus on dust, small debris and surface residue before the space is used again.": {
          "de": "Reinigung nach Renovierungs-, Maler- oder kleineren Reparaturarbeiten, mit Schwerpunkt auf Staub, kleinen Ablagerungen und Oberflächenrückständen, bevor der Raum wieder genutzt wird.",
          "uk": "Прибирання після ремонту, фарбування або дрібного ремонту, з упором на пил, дрібне сміття та поверхневі залишки перед тим, як простір використовуватиметься знову.",
          "zh-CN": "翻新、油漆或小修工程后进行清洁，重点是灰尘、小碎片和表面残留物，然后再使用空间。"
      },
      "Cleaning and property maintenance": {
          "de": "Reinigung und Objektpflege",
          "uk": "Прибирання та обслуговування майна",
          "zh-CN": "清洁和物业维护"
      },
      "Cleaning checklist": {
          "de": "Checkliste für die Reinigung",
          "uk": "Контрольний список очищення",
          "zh-CN": "清洁清单"
      },
      "Cleaning empty apartments, cabinets, floors, bathrooms and kitchens so the next user receives a clean space.": {
          "de": "Reinigung leerer Wohnungen, Schränke, Böden, Badezimmer und Küchen, damit der nächste Benutzer einen sauberen Raum erhält.",
          "uk": "Прибирання порожніх квартир, шаф, підлог, ванних кімнат і кухонь, щоб наступний користувач отримав чистий простір.",
          "zh-CN": "清洁空置的公寓、橱柜、地板、浴室和厨房，以便下一个用户获得干净的空间。"
      },
      "Cleaning is rarely about one room only. It is often tied to timing: guests are arriving, a tenant is moving, an office visit is planned or a room must become usable again after renovation.": {
          "de": "Bei der Reinigung geht es selten nur um einen Raum. Oft ist es an den Zeitpunkt geknüpft: Gäste kommen, ein Mieter zieht um, ein Bürobesuch ist geplant oder ein Raum muss nach einer Renovierung wieder nutzbar werden.",
          "uk": "Прибирання рідко стосується лише однієї кімнати. Часто це прив'язано до часу: гості прибувають, орендар переїжджає, планується візит до офісу або кімната після ремонту повинна бути знову придатною для використання.",
          "zh-CN": "清洁很少只涉及一个房间。它通常与时间相关：客人抵达、租户搬家、计划参观办公室或房间在装修后必须再次可用。"
      },
      "Cleaning services we can help with": {
          "de": "Reinigungsarbeiten, bei denen wir helfen können",
          "uk": "З яким прибиранням ми можемо допомогти",
          "zh-CN": "我们可以协助的清洁服务"
      },
      "Cleaning support is most useful when the property is in active use, guests are arriving, the owner is abroad or handover has a real deadline.": {
          "de": "Reinigungsunterstützung ist am nützlichsten, wenn die Immobilie aktiv genutzt wird, Gäste anreisen, der Eigentümer im Ausland ist oder die Übergabe eine echte Frist hat.",
          "uk": "Підтримка прибирання є найбільш корисною, коли нерухомість активно використовується, гості прибувають, власник за кордоном або здача має реальний термін.",
          "zh-CN": "当房产正在使用、客人即将抵达、业主在国外或移交有实际期限时，清洁支持最为有用。"
      },
      "Cleaning works best when the first message makes the condition, deadline and required outcome clear.": {
          "de": "Die Reinigung funktioniert am besten, wenn die erste Nachricht den Zustand, die Frist und das gewünschte Ergebnis klar macht.",
          "uk": "Очищення працює найкраще, коли в першому повідомленні чітко пояснюється умова, кінцевий термін і необхідний результат.",
          "zh-CN": "当第一条消息明确说明条件、截止日期和所需结果时，清洁工作效果最佳。"
      },
      "Clear coordination": {
          "de": "Klare Koordination",
          "uk": "Чітка координація",
          "zh-CN": "清晰协调"
      },
      "Clear from a distance": {
          "de": "Aus der Ferne klar",
          "uk": "Ясно здалеку",
          "zh-CN": "从远处看清晰"
      },
      "Clear task list": {
          "uk": "Очистити список завдань",
          "de": "Übersichtliche Aufgabenliste",
          "zh-CN": "清除任务列表"
      },
      "Clear task list, tidy outdoor presentation and photo updates.": {
          "uk": "Чіткий список завдань, охайна зовнішня презентація та оновлення фотографій.",
          "zh-CN": "清晰的任务列表、整洁的户外演示和照片更新。",
          "de": "Klare Aufgabenliste, ordentliche Außenpräsentation und Foto-Updates."
      },
      "Clearly listed, photo-documented repairs for guest turnover, tenant move-out, office visits or owners who are not in Sopron.": {
          "de": "Übersichtlich aufgelistete, fotodokumentierte Reparaturen bei Gästewechsel, Mieterauszug, Bürobesuchen oder Eigentümern, die nicht in Sopron sind.",
          "uk": "Ремонт із чітким переліком, задокументованим фотографіями, для обороту гостей, виїзду орендарів, візитів до офісу або власників, які не перебувають у Шопроні.",
          "zh-CN": "清楚列出并附有照片记录的宾客流动、租户搬出、办公室访问或不在肖普朗的业主的维修服务。"
      },
      "Common questions": {
          "de": "Häufige Fragen",
          "zh-CN": "常见问题",
          "uk": "Загальні запитання"
      },
      "Communication and timing are shaped around Sopron apartments, offices and rentals.": {
          "de": "Kommunikation und Timing werden rund um Soproner Wohnungen, Büros und Mietobjekte geprägt.",
          "uk": "Комунікація та час формуються навколо квартир, офісів та оренди в Шопроні.",
          "zh-CN": "沟通和时间安排是围绕肖普朗的公寓、办公室和出租屋而定的。"
      },
      "Completed tasks are summarised and the property is left usable, tidy and ready to present.": {
          "uk": "Виконані завдання підсумовуються, і майно залишається придатним для використання, охайним і готовим до презентації.",
          "de": "Erledigte Aufgaben werden zusammengefasst und die Immobilie wird benutzbar, aufgeräumt und präsentierbereit hinterlassen.",
          "zh-CN": "对已完成的任务进行总结，使财产保持可用、整洁并准备好展示。"
      },
      "Condition before": {
          "zh-CN": "之前的状况",
          "de": "Zustand vorher",
          "uk": "Стан перед"
      },
      "Controlled tidying of overgrown greenery.": {
          "uk": "Контрольоване впорядкування порослих зелених насаджень.",
          "de": "Kontrolliertes Aufräumen von verwildertem Grün.",
          "zh-CN": "对杂草丛生的绿色植物进行有控制的整理。"
      },
      "Counters, sink, hob, visible cabinet fronts, grease-prone areas, bin area and floor.": {
          "de": "Arbeitsflächen, Spüle, Kochfeld, sichtbare Schrankfronten, fettanfällige Bereiche, Mülleimerbereich und Boden.",
          "uk": "Стійки, раковина, варильна поверхня, видимі фасади шаф, забруднені жиром зони, зона для сміття та підлога.",
          "zh-CN": "柜台、水槽、炉灶、可见的橱柜正面、容易沾上油脂的区域、垃圾箱区域和地板。"
      },
      "Crack and wall defect repair": {
          "zh-CN": "裂缝及墙体缺陷修复",
          "de": "Reparatur von Rissen und Wanddefekten",
          "uk": "Ремонт тріщин і дефектів стін"
      },
      "Damaged or unfinished drywall, seams, filling, sanding and paint-ready surfaces. The goal is for the repair to blend into the room, not remain visible as a separate defect.": {
          "uk": "Пошкоджений або незавершений гіпсокартон, шви, шпаклівка, шліфування та готові до фарбування поверхні. Мета полягає в тому, щоб ремонт вписувався в кімнату, а не залишався видимим як окремий дефект.",
          "zh-CN": "损坏或未完成的干墙、接缝、填充、打磨和油漆表面。目标是使修复融入房间，而不是作为单独的缺陷可见。",
          "de": "Beschädigte oder unfertige Trockenbauwände, Nähte, Spachtel-, Schleif- und lackierfähige Oberflächen. Ziel ist es, dass sich die Reparatur in den Raum einfügt und nicht als separater Mangel sichtbar bleibt."
      },
      "Deep cleaning Sopron support when the kitchen, bathroom, dust, limescale, cabinet surfaces or long-postponed details need more attention.": {
          "zh-CN": "当厨房、浴室、灰尘、水垢、橱柜表面或长期推迟的细节需要更多关注时，肖普朗深度清洁支持。",
          "de": "Die gründliche Reinigung von Sopron unterstützt Sie, wenn Küche, Bad, Staub, Kalk, Schrankoberflächen oder lange aufgeschobene Details mehr Aufmerksamkeit erfordern.",
          "uk": "Глибоке прибирання Шопронська підтримка, коли кухня, ванна кімната, пил, вапняний наліт, поверхні шаф або довго відкладені деталі потребують більше уваги."
      },
      "Desks, meeting rooms and visible surfaces refreshed.": {
          "zh-CN": "办公桌、会议室和可见表面焕然一新。",
          "de": "Schreibtische, Besprechungsräume und Sichtflächen aufgefrischt.",
          "uk": "Оновлено столи, кімнати для переговорів і видимі поверхні."
      },
      "Details": {
          "de": "Mehr erfahren",
          "uk": "Деталі",
          "zh-CN": "详情"
      },
      "Discreet coordination and orderly work in residences, offices and representative spaces. Tasks can be planned around the use of the property and site-access requirements.": {
          "de": "Diskrete Koordination und geordnetes Arbeiten in Wohnungen, Büros und repräsentativen Räumen. Aufgaben können rund um die Nutzung des Grundstücks und die Zugangsvoraussetzungen zum Standort geplant werden.",
          "uk": "Стримана координація та впорядкована робота в резиденціях, офісах та представницьких приміщеннях. Завдання можна планувати відповідно до вимог щодо використання власності та доступу до сайту.",
          "zh-CN": "住宅、办公室和代表空间中的谨慎协调和有序工作。可以围绕财产的使用和站点访问要求来规划任务。"
      },
      "Do you assemble furniture?": {
          "uk": "Ви збираєте меблі?",
          "de": "Montieren Sie Möbel?",
          "zh-CN": "你组装家具吗？"
      },
      "Do you bring cleaning supplies?": {
          "uk": "Ви берете з собою засоби для чищення?",
          "de": "Bringen Sie Reinigungsmittel mit?",
          "zh-CN": "你带清洁用品吗？"
      },
      "Do you clean after renovation work?": {
          "uk": "Ви прибираєте після ремонту?",
          "de": "Reinigen Sie nach Renovierungsarbeiten?",
          "zh-CN": "装修后你们会打扫卫生吗？"
      },
      "Do you handle lock repair or electrical work?": {
          "uk": "Ви займаєтесь ремонтом замків чи електрикою?",
          "de": "Führen Sie Schlossreparaturen oder Elektroarbeiten durch?",
          "zh-CN": "你们从事修锁或电气工作吗？"
      },
      "Do you handle one-off garden maintenance?": {
          "de": "Kümmern Sie sich um die einmalige Gartenpflege?",
          "uk": "Чи виконуєте ви одноразовий догляд за садом?",
          "zh-CN": "你们负责一次性花园维护吗？"
      },
      "Do you handle small repairs?": {
          "de": "Kümmern Sie sich um kleine Reparaturen?",
          "uk": "Ви займаєтесь дрібним ремонтом?",
          "zh-CN": "你们负责小修理吗？"
      },
      "Do you handle small touch-up painting?": {
          "de": "Kümmern Sie sich um kleine Ausbesserungsarbeiten?",
          "uk": "Ви малюєте дрібні ретуші?",
          "zh-CN": "你们经营小型补漆吗？"
      },
      "Do you handle spring preparation and autumn cleanup?": {
          "uk": "Чи займаєтесь ви весняною підготовкою та осіннім прибиранням?",
          "de": "Kümmern Sie sich um die Vorbereitungen für den Frühling und die Aufräumarbeiten im Herbst?",
          "zh-CN": "你们负责春季准备工作和秋季清理工作吗？"
      },
      "Do you refresh offices or representative spaces?": {
          "de": "Erneuern Sie Büros oder repräsentative Räume?",
          "uk": "Ви оновлюєте офіси чи представницькі приміщення?",
          "zh-CN": "您是否翻新办公室或代表空间？"
      },
      "Do you send photos after the work?": {
          "de": "Schicken Sie Fotos nach der Arbeit?",
          "uk": "Ви надсилаєте фото після роботи?",
          "zh-CN": "下班后会发照片吗？"
      },
      "Do you work outside Sopron?": {
          "de": "Arbeiten Sie außerhalb von Sopron?",
          "uk": "Ви працюєте за межами Шопрона?",
          "zh-CN": "您在肖普朗以外工作吗？"
      },
      "Doors, handles and minor hardware": {
          "de": "Türen, Griffe und Kleinteile",
          "uk": "Двері, ручки та дрібна фурнітура",
          "zh-CN": "门、把手和小五金件"
      },
      "Drilling, fittings and small fixes.": {
          "de": "Bohren, Beschläge und kleine Reparaturen.",
          "uk": "Свердління, кріплення та дрібні ремонти.",
          "zh-CN": "钻孔、安装和小修理。"
      },
      "Drywall": {
          "de": "Trockenbau",
          "uk": "Гіпсокартон",
          "zh-CN": "石膏板"
      },
      "Drywall / ceiling": {
          "de": "Trockenbau / Decke",
          "uk": "Гіпсокартон / стеля",
          "zh-CN": "干墙/天花板"
      },
      "Drywall and ceiling repairs": {
          "de": "Trockenbau- und Deckenreparaturen",
          "uk": "Ремонт стелі та гіпсокартону",
          "zh-CN": "干墙和天花板维修"
      },
      "Drywall and minor repairs": {
          "zh-CN": "干墙和小修",
          "de": "Trockenbau und kleinere Reparaturen",
          "uk": "Гіпсокартон та дрібний ремонт"
      },
      "Drywall damage, small openings, surface defects and post-tenant repair items handled through a practical, transparent task list.": {
          "de": "Trockenbauschäden, kleine Öffnungen, Oberflächenmängel und Nachmieter-Reparaturen werden über eine praktische, transparente Aufgabenliste abgewickelt.",
          "uk": "Пошкодження гіпсокартону, невеликі отвори, дефекти поверхні та предмети ремонту після оренди вирішуються за допомогою практичного прозорого списку завдань.",
          "zh-CN": "通过实用、透明的任务清单处理干墙损坏、小开口、表面缺陷和租户后维修项目。"
      },
      "Drywall prepared for a finished interior": {
          "de": "Trockenbau vorbereitet für einen fertigen Innenraum",
          "uk": "Гіпсокартон підготовлений під готовий інтер'єр",
          "zh-CN": "为室内装修做好准备的干墙"
      },
      "During the work": {
          "de": "Während der Arbeit",
          "uk": "Під час роботи",
          "zh-CN": "工作期间"
      },
      "Dust and renovation residue": {
          "de": "Staub und Renovierungsrückstände",
          "uk": "Пил і залишки ремонту",
          "zh-CN": "灰尘和装修残留物"
      },
      "Dust, marks and small debris handled before use.": {
          "de": "Staub, Flecken und kleine Rückstände vor der Verwendung entfernen.",
          "uk": "Пил, плями та дрібне сміття очищаються перед використанням.",
          "zh-CN": "使用前处理掉灰尘、痕迹和小碎片。"
      },
      "Easy to follow remotely": {
          "de": "Auch aus der Ferne gut nachvollziehbar",
          "uk": "Легко відстежувати дистанційно",
          "zh-CN": "远程也便于跟进"
      },
      "Cross-border owners and Austrian-linked businesses": {
          "de": "Grenzüberschreitende Eigentümer und österreichisch verbundene Unternehmen",
          "uk": "Транскордонні власники та компанії, пов'язані з Австрією",
          "zh-CN": "跨境业主及与奥地利相关的企业"
      },
      "Every property situation is different. Open the scenario that most closely matches yours.": {
          "de": "Jede Immobiliensituation ist anders. Öffnen Sie das Szenario, das Ihrem Szenario am ehesten entspricht.",
          "uk": "Кожна майнова ситуація різна. Відкрийте сценарій, який найбільше відповідає вашому.",
          "zh-CN": "每个财产情况都不同。打开与您的情况最匹配的场景。"
      },
      "Examples and photos": {
          "de": "Beispiele und Fotos",
          "zh-CN": "示例和照片",
          "uk": "Приклади та фото"
      },
      "Family houses, owner-occupied apartments, small repairs, painting, drywall repairs, garden care, seasonal maintenance and preparation before moving in or selling.": {
          "zh-CN": "家庭住宅、自住公寓、小型维修、油漆、干墙维修、花园护理、季节性维护以及入住或出售前的准备工作。",
          "uk": "Сімейні будинки, власні квартири, дрібний ремонт, фарбування, ремонт гіпсокартону, догляд за садом, сезонне обслуговування та підготовка до заселення чи продажу.",
          "de": "Einfamilienhäuser, Eigentumswohnungen, Kleinreparaturen, Malerarbeiten, Trockenbaureparaturen, Gartenpflege, saisonale Wartung und Vorbereitung vor dem Einzug oder Verkauf."
      },
      "FAQ": {
          "de": "Häufige Fragen",
          "uk": "Поширені запитання",
          "zh-CN": "常见问题"
      },
      "Fast, trackable preparation before guest arrival, with special attention to bathrooms, kitchen, linen and visible surfaces.": {
          "zh-CN": "在客人抵达之前进行快速、可追踪的准备工作，特别关注浴室、厨房、床单和可见表面。",
          "de": "Schnelle, nachvollziehbare Vorbereitung vor der Ankunft des Gastes, mit besonderem Augenmerk auf Badezimmer, Küche, Wäsche und sichtbare Oberflächen.",
          "uk": "Швидка, відстежувана підготовка до прибуття гостя, з особливою увагою до ванних кімнат, кухні, білизни та видимих ​​поверхонь."
      },
      "Fewer misunderstandings": {
          "de": "Weniger Missverständnisse",
          "uk": "Менше непорозумінь",
          "zh-CN": "减少误解"
      },
      "Finished": {
          "de": "Fertiggestellt",
          "uk": "Готово",
          "zh-CN": "完成后"
      },
      "Finished handover": {
          "de": "Fertige Übergabe",
          "zh-CN": "完成交接",
          "uk": "Завершена передача"
      },
      "Fittings and installation": {
          "de": "Ausstattung und Installation",
          "zh-CN": "配件和安装",
          "uk": "Фурнітура та монтаж"
      },
      "Fittings, small installation work, repairs and practical tasks before a refresh, after a tenant move-out or between guest stays. The aim is to resolve manageable issues before they become bigger problems.": {
          "de": "Einrichtungsarbeiten, kleine Installationsarbeiten, Reparaturen und praktische Tätigkeiten vor einer Renovierung, nach einem Mieterauszug oder zwischen Gastaufenthalten. Ziel ist es, beherrschbare Probleme zu lösen, bevor sie zu größeren Problemen werden.",
          "zh-CN": "翻新前、租户搬出后或客人入住期间的装修、小型安装工作、维修和实际任务。目的是在可管理的问题变成更大的问题之前解决它们。",
          "uk": "Обладнання, дрібні інсталяційні роботи, ремонт і практичні завдання перед оновленням, після виїзду орендаря або між перебуванням гостей. Мета полягає в тому, щоб вирішити керовані проблеми, перш ніж вони стануть більшими проблемами."
      },
      "Flat-pack furniture and adjustments.": {
          "zh-CN": "平板包装家具和调整。",
          "de": "Fertig verpackte Möbel und Anpassungen.",
          "uk": "Пакетні меблі та пристосування."
      },
      "Flexible scheduling": {
          "uk": "Гнучкий графік",
          "de": "Flexible Terminplanung",
          "zh-CN": "灵活排班"
      },
      "Floors and dust": {
          "uk": "Підлоги і пил",
          "de": "Böden und Staub",
          "zh-CN": "地板和灰尘"
      },
      "For Sopron properties, cleaning often involves access, timing, photo updates and noticing small maintenance issues. We handle this through a clear, practical workflow.": {
          "de": "Bei Immobilien in Sopron geht es bei der Reinigung häufig um Zugang, Zeitplanung, Fotoaktualisierungen und das Erkennen kleinerer Wartungsprobleme. Wir handhaben dies durch einen klaren, praktischen Arbeitsablauf.",
          "uk": "У Шопроні прибирання часто передбачає доступ, час, оновлення фотографій і помічання невеликих проблем з обслуговуванням. Ми вирішуємо це за допомогою чіткого, практичного робочого процесу.",
          "zh-CN": "对于肖普朗的房产，清洁通常涉及出入、时间安排、照片更新以及注意小维护问题。我们通过清晰、实用的工作流程来处理这个问题。"
      },
      "For Sopron properties, garden care is often a coordination task: access, weather, green waste, recurring visits and photo updates. We provide clear, practical support for that.": {
          "de": "Bei Immobilien in Sopron ist die Gartenpflege oft eine Koordinierungsaufgabe: Zugang, Wetter, Grünabfälle, wiederkehrende Besuche und Fotoaktualisierungen. Wir unterstützen Sie dabei klar und praxisorientiert.",
          "uk": "Для майна в Шопроні догляд за садом часто є завданням координації: доступ, погода, зелені відходи, регулярні візити та оновлення фотографій. Ми надаємо чітку практичну підтримку для цього.",
          "zh-CN": "对于肖普朗的房产来说，花园护理通常是一项协调任务：通道、天气、绿色废物、定期访问和照片更新。我们为此提供明确、实际的支持。"
      },
      "For garden maintenance, reliable coordination matters as much as the on-site work itself. Tasks are handled with clear scope, practical communication and photo updates where useful.": {
          "de": "Bei der Gartenpflege ist eine zuverlässige Koordination ebenso wichtig wie die Arbeit vor Ort. Aufgaben werden mit klarem Rahmen, praktischer Kommunikation und Bildaktualisierungen bearbeitet, wo sinnvoll.",
          "uk": "Для догляду за садом надійна координація має таке ж значення, як і сама робота на місці. Завдання виконуються з чітким обсягом, практичним спілкуванням і оновленням фотографій, де це корисно.",
          "zh-CN": "对于花园维护来说，可靠的协调与现场工作本身一样重要。任务的处理范围明确、实用的沟通和有用的照片更新。"
      },
      "For guest turnover, tenant move-out, small defects, wall marks and presentation before a viewing or photo session.": {
          "de": "Bei Gästefluktuation, Mieterauszug, kleinen Mängeln, Wandspuren und Präsentation vor einer Besichtigung oder einem Fototermin.",
          "uk": "Для обороту гостей, відселення орендарів, дрібних дефектів, відміток на стінах і презентації перед оглядом або фотосесією.",
          "zh-CN": "用于客人流动、租户搬出、小缺陷、墙壁痕迹以及观看或拍照前的演示。"
      },
      "For many smaller garden maintenance tasks, photos are a good starting point. Larger, neglected or difficult-to-access areas may require an on-site assessment.": {
          "de": "Für viele kleinere Gartenpflegeaufgaben sind Fotos ein guter Ausgangspunkt. Größere, vernachlässigte oder schwer zugängliche Bereiche erfordern möglicherweise eine Beurteilung vor Ort.",
          "uk": "Для багатьох невеликих завдань з догляду за садом фотографії є ​​хорошою відправною точкою. Для більших, занедбаних або важкодоступних територій може знадобитися оцінка на місці.",
          "zh-CN": "对于许多较小的花园维护任务，照片是一个很好的起点。较大、被忽视或难以进入的区域可能需要进行现场评估。"
      },
      "For many smaller painting and wall repair tasks, photos are a good starting point. More complex, moisture-related or larger surface jobs may need an on-site assessment for a reliable decision.": {
          "de": "Für viele kleinere Maler- und Wandreparaturarbeiten sind Fotos ein guter Ausgangspunkt. Komplexere, feuchtigkeitsbedingte oder größere Oberflächenarbeiten erfordern möglicherweise eine Beurteilung vor Ort, um eine zuverlässige Entscheidung zu treffen.",
          "zh-CN": "对于许多较小的绘画和墙壁修复任务，照片是一个很好的起点。更复杂、与湿度相关或更大的地面作业可能需要现场评估才能做出可靠的决定。",
          "uk": "Для багатьох невеликих завдань з фарбування та ремонту стін фотографії є ​​хорошою відправною точкою. Більш складні, пов’язані з вологістю роботи або роботи з більшою поверхнею можуть потребувати оцінки на місці для прийняття надійного рішення."
      },
      "For owners abroad and property managers, it is especially useful when the starting condition and final result can be checked with photos.": {
          "de": "Für Eigentümer im Ausland und Immobilienverwalter ist es besonders nützlich, wenn Ausgangszustand und Endergebnis anhand von Fotos überprüft werden können.",
          "uk": "Для власників за кордоном і менеджерів нерухомості це особливо корисно, коли початковий стан і кінцевий результат можна перевірити за допомогою фотографій.",
          "zh-CN": "对于国外的业主和物业管理者来说，当可以通过照片检查开始条件和最终结果时，这尤其有用。"
      },
      "For remote coordination, photo updates, arranged access and decision points that remain easy to follow.": {
          "de": "Für die Koordination aus der Ferne, Foto-Updates, geordnete Zugänge und Entscheidungspunkte, die leicht zu verfolgen sind.",
          "zh-CN": "用于远程协调、照片更新、安排的访问和决策点，这些都易于遵循。",
          "uk": "Для віддаленої координації, оновлення фотографій, організований доступ і точки прийняття рішень, за якими легко стежити."
      },
      "For remotely coordinated cleaning, photos can show that the critical areas have been brought into a clean, presentable condition.": {
          "de": "Bei einer aus der Ferne koordinierten Reinigung können Fotos zeigen, dass die kritischen Bereiche in einen sauberen, vorzeigbaren Zustand gebracht wurden.",
          "uk": "Для дистанційно скоординованого прибирання фотографії можуть показати, що критичні ділянки приведені в чистий, презентабельний стан.",
          "zh-CN": "对于远程协调清洁，照片可以显示关键区域已达到干净、美观的状态。"
      },
      "For small repairs, the most important part is clarity from the start: what the issue is, where it is, how access works and what result is expected.": {
          "uk": "Для дрібного ремонту найважливішою частиною є ясність із самого початку: у чому проблема, де вона знаходиться, як працює доступ і який результат очікується.",
          "zh-CN": "对于小型维修来说，最重要的部分是从一开始就明确：问题是什么、问题出在哪里、访问方式如何以及预期的结果。",
          "de": "Bei kleinen Reparaturen kommt es vor allem auf die Klarheit von Anfang an an: Wo liegt das Problem, wie funktioniert der Zugang und welches Ergebnis ist zu erwarten?"
      },
      "For the fastest start, send 2-3 photos, the Sopron address or area, access details and your preferred timing. We will respond with what is still needed and what the realistic next step can be.": {
          "de": "Für den schnellsten Start senden Sie 2-3 Fotos, die Soproner Adresse oder die Gegend, Zugangsdaten und Ihren bevorzugten Zeitpunkt. Wir werden antworten, was noch benötigt wird und was der realistische nächste Schritt sein kann.",
          "zh-CN": "为了最快开始，请发送 2-3 张照片、肖普朗地址或地区、访问详细信息和您首选的时间。我们将回应仍然需要什么以及下一步可以采取的实际行动。",
          "uk": "Щоб якнайшвидше почати, надішліть 2-3 фотографії, адресу або територію Шопрона, дані доступу та бажаний час. Ми відповімо тим, що ще потрібно, і яким може бути реалістичний наступний крок."
      },
      "For wall marks, small damage, tired surfaces and a fast, tidy refresh before photography or guest arrival.": {
          "de": "Für Wandflecken, kleine Schäden, müde Oberflächen und eine schnelle, saubere Auffrischung vor dem Fotografieren oder der Ankunft von Gästen.",
          "zh-CN": "针对墙壁痕迹、小损坏、磨损表面以及在拍照或客人抵达之前快速、整洁地恢复。",
          "uk": "Для слідів на стінах, невеликих пошкоджень, втомлених поверхонь і швидкого охайного оновлення перед фотографуванням або приходом гостей."
      },
      "Foreign owner": {
          "de": "Eigentümer im Ausland",
          "uk": "Власник за кордоном",
          "zh-CN": "海外业主"
      },
      "Foreign property owners": {
          "zh-CN": "外国业主",
          "de": "Ausländische Immobilienbesitzer",
          "uk": "Іноземні власники нерухомості"
      },
      "Fresh coat": {
          "zh-CN": "新外套",
          "de": "Frischer Mantel",
          "uk": "Свіже пальто"
      },
      "From first message to an organised job": {
          "uk": "Від першого повідомлення до організованої роботи",
          "de": "Von der ersten Nachricht bis zum organisierten Job",
          "zh-CN": "从第一条消息到有组织的工作"
      },
      "From overgrown courtyard to a cared-for arrival": {
          "uk": "Від зарослого подвір’я до доглянутішого входу",
          "de": "Vom überwucherten Hof zu einem gepflegteren Ankommen",
          "zh-CN": "从杂草丛生的庭院到更整洁的到达印象"
      },
      "From tired walls to a clean finish": {
          "uk": "Від втомлених стін до чистої обробки",
          "de": "Von müden Wänden bis hin zu einem sauberen Finish",
          "zh-CN": "从陈旧的墙壁到干净的饰面"
      },
      "Furniture assembly": {
          "zh-CN": "家具组装",
          "de": "Möbelmontage",
          "uk": "Збірка меблів"
      },
      "Garden": {
          "de": "Garten",
          "uk": "Сад",
          "zh-CN": "花园"
      },
      "Garden / outdoor": {
          "uk": "Сад / відкритий",
          "de": "Garten / Außenbereich",
          "zh-CN": "花园/户外"
      },
      "Garden and outdoor clean-up": {
          "uk": "Прибирання саду та надворі",
          "zh-CN": "花园和室外清洁",
          "de": "Aufräumarbeiten im Garten und Außenbereich"
      },
      "Garden and property maintenance": {
          "uk": "Догляд за садом та майном",
          "zh-CN": "花园和物业维护",
          "de": "Garten- und Grundstückspflege"
      },
      "Garden photos": {
          "uk": "Фотографії саду",
          "de": "Gartenfotos",
          "zh-CN": "花园照片"
      },
      "Glass and mirrors": {
          "uk": "Скло і дзеркала",
          "de": "Glas und Spiegel",
          "zh-CN": "玻璃和镜子"
      },
      "Good maintenance starts with visible tasks, clear decisions and work that does not require constant chasing. Scope is agreed around the property, current condition, access and timing.": {
          "de": "Gute Instandhaltung beginnt mit sichtbaren Aufgaben, klaren Entscheidungen und Arbeiten, die kein ständiges Verfolgen erfordern. Der Umfang wird rund um die Immobilie, den aktuellen Zustand, die Zufahrt und den Zeitpunkt vereinbart.",
          "uk": "Добре обслуговування починається з видимих ​​завдань, чітких рішень і роботи, яка не вимагає постійної гонитви. Обсяг узгоджується щодо майна, поточного стану, доступу та часу.",
          "zh-CN": "良好的维护始于可见的任务、明确的决策和不需要不断追逐的工作。范围围绕财产、现状、通道和时间达成一致。"
      },
      "Guest-ready presentation, quick coordination and attention to visible details.": {
          "de": "Gästegerechte Präsentation, schnelle Koordination und Aufmerksamkeit für sichtbare Details.",
          "uk": "Гостьова презентація, швидка координація та увага до видимих ​​деталей.",
          "zh-CN": "为宾客准备的演示、快速协调和对可见细节的关注。"
      },
      "Handles, minor lock-area issues, door adjustment, hinges, screws or small hardware fixes when the task does not require specialist replacement.": {
          "de": "Griffe, kleinere Probleme im Schlossbereich, Türverstellung, Scharniere, Schrauben oder kleine Reparaturen an Hardware, wenn die Aufgabe keinen Austausch durch einen Fachmann erfordert.",
          "uk": "Ручки, незначні проблеми із зоною замка, регулювання дверей, петлі, гвинти або дрібні ремонти фурнітури, коли завдання не вимагає заміни спеціаліста.",
          "zh-CN": "当任务不需要专业人员更换时，手柄、较小的锁定区域问题、门调节、铰链、螺钉或小型硬件修复。"
      },
      "Handling small drywall damage, edge defects, surface dents and practical repair items before painting.": {
          "uk": "Обробка невеликих пошкоджень гіпсокартону, дефектів країв, поверхневих вм’ятин і практичних предметів ремонту перед фарбуванням.",
          "de": "Behandeln kleiner Schäden an Trockenbauwänden, Kantendefekten, Oberflächenbeulen und praktischen Reparaturartikeln vor dem Lackieren.",
          "zh-CN": "涂漆前处理小的干墙损坏、边缘缺陷、表面凹痕和实际维修项目。"
      },
      "Handyman services": {
          "uk": "Послуги різноробочого",
          "zh-CN": "杂工服务",
          "de": "Handwerkerdienstleistungen"
      },
      "Handyman services page": {
          "uk": "Сторінка послуг різноробочих",
          "zh-CN": "杂工服务页面",
          "de": "Seite für Handwerkerdienstleistungen"
      },
      "Hedge trimming": {
          "de": "Heckenschnitt",
          "uk": "Стрижка живоплоту",
          "zh-CN": "绿篱修剪"
      },
      "Hedges, grass, shrubs and outdoor order.": {
          "de": "Hecken, Gras, Sträucher und Ordnung im Freien.",
          "zh-CN": "树篱、草地、灌木和户外秩序。",
          "uk": "Живі огорожі, трава, кущі та зовнішній порядок."
      },
      "Holiday home cleaning": {
          "zh-CN": "度假屋清洁",
          "de": "Reinigung von Ferienhäusern",
          "uk": "Прибирання дачного будинку"
      },
      "Holiday home cleaning for Sopron apartments used periodically, before owner visits or after a longer empty period.": {
          "uk": "Прибирання квартир у Шопроні, яке використовується періодично, перед візитами власника або після тривалого періоду порожнього.",
          "de": "Ferienhausreinigung für Soproner Wohnungen, die regelmäßig genutzt werden, vor Eigentümerbesuchen oder nach einer längeren Leerlaufzeit.",
          "zh-CN": "在业主来访之前或长时间空置之后，定期对肖普朗公寓进行度假屋清洁。"
      },
      "How is pricing established?": {
          "de": "Wie erfolgt die Preisfestsetzung?",
          "uk": "Як встановлюється ціноутворення?",
          "zh-CN": "定价是如何制定的？"
      },
      "How often should a garden be maintained?": {
          "de": "Wie oft sollte ein Garten gepflegt werden?",
          "zh-CN": "花园应该多久维护一次？",
          "uk": "Як часто потрібно доглядати за садом?"
      },
      "How should I start a quote request?": {
          "de": "Wie soll ich eine Angebotsanfrage starten?",
          "zh-CN": "我应该如何开始报价请求？",
          "uk": "Як розпочати запит пропозиції?"
      },
      "How should I start the enquiry?": {
          "de": "Wie soll ich die Anfrage starten?",
          "zh-CN": "我应该如何开始查询？",
          "uk": "Як почати запит?"
      },
      "If a new issue appears that was not visible in the earlier photos, it is raised and discussed separately. The scope does not change automatically without a clear next step.": {
          "uk": "Якщо з'являється нова проблема, яка не була помітна на попередніх фотографіях, вона піднімається та обговорюється окремо. Область не змінюється автоматично без чіткого наступного кроку.",
          "de": "Wenn ein neues Problem auftritt, das auf den früheren Fotos nicht sichtbar war, wird es gesondert angesprochen und besprochen. Der Umfang ändert sich nicht automatisch ohne einen klaren nächsten Schritt.",
          "zh-CN": "如果出现之前照片中看不到的新问题，则会单独提出并进行讨论。如果没有明确的下一步，范围不会自动改变。"
      },
      "If a small repair issue is noticed during cleaning, it is flagged separately rather than mixed into the cleaning scope.": {
          "uk": "Якщо під час очищення помічається невелика проблема ремонту, вона позначається окремо, а не змішується з обсягом очищення.",
          "de": "Wenn während der Reinigung ein kleines Reparaturproblem festgestellt wird, wird es separat gekennzeichnet und nicht in den Reinigungsumfang aufgenommen.",
          "zh-CN": "如果在清洁过程中发现小的维修问题，则会单独标记，而不是混入清洁范围。"
      },
      "If the job includes multi-room painting, larger wall repair, regular checks, garden care or a broader pre-handover scope, the property maintenance service may be more practical. In that case, the tasks are best organised into a wider list.": {
          "de": "Wenn der Auftrag mehrere Räume streichen, größere Wandreparaturen, regelmäßige Kontrollen, Gartenpflege oder einen größeren Umfang vor der Übergabe umfasst, ist der Hauswartungsdienst möglicherweise praktischer. In diesem Fall werden die Aufgaben am besten in einer größeren Liste organisiert.",
          "uk": "Якщо робота включає фарбування кількох приміщень, великий ремонт стін, регулярні перевірки, догляд за садом або ширший обсяг перед передачею, послуга з обслуговування нерухомості може бути більш практичною. У такому випадку завдання найкраще організувати у ширший список.",
          "zh-CN": "如果工作包括多房间油漆、较大的墙壁维修、定期检查、花园护理或更广泛的交房前范围，则物业维修服务可能更实用。在这种情况下，最好将任务组织成更广泛的列表。"
      },
      "Illustrative work examples": {
          "uk": "Наочні приклади робіт",
          "de": "Anschauliche Arbeitsbeispiele",
          "zh-CN": "说明性工作示例"
      },
      "Important stages remain visible.": {
          "uk": "Важливі етапи залишаються видимими.",
          "de": "Wichtige Etappen bleiben sichtbar.",
          "zh-CN": "重要阶段仍然可见。"
      },
      "Installing shelves, pictures, curtain rails, brackets and small supports, discussed around wall type and intended use.": {
          "uk": "Встановлення полиць, картин, карнизів, кронштейнів і невеликих опор, обговорюваних навколо типу стіни та призначення.",
          "de": "Installation von Regalen, Bildern, Vorhangschienen, Halterungen und kleinen Stützen, besprochen hinsichtlich Wandtyp und Verwendungszweck.",
          "zh-CN": "安装架子、图片、窗帘导轨、支架和小支架，围绕墙壁类型和预期用途进行讨论。"
      },
      "Interior apartment ceiling area": {
          "uk": "Внутрішня площа стелі квартири",
          "de": "Innendeckenbereich der Wohnung",
          "zh-CN": "室内公寓天花板面积"
      },
      "Interior painting": {
          "de": "Innenanstrich",
          "zh-CN": "室内涂装",
          "uk": "Внутрішнє фарбування"
      },
      "Interior painting and wall refresh": {
          "de": "Innenanstrich und Wandauffrischung",
          "uk": "Внутрішнє фарбування та оновлення стін",
          "zh-CN": "室内油漆和墙面翻新"
      },
      "International companies and offices": {
          "de": "Internationale Unternehmen und Büros",
          "uk": "Міжнародні компанії та офіси",
          "zh-CN": "国际公司和办事处"
      },
      "international environment": {
          "de": "internationales Umfeld",
          "uk": "міжнародне середовище",
          "zh-CN": "国际环境"
      },
      "Is green waste removal included?": {
          "de": "Ist die Grünabfallentsorgung inbegriffen?",
          "uk": "Чи включено вивіз зеленого сміття?",
          "zh-CN": "是否包括绿色垃圾清除？"
      },
      "It depends on capacity, apartment size, drying time and access. For short deadlines, include the guest arrival or photo session date in the first message.": {
          "uk": "Це залежить від потужності, розміру квартири, часу висихання та доступу. Для коротких термінів в першому повідомленні вкажіть дату приїзду гостя або фотосесії.",
          "de": "Es hängt von der Kapazität, der Wohnungsgröße, der Trocknungszeit und der Zugänglichkeit ab. Geben Sie bei kurzen Fristen in der ersten Nachricht das Datum der Ankunft des Gastes oder des Fototermins an.",
          "zh-CN": "这取决于容量、公寓大小、干燥​​时间和通道。对于较短的期限，请在第一条消息中注明客人抵达或拍照日期。"
      },
      "It depends on the garden size, lawn growth, hedge condition and how the property is used. In spring and summer, mowing and edging may be needed more often, while autumn usually brings leaf and green waste cleanup into focus.": {
          "zh-CN": "这取决于花园的大小、草坪的生长、树篱状况以及财产的使用方式。在春季和夏季，可能需要更频繁地割草和修边，而秋季通常会重点关注树叶和绿色废物的清理。",
          "uk": "Це залежить від розміру саду, росту газону, стану живоплоту та способу використання майна. Навесні та влітку косіння та обрізка може знадобитися частіше, тоді як восени зазвичай привертає увагу прибирання листя та зелених відходів.",
          "de": "Es hängt von der Gartengröße, dem Rasenwachstum, dem Zustand der Hecke und der Nutzung des Grundstücks ab. Im Frühling und Sommer kann das Mähen und Kantenschneiden häufiger erforderlich sein, während im Herbst meist die Beseitigung von Laub und Grünabfällen im Vordergrund steht."
      },
      "Kitchen": {
          "de": "Küche",
          "uk": "Кухня",
          "zh-CN": "厨房"
      },
      "Kitchen and surfaces": {
          "uk": "Кухня та поверхні",
          "de": "Küche und Oberflächen",
          "zh-CN": "厨房和表面"
      },
      "Lawn and edges": {
          "uk": "Газон і узлісся",
          "de": "Rasen und Kanten",
          "zh-CN": "草坪和边缘"
      },
      "Leaves and green waste": {
          "uk": "Листя та зелені відходи",
          "de": "Blätter und Grünabfälle",
          "zh-CN": "树叶和绿色废物"
      },
      "Living rooms, bedrooms, hallways, smaller offices, rental apartments and guest-facing spaces can be discussed. Feasibility is confirmed based on size, condition and timing.": {
          "de": "Wohnzimmer, Schlafzimmer, Flure, kleinere Büros, Mietwohnungen und Räume mit Blick auf die Gäste können besprochen werden. Die Machbarkeit wird anhand von Größe, Zustand und Zeitpunkt bestätigt.",
          "zh-CN": "客厅、卧室、走廊、小型办公室、出租公寓和面向客人的空间都可以讨论。根据规模、条件和时间确认可行性。",
          "uk": "Можуть обговорюватися вітальні, спальні, коридори, невеликі офіси, орендовані квартири та гостьові простори. Здійсненність підтверджується на основі розміру, стану та часу."
      },
      "Local Sopron knowledge": {
          "uk": "Знання місцевого Шопрона",
          "de": "Lokale Sopron-Kenntnisse",
          "zh-CN": "肖普朗当地知识"
      },
      "Loose fittings, wall marks, handles, small defects and presentation touch-ups discovered after guest stays.": {
          "zh-CN": "客人入住后发现的配件松动、墙壁痕迹、把手、小缺陷和展示修饰。",
          "uk": "Нещільні кріплення, сліди від стін, ручки, дрібні дефекти та підправки, виявлені після перебування гостей.",
          "de": "Lose Beschläge, Wandspuren, Griffe, kleine Mängel und Nachbesserungen an der Präsentation, die nach Aufenthalten von Gästen entdeckt wurden."
      },
      "Loose items, small defects, wall marks, trims, fittings and visible but manageable issues before handover or guest arrival.": {
          "zh-CN": "物品松动、小缺陷、墙壁痕迹、装饰、配件以及移交或客人抵达之前可见但可管理的问题。",
          "uk": "Розхитані предмети, дрібні дефекти, сліди на стінах, оздоблення, фурнітура та видимі, але врегульовані проблеми до передачі або прибуття гостя.",
          "de": "Lose Gegenstände, kleine Mängel, Wandspuren, Verzierungen, Beschläge und sichtbare, aber beherrschbare Probleme vor der Übergabe oder Ankunft des Gastes."
      },
      "Minor handle, hinge, screw or lock-area issues can be discussed. Lock replacement, security locks, electrical faults or regulated specialist work may require a dedicated professional.": {
          "uk": "Незначні проблеми з ручкою, петлею, гвинтом або зоною замка можна обговорити. Для заміни замків, замків безпеки, несправностей електрики або регламентованих спеціалізованих робіт може знадобитися відданий фахівець.",
          "zh-CN": "可以讨论小的手柄、铰链、螺钉或锁定区域问题。更换锁、安全锁、电气故障或受监管的专业工作可能需要专门的专业人员。",
          "de": "Kleinere Probleme mit Griffen, Scharnieren, Schrauben oder dem Schlossbereich können besprochen werden. Der Austausch von Schlössern, Sicherheitsschlössern, elektrische Störungen oder vorgeschriebene Facharbeiten erfordern möglicherweise einen engagierten Fachmann."
      },
      "Minor repairs, wall refreshes and fittings can be scheduled around normal operations. The goal is to restore an orderly environment without unnecessary disruption.": {
          "zh-CN": "小修、墙壁翻新和安装可以安排在正常运营期间。目标是恢复有序的环境，避免不必要的干扰。",
          "de": "Kleinere Reparaturen, Wanderneuerungen und Anpassungen können rund um den normalen Betrieb geplant werden. Ziel ist es, eine geordnete Umgebung ohne unnötige Störungen wiederherzustellen.",
          "uk": "Дрібний ремонт, оновлення стін і оздоблення можна запланувати в рамках звичайної роботи. Мета полягає в тому, щоб відновити впорядковане середовище без непотрібних порушень."
      },
      "Minor wall repairs, painting and fittings can be scheduled around daily operations and access requirements.": {
          "zh-CN": "小型墙壁维修、油漆和安装可以根据日常运营和出入要求安排。",
          "de": "Kleinere Wandreparaturen, Maler- und Montagearbeiten können entsprechend den täglichen Abläufen und Zugangsanforderungen geplant werden.",
          "uk": "Дрібний ремонт стін, фарбування та монтаж можна запланувати відповідно до щоденних операцій і вимог доступу."
      },
      "Mirrors, glass, fingerprints and surfaces that show immediately in photos or viewings.": {
          "zh-CN": "在照片或视图中立即显示的镜子、玻璃、指纹和表面。",
          "de": "Spiegel, Glas, Fingerabdrücke und Oberflächen, die auf Fotos oder Betrachtungen sofort sichtbar sind.",
          "uk": "Дзеркала, скло, відбитки пальців і поверхні, які відразу видно на фотографіях або оглядах."
      },
      "Most enquiries come when an apartment needs to be rented again, guests are arriving, an office visit is planned or marked walls are hurting the overall presentation. In these moments, clean and well-coordinated repair work matters.": {
          "uk": "Більшість запитів надходить, коли потрібно знову орендувати квартиру, прибувають гості, запланований візит до офісу або розмічені стіни шкодять загальному вигляду. У ці моменти важливі чисті та злагоджені ремонтні роботи.",
          "zh-CN": "大多数询问是在公寓需要再次出租、客人到来、计划参观办公室或标记的墙壁损害整体展示时出现的。在这些时刻，干净且协调良好的维修工作至关重要。",
          "de": "Die meisten Anfragen kommen, wenn eine Wohnung erneut vermietet werden muss, Gäste anreisen, ein Bürobesuch geplant ist oder markierte Wände das Gesamtbild beeinträchtigen. In diesen Momenten kommt es auf saubere und gut koordinierte Reparaturarbeiten an."
      },
      "Most maintenance tasks can start with a few photos, a short brief and clear access information. More complex or hidden issues may require an on-site assessment.": {
          "uk": "Більшість завдань з технічного обслуговування можна розпочати з кількох фотографій, короткої короткої та чіткої інформації про доступ. Більш складні або приховані проблеми можуть потребувати оцінки на місці.",
          "de": "Die meisten Wartungsaufgaben können mit ein paar Fotos, einer kurzen Beschreibung und klaren Zugangsinformationen beginnen. Komplexere oder versteckte Probleme erfordern möglicherweise eine Beurteilung vor Ort.",
          "zh-CN": "大多数维护任务可以从几张照片、简短的说明和清晰的访问信息开始。更复杂或隐藏的问题可能需要现场评估。"
      },
      "Move out cleaning Sopron and move-in preparation for empty or partly emptied apartments before handover, tenant change or sale viewing.": {
          "uk": "Прибирання Шопрона та підготовка до заїзду порожніх або частково порожніх квартир перед передачею, зміною орендаря або переглядом продажу.",
          "de": "Umzugsreinigung in Sopron und Einzugsvorbereitung für leerstehende oder teilentleerte Wohnungen vor Übergabe, Mieterwechsel oder Verkaufsbesichtigung.",
          "zh-CN": "在移交、更换租户或看房之前，对肖普朗进行搬出清洁工作，并为空置或部分空置的公寓做好搬入准备。"
      },
      "Mowing smaller gardens, apartment green areas, courtyards and outdoor spaces before rental or handover so the property looks better cared for.": {
          "uk": "Скошування невеликих садів, зелених насаджень у квартирах, внутрішніх дворів і відкритих приміщень перед здачею в оренду або передачею, щоб майно виглядало краще.",
          "de": "Mähen kleinerer Gärten, Wohnungsgrünflächen, Innenhöfe und Außenbereiche vor der Vermietung oder Übergabe, damit die Immobilie gepflegter aussieht.",
          "zh-CN": "在出租或移交之前修剪较小的花园、公寓绿地、庭院和室外空间，使房产看起来得到更好的照顾。"
      },
      "Mowing, hedge trimming, shrub pruning, green waste organisation and cleaner outdoor presentation for Sopron apartment buildings, offices and private homes.": {
          "uk": "Скошування, підстригання живоплоту, обрізка кущів, організація зелених відходів і чистіша зовнішня презентація для житлових будинків Шопрона, офісів і приватних будинків.",
          "zh-CN": "肖普朗公寓楼、办公室和私人住宅的割草、树篱修剪、灌木修剪、绿色废物整理和清洁户外展示。",
          "de": "Mähen, Heckenschneiden, Strauchschneiden, Grünabfallorganisation und sauberere Außenpräsentation für Soproner Wohnhäuser, Büros und Privathäuser."
      },
      "Mowing, hedge trimming, weed removal or seasonal cleanup follows the agreed list.": {
          "uk": "Скошування, стрижка живоплотів, видалення бур’янів або сезонне прибирання здійснюються за узгодженим списком.",
          "de": "Mähen, Heckenschneiden, Unkrautbeseitigung oder saisonale Aufräumarbeiten folgen der vereinbarten Liste.",
          "zh-CN": "割草、修剪树篱、除草或季节性清理均遵循商定的清单。"
      },
      "Mowing, pruning and tidying paths can restore an orderly, presentable outdoor area.": {
          "uk": "Скошування, обрізка та прибирання доріжок можуть відновити впорядкований, презентабельний зовнішній вигляд.",
          "de": "Durch Mähen, Beschneiden und Aufräumen von Wegen kann ein aufgeräumter, ansehnlicher Außenbereich wiederhergestellt werden.",
          "zh-CN": "修剪、修剪和整理道路可以恢复有序、美观的户外区域。"
      },
      "Neatening overgrown hedges, branches blocking entrances, untidy shrubs and visibly overgrown greenery in a controlled, practical way.": {
          "uk": "Прибирання зарослих живоплотів, гілок, що загороджують входи, неохайних кущів і помітно зарослої зелені, контрольованим практичним способом.",
          "de": "Beseitigen Sie überwucherte Hecken, Äste, die Eingänge versperren, unordentliche Sträucher und sichtbar überwuchertes Grün auf kontrollierte und praktische Weise.",
          "zh-CN": "以可控、实用的方式清理杂草丛生的树篱、堵塞入口的树枝、杂乱的灌木和明显杂草丛生的绿色植物。"
      },
      "Neglected yard or garden": {
          "uk": "Занедбаний двір або сад",
          "zh-CN": "被忽视的庭院或花园",
          "de": "Vernachlässigter Hof oder Garten"
      },
      "No hidden fees": {
          "de": "Keine versteckten Gebühren",
          "uk": "Без прихованих комісій",
          "zh-CN": "无隐藏费用"
      },
      "No. The images are illustrative examples showing typical starting conditions, work stages and expected outcomes. The scope for a specific property is always agreed from its actual condition and site requirements.": {
          "de": "Nein. Die Bilder sind illustrative Beispiele für typische Ausgangszustände, Arbeitsschritte und erwartbare Ergebnisse. Der konkrete Umfang wird immer anhand des tatsächlichen Zustands und der Anforderungen vor Ort abgestimmt.",
          "uk": "Ні. Зображення є ілюстративними прикладами типових початкових станів, етапів роботи та очікуваних результатів. Обсяг робіт для конкретної нерухомості завжди узгоджується за її фактичним станом і умовами на місці.",
          "zh-CN": "不是。图片仅为示意示例，用于展示典型的起始状态、工作阶段和预期效果。具体物业的工作范围始终根据实际状况和现场要求确认。"
      },
      "Not a showroom, but practical Sopron property use.": {
          "de": "Kein Ausstellungsraum, sondern praktische Immobiliennutzung in Sopron.",
          "uk": "Не виставковий зал, а практичне використання майна Шопрона.",
          "zh-CN": "不是陈列室，而是实用的肖普朗财产用途。"
      },
      "Office": {
          "de": "Büro",
          "uk": "Офіс",
          "zh-CN": "办公室"
      },
      "Office / representative space": {
          "de": "Büro-/Repräsentationsraum",
          "zh-CN": "办公室/代表空间",
          "uk": "Офіс / представницьке приміщення"
      },
      "Office cleaning Sopron for smaller offices, meeting rooms, representative spaces and work areas before visits or regular use.": {
          "uk": "Офісне прибирання Шопрон для невеликих офісів, конференц-залів, представницьких приміщень і робочих зон перед відвідуванням або регулярним використанням.",
          "de": "Büroreinigung Sopron für kleinere Büros, Besprechungsräume, repräsentative Räume und Arbeitsbereiche vor Besuchen oder regelmäßiger Nutzung.",
          "zh-CN": "在访问或定期使用之前，肖普朗办公室清洁小型办公室、会议室、代表空间和工作区域。"
      },
      "Office details": {
          "uk": "Офісні деталі",
          "zh-CN": "办公室详情",
          "de": "Bürodetails"
      },
      "Office or representative space before a visit": {
          "de": "Büro oder repräsentativer Raum vor einem Besuch",
          "uk": "Офіс або представницький простір перед візитом",
          "zh-CN": "来访前的办公室或接待空间"
      },
      "Office touch-up before a visit": {
          "uk": "Офісне ретушування перед візитом",
          "de": "Nachbesserung im Büro vor einem Besuch",
          "zh-CN": "拜访前办公室修饰"
      },
      "Offices and business spaces": {
          "uk": "Офіси та бізнес-приміщення",
          "de": "Büros und Geschäftsräume",
          "zh-CN": "办公室和商业空间"
      },
      "Offices and property managers": {
          "uk": "Менеджери офісів та майна",
          "de": "Büros und Immobilienverwalter",
          "zh-CN": "办公室和物业经理"
      },
      "Offices and representative properties": {
          "uk": "Офіси та представницька нерухомість",
          "de": "Büros und repräsentative Immobilien",
          "zh-CN": "办公室和代表性物业"
      },
      "Offices and representative spaces": {
          "uk": "Офіси та представницькі приміщення",
          "de": "Büros und repräsentative Räume",
          "zh-CN": "办公室和代表空间"
      },
      "Offices and representative spaces need quiet, organised work. The job should be short, discreet and clearly communicated.": {
          "de": "Büros und repräsentative Räume brauchen ruhiges, organisiertes Arbeiten. Der Job sollte kurz, diskret und klar kommuniziert sein.",
          "uk": "Офіси та представницькі приміщення потребують тихої, організованої роботи. Робота має бути короткою, стриманою та зрозумілою.",
          "zh-CN": "办公室和代表空间需要安静、有组织的工作。这项工作应该简短、谨慎且沟通清晰。"
      },
      "Often yes, especially if the kitchen, bathroom, floors, furniture level and problem areas are visible. Larger or unclear properties may need on-site clarification.": {
          "de": "Oft ja, insbesondere wenn Küche, Bad, Böden, Möbelebene und Problembereiche sichtbar sind. Größere oder unklare Objekte bedürfen möglicherweise einer Klärung vor Ort.",
          "uk": "Часто так, особливо якщо видно кухня, ванна кімната, підлоги, рівень меблів і проблемні місця. Для більших або незрозумілих властивостей може знадобитися уточнення на місці.",
          "zh-CN": "通常是的，特别是如果厨房、浴室、地板、家具水平和问题区域都可见的话。较大或不明确的财产可能需要现场澄清。"
      },
      "On request, key details can be documented with photos so you can see what happened on site remotely.": {
          "de": "Auf Wunsch können wichtige Details mit Fotos dokumentiert werden, sodass Sie aus der Ferne sehen können, was vor Ort passiert ist.",
          "uk": "За запитом ключові деталі можуть бути задокументовані фотографіями, щоб ви могли віддалено побачити, що сталося на місці.",
          "zh-CN": "根据要求，可以用照片记录关键细节，以便您可以远程查看现场发生的情况。"
      },
      "On request, photos can show important steps and the finished, orderly condition.": {
          "zh-CN": "根据要求，照片可以显示重要步骤以及完成后的有序状态。",
          "de": "Auf Wunsch zeigen Fotos wichtige Arbeitsschritte und den fertigen, geordneten Zustand.",
          "uk": "За бажанням на фотографіях можуть бути показані важливі кроки та готовий, упорядкований стан."
      },
      "On request, photos can show the finished condition and any later maintenance step that may make sense.": {
          "zh-CN": "根据要求，照片可以显示完工状况以及任何可能有意义的后续维护步骤。",
          "de": "Auf Wunsch zeigen Fotos den fertigen Zustand und ggf. sinnvolle spätere Wartungsschritte.",
          "uk": "За запитом фотографії можуть показати готовий стан і будь-які наступні етапи технічного обслуговування, які можуть мати сенс."
      },
      "On request, photos can show the starting condition, key work stage and tidier final result.": {
          "zh-CN": "根据要求，照片可以显示开始情况、关键工作阶段和更整洁的最终结果。",
          "de": "Auf Wunsch zeigen Fotos den Ausgangszustand, wichtige Arbeitsschritte und ein aufgeräumteres Endergebnis.",
          "uk": "За запитом фотографії можуть показати початковий стан, ключову стадію роботи та більш акуратний кінцевий результат."
      },
      "On-site work is handled within an agreed arrival window, with timely updates if weather requires a change.": {
          "zh-CN": "现场工作在约定的到达窗口内进行，如果天气需要变化，则及时更新。",
          "de": "Die Arbeiten vor Ort werden innerhalb eines vereinbarten Ankunftsfensters erledigt, mit zeitnahen Updates, wenn das Wetter eine Änderung erfordert.",
          "uk": "Робота на місці виконується в межах узгодженого вікна прибуття з своєчасним оновленням, якщо погода вимагає зміни."
      },
      "Open visual example": {
          "de": "Bildbeispiel öffnen",
          "uk": "Відкрити візуальний приклад",
          "zh-CN": "打开视觉示例"
      },
      "Orderly handover": {
          "uk": "Упорядкована передача",
          "zh-CN": "有序交接",
          "de": "Ordentliche Übergabe"
      },
      "Orderly surfaces and a cleaner overall impression.": {
          "de": "Geordnete Oberflächen und ein saubererer Gesamteindruck.",
          "uk": "Упорядковані поверхні та чистіше загальне враження.",
          "zh-CN": "有序的表面和干净的整体印象。"
      },
      "Organised on-site visit": {
          "uk": "Організований виїзд на місце",
          "de": "Organisierter Besuch vor Ort",
          "zh-CN": "组织实地考察"
      },
      "Organised on-site work": {
          "uk": "Організована робота на місці",
          "de": "Organisierte Arbeit vor Ort",
          "zh-CN": "组织现场工作"
      },
      "Organised, trackable support for smaller repairs when on-site operation and timing both matter.": {
          "de": "Organisierte, nachverfolgbare Unterstützung für kleinere Reparaturen, bei denen es sowohl auf den Einsatz vor Ort als auch auf das Timing ankommt.",
          "zh-CN": "当现场操作和时间安排都很重要时，为小型维修提供有组织、可追踪的支持。",
          "uk": "Організована, відстежувана підтримка для невеликих ремонтів під час роботи на місці та час мають значення."
      },
      "owner / manager": {
          "zh-CN": "业主/经理",
          "de": "Eigentümer/Manager",
          "uk": "власник / менеджер"
      },
      "owner preparation": {
          "zh-CN": "业主准备",
          "de": "Vorbereitung des Eigentümers",
          "uk": "підготовка власника"
      },
      "Owners, managers and local contacts can follow the important information clearly.": {
          "de": "Eigentümer, Manager und lokale Ansprechpartner können die wichtigen Informationen klar verfolgen.",
          "zh-CN": "业主、经理和当地联系人可以清楚地了解重要信息。",
          "uk": "Власники, менеджери та місцеві контакти можуть чітко стежити за важливою інформацією."
      },
      "Painting": {
          "de": "Malerarbeiten",
          "uk": "Фарбування",
          "zh-CN": "粉刷"
      },
      "Painting / wall repair": {
          "zh-CN": "油漆/墙面维修",
          "de": "Maler-/Wandreparatur",
          "uk": "Фарбування / ремонт стін"
      },
      "Painting, drywall, garden care, small repairs": {
          "zh-CN": "油漆、干墙、花园护理、小修缮",
          "uk": "Фарбування, гіпсокартон, догляд за садом, дрібний ремонт",
          "de": "Malerarbeiten, Trockenbau, Gartenpflege, Kleinreparaturen"
      },
      "Painting, repairs, garden care and property maintenance": {
          "de": "Malerarbeiten, Reparaturen, Gartenpflege und Grundstückspflege",
          "zh-CN": "油漆、维修、花园护理和财产维护",
          "uk": "Фарбування, ремонт, догляд за садом та майном"
      },
      "Painting, wall repairs and property maintenance": {
          "de": "Malerarbeiten, Wandreparaturen und Grundstückspflege",
          "uk": "Фарбування, ремонт стін та обслуговування нерухомості",
          "zh-CN": "油漆、墙壁维修和物业维护"
      },
      "Path and paving cleanup": {
          "uk": "Прибирання доріжок та бруківки",
          "de": "Wege- und Pflasterreinigung",
          "zh-CN": "道路和铺路清理"
      },
      "phases": {
          "de": "Phasen",
          "zh-CN": "阶段",
          "uk": "фази"
      },
      "Photo condition update": {
          "uk": "Оновлення стану фото",
          "de": "Aktualisierung des Fotozustands",
          "zh-CN": "照片状况更新"
      },
      "Photo condition updates": {
          "de": "Aktualisierungen des Fotozustands",
          "zh-CN": "照片状况更新",
          "uk": "Оновлення стану фото"
      },
      "Photo updates can be sent on request, and visible maintenance issues can be flagged separately.": {
          "de": "Fotoaktualisierungen können auf Anfrage gesendet werden und sichtbare Wartungsprobleme können separat gekennzeichnet werden.",
          "uk": "Оновлення фотографій можна надіслати за запитом, а видимі проблеми з обслуговуванням можна позначити окремо.",
          "zh-CN": "可以根据要求发送照片更新，并且可以单独标记可见的维护问题。"
      },
      "Photo updates can help you follow the issue, the task and the finished condition remotely.": {
          "de": "Mithilfe von Fotoaktualisierungen können Sie das Problem, die Aufgabe und den fertigen Zustand aus der Ferne verfolgen.",
          "uk": "Оновлення фотографій може допомогти вам дистанційно стежити за проблемою, завданням і готовим станом.",
          "zh-CN": "照片更新可以帮助您远程跟踪问题、任务和完成情况。"
      },
      "Photo updates can show the starting condition, important details and the handover-ready result.": {
          "de": "Foto-Updates können den Ausgangszustand, wichtige Details und das übergabefertige Ergebnis zeigen.",
          "uk": "Оновлені фотографії можуть показувати початковий стан, важливі деталі та результат, готовий до передачі.",
          "zh-CN": "照片更新可以显示起始条件、重要细节和移交准备结果。"
      },
      "Photo updates can show the starting condition, key outdoor work and the finished, tidier result.": {
          "de": "Fotoaktualisierungen können den Ausgangszustand, wichtige Außenarbeiten und das fertige, aufgeräumtere Ergebnis zeigen.",
          "zh-CN": "照片更新可以显示开始条件、关键的户外工作以及完成的、更整洁的结果。",
          "uk": "Оновлені фотографії можуть показати початковий стан, ключову роботу на відкритому повітрі та готовий, охайніший результат."
      },
      "Photo updates can show the starting condition, key work stages and the final handover.": {
          "zh-CN": "照片更新可以显示启动情况、关键工作阶段和最终移交。",
          "de": "Fotoaktualisierungen können den Ausgangszustand, wichtige Arbeitsschritte und die endgültige Übergabe zeigen.",
          "uk": "Оновлені фотографії можуть показати початковий стан, основні етапи роботи та остаточну здачу."
      },
      "Photo updates can show the starting condition, repair steps and the clean finished result after painting.": {
          "zh-CN": "照片更新可以显示开始状态、修复步骤以及喷漆后干净的成品结果。",
          "de": "Fotoaktualisierungen können den Ausgangszustand, Reparaturschritte und das saubere Endergebnis nach dem Lackieren zeigen.",
          "uk": "Оновлені фотографії можуть показувати початковий стан, етапи ремонту та чистий готовий результат після фарбування."
      },
      "photos": {
          "de": "Fotos",
          "uk": "фотографії",
          "zh-CN": "照片"
      },
      "Photos": {
          "de": "Fotos",
          "uk": "Фото",
          "zh-CN": "照片"
      },
      "Photos and goal": {
          "de": "Fotos und Ziel",
          "zh-CN": "照片和目标",
          "uk": "Фото і гол"
      },
      "Photos can be sent at key stages so the owner, manager or office contact can follow what happened on site, even remotely.": {
          "de": "In wichtigen Phasen können Fotos gesendet werden, sodass der Eigentümer, Manager oder Bürokontakt das Geschehen vor Ort auch aus der Ferne verfolgen kann.",
          "uk": "Фотографії можна надсилати на ключових етапах, щоб власник, керівник або контактна особа в офісі могли стежити за тим, що відбувається на місці, навіть віддалено.",
          "zh-CN": "可以在关键阶段发送照片，以便业主、经理或办公室联系人可以了解现场发生的情况，甚至可以远程了解。"
      },
      "Photos can document important details on request, especially useful for owners living abroad.": {
          "uk": "Фотографії можуть документувати важливі деталі за запитом, особливо корисні для власників, які живуть за кордоном.",
          "de": "Fotos können auf Wunsch wichtige Details dokumentieren, was besonders für im Ausland lebende Eigentümer nützlich ist.",
          "zh-CN": "照片可以根据要求记录重要细节，对于居住在国外的业主尤其有用。"
      },
      "Photos, a clear task list and agreed next steps.": {
          "de": "Fotos, eine klare Aufgabenliste und vereinbarte nächste Schritte.",
          "zh-CN": "照片、清晰的任务清单和商定的后续步骤。",
          "uk": "Фотографії, чіткий список завдань та узгоджені наступні кроки."
      },
      "Photos, a short task list and a clear next step.": {
          "de": "Fotos, eine kurze Aufgabenliste und ein klarer nächster Schritt.",
          "zh-CN": "照片、简短的任务列表和明确的下一步。",
          "uk": "Фотографії, короткий список завдань і чіткий наступний крок."
      },
      "Photos, access, timing and handover kept clear even from abroad.": {
          "de": "Fotos, Zufahrt, Zeitpunkt und Übergabe bleiben auch aus dem Ausland klar.",
          "zh-CN": "即使在国外，照片、访问、时间和交接也清晰可见。",
          "uk": "Фотографії, доступ, час і передача залишаються чіткими навіть з-за кордону."
      },
      "Photos, location and timing": {
          "zh-CN": "照片、地点和时间",
          "uk": "Фото, місце та час",
          "de": "Fotos, Ort und Zeitpunkt"
      },
      "Pictures, shelves, curtain rails and small supports.": {
          "de": "Bilder, Regale, Vorhangschienen und kleine Stützen.",
          "zh-CN": "图片、架子、窗帘导轨和小支架。",
          "uk": "Картини, полички, карнизи і невеликі підставки."
      },
      "planned around guest arrival": {
          "uk": "планується навколо прибуття гостей",
          "de": "geplant um die Ankunft der Gäste herum",
          "zh-CN": "计划在客人抵达时进行"
      },
      "Plastering": {
          "de": "Verputzen",
          "zh-CN": "抹灰",
          "uk": "Оштукатурювання"
      },
      "Post-renovation dust": {
          "zh-CN": "装修后灰尘",
          "uk": "Пил після ремонту",
          "de": "Staub nach der Renovierung"
      },
      "Practical answers about assessment, pricing, timing and remote coordination.": {
          "de": "Praktische Antworten zu Bewertung, Preisgestaltung, Zeitplanung und Fernkoordination.",
          "uk": "Практичні відповіді про оцінку, ціноутворення, терміни та дистанційну координацію.",
          "zh-CN": "有关评估、定价、时间安排和远程协调的实用答案。"
      },
      "Practical issue spotting": {
          "zh-CN": "实际问题发现",
          "de": "Praktische Problemerkennung",
          "uk": "Практичний пошук проблем"
      },
      "Practical maintenance for city apartments, rentals, courtyards, offices and representative spaces.": {
          "de": "Praktische Pflege für Stadtwohnungen, Mietwohnungen, Innenhöfe, Büros und repräsentative Räume.",
          "uk": "Практичне обслуговування міських квартир, оренди, дворів, офісів та представницьких приміщень.",
          "zh-CN": "城市公寓、出租屋、庭院、办公室和代表空间的实用维护。"
      },
      "Practical problem solving": {
          "de": "Praktische Problemlösung",
          "uk": "Практичне вирішення задач",
          "zh-CN": "实际问题解决"
      },
      "Practical wall repair without unnecessary major renovation.": {
          "zh-CN": "实用的墙壁修复，无需不必要的大修。",
          "de": "Praktische Wandreparatur ohne unnötige große Renovierung.",
          "uk": "Практичний ремонт стін без зайвого капітального ремонту."
      },
      "Pre-handover check": {
          "uk": "Перевірка перед здачею",
          "zh-CN": "交接前检查",
          "de": "Kontrolle vor der Übergabe"
      },
      "pre-handover repairs": {
          "uk": "передздавальний ремонт",
          "zh-CN": "移交前维修",
          "de": "Reparaturen vor der Übergabe"
      },
      "Preparing small wall defects before painting.": {
          "de": "Kleine Wandfehler vor dem Streichen vorbereiten.",
          "uk": "Підготовка дрібних дефектів стін перед фарбуванням.",
          "zh-CN": "涂漆前准备好墙壁的小缺陷。"
      },
      "Preparing uneven areas, marks and minor plaster defects so the paint finish looks cleaner and lasts better.": {
          "zh-CN": "处理不平整的区域、痕迹和轻微的灰泥缺陷，使漆面看起来更干净、更持久。",
          "de": "Vorbereiten von Unebenheiten, Flecken und kleineren Putzfehlern, damit die Lackierung sauberer aussieht und länger hält.",
          "uk": "Підготовка нерівних ділянок, слідів і дрібних дефектів штукатурки, щоб покриття виглядало чистішим і трималося краще."
      },
      "Pricing depends on the actual scope, materials, access and timing. Photos can often support an initial indication, while complex or concealed issues may require a site assessment. Changes beyond the agreed work are discussed separately.": {
          "de": "Die Preisgestaltung richtet sich nach dem tatsächlichen Umfang, den Materialien, dem Zugang und dem Zeitpunkt. Fotos können häufig einen ersten Hinweis liefern, während bei komplexen oder verborgenen Problemen möglicherweise eine Standortbegutachtung erforderlich ist. Änderungen, die über die vereinbarten Arbeiten hinausgehen, werden gesondert besprochen.",
          "uk": "Ціна залежить від фактичного обсягу, матеріалів, доступу та часу. Фотографії часто можуть підтверджувати початкові ознаки, тоді як складні або приховані проблеми можуть вимагати оцінки місця. Зміни поза домовленими роботами обговорюються окремо.",
          "zh-CN": "定价取决于实际范围、材料、访问和时间。照片通常可以支持初步指示，而复杂或隐藏的问题可能需要现场评估。超出商定工作的变更将单独讨论。"
      },
      "Private homes and pre-move work": {
          "uk": "Приватні будинки та роботи перед переїздом",
          "de": "Privathäuser und Arbeiten vor dem Umzug",
          "zh-CN": "私人住宅和搬家前工作"
      },
      "Property cleaning Sopron support before guests, tenants, buyer viewings or office visitors, focused on the details people notice first.": {
          "de": "Unterstützung bei der Immobilienreinigung in Sopron vor Gästen, Mietern, Käuferbesichtigungen oder Bürobesuchern, konzentriert auf die Details, die den Menschen zuerst auffallen.",
          "uk": "Підтримка прибирання нерухомості в Шопроні перед гостями, орендарями, покупцями або відвідувачами офісу, зосереджена на деталях, які люди помічають першими.",
          "zh-CN": "肖普朗物业清洁支持在客人、租户、买家参观或办公室访客之前提供支持，重点关注人们首先注意到的细节。"
      },
      "Property maintenance": {
          "uk": "Обслуговування майна",
          "de": "Immobilienpflege",
          "zh-CN": "物业维修"
      },
      "Property maintenance page": {
          "uk": "Сторінка обслуговування власності",
          "de": "Seite zur Immobilienverwaltung",
          "zh-CN": "物业维护页面"
      },
      "Property manager task list": {
          "de": "Aufgabenliste für die Immobilienverwaltung",
          "uk": "Список завдань для керуючого нерухомістю",
          "zh-CN": "物业经理任务清单"
      },
      "Property managers and local coordinators": {
          "de": "Immobilienverwalter und lokale Koordinatoren",
          "uk": "Менеджери нерухомості та місцеві координатори",
          "zh-CN": "物业经理和当地协调员"
      },
      "Pruning and shrubs": {
          "zh-CN": "修剪和灌木",
          "uk": "Обрізка і кущі",
          "de": "Beschneiden und Sträucher"
      },
      "Ready-to-use room": {
          "zh-CN": "即用型房间",
          "uk": "Готове приміщення",
          "de": "Bezugsfertiger Raum"
      },
      "Real apartment situations": {
          "uk": "Реальні квартирні ситуації",
          "de": "Echte Wohnungssituationen",
          "zh-CN": "真实公寓情况"
      },
      "Realistic communication": {
          "uk": "Реалістичне спілкування",
          "de": "Realistische Kommunikation",
          "zh-CN": "现实沟通"
      },
      "Realistic outdoor scope": {
          "uk": "Реалістичний зовнішній приціл",
          "de": "Realistischer Outdoor-Bereich",
          "zh-CN": "逼真的户外范围"
      },
      "Realistic scope": {
          "zh-CN": "现实范围",
          "de": "Realistischer Umfang",
          "uk": "Реалістичний розмах"
      },
      "Recurring maintenance visits and photo updates can be arranged when useful, especially for owners abroad and property managers.": {
          "de": "Bei Bedarf können wiederkehrende Wartungsbesuche und Fotoaktualisierungen vereinbart werden, insbesondere für Eigentümer im Ausland und Immobilienverwalter.",
          "zh-CN": "必要时可以安排定期维护访问和照片更新，特别是对于国外业主和物业经理。",
          "uk": "За необхідності можна організувати регулярні візити для технічного обслуговування та оновлення фотографій, особливо для власників за кордоном та менеджерів нерухомості."
      },
      "Refresh marked, patched or tired walls before guest changes, tenant handovers, photoshoots or office visits. The aim is a clean surface, a consistent room impression and a handover you can feel comfortable with.": {
          "de": "Erfrischen Sie markierte, geflickte oder abgenutzte Wände vor Gastwechseln, Mieterübergaben, Fotoshootings oder Bürobesuchen. Ziel ist eine saubere Oberfläche, ein einheitlicher Raumeindruck und eine Übergabe, bei der Sie sich wohlfühlen.",
          "zh-CN": "在客人更换、租户交接、拍照或参观办公室之前，请刷新有标记、打补丁或磨损的墙壁。目标是干净的表面、一致的房间印象以及让您感到舒适的交接。",
          "uk": "Оновіть розмічені, залатані або втомлені стіни перед зміною гостей, передачею орендарів, фотосесіями чи візитами в офіс. Метою є чиста поверхня, постійне враження від приміщення та передача, з якою ви почуватиметеся комфортно."
      },
      "Refreshing rooms, living areas, hallways, offices and rental apartments for a consistent, well-presented finish.": {
          "zh-CN": "房间、起居区、走廊、办公室和出租公寓焕然一新，打造一致、精美的装饰。",
          "de": "Erfrischende Räume, Wohnbereiche, Flure, Büros und Mietwohnungen für ein einheitliches, ansprechendes Erscheinungsbild.",
          "uk": "Оновлення кімнат, житлових приміщень, коридорів, офісів і орендованих квартир для послідовної, добре представленої обробки."
      },
      "Refreshing work areas, meeting rooms and visitor-facing spaces when clean presentation matters for business.": {
          "zh-CN": "当干净的演示对业务至关重要时，可以使工作区域、会议室和面向访客的空间焕然一新。",
          "de": "Erfrischende Arbeitsbereiche, Besprechungsräume und Bereiche mit Blick auf Besucher, wenn eine saubere Präsentation für Ihr Unternehmen wichtig ist.",
          "uk": "Оновлення робочих зон, кімнат для переговорів і просторів, які виходять на відвідувачів, коли чиста презентація має значення для бізнесу."
      },
      "Regular apartment cleaning in Sopron for lived-in or frequently used homes: floors, surfaces, kitchen, bathroom and high-use areas.": {
          "uk": "Регулярне прибирання квартир в Шопроні для будинків, в яких проживають або часто використовуються: підлоги, поверхонь, кухні, ванної кімнати та приміщень інтенсивного використання.",
          "de": "Regelmäßige Wohnungsreinigung in Sopron für bewohnte oder häufig genutzte Häuser: Böden, Oberflächen, Küche, Bad und stark genutzte Bereiche.",
          "zh-CN": "肖普朗定期清洁居住或经常使用的房屋：地板、表面、厨房、浴室和高使用区域。"
      },
      "Regular cleaning focuses on surfaces that get dirty through normal use. Deep cleaning is more detailed and may include kitchens, bathrooms, limescale, dust, cabinet surfaces and less frequently cleaned areas.": {
          "de": "Der Schwerpunkt der regelmäßigen Reinigung liegt auf Oberflächen, die durch normale Nutzung verschmutzen. Die Tiefenreinigung ist detaillierter und kann Küchen, Badezimmer, Kalkablagerungen, Staub, Schrankoberflächen und weniger häufig gereinigte Bereiche umfassen.",
          "uk": "Регулярне очищення зосереджується на поверхнях, які забруднюються під час звичайного використання. Глибоке прибирання є більш детальним і може включати кухню, ванну кімнату, вапняний наліт, пил, поверхні шаф і рідше прибираються місця.",
          "zh-CN": "定期清洁主要针对正常使用过程中变脏的表面。深度清洁更为详细，可能包括厨房、浴室、水垢、灰尘、橱柜表面和不常清洁的区域。"
      },
      "Reliable arrival times": {
          "uk": "Надійний час прибуття",
          "de": "Zuverlässige Ankunftszeiten",
          "zh-CN": "可靠的到达时间"
      },
      "Remote coordination, photos, access and a short task list so the owner does not need to travel to Sopron for a small repair.": {
          "uk": "Віддалена координація, фотографії, доступ і короткий список завдань, тому власнику не потрібно їхати в Шопрон для невеликого ремонту.",
          "de": "Fernkoordination, Fotos, Zugriff und eine kurze Aufgabenliste, sodass der Eigentümer für eine kleine Reparatur nicht nach Sopron reisen muss.",
          "zh-CN": "远程协调、照片、访问和简短的任务列表，因此业主无需前往肖普朗进行小型维修。"
      },
      "Removing weeds from paths, entrances, edges, small beds and courtyard areas where small details strongly affect the overall impression.": {
          "uk": "Видалення бур'янів з доріжок, входів, країв, невеликих грядок і подвір'їв, де дрібні деталі сильно впливають на загальне враження.",
          "de": "Entfernen von Unkraut auf Wegen, Eingängen, Rändern, kleinen Beeten und Hofflächen, wo kleine Details den Gesamteindruck stark beeinflussen.",
          "zh-CN": "清除路径、入口、边缘、小床和庭院区域的杂草，这些小细节会严重影响整体印象。"
      },
      "Renovation dust and marks": {
          "de": "Renovierungsstaub und Flecken",
          "zh-CN": "装修灰尘和痕迹",
          "uk": "Ремонтний пил і сліди"
      },
      "repair and paint-ready preparation": {
          "de": "Reparatur und lackiergerechte Vorbereitung",
          "zh-CN": "维修和喷漆准备工作",
          "uk": "ремонт і підготовка до фарбування"
      },
      "Repair before paint": {
          "uk": "Ремонт перед фарбуванням",
          "de": "Vor dem Lackieren reparieren",
          "zh-CN": "喷漆前修复"
      },
      "Repair, plastering and painting follow the agreed scope, with attention to keeping the space controlled and usable.": {
          "de": "Reparatur-, Verputz- und Malerarbeiten folgen dem vereinbarten Umfang, wobei darauf geachtet wird, dass der Raum kontrolliert und nutzbar bleibt.",
          "zh-CN": "维修、抹灰和油漆按照约定的范围进行，注意保持空间的可控和可用。",
          "uk": "Ремонт, штукатурка та фарбування виконуються в узгодженому обсязі, приділяючи увагу тому, щоб простір був контрольованим і придатним для використання."
      },
      "Repairing small cracks, impact marks, anchor holes, scratches and visible damage after a tenant move-out before painting.": {
          "de": "Ausbessern von kleinen Rissen, Schlagspuren, Ankerlöchern, Kratzern und sichtbaren Schäden nach einem Mieterauszug vor dem Streichen.",
          "uk": "Ремонт невеликих тріщин, слідів від ударів, отворів під анкери, подряпин і видимих ​​пошкоджень після виїзду орендаря перед фарбуванням.",
          "zh-CN": "在租户搬出后，在涂漆之前修复小裂缝、撞击痕迹、锚孔、划痕和可见损坏。"
      },
      "Repairing visible defects for a better finish.": {
          "de": "Reparieren Sie sichtbare Mängel für ein besseres Finish.",
          "uk": "Виправлення видимих ​​​​дефектів для кращої обробки.",
          "zh-CN": "修复可见缺陷以获得更好的表面效果。"
      },
      "Rooms and hallways": {
          "zh-CN": "房间和走廊",
          "de": "Zimmer und Flure",
          "uk": "Кімнати та коридори"
      },
      "Scope and access": {
          "zh-CN": "范围和访问权限",
          "de": "Umfang und Zugang",
          "uk": "Обсяг і доступ"
      },
      "Scope is clarified in advance: which rooms matter, whether there is a greasy kitchen, limescale, renovation dust or a guest-arrival deadline.": {
          "de": "Der Umfang wird im Vorfeld geklärt: Auf welche Räume kommt es an, sei es eine verfettete Küche, Kalkablagerungen, Renovierungsstaub oder eine Anreisefrist für Gäste.",
          "uk": "Обсяг уточнюється заздалегідь: які кімнати мають значення, чи є жирна кухня, вапняний наліт, ремонтний пил чи термін прибуття гостей.",
          "zh-CN": "范围提前明确：哪些房间很重要，是否有油腻的厨房、水垢、装修灰尘或客人抵达截止日期。"
      },
      "Scope should be matched to the property condition, deadline, access and required handover standard. The goal is practical, clean, ready-to-use presentation.": {
          "de": "Der Umfang sollte auf den Zustand der Immobilie, den Termin, die Zufahrt und den gewünschten Übergabestandard abgestimmt sein. Das Ziel ist eine praktische, saubere und gebrauchsfertige Präsentation.",
          "uk": "Обсяг має бути узгоджений із станом майна, кінцевим терміном, доступом і необхідним стандартом передачі. Мета – практична, чиста, готова до використання презентація.",
          "zh-CN": "范围应与财产状况、期限、通道和所需的移交标准相匹配。目标是实用、简洁、即用型演示。"
      },
      "seasonal clean-up": {
          "de": "Saisonale Aufräumarbeiten",
          "uk": "сезонне прибирання",
          "zh-CN": "季节性清洁"
      },
      "Seasonal cleanup around paths and courtyards.": {
          "de": "Saisonale Aufräumarbeiten rund um Wege und Innenhöfe.",
          "zh-CN": "道路和庭院周围的季节性清理。",
          "uk": "Сезонне прибирання доріжок та подвір'їв."
      },
      "Send a few photos and let’s see what can be handled as a practical handyman task.": {
          "uk": "Надішліть кілька фотографій, і давайте подивимося, з чим можна впоратися, як практичне завдання на всі руки.",
          "de": "Schicken Sie ein paar Fotos und lassen Sie uns sehen, was als praktische Handwerkeraufgabe erledigt werden kann.",
          "zh-CN": "发送几张照片，让我们看看什么可以作为实用的勤杂工任务来处理。"
      },
      "Send a few photos, address or area, deadline and the condition you want to achieve.": {
          "zh-CN": "发送几张照片，地址或地区，截止日期和你想要达到的条件。",
          "de": "Senden Sie ein paar Fotos, Adresse oder Gegend, Frist und den Zustand, den Sie erreichen möchten.",
          "uk": "Надішліть кілька фотографій, адресу чи територію, термін виконання та умови, яких ви хочете досягти."
      },
      "Send a few photos, address or area, timing and access details. This helps clarify what can be prepared in advance.": {
          "de": "Senden Sie ein paar Fotos, Adresse oder Gegend, Zeitpunkt und Zugangsdaten. Dies hilft zu klären, was im Voraus vorbereitet werden kann.",
          "zh-CN": "发送一些照片、地址或地区、时间和访问详细信息。这有助于明确可以提前准备什么。",
          "uk": "Надішліть кілька фотографій, адресу чи територію, час і інформацію про доступ. Це допомагає уточнити, що можна підготувати заздалегідь."
      },
      "Send a few photos, the Sopron address or area, preferred timing and a short note explaining whether you need mowing, hedge trimming, weed removal or seasonal cleanup. This makes the next step easier to clarify.": {
          "de": "Senden Sie ein paar Fotos, die Soproner Adresse oder die Gegend, den bevorzugten Zeitpunkt und eine kurze Notiz, in der Sie erklären, ob Sie Mähen, Heckenschneiden, Unkrautbeseitigung oder saisonale Aufräumarbeiten benötigen. Dies erleichtert die Klärung des nächsten Schritts.",
          "uk": "Надішліть кілька фотографій, адресу чи територію Шопрона, бажаний час і коротку замітку з поясненням того, чи потрібно вам косити, обрізати живопліт, видаляти бур’яни чи сезонне прибирання. Це полегшує уточнення наступного кроку.",
          "zh-CN": "发送几张照片、肖普朗地址或地区、首选时间和一条简短说明，说明您是否需要割草、修剪树篱、除草或季节性清理。这使得下一步更容易澄清。"
      },
      "Send a few photos, the Sopron address or area, preferred timing and a short note explaining whether you need repair, touch-up painting or a fuller repaint. This makes it easier to clarify the next practical step.": {
          "de": "Senden Sie ein paar Fotos, die Soproner Adresse oder die Gegend, den bevorzugten Zeitpunkt und eine kurze Notiz, in der Sie erklären, ob Sie eine Reparatur, einen Ausbesserungslack oder einen umfassenderen Neuanstrich benötigen. Dies erleichtert die Klärung des nächsten praktischen Schrittes.",
          "uk": "Надішліть кілька фотографій, адресу чи територію Шопрона, бажаний час і коротку записку з поясненням того, чи потрібен вам ремонт, підфарбовування чи повне фарбування. Це полегшує уточнення наступного практичного кроку.",
          "zh-CN": "发送几张照片、肖普朗地址或地区、首选时间和一条简短说明，说明您是否需要维修、补漆或更全面的重新粉刷。这使得更容易阐明下一步的实际步骤。"
      },
      "Send photos and we’ll clarify the next step": {
          "uk": "Надішліть фото і ми уточнимо наступний крок",
          "de": "Senden Sie Fotos und wir klären den nächsten Schritt",
          "zh-CN": "发送照片，我们将澄清下一步"
      },
      "Send photos of the garden or courtyard and let’s clarify the practical next steps.": {
          "de": "Senden Sie Fotos vom Garten oder Hof und lassen Sie uns die praktischen nächsten Schritte klären.",
          "zh-CN": "发送花园或庭院的照片，让我们明确下一步的实际步骤。",
          "uk": "Надішліть фотографії саду чи подвір’я, і давайте уточнимо подальші практичні кроки."
      },
      "Send photos of the lawn, hedges, courtyard or entrance and describe the condition you want to achieve.": {
          "de": "Senden Sie Fotos von Rasen, Hecken, Hof oder Eingang und beschreiben Sie den Zustand, den Sie erreichen möchten.",
          "zh-CN": "发送草坪、树篱、庭院或入口的照片并描述您想要实现的条件。",
          "uk": "Надішліть фотографії газону, живої огорожі, подвір'я чи входу та опишіть стан, якого ви хочете досягти."
      },
      "Send photos of the wall defects, rooms and desired result, together with your preferred timing.": {
          "de": "Senden Sie Fotos der Wandfehler, Räume und des gewünschten Ergebnisses zusammen mit Ihrem bevorzugten Zeitpunkt.",
          "zh-CN": "发送墙壁缺陷、房间和所需结果的照片，以及您首选的时间。",
          "uk": "Надішліть фотографії дефектів стін, кімнат і бажаного результату разом із бажаним часом."
      },
      "Send photos of the walls and let’s clarify the realistic repair or painting plan.": {
          "zh-CN": "发送墙壁的照片，让我们明确实际的修复或粉刷计划。",
          "de": "Senden Sie Fotos der Wände und lassen Sie uns den realistischen Reparatur- oder Malerplan klären.",
          "uk": "Надішліть фото стін і уточнимо реалістичний план ремонту чи фарбування."
      },
      "Send the address or area, visible issues, preferred timing and how access to the property can be arranged.": {
          "uk": "Надішліть адресу чи територію, видимі проблеми, бажаний час і як можна організувати доступ до власності.",
          "de": "Senden Sie die Adresse oder die Gegend, sichtbare Probleme, den bevorzugten Zeitpunkt und wie der Zugang zur Immobilie arrangiert werden kann.",
          "zh-CN": "发送地址或地区、可见问题、首选时间以及如何安排进入该物业。"
      },
      "Send the issue, a few photos, the Sopron location and the timing that matters for handover or guest arrival.": {
          "uk": "Надішліть випуск, кілька фотографій, місце розташування Шопрона та час, який має значення для передачі або прибуття гостя.",
          "de": "Senden Sie die Ausgabe, ein paar Fotos, den Standort in Sopron und den Zeitpunkt, der für die Übergabe oder Ankunft des Gastes wichtig ist.",
          "zh-CN": "发送问题、几张照片、肖普朗位置以及对移交或客人抵达至关重要的时间。"
      },
      "Several small maintenance items can be handled in one coordination flow, reducing separate follow-ups and misunderstandings.": {
          "uk": "Кілька дрібних елементів технічного обслуговування можна обробляти в одному координаційному процесі, зменшуючи кількість окремих подальших дій і непорозумінь.",
          "de": "Mehrere kleine Wartungsaufgaben können in einem Koordinationsablauf bearbeitet werden, wodurch separate Nachverfolgungen und Missverständnisse reduziert werden.",
          "zh-CN": "多个小型维护项目可以在一个协调流程中处理，从而减少单独的后续行动和误解。"
      },
      "Shelves, curtain rails, door adjustments, trims, fixings and small handover issues organised into one task list. Individually they may seem minor, but together they strongly affect how the property feels.": {
          "uk": "Полиці, карнизи, регулювання дверей, декоративні накладки, кріплення та дрібні питання передачі зібрані в один список завдань. Окремо вони можуть здаватися незначними, але разом вони сильно впливають на відчуття власності.",
          "de": "Regale, Vorhangschienen, Türeinstellungen, Zierleisten, Befestigungen und kleine Übergabeprobleme in einer Aufgabenliste zusammengefasst. Für sich genommen mögen sie unbedeutend erscheinen, aber in ihrer Gesamtheit wirken sie sich stark darauf aus, wie sich die Immobilie anfühlt.",
          "zh-CN": "架子、窗帘导轨、门调节、装饰、固定装置和小交接问题都整理在一份任务清单中。单独来看，它们可能看起来微不足道，但综合起来，它们会极大地影响房产的感觉。"
      },
      "Short-notice work is considered against current capacity and the real scope. Photos, the exact location and the next arrival time help us assess what can be completed realistically. We do not promise a deadline that would compromise the work.": {
          "uk": "Робота в короткий термін розглядається в порівнянні з поточною потужністю та реальним обсягом. Фотографії, точне місце розташування та час наступного прибуття допомагають нам оцінити, що реально можна завершити. Ми не обіцяємо термінів, які б скомпрометували роботу.",
          "de": "Kurzfristige Arbeiten werden im Hinblick auf die aktuelle Kapazität und den tatsächlichen Umfang berücksichtigt. Fotos, der genaue Standort und die nächste Ankunftszeit helfen uns einzuschätzen, was realistisch erledigt werden kann. Wir versprechen keine Frist, die die Arbeit gefährden würde.",
          "zh-CN": "临时通知工作是根据当前能力和实际范围来考虑的。照片、确切位置和下次到达时间可以帮助我们评估实际可以完成的工作。我们不承诺会影响工作的最后期限。"
      },
      "short, focused work": {
          "de": "kurze, konzentrierte Arbeit",
          "uk": "коротка, цілеспрямована робота",
          "zh-CN": "简短、集中的工作"
      },
      "Sink, shower, bath, toilet, mirror, limescale, taps, floor and details guests notice quickly.": {
          "uk": "Раковина, душ, ванна, туалет, дзеркало, вапняний наліт, крани, підлога та деталі, які гості помічають швидко.",
          "zh-CN": "水槽、淋浴、浴缸、卫生间、镜子、水垢、水龙头、地板和客人很快注意到的细节。",
          "de": "Waschbecken, Dusche, Badewanne, Toilette, Spiegel, Kalk, Wasserhähne, Boden und Details, die den Gästen schnell auffallen."
      },
      "Skirting boards, switches, door frames, corners and fine dust after renovation.": {
          "uk": "Плінтуси, вимикачі, дверні коробки, куточки та дрібний пил після ремонту.",
          "zh-CN": "翻新后的踢脚板、开关、门框、墙角及细尘。",
          "de": "Sockelleisten, Schalter, Türrahmen, Ecken und Feinstaub nach der Renovierung."
      },
      "Small defects may not look serious individually, but together they suggest the property is not being managed properly.": {
          "de": "Kleine Mängel sehen einzeln vielleicht nicht schwerwiegend aus, aber in ihrer Gesamtheit deuten sie darauf hin, dass die Immobilie nicht ordnungsgemäß verwaltet wird.",
          "uk": "Невеликі дефекти можуть не виглядати серйозними окремо, але разом вони вказують на неправильне управління майном.",
          "zh-CN": "小缺陷单独来看可能并不严重，但综合起来就表明该房产没有得到妥善管理。"
      },
      "Small defects turned into a tidy handover": {
          "de": "Aus kleinen Mängeln wurde eine ordentliche Übergabe",
          "zh-CN": "小缺陷变成了整齐的交接",
          "uk": "Дрібні дефекти перетворилися на охайну передачу"
      },
      "Small fixes": {
          "de": "Kleine Reparaturen",
          "uk": "Дрібні ремонти",
          "zh-CN": "小修"
      },
      "Small repairs / handover": {
          "de": "Kleine Reparaturen / Übergabe",
          "zh-CN": "小修/移交",
          "uk": "Дрібний ремонт/здача"
      },
      "Small repairs and handyman jobs": {
          "de": "Kleinere Reparaturen und Handwerkerarbeiten",
          "zh-CN": "小修和杂工工作",
          "uk": "Дрібний ремонт та робота різноробочих"
      },
      "Small repairs work best when the tasks are visible, access is clear and the visit does not need to be reorganised several times. Most items can be prepared with a few photos and a short description.": {
          "de": "Kleinere Reparaturen funktionieren am besten, wenn die Aufgaben sichtbar sind, der Zugang frei ist und der Besuch nicht mehrmals umorganisiert werden muss. Die meisten Artikel können mit ein paar Fotos und einer kurzen Beschreibung vorbereitet werden.",
          "uk": "Невеликий ремонт працює найкраще, коли завдання видно, доступ є вільним і візит не потрібно змінювати кілька разів. Більшість предметів можна підготувати з кількома фотографіями та коротким описом.",
          "zh-CN": "当任务可见、访问清晰并且不需要多次重新组织访问时，小型修复效果最佳。大多数物品都可以用几张照片和简短的描述来准备。"
      },
      "Small repairs, fittings and property maintenance": {
          "de": "Kleinere Reparaturen, Ausstattungen und Grundstückspflege",
          "zh-CN": "小规模维修、配件和物业维护",
          "uk": "Дрібний ремонт, облаштування та обслуговування майна"
      },
      "Small repairs, painting tasks, outdoor work and pre-handover items are organised into a clear, manageable task list.": {
          "de": "Kleinere Reparaturen, Malerarbeiten, Arbeiten im Freien und Vorarbeiten zur Übergabe werden in einer übersichtlichen, überschaubaren Aufgabenliste organisiert.",
          "uk": "Невеликий ремонт, завдання з фарбування, роботи на відкритому повітрі та елементи, що передують передачі, організовані в чіткий, керований список завдань.",
          "zh-CN": "小规模维修、喷漆任务、户外工作和移交前项目都被组织成一个清晰、可管理的任务清单。"
      },
      "Small repairs, painting, drywall work, garden care and seasonal maintenance can be organised into one clear scope for family houses and owner-occupied apartments. Before moving in or selling, we help prepare the home so it is tidy, usable and ready to present.": {
          "uk": "Дрібний ремонт, фарбування, гіпсокартонні роботи, догляд за садом і сезонне обслуговування можна організувати в одну чітку сферу для сімейних будинків і квартир, які займають власники. Перед заїздом або продажем ми допомагаємо підготувати будинок, щоб він був охайним, придатним для використання та готовим до презентації.",
          "de": "Kleinere Reparaturen, Malerarbeiten, Trockenbauarbeiten, Gartenpflege und saisonale Wartung können für Einfamilienhäuser und Eigentumswohnungen in einem übersichtlichen Rahmen organisiert werden. Vor dem Einzug oder Verkauf helfen wir bei der Vorbereitung des Hauses, damit es aufgeräumt, nutzbar und präsentierbereit ist.",
          "zh-CN": "对于家庭住宅和自住公寓，小型维修、油漆、干墙工作、花园护理和季节性维护可以组织到一个明确的范围内。在入住或出售之前，我们会帮助准备房屋，使其整洁、可用并准备好展示。"
      },
      "Spring preparation, summer upkeep, autumn leaf and green waste tidying, plus periodic outdoor refresh before use or handover.": {
          "uk": "Весняна підготовка, літній догляд, осіннє прибирання листя та зелених відходів, а також періодичне оновлення на вулиці перед використанням або передачею.",
          "zh-CN": "春季准备、夏季维护、秋季树叶和绿色废物整理，以及使用或移交前定期户外刷新。",
          "de": "Vorbereitung im Frühling, Pflege im Sommer, Aufräumen von Laub und Grünabfällen im Herbst sowie regelmäßige Auffrischung im Außenbereich vor der Nutzung oder Übergabe."
      },
      "Support adapted to smaller gardens, apartment courtyards, entrance green areas and the practical needs of city properties.": {
          "zh-CN": "支持适应小型花园、公寓庭院、入口绿地和城市物业的实际需求。",
          "de": "Unterstützung angepasst an kleinere Gärten, Wohnungshöfe, Eingangsgrünflächen und die praktischen Bedürfnisse von Stadtgrundstücken.",
          "uk": "Опора, адаптована до невеликих садів, дворів квартир, зелених зон під’їздів та практичних потреб міської власності."
      },
      "Support adapted to the practical reality of Sopron city apartments, courtyard buildings, offices, rental properties and private homes.": {
          "zh-CN": "支持适合肖普朗城市公寓、庭院建筑、办公室、出租物业和私人住宅的实际情况。",
          "de": "An die praktische Realität von Soproner Stadtwohnungen, Hofgebäuden, Büros, Mietobjekten und Privathäusern angepasste Unterstützung.",
          "uk": "Підтримка, адаптована до практичної реальності міських квартир Шопрона, будинків у дворах, офісів, орендованих об’єктів і приватних будинків."
      },
      "Surface preparation, clean workmanship and clear coordination.": {
          "de": "Untergrundvorbereitung, saubere Verarbeitung und klare Koordination.",
          "uk": "Підготовка поверхні, чиста робота та чітка координація.",
          "zh-CN": "表面处理、工艺干净、协调清晰。"
      },
      "Surface smoothing": {
          "de": "Oberflächenglättung",
          "zh-CN": "表面平滑",
          "uk": "Згладжування поверхні"
      },
      "Tailored to the practical needs of Sopron apartments, offices, courtyards and nearby properties.": {
          "uk": "Пристосований до практичних потреб будапештських квартир, офісів, внутрішніх дворів та прилеглих об’єктів.",
          "de": "Zugeschnitten auf die praktischen Bedürfnisse von Soproner Wohnungen, Büros, Innenhöfen und nahegelegenen Grundstücken.",
          "zh-CN": "根据肖普朗公寓、办公室、庭院和附近房产的实际需求量身定制。"
      },
      "Task list": {
          "de": "Aufgabenliste",
          "zh-CN": "任务清单",
          "uk": "Список завдань"
      },
      "Task list and feasibility": {
          "de": "Aufgabenliste und Machbarkeit",
          "uk": "Перелік завдань і здійсненність",
          "zh-CN": "任务清单及可行性"
      },
      "Task list and timing": {
          "de": "Aufgabenliste und Zeitplanung",
          "zh-CN": "任务清单和时间安排",
          "uk": "Список завдань і терміни"
      },
      "Tenant change and moving": {
          "zh-CN": "租户变更和搬家",
          "uk": "Зміна орендаря та переїзд",
          "de": "Mieterwechsel und Umzug"
      },
      "The agreed scope is clarified in advance. If a new item appears on site, it is discussed separately before the task changes.": {
          "de": "Der vereinbarte Umfang wird vorab geklärt. Taucht ein neuer Artikel vor Ort auf, wird dieser gesondert besprochen, bevor sich die Aufgabenstellung ändert.",
          "zh-CN": "约定的范围是事先明确的。如果现场出现新项目，则会在任务更改之前单独讨论。",
          "uk": "Погоджений обсяг уточнюється заздалегідь. Якщо на сайті з'являється новий товар, то він обговорюється окремо перед зміною завдання."
      },
      "The aim is for the work to stay clear from the first message: what needs fixing, how access works, when a decision is needed and what updates to expect.": {
          "uk": "Мета полягає в тому, щоб робота була зрозумілою з першого повідомлення: що потрібно виправити, як працює доступ, коли потрібно прийняти рішення та яких оновлень очікувати.",
          "de": "Das Ziel besteht darin, dass die Arbeit von der ersten Nachricht an klar bleibt: Was muss repariert werden, wie der Zugriff funktioniert, wann eine Entscheidung erforderlich ist und welche Aktualisierungen zu erwarten sind.",
          "zh-CN": "其目的是让工作从第一条信息开始就保持清晰：什么需要修复、访问如何工作、何时需要做出决定以及期望进行哪些更新。"
      },
      "The best start: 2-3 photos of the area, the Sopron address or area, preferred timing, access details and the main goal. In reply, we help clarify whether the task can start from photos or whether an on-site check is better first.": {
          "de": "Der beste Start: 2-3 Fotos der Gegend, der Soproner Adresse oder der Gegend, des bevorzugten Zeitpunkts, der Zugangsdaten und des Hauptziels. Als Antwort helfen wir bei der Klärung, ob die Aufgabe mit Fotos beginnen kann oder ob zunächst eine Vor-Ort-Kontrolle besser ist.",
          "uk": "Найкращий початок: 2-3 фотографії місцевості, адреса або територія Шопрона, бажаний час, деталі доступу та головна мета. У відповідь ми допомагаємо уточнити, чи можна починати завдання з фотографій чи краще спочатку перевірити на місці.",
          "zh-CN": "最好的开始：2-3 张该地区的照片、肖普朗地址或地区、首选时间、访问详细信息和主要目标。在回复中，我们帮助澄清该任务是否可以从照片开始，或者是否先进行现场检查更好。"
      },
      "The best start: 2-3 photos of the defects and room, the Sopron address or area, preferred timing and access details. In reply, we help clarify whether the task can start from photos or whether an on-site assessment is better first.": {
          "de": "Der beste Start: 2-3 Fotos der Mängel und des Zimmers, der Soproner Adresse oder der Gegend, des bevorzugten Zeitpunkts und der Zugangsdaten. Als Antwort helfen wir bei der Klärung, ob die Aufgabe mit Fotos beginnen kann oder ob zunächst eine Beurteilung vor Ort besser ist.",
          "uk": "Найкращий початок: 2-3 фотографії дефектів і приміщення, адреса або територія Шопрона, бажаний час і деталі доступу. У відповідь ми допомагаємо уточнити, чи можна починати завдання з фотографій чи краще спочатку оцінити на місці.",
          "zh-CN": "最好的开始：2-3 张缺陷和房间的照片、肖普朗地址或地区、首选时间和访问详细信息。作为答复，我们帮助澄清该任务是否可以从照片开始，或者是否先进行现场评估更好。"
      },
      "The best start: photos of the kitchen, bathroom, floors and problem areas, the Sopron address or area, deadline, access details and the required handover condition.": {
          "uk": "Найкращий початок: фотографії кухні, ванної кімнати, підлоги та проблемних зон, адреса або територія Шопрона, термін виконання, деталі доступу та необхідні умови передачі.",
          "de": "Der beste Start: Fotos der Küche, des Badezimmers, der Böden und Problembereiche, der Soproner Adresse oder der Gegend, der Frist, der Zugangsdaten und der erforderlichen Übergabebedingungen.",
          "zh-CN": "最好的开始：厨房、浴室、地板和问题区域的照片、肖普朗地址或地区、截止日期、访问详细信息和所需的移交条件。"
      },
      "The expected result is easy to understand: cleaner surfaces and a tidier space.": {
          "de": "Das erwartete Ergebnis ist leicht zu verstehen: sauberere Oberflächen und ein aufgeräumterer Raum.",
          "uk": "Очікуваний результат легко зрозуміти: чистіші поверхні та охайніший простір.",
          "zh-CN": "预期的结果很容易理解：更干净的表面和更整洁的空间。"
      },
      "The final checklist depends on the property condition, but these points help clarify the useful focus quickly.": {
          "de": "Die abschließende Checkliste richtet sich nach dem Objektzustand, diese Punkte helfen jedoch dabei, den sinnvollen Schwerpunkt schnell zu klären.",
          "uk": "Остаточний контрольний список залежить від стану власності, але ці пункти допомагають швидко визначити корисний фокус.",
          "zh-CN": "最终的清单取决于房产状况，但这些要点有助于快速明确有用的焦点。"
      },
      "The garden, yard or entrance is often the first place where a visitor forms an opinion about the property.": {
          "uk": "Сад, двір або під'їзд часто є першим місцем, де відвідувач формує думку про нерухомість.",
          "de": "Der Garten, Hof oder Eingang ist oft der erste Ort, an dem sich ein Besucher eine Meinung über die Immobilie bildet.",
          "zh-CN": "花园、庭院或入口通常是访客对房产形成看法的第一个地方。"
      },
      "The goal is not a staged fantasy, but a clean, clear room that can be used, shown or handed over to a guest.": {
          "zh-CN": "我们的目标不是一个舞台上的幻想，而是一个干净、清晰的房间，可以使用、展示或移交给客人。",
          "de": "Das Ziel ist keine inszenierte Fantasie, sondern ein sauberer, übersichtlicher Raum, der genutzt, gezeigt oder einem Gast übergeben werden kann.",
          "uk": "Метою є не постановочна фантазія, а чиста, зрозуміла кімната, яку можна використовувати, показати чи передати гостю."
      },
      "The goal is not to overcomplicate small issues, but to find realistic, useful solutions based on location and timing.": {
          "de": "Das Ziel besteht nicht darin, kleine Probleme zu verkomplizieren, sondern realistische, nützliche Lösungen basierend auf Ort und Zeitpunkt zu finden.",
          "uk": "Мета полягає не в тому, щоб надто ускладнювати дрібні питання, а в тому, щоб знайти реалістичні, корисні рішення на основі місця та часу.",
          "zh-CN": "我们的目标不是让小问题变得过于复杂，而是根据位置和时间找到现实、有用的解决方案。"
      },
      "The illustration shows a typical starting condition for this kind of work.": {
          "de": "Die Abbildung zeigt eine typische Ausgangssituation für diese Art von Arbeit.",
          "uk": "На ілюстрації показано типову початкову умову для такого роду робіт.",
          "zh-CN": "插图显示了此类工作的典型开始条件。"
      },
      "The images illustrate typical preparation and repair stages.": {
          "de": "Die Bilder veranschaulichen typische Vorbereitungs- und Reparaturschritte.",
          "uk": "На зображеннях показані типові етапи підготовки та ремонту.",
          "zh-CN": "这些图像展示了典型的准备和修复阶段。"
      },
      "The job can begin with photos and a short brief, so the owner can understand the situation even when they are not in Sopron.": {
          "de": "Der Auftrag kann mit Fotos und einer kurzen Einweisung beginnen, damit der Eigentümer die Situation auch dann verstehen kann, wenn er nicht in Sopron ist.",
          "uk": "Робота може починатися з фотографій і короткого опису, щоб власник міг зрозуміти ситуацію, навіть коли він не в Шопроні.",
          "zh-CN": "这项工作可以从照片和简短的简介开始，这样业主即使不在肖普朗也能了解情况。"
      },
      "The kitchen condition quickly shapes the first impression.": {
          "de": "Der Küchenzustand prägt schnell den ersten Eindruck.",
          "uk": "Стан кухні швидко формує перше враження.",
          "zh-CN": "厨房的条件很快就会塑造第一印象。"
      },
      "The scope is based on the property's actual condition, with photo updates available for important work stages.": {
          "uk": "Обсяг базується на фактичному стані нерухомості, доступні оновлення фотографій для важливих етапів роботи.",
          "de": "Der Umfang orientiert sich am tatsächlichen Zustand der Immobilie, wobei für wichtige Arbeitsschritte Fotoaktualisierungen verfügbar sind.",
          "zh-CN": "范围根据房产的实际情况而定，重要工作阶段可提供照片更新。"
      },
      "The scope is clarified before work begins, agreed tasks are handled in trackable steps and the property is left orderly and ready to use.": {
          "uk": "Обсяг уточнюється перед початком роботи, узгоджені завдання виконуються поетапно, а майно залишається впорядкованим і готовим до використання.",
          "de": "Vor Beginn der Arbeiten wird der Umfang geklärt, vereinbarte Aufgaben in nachvollziehbaren Schritten abgewickelt und die Immobilie ordentlich und bezugsfertig übergeben.",
          "zh-CN": "在工作开始之前就明确了范围，以可跟踪的步骤处理商定的任务，并且财产井然有序并可供使用。"
      },
      "The service is built on a clearly agreed scope, useful communication and trackable updates, not exaggerated promises.": {
          "de": "Der Service basiert auf einem klar vereinbarten Umfang, nützlicher Kommunikation und nachverfolgbaren Updates, nicht auf übertriebenen Versprechungen.",
          "uk": "Послуга побудована на чітко узгодженому обсязі, корисному спілкуванні та відстежуваних оновленнях, а не на перебільшених обіцянках.",
          "zh-CN": "该服务建立在明确商定的范围、有用的沟通和可跟踪的更新之上，而不是夸大的承诺。"
      },
      "The task list, access, deadline and handover are handled together, not as separate loose ends.": {
          "de": "Aufgabenliste, Zugang, Frist und Übergabe werden gemeinsam behandelt und nicht als separate lose Enden.",
          "uk": "Список завдань, доступ, кінцевий термін і передача обробляються разом, а не як окремі вільні кінці.",
          "zh-CN": "任务列表、访问、截止日期和移交是一起处理的，而不是作为单独的松散的任务处理。"
      },
      "The value of small repairs is often not the size of the task, but clear coordination and organised execution.": {
          "de": "Der Wert kleiner Reparaturen liegt oft nicht in der Größe der Aufgabe, sondern in einer klaren Koordination und organisierten Ausführung.",
          "zh-CN": "小规模维修的价值往往不在于任务的大小，而在于明确的协调和有组织的执行。",
          "uk": "Цінність дрібного ремонту часто полягає не в розмірі завдання, а в чіткій координації та організованому виконанні."
      },
      "The visit follows the approved task list. If a new item appears, it is discussed before the scope changes.": {
          "de": "Der Besuch folgt der genehmigten Aufgabenliste. Wenn ein neues Element erscheint, wird es besprochen, bevor sich der Umfang ändert.",
          "uk": "Візит відбувається за затвердженим списком завдань. Якщо з’являється новий пункт, він обговорюється перед зміною обсягу.",
          "zh-CN": "此次访问按照批准的任务清单进行。如果出现新项目，则会在范围更改之前对其进行讨论。"
      },
      "The work can be coordinated remotely when access and decision-making authority are clear. Important questions are settled before the visit, with photo updates available on request. Key handover or a local contact is always agreed in advance.": {
          "de": "Die Arbeit kann aus der Ferne koordiniert werden, wenn Zugriff und Entscheidungsbefugnis klar sind. Wichtige Fragen werden vor dem Besuch geklärt, Bildaktualisierungen sind auf Anfrage möglich. Die Schlüsselübergabe oder ein Ansprechpartner vor Ort wird immer vorab vereinbart.",
          "zh-CN": "当访问和决策权限明确时，可以远程协调工作。重要问题在访问前得到解决，并可根据要求提供照片更新。钥匙交接或当地联系人始终事先商定。",
          "uk": "Роботу можна координувати дистанційно, коли є вільний доступ і повноваження щодо прийняття рішень. Важливі питання вирішуються перед візитом, за запитом доступне оновлення фото. Передача ключів або місцевий контакт завжди узгоджуються заздалегідь."
      },
      "These are illustrative examples of typical handyman situations; they are not presented as completed client projects or references.": {
          "zh-CN": "这些是典型勤杂工情况的说明性示例；它们不作为已完成的客户项目或参考资料呈现。",
          "de": "Dies sind anschauliche Beispiele typischer Handwerkersituationen; sie werden nicht als abgeschlossene Kundenprojekte oder Referenzen dargestellt.",
          "uk": "Це наочні приклади типових ситуацій різноробочого; вони не представлені як завершені клієнтські проекти або референції."
      },
      "These are illustrative examples showing the kind of situations where maintenance support is useful; they are not presented as completed project references.": {
          "zh-CN": "这些说明性示例显示了维护支持有用的情况；它们不作为已完成的项目参考来呈现。",
          "de": "Dies sind anschauliche Beispiele, die zeigen, in welchen Situationen Wartungsunterstützung sinnvoll ist; sie werden nicht als abgeschlossene Projektreferenzen dargestellt.",
          "uk": "Це ілюстративні приклади, що демонструють ситуації, коли технічне обслуговування є корисним; вони не представлені як завершені посилання на проект."
      },
      "These are illustrative examples showing typical cleaning situations and expected presentation; they are not presented as completed client projects.": {
          "zh-CN": "这些是说明性示例，显示了典型的清洁情况和预期的表现；它们不作为已完成的客户项目呈现。",
          "de": "Dies sind anschauliche Beispiele, die typische Reinigungssituationen und die erwartete Präsentation zeigen; sie werden nicht als abgeschlossene Kundenprojekte dargestellt.",
          "uk": "Це ілюстративні приклади, що демонструють типові ситуації прибирання та очікувану презентацію; вони не представлені як завершені клієнтські проекти."
      },
      "These are illustrative examples showing typical garden maintenance situations and expected results; they are not presented as completed client projects.": {
          "uk": "Це ілюстративні приклади, що демонструють типові ситуації з обслуговування саду та очікувані результати; вони не представлені як завершені клієнтські проекти.",
          "de": "Dies sind anschauliche Beispiele, die typische Gartenpflegesituationen und erwartete Ergebnisse zeigen; sie werden nicht als abgeschlossene Kundenprojekte dargestellt.",
          "zh-CN": "这些说明性示例显示了典型的花园维护情况和预期结果；它们不作为已完成的客户项目呈现。"
      },
      "These are illustrative examples showing typical work processes and expected results; they are not presented as completed client projects.": {
          "de": "Dabei handelt es sich um anschauliche Beispiele, die typische Arbeitsabläufe und erwartete Ergebnisse zeigen; sie werden nicht als abgeschlossene Kundenprojekte dargestellt.",
          "uk": "Це ілюстративні приклади, що демонструють типові робочі процеси та очікувані результати; вони не представлені як завершені клієнтські проекти.",
          "zh-CN": "这些是说明性示例，显示了典型的工作流程和预期结果；它们不作为已完成的客户项目呈现。"
      },
      "These examples show typical starting conditions, work stages and expected outcomes. They are not presented as completed client projects; every real scope is agreed separately.": {
          "de": "Diese Beispiele zeigen typische Ausgangsbedingungen, Arbeitsschritte und erwartete Ergebnisse. Sie werden nicht als abgeschlossene Kundenprojekte dargestellt; Jeder tatsächliche Umfang wird gesondert vereinbart.",
          "uk": "Ці приклади показують типові початкові умови, етапи роботи та очікувані результати. Вони не представлені як завершені клієнтські проекти; кожен реальний обсяг узгоджується окремо.",
          "zh-CN": "这些示例显示了典型的起始条件、工作阶段和预期结果。它们不是作为已完成的客户项目呈现的；每个实际范围均单独商定。"
      },
      "This service is designed for clients who need Sopron property maintenance to move in an organised, photo-documented and practical way. The task may be a quick wall repair, post-guest touch-up, office refresh or seasonal outdoor work.": {
          "de": "Dieser Service richtet sich an Kunden, die eine organisierte, fotodokumentierte und praktische Umzugspflege in Sopron benötigen. Die Aufgabe kann eine schnelle Wandreparatur, eine Ausbesserung nach dem Gastbesuch, eine Auffrischung im Büro oder saisonale Arbeiten im Freien sein.",
          "uk": "Ця послуга призначена для клієнтів, яким необхідне обслуговування нерухомості в Шопроні для організованого, фотодокументованого та практичного переміщення. Завданням може бути швидкий ремонт стін, післягостьовий ремонт, оновлення офісу або сезонна робота на природі.",
          "zh-CN": "这项服务专为需要肖普朗物业维护的客户而设计，以便以有组织、有照片记录且实用的方式搬家。任务可能是快速墙壁修复、客人后修饰、办公室翻新或季节性户外工作。"
      },
      "This should be agreed in advance because quantity and local options matter. Small amounts are often straightforward, while larger green waste may need a separate plan.": {
          "de": "Dies sollte im Voraus vereinbart werden, da es auf die Menge und die örtlichen Möglichkeiten ankommt. Kleinere Mengen sind oft problemlos zu bewältigen, für größere Grünabfälle ist möglicherweise ein gesonderter Plan erforderlich.",
          "zh-CN": "这应该提前商定，因为数量和当地选择很重要。少量的绿色废物通常很简单，而较大的绿色废物可能需要单独的计划。",
          "uk": "Це слід узгодити заздалегідь, тому що кількість і місцеві можливості мають значення. Невеликі обсяги часто є простими, тоді як більші зелені відходи можуть потребувати окремого плану."
      },
      "This should be agreed in advance because tasks and property equipment differ. Mention special surfaces, heavy limescale or renovation dust early.": {
          "de": "Dies sollte vorab abgestimmt werden, da Aufgaben und Objektausstattung unterschiedlich sind. Erwähnen Sie besondere Oberflächen, starke Kalkablagerungen oder Renovierungsstaub frühzeitig.",
          "zh-CN": "这应该提前商定，因为任务和财产设备不同。尽早提及特殊表面、严重的水垢或装修灰尘。",
          "uk": "Про це слід домовитися заздалегідь, тому що завдання і оснащення майна відрізняються. Завчасно згадуйте спеціальні поверхні, сильний вапняний наліт або ремонтний пил."
      },
      "Timing is coordinated around access, weather, guest arrivals or pre-handover deadlines.": {
          "de": "Der Zeitplan wird je nach Zugang, Wetter, Ankunft der Gäste oder Fristen vor der Übergabe koordiniert.",
          "zh-CN": "时间根据访问、天气、客人到达或移交前截止日期进行协调。",
          "uk": "Час узгоджується з урахуванням доступу, погоди, прибуття гостей або кінцевих термінів перед передачею."
      },
      "Trust in practice": {
          "de": "Vertrauen Sie der Praxis",
          "uk": "Довіра на практиці",
          "zh-CN": "相信实践"
      },
      "Typical cleaning situations in Sopron properties": {
          "de": "Typische Reinigungssituationen in Soproner Immobilien",
          "uk": "Типові ситуації прибирання в Шопроні",
          "zh-CN": "肖普朗物业的典型清洁情况"
      },
      "Typical situation": {
          "de": "Typische Situation",
          "uk": "Типова ситуація",
          "zh-CN": "典型情况"
      },
      "Typical situations where a reliable handyman saves time.": {
          "de": "Typische Situationen, in denen ein zuverlässiger Handwerker Zeit spart.",
          "uk": "Типові ситуації, коли надійний майстер економить час.",
          "zh-CN": "可靠的勤杂工可以节省时间的典型情况。"
      },
      "Typical situations, practical support": {
          "de": "Typische Situationen, praktische Unterstützung",
          "uk": "Типові ситуації, практична підтримка",
          "zh-CN": "典型场景，实际支撑"
      },
      "Typical tasks include shelves, curtain rails, small fittings, furniture assembly, handles, door adjustment, wall marks and minor practical defects. Feasibility is clarified from photos, location and access.": {
          "uk": "Типові завдання включають полиці, карнизи, дрібну фурнітуру, складання меблів, ручки, регулювання дверей, позначки на стінах та дрібні практичні дефекти. Здійсненність уточнюється з фотографій, розташування та доступу.",
          "de": "Zu den typischen Aufgaben gehören Regale, Vorhangschienen, Kleinbeschläge, Möbelmontage, Griffe, Türjustierung, Wandspuren und kleinere praktische Mängel. Die Machbarkeit wird anhand von Fotos, Lage und Zugang geklärt.",
          "zh-CN": "典型的任务包括架子、窗帘导轨、小配件、家具组装、把手、门调节、墙壁标记和轻微的实际缺陷。通过照片、位置和交通方式阐明了可行性。"
      },
      "Urgent tasks can be reviewed based on capacity, location and scope. Include the deadline and the most important photos in the first message so feasibility can be assessed realistically.": {
          "zh-CN": "紧急任务可以根据能力、地点和范围进行审查。在第一条消息中包含截止日期和最重要的照片，以便可以实际评估可行性。",
          "de": "Dringende Aufgaben können anhand von Kapazität, Standort und Umfang überprüft werden. Geben Sie in der ersten Nachricht die Deadline und die wichtigsten Fotos an, damit die Machbarkeit realistisch eingeschätzt werden kann.",
          "uk": "Термінові завдання можна переглядати залежно від потужності, розташування та обсягу. Включіть кінцевий термін і найважливіші фотографії в перше повідомлення, щоб можна було реалістично оцінити здійсненність."
      },
      "Urgent work depends on capacity, location, access and scope. For guest arrivals or handover, include the exact deadline in the first message.": {
          "zh-CN": "紧急工作取决于能力、地点、途径和范围。对于客人抵达或移交，请在第一条消息中注明确切的截止日期。",
          "de": "Dringende Arbeiten hängen von Kapazität, Standort, Zugang und Umfang ab. Geben Sie für die Ankunft oder Übergabe von Gästen die genaue Frist in der ersten Nachricht an.",
          "uk": "Термінова робота залежить від потужності, місця розташування, доступу та обсягу. Для прибуття гостей або передачі вкажіть точний кінцевий термін у першому повідомленні."
      },
      "Vacuuming, mopping, dusting, switches and visible surfaces.": {
          "de": "Staubsaugen, Wischen, Staubwischen, Schalter und sichtbare Oberflächen.",
          "uk": "Прибирання пилососом, миття шваброю, видалення пилу, вимикачів і видимих ​​поверхонь.",
          "zh-CN": "吸尘、拖地、除尘、开关和可见表面。"
      },
      "Visible defects, wall marks and small repairs can be prioritised around the next arrival.": {
          "de": "Sichtbare Mängel, Wandspuren und kleine Reparaturen können bei der nächsten Ankunft priorisiert werden.",
          "uk": "Видимі дефекти, сліди на стінах і невеликий ремонт можуть бути пріоритетними під час наступного прибуття.",
          "zh-CN": "可见的缺陷、墙壁痕迹和小修理可以在下次到达时优先处理。"
      },
      "Visible defects, wall repairs and small maintenance jobs can be handled together before a guest or tenant change. Timing is always agreed against the actual scope.": {
          "de": "Sichtbare Mängel, Wandreparaturen und kleine Wartungsarbeiten können vor einem Gast- oder Mieterwechsel gemeinsam erledigt werden. Der Zeitpunkt wird immer anhand des tatsächlichen Umfangs vereinbart.",
          "uk": "Видимі дефекти, ремонт стін і невеликі роботи з технічного обслуговування можна вирішувати разом до зміни гостя або орендаря. Час завжди узгоджується відносно фактичного обсягу.",
          "zh-CN": "可见缺陷、墙壁维修和小型维护工作可以在客人或租户更换之前一起处理。时间总是根据实际范围达成一致。"
      },
      "Visible defects, water marks, wall damage, courtyard issues and shared-area concerns can be reviewed. Especially useful when the owner is not in Sopron but still needs a clear picture of the property.": {
          "de": "Sichtbare Mängel, Wasserflecken, Wandschäden, Probleme im Innenhof und Bedenken hinsichtlich gemeinsam genutzter Bereiche können überprüft werden. Besonders nützlich, wenn der Eigentümer nicht in Sopron ist, aber dennoch ein klares Bild der Immobilie benötigt.",
          "uk": "Можна переглянути видимі дефекти, водяні сліди, пошкодження стін, проблеми внутрішнього двору та проблеми спільного використання. Особливо корисно, коли власник не в Шопроні, але йому все одно потрібна чітка картина власності.",
          "zh-CN": "可以审查可见缺陷、水痕、墙壁损坏、庭院问题和共享区域问题。当业主不在肖普朗但仍需要清晰的房产图片时尤其有用。"
      },
      "Visible seams, edges and unsanded areas make a room feel unfinished. The aim is careful preparation, not cosmetic shortcuts.": {
          "de": "Sichtbare Nähte, Kanten und ungeschliffene Bereiche lassen einen Raum unvollendet erscheinen. Ziel ist eine sorgfältige Vorbereitung, nicht kosmetische Abkürzungen.",
          "zh-CN": "可见的接缝、边缘和未打磨的区域让房间感觉未完工。目的是精心准备，而不是表面上的捷径。",
          "uk": "Видимі шви, краї та незашліфовані ділянки роблять кімнату незавершеною. Метою є ретельна підготовка, а не косметичні скорочення."
      },
      "Visual work processes": {
          "uk": "Візуальні робочі процеси",
          "de": "Visuelle Arbeitsprozesse",
          "zh-CN": "可视化工作流程"
      },
      "Wall and hardware": {
          "de": "Wand und Hardware",
          "zh-CN": "墙壁和五金件",
          "uk": "Стіни та фурнітура"
      },
      "Wall condition and the desired goal are considered together: whether touch-up painting is enough or a full room repaint is needed.": {
          "de": "Der Wandzustand und das angestrebte Ziel werden gemeinsam betrachtet: ob ein Ausbesserungsanstrich ausreicht oder ein kompletter Neuanstrich des Raumes erforderlich ist.",
          "uk": "Стан стін і бажана мета враховуються разом: чи достатньо підфарбувати або потрібно повністю перефарбувати кімнату.",
          "zh-CN": "墙壁状况和预期目标要一起考虑：补漆是否足够，或者是否需要整个房间重新粉刷。"
      },
      "Wall defects, drywall and surface preparation.": {
          "uk": "Дефекти стін, гіпсокартон і підготовка поверхні.",
          "de": "Wandfehler, Trockenbau und Oberflächenvorbereitung.",
          "zh-CN": "墙壁缺陷、干墙和表面处理。"
      },
      "Wall marks, minor damage, fittings and pre-handover touch-ups can be organised into one trackable scope.": {
          "de": "Wandspuren, kleinere Schäden, Beschläge und Ausbesserungen vor der Übergabe können in einem nachverfolgbaren Bereich organisiert werden.",
          "uk": "Сліди на стінах, незначні пошкодження, фурнітура та ремонти перед передачею можуть бути організовані в один приціл, який можна відстежувати.",
          "zh-CN": "墙壁标记、轻微损坏、配件和移交前修饰可以组织到一个可跟踪范围中。"
      },
      "Wall marks, small damage, patching, touch-up painting or full room painting before rental, sale, photography or handover.": {
          "de": "Wandflecken, kleine Schäden, Ausbesserungen, Ausbesserungsarbeiten oder komplette Raumanstriche vor der Vermietung, dem Verkauf, dem Fotografieren oder der Übergabe.",
          "uk": "Сліди на стінах, невеликі пошкодження, латання, фарбування або повне фарбування кімнати перед орендою, продажем, фотографуванням або передачею.",
          "zh-CN": "在租赁、出售、摄影或移交之前进行墙壁标记、小损坏、修补、补漆或全房间油漆。"
      },
      "Wall photos": {
          "zh-CN": "墙上的照片",
          "uk": "Настінні фотографії",
          "de": "Wandfotos"
      },
      "Wall plugs, small holes, chips, post-guest or post-tenant marks and touch-up preparation before rental, photos or move-in.": {
          "de": "Dübel, kleine Löcher, Absplitterungen, Spuren von Gästen oder Mietern und Ausbesserungsvorbereitungen vor der Vermietung, Fotos oder dem Einzug.",
          "zh-CN": "墙壁插头、小孔、碎片、客后或租客后标记以及租赁、拍照或入住前的修补准备。",
          "uk": "Стінні дюбелі, невеликі дірки, відколи, сліди після відвідування або оренди та підготовка до ремонту перед орендою, фотографіями чи заїздом."
      },
      "Wall refreshes before guest arrival, tenant change, photography or viewing when the apartment needs to look orderly quickly.": {
          "zh-CN": "当公寓需要快速看起来井然有序时，墙壁会在客人抵达、租户更换、拍照或查看之前进行刷新。",
          "de": "Wandaktualisierungen vor der Ankunft von Gästen, einem Mieterwechsel, beim Fotografieren oder bei Besichtigungen, wenn die Wohnung schnell aufgeräumt aussehen muss.",
          "uk": "Оновлення стін перед приїздом гостей, зміною орендаря, фотографуванням або оглядом, коли квартира повинна швидко навести порядок."
      },
      "Wall repair and painting before a visit or handover.": {
          "de": "Wandreparatur und Malerarbeiten vor einem Besuch oder einer Übergabe.",
          "zh-CN": "参观或移交前进行墙壁维修和粉刷。",
          "uk": "Ремонт та фарбування стін перед виїздом чи здачею."
      },
      "We adapt to apartment courtyards, city green areas, smaller private gardens and the practical access situations common in Sopron.": {
          "de": "Wir passen uns an Wohnungshöfe, Stadtgrünflächen, kleinere Privatgärten und die in Sopron üblichen praktischen Zugangssituationen an.",
          "zh-CN": "我们适应公寓庭院、城市绿地、小型私人花园以及肖普朗常见的实际通道情况。",
          "uk": "Ми адаптуємося до дворів квартир, міських зелених зон, невеликих приватних садів і практичних ситуацій доступу, поширених у Шопроні."
      },
      "We clarify what can be assessed from photos, what preparation is needed and where an on-site check may be necessary.": {
          "de": "Wir klären, was sich anhand von Fotos beurteilen lässt, welche Vorbereitung nötig ist und wo ggf. eine Vor-Ort-Kontrolle erforderlich ist.",
          "zh-CN": "我们阐明可以通过照片评估哪些内容、需要哪些准备以及哪些地方可能需要进行现场检查。",
          "uk": "Уточнюємо, що можна оцінити по фото, яка підготовка потрібна і де може знадобитися перевірка на місці."
      },
      "We clarify what can be assessed from photos, where more information is needed and when an on-site visit makes sense.": {
          "de": "Wir klären, was anhand von Fotos beurteilt werden kann, wo weitere Informationen erforderlich sind und wann ein Besuch vor Ort sinnvoll ist.",
          "uk": "Ми пояснюємо, що можна оцінити за фотографіями, де потрібна додаткова інформація та коли має сенс візит на місце.",
          "zh-CN": "我们阐明可以从照片中评估什么、哪里需要更多信息以及何时进行现场访问有意义。"
      },
      "We clarify what is included, how access works, who can approve changes and whether an on-site assessment is needed.": {
          "de": "Wir klären, was enthalten ist, wie der Zugang funktioniert, wer Änderungen genehmigen kann und ob eine Vor-Ort-Begutachtung erforderlich ist.",
          "uk": "Ми пояснюємо, що включено, як працює доступ, хто може затверджувати зміни та чи потрібна оцінка на місці.",
          "zh-CN": "我们会阐明其中包含的内容、访问方式、谁可以批准更改以及是否需要进行现场评估。"
      },
      "We clarify what needs to be done, when the area can be accessed and whether green waste handling is part of the task.": {
          "de": "Wir klären ab, was zu tun ist, wann die Fläche befahrbar ist und ob die Grünabfallbehandlung zum Aufgabengebiet gehört.",
          "uk": "Ми уточнюємо, що потрібно зробити, коли територія доступна і чи є частиною завдання поводження з зеленими відходами.",
          "zh-CN": "我们明确需要做什么、何时可以进入该区域以及绿色废物处理是否是任务的一部分。"
      },
      "We clarify which items fit handyman work and where another specialist or separate discussion may be needed.": {
          "zh-CN": "我们澄清哪些项目适合杂工工作，以及哪些项目可能需要其他专家或单独的讨论。",
          "de": "Wir klären, welche Punkte für handwerkliche Arbeiten geeignet sind und wo möglicherweise ein weiterer Fachmann oder ein gesondertes Gespräch erforderlich ist.",
          "uk": "Уточнюємо, які речі підходять для роботи різноробочих, а де може знадобитися додатковий спеціаліст або окреме обговорення."
      },
      "We clarify which rooms, surfaces and issues should be included in the task list.": {
          "zh-CN": "我们明确任务列表中应包含哪些房间、表面和问题。",
          "de": "Wir klären, welche Räume, Flächen und Themen in die Aufgabenliste aufgenommen werden sollen.",
          "uk": "Ми уточнюємо, які приміщення, поверхні та питання повинні бути включені до списку завдань."
      },
      "We do not present maintenance as a full landscaping transformation. Scope is agreed based on condition, size, access and timing.": {
          "zh-CN": "我们并不将维护视为全面的景观改造。范围根据条件、规模、访问和时间安排达成一致。",
          "de": "Wir stellen die Instandhaltung nicht als eine vollständige Umgestaltung der Landschaftsgestaltung dar. Der Umfang wird je nach Zustand, Größe, Zugang und Zeitpunkt vereinbart.",
          "uk": "Ми не представляємо технічне обслуговування як повну трансформацію ландшафту. Обсяг узгоджується на основі умов, розміру, доступу та часу."
      },
      "We do not promise unrealistic transformation. The goal is a clean, orderly, usable property condition.": {
          "de": "Wir versprechen keine unrealistische Transformation. Ziel ist ein sauberer, geordneter und nutzbarer Objektzustand.",
          "uk": "Ми не обіцяємо нереальних змін. Мета - чистий, охайний, придатний для використання стан майна.",
          "zh-CN": "我们不承诺不切实际的转型。目标是保持干净、有序、可用的财产状况。"
      },
      "We focus on practical repairs and maintenance where clear scope, orderly execution and a presentable handover matter. This is especially useful for owners, managers and properties being prepared for guests, tenants or office use.": {
          "zh-CN": "我们专注于实际维修和保养，范围明确、执行有序、交接顺利。这对于业主、管理者和准备供客人、租户或办公室使用的财产特别有用。",
          "de": "Unser Fokus liegt auf praxisgerechten Reparaturen und Wartungen, bei denen es auf klare Vorgaben, eine ordnungsgemäße Ausführung und eine vorzeigbare Übergabe ankommt. Dies ist besonders nützlich für Eigentümer, Verwalter und Immobilien, die für Gäste, Mieter oder Büronutzung vorbereitet werden.",
          "uk": "Ми зосереджуємося на практичному ремонті та технічному обслуговуванні, де важливі чіткий обсяг, упорядковане виконання та презентабельна передача. Це особливо корисно для власників, менеджерів і об’єктів, які готуються для гостей, орендарів або використання в офісі."
      },
      "Weather matters for outdoor work. Heavy rain, slippery ground or unsuitable conditions may require rescheduling by agreement.": {
          "de": "Das Wetter spielt bei der Arbeit im Freien eine Rolle. Starker Regen, rutschiger Boden oder ungeeignete Bedingungen können nach Vereinbarung eine Verschiebung des Termins erforderlich machen.",
          "uk": "Погода має значення для роботи на відкритому повітрі. Сильний дощ, слизька земля або невідповідні умови можуть вимагати перенесення за домовленістю.",
          "zh-CN": "天气对于户外工作很重要。大雨、地面湿滑或不适宜的条件可能需要经协议重新安排。"
      },
      "What happens if a new defect appears during work?": {
          "de": "Was passiert, wenn während der Arbeit ein neuer Mangel auftritt?",
          "uk": "Що буде, якщо під час роботи з'явиться новий дефект?",
          "zh-CN": "如果工作中出现新的缺陷怎么办？"
      },
      "What happens in bad weather?": {
          "de": "Was passiert bei schlechtem Wetter?",
          "uk": "Що буває в негоду?",
          "zh-CN": "恶劣天气会发生什么？"
      },
      "What if I am not in Sopron?": {
          "de": "Was ist, wenn ich nicht in Sopron bin?",
          "uk": "А якщо я не в Шопроні?",
          "zh-CN": "如果我不在肖普朗怎么办？"
      },
      "What is the difference between regular cleaning and deep cleaning?": {
          "de": "Was ist der Unterschied zwischen regelmäßiger Reinigung und Tiefenreinigung?",
          "uk": "Чим звичайна чистка відрізняється від глибокої?",
          "zh-CN": "定期清洁和深度清洁有什么区别？"
      },
      "What small repairs do you handle?": {
          "de": "Welche kleinen Reparaturen erledigen Sie?",
          "uk": "Яким дрібним ремонтом ви займаєтесь?",
          "zh-CN": "你们负责哪些小维修？"
      },
      "What types of properties do you maintain?": {
          "uk": "Які типи власності ви підтримуєте?",
          "de": "Welche Arten von Immobilien pflegen Sie?",
          "zh-CN": "您维护什么类型的房产？"
      },
      "What you can confidently hand over": {
          "de": "Was Sie sicher übergeben können",
          "uk": "Що можна впевнено передати нам",
          "zh-CN": "可以放心交给我们的事项"
      },
      "When does organised garden maintenance help?": {
          "de": "Wann hilft eine organisierte Gartenpflege?",
          "zh-CN": "有组织的花园维护何时有帮助？",
          "uk": "Коли допомагає організований догляд за садом?"
      },
      "When does painting or wall repair make sense?": {
          "de": "Wann ist ein Streichen oder eine Wandreparatur sinnvoll?",
          "zh-CN": "油漆或墙壁修补什么时候有意义？",
          "uk": "Коли має сенс фарбувати чи ремонтувати стіни?"
      },
      "When grass, hedges, pathways or courtyard plants need regular, practical tidying.": {
          "de": "Wenn Gras, Hecken, Wege oder Gartenpflanzen regelmäßig und praktisch aufgeräumt werden müssen.",
          "uk": "Коли трава, живоплоти, доріжки або рослини у дворі потребують регулярного практичного прибирання.",
          "zh-CN": "当草地、树篱、小路或庭院植物需要定期、实用的整理时。"
      },
      "When requested, photos show the starting condition, important work stages and the finished result.": {
          "de": "Auf Wunsch zeigen Fotos den Ausgangszustand, wichtige Arbeitsschritte und das fertige Ergebnis.",
          "uk": "За бажанням фотографії показують початковий стан, важливі етапи роботи та кінцевий результат.",
          "zh-CN": "根据要求，照片可以显示起始条件、重要工作阶段和最终结果。"
      },
      "When requested, photos show the starting condition, key work stages and handover.": {
          "de": "Auf Wunsch zeigen Fotos den Ausgangszustand, wesentliche Arbeitsschritte und die Übergabe.",
          "uk": "На вимогу фотографії показують початковий стан, основні етапи роботи та здачу.",
          "zh-CN": "根据要求，照片显示了启动条件、关键工作阶段和移交。"
      },
      "When requested, the starting condition and finished result can be checked by photo.": {
          "de": "Auf Wunsch können Ausgangszustand und Endergebnis per Foto überprüft werden.",
          "uk": "За запитом початковий стан і кінцевий результат можна перевірити за фотографією.",
          "zh-CN": "根据要求，可以通过照片检查开始条件和完成结果。"
      },
      "When several small tasks build up in an apartment, office or shared area, they are organised into a clear list. This helps the owner, manager and local contact work from the same information.": {
          "de": "Wenn sich in einer Wohnung, einem Büro oder einem Gemeinschaftsbereich mehrere kleine Aufgaben ansammeln, werden diese in einer übersichtlichen Liste organisiert. Dies hilft dem Eigentümer, dem Manager und den Ansprechpartnern vor Ort, mit denselben Informationen zu arbeiten.",
          "uk": "Коли в квартирі, офісі чи спільній зоні накопичується кілька невеликих завдань, вони організовуються в чіткий список. Це допомагає власнику, менеджеру та місцевому контакту працювати з однією інформацією.",
          "zh-CN": "当公寓、办公室或共享区域中出现多项小任务时，它们会被组织成一个清晰的列表。这有助于业主、经理和当地联系人利用相同的信息进行工作。"
      },
      "When should I request broader maintenance instead of handyman work?": {
          "de": "Wann sollte ich eine umfassendere Wartung statt handwerklicher Arbeit anfordern?",
          "zh-CN": "我什么时候应该要求更广泛的维护而不是杂工工作？",
          "uk": "Коли я повинен вимагати ширшого обслуговування замість роботи різноробом?"
      },
      "When the garden needs to be followed remotely, with photo updates, clear access and practical scheduling.": {
          "de": "Wenn der Garten aus der Ferne überwacht werden muss, mit Fotoaktualisierungen, klarem Zugang und praktischer Terminplanung.",
          "zh-CN": "当需要远程跟踪花园时，提供照片更新、清晰的访问和实用的调度。",
          "uk": "Коли за садом потрібно стежити віддалено, з оновленням фотографій, чітким доступом і практичним плануванням."
      },
      "When visible issues need to be handled quickly and discreetly before a visit, handover or normal operation.": {
          "de": "Wenn sichtbare Probleme vor einem Besuch, einer Übergabe oder dem Normalbetrieb schnell und diskret behoben werden müssen.",
          "uk": "Коли очевидні проблеми потрібно вирішити швидко й непомітно перед візитом, передачею або звичайною роботою.",
          "zh-CN": "在访问、移交或正常运营之前需要快速、谨慎地处理明显问题时。"
      },
      "When wall condition needs to be assessed from photos and remote coordination must remain easy to follow.": {
          "de": "Wenn der Wandzustand anhand von Fotos beurteilt werden muss und die Fernkoordination leicht zu verfolgen sein muss.",
          "zh-CN": "当需要根据照片评估墙壁状况时，远程协调必须易于遵循。",
          "uk": "Коли стан стіни потрібно оцінити за фотографіями, дистанційна координація повинна залишатися легкою для спостереження."
      },
      "When walls need to look clean and professional before a visit, handover or normal office operation.": {
          "de": "Wenn Wände vor einem Besuch, einer Übergabe oder dem normalen Bürobetrieb sauber und professionell aussehen müssen.",
          "zh-CN": "在访问、移交或正常办公室运营之前，墙壁需要看起来干净且专业。",
          "uk": "Коли стіни мають виглядати чистими та професійними перед візитом, передачею або звичайною роботою офісу."
      },
      "Which rooms can you help repaint?": {
          "de": "Welche Räume können Sie beim Neuanstrich unterstützen?",
          "uk": "Які кімнати ви можете допомогти перефарбувати?",
          "zh-CN": "您可以帮助重新粉刷哪些房间？"
      },
      "Who this is for": {
          "de": "Für wen das ist",
          "uk": "Для кого це",
          "zh-CN": "这是给谁的"
      },
      "Why professional cleaning matters": {
          "uk": "Чому професійне прибирання має значення",
          "de": "Warum professionelle Reinigung wichtig ist",
          "zh-CN": "为什么专业清洁很重要"
      },
      "Why property owners choose us": {
          "de": "Warum sich Immobilieneigentümer für uns entscheiden",
          "zh-CN": "为什么业主选择我们",
          "uk": "Чому власники обирають нас"
      },
      "Why remote coordination stays clear": {
          "de": "Warum die Fernkoordination klar bleibt",
          "zh-CN": "为什么远程协调保持清晰",
          "uk": "Чому дистанційна координація залишається зрозумілою"
      },
      "With Sopron properties, painting and wall repair often depends on timing, access and clear coordination. We provide practical support that stays easy to follow.": {
          "de": "Bei Immobilien in Sopron hängen Malerarbeiten und Wandreparaturen oft von der Zeiteinteilung, der Zugänglichkeit und einer klaren Koordination ab. Wir bieten praktische Unterstützung, die leicht verständlich bleibt.",
          "zh-CN": "对于肖普朗的房产，油漆和墙壁维修通常取决于时间、通道和明确的协调。我们提供易于遵循的实用支持。",
          "uk": "У Шопроні фарбування та ремонт стін часто залежить від часу, доступу та чіткої координації. Ми надаємо практичну підтримку, за якою легко стежити."
      },
      "With Sopron properties, the biggest challenge is often not the size of the job, but access, coordination and clear decision-making. That is where we help.": {
          "de": "Bei Immobilien in Sopron ist die größte Herausforderung oft nicht die Größe des Auftrags, sondern der Zugang, die Koordination und die klare Entscheidungsfindung. Da helfen wir.",
          "uk": "Що стосується нерухомості в Шопроні, найбільшою проблемою часто є не розмір роботи, а доступ, координація та чітке прийняття рішень. Ось де ми допомагаємо.",
          "zh-CN": "对于肖普朗的物业来说，最大的挑战往往不是工作的规模，而是访问、协调和明确的决策。这就是我们提供帮助的地方。"
      },
      "Work follows an agreed task list, and important stages can be documented with photo updates on request.": {
          "de": "Die Arbeiten folgen einer vereinbarten Aufgabenliste und wichtige Arbeitsschritte können auf Wunsch mit Fotoaktualisierungen dokumentiert werden.",
          "zh-CN": "工作遵循商定的任务清单，重要阶段可以根据要求用照片更新进行记录。",
          "uk": "Робота виконується згідно з узгодженим списком завдань, а важливі етапи можуть бути задокументовані фотозвітами за запитом."
      },
      "Work follows the agreed priorities, with attention to deadline and access.": {
          "de": "Die Arbeit folgt den vereinbarten Prioritäten, unter Berücksichtigung von Fristen und Zugang.",
          "zh-CN": "工作遵循商定的优先顺序，并注意截止日期和访问权限。",
          "uk": "Робота відповідає узгодженим пріоритетам, з увагою до термінів і доступу."
      },
      "Work follows the agreed scope. If a new question appears, it is handled by a separate check-in rather than assumption.": {
          "de": "Die Arbeiten folgen dem vereinbarten Umfang. Wenn eine neue Frage erscheint, wird diese durch einen separaten Check-in und nicht durch eine Annahme behandelt.",
          "zh-CN": "工作遵循商定的范围。如果出现新问题，则通过单独签入而不是假设来处理。",
          "uk": "Робота йде в узгодженому обсязі. Якщо з’являється нове запитання, воно обробляється окремою реєстрацією, а не припущенням."
      },
      "Work follows the agreed task list. If a new item appears during the visit, it is discussed separately before the scope changes.": {
          "de": "Die Arbeit folgt der vereinbarten Aufgabenliste. Sollte während des Besuchs ein neuer Gegenstand auftauchen, wird dieser gesondert besprochen, bevor sich der Umfang ändert.",
          "zh-CN": "工作按照商定的任务清单进行。如果访问期间出现新项目，则在范围变更之前单独讨论。",
          "uk": "Робота відбувається за узгодженим списком завдань. Якщо під час візиту з'являється новий предмет, він обговорюється окремо перед зміною обсягу."
      },
      "Yes, if the wall type, intended position and item to be fixed are clear. Photos of the wall, product and intended use help clarify what preparation is needed.": {
          "de": "Ja, wenn der Wandtyp, die vorgesehene Position und das zu befestigende Objekt klar sind. Fotos der Wand, des Produkts und des Verwendungszwecks helfen zu verdeutlichen, welche Vorbereitungen erforderlich sind.",
          "zh-CN": "可以，如果墙壁类型、预期位置和要固定的物品明确。墙壁、产品和预期用途的照片有助于明确需要做什么准备。",
          "uk": "Так, якщо тип стіни, передбачуване положення та елемент, який потрібно закріпити, зрозумілі. Фотографії стіни, продукту та призначення допомагають зрозуміти, яка підготовка потрібна."
      },
      "Yes, on request. Photo updates are especially practical when the owner, manager or contact person is not on site during the work.": {
          "de": "Ja, auf Anfrage. Fotoaktualisierungen sind besonders praktisch, wenn der Eigentümer, Manager oder Ansprechpartner während der Arbeiten nicht vor Ort ist.",
          "zh-CN": "是的，根据要求。当业主、经理或联系人工作期间不在现场时，照片更新尤其实用。",
          "uk": "Так, на вимогу. Оновлення фото особливо практично, коли власника, керівника або контактної особи немає на місці під час роботи."
      },
      "Yes, on request. Photos help owners and managers understand the situation even when they are not in Sopron. They do not replace on-site decisions, but they provide practical updates.": {
          "de": "Ja, auf Anfrage. Fotos helfen Eigentümern und Managern, die Situation zu verstehen, auch wenn sie nicht in Sopron sind. Sie ersetzen keine Entscheidungen vor Ort, liefern aber praktische Updates.",
          "zh-CN": "是的，根据要求。照片可以帮助业主和经理了解情况，即使他们不在肖普朗。它们不会取代现场决策，但会提供实用的更新。",
          "uk": "Так, на вимогу. Фотографії допомагають власникам і менеджерам зрозуміти ситуацію, навіть коли вони не в Шопроні. Вони не замінюють рішень на місці, але забезпечують практичні оновлення."
      },
      "Yes, photos can be sent showing the starting condition, key repair steps and the finished room. This is especially useful for remote owners and property managers.": {
          "de": "Ja, es können Fotos zugesandt werden, die den Ausgangszustand, wichtige Reparaturschritte und den fertigen Raum zeigen. Dies ist besonders nützlich für Remote-Eigentümer und Hausverwalter.",
          "zh-CN": "是的，可以发送照片，显示起始条件、关键维修步骤和完成的房间。这对于远程业主和物业经理特别有用。",
          "uk": "Так, можна надіслати фотографії початкового стану, основних етапів ремонту та готового приміщення. Це особливо корисно для віддалених власників і менеджерів нерухомості."
      },
      "Yes, seasonal tasks can be discussed: spring preparation, lawn and hedge tidying, autumn leaf cleanup, green waste handling and basic tidying before winter.": {
          "de": "Ja, saisonale Aufgaben können besprochen werden: Frühjahrsvorbereitung, Rasen- und Heckenpflege, Laubbeseitigung im Herbst, Grünabfallbeseitigung und grundlegende Aufräumarbeiten vor dem Winter.",
          "uk": "Так, можна обговорити сезонні завдання: весняна підготовка, прибирання газону та живоплотів, осіннє прибирання листя, вивезення зеленого сміття та базове прибирання перед зимою.",
          "zh-CN": "是的，可以讨论季节性任务：春季准备、草坪和树篱整理、秋季树叶清理、绿色废物处理和冬季前的基本整理。"
      },
      "Yes, small cracks, impact marks, anchor holes and surface defects can be discussed. Larger, moving or moisture-related issues should first be checked for the underlying cause.": {
          "zh-CN": "是的，小裂纹、撞击痕迹、锚孔和表面缺陷都可以讨论。较大的、移动的或与潮湿相关的问题应首先检查根本原因。",
          "de": "Ja, kleine Risse, Schlagspuren, Ankerlöcher und Oberflächenfehler können besprochen werden. Größere, bewegungs- oder feuchtigkeitsbedingte Probleme sollten zunächst auf die zugrunde liegende Ursache überprüft werden.",
          "uk": "Так, невеликі тріщини, сліди ударів, анкерні отвори та дефекти поверхні можуть бути обговорені. Великі, рухливі або пов’язані з вологою проблеми спочатку слід перевірити на основну причину."
      },
      "Yes, smaller apartment courtyards, entrance green areas and shared outdoor spaces can be discussed. Access and decision-making authority should be clarified first.": {
          "zh-CN": "是的，可以讨论较小的公寓庭院、入口绿地和共享室外空间。首先要明确准入和决策权限。",
          "de": "Ja, kleinere Wohnungshöfe, Eingangsgrünflächen und gemeinschaftliche Außenflächen können besprochen werden. Die Zugriffs- und Entscheidungsbefugnisse sollten zunächst geklärt werden.",
          "uk": "Так, можна обговорювати менші квартирні дворики, зелені зони під’їздів та спільні відкриті простори. Спершу слід уточнити доступ і повноваження щодо прийняття рішень."
      },
      "Yes, smaller flat-pack furniture and practical interior items can be discussed. Larger, custom or multi-trade work needs clarification in advance.": {
          "zh-CN": "是的，可以讨论较小的平板家具和实用的室内物品。较大的定制或多贸易工作需要提前澄清。",
          "de": "Ja, kleinere, zerlegbare Möbel und praktische Einrichtungsgegenstände können besprochen werden. Größere, individuelle oder gewerkübergreifende Arbeiten bedürfen einer Vorabklärung.",
          "uk": "Так, можна обговорити менші габаритні меблі та практичні предмети інтер’єру. Більші, індивідуальні або багатопрофільні роботи потребують попереднього уточнення."
      },
      "Yes, smaller offices, meeting rooms, reception spaces and visible wall defects can be discussed. Timing and access during normal operation are especially important in these cases.": {
          "zh-CN": "是的，可以讨论较小的办公室、会议室、接待空间和可见的墙壁缺陷。在这些情况下，正常操作期间的定时和访问尤其重要。",
          "de": "Ja, kleinere Büros, Besprechungsräume, Empfangsräume und sichtbare Wandfehler können besprochen werden. In diesen Fällen sind Timing und Zugriff im Normalbetrieb besonders wichtig.",
          "uk": "Так, невеликі офіси, кімнати для переговорів, приміщення для прийому гостей і видимі дефекти стін можна обговорити. Час і доступ під час нормальної роботи особливо важливі в цих випадках."
      },
      "Yes, that is usually the easiest place to start. A few clear overview and close-up photos are often enough to identify the next step. If the technical scope cannot be confirmed from images, we will recommend an on-site assessment.": {
          "uk": "Так, зазвичай це найлегше почати. Кілька чітких оглядових фотографій і фотографій великим планом часто достатньо, щоб визначити наступний крок. Якщо технічний обсяг неможливо підтвердити за допомогою зображень, ми рекомендуємо провести оцінку на місці.",
          "zh-CN": "是的，这通常是最容易开始的地方。一些清晰的概述和特写照片通常足以确定下一步。如果无法从图像中确认技术范围，我们将建议进行现场评估。",
          "de": "Ja, das ist normalerweise der einfachste Ausgangspunkt. Oft reichen ein paar klare Übersichts- und Nahaufnahmen aus, um den nächsten Schritt zu erkennen. Sollte sich der technische Umfang anhand von Bildern nicht bestätigen lassen, empfehlen wir eine Begutachtung vor Ort."
      },
      "Yes, when access, authority and entry details are clear. Photo updates can help you follow what happened on site.": {
          "de": "Ja, wenn Zugang, Berechtigung und Zugangsdaten klar sind. Mithilfe von Fotoaktualisierungen können Sie verfolgen, was vor Ort passiert ist.",
          "uk": "Так, коли доступ, повноваження та деталі входу чіткі. Оновлення фотографій допоможе вам стежити за подіями на сайті.",
          "zh-CN": "是的，当访问、权限和条目详细信息明确时。照片更新可以帮助您了解现场发生的情况。"
      },
      "Yes, when the condition and access make it practical. Frequency should be based on season, lawn growth, hedge condition and how the property is used.": {
          "zh-CN": "是的，当条件和途径使其切实可行时。频率应根据季节、草坪生长、树篱状况以及财产的使用方式而定。",
          "uk": "Так, коли умови та доступ роблять це практичним. Частота має залежати від сезону, росту газону, стану живої огорожі та способу використання майна.",
          "de": "Ja, wenn die Bedingungen und der Zugang es praktikabel machen. Die Häufigkeit sollte sich nach der Jahreszeit, dem Rasenwachstum, dem Zustand der Hecke und der Nutzung des Grundstücks richten."
      },
      "Yes, when the wall condition and existing paint make it realistic. Photos often help clarify whether touch-up painting is enough or whether a larger wall refresh makes more sense.": {
          "uk": "Так, коли стан стін і наявна фарба роблять це реалістичним. Фотографії часто допомагають зрозуміти, чи достатньо підфарбувати стіну, чи є доцільнішим оновити стіну.",
          "de": "Ja, wenn die Wandbeschaffenheit und die vorhandene Farbe es realistisch machen. Fotos helfen oft dabei, zu klären, ob ein Ausbesserungsanstrich ausreicht oder ob eine größere Wandauffrischung sinnvoller ist.",
          "zh-CN": "是的，当墙壁状况和现有油漆使其真实时。照片通常有助于弄清楚补漆是否足够，或者更大的墙壁刷新是否更有意义。"
      },
      "Yes. Access, task list, timing and photo updates can be coordinated remotely when entry to the property is arranged clearly.": {
          "de": "Ja. Zugang, Aufgabenliste, Zeitplanung und Fotoaktualisierungen können aus der Ferne koordiniert werden, wenn der Zugang zur Immobilie klar geregelt ist.",
          "zh-CN": "是的。当明确安排酒店进入时，可以远程协调访问、任务列表、时间安排和照片更新。",
          "uk": "так Доступ, список завдань, час і оновлення фотографій можна скоординувати дистанційно, якщо в’їзд до об’єкта чітко організований."
      },
      "Yes. After guest turnover, common issues include loose fittings, wall marks, damaged accessories or quick adjustments. Short deadlines are confirmed based on capacity and task size.": {
          "uk": "так Після зміни відвідувачів поширеними проблемами є ослаблені кріплення, сліди на стінах, пошкоджені аксесуари або швидке регулювання. Короткі терміни підтверджуються на основі потужності та розміру завдання.",
          "de": "Ja. Häufige Probleme nach dem Gästewechsel sind lockere Beschläge, Wandflecken, beschädigtes Zubehör oder schnelle Anpassungen. Kurze Fristen werden je nach Kapazität und Aufgabenumfang bestätigt.",
          "zh-CN": "是的。客人流失后，常见问题包括配件松动、墙壁痕迹、配件损坏或快速调整。根据能力和任务规模确定较短的期限。"
      },
      "Yes. Before guest arrival or photography, tidying the entrance, courtyard, lawn and smaller green areas can be very useful. For short deadlines, include the arrival date in the first message.": {
          "uk": "так Перед приїздом гостей або фотозйомкою дуже корисним може бути впорядкування під’їзду, подвір’я, газону та менших зелених зон. Для коротких термінів вкажіть дату прибуття в перше повідомлення.",
          "de": "Ja. Vor der Ankunft der Gäste oder dem Fotografieren kann das Aufräumen des Eingangs, des Hofes, des Rasens und kleinerer Grünflächen sehr nützlich sein. Geben Sie bei kurzen Fristen das Ankunftsdatum in der ersten Nachricht an.",
          "zh-CN": "是的。在客人抵达或拍照之前，整理入口、庭院、草坪和较小的绿地非常有用。对于较短的期限，请在第一条消息中注明到达日期。"
      },
      "Yes. Sopron gardens, apartment courtyards and smaller outdoor areas can be discussed. This may include mowing, hedge trimming, shrub pruning and general outdoor tidying.": {
          "de": "Ja. Soproner Gärten, Wohnungshöfe und kleinere Außenbereiche können besprochen werden. Dazu können Mähen, Heckenschneiden, Strauchschneiden und allgemeine Aufräumarbeiten im Freien gehören.",
          "uk": "так Можна обговорити будапештські сади, двори квартир і менші відкриті території. Це може включати косіння, стрижку живоплотів, обрізку кущів і загальне прибирання на вулиці.",
          "zh-CN": "是的。肖普朗花园、公寓庭院和较小的户外区域都可以讨论。这可能包括割草、树篱修剪、灌木修剪和一般户外整理。"
      },
      "Yes. Cleaning after smaller renovation, painting or repair work can be discussed. Clarify whether the issue is fine dust, debris, paint marks or full room preparation.": {
          "de": "Ja. Eine Reinigung nach kleineren Renovierungs-, Maler- oder Reparaturarbeiten kann gerne besprochen werden. Klären Sie, ob es sich um Feinstaub, Schmutz, Farbflecken oder eine komplette Raumaufbereitung handelt.",
          "zh-CN": "是的。可以讨论小型翻新、油漆或维修工作后的清洁工作。澄清问题是否是细小灰尘、碎片、油漆痕迹或整个房间的准备工作。",
          "uk": "так Прибирання після невеликого ремонту, фарбування чи ремонтних робіт можна обговорити. Уточніть, чи є проблема дрібним пилом, сміттям, слідами фарби чи повною підготовкою приміщення."
      },
      "Yes. For move-out cleaning, it helps to know whether the apartment is empty, whether furniture remains, the kitchen and bathroom condition and the handover deadline.": {
          "de": "Ja. Bei der Auszugsreinigung hilft es zu wissen, ob die Wohnung leer ist, ob noch Möbel übrig sind, wie der Zustand von Küche und Bad ist und wann die Übergabefrist ist.",
          "zh-CN": "是的。对于搬出清洁，有助于了解公寓是否空置、家具是否剩余、厨房和浴室状况以及交房期限。",
          "uk": "так Для прибирання при виїзді важливо знати, чи порожня квартира, чи залишилися меблі, стан кухні та ванної кімнати та термін здачі."
      },
      "Yes. If access is arranged and the task can be shown clearly with photos, many small repairs can be prepared remotely. Photo updates can be sent for key details on request.": {
          "de": "Ja. Wenn der Zugang organisiert ist und die Aufgabe anhand von Fotos anschaulich dargestellt werden kann, können viele kleine Reparaturen aus der Ferne vorbereitet werden. Auf Anfrage können Fotoaktualisierungen für wichtige Details zugesandt werden.",
          "uk": "так Якщо доступ організований і завдання можна чітко показати за допомогою фотографій, багато дрібних ремонтів можна підготувати дистанційно. За запитом можна надіслати оновлення фотографій для отримання ключових деталей.",
          "zh-CN": "是的。如果安排了访问并且可以用照片清楚地显示任务，则可以远程准备许多小型维修。可根据要求发送照片更新以获取关键详细信息。"
      },
      "Yes. If the technical scope cannot be understood from photos, an on-site assessment is usually the right next step. Visible issues, access and possible next actions are reviewed.": {
          "uk": "так Якщо технічний обсяг неможливо зрозуміти з фотографій, наступним кроком зазвичай є оцінка на місці. Переглядаються видимі проблеми, доступ і можливі наступні дії.",
          "de": "Ja. Wenn sich der technische Umfang anhand von Fotos nicht nachvollziehen lässt, ist eine Begutachtung vor Ort meist der richtige nächste Schritt. Sichtbare Probleme, Zugriff und mögliche nächste Maßnahmen werden überprüft.",
          "zh-CN": "是的。如果无法从照片中了解技术范围，下一步通常是进行现场评估。审查可见问题、访问权限和可能的下一步行动。"
      },
      "Yes. If wall marks, small damage, outdoor tasks or presentation issues remain after a stay, the task list can often be prepared from photos. Short deadlines are confirmed against capacity and scope.": {
          "de": "Ja. Sollten nach einem Aufenthalt noch Mauerspuren, kleine Schäden, Outdoor-Aufgaben oder Präsentationsprobleme bestehen bleiben, lässt sich die Aufgabenliste oft anhand von Fotos erstellen. Kurze Fristen werden nach Kapazität und Umfang bestätigt.",
          "zh-CN": "是的。如果入住后墙壁痕迹、小损坏、户外任务或演示问题仍然存在，通常可以根据照片准备任务列表。根据容量和范围确认较短的期限。",
          "uk": "так Якщо після перебування залишаються сліди на стінах, невеликі пошкодження, завдання на свіжому повітрі чи проблеми з презентацією, список завдань часто можна скласти з фотографій. Короткі терміни підтверджуються потужністю та обсягом."
      },
      "Yes. Many tasks are small but important: wall marks, fittings, minor installation work, drywall defects or pre-handover touch-ups. The goal is to make the property cleaner, more orderly and easier to use.": {
          "de": "Ja. Viele Aufgaben sind klein, aber wichtig: Wandmarkierungen, Beschläge, kleinere Installationsarbeiten, Mängel im Trockenbau oder Ausbesserungen vor der Übergabe. Ziel ist es, die Immobilie sauberer, ordentlicher und benutzerfreundlicher zu machen.",
          "uk": "так Багато завдань є невеликими, але важливими: розмітка стін, фурнітура, дрібні монтажні роботи, дефекти гіпсокартону або ремонти перед передачею. Мета — зробити власність чистішою, упорядкованішою та зручнішою у використанні.",
          "zh-CN": "是的。许多任务虽小但很重要：墙壁标记、配件、小型安装工作、干墙缺陷或移交前修补。目标是让物业更干净、更有序、更方便使用。"
      },
      "Yes. Many tasks start as a one-off visit: mowing, hedge trimming, weed removal or seasonal cleanup. If recurring care is useful later, it can be discussed separately.": {
          "uk": "так Багато завдань починаються з одноразового візиту: косіння, стрижка живоплоту, видалення бур’янів або сезонне прибирання. Якщо повторний догляд буде корисним пізніше, це можна обговорити окремо.",
          "de": "Ja. Viele Aufgaben beginnen als einmaliger Besuch: Mähen, Heckenschneiden, Unkrautbeseitigung oder saisonale Aufräumarbeiten. Sollte eine wiederkehrende Pflege später sinnvoll sein, kann diese gesondert besprochen werden.",
          "zh-CN": "是的。许多任务都是从一次性访问开始的：割草、修剪树篱、除草或季节性清理。如果后续护理有用，可以单独讨论。"
      },
      "Yes. Recurring apartment cleaning can be discussed for Sopron homes in regular use. Frequency should match the property size, usage and expected presentation standard.": {
          "de": "Ja. Bei regelmäßig genutzten Soproner Häusern kann eine wiederkehrende Wohnungsreinigung vereinbart werden. Die Häufigkeit sollte der Grundstücksgröße, der Nutzung und dem erwarteten Präsentationsstandard entsprechen.",
          "zh-CN": "是的。对于经常使用的肖普朗房屋，可以讨论定期公寓清洁。频率应与财产大小、用途和预期的展示标准相匹配。",
          "uk": "так Регулярне прибирання квартир можна обговорити для будапештських будинків, які регулярно використовуються. Частота має відповідати розміру власності, використанню та очікуваному стандарту представлення."
      },
      "Yes. Smaller offices, meeting rooms and representative spaces can be discussed. Scope depends on office use, access and preferred timing.": {
          "de": "Ja. Kleinere Büros, Besprechungsräume und repräsentative Räume können besprochen werden. Der Umfang hängt von der Büronutzung, dem Zugang und dem bevorzugten Zeitpunkt ab.",
          "zh-CN": "是的。可以讨论较小的办公室、会议室和代表空间。范围取决于办公室用途、访问权限和首选时间。",
          "uk": "так Можна обговорити менші офіси, конференц-зали та представницькі приміщення. Обсяг залежить від використання офісу, доступу та бажаного часу."
      },
      "Yes. The service is suitable for smaller but important jobs such as wall repairs, fittings or pre-handover touch-ups. Availability is confirmed against the location, task list and required timing.": {
          "de": "Ja. Der Service eignet sich für kleinere, aber wichtige Arbeiten wie Wandreparaturen, Montagen oder Ausbesserungen vor der Übergabe. Die Verfügbarkeit wird anhand des Standorts, der Aufgabenliste und des erforderlichen Zeitplans bestätigt.",
          "zh-CN": "是的。该服务适用于规模较小但重要的工作，例如墙壁维修、安装或移交前修补。根据地点、任务列表和所需时间确认可用性。",
          "uk": "так Послуга підходить для невеликих, але важливих робіт, таких як ремонт стін, кріплення або ремонт перед передачею. Доступність підтверджується місцезнаходженням, списком завдань і необхідним часом."
      },
      "Yes. The task list, access, timing and photo updates can be handled remotely when entry to the garden or courtyard is clearly arranged.": {
          "uk": "так Список завдань, доступ, час і оновлення фотографій можна обробляти дистанційно, коли вхід у сад чи подвір’я чітко організовано.",
          "de": "Ja. Die Aufgabenliste, der Zugang, die Zeiteinteilung und Fotoaktualisierungen können aus der Ferne erledigt werden, wenn der Zugang zum Garten oder Hof übersichtlich gestaltet ist.",
          "zh-CN": "是的。当进入花园或庭院的入口明确安排时，可以远程处理任务列表、访问、计时和照片更新。"
      },
      "Yes. Work can be coordinated remotely when access, decision-making authority and local entry are clear. Photo updates can be sent for key steps on request.": {
          "de": "Ja. Arbeiten können aus der Ferne koordiniert werden, wenn Zugang, Entscheidungsbefugnis und lokaler Zugang klar sind. Auf Anfrage können Fotoaktualisierungen für wichtige Schritte gesendet werden.",
          "zh-CN": "是的。当访问权限、决策权限和本地入口明确时，可以远程协调工作。可根据要求发送关键步骤的照片更新。",
          "uk": "так Роботу можна координувати дистанційно, коли доступ, повноваження щодо прийняття рішень і локальний доступ вільні. За запитом можна надіслати оновлення фотографій для ключових кроків."
      },
      "Property services in Sopron": {
          "de": "Immobiliendienstleistungen in Sopron",
          "uk": "Послуги для нерухомості в Шопроні",
          "zh-CN": "肖普朗物业服务"
      }
  };
  Object.entries(supplementalPhraseTranslations).forEach(([text, translations]) => {
    phraseTranslations[text] = { ...(phraseTranslations[text] || {}), ...translations };
  });

  let heroLightbox = null;
  let heroLightboxOpener = null;
  let gardenGalleryModal = null;
  let gardenGalleryIndex = 0;
  let gardenGalleryOpener = null;
  let gardenGalleryTouchStart = 0;
  let cleaningGalleryModal = null;
  let cleaningGalleryIndex = 0;
  let cleaningGalleryOpener = null;
  let cleaningGalleryTouchStart = 0;
  const serviceNavigationItems = [
    {
      key: "maintenance",
      href: "property-maintenance-sopron.html",
      hu: "Karbantartás",
      de: "Instandhaltung",
      dataset: "maintenanceLink",
    },
    {
      key: "painting",
      href: "painting-wall-repairs-sopron.html",
      hu: "Festés és faljavítás",
      de: "Malerarbeiten & Wandreparaturen",
      dataset: "paintingLink",
    },
    {
      key: "garden",
      href: "garden-maintenance-sopron.html",
      hu: "Kertfenntartás",
      de: "Gartenpflege",
      dataset: "gardenLink",
    },
    {
      key: "handyman",
      href: "handyman-services-sopron.html",
      hu: "Ezermester",
      de: "Hausmeisterservice",
      dataset: "handymanLink",
    },
    {
      key: "cleaning",
      href: "cleaning-services-sopron.html",
      hu: "Takarítás",
      de: "Reinigung",
      dataset: "cleaningLink",
    },
    {
      key: "airbnb",
      href: "airbnb-property-maintenance-sopron.html",
      hu: "Airbnb karbantartás",
      de: "Airbnb-Betreuung",
      dataset: "airbnbLink",
    },
    {
      key: "foreignOwners",
      href: "property-management-for-foreign-owners-sopron.html",
      hu: "Külföldi tulajdonosok",
      de: "Eigentümer-Service",
      dataset: "foreignOwnersLink",
    },
  ];

  const normalizeLanguage = (lang = "") => {
    const value = String(lang).trim();
    const short = value.slice(0, 2).toLowerCase();
    if (languageCodes.has(value)) return value;
    if (languageCodes.has(short)) return short;
    return "";
  };
  const storedLanguage = () => {
    try {
      return normalizeLanguage(localStorage.getItem(storageKey));
    } catch {
      return "";
    }
  };
  const browserLanguage = () => {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const language of languages) {
      const normalized = normalizeLanguage(language);
      if (normalized) return normalized;
    }
    return fallbackLanguage;
  };
  const persistLanguage = (lang) => {
    try {
      localStorage.setItem(storageKey, lang);
    } catch {
      /* localStorage can be unavailable in hardened browser modes. */
    }
  };
  const normalizePath = (pathname = window.location.pathname) => {
    let path = pathname || "/";
    if (path.startsWith("/sopron-property-services/")) {
      path = path.slice("/sopron-property-services".length) || "/";
    }
    if (path === "/index.html") return "/";
    if (path === "/hu/index.html") return "/hu/";
    return path.endsWith("/") ? path : path;
  };
  const routeInfoForPath = (pathname = window.location.pathname) => routeLookup.get(normalizePath(pathname)) || null;
  const routeLanguage = () => {
    const pageLang = normalizeLanguage(document.documentElement.dataset.pageLanguage || document.body?.dataset.routeLang || "");
    if (pageLang === "de" || pageLang === "hu") return pageLang;
    const routeLang = routeInfoForPath()?.lang;
    if (routeLang === "de" || routeLang === "hu") return routeLang;
    const htmlLang = normalizeLanguage(document.documentElement.lang);
    return htmlLang === "de" || htmlLang === "hu" ? htmlLang : "";
  };
  const currentRouteKey = () => routeInfoForPath()?.key || "home";
  const routeHref = (key, lang = currentLang()) => {
    const routeLang = lang === "hu" ? "hu" : "de";
    const path = routePairs[key]?.[routeLang] || routePairs.home[routeLang];
    const basePath = window.location.pathname.startsWith("/sopron-property-services/")
      ? "/sopron-property-services"
      : "";
    return `${basePath}${path}`;
  };
  const navigationLanguage = () => (currentLang() === "hu" ? "hu" : routeLanguage() === "hu" ? "hu" : "de");
  let activeLanguage = routeLanguage() || storedLanguage() || browserLanguage() || fallbackLanguage;
  if (!storedLanguage()) persistLanguage(activeLanguage);

  const directCallViewport = () => window.matchMedia("(max-width: 820px)").matches;
  const currentLang = () => activeLanguage || fallbackLanguage;
  const documentLang = () => currentLang();
  const languageInfo = (lang = currentLang()) =>
    supportedLanguages.find((language) => language.code === lang) || supportedLanguages.find((language) => language.code === fallbackLanguage);
  const t = (key, lang = currentLang()) => uiText[key]?.[lang] || uiText[key]?.[fallbackLanguage] || "";
  const translatePhrase = (text, lang = currentLang()) => {
    if (!text || lang === "hu" || lang === "de") return text;
    return phraseTranslations[text]?.[lang] || text;
  };
  const translateInlineText = (value, lang = currentLang()) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const translated = translatePhrase(trimmed, lang);
    if (translated === trimmed) return value;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    return `${leading}${translated}${trailing}`;
  };
  const phoneActionLabel = (lang = currentLang()) =>
    directCallViewport() ? t("callNow", lang) : t("copyPhone", lang);

  const quoteFormText = {
    de: {
      kicker: "Angebot anfragen",
      title: "Strukturierte Angaben per WhatsApp senden",
      intro: "Füllen Sie die wichtigsten Angaben aus – WhatsApp öffnet sich mit einer versandfertigen Nachricht. Fügen Sie Ihre Fotos dort vor dem Senden hinzu.",
      name: "Name",
      service: "Art der Leistung",
      location: "Ort oder Gegend (optional)",
      description: "Kurze Aufgabenbeschreibung",
      timing: "Gewünschter Zeitpunkt",
      access: "Zugangsinformationen",
      propertyType: "Immobilientyp",
      photosReady: "Ich habe Fotos bereit und hänge sie in WhatsApp an.",
      consent: "Mir ist bewusst, dass sich WhatsApp mit diesen Angaben öffnet und Fotos vor dem Senden manuell angehängt werden müssen.",
      submit: "Weiter zu WhatsApp",
      note: "WhatsApp öffnet sich mit den folgenden Angaben. Fügen Sie Ihre Fotos dort vor dem Senden hinzu.",
      required: "Erforderlich",
      requiredError: "Bitte füllen Sie dieses Feld aus.",
      consentError: "Bitte bestätigen Sie, bevor Sie zu WhatsApp weitergehen.",
      statusOpening: "WhatsApp wird geöffnet. Fügen Sie Ihre Fotos an, bevor Sie die Nachricht senden.",
      counter: (count, max) => `${count} / ${max}`,
      messageGreeting: "Hallo! Ich möchte gerne ein Angebot von Sopron Property Services anfragen.",
      messageLabels: {
        name: "Name",
        service: "Leistung",
        propertyType: "Immobilientyp",
        location: "Ort / Gegend",
        timing: "Gewünschter Zeitpunkt",
        access: "Zugangsinformationen",
        description: "Aufgabenbeschreibung",
        photos: "Fotos",
        page: "Seite",
      },
      photosYes: "Fotos sind bereit und werden in WhatsApp angehängt.",
      photosNo: "Noch keine Fotos / Ich erkläre es in WhatsApp.",
      placeholderName: "Ihr Name",
      placeholderLocation: "Beispiel: Belváros (Altstadt), Lővérek, Stadtzentrum – oder leer lassen",
      locationHelp: "Für die erste Nachricht ist keine genaue Adresse nötig.",
      placeholderAccess: "Optional: Schlüssel, Hausverwaltung, Mieterkontakt oder Zugangszeitfenster",
      placeholderDescription: "Beschreiben Sie kurz, was geprüft, repariert, gereinigt oder vorbereitet werden soll.",
    },
    hu: {
      kicker: "Ajánlatkérés",
      title: "Küldjön rendezett részleteket WhatsAppon",
      intro: "Töltse ki a legfontosabb adatokat, és a WhatsApp egy előkészített üzenettel nyílik meg. A fotókat küldés előtt ott tudja csatolni.",
      name: "Név",
      service: "Szolgáltatás",
      location: "Helyszín vagy környék (nem kötelező)",
      description: "Rövid feladatleírás",
      timing: "Kívánt időpont",
      access: "Bejutási információ",
      propertyType: "Ingatlan típusa",
      photosReady: "Vannak fotóim, és a WhatsApp megnyitása után csatolom őket.",
      consent: "Tudomásul veszem, hogy a WhatsApp az alábbi adatokkal nyílik meg, a fotókat pedig küldés előtt kézzel kell csatolnom.",
      submit: "Folytatás WhatsAppon",
      note: "A WhatsApp megnyílik az alábbi adatokkal. Küldés előtt ott csatold a fotókat.",
      required: "Kötelező",
      requiredError: "Kérjük, töltse ki ezt a mezőt.",
      consentError: "Kérjük, erősítse meg, mielőtt WhatsAppon folytatja.",
      statusOpening: "Megnyílik a WhatsApp. Az üzenet elküldése előtt csatold a fotókat.",
      counter: (count, max) => `${count} / ${max}`,
      messageGreeting: "Üdvözlöm! Ajánlatot szeretnék kérni a Sopron Property Servicestől.",
      messageLabels: {
        name: "Név",
        service: "Szolgáltatás",
        propertyType: "Ingatlan típusa",
        location: "Helyszín / környék",
        timing: "Kívánt időpont",
        access: "Bejutási információ",
        description: "Feladat leírása",
        photos: "Fotók",
        page: "Oldal",
      },
      photosYes: "Vannak fotók, és WhatsAppon csatolom őket.",
      photosNo: "Még nincsenek fotók / WhatsAppon pontosítom.",
      placeholderName: "Az Ön neve",
      placeholderLocation: "Például: Belváros, Lővérek, városközpont - vagy hagyd üresen",
      locationHelp: "Az első üzenethez nem kell pontos címet megadni.",
      placeholderAccess: "Opcionális: kulcs, portaszolgálat, bérlői kapcsolat vagy bejutási idősáv",
      placeholderDescription: "Írja le röviden, mit kell ellenőrizni, javítani, takarítani vagy előkészíteni.",
    },
  };
  const quoteServiceOptions = [
    { value: "maintenance", de: "Immobilienpflege", hu: "Ingatlankarbantartás" },
    { value: "handyman", de: "Hausmeisterservice / Kleinreparaturen", hu: "Ezermester / kisebb javítások" },
    { value: "painting", de: "Malerarbeiten und Wandreparaturen", hu: "Szobafestés és faljavítás" },
    { value: "garden", de: "Gartenpflege", hu: "Kertfenntartás" },
    { value: "cleaning", de: "Reinigung", hu: "Takarítás" },
    { value: "airbnb", de: "Airbnb-Betreuung", hu: "Airbnb-karbantartás" },
    { value: "foreign_owner", de: "Betreuung für ausländische Eigentümer", hu: "Ingatlankezelési segítség külföldi tulajdonosnak" },
    { value: "other", de: "Sonstiges", hu: "Egyéb" },
  ];
  const quotePropertyOptions = [
    { value: "", de: "Falls zutreffend auswählen", hu: "Válasszon, ha releváns" },
    { value: "apartment", de: "Wohnung", hu: "Lakás" },
    { value: "house", de: "Haus", hu: "Ház" },
    { value: "airbnb_rental", de: "Airbnb / Mietobjekt", hu: "Airbnb / kiadó ingatlan" },
    { value: "office", de: "Büro", hu: "Iroda" },
    { value: "representative_property", de: "Repräsentative Immobilie", hu: "Képviseleti ingatlan" },
    { value: "garden_outdoor", de: "Garten / Außenbereich", hu: "Kert / kültéri terület" },
    { value: "other", de: "Sonstiges", hu: "Egyéb" },
  ];
  const quoteTimingOptions = [
    { value: "asap", de: "So schnell wie möglich", hu: "Amint lehetséges" },
    { value: "week", de: "Innerhalb einer Woche", hu: "Egy héten belül" },
    { value: "month", de: "Innerhalb eines Monats", hu: "Egy hónapon belül" },
    { value: "flexible", de: "Flexibel / nur Informationsanfrage", hu: "Rugalmas / egyelőre érdeklődöm" },
  ];
  const quoteRouteService = {
    home: "maintenance",
    maintenance: "maintenance",
    handyman: "handyman",
    painting: "painting",
    garden: "garden",
    cleaning: "cleaning",
    airbnb: "airbnb",
    foreignOwners: "foreign_owner",
  };

  const pathForHref = (href = "") => {
    try {
      return normalizePath(new URL(href || ".", window.location.href).pathname);
    } catch {
      return normalizePath(`/${String(href).split("#")[0].replace(/^\.\//, "")}`);
    }
  };
  const serviceItemForHref = (href = "") => {
    const path = pathForHref(href);
    const routeKey = routeInfoForPath(path)?.key;
    if (routeKey) return serviceNavigationItems.find((item) => item.key === routeKey);
    const cleanHref = href.split("#")[0].replace(/^\.\//, "");
    return serviceNavigationItems.find((item) => item.href === cleanHref);
  };

  const isServicesOverviewHref = (href = "") => {
    try {
      const url = new URL(href || ".", window.location.href);
      return url.hash === "#services" && routeInfoForPath(url.pathname)?.key === "home";
    } catch {
      return href === "#services" || href === "index.html#services";
    }
  };

  const mobileNavigationQuery = "(max-width: 1120px)";
  let mobileNavigationReturnFocus = null;

  const compactNavigationActive = () => window.matchMedia(mobileNavigationQuery).matches;

  const setMobileNavigationLock = (locked) => {
    document.documentElement.classList.toggle("nav-menu-open", locked);
    document.body.classList.toggle("nav-menu-open", locked);
  };

  const visibleFocusItems = (container) =>
    [
      ...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((item) => {
      if (item.hidden || item.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(item);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = item.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

  const closeHeaderNavigation = (header, { restoreFocus = false } = {}) => {
    if (!header) return;
    header.classList.remove("nav-open");
    header.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
    setMobileNavigationLock(false);
    if (restoreFocus && mobileNavigationReturnFocus?.isConnected) {
      mobileNavigationReturnFocus.focus({ preventScroll: true });
    }
    if (restoreFocus) mobileNavigationReturnFocus = null;
  };

  const openHeaderNavigation = (header, opener = null) => {
    if (!header) return;
    header.classList.add("nav-open");
    header.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "true");
    setMobileNavigationLock(compactNavigationActive());
    closeLanguageSelector();
    mobileNavigationReturnFocus = opener || header.querySelector(".nav-toggle");
    requestAnimationFrame(() => header.querySelector("[data-mobile-nav-close]")?.focus({ preventScroll: true }));
  };

  const closeServicesDropdown = (dropdown) => {
    if (!dropdown) return;
    dropdown.classList.remove("open");
    dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
  };

  const syncHeaderNavigationState = () => {
    const isCompact = compactNavigationActive();
    document.querySelectorAll(".header[data-nav-enhanced='true']").forEach((header) => {
      header.style.setProperty("--header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
      const nav = header.querySelector(".nav");
      const dropdown = header.querySelector("[data-services-dropdown]");
      const actions = header.querySelector(".actions, .header-actions");
      const languageSelector = header.querySelector(".language-selector") || nav?.querySelector(".language-selector");
      const languageHome = header.querySelector("[data-language-home]");

      if (languageSelector && languageHome && !actions?.contains(languageSelector)) {
        actions?.insertBefore(languageSelector, languageHome);
      }

      const mobilePhone = nav?.querySelector("[data-nav-mobile-phone]");

      if (mobilePhone) {
        mobilePhone.textContent = directCallViewport() ? phoneActionLabel(documentLang()) : phone;
        mobilePhone.setAttribute("aria-label", mobilePhone.textContent);
      }

      dropdown
        ?.querySelector(".nav-dropdown-toggle")
        ?.setAttribute(
          "aria-expanded",
          String(isCompact ? !dropdown.classList.contains("mobile-collapsed") : dropdown.classList.contains("open"))
        );
      if (!isCompact) closeHeaderNavigation(header);
      if (isCompact) dropdown?.classList.remove("open");
    });
  };

  const enhanceHeaderNavigation = () => {
    const header = document.querySelector(".header");
    const nav = header?.querySelector(".nav");
    if (!header || !nav) return;

    const lang = documentLang();
    const navId = nav.id || "primary-navigation";
    nav.id = navId;
    header.dataset.navEnhanced = "true";
    const brand = header.querySelector(".brand");
    if (brand) brand.setAttribute("href", `${routeHref("home", navigationLanguage())}#top`);

    let menuToggle = header.querySelector(".nav-toggle");
    if (!menuToggle) {
      menuToggle = document.createElement("button");
      menuToggle.className = "nav-toggle";
      menuToggle.type = "button";
      menuToggle.setAttribute("aria-controls", navId);
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.innerHTML = '<span aria-hidden="true"></span><span class="sr-only">Menu</span>';
      header.insertBefore(menuToggle, nav);
    }
    menuToggle.setAttribute("aria-label", t("menuOpen", lang));

    let mobileChrome = nav.querySelector("[data-mobile-nav-chrome]");
    if (!mobileChrome) {
      mobileChrome = document.createElement("div");
      mobileChrome.className = "mobile-nav-chrome";
      mobileChrome.dataset.mobileNavChrome = "true";
      mobileChrome.innerHTML = `
        <p class="mobile-nav-title"></p>
        <button class="mobile-nav-close" type="button" data-mobile-nav-close></button>
      `;
      nav.insertBefore(mobileChrome, nav.firstChild);
    }
    mobileChrome.querySelector(".mobile-nav-title").textContent = t("services", lang);
    const closeButton = mobileChrome.querySelector("[data-mobile-nav-close]");
    closeButton.textContent = t("menuClose", lang);
    closeButton.setAttribute("aria-label", t("menuClose", lang));

    let dropdown = nav.querySelector("[data-services-dropdown]");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "nav-dropdown";
      dropdown.dataset.servicesDropdown = "true";
      dropdown.innerHTML = `
        <button class="nav-dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false"></button>
        <div class="nav-dropdown-menu" role="menu"></div>
      `;
      nav.insertBefore(dropdown, mobileChrome.nextSibling);
    }

    const dropdownToggle = dropdown.querySelector(".nav-dropdown-toggle");
    const dropdownMenu = dropdown.querySelector(".nav-dropdown-menu");
    const servicesLabel = t("services", lang);
    if (dropdownToggle.textContent !== servicesLabel) dropdownToggle.textContent = servicesLabel;

    let mobileTools = nav.querySelector("[data-nav-mobile-tools]");
    if (!mobileTools) {
      mobileTools = document.createElement("div");
      mobileTools.className = "nav-mobile-tools";
      mobileTools.dataset.navMobileTools = "true";
      mobileTools.innerHTML = `<a class="btn primary nav-contact-btn" href="${tel}" data-phone-action data-phone-label data-nav-mobile-phone>${phoneActionLabel(lang)}</a>`;
      nav.appendChild(mobileTools);
    }

    let mobileLanguage = nav.querySelector("[data-nav-mobile-language]");
    if (!mobileLanguage) {
      mobileLanguage = document.createElement("div");
      mobileLanguage.className = "nav-mobile-language";
      mobileLanguage.dataset.navMobileLanguage = "true";
      nav.insertBefore(mobileLanguage, mobileTools);
    }
    const mobileLanguageMarkup = `
      <div class="nav-mobile-section-head">
        <span>${t("languageLabel", lang)}</span>
        <small>${t("languageSelectorHint", lang)}</small>
      </div>
      <div class="nav-mobile-language-list" role="group" aria-label="${t("openLanguageMenu", lang)}">
        ${supportedLanguages
          .map(
            (language) => `
              <button class="nav-mobile-language-option" type="button" data-mobile-language-option="${language.code}" aria-pressed="${String(
                language.code === lang
              )}">
                <span class="flag-icon flag-${language.flag}" aria-hidden="true"></span>
                <span class="language-option-copy"><strong>${language.label}</strong><small>${language.complete}</small></span>
              </button>`
          )
          .join("")}
      </div>`;
    if (mobileLanguage.dataset.renderedLang !== lang) {
      mobileLanguage.innerHTML = mobileLanguageMarkup;
      mobileLanguage.dataset.renderedLang = lang;
    } else {
      mobileLanguage.querySelectorAll("[data-mobile-language-option]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option.dataset.mobileLanguageOption === lang));
      });
    }

    const actions = header.querySelector(".actions, .header-actions");
    if (actions && !actions.querySelector("[data-language-home]")) {
      const languageHome = document.createElement("span");
      languageHome.dataset.languageHome = "true";
      languageHome.hidden = true;
      actions.insertBefore(languageHome, actions.firstChild);
    }

    const topLevelLinks = [...nav.children].filter((node) => node.matches?.("a"));
    const serviceLinks = new Map();
    let overviewLink = null;

    topLevelLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const item = serviceItemForHref(href);
      if (item) {
        serviceLinks.set(item.key, link);
        link.remove();
      } else if (isServicesOverviewHref(href)) {
        overviewLink = link;
        link.remove();
      }
    });

    const shouldRenderDropdown =
      dropdownMenu.dataset.renderedLang !== lang ||
      serviceLinks.size > 0 ||
      !!overviewLink ||
      dropdownMenu.children.length !== serviceNavigationItems.length + 1;

    if (shouldRenderDropdown) {
      dropdownMenu.textContent = "";

      const overviewHref = navigationLanguage() === "hu" ? "/hu/#services" : "/#services";
      const overview = overviewLink || document.createElement("a");
      overview.href = overviewHref;
      overview.dataset.textHu = uiText.servicesOverview.hu;
      overview.dataset.textDe = uiText.servicesOverview.de;
      overview.textContent = t("servicesOverview", lang);
      overview.setAttribute("role", "menuitem");
      overview.removeAttribute("aria-current");
      dropdownMenu.appendChild(overview);

      const currentKey = currentRouteKey();
      serviceNavigationItems.forEach((item) => {
        const link =
          serviceLinks.get(item.key) ||
          dropdownMenu.querySelector(`[data-service-nav-item="${item.key}"]`) ||
          document.createElement("a");
        link.href = routeHref(item.key, navigationLanguage());
        link.dataset.serviceNavItem = item.key;
        link.dataset.textHu = item.hu;
        link.dataset.textDe = item.de;
        link.dataset[item.dataset] = "true";
        link.textContent = lang === "hu" ? item.hu : lang === "de" ? item.de : translatePhrase(item.de, lang);
        link.setAttribute("role", "menuitem");
        if (currentKey === item.key) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
        dropdownMenu.appendChild(link);
      });
      dropdownMenu.dataset.renderedLang = lang;
    }

    if (header.dataset.navEventsBound !== "true") {
      header.dataset.navEventsBound = "true";

      menuToggle.addEventListener("click", () => {
        if (header.classList.contains("nav-open")) {
          closeHeaderNavigation(header);
        } else {
          openHeaderNavigation(header, menuToggle);
        }
      });

      dropdownToggle.addEventListener("click", (event) => {
        if (compactNavigationActive()) {
          event.preventDefault();
          const isCollapsed = dropdown.classList.toggle("mobile-collapsed");
          dropdownToggle.setAttribute("aria-expanded", String(!isCollapsed));
          return;
        }
        event.preventDefault();
        const isOpen = dropdown.classList.toggle("open");
        dropdownToggle.setAttribute("aria-expanded", String(isOpen));
      });

      closeButton.addEventListener("click", () => {
        closeHeaderNavigation(header, { restoreFocus: true });
      });

      mobileLanguage.addEventListener("click", (event) => {
        const option = event.target.closest("[data-mobile-language-option]");
        if (!option) return;
        event.preventDefault();
        setLanguage(option.dataset.mobileLanguageOption);
      });

      nav.addEventListener("click", (event) => {
        if (!event.target.closest("a")) return;
        closeHeaderNavigation(header);
        closeServicesDropdown(dropdown);
      });

      document.addEventListener("click", (event) => {
        if (header.contains(event.target) || event.target.closest?.(".nav-toggle, .nav")) return;
        closeHeaderNavigation(header);
        closeServicesDropdown(dropdown);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closeHeaderNavigation(header, { restoreFocus: true });
        closeServicesDropdown(dropdown);
      });

      header.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || !header.classList.contains("nav-open") || !compactNavigationActive()) return;
        const focusItems = visibleFocusItems(header);
        if (!focusItems.length) return;
        const first = focusItems[0];
        const last = focusItems[focusItems.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      window.addEventListener("resize", syncHeaderNavigationState, { passive: true });
      window.addEventListener("orientationchange", syncHeaderNavigationState, { passive: true });
    }

    syncHeaderNavigationState();
  };

  let languageReturnFocus = null;
  const closeLanguageSelector = ({ restoreFocus = false } = {}) => {
    document.querySelectorAll(".language-selector.open").forEach((selector) => {
      selector.classList.remove("open");
      selector.querySelector("#langBtn")?.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus && languageReturnFocus?.isConnected) languageReturnFocus.focus({ preventScroll: true });
    if (restoreFocus) languageReturnFocus = null;
  };

  const openLanguageSelector = (selector, trigger = null) => {
    if (!selector) return;
    document.querySelectorAll(".header").forEach((header) => {
      closeHeaderNavigation(header);
      closeServicesDropdown(header.querySelector("[data-services-dropdown]"));
    });
    languageReturnFocus = trigger || selector.querySelector("#langBtn") || null;
    selector.classList.add("open");
    selector.querySelector("#langBtn")?.setAttribute("aria-expanded", "true");
  };

  const renderLanguageSelector = () => {
    const existingButton = document.getElementById("langBtn");
    if (!existingButton) return null;

    const lang = currentLang();
    const activeLanguage = languageInfo(lang);
    let selector = existingButton.closest(".language-selector");
    if (!selector) {
      selector = document.createElement("div");
      selector.className = "language-selector";
      selector.dataset.languageSelector = "true";
      existingButton.replaceWith(selector);
      selector.appendChild(existingButton);
      existingButton.classList.add("language-toggle");
      existingButton.dataset.languageSelectorTrigger = "true";
      existingButton.setAttribute("aria-haspopup", "true");
      existingButton.setAttribute("aria-expanded", "false");
      existingButton.setAttribute("aria-controls", "languageMenu");

      const menu = document.createElement("div");
      menu.className = "language-menu";
      menu.id = "languageMenu";
      menu.setAttribute("role", "menu");
      selector.appendChild(menu);
    }

    const button = selector.querySelector("#langBtn");
    const menu = selector.querySelector(".language-menu");
    button.type = "button";
    button.classList.add("lang", "language-toggle");
    button.dataset.languageSelectorTrigger = "true";
    button.setAttribute("aria-label", t("openLanguageMenu", lang));
    button.setAttribute("aria-expanded", selector.classList.contains("open") ? "true" : "false");
    menu.setAttribute("aria-label", t("languageBadge", lang));
    const buttonMarkup = `
      <span class="language-current">
        <span class="language-current-full">${activeLanguage.label}</span>
        <span class="language-current-short" aria-hidden="true">${activeLanguage.short}</span>
      </span>
      <span class="language-chevron" aria-hidden="true"></span>`;
    if (button.innerHTML !== buttonMarkup) button.innerHTML = buttonMarkup;

    const menuMarkup = supportedLanguages
      .map(
        (language) => `
          <button type="button" role="menuitemradio" data-language-option="${language.code}" aria-checked="${String(language.code === lang)}" aria-label="${language.label} - ${language.complete}">
            <span class="flag-icon flag-${language.flag}" aria-hidden="true"></span>
            <span class="language-option-copy"><strong>${language.label}</strong><small>${language.complete}</small></span>
            <span class="language-option-check" aria-hidden="true">✓</span>
          </button>`
      )
      .join("");
    if (menu.dataset.renderedLang !== lang || menu.children.length !== supportedLanguages.length) {
      menu.innerHTML = menuMarkup;
      menu.dataset.renderedLang = lang;
    } else {
      menu.querySelectorAll("[data-language-option]").forEach((option) => {
        option.setAttribute("aria-checked", String(option.dataset.languageOption === lang));
      });
    }

    const focusLanguageOption = (direction = 1) => {
      const options = [...menu.querySelectorAll("[data-language-option]")];
      if (!options.length) return;
      const focusedIndex = options.indexOf(document.activeElement);
      const activeIndex = options.findIndex((option) => option.dataset.languageOption === currentLang());
      const baseIndex = focusedIndex >= 0 ? focusedIndex : Math.max(activeIndex, 0);
      options[(baseIndex + direction + options.length) % options.length].focus();
    };

    if (selector.dataset.languageEventsBound !== "true") {
      selector.dataset.languageEventsBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (selector.classList.contains("open")) {
          closeLanguageSelector();
        } else {
          closeLanguageSelector();
          openLanguageSelector(selector, button);
        }
      });

      button.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        event.preventDefault();
        openLanguageSelector(selector, button);
        focusLanguageOption(event.key === "ArrowDown" ? 1 : -1);
      });

      menu.addEventListener("click", (event) => {
        const option = event.target.closest("[data-language-option]");
        if (!option) return;
        event.preventDefault();
        setLanguage(option.dataset.languageOption);
      });

      selector.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeLanguageSelector({ restoreFocus: true });
          return;
        }

        if (!selector.classList.contains("open")) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          focusLanguageOption(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Home") {
          event.preventDefault();
          menu.querySelector("[data-language-option]")?.focus();
        } else if (event.key === "End") {
          event.preventDefault();
          [...menu.querySelectorAll("[data-language-option]")].pop()?.focus();
        }
      });
    }

    return selector;
  };

  const restoreOriginalText = (node) => {
    if (node.dataset?.i18nOriginalText !== undefined) node.textContent = node.dataset.i18nOriginalText;
  };

  const translateAttribute = (node, attribute, lang) => {
    const originalKey = `i18nOriginal${attribute.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase())}`;
    if (node.dataset && node.dataset[originalKey] === undefined) node.dataset[originalKey] = node.getAttribute(attribute) || "";
    const original = node.dataset?.[originalKey] || "";
    if (!original) return;
    node.setAttribute(attribute, lang === "hu" || lang === "de" ? original : translatePhrase(original, lang));
  };

  const applyTextNodeTranslations = (lang) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, .language-selector, .nav-mobile-language, [data-lang-panel]")) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.__bpsOriginalText === undefined) node.__bpsOriginalText = node.nodeValue;
      node.nodeValue = lang === "hu" || lang === "de" ? node.__bpsOriginalText : translateInlineText(node.__bpsOriginalText, lang);
    });
  };

  const applyPageLanguage = () => {
    const lang = currentLang();
    document.documentElement.lang = languageInfo(lang).html;

    document.querySelectorAll("[data-lang-panel]").forEach((panel) => {
      if (panel.dataset.i18nOriginalText === undefined) panel.dataset.i18nOriginalText = panel.textContent;
      const panelLang = panel.dataset.langPanel;
      const hasExactPanel = !!panel.parentElement?.querySelector(`[data-lang-panel="${lang}"]`);
      const showPanel = lang === panelLang || (!["hu", "de"].includes(lang) && panelLang === "de" && !hasExactPanel);
      panel.hidden = !showPanel;
      panel.setAttribute("aria-hidden", String(!showPanel));
      if (showPanel) {
        panel.textContent =
          lang === panelLang ? panel.dataset.i18nOriginalText : translatePhrase(panel.dataset.i18nOriginalText, lang);
      } else {
        restoreOriginalText(panel);
      }
    });

    document.querySelectorAll("[data-text-hu]").forEach((node) => {
      const source = lang === "hu" ? node.dataset.textHu : node.dataset.textDe || node.dataset.textHu;
      const value = lang === "hu" || lang === "de" ? source : translatePhrase(node.dataset.textDe || source, lang);
      if (value && node.textContent !== value) node.textContent = value;
    });

    document.querySelectorAll("[data-aria-hu]").forEach((node) => {
      const source = lang === "hu" ? node.dataset.ariaHu : node.dataset.ariaDe || node.dataset.ariaHu;
      const value = lang === "hu" || lang === "de" ? source : translatePhrase(node.dataset.ariaDe || source, lang);
      if (value) node.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-phone-label]").forEach((node) => {
      const isHeaderPhone = node.closest(".header");
      const value = isHeaderPhone && !directCallViewport() ? phone : phoneActionLabel(lang);
      if (node.textContent !== value) node.textContent = value;
      node.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[aria-label]:not([data-aria-hu])").forEach((node) => translateAttribute(node, "aria-label", lang));
    document.querySelectorAll("img[alt]").forEach((node) => translateAttribute(node, "alt", lang));
    renderLanguageSelector();
    bindLanguageSelectorTriggers();
    applyTextNodeTranslations(lang);
    enhanceHeaderNavigation();
    bindStickyHeaderShadow();
  };

  const syncStickyHeaderShadow = () => {
    document.querySelectorAll(".header").forEach((header) => {
      header.classList.toggle("header-scrolled", window.scrollY > 8);
    });
  };

  const bindStickyHeaderShadow = () => {
    if (document.documentElement.dataset.stickyHeaderBound === "true") return;
    document.documentElement.dataset.stickyHeaderBound = "true";
    syncStickyHeaderShadow();
    window.addEventListener("scroll", syncStickyHeaderShadow, { passive: true });
  };

  const setLanguage = (lang) => {
    const normalized = normalizeLanguage(lang) || fallbackLanguage;
    persistLanguage(normalized);
    closeLanguageSelector();
    if (normalized === "de" || normalized === "hu") {
      const targetHref = routeHref(currentRouteKey(), normalized);
      const target = new URL(targetHref, window.location.origin);
      target.hash = window.location.hash;
      if (target.pathname !== window.location.pathname || target.hash !== window.location.hash) {
        window.location.href = target.href;
        return;
      }
    }
    activeLanguage = normalized;
    window.dispatchEvent(new CustomEvent("bps:languagechange", { detail: { lang: normalized } }));
    applyPageLanguage();
  };

  const showToast = (message) => {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.dataset.toast = "true";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const closeHeroLightbox = () => {
    if (!heroLightbox) return;

    heroLightbox.classList.remove("open");
    heroLightbox.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");

    const opener = heroLightboxOpener;
    heroLightboxOpener = null;
    if (opener?.isConnected) requestAnimationFrame(() => opener.focus());
  };

  const ensureHeroLightbox = () => {
    if (heroLightbox?.isConnected) return heroLightbox;

    heroLightbox = document.createElement("div");
    heroLightbox.id = "heroLightbox";
    heroLightbox.className = "modal hero-lightbox";
    heroLightbox.setAttribute("role", "dialog");
    heroLightbox.setAttribute("aria-modal", "true");
    heroLightbox.setAttribute("aria-hidden", "true");
    heroLightbox.innerHTML = `
      <button class="backdrop" type="button" data-hero-lightbox-close aria-label="${t("closeImage")}"></button>
      <div class="panel" tabindex="-1">
        <button class="close" type="button" data-hero-lightbox-close aria-label="${t("closeImage")}">&times;</button>
        <img alt="">
      </div>
    `;

    heroLightbox.querySelectorAll("[data-hero-lightbox-close]").forEach((button) => {
      button.addEventListener("click", closeHeroLightbox);
    });

    document.body.appendChild(heroLightbox);
    return heroLightbox;
  };

  const openHeroLightbox = (image, opener) => {
    const modal = ensureHeroLightbox();
    const modalImage = modal.querySelector("img");
    const panel = modal.querySelector(".panel");

    heroLightboxOpener = opener;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => panel?.focus());
  };

  const bindHeroLightbox = () => {
    document.querySelectorAll(
      ".hero-media, .service-hero-visual, .showcase-photo[data-paint-reveal], .maintenance-showcase-visuals .showcase-photo"
    ).forEach((target) => {
      if (target.dataset.heroLightboxBound === "true") return;

      const image = target.querySelector("img");
      if (!image) return;

      target.dataset.heroLightbox = "true";
      target.dataset.heroLightboxBound = "true";
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
      target.setAttribute("aria-label", image.alt ? `Open image: ${image.alt}` : "Open image");

      target.addEventListener("click", (event) => {
        if (
          target.dataset.paintSuppressClick === "true" ||
          target.querySelector('[data-paint-reveal][data-paint-suppress-click="true"]')
        ) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        openHeroLightbox(image, target);
      });
      target.addEventListener("keydown", (event) => {
        if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openHeroLightbox(image, target);
      });
    });
  };

  const bindPaintReveal = () => {
    if (!document.querySelector("[data-paint-reveal]")) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const supportsPointerEvents = "PointerEvent" in window;
    const supportsTouchEvents = "ontouchstart" in window || (typeof TouchEvent !== "undefined" && navigator.maxTouchPoints > 0);
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
    const localDebugHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
    const forceTouchInput = localDebugHost && /(?:^|[?&])paintInput=touch(?:&|$)/.test(window.location.search);
    const forceMouseInput = localDebugHost && /(?:^|[?&])paintInput=mouse(?:&|$)/.test(window.location.search);
    const canUseTouchFallback = !supportsPointerEvents && (supportsTouchEvents || (localDebugHost && typeof TouchEvent !== "undefined"));
    const usePointerInput = !forceMouseInput && supportsPointerEvents;
    const useTouchFallback = !forceMouseInput && !usePointerInput && canUseTouchFallback && (forceTouchInput || coarsePointer || supportsTouchEvents);
    const useMouseFallback = forceMouseInput || (!usePointerInput && !useTouchFallback);
    const paintDebugEnabled =
      localDebugHost && /(?:^|[?&])paintDebug=1(?:&|$)/.test(window.location.search);
    const interactiveLimit = 6;
    const activeRoots = [...document.querySelectorAll("[data-paint-reveal]")].filter((root) => {
      const insideComparison = root.closest(
        "[data-compare], .compare, .hero-mini-compare, .hero-before-after-card, .transformation-visual, .case-preview"
      );
      const ownsComparison = root.matches("[data-compare], .compare") || root.querySelector("[data-compare], .compare");
      return !insideComparison && !ownsComparison;
    });
    paintDebug.log("paint-bind-started", {
      activeRootCount: activeRoots.length,
      supportsPointerEvents,
      supportsTouchEvents,
      coarsePointer,
      usePointerInput,
      useTouchFallback,
      useMouseFallback,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      pointerCoarse: window.matchMedia?.("(pointer: coarse)")?.matches === true,
    });

    const modeAliases = {
      blue: "paintBlue",
      plaster: "repair",
      surface: "repair",
      sage: "garden",
      airbnb: "airbnb",
    };

    const paintModes = {
      paint: {
        color: "#c86436",
        opacity: 1,
        shadow: "rgba(92, 34, 15, 0.16)",
        highlight: "rgba(255, 216, 184, 0.1)",
        accent: "#a84b2a",
        effect: "color",
        icon: "roller",
        preview: false,
        material: {
          webp: "assets/paint-showcase-galaxy-night-mural.webp",
          fallback: "assets/paint-showcase-galaxy-night-mural.jpg",
        },
        hint: {
          hu: "Fesd át a falat az ujjaddal",
          en: "Paint the wall with your finger",
          de: "Streichen Sie die Wand mit dem Finger",
          uk: "Пофарбуйте стіну пальцем",
          "zh-CN": "用手指粉刷墙面",
        },
      },
      paintBlue: {
        color: "#c86436",
        opacity: 1,
        shadow: "rgba(92, 34, 15, 0.16)",
        highlight: "rgba(255, 216, 184, 0.1)",
        accent: "#a84b2a",
        effect: "color",
        icon: "roller",
        preview: false,
        material: {
          webp: "assets/paint-showcase-galaxy-night-mural.webp",
          fallback: "assets/paint-showcase-galaxy-night-mural.jpg",
        },
        hint: {
          hu: "Fesd át a falat az ujjaddal",
          en: "Paint the wall with your finger",
          de: "Streichen Sie die Wand mit dem Finger",
          uk: "Пофарбуйте стіну пальцем",
          "zh-CN": "用手指粉刷墙面",
        },
      },
      clean: {
        color: "#f7fbf7",
        opacity: 0.72,
        shadow: "rgba(32, 74, 68, 0.08)",
        highlight: "rgba(255, 255, 255, 0.24)",
        accent: "#4c8b86",
        effect: "clean",
        icon: "wipe",
        preview: true,
        hint: {
          hu: "Töröld tisztára a felületet",
          en: "Wipe the surface clean",
          de: "Wischen Sie die Fläche sauber",
          uk: "Витріть поверхню начисто",
          "zh-CN": "擦净表面",
        },
      },
      repair: {
        color: "#ddd2c1",
        opacity: 0.88,
        shadow: "rgba(111, 91, 68, 0.1)",
        highlight: "rgba(255, 255, 255, 0.16)",
        accent: "#a99174",
        effect: "repair",
        icon: "trowel",
        preview: false,
        hint: {
          hu: "Simítsd el a hibákat",
          en: "Smooth out the damage",
          de: "Glätten Sie die Schäden",
          uk: "Вирівняйте пошкодження",
          "zh-CN": "抹平损伤",
        },
      },
      garden: {
        color: "#6f935d",
        opacity: 0.68,
        shadow: "rgba(44, 80, 43, 0.13)",
        highlight: "rgba(233, 246, 214, 0.12)",
        accent: "#5f8b4e",
        effect: "garden",
        icon: "leaf",
        preview: true,
        hint: {
          hu: "Frissítsd fel a kertet",
          en: "Refresh the garden",
          de: "Frischen Sie den Garten auf",
          uk: "Оновіть сад",
          "zh-CN": "刷新花园",
        },
      },
      airbnb: {
        color: "#d9a46f",
        opacity: 0.58,
        shadow: "rgba(102, 70, 43, 0.08)",
        highlight: "rgba(255, 241, 216, 0.18)",
        accent: "#c78955",
        effect: "airbnb",
        icon: "spark",
        preview: true,
        hint: {
          hu: "Tedd vendégfogadásra késszé",
          en: "Make it guest-ready",
          de: "Machen Sie es gastbereit",
          uk: "Підготуйте до гостей",
          "zh-CN": "让它适合待客",
        },
      },
    };

    activeRoots.slice(0, interactiveLimit).forEach((root, index) => {
      const componentId =
        root.dataset.paintDebugId ||
        root.id ||
        `paint-${index + 1}-${(root.dataset.paintMode || "paint").toLowerCase()}`;
      root.dataset.paintDebugId = componentId;
      const paintLog = (event, details = {}) =>
        {
          try {
            return paintDebug.log(event, {
              componentId,
              rootClass: root.className || "",
              inputMode: root.dataset.paintInputMode || "",
              ...details,
            });
          } catch (error) {
            if (paintDebugEnabled) console.warn("[paint-reveal] diagnostic log failed", error);
            return null;
          }
        };

      paintLog("component-init-started", {
        alreadyBound: root.dataset.paintRevealBound === "true",
        requestedMode: root.dataset.paintMode || "paint",
      });

      if (root.dataset.paintRevealBound === "true") {
        paintLog("component-init-skipped-already-bound");
        return;
      }
      root.dataset.paintRevealBound = "true";
      root.dataset.paintInputMode =
        [
          usePointerInput && "pointer",
          useTouchFallback && "touch",
          useMouseFallback && "mouse",
        ]
          .filter(Boolean)
          .join("+") || "none";
      if (reducedMotion) root.dataset.paintReducedMotion = "true";

      const image = root.dataset.paintImageSelector
        ? root.querySelector(root.dataset.paintImageSelector)
        : root.querySelector("img");
      if (!image) {
        paintLog("component-init-aborted-no-image");
        return;
      }
      paintLog("image-state", {
        stage: "init",
        complete: image.complete,
        naturalWidth: image.naturalWidth || 0,
        naturalHeight: image.naturalHeight || 0,
        currentSrc: image.currentSrc || image.src || "",
      });
      image.draggable = false;

      const parsePolygons = (value = "") =>
        value
          .split(";")
          .map((group) =>
            group
              .trim()
              .split(/\s+/)
              .map((pair) => {
                const [x, y] = pair.split(",").map(Number);
                return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
              })
              .filter(Boolean)
          )
          .filter((polygon) => polygon.length >= 3);

      const includePolygons = parsePolygons(root.dataset.paintRegions || root.dataset.paintRegion || "");
      const excludePolygons = parsePolygons(root.dataset.paintExclude || "");

      if (!includePolygons.length) {
        root.dataset.paintRevealDisabled = "true";
        paintLog("component-init-aborted-no-mask");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.className = "paint-reveal-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.touchAction = "none";
      root.appendChild(canvas);

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        canvas.remove();
        root.dataset.paintRevealDisabled = "true";
        paintLog("component-init-aborted-no-canvas-context");
        return;
      }

      const layerCanvas = document.createElement("canvas");
      const maskCanvas = document.createElement("canvas");
      const wallMaskCanvas = document.createElement("canvas");
      const layerCtx = layerCanvas.getContext("2d", { alpha: true });
      const maskCtx = maskCanvas.getContext("2d", { alpha: true });
      const wallMaskCtx = wallMaskCanvas.getContext("2d", { alpha: true });
      if (!layerCtx || !maskCtx || !wallMaskCtx) {
        canvas.remove();
        root.dataset.paintRevealDisabled = "true";
        paintLog("component-init-aborted-no-layer-context");
        return;
      }

      const rawPaintMode = root.dataset.paintMode || "paint";
      const paintMode = modeAliases[rawPaintMode] || rawPaintMode;
      const activePalette = paintModes[paintMode] || paintModes.paint;
      const paintColor = root.dataset.paintColor || activePalette.color;
      const paintOpacity = Number(root.dataset.paintOpacity) || activePalette.opacity;
      const paintHighlightColor = root.dataset.paintHighlightColor || activePalette.highlight;
      const baseBrushSize = Math.max(40, Number(root.dataset.paintBrush) || 122);
      const fadeDelay = Number(root.dataset.paintFadeDelay) || 4000;
      root.style.setProperty("--paint-reveal-accent", root.dataset.paintAccent || activePalette.accent);
      root.dataset.paintMode = paintMode;
      root.dataset.paintIcon = activePalette.icon;
      const materialSources = activePalette.material || null;
      let materialImage = null;
      let materialImageReady = false;
      let materialImageFallbackTried = false;
      let refreshMaterialAfterLoad = () => {};
      const loadMaterialImage = (source) => {
        if (!source) return;
        materialImageReady = false;
        materialImage = new Image();
        materialImage.decoding = "async";
        if ("fetchPriority" in materialImage) materialImage.fetchPriority = "low";
        materialImage.onload = () => {
          materialImageReady = true;
          if (root.classList.contains("paint-reveal-used")) refreshMaterialAfterLoad();
          paintLog("paint-material-image-loaded", {
            source,
            width: materialImage.naturalWidth || 0,
            height: materialImage.naturalHeight || 0,
          });
        };
        materialImage.onerror = () => {
          paintLog("paint-material-image-error", { source });
          if (!materialImageFallbackTried && materialSources?.fallback && source !== materialSources.fallback) {
            materialImageFallbackTried = true;
            loadMaterialImage(materialSources.fallback);
          }
        };
        materialImage.src = new URL(source, scriptBaseUrl).href;
      };
      if (materialSources?.webp || materialSources?.fallback) {
        loadMaterialImage(materialSources.webp || materialSources.fallback);
      }
      const clickSuppressionTargets = [
        root,
        root.closest("[data-hero-lightbox]"),
      ].filter(Boolean);
      let cssWidth = 1;
      let cssHeight = 1;
      let brushSize = baseBrushSize;
      let ratio = 1;
      let pending = null;
      let activePointer = null;
      let lastPoint = null;
      let queuedPoint = null;
      let strokeFrame = 0;
      let renderFrame = 0;
      let fadeTimer = 0;
      let clearTimer = 0;
      let blockNextClick = false;
      let unblockClickTimer = 0;
      let resizeFrame = 0;
      let pointerCaptureActive = false;
      let pointerFallbackBound = false;
      let mouseIsDown = false;
      let suppressClickUntil = 0;
      let previewTimer = 0;
      let previewFrame = 0;
      let demoIndicator = null;
      let demoHideTimer = 0;
      let paintMaterialReady = false;
      let autoPreviewStarted = false;
      let imageReadyResetQueued = false;
      let canvasResetAttempts = 0;
      let lastCanvasResetAttempts = 0;
      let canvasResetStartedAt = 0;
      const maxCanvasResetAttempts = 18;
      const maxCanvasResetDuration = 2800;
      const activationThreshold = 5;
      const dragThreshold = 5;
      let activeInputFamily = null;
      let touchPaintPointerId = null;
      let paintStartPipelineSequence = 0;
      let firstPointerMoveTraced = false;

      const inputGestureActive = () => activePointer !== null || pending !== null;
      const canUseInputFamily = (family) => !inputGestureActive() || activeInputFamily === family;

      const roundedPoint = (point) =>
        point
          ? {
              x: Math.round(point.x),
              y: Math.round(point.y),
            }
          : null;

      const imageSnapshot = (stage = "") => ({
        stage,
        complete: image.complete,
        naturalWidth: image.naturalWidth || 0,
        naturalHeight: image.naturalHeight || 0,
        currentSrc: image.currentSrc || image.src || "",
      });

      const canvasSnapshot = () => {
        const rect = canvas.getBoundingClientRect();
        return {
          cssWidth,
          cssHeight,
          backingWidth: canvas.width,
          backingHeight: canvas.height,
          ratio,
          rect: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
          },
        };
      };

      const gestureSnapshot = () => ({
        activeInputFamily,
        activePointer,
        pending: pending
          ? {
              id: pending.id,
              mode: pending.mode,
              pointerType: pending.pointerType,
              insideWall: pending.insideWall,
              dragged: pending.dragged,
              start: roundedPoint(pending.start),
              last: roundedPoint(pending.last),
            }
          : null,
        lastPoint: roundedPoint(lastPoint),
        queuedPoint: roundedPoint(queuedPoint),
        pointerCaptureActive,
        mouseIsDown,
        paintGesture: root.dataset.paintGesture || "",
        ready: root.classList.contains("paint-reveal-ready"),
        active: root.classList.contains("paint-reveal-active"),
        hit: root.classList.contains("paint-reveal-hit"),
      });

      const targetSnapshot = (target) => ({
        tag: target?.tagName || "",
        id: target?.id || "",
        className: typeof target?.className === "string" ? target.className : String(target?.className || ""),
        isCanvas: target === canvas,
        isImage: target === image,
      });

      const pointerEventDetails = (event) => ({
        pointerId: event.pointerId,
        pointerType: event.pointerType || "",
        isPrimary: event.isPrimary,
        button: event.button,
        buttons: event.buttons,
        cancelable: event.cancelable,
        clientX: Math.round(event.clientX || 0),
        clientY: Math.round(event.clientY || 0),
        target: targetSnapshot(event.target),
      });

      const touchEventDetails = (event) => {
        const changed = event.changedTouches?.[0];
        return {
          cancelable: event.cancelable,
          touches: event.touches?.length || 0,
          changedTouches: event.changedTouches?.length || 0,
          touchIdentifier: changed?.identifier,
          clientX: changed ? Math.round(changed.clientX) : null,
          clientY: changed ? Math.round(changed.clientY) : null,
          target: targetSnapshot(event.target),
        };
      };

      const describeProbeNode = (node) => {
        if (!node) return { summary: "none" };
        if (node === window) return { summary: "window" };
        if (node === document) return { summary: "document" };
        if (node === document.documentElement) return { summary: "html", tag: "HTML" };
        if (node === document.body) return { summary: "body", tag: "BODY" };
        const tag = node.tagName || node.nodeName || "node";
        const id = node.id ? `#${node.id}` : "";
        const className =
          typeof node.className === "string"
            ? node.className.trim()
            : typeof node.getAttribute === "function"
              ? node.getAttribute("class") || ""
              : "";
        const classes = className
          ? `.${className
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 5)
              .join(".")}`
          : "";
        const closestPaintRoot =
          typeof node.closest === "function" ? node.closest("[data-paint-reveal]") : null;
        return {
          summary: `${String(tag).toLowerCase()}${id}${classes}`,
          tag,
          id: node.id || "",
          className,
          role: typeof node.getAttribute === "function" ? node.getAttribute("role") || "" : "",
          href: typeof node.getAttribute === "function" ? node.getAttribute("href") || "" : "",
          dataPaintReveal: typeof node.hasAttribute === "function" ? node.hasAttribute("data-paint-reveal") : false,
          dataHeroLightbox: typeof node.hasAttribute === "function" ? node.hasAttribute("data-hero-lightbox") : false,
          dataPaintDebugId: closestPaintRoot?.dataset.paintDebugId || "",
          isRoot: node === root,
          isCanvas: node === canvas,
          isImage: node === image,
        };
      };

      const probePointFromEvent = (event) => {
        if (event.changedTouches?.length) {
          const touch = event.changedTouches[0];
          return { clientX: Math.round(touch.clientX), clientY: Math.round(touch.clientY) };
        }
        if (event.touches?.length) {
          const touch = event.touches[0];
          return { clientX: Math.round(touch.clientX), clientY: Math.round(touch.clientY) };
        }
        if (typeof event.clientX === "number" && typeof event.clientY === "number") {
          return { clientX: Math.round(event.clientX), clientY: Math.round(event.clientY) };
        }
        return { clientX: null, clientY: null };
      };

      const computedProbeSnapshot = (node) => {
        if (!node || node === window || node === document || node.nodeType !== 1) return null;
        const rect = node.getBoundingClientRect();
        const styles = window.getComputedStyle(node);
        return {
          rect: {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          position: styles.position,
          zIndex: styles.zIndex,
          pointerEvents: styles.pointerEvents,
          touchAction: styles.touchAction,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
        };
      };

      const inputSurfaceSnapshot = (clientX, clientY) => {
        if (!paintDebugPanelEnabled() || clientX === null || clientY === null) return null;
        const pointX = Number(clientX);
        const pointY = Number(clientY);
        const hit =
          Number.isFinite(pointX) && Number.isFinite(pointY)
            ? document.elementFromPoint(pointX, pointY)
            : null;
        const hitStack =
          Number.isFinite(pointX) && Number.isFinite(pointY) && typeof document.elementsFromPoint === "function"
            ? document.elementsFromPoint(pointX, pointY)
                .slice(0, 12)
                .map((node) => ({
                  ...describeProbeNode(node),
                  computed: computedProbeSnapshot(node),
                }))
            : [];
        return {
          elementFromPoint: describeProbeNode(hit),
          elementsFromPoint: hitStack,
          imageComputed: computedProbeSnapshot(image),
          canvasComputed: computedProbeSnapshot(canvas),
          rootComputed: computedProbeSnapshot(root),
          wrapperComputed: computedProbeSnapshot(image.parentElement || root),
        };
      };

      const installInputProbe = () => {
        if (!paintDebugPanelEnabled() || root.dataset.paintInputProbeBound === "true") return;
        root.dataset.paintInputProbeBound = "true";

        const logProbe = (scope) => (event) => {
          const point = probePointFromEvent(event);
          const hit =
            point.clientX === null || point.clientY === null
              ? null
              : document.elementFromPoint(point.clientX, point.clientY);
          const hitStack =
            point.clientX === null || point.clientY === null || typeof document.elementsFromPoint !== "function"
              ? []
              : document.elementsFromPoint(point.clientX, point.clientY)
                  .slice(0, 12)
                  .map((node) => ({
                    ...describeProbeNode(node),
                    computed: computedProbeSnapshot(node),
                  }));

          paintLog(`input-probe-${scope}-${event.type}`, {
            scope,
            eventType: event.type,
            pointerId: event.pointerId,
            pointerType: event.pointerType || (event.type.startsWith("touch") ? "touch" : ""),
            clientX: point.clientX,
            clientY: point.clientY,
            cancelable: event.cancelable,
            defaultPrevented: event.defaultPrevented,
            target: describeProbeNode(event.target),
            currentTarget: scope,
            currentTargetNode: describeProbeNode(event.currentTarget),
            elementFromPoint: describeProbeNode(hit),
            elementsFromPoint: hitStack,
            canvasComputed: computedProbeSnapshot(canvas),
            rootComputed: computedProbeSnapshot(root),
            canvas: canvasSnapshot(),
            image: imageSnapshot("input-probe"),
            gesture: gestureSnapshot(),
            ready: root.classList.contains("paint-reveal-ready"),
          });
        };

        const pointerOptions = { capture: true, passive: true };
        const touchOptions = { capture: true, passive: true };
        [
          [window, "window"],
          [document, "document"],
          [root, "paint-root"],
          [canvas, "canvas"],
        ].forEach(([target, scope]) => {
          ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
            target.addEventListener(eventName, logProbe(scope), pointerOptions);
          });
          ["touchstart", "touchmove", "touchend", "touchcancel"].forEach((eventName) => {
            target.addEventListener(eventName, logProbe(scope), touchOptions);
          });
        });

        paintLog("input-probe-installed", {
          scopes: ["window", "document", "paint-root", "canvas"],
          events: paintInputEventNames,
          canvasComputed: computedProbeSnapshot(canvas),
          rootComputed: computedProbeSnapshot(root),
        });
      };

      const runPaintEvent = (eventName, event, details, callback) => {
        const before = gestureSnapshot();
        const surface = inputSurfaceSnapshot(details.clientX, details.clientY);
        paintLog(`${eventName}-received`, {
          ...details,
          ...(surface ? { surface } : {}),
          before,
        });
        try {
          return callback();
        } catch (error) {
          paintLog("caught-exception", {
            source: eventName,
            error: paintDebugError(error),
            before,
            after: gestureSnapshot(),
          });
          throw error;
        } finally {
          paintLog(`${eventName}-completed`, {
            ...details,
            ...(surface ? { surface } : {}),
            before,
            after: gestureSnapshot(),
          });
        }
      };

      const debugPaint = (eventName, details = {}) => {
        const imageRect = image.getBoundingClientRect();
        const payload = {
          inputMode: root.dataset.paintInputMode,
          mode: paintMode,
          gesture: root.dataset.paintGesture || "",
          css: { width: cssWidth, height: cssHeight },
          backing: { width: canvas.width, height: canvas.height },
          ratio,
          imageLoaded: image.complete && !!image.naturalWidth,
          imageRect: {
            width: Math.round(imageRect.width),
            height: Math.round(imageRect.height),
          },
          ready: root.classList.contains("paint-reveal-ready"),
          ...details,
        };
        paintLog(eventName, {
          ...payload,
          snapshot: {
            image: imageSnapshot(eventName),
            canvas: canvasSnapshot(),
            gesture: gestureSnapshot(),
          },
        });
        if (paintDebugEnabled) console.info("[paint-reveal]", eventName, payload);
      };

      const readinessSnapshot = () => {
        const imageRect = image.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const imageLoaded = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        return {
          imageLoaded,
          naturalWidth: image.naturalWidth || 0,
          naturalHeight: image.naturalHeight || 0,
          imageRectWidth: Math.round(imageRect.width),
          imageRectHeight: Math.round(imageRect.height),
          canvasCssWidth: Math.round(canvasRect.width),
          canvasCssHeight: Math.round(canvasRect.height),
          canvasBackingWidth: canvas.width,
          canvasBackingHeight: canvas.height,
          ready: root.classList.contains("paint-reveal-ready"),
          resetAttemptCount: lastCanvasResetAttempts || canvasResetAttempts,
          resetQueued: imageReadyResetQueued,
        };
      };

      const reportReadinessStatus = (eventName, details = {}) => {
        const readiness = readinessSnapshot();
        root.dataset.paintImageLoaded = readiness.imageLoaded ? "true" : "false";
        root.dataset.paintImageNatural = `${readiness.naturalWidth}x${readiness.naturalHeight}`;
        root.dataset.paintImageRect = `${readiness.imageRectWidth}x${readiness.imageRectHeight}`;
        root.dataset.paintCanvasCss = `${readiness.canvasCssWidth}x${readiness.canvasCssHeight}`;
        root.dataset.paintCanvasBacking = `${readiness.canvasBackingWidth}x${readiness.canvasBackingHeight}`;
        root.dataset.paintReady = readiness.ready ? "true" : "false";
        root.dataset.paintResetAttempts = String(readiness.resetAttemptCount);
        debugPaint(eventName, {
          readiness,
          ...details,
        });
      };

      const ensurePaintHint = () => {
        let hint = root.querySelector(".paint-reveal-hint");
        if (!hint) {
          hint = document.createElement("div");
          hint.className = "paint-reveal-hint";
          hint.setAttribute("aria-hidden", "true");
          root.appendChild(hint);
        }
        hint.dataset.paintHintMode = paintMode;
        const markup = Object.entries(activePalette.hint)
          .map(
            ([lang, text]) =>
              `<span data-lang-panel="${lang}"${lang === currentLang() ? "" : " hidden"}>${text}</span>`
          )
          .join("");
        if (hint.dataset.paintHintRendered !== paintMode) {
          hint.innerHTML = markup;
          hint.dataset.paintHintRendered = paintMode;
        }
      };

      ensurePaintHint();

      const getImagePaintRect = () => {
        const naturalWidth = image.naturalWidth || 1;
        const naturalHeight = image.naturalHeight || 1;
        const objectFit = window.getComputedStyle(image).objectFit;
        const useContain = objectFit === "contain" || objectFit === "scale-down";
        const useCover = objectFit === "cover";
        if (!useContain && !useCover) {
          return {
            x: 0,
            y: 0,
            width: cssWidth,
            height: cssHeight,
          };
        }

        const scale = useCover
          ? Math.max(cssWidth / naturalWidth, cssHeight / naturalHeight)
          : Math.min(cssWidth / naturalWidth, cssHeight / naturalHeight);
        const width = naturalWidth * scale;
        const height = naturalHeight * scale;
        return {
          x: (cssWidth - width) / 2,
          y: (cssHeight - height) / 2,
          width,
          height,
        };
      };

      const normalToCanvas = (point) => {
        const cover = getImagePaintRect();
        return {
          x: cover.x + point.x * cover.width,
          y: cover.y + point.y * cover.height,
        };
      };

      const canvasToNormal = (point) => {
        const cover = getImagePaintRect();
        return {
          x: (point.x - cover.x) / cover.width,
          y: (point.y - cover.y) / cover.height,
        };
      };

      const pointInPolygon = (point, polygon) => {
        let inside = false;
        for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
          const currentPoint = polygon[index];
          const previousPoint = polygon[previous];
          const intersects =
            currentPoint.y > point.y !== previousPoint.y > point.y &&
            point.x <
              ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
                (previousPoint.y - currentPoint.y) +
                currentPoint.x;
          if (intersects) inside = !inside;
        }
        return inside;
      };

      const pointInsideWall = (point) => {
        const normal = canvasToNormal(point);
        if (normal.x < 0 || normal.x > 1 || normal.y < 0 || normal.y > 1) return false;
        const included = includePolygons.some((polygon) => pointInPolygon(normal, polygon));
        const excluded = excludePolygons.some((polygon) => pointInPolygon(normal, polygon));
        return included && !excluded;
      };

      const localPointFromClient = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      };

      const localPoint = (event) => localPointFromClient(event.clientX, event.clientY);

      const addPolygonPath = (context, polygon) => {
        polygon.forEach((point, index) => {
          const canvasPoint = normalToCanvas(point);
          if (index === 0) {
            context.moveTo(canvasPoint.x, canvasPoint.y);
          } else {
            context.lineTo(canvasPoint.x, canvasPoint.y);
          }
        });
        context.closePath();
      };

      const clearCanvas = () => {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      };

      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

      const drawImageTo = (context) => {
        const cover = getImagePaintRect();
        context.drawImage(image, cover.x, cover.y, cover.width, cover.height);
      };

      const drawCoverSourceTo = (context, source) => {
        const cover = getImagePaintRect();
        const sourceWidth = source.naturalWidth || source.videoWidth || source.width || 0;
        const sourceHeight = source.naturalHeight || source.videoHeight || source.height || 0;
        if (!sourceWidth || !sourceHeight || !cover.width || !cover.height) return false;
        const scale = Math.max(cover.width / sourceWidth, cover.height / sourceHeight);
        const cropWidth = cover.width / scale;
        const cropHeight = cover.height / scale;
        const cropX = (sourceWidth - cropWidth) / 2;
        const cropY = (sourceHeight - cropHeight) / 2;
        context.drawImage(source, cropX, cropY, cropWidth, cropHeight, cover.x, cover.y, cover.width, cover.height);
        return true;
      };

      const buildWallMask = () => {
        wallMaskCtx.clearRect(0, 0, cssWidth, cssHeight);
        wallMaskCtx.save();
        wallMaskCtx.fillStyle = "#fff";
        wallMaskCtx.beginPath();
        includePolygons.forEach((polygon) => addPolygonPath(wallMaskCtx, polygon));
        excludePolygons.forEach((polygon) => addPolygonPath(wallMaskCtx, polygon));
        try {
          wallMaskCtx.fill("evenodd");
        } catch (error) {
          paintLog("caught-exception", {
            source: "buildWallMask.fill-evenodd",
            error: paintDebugError(error),
          });
          wallMaskCtx.fill();
        }
        wallMaskCtx.restore();
      };

      const buildPaintMaterial = () => {
        if (paintDebugPanelEnabled()) {
          debugPaint("buildPaintMaterial-entered", {
            paintMaterialReady,
          });
        }
        layerCtx.clearRect(0, 0, cssWidth, cssHeight);

        if (materialImageReady && materialImage && drawCoverSourceTo(layerCtx, materialImage)) {
          layerCtx.save();
          layerCtx.globalCompositeOperation = "multiply";
          layerCtx.globalAlpha = 0.18;
          drawImageTo(layerCtx);
          layerCtx.globalCompositeOperation = "screen";
          layerCtx.globalAlpha = 0.08;
          drawImageTo(layerCtx);
          layerCtx.globalCompositeOperation = "source-atop";
          layerCtx.globalAlpha = 0.08;
          layerCtx.fillStyle = "rgba(12, 23, 49, 0.7)";
          layerCtx.fillRect(0, 0, cssWidth, cssHeight);
          layerCtx.restore();
        } else {
          drawImageTo(layerCtx);

          const strength = clamp(paintOpacity, activePalette.effect === "color" ? 0.92 : 0.58, 0.98);
          layerCtx.save();
          layerCtx.globalCompositeOperation = "source-atop";
          layerCtx.globalAlpha = strength;
          layerCtx.fillStyle = paintColor;
          layerCtx.fillRect(0, 0, cssWidth, cssHeight);

          if (activePalette.effect === "color") {
            layerCtx.globalCompositeOperation = "multiply";
            layerCtx.globalAlpha = 0.16;
            drawImageTo(layerCtx);
            layerCtx.globalCompositeOperation = "screen";
            layerCtx.globalAlpha = 0.06;
            layerCtx.fillStyle = paintHighlightColor;
            layerCtx.fillRect(0, 0, cssWidth, cssHeight);
          } else {
            layerCtx.globalCompositeOperation = "source-atop";
            layerCtx.globalAlpha = 0.12;
            layerCtx.fillStyle = paintHighlightColor;
            layerCtx.fillRect(0, 0, cssWidth, cssHeight);
          }
          layerCtx.restore();
        }
        layerCtx.globalCompositeOperation = "source-over";
        layerCtx.globalAlpha = 1;
        paintMaterialReady = true;
        if (paintDebugPanelEnabled()) {
          debugPaint("buildPaintMaterial-completed", {
            paintMaterialReady,
          });
        }
      };

      const renderPaintedWall = () => {
        renderFrame = 0;
        if (!paintMaterialReady) {
          if (paintDebugPanelEnabled()) {
            logInputEarlyReturn("renderPaintedWall", "paint-material-not-ready");
          }
          return;
        }
        clearCanvas();
        ctx.save();
        ctx.drawImage(layerCanvas, 0, 0, cssWidth, cssHeight);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0, cssWidth, cssHeight);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(wallMaskCanvas, 0, 0, cssWidth, cssHeight);
        ctx.restore();
        ctx.globalCompositeOperation = "source-over";
        if (paintDebugPanelEnabled()) {
          debugPaint("canvas-pixels-modified", {
            paintMaterialReady,
          });
        }
        logPaintStartPipeline("first-draw-operation-executed", {
          firstDrawExecuted: true,
          revealAtCalled: true,
          paintMaterialReady,
        });
      };

      const requestRender = () => {
        if (renderFrame) return;
        renderFrame = window.requestAnimationFrame(renderPaintedWall);
      };

      refreshMaterialAfterLoad = () => {
        paintMaterialReady = false;
        buildPaintMaterial();
        requestRender();
      };

      const randomUnit = (seed) => {
        const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return value - Math.floor(value);
      };

      const paintRollerSegment = (from, to) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 1) {
          if (paintDebugPanelEnabled()) {
            logInputEarlyReturn("paintRollerSegment", "distance-below-one-pixel", {
              from: roundedPoint(from),
              to: roundedPoint(to),
              distance,
            });
          }
          return;
        }
        if (paintDebugPanelEnabled()) {
          debugPaint("revealAt-called", {
            from: roundedPoint(from),
            to: roundedPoint(to),
            distance,
          });
        }
        logPaintStartPipeline("revealAt-called", {
          revealAtCalled: true,
          from: roundedPoint(from),
          to: roundedPoint(to),
          distance,
        });
        const angle = Math.atan2(dy, dx);
        const tangent = { x: Math.cos(angle), y: Math.sin(angle) };
        const normal = { x: -Math.sin(angle), y: Math.cos(angle) };
        const isRoller = activePalette.effect === "color";
        const rollerWidth = brushSize * (isRoller ? 1.05 : 0.7);
        const laneCount = isRoller ? 34 : 18;
        const baseSeed = from.x * 0.17 + from.y * 0.23 + to.x * 0.31 + to.y * 0.29;
        const segmentCount = Math.max(3, Math.ceil(distance / Math.max(8, brushSize * 0.16)));

        maskCtx.save();
        maskCtx.globalCompositeOperation = "source-over";
        maskCtx.lineCap = "round";
        maskCtx.lineJoin = "round";

        const strokeOrganicLane = (offset, width, alpha, seed, waveAmount = 0.012) => {
          const startRunout = (randomUnit(seed + 13.9) - 0.5) * brushSize * 0.1;
          const endRunout = (randomUnit(seed + 17.2) - 0.5) * brushSize * 0.1;
          const frequency = 1.1 + randomUnit(seed + 0.37) * 1.05;
          const phase = randomUnit(seed + 19.7) * Math.PI;

          maskCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
          maskCtx.lineWidth = Math.max(2.5, width);
          maskCtx.beginPath();

          for (let segment = 0; segment <= segmentCount; segment += 1) {
            const t = segment / segmentCount;
            const along = startRunout * (1 - t) + endRunout * t;
            const wave =
              Math.sin(t * Math.PI * 2 * frequency + phase) *
              brushSize *
              waveAmount *
              (0.68 + randomUnit(seed + segment * 4.11) * 0.42);
            const x = from.x + dx * t + tangent.x * along + normal.x * (offset + wave);
            const y = from.y + dy * t + tangent.y * along + normal.y * (offset + wave);
            if (segment === 0) {
              maskCtx.moveTo(x, y);
            } else {
              maskCtx.lineTo(x, y);
            }
          }
          maskCtx.stroke();
        };

        if (isRoller) {
          for (let pass = 0; pass < 6; pass += 1) {
            const passSeed = baseSeed + 120 + pass * 9.7;
            const offset = (pass - 2.5) * rollerWidth * 0.09 + (randomUnit(passSeed) - 0.5) * rollerWidth * 0.03;
            const width = rollerWidth * (0.31 + randomUnit(passSeed + 1.4) * 0.1);
            const alpha = 0.58 + randomUnit(passSeed + 2.8) * 0.1;
            strokeOrganicLane(offset, width, alpha, passSeed, 0.009);
          }
        }

        for (let lane = 0; lane < laneCount; lane += 1) {
          const laneT = laneCount === 1 ? 0.5 : lane / (laneCount - 1);
          const edge = Math.abs(laneT - 0.5) * 2;
          const edgeNoise = randomUnit(baseSeed + lane * 2.73);
          if (edge > 0.82 && edgeNoise < 0.2) continue;
          const offset =
            (laneT - 0.5) * rollerWidth +
            (randomUnit(baseSeed + lane * 3.91) - 0.5) * rollerWidth * (isRoller ? 0.035 : 0.025);
          const pressure = isRoller ? 0.88 + randomUnit(baseSeed + lane * 5.17) * 0.18 : 0.62;
          const edgeFalloff = isRoller ? 1 - Math.pow(edge, 1.45) * 0.46 : 1 - edge * 0.42;
          const dryVariation = isRoller ? 0.78 + randomUnit(baseSeed + lane * 7.61) * 0.34 : 0.78;
          const alpha = clamp(
            (isRoller ? 0.7 : 0.26) * pressure * edgeFalloff * dryVariation,
            isRoller ? 0.22 : 0.08,
            isRoller ? 0.86 : 0.34
          );
          const width = (rollerWidth / laneCount) * (isRoller ? 2.15 : 1.85) * (0.78 + randomUnit(baseSeed + lane * 11.3) * 0.58);
          strokeOrganicLane(offset, width, alpha, baseSeed + lane * 19.7, isRoller ? 0.016 : 0.008);
        }

        for (let edgeMark = 0; edgeMark < (isRoller ? 18 : 8); edgeMark += 1) {
          const t = randomUnit(baseSeed + 40 + edgeMark * 4.1);
          const side = randomUnit(baseSeed + 60 + edgeMark) > 0.5 ? 1 : -1;
          const edgeOffset = side * rollerWidth * (0.39 + randomUnit(baseSeed + 70 + edgeMark) * 0.13);
          const along = (randomUnit(baseSeed + 80 + edgeMark) - 0.5) * Math.max(distance, brushSize * 0.25);
          const center = {
            x: from.x + dx * t + tangent.x * along + normal.x * edgeOffset,
            y: from.y + dy * t + tangent.y * along + normal.y * edgeOffset,
          };
          const radius = brushSize * (0.012 + randomUnit(baseSeed + 90 + edgeMark) * 0.025);
          maskCtx.fillStyle = `rgba(255,255,255,${0.12 + randomUnit(baseSeed + 100 + edgeMark) * 0.2})`;
          maskCtx.beginPath();
          maskCtx.ellipse(center.x, center.y, radius * 1.9, radius, angle, 0, Math.PI * 2);
          maskCtx.fill();
        }

        maskCtx.restore();
        requestRender();
      };

      const canRetryCanvasReset = () =>
        canvasResetAttempts < maxCanvasResetAttempts &&
        (!canvasResetStartedAt || performance.now() - canvasResetStartedAt < maxCanvasResetDuration);

      const resetCanvasSize = (reason = "scheduled") => {
        canvasResetAttempts += 1;
        lastCanvasResetAttempts = canvasResetAttempts;
        const retryCanvasReset = (eventName, details = {}) => {
          root.classList.remove("paint-reveal-ready");
          const canRetry = eventName !== "image-not-ready" && canRetryCanvasReset();
          reportReadinessStatus(eventName, {
            reason,
            canRetry,
            maxCanvasResetAttempts,
            maxCanvasResetDuration,
            ...details,
          });
          if (!canRetry) {
            reportReadinessStatus("canvas-reset-gave-up", {
              reason,
              maxCanvasResetAttempts,
              maxCanvasResetDuration,
            });
          }
          return canRetry;
        };

        if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
          return retryCanvasReset("image-not-ready");
        }
        const rootRect = root.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        if (imageRect.width <= 0 || imageRect.height <= 0) {
          return retryCanvasReset("image-not-laid-out", {
            imageRectWidth: imageRect.width,
            imageRectHeight: imageRect.height,
          });
        }
        const nextWidth = Math.round(imageRect.width);
        const nextHeight = Math.round(imageRect.height);
        if (nextWidth <= 0 || nextHeight <= 0) {
          return retryCanvasReset("canvas-size-invalid", {
            nextWidth,
            nextHeight,
          });
        }
        const mobile = nextWidth < 560 || window.matchMedia?.("(pointer: coarse)")?.matches;
        const rawRatio = Math.max(window.devicePixelRatio || 1, 1);
        const maxRatio = mobile ? 1.5 : 2;
        const maxPixels = mobile ? 420000 : 1200000;
        const areaRatio = Math.sqrt(maxPixels / Math.max(1, nextWidth * nextHeight));
        ratio = Math.max(1, Math.min(rawRatio, maxRatio, areaRatio));
        const backingWidth = Math.round(nextWidth * ratio);
        const backingHeight = Math.round(nextHeight * ratio);
        if (backingWidth <= 0 || backingHeight <= 0) {
          return retryCanvasReset("canvas-backing-invalid", {
            nextWidth,
            nextHeight,
            ratio,
            backingWidth,
            backingHeight,
          });
        }

        cssWidth = nextWidth;
        cssHeight = nextHeight;
        canvas.style.left = `${imageRect.left - rootRect.left}px`;
        canvas.style.top = `${imageRect.top - rootRect.top}px`;
        canvas.style.width = `${imageRect.width}px`;
        canvas.style.height = `${imageRect.height}px`;
        canvas.style.borderRadius = window.getComputedStyle(image.parentElement || image).borderRadius;
        const hint = root.querySelector(".paint-reveal-hint");
        if (hint) {
          hint.style.top = `${Math.max(10, Math.round(imageRect.top - rootRect.top + 12))}px`;
          hint.style.right = `${Math.max(12, Math.round(rootRect.right - imageRect.right + 12))}px`;
          hint.style.maxWidth = `${Math.max(160, Math.round(imageRect.width - 24))}px`;
        }
        [canvas, layerCanvas, maskCanvas, wallMaskCanvas].forEach((target) => {
          target.width = backingWidth;
          target.height = backingHeight;
        });
        const backingAssigned = [canvas, layerCanvas, maskCanvas, wallMaskCanvas].every(
          (target) => target.width === backingWidth && target.height === backingHeight
        );
        if (!backingAssigned) {
          return retryCanvasReset("canvas-backing-assignment-failed", {
            backingWidth,
            backingHeight,
          });
        }
        [ctx, layerCtx, maskCtx, wallMaskCtx].forEach((context) => {
          context.setTransform(ratio, 0, 0, ratio, 0, 0);
          context.clearRect(0, 0, cssWidth, cssHeight);
        });
        const isRoller = activePalette.effect === "color";
        const minBrush = isRoller ? (mobile ? 136 : 168) : mobile ? 72 : 112;
        const maxBrush = isRoller ? (mobile ? 188 : 230) : mobile ? 118 : 172;
        const coverageLimit = isRoller ? 0.62 : 0.42;
        brushSize = Math.min(
          clamp(baseBrushSize, minBrush, maxBrush),
          Math.max(minBrush, Math.min(cssWidth, cssHeight) * coverageLimit)
        );
        paintMaterialReady = false;
        buildWallMask();
        root.classList.remove("paint-reveal-active", "paint-reveal-fading");
        root.classList.add("paint-reveal-ready");
        reportReadinessStatus("canvas-sized", {
          reason,
          mobile,
          rawRatio,
          maxRatio,
          maxPixels,
          backingWidth,
          backingHeight,
          image: imageSnapshot("canvas-sized"),
          canvas: canvasSnapshot(),
        });
        debugPaint("resize");
        debugPaint("auto-preview-disabled");
        canvasResetAttempts = 0;
        canvasResetStartedAt = 0;
        return false;
      };

      const scheduleCanvasReset = (reason = "scheduled", options = {}) => {
        if (imageReadyResetQueued) {
          reportReadinessStatus("canvas-reset-already-queued", { reason });
          return;
        }
        if (!options.retry) {
          canvasResetAttempts = 0;
          canvasResetStartedAt = 0;
        }
        imageReadyResetQueued = true;
        if (!canvasResetStartedAt) canvasResetStartedAt = performance.now();
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = window.requestAnimationFrame(() => {
            resizeFrame = 0;
            let shouldRetry = false;
            try {
              shouldRetry = resetCanvasSize(reason);
            } catch (error) {
              reportReadinessStatus("canvas-reset-exception", {
                reason,
                error: paintDebugError(error),
              });
              shouldRetry = canRetryCanvasReset();
              if (!shouldRetry) {
                reportReadinessStatus("canvas-reset-gave-up", {
                  reason,
                  error: paintDebugError(error),
                });
              }
            } finally {
              imageReadyResetQueued = false;
            }
            if (shouldRetry) scheduleCanvasReset(`${reason}:retry`, { retry: true });
          });
        });
      };

      const polygonBounds = () => {
        const points = includePolygons.flat();
        const xs = points.map((point) => point.x);
        const ys = points.map((point) => point.y);
        return {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        };
      };

      const previewPath = () => {
        const bounds = polygonBounds();
        const y = bounds.minY + (bounds.maxY - bounds.minY) * 0.46;
        const from = normalToCanvas({
          x: bounds.minX + (bounds.maxX - bounds.minX) * 0.24,
          y,
        });
        const to = normalToCanvas({
          x: bounds.minX + (bounds.maxX - bounds.minX) * 0.48,
          y: y + (bounds.maxY - bounds.minY) * 0.04,
        });
        return { from, to };
      };

      const moveDemoIndicator = (point) => {
        window.clearTimeout(demoHideTimer);
        root.classList.add("paint-reveal-rolling");
        if (!demoIndicator) {
          demoIndicator = document.createElement("span");
          demoIndicator.className = "paint-reveal-demo";
          demoIndicator.setAttribute("aria-hidden", "true");
          root.appendChild(demoIndicator);
        }
        const canvasLeft = Number.parseFloat(canvas.style.left) || 0;
        const canvasTop = Number.parseFloat(canvas.style.top) || 0;
        demoIndicator.style.transform = `translate(${Math.round(canvasLeft + point.x)}px, ${Math.round(canvasTop + point.y)}px)`;
      };

      const shouldAutoPreview = () =>
        activePalette.preview || root.matches(".hero-visual-frame, .hero-media, .service-hero-visual");

      const startPreview = () => {
        if (reducedMotion || autoPreviewStarted || root.classList.contains("paint-reveal-used") || !shouldAutoPreview()) return;
        if (!root.matches(".hero-visual-frame, .hero-media, .service-hero-visual")) return;
        const { from, to } = previewPath();
        if (!pointInsideWall(from) || !pointInsideWall(to)) return;
        autoPreviewStarted = true;
        if (!paintMaterialReady) buildPaintMaterial();
        root.classList.add("paint-reveal-preview");
        moveDemoIndicator(from);
        previewFrame = window.requestAnimationFrame(() => {
          moveDemoIndicator(to);
          paintRollerSegment(from, to);
        });
        previewTimer = window.setTimeout(() => {
          root.classList.add("paint-reveal-fading");
          previewTimer = window.setTimeout(() => {
            cancelPreview(true);
            root.classList.remove("paint-reveal-fading");
          }, 420);
        }, 1450);
      };

      const schedulePreview = () => {
        debugPaint("auto-preview-disabled");
      };

      const cancelStrokeFrame = () => {
        if (!strokeFrame) return;
        window.cancelAnimationFrame(strokeFrame);
        strokeFrame = 0;
      };

      const flushQueuedStroke = () => {
        cancelStrokeFrame();
        if (queuedPoint && lastPoint) {
          paintRollerSegment(lastPoint, queuedPoint);
          lastPoint = queuedPoint;
        }
        queuedPoint = null;
      };

      const scheduleStroke = (point) => {
        queuedPoint = point;
        if (strokeFrame) return;
        strokeFrame = window.requestAnimationFrame(() => {
          strokeFrame = 0;
          if (!queuedPoint || !lastPoint) return;
          const nextPoint = queuedPoint;
          queuedPoint = null;
          paintRollerSegment(lastPoint, nextPoint);
          lastPoint = nextPoint;
        });
      };

      const cancelFade = () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(clearTimer);
        root.classList.remove("paint-reveal-fading");
      };

      const scheduleFade = () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(clearTimer);
        fadeTimer = window.setTimeout(() => {
          root.classList.add("paint-reveal-fading");
          clearTimer = window.setTimeout(() => {
            maskCtx.clearRect(0, 0, cssWidth, cssHeight);
            clearCanvas();
            root.classList.remove("paint-reveal-active", "paint-reveal-fading");
          }, 950);
        }, fadeDelay);
      };

      const cancelPreview = (clear = true) => {
        window.clearTimeout(previewTimer);
        if (previewFrame) window.cancelAnimationFrame(previewFrame);
        previewFrame = 0;
        previewTimer = 0;
        window.clearTimeout(demoHideTimer);
        demoIndicator?.remove();
        demoIndicator = null;
        root.classList.remove("paint-reveal-preview", "paint-reveal-rolling");
        if (clear) {
          maskCtx.clearRect(0, 0, cssWidth, cssHeight);
          clearCanvas();
        }
      };

      const markDragClick = () => {
        blockNextClick = true;
        suppressClickUntil = performance.now() + 800;
        clickSuppressionTargets.forEach((target) => {
          target.dataset.paintSuppressClick = "true";
        });
        window.clearTimeout(unblockClickTimer);
        unblockClickTimer = window.setTimeout(() => {
          blockNextClick = false;
          clickSuppressionTargets.forEach((target) => {
            delete target.dataset.paintSuppressClick;
          });
        }, 800);
      };

      const shouldSuppressActivation = () =>
        blockNextClick || (suppressClickUntil > 0 && performance.now() <= suppressClickUntil);

      const suppressActivation = (event) => {
        if (!shouldSuppressActivation()) return;
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        blockNextClick = false;
        clickSuppressionTargets.forEach((target) => {
          delete target.dataset.paintSuppressClick;
        });
        window.clearTimeout(unblockClickTimer);
      };

      const preventNativeImageDrag = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };

      let bindPointerDocumentFallback = () => {};
      let unbindPointerDocumentFallback = () => {};
      let bindTouchDocumentFallback = () => {};
      let unbindTouchDocumentFallback = () => {};

      const logInputEarlyReturn = (stage, reason, details = {}) => {
        debugPaint(`${stage}-early-return`, {
          stage,
          reason,
          ...details,
        });
      };

      const logPaintStartPipeline = (pipelineStage, details = {}) => {
        if (!paintDebugPanelEnabled()) return;
        debugPaint("paint-start-pipeline", {
          pipelineStage,
          stage: pipelineStage,
          sequence: paintStartPipelineSequence,
          pendingExists: !!pending,
          pendingId: pending?.id || null,
          pendingInsideWall: pending?.insideWall ?? null,
          activePointerId: activePointer,
          activeInputFamily,
          beginPaintingEntered: root.classList.contains("paint-reveal-active"),
          revealAtCalled: false,
          firstDrawExecuted: false,
          ...details,
        });
      };

      const beginPainting = (input, point) => {
        logPaintStartPipeline("beginPainting-entered", {
          inputId: input.id,
          inputMode: input.mode,
          pointerType: input.pointerType,
          point: roundedPoint(point),
          paintMaterialReady,
        });
        debugPaint("beginPainting-entered", {
          inputMode: input.mode,
          pointerType: input.pointerType,
          point: roundedPoint(point),
          paintMaterialReady,
        });
        if (!paintMaterialReady) buildPaintMaterial();
        activePointer = input.id;
        pending = null;
        lastPoint = point;
        queuedPoint = null;
        root.dataset.paintGesture = "active";
        cancelPreview(true);
        cancelFade();
        root.classList.add("paint-reveal-ready", "paint-reveal-active", "paint-reveal-used");
        moveDemoIndicator(point);
        markDragClick();
        pointerCaptureActive = false;
        if (input.event?.pointerId !== undefined && canvas.setPointerCapture) {
          try {
            canvas.setPointerCapture(input.event.pointerId);
            pointerCaptureActive = true;
          } catch (error) {
            pointerCaptureActive = false;
            paintLog("caught-exception", {
              source: "setPointerCapture",
              pointerId: input.event.pointerId,
              pointerType: input.pointerType,
              error: paintDebugError(error),
            });
          }
        }
        logPaintStartPipeline("activePointerId-assigned", {
          activePointerId: activePointer,
          inputMode: input.mode,
          pointerType: input.pointerType,
          point: roundedPoint(point),
          pointerCaptureActive,
        });
        debugPaint("paint-start", { inputMode: input.mode, point, pointerCaptureActive });
      };

      const finishPainting = () => {
        if (activePointer === null) return;
        const pointerId = activePointer;
        flushQueuedStroke();
        markDragClick();
        activePointer = null;
        activeInputFamily = null;
        lastPoint = null;
        queuedPoint = null;
        mouseIsDown = false;
        if (pointerCaptureActive && canvas.releasePointerCapture && typeof pointerId === "number") {
          try {
            canvas.releasePointerCapture(pointerId);
          } catch (error) {
            paintLog("caught-exception", {
              source: "releasePointerCapture",
              pointerId,
              error: paintDebugError(error),
            });
          }
        }
        pointerCaptureActive = false;
        unbindPointerDocumentFallback();
        unbindTouchDocumentFallback();
        root.dataset.paintGesture = "";
        demoHideTimer = window.setTimeout(() => {
          demoIndicator?.remove();
          demoIndicator = null;
          root.classList.remove("paint-reveal-rolling");
        }, 700);
        scheduleFade();
        debugPaint("paint-finish");
      };

      const resetTouchPaintState = () => {
        touchPaintPointerId = null;
      };

      const cancelPending = () => {
        cancelStrokeFrame();
        pending = null;
        activePointer = null;
        activeInputFamily = null;
        resetTouchPaintState();
        lastPoint = null;
        queuedPoint = null;
        mouseIsDown = false;
        pointerCaptureActive = false;
        unbindPointerDocumentFallback();
        unbindTouchDocumentFallback();
        root.classList.remove("paint-reveal-active", "paint-reveal-hit");
        root.classList.remove("paint-reveal-rolling");
        root.dataset.paintGesture = "";
        debugPaint("paint-cancel");
      };

      const updateHitState = (point) => {
        if (activePointer !== null || pending) return;
        root.classList.toggle("paint-reveal-hit", pointInsideWall(point));
      };

      const startPendingInput = (input) => {
        logPaintStartPipeline(`${input.mode}-startPendingInput-entered`, {
          inputId: input.id,
          pointerType: input.pointerType,
          point: roundedPoint(input.point),
          ready: root.classList.contains("paint-reveal-ready"),
        });
        if (!root.classList.contains("paint-reveal-ready")) {
          if (image.complete && image.naturalWidth) resetCanvasSize();
          if (!root.classList.contains("paint-reveal-ready")) {
            scheduleCanvasReset();
            logPaintStartPipeline(`${input.mode}-startPendingInput-exit`, {
              reason: "component-not-ready",
              point: roundedPoint(input.point),
            });
            logInputEarlyReturn(`${input.mode}-start`, "component-not-ready", { point: roundedPoint(input.point) });
            debugPaint(`${input.mode}-start-deferred-not-ready`, { point: input.point });
            return;
          }
        }
        cancelPreview(true);
        const point = input.point;
        if (point.x < 0 || point.y < 0 || point.x > cssWidth || point.y > cssHeight) {
          logPaintStartPipeline(`${input.mode}-startPendingInput-exit`, {
            reason: "outside-canvas-bounds",
            point: roundedPoint(point),
            cssWidth,
            cssHeight,
          });
          logInputEarlyReturn(`${input.mode}-start`, "outside-canvas-bounds", {
            point: roundedPoint(point),
            cssWidth,
            cssHeight,
          });
          debugPaint(`${input.mode}-start-ignored-outside-image`, { point });
          return;
        }
        const insideWall = pointInsideWall(point);
        activeInputFamily = input.mode;
        root.classList.toggle("paint-reveal-hit", insideWall);

        pending = {
          id: input.id,
          mode: input.mode,
          pointerType: input.pointerType,
          start: point,
          last: point,
          insideWall,
          dragged: false,
        };
        firstPointerMoveTraced = false;
        root.dataset.paintGesture = insideWall ? "pending" : "searching";
        if (input.mode === "pointer") bindPointerDocumentFallback();
        if (input.mode === "touch") bindTouchDocumentFallback();
        logPaintStartPipeline("gesture-object-created", {
          inputId: input.id,
          inputMode: input.mode,
          pointerType: input.pointerType,
          insideWall,
          point: roundedPoint(point),
        });
        debugPaint("active-gesture-state-created", {
          inputMode: input.mode,
          pointerType: input.pointerType,
          insideWall,
          point: roundedPoint(point),
        });
        debugPaint(`${input.mode}-start`, { insideWall, point });
      };

      const continueInput = (input, event) => {
        const isFirstPointerMove = input.mode === "pointer" && !firstPointerMoveTraced;
        if (isFirstPointerMove) {
          firstPointerMoveTraced = true;
          logPaintStartPipeline("first-pointermove-entered", {
            inputId: input.id,
            pointerType: input.pointerType,
            point: roundedPoint(input.point),
            hasPending: !!pending,
            pendingId: pending?.id || null,
            activePointer,
          });
        }
        if (activePointer !== null) {
          if (input.id !== activePointer || !lastPoint) {
            if (isFirstPointerMove) {
              logPaintStartPipeline("first-pointermove-exit", {
                reason: "active-pointer-mismatch-or-missing-last-point",
                inputId: input.id,
                activePointer,
                hasLastPoint: !!lastPoint,
                point: roundedPoint(input.point),
              });
            }
            logInputEarlyReturn(`${input.mode}-move`, "active-pointer-mismatch-or-missing-last-point", {
              inputId: input.id,
              activePointer,
              hasLastPoint: !!lastPoint,
              point: roundedPoint(input.point),
            });
            return;
          }
          if (event?.cancelable) event.preventDefault();
          moveDemoIndicator(input.point);
          scheduleStroke(input.point);
          return;
        }

        updateHitState(input.point);
        if (!pending || input.id !== pending.id) {
          if (isFirstPointerMove) {
            logPaintStartPipeline("first-pointermove-exit", {
              reason: "no-matching-pending-gesture",
              inputId: input.id,
              pendingId: pending?.id || null,
              hasPending: !!pending,
              point: roundedPoint(input.point),
            });
          }
          logInputEarlyReturn(`${input.mode}-move`, "no-matching-pending-gesture", {
            inputId: input.id,
            pendingId: pending?.id || null,
            hasPending: !!pending,
            point: roundedPoint(input.point),
          });
          return;
        }

        const point = input.point;
        const dx = point.x - pending.start.x;
        const dy = point.y - pending.start.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= dragThreshold) {
          pending.dragged = true;
          markDragClick();
        }

        if (!pending.insideWall) {
          if (pointInsideWall(point)) {
            pending.insideWall = true;
            pending.start = point;
            pending.last = point;
            root.dataset.paintGesture = "pending";
            root.classList.add("paint-reveal-hit");
            if (pending.pointerType === "touch" && event?.cancelable) event.preventDefault();
            if (isFirstPointerMove) {
              logPaintStartPipeline("first-pointermove-entered-wall-mask", {
                reason: "entered-wall-mask-waiting-for-next-move",
                point: roundedPoint(point),
              });
            }
            return;
          }
          if (isFirstPointerMove) {
            logPaintStartPipeline("first-pointermove-exit", {
              reason: "searching-outside-wall-mask",
              point: roundedPoint(point),
              dx: Math.round(dx),
              dy: Math.round(dy),
              distance: Math.round(distance),
            });
          }
          logInputEarlyReturn(`${input.mode}-move`, "searching-outside-wall-mask", {
            point: roundedPoint(point),
            dx: Math.round(dx),
            dy: Math.round(dy),
            distance: Math.round(distance),
          });
          return;
        }

        if (pending.pointerType === "touch" && event?.cancelable) event.preventDefault();

        const activeThreshold = pending.pointerType === "touch" ? Math.min(activationThreshold, 2) : activationThreshold;
        if (distance < activeThreshold) {
          if (isFirstPointerMove) {
            logPaintStartPipeline("first-pointermove-exit", {
              reason: "movement-below-activation-threshold",
              distance,
              activeThreshold,
              point: roundedPoint(point),
            });
          }
          logInputEarlyReturn(`${input.mode}-move`, "movement-below-activation-threshold", {
            distance,
            activeThreshold,
            point: roundedPoint(point),
          });
          return;
        }

        const startPoint = pending.start;
        if (event?.cancelable) event.preventDefault();
        if (isFirstPointerMove) {
          logPaintStartPipeline("first-pointermove-calling-beginPainting", {
            inputId: pending.id,
            pointerType: pending.pointerType,
            startPoint: roundedPoint(startPoint),
            point: roundedPoint(point),
            distance,
            activeThreshold,
          });
        }
        beginPainting({ id: pending.id, mode: pending.mode, event }, startPoint);
        paintRollerSegment(startPoint, point);
        lastPoint = point;
      };

      const finishInput = (id, event, prevent = true) => {
        if (id === activePointer) {
          if (prevent && event?.cancelable) event.preventDefault();
          finishPainting();
          return;
        }
        if (pending?.id === id) {
          cancelPending();
          return;
        }
        logInputEarlyReturn("finishInput", "no-matching-active-or-pending-id", {
          id,
          activePointer,
          pendingId: pending?.id || null,
        });
      };

      const handlePointerDown = (event) => {
        if (event.pointerType === "touch") return;
        runPaintEvent("pointerdown", event, pointerEventDetails(event), () => {
          paintStartPipelineSequence += 1;
          firstPointerMoveTraced = false;
          logPaintStartPipeline("pointerdown-entered", {
            pointerId: event.pointerId,
            pointerType: event.pointerType || "",
            isPrimary: event.isPrimary,
            button: event.button,
            buttons: event.buttons,
            point: roundedPoint(localPoint(event)),
            ready: root.classList.contains("paint-reveal-ready"),
          });
          if (event.pointerType === "mouse" && event.button !== undefined && event.button !== 0) {
            logPaintStartPipeline("pointerdown-exit", {
              reason: "non-primary-button",
              pointerId: event.pointerId,
              button: event.button,
            });
            logInputEarlyReturn("pointerdown", "non-primary-button", pointerEventDetails(event));
            return;
          }
          if (event.isPrimary === false) {
            logPaintStartPipeline("pointerdown-exit", {
              reason: "non-primary-pointer",
              pointerId: event.pointerId,
              pointerType: event.pointerType || "",
            });
            logInputEarlyReturn("pointerdown", "non-primary-pointer", pointerEventDetails(event));
            return;
          }
          if (!canUseInputFamily("pointer")) {
            logPaintStartPipeline("pointerdown-exit", {
              reason: "input-family-busy",
              requestedFamily: "pointer",
              activeInputFamily,
              activePointer,
              pendingId: pending?.id || null,
            });
            logInputEarlyReturn("pointerdown", "input-family-busy", {
              requestedFamily: "pointer",
              activeInputFamily,
              activePointer,
              pendingId: pending?.id || null,
            });
            return;
          }
          startPendingInput({
            id: event.pointerId,
            mode: "pointer",
            pointerType: event.pointerType || "mouse",
            point: localPoint(event),
          });
        });
      };

      const handlePointerMove = (event) => {
        if (event.pointerType === "touch") return;
        runPaintEvent("pointermove", event, pointerEventDetails(event), () => {
          if (event.isPrimary === false) {
            logInputEarlyReturn("pointermove", "non-primary-pointer", pointerEventDetails(event));
            return;
          }
          if (activeInputFamily && activeInputFamily !== "pointer") {
            logInputEarlyReturn("pointermove", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "pointer",
              pointerId: event.pointerId,
              pointerType: event.pointerType || "",
            });
            return;
          }
          continueInput(
            {
              id: event.pointerId,
              mode: "pointer",
              pointerType: event.pointerType || "mouse",
              point: localPoint(event),
            },
            event
          );
        });
      };

      const handlePointerUp = (event) => {
        if (event.pointerType === "touch") return;
        runPaintEvent("pointerup", event, pointerEventDetails(event), () => {
          if (event.isPrimary === false) {
            logInputEarlyReturn("pointerup", "non-primary-pointer", pointerEventDetails(event));
            return;
          }
          if (activeInputFamily && activeInputFamily !== "pointer") {
            logInputEarlyReturn("pointerup", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "pointer",
              pointerId: event.pointerId,
              pointerType: event.pointerType || "",
            });
            return;
          }
          finishInput(event.pointerId, event);
        });
      };
      const handlePointerCancel = (event) => {
        if (event.pointerType === "touch") return;
        runPaintEvent("pointercancel", event, pointerEventDetails(event), () => {
          if (event.isPrimary === false) {
            logInputEarlyReturn("pointercancel", "non-primary-pointer", pointerEventDetails(event));
            return;
          }
          if (activeInputFamily && activeInputFamily !== "pointer") {
            logInputEarlyReturn("pointercancel", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "pointer",
              pointerId: event.pointerId,
              pointerType: event.pointerType || "",
            });
            return;
          }
          if (event.pointerId === activePointer || event.pointerId === pending?.id) {
            finishInput(event.pointerId, event, false);
            return;
          }
          logInputEarlyReturn("pointercancel", "no-matching-pointer-to-cancel", {
            pointerId: event.pointerId,
            activePointer,
            pendingId: pending?.id || null,
          });
        });
      };

      const handlePointerMoveFallback = (event) => {
        if (root.contains(event.target)) return;
        handlePointerMove(event);
      };
      const handlePointerUpFallback = (event) => {
        if (root.contains(event.target)) return;
        handlePointerUp(event);
      };
      const handlePointerCancelFallback = (event) => {
        if (root.contains(event.target)) return;
        handlePointerCancel(event);
      };

      bindPointerDocumentFallback = () => {
        if (pointerFallbackBound) return;
        pointerFallbackBound = true;
        document.addEventListener("pointermove", handlePointerMoveFallback, true);
        document.addEventListener("pointerup", handlePointerUpFallback, true);
        document.addEventListener("pointercancel", handlePointerCancelFallback, true);
      };

      unbindPointerDocumentFallback = () => {
        if (!pointerFallbackBound) return;
        pointerFallbackBound = false;
        document.removeEventListener("pointermove", handlePointerMoveFallback, true);
        document.removeEventListener("pointerup", handlePointerUpFallback, true);
        document.removeEventListener("pointercancel", handlePointerCancelFallback, true);
      };

      let touchFallbackBound = false;
      const handleTouchMoveFallback = (event) => {
        if (root.contains(event.target)) return;
        handleTouchMove(event);
      };
      const handleTouchEndFallback = (event) => {
        if (root.contains(event.target)) return;
        handleTouchEnd(event);
      };
      const handleTouchCancelFallback = (event) => {
        if (root.contains(event.target)) return;
        handleTouchCancel(event);
      };

      bindTouchDocumentFallback = () => {
        if (touchFallbackBound) return;
        touchFallbackBound = true;
        document.addEventListener("touchmove", handleTouchMoveFallback, { capture: true, passive: false });
        document.addEventListener("touchend", handleTouchEndFallback, { capture: true, passive: true });
        document.addEventListener("touchcancel", handleTouchCancelFallback, { capture: true, passive: true });
      };

      unbindTouchDocumentFallback = () => {
        if (!touchFallbackBound) return;
        touchFallbackBound = false;
        document.removeEventListener("touchmove", handleTouchMoveFallback, { capture: true });
        document.removeEventListener("touchend", handleTouchEndFallback, { capture: true });
        document.removeEventListener("touchcancel", handleTouchCancelFallback, { capture: true });
      };

      const touchById = (touches, id) => {
        for (let index = 0; index < touches.length; index += 1) {
          if (`touch:${touches[index].identifier}` === id) return touches[index];
        }
        return null;
      };

      const touchInput = (touch) => ({
        id: `touch:${touch.identifier}`,
        mode: "touch",
        pointerType: "touch",
        point: localPointFromClient(touch.clientX, touch.clientY),
      });

      const handleTouchStart = (event) => {
        runPaintEvent("touchstart", event, touchEventDetails(event), () => {
          if (!canUseInputFamily("touch")) {
            logInputEarlyReturn("touchstart", "input-family-busy", {
              requestedFamily: "touch",
              activeInputFamily,
              activePointer,
              pendingId: pending?.id || null,
            });
            return;
          }
          if (event.touches.length !== 1 || !event.changedTouches.length || activePointer !== null) {
            logInputEarlyReturn("touchstart", "invalid-touch-start-state", {
              touches: event.touches.length,
              changedTouches: event.changedTouches.length,
              activePointer,
            });
            if (activePointer !== null) {
              finishPainting();
            } else {
              cancelPending();
            }
            return;
          }
          startPendingInput(touchInput(event.changedTouches[0]));
        });
      };

      const handleTouchMove = (event) => {
        runPaintEvent("touchmove", event, touchEventDetails(event), () => {
          if (activeInputFamily && activeInputFamily !== "touch") {
            logInputEarlyReturn("touchmove", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "touch",
            });
            return;
          }
          const id = activePointer || pending?.id;
          if (!id) {
            logInputEarlyReturn("touchmove", "no-active-or-pending-touch-id");
            return;
          }
          const touch = touchById(event.touches, id) || touchById(event.changedTouches, id);
          if (!touch) {
            logInputEarlyReturn("touchmove", "matching-touch-not-found", {
              id,
              touches: event.touches.length,
              changedTouches: event.changedTouches.length,
            });
            return;
          }
          continueInput(touchInput(touch), event);
        });
      };

      const handleTouchEnd = (event) => {
        runPaintEvent("touchend", event, touchEventDetails(event), () => {
          if (activeInputFamily && activeInputFamily !== "touch") {
            logInputEarlyReturn("touchend", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "touch",
            });
            return;
          }
          const id = activePointer || pending?.id;
          if (!id) {
            logInputEarlyReturn("touchend", "no-active-or-pending-touch-id");
            return;
          }
          if (touchById(event.changedTouches, id)) {
            finishInput(id, null, false);
            return;
          }
          logInputEarlyReturn("touchend", "matching-touch-not-ended", {
            id,
            changedTouches: event.changedTouches.length,
          });
        });
      };

      const handleTouchCancel = (event) => {
        runPaintEvent("touchcancel", event, touchEventDetails(event), () => {
          if (activeInputFamily && activeInputFamily !== "touch") {
            logInputEarlyReturn("touchcancel", "active-input-family-mismatch", {
              activeInputFamily,
              expected: "touch",
            });
            return;
          }
          const id = activePointer || pending?.id;
          if (!id) {
            logInputEarlyReturn("touchcancel", "no-active-or-pending-touch-id");
            cancelPending();
            return;
          }
          if (touchById(event.changedTouches, id)) {
            finishInput(id, event, false);
            return;
          }
          logInputEarlyReturn("touchcancel", "matching-touch-not-cancelled", {
            id,
            changedTouches: event.changedTouches.length,
          });
        });
      };

      const handleMouseDown = (event) => {
        runPaintEvent(
          "mousedown",
          event,
          {
            button: event.button,
            buttons: event.buttons,
            cancelable: event.cancelable,
            clientX: Math.round(event.clientX || 0),
            clientY: Math.round(event.clientY || 0),
          },
          () => {
            if (event.button !== 0) {
              logInputEarlyReturn("mousedown", "non-primary-button", mouseEventDetails(event));
              return;
            }
            mouseIsDown = true;
            startPendingInput({
              id: "mouse",
              mode: "mouse",
              pointerType: "mouse",
              point: localPoint(event),
            });
          }
        );
      };

      const mouseEventDetails = (event) => ({
        button: event.button,
        buttons: event.buttons,
        cancelable: event.cancelable,
        clientX: Math.round(event.clientX || 0),
        clientY: Math.round(event.clientY || 0),
      });

      const handleMouseMove = (event) => {
        runPaintEvent("mousemove", event, mouseEventDetails(event), () => {
          if (!mouseIsDown && !pending && activePointer === null) {
            updateHitState(localPoint(event));
            return;
          }
          continueInput(
            {
              id: "mouse",
              mode: "mouse",
              pointerType: "mouse",
              point: localPoint(event),
            },
            event
          );
        });
      };

      const handleMouseMoveFallback = (event) => {
        if (event.target === canvas || (!mouseIsDown && !pending && activePointer === null)) return;
        handleMouseMove(event);
      };

      const handleMouseUp = (event) => {
        runPaintEvent("mouseup", event, mouseEventDetails(event), () => {
          mouseIsDown = false;
          finishInput("mouse", event);
        });
      };

      const clampPointToCanvas = (point) => ({
        x: clamp(point.x, 0, cssWidth),
        y: clamp(point.y, 0, cssHeight),
      });

      const pointInCanvasBounds = (point) =>
        point.x >= 0 && point.y >= 0 && point.x <= cssWidth && point.y <= cssHeight;

      const pointInCanvasClientRect = (event) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      };

      const handleTouchPointerDown = (event) => {
        if (event.pointerType !== "touch" || event.isPrimary === false) return;
        runPaintEvent("pointerdown", event, pointerEventDetails(event), () => {
          if (!root.classList.contains("paint-reveal-ready")) return;
          if (!pointInCanvasClientRect(event)) return;
          const point = localPoint(event);
          if (!pointInCanvasBounds(point)) return;
          if (event.cancelable) event.preventDefault();

          cancelPending();
          cancelFade();
          touchPaintPointerId = event.pointerId;
          activeInputFamily = "pointer";
          beginPainting(
            {
              id: event.pointerId,
              mode: "pointer",
              pointerType: "touch",
              event,
            },
            point
          );
          paintRollerSegment(point, {
            x: clamp(point.x + Math.max(1.5, brushSize * 0.02), 0, cssWidth),
            y: point.y,
          });
          lastPoint = point;
        });
      };

      const handleTouchPointerMove = (event) => {
        if (event.pointerType !== "touch" || event.pointerId !== touchPaintPointerId) return;
        runPaintEvent("pointermove", event, pointerEventDetails(event), () => {
          if (event.cancelable) event.preventDefault();
          const point = clampPointToCanvas(localPoint(event));
          moveDemoIndicator(point);
          scheduleStroke(point);
        });
      };

      const finishTouchPointerPainting = (event, prevent = true) => {
        if (event.pointerId !== touchPaintPointerId) return;
        runPaintEvent(event.type, event, pointerEventDetails(event), () => {
          if (prevent && event.cancelable) event.preventDefault();
          resetTouchPaintState();
          finishPainting();
        });
      };

      const handleTouchPointerUp = (event) => finishTouchPointerPainting(event);
      const handleTouchPointerCancel = (event) => finishTouchPointerPainting(event, false);

      const handleLostPointerCapture = (event) => {
        if (event.pointerId === touchPaintPointerId) {
          finishTouchPointerPainting(event, false);
          return;
        }
        runPaintEvent("lostpointercapture", event, pointerEventDetails(event), () => {
          finishInput(event.pointerId, event, false);
        });
      };

      const cancelCurrentGesture = () => {
        if (activePointer !== null) {
          resetTouchPaintState();
          finishPainting();
          return;
        }
        if (pending) {
          cancelPending();
          return;
        }
        activeInputFamily = null;
        pointerCaptureActive = false;
        mouseIsDown = false;
        unbindPointerDocumentFallback();
        unbindTouchDocumentFallback();
        root.classList.remove("paint-reveal-hit", "paint-reveal-rolling");
        root.dataset.paintGesture = "";
      };

      if (usePointerInput) {
        root.addEventListener("pointerdown", handlePointerDown, true);
        root.addEventListener("pointermove", handlePointerMove, true);
        root.addEventListener("pointerup", handlePointerUp, true);
        root.addEventListener("pointercancel", handlePointerCancel, true);
        const touchPointerOptions = { capture: true, passive: false };
        document.addEventListener("pointerdown", handleTouchPointerDown, touchPointerOptions);
        document.addEventListener("pointermove", handleTouchPointerMove, touchPointerOptions);
        document.addEventListener("pointerup", handleTouchPointerUp, touchPointerOptions);
        document.addEventListener("pointercancel", handleTouchPointerCancel, touchPointerOptions);
        canvas.addEventListener("lostpointercapture", handleLostPointerCapture);
      }
      if (useTouchFallback) {
        root.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
        root.addEventListener("touchmove", handleTouchMove, { capture: true, passive: false });
        root.addEventListener("touchend", handleTouchEnd, { capture: true, passive: true });
        root.addEventListener("touchcancel", handleTouchCancel, { capture: true, passive: true });
      }
      if (useMouseFallback) {
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mousemove", handleMouseMoveFallback);
        document.addEventListener("mouseup", handleMouseUp);
      }

      root.addEventListener("pointerleave", () => {
        if (activePointer === null && !pending) root.classList.remove("paint-reveal-hit");
      });

      root.addEventListener(
        "click",
        suppressActivation,
        true
      );
      canvas.addEventListener("click", suppressActivation, true);
      image.addEventListener("click", suppressActivation, true);
      root.addEventListener("dragstart", preventNativeImageDrag, true);
      image.addEventListener("dragstart", preventNativeImageDrag);
      installInputProbe();
      window.addEventListener("blur", cancelCurrentGesture);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          cancelCurrentGesture();
        } else {
          scheduleCanvasReset("visibility-visible");
        }
      });

      const scheduleDecodedCanvasReset = () => {
        paintLog("image-readiness-check", {
          image: imageSnapshot("readiness-check"),
        });
        if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
          root.classList.remove("paint-reveal-ready");
          paintLog("image-readiness-waiting", {
            image: imageSnapshot("readiness-waiting"),
          });
          return;
        }
        scheduleCanvasReset("image-ready");
        if (typeof image.decode === "function") {
          image
            .decode()
            .then(() => {
              paintLog("image-decode-success", {
                image: imageSnapshot("decode-success"),
              });
              scheduleCanvasReset("image-decode-success");
            })
            .catch((error) => {
              paintLog("image-decode-failure", {
                image: imageSnapshot("decode-failure"),
                error: paintDebugError(error),
              });
              scheduleCanvasReset("image-decode-failure");
            });
        } else {
          paintLog("image-decode-skipped", {
            reason: "decode-api-unavailable",
            image: imageSnapshot("decode-skipped"),
          });
        }
      };

      if (image.complete && image.naturalWidth) {
        scheduleDecodedCanvasReset();
      } else {
        root.classList.remove("paint-reveal-ready");
        paintLog("image-load-listener-added", {
          image: imageSnapshot("load-listener-added"),
        });
        image.addEventListener("load", scheduleDecodedCanvasReset, { once: true });
        image.addEventListener(
          "error",
          (event) => {
            root.dataset.paintRevealDisabled = "true";
            debugPaint("image-error", {
              image: imageSnapshot("error"),
              errorEventType: event.type,
            });
          },
          { once: true }
        );
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => scheduleCanvasReset("domcontentloaded"), { once: true });
      } else {
        scheduleCanvasReset("content-render-complete");
      }

      paintLog("component-init-completed", {
        image: imageSnapshot("init-completed"),
        canvas: canvasSnapshot(),
        listeners: {
          pointer: usePointerInput,
          touch: useTouchFallback,
          mouse: useMouseFallback,
        },
      });

      if ("ResizeObserver" in window) {
        new ResizeObserver(() => scheduleCanvasReset("resize-observer")).observe(root);
      } else {
        window.addEventListener("resize", () => scheduleCanvasReset("resize"), { passive: true });
      }
      window.addEventListener("resize", () => scheduleCanvasReset("resize"), { passive: true });
      window.addEventListener("orientationchange", () => scheduleCanvasReset("orientationchange"), { passive: true });
      window.addEventListener("pageshow", () => scheduleCanvasReset("pageshow"), { passive: true });
      window.visualViewport?.addEventListener("resize", () => scheduleCanvasReset("visualviewport-resize"), { passive: true });
    });
    paintDebug.log("paint-bind-completed", {
      activeRootCount: activeRoots.length,
      boundRootCount: activeRoots
        .slice(0, interactiveLimit)
        .filter((root) => root.dataset.paintRevealBound === "true").length,
    });
  };

  const getGardenGalleryItems = () =>
    [...document.querySelectorAll(".service-hero-visual, .garden-gallery .showcase-photo")].filter((target) =>
      target.querySelector("img")
    );

  const closeGardenGallery = () => {
    if (!gardenGalleryModal) return;

    gardenGalleryModal.classList.remove("open");
    gardenGalleryModal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");

    const opener = gardenGalleryOpener;
    gardenGalleryOpener = null;
    if (opener?.isConnected) requestAnimationFrame(() => opener.focus());
  };

  const setGardenGalleryImage = (index) => {
    const items = getGardenGalleryItems();
    if (!items.length || !gardenGalleryModal) return;

    gardenGalleryIndex = (index + items.length) % items.length;
    const item = items[gardenGalleryIndex];
    const image = item.querySelector("img");
    const modalImage = gardenGalleryModal.querySelector("img");
    const caption = gardenGalleryModal.querySelector("[data-garden-gallery-caption]");
    const counter = gardenGalleryModal.querySelector("[data-garden-gallery-count]");
    const navButtons = gardenGalleryModal.querySelectorAll("[data-garden-gallery-step]");
    const captionText = item.querySelector("figcaption")?.innerText?.trim() || image.alt || "";

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || "";
    caption.textContent = captionText;
    counter.textContent = `${gardenGalleryIndex + 1} / ${items.length}`;
    navButtons.forEach((button) => (button.hidden = items.length < 2));
  };

  const moveGardenGallery = (step) => setGardenGalleryImage(gardenGalleryIndex + step);

  const ensureGardenGalleryModal = () => {
    if (gardenGalleryModal?.isConnected) return gardenGalleryModal;

    gardenGalleryModal = document.createElement("div");
    gardenGalleryModal.id = "gardenImageModal";
    gardenGalleryModal.className = "modal hero-lightbox garden-gallery-modal";
    gardenGalleryModal.setAttribute("role", "dialog");
    gardenGalleryModal.setAttribute("aria-modal", "true");
    gardenGalleryModal.setAttribute("aria-hidden", "true");
    gardenGalleryModal.innerHTML = `
      <button class="backdrop" type="button" data-garden-gallery-close aria-label="${t("closeImageGallery")}"></button>
      <div class="panel" tabindex="-1">
        <button class="close" type="button" data-garden-gallery-close aria-label="${t("closeImageGallery")}">&times;</button>
        <button class="garden-gallery-nav prev" type="button" data-garden-gallery-step="-1" aria-label="${t("previousImage")}">&#8249;</button>
        <button class="garden-gallery-nav next" type="button" data-garden-gallery-step="1" aria-label="${t("nextImage")}">&#8250;</button>
        <span class="garden-gallery-count" data-garden-gallery-count></span>
        <img alt="">
        <p class="garden-gallery-caption" data-garden-gallery-caption></p>
      </div>
    `;

    gardenGalleryModal.querySelectorAll("[data-garden-gallery-close]").forEach((button) => {
      button.addEventListener("click", closeGardenGallery);
    });

    gardenGalleryModal.querySelectorAll("[data-garden-gallery-step]").forEach((button) => {
      button.addEventListener("click", () => moveGardenGallery(Number(button.dataset.gardenGalleryStep)));
    });

    gardenGalleryModal.addEventListener(
      "touchstart",
      (event) => {
        gardenGalleryTouchStart = event.changedTouches[0]?.clientX || 0;
      },
      { passive: true }
    );

    gardenGalleryModal.addEventListener(
      "touchend",
      (event) => {
        const end = event.changedTouches[0]?.clientX || 0;
        const delta = end - gardenGalleryTouchStart;
        if (Math.abs(delta) > 48) moveGardenGallery(delta < 0 ? 1 : -1);
      },
      { passive: true }
    );

    document.body.appendChild(gardenGalleryModal);
    return gardenGalleryModal;
  };

  const openGardenGallery = (index, opener) => {
    const modal = ensureGardenGalleryModal();
    const panel = modal.querySelector(".panel");

    gardenGalleryOpener = opener;
    setGardenGalleryImage(index);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => panel?.focus());
  };

  const bindGardenImageGallery = () => {
    if (document.body?.dataset.page !== "garden-maintenance") return;

    getGardenGalleryItems().forEach((target, index) => {
      if (target.dataset.gardenGalleryBound === "true") return;

      const image = target.querySelector("img");
      target.dataset.gardenGalleryBound = "true";
      target.dataset.gardenGalleryItem = "true";
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
      target.setAttribute("aria-label", image?.alt ? `Open image: ${image.alt}` : "Open garden image");

      target.addEventListener("click", () => openGardenGallery(index, target));
      target.addEventListener("keydown", (event) => {
        if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openGardenGallery(index, target);
      });
    });
  };

  const getCleaningGalleryItems = () =>
    [...document.querySelectorAll(".service-hero-visual, .cleaning-gallery .showcase-photo")].filter((target) =>
      target.querySelector("img")
    );

  const getFocusableModalItems = (modal) =>
    [
      ...modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((node) => !node.hidden && !node.disabled && node.offsetParent !== null);

  const trapCleaningGalleryFocus = (event) => {
    const focusable = getFocusableModalItems(cleaningGalleryModal);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const closeCleaningGallery = () => {
    if (!cleaningGalleryModal) return;

    cleaningGalleryModal.classList.remove("open");
    cleaningGalleryModal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");

    const opener = cleaningGalleryOpener;
    cleaningGalleryOpener = null;
    if (opener?.isConnected) requestAnimationFrame(() => opener.focus());
  };

  const setCleaningGalleryImage = (index) => {
    const items = getCleaningGalleryItems();
    if (!items.length || !cleaningGalleryModal) return;

    cleaningGalleryIndex = (index + items.length) % items.length;
    const item = items[cleaningGalleryIndex];
    const image = item.querySelector("img");
    const modalImage = cleaningGalleryModal.querySelector("img");
    const caption = cleaningGalleryModal.querySelector("[data-cleaning-gallery-caption]");
    const counter = cleaningGalleryModal.querySelector("[data-cleaning-gallery-count]");
    const navButtons = cleaningGalleryModal.querySelectorAll("[data-cleaning-gallery-step]");
    const captionText = item.querySelector("figcaption")?.innerText?.trim() || image.alt || "";

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || "";
    caption.textContent = captionText;
    counter.textContent = `${cleaningGalleryIndex + 1} / ${items.length}`;
    navButtons.forEach((button) => (button.hidden = items.length < 2));
  };

  const moveCleaningGallery = (step) => setCleaningGalleryImage(cleaningGalleryIndex + step);

  const ensureCleaningGalleryModal = () => {
    if (cleaningGalleryModal?.isConnected) return cleaningGalleryModal;

    cleaningGalleryModal = document.createElement("div");
    cleaningGalleryModal.id = "cleaningImageModal";
    cleaningGalleryModal.className = "modal hero-lightbox cleaning-gallery-modal";
    cleaningGalleryModal.setAttribute("role", "dialog");
    cleaningGalleryModal.setAttribute("aria-modal", "true");
    cleaningGalleryModal.setAttribute("aria-hidden", "true");
    cleaningGalleryModal.innerHTML = `
      <button class="backdrop" type="button" data-cleaning-gallery-close aria-label="${t("closeImageGallery")}"></button>
      <div class="panel" tabindex="-1">
        <button class="close" type="button" data-cleaning-gallery-close aria-label="${t("closeImageGallery")}">&times;</button>
        <button class="garden-gallery-nav prev" type="button" data-cleaning-gallery-step="-1" aria-label="${t("previousImage")}">&#8249;</button>
        <button class="garden-gallery-nav next" type="button" data-cleaning-gallery-step="1" aria-label="${t("nextImage")}">&#8250;</button>
        <span class="garden-gallery-count" data-cleaning-gallery-count></span>
        <img alt="">
        <p class="garden-gallery-caption" data-cleaning-gallery-caption></p>
      </div>
    `;

    cleaningGalleryModal.querySelectorAll("[data-cleaning-gallery-close]").forEach((button) => {
      button.addEventListener("click", closeCleaningGallery);
    });

    cleaningGalleryModal.querySelectorAll("[data-cleaning-gallery-step]").forEach((button) => {
      button.addEventListener("click", () => moveCleaningGallery(Number(button.dataset.cleaningGalleryStep)));
    });

    cleaningGalleryModal.addEventListener(
      "touchstart",
      (event) => {
        cleaningGalleryTouchStart = event.changedTouches[0]?.clientX || 0;
      },
      { passive: true }
    );

    cleaningGalleryModal.addEventListener(
      "touchend",
      (event) => {
        const end = event.changedTouches[0]?.clientX || 0;
        const delta = end - cleaningGalleryTouchStart;
        if (Math.abs(delta) > 48) moveCleaningGallery(delta < 0 ? 1 : -1);
      },
      { passive: true }
    );

    document.body.appendChild(cleaningGalleryModal);
    return cleaningGalleryModal;
  };

  const openCleaningGallery = (index, opener) => {
    const modal = ensureCleaningGalleryModal();

    cleaningGalleryOpener = opener;
    setCleaningGalleryImage(index);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => modal.querySelector(".close")?.focus());
  };

  const bindCleaningCompare = () => {
    const root = document.querySelector(".cleaning-compare");
    const input = root?.querySelector("[data-cleaning-compare-input]");
    if (!root || !input || input.dataset.cleaningCompareBound === "true") return;
    input.dataset.cleaningCompareBound = "true";

    const applyPosition = () => {
      root.style.setProperty("--cleaning-compare-pos", `${input.value}%`);
    };
    applyPosition();
    input.addEventListener("input", applyPosition);
  };

  const bindCleaningImageGallery = () => {
    if (document.body?.dataset.page !== "cleaning-services") return;

    getCleaningGalleryItems().forEach((target, index) => {
      if (target.dataset.cleaningGalleryBound === "true") return;

      const image = target.querySelector("img");
      target.dataset.cleaningGalleryBound = "true";
      target.dataset.cleaningGalleryItem = "true";
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
      target.setAttribute("aria-label", image?.alt ? `Open image: ${image.alt}` : "Open cleaning image");

      target.addEventListener("click", () => openCleaningGallery(index, target));
      target.addEventListener("keydown", (event) => {
        if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openCleaningGallery(index, target);
      });
    });
  };

  const ensureStandaloneCleaningLink = () => {
    const nav = document.querySelector(".header .nav");
    if (!nav) return;

    const existing = nav.querySelector("[data-cleaning-link]") || nav.querySelector('a[href="cleaning-services-sopron.html"]');
    if (existing) {
      existing.dataset.textHu = "Takarítás";
      existing.dataset.textDe = "Reinigung";
      syncTextNodes(currentLang());
      return;
    }

    const link = document.createElement("a");
    link.href = "cleaning-services-sopron.html";
    link.dataset.cleaningLink = "true";
    link.dataset.textHu = "Takarítás";
    link.dataset.textDe = "Reinigung";
    link.textContent = currentLang() === "hu" ? "Takarítás" : "Reinigung";

    const handymanLink = nav.querySelector('a[href="handyman-services-sopron.html"]');
    const gardenLink = nav.querySelector('a[href="garden-maintenance-sopron.html"]');
    const paintingLink = nav.querySelector('a[href="painting-wall-repairs-sopron.html"]');
    if (handymanLink) {
      handymanLink.insertAdjacentElement("beforebegin", link);
    } else if (gardenLink) {
      gardenLink.insertAdjacentElement("afterend", link);
    } else if (paintingLink) {
      paintingLink.insertAdjacentElement("afterend", link);
    } else {
      nav.appendChild(link);
    }
  };

  document.addEventListener("keydown", (event) => {
    if (cleaningGalleryModal?.classList.contains("open")) {
      if (event.key === "Escape") closeCleaningGallery();
      if (event.key === "ArrowRight") moveCleaningGallery(1);
      if (event.key === "ArrowLeft") moveCleaningGallery(-1);
      if (event.key === "Tab") trapCleaningGalleryFocus(event);
      return;
    }

    if (gardenGalleryModal?.classList.contains("open")) {
      if (event.key === "Escape") closeGardenGallery();
      if (event.key === "ArrowRight") moveGardenGallery(1);
      if (event.key === "ArrowLeft") moveGardenGallery(-1);
      return;
    }

    if (event.key === "Escape" && heroLightbox?.classList.contains("open")) {
      closeHeroLightbox();
      return;
    }

    if (event.key === "Escape") {
      closeLanguageSelector();
    }
  });

  let languageTriggerEventsBound = false;
  const openLanguageSelectorFromTrigger = (trigger) => {
    const selector = renderLanguageSelector() || document.querySelector(".language-selector");
    if (!selector) return;
    closeLanguageSelector();
    openLanguageSelector(selector, trigger);
    window.setTimeout(() => {
      selector.querySelector("[data-language-option]")?.focus({ preventScroll: true });
    }, 0);
  };
  const bindLanguageSelectorTriggers = () => {
    if (languageTriggerEventsBound) return;
    languageTriggerEventsBound = true;

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest?.("[data-language-selector-trigger]");
      if (!trigger || trigger.closest(".language-selector")) return;
      event.preventDefault();
      openLanguageSelectorFromTrigger(trigger);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.querySelector(".language-selector.open")) {
        closeLanguageSelector({ restoreFocus: true });
        return;
      }

      if (!["Enter", " "].includes(event.key)) return;
      const trigger = event.target.closest?.("[data-language-selector-trigger]");
      if (!trigger || trigger.closest(".language-selector")) return;
      event.preventDefault();
      openLanguageSelectorFromTrigger(trigger);
    });
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest(".language-selector, [data-language-selector-trigger]")) return;
    closeLanguageSelector({ restoreFocus: true });
  });

  const quoteFormLang = () => (routeLanguage() === "hu" ? "hu" : "de");
  const quotePagePath = () => normalizePath(window.location.pathname);
  const quoteEventBase = () => ({
    page_path: quotePagePath(),
    page_language: quoteFormLang(),
  });
  const quoteEscape = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const quoteLabel = (options, value, lang) => options.find((option) => option.value === value)?.[lang] || "";
  const quoteCleanLine = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const quoteControl = (form, name) => form.elements.namedItem(name);
  const quoteCanonicalUrl = () => {
    const canonical = document.querySelector('link[rel="canonical"]')?.href || routeHref(currentRouteKey(), quoteFormLang());
    const url = new URL(canonical, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.href;
  };
  const pushConversionEvent = (event, params = {}) => {
    try {
      if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
      window.dataLayer.push({ event, ...params });
    } catch {
      /* Analytics is optional and must never block site interactions. */
    }
  };
  const preselectedQuoteService = () => quoteRouteService[currentRouteKey()] || "maintenance";
  const quoteOptionsMarkup = (options, lang, selected = "") =>
    options
      .map((option) => {
        const isSelected = option.value === selected ? " selected" : "";
        return `<option value="${quoteEscape(option.value)}"${isSelected}>${quoteEscape(option[lang])}</option>`;
      })
      .join("");
  const quoteFieldErrorId = (formId, field) => `${formId}-${field}-error`;
  const quoteField = ({ formId, name, label, type = "text", required = false, value = "", placeholder = "", help = "" }) => {
    const id = `${formId}-${name}`;
    const errorId = quoteFieldErrorId(formId, name);
    const helpId = help ? `${formId}-${name}-help` : "";
    const describedBy = [helpId, errorId].filter(Boolean).join(" ");
    const requiredText = quoteEscape(quoteFormText[quoteFormLang()]?.required || "Required");
    return `
      <div class="quote-field">
        <label for="${id}">${quoteEscape(label)}${required ? ` <span aria-hidden="true">*</span><span class="sr-only"> ${requiredText}</span>` : ""}</label>
        <input id="${id}" name="${quoteEscape(name)}" type="${quoteEscape(type)}" value="${quoteEscape(value)}" placeholder="${quoteEscape(placeholder)}"${required ? " required" : ""} aria-describedby="${describedBy}">
        ${help ? `<p class="quote-help" id="${helpId}">${quoteEscape(help)}</p>` : ""}
        <p class="quote-field-error" id="${errorId}" data-quote-error="${quoteEscape(name)}" aria-live="polite"></p>
      </div>`;
  };
  const quoteTextarea = ({ formId, name, label, required = false, placeholder = "", maxlength = 1000 }) => {
    const id = `${formId}-${name}`;
    const errorId = quoteFieldErrorId(formId, name);
    const counterId = `${formId}-${name}-counter`;
    const requiredText = quoteEscape(quoteFormText[quoteFormLang()]?.required || "Required");
    return `
      <div class="quote-field quote-field-full">
        <label for="${id}">${quoteEscape(label)}${required ? ` <span aria-hidden="true">*</span><span class="sr-only"> ${requiredText}</span>` : ""}</label>
        <textarea id="${id}" name="${quoteEscape(name)}" rows="5" maxlength="${maxlength}" placeholder="${quoteEscape(placeholder)}"${required ? " required" : ""} aria-describedby="${counterId} ${errorId}"></textarea>
        <div class="quote-meta-row">
          <p class="quote-field-error" id="${errorId}" data-quote-error="${quoteEscape(name)}" aria-live="polite"></p>
          <p class="quote-counter" id="${counterId}" data-quote-counter="${quoteEscape(name)}">0 / ${maxlength}</p>
        </div>
      </div>`;
  };
  const quoteSelect = ({ formId, name, label, options, lang, selected = "", required = false }) => {
    const id = `${formId}-${name}`;
    const errorId = quoteFieldErrorId(formId, name);
    const requiredText = quoteEscape(quoteFormText[quoteFormLang()]?.required || "Required");
    return `
      <div class="quote-field">
        <label for="${id}">${quoteEscape(label)}${required ? ` <span aria-hidden="true">*</span><span class="sr-only"> ${requiredText}</span>` : ""}</label>
        <select id="${id}" name="${quoteEscape(name)}"${required ? " required" : ""} aria-describedby="${errorId}">
          ${quoteOptionsMarkup(options, lang, selected)}
        </select>
        <p class="quote-field-error" id="${errorId}" data-quote-error="${quoteEscape(name)}" aria-live="polite"></p>
      </div>`;
  };
  const quoteCheckbox = ({ formId, name, label, required = false }) => {
    const id = `${formId}-${name}`;
    const errorId = quoteFieldErrorId(formId, name);
    const requiredText = quoteEscape(quoteFormText[quoteFormLang()]?.required || "Required");
    return `
      <div class="quote-check">
        <input id="${id}" name="${quoteEscape(name)}" type="checkbox"${required ? " required" : ""} aria-describedby="${errorId}">
        <label for="${id}">${quoteEscape(label)}${required ? ` <span aria-hidden="true">*</span><span class="sr-only"> ${requiredText}</span>` : ""}</label>
        <p class="quote-field-error" id="${errorId}" data-quote-error="${quoteEscape(name)}" aria-live="polite"></p>
      </div>`;
  };
  const buildQuoteMessage = (payload, lang) => {
    const text = quoteFormText[lang];
    const labels = text.messageLabels;
    const lines = [
      text.messageGreeting,
      "",
      `${labels.name}: ${payload.name}`,
      `${labels.service}: ${payload.serviceLabel}`,
    ];

    if (payload.propertyTypeLabel) lines.push(`${labels.propertyType}: ${payload.propertyTypeLabel}`);
    if (payload.location) lines.push(`${labels.location}: ${payload.location}`);
    lines.push(`${labels.timing}: ${payload.timingLabel}`);
    if (payload.access) lines.push(`${labels.access}: ${payload.access}`);
    lines.push(`${labels.description}:`);
    lines.push(payload.description);
    lines.push("");
    lines.push(`${labels.photos}: ${payload.photosReady ? text.photosYes : text.photosNo}`);
    lines.push(`${labels.page}: ${payload.page}`);
    return lines.join("\n");
  };
  const quotePayloadFromForm = (form, lang) => {
    const field = (name) => quoteControl(form, name);
    const service = field("service")?.value || preselectedQuoteService();
    const propertyType = field("propertyType")?.value || "";
    const timing = field("timing")?.value || "asap";
    return {
      name: quoteCleanLine(field("name")?.value),
      service,
      serviceLabel: quoteLabel(quoteServiceOptions, service, lang),
      propertyType,
      propertyTypeLabel: propertyType ? quoteLabel(quotePropertyOptions, propertyType, lang) : "",
      location: quoteCleanLine(field("location")?.value),
      timing,
      timingLabel: quoteLabel(quoteTimingOptions, timing, lang),
      access: quoteCleanLine(field("access")?.value),
      description: String(field("description")?.value || "").trim(),
      photosReady: Boolean(field("photosReady")?.checked),
      page: quoteCanonicalUrl(),
    };
  };
  const setQuoteFieldError = (form, fieldName, message = "") => {
    const control = quoteControl(form, fieldName);
    const error = form.querySelector(`[data-quote-error="${fieldName}"]`);
    if (control) control.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  };
  const quoteRequiredFields = ["name", "service", "description", "timing"];
  const quoteFieldValidationMessage = (form, fieldName, lang) => {
    const text = quoteFormText[lang];
    if (quoteRequiredFields.includes(fieldName)) {
      return String(quoteControl(form, fieldName)?.value || "").trim() ? "" : text.requiredError;
    }
    if (fieldName === "consent") return quoteControl(form, "consent")?.checked ? "" : text.consentError;
    return "";
  };
  const refreshQuoteFieldValidity = (form, fieldName, lang, showErrors = false) => {
    const message = quoteFieldValidationMessage(form, fieldName, lang);
    if (!message || showErrors) setQuoteFieldError(form, fieldName, message);
    return !message;
  };
  const validateQuoteForm = (form, lang) => {
    const invalidFields = [];

    quoteRequiredFields.forEach((fieldName) => {
      if (!refreshQuoteFieldValidity(form, fieldName, lang, true)) invalidFields.push(fieldName);
    });

    setQuoteFieldError(form, "location", "");
    if (!refreshQuoteFieldValidity(form, "consent", lang, true)) invalidFields.push("consent");

    if (invalidFields.length) {
      pushConversionEvent("quote_form_validation_error", {
        ...quoteEventBase(),
        error_field_count: invalidFields.length,
      });
      quoteControl(form, invalidFields[0])?.focus();
      return false;
    }
    return true;
  };
  const bindQuoteForm = (form, lang) => {
    if (form.dataset.quoteBound === "true") return;
    form.dataset.quoteBound = "true";
    const text = quoteFormText[lang];
    const counters = [...form.querySelectorAll("[data-quote-counter]")];
    const submit = form.querySelector('[data-quote-submit]');
    const status = form.querySelector("[data-quote-status]");
    let started = false;

    const trackStart = () => {
      if (started) return;
      started = true;
      pushConversionEvent("quote_form_start", {
        ...quoteEventBase(),
        preselected_service: preselectedQuoteService(),
      });
    };
    const updateCounters = () => {
      counters.forEach((counter) => {
        const control = quoteControl(form, counter.dataset.quoteCounter);
        if (!control) return;
        counter.textContent = text.counter(control.value.length, Number(control.maxLength) || 1000);
      });
    };
    const updateFieldValidity = (event) => {
      const field = event.target?.closest?.("[name]");
      if (!field || !form.contains(field)) return;
      refreshQuoteFieldValidity(form, field.name, lang, form.dataset.quoteSubmitted === "true");
    };

    ["focusin", "input", "change", "pointerdown", "keydown"].forEach((eventName) => {
      form.addEventListener(eventName, trackStart, { once: true });
    });
    form.addEventListener("input", updateCounters);
    form.addEventListener("input", updateFieldValidity);
    form.addEventListener("change", updateFieldValidity);
    updateCounters();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (form.dataset.quoteOpening === "true") return;
      form.dataset.quoteSubmitted = "true";
      if (!validateQuoteForm(form, lang)) return;
      delete form.dataset.quoteSubmitted;

      const payload = quotePayloadFromForm(form, lang);
      const message = buildQuoteMessage(payload, lang);
      const whatsappUrl = `https://wa.me/36206671832?text=${encodeURIComponent(message)}`;
      pushConversionEvent("quote_whatsapp_open", {
        ...quoteEventBase(),
        service_type: payload.service,
        property_type: payload.propertyType || "not_selected",
        preferred_timing: payload.timing,
        photos_ready: payload.photosReady,
        form_location: "contact_section",
      });

      form.dataset.quoteOpening = "true";
      if (submit) submit.disabled = true;
      if (status) status.textContent = text.statusOpening;

      const opened = window.open(whatsappUrl, "_blank", "noopener");
      if (!opened) window.location.href = whatsappUrl;

      window.setTimeout(() => {
        delete form.dataset.quoteOpening;
        if (submit) submit.disabled = false;
      }, 1800);
    });
  };
  const renderQuoteForm = (mount, index) => {
    const lang = quoteFormLang();
    const routeKey = currentRouteKey();
    if (mount.dataset.quoteRendered === `${lang}:${routeKey}`) return;

    const text = quoteFormText[lang];
    const formId = `quote-form-${index + 1}`;
    const selectedService = preselectedQuoteService();
    mount.innerHTML = `
      <form class="whatsapp-quote" data-quote-form novalidate>
        <div class="quote-form-header">
          <span class="quote-kicker">${quoteEscape(text.kicker)}</span>
          <h3>${quoteEscape(text.title)}</h3>
          <p>${quoteEscape(text.intro)}</p>
        </div>
        <div class="quote-form-grid">
          ${quoteField({ formId, name: "name", label: text.name, required: true, placeholder: text.placeholderName })}
          ${quoteSelect({ formId, name: "service", label: text.service, options: quoteServiceOptions, lang, selected: selectedService, required: true })}
          ${quoteField({ formId, name: "location", label: text.location, placeholder: text.placeholderLocation, help: text.locationHelp })}
          ${quoteSelect({ formId, name: "timing", label: text.timing, options: quoteTimingOptions, lang, selected: "asap", required: true })}
          ${quoteSelect({ formId, name: "propertyType", label: text.propertyType, options: quotePropertyOptions, lang })}
          ${quoteTextarea({ formId, name: "access", label: text.access, placeholder: text.placeholderAccess, maxlength: 500 })}
          ${quoteTextarea({ formId, name: "description", label: text.description, required: true, placeholder: text.placeholderDescription, maxlength: 1000 })}
        </div>
        ${quoteCheckbox({ formId, name: "photosReady", label: text.photosReady })}
        ${quoteCheckbox({ formId, name: "consent", label: text.consent, required: true })}
        <p class="quote-note">${quoteEscape(text.note)}</p>
        <button class="btn primary quote-submit" type="submit" data-quote-submit>${quoteEscape(text.submit)}</button>
        <p class="quote-status" data-quote-status role="status" aria-live="polite" aria-atomic="true"></p>
      </form>
    `;
    mount.dataset.quoteRendered = `${lang}:${routeKey}`;
    const form = mount.querySelector("[data-quote-form]");
    if (form) bindQuoteForm(form, lang);
  };
  const ensureQuoteFormPlaceholders = () => {
    document.querySelectorAll("#contact .contact-card").forEach((card) => {
      if (card.querySelector("[data-whatsapp-quote-form]")) return;
      const placeholder = document.createElement("div");
      placeholder.dataset.whatsappQuoteForm = "true";
      card.insertBefore(placeholder, card.firstChild);
    });
  };
  const bindQuoteForms = () => {
    ensureQuoteFormPlaceholders();
    document.querySelectorAll("[data-whatsapp-quote-form]").forEach((mount, index) => renderQuoteForm(mount, index));
  };
  let conversionTrackingBound = false;
  const bindConversionActionTracking = () => {
    if (conversionTrackingBound) return;
    conversionTrackingBound = true;
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest?.("a[href]");
        if (!link) return;
        const href = link.href || "";
        if (href.includes("wa.me/36206671832")) {
          pushConversionEvent("whatsapp_click", quoteEventBase());
        } else if (href.startsWith(tel)) {
          pushConversionEvent("phone_click", quoteEventBase());
        }
      },
      { capture: true }
    );
  };

  const copyPhoneUsingSelection = () => {
    let input;
    try {
      input = document.createElement("textarea");
      input.value = phone;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      input.style.top = "0";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus({ preventScroll: true });
      input.select();
      input.setSelectionRange(0, input.value.length);
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      input?.remove();
    }
  };

  const copyPhoneWithClipboard = async () => {
    try {
      if (!navigator.clipboard?.writeText) return false;
      await navigator.clipboard.writeText(phone);
      return true;
    } catch {
      return false;
    }
  };

  const copyPhoneToClipboard = async (lang = currentLang()) => {
    const success = t("phoneCopied", lang);
    const fallback = t("phoneFallback", lang);
    let copied = false;

    copied = copyPhoneUsingSelection();
    if (!copied) copied = await copyPhoneWithClipboard();

    showToast(copied ? success : fallback);
  };

  const bindPhoneActions = () => {
    document.querySelectorAll("[data-phone-action]").forEach((link) => {
      if (link.dataset.phoneBound === "true") return;
      link.dataset.phoneBound = "true";
      link.href = tel;
      link.addEventListener("click", (event) => {
        if (directCallViewport()) return;
        event.preventDefault();
        copyPhoneToClipboard(currentLang());
      });
    });
  };

  const syncTextNodes = (lang) => {
    applyPageLanguage(lang);
  };

  const applyStandaloneLanguage = () => {
    applyPageLanguage();
  };

  const initStandaloneReveals = () => {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    items.forEach((item) => observer.observe(item));
  };

  const initStandalonePage = () => {
    ensureStandaloneCleaningLink();
    applyStandaloneLanguage();
    enhanceHeaderNavigation();
    bindConversionActionTracking();
    bindQuoteForms();
    bindPhoneActions();
    if (document.body?.dataset.page === "garden-maintenance") {
      bindGardenImageGallery();
    } else if (document.body?.dataset.page === "cleaning-services") {
      bindCleaningImageGallery();
      bindCleaningCompare();
    } else {
      bindHeroLightbox();
    }
    bindPaintReveal();
    initStandaloneReveals();

    window.addEventListener("resize", () => {
      syncTextNodes(currentLang());
      syncHeaderNavigationState();
    }, { passive: true });
  };

  window.BPS_I18N = {
    currentLang,
    setLanguage,
    applyPageLanguage,
    translatePhrase,
    t,
    routeHref,
    routeLanguage,
  };

  if (["property-maintenance", "handyman-services", "painting-wall-repairs", "garden-maintenance", "cleaning-services", "airbnb-property-maintenance", "property-management-foreign-owners"].includes(document.body?.dataset.page)) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initStandalonePage, { once: true });
    } else {
      initStandalonePage();
    }
    return;
  }

  // ---------------------------------------------------------------------
  // Homepage-only interactive behavior (project modal, gallery lightbox,
  // carousels, before/after comparison sliders). The page itself is now
  // complete static HTML (both languages), so only the genuinely on-demand
  // pieces below remain --
  // the giant page-template render() is gone for good.
  // ---------------------------------------------------------------------
  const localAssetVersion = (() => {
    try {
      return new URL(scriptBaseUrl).search;
    } catch {
      return "";
    }
  })();

  const state = {
    lang: currentLang(),
    gallery: [],
    galleryIndex: 0,
    galleryZoom: 1,
    galleryPanX: 0,
    galleryPanY: 0,
    projectIndex: 0,
  };
  const modalOpeners = new WeakMap();
  const tx = (value) => translatePhrase(value?.[state.lang] || value?.de || value?.hu || "", state.lang);

  const img = (id, w = 1200) => {
    if (id.startsWith("assets/")) {
      const url = new URL(id, scriptBaseUrl);
      if (localAssetVersion) url.search = localAssetVersion;
      return url.href;
    }
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  };


  const phaseLabel = {
    before: { hu: "Előtte", de: "Vorher" },
    process: { hu: "Munkafolyamat", de: "Arbeitsschritt" },
    after: { hu: "Kész állapot", de: "Fertig" },
  };

  const phaseText = (phase) => tx(phaseLabel[phase] || phaseLabel.process);

  const compareFallback = {
    compareBefore: { hu: "Előtte", de: "Vorher", uk: "До", "zh-CN": "之前" },
    compareAfter: { hu: "Utána", de: "Nachher", uk: "Після", "zh-CN": "之后" },
    compareSliderName: {
      hu: "Előtte-utána összehasonlító csúszka",
      de: "Vorher-Nachher-Vergleichsschieber",
      uk: "Повзунок порівняння до і після",
      "zh-CN": "前后对比滑块",
    },
    viewFullComparison: {
      hu: "Teljes összehasonlítás megnyitása",
      de: "Vollständigen Vergleich ansehen",
      uk: "Переглянути повне порівняння",
      "zh-CN": "查看完整对比",
    },
    fullComparisonTitle: {
      hu: "Teljes előtte-utána összehasonlítás",
      de: "Vollständiger Vorher-Nachher-Vergleich",
      uk: "Повне порівняння до і після",
      "zh-CN": "完整前后对比",
    },
    fullComparisonDescription: {
      hu: "Húzza a választóvonalat, vagy használja a nyílbillentyűket. A képek illusztratív példák, a konkrét feladatot mindig a helyszín állapota alapján egyeztetjük.",
      de: "Ziehen Sie die Trennlinie oder verwenden Sie die Pfeiltasten. Die Bilder sind illustrative Beispiele; die konkrete Aufgabe wird immer anhand des Zustands der Immobilie abgestimmt.",
      uk: "Перетягніть розділювач або використовуйте клавіші зі стрілками. Зображення є ілюстративними прикладами; конкретне завдання завжди узгоджується за фактичним станом об’єкта.",
      "zh-CN": "拖动分隔线或使用方向键。图片为示意示例；具体工作始终根据物业实际状况确认。",
    },
  };
  const compareText = (key) =>
    t(key, state.lang) ||
    compareFallback[key]?.[state.lang] ||
    compareFallback[key]?.en ||
    "";
  const compareValueText = (value) => {
    const rounded = Math.round(value);
    const values = {
      hu: `${rounded}% előtte kép látható`,
      de: `${rounded}% Vorher-Bild sichtbar`,
      uk: `${rounded}% зображення “до” видиме`,
      "zh-CN": `${rounded}% 显示之前图片`,
    };
    return values[state.lang] || values.en;
  };
  const compareHintText = () =>
    state.lang === "hu"
      ? "Illusztratív előtte-utána összehasonlítás, amely a munkafolyamat jellegét és a várható eredményt mutatja. Kattintson vagy fókuszáljon a csúszkára, majd húzza a fogantyút, vagy használja a nyílbillentyűket."
      : "Ein illustrativer Vorher-Nachher-Vergleich, der die Art der Arbeit und das erwartete Ergebnis zeigt. Klicken oder fokussieren Sie den Regler, ziehen Sie dann am Griff oder verwenden Sie die Pfeiltasten.";
  const hasProjectComparison = (item) => item?.comparison !== false && !!item?.before && !!item?.after;
  const compareMarkup = (item, options = {}) => {
    const id = options.id || "compare";
    const hintId = options.hintId || `${id}-hint`;
    const className = options.className || "";
    const initial = 50;
    return `
      <div class="compare ${className}" id="${id}" data-compare role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${initial}" aria-valuetext="${compareValueText(initial)}" aria-label="${compareText("compareSliderName")}" aria-describedby="${hintId}">
        <img class="after" src="${img(item.after, 1600)}" alt="${tx(item.title)} - ${compareText("compareAfter")}" draggable="false">
        <img class="before" src="${img(item.before, 1600)}" alt="${tx(item.title)} - ${compareText("compareBefore")}" draggable="false">
        <span class="label compare-label left">${compareText("compareBefore")}</span>
        <span class="label compare-label right">${compareText("compareAfter")}</span>
        <span class="handle" aria-hidden="true"></span>
      </div>
      <p class="compare-hint" id="${hintId}">${compareHintText()}</p>`;
  };

  const photoCaption = (photo) => tx(photo?.[2]) || phaseText(photo?.[1]);

  const projectLightboxImages = (project) => {
    const pair = hasProjectComparison(project)
      ? [
          [project.before, "before", { hu: `${tx(project.title)} - kiinduló állapot`, de: `${tx(project.title)} - Ausgangszustand` }],
          [project.after, "after", { hu: `${tx(project.title)} - rendezett kész állapot`, de: `${tx(project.title)} - fertiggestellter Zustand` }],
        ]
      : [];
    const seen = new Set(pair.map((photo) => photo[0]));
    return [...pair, ...(project.images || []).filter((photo) => !seen.has(photo[0]))];
  };

  const services = [
    {
      key: "painting",
      cover: "assets/finished-room-1.jpg",
      title: { hu: "Festés és falfrissítés", de: "Innenanstrich und Wandauffrischung" },
      text: {
        hu:
          "Kopott, foltos vagy javított falak rendezése vendégváltás, bérlőváltás, fotózás vagy irodai látogatás előtt. A cél nem látványos ígéret, hanem tiszta felület, egységes összkép és vállalható átadás.",
        de:
          "Erfrischen Sie markierte, geflickte oder abgenutzte Wände vor Gastwechseln, Mieterübergaben, Fotoshootings oder Bürobesuchen. Ziel ist eine saubere Oberfläche, ein einheitlicher Raumeindruck und eine Übergabe, bei der Sie sich wohlfühlen.",
      },
      photos: [
        ["12036084", "before", { hu: "Régi, sérült falfelület: itt a fal állapotát kellett javíthatóvá tenni.", de: "Alte, beschädigte Wandfläche: Die erste Aufgabe bestand darin, die Wand reparaturfähig zu machen." }],
        ["804392", "before", { hu: "Felújítás előtti helyiség, ahol a falhibák és az alsó falsáv külön figyelmet igényelt.", de: "Raum vor der Auffrischung mit sichtbaren Wandschäden und einem unteren Wandbereich, der Aufmerksamkeit braucht." }],
        ["3616757", "process", { hu: "Festésre előkészített teljes szoba, takart padlóval és összekészített anyagokkal.", de: "Kompletter Raum für den Anstrich vorbereitet, mit geschütztem Boden und bereitgestelltem Material." }],
        ["3615721", "process", { hu: "A munkaterület rendezése festés előtt: a szoba használható állapotban marad a kivitelezéshez.", de: "Arbeitsbereich vor dem Streichen eingerichtet, damit der Raum während der Arbeiten übersichtlich und sauber bleibt." }],
        ["6474471", "process", { hu: "Teljes falfelület javítása és hengerlése, nem csak egy közeli részlet.", de: "Eine ganze Wand wird repariert und gestrichen, nicht nur ein Detailausschnitt." }],
        ["6473978", "process", { hu: "Nagyobb falmező csiszolása és simítása, hogy a festés egyenletes legyen.", de: "Ein großer Wandabschnitt wird geschliffen und egalisiert, damit der Anstrich gleichmäßig wirkt." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Frissen festett soproni lakószoba tiszta falakkal, radiátorral és parkettával.", de: "Frisch gestrichenes Wohnzimmer in Sopron mit sauberen Wänden, Heizkörpern und Parkettboden." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Üres, átadásra kész soproni szoba egységes falfelülettel és hétköznapi kialakítással.", de: "Leerer Raum in Sopron, bereit zur Übergabe, mit einheitlichen Wänden und einem alltagstauglichen Grundriss." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Rendezett, világos soproni lakótér friss falakkal és praktikus berendezéssel.", de: "Aufgeräumter, heller Wohnraum in Sopron mit aufgefrischten Wänden und praktischer Einrichtung." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott soproni hálószoba vendég- vagy bérlőátadás előtt.", de: "Sauberes, schlichtes Schlafzimmer in Sopron vor der Übergabe an Gäste oder Mieter." }],
      ],
    },
    {
      key: "drywall",
      cover: "assets/property-maintenance-drywall-sanding.jpg",
      title: { hu: "Gipszkarton és almennyezet", de: "Trockenbau- und Deckenreparaturen" },
      text: {
        hu:
          "Sérült vagy félkész gipszkarton, hézagok, glettelés, csiszolás és festésre előkészített felületek. A munka lényege, hogy a javítás ne külön hibaként látszódjon, hanem illeszkedjen a teljes helyiséghez.",
        de:
          "Beschädigte oder unfertige Trockenbauwände, Nähte, Spachtel-, Schleif- und lackierfähige Oberflächen. Ziel ist es, dass sich die Reparatur in den Raum einfügt und nicht als separater Mangel sichtbar bleibt.",
      },
      photos: [
        ["assets/drywall-before-matched.jpg", "before", { hu: "Üres, félkész helyiség gipszkarton és festés előtti állapotban: a teljes tér látszik.", de: "Leerer, unfertiger Raum vor Trockenbau-Endbearbeitung und Anstrich, mit Blick auf den gesamten Raum." }],
        ["15798783", "before", { hu: "Felújítás alatti teljes szoba, ahol a falak és mennyezeti csatlakozások még rendezésre várnak.", de: "Kompletter Raum in Renovierung, bei dem Wand- und Deckenanschlüsse noch fertiggestellt werden müssen." }],
        ["5606879", "before", { hu: "Nagyobb belső munkaterület nyitott mennyezettel és javítandó felületekkel.", de: "Großer Innenarbeitsbereich mit offener Decke und Flächen, die noch repariert werden müssen." }],
        ["3990359", "process", { hu: "Teljes felújítás alatti helyiség: létrák, takarás és előkészített munkaterület.", de: "Kompletter Raum in Renovierung mit Leitern, Abdeckungen und vorbereitetem Arbeitsbereich." }],
        ["6474313", "process", { hu: "Mennyezeti gipszkarton felület hézagolás előtt, jól látható teljes felülettel.", de: "Trockenbaudecke vor der Fugenverspachtelung, mit Blick auf die größere Fläche." }],
        ["6474202", "process", { hu: "Mennyezeti illesztések kezelése nagyobb felületen, nem elszigetelt részletként.", de: "Deckenfugen werden über eine größere Fläche hinweg bearbeitet, nicht nur als isoliertes Detail." }],
        ["6474343", "process", { hu: "Gipszkarton mennyezet csiszolása és simítása festés előtt.", de: "Trockenbaudecke wird vor dem Anstrich geschliffen und geglättet." }],
        ["6474300", "process", { hu: "Teljes szoba előkészítése: takarás, csiszolás, poros munkafázis kontrolláltan.", de: "Vollständige Raumvorbereitung mit Abkleben, Schleifen und kontrollierter, staubiger Arbeit." }],
        ["6474129", "process", { hu: "Mennyezeti javítás munka közben, a teljes felülethez igazítva.", de: "Deckenreparatur in Arbeit, abgestimmt auf die gesamte Fläche." }],
        ["9826455", "after", { hu: "Kész, üres helyiség: a javított felületek tiszta, festés utáni szobaképet adnak.", de: "Fertiggestellter, leerer Raum, in dem reparierte Flächen ein sauberes Interieur nach Abschluss der Arbeiten ergeben." }],
      ],
    },
    {
      key: "garden",
      cover: "assets/courtyard-garden-1.jpg",
      title: { hu: "Kert és udvar rendbetétele", de: "Aufräumarbeiten im Garten und Außenbereich" },
      text: {
        hu:
          "Magas fű, benőtt udvar, elhanyagolt bejárat vagy terasz rendezése normál soproni környezetben. Bérleményeknél, Airbnb-nél és irodáknál a külső állapot már érkezéskor meghatározza az első benyomást.",
        de:
          "Mähen, Trimmen und Aufräumen von Innenhöfen, Eingängen und Terrassen in realen Umgebungen in Sopron. Bei Mietobjekten, Airbnb und Büros prägt der Außenbereich das Vertrauen, noch bevor jemand das Gebäude betritt.",
      },
      photos: [
        ["assets/courtyard-before-entrance.jpg", "before", { hu: "Elhanyagolt soproni társasházi bejárat nyírás és lombgyűjtés előtt.", de: "Vernachlässigter Eingangsbereich eines Wohnhauses in Sopron vor dem Rasenmähen und Laubentfernen." }],
        ["assets/courtyard-before-overgrown-lawn.jpg", "before", { hu: "Benőtt közös udvari gyep és bokorsáv egy soproni lakóépület mellett.", de: "Verwilderter Gemeinschaftsrasen und Strauchrand neben einem Wohnhaus in Sopron." }],
        ["assets/courtyard-before-overgrown-wall.jpg", "before", { hu: "Rendezetlen udvari növényzet és járdaszegély visszavágás előtt.", de: "Ungepflegte Bepflanzung und Wegränder im Hof vor dem Rückschnitt." }],
        ["assets/courtyard-process-mowing.jpg", "process", { hu: "Fűnyírás és szegélyrendezés egy soproni társasház belső udvarában.", de: "Rasenmähen und Kantenpflege in einem Wohnhof in Sopron." }],
        ["assets/courtyard-process-hedge-trimming.jpg", "process", { hu: "Közönséges lombhullató sövény egyenletes visszavágása az udvari járda mellett.", de: "Eine gewöhnliche Laubhecke wird gleichmäßig entlang des Hofwegs geschnitten." }],
        ["assets/courtyard-process-shrub-pruning.jpg", "process", { hu: "Túlnőtt udvari bokor metszése, a levágott ágak rendezett gyűjtésével.", de: "Rückschnitt eines verwilderten Strauchs im Hof, bei dem die abgeschnittenen Äste ordentlich eingesammelt werden." }],
        ["assets/courtyard-process-green-waste.jpg", "process", { hu: "Nyírás utáni zöldhulladék összegyűjtése egy soproni közös udvarban.", de: "Sammeln von Grünschnitt nach dem Rückschnitt in einem gemeinschaftlich genutzten Hof in Sopron." }],
        ["assets/courtyard-garden-1.jpg", "after", { hu: "Rendezett soproni belső udvar nyírt fűvel, visszavágott sövénnyel és tiszta járdával.", de: "Ein gepflegter Hof in Sopron mit gemähtem Rasen, geschnittenen Hecken und einem sauberen Weg." }],
        ["assets/courtyard-garden-2.jpg", "after", { hu: "Karbantartott zöldsáv egy városi lakóépület mellett, egyszerű, jól áttekinthető kialakítással.", de: "Ein gepflegter Grünstreifen neben einem städtischen Wohnhaus, bewusst einfach und pflegeleicht gehalten." }],
        ["assets/courtyard-garden-3.jpg", "after", { hu: "Tiszta bejárati út és gondozott növényzet egy soproni társasházi udvarban.", de: "Ein sauberer Eingangsweg und gepflegte Bepflanzung in einem Wohnhof in Sopron." }],
      ],
    },
    {
      key: "handyman",
      cover: "assets/handyman-services-wall-fixtures.jpg",
      title: { hu: "Kisebb javítások és szerelés", de: "Kleinere Reparaturen und Handwerkerarbeiten" },
      text: {
        hu:
          "Polc, karnis, ajtóigazítás, szegély, rögzítés és átadás előtti apró hibák egy feladatlistába rendezve. Ezek külön-külön kicsinek tűnnek, együtt viszont sokat rontanak a tulajdonosi, bérlői vagy vendégélményen.",
        de:
          "Regale, Vorhangschienen, Türeinstellungen, Zierleisten, Befestigungen und kleine Übergabeprobleme in einer Aufgabenliste zusammengefasst. Für sich genommen mögen sie unbedeutend erscheinen, aber in ihrer Gesamtheit wirken sie sich stark darauf aus, wie sich die Immobilie anfühlt.",
      },
      photos: [
        ["13909112", "before", { hu: "Belső tér átadás előtt, ahol a kisebb szerelési és rendezési pontok adják meg a végső képet.", de: "Innenraum vor der Übergabe, bei dem kleine Montage- und Aufräumarbeiten den Gesamteindruck prägen." }],
        ["13588248", "before", { hu: "Rendezetlenebb fali tároló és dekorációs felület: a cél egy használhatóbb, tisztább összkép.", de: "Weniger ordentlicher Wandstauraum und Dekobereich vor der Schaffung eines nutzbareren, saubereren Eindrucks." }],
        ["23224978", "process", { hu: "Fali kép vagy tartó pontos beállítása, hogy a helyiség rendezettebb legyen.", de: "Ein Wandbild oder eine Halterung wird ausgerichtet, damit der Raum ordentlicher wirkt." }],
        ["4981802", "process", { hu: "Fali rögzítés és szerelés olyan helyen, ahol a kész eredmény használhatóbbá teszi a szobát.", de: "Wandmontagearbeiten, die den Raum nach Fertigstellung nutzbarer machen." }],
        ["assets/handyman-services-wall-fixtures.jpg", "after", { hu: "Felszerelt, rendezett fali polcok: a javítás használható tárolást és tisztább képet ad.", de: "Montierte Wandregale schaffen nutzbaren Stauraum und ein saubereres Erscheinungsbild." }],
        ["19109111", "after", { hu: "Stabil, kész polcrendszer, amely a korábbi üres vagy rendezetlen falfelületet használhatóvá teszi.", de: "Stabile, fertiggestellte Regale verwandeln eine leere oder unordentliche Wand in nutzbaren Stauraum." }],
        ["9565966", "after", { hu: "Rendezett fali tároló kisebb szerelés után, átadásra alkalmasabb belső képpel.", de: "Ordentlicher Wandstauraum nach kleineren Montagearbeiten, der den Übergabeeindruck verbessert." }],
        ["5824546", "after", { hu: "Teljes falon megjelenő tároló és polcrendszer kész állapotban.", de: "Vollständiger Wandstauraum mit Regalen im fertigen Zustand." }],
        ["19109111", "after", { hu: "Egyszerű, stabil fali polc elkészült állapotban, hétköznapi lakásbelsőben.", de: "Ein einfaches, stabiles Wandregal in einer gewöhnlichen Wohnung." }],
        ["5824575", "after", { hu: "Kész fali tároló teljes nézetben, ahol a javítás eredménye egyértelműen látszik.", de: "Fertiggestellter Wandstauraum in der Gesamtansicht, der das Ergebnis leicht verständlich macht." }],
      ],
    },
  ];


  const projects = [
    {
      key: "paint",
      type: { hu: "Festés / faljavítás", de: "Maler-/Wandreparatur" },
      cover: "assets/finished-room-1.jpg",
      comparison: true,
      before: "assets/painting-before-matched.jpg",
      after: "assets/finished-room-1.jpg",
      title: { hu: "Kopott falból tiszta, egységes felület", de: "Von müden Wänden bis hin zu einem sauberen Finish" },
      summary: {
        hu:
          "Bérlőváltás vagy vendégérkezés előtt a falhibák azonnal látszanak. A cél az, hogy a helyiség gyorsan újra rendezett és bemutatható legyen.",
        de:
          "Vor einem Mieterwechsel oder Gästeanreise sind Wandmängel sofort sichtbar. Ziel ist es, den Raum schnell wieder ansehnlich zu machen.",
      },
      result: {
        hu: "A helyiség tisztábbnak, gondozottabbnak és kiadhatóbbnak hat. A látogató nem a hibákat veszi észre először.",
        de: "Der Raum wirkt sauberer, gepflegter und lässt sich leichter präsentieren. Besucher nehmen den Raum wahr, nicht die Mängel.",
      },
      works: {
        hu: ["falhibák ellenőrzése fotók alapján", "felület előkészítése", "javítás és csiszolás", "egységes festés", "fotós visszajelzés"],
        de: ["fotobasierte Zustandsprüfung der Wand", "Oberflächenvorbereitung", "Ausbessern und Schleifen", "einheitlicher Anstrich", "Foto-Update nach Fertigstellung"],
      },
      photos: services[0].photos,
    },
    {
      key: "drywall",
      type: { hu: "Gipszkarton / mennyezet", de: "Trockenbau / Decke" },
      cover: "assets/finished-room-2.jpg",
      comparison: true,
      before: "assets/drywall-before-matched.jpg",
      after: "assets/finished-room-2.jpg",
      title: { hu: "Félkész gipszkartonból festésre kész felület", de: "Trockenbau vorbereitet für einen fertigen Innenraum" },
      summary: {
        hu:
          "A látható hézagok, élek és csiszolatlan javítások félkész hatást keltenek. Ilyenkor a cél nem látványos trükk, hanem pontos, tiszta előkészítés.",
        de:
          "Sichtbare Nähte, Kanten und ungeschliffene Bereiche lassen einen Raum unvollendet erscheinen. Ziel ist eine sorgfältige Vorbereitung, nicht kosmetische Abkürzungen.",
      },
      result: {
        hu: "A fal vagy mennyezet rendezett, festésre alkalmas és kevésbé vonja magára a figyelmet.",
        de: "Wand oder Decke werden ordentlich, streichfertig und lenken nicht mehr vom Raum ab.",
      },
      works: {
        hu: ["állapotfelmérés", "hézagok és élek javítása", "csiszolás", "felületkiegyenlítés", "átadás előtti ellenőrzés"],
        de: ["Zustandsprüfung", "Fugen- und Kantenreparatur", "sanding", "Flächenegalisierung", "Prüfung vor der Übergabe"],
      },
      photos: services[1].photos,
    },
    {
      key: "garden",
      type: { hu: "Kert / udvar", de: "Garten / Außenbereich" },
      cover: "assets/garden-maintenance-hero-garden.jpg",
      before: "assets/courtyard-before-entrance.jpg",
      after: "assets/courtyard-garden-1.jpg",
      title: { hu: "Benőtt udvarból gondozottabb érkezés", de: "Vom überwucherten Hof zu einem gepflegteren Ankommen" },
      summary: {
        hu:
          "A kert, udvar vagy bejárat gyakran az első pont, ahol az érdeklődő képet alkot az ingatlanról.",
        de:
          "Der Garten, der Hof oder der Eingangsbereich schafft oft schon Vertrauen, bevor überhaupt jemand das Grundstück betritt.",
      },
      result: {
        hu: "Az ingatlan rendezettebbnek és gondozottabbnak tűnik már érkezéskor, ami bérleménynél és Airbnb-nél különösen fontos.",
        de: "Die Immobilie wirkt vom ersten Moment an gepflegter – besonders wichtig bei Mietobjekten und Airbnb-Unterkünften.",
      },
      works: {
        hu: ["fűnyírás", "szegélyrendezés", "benőtt részek visszavágása", "zöldhulladék összegyűjtése", "kész állapot fotózása"],
        de: ["mowing", "Kantenpflege", "Zurückschneiden überwucherter Bereiche", "Grünschnittentsorgung", "Fotos im Endzustand"],
      },
      photos: services[2].photos,
    },
  ];

  Object.assign(projects[0], {
    category: "painting",
    location: { hu: "Soproni kiadó lakás", de: "Mietwohnung in Sopron" },
    timeline: { hu: "egyeztetett ütemezés", de: "Terminvereinbarung vereinbart" },
    client: { hu: "bérlőváltás előtt", de: "vor Mieterübergabe" },
    problem: {
      hu:
        "A falakon javításnyomok, kopások és foltok voltak. Ilyenkor az ingatlan nem igényel teljes felújítást, de a látható hibák azonnal rontják az első benyomást.",
      de:
        "Die Wände wiesen sichtbare Flecken, Ausbesserungsstellen und Abnutzung auf. Eine komplette Renovierung war nicht nötig, doch die sichtbaren Mängel schwächten den ersten Eindruck sofort.",
    },
    approach: {
      hu:
        "A kritikus falrészeket fotók alapján beazonosítjuk, majd a felületet előkészítjük, javítjuk, csiszoljuk és egységesebb festett állapotban adjuk vissza.",
      de:
        "Die kritischen Wandbereiche werden anhand von Fotos identifiziert, anschließend vorbereitet, repariert, geschliffen und mit einem einheitlicheren Anstrich übergeben.",
    },
    evidence: {
      hu: ["előtte fotók", "felület-előkészítés", "javítás és csiszolás", "kész állapot fotók"],
      de: ["Fotos vorher", "Oberflächenvorbereitung", "Ausbessern und Schleifen", "Fotos im fertigen Zustand"],
    },
    metrics: [
      { n: "10", hu: "képes példa", de: "Bildbeispiele" },
      { n: "3", hu: "munkafázis", de: "Arbeitsphasen" },
      { n: { hu: "Egyeztetett", de: "Vereinbart" }, hu: "ütemezés", de: "Terminierung" },
    ],
  });

  Object.assign(projects[1], {
    category: "drywall",
    location: { hu: "Lakásbelső / mennyezeti rész", de: "Innendeckenbereich der Wohnung" },
    timeline: { hu: "javítás és festésre előkészítés", de: "Reparatur und lackiergerechte Vorbereitung" },
    client: { hu: "tulajdonosi felkészítés", de: "Vorbereitung des Eigentümers" },
    problem: {
      hu:
        "A félkész gipszkarton és a rendezetlen hézagok amatőr hatást keltenek. Egy ilyen rész akkor is feltűnik, ha a lakás többi része rendben van.",
      de:
        "Unfertiger Trockenbau und raue Fugen lassen einen Innenraum improvisiert wirken. Selbst ein kleiner Bereich wie dieser fällt auf, wenn der Rest der Wohnung gepflegt ist.",
    },
    approach: {
      hu:
        "A hangsúly a pontos éleken, a simább átmeneteken és a festésre alkalmas felületen van. Nem látványos díszítés, hanem tiszta alapmunka.",
      de:
        "Der Fokus liegt auf saubereren Kanten, gleichmäßigeren Übergängen und einer streichfertigen Oberfläche. Es handelt sich um praktische Vorarbeit, nicht um dekoratives Kaschieren.",
    },
    evidence: {
      hu: ["gipszkarton állapot", "hézagjavítás", "csiszolás", "átadás előtti kontroll"],
      de: ["Zustand des Trockenbaus", "Fugenreparatur", "sanding", "Kontrolle vor der Übergabe"],
    },
    metrics: [
      { n: "10", hu: "képes példa", de: "Bildbeispiele" },
      { n: "5", hu: "ellenőrzési pont", de: "Kontrollpunkte" },
      { n: "DE/HU", hu: "egyeztetés", de: "Kommunikation" },
    ],
  });

  Object.assign(projects[2], {
    category: "garden",
    location: { hu: "Soproni udvar és bejárati rész", de: "Soproner Hof und Eingangsbereich" },
    timeline: { hu: "szezonális rendbetétel", de: "Saisonale Aufräumarbeiten" },
    client: { hu: "bérlemény / Airbnb előkészítés", de: "Vorbereitung für Vermietung / Airbnb" },
    problem: {
      hu:
        "A magas fű, elhanyagolt szegély és rendezetlen bejárat már érkezéskor bizonytalanságot kelt. Ez különösen gond Airbnb-nél vagy bérleménynél.",
      de:
        "Überwuchertes Gras, unordentliche Kanten und ein vernachlässigter Eingang wecken Zweifel, noch bevor jemand die Immobilie betritt. Das ist besonders bei Mietobjekten und Airbnb-Unterkünften entscheidend.",
    },
    approach: {
      hu:
        "A cél nem kertépítés, hanem gyors, látható rend: nyírás, szegélyezés, visszavágás, összegyűjtés és fotózott kész állapot.",
      de:
        "Ziel ist keine Gartengestaltung, sondern schnell sichtbare Ordnung: Mähen, Kantenschnitt, Trimmen, Entsorgung und ein fotografisch festgehaltener Endzustand.",
    },
    evidence: {
      hu: ["előtte állapot", "nyírás és szegélyezés", "zöldhulladék rendezése", "kész állapot"],
      de: ["Zustand vorher", "Mähen und Kantenschnitt", "Grünschnitt-Aufräumung", "Fertiger Zustand"],
    },
    metrics: [
      { n: "10", hu: "képes dokumentáció", de: "Fotoaufzeichnungen" },
      { n: "1", hu: "rendezett érkezés", de: "Ordentlichere Ankunft" },
      { n: "0", hu: "felesleges kör", de: "Unnötige Umwege" },
    ],
  });

  projects.push(
    {
      key: "airbnb-turnover",
      category: "airbnb",
      type: { hu: "Airbnb / bérlőváltás", de: "Airbnb-/Mieterwechsel" },
      cover: "assets/airbnb-living-room.jpg",
      comparison: true,
      before: "assets/airbnb-before-turnover-matched.jpg",
      after: "assets/airbnb-living-room.jpg",
      title: { hu: "Lakásfrissítés vendégérkezés előtt", de: "Auffrischung des Apartments vor Ankunft der Gäste" },
      location: { hu: "Soproni Airbnb lakás", de: "Airbnb-Wohnung in Sopron" },
      timeline: { hu: "vendégérkezéshez igazítva", de: "geplant um die Ankunft der Gäste herum" },
      client: { hu: "vendégváltás előtt", de: "vor Gästewechsel" },
      summary: {
        hu:
          "Vendégváltás előtt a kisebb hibák is feltűnőek. Ilyenkor a legfontosabb a pontosan egyeztetett, tiszta és dokumentált munka.",
        de:
          "Vor einem Gästewechsel fallen schon kleine Mängel auf. Im Vordergrund steht eine klar geplante, ordentliche und dokumentierte Arbeit.",
      },
      problem: {
        hu:
          "A lakásban több kisebb nyom, rögzítési hiba és javítandó rész jelent meg egyszerre. A tulajdonosnak nem külön szakikat kell szerveznie minden apróságra.",
        de:
          "Mehrere kleine Gebrauchsspuren, behebungsbedürftige Probleme und sichtbare Mängel traten gleichzeitig auf. Der Eigentümer sollte nicht für jede Kleinigkeit ein eigenes Gewerk koordinieren müssen.",
      },
      approach: {
        hu:
          "A látható hibákat rangsoroljuk: ami a vendégnek azonnal feltűnik, előre kerül. A munka végén képes visszajelzés segíti a távoli döntést.",
        de:
          "Sichtbare Probleme werden nach ihrer Wirkung auf die Gäste priorisiert. Nach Abschluss helfen Foto-Updates dem Eigentümer, auch aus der Ferne Entscheidungen zu treffen.",
      },
      result: {
        hu:
          "A lakás gyorsabban vállalható állapotba kerül, kevesebb bizonytalansággal a vendégérkezés előtt.",
        de:
          "Die Wohnung wird schneller vorzeigbar, mit weniger Unsicherheit vor der Ankunft der Gäste.",
      },
      works: {
        hu: ["látható hibák listázása", "falfrissítés", "kisebb rögzítések", "átadás előtti ellenőrzés", "fotós dokumentáció"],
        de: ["Liste sichtbarer Mängel", "Wandausbesserung", "Kleine Reparaturen", "Kontrolle vor der Übergabe", "Fotodokumentation"],
      },
      evidence: {
        hu: ["problémalista", "javítás közbeni fotók", "kész állapot", "tulajdonosi visszajelzésre kész anyag"],
        de: ["Mängelliste", "Fortschrittsfotos", "Fertiger Zustand", "Update für den Eigentümer"],
      },
      metrics: [
        { n: "10", hu: "fotó", de: "Fotos" },
        { n: "4", hu: "javítási típus", de: "Reparaturarten" },
        { n: "1", hu: "kapcsolattartási pont", de: "Ansprechpartner" },
      ],
      photos: [
        ["5102904", "before", { hu: "Vendégváltás előtti lakott állapot: a nappalit rendezettebbé és fotózhatóbbá kell tenni.", de: "Bewohnter Zustand vor dem Gästewechsel: Das Wohnzimmer muss aufgeräumter und präsentabler werden." }],
        ["6195959", "process", { hu: "Airbnb előkészítés takarítással és ellenőrzéssel, teljesebb lakótérben látható munkával.", de: "Airbnb-Vorbereitung mit Reinigung und Kontrolle, gezeigt im größeren Kontext des Wohnraums." }],
        ["6764827", "after", { hu: "Kész, rendezett nappali vendégérkezéshez: tiszta, átlátható és használható tér.", de: "Fertiges Wohnzimmer für die Ankunft der Gäste: sauber, aufgeräumt und nutzbar." }],
        ["8135495", "after", { hu: "Rendezett hálószoba átadás előtt, tiszta textillel és ellenőrizhető összképpel.", de: "Aufgeräumtes Schlafzimmer vor der Übergabe, mit sauberen Textilien und einem gut überprüfbaren Gesamtzustand." }],
        ["19899060", "after", { hu: "Világos, teljes nappali kész állapotban, amely jól mutat vendégfotón és átadáskor.", de: "Helles, komplettes Wohnzimmer im fertigen Zustand, geeignet für Gästefotos und Übergabe." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Hétköznapi soproni nappali rendezett, vendégfogadásra kész állapotban.", de: "Alltägliches Wohnzimmer in Sopron in aufgeräumtem, gästefertigem Zustand." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Frissen festett, egyszerű soproni szoba tiszta járófelülettel.", de: "Frisch gestrichenes, schlichtes Zimmer in Sopron mit klarer Wegführung." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Világos soproni lakószoba rendezett falakkal, átadásra kész állapotban.", de: "Helles Wohnzimmer in Sopron mit gepflegten Wänden, bereit zur Übergabe." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott hálószoba, amely vendégnek és tulajdonosnak is könnyen ellenőrizhető.", de: "Sauberes, schlichtes Schlafzimmer, das sowohl für Gäste als auch für den Eigentümer leicht zu überblicken ist." }],
        ["271624", "after", { hu: "Kompakt Airbnb lakótér kész állapotban, rendezett fallal és használható elrendezéssel.", de: "Kompakter Airbnb-Wohnbereich im fertigen Zustand, mit gepflegten Wänden und praktischem Grundriss." }],
      ],
    },
    {
      key: "office-touchup",
      category: "office",
      type: { hu: "Iroda / képviseleti tér", de: "Büro-/Repräsentationsraum" },
      cover: "assets/office-finished-1.jpg",
      comparison: true,
      before: "assets/office-before-touchup-matched.jpg",
      after: "assets/office-finished-1.jpg",
      title: { hu: "Iroda gyors frissítése látogatás előtt", de: "Nachbesserung im Büro vor einem Besuch" },
      location: { hu: "Soproni iroda", de: "Büro in Sopron" },
      timeline: { hu: "rövid, célzott munka", de: "kurze, konzentrierte Arbeit" },
      client: { hu: "nemzetközi környezet", de: "internationales Umfeld" },
      summary: {
        hu:
          "Irodáknál és képviseleti tereknél nem fér bele a zavaros kivitelezés. A munka legyen rövid, diszkrét és tisztán kommunikált.",
        de:
          "Büros und repräsentative Räume brauchen ruhiges, organisiertes Arbeiten. Der Job sollte kurz, diskret und klar kommuniziert sein.",
      },
      problem: {
        hu:
          "A falakon és használati pontokon apró sérülések rontották a rendezett képet. Ezek nem nagy hibák, de egy látogatásnál feltűnnek.",
        de:
          "Kleine Gebrauchsspuren und abgenutzte Stellen beeinträchtigten den professionellen Eindruck des Büros. Es handelte sich nicht um größere Mängel, doch sie fallen bei einem Besuch auf.",
      },
      approach: {
        hu:
          "A munka a látható felületekre koncentrál: faljavítás, javítófestés, kisebb igazítások és tiszta átadás.",
        de:
          "Die Arbeiten konzentrieren sich auf sichtbare Flächen: Wandreparatur, Ausbesserungsanstrich, kleine Anpassungen und eine saubere Übergabe.",
      },
      result: {
        hu:
          "Az iroda rendezettebb, nyugodtabb és vendégfogadásra alkalmasabb benyomást kelt.",
        de:
          "Das Büro wirkt ordentlicher, ruhiger und besser vorbereitet für Besucher.",
      },
      works: {
        hu: ["látható sérülések felmérése", "javítófestés", "gipszkarton részjavítás", "kisebb szerelés", "tiszta átadás"],
        de: ["Kontrolle sichtbarer Mängel", "Ausbesserungsanstrich", "Kleinere Trockenbaureparatur", "Kleine Anpassungen", "Ordentliche Übergabe"],
      },
      evidence: {
        hu: ["diszkrét munkaszervezés", "részletfotók", "átadás előtti ellenőrzés", "kész állapot"],
        de: ["Diskrete Terminplanung", "Detailfotos", "Kontrolle vor der Übergabe", "Fertiger Zustand"],
      },
      metrics: [
        { n: "DE/HU", hu: "kommunikáció", de: "Kommunikation" },
        { n: "5", hu: "ellenőrzési pont", de: "Kontrollpunkte" },
        { n: "10", hu: "kép", de: "Bilder" },
      ],
      photos: [
        ["5483236", "before", { hu: "Üres irodatér frissítés előtt: a cél a tiszta, használatra kész munkakörnyezet.", de: "Leeres Büro vor der Auffrischung, mit dem Ziel eines sauberen, nutzbaren Arbeitsumfelds." }],
        ["8477444", "before", { hu: "Nagyobb nyitott iroda átadás előtt, ahol a teljes tér összképe számít.", de: "Großes Großraumbüro vor der Übergabe, bei dem der Gesamteindruck entscheidend ist." }],
        ["assets/office-process-wall-touchup.jpg", "process", { hu: "Szervezett javítófestés egy soproni iroda kisebb falszakaszán.", de: "Organisierter Ausbesserungsanstrich an einem kleinen Wandabschnitt in einem Büro in Sopron." }],
        ["5511098", "process", { hu: "Nagyobb irodai munkatér ellenőrzése frissítés előtt, teljesebb perspektívából.", de: "Größerer Büroarbeitsbereich vor der Auffrischung, aus einer weiteren Perspektive gezeigt." }],
        ["assets/office-finished-1.jpg", "after", { hu: "Rendezett soproni irodatér tiszta falakkal és hétköznapi berendezéssel.", de: "Gepflegtes Büro in Sopron mit sauberen Wänden und zweckmäßiger Einrichtung." }],
        ["assets/office-finished-2.jpg", "after", { hu: "Világos, látogatófogadásra kész soproni váró- és közösségi tér.", de: "Heller Warte- und Gemeinschaftsbereich in Sopron, bereit für den Empfang von Besuchern." }],
        ["assets/office-finished-3.jpg", "after", { hu: "Egyszerű soproni tárgyaló egységes falakkal és rendezett összképpel.", de: "Schlichter Besprechungsraum in Sopron mit einheitlichen Wänden und ordentlichem Erscheinungsbild." }],
        ["7534216", "after", { hu: "Kész tárgyaló jellegű tér, tiszta falakkal és rendezett összképpel.", de: "Fertiggestellter Besprechungsraum mit sauberen Wänden und ordentlichem Erscheinungsbild." }],
        ["36631699", "after", { hu: "Tágas iroda teljes nézetben, rendezett munkaállomásokkal.", de: "Geräumiges Büro in der Gesamtansicht, mit ordentlich gestalteten Arbeitsplätzen." }],
        ["1181406", "after", { hu: "Teljes irodatér használat közben: a frissített környezet professzionálisabb képet ad.", de: "Voll genutzter Bürobereich, in dem das aufgefrischte Umfeld für einen professionelleren Eindruck sorgt." }],
      ],
    },
    {
      key: "handover-small-fixes",
      category: "handyman",
      type: { hu: "Kisebb javítások / átadás", de: "Kleine Reparaturen / Übergabe" },
      cover: "assets/airbnb-bedroom.jpg",
      comparison: true,
      before: "assets/handyman-before-matched.jpg",
      after: "assets/airbnb-bedroom.jpg",
      title: { hu: "Apró hibákból rendezett átadás", de: "Aus kleinen Mängeln wurde eine ordentliche Übergabe" },
      location: { hu: "Soproni bérlemény", de: "Mietobjekt in Sopron" },
      timeline: { hu: "átadás előtti javítás", de: "Reparaturen vor der Übergabe" },
      client: { hu: "tulajdonos / kezelő", de: "Eigentümer/Manager" },
      summary: {
        hu:
          "A kisebb hibák külön-külön nem tűnnek súlyosnak, de együtt azt sugallják, hogy az ingatlan nincs kézben tartva.",
        de:
          "Kleine Mängel sehen einzeln vielleicht nicht schwerwiegend aus, aber in ihrer Gesamtheit deuten sie darauf hin, dass die Immobilie nicht ordnungsgemäß verwaltet wird.",
      },
      problem: {
        hu:
          "Karnis, polc, fogantyú, szegély vagy ajtóigazítás jellegű apróságok gyűltek össze. Ezek átadásnál vagy fotózásnál erősen látszanak.",
        de:
          "Kleine Elemente wie Stangen, Regale, Griffe, Leisten oder Türanpassungen hatten sich angesammelt. Diese Details fallen bei der Übergabe oder bei Fotoaufnahmen auf.",
      },
      approach: {
        hu:
          "A munkát listázzuk, majd egy körben kezeljük a kisebb hibákat. Így a tulajdonos nem veszít időt sok külön egyeztetéssel.",
        de:
          "Die Punkte werden in einer einzigen fokussierten Begehung erfasst und erledigt, sodass der Eigentümer nicht mehrere kleine Aufgaben koordinieren muss.",
      },
      result: {
        hu:
          "Az ingatlan rendezettebb és átadhatóbb lett, a javítások pedig követhető listában szerepelnek.",
        de:
          "Die Immobilie wird aufgeräumter und leichter zu übergeben, wobei die abgeschlossenen Arbeiten in einer übersichtlichen Liste dokumentiert werden.",
      },
      works: {
        hu: ["javítási lista", "kisebb rögzítések", "ajtó és szegély igazítás", "látható hibák kezelése", "fotós visszajelzés"],
        de: ["Reparaturliste", "Kleine Reparaturen", "Anpassungen an Türen und Leisten", "Behebung sichtbarer Mängel", "Foto-Update"],
      },
      evidence: {
        hu: ["feladatlista", "munkafolyamat képek", "kész állapot", "átadásra alkalmasabb tér"],
        de: ["Aufgabenliste", "Arbeitsfotos", "Fertiger Zustand", "Mehr Übergabebereitschaft"],
      },
      metrics: [
        { n: "1", hu: "szervezett kör", de: "Organisierter Termin" },
        { n: "10", hu: "fotó", de: "Fotos" },
        { n: "5+", hu: "tipikus apró hiba", de: "Typische kleine Mängel" },
      ],
      photos: services[3].photos,
    }
  );

  projects.forEach((project) => {
    project.description = project.description || project.summary;
    project.images = project.images || project.photos || [];
    project.photos = project.images;
    project.videos = [];
  });

  const phaseCounts = (photos = []) =>
    photos.reduce(
      (counts, photo) => {
        counts[photo[1]] += 1;
        return counts;
      },
      { before: 0, process: 0, after: 0 }
    );


  const problemDetails = [
    {
      service: { hu: "Ingatlankarbantartás", de: "Immobilienpflege" },
      href: "property-maintenance-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön néhány áttekintő fotót, a soproni címet vagy környéket és azt, hogyan lehet bejutni az ingatlanba. Így gyorsan látható, hogy fotók alapján elindítható-e a feladat.",
        de: "Senden Sie ein paar Übersichtsaufnahmen, die Soproner Adresse und die Zugangsinformationen. So wird klar, ob die Aufgabe anhand von Fotos starten kann oder eine Besichtigung vor Ort braucht.",
      },
    },
    {
      service: { hu: "Takarítás és karbantartás", de: "Reinigung und Instandhaltung" },
      href: "cleaning-services-sopron.html",
      projectIndex: 3,
      next: {
        hu: "Írja meg a következő vendég érkezési idejét, küldjön fotókat a látható hibákról, és jelölje meg, mi számít sürgősnek.",
        de: "Teilen Sie die nächste Gästeankunft mit, senden Sie Fotos der sichtbaren Punkte und markieren Sie, was dringend ist.",
      },
    },
    {
      service: { hu: "Festés és faljavítás", de: "Malerarbeiten und Wandreparaturen" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön képeket a falhibákról, a helyiségről és az átadási határidőről. Ebből eldönthető, javítófestés vagy nagyobb frissítés indokolt-e.",
        de: "Senden Sie Fotos der Wandmängel, des Raums und der Übergabefrist. Danach lässt sich klären, ob Ausbesserungsanstrich oder eine umfassendere Auffrischung sinnvoll ist.",
      },
    },
    {
      service: { hu: "Ezermester és ingatlankarbantartás", de: "Hausmeisterservice und Immobilieninstandhaltung" },
      href: "handyman-services-sopron.html",
      projectIndex: 5,
      next: {
        hu: "Készítsen rövid listát a hibákról, mellékeljen fotókat, és írja le, ki tudja jóváhagyni az esetleges változásokat.",
        de: "Erstellen Sie eine kurze Aufgabenliste, fügen Sie Fotos hinzu und nennen Sie, wer Änderungen am Umfang freigeben kann.",
      },
    },
    {
      service: { hu: "Kertfenntartás", de: "Gartenpflege" },
      href: "garden-maintenance-sopron.html",
      projectIndex: 2,
      next: {
        hu: "Küldjön kültéri fotókat, jelölje meg a hozzáférést és az időjárástól függő határidőt. Így reális ütemezést lehet adni.",
        de: "Senden Sie Außenfotos, Zugangsinformationen und wetterabhängige Fristen. So lässt sich ein realistischer Zeitplan festlegen.",
      },
    },
    {
      service: { hu: "Festés, faljavítás és szerelés", de: "Malerarbeiten, Wandreparaturen und Montagen" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 4,
      next: {
        hu: "Küldjön fotókat a látogatás előtt zavaró részletekről, a működési időről és a belépési szabályokról. Így diszkréten ütemezhető a munka.",
        de: "Senden Sie Fotos der Details, die vor dem Besuch wichtig sind, sowie Betriebszeiten und Zugangsregeln. Die Arbeit kann dann diskret eingeplant werden.",
      },
    },
  ];


  const projectCarousel = (item, index, mode = "card") => {
    const id = `${mode}-${index}`;
    const isModal = mode === "modal";
    const images = item.images || [];
    return `
      <div class="project-carousel ${isModal ? "large" : "compact"}" data-carousel="${id}" data-project-index="${index}" data-carousel-action="${isModal ? "gallery" : "project"}" data-active="0" data-phase="all">
        <div class="carousel-head">
          <strong>${state.lang === "hu" ? "Illusztratív képsorozat" : "Beispielhafte Bilderserie"}</strong>
          <span data-carousel-count aria-live="polite">${images.length} ${state.lang === "hu" ? "kép" : "Bilder"}</span>
        </div>
        <div class="carousel-stage">
          <button class="carousel-arrow carousel-prev" type="button" data-carousel-prev="${id}" aria-label="${state.lang === "hu" ? "Előző kép" : "Vorheriges Bild"}">‹</button>
          <div class="carousel-viewport">
            <div class="carousel-track">
              ${images.map((p, i) => `<button class="carousel-slide" type="button" data-slide="${i}" data-phase="${p[1]}"><img src="${img(p[0], isModal ? 1100 : 520)}" alt="${photoCaption(p)}" loading="${isModal && i === 0 ? "eager" : "lazy"}" decoding="async"><span class="slide-caption"><b>${phaseText(p[1])}</b><span>${photoCaption(p)}</span></span></button>`).join("")}
            </div>
          </div>
          <button class="carousel-arrow carousel-next" type="button" data-carousel-next="${id}" aria-label="${state.lang === "hu" ? "Következő kép" : "Nächstes Bild"}">›</button>
        </div>
        <div class="carousel-thumbs">
          ${images.map((p, i) => `<button type="button" data-carousel-dot="${id}" data-slide-to="${i}" data-phase="${p[1]}" aria-label="${phaseText(p[1])} ${i + 1}: ${photoCaption(p)}"><img src="${img(p[0], 180)}" alt="" loading="lazy" decoding="async"></button>`).join("")}
        </div>
      </div>`;
  };


  const openProject = (index) => {
    const item = projects[index];
    const images = item.images || [];
    const counts = phaseCounts(images);
    state.projectIndex = index;
    document.getElementById("projectInner").innerHTML = `
      <div class="project-layout" data-project-index="${index}">
        <div>
          ${
            hasProjectComparison(item)
              ? `${compareMarkup(item, { id: "compare", hintId: "compareHint" })}
          <button class="btn compare-fullscreen-btn" type="button" data-full-comparison="${index}">${compareText("viewFullComparison")}</button>`
              : `<div class="case-preview single-image modal-single-preview"><img src="${img(item.cover, 1400)}" alt="${tx(item.title)}" loading="eager" decoding="async"><span class="inspect-icon" aria-hidden="true"></span></div>`
          }
          <div class="phase-filter">
            <button class="active" data-phase-filter="all">${state.lang === "hu" ? "Összes kép" : "Alle Fotos"}</button>
            <button data-phase-filter="before">${tx(phaseLabel.before)} (${counts.before})</button>
            <button data-phase-filter="process">${tx(phaseLabel.process)} (${counts.process})</button>
            <button data-phase-filter="after">${tx(phaseLabel.after)} (${counts.after})</button>
          </div>
          ${projectCarousel(item, index, "modal")}
        </div>
        <div class="details">
          <small class="eyebrow">${tx(item.type)}</small>
          <h2 id="projectModalTitle">${tx(item.title)}</h2>
          <p class="example-badge">${state.lang === "hu" ? "Illusztratív példa, nem saját referenciaprojekt." : "Illustratives Beispiel, kein abgeschlossenes Kundenprojekt."}</p>
          <div class="project-meta-line">
            <span>${tx(item.location)}</span>
            <span>${tx(item.timeline)}</span>
            <span>${tx(item.client)}</span>
          </div>
          <p>${tx(item.description)}</p>
          <div class="project-metrics">
            ${item.metrics.map((metric) => `<div><b>${typeof metric.n === "object" ? tx(metric.n) : metric.n}</b><small>${state.lang === "hu" ? metric.hu : metric.de}</small></div>`).join("")}
          </div>
          <div class="story-grid">
            <article class="story-card"><strong>${state.lang === "hu" ? "Kiinduló helyzet" : "Ausgangssituation"}</strong><p>${tx(item.problem)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Megközelítés" : "Vorgehen"}</strong><p>${tx(item.approach)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Végeredmény" : "Endergebnis"}</strong><p>${tx(item.result)}</p></article>
          </div>
          <div class="evidence-list">
            ${tx(item.evidence).map((entry) => `<span class="evidence-chip">${entry}</span>`).join("")}
          </div>
          <h3>${state.lang === "hu" ? "Jellemző munkalépések" : "Typische Arbeitsschritte"}</h3>
          <ul>${tx(item.works).map((work) => `<li>${work}</li>`).join("")}</ul>
          <div class="result"><strong>${state.lang === "hu" ? "Várható eredmény" : "Erwartetes Ergebnis"}</strong><p>${tx(item.result)}</p></div>
          <div class="section-cta"><a class="btn primary" href="${tel}" data-phone-action>${phoneActionLabel()}</a></div>
        </div>
      </div>`;
    applyPageLanguage();
    const modal = document.getElementById("projectModal");
    modal.setAttribute("aria-labelledby", "projectModalTitle");
    openModal(modal);
    const compare = document.getElementById("compare");
    initCompare(compare);
    document.querySelector("[data-full-comparison]")?.addEventListener("click", () => openFullComparison(index));
    document.querySelectorAll("[data-phase-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-phase-filter]").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        const phase = btn.dataset.phaseFilter;
        showCarousel(`modal-${index}`, 0, phase);
      });
    });
    initCarousels(document.getElementById("projectModal"));
  };

  const openFullComparison = (index) => {
    const item = projects[index];
    if (!hasProjectComparison(item)) return;
    state.projectIndex = index;
    document.getElementById("galleryInner").innerHTML = `
      <div class="gallery-layout comparison-lightbox-layout">
        <div class="gallery-main comparison-main">
          ${compareMarkup(item, { id: "fullCompare", hintId: "fullCompareHint", className: "compare-large" })}
        </div>
        <aside class="gallery-info comparison-info">
          <small class="eyebrow">${tx(item.title)}</small>
          <h2 id="galleryModalTitle">${compareText("fullComparisonTitle")}</h2>
          <p>${compareText("fullComparisonDescription")}</p>
          <div class="comparison-key">
            <span><b>${compareText("compareBefore")}</b>${photoCaption([item.before, "before", { hu: `${tx(item.title)} - kiinduló állapot`, de: `${tx(item.title)} - Ausgangszustand` }])}</span>
            <span><b>${compareText("compareAfter")}</b>${photoCaption([item.after, "after", { hu: `${tx(item.title)} - kész állapot`, de: `${tx(item.title)} - fertiggestellter Zustand` }])}</span>
          </div>
        </aside>
      </div>`;
    applyPageLanguage();
    const modal = document.getElementById("galleryModal");
    modal.dataset.galleryMode = "comparison";
    modal.setAttribute("aria-labelledby", "galleryModalTitle");
    openModal(modal);
    const compare = document.getElementById("fullCompare");
    initCompare(compare);
    compare?.focus({ preventScroll: true });
  };

  const setComparePosition = (compare, value) => {
    const next = Math.max(0, Math.min(100, Number(value)));
    compare.style.setProperty("--split", `${next}%`);
    const rounded = String(Math.round(next));
    if (compare.getAttribute("aria-valuenow") !== rounded) {
      compare.setAttribute("aria-valuenow", rounded);
      compare.setAttribute("aria-valuetext", compareValueText(next));
    }
  };

  let activeCompareDrag = null;
  let compareFrame = 0;
  let comparePendingClientX = 0;
  let compareDocumentListenersBound = false;
  let compareTouchFallbackListenersBound = false;
  let activeCompareTouch = null;

  const comparePercentFromClientX = (state, clientX) => {
    if (!state?.rect?.width) return 50;
    return ((clientX - state.rect.left) / state.rect.width) * 100;
  };

  const renderCompareFromClientX = (state, clientX) => {
    if (!state?.compare) return;
    setComparePosition(state.compare, comparePercentFromClientX(state, clientX));
  };

  const scheduleCompareRender = (clientX) => {
    if (!activeCompareDrag) return;
    comparePendingClientX = clientX;
    if (compareFrame) return;
    compareFrame = requestAnimationFrame(() => {
      compareFrame = 0;
      if (!activeCompareDrag) return;
      renderCompareFromClientX(activeCompareDrag, comparePendingClientX);
    });
  };

  const findCompareAtPoint = (event) => {
    const directCompare = event.target?.closest?.("[data-compare]");
    if (directCompare) return directCompare;
    const candidates = [...document.querySelectorAll("[data-compare]")].filter((compare) => {
      const rect = compare.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    return candidates.at(-1) || null;
  };

  const releaseComparePointerCapture = (state, event) => {
    try {
      const pointerId = event?.pointerId ?? state?.pointerId;
      if (state?.compare && pointerId !== undefined && state.compare.hasPointerCapture?.(pointerId)) {
        state.compare.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const finishCompareDrag = (event, { finalUpdate = false } = {}) => {
    if (!activeCompareDrag) return;
    if (event?.pointerId !== undefined && event.pointerId !== activeCompareDrag.pointerId) return;
    const state = activeCompareDrag;
    if (finalUpdate && event?.clientX !== undefined) renderCompareFromClientX(state, event.clientX);
    if (compareFrame) {
      cancelAnimationFrame(compareFrame);
      compareFrame = 0;
    }
    releaseComparePointerCapture(state, event);
    state.compare.classList.remove("is-dragging");
    activeCompareDrag = null;
  };

  const handleComparePointerMove = (event) => {
    if (!activeCompareDrag || event.pointerId !== activeCompareDrag.pointerId) return;
    if (activeCompareDrag.touchIntent === "pending") {
      const dx = event.clientX - activeCompareDrag.startX;
      const dy = event.clientY - activeCompareDrag.startY;
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        setComparePosition(activeCompareDrag.compare, activeCompareDrag.startValue);
        finishCompareDrag(event);
        return;
      }
      if (Math.abs(dx) >= Math.abs(dy)) activeCompareDrag.touchIntent = "drag";
    }
    scheduleCompareRender(event.clientX);
  };

  const handleComparePointerEnd = (event) => {
    finishCompareDrag(event, { finalUpdate: event.type === "pointerup" });
  };

  const handleComparePointerDown = (event) => {
    const compare = findCompareAtPoint(event);
    if (!compare) return;
    startCompareDrag(compare, event);
  };

  const bindCompareDocumentListeners = () => {
    if (compareDocumentListenersBound) return;
    compareDocumentListenersBound = true;
    document.addEventListener("pointerdown", handleComparePointerDown, true);
    document.addEventListener("pointermove", handleComparePointerMove);
    document.addEventListener("pointerup", handleComparePointerEnd);
    document.addEventListener("pointercancel", handleComparePointerEnd);
    document.addEventListener("lostpointercapture", handleComparePointerEnd, true);
    window.addEventListener("blur", () => finishCompareDrag());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finishCompareDrag();
    });
    window.addEventListener("resize", () => finishCompareDrag());
    window.addEventListener("orientationchange", () => finishCompareDrag());
  };

  const startCompareDrag = (compare, event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.isPrimary === false) return;
    finishCompareDrag();

    const rect = compare.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    activeCompareDrag = {
      compare,
      pointerId: event.pointerId,
      pointerType: event.pointerType || "mouse",
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startValue: Number(compare.getAttribute("aria-valuenow")) || 50,
      touchIntent: event.pointerType && event.pointerType !== "mouse" ? "pending" : "drag"
    };
    compare.classList.add("is-dragging");
    compare.focus({ preventScroll: true });
    try {
      compare.setPointerCapture?.(event.pointerId);
    } catch {
      // Some browsers can deny capture during interrupted gestures.
    }
    renderCompareFromClientX(activeCompareDrag, event.clientX);
  };

  const findCompareTouch = (touches, identifier) => [...touches].find((touch) => touch.identifier === identifier);

  const finishCompareTouch = (event, { finalUpdate = false } = {}) => {
    if (!activeCompareTouch) return;
    const state = activeCompareTouch;
    const touch = event ? findCompareTouch(event.changedTouches || [], state.identifier) : null;
    if (finalUpdate && touch) renderCompareFromClientX(state, touch.clientX);
    if (compareFrame) {
      cancelAnimationFrame(compareFrame);
      compareFrame = 0;
    }
    state.compare.classList.remove("is-dragging");
    activeCompareTouch = null;
  };

  const bindCompareTouchFallbackListeners = () => {
    if (compareTouchFallbackListenersBound) return;
    compareTouchFallbackListenersBound = true;
    document.addEventListener(
      "touchmove",
      (event) => {
        if (!activeCompareTouch) return;
        const touch = findCompareTouch(event.changedTouches, activeCompareTouch.identifier) || findCompareTouch(event.touches, activeCompareTouch.identifier);
        if (!touch) return;
        const dx = touch.clientX - activeCompareTouch.startX;
        const dy = touch.clientY - activeCompareTouch.startY;
        if (activeCompareTouch.touchIntent === "pending") {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
            setComparePosition(activeCompareTouch.compare, activeCompareTouch.startValue);
            finishCompareTouch();
            return;
          }
          if (Math.abs(dx) >= Math.abs(dy)) activeCompareTouch.touchIntent = "drag";
        }
        if (event.cancelable && Math.abs(dx) >= Math.abs(dy)) event.preventDefault();
        comparePendingClientX = touch.clientX;
        if (compareFrame) return;
        compareFrame = requestAnimationFrame(() => {
          compareFrame = 0;
          if (!activeCompareTouch) return;
          renderCompareFromClientX(activeCompareTouch, comparePendingClientX);
        });
      },
      { passive: false }
    );
    document.addEventListener("touchend", (event) => finishCompareTouch(event, { finalUpdate: true }), { passive: true });
    document.addEventListener("touchcancel", (event) => finishCompareTouch(event), { passive: true });
    window.addEventListener("blur", () => finishCompareTouch());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finishCompareTouch();
    });
    window.addEventListener("resize", () => finishCompareTouch());
    window.addEventListener("orientationchange", () => finishCompareTouch());
  };

  const startCompareTouchFallback = (compare, event) => {
    if (activeCompareTouch) finishCompareTouch();
    if (event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const rect = compare.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    activeCompareTouch = {
      compare,
      identifier: touch.identifier,
      rect,
      startX: touch.clientX,
      startY: touch.clientY,
      startValue: Number(compare.getAttribute("aria-valuenow")) || 50,
      touchIntent: "pending"
    };
    compare.classList.add("is-dragging");
    compare.focus({ preventScroll: true });
    renderCompareFromClientX(activeCompareTouch, touch.clientX);
  };

  const initCompare = (compare) => {
    if (compare.dataset.bound === "true") return;
    compare.dataset.bound = "true";
    if (window.PointerEvent) {
      bindCompareDocumentListeners();
    } else {
      bindCompareTouchFallbackListeners();
      compare.addEventListener(
        "touchstart",
        (event) => startCompareTouchFallback(compare, event),
        { passive: true }
      );
    }
    compare.addEventListener("keydown", (event) => {
      const current = Number(compare.getAttribute("aria-valuenow")) || 50;
      const step = event.shiftKey ? 5 : 1;
      const values = {
        ArrowLeft: current - step,
        ArrowDown: current - step,
        ArrowRight: current + step,
        ArrowUp: current + step,
        PageDown: current - 10,
        PageUp: current + 10,
        Home: 0,
        End: 100
      };
      if (!(event.key in values)) return;
      event.preventDefault();
      setComparePosition(compare, values[event.key]);
    });
    setComparePosition(compare, 50);
    requestAnimationFrame(() => compare.classList.add("is-ready"));
  };

  const initCarousels = (root = document) => {
    root.querySelectorAll("[data-carousel]").forEach((carousel) => {
      if (carousel.dataset.bound === "true") return;
      carousel.dataset.bound = "true";
      const id = carousel.dataset.carousel;
      carousel.querySelectorAll("[data-carousel-prev]").forEach((btn) => btn.addEventListener("click", () => moveCarousel(id, -1)));
      carousel.querySelectorAll("[data-carousel-next]").forEach((btn) => btn.addEventListener("click", () => moveCarousel(id, 1)));
      carousel.querySelectorAll("[data-carousel-dot]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const imageIndex = Number(btn.dataset.slideTo);
          if (carousel.dataset.carouselAction === "gallery") {
            const project = projects[Number(carousel.dataset.projectIndex)];
            openGallery(project.images, imageIndex, tx(project.title));
            return;
          }
          showCarousel(id, imageIndex);
        });
      });
      carousel.querySelectorAll("[data-slide]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const project = projects[Number(carousel.dataset.projectIndex)];
          if (carousel.dataset.carouselAction === "gallery") {
            openGallery(project.images, Number(btn.dataset.slide), tx(project.title));
            return;
          }
          openProject(Number(carousel.dataset.projectIndex));
        });
      });
      const viewport = carousel.querySelector(".carousel-viewport");
      let startX = 0;
      let lastX = 0;
      let dragging = false;
      viewport.addEventListener("pointerdown", (event) => {
        dragging = true;
        startX = event.clientX;
        lastX = event.clientX;
      });
      viewport.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        lastX = event.clientX;
      });
      const finishDrag = () => {
        if (!dragging) return;
        const delta = lastX - startX;
        dragging = false;
        if (Math.abs(delta) > 42) {
          moveCarousel(id, delta < 0 ? 1 : -1);
        }
      };
      viewport.addEventListener("pointerup", finishDrag);
      viewport.addEventListener("pointercancel", finishDrag);
      showCarousel(id, Number(carousel.dataset.active || 0));
    });
  };

  const moveCarousel = (id, direction) => {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    if (!carousel) return;
    showCarousel(id, Number(carousel.dataset.active || 0) + direction);
  };

  const showCarousel = (id, index, phase) => {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    if (!carousel) return;
    if (phase) carousel.dataset.phase = phase;
    const activePhase = carousel.dataset.phase || "all";
    const slides = [...carousel.querySelectorAll("[data-slide]")];
    const thumbs = [...carousel.querySelectorAll("[data-carousel-dot]")];
    slides.forEach((slide) => {
      slide.hidden = activePhase !== "all" && slide.dataset.phase !== activePhase;
    });
    thumbs.forEach((thumb) => {
      thumb.hidden = activePhase !== "all" && thumb.dataset.phase !== activePhase;
    });
    const visibleSlides = slides.filter((slide) => !slide.hidden);
    const visibleThumbs = thumbs.filter((thumb) => !thumb.hidden);
    if (!visibleSlides.length) return;
    const active = ((index % visibleSlides.length) + visibleSlides.length) % visibleSlides.length;
    carousel.dataset.active = String(active);
    carousel.querySelector(".carousel-track").style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide) => {
      const isActive = slide === visibleSlides[active];
      slide.classList.toggle("active", isActive);
      slide.tabIndex = isActive ? 0 : -1;
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    thumbs.forEach((thumb) => {
      const isActive = thumb === visibleThumbs[active];
      thumb.classList.toggle("active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });
    const counter = carousel.querySelector("[data-carousel-count]");
    if (counter) counter.textContent = `${active + 1} / ${visibleSlides.length}`;
  };

  const openGallery = (photos, index, title) => {
    state.gallery = photos;
    state.galleryIndex = index;
    document.getElementById("galleryInner").innerHTML = `
      <div class="gallery-layout">
        <div class="gallery-main" id="galleryStage">
          <div class="gallery-viewport" id="galleryViewport">
            <img id="galleryImg" src="" alt="${title}" draggable="false">
          </div>
          <button class="arrow prev" id="prev" type="button" aria-label="${state.lang === "hu" ? "Előző kép" : "Vorheriges Bild"}">‹</button>
          <button class="arrow next" id="next" type="button" aria-label="${state.lang === "hu" ? "Következő kép" : "Nächstes Bild"}">›</button>
          <span class="counter" id="counter" aria-live="polite"></span>
          <div class="gallery-caption" id="galleryCaption"></div>
          <div class="gallery-tools" role="toolbar" aria-label="${state.lang === "hu" ? "Kép nagyítása" : "Bildzoom-Steuerung"}">
            <button type="button" data-gallery-zoom="out" aria-label="${state.lang === "hu" ? "Kicsinyítés" : "Verkleinern"}">−</button>
            <button type="button" class="zoom-level" data-gallery-zoom="reset" aria-label="${state.lang === "hu" ? "Eredeti nagyítás" : "Zoom zurücksetzen"}">100%</button>
            <button type="button" data-gallery-zoom="in" aria-label="${state.lang === "hu" ? "Nagyítás" : "Vergrößern"}">+</button>
          </div>
        </div>
        <aside class="gallery-info">
          <small class="eyebrow">${title}</small>
          <h2 id="galleryModalTitle">${state.lang === "hu" ? "Képes munkafolyamat" : "Visueller Arbeitsablauf"}</h2>
          <p>${state.lang === "hu" ? "Lapozzon a képek között, húzza oldalra mobilon, vagy nagyítsa ki a részleteket. A képek illusztratív példák; a konkrét feladatot mindig a helyszín saját fotói alapján egyeztetjük." : "Blättern Sie mit den Pfeilen, wischen Sie auf dem Handy oder zoomen Sie für Details. Die Bilder sind illustrative Beispiele; der konkrete Umfang wird immer anhand der Fotos der jeweiligen Immobilie festgelegt."}</p>
          <div class="thumb-grid" id="thumbs">${photos.map((p, i) => `<button type="button" data-thumb="${i}" aria-label="${photoCaption(p)}"><img src="${img(p[0], 420)}" alt="" loading="lazy" decoding="async"><span class="thumb-zoom" aria-hidden="true"></span></button>`).join("")}</div>
        </aside>
      </div>`;
    applyPageLanguage();
    const modal = document.getElementById("galleryModal");
    modal.dataset.galleryMode = "gallery";
    modal.setAttribute("aria-labelledby", "galleryModalTitle");
    openModal(modal);
    document.getElementById("prev").addEventListener("click", () => showGallery(state.galleryIndex - 1));
    document.getElementById("next").addEventListener("click", () => showGallery(state.galleryIndex + 1));
    document.querySelectorAll("#thumbs [data-thumb]").forEach((btn) => {
      btn.addEventListener("click", () => showGallery(Number(btn.dataset.thumb)));
    });
    document.querySelectorAll("[data-gallery-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => changeGalleryZoom(btn.dataset.galleryZoom));
    });
    initGalleryInteraction(document.getElementById("galleryViewport"));
    showGallery(index);
  };

  const showGallery = (index) => {
    if (!state.gallery.length) return;
    state.galleryIndex = (index + state.gallery.length) % state.gallery.length;
    const current = state.gallery[state.galleryIndex];
    const [id, phase] = current;
    const galleryImg = document.getElementById("galleryImg");
    const nextSrc = img(id, 2000);
    if (galleryImg.src !== new URL(nextSrc, document.baseURI).href) galleryImg.src = nextSrc;
    galleryImg.alt = photoCaption(current);
    document.getElementById("counter").textContent = `${state.galleryIndex + 1} / ${state.gallery.length} - ${phaseText(phase)}`;
    document.getElementById("galleryCaption").innerHTML = `<b>${phaseText(phase)}</b><span>${photoCaption(current)}</span>`;
    document.querySelectorAll("#thumbs [data-thumb]").forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === state.galleryIndex;
      thumb.classList.toggle("active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });
    resetGalleryView();
    preloadGalleryNeighbors();
  };

  const applyGalleryTransform = () => {
    const image = document.getElementById("galleryImg");
    const viewport = document.getElementById("galleryViewport");
    if (!image || !viewport) return;
    const maxX = Math.max(0, (viewport.clientWidth * (state.galleryZoom - 1)) / 2);
    const maxY = Math.max(0, (viewport.clientHeight * (state.galleryZoom - 1)) / 2);
    state.galleryPanX = Math.max(-maxX, Math.min(maxX, state.galleryPanX));
    state.galleryPanY = Math.max(-maxY, Math.min(maxY, state.galleryPanY));
    image.style.transform = `translate3d(${state.galleryPanX}px, ${state.galleryPanY}px, 0) scale(${state.galleryZoom})`;
    viewport.classList.toggle("is-zoomed", state.galleryZoom > 1);
    const level = document.querySelector(".zoom-level");
    if (level) level.textContent = `${Math.round(state.galleryZoom * 100)}%`;
  };

  const setGalleryZoom = (zoom, originX = 0, originY = 0) => {
    const previous = state.galleryZoom;
    state.galleryZoom = Math.max(1, Math.min(4, Number(zoom)));
    if (state.galleryZoom === 1) {
      state.galleryPanX = 0;
      state.galleryPanY = 0;
    } else if (previous > 0 && previous !== state.galleryZoom) {
      const ratio = state.galleryZoom / previous;
      state.galleryPanX = state.galleryPanX * ratio + originX * (1 - ratio);
      state.galleryPanY = state.galleryPanY * ratio + originY * (1 - ratio);
    }
    applyGalleryTransform();
  };

  const changeGalleryZoom = (action) => {
    if (action === "reset") return setGalleryZoom(1);
    setGalleryZoom(state.galleryZoom + (action === "in" ? 0.5 : -0.5));
  };

  const resetGalleryView = () => {
    state.galleryZoom = 1;
    state.galleryPanX = 0;
    state.galleryPanY = 0;
    applyGalleryTransform();
  };

  const preloadGalleryNeighbors = () => {
    if (state.gallery.length < 2) return;
    [-1, 1].forEach((offset) => {
      const photo = state.gallery[(state.galleryIndex + offset + state.gallery.length) % state.gallery.length];
      const preload = new Image();
      preload.src = img(photo[0], 2000);
    });
  };

  const activeModal = () => [...document.querySelectorAll(".modal.open")].at(-1) || null;

  const openModal = (modal) => {
    const previous = activeModal();
    if (previous && previous !== modal) {
      previous.setAttribute("aria-hidden", "true");
      previous.setAttribute("inert", "");
    }
    modalOpeners.set(modal, document.activeElement);
    modal.classList.add("open");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const panel = modal.querySelector(".panel");
    if (panel) panel.scrollTop = 0;
    requestAnimationFrame(() => modal.querySelector(".close")?.focus());
  };

  const closeModal = (modal) => {
    if (!modal) return;
    const opener = modalOpeners.get(modal);
    modal.classList.remove("open");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "true");
    const previous = activeModal();
    if (previous) {
      previous.removeAttribute("inert");
      previous.setAttribute("aria-hidden", "false");
    } else {
      document.body.classList.remove("modal-open");
    }
    if (opener?.isConnected) requestAnimationFrame(() => opener.focus());
  };

  const trapFocus = (event, modal) => {
    const focusable = [...modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };


  const initGalleryInteraction = (target) => {
    if (!target) return;
    const pointers = new Map();
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let pinchDistance = 0;
    let pinchZoom = 1;
    target.addEventListener("pointerdown", (event) => {
      target.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      startX = event.clientX;
      startY = event.clientY;
      startPanX = state.galleryPanX;
      startPanY = state.galleryPanY;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(b.x - a.x, b.y - a.y);
        pinchZoom = state.galleryZoom;
      }
    });
    target.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (pinchDistance) setGalleryZoom(pinchZoom * (distance / pinchDistance));
        return;
      }
      if (state.galleryZoom > 1) {
        state.galleryPanX = startPanX + event.clientX - startX;
        state.galleryPanY = startPanY + event.clientY - startY;
        applyGalleryTransform();
      }
    });
    const finishPointer = (event) => {
      const point = pointers.has(event.pointerId) ? { x: event.clientX, y: event.clientY } : null;
      pointers.delete(event.pointerId);
      if (!point || pointers.size || state.galleryZoom > 1) return;
      const deltaX = point.x - startX;
      const deltaY = point.y - startY;
      if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        showGallery(state.galleryIndex + (deltaX < 0 ? 1 : -1));
      }
    };
    target.addEventListener("pointerup", finishPointer);
    target.addEventListener("pointercancel", (event) => pointers.delete(event.pointerId));
    target.addEventListener("dblclick", (event) => {
      const rect = target.getBoundingClientRect();
      setGalleryZoom(state.galleryZoom > 1 ? 1 : 2.5, event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    });
    target.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = target.getBoundingClientRect();
      setGalleryZoom(state.galleryZoom + (event.deltaY < 0 ? 0.25 : -0.25), event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    }, { passive: false });
  };
  const syncDisclosure = (detail) => {
    const summary = detail.querySelector("summary");
    const isOpen = detail.open;
    summary?.setAttribute("aria-expanded", String(isOpen));
    summary?.querySelectorAll(".closed-label").forEach((label) => {
      label.hidden = isOpen;
      label.setAttribute("aria-hidden", String(isOpen));
    });
    summary?.querySelectorAll(".open-label").forEach((label) => {
      label.hidden = !isOpen;
      label.setAttribute("aria-hidden", String(!isOpen));
    });
  };
  const bindDisclosure = (detail) => {
    if (detail.dataset.disclosureBound === "true") return;
    detail.dataset.disclosureBound = "true";
    const summary = detail.querySelector("summary");
    syncDisclosure(detail);
    detail.addEventListener("toggle", () => syncDisclosure(detail));
    summary?.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      detail.open = !detail.open;
      syncDisclosure(detail);
    });
  };

  // Project filtering shows/hides the existing static cards by category --
  // it never touches the rest of the page, never re-renders anything, and
  // preserves scroll position, form input, and every unrelated DOM node.
  const applyProjectFilter = (filterValue) => {
    document.querySelectorAll(".project-grid-rich .project-card").forEach((card) => {
      const matches = filterValue === "all" || card.dataset.projectCategory === filterValue;
      card.hidden = !matches;
    });
  };

  const bindHomeInteractions = () => {
    document.querySelectorAll("details.stat, details.problem, details.audience, details.faq").forEach(bindDisclosure);
    document.querySelectorAll("[data-accordion-group]").forEach((group) => {
      group.querySelectorAll("details").forEach((detail) => {
        detail.addEventListener("toggle", () => {
          if (!detail.open) return;
          group.querySelectorAll("details[open]").forEach((other) => {
            if (other !== detail) other.open = false;
          });
        });
      });
    });
    document.querySelectorAll("[data-situation-gallery]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const detail = problemDetails[Number(btn.dataset.situationGallery)];
        const galleryProject = detail ? projects[detail.projectIndex] : null;
        if (!galleryProject) return;
        openGallery(projectLightboxImages(galleryProject), 0, tx(galleryProject.title));
      });
    });
    document.querySelectorAll("[data-project-filter]").forEach((btn) => {
      if (btn.dataset.filterBound === "true") return;
      btn.dataset.filterBound = "true";
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-project-filter]").forEach((other) => other.classList.remove("active"));
        btn.classList.add("active");
        const anchor = btn.closest(".filterbar") || btn;
        const anchorTopBefore = anchor.getBoundingClientRect().top;
        applyProjectFilter(btn.dataset.projectFilter);
        const anchorTopAfter = anchor.getBoundingClientRect().top;
        const shift = anchorTopAfter - anchorTopBefore;
        if (shift !== 0) window.scrollBy({ top: shift, left: 0, behavior: "instant" });
      });
    });
    document.querySelectorAll("[data-service]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = services[Number(btn.dataset.service)];
        openGallery(item.photos, 0, tx(item.title));
      });
    });
    document.querySelectorAll("[data-project]").forEach((btn) => {
      btn.addEventListener("click", () => openProject(Number(btn.dataset.project)));
    });
    document.querySelectorAll("[data-project-gallery]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const project = projects[Number(btn.dataset.projectGallery)];
        openGallery(projectLightboxImages(project), 0, tx(project.title));
      });
    });
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
    });
    document.querySelectorAll("[data-compare]").forEach(initCompare);
    initCarousels(document);

    document.addEventListener("keydown", (event) => {
      const modal = activeModal();
      const comparisonMode = modal?.id === "galleryModal" && modal.dataset.galleryMode === "comparison";
      if (event.key === "Escape" && modal) {
        event.preventDefault();
        closeModal(modal);
      } else if (event.key === "Tab" && modal) {
        trapFocus(event, modal);
      } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "ArrowLeft") {
        showGallery(state.galleryIndex - 1);
      } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "ArrowRight") {
        showGallery(state.galleryIndex + 1);
      } else if (modal?.id === "galleryModal" && !comparisonMode && ["+", "="].includes(event.key)) {
        event.preventDefault();
        changeGalleryZoom("in");
      } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "-") {
        event.preventDefault();
        changeGalleryZoom("out");
      } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "0") {
        event.preventDefault();
        changeGalleryZoom("reset");
      }
    });
  };

  const homepageHashTargets = new Set(["services", "clients", "projects", "media", "contact"]);
  const scrollToInitialHashTarget = () => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!homepageHashTargets.has(id)) return;
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = Math.ceil(document.querySelector(".header")?.getBoundingClientRect().height || 76);
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 18;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  };

  const initHomePage = () => {
    enhanceHeaderNavigation();
    bindLanguageSelectorTriggers();
    bindConversionActionTracking();
    bindQuoteForms();
    bindPhoneActions();
    bindPaintReveal();
    initStandaloneReveals();
    bindHomeInteractions();
    // Hash positioning happens once, against the final DOM, on initial
    // navigation only -- it must not re-fire on project-filter clicks or
    // any other later interaction (that was the old render()-driven bug).
    if (window.location.hash) {
      requestAnimationFrame(() => requestAnimationFrame(scrollToInitialHashTarget));
    }
    window.addEventListener("resize", () => {
      syncHeaderNavigationState();
    }, { passive: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomePage, { once: true });
  } else {
    initHomePage();
  }
})();
