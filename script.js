"use strict";


/* ==============================
   STORAGE
============================== */

const EXPENSE_KEY = "myExpenses";
const THEME_KEY = "expenseTheme";

const RESET_PIN = "1234";

const MAX_ATTEMPTS = 3;

const LOCK_TIME = 60 * 1000;


let expenses = [];

let resetAttempts = 0;

let lockedUntil = 0;


/* ==============================
   ELEMENTS
============================== */

const expenseForm =
    document.getElementById("expenseForm");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const noteInput =
    document.getElementById("note");

const expenseList =
    document.getElementById("expenseList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const monthTotal =
    document.getElementById("monthTotal");

const todayTotal =
    document.getElementById("todayTotal");

const entryCount =
    document.getElementById("entryCount");

const historyCount =
    document.getElementById("historyCount");

const exportBtn =
    document.getElementById("exportBtn");

const resetBtn =
    document.getElementById("resetBtn");

const themeBtn =
    document.getElementById("themeBtn");


/* MODALS */

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


/* ==============================
   HELPERS
============================== */

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

        console.error(error);

        expenses = [];
    }
}


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

    return String(number).padStart(2, "0");
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


/* ==============================
   DASHBOARD
============================== */

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
}


/* ==============================
   RENDER
============================== */

function renderExpenses() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        expenses.filter(expense => {

            const text = (

                expense.category +
                " " +
                expense.note +
                " " +
                expense.amount

            ).toLowerCase();


            return text.includes(query);
        });


    expenseList.innerHTML = "";


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        if (expenses.length > 0) {

            emptyState.textContent =
                "No matching expenses.";
        }

        else {

            emptyState.textContent =
                "No expenses yet.";
        }

        return;
    }


    emptyState.style.display =
        "none";


    filtered.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );


    filtered.forEach(expense => {

        const item =
            document.createElement("div");

        item.className =
            "expense-item";


        item.innerHTML = `

            <div class="expense-icon">
                ${categoryIcon(expense.category)}
            </div>

            <div class="expense-info">

                <div class="expense-category">
                    ${escapeHTML(expense.category)}
                </div>

                <div class="expense-note">
                    ${
                        escapeHTML(
                            expense.note || "No note"
                        )
                    }
                </div>

                <div class="expense-date">
                    ${formatDate(expense.createdAt)}
                </div>

            </div>


            <div class="expense-right">

                <div class="expense-amount">
                    ${formatMoney(expense.amount)}
                </div>

                <button
                    class="delete-btn"
                    data-id="${escapeHTML(expense.id)}"
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
            () => deleteExpense(expense.id)
        );


        expenseList.appendChild(item);
    });
}


/* ==============================
   ADD EXPENSE
============================== */

expenseForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const amount =
            Number(amountInput.value);


        const category =
            categoryInput.value;


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

            note,

            createdAt:
                new Date().toISOString()
        };


        expenses.push(expense);


        saveExpenses();


        expenseForm.reset();


        updateDashboard();

        renderExpenses();


        amountInput.focus();
    }
);


/* ==============================
   DELETE
============================== */

function deleteExpense(id) {

    const expense =
        expenses.find(
            item => item.id === id
        );


    if (!expense) {

        return;
    }


    const confirmed =
        confirm(
            `Delete ${formatMoney(expense.amount)} expense?`
        );


    if (!confirmed) {

        return;
    }


    expenses =
        expenses.filter(
            item => item.id !== id
        );


    saveExpenses();

    updateDashboard();

    renderExpenses();
}


/* ==============================
   SEARCH
============================== */

searchInput.addEventListener(
    "input",
    renderExpenses
);


/* ==============================
   EXPORT TXT
============================== */

function exportTXT() {

    if (expenses.length === 0) {

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
                Number(expense.amount) || 0;

            total += amount;


            txt +=
                `${index + 1}. ${expense.category}\n`;

            txt +=
                `Amount: ${formatMoney(amount)}\n`;

            txt +=
                `Note: ${expense.note || "No note"}\n`;

            txt +=
                `Date: ${formatDate(expense.createdAt)}\n`;

            txt +=
                "------------------------------\n";
        }
    );


    txt += "\n";

    txt +=
        `Total Expenses: ${formatMoney(total)}\n`;

    txt +=
        `Total Entries: ${sorted.length}\n`;

    txt +=
        `Exported: ${formatDate(new Date().toISOString())}\n`;


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


    const now =
        new Date();


    link.download =
        `MyExpense-${dateKey(now)}.txt`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


exportBtn.addEventListener(
    "click",
    exportTXT
);


/* ==============================
   RESET SECURITY
============================== */

resetBtn.addEventListener(
    "click",
    openPinModal
);


function openPinModal() {

    pinInput.value = "";

    pinError.textContent = "";

    pinModal.classList.remove(
        "hidden"
    );

    setTimeout(
        () => pinInput.focus(),
        100
    );
}


function closePinModal() {

    pinModal.classList.add(
        "hidden"
    );
}


function closeConfirmModal() {

    confirmModal.classList.add(
        "hidden"
    );
}


cancelPinBtn.addEventListener(
    "click",
    closePinModal
);


cancelConfirmBtn.addEventListener(
    "click",
    closeConfirmModal
);


/* ==============================
   VERIFY PIN
============================== */

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
                (lockedUntil - now) / 1000
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

        resetAttempts = 0;

        lockedUntil = 0;

        closePinModal();

        confirmModal.classList.remove(
            "hidden"
        );

        return;
    }


    resetAttempts++;


    if (
        resetAttempts >= MAX_ATTEMPTS
    ) {

        lockedUntil =
            Date.now() +
            LOCK_TIME;

        resetAttempts = 0;


        pinError.textContent =
            "3 wrong attempts. Reset locked for 60 seconds.";

        return;
    }


    const remaining =
        MAX_ATTEMPTS -
        resetAttempts;


    pinError.textContent =
        `Wrong PIN. ${remaining} attempt(s) remaining.`;
}


/* ==============================
   CONFIRM RESET
============================== */

confirmResetBtn.addEventListener(
    "click",
    () => {

        expenses = [];

        saveExpenses();


        closeConfirmModal();


        updateDashboard();

        renderExpenses();


        alert(
            "All expense data has been deleted."
        );
    }
);


/* ==============================
   THEME
============================== */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );
    }
}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );


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


/* ==============================
   SERVICE WORKER
============================== */

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
                            "Service Worker registration failed:",
                            error
                        );
                    }
                );
        }
    );
}


/* ==============================
   START
============================== */

loadTheme();

loadExpenses();

updateDashboard();

renderExpenses();
