/**
 * Created by vit on 14/10/16.
 */
 
// Create reference frame selector
function set_reference_frames(reference_frames) {
    document.getElementById('reference_frame').options = [];
    for (var index in Object.getOwnPropertyNames(reference_frames)) {
        var key = Object.getOwnPropertyNames(reference_frames)[index];
        document.getElementById('reference_frame').add(
            new Option(reference_frames[key].name, key)
        );
    }
};

// Create formula selector
function set_formula_selector(dividend_formulaes) {
    document.getElementById('formula_type').options = [];
    for (var index in Object.getOwnPropertyNames(dividend_formulaes)) {
        var key = Object.getOwnPropertyNames(dividend_formulaes)[index];
        document.getElementById('formula_type').add(
            new Option(dividend_formulaes[key].name, key)
        );
    }
};

var TRANSITION_DURATION = 1000;

var NEW_ACCOUNT_BIRTH = 1;

var EXP_FORMATS = {
    'y': '-24',
    'z': '-21',
    'a': '-18',
    'f': '-15',
    'p': '-12',
    'n': '-9',
    'µ': '-6',
    'm': '-3',
    'k': '3',
    'M': '6',
    'G': '9',
    'T': '12',
    'P': '15',
    'E': '18',
    'Z': '21',
    'Y': '24'
}
    
// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libre_money_class.call(money);

// capture reference_frames list
set_reference_frames(money.reference_frames);

// capture formulaes list
set_formula_selector(money.dividend_formulaes);

// add a member account
money.add_account('Member 1', 1);

// generate data
var data = money.generate_data();

// Fill the form
d3.select('#life_expectancy').property("value", money.life_expectancy);
d3.select('#annualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
d3.select('#monthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
d3.select('#money_duration').property("value", money.displayedPeriodInYears);
d3.select('#new_account_birth').property("value", NEW_ACCOUNT_BIRTH);
d3.select('#calculate_growth').property("checked", money.calculate_growth);
d3.select("input[value=\"by_month\"]").property("checked", money.growthTimeUnit === money.MONTH);
d3.select("input[value=\"by_year\"]").property("checked", money.growthTimeUnit === money.YEAR);
d3.select("input[value=\"empty\"]").property("checked", money.empty_start_account);
d3.select("input[value=\"udByGrowth\"]").property("checked", !money.empty_start_account);

// update in form with calculated growth
if (money.calculate_growth) {
    d3.select('#annualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#monthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}
enableGrowthForms(money.calculate_growth);
enableUD0Forms();

// create and display chart from data.accounts
accounts_chart = c3.generate({
    bindto: '#accounts_chart',
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                count: 2
            },
            min: '2000-01-01'
        },
        y: {
            label: {
                text: 'Account (' + money.reference_frames[money.reference_frame].unit_label + ')',
                position: 'outer-middle'
            },
            tick: {
                format: format2
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return format3(value);
            }
        }
    },
    legend: {
        item: {
            // bind focus on the two charts
            onmouseover: function (id) {
                accounts_chart.focus(id);
            }
        }
    },
    data: data.accounts,
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: true,
        r: 2
    }
});

// create and display chart from data.dividend
dividend_chart = c3.generate({
    bindto: '#dividend_chart',
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                count: 2 
            },
            min: '2000-01-01'
        },
        y: {
            label: {
                text: 'Dividend (' + money.reference_frames[money.reference_frame].unit_label + ')',
                position: 'outer-middle'
            },
            position: 'outer-top',
            tick: {
                format: format2
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return format3(value);
            }
        }
    },
    legend: {
        item: {
            // bind focus on the two charts
            onmouseover: function (id) {
                dividend_chart.focus(id);
            }
        }
    },
    data: data.dividend,
    color: {
        pattern: ['#d62728']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: true,
        r: 2
    }
});

// create and display chart from data.headcount
headcount_chart = c3.generate({
    bindto: '#headcount_chart',
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                count: 2
            },
            min: '2000-01-01'
        },
        y: {
            label: {
                text: 'Headcount',
                position: 'outer-middle'
            },
            position: 'outer-top',
            tick: {
                format: d3.format("d")
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                var f = d3.format('.3d');
                return f(value);
            }
        }
    },
    legend: {
        item: {
            // bind focus on the two charts
            onmouseover: function (id) {
                headcount_chart.focus(id);
            }
        }
    },
    data: data.headcount,
    color: {
        pattern: ['#ff9896']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: true,
        r: 2
    }
});

// create and display chart from data.monetary_supply
monetary_supply_chart = c3.generate({
    bindto: '#monetary_supply_chart',
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                count: 2
            },
            min: '2000-01-01'
        },
        y: {
            label: {
                text: 'Monetary Mass (' + money.reference_frames[money.reference_frame].unit_label + ')',
                position: 'outer-middle'
            },
            position: 'outer-top',
            tick: {
                format: format2
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return format3(value);
            }
        }
    },
    legend: {
        item: {
            // bind focus on the two charts
            onmouseover: function (id) {
                monetary_supply_chart.focus(id);
            }
        }
    },
    data: data.monetary_supply,
    color: {
        pattern: ['#9467bd']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: true,
        r: 2
    }
});

function format2(value) {
    var f = d3.format('.2s');
    return withExp(f(value));
}

function format3(value) {
    var f = d3.format('.3s');
    return withExp(f(value));
}

function withExp(siValue) {
    var siStr = /[yzafpnµmkMGTPEZY]/.exec(siValue)
    if (siStr != null) {
        return siValue.replace(siStr, " E" + EXP_FORMATS[siStr]);
    }
    return siValue;
}

/**
 * Update chart data
 */
function updateChartData(toUnload) {

    // calculate data
    var data = money.generate_data();

    // tell load command to unload old data
    if (toUnload) {
        data.accounts.unload = toUnload;
        data.dividend.unload = toUnload;
        data.headcount.unload = toUnload;
        data.monetary_supply.unload = toUnload;
    }

    // reload data in chart
    accounts_chart.load(data.accounts);
    dividend_chart.load(data.dividend);
    headcount_chart.load(data.headcount);
    monetary_supply_chart.load(data.monetary_supply);
}

/**
 * Delete last account
 */
function delete_last_account() {
    var account = money.delete_last_account();
    // If account deleted...
    if (account != false) {
        // Update remaining data
        updateChartData(account.id);
    }
}

/**
 * Add account
 */
function add_account() {
    // construct name
    var name = 'Member ' + (money.accounts.length + 1)

    // capture user entry
    var new_account_birth = parseInt(document.getElementById('new_account_birth').value);

    // add a member account at the birth date specified
    money.add_account(name, parseInt(new_account_birth));

    updateChartData();
}

function enableGrowthForms(calculate_growth) {
    if (calculate_growth) {
        document.getElementById('annualGrowth').setAttribute('disabled', 'disabled');
        document.getElementById('monthlyGrowth').setAttribute('disabled', 'disabled');
    } else {
        if (money.growthTimeUnit === money.MONTH) {
            document.getElementById('annualGrowth').setAttribute('disabled', 'disabled');
            document.getElementById('monthlyGrowth').removeAttribute('disabled');
        }
        else {
            document.getElementById('annualGrowth').removeAttribute('disabled');
            document.getElementById('monthlyGrowth').setAttribute('disabled', 'disabled');
        }
    }
}

function enableUD0Forms() {
    if (money.growthTimeUnit === money.MONTH) {
        document.getElementById('annualDividendStart').setAttribute('disabled', 'disabled');
        document.getElementById('monthlyDividendStart').removeAttribute('disabled');
    }
    else {
        document.getElementById('annualDividendStart').removeAttribute('disabled');
        document.getElementById('monthlyDividendStart').setAttribute('disabled', 'disabled');
    }
}

d3.select("#reference_frame").on("change", change_reference_frame);
d3.select("#formula_type").on("change", change_formula_type);

d3.selectAll(".rythm").on("change", change_rythm);
d3.selectAll(".startAccount").on("change", change_start_account);

d3.select("#add_account").on("click", add_account);
d3.select("#delete_last_account").on("click", delete_last_account);

d3.select("#life_expectancy").on("change", change_life_expectancy);
d3.select("#annualGrowth").on("change", changeAnnualGrowth);
d3.select("#monthlyGrowth").on("change", changeMonthlyGrowth);
d3.select("#calculate_growth").on("click", change_calculate_growth);
d3.select("#annualDividendStart").on("change", changeAnnualDividendStart);
d3.select("#monthlyDividendStart").on("change", changeMonthlyDividendStart);
d3.select("#money_duration").on("change", change_money_duration);


function change_reference_frame() {
    money.reference_frame = this.options[this.selectedIndex].value;
        
    // Axes
    accounts_chart.axis.labels({
        y: 'Account (' + money.reference_frames[money.reference_frame].unit_label + ')',
    });
    dividend_chart.axis.labels({
        y: 'Dividend (' + money.reference_frames[money.reference_frame].unit_label + ')',
    });
    monetary_supply_chart.axis.labels({
        y: 'Monetary Mass (' + money.reference_frames[money.reference_frame].unit_label + ')',
    });
    
    updateChartData();
}

function change_formula_type() {
    money.formula_type = this.options[this.selectedIndex].value;
    updateChartData();
}

function change_rythm() {
    if (this.value === "by_month") {
        money.growthTimeUnit = money.MONTH;
        money.dividend_start = parseFloat(document.getElementById('monthlyDividendStart').value);
    }
    else {
        money.growthTimeUnit = money.YEAR;
        money.dividend_start = parseFloat(document.getElementById('annualDividendStart').value);
    }
    enableGrowthForms(document.getElementById('calculate_growth').checked);
    enableUD0Forms();
    updateChartData();
}

function change_start_account() {
    if (this.value === "empty") {
        money.empty_start_account = true;
    }
    else {
        money.empty_start_account = false;
    }
    updateChartData();
}

function change_life_expectancy() {
    money.life_expectancy = parseInt(this.value);
    updateChartData();
    update_calculate_growth();
}

function changeAnnualGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#monthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
    d3.select('#monthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}

function changeMonthlyGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#annualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
    d3.select('#annualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
}

function change_calculate_growth() {
    money.calculate_growth = this.checked;
    
    enableGrowthForms(money.calculate_growth);
    updateChartData();
    update_calculate_growth();
}

function update_calculate_growth() {
    if (money.calculate_growth) {
        d3.select('#annualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
        d3.select('#monthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
        
        if (money.growthTimeUnit === money.MONTH) {
            d3.select('#annualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
        }
        else {
            d3.select('#monthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
        }
    }
}

function changeAnnualDividendStart() {
    money.dividend_start = parseFloat(this.value);
    updateChartData();
    d3.select('#monthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
}

function changeMonthlyDividendStart() {
    money.dividend_start = parseFloat(this.value);
    updateChartData();
    d3.select('#annualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
}

function change_money_duration() {
    money.displayedPeriodInYears = parseInt(this.value);
    updateChartData();
}
