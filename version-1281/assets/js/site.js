(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
    if (!inputs.length || !window.SEARCH_MOVIES) {
      return;
    }
    inputs.forEach(function (input) {
      var form = input.closest(".site-search");
      var panel = form ? form.querySelector(".search-results") : null;
      if (!panel) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = window.SEARCH_MOVIES.filter(function (movie) {
          return [movie.title, movie.region, movie.year, movie.genre, movie.tags].join(" ").toLowerCase().indexOf(query) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          panel.innerHTML = '<div class="empty-search">暂无匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = results.map(function (movie) {
          return '<a href="' + movie.url + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"><span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></span></a>';
        }).join("");
        panel.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var firstLink = panel.querySelector("a");
          if (firstLink) {
            window.location.href = firstLink.href;
          }
        });
      }
      document.addEventListener("click", function (event) {
        if (form && !form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initLocalFilter() {
    var input = document.querySelector(".filter-input");
    var select = document.querySelector(".filter-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card-item"));
    if (!cards.length || (!input && !select)) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var region = select ? select.value : "";
      cards.forEach(function (card) {
        var text = [card.getAttribute("data-title"), card.getAttribute("data-year"), card.getAttribute("data-genre"), card.getAttribute("data-tags"), card.getAttribute("data-region")].join(" ").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !region || cardRegion === region;
        card.classList.toggle("is-filtered-out", !(matchQuery && matchRegion));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  window.initializeVideoPlayer = function (sourceUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var hlsInstance = null;
    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      video.setAttribute("data-ready", "1");
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
  });
})();
