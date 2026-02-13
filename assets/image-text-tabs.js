if (!customElements.get("image-text-tabs")) {
  customElements.define(
    "image-text-tabs",
    class ImageTextTabs extends HTMLElement {
      constructor() {
        super();

        this.switchType = this.dataset.switchType || "hover";

        if (this.switchType === "hover") {
          this.boundOnMouseEnter = this.onMouseEnter.bind(this);
          this.addEventListener("mouseenter", this.boundOnMouseEnter, true);
        } else {
          this.boundOnClick = this.onClick.bind(this);
          this.addEventListener("click", this.boundOnClick, true);
        }

        this.boundOnToggle = this.onToggle.bind(this);
        this.querySelectorAll("details").forEach((details) => {
          details.addEventListener("toggle", this.boundOnToggle);

          const summary = details.querySelector("summary");
          if (summary) {
            summary.addEventListener(
              "click",
              (event) => {
                if (details.open) event.preventDefault();
              },
              true, // 捕获阶段，早于默认行为执行
            );
          }
        });
      }

      disconnectedCallback() {
        // 移除组件级监听
        if (this.boundOnMouseEnter)
          this.removeEventListener("mouseenter", this.boundOnMouseEnter, true);

        if (this.boundOnClick)
          this.removeEventListener("click", this.boundOnClick, true);

        // 移除每个 details 的监听
        if (this.boundOnToggle)
          this.querySelectorAll("details").forEach((details) => {
            details.removeEventListener("toggle", this.boundOnToggle);
          });
      }

      onMouseEnter(event) {
        const detailsDisclosure = event.target.closest("details-disclosure");
        if (!detailsDisclosure || !this.contains(detailsDisclosure)) return;

        this.openTab(detailsDisclosure);
        this.closeAllTabs(detailsDisclosure);
      }

      onClick(event) {
        const detailsDisclosure = event.target.closest("details-disclosure");
        if (!detailsDisclosure || !this.contains(detailsDisclosure)) return;

        this.closeAllTabs(detailsDisclosure);
      }

      onToggle(event) {
        const details = event.currentTarget;
        this.handleTabToggle(details);
      }

      /**
       * Open a specific tab
       * @param {Element} detailsDisclosure
       */
      openTab(detailsDisclosure) {
        detailsDisclosure.open?.();
      }

      /**
       * Close all tabs
       */
      closeAllTabs(except) {
        this.querySelectorAll("details-disclosure").forEach(
          (detailsDisclosure) => {
            if (detailsDisclosure !== except) detailsDisclosure.close?.();
          },
        );
      }

      /**
       * Handle tab toggle event
       * @param {Element} details
       */
      handleTabToggle(details) {
        const { open, dataset } = details;
        const index = dataset.index;
        if (!index) return;

        const tabImage = this.querySelector(
          `.tab-image[data-index="${index}"]`,
        );
        if (!tabImage) return;

        // 根据 open 状态统一切换 hidden
        tabImage.classList.toggle("hidden", !open);
      }
    },
  );
}
