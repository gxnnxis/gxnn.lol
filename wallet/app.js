// ==========================
// REALISTIC USER BALANCES
// ==========================
const balances = {
    BTC: 0.42,
    ETH: 3.8,
    SOL: 120,
    BNB: 8,
    XRP: 1500
};

// Map symbols → CoinGecko IDs
const symbolToId = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    XRP: "ripple"
};

let prices = {};

// ==========================
// BUILD TABLE
// ==========================
const table = document.getElementById("cryptoTable");

Object.keys(balances).forEach(symbol => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <strong>${symbol}</strong><br>
            <span style="color:#6b7280;font-size:12px">${symbol}</span>
        </td>
        <td>${balances[symbol].toLocaleString()}</td>
        <td class="value" id="value-${symbol}">$0.00</td>
    `;

    table.appendChild(row);
});

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
            const id = symbolToId[symbol];
            prices[symbol] = data[id]?.usd || 0;
        });

        updateValues();
    } catch (err) {
        console.error("Price fetch failed:", err);
    }
}

// ==========================
// UPDATE UI VALUES
// ==========================
function updateValues() {
    let total = 0;

    Object.keys(balances).forEach(symbol => {
        const amount = balances[symbol];
        const price = prices[symbol] || 0;

        const usdValue = amount * price;

        const cell = document.getElementById(`value-${symbol}`);
        if (cell) {
            cell.textContent =
                "$" + usdValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
        }

        total += usdValue;
    });

    document.getElementById("totalValue").textContent =
        "$" + total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
}

// ==========================
// PORTFOLIO CHART (REALISTIC SIMULATION)
// ==========================
function generatePortfolioHistory(baseValue) {
    const data = [];
    let value = baseValue * 0.9;

    for (let i = 0; i < 7; i++) {
        const change = (Math.random() - 0.4) * 0.05;
        value += value * change;
        data.push(Math.round(value));
    }

    return data;
}

let portfolioChart;

function updatePortfolioChart(totalValue) {
    const ctx = document.getElementById("portfolioChart");

    if (!ctx) return;

    const history = generatePortfolioHistory(totalValue);

    if (portfolioChart) {
        portfolioChart.data.datasets[0].data = history;
        portfolioChart.update();
        return;
    }

    portfolioChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                data: history,
                borderColor: "#1652f0",
                backgroundColor: "rgba(22,82,240,0.1)",
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
// EXTEND updateValues TO UPDATE CHART
// ==========================
const originalUpdateValues = updateValues;

updateValues = function () {
    let total = 0;

    Object.keys(balances).forEach(symbol => {
        const amount = balances[symbol];
        const price = prices[symbol] || 0;
        const usdValue = amount * price;

        const cell = document.getElementById(`value-${symbol}`);
        if (cell) {
            cell.textContent =
                "$" + usdValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
        }

        total += usdValue;
    });

    const totalFormatted =
        "$" + total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    document.getElementById("totalValue").textContent = totalFormatted;

    updatePortfolioChart(total);
};

// ==========================
// INIT
// ==========================
fetchPrices();
setInterval(fetchPrices, 60000);
