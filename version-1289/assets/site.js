(function() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = index;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function nextSlide() {
      if (slides.length > 0) {
        showSlide((current + 1) % slides.length);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(nextSlide, 5000);
      });
    });

    if (slides.length > 1) {
      timer = window.setInterval(nextSlide, 5000);
    }
  }

  var searchInput = document.querySelector("[data-card-search]");
  if (searchInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    searchInput.addEventListener("input", function() {
      var keyword = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function(card) {
        var searchText = card.getAttribute("data-search") || card.textContent.toLowerCase();
        var matched = keyword === "" || searchText.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    });
  }
}());
