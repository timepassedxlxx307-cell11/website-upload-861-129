function selectAll(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function toggleMobileMenu() {
  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = selectAll("[data-hero-slide]", hero);
  var dots = selectAll("[data-hero-dot]", hero);
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initInlineFilters() {
  selectAll(".movie-filter").forEach(function (input) {
    var section = input.closest("section") || document;
    var cards = selectAll("[data-movie-card]", section);
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
      });
    });
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function renderSearchCard(movie) {
  return "<article class=\"movie-card\" data-movie-card>" +
    "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
    "<span class=\"poster-shade\"></span>" +
    "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
    "</a>" +
    "<div class=\"movie-card-body\">" +
    "<div class=\"tag-row\"><span>" + escapeHtml(movie.categoryName) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
    "<h2><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
    "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
    "</div>" +
    "</article>";
}

function initSearchPage() {
  var result = document.getElementById("search-results");
  var input = document.getElementById("site-search-input");
  var button = document.getElementById("site-search-button");
  var category = document.getElementById("site-search-category");
  if (!result || !input || !window.SEARCH_MOVIES) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";
  input.value = initial;

  function run() {
    var keyword = input.value.trim().toLowerCase();
    var categoryValue = category ? category.value : "";
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.categoryName].join(" ").toLowerCase();
      var keywordOk = !keyword || text.indexOf(keyword) !== -1;
      var categoryOk = !categoryValue || movie.categorySlug === categoryValue;
      return keywordOk && categoryOk;
    }).slice(0, 120);
    result.innerHTML = matches.map(renderSearchCard).join("");
  }

  input.addEventListener("input", run);
  if (category) {
    category.addEventListener("change", run);
  }
  if (button) {
    button.addEventListener("click", run);
  }
  run();
}

function initMoviePlayer(videoId, coverId, mediaUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !mediaUrl) {
    return;
  }
  var ready = false;

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function play() {
    prepare();
    if (cover) {
      cover.classList.add("hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("hidden");
    }
  });
  video.addEventListener("loadedmetadata", function () {
    if (!video.paused && cover) {
      cover.classList.add("hidden");
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
  toggleMobileMenu();
  initHero();
  initInlineFilters();
  initSearchPage();
});
