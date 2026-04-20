// ==========================
// BALANCES (REALISTIC)
// ==========================
const balances = {
    BTC: 0.42,
    ETH: 3.8,
    SOL: 120,
    BNB: 8,
    XRP: 1500
};

// ==========================
// SYMBOL → API MAP
// ==========================
const symbolToId = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    XRP: "ripple"
};

let prices = {};

// ==========================
// FETCH REAL PRICES
// ==========================
async function fetchPrices() {
    try {
        const ids = Object.values(symbolToId).join(",");

        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );

        const data = await res.json();

        Object.keys(symbolToId).forEach(symbol => {
            prices[symbol] = data[symbolToId[symbol]]?.usd || 0;
        });

        updateUI();
    } catch (err) {
        console.error("Error fetching prices:", err);
    }
}

// ==========================
// UPDATE TOP CARDS
// ==========================
function updateTopCards() {
    const map = {
        BTC: "btcPrice",
        ETH: "ethPrice",
        SOL: "solPrice"
    };

    Object.keys(map).forEach(symbol => {
        const el = document.getElementById(map[symbol]);
        if (!el) return;

        const price = prices[symbol] || 0;

        el.textContent =
            "$" + price.toLocaleString(undefined, {
                maximumFractionDigits: 2
            });
    });
}

// ==========================
// RENDER PORTFOLIO LIST
// ==========================
const portfolioEl = document.getElementById("cryptoTable");

function renderPortfolio() {
    if (!portfolioEl) return;

    portfolioEl.innerHTML = "";

    Object.keys(balances).forEach(symbol => {
        const amount = balances[symbol];
        const price = prices[symbol] || 0;
        const value = amount * price;

        const row = document.createElement("div");

        row.innerHTML = `
            <span>${symbol}</span>
            <span>$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}</span>
        `;

        portfolioEl.appendChild(row);
    });
}

// ==========================
// PORTFOLIO CHART
// ==========================
let portfolioChart;

function generateHistory(total) {
    const data = [];
    let value = total * 0.9;

    for (let i = 0; i < 7; i++) {
        const change = (Math.random() - 0.4) * 0.05;
        value += value * change;
        data.push(Math.round(value));
    }

    return data;
}

function updateChart(total) {
    const ctx = document.getElementById("portfolioChart");
    if (!ctx) return;

    const data = generateHistory(total);

    if (portfolioChart) {
        portfolioChart.data.datasets[0].data = data;
        portfolioChart.update();
        return;
    }

    portfolioChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                data: data,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.1)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// ==========================
// MINI CHARTS (TOP CARDS)
// ==========================
function createMiniChart(id) {
    const el = document.getElementById(id);
    if (!el) return;

    new Chart(el, {
        type: "line",
        data: {
            labels: ["", "", "", "", "", "", ""],
            datasets: [{
                data: Array.from({ length: 7 }, () => Math.random() * 100),
                borderColor: "#22c55e",
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// Create charts
createMiniChart("btcChart");
createMiniChart("ethChart");
createMiniChart("solChart");

// ==========================
// MAIN UI UPDATE
// ==========================
function updateUI() {
    let total = 0;

    Object.keys(balances).forEach(symbol => {
        total += balances[symbol] * (prices[symbol] || 0);
    });

    // Total balance
    const totalEl = document.getElementById("totalValue");
    if (totalEl) {
        totalEl.textContent =
            "$" + total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    }

    updateTopCards();
    renderPortfolio();
    updateChart(total);
}

// ==========================
// INIT
// ==========================
fetchPrices();
setInterval(fetchPrices, 60000);
