const balances = {
    BTC: 0.42,
    ETH: 3.8,
    SOL: 120,
    BNB: 8,
    XRP: 1500
};

const symbolToId = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    XRP: "ripple"
};

let prices = {};

/* Create table */
const table = document.getElementById("cryptoTable");

Object.keys(balances).forEach(symbol => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${symbol}</td>
        <td>${balances[symbol]}</td>
        <td class="value" id="value-${symbol}">$0.00</td>
        <td><canvas id="graph-${symbol}"></canvas></td>
    `;

    table.appendChild(row);

    new Chart(document.getElementById(`graph-${symbol}`), {
        type: "line",
        data: {
            labels: ["", "", "", "", "", "", ""],
            datasets: [{
                data: [10, 12, 11, 13, 14, 15, 16],
                borderColor: "#58a6ff",
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
});

/* Fetch prices */
async function fetchPrices() {
    const ids = Object.values(symbolToId).join(",");

    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );

    const data = await res.json();

    Object.keys(symbolToId).forEach(symbol => {
        prices[symbol] = data[symbolToId[symbol]].usd;
    });

    updateValues();
}

function updateValues() {
    let total = 0;

    Object.keys(balances).forEach(symbol => {
        const amount = balances[symbol];
        const price = prices[symbol] || 0;

        const usdValue = amount * price;

        document.getElementById(`value-${symbol}`).textContent =
            "$" + usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 });

        total += usdValue;
    });

    document.getElementById("totalValue").textContent =
        "$" + total.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

/* Portfolio chart */
new Chart(document.getElementById("portfolioChart"), {
    type: "line",
    data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            data: [20000, 21000, 22000, 23000, 24000, 25000, 26000],
            borderColor: "#1f6feb",
            fill: true
        }]
    }
});

fetchPrices();
setInterval(fetchPrices, 60000);
