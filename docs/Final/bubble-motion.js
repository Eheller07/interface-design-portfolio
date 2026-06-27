(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  const ASSET_ROOT = "../assets/portfolio-ocean/bubbles/v1";
  const microBubbles = Array.from({ length: 25 }, (_, index) =>
    `${ASSET_ROOT}/micro/micro-bubble-${String(index + 1).padStart(2, "0")}.png`
  );
  const plumeBubbles = Array.from({ length: 6 }, (_, index) =>
    `${ASSET_ROOT}/plumes/plume-${String(index + 1).padStart(2, "0")}.png`
  );
  const largeBubbles = Array.from({ length: 16 }, (_, index) =>
    `${ASSET_ROOT}/individual/bubble-${String(index + 1).padStart(2, "0")}.png`
  );

  const layer = document.createElement("div");
  layer.className = "bubble-camera-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  const isHome = Boolean(document.querySelector(".ocean-site"));
  const active = new Set();
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const maxActive = () => {
    if (window.innerWidth < 560) return 34;
    return isHome ? 82 : 62;
  };

  let lastY = window.scrollY;
  let lastT = performance.now();
  let velocity = 0;
  let direction = 1;
  let particleBudget = 0;
  let plumeBudget = 0;
  let running = true;
  let lastBurstAt = 0;

  const removeLater = (node) => {
    active.add(node);
    node.addEventListener("animationend", () => {
      active.delete(node);
      node.remove();
    }, { once: true });
  };

  const setVars = (node, vars) => {
    Object.entries(vars).forEach(([name, value]) => {
      node.style.setProperty(name, value);
    });
  };

  const makeAsset = (className, src, alt = "") => {
    const node = document.createElement("span");
    node.className = className;
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.decoding = "async";
    node.append(img);
    return node;
  };

  const spawnParticle = (forcedLarge = false) => {
    if (active.size >= maxActive()) return;

    const useLarge = forcedLarge || Math.random() < 0.065;
    const node = makeAsset(
      `bubble-particle ${useLarge ? "bubble-large" : "bubble-micro"}`,
      pick(useLarge ? largeBubbles : microBubbles)
    );

    const mobile = window.innerWidth < 560;
    const size = useLarge
      ? rand(mobile ? 22 : 28, mobile ? 46 : 68)
      : rand(mobile ? 6 : 8, mobile ? 18 : 26);
    const scrollBias = direction * rand(8, 46);
    const drift = rand(-34, 34) + scrollBias;
    const alpha = useLarge ? rand(.16, .32) : rand(.18, .48);

    setVars(node, {
      "--x": `${rand(-4, 101)}vw`,
      "--bottom": `${rand(-11, -4)}vh`,
      "--size": `${size}px`,
      "--duration": `${useLarge ? rand(9.5, 16) : rand(5.4, 13.2)}s`,
      "--delay": `${rand(-.45, .1)}s`,
      "--rise": `${useLarge ? rand(42, 94) : rand(24, 78)}vh`,
      "--drift": `${drift}px`,
      "--sway": `${rand(3, useLarge ? 18 : 12)}px`,
      "--sway-time": `${rand(3.2, 7.5)}s`,
      "--alpha": alpha.toFixed(2),
      "--start-scale": `${rand(.66, .96).toFixed(2)}`,
      "--end-scale": `${rand(.96, 1.18).toFixed(2)}`,
      "--glow": `${useLarge ? rand(6, 14) : rand(3, 8)}px`
    });

    layer.append(node);
    removeLater(node);
  };

  const spawnPlume = () => {
    if (active.size >= maxActive() - 4) return;

    const node = makeAsset("bubble-plume", pick(plumeBubbles));
    const mobile = window.innerWidth < 560;
    setVars(node, {
      "--x": `${rand(-8, 96)}vw`,
      "--size": `${rand(mobile ? 58 : 86, mobile ? 104 : 164)}px`,
      "--duration": `${rand(8.5, 15.5)}s`,
      "--delay": `${rand(-.2, .15)}s`,
      "--rise": `${rand(28, 56)}vh`,
      "--drift": `${direction * rand(14, 54) + rand(-20, 20)}px`,
      "--sway": `${rand(5, 18)}px`,
      "--sway-time": `${rand(5.5, 9)}s`,
      "--alpha": `${rand(.16, .32).toFixed(2)}`,
      "--start-scale": `${rand(.82, 1).toFixed(2)}`,
      "--end-scale": `${rand(.98, 1.08).toFixed(2)}`
    });

    layer.append(node);
    removeLater(node);
  };

  const seed = () => {
    const count = window.innerWidth < 560 ? 5 : 9;
    for (let index = 0; index < count; index += 1) {
      window.setTimeout(() => spawnParticle(index === 0 && !isHome), index * 180);
    }
    window.setTimeout(spawnPlume, 480);
  };

  const tick = (now) => {
    if (!running) return;

    const dt = Math.min(.08, (now - lastT) / 1000);
    const currentY = window.scrollY;
    const dy = currentY - lastY;
    if (dy !== 0) direction = dy > 0 ? 1 : -1;
    velocity = velocity * .84 + Math.min(90, Math.abs(dy)) * .16;
    lastY = currentY;
    lastT = now;

    const baseRate = isHome ? .42 : .28;
    const scrollRate = Math.min(isHome ? 6.2 : 4.4, velocity * .095);
    particleBudget += dt * (baseRate + scrollRate);
    plumeBudget += dt * (.055 + Math.min(.42, velocity * .0055));

    while (particleBudget >= 1) {
      spawnParticle();
      particleBudget -= 1;
    }

    if (plumeBudget >= 1) {
      spawnPlume();
      plumeBudget = 0;
    }

    requestAnimationFrame(tick);
  };

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      lastT = performance.now();
      requestAnimationFrame(tick);
    }
  });

  window.addEventListener("scroll", () => {
    const now = performance.now();
    if (now - lastBurstAt < 130 || active.size >= maxActive() - 3) return;
    lastBurstAt = now;
    spawnParticle();
    if (Math.random() < .38) spawnParticle();
    if (Math.random() < .16) spawnPlume();
  }, { passive: true });

  seed();
  requestAnimationFrame(tick);
})();
