"use strict";

/* =========================================
   MyExpense - Updated Complete App
========================================= */

const EXPENSE_KEY = "myExpenses";
const SAVINGS_KEY = "mySavings";
const THEME_KEY = "expenseTheme";
const BUDGET_KEY = "myDailyBudget";

const RESET_PIN = "1234";
const SAVINGS_PIN = "2233";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60 * 1000;

const MIN_SAVINGS = 10;
const DAILY_GOAL = 10;

const INITIAL_EXPENSE_LIMIT = 5;

let expenses = [];
let savings = [];

let resetAttempts = 0;
let lockedUntil = 0;

let savingsUnlocked = false;
let activeFilter = "All";

let showAllExpenses = false;


/* =========================================
   ELEMENTS
========================================= */

const expenseForm =
    document.getElementById("expenseForm");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const foodSubGroup =
    document.getElementById("foodSubGroup");

const foodSubInput =
    document.getElementById("foodSub");

const noteInput =
    document.getElementById("note");

const expenseList =
    document.getElementById("expenseList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const filterRow =
    document.getElementById("filterRow");

const monthTotal =
    document.getElementById("monthTotal");

const todayTotal =
    document.getElementById("todayTotal");

const entryCount =
    document.getElementById("entryCount");

const historyCount =
    document.getElementById("historyCount");

const expenseShownText =
    document.getElementById("expenseShownText");

const historyActions =
    document.getElementById("historyActions");

const showMoreBtn =
    document.getElementById("showMoreBtn");

const showLessBtn =
    document.getElementById("showLessBtn");

const exportBtn =
    document.getElementById("exportBtn");

const backupBtn =
    document.getElementById("backupBtn");

const restoreBtn =
    document.getElementById("restoreBtn");

const restoreInput =
    document.getElementById("restoreInput");

const resetBtn =
    document.getElementById("resetBtn");

const themeBtn =
    document.getElementById("themeBtn");

const chartWrap =
    document.getElementById("chartWrap");

const chartEmpty =
    document.getElementById("chartEmpty");

const savingsChartWrap =
    document.getElementById("savingsChartWrap");

const savingsChartEmpty =
    document.getElementById("savingsChartEmpty");

const pinModal =
    document.getElementById("pinModal");

const confirmModal =
    document.getElementById("confirmModal");

const pinInput =
    document.getElementById("pinInput");

const pinError =
    document.getElementById("pinError");

const cancelPinBtn =
    document.getElementById("cancelPinBtn");

const verifyPinBtn =
    document.getElementById("verifyPinBtn");

const cancelConfirmBtn =
    document.getElementById("cancelConfirmBtn");

const confirmResetBtn =
    document.getElementById("confirmResetBtn");

const pandaBtn =
    document.getElementById("pandaBtn");

const savingsTotal =
    document.getElementById("savingsTotal");

const todaySaving =
    document.getElementById("todaySaving");

const dailyBar =
    document.getElementById("dailyBar");

const dailyStatus =
    document.getElementById("dailyStatus");

const addSavingsBtn =
    document.getElementById("addSavingsBtn");

const toggleSavingsBtn =
    document.getElementById("toggleSavingsBtn");

const savingsModal =
    document.getElementById("savingsModal");

const savingsAmount =
    document.getElementById("savingsAmount");

const savingsNote =
    document.getElementById("savingsNote");

const savingsError =
    document.getElementById("savingsError");

const cancelSavingsBtn =
    document.getElementById("cancelSavingsBtn");

const confirmSavingsBtn =
    document.getElementById("confirmSavingsBtn");

const pandaAnim =
    document.getElementById("pandaAnim");

const savingsPinModal =
    document.getElementById("savingsPinModal");

const savingsPinInput =
    document.getElementById("savingsPinInput");

const savingsPinError =
    document.getElementById("savingsPinError");

const cancelSavingsPinBtn =
    document.getElementById("cancelSavingsPinBtn");

const verifySavingsPinBtn =
    document.getElementById("verifySavingsPinBtn");


/* BUDGET */

const dailyBudgetInput =
    document.getElementById("dailyBudgetInput");

const saveBudgetBtn =
    document.getElementById("saveBudgetBtn");

const budgetMessage =
    document.getElementById("budgetMessage");

const budgetValue =
    document.getElementById("budgetValue");

const budgetSpent =
    document.getElementById("budgetSpent");

const budgetRemaining =
    document.getElementById("budgetRemaining");

const budgetBar =
    document.getElementById("budgetBar");

const budgetStatus =
    document.getElementById("budgetStatus");

const homeBudgetValue =
    document.getElementById("homeBudgetValue");

const homeSpentValue =
    document.getElementById("homeSpentValue");

const homeRemainingValue =
    document.getElementById("homeRemainingValue");

const homeBudgetBar =
    document.getElementById("homeBudgetBar");

const budgetHomeStatus =
    document.getElementById("budgetHomeStatus");

const homeBudgetBtn =
    document.getElementById("homeBudgetBtn");


/* REPORTS */

const trendWrap =
    document.getElementById("trendWrap");

const trendEmpty =
    document.getElementById("trendEmpty");

const dateHistoryWrap =
    document.getElementById("dateHistoryWrap");

const dateHistoryEmpty =
    document.getElementById("dateHistoryEmpty");


/* NAVIGATION */

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".app-page");

const quickButtons =
    document.querySelectorAll(".quick-btn");


/* =========================================
   STORAGE
========================================= */

function saveExpenses() {

    localStorage.setItem(
        EXPENSE_KEY,
        JSON.stringify(expenses)
    );
}


function loadExpenses() {

    try {

        const saved =
            localStorage.getItem(EXPENSE_KEY);

        expenses =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(expenses)) {
            expenses = [];
        }

    } catch (error) {

        console.error(
            "Expense loading error:",
            error
        );

        expenses = [];
    }
}


function saveSavings() {

    localStorage.setItem(
        SAVINGS_KEY,
        JSON.stringify(savings)
    );
}


function loadSavings() {

    try {

        const saved =
            localStorage.getItem(SAVINGS_KEY);

        savings =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(savings)) {
            savings = [];
        }

    } catch (error) {

        console.error(
            "Savings loading error:",
            error
        );

        savings = [];
    }
}


function getDailyBudget() {

    try {

        const value =
            localStorage.getItem(BUDGET_KEY);

        if (value === null) {
            return 0;
        }

        const budget =
            Number(value);

        return Number.isFinite(budget)
            ? Math.max(0, budget)
            : 0;

    } catch (error) {

        return 0;
    }
}


function saveDailyBudget(value) {

    localStorage.setItem(
        BUDGET_KEY,
        String(value)
    );
}


/* =========================================
   HELPERS
========================================= */

function formatMoney(amount) {

    return "৳" +
        Number(amount || 0).toLocaleString(
            "en-BD",
            {
                maximumFractionDigits: 2
            }
        );
}


function pad(number) {

    return String(number)
        .padStart(2, "0");
}


function dateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate())
    );
}


function monthKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1)
    );
}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatDay(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-BD",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
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


/* =========================================
   NAVIGATION
========================================= */

function showPage(pageName) {

    pages.forEach(page => {

        page.classList.toggle(
            "active-page",
            page.id ===
                `page-${pageName}`
        );
    });


    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageName === "reports") {

        renderSpendingTrends();

        renderDateHistory();
    }


    if (pageName === "more") {

        updateBudgetUI();
    }


    if (pageName === "panda") {

        updateSavingsUI();
    }
}


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showPage(
                button.dataset.page
            );
        }
    );
});


quickButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showPage(
                button.dataset.page
            );
        }
    );
});


homeBudgetBtn.addEventListener(
    "click",
    () => {

        showPage("more");

        setTimeout(
            () => {

                dailyBudgetInput.focus();

                dailyBudgetInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            250
        );
    }
);


/* =========================================
   THEME
========================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(THEME_KEY);

    if (theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        THEME_KEY,
        isDark
            ? "dark"
            : "light"
    );
}


themeBtn.addEventListener(
    "click",
    toggleTheme
);


/* =========================================
   DASHBOARD
========================================= */

function getTodayExpenseTotal() {

    const today =
        dateKey(new Date());

    return expenses.reduce(
        (total, expense) => {

            const date =
                new Date(expense.createdAt);

            if (
                dateKey(date) === today
            ) {

                return total +
                    (Number(expense.amount) || 0);
            }

            return total;

        },
        0
    );
}


function updateDashboard() {

    const now =
        new Date();

    const today =
        dateKey(now);

    const currentMonth =
        monthKey(now);

    let todaySum = 0;
    let monthSum = 0;


    expenses.forEach(expense => {

        const date =
            new Date(expense.createdAt);

        const amount =
            Number(expense.amount) || 0;


        if (
            dateKey(date) === today
        ) {

            todaySum += amount;
        }


        if (
            monthKey(date) === currentMonth
        ) {

            monthSum += amount;
        }

    });


    monthTotal.textContent =
        formatMoney(monthSum);

    todayTotal.textContent =
        formatMoney(todaySum);

    entryCount.textContent =
        expenses.length;

    historyCount.textContent =
        `${expenses.length} ${
            expenses.length === 1
                ? "entry"
                : "entries"
        }`;


    updateBudgetUI();
}


/* =========================================
   RENDER EXPENSES
========================================= */

function getFilteredExpenses() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        expenses.filter(expense => {

            if (
                activeFilter !== "All" &&
                expense.category !==
                    activeFilter
            ) {

                return false;
            }


            const text =
                `${expense.category} ` +
                `${expense.sub || ""} ` +
                `${expense.note || ""} ` +
                `${expense.amount}`;


            return text
                .toLowerCase()
                .includes(query);
        });


    filtered.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );


    return filtered;
}


function renderExpenses() {

    const filtered =
        getFilteredExpenses();


    expenseList.innerHTML = "";


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        emptyState.textContent =
            expenses.length > 0
                ? "No matching expenses."
                : "No expenses yet.";


        historyActions.classList.add(
            "hidden"
        );

        expenseShownText.textContent =
            "Showing 0";

        return;
    }


    emptyState.style.display =
        "none";


    const shouldLimit =
        !showAllExpenses;


    const visible =
        shouldLimit
            ? filtered.slice(
                0,
                INITIAL_EXPENSE_LIMIT
            )
            : filtered;


    visible.forEach(expense => {

        const item =
            document.createElement("div");


        item.className =
            "expense-item";


        const subBadge =
            expense.sub
                ? `
                    <span class="expense-sub">
                        ${subIcon(expense.sub)}
                        ${escapeHTML(expense.sub)}
                    </span>
                  `
                : "";


        item.innerHTML = `

            <div class="expense-icon">
                ${categoryIcon(
                    expense.category
                )}
            </div>

            <div class="expense-info">

                <div class="expense-category">
                    ${escapeHTML(
                        expense.category
                    )}
                    ${subBadge}
                </div>

                <div class="expense-note">
                    ${escapeHTML(
                        expense.note ||
                        "No note"
                    )}
                </div>

                <div class="expense-date">
                    ${formatDate(
                        expense.createdAt
                    )}
                </div>

            </div>

            <div class="expense-right">

                <div class="expense-amount">
                    ${formatMoney(
                        expense.amount
                    )}
                </div>

                <button
                    class="delete-btn"
                    data-id="${escapeHTML(
                        expense.id
                    )}"
                    type="button"
                >
                    Delete
                </button>

            </div>
        `;


        const deleteBtn =
            item.querySelector(
                ".delete-btn"
            );


        deleteBtn.addEventListener(
            "click",
            () => deleteExpense(
                expense.id
            )
        );


        expenseList.appendChild(item);
    });


    expenseShownText.textContent =
        `Showing ${visible.length} of ${filtered.length}`;


    if (
        filtered.length >
        INITIAL_EXPENSE_LIMIT
    ) {

        historyActions.classList.remove(
            "hidden"
        );


        showMoreBtn.classList.toggle(
            "hidden",
            showAllExpenses
        );


        showLessBtn.classList.toggle(
            "hidden",
            !showAllExpenses
        );

    } else {

        historyActions.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   SHOW MORE / LESS
========================================= */

showMoreBtn.addEventListener(
    "click",
    () => {

        showAllExpenses = true;

        renderExpenses();
    }
);


showLessBtn.addEventListener(
    "click",
    () => {

        showAllExpenses = false;

        renderExpenses();

        expenseList.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


/* =========================================
   FOOD SUB TYPE
========================================= */

categoryInput.addEventListener(
    "change",
    () => {

        if (
            categoryInput.value === "Food"
        ) {

            foodSubGroup
                .classList
                .remove("hidden");

        } else {

            foodSubGroup
                .classList
                .add("hidden");

            foodSubInput.value = "";
        }
    }
);


/* =========================================
   ADD EXPENSE
========================================= */

expenseForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const amount =
            Number(amountInput.value);

        const category =
            categoryInput.value;

        const sub =
            category === "Food"
                ? foodSubInput.value
                : "";

        const note =
            noteInput.value.trim();


        if (
            !amount ||
            amount <= 0 ||
            !category
        ) {

            alert(
                "Please enter a valid amount and category."
            );

            return;
        }


        const expense = {

            id:
                Date.now().toString() +
                Math.random()
                    .toString(16)
                    .slice(2),

            amount,

            category,

            sub,

            note,

            createdAt:
                new Date().toISOString()
        };


        expenses.push(expense);

        saveExpenses();


        expenseForm.reset();

        foodSubGroup
            .classList
            .add("hidden");


        showAllExpenses = false;


        updateDashboard();

        renderExpenses();

        renderCategoryChart();

        renderSpendingTrends();

        renderDateHistory();


        amountInput.focus();
    }
);


/* =========================================
   DELETE EXPENSE
========================================= */

function deleteExpense(id) {

    const expense =
        expenses.find(
            item =>
                item.id === id
        );


    if (!expense) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${formatMoney(
                expense.amount
            )} expense?`
        );


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            item =>
                item.id !== id
        );


    saveExpenses();


    updateDashboard();

    renderExpenses();

    renderCategoryChart();

    renderSpendingTrends();

    renderDateHistory();
}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    () => {

        showAllExpenses = false;

        renderExpenses();
    }
);


/* =========================================
   FILTERS
========================================= */

filterRow.addEventListener(
    "click",
    event => {

        const chip =
            event.target.closest(
                ".filter-chip"
            );


        if (!chip) {
            return;
        }


        activeFilter =
            chip.dataset.filter;


        showAllExpenses = false;


        filterRow
            .querySelectorAll(
                ".filter-chip"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button === chip
                );
            });


        renderExpenses();
    }
);


/* =========================================
   CATEGORY CHART
========================================= */

const CATEGORIES = [

    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Mobile",
    "Other"

];


function monthExpenseTotals() {

    const currentMonth =
        monthKey(new Date());

    const totals = {};


    CATEGORIES.forEach(
        category => {
            totals[category] = 0;
        }
    );


    expenses.forEach(expense => {

        const date =
            new Date(expense.createdAt);


        if (
            monthKey(date) !==
            currentMonth
        ) {

            return;
        }


        const category =
            expense.category;


        if (
            !(category in totals)
        ) {

            totals[category] = 0;
        }


        totals[category] +=
            Number(expense.amount) || 0;
    });


    return totals;
}


function renderCategoryChart() {

    const totals =
        monthExpenseTotals();


    const entries =
        Object.entries(totals)
            .filter(
                ([, value]) =>
                    value > 0
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    chartWrap.innerHTML = "";


    if (entries.length === 0) {

        chartEmpty.style.display =
            "block";

        return;
    }


    chartEmpty.style.display =
        "none";


    const max =
        Math.max(
            ...entries.map(
                entry =>
                    entry[1]
            )
        );


    entries.forEach(
        ([category, value]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "chart-row";


            const percentage =
                max > 0
                    ? (value / max) * 100
                    : 0;


            row.innerHTML = `

                <div class="chart-label">
                    ${categoryIcon(
                        category
                    )}
                    ${escapeHTML(
                        category
                    )}
                </div>

                <div class="chart-bar-track">

                    <div
                        class="chart-bar-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <div class="chart-value">
                    ${formatMoney(value)}
                </div>

            `;


            row.addEventListener(
                "click",
                () => {

                    activeFilter =
                        category;


                    filterRow
                        .querySelectorAll(
                            ".filter-chip"
                        )
                        .forEach(button => {

                            button.classList.toggle(
                                "active",
                                button.dataset.filter ===
                                    category
                            );
                        });


                    showAllExpenses = false;


                    renderExpenses();


                    showPage("expenses");


                    setTimeout(
                        () => {

                            expenseList.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        },
                        100
                    );
                }
            );


            chartWrap.appendChild(row);
        }
    );
}


/* =========================================
   DAILY BUDGET
========================================= */

function updateBudgetUI() {

    const budget =
        getDailyBudget();

    const spent =
        getTodayExpenseTotal();


    const remaining =
        budget - spent;


    /* More page */

    budgetValue.textContent =
        formatMoney(budget);

    budgetSpent.textContent =
        formatMoney(spent);


    if (budget === 0) {

        budgetRemaining.textContent =
            "৳0";

        budgetBar.style.width =
            "0%";

        budgetStatus.textContent =
            "No daily budget set.";

        budgetStatus.className =
            "budget-status";

    } else if (remaining >= 0) {

        budgetRemaining.textContent =
            formatMoney(remaining);

        const percentage =
            Math.min(
                (spent / budget) * 100,
                100
            );

        budgetBar.style.width =
            `${percentage}%`;

        budgetStatus.textContent =
            `${formatMoney(
                remaining
            )} remaining today.`;

        budgetStatus.className =
            "budget-status good";

    } else {

        const over =
            Math.abs(remaining);

        budgetRemaining.textContent =
            `-${formatMoney(over)}`;

        budgetBar.style.width =
            "100%";

        budgetStatus.textContent =
            `⚠️ Over budget by ${formatMoney(
                over
            )}.`;

        budgetStatus.className =
            "budget-status over";
    }


    /* Home */

    homeBudgetValue.textContent =
        formatMoney(budget);

    homeSpentValue.textContent =
        formatMoney(spent);


    if (budget === 0) {

        homeRemainingValue.textContent =
            "৳0";

        homeBudgetBar.style.width =
            "0%";

        budgetHomeStatus.textContent =
            "No daily budget set.";

    } else if (remaining >= 0) {

        homeRemainingValue.textContent =
            formatMoney(remaining);

        homeBudgetBar.style.width =
            `${Math.min(
                (spent / budget) * 100,
                100
            )}%`;

        budgetHomeStatus.textContent =
            "Today's budget is active.";

    } else {

        homeRemainingValue.textContent =
            `-${formatMoney(
                Math.abs(remaining)
            )}`;

        homeBudgetBar.style.width =
            "100%";

        budgetHomeStatus.textContent =
            `⚠️ Over budget by ${formatMoney(
                Math.abs(remaining)
            )}.`;
    }


    if (
        dailyBudgetInput &&
        document.activeElement !==
            dailyBudgetInput
    ) {

        dailyBudgetInput.value =
            budget > 0
                ? budget
                : "";
    }
}


saveBudgetBtn.addEventListener(
    "click",
    () => {

        const budget =
            Number(
                dailyBudgetInput.value
            );


        if (
            !Number.isFinite(budget) ||
            budget < 0
        ) {

            budgetMessage.textContent =
                "Please enter a valid budget.";

            return;
        }


        if (budget === 0) {

            saveDailyBudget(0);

            budgetMessage.textContent =
                "Daily budget removed.";

        } else {

            saveDailyBudget(budget);

            budgetMessage.textContent =
                `Daily budget set to ${formatMoney(
                    budget
                )}.`;
        }


        updateBudgetUI();


        setTimeout(
            () => {

                budgetMessage.textContent =
                    "";

            },
            2500
        );
    }
);


/* =========================================
   SAVINGS
========================================= */

function totalSavings() {

    return savings.reduce(
        (total, item) => {

            return total +
                (Number(item.amount) || 0);

        },
        0
    );
}


function todaySavingsTotal() {

    const today =
        dateKey(new Date());


    return savings.reduce(
        (total, item) => {

            const date =
                new Date(item.createdAt);


            if (
                dateKey(date) ===
                today
            ) {

                return total +
                    (Number(item.amount) || 0);
            }


            return total;

        },
        0
    );
}


function updateSavingsUI() {

    const total =
        totalSavings();

    const today =
        todaySavingsTotal();


    if (savingsUnlocked) {

        savingsTotal.textContent =
            formatMoney(total);

    } else {

        savingsTotal.textContent =
            "৳ • • • •";
    }


    todaySaving.textContent =
        formatMoney(today);


    const percentage =
        Math.min(
            (today / DAILY_GOAL) * 100,
            100
        );


    dailyBar.style.width =
        `${percentage}%`;


    if (
        today >= DAILY_GOAL
    ) {

        dailyStatus.textContent =
            "🎉 Daily goal completed!";

    } else {

        const remaining =
            DAILY_GOAL - today;

        dailyStatus.textContent =
            `Save ${formatMoney(
                remaining
            )} more to reach today's goal.`;
    }


    renderSavingsChart();
}


/* =========================================
   ADD SAVINGS MODAL
========================================= */

function openSavingsModal() {

    savingsAmount.value = "";

    savingsNote.value = "";

    savingsError.textContent =
        "";

    savingsModal
        .classList
        .remove("hidden");


    setTimeout(
        () =>
            savingsAmount.focus(),
        100
    );
}


function closeSavingsModal() {

    savingsModal
        .classList
        .add("hidden");
}


addSavingsBtn.addEventListener(
    "click",
    openSavingsModal
);


cancelSavingsBtn.addEventListener(
    "click",
    closeSavingsModal
);


confirmSavingsBtn.addEventListener(
    "click",
    addSavings
);


savingsAmount.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            addSavings();
        }
    }
);


function addSavings() {

    const amount =
        Number(
            savingsAmount.value
        );


    const note =
        savingsNote.value.trim();


    if (
        !amount ||
        amount < MIN_SAVINGS
    ) {

        savingsError.textContent =
            `Minimum saving is ${formatMoney(
                MIN_SAVINGS
            )}.`;

        return;
    }


    const saving = {

        id:
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2),

        amount,

        note,

        createdAt:
            new Date().toISOString()
    };


    savings.push(saving);

    saveSavings();


    closeSavingsModal();


    pandaBtn.classList.remove(
        "shake",
        "pop"
    );


    void pandaBtn.offsetWidth;


    pandaBtn.classList.add(
        "pop"
    );


    if (pandaAnim) {

        pandaAnim.classList.remove(
            "pop"
        );

        void pandaAnim.offsetWidth;

        pandaAnim.classList.add(
            "pop"
        );
    }


    updateSavingsUI();
}


/* =========================================
   SAVINGS PIN
========================================= */

pandaBtn.addEventListener(
    "click",
    openSavingsPin
);


toggleSavingsBtn.addEventListener(
    "click",
    openSavingsPin
);


function openSavingsPin() {

    if (savingsUnlocked) {

        savingsUnlocked = false;

        updateSavingsUI();

        return;
    }


    savingsPinInput.value = "";

    savingsPinError.textContent =
        "";


    savingsPinModal
        .classList
        .remove("hidden");


    setTimeout(
        () =>
            savingsPinInput.focus(),
        100
    );
}


function closeSavingsPin() {

    savingsPinModal
        .classList
        .add("hidden");
}


cancelSavingsPinBtn.addEventListener(
    "click",
    closeSavingsPin
);


verifySavingsPinBtn.addEventListener(
    "click",
    verifySavingsPIN
);


savingsPinInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            verifySavingsPIN();
        }
    }
);


function verifySavingsPIN() {

    const pin =
        savingsPinInput.value.trim();


    if (
        pin === SAVINGS_PIN
    ) {

        savingsUnlocked = true;

        closeSavingsPin();

        updateSavingsUI();

        return;
    }


    savingsPinError.textContent =
        "Incorrect savings PIN.";
}


/* =========================================
   MONTHLY SAVINGS CHART
========================================= */

function lastSixMonths() {

    const list = [];

    const now =
        new Date();


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        list.push({

            key:
                monthKey(date),

            label:
                date.toLocaleString(
                    "en-BD",
                    {
                        month: "short"
                    }
                )
        });
    }


    return list;
}


function renderSavingsChart() {

    const months =
        lastSixMonths();

    const totals = {};


    months.forEach(
        month => {
            totals[month.key] = 0;
        }
    );


    savings.forEach(item => {

        const key =
            monthKey(
                new Date(
                    item.createdAt
                )
            );


        if (
            key in totals
        ) {

            totals[key] +=
                Number(item.amount) || 0;
        }
    });


    savingsChartWrap.innerHTML =
        "";


    const hasData =
        months.some(
            month =>
                totals[month.key] > 0
        );


    if (!hasData) {

        savingsChartEmpty.style.display =
            "block";

        return;
    }


    savingsChartEmpty.style.display =
        "none";


    const max =
        Math.max(
            ...months.map(
                month =>
                    totals[month.key]
            )
        ) || 1;


    months.forEach(
        month => {

            const value =
                totals[month.key];


            const percentage =
                (value / max) * 100;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "chart-row";


            row.innerHTML = `

                <div class="chart-label">
                    ${escapeHTML(
                        month.label
                    )}
                </div>

                <div class="chart-bar-track">

                    <div
                        class="chart-bar-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <div class="chart-value">
                    ${
                        savingsUnlocked
                            ? formatMoney(value)
                            : "৳ • •"
                    }
                </div>

            `;


            savingsChartWrap.appendChild(
                row
            );
        }
    );
}


/* =========================================
   SPENDING DATA BY DATE
========================================= */

function getDailyTotals() {

    const totals = {};


    expenses.forEach(expense => {

        const key =
            dateKey(
                new Date(
                    expense.createdAt
                )
            );


        if (
            !totals[key]
        ) {

            totals[key] = 0;
        }


        totals[key] +=
            Number(expense.amount) || 0;
    });


    return totals;
}


function getLastDays(count) {

    const days = [];

    const now =
        new Date();


    for (
        let i = count - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - i
            );


        days.push({
            key: dateKey(date),
            date
        });
    }


    return days;
}


/* =========================================
   SPENDING TRENDS
========================================= */

function renderSpendingTrends() {

    const totals =
        getDailyTotals();


    const days =
        getLastDays(7);


    const hasData =
        days.some(
            day =>
                totals[day.key] > 0
        );


    trendWrap.innerHTML =
        "";


    if (!hasData) {

        trendEmpty.style.display =
            "block";

        return;
    }


    trendEmpty.style.display =
        "none";


    const max =
        Math.max(
            ...days.map(
                day =>
                    totals[day.key] || 0
            )
        ) || 1;


    let previousValue = null;


    days.forEach(day => {

        const value =
            totals[day.key] || 0;


        const percentage =
            (value / max) * 100;


        const higher =
            previousValue !== null &&
            value > previousValue;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "trend-row";


        const shortDate =
            day.date.toLocaleDateString(
                "en-BD",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short"
                }
            );


        let arrow = "";


        if (
            previousValue !== null
        ) {

            if (
                value > previousValue
            ) {

                arrow =
                    '<span class="trend-arrow">▲</span>';

            } else if (
                value < previousValue
            ) {

                arrow =
                    '<span class="trend-arrow">▼</span>';

            } else {

                arrow =
                    '<span class="trend-arrow">—</span>';
            }
        }


        row.innerHTML = `

            <div class="trend-date">
                ${escapeHTML(shortDate)}
            </div>

            <div class="trend-bar-track">

                <div
                    class="trend-bar ${
                        higher
                            ? "higher"
                            : ""
                    }"
                    style="width:${percentage}%"
                ></div>

            </div>

            <div class="trend-value">
                ${formatMoney(value)}
                ${arrow}
            </div>

        `;


        trendWrap.appendChild(row);


        previousValue =
            value;
    });
}


/* =========================================
   DATE-WISE HISTORY
========================================= */

function renderDateHistory() {

    const totals =
        getDailyTotals();


    const entries =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[0].localeCompare(a[0])
            );


    dateHistoryWrap.innerHTML =
        "";


    if (
        entries.length === 0
    ) {

        dateHistoryEmpty.style.display =
            "block";

        return;
    }


    dateHistoryEmpty.style.display =
        "none";


    entries.forEach(
        ([key, total]) => {

            const date =
                new Date(
                    `${key}T00:00:00`
                );


            const count =
                expenses.filter(
                    expense =>
                        dateKey(
                            new Date(
                                expense.createdAt
                            )
                        ) === key
                ).length;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "date-history-item";


            item.innerHTML = `

                <div>

                    <div class="date-history-date">
                        ${escapeHTML(
                            formatDay(
                                date.toISOString()
                            )
                        )}
                    </div>

                    <div class="date-history-count">
                        ${count}
                        ${
                            count === 1
                                ? "expense"
                                : "expenses"
                        }
                    </div>

                </div>

                <div class="date-history-total">
                    ${formatMoney(total)}
                </div>

            `;


            dateHistoryWrap.appendChild(
                item
            );
        }
    );
}


/* =========================================
   EXPORT TXT
========================================= */

function exportTXT() {

    if (
        expenses.length === 0
    ) {

        alert(
            "There are no expenses to export."
        );

        return;
    }


    const sorted =
        [...expenses].sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );


    let txt = "";


    txt +=
        "==============================\n";

    txt +=
        "          MyExpense\n";

    txt +=
        "     Expense Report\n";

    txt +=
        "==============================\n\n";


    let total = 0;


    sorted.forEach(
        (expense, index) => {

            const amount =
                Number(
                    expense.amount
                ) || 0;


            total += amount;


            txt +=
                `${index + 1}. ${
                    expense.category
                }${
                    expense.sub
                        ? " - " +
                          expense.sub
                        : ""
                }\n`;


            txt +=
                `Amount: ${
                    formatMoney(amount)
                }\n`;


            txt +=
                `Note: ${
                    expense.note ||
                    "No note"
                }\n`;


            txt +=
                `Date: ${
                    formatDate(
                        expense.createdAt
                    )
                }\n`;


            txt +=
                "------------------------------\n";
        }
    );


    txt += "\n";


    txt +=
        `Total Expenses: ${
            formatMoney(total)
        }\n`;


    txt +=
        `Total Entries: ${
            sorted.length
        }\n`;


    txt +=
        `Exported: ${
            formatDate(
                new Date().toISOString()
            )
        }\n`;


    const blob =
        new Blob(
            [txt],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `MyExpense-${
            dateKey(new Date())
        }.txt`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


exportBtn.addEventListener(
    "click",
    exportTXT
);


/* =========================================
   BACKUP
========================================= */

backupBtn.addEventListener(
    "click",
    () => {

        if (
            expenses.length === 0 &&
            savings.length === 0
        ) {

            alert(
                "Nothing to backup yet."
            );

            return;
        }


        const data = {

            app: "MyExpense",

            version: 3,

            exportedAt:
                new Date().toISOString(),

            dailyBudget:
                getDailyBudget(),

            expenses,

            savings
        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            `MyExpense-Backup-${
                dateKey(new Date())
            }.json`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);
    }
);


/* =========================================
   RESTORE
========================================= */

restoreBtn.addEventListener(
    "click",
    () => restoreInput.click()
);


restoreInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload = () => {

            try {

                const data =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !data ||
                    typeof data !== "object"
                ) {

                    throw new Error(
                        "Invalid backup"
                    );
                }


                const confirmed =
                    confirm(
                        "Restore will replace current data. Continue?"
                    );


                if (!confirmed) {
                    return;
                }


                expenses =
                    Array.isArray(
                        data.expenses
                    )
                        ? data.expenses
                        : [];


                savings =
                    Array.isArray(
                        data.savings
                    )
                        ? data.savings
                        : [];


                if (
                    data.dailyBudget !==
                    undefined
                ) {

                    const restoredBudget =
                        Number(
                            data.dailyBudget
                        );


                    saveDailyBudget(
                        Number.isFinite(
                            restoredBudget
                        )
                            ? Math.max(
                                0,
                                restoredBudget
                            )
                            : 0
                    );
                }


                saveExpenses();

                saveSavings();


                savingsUnlocked =
                    false;

                activeFilter =
                    "All";

                showAllExpenses =
                    false;


                filterRow
                    .querySelectorAll(
                        ".filter-chip"
                    )
                    .forEach(button => {

                        button.classList.toggle(
                            "active",
                            button.dataset.filter ===
                                "All"
                        );
                    });


                searchInput.value =
                    "";


                updateDashboard();

                renderExpenses();

                renderCategoryChart();

                updateSavingsUI();

                renderSavingsChart();

                renderSpendingTrends();

                renderDateHistory();

                updateBudgetUI();


                alert(
                    "Backup restored successfully."
                );


            } catch (error) {

                console.error(error);


                alert(
                    "Could not read this backup file."
                );


            } finally {

                restoreInput.value =
                    "";
            }
        };


        reader.readAsText(file);
    }
);


/* =========================================
   RESET SECURITY
========================================= */

resetBtn.addEventListener(
    "click",
    openPinModal
);


function openPinModal() {

    pinInput.value =
        "";

    pinError.textContent =
        "";


    pinModal
        .classList
        .remove("hidden");


    setTimeout(
        () =>
            pinInput.focus(),
        100
    );
}


function closePinModal() {

    pinModal
        .classList
        .add("hidden");
}


function closeConfirmModal() {

    confirmModal
        .classList
        .add("hidden");
}


cancelPinBtn.addEventListener(
    "click",
    closePinModal
);


cancelConfirmBtn.addEventListener(
    "click",
    closeConfirmModal
);


verifyPinBtn.addEventListener(
    "click",
    verifyPIN
);


pinInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            verifyPIN();
        }
    }
);


function verifyPIN() {

    const now =
        Date.now();


    if (
        now < lockedUntil
    ) {

        const seconds =
            Math.ceil(
                (
                    lockedUntil -
                    now
                ) / 1000
            );


        pinError.textContent =
            `Too many attempts. Try again in ${seconds}s.`;

        return;
    }


    const pin =
        pinInput.value.trim();


    if (
        pin === RESET_PIN
    ) {

        resetAttempts =
            0;

        lockedUntil =
            0;


        closePinModal();


        confirmModal
            .classList
            .remove("hidden");


        return;
    }


    resetAttempts++;


    if (
        resetAttempts >=
        MAX_ATTEMPTS
    ) {

        lockedUntil =
            Date.now() +
            LOCK_TIME;


        resetAttempts =
            0;


        pinError.textContent =
            "3 wrong attempts. Reset locked for 60 seconds.";


        return;
    }


    const remaining =
        MAX_ATTEMPTS -
        resetAttempts;


    pinError.textContent =
        `Wrong PIN. ${remaining} attempt${
            remaining === 1
                ? ""
                : "s"
        } remaining.`;
}


/* =========================================
   CONFIRM RESET
========================================= */

confirmResetBtn.addEventListener(
    "click",
    () => {

        expenses = [];

        savings = [];


        saveExpenses();

        saveSavings();


        saveDailyBudget(0);


        savingsUnlocked =
            false;

        activeFilter =
            "All";

        showAllExpenses =
            false;


        filterRow
            .querySelectorAll(
                ".filter-chip"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                        "All"
                );
            });


        searchInput.value =
            "";


        dailyBudgetInput.value =
            "";


        updateDashboard();

        renderExpenses();

        renderCategoryChart();

        updateSavingsUI();

        renderSavingsChart();

        renderSpendingTrends();

        renderDateHistory();

        updateBudgetUI();


        closeConfirmModal();


        alert(
            "All expenses, savings and daily budget have been deleted."
        );
    }
);


/* =========================================
   MODAL BACKDROP CLOSE
========================================= */

pinModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            pinModal
        ) {

            closePinModal();
        }
    }
);


confirmModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            confirmModal
        ) {

            closeConfirmModal();
        }
    }
);


savingsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            savingsModal
        ) {

            closeSavingsModal();
        }
    }
);


savingsPinModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            savingsPinModal
        ) {

            closeSavingsPin();
        }
    }
);


/* =========================================
   SERVICE WORKER
========================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register("./sw.js")
                    .then(
                        registration => {

                            console.log(
                                "Service Worker registered:",
                                registration.scope
                            );
                        }
                    )
                    .catch(
                        error => {

                            console.error(
                                "Service Worker error:",
                                error
                            );
                        }
                    );
            }
        );
    }
}


/* =========================================
   INITIALIZE
========================================= */

function initApp() {

    loadTheme();

    loadExpenses();

    loadSavings();


    updateDashboard();

    renderExpenses();

    renderCategoryChart();

    updateSavingsUI();

    renderSavingsChart();

    renderSpendingTrends();

    renderDateHistory();

    updateBudgetUI();


    registerServiceWorker();
}


initApp();

/* =========================================
   MYEXPENSE V5 FEATURES
========================================= */

const V5_MONEY_KEY = "myExpenseV5Money";
const V5_PEOPLE_KEY = "myExpenseV5People";
const V5_THEME_KEY = "myExpenseV5Theme";
const V5_PEOPLE_PIN = "2233";
let v5Money = [];
let v5People = [];
let v5MoneyMode = "in";
let v5FinanceDate = new Date();
let v5CalendarDate = new Date();
let v5PersonDirection = "receive";

function v5Load(key, fallback) { try { const x=localStorage.getItem(key); const y=x?JSON.parse(x):fallback; return Array.isArray(y)?y:fallback; } catch(e){ return fallback; } }
function v5Save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function v5MonthLabel(d){ return d.toLocaleDateString("en-BD",{month:"long",year:"numeric"}); }
function v5MonthKeyDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }
function v5SameMonth(value,d){ const x=new Date(value); return !Number.isNaN(x.getTime()) && monthKey(x)===v5MonthKeyDate(d); }
// Older MyExpense versions store expense dates in createdAt; V5 must read that field.
function v5ExpenseDate(expense){ return expense?.createdAt || expense?.date || expense?.timestamp || null; }
function v5MoneyDate(value){ return new Date(value).toLocaleString("en-BD",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }

function v5InitData(){
  v5Money=v5Load(V5_MONEY_KEY,[]); v5People=v5Load(V5_PEOPLE_KEY,[]);
  renderV5Money(); renderV5People(); renderV5Finance(); renderV5Calendar(); renderV5Themes();
}

function renderV5Money(){
  const list=document.getElementById("moneyList"), empty=document.getElementById("moneyEmpty"), count=document.getElementById("moneyCount"); if(!list)return;
  const sorted=[...v5Money].sort((a,b)=>new Date(b.date)-new Date(a.date)); count.textContent=`${sorted.length} entries`; list.innerHTML="";
  empty.classList.toggle("hidden",sorted.length>0);
  sorted.forEach(x=>{ const el=document.createElement("div"); el.className=`v5-item ${x.type}`; el.innerHTML=`<div><strong>${x.type==="in"?"＋":"−"} ${escapeHTML(x.category)}</strong><small>${escapeHTML(x.note||"")} ${v5MoneyDate(x.date)}</small></div><b>${x.type==="in"?"+":"−"}${formatMoney(x.amount).slice(1)}</b>`; list.appendChild(el); });
}

function renderV5Finance(){
  const label=document.getElementById("financeMonth"); if(!label)return; label.textContent=v5MonthLabel(v5FinanceDate);
  const m=v5MonthKeyDate(v5FinanceDate); const income=v5Money.filter(x=>x.type==="in"&&v5SameMonth(x.date,v5FinanceDate)).reduce((s,x)=>s+Number(x.amount),0); const out=v5Money.filter(x=>x.type==="out"&&v5SameMonth(x.date,v5FinanceDate)).reduce((s,x)=>s+Number(x.amount),0); const exp=expenses.filter(x=>v5SameMonth(v5ExpenseDate(x),v5FinanceDate)).reduce((s,x)=>s+(Number(x.amount)||0),0);
  document.getElementById("financeIncome").textContent=formatMoney(income); document.getElementById("financeExpense").textContent=formatMoney(exp); document.getElementById("financeOut").textContent=formatMoney(out); document.getElementById("financeBalance").textContent=formatMoney(income-exp-out);
  const box=document.getElementById("financePeople"), empty=document.getElementById("financePeopleEmpty"); box.innerHTML=""; const arr=v5AggregatePeople(); empty.classList.toggle("hidden",arr.length>0); arr.forEach(p=>{const el=document.createElement("div"); el.className=`v5-item person ${p.balance>=0?"receive":"pay"}`; el.innerHTML=`<div><strong>${escapeHTML(p.name)}</strong><small>${p.balance>=0?"🟢 I will get":"🔴 I will pay"}</small></div><b>${formatMoney(Math.abs(p.balance))}</b>`;box.appendChild(el);});
}
function v5AggregatePeople(){ const map={}; v5People.forEach(x=>{const k=x.name.trim().toLowerCase(); if(!map[k])map[k]={name:x.name,balance:0}; map[k].balance += x.direction==="receive"?Number(x.amount):-Number(x.amount);}); return Object.values(map).sort((a,b)=>Math.abs(b.balance)-Math.abs(a.balance)); }

function renderV5Calendar(){
 const title=document.getElementById("calendarMonth"), grid=document.getElementById("calendarGrid"); if(!grid)return; title.textContent=v5MonthLabel(v5CalendarDate); grid.innerHTML=""; const y=v5CalendarDate.getFullYear(),m=v5CalendarDate.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(); for(let i=0;i<first;i++){const e=document.createElement("div");e.className="calendar-day empty-day";grid.appendChild(e);} for(let day=1;day<=days;day++){const key=`${y}-${pad(m+1)}-${pad(day)}`;const total=expenses.filter(x=>{const d=v5ExpenseDate(x);return d && !Number.isNaN(new Date(d).getTime()) && dateKey(new Date(d))===key;}).reduce((s,x)=>s+(Number(x.amount)||0),0);const e=document.createElement("button");e.className="calendar-day"+(total?" has-expense":"");e.innerHTML=`<span>${day}</span>${total?`<small>${formatMoney(total)}</small>`:""}`;e.addEventListener("click",()=>{document.getElementById("calendarDetail").innerHTML=`<strong>${new Date(y,m,day).toLocaleDateString("en-BD",{weekday:"long",day:"numeric",month:"long"})}</strong><br>${total?"Spent "+formatMoney(total):"No expense recorded."}`;});grid.appendChild(e);} }

function renderV5People(){
 const list=document.getElementById("peopleList"),empty=document.getElementById("peopleEmpty");if(!list)return;list.innerHTML="";const arr=v5AggregatePeople();empty.classList.toggle("hidden",arr.length>0);arr.forEach(p=>{const el=document.createElement("div");el.className=`v5-item person ${p.balance>=0?"receive":"pay"}`;el.innerHTML=`<div><strong>${escapeHTML(p.name)}</strong><small>${p.balance>=0?"🟢 I will get":"🔴 I will pay"}</small></div><div class="person-actions"><b>${formatMoney(Math.abs(p.balance))}</b><button class="delete-v5" data-name="${escapeHTML(p.name)}">🗑️</button></div>`;list.appendChild(el);});
 list.querySelectorAll(".delete-v5").forEach(btn=>btn.addEventListener("click",()=>{const pin=prompt("Enter delete PIN");if(pin===V5_PEOPLE_PIN){const name=btn.dataset.name.toLowerCase();v5People=v5People.filter(x=>x.name.trim().toLowerCase()!==name);v5Save(V5_PEOPLE_KEY,v5People);renderV5People();renderV5Finance();}else if(pin!==null)alert("Wrong PIN.");}));
}

const V5_THEMES={
 liquid:{name:"🧊 Liquid Glass",desc:"Cyan + green glass",dark:false,vars:{"--bg-1":"#eef5f3","--bg-2":"#dcefeb","--cyan":"#16c9d5","--cyan-dark":"#0daab5","--green":"#63c98b","--green-dark":"#42a96c"}},
 neon:{name:"🌌 Neon Cyber",desc:"Dark blue + purple glow",dark:true,vars:{"--bg-1":"#101329","--bg-2":"#090b16","--cyan":"#6c8cff","--cyan-dark":"#4f6fe0","--green":"#b15cff","--green-dark":"#9144e0"}},
 ocean:{name:"🌊 Ocean",desc:"Cool blue glass",dark:false,vars:{"--bg-1":"#e8f7ff","--bg-2":"#d8eef4","--cyan":"#20b8ff","--cyan-dark":"#168dcc","--green":"#39e0c2","--green-dark":"#22aa92"}},
 aurora:{name:"💜 Aurora",desc:"Purple + cyan",dark:false,vars:{"--bg-1":"#f1edff","--bg-2":"#e0f4f4","--cyan":"#9b6cff","--cyan-dark":"#7446d9","--green":"#42d6d1","--green-dark":"#26aaa5"}},
 midnight:{name:"🌙 Midnight",desc:"Premium dark glass",dark:true,vars:{"--bg-1":"#10161c","--bg-2":"#080b0f","--cyan":"#7fdcff","--cyan-dark":"#5ab5d6","--green":"#7fe3ad","--green-dark":"#55bb82"}},
 sunset:{name:"🔥 Sunset",desc:"Warm orange + pink",dark:false,vars:{"--bg-1":"#fff1e8","--bg-2":"#f8e3ec","--cyan":"#ff8a4c","--cyan-dark":"#d96b31","--green":"#ff5fa2","--green-dark":"#d83d80"}},
 crystal:{name:"💎 Crystal",desc:"Clean icy glass",dark:false,vars:{"--bg-1":"#f4f8ff","--bg-2":"#e4f1f5","--cyan":"#6aa7ff","--cyan-dark":"#4c82d1","--green":"#72e5df","--green-dark":"#43bdb7"}}
};
function applyV5Theme(key){const t=V5_THEMES[key]||V5_THEMES.liquid;document.body.classList.toggle("dark",!!t.dark);Object.entries(t.vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));document.body.dataset.v5Theme=key;localStorage.setItem(V5_THEME_KEY,key);document.querySelectorAll(".theme-choice").forEach(x=>x.classList.toggle("selected",x.dataset.theme===key));}
function renderV5Themes(){const grid=document.getElementById("themeGrid");if(!grid)return;grid.innerHTML="";Object.entries(V5_THEMES).forEach(([key,t])=>{const b=document.createElement("button");b.className="theme-choice";b.dataset.theme=key;b.innerHTML=`<div class="theme-preview" style="--preview:${t.vars['--cyan']};--preview2:${t.vars['--green']}"></div><strong>${t.name}</strong><small>${t.desc}</small>`;b.onclick=()=>applyV5Theme(key);grid.appendChild(b);});applyV5Theme(localStorage.getItem(V5_THEME_KEY)||"liquid");}

function v5Setup(){
 const side=document.getElementById("sideMenu"),overlay=document.getElementById("sideOverlay");const close=()=>{side.classList.remove("open");overlay.classList.add("hidden")};document.getElementById("sideMenuBtn")?.addEventListener("click",()=>{side.classList.add("open");overlay.classList.remove("hidden")});document.getElementById("sideClose")?.addEventListener("click",close);overlay?.addEventListener("click",close);document.querySelectorAll(".side-item,.feature-card").forEach(b=>b.addEventListener("click",()=>{showPage(b.dataset.page);close();}));
 const cats={in:["Salary","Convance","Carton","Extra","Others"],out:["Dhar","Others"]};const cat=document.getElementById("moneyCategory"),form=document.getElementById("moneyForm"),submit=document.getElementById("moneySubmit");const setMode=mode=>{v5MoneyMode=mode;document.getElementById("moneyInTab").classList.toggle("active",mode==="in");document.getElementById("moneyOutTab").classList.toggle("active",mode==="out");cat.innerHTML=cats[mode].map(x=>`<option>${x}</option>`).join("");submit.textContent=mode==="in"?"＋ Add Money":"− Money Out";};document.getElementById("moneyInTab").onclick=()=>setMode("in");document.getElementById("moneyOutTab").onclick=()=>setMode("out");form?.addEventListener("submit",e=>{e.preventDefault();const amount=Number(document.getElementById("moneyAmount").value);if(!amount)return;v5Money.push({id:Date.now(),type:v5MoneyMode,amount,category:cat.value,note:document.getElementById("moneyNote").value.trim(),date:new Date().toISOString()});v5Save(V5_MONEY_KEY,v5Money);form.reset();setMode(v5MoneyMode);renderV5Money();renderV5Finance();});setMode("in");
 document.getElementById("financePrev").onclick=()=>{v5FinanceDate.setMonth(v5FinanceDate.getMonth()-1);renderV5Finance()};document.getElementById("financeNext").onclick=()=>{v5FinanceDate.setMonth(v5FinanceDate.getMonth()+1);renderV5Finance()};document.getElementById("calendarPrev").onclick=()=>{v5CalendarDate.setMonth(v5CalendarDate.getMonth()-1);renderV5Calendar()};document.getElementById("calendarNext").onclick=()=>{v5CalendarDate.setMonth(v5CalendarDate.getMonth()+1);renderV5Calendar()};
 const receive=document.getElementById("personReceive"),pay=document.getElementById("personPay");const setDir=d=>{v5PersonDirection=d;receive.classList.toggle("active",d==="receive");pay.classList.toggle("active",d==="pay")};receive.onclick=()=>setDir("receive");pay.onclick=()=>setDir("pay");document.getElementById("personForm")?.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("personName").value.trim(),amount=Number(document.getElementById("personAmount").value);if(!name||!amount)return;v5People.push({id:Date.now(),name,amount,direction:v5PersonDirection,note:document.getElementById("personNote").value.trim(),date:new Date().toISOString()});v5Save(V5_PEOPLE_KEY,v5People);e.target.reset();setDir("receive");renderV5People();renderV5Finance();});
 // Reset all: also clear V5 data after the existing reset handler runs.
 confirmResetBtn?.addEventListener("click",()=>{v5Money=[];v5People=[];v5Save(V5_MONEY_KEY,[]);v5Save(V5_PEOPLE_KEY,[]);renderV5Money();renderV5People();renderV5Finance();});
}

v5InitData();v5Setup();

