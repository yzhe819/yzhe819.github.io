<template>
  <div></div>
</template>

<script>
export default {
  name: "Animation",
  mounted() {
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = "!<>-⋯/[]{}—=+⁕⁑⁂⋈^?#________▇▇";
        this.update = this.update.bind(this);
      }

      setText(newText) {
        const oldText = this.el.innerText;
        var length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || "";
          const to = newText[i] || "";
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          this.queue.push({
            from,
            to,
            start,
            end,
          });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }

      update() {
        let output = "";
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += char;
          } else {
            output += from;
          }
        }
        this.el.innerText = output;
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }

      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

    let el = document.querySelector(".hero .description");
    // console.log("el: ", el);

    if (!el) {
      const timer = setInterval(() => {
        if (el) {
          init();
          timer && clearInterval(timer);
        }
        el = document.querySelector(".hero .description");
      }, 100);
    } else {
      init();
    }

    function init() {
      const fx = new TextScramble(el);
      const phases = require("./poetry")[0];

      let counter = 0;
      const next = () => {
        fx.setText(phases[counter]).then(() => {
          setTimeout(next, 2100);
        });
        counter = ++counter % phases.length;
      };
      next();
    }

    init();
  },
};
</script>

<style>
</style>