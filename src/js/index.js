/**
 * Created by vit on 14/10/16.
 */
 
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\$\{p(\d)\}/g, function(match, id) {
        return args[id];
    });
};

// Create reference frame selector
function set_reference_selector(reference_frames) {
    d3.select('#reference_frame').selectAll("option")
        .data(Object.keys(reference_frames))
      .enter().append("option")
        .text(function(d) { return getRefLabel(d); })
        .attr('value', function(d) { return d; });
};

// Create formula selector
function set_formula_selector(dividend_formulaes) {
    d3.select('#formula_type').selectAll("option")
        .data(Object.keys(dividend_formulaes))
      .enter().append("option")
        .text(function(d) { return getDividendFormulaLabel(d); })
        .attr('value', function(d) { return d; });
};

// Create demographic profile selector
function set_demography_selector(population_profiles) {
    d3.select('#demographic_profile').selectAll("option")
        .data(Object.keys(population_profiles))
      .enter().append("option")
        .text(function(d) { return getPopulationProfileLabel(d); })
        .attr('value', function(d) { return d; });
};

// Join (via D3) account selector to 'money.accounts'
function joinAccountSelectorToData() {
    var options = d3.select('#current_account').selectAll("option")
        .data(money.accounts, function(d) { return d.id; });
            
    options.text(function(d) { return d.name; });
    
    options.enter().append("option")
        .text(function(d) { return d.name; })
        .attr('value', function(d) { return d.id; })
        
    options.exit().remove();
};

function generate_data() {
    money.generate_data();
    
	var c3Data = {
        accounts: {
            xFormat: '%d-%m-%Y',
            xs: {
                'average': 'x_average'
            },
            names: {
                'average': 'Moyenne "M/N"'
            },
            columns: [],
            types: {
                average: 'area',
            }
        },
        dividend: {
            xFormat: '%d-%m-%Y',
            x: 'x_dividend',
            names: {
                'dividend': 'Dividende Universel'
            },
            columns: []
        },
        headcount: {
            xFormat: '%d-%m-%Y',
            x: 'x_people',
            names: {
                'people': 'Nombre de co-créateurs "N"'
            },
            columns: []
        },
        monetary_supply: {
            xFormat: '%d-%m-%Y',
            x: 'x_monetary_mass',
            names: {
                'monetary_mass': 'Masse Monétaire "M"'
            },
            columns: []
        }
    };

    var i_account, i;
    // For each account...
	for (i_account = 0; i_account < money.accounts.length; i_account++) {
		// add axis mapping
		var c3Id = getC3Id(money.accounts[i_account].id);
		c3Data.accounts.xs[c3Id] = 'x_' + c3Id;
        c3Data.accounts.names[c3Id] = money.accounts[i_account].name;
	}
	
    // add data to columns and add axis header 
	var xDividends = ['x_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xDividends.push(asDate(money.dividends.x[i]));
	}
    c3Data.dividend.columns.push(xDividends);
    c3Data.dividend.columns.push(money.dividends.y);
    c3Data.dividend.columns[c3Data.dividend.columns.length - 1].unshift('dividend');
    
	var xPeople = ['x_people'];
	for (i = 0; i < money.udProducerCount.x.length; i++) {
	    xPeople.push(asDate(money.udProducerCount.x[i]));
	}
    c3Data.headcount.columns.push(xPeople);
    c3Data.headcount.columns.push(money.udProducerCount.values);
    c3Data.headcount.columns[c3Data.headcount.columns.length - 1].unshift('people');
    
	var xMonetarySupply = ['x_monetary_mass'];
	for (i = 0; i < money.monetary_mass.x.length; i++) {
	    xMonetarySupply.push(asDate(money.monetary_mass.x[i]));
	}
    c3Data.monetary_supply.columns.push(xMonetarySupply);
    c3Data.monetary_supply.columns.push(money.monetary_mass.y);
    c3Data.monetary_supply.columns[c3Data.monetary_supply.columns.length - 1].unshift('monetary_mass');
    
	var xAverage = ['x_average'];
	for (i = 0; i < money.average.x.length; i++) {
	    xAverage.push(asDate(money.average.x[i]));
	}
    c3Data.accounts.columns.push(xAverage);
    c3Data.accounts.columns.push(money.average.y);
    c3Data.accounts.columns[c3Data.accounts.columns.length - 1].unshift('average');

    var toUnload = [];
    // for each account...
    for (i_account = 0; i_account < money.accounts.length; i_account++) {
  		var c3Id = getC3Id(money.accounts[i_account].id);
        // add data to columns
        if (money.accounts[i_account].x.length > 1) {
            
        	var xAccount = [c3Data.accounts.xs[c3Id]];
        	for (i = 0; i < money.accounts[i_account].x.length; i++) {
        	    xAccount.push(asDate(money.accounts[i_account].x[i]));
        	}
            c3Data.accounts.columns.push(xAccount);
            
            c3Data.accounts.columns.push(money.accounts[i_account].y);
            c3Data.accounts.columns[c3Data.accounts.columns.length - 1].unshift(c3Id);
        }
        else {
            toUnload.push(c3Id);
        }
    }
    if (toUnload.length > 0) {
        c3Data.accounts.unload = toUnload;
    }
	return c3Data;
};

function getC3Id(accountId) {
    return 'member_' + accountId;
}

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
set_reference_selector(money.reference_frames);

// capture formulaes list
set_formula_selector(money.dividend_formulaes);

// capture population variation list
set_demography_selector(money.population_profiles);

// add a member account
var accountIndex = money.add_account();
updateAccountName(accountIndex);
joinAccountSelectorToData();
document.getElementById("current_account").selectedIndex = 0;

// generate data
var data = generate_data();

// Fill the form
d3.select('#life_expectancy').property("value", money.life_expectancy);
d3.select('#annualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
d3.select('#monthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
d3.select('#money_duration').property("value", money.displayedPeriodInYears);
d3.select('#new_account_birth').property("value", NEW_ACCOUNT_BIRTH);
d3.select('#calculate_growth').property("checked", money.calculate_growth);
d3.selectAll("input[value=\"by_month\"]").property("checked", money.growthTimeUnit === money.MONTH);
d3.selectAll("input[value=\"by_year\"]").property("checked", money.growthTimeUnit === money.YEAR);
d3.select('#max_demography').property("value", money.maxDemography);
updateAddedMemberArea();

// update in form with calculated growth
if (money.calculate_growth) {
    d3.select('#annualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#monthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}
enableGrowthForms(money.calculate_growth);
enableUD0Forms();
enableMaxDemography();

function getRefLabel(reference_frame) {
    switch(reference_frame) {
        case 'quantitative':
            return "Unité Monétaire";
        case 'relative': 
            return "Dividende";
        case 'average':
            return "%(M/N)";
        default:
            throw new Error("Reference frame not managed");
    }
}

function getRefUnitLabel(reference_frame) {
    switch(reference_frame) {
        case 'quantitative':
            return 'Unités Monétaires';
        case 'relative': 
            return "DU";
        case 'average':
            return "%(M/N)";
        default:
            throw new Error("Reference frame not managed");
    }
}

function getDividendFormulaLabel(dividend_formula) {
    switch(dividend_formula) {
        case 'UDA':
            return "DUA(t) = max[DUA(t-1);c*M(t)/N(t)]";
        case 'UDB': 
            return "DUB(t) = (1+c)*DUB(t-1)";
        case 'UDG':
            return "DUĞ(t) = DUĞ(t-1) + c²*M(t-1)/N(t-1)";
        default:
            throw new Error("Dividend formula not managed");
    }
}

function getPopulationProfileLabel(population_profile) {
    switch(population_profile) {
        case 'None':
            return "Aucune";
        case 'Uniform': 
            return "Uniforme";
        case 'Triangular':
            return "Triangulaire";
        case 'Plateau':
            return "Plateau";
        case 'Cauchy': 
            return "Cauchy";
        case 'DampedWave':
            return "Ondulation Amortie";
        default:
            throw new Error("Population profile not managed");
    }
}

// create and display chart from data.accounts
accounts_chart = c3.generate({
    bindto: '#accounts_chart',
    padding: {
        left: 100,
        right: 25
    },
    size: {
        height: 300,
        width: 480
    },
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%d-%m-%Y',
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.reference_frame),
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
    padding: {
        left: 100,
        right: 25
    },
    size: {
        height: 300,
        width: 480
    },
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%d-%m-%Y',
                count: 2 
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.reference_frame),
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
    padding: {
        left: 100,
        right: 25,
    },
    size: {
        height: 300,
        width: 480
    },
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%d-%m-%Y',
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: "Nombre de co-créateurs",
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
    padding: {
        left: 100,
        right: 25
    },
    size: {
        height: 300,
        width: 480
    },
    axis: {
        x: {
            label: {
                text: 'Time',
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: '%d-%m-%Y',
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.reference_frame),
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
    var data = generate_data();

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
 * Delete current account
 */
function delete_account() {
    var selectedAccountIndex = getSelectedAccountIndex();
    var account = money.delete_account(selectedAccountIndex);
    // If account deleted...
    if (account != false && account.length > 0) {
        // Update remaining data
		var c3Id = getC3Id(account[0].id);
        updateChartData(c3Id);
        joinAccountSelectorToData(selectedAccountIndex - 1);
        document.getElementById("current_account").selectedIndex = selectedAccountIndex - 1;
        updateAddedMemberArea();
    }
}

function updateAddedMemberArea() {
    var selectedAccountIndex = getSelectedAccountIndex();
    d3.select('#change_account_birth').property("value", money.getAccountBirth(getSelectedAccountIndex()));
    d3.select('#produceUd').property("checked", money.getUdProducer(selectedAccountIndex));
    d3.select('#startingAccount').property("value", money.getStartingAccount(selectedAccountIndex));
    enableAddedMemberArea();
}

function getSelectedAccountIndex() {
    var sel = document.getElementById('current_account');
    return sel.selectedIndex;
}

/**
 * add a member account with same attributes as the last account
 */
function add_account() {
    var accountIndex = money.add_account();
    updateAccountName(accountIndex);
    
    updateChartData();
    joinAccountSelectorToData();
    document.getElementById("current_account").selectedIndex = money.accounts.length - 1;
    updateAddedMemberArea();
}

function updateAccountName(accountIndex) {
    var name = accountName(money.accounts[accountIndex]);
    money.setAccountName(accountIndex, name);
}

function accountName(account) {
    if (account.udProducer) {
        return "Compte ${p0} (Co-créateur)".format(account.id);
    }
    else {
        return "Compte ${p0} (Non-créateur)".format(account.id);
    }
}

function asDate(timeStep, timeUnit) {
    timeUnit = timeUnit || money.growthTimeUnit;
    
    if (timeUnit === money.MONTH) {
        return "01-${p0}-${p1}".format(timeStep % 12, 2000 + Math.trunc(timeStep / 12) + 1);
    }
    else if (timeUnit === money.YEAR) {
        return "01-01-${p0}".format(2000 + timeStep);
    }
    else {
        throw new Error("Time unit not managed");
    }
}

function enableGrowthForms(calculate_growth) {
    if (calculate_growth) {
        d3.select('#annualGrowth').attr('disabled', 'disabled');
        d3.select('#monthlyGrowth').attr('disabled', 'disabled');
    } else {
        if (money.growthTimeUnit === money.MONTH) {
            d3.select('#annualGrowth').attr('disabled', 'disabled');
            d3.select('#monthlyGrowth').attr('disabled', null);
        }
        else {
            d3.select('#annualGrowth').attr('disabled', null);
            d3.select('#monthlyGrowth').attr('disabled', 'disabled');
        }
    }
}

function enableUD0Forms() {
    if (money.growthTimeUnit === money.MONTH) {
        d3.select('#annualDividendStart').attr('disabled', 'disabled');
        d3.select('#monthlyDividendStart').attr('disabled', null);
    }
    else {
        d3.select('#annualDividendStart').attr('disabled', null);
        d3.select('#monthlyDividendStart').attr('disabled', 'disabled');
    }
}

function enableMaxDemography() {
    if (money.population_profile === "None") {
        d3.select('#max_demography').attr('disabled', 'disabled');
    }
    else {
        d3.select('#max_demography').attr('disabled', null);
    }
}

function enableAddedMemberArea() {
    if (getSelectedAccountIndex() != 0) {
        d3.select('#change_account_birth').attr('disabled', null);
        d3.select('#produceUd').attr('disabled', null);
        d3.select('#delete_account').attr('disabled', null);
    }
    else {
        d3.select('#change_account_birth').attr('disabled', 'disabled');
        d3.select('#produceUd').attr('disabled', 'disabled');
        d3.select('#delete_account').attr('disabled', 'disabled');
    }
}

d3.select("#reference_frame").on("change", change_reference_frame);
d3.select("#formula_type").on("change", change_formula_type);
d3.select("#demographic_profile").on("change", change_demographic_profile);
d3.select("#current_account").on("change", updateAddedMemberArea);

d3.selectAll(".rythm").on("change", change_rythm);
d3.selectAll(".firstDividend").on("change", change_rythm);

d3.select("#add_account").on("click", add_account);
d3.select("#delete_account").on("click", delete_account);

d3.select("#life_expectancy").on("change", change_life_expectancy);
d3.select("#annualGrowth").on("change", changeAnnualGrowth);
d3.select("#monthlyGrowth").on("change", changeMonthlyGrowth);
d3.select("#calculate_growth").on("click", change_calculate_growth);
d3.select("#annualDividendStart").on("change", changeAnnualDividendStart);
d3.select("#monthlyDividendStart").on("change", changeMonthlyDividendStart);
d3.select("#money_duration").on("change", change_money_duration);
d3.select("#max_demography").on("change", change_max_demography);
d3.select("#change_account_birth").on("change", change_account_birth);
d3.select("#produceUd").on("click", changeProduceUd);
d3.select("#startingAccount").on("change", changeStartingAccount);

d3.selectAll(".tablinks").on("click", openTab);

document.getElementById("MoneyItem").click();


function change_reference_frame() {
    money.reference_frame = this.options[this.selectedIndex].value;
        
    // Axes
    accounts_chart.axis.labels({
        y: accountYLabel(money.reference_frame),
    });
    dividend_chart.axis.labels({
        y: accountYLabel(money.reference_frame),
    });
    monetary_supply_chart.axis.labels({
        y: accountYLabel(money.reference_frame),
    });
    
    updateChartData();
}

function accountYLabel(reference_frame) {
    return 'Montant (en ' + getRefUnitLabel(reference_frame) + ')'
}

function change_formula_type() {
    money.formula_type = this.options[this.selectedIndex].value;
    updateChartData();
}

function change_demographic_profile() {
    money.population_profile = this.options[this.selectedIndex].value;
    enableMaxDemography();
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
    
    d3.selectAll("input[value=\"by_month\"]").property("checked", money.growthTimeUnit === money.MONTH);
    d3.selectAll("input[value=\"by_year\"]").property("checked", money.growthTimeUnit === money.YEAR);
    
    enableGrowthForms(money.calculate_growth);
    enableUD0Forms();
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

function change_max_demography() {
    money.maxDemography = parseInt(this.value);
    updateChartData();
}

function change_account_birth() {
    var birth = parseInt(this.value);
    money.setAccountBirth(getSelectedAccountIndex(), birth);
    updateChartData();
}

function changeProduceUd() {
    var selectedAccountIndex = getSelectedAccountIndex();
    money.setUdProducer(selectedAccountIndex, this.checked);
    
    updateAccountName(selectedAccountIndex);
    
    joinAccountSelectorToData();
    updateChartData();
}

function changeStartingAccount() {
    money.setStartingAccount(getSelectedAccountIndex(), parseFloat(this.value));
    updateChartData();
}

function openTab() {
    d3.selectAll(".tablinks").classed("active", false);
    d3.select(this).classed("active", true);
    
    d3.selectAll(".tabcontent").style("display", "none");
    var tabContentId = d3.select(this).attr("tabContentId");
    d3.select("#" + tabContentId).style("display", "block");

    return false;
}
