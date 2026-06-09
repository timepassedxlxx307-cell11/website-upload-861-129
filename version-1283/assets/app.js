document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupScrollRows();
    setupFilters();
    setupPlayers();
});

function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", function () {
        menu.classList.toggle("open");
    });
}

function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    if (slides.length < 2) {
        return;
    }

    function show(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === current);
        });

        dots.forEach(function (dot, position) {
            dot.classList.toggle("active", position === current);
        });
    }

    function restart() {
        if (timer) {
            window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    if (previous) {
        previous.addEventListener("click", function () {
            show(current - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(current + 1);
            restart();
        });
    }

    dots.forEach(function (dot, position) {
        dot.addEventListener("click", function () {
            show(position);
            restart();
        });
    });

    restart();
}

function setupScrollRows() {
    function bind(selector, direction) {
        Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (button) {
            var target = document.querySelector(button.getAttribute(selector.slice(1, -1)));

            if (!target) {
                return;
            }

            button.addEventListener("click", function () {
                var amount = Math.min(420, target.clientWidth * 0.82);
                target.scrollBy({
                    left: direction * amount,
                    behavior: "smooth"
                });
            });
        });
    }

    bind("[data-scroll-left]", -1);
    bind("[data-scroll-right]", 1);
}

function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
        var form = scope.querySelector("[data-filter-form]");

        if (!form) {
            return;
        }

        var keyword = form.querySelector("[data-filter-keyword]");
        var genre = form.querySelector("[data-filter-genre]");
        var year = form.querySelector("[data-filter-year]");
        var type = form.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : "";
        }

        function matches(card, query, selectedGenre, selectedYear, selectedType) {
            var title = (card.getAttribute("data-title") || "").toLowerCase();
            var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
            var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
            var cardType = (card.getAttribute("data-type") || "").toLowerCase();
            var region = (card.getAttribute("data-region") || "").toLowerCase();
            var haystack = [title, cardGenre, cardYear, cardType, region].join(" ");

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }

            if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
                return false;
            }

            if (selectedYear && cardYear !== selectedYear) {
                return false;
            }

            if (selectedType && cardType.indexOf(selectedType) === -1) {
                return false;
            }

            return true;
        }

        function apply() {
            var query = valueOf(keyword);
            var selectedGenre = valueOf(genre);
            var selectedYear = valueOf(year);
            var selectedType = valueOf(type);

            cards.forEach(function (card) {
                card.classList.toggle("hidden", !matches(card, query, selectedGenre, selectedYear, selectedType));
            });
        }

        [keyword, genre, year, type].forEach(function (input) {
            if (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            }
        });
    });
}

function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector("[data-play-button]");
        var layer = frame.querySelector(".play-layer");
        var attached = false;

        if (!video || !button) {
            return;
        }

        function attachSource() {
            var source = video.getAttribute("data-stream");

            if (!source || attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
                return;
            }

            video.src = source;
        }

        function playVideo() {
            attachSource();
            frame.classList.add("is-playing");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    frame.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", playVideo);

        if (layer) {
            layer.addEventListener("click", playVideo);
        }

        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });
    });
}
