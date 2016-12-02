/**
 * Created by vit on 14/10/16.
 */
 
// Create reference frame selector
function set_reference_frames(reference_frames) {
    document.getElementById('reference_frame').options = [];
    for (var index in Object.getOwnPropertyNames(reference_frames)) {
        var key = Object.getOwnPropertyNames(reference_frames)[index];
        document.getElementById('reference_frame').add(
            new Option(reference_frames[key], key)
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

// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libre_money_class.call(money);

// Fill the form
d3.select('#life_expectancy').property("value", money.life_expectancy);
d3.select('#dividend_start').property("value", money.dividend_start);
d3.select('#money_duration').property("value", money.money_duration);
d3.select('#new_account_birth').property("value", money.new_account_birth);
d3.select('#calculate_growth').property("value", money.calculate_growth);
d3.select('#growth').property("value", money.growth);
d3.select("input[value=\"by_month\"]").property("checked", money.by_month)
d3.select("input[value=\"by_year\"]").property("checked", !money.by_month)

// capture reference_frames list
set_reference_frames(money.reference_frames);

// capture formulaes list
set_formula_selector(money.dividend_formulae);

// add a member account
money.add_account('Member 1', 1);

// generate data
var data = money.generate_data();

// update in form with calculated growth
if (money.calculate_growth) {
    document.getElementById('growth').value = (money.growth * 100).toFixed(2);
}
enableGrowthForm(money.calculate_growth);

// create and display chart from data.accounts
accounts_chart = c3.generate({
    bindto: '#accounts_chart',
    axis: {
        x: {
            label: 'Time',
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        },
        y: {
            label: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                if (id == 'people') {
                    return value;
                }
                var f = d3.format('.2f');
                return f(value);
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
          r: 2
    }
});

// create and display chart from data.dividend
dividend_chart = c3.generate({
    bindto: '#dividend_chart',
    axis: {
        x: {
            label: 'Time',
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        },
        y: {
            label: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                if (id == 'people') {
                    return value;
                }
                var f = d3.format('.2f');
                return f(value);
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
          r: 2
    }
});

// create and display chart from data.headcount
headcount_chart = c3.generate({
    bindto: '#headcount_chart',
    axis: {
        x: {
            label: 'Time',
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        },
        y: {
            label: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                if (id == 'people') {
                    return value;
                }
                var f = d3.format('.2f');
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
          r: 2
    }
});

// create and display chart from data.monetary_supply
monetary_supply_chart = c3.generate({
    bindto: '#monetary_supply_chart',
    axis: {
        x: {
            label: 'Time',
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        },
        y: {
            label: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                if (id == 'people') {
                    return value;
                }
                var f = d3.format('.2f');
                return f(value);
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
          r: 2
    }
});

/**
 * Update chart data
 */
function updateChartData(toUnload) {

    // update money values
    money.life_expectancy = parseInt(document.getElementById('life_expectancy').value);
    money.dividend_start = parseInt(document.getElementById('dividend_start').value);
    money.money_duration = parseInt(document.getElementById('money_duration').value);
    money.reference_frame = document.getElementById('reference_frame').options[
        document.getElementById('reference_frame').selectedIndex
        ].value;
    money.formula_type = document.getElementById('formula_type').options[
        document.getElementById('formula_type').selectedIndex
        ].value;
    money.calculate_growth = document.getElementById('calculate_growth').checked;
    if (!money.calculate_growth) {
        money.growth = parseFloat(document.getElementById('growth').value) / 100;
    }
    // Axes
    accounts_chart.axis.labels({
        y: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
    });
    dividend_chart.axis.labels({
        y: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
    });
    monetary_supply_chart.axis.labels({
        y: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
    });

    // calculate data
    var data = money.generate_data();

    // update in form with calculated growth
    if (money.calculate_growth) {
        document.getElementById('growth').value = (money.growth * 100).toFixed(2);
    }

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

function enableGrowthForm(calculate_growth) {
    if (calculate_growth) {
        document.getElementById('growth').setAttribute('disabled', 'disabled');
    } else {
        document.getElementById('growth').removeAttribute('disabled');
    }
}

document.getElementById('calculate_growth').addEventListener('change', function () {
    enableGrowthForm(document.getElementById('calculate_growth').checked);
});

d3.select("#reference_frame").on("change", updateChartData);
d3.select("#formula_type").on("change", updateChartData);

d3.selectAll(".rythm").on("change", change_rythm);

d3.select("#add_account").on("click", add_account);
d3.select("#delete_last_account").on("click", delete_last_account);

d3.select("#life_expectancy").on("change", updateChartData);
d3.select("#growth").on("change", updateChartData);
d3.select("#calculate_growth").on("click", updateChartData);
d3.select("#dividend_start").on("change", updateChartData);
d3.select("#money_duration").on("change", updateChartData);


function change_rythm() {
    if (this.value === "by_month") {
        money.by_month = true;
    }
    else {
        money.by_month = false;
    }
    updateChartData();
}