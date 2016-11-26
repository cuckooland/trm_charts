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

var TRANSITION_DURATION = 2000;

var NEW_ACCOUNT_BIRTH = 1;

// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libre_money_class.call(money);

// Fill the form
document.getElementById('life_expectancy').value = money.life_expectancy;
document.getElementById('dividend_start').value = money.dividend_start;
document.getElementById('money_duration').value = money.money_duration;
document.getElementById('new_account_birth').value = NEW_ACCOUNT_BIRTH;
document.getElementById('calculate_growth').checked = money.calculate_growth;
document.getElementById('growth').value = money.growth;

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

// create and display chart from data
chart_reference_frame1 = c3.generate({
    padding: {
        right: 50 // We try to align the axes of the two plots
    },
    bindto: '#chart_reference_frame1',
    axis: {
        x: {
            label: 'Year'
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
                chart_reference_frame1.focus(id);
            }
        }
    },
    data: data.reference_frame1,
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: false
    }
});

// create and display chart from data
chart_reference_frame2 = c3.generate({
    bindto: '#chart_reference_frame2',
    axis: {
        x: {
            label: 'Year'
        },
        y: {
            label: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
        },
        y2: {
            label: 'People',
            show: true
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
                chart_reference_frame2.focus(id);
            }
        }
    },
    data: data.reference_frame2,
    color: {
        pattern: ['#d62728', '#ff9896', '#9467bd']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: false
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
    chart_reference_frame1.axis.labels({
        y: money.plot_hub[money.reference_frame + '_' + money.formula_type].unit_label
    });
    chart_reference_frame2.axis.labels({
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
        data.reference_frame1.unload = toUnload;
        data.reference_frame2.unload = toUnload;
    }

    // reload data in chart
    chart_reference_frame1.load(data.reference_frame1);
    chart_reference_frame2.load(data.reference_frame2);
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

d3.select("#add_account").on("click", add_account);
d3.select("#delete_last_account").on("click", delete_last_account);

d3.select("#life_expectancy").on("change", updateChartData);
d3.select("#growth").on("change", updateChartData);
d3.select("#calculate_growth").on("click", updateChartData);
d3.select("#dividend_start").on("change", updateChartData);
d3.select("#money_duration").on("change", updateChartData);
