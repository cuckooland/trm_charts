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
function set_reference_selector(referenceFrames) {
    d3.select('#ReferenceFrameSelector').selectAll("option")
        .data(Object.keys(referenceFrames))
      .enter().append("option")
        .text(function(d) { return getRefLabel(d); })
        .attr('value', function(d) { return d; });
};

// Create formula selector
function set_formula_selector(dividend_formulaes) {
    d3.select('#UdFormulaSelector').selectAll("option")
        .data(Object.keys(dividend_formulaes))
      .enter().append("option")
        .text(function(d) { return getDividendFormulaLabel(d); })
        .attr('value', function(d) { return d; });
};

// Create demographic profile selector
function set_demography_selector(population_profiles) {
    d3.select('#DemographySelector').selectAll("option")
        .data(Object.keys(population_profiles))
      .enter().append("option")
        .text(function(d) { return getPopulationProfileLabel(d); })
        .attr('value', function(d) { return d; });
};

// Join (via D3) account selector to 'money.accounts'
function joinAccountSelectorToData() {
    var options = d3.select('#AccountSelector').selectAll("option")
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
            xFormat: DATE_PATTERN,
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
            xFormat: DATE_PATTERN,
            x: 'x_dividend',
            names: {
                'dividend': 'Dividende Universel'
            },
            columns: []
        },
        headcount: {
            xFormat: DATE_PATTERN,
            x: 'x_people',
            names: {
                'people': 'Nombre d\'individus "N"'
            },
            columns: []
        },
        monetary_supply: {
            xFormat: DATE_PATTERN,
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
	for (i = 0; i < money.individualCount.x.length; i++) {
	    xPeople.push(asDate(money.individualCount.x[i]));
	}
    c3Data.headcount.columns.push(xPeople);
    c3Data.headcount.columns.push(money.individualCount.values);
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

var DATE_PATTERN = "%d-%m-%Y";
    
// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libre_money_class.call(money);

// capture reference frames list
set_reference_selector(money.referenceFrames);

// capture formulaes list
set_formula_selector(money.dividend_formulaes);

// capture population variation list
set_demography_selector(money.population_profiles);

// add a member account
var accountIndex = money.addAccount();
updateAccountName(accountIndex);
joinAccountSelectorToData();
document.getElementById("AccountSelector").selectedIndex = 0;

// generate data
var data = generate_data();

// Fill the form
d3.select('#LifeExpectancy').property("value", money.lifeExpectancy);
d3.select('#AnnualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
d3.select('#MonthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
d3.select('#MoneyDuration').property("value", money.displayedPeriodInYears);
d3.select('#CalculateGrowth').property("checked", money.calculateGrowth);
d3.selectAll("input[value=\"by_month\"]").property("checked", money.growthTimeUnit === money.MONTH);
d3.selectAll("input[value=\"by_year\"]").property("checked", money.growthTimeUnit === money.YEAR);
d3.select('#MaxDemography').property("value", money.maxDemography);
updateAddedMemberArea();

// update in form with calculated growth
if (money.calculateGrowth) {
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}
enableGrowthForms(money.calculateGrowth);
enableUD0Forms();
enableMaxDemography();

function getRefLabel(referenceFrame) {
    switch(referenceFrame) {
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

function getRefUnitLabel(referenceFrame) {
    switch(referenceFrame) {
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
            return "DUA : DU(t) = max[DU(t-1) ; c*M(t)/N(t)]";
        case 'UDB': 
            return "DUB : DU(t) = (1+c)*DU(t-1)";
        case 'UDG':
            return "DUĞ : DU(t) = DU(t-1) + c²*M(t-1)/N(t-1)";
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
accountsChart = c3.generate({
    bindto: '#AccountsChart',
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
                format: DATE_PATTERN,
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.referenceFrame),
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
                accountsChart.focus(id);
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
dividendChart = c3.generate({
    bindto: '#DividendChart',
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
                format: DATE_PATTERN,
                count: 2 
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.referenceFrame),
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
                dividendChart.focus(id);
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
headcountChart = c3.generate({
    bindto: '#HeadcountChart',
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
                format: DATE_PATTERN,
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: "Nombre d\individus",
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
                headcountChart.focus(id);
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
monetarySupplyChart = c3.generate({
    bindto: '#MonetarySupplyChart',
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
                format: DATE_PATTERN,
                count: 2
            },
            min: '01-01-2000'
        },
        y: {
            label: {
                text: accountYLabel(money.referenceFrame),
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
                monetarySupplyChart.focus(id);
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
    accountsChart.load(data.accounts);
    dividendChart.load(data.dividend);
    headcountChart.load(data.headcount);
    monetarySupplyChart.load(data.monetary_supply);
}

/**
 * Delete current account
 */
function deleteAccount() {
    var selectedAccountIndex = getSelectedAccountIndex();
    var account = money.deleteAccount(selectedAccountIndex);
    // If account deleted...
    if (account != false && account.length > 0) {
        // Update remaining data
		var c3Id = getC3Id(account[0].id);
        updateChartData(c3Id);
        joinAccountSelectorToData(selectedAccountIndex - 1);
        document.getElementById("AccountSelector").selectedIndex = selectedAccountIndex - 1;
        updateAddedMemberArea();
    }
}

function updateAddedMemberArea() {
    var selectedAccountIndex = getSelectedAccountIndex();
    d3.select('#AccountBirth').property("value", money.getAccountBirth(getSelectedAccountIndex()));
    d3.select('#ProduceUd').property("checked", money.isUdProducer(selectedAccountIndex));
    d3.select('#StartingPercentage').property("value", money.getStartingPercentage(selectedAccountIndex));
    enableAddedMemberArea();
}

function getSelectedAccountIndex() {
    var sel = document.getElementById('AccountSelector');
    return sel.selectedIndex;
}

/**
 * add a member account with same attributes as the last account
 */
function addAccount() {
    var accountIndex = money.addAccount();
    updateAccountName(accountIndex);
    
    updateChartData();
    joinAccountSelectorToData();
    document.getElementById("AccountSelector").selectedIndex = money.accounts.length - 1;
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
    
    var format = d3.time.format(DATE_PATTERN);
    if (timeUnit === money.MONTH) {
        return format(new Date(2000 + Math.trunc(timeStep / 12) + 1, timeStep % 12 - 1, 1));
    }
    else if (timeUnit === money.YEAR) {
        return format(new Date(2000 + timeStep, 0, 1));
    }
    else {
        throw new Error("Time unit not managed");
    }
}

function enableGrowthForms(calculateGrowth) {
    if (calculateGrowth) {
        d3.select('#AnnualGrowth').attr('disabled', 'disabled');
        d3.select('#MonthlyGrowth').attr('disabled', 'disabled');
    } else {
        if (money.growthTimeUnit === money.MONTH) {
            d3.select('#AnnualGrowth').attr('disabled', 'disabled');
            d3.select('#MonthlyGrowth').attr('disabled', null);
        }
        else {
            d3.select('#AnnualGrowth').attr('disabled', null);
            d3.select('#MonthlyGrowth').attr('disabled', 'disabled');
        }
    }
}

function enableUD0Forms() {
    if (money.growthTimeUnit === money.MONTH) {
        d3.select('#AnnualDividendStart').attr('disabled', 'disabled');
        d3.select('#MonthlyDividendStart').attr('disabled', null);
    }
    else {
        d3.select('#AnnualDividendStart').attr('disabled', null);
        d3.select('#MonthlyDividendStart').attr('disabled', 'disabled');
    }
}

function enableMaxDemography() {
    if (money.population_profile === "None") {
        d3.select('#MaxDemography').attr('disabled', 'disabled');
    }
    else {
        d3.select('#MaxDemography').attr('disabled', null);
    }
}

function enableAddedMemberArea() {
    if (getSelectedAccountIndex() != 0) {
        d3.select('#AccountBirth').attr('disabled', null);
        d3.select('#ProduceUd').attr('disabled', null);
        d3.select('#DeleteAccount').attr('disabled', null);
    }
    else {
        d3.select('#AccountBirth').attr('disabled', 'disabled');
        d3.select('#ProduceUd').attr('disabled', 'disabled');
        d3.select('#DeleteAccount').attr('disabled', 'disabled');
    }
}

d3.select("#ReferenceFrameSelector").on("change", changeReferenceFrame);
d3.select("#UdFormulaSelector").on("change", changeUdFormula);
d3.select("#DemographySelector").on("change", changeDemographicProfile);
d3.select("#AccountSelector").on("change", updateAddedMemberArea);

d3.selectAll(".rythm").on("change", changeRythm);
d3.selectAll(".firstDividend").on("change", changeRythm);

d3.select("#AddAccount").on("click", addAccount);
d3.select("#DeleteAccount").on("click", deleteAccount);

d3.select("#LifeExpectancy").on("change", changeLifeExpectancy);
d3.select("#AnnualGrowth").on("change", changeAnnualGrowth);
d3.select("#MonthlyGrowth").on("change", changeMonthlyGrowth);
d3.select("#CalculateGrowth").on("click", changeCalculateGrowth);
d3.select("#AnnualDividendStart").on("change", changeAnnualDividendStart);
d3.select("#MonthlyDividendStart").on("change", changeMonthlyDividendStart);
d3.select("#MoneyDuration").on("change", changeMoneyDuration);
d3.select("#MaxDemography").on("change", changeMaxDemography);
d3.select("#AccountBirth").on("change", changeAccountBirth);
d3.select("#ProduceUd").on("click", changeProduceUd);
d3.select("#StartingPercentage").on("change", changeStartingPercentage);

d3.selectAll(".tablinks").on("click", openTab);

document.getElementById("MoneyItem").click();


function changeReferenceFrame() {
    money.referenceFrame = this.options[this.selectedIndex].value;
        
    // Axes
    accountsChart.axis.labels({
        y: accountYLabel(money.referenceFrame),
    });
    dividendChart.axis.labels({
        y: accountYLabel(money.referenceFrame),
    });
    monetarySupplyChart.axis.labels({
        y: accountYLabel(money.referenceFrame),
    });
    
    updateChartData();
}

function accountYLabel(referenceFrame) {
    return 'Montant (en ' + getRefUnitLabel(referenceFrame) + ')'
}

function changeUdFormula() {
    money.udFormula = this.options[this.selectedIndex].value;
    updateChartData();
}

function changeDemographicProfile() {
    money.population_profile = this.options[this.selectedIndex].value;
    enableMaxDemography();
    updateChartData();
}

function changeRythm() {
    if (this.value === "by_month") {
        money.growthTimeUnit = money.MONTH;
        money.dividend_start = parseFloat(document.getElementById('MonthlyDividendStart').value);
    	money.growth = parseFloat(document.getElementById('MonthlyGrowth').value) / 100;
    }
    else {
        money.growthTimeUnit = money.YEAR;
        money.dividend_start = parseFloat(document.getElementById('AnnualDividendStart').value);
    	money.growth = parseFloat(document.getElementById('AnnualGrowth').value) / 100;
    }
    
    d3.selectAll("input[value=\"by_month\"]").property("checked", money.growthTimeUnit === money.MONTH);
    d3.selectAll("input[value=\"by_year\"]").property("checked", money.growthTimeUnit === money.YEAR);
    
    enableGrowthForms(money.calculateGrowth);
    enableUD0Forms();
    updateChartData();
}

function changeLifeExpectancy() {
    money.lifeExpectancy = parseInt(this.value);
    updateChartData();
    updateCalculateGrowth();
}

function changeAnnualGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#MonthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}

function changeMonthlyGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
}

function changeCalculateGrowth() {
    money.calculateGrowth = this.checked;
    
    enableGrowthForms(money.calculateGrowth);
    updateChartData();
    updateCalculateGrowth();
}

function updateCalculateGrowth() {
    if (money.calculateGrowth) {
        d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
        d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
        
        if (money.growthTimeUnit === money.MONTH) {
            d3.select('#AnnualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
        }
        else {
            d3.select('#MonthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
        }
    }
}

function changeAnnualDividendStart() {
    money.dividend_start = parseFloat(this.value);
    updateChartData();
    d3.select('#MonthlyDividendStart').property("value", (money.get_dividend_start(money.MONTH)).toFixed(2));
}

function changeMonthlyDividendStart() {
    money.dividend_start = parseFloat(this.value);
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.get_dividend_start(money.YEAR)).toFixed(2));
}

function changeMoneyDuration() {
    money.displayedPeriodInYears = parseInt(this.value);
    updateChartData();
}

function changeMaxDemography() {
    money.maxDemography = parseInt(this.value);
    updateChartData();
}

function changeAccountBirth() {
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

function changeStartingPercentage() {
    money.setStartingPercentage(getSelectedAccountIndex(), parseFloat(this.value));
    updateChartData();
}

function openTab() {
    d3.selectAll(".tablinks").classed("active", false);
    d3.select(this).classed("active", true);
    
    d3.selectAll(".tabcontent").style("display", "none");
    var tabContentId = d3.select(this).attr("tabContentId");
    d3.select("#" + tabContentId).style("display", "block");

    d3.selectAll(".Comment").style("display", "none");
    var tabId = d3.select(this).attr("id");
    d3.select("#" + this.id + "Comment").style("display", "block");

    return false;
}
