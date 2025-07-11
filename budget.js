// used to choose the display
let incomeExpenseContainer = document.querySelector('.income-expense');
let incomeBtn = document.querySelector('#income-entry');
let expenseBtn = document.querySelector('#expense-entry');

// controls two main input containers
let expenseContainer = document.querySelector('.expense-container');
let incomeContainer = document.querySelector('.income-container');

let addIncomeBtn = document.querySelector('#income-tab');
let addExpenseBtn = document.querySelector('#expense-tab');
let saveIncomeBtn = document.querySelector('#save-income');

let incomeForm = document.querySelector('#income-form');
let expenseForm = document.querySelector('#expense-form');

let changeForm;
let editingExpenseIndex = null;
let editingIncomeIndex = null;

function switchForm(form)
{
    if(form === "income")
    {
        incomeContainer.style.display = "block";
        expenseContainer.style.display = "none";
        incomeExpenseContainer.style.display = "none";
    }
    else if(form === "expense")
    {
        incomeContainer.style.display = "none";
        expenseContainer.style.display = "block";
        incomeExpenseContainer.style.display = "none";
    }
    else
    {
        incomeContainer.style.display = "none";
        expenseContainer.style.display = "none";
        incomeExpenseContainer.style.display = "block";
    }
}

incomeBtn.addEventListener("click", function()
{
    changeForm = "income";
    switchForm(changeForm);
});

expenseBtn.addEventListener("click", function()
{
    changeForm = "expense";
    switchForm(changeForm);
});

addExpenseBtn.addEventListener("click", function()
{
    changeForm = "expense";
    switchForm(changeForm);
});

addIncomeBtn.addEventListener("click", function()
{
    changeForm = "income";
    switchForm(changeForm);
});

incomeForm.addEventListener("submit", function(e)
{
    e.preventDefault();
    const income = parseFloat(document.querySelector('#income').value);
    if(!isNaN(income) && income > 0)
    {
        saveIncome(income); 
        updateTotalDisplay();
        incomeEntriesDisplay();
    }
    document.querySelector("#income").value = "";
});

expenseForm.addEventListener("submit", function(e)
{
    e.preventDefault();

    saveExpenses();
    updateTotalDisplay();
    expenseEntriesDisplay();

    document.querySelector("#expense").value = "";
});


// recently added
function ExpenseBook(expense, type, date)
{
    this.expense = expense;
    this.type = type;
    this.date = date;
}


// Calculate the sum of the user
function getSum()
{
    let totalIncome = getTotalIncome();
    let totalExpense = getTotalExpense();
    let total = 0;

    total = totalIncome - totalExpense
    return total;
}

// Calculate the total income
function getTotalIncome()
{
    const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
    return incomeEntry.reduce((sum, entry) => sum + entry.amount, 0);
}

// Calculate the total expenses
function getTotalExpense()
{
    const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
    return storeExp.reduce((sum, entry) => sum + entry.expense, 0);
}

// Displays the updated total
function updateTotalDisplay(){
    const totalIncome = getTotalIncome();
    const totalExpense = getTotalExpense();
    const sum = getSum();

    let infoEl = document.querySelector(".info-container");
    infoEl.innerHTML = "";

    let incomeInfo = document.createElement("div");
    incomeInfo.setAttribute("class", "totalincome-display");
    incomeInfo.innerHTML = `<div id="total-income">
                                <h4>Total Income: $${totalIncome.toFixed(2)}</h4>
                            </div>`;
    infoEl.appendChild(incomeInfo);

    let expenseInfo = document.createElement("div");
    expenseInfo.setAttribute("class", "totalexpense-display");
    expenseInfo.innerHTML = `<div id="total-expense">
                                <h4>Total Expense: $${totalExpense.toFixed(2)}</h4>
                            </div>`;
    infoEl.appendChild(expenseInfo);

    let sumInfo = document.createElement("div");
    sumInfo.setAttribute("class", "sum-display");
    sumInfo.innerHTML = `<div id="sum">
                                <h4>Net: $${sum.toFixed(2)}</h4>
                            </div>`;
    infoEl.appendChild(sumInfo);
}

function incomeEntriesDisplay()
{
    const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
    const incomeEntryEl = document.querySelector('.incomeentries-container');
    incomeEntryEl.innerHTML = "<h4>Income Entries:</h4>";

    for(let i = 0; i < incomeEntry.length; i++)
    {
        const entry = incomeEntry[i];
        const incomeEntriesInfo = document.createElement("div");
        incomeEntriesInfo.setAttribute("class", "incomeentry-display");
        incomeEntriesInfo.innerHTML = `<div id="incomeentry">
                                            <span>${i+1}:</span>
                                            <span>$${entry.amount.toFixed(2)} on ${entry.date}</span>
                                            <button type="button" class="incomedelete-btn" data-index="${i}">Delete</button>
                                            <button type="button" class="incomeedit-btn" data-index="${i}">Edit</button>`;
        incomeEntryEl.appendChild(incomeEntriesInfo);
    }

    const deleteIncomeBtn = document.querySelectorAll(".incomedelete-btn");
    deleteIncomeBtn.forEach(button => {
        button.addEventListener("click", function() {
            const index = parseInt(this.dataset.index);
            deleteIncome(index);
        });
    });
    
    const editIncomeBtn = document.querySelectorAll('.incomeedit-btn');
    editIncomeBtn.forEach(button => {
        button.addEventListener("click", function(){
            const index = parseInt(button.getAttribute("data-index"));
            const entry = incomeEntry[index];

            document.querySelector("#income").value = entry.amount;
            document.querySelector("#income-date").value = entry.date;
            editingIncomeIndex = index;
            switchForm("income");
            saveIncomeBtn.textContent = "Update Income";
        })
    })
}

function saveExpenses()
{
    const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
    let expense = parseFloat(document.querySelector('#expense').value);
    let type = document.querySelector('#expense-type').value;
    let date = document.querySelector('#expense-date').value;

    console.log("Saving expense with date:", date);

    if (!date) {
    alert("Please enter a valid date.");
    return;
    }

    if(!isNaN(expense) && expense > 0)
    {
        const newExpenseBook = new ExpenseBook(expense, type, date);

        if(editingExpenseIndex !== null)
        {
            storeExp[editingExpenseIndex] = newExpenseBook;
            editingExpenseIndex = null;
        }
        else
        {
            storeExp.push(newExpenseBook);
        }
        updateTotalDisplay();
        expenseEntriesDisplay();
        document.querySelector('#expense').value = "";
    }
    else
    {
        alert("Please enter a valid expense amount.");
    }

    localStorage.setItem("storeExp", JSON.stringify(storeExp));
}

function expenseEntriesDisplay()
{
    const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
    const expenseEntryEl = document.querySelector('.expenseentries-container');
    expenseEntryEl.innerHTML = "<h4>Expense Entries:</h4>";

    storeExp.forEach((entry, index) => {
        const expenseEntriesInfo = document.createElement("div");
        expenseEntriesInfo.setAttribute("class", "expenseentry-display");
        expenseEntriesInfo.innerHTML = `<div id="expenseentry">
                                            <span>${entry.type.toUpperCase()}:</span>
                                            <span>$${entry.expense.toFixed(2)} on ${entry.date}</span>
                                            <button type="button" class="expensedelete-btn" data-index="${index}">Delete</button>
                                            <button type="button" class="expenseedit-btn" data-index="${index}">Edit</button>`;
        expenseEntryEl.appendChild(expenseEntriesInfo);
    });

    const deleteExpenseBtn = document.querySelectorAll(".expensedelete-btn");
    deleteExpenseBtn.forEach(button => {
        button.addEventListener("click", function() {
            const index = parseInt(this.dataset.index);
            deleteExpense(index);
        });
    });

    const editExpenseBtn = document.querySelectorAll(".expenseedit-btn");
    editExpenseBtn.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute("data-index"));
            const entry = storeExp[index];

            document.querySelector("#expense").value = entry.expense;
            document.querySelector("#expense-type").value = entry.type;
            document.querySelector("#expense-date").value = entry.date;

            switchForm("expense");
            editingExpenseIndex = index;
        })
    })
}

function saveIncome(income)
{
    const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
    const date = document.querySelector('#income-date').value;

    console.log("Saving expense with date:", date);

    if(!date)
    {
        alert("Please enter a valid date.");
        return;
    }
    const month = getMonthFromDate(date);
    if(editingIncomeIndex !== null)
    {
        incomeEntry[editingIncomeIndex] = {
            amount: parseFloat(income),
            date: date
        };
        editingIncomeIndex = null;
        saveIncomeBtn.textContent = "Save Income";
    }
    else
    {
        incomeEntry.push({amount: parseFloat(income), date: date});
    }

    localStorage.setItem("incomeEntry", JSON.stringify(incomeEntry));

    const totalIncome = getTotalIncomeForMonth(month);
    const totalExpense = getTotalExpenseForMonth(month);
    saveMonthlyData(month, totalIncome, totalExpense);
}

function deleteIncome(index)
{
    const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
    incomeEntry.splice(index, 1);
    localStorage.setItem("incomeEntry", JSON.stringify(incomeEntry));
    updateTotalDisplay();
    incomeEntriesDisplay();
}

function deleteExpense(index)
{
    const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
    storeExp.splice(index, 1);
    localStorage.setItem("storeExp", JSON.stringify(storeExp));
    updateTotalDisplay();
    expenseEntriesDisplay();
}

function getMonthFromDate(dateStr)
{
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    console.log(`getMonthFromDate: ${dateStr} => ${month}`);
    return month;
}

function getTotalIncomeForMonth(month)
{
    const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
    return incomeEntry
        .filter(entry => getMonthFromDate(entry.date) === month)
        .reduce((sum, entry) => sum + entry.amount, 0);
}

function getTotalExpenseForMonth(month) {
      const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
      const filtered = storeExp.filter(entry => getMonthFromDate(entry.date) === month);
      console.log("Expenses for month", month, filtered);
      return filtered.reduce((sum, entry) => sum + entry.expense, 0);
}

function saveMonthlyData(month, income, expenses)
{
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    data[month] = { income, expense: expenses};
    localStorage.setItem("monthlyData", JSON.stringify(data));
}

updateTotalDisplay();
incomeEntriesDisplay();
expenseEntriesDisplay();
switchForm("default");
