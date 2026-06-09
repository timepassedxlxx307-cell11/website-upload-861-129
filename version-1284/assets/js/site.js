(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchPage = document.querySelector("[data-search-page]");

    if (searchPage) {
      var input = document.querySelector("[data-search-input]");
      var select = document.querySelector("[data-category-filter]");
      var clearButton = document.querySelector("[data-clear-search]");
      var empty = document.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input) {
        input.value = initialQuery;
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var category = select ? select.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var matched = (!query || text.indexOf(query) !== -1) && (!category || category === cardCategory);

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (select) {
        select.addEventListener("change", applyFilter);
      }
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (select) {
            select.value = "";
          }
          applyFilter();
        });
      }

      applyFilter();
    }
  });
})();
