(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initializeHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function getCardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-category')
    ].join(' ').toLowerCase();
  }

  function initializeFiltering() {
    var panel = document.querySelector('[data-filter-panel]');
    var container = document.querySelector('[data-card-container]');

    if (!panel || !container) {
      return;
    }

    var searchInput = panel.querySelector('[data-search-input]');
    var filterFields = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var sortSelect = panel.querySelector('[data-sort-select]');
    var resultCount = panel.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var originalOrder = cards.slice();

    function matchesFilters(card) {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

      if (query && getCardText(card).indexOf(query) === -1) {
        return false;
      }

      return filterFields.every(function (field) {
        var value = field.value;

        if (!value) {
          return true;
        }

        var fieldName = field.getAttribute('data-filter-field');
        var cardValue = card.getAttribute('data-' + fieldName) || '';

        return cardValue.indexOf(value) !== -1;
      });
    }

    function sortCards(visibleCards) {
      var sortValue = sortSelect ? sortSelect.value : 'default';
      var sorted = visibleCards.slice();

      if (sortValue === 'default') {
        return originalOrder.filter(function (card) {
          return visibleCards.indexOf(card) !== -1;
        });
      }

      sorted.sort(function (a, b) {
        if (sortValue === 'year-desc') {
          return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
        }

        if (sortValue === 'year-asc') {
          return (parseInt(a.getAttribute('data-year'), 10) || 0) - (parseInt(b.getAttribute('data-year'), 10) || 0);
        }

        if (sortValue === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        }

        return 0;
      });

      return sorted;
    }

    function applyFilters() {
      var visibleCards = [];

      cards.forEach(function (card) {
        var isVisible = matchesFilters(card);
        card.classList.toggle('is-filtered-out', !isVisible);

        if (isVisible) {
          visibleCards.push(card);
        }
      });

      sortCards(visibleCards).forEach(function (card) {
        container.appendChild(card);
      });

      if (resultCount) {
        resultCount.textContent = '当前显示 ' + visibleCards.length + ' 部影片';
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        searchInput.value = query;
      }

      searchInput.addEventListener('input', applyFilters);
    }

    filterFields.forEach(function (field) {
      field.addEventListener('change', applyFilters);
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
  }

  initializeHeroSlider();
  initializeFiltering();
})();
