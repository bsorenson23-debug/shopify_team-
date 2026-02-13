// 处理全局的设计模式事件

function hideProductModal() {
  const productModal = document.querySelectorAll("product-gallery-modal[open]");
  productModal && productModal.forEach((modal) => modal.hide());
}

// 选中Block
document.addEventListener("shopify:block:select", (event) => {
  hideProductModal();

  if (
    event.target.classList.contains("slider-slide") &&
    event.target.closest(".slider")
  ) {
    // 轮播
    const slider = event.target.closest(".slider");
    slider.setAttribute("editor-selected", "true");

    // 滚动到指定位置
    setTimeout(() => {
      slider.slideByElement(event.target);
    }, 200);
  } else if (
    event.target.classList.contains("scroll-item") &&
    event.target.closest("scroll-seamless")
  ) {
    // 无缝滚动
    const seamlessScroll = event.target.closest("scroll-seamless");
    seamlessScroll.setAttribute("editor-selected", "true");

    // 滚动到指定位置
    setTimeout(() => {
      seamlessScroll.moveItemVisible(event.target);
    }, 200);
  } else if (
    event.target.classList.contains("tab") &&
    event.target.closest("tab-panel")
  ) {
    const tabPanel = event.target.closest("tab-panel");

    setTimeout(() => {
      tabPanel.tabChoose(event.target);
    }, 200);
  } else if (event.target.closest("scrollable-content-viewer")) {
    // 可滑动内容
    const scrollableContentViewer = event.target.closest(
      "scrollable-content-viewer",
    );
    setTimeout(() => {
      scrollableContentViewer.slideContentByItem(event.target);
    }, 200);
  } else if (
    event.target.classList.contains("flexible-image-block") &&
    event.target.closest("flexible-images")
  ) {
    const flexibleImages = event.target.closest("flexible-images");

    setTimeout(() => {
      flexibleImages.setActiveImage(event.target);
    }, 200);
  }
});

// 取消选中Block
document.addEventListener("shopify:block:deselect", function (event) {
  if (
    event.target.classList.contains("slider-slide") &&
    event.target.closest(".slider")
  ) {
    const slider = event.target.closest(".slider");
    slider.removeAttribute("editor-selected");

    if (slider.autoplayHandler) slider.autoplayHandler.play(true); // 重新播放
  } else if (
    event.target.classList.contains("scroll-item") &&
    event.target.closest("scroll-seamless")
  ) {
    const seamlessScroll = event.target.closest("scroll-seamless");
    seamlessScroll.removeAttribute("editor-selected");
  }
});

document.addEventListener("shopify:section:load", () => {
  webvista.initTooltips();
  webvista.initLazyImages();
  webvista.initScrollSynergy();
});

function sendShopifyThemeAnalytics() {
  if (typeof navigator.sendBeacon !== "function") return;

  const shopify = window.Shopify || {};
  const theme = shopify.theme || {};

  const cookie_key = `${theme?.schema_name || "unknown"}_sent_theme_analytics_time`;
  const lastTimeStr = webvista.retrieveData(cookie_key);
  const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : null;
  const currentTime = Math.floor(Date.now() / 1000);

  if (lastTime != null && currentTime < lastTime + 2592000) return;

  webvista.storeData(cookie_key, currentTime);

  const shopData = {
    themeId: theme.id || "",
    themeName: [theme.schema_name, theme.schema_version]
      .filter(Boolean)
      .join("-"),
    themeStoreId: shopify.theme_store_id || 0,
    shop: shopify.shop || "",
    email: window.shopEmail || "",
  };

  return navigator.sendBeacon(
    "https://script.google.com/macros/s/AKfycbx88gEzONeSvsIbMDhCBrqHL61BGROzRRhk4Z3nMpPpIkV60jM9f07fH93w52pmXPMKdA/exec",
    JSON.stringify(shopData),
  );
}

window.addEventListener("load", sendShopifyThemeAnalytics);
