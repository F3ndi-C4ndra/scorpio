const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const suggestions = document.getElementById("suggestions");
const darkModeBtn = document.getElementById("darkModeBtn");

let currentResults = [];
let currentPage = 1;

const ITEMS_PER_PAGE = 5;
function calculateTFIDF(results, query){

    const terms =
        query.toLowerCase().split(" ");

    const N = results.length;

    return results.map(doc => {

        const text =
            (doc.title + " " + doc.snippet)
            .toLowerCase();

        let score = 0;

        terms.forEach(term => {

            const words =
                text.split(/\s+/);

            const termCount =
                words.filter(
                    w => w.includes(term)
                ).length;

            const tf =
                termCount / words.length;

            const docsWithTerm =
                results.filter(r => {

                    const t =
                        (r.title + " " + r.snippet)
                        .toLowerCase();

                    return t.includes(term);

                }).length;

            const idf =
                Math.log(
                    N / (1 + docsWithTerm)
                );

            score += tf * idf;

        });

        return {
            ...doc,
            score
        };

    });

}

/*
===================
SEARCH
===================
*/

searchBtn.addEventListener("click", performSearch);

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        performSearch();
    }
});

async function performSearch() {

    const query = searchInput.value.trim();

    if (!query) return;

    saveHistory(query);

    const loading =
        document.getElementById("loading");

    loading.style.display = "block";

    try {

        const response =
            await fetch(`/api/search?q=${encodeURIComponent(query)}`);

        const data =
            await response.json();

        if (!Array.isArray(data)) {
            console.error(data);
            return;
        }

        currentResults =
    calculateTFIDF(data, query);

currentResults.sort(
    (a,b) => b.score - a.score
);
        currentPage = 1;

        renderResults();

        document.getElementById("stats").innerHTML =
            `<b>${currentResults.length}</b> results found`;

    } catch (err) {

        console.error(err);

    } finally {

        loading.style.display = "none";

    }

}

/*
===================
RENDER RESULTS
===================
*/

function renderResults() {

    resultsDiv.innerHTML = "";

    const start =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const end =
        start + ITEMS_PER_PAGE;

    const pageResults =
        currentResults.slice(start, end);

    pageResults.forEach(item => {

        resultsDiv.innerHTML += `
            <div class="result-card">

                <img
                    src="${item.thumbnail}"
                    width="32"
                    alt="favicon">

                <a
                    href="${item.url}"
                    target="_blank"
                    class="result-title d-block">

                    ${item.title}

                </a>

                <div class="result-link">
                    ${item.url}
                </div>
                <div class="ranking-badge">
    Relevance Score:
    ${item.score.toFixed(3)}
</div>

                <p>
                    ${item.snippet}
                </p>

            </div>
        `;

    });

    renderPagination();

}

/*
===================
PAGINATION
===================
*/

function renderPagination() {

    const totalPages =
        Math.ceil(currentResults.length / ITEMS_PER_PAGE);

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button
                class="btn btn-outline-primary m-1"
                onclick="changePage(${i})">
                ${i}
            </button>
        `;

    }

    document.getElementById("pagination")
        .innerHTML = html;

}

function changePage(page) {

    currentPage = page;

    renderResults();

}

/*
===================
AUTOCOMPLETE
===================
*/

searchInput.addEventListener("keyup", async () => {

    const query = searchInput.value.trim();

    if (query.length < 2) {

        suggestions.innerHTML = "";

        return;

    }

    try {

        const response =
            await fetch(`/api/suggest?q=${encodeURIComponent(query)}`);

        const data =
            await response.json();

        suggestions.innerHTML = "";

        data.forEach(item => {

            suggestions.innerHTML += `
                <li class="list-group-item suggestion">
                    ${item}
                </li>
            `;

        });

        document
            .querySelectorAll(".suggestion")
            .forEach(el => {

                el.addEventListener("click", () => {

                    searchInput.value =
                        el.textContent;

                    suggestions.innerHTML = "";

                    performSearch();

                });

            });

    } catch (err) {

        console.error(err);

    }

});

/*
===================
SEARCH HISTORY
===================
*/

function saveHistory(keyword) {

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift(keyword);

    history =
        [...new Set(history)];

    history =
        history.slice(0, 10);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

}

function showHistoryDropdown() {

    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    const dropdown =
        document.getElementById("historyDropdown");

    if (!dropdown) return;

    if (history.length === 0) {

        dropdown.style.display = "none";

        return;

    }

    let html = "";

    history.slice(0, 5).forEach(item => {

        html += `
            <div class="history-item">
                🕒 ${item}
            </div>
        `;

    });

    dropdown.innerHTML = html;

    dropdown.style.display = "block";

    document
        .querySelectorAll(".history-item")
        .forEach(el => {

            el.addEventListener("click", () => {

                searchInput.value =
                    el.textContent.replace("🕒 ", "");

                dropdown.style.display = "none";

                performSearch();

            });

        });

}

searchInput.addEventListener(
    "focus",
    showHistoryDropdown
);

document.addEventListener("click", (e) => {

    const dropdown =
        document.getElementById("historyDropdown");

    if (
        dropdown &&
        !searchInput.contains(e.target) &&
        !dropdown.contains(e.target)
    ) {

        dropdown.style.display = "none";

    }

});

/*
===================
DARK MODE
===================
*/

darkModeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem(
            "theme",
            "dark"
        );

        darkModeBtn.innerHTML = "☀️";

    } else {

        localStorage.setItem(
            "theme",
            "light"
        );

        darkModeBtn.innerHTML = "🌙";

    }

});

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    darkModeBtn.innerHTML = "☀️";

} else {

    darkModeBtn.innerHTML = "🌙";

}