const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const body = document.body;
const viewer = $(".product-viewer");
const viewerObject = $(".viewer-object");
const drawer = $(".detail-cart");
const overlay = $(".drawer-overlay");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let selectedSize = "42";
let dragStart = 0;
let rotation = 0;
let dragging = false;
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let smoothX = pointerX;
let smoothY = pointerY;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;

  if (dragging) {
    rotation = Math.max(-26, Math.min(26, (event.clientX - dragStart) * .09));
  }
}, { passive: true });

function renderMotion() {
  smoothX += (pointerX - smoothX) * .08;
  smoothY += (pointerY - smoothY) * .08;

  const glow = $(".cursor-glow");
  if (glow) {
    glow.style.transform = `translate3d(${smoothX - 190}px, ${smoothY - 190}px, 0)`;
  }

  if (viewerObject && !reducedMotion) {
    const rect = viewer.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const pointerTilt = ((smoothY / window.innerHeight) - .5) * -5;
      const pointerTurn = dragging ? rotation : ((smoothX / window.innerWidth) - .5) * 8;
      viewerObject.style.transform = `rotateX(${pointerTilt}deg) rotateY(${pointerTurn}deg) translateZ(24px)`;
    }
  }

  requestAnimationFrame(renderMotion);
}

if (!reducedMotion) requestAnimationFrame(renderMotion);

viewer.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  dragging = true;
  dragStart = event.clientX - rotation / .09;
  viewer.classList.add("is-dragging");
  viewer.setPointerCapture?.(event.pointerId);
});

viewer.addEventListener("pointerup", () => {
  dragging = false;
  viewer.classList.remove("is-dragging");
});

viewer.addEventListener("pointercancel", () => {
  dragging = false;
  viewer.classList.remove("is-dragging");
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .13 });

$$(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
  revealObserver.observe(element);
});

$$(".size-button").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".size-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    selectedSize = button.dataset.size;
  });
});

function openDrawer() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  body.classList.add("drawer-open");
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  body.classList.remove("drawer-open");
}

$$("[data-detail-add]").forEach((button) => {
  button.addEventListener("click", () => {
    $(".selected-size").textContent = `EU ${selectedSize}`;
    $(".detail-bag-count").textContent = "1";
    openDrawer();
  });
});

$(".detail-bag-button").addEventListener("click", openDrawer);
$(".detail-cart-close").addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);

$$(".accordion-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".accordion-item");
    const panel = $(".accordion-panel", item);
    const open = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(open));
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0";
  });
});

$$(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .12;
    const y = (event.clientY - rect.top - rect.height / 2) * .12;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  button.addEventListener("pointerleave", () => button.style.transform = "");
});

let lastScroll = 0;
const header = $(".site-header");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (y > 120) {
    header.classList.add("is-fixed");
    header.classList.toggle("is-hidden", y > lastScroll && y > 450);
  } else {
    header.classList.remove("is-fixed", "is-hidden");
  }
  lastScroll = Math.max(y, 0);
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});
