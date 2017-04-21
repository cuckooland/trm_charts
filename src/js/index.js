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
function setReferenceFrameSelector(money) {
    d3.select('#ReferenceFrameSelector').selectAll("option")
        .data(Object.keys(money.referenceFrames))
      .enter().append("option")
        .text(function(d) { return getRefLabel(d); })
        .attr('value', function(d) { return d; });
        
    var selectedIndex = Object.keys(money.referenceFrames).indexOf(money.referenceFrameKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed");
    }
    document.getElementById("ReferenceFrameSelector").selectedIndex = selectedIndex;
};

// Create formula selector
function setUdFormulaSelector(money) {
    d3.select('#UdFormulaSelector').selectAll("option")
        .data(Object.keys(money.udFormulas))
      .enter().append("option")
        .text(function(d) { return getUdFormulaLabel(d); })
        .attr('value', function(d) { return d; });
    
    var selectedIndex = Object.keys(money.udFormulas).indexOf(money.udFormulaKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed");
    }
    document.getElementById("UdFormulaSelector").selectedIndex = selectedIndex;
};

// Create demographic profile selector
function setDemographySelector(money) {
    d3.select('#DemographySelector').selectAll("option")
        .data(Object.keys(money.demographicProfiles))
      .enter().append("option")
        .text(function(d) { return getDemographicProfileLabel(d); })
        .attr('value', function(d) { return d; });
    
    var selectedIndex = Object.keys(money.demographicProfiles).indexOf(money.demographicProfileKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed");
    }
    document.getElementById("DemographySelector").selectedIndex = selectedIndex;
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

function generateData() {
    money.generateData();
    
	var c3Data = {
        accounts: {
            xFormat: DATE_PATTERN,
            xs: {
                'average': 'x_average',
                'scaled_dividend': 'x_scaled_dividend'
            },
            names: {
                'average': 'Moyenne "M/N"',
                'scaled_dividend': 'DU/c'
            },
            columns: [],
            types: {
                average: 'area'
            },
			regions: {
				'scaled_dividend':[{'style': 'dashed'}]
			}
        },
        dividend: {
            xFormat: DATE_PATTERN,
            xs: {
                'dividend' : 'x_dividend',
                'scaled_average': 'x_scaled_average'
            },
            names: {
                'dividend': 'Dividende Universel',
                'scaled_average': 'c*M/N'
            },
            columns: [],
			regions: {
				'scaled_average':[{'style': 'dashed'}]
			}
        },
        headcount: {
            xFormat: DATE_PATTERN,
            x: 'x_people',
            names: {
                'people': 'Nombre d\'individus "N"'
            },
            columns: []
        },
        monetarySupply: {
            xFormat: DATE_PATTERN,
            xs: {
                'monetary_supply' : 'x_monetary_supply',
                'scaled_monetary_supply': 'x_scaled_monetary_supply'
            },
            x: 'x_monetary_supply',
            names: {
                'monetary_supply': 'Masse Monétaire "M"',
                'scaled_monetary_supply': 'N*DU/c'
            },
            columns: [],
			regions: {
				'scaled_monetary_supply':[{'style': 'dashed'}]
			}
        }
    };

	var xScaledAverages = ['x_scaled_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xScaledAverages.push(asDate(money.averages.x[i]));
	}
	var scaledAverages = ['scaled_average'];
	for (i = 0; i < money.averages.y.length; i++) {
	    scaledAverages.push(money.averages.y[i] * money.growth);
	}
	var xScaledDividends = ['x_scaled_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xScaledDividends.push(asDate(money.dividends.x[i]));
	}
	var scaledDividends = ['scaled_dividend'];
	for (i = 0; i < money.dividends.y.length; i++) {
	    scaledDividends.push(money.dividends.y[i] / money.growth);
	}
	
    var iAccount, i;
    // For each account...
	for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
		// add axis mapping
		var c3Id = getC3Id(money.accounts[iAccount].id);
		c3Data.accounts.xs[c3Id] = 'x_' + c3Id;
        c3Data.accounts.names[c3Id] = money.accounts[iAccount].name;
	}
	
    // add data to columns and add axis header 
	var xDividends = ['x_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xDividends.push(asDate(money.dividends.x[i]));
	}
    c3Data.dividend.columns.push(xDividends);
    c3Data.dividend.columns.push(money.dividends.y);
    c3Data.dividend.columns[c3Data.dividend.columns.length - 1].unshift('dividend');
    
    c3Data.dividend.columns.push(xScaledAverages);
    c3Data.dividend.columns.push(scaledAverages);
    
	var xPeople = ['x_people'];
	for (i = 0; i < money.headcounts.x.length; i++) {
	    xPeople.push(asDate(money.headcounts.x[i]));
	}
    c3Data.headcount.columns.push(xPeople);
    c3Data.headcount.columns.push(money.headcounts.values);
    c3Data.headcount.columns[c3Data.headcount.columns.length - 1].unshift('people');
    
	var xMonetarySupply = ['x_monetary_supply'];
	for (i = 0; i < money.monetarySupplies.x.length; i++) {
	    xMonetarySupply.push(asDate(money.monetarySupplies.x[i]));
	}
    c3Data.monetarySupply.columns.push(xMonetarySupply);
    c3Data.monetarySupply.columns.push(money.monetarySupplies.y);
    c3Data.monetarySupply.columns[c3Data.monetarySupply.columns.length - 1].unshift('monetary_supply');
    
	var xScaledMonetarySupply = ['x_scaled_monetary_supply'];
	for (i = 0; i < money.scaledMonetarySupplies.x.length; i++) {
	    xScaledMonetarySupply.push(asDate(money.scaledMonetarySupplies.x[i]));
	}
    c3Data.monetarySupply.columns.push(xScaledMonetarySupply);
    c3Data.monetarySupply.columns.push(money.scaledMonetarySupplies.y);
    c3Data.monetarySupply.columns[c3Data.monetarySupply.columns.length - 1].unshift('scaled_monetary_supply');
    
	var xAverage = ['x_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xAverage.push(asDate(money.averages.x[i]));
	}
    c3Data.accounts.columns.push(xAverage);
    c3Data.accounts.columns.push(money.averages.y);
    c3Data.accounts.columns[c3Data.accounts.columns.length - 1].unshift('average');

    c3Data.accounts.columns.push(xScaledDividends);
    c3Data.accounts.columns.push(scaledDividends);

    var toUnload = [];
    // for each account...
    for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
  		var c3Id = getC3Id(money.accounts[iAccount].id);
        // add data to columns
        if (money.accounts[iAccount].x.length > 1) {
            
        	var xAccount = [c3Data.accounts.xs[c3Id]];
        	for (i = 0; i < money.accounts[iAccount].x.length; i++) {
        	    xAccount.push(asDate(money.accounts[iAccount].x[i]));
        	}
            c3Data.accounts.columns.push(xAccount);
            
            c3Data.accounts.columns.push(money.accounts[iAccount].y);
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
libreMoneyClass.call(money);

// capture reference frames list
setReferenceFrameSelector(money);

// capture formulaes list
setUdFormulaSelector(money);

// capture population variation list
setDemographySelector(money);

// add a member account
var accountIndex = money.addAccount();
updateAccountName(accountIndex);
joinAccountSelectorToData();
document.getElementById("AccountSelector").selectedIndex = 0;

// generate data
var data = generateData();

// Fill the form
d3.select('#LifeExpectancy').property("value", money.lifeExpectancy);
d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH)).toFixed(2));
d3.select('#MoneyDuration').property("value", money.displayedPeriodInYears);
d3.select('#CalculateGrowth').property("checked", money.calculateGrowth);
d3.selectAll("input[value=\"byMonth\"]").property("checked", money.growthTimeUnit === money.MONTH);
d3.selectAll("input[value=\"byYear\"]").property("checked", money.growthTimeUnit === money.YEAR);
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

function getRefLabel(referenceFrameKey) {
    switch(referenceFrameKey) {
        case 'monetaryUnit':
            return "Unité Monétaire";
        case 'dividend': 
            return "Dividende";
        case 'average':
            return "%(M/N)";
        default:
            throw new Error("Reference frame not managed");
    }
}

function getRefUnitLabel(referenceFrameKey) {
    switch(referenceFrameKey) {
        case 'monetaryUnit':
            return 'Unités Monétaires';
        case 'dividend': 
            return "DU";
        case 'average':
            return "%(M/N)";
        default:
            throw new Error("Reference frame not managed");
    }
}

function getUdFormulaLabel(udFormulaKey) {
    switch(udFormulaKey) {
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

function getDemographicProfileLabel(demographicProfileKey) {
    switch(demographicProfileKey) {
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
            throw new Error("Demographic profile not managed");
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
                text: accountYLabel(money.referenceFrameKey),
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
        show: false,
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
                text: accountYLabel(money.referenceFrameKey),
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
        pattern: ['#ff7f0e', '#1f77b4']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: false,
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
        show: false,
        r: 2
    }
});

// create and display chart from data.monetarySupply
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
                text: accountYLabel(money.referenceFrameKey),
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
    data: data.monetarySupply,
    color: {
        pattern: ['#9467bd', '#ff9896']
    },
    transition: {
        duration: TRANSITION_DURATION
    },
    point: {
        show: false,
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
    var data = generateData();

    // tell load command to unload old data
    if (toUnload) {
        data.accounts.unload = toUnload;
        data.dividend.unload = toUnload;
        data.headcount.unload = toUnload;
        data.monetarySupply.unload = toUnload;
    }

    // reload data in chart
    accountsChart.load(data.accounts);
    dividendChart.load(data.dividend);
    headcountChart.load(data.headcount);
    monetarySupplyChart.load(data.monetarySupply);
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
    if (money.demographicProfileKey === "None") {
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

d3.selectAll("input[type=\"text\"]").on("click", function() { comment(this.id); });

document.getElementById("MoneyItem").click();


function changeReferenceFrame() {
    money.referenceFrameKey = this.options[this.selectedIndex].value;
        
    // Axes
    accountsChart.axis.labels({
        y: accountYLabel(money.referenceFrameKey),
    });
    dividendChart.axis.labels({
        y: accountYLabel(money.referenceFrameKey),
    });
    monetarySupplyChart.axis.labels({
        y: accountYLabel(money.referenceFrameKey),
    });
    
    updateChartData();
    
    comment(money.referenceFrameKey);
}

function accountYLabel(referenceFrameKey) {
    return 'Montant (en ' + getRefUnitLabel(referenceFrameKey) + ')'
}

function changeUdFormula() {
    money.udFormulaKey = this.options[this.selectedIndex].value;
    updateChartData();
    
    comment(money.udFormulaKey);
}

function changeDemographicProfile() {
    money.demographicProfileKey = this.options[this.selectedIndex].value;
    enableMaxDemography();
    updateChartData();
    
    comment(money.demographicProfileKey);
}

function changeRythm() {
    if (this.value === "byMonth") {
        money.growthTimeUnit = money.MONTH;
        money.dividendStart = parseFloat(document.getElementById('MonthlyDividendStart').value);
    	money.growth = parseFloat(document.getElementById('MonthlyGrowth').value) / 100;
    }
    else {
        money.growthTimeUnit = money.YEAR;
        money.dividendStart = parseFloat(document.getElementById('AnnualDividendStart').value);
    	money.growth = parseFloat(document.getElementById('AnnualGrowth').value) / 100;
    }
    
    d3.selectAll("input[value=\"byMonth\"]").property("checked", money.growthTimeUnit === money.MONTH);
    d3.selectAll("input[value=\"byYear\"]").property("checked", money.growthTimeUnit === money.YEAR);
    
    enableGrowthForms(money.calculateGrowth);
    enableUD0Forms();
    updateChartData();
    
    comment(this.value);
}

function changeLifeExpectancy() {
    money.lifeExpectancy = parseInt(this.value);
    updateChartData();
    updateCalculateGrowth();
}

function changeAnnualGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH)).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}

function changeMonthlyGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
}

function changeCalculateGrowth() {
    money.calculateGrowth = this.checked;
    
    enableGrowthForms(money.calculateGrowth);
    updateChartData();
    updateCalculateGrowth();
    
    comment(this.id);
}

function updateCalculateGrowth() {
    if (money.calculateGrowth) {
        d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
        d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
        
        if (money.growthTimeUnit === money.MONTH) {
            d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
        }
        else {
            d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH)).toFixed(2));
        }
    }
}

function changeAnnualDividendStart() {
    money.dividendStart = parseFloat(this.value);
    updateChartData();
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH)).toFixed(2));
}

function changeMonthlyDividendStart() {
    money.dividendStart = parseFloat(this.value);
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
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
    
    comment(this.id);
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

    comment(this.id);
    
    return false;
}

function comment(id) {
    d3.selectAll(".Comment").style("display", "none");
    d3.select("#" + id + "Comment").style("display", "block");

    return false;
}