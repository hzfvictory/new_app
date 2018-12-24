'use strict';

function BScroll(ctx) {
  console.log(111);
  console.log(ctx);
  var el = ctx.firstElementChild || ctx.firstChild;
  var OFFSET = 50;
  var vy = 0;
  var F = 150;
  var isDown = false;
  var isTransform = false;
  var cur = 0;
  var target = 0;
  var requestId;

  ctx.addEventListener('touchstart', function (e) {
    if (isTransform) return
    window.cancelAnimationFrame(requestId);
    vy = 0;

    this._oy = e.changedTouches[0].clientY - cur;
    this._cy = e.changedTouches[0].clientY;
    this._oh = this.scrollHeight;
    this._ch = this.clientHeight;
    this._startTime = e.timeStamp;
    isDown = true

  });

  ctx.addEventListener('touchmove', function (e) {
    if (isDown) {
      if (e.timeStamp - this._startTime > 50) {
        this._startTime = e.timeStamp;
        cur = e.changedTouches[0].clientY - this._oy;
        if (cur > 0) {
          cur *= F / (F + cur)
        } else if (cur < this._ch - this._oh) {
          cur += this._oh - this._ch;
          cur = (cur * F) / (F - cur) - this._oh + this._ch
        }

        transform(cur)
      }
      vy = e.changedTouches[0].clientY - this._cy;
      this._cy = e.changedTouches[0].clientY
    }

  }, false);

  ctx.addEventListener('touchend', function () {
    if (isDown) {
      isDown = false;
      var friction = ((vy >> 31) * 2 + 1) * 0.5;
      var oh = this.scrollHeight - this.clientHeight;

      var bounce = function () {
        vy -= friction;
        cur += vy;
        requestId = window.requestAnimationFrame(bounce);

        transform(cur);
        if (-cur - oh > OFFSET) {
          target = -oh;
          window.cancelAnimationFrame(requestId);
          ease();
          return
        }

        if (cur > OFFSET) {
          window.cancelAnimationFrame(requestId);
          ease();
          return
        }

        if (Math.abs(vy) < 1) {
          window.cancelAnimationFrame(requestId);

          if (cur > 0) {
            ease();
            return
          }
          if (-cur > oh) {
            target = -oh;
            ease();
            return
          }
        }
      };

      bounce()
    }
  });

  function ease() {
    isTransform = true;
    cur -= (cur - target) * 0.2;

    var requestId = window.requestAnimationFrame(ease);
    if (Math.abs(cur - target) < 1) {
      cur = target;
      window.cancelAnimationFrame(requestId);
      isTransform = false
    }
    transform(cur)
  }

  function transform(y) {
    el.style.transform = 'translateY(' + y + 'px) translateZ(0)'
  }
}


export default BScroll
