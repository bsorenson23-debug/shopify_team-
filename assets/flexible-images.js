if (!customElements.get("flexible-images")) {
  customElements.define(
    "flexible-images",
    class FlexibleImages extends HTMLElement {
      constructor() {
        super();
        this.images = this.querySelectorAll(".flexible-image-block");
        this.isIntersected = false;
        this.initObservers();
        this.addEventListeners();
      }

      initObservers() {
        this.observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              this.activateFirstImage();
              this.isIntersected = true;
              this.observer.disconnect();
            }
          },
          {
            rootMargin: "-300px 0px -300px 0px",
          },
        );
        this.observer.observe(this);
      }

      addEventListeners() {
        this.images.forEach((image) => {
          if (!webvista.isMobileScreen()) {
            image.addEventListener("mouseenter", () =>
              this.setActiveImage(image),
            );
          }
          image.addEventListener("click", () => this.setActiveImage(image));
        });
      }

      activateFirstImage() {
        this.images[0]?.classList.add("active");
      }

      setActiveImage(image) {
        if (!this.isIntersected) return;

        this.images.forEach((img) => img.classList.remove("active"));
        image.classList.add("active");
      }

      disconnectedCallback() {
        this.observer?.disconnect();
      }
    },
  );
}
