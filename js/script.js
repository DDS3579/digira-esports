// --- Helpers ---
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (e0, e1, v) => {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
};

// Reduced motion preference
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Engine state
let mouseX = 0,
  mouseY = 0,
  tMouseX = 0,
  tMouseY = 0;
let cursorX = 0,
  cursorY = 0,
  cursorTargetX = 0,
  cursorTargetY = 0;
let smoothScroll = 0,
  targetScroll = 0;
let anchors = { ev: 0, ab: 0, pa: 0, co: 0 };
let rafPending = false;
let lastScrollTop = 0;
let scrollDirection = "up";

// DOM references
const sparksCanvas = document.getElementById("sparks");
const mascot = document.querySelector(".mascot");
const secEvents = document.getElementById("events");
const secAbout = document.getElementById("about");
const secPartners = document.getElementById("partners");
const secContact = document.getElementById("contact");
const secHome = document.getElementById("home");
const navLinks = document.querySelectorAll(".site-nav a");
const scrambleEl = document.getElementById("scramble");
const numEls = document.querySelectorAll(".num[data-count]");
const factNumEls = document.querySelectorAll(".fact b[data-count]");
const revEls = document.querySelectorAll(".rev");
const burgerBtn = document.querySelector(".burger");
const drawerEl = document.querySelector(".drawer");
const backdropEl = document.querySelector(".drawer-backdrop");
const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
const cursorArrow = document.querySelector(".cursor-arrow");
const backToTopBtn = document.querySelector(".back-to-top");

// --- Pointer listener ---
window.addEventListener(
  "pointermove",
  (e) => {
    tMouseX = e.clientX / window.innerWidth - 0.5;
    tMouseY = e.clientY / window.innerHeight - 0.5;
    cursorTargetX = e.clientX;
    cursorTargetY = e.clientY;
    requestTick();
  },
  { passive: true },
);

// --- Anchor Calculation ---
function updateAnchors() {
  if (secEvents) anchors.ev = secEvents.offsetTop;
  if (secAbout) anchors.ab = secAbout.offsetTop;
  if (secPartners) anchors.pa = secPartners.offsetTop;
  if (secContact) anchors.co = secContact.offsetTop;
}

// --- Header Hide/Show on Scroll ---
function updateHeader() {
  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScrollTop && currentScroll > 100) {
    // Scrolling down
    siteHeader.classList.add("hidden");
    scrollDirection = "down";
  } else {
    // Scrolling up
    siteHeader.classList.remove("hidden");
    scrollDirection = "up";
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

// --- Scroll Progress Bar ---
function updateScrollProgress() {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  scrollProgress.style.width = scrolled + "%";
}

// --- Back to Top Button ---
function updateBackToTop() {
  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > 400) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
}

// --- Mascot Scroll Rig Keyframes & Interpolation ---
function getMascotState(sScroll) {
  const vh = window.innerHeight;
  const t1 = ss(anchors.ev - vh * 0.75, anchors.ev - vh * 0.15, sScroll);
  const t2 = ss(anchors.ab - vh * 0.75, anchors.ab - vh * 0.15, sScroll);
  const t3 = ss(anchors.pa - vh * 0.75, anchors.pa - vh * 0.15, sScroll);
  const t4 = ss(anchors.co - vh * 0.75, anchors.co - vh * 0.15, sScroll);

  const P0 = { x: 24, y: 2, scale: 1, flip: 1, hue: 0, glow: 0.5, op: 1 };
  const P1 = {
    x: -30,
    y: 0,
    scale: 0.72,
    flip: -1,
    hue: 35,
    glow: 0.6,
    op: 0.9,
  };
  const P2 = {
    x: 0,
    y: 0,
    scale: 1.22,
    flip: -1,
    hue: 80,
    glow: 0.35,
    op: 0.3,
  };
  const P3 = { x: 28, y: 2, scale: 0.8, flip: 1, hue: 50, glow: 0.6, op: 0.9 };
  const P4 = { x: 12, y: 4, scale: 0.95, flip: 1, hue: 0, glow: 0.7, op: 1 };

  let curr = { ...P0 };

  // Step 0 -> 1
  curr.x = lerp(P0.x, P1.x, t1);
  curr.y = lerp(P0.y, P1.y, t1);
  curr.scale = lerp(P0.scale, P1.scale, t1);
  curr.flip = lerp(P0.flip, P1.flip, t1);
  curr.hue = lerp(P0.hue, P1.hue, t1);
  curr.glow = lerp(P0.glow, P1.glow, t1);
  curr.op = lerp(P0.op, P1.op, t1);

  // Step 1 -> 2
  curr.x = lerp(curr.x, P2.x, t2);
  curr.y = lerp(curr.y, P2.y, t2);
  curr.scale = lerp(curr.scale, P2.scale, t2);
  curr.flip = lerp(curr.flip, P2.flip, t2);
  curr.hue = lerp(curr.hue, P2.hue, t2);
  curr.glow = lerp(curr.glow, P2.glow, t2);
  curr.op = lerp(curr.op, P2.op, t2);

  // Step 2 -> 3
  curr.x = lerp(curr.x, P3.x, t3);
  curr.y = lerp(curr.y, P3.y, t3);
  curr.scale = lerp(curr.scale, P3.scale, t3);
  curr.flip = lerp(curr.flip, P3.flip, t3);
  curr.hue = lerp(curr.hue, P3.hue, t3);
  curr.glow = lerp(curr.glow, P3.glow, t3);
  curr.op = lerp(curr.op, P3.op, t3);

  // Step 3 -> 4
  curr.x = lerp(curr.x, P4.x, t4);
  curr.y = lerp(curr.y, P4.y, t4);
  curr.scale = lerp(curr.scale, P4.scale, t4);
  curr.flip = lerp(curr.flip, P4.flip, t4);
  curr.hue = lerp(curr.hue, P4.hue, t4);
  curr.glow = lerp(curr.glow, P4.glow, t4);
  curr.op = lerp(curr.op, P4.op, t4);

  return curr;
}

// --- Frame Render Loop ---
function requestTick() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(updateFrame);
  }
}

function updateFrame() {
  rafPending = false;

  targetScroll = window.scrollY || window.pageYOffset;
  if (reduce) {
    smoothScroll = targetScroll;
  } else {
    smoothScroll = lerp(smoothScroll, targetScroll, 0.12);
    if (Math.abs(smoothScroll - targetScroll) < 0.08) {
      smoothScroll = targetScroll;
    }
  }

  mouseX = lerp(mouseX, tMouseX, 0.1);
  mouseY = lerp(mouseY, tMouseY, 0.1);

  cursorX = lerp(cursorX, cursorTargetX, 0.15);
  cursorY = lerp(cursorY, cursorTargetY, 0.15);

  // Update custom cursor
  if (cursorArrow) {
    cursorArrow.style.left = cursorTargetX + "px";
    cursorArrow.style.top = cursorTargetY + "px";
  }

  const root = document.documentElement;
  const mxVal = reduce ? 0 : mouseX.toFixed(4);
  const myVal = reduce ? 0 : mouseY.toFixed(4);

  root.style.setProperty("--mx", mxVal);
  root.style.setProperty("--my", myVal);

  const mState = getMascotState(smoothScroll);
  root.style.setProperty("--m-x", mState.x.toFixed(2) + "vw");
  root.style.setProperty("--m-y", mState.y.toFixed(2) + "vh");
  root.style.setProperty("--m-scale", mState.scale.toFixed(3));
  root.style.setProperty("--m-flip", mState.flip.toFixed(3));
  root.style.setProperty("--m-hue", mState.hue.toFixed(1) + "deg");
  root.style.setProperty("--m-glow", mState.glow.toFixed(3));
  root.style.setProperty("--m-op", mState.op.toFixed(3));

  // Update header visibility
  updateHeader();

  // Update scroll progress
  updateScrollProgress();

  // Update back-to-top button
  updateBackToTop();

  if (
    Math.abs(smoothScroll - targetScroll) >= 0.08 ||
    Math.abs(mouseX - tMouseX) >= 0.001 ||
    Math.abs(mouseY - tMouseY) >= 0.001
  ) {
    requestTick();
  }
}

// --- Scramble Decode Animation ---
function initScramble() {
  if (!scrambleEl) return;
  const targetText = "UPCOMING EVENTS";
  if (reduce) {
    scrambleEl.textContent = targetText;
    return;
  }
  const charset = "█▓▒░<>/#10";
  const duration = 900;
  let startTime = null;

  setTimeout(() => {
    function animateScramble(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration);
      const revealedCount = Math.floor(progress * targetText.length);

      let result = "";
      for (let i = 0; i < targetText.length; i++) {
        if (i < revealedCount) {
          result += targetText[i];
        } else if (targetText[i] === " ") {
          result += " ";
        } else {
          result += charset[Math.floor(Math.random() * charset.length)];
        }
      }
      scrambleEl.textContent = result;
      if (progress < 1) {
        requestAnimationFrame(animateScramble);
      } else {
        scrambleEl.textContent = targetText;
      }
    }
    requestAnimationFrame(animateScramble);
  }, 200);
}

// --- Stats Count-Up Animation ---
function initCountUp() {
  if (!numEls.length) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10);
          const duration = 1400;
          let startTime = null;

          function animateCount(now) {
            if (!startTime) startTime = now;
            const progress = clamp((now - startTime) / duration);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const val = Math.floor(easeProgress * target);

            if (
              el.childNodes.length > 0 &&
              el.childNodes[0].nodeType === Node.TEXT_NODE
            ) {
              el.childNodes[0].nodeValue = val;
            } else {
              el.textContent = val;
            }

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              if (
                el.childNodes.length > 0 &&
                el.childNodes[0].nodeType === Node.TEXT_NODE
              ) {
                el.childNodes[0].nodeValue = target;
              }
            }
          }

          requestAnimationFrame(animateCount);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.4 },
  );

  numEls.forEach((el) => observer.observe(el));
}

// --- About Facts Count-Up Animation ---
function initFactsCountUp() {
  if (!factNumEls.length) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10);
          const suffix = el.textContent.includes("+") ? "+" : "";
          const duration = 1600;
          let startTime = null;

          function animateFactCount(now) {
            if (!startTime) startTime = now;
            const progress = clamp((now - startTime) / duration);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const val = Math.floor(easeProgress * target);

            el.textContent = val + suffix;

            if (progress < 1) {
              requestAnimationFrame(animateFactCount);
            } else {
              el.textContent = target + suffix;
            }
          }

          requestAnimationFrame(animateFactCount);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.4 },
  );

  factNumEls.forEach((el) => observer.observe(el));
}

// --- Reveal Intersection Observer ---
function initReveal() {
  if (!revEls.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
        }
      });
    },
    { threshold: 0.15 },
  );

  revEls.forEach((el) => observer.observe(el));

  document.querySelectorAll(".event-row").forEach((row, i) => {
    row.style.setProperty("--rd", `${i * 90}ms`);
  });
  document.querySelectorAll(".partner").forEach((chip, i) => {
    chip.style.setProperty("--rd", `${i * 90}ms`);
  });
  document
    .querySelectorAll(
      ".about-copy p, .about-facts, .about-title, .sec-eyebrow, .contact-copy, .contact-ctas, .socials",
    )
    .forEach((el, i) => {
      el.style.setProperty("--rd", `${i * 100}ms`);
    });
}

// --- Active Nav Highlight Observer ---
function initActiveNav() {
  const sections = [
    secHome,
    secEvents,
    secAbout,
    secPartners,
    secContact,
  ].filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("is-active");
            } else {
              link.classList.remove("is-active");
            }
          });
          // Update drawer nav as well
          drawerEl.querySelectorAll("nav a").forEach((drawerLink) => {
            if (drawerLink.getAttribute("href") === `#${id}`) {
              drawerLink.style.color = "var(--neon-blue)";
            } else {
              drawerLink.style.color = "";
            }
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  sections.forEach((sec) => observer.observe(sec));
}

// --- Mobile Drawer ---
function initDrawer() {
  if (!burgerBtn || !drawerEl || !backdropEl) return;
  function toggleDrawer(open) {
    const isOpen =
      open !== undefined ? open : !drawerEl.classList.contains("open");
    drawerEl.classList.toggle("open", isOpen);
    backdropEl.classList.toggle("open", isOpen);
    burgerBtn.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  burgerBtn.addEventListener("click", () => toggleDrawer());
  backdropEl.addEventListener("click", () => toggleDrawer(false));

  const drawerCloseBtn = drawerEl.querySelector(".drawer-close");
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", () => toggleDrawer(false));
  }

  drawerEl.querySelectorAll("a").forEach((a, i) => {
    a.style.setProperty("--rd", `${i * 70}ms`);
    a.addEventListener("click", () => toggleDrawer(false));
  });

  // Drawer CTA button
  const drawerCta = drawerEl.querySelector(".drawer-cta");
  if (drawerCta) {
    drawerCta.addEventListener("click", () => toggleDrawer(false));
  }
}

// --- Sparks Particle Canvas ---
function initSparks() {
  if (!sparksCanvas || reduce) return;
  const ctx = sparksCanvas.getContext("2d");
  let width = 0,
    height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    sparksCanvas.width = width * dpr;
    sparksCanvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const particles = [];
  const N = 70;
  const colors = ["#00c8ff", "#9b3dff"];

  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.2,
      vy: -(0.15 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.2,
      tw: Math.random() * Math.PI * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      isFlare: Math.random() < 0.05, // 5% chance to be a flare
    });
  }

  function renderSparks(time) {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      // Mouse attraction effect
      const dx = cursorTargetX - p.x;
      const dy = cursorTargetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = ((150 - dist) / 150) * 0.02;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const alpha = p.isFlare
        ? 0.5 + 0.5 * Math.sin(time / 300 + p.tw)
        : 0.3 + (0.4 * (Math.sin(time / 700 + p.tw) + 1)) / 2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.isFlare ? p.r * 2 : p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.c;
      ctx.shadowBlur = p.isFlare ? 12 : 6;
      ctx.fill();

      // Reset flares occasionally
      if (p.isFlare && alpha < 0.1) {
        p.isFlare = false;
        if (Math.random() < 0.02) {
          p.isFlare = true;
        }
      } else if (!p.isFlare && Math.random() < 0.001) {
        p.isFlare = true;
      }
    });

    requestAnimationFrame(renderSparks);
  }

  requestAnimationFrame(renderSparks);
}

// --- Mascot Hover Reveal Effect ---
function initMascotReveal() {
  const wrap = document.getElementById("mascotRevealWrap");
  const canvas = document.getElementById("mascotOverlayCanvas");
  const baseImg = document.getElementById("mascotBase");
  const overlayImg = document.getElementById("mascotOverlaySrc");

  if (!wrap || !canvas || !baseImg || !overlayImg) return;

  const ctx = canvas.getContext("2d");
  let isHovering = false;
  let cursorX = 0,
    cursorY = 0;
  let smoothX = 0,
    smoothY = 0;
  let revealRAF = null;
  const RADIUS = 120; // px reveal radius

  // Wait for overlay image to load
  function ensureOverlayLoaded(cb) {
    if (overlayImg.complete && overlayImg.naturalWidth > 0) {
      cb();
    } else {
      overlayImg.onload = cb;
    }
  }

  function resizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderReveal() {
    if (!isHovering) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      revealRAF = null;
      return;
    }

    // Smooth cursor interpolation
    smoothX = lerp(smoothX, cursorX, 0.25);
    smoothY = lerp(smoothY, cursorY, 0.25);

    const rect = wrap.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Draw the overlay image full-size first
    ctx.drawImage(overlayImg, 0, 0, w, h);

    // Use compositing to clip to a circle around the cursor
    ctx.globalCompositeOperation = "destination-in";

    // Create a soft radial gradient for a smooth reveal edge
    const gradient = ctx.createRadialGradient(
      smoothX,
      smoothY,
      0,
      smoothX,
      smoothY,
      RADIUS,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(smoothX, smoothY, RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    revealRAF = requestAnimationFrame(renderReveal);
  }

  function onPointerMove(e) {
    const rect = wrap.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;

    if (!isHovering) {
      isHovering = true;
      smoothX = cursorX;
      smoothY = cursorY;
      resizeCanvas();
      if (!revealRAF) {
        revealRAF = requestAnimationFrame(renderReveal);
      }
    }
  }

  function onPointerLeave() {
    isHovering = false;
    // The renderReveal loop will clear and stop on next frame
  }

  // Only activate on desktop-size screens
  function checkAndBind() {
    if (window.innerWidth > 1100 && !reduce) {
      wrap.addEventListener("pointermove", onPointerMove);
      wrap.addEventListener("pointerleave", onPointerLeave);
    } else {
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      isHovering = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  ensureOverlayLoaded(() => {
    resizeCanvas();
    checkAndBind();
    window.addEventListener(
      "resize",
      () => {
        resizeCanvas();
        checkAndBind();
      },
      { passive: true },
    );
  });
}

// --- Custom Cursor Hover Effects ---
function initCursorHoverEffects() {
  const hoverables = document.querySelectorAll(
    "a, button, .btn, .partner, .soc",
  );
  const customCursor = document.querySelector(".custom-cursor");

  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      customCursor.classList.add("hovering");
    });
    el.addEventListener("mouseleave", () => {
      customCursor.classList.remove("hovering");
    });
  });
}

// --- Back to Top Button ---
function initBackToTop() {
  if (!backToTopBtn) return;
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// --- Partner Magnetic Tilt ---
function initPartnerTilt() {
  const partners = document.querySelectorAll(".partner");

  partners.forEach((partner) => {
    partner.addEventListener("mousemove", (e) => {
      const rect = partner.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      partner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    partner.addEventListener("mouseleave", () => {
      partner.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
  });
}

// --- Global Init ---
window.addEventListener(
  "scroll",
  () => {
    requestTick();
  },
  { passive: true },
);

window.addEventListener(
  "resize",
  () => {
    updateAnchors();
    requestTick();
  },
  { passive: true },
);

// --- Team Card Mouse Spotlight ---
function initTeamSpotlight() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--cx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--cy', (e.clientY - rect.top) + 'px');
    });
  });
}

// --- FAQ Accordion (Intel Dossier) ---
function initFAQ() {
  const cards = document.querySelectorAll('.faq-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    const content = card.querySelector('.faq-content');
    const status = card.querySelector('.faq-status');

    trigger.addEventListener('click', () => {
      const isOpen = card.classList.contains('is-open');

      // Strict Accordion: Close all other open cards first
      cards.forEach(c => {
        if (c !== card && c.classList.contains('is-open')) {
          c.classList.remove('is-open');
          c.querySelector('.faq-content').style.maxHeight = null;
          c.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          const s = c.querySelector('.faq-status');
          if (s) s.textContent = 'CLASSIFIED';
        }
      });

      // Toggle current card
      if (isOpen) {
        card.classList.remove('is-open');
        content.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
        if (status) status.textContent = 'CLASSIFIED';
      } else {
        card.classList.add('is-open');
        // Calculate exact height for smooth animation
        content.style.maxHeight = content.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
        if (status) status.textContent = 'DECLASSIFIED';
      }
    });
  });
}

// --- Event Detail Modal ---
function initEventModal() {
  const modal = document.getElementById('eventModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.em-close');
  const backdrop = modal.querySelector('.em-backdrop');
  const rows = document.querySelectorAll('.event-row');

  // DOM refs inside modal
  const $title = modal.querySelector('#modalTitle');
  const $prize = modal.querySelector('#modalPrize');
  const $date = modal.querySelector('#modalDate');
  const $location = modal.querySelector('#modalLocation');
  const $format = modal.querySelector('#modalFormat');
  const $entry = modal.querySelector('#modalEntry');
  const $description = modal.querySelector('#modalDescription');
  const $schedule = modal.querySelector('#modalSchedule');
  const $teams = modal.querySelector('#modalTeams');
  const $status = modal.querySelector('.em-status');
  const $fileId = modal.querySelector('.em-file-id');
  const $cta = modal.querySelector('#modalCta');
  const $ctaLabel = modal.querySelector('.em-btn-label');

  function openModal(row) {
  const data = row.dataset;

  // Populate
  $title.textContent = data.title;
  $prize.textContent = data.prize;
  $date.textContent = data.date;
  $location.textContent = data.location;
  $format.textContent = data.format;
  $entry.textContent = data.entry;
  $description.textContent = data.description;
  $status.textContent = data.statusText;
  $status.dataset.status = data.status;
  $fileId.textContent = data.file;
  $ctaLabel.textContent = data.ctaText || 'REGISTER NOW';
  
  $cta.href = data.formLink || '#contact';
  $cta.target = data.status === 'ended' ? '_blank' : '_blank';
  $cta.rel = 'noopener noreferrer';

  // Build schedule (handle "TBD" gracefully)
  $schedule.innerHTML = '';
  if (data.schedule && data.schedule.trim().toLowerCase() !== 'tbd') {
    data.schedule.split('|').forEach(part => {
      const item = document.createElement('div');
      item.className = 'em-schedule-item';
      item.textContent = part.trim();
      $schedule.appendChild(item);
    });
  } else {
    const item = document.createElement('div');
    item.className = 'em-schedule-item';
    item.textContent = 'Schedule to be announced';
    item.style.opacity = '0.6';
    item.style.fontStyle = 'italic';
    $schedule.appendChild(item);
  }

  // Build teams (handle "TBD" gracefully)
  $teams.innerHTML = '';
  if (data.teams && data.teams.trim().toLowerCase() !== 'tbd') {
    data.teams.split('|').forEach(team => {
      const el = document.createElement('div');
      el.className = 'em-team';
      el.textContent = team.trim();
      $teams.appendChild(el);
    });
  } else {
    const el = document.createElement('div');
    el.className = 'em-team';
    el.textContent = 'Teams to be announced';
    el.style.opacity = '0.6';
    el.style.fontStyle = 'italic';
    el.style.gridColumn = '1 / -1';
    $teams.appendChild(el);
  }

  // Show
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
}

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  // Attach click to each event row (excluding the go-link)
  rows.forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't open if they clicked the external CTA
      if (e.target.closest('a[href^="#contact"]') || e.target.closest('a[href^="http"]')) {
        return;
      }
      openModal(row);
    });
    row.style.cursor = 'pointer';
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateAnchors();
  initScramble();
  initCountUp();
  initFactsCountUp();
  initReveal();
  initActiveNav();
  initDrawer();
  initSparks();
  initMascotReveal();
  initCursorHoverEffects();
  initBackToTop();
  initPartnerTilt();
  requestTick();
  initTeamSpotlight();
  initFAQ();         
  initEventModal();
  requestTick();
});
