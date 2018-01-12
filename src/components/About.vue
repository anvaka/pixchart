<template>
  <div class='about'>
    <div class='background absolute' @click.prevent='close'></div>
    <div class='content'>
      <h3>Pixel Chart <a class='close bold' href='#' @click.prevent='close'>close</a></h3>
      <p>
        This website allows you to take any picture and split it thousands particles.
        The particles are arranged according to color intensities into a histogram.
      </p>
      <p>
        The website was created in response to popular demand in <a href='https://www.reddit.com/r/dataisbeautiful/comments/7ol3gy/gaussian_distribution_oc/'>this reddit post.</a>
        Thank you for the inspiration!
      </p>
      <ul>
        <li>
          <a href='https://github.com/anvaka/pixchart' class='highlighted'>Learn more </a> about this project on GitHub
        </li><li>
        Stay tuned for updates on <a href='https://twitter.com/anvaka' class='highlighted'>Twitter</a>
        </li>
      </ul>
      <p>With passion,<br/> Anvaka</p>
      <a href='#' @click.prevent='close' class='large-close bold'>
        close
      </a>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.closeHandler = (e) => {
      if (e.keyCode === 27) {
        e.preventDefault();
        this.close();
      }
    }
    document.addEventListener('keyup', this.closeHandler);
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.closeHandler);
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>
<style lang='stylus'>
@import "../shared.styl";

.about {
  position: absolute;
  overflow-y: auto;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  align-items: flex-start;
  .close {
    position: absolute;
    right: 15px;
    font-size: 12px;
  }
  .large-close {
    width: 100%;
    height: 32px;
    display: block;
    text-align: center;
  }
  .content {
    color: secondary-text;
    position: relative;
    background: window-background;
    width: 400px;
    padding: 14px;
    border: 1px solid primary-border;
    h3 {
      margin: 0;
      font-weight: normal;
    }
  }
}
.background {
  position: absolute;
  background-color: hsla(215, 74%, 18%, 0.8);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
@media (max-width: 800px) {
  .about {
    justify-content: initial;
  }
  .about .content {
    width: 100%;
    border: none;
  }
}
</style>