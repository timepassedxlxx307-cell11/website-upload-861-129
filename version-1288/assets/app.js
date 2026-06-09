(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilter() {
    var form = document.querySelector('[data-filter]');
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    if (!form || !roots.length) {
      return;
    }
    var input = form.querySelector('[data-filter-input]');
    var year = form.querySelector('[data-filter-year]');
    var region = form.querySelector('[data-filter-region]');
    var empty = document.querySelector('[data-empty-message]');
    var cards = [];
    roots.forEach(function (root) {
      cards = cards.concat(Array.prototype.slice.call(root.querySelectorAll('[data-card]')));
    });
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchKeyword = !keyword || title.indexOf(keyword) !== -1;
        var matchYear = !yearValue || cardYear === yearValue;
        var matchRegion = !regionValue || cardRegion === regionValue;
        var matched = matchKeyword && matchYear && matchRegion;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    apply();
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    var configElement = document.getElementById('player-config');
    if (!video || !configElement) {
      return;
    }
    var config = {};
    try {
      config = JSON.parse(configElement.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var src = config.src;
    var poster = config.poster;
    var attached = false;
    var playRequested = false;
    var hls = null;
    if (poster) {
      video.setAttribute('poster', poster);
    }
    function attachSource() {
      if (attached || !src) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playRequested) {
            playVideo();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    function playVideo() {
      playRequested = true;
      attachSource();
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.addEventListener('canplay', function () {
            video.play().catch(function () {});
          }, { once: true });
        });
      }
    }
    function toggleVideo() {
      if (!attached || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }
    if (layer) {
      layer.addEventListener('click', playVideo);
    }
    video.addEventListener('click', toggleVideo);
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilter();
    setupPlayer();
  });
}());
