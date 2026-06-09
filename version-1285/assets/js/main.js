function setMobileMenu() {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
        return;
    }
    button.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
}

function setHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
        return;
    }
    let index = 0;
    let timer = null;
    const show = next => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, current) => slide.classList.toggle("is-active", current === index));
        dots.forEach((dot, current) => dot.classList.toggle("is-active", current === index));
    };
    const run = () => {
        timer = window.setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot, current) => {
        dot.addEventListener("click", () => {
            window.clearInterval(timer);
            show(current);
            run();
        });
    });
    run();
}

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

function setFilters() {
    const lists = Array.from(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
        return;
    }
    const input = document.querySelector("[data-filter-input]");
    const region = document.querySelector("[data-filter-region]");
    const year = document.querySelector("[data-filter-year]");
    const cards = lists.flatMap(list => Array.from(list.querySelectorAll("[data-card]")));
    const fillSelect = (select, key) => {
        if (!select || select.options.length > 1) {
            return;
        }
        const values = Array.from(new Set(cards.map(card => card.dataset[key]).filter(Boolean))).sort((a, b) => b.localeCompare(a, "zh-Hans-CN"));
        values.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };
    fillSelect(region, "region");
    fillSelect(year, "year");
    if (input && !input.value) {
        input.value = getParam("q");
    }
    const match = () => {
        const term = (input ? input.value : "").trim().toLowerCase();
        const selectedRegion = region ? region.value : "";
        const selectedYear = year ? year.value : "";
        cards.forEach(card => {
            const text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.tags].join(" ").toLowerCase();
            const visible = (!term || text.includes(term)) && (!selectedRegion || card.dataset.region === selectedRegion) && (!selectedYear || card.dataset.year === selectedYear);
            card.classList.toggle("is-hidden", !visible);
        });
    };
    [input, region, year].forEach(element => {
        if (element) {
            element.addEventListener("input", match);
            element.addEventListener("change", match);
        }
    });
    match();
}

document.addEventListener("DOMContentLoaded", () => {
    setMobileMenu();
    setHero();
    setFilters();
});
