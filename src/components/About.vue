<template>
  <div class='about'>
    <div class='background absolute' @click.prevent='close'></div>
    <div class='content darker-background secondary-text secondary-border'>
      <h3>Pixel Chart <a class='close bold' href='#' @click.prevent='close'>close</a></h3>
      <p>
        This website allows you to take any picture and split it into thousands particles.
        The particles are arranged according to color intensities into a histogram.
      </p>
      <p>
        The website was created in response to <a href='https://www.reddit.com/r/dataisbeautiful/comments/7ol3gy/gaussian_distribution_oc/' class='highlighted'>this reddit post.</a>
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
  z-index: 3;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  .close {
    position: absolute;
    right: 15px;
    font-size: 12px;
  }
  .large-close {
    width: 100%;
    height: 32px;
    font-size: 12px;
    display: block;
    text-align: center;
  }
  .content {
    position: relative;
    width: 400px;
    padding: 14px;
    border: 1px solid;
    h3 {
      margin: 0;
      font-weight: normal;
      font-size: 18px;
    }
  }
}
.background {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
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