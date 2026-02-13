if (!customElements.get("reading-text")) {
  customElements.define(
    "reading-text",
    class ReadingText extends HTMLElement {
      constructor() {
        super();

        this.animation = this.dataset.animation || "float-in";
        if (this.animation === "color-change") {
          this.colorBefore = this.dataset.colorBefore || "#B500B5";
          this.colorAfter = this.dataset.colorAfter || "#FFD600";
        }
        this.textHasSplited = false;
        this.attachShadow({ mode: "open" });

        this.observer = new IntersectionObserver(
          (entries, observer) => {
            if (entries[0].isIntersecting) {
              this.init();
              observer.disconnect();
            }
          },
          {
            rootMargin: "100px 0px 100px 0px",
          },
        );

        this.observer.observe(this);
      }

      disconnectedCallback() {
        this.observer?.disconnect();
      }

      init() {
        this.splitText();

        // 监听页面滚动，从底部出现到滚动到距离顶部 30% 的位置，实现依次显示letter
        this.setupScrollAnimation();
      }

      /**
       * 分隔字符
       */
      splitText() {
        const text = this.textContent;
        // 使用正则表达式按单词和空格分割
        const segments = text.match(/\S+|\s/g) || [];

        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: inline-block;
            }
            
            [part="word"] {
              display: inline-block;
              white-space: nowrap;
            }
            
            [part="letter"] {
              display: inline-block;
              transition: all 100ms linear;
              ${
                this.animation === "hollow"
                  ? "color: rgba(var(--color-foreground), var(--color-opacity, 0)); -webkit-text-stroke: var(--stoke-width, 1px)\n" +
                    "          rgb(var(--color-foreground));"
                  : ""
              }
            }
          </style>
          ${segments
            .map((segment) => {
              if (segment === " ") {
                // 单独处理空格字符
                return `<span part="space"> </span>`;
              } else if (segment.match(/^\s$/)) {
                // 处理其他空白字符（制表符等）
                return `<span part="letter">${segment}</span>`;
              } else {
                // 处理单词
                return `
                  <span part="word">
                    ${segment
                      .split("")
                      .map((letter) => `<span part="letter">${letter}</span>`)
                      .join("")}
                  </span>
                `;
              }
            })
            .join("")}
        `;
        this.textHasSplited = true;
      }

      setupScrollAnimation() {
        if (!this.textHasSplited) return;

        // 获取所有字母元素
        const letters = Array.from(
          this.shadowRoot.querySelectorAll('[part="letter"]'),
        );

        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.1; // 距离顶部20%的位置

        // 监听滚动
        const scrollHandler = () => {
          const rect = this.getBoundingClientRect();
          if (rect.top <= 0 || rect.top >= windowHeight) return;

          // 元素底部进入视口到顶部到达触发点的进度 (0-1)
          let progress = Math.min(
            1,
            Math.max(
              0,
              (windowHeight - rect.top - triggerPoint) /
                (windowHeight - 2 * triggerPoint),
            ),
          );

          // 滚动到页面最底部
          if (
            progress < 1 &&
            window.innerHeight + window.scrollY >=
              document.documentElement.scrollHeight
          )
            progress = 1;

          // 根据进度显示字母
          letters.forEach((letter, index) => {
            const letterProgress = Math.min(
              1,
              Math.max(0, (progress * letters.length) / index),
            );

            const rate = letterProgress > 0.8 ? letterProgress.toFixed(2) : 0;
            if (this.animation === "float-in") {
              this.animationFloatIn(letter, rate);
            } else if (this.animation === "darken") {
              this.animationDarken(letter, rate);
            } else if (this.animation === "color-change") {
              this.animationChangeColor(letter, rate);
            } else {
              this.animationHollow(letter, rate);
            }
          });
        };

        // 初始触发一次
        scrollHandler();
        window.addEventListener("scroll", scrollHandler);
      }

      /**
       * 飘入动画
       * @param letter
       * @param rate
       */
      animationFloatIn(letter, rate) {
        const translateX = 100 - 100 * rate;
        const translateY = -100 + 100 * rate;

        letter.style.opacity = rate;
        letter.style.transform = `translate(${translateX}%, ${translateY}%)`;
      }

      /**
       * 颜色加深动画
       * @param letter
       * @param rate
       */
      animationDarken(letter, rate) {
        rate = Math.max(0.2, rate);
        letter.style.opacity = rate;
      }

      /**
       * 变色动画
       * @param letter
       * @param rate
       */
      animationChangeColor(letter, rate) {
        letter.style.color = webvista.getIntermediateColor(
          this.colorBefore,
          this.colorAfter,
          rate,
        );
      }

      /**
       * 镂空字动画
       * @param letter
       * @param rate
       */
      animationHollow(letter, rate) {
        letter.style.setProperty("--color-opacity", rate);
        letter.style.setProperty("--stoke-width", rate >= 1 ? 0 : "1px");
      }
    },
  );
}
