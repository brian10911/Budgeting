const budgetRules = {
    "50-30-20": [0.5, 0.3, 0.2],
    "70-20-10": [0.7,0.2,0.1],
    "80-20": [0.8,0,0.2]
};

let chartInstance = null;
let selectedMonth = null;
let totalPercentage = 1;

let budgetBtn = document.querySelector('#budget-rule');
let customBtn = document.querySelector('#custom-rule');
let menuBtn = document.querySelector('#menu');
const monthSelect = document.getElementById("month");

let choiceContainer = document.querySelector('.choice-container');
let ruleContainer = document.querySelector('.rule-container');
let customContainer = document.querySelector('.custom-container');

let customForm = document.querySelector('#custom-form');

monthSelect.addEventListener("change", function(){
    const month = parseInt(monthSelect.value);
    selectedMonth = month;
    updateBudgetForMonth(month);
})

budgetBtn.addEventListener("click", function(){
    selectingMode("budgetRule");
});

customBtn.addEventListener("click", function(){
    selectingMode("customRule");
});

menuBtn.addEventListener("click", function(){
    selectingMode("default");
});

document.querySelector('.rule-container').addEventListener("click", function(e){
    if(e.target.matches("button[data-rule]"))
    {
        e.preventDefault();
        let netIncome;
        if(selectedMonth)
        {
            netIncome = getSelectedMonthNetIncome();
        }
        else
        {
            netIncome = getOverallTotalIncome() - getOverallTotalExpense();
        }
        const rule = e.target.dataset.rule;
        applyBudgetRule(netIncome, rule);
    }
});

customForm.addEventListener("input", ()=>{
    let netIncome;
    if(selectedMonth)
    {
        netIncome = getSelectedMonthNetIncome();
    }
    else
    {
        netIncome = getOverallTotalIncome() - getOverallTotalExpense();
    }
    
    const needs = parseFloat(document.querySelector('#needs').value) || 0;
    const wants = parseFloat(document.querySelector("#wants").value) || 0;
    const savings = parseFloat(document.querySelector('#saving').value) || 0;
    
    const total = (needs + wants + savings) / 100;
    remainBudgetPercentage(total);

    if(total > 1)
    {
        let overAmount = (total - 1) * 100;
        alert(`You're over budget by ${overAmount.toFixed(1)}%. Please adjust your values.`);
        return;
    }

    const labels = ["Needs", "Wants", "Savings"];
    const data = [needs, wants, savings].map(p => p * (netIncome / 100));

    updateChart(labels, data);
});

function applyRuleToMonth(month, ruleName)
{
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const data = monthlyData[month.toString()];
    const rule = budgetRules[ruleName];

    if(!data || !rule) 
    {
        alert("No data or invalid rule.");
        return;
    }

    const netIncome = data.income - data.expense;
    const breakdown = rule.map(p => p* netIncome);
    updateChart(["Needs", "Wants", "Savings"].slice(0, rule.length), breakdown);
}

function updateBudgetForMonth(month)
{
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const data = monthlyData[month.toString()];
    //
    if(!data || isNaN(data.income) || isNaN(data.expense))
    {
        alert("No data for selected month.");
        defaultChart();
        return;
    }

    const income = data.income;
    const expenses = data.expense;
    const netIncome = income - expenses;

    const labels = ["Income", "Expenses"];
    const chartData = [income, expenses];

    updateChart(labels, chartData);

    console.log("Data for month:", data);
console.log("Income:", data.income, "Expense:", data.expense);
}

function applyBudgetRule(income, ruleName)
{
    const rule = budgetRules[ruleName];
    const labels = ["Needs", "Wants", "Savings"];
    const amounts = rule.map(p => income * p);

    updateChart(labels.slice(0, rule.length), amounts);
}

function defaultChart()
{
    const totalIncome = getOverallTotalIncome();
    const totalExpense = getOverallTotalExpense();
    const netIncome = totalIncome - totalExpense;
    const labels = ["Total Income", "Total Expense"];
    const data = [totalIncome, totalExpense];
    updateChart(labels, data);
}

function updateChart(labels, data)
{
    const ctx = document.getElementById("budgetChart").getContext("2d");

    if(chartInstance)
    {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: "Budget Breakdown",
                data: data,
                backgroundColor: ["#008000", "#FF0000", "#0000FF"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function remainBudgetPercentage(total)
{
    const remainBudgetEl = document.querySelector(".remain-budget");
    remainBudgetEl.innerHTML = "";

    const remaining = Math.max(0, (1-total)) * 100;

    let percentageInfo = document.createElement("div");
    percentageInfo.setAttribute("class", "remain-percentage");
    percentageInfo.innerHTML = `<div class="remain-percentage">
                                    <h4>Remaining Budget Allocation: ${remaining.toFixed(1)}%</h4>
                                </div>`;
    remainBudgetEl.appendChild(percentageInfo);
}

function getSelectedMonthNetIncome()
{
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const data = monthlyData[selectedMonth?.toString()];
    if(!data) 
        return 0;
    return (data.income || 0) - (data.expense || 0);
}

function getTotalIncome(){
    if(selectedMonth === null)
        return 0;
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const data = monthlyData[selectedMonth.toString()];
    return data?.income  || 0;
}

function getTotalExpense(){
    if(selectedMonth === null)
        return 0;
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const data = monthlyData[selectedMonth?.toString()];
    return data?.expense || 0;
}

function getOverallTotalIncome() {
      const incomeEntry = JSON.parse(localStorage.getItem("incomeEntry")) || [];
      return incomeEntry.reduce((sum, entry) => sum + entry.amount, 0);
}

function getOverallTotalExpense() {
      const storeExp = JSON.parse(localStorage.getItem("storeExp")) || [];
      return storeExp.reduce((sum, entry) => sum + entry.expense, 0);
}

function selectingMode(selector)
{
    if(selector === "budgetRule")
    {
        choiceContainer.style.display = "none";
        ruleContainer.style.display = "block";
        customContainer.style.display = "none";
        menuBtn.style.display = "block";
    }
    else if(selector === "customRule")
    {
        choiceContainer.style.display = "none";
        ruleContainer.style.display = "none";
        customContainer.style.display = "block";
        menuBtn.style.display = "block";
    }
    else
    {
        choiceContainer.style.display = "block";
        ruleContainer.style.display = "none";
        customContainer.style.display = "none";
        menuBtn.style.display = "none";
        defaultChart();
    }
}

document.addEventListener("DOMContentLoaded", function(){
    defaultChart();
    selectingMode("default");
});
