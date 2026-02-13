if (!customElements.get("feed-modal")) {
  customElements.define(
    "feed-modal",
    class FeedModal extends ModalDialog {
      constructor() {
        super();

        this.feedSlider = this.querySelector(".slider");

        // 监听视频静音状态，其它视频保持同步
        this.addEventListener("video-mute", this.toggleMuteVideos.bind(this));
      }

      show(opener) {
        super.show(opener);

        // 打开目标feed
        if (opener.dataset.target) {
          setTimeout(() => {
            this.feedSlider?.slideById(`#${opener.dataset.target}`, true);
          }, 50);
        }
      }

      /**
       * 切换所有视频静音状态
       * @param event
       */
      toggleMuteVideos(event) {
        const derferredMedias = this.querySelectorAll("deferred-media");
        derferredMedias.forEach((derferredMedia) => {
          const video = derferredMedia.querySelector("video");
          if (video) {
            video.muted = !!event.detail.muted;
          } else {
            // 视频未加载，修改template内容
            const template = derferredMedia.querySelector("template");
            const video = template.content.querySelector("video");
            if (!!event.detail.muted) {
              video.setAttribute("muted", "muted");
            } else {
              video.removeAttribute("muted");
            }
          }
        });
      }
    },
  );
}
