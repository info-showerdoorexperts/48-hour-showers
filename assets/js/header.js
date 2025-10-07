/* assets/js/header.js
   Shared header that matches your homepage header + instant cart count updates.
   - Creates global window.updateCartCount() so your existing pages can call it.
   - Runs updateCartCount() on load automatically.
   - Uses the same class & id names you already use: .nav, .logo, .nav-links, .cart-icon, #cartCount
*/
(function () {
  // ----- Styles (added once) -----
  if (!document.getElementById("global-header-styles")) {
    const css = `
      .nav { background: rgba(255,255,255,0.98); padding: 25px 40px; backdrop-filter: blur(10px);
             position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between;
             align-items: center; border-bottom: 1px solid #e5e5e5; }
      .logo { font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.5px; cursor: pointer; }
      .logo span { color: #2d5f4f; }
      .nav-links { display: flex; gap: 45px; list-style: none; align-items: center; }
      .nav-links a { color: #4a4a4a; text-decoration: none; font-weight: 500; font-size: 15px; transition: color .3s; letter-spacing: .3px; }
      .nav-links a:hover { color: #2d5f4f; }
      .cart-icon { position: relative; cursor: pointer; padding: 8px 16px; border: 1px solid #e5e5e5; border-radius: 6px; transition: all .3s; font-size: 14px; color: #1a1a1a; }
      .cart-icon:hover { border-color: #1a1a1a; background: #fafafa; }
      .cart-count { position: absolute; top: -6px; right: -6px; background: #1a1a1a; color: #fff; border-radius: 10px; padding: 2px 6px; font-size: 11px; font-weight: 600; min-width: 20px; text-align: center; }
      @media (max-width: 720px) {
        .nav { padding: 18px 20px; }
        .nav-links { gap: 22px; }
      }
    `.trim();
    const style = document.createElement("style");
    style.id = "global-header-styles";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // ----- Markup (matches your homepage header) -----
  const headerHTML = `
    <nav class="nav" role="navigation" aria-label="Main">
      <div class="logo" id="gh-logo">48 HOUR <span>SHOWERS</span></div>
      <ul class="nav-links">
        <li><a href="index.html#home">Home</a></li>
        <li><a href="index.html#products">Products</a></li>
        <li><a href="index.html#about">About</a></li>
        <li>
          <a href="cart.html" class="cart-icon">
            Cart
            <span class="cart-count" id="cartCount">0</span>
          </a>
        </li>
      </ul>
    </nav>
  `.trim();

  function mountTarget() {
    // If you add <div id="site-header"></div> to pages, we'll use it; otherwise prepend to <body>
    return document.getElementById("site-header") || document.body;
  }

  function renderHeader() {
    if (document.getElementById("global-shared-header")) return; // don’t double-inject
    const wrapper = document.createElement("div");
    wrapper.id = "global-shared-header";
    wrapper.innerHTML = headerHTML;

    const target = mountTarget();
    if (target === document.body) {
      document.body.insertBefore(wrapper, document.body.firstChild);
    } else {
      target.innerHTML = "";
      target.appendChild(wrapper);
    }

    const logo = document.getElementById("gh-logo");
    if (logo) logo.addEventListener("click", () => (window.location.href = "index.html"));
  }

  // ----- Cart count (same behavior as your existing header) -----
  function readCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(cart) ? cart.length : 0;
    } catch {
      return 0;
    }
  }

  // Expose the same global you already call from pages
  window.updateCartCount = function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = String(readCartCount());
  };

  // Keep badge in sync if cart changes in another tab
  window.addEventListener("storage", (e) => {
    if (e.key === "cart") window.updateCartCount();
  });

  // ----- Init -----
  function init() {
    renderHeader();
    // Immediately update badge so it’s correct on first paint
    window.updateCartCount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
