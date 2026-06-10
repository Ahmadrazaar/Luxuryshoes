const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const state = {
  cart: [],
  storyIndex: 0,
  productSlide: 0,
  lastScroll: 0
};

const header = $("#siteHeader");
const hero = $(".hero");
const heroProduct = $("#heroProduct");
const cursorGlow = $(".cursor-glow");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keep motion tied to a single animation frame for smooth pointer tracking.
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let currentX = pointerX;
let currentY = pointerY;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
}, { passive: true });

function animatePointer() {
  currentX += (pointerX - currentX) * 0.08;
  currentY += (pointerY - currentY) * 0.08;

  if (cursorGlow) {
    cursorGlow.style.transform = `translate3d(${currentX - 190}px, ${currentY - 190}px, 0)`;
  }

  if (heroProduct && !reducedMotion && window.innerWidth > 720) {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 0) {
      const rotateY = ((currentX / window.innerWidth) - 0.5) * 9;
      const rotateX = ((currentY / window.innerHeight) - 0.5) * -5;
      heroProduct.style.transform = `translateY(-43%) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  }

  requestAnimationFrame(animatePointer);
}

if (!reducedMotion) {
  requestAnimationFrame(animatePointer);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14 });

$$(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const start = performance.now();
    const duration = 1400;

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
    countObserver.unobserve(element);
  });
}, { threshold: 0.6 });

$$("[data-count]").forEach((element) => countObserver.observe(element));

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  if (scrollY > 140) {
    header.classList.add("is-fixed");
    header.classList.toggle("is-hidden", scrollY > state.lastScroll && scrollY > 500);
  } else {
    header.classList.remove("is-fixed", "is-hidden");
  }

  state.lastScroll = Math.max(scrollY, 0);
  updateStory();

  if (heroProduct && !reducedMotion && window.innerWidth <= 720) {
    heroProduct.style.transform = `translateY(calc(-43% + ${scrollY * 0.08}px))`;
  }
}, { passive: true });

function updateStory() {
  const story = $(".story");
  if (!story) return;
  const rect = story.getBoundingClientRect();
  const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
  const nextIndex = Math.min(2, Math.floor(progress * 3));

  if (nextIndex === state.storyIndex) return;
  state.storyIndex = nextIndex;

  $$(".chapter").forEach((chapter, index) => {
    chapter.classList.toggle("is-active", index === nextIndex);
  });

  $$(".story-image").forEach((image, index) => {
    image.classList.toggle("is-active", index === nextIndex);
  });

  const labels = [
    ["01", "Obsidian Oxblood"],
    ["02", "Pearl Champagne"],
    ["03", "Midnight Copper"]
  ];
  $("#stageNumber").textContent = labels[nextIndex][0];
  $("#stageName").textContent = labels[nextIndex][1];
}

$$(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion || window.innerWidth < 800) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

$$(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

$(".announcement-close").addEventListener("click", () => {
  $(".announcement").remove();
  if (!header.classList.contains("is-fixed")) header.style.top = "0";
});

const menuButton = $(".menu-button");
const desktopNav = $(".desktop-nav");

menuButton.addEventListener("click", () => {
  const open = desktopNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("modal-open", open);
});

$$(".desktop-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    desktopNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
  });
});

const cartDrawer = $(".cart-drawer");
const drawerOverlay = $(".drawer-overlay");
const cartItems = $(".cart-items");

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  drawerOverlay.hidden = false;
  document.body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  drawerOverlay.hidden = true;
  document.body.classList.remove("drawer-open");
}

$(".bag-button").addEventListener("click", openCart);
$(".cart-close").addEventListener("click", closeCart);
drawerOverlay.addEventListener("click", closeCart);
$(".close-and-shop").addEventListener("click", closeCart);

function renderCart() {
  const count = state.cart.length;
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);

  $(".bag-count").textContent = count;
  $(".drawer-count").textContent = `(${count})`;
  $(".cart-total").textContent = `$${total}`;
  $(".checkout-button").disabled = count === 0;

  if (!count) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Your bag is currently empty.</p>
        <a href="#collection" class="text-link close-and-shop">Explore the collection &rarr;</a>
      </div>
    `;
    $(".close-and-shop").addEventListener("click", closeCart);
    return;
  }

  cartItems.innerHTML = state.cart.map((item, index) => `
    <article class="cart-item">
      <div class="cart-item-image"><img src="${item.image}" alt=""></div>
      <div>
        <h3>${item.name}</h3>
        <p>Size EU 42 / Qty 1</p>
        <button class="remove-item" data-remove="${index}">Remove</button>
      </div>
      <strong>$${item.price}</strong>
    </article>
  `).join("");

  $$("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      state.cart.splice(Number(button.dataset.remove), 1);
      renderCart();
    });
  });
}

$$("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    state.cart.push({
      name: card.dataset.product,
      price: Number(card.dataset.price),
      image: card.dataset.image
    });
    renderCart();
    showToast(`${card.dataset.product} added to your bag.`);
    button.innerHTML = "Added <span>&#10003;</span>";
    window.setTimeout(() => {
      button.innerHTML = "Add to bag <span>+</span>";
    }, 1500);
  });
});

function showToast(message) {
  const toast = $(".toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

$$(".wishlist").forEach((button) => {
  button.addEventListener("click", () => {
    const active = button.classList.toggle("is-active");
    button.innerHTML = active ? "&#9829;" : "&#9825;";
    showToast(active ? "Saved to your wishlist." : "Removed from your wishlist.");
  });
});

$$(".swatches").forEach((group) => {
  $$("button", group).forEach((swatch) => {
    swatch.addEventListener("click", () => {
      $$("button", group).forEach((item) => item.classList.remove("is-active"));
      swatch.classList.add("is-active");
    });
  });
});

const productTrack = $(".product-track");

function updateProductSlider() {
  if (window.innerWidth > 1000) {
    productTrack.style.transform = "";
    return;
  }
  const card = $(".product-card");
  const gap = 16;
  const max = $$(".product-card").length - 1;
  state.productSlide = Math.max(0, Math.min(state.productSlide, max));
  productTrack.style.transform = `translateX(-${state.productSlide * (card.offsetWidth + gap)}px)`;
}

$(".product-next").addEventListener("click", () => {
  state.productSlide += 1;
  updateProductSlider();
});

$(".product-prev").addEventListener("click", () => {
  state.productSlide -= 1;
  updateProductSlider();
});

window.addEventListener("resize", updateProductSlider);

const filmModal = $(".film-modal");

$(".play-film").addEventListener("click", () => {
  filmModal.classList.add("is-open");
  filmModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});

function closeFilm() {
  filmModal.classList.remove("is-open");
  filmModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

$(".film-close").addEventListener("click", closeFilm);
filmModal.addEventListener("click", (event) => {
  if (event.target === filmModal) closeFilm();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeCart();
  closeFilm();
  desktopNav.classList.remove("is-open");
  document.body.classList.remove("modal-open");
});

$(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#email");
  showToast(`Welcome to the private list, ${input.value}.`);
  input.value = "";
});

$(".checkout-button").addEventListener("click", () => {
  showToast("Checkout is ready for commerce integration.");
});

$(".search-button").addEventListener("click", () => {
  showToast("Search is ready for catalog integration.");
});

renderCart();
updateStory();
