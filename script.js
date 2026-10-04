"use strict";


/* ==============================
   STORAGE
============================== */

const EXPENSE_KEY = "myExpenses";
const SAVINGS_KEY = "mySavings";
const THEME_KEY = "expenseTheme";

const RESET_PIN = "1234";
const SAVINGS_PIN = "2233";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60 * 1000;

const MIN_SAVINGS = 10;
const DAILY_GOAL = 10;


let expenses = [];
let savings = [];

let resetAttempts = 0;
let lockedUntil = 0;

let savingsUnlocked = false;
let activeFilter = "All";


/* ==============================
   ELEMENTS
============================== */

const expenseForm = document.getElementById("expenseForm");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const foodSubGroup = document.getElementById("foodSubGroup");
const foodSubInput = document.getElementById("foodSub");
const noteInput = document.getElementById("note");

const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterRow = document.getElementById("filterRow");

const monthTotal = document.getElementById("monthTotal");
const todayTotal = document.getElementById("todayTotal");
const entryCount = document.getElementById("entryCount");
const historyCount = document.getElementById("historyCount");

const exportBtn = document.getElementById("exportBtn");
const backupBtn = document.getElementById("backupBtn");
const restoreBtn = document.getElementById("restoreBtn");
const restoreInput = document.getElementById("restoreInput");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");

const chartWrap = document.getElementById("chartWrap");
const chartEmpty = document.getElementById("chartEmpty");
const savingsChartWrap = document.getElementById("savingsChartWrap");
const savingsChartEmpty = document.getElementById("savingsChartEmpty");

const pinModal = document.getElementById("pinModal");
const confirmModal = document.getElementById("confirmModal");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const cancelPinBtn = document.getElementById("cancelPinBtn");
const verifyPinBtn = document.getElementById("verifyPinBtn");
const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
const confirmResetBtn = document.getElementById("confirmResetBtn");

const pandaBtn = document.getElementById("pandaBtn");
const savingsTotal = document.getElementById("savingsTotal");
const todaySaving = document.getElementById("todaySaving");
const dailyBar = document.getElementById("dailyBar");
const dailyStatus = document.getElementById("dailyStatus");
const addSavingsBtn = document.getElementById("addSavingsBtn");
const toggleSavingsBtn = document.getElementById("toggleSavingsBtn");

const savingsModal = document.getElementById("savingsModal");
const savingsAmount = document.getElementById("savingsAmount");
const savingsNote = document.getElementById("savingsNote");
const savingsError = document.getElementById("savingsError");
const cancelSavingsBtn = document.getElementById("cancelSavingsBtn");
const confirmSavingsBtn = document.getElementById("confirmSavingsBtn");
const pandaAnim = document.getElementById("pandaAnim");

const savingsPinModal = document.getElementById("savingsPinModal");
const savingsPinInput = document.getElementById("savingsPinInput");
const savingsPinError = document.getElementById("savingsPinError");
const cancelSavingsPinBtn = document.getElementById("cancelSavingsPinBtn");
const verifySavingsPinBtn = document.getElementById("verifySavingsPinBtn");


/* ==============================
   HELPERS
============================== */

function saveExpenses() {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
    try {
        const saved = localStorage.getItem(EXPENSE_KEY);
        expenses = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(expenses)) expenses = [];
    } catch (error) {
        console.error(error);
        expenses = [];
    }
}

function saveSavings() {
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings));
}

function loadSavings() {
    try {
        const saved = localStorage.getItem(SAVINGS_KEY);
        savings = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(savings)) savings = [];
    } catch (error) {
        console.error(error);
        savings = [];
    }
}

function formatMoney(amount) {
    return "৳" + Number(amount || 0).toLocaleString("en-BD", {
        maximumFractionDigits: 2
    });
}

function pad(number) {
    return String(number).padStart(2, "0");
}

function dateKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function monthKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function categoryIcon(category) {
    const icons = {
        Food: "🍔",
        Transport: "🚗",
        Shopping: "🛍️",
        Bills: "🧾",
        Mobile: "📱",
        Other: "📦"
    };
    return icons[category] || "📦";
}

function subIcon(sub) {
    const icons = {
        Breakfast: "🍳",
        Lunch: "🍱",
        Dinner: "🍽️",
        Snack: "🍪"
    };
    return icons[sub] || "";
}


/* ==============================
   DASHBOARD
============================== */

function updateDashboard() {
    const now = new Date();
    const today = dateKey(now);
    const currentMonth = monthKey(now);

    let todaySum = 0;
    let monthSum = 0;

    expenses.forEach(expense => {
        const date = new Date(expense.createdAt);
        const amount = Number(expense.amount) || 0;

        if (dateKey(date) === today) todaySum += amount;
        if (monthKey(date) === currentMonth) monthSum += amount;
    });

    monthTotal.textContent = formatMoney(monthSum);
    todayTotal.textContent = formatMoney(todaySum);
    entryCount.textContent = expenses.length;
    historyCount.textContent = `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"}`;
}


/* ==============================
   RENDER EXPENSES
============================== */

function renderExpenses() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = expenses.filter(expense => {
        if (activeFilter !== "All" && expense.category !== activeFilter) {
            return false;
        }

        const text = (
            expense.category + " " +
            (expense.sub || "") + " " +
            expense.note + " " +
            expense.amount
        ).toLowerCase();

        return text.includes(query);
    });

    expenseList.innerHTML = "";

    if (filtered.length === 0) {
        emptyState.style.display = "block";
        emptyState.textContent = expenses.length > 0 ? "No matching expenses." : "No expenses yet.";
        return;
    }

    emptyState.style.display = "none";

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    filtered.forEach(expense => {
        const item = document.createElement("div");
        item.className = "expense-item";

        const subBadge = expense.sub
            ? `<span class="expense-sub">${subIcon(expense.sub)} ${escapeHTML(expense.sub)}</span>`
            : "";

        item.innerHTML = `
            <div class="expense-icon">
                ${categoryIcon(expense.category)}
            </div>

            <div class="expense-info">
                <div class="expense-category">
                    ${escapeHTML(expense.category)}
                    ${subBadge}
                </div>
                <div class="expense-note">
                    ${escapeHTML(expense.note || "No note")}
                </div>
                <div class="expense-date">
                    ${formatDate(expense.createdAt)}
                </div>
            </div>

            <div class="expense-right">
                <div class="expense-amount">
                    ${formatMoney(expense.amount)}
                </div>
                <button class="delete-btn" data-id="${escapeHTML(expense.id)}">
                    Delete
                </button>
            </div>
        `;

        const deleteBtn = item.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

        expenseList.appendChild(item);
    });
}


/* ==============================
   FOOD SUB-TYPE TOGGLE
============================== */

categoryInput.addEventListener("change", () => {
    if (categoryInput.value === "Food") {
        foodSubGroup.classList.remove("hidden");
    } else {
        foodSubGroup.classList.add("hidden");
        foodSubInput.value = "";
    }
});


/* ==============================
   ADD EXPENSE
============================== */

expenseForm.addEventListener("submit", event => {
    event.preventDefault();

    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const sub = category === "Food" ? foodSubInput.value : "";
    const note = noteInput.value.trim();

    if (!amount || amount <= 0 || !category) {
        alert("Please enter a valid amount and category.");
        return;
    }

    const expense = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        amount,
        category,
        sub,
        note,
        createdAt: new Date().toISOString()
    };

    expenses.push(expense);
    saveExpenses();
    expenseForm.reset();
    foodSubGroup.classList.add("hidden");

    updateDashboard();
    renderExpenses();
    renderCategoryChart();

    amountInput.focus();
});


/* ==============================
   DELETE
============================== */

function deleteExpense(id) {
    const expense = expenses.find(item => item.id === id);
    if (!expense) return;

    const confirmed = confirm(`Delete ${formatMoney(expense.amount)} expense?`);
    if (!confirmed) return;

    expenses = expenses.filter(item => item.id !== id);
    saveExpenses();
    updateDashboard();
    renderExpenses();
    renderCategoryChart();
}


/* ==============================
   SEARCH + FILTER
============================== */

searchInput.addEventListener("input", renderExpenses);

filterRow.addEventListener("click", event => {
    const chip = event.target.closest(".filter-chip");
    if (!chip) return;

    activeFilter = chip.dataset.filter;

    filterRow.querySelectorAll(".filter-chip").forEach(btn => {
        btn.classList.toggle("active", btn === chip);
    });

    renderExpenses();
});


/* ==============================
   CATEGORY CHART
============================== */

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Mobile", "Other"];

function monthExpenseTotals() {
    const currentMonth = monthKey(new Date());
    const totals = {};

    CATEGORIES.forEach(cat => { totals[cat] = 0; });

    expenses.forEach(expense => {
        const date = new Date(expense.createdAt);
        if (monthKey(date) !== currentMonth) return;

        const cat = expense.category;
        if (!(cat in totals)) totals[cat] = 0;
        totals[cat] += Number(expense.amount) || 0;
    });

    return totals;
}

function renderCategoryChart() {
    const totals = monthExpenseTotals();

    const entries = Object.entries(totals)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1]);

    chartWrap.innerHTML = "";

    if (entries.length === 0) {
        chartEmpty.style.display = "block";
        return;
    }

    chartEmpty.style.display = "none";

    const max = Math.max(...entries.map(e => e[1]));

    entries.forEach(([cat, value]) => {
        const row = document.createElement("div");
        row.className = "chart-row";
        row.dataset.cat = cat;

        const pct = max > 0 ? (value / max) * 100 : 0;

        row.innerHTML = `
            <div class="chart-label">
                ${categoryIcon(cat)} ${escapeHTML(cat)}
            </div>
            <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="chart-value">
                ${formatMoney(value)}
            </div>
        `;

        row.addEventListener("click", () => {
            activeFilter = cat;

            filterRow.querySelectorAll(".filter-chip").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.filter === cat);
            });

            renderExpenses();

            document.querySelector("#expenseList").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        chartWrap.appendChild(row);
    });
}


/* ==============================
   MONTHLY SAVINGS CHART
============================== */

function lastSixMonths() {
    const list = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push({
            key: monthKey(d),
            label: d.toLocaleString("en-BD", { month: "short" })
        });
    }

    return list;
}

function renderSavingsChart() {
    const months = lastSixMonths();
    const totals = {};

    months.forEach(m => { totals[m.key] = 0; });

    savings.forEach(item => {
        const key = monthKey(new Date(item.createdAt));
        if (key in totals) totals[key] += Number(item.amount) || 0;
    });

    savingsChartWrap.innerHTML = "";

    const hasData = months.some(m => totals[m.key] > 0);

    if (!hasData) {
        savingsChartEmpty.style.display = "block";
        return;
    }

    savingsChartEmpty.style.display = "none";

    const max = Math.max(...months.map(m => totals[m.key])) || 1;

    months.forEach(m => {
        const value = totals[m.key];
        const pct = (value / max) * 100;

        const row = document.createElement("div");
        row.className = "chart-row";

        row.innerHTML = `
            <div class="chart-label">
                ${escapeHTML(m.label)}
            </div>
            <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="chart-value">
                ${savingsUnlocked ? formatMoney(value) : "৳ • •"}
            </div>
        `;

        savingsChartWrap.appendChild(row);
    });
}


/* ==============================
   EXPORT TXT
============================== */

function exportTXT() {
    if (expenses.length === 0) {
        alert("There are no expenses to export.");
        return;
    }

    const sorted = [...expenses].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let txt = "";
    txt += "==============================\n";
    txt += "          MyExpense\n";
    txt += "     Expense Report\n";
    txt += "==============================\n\n";

    let total = 0;

    sorted.forEach((expense, index) => {
        const amount = Number(expense.amount) || 0;
        total += amount;

        txt += `${index + 1}. ${expense.category}${expense.sub ? " - " + expense.sub : ""}\n`;
        txt += `Amount: ${formatMoney(amount)}\n`;
        txt += `Note: ${expense.note || "No note"}\n`;
        txt += `Date: ${formatDate(expense.createdAt)}\n`;
        txt += "------------------------------\n";
    });

    txt += "\n";
    txt += `Total Expenses: ${formatMoney(total)}\n`;
    txt += `Total Entries: ${sorted.length}\n`;
    txt += `Exported: ${formatDate(new Date().toISOString())}\n`;

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `MyExpense-${dateKey(new Date())}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", exportTXT);


/* ==============================
   BACKUP JSON
============================== */

backupBtn.addEventListener("click", () => {
    if (expenses.length === 0 && savings.length === 0) {
        alert("Nothing to backup yet.");
        return;
    }

    const data = {
        app: "MyExpense",
        version: 1,
        exportedAt: new Date().toISOString(),
        expenses,
        savings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `MyExpense-Backup-${dateKey(new Date())}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});


/* ==============================
   RESTORE JSON
============================== */

restoreBtn.addEventListener("click", () => restoreInput.click());

restoreInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (!data || typeof data !== "object") {
                throw new Error("Invalid file");
            }

            const confirmed = confirm("Restore will replace current data. Continue?");
            if (!confirmed) return;

            expenses = Array.isArray(data.expenses) ? data.expenses : [];
            savings = Array.isArray(data.savings) ? data.savings : [];

            saveExpenses();
            saveSavings();

            updateDashboard();
            renderExpenses();
            renderCategoryChart();
            updateSavingsUI();
            renderSavingsChart();

            alert("Backup restored successfully.");
        } catch (error) {
            console.error(error);
            alert("Could not read this backup file.");
        }

        restoreInput.value = "";
    };

    reader.readAsText(file);
});


/* ==============================
   RESET SECURITY
============================== */

resetBtn.addEventListener("click", openPinModal);

function openPinModal() {
    pinInput.value = "";
    pinError.textContent = "";
    pinModal.classList.remove("hidden");
    setTimeout(() => pinInput.focus(), 100);
}

function closePinModal() {
    pinModal.classList.add("hidden");
}

function closeConfirmModal() {
    confirmModal.classList.add("hidden");
}

cancelPinBtn.addEventListener("click", closePinModal);
cancelConfirmBtn.addEventListener("click", closeConfirmModal);

verifyPinBtn.addEventListener("click", verifyPIN);

pinInput.addEventListener("keydown", event => {
    if (event.key === "Enter") verifyPIN();
});

function verifyPIN() {
    const now = Date.now();

    if (now < lockedUntil) {
        const seconds = Math.ceil((lockedUntil - now) / 1000);
        pinError.textContent = `Too many attempts. Try again in ${seconds}s.`;
        return;
    }

    const pin = pinInput.value.trim();

    if (pin === RESET_PIN) {
        resetAttempts = 0;
        lockedUntil = 0;
        closePinModal();
        confirmModal.classList.remove("hidden");
        return;
    }

    resetAttempts++;

    if (resetAttempts >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCK_TIME;
        resetAttempts = 0;
        pinError.textContent = "3 wrong attempts. Reset locked for 60 seconds.";
        return;
    }

    const remaining = MAX_ATT
