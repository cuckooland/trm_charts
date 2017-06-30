/**
 * Created by vit on 14/10/16.
 */
 
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\$\{p(\d)\}/g, function(match, id) {
        return args[id];
    });
};

// Create configuration selector
function setConfigSelector() {
    d3.select('#ConfigSelector').selectAll("option")
        .data(['Configuration par défaut', 'Configuration remarquable 1', 'Configuration remarquable 2', 'Configuration remarquable 3', 'Configuration remarquable 4', 'Configuration remarquable 5'])
      .enter().append("option")
        .text(function(d) { return d; })
        .attr('value', function(d) { return d; });
        
    document.getElementById("ConfigSelector").selectedIndex = 0;
}

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
            }
        },
        dividend: {
            xFormat: DATE_PATTERN,
            xs: {
                'dividend' : 'x_dividend',
                'scaled_average': 'x_scaled_average'
            },
            names: {
                'dividend': universalDividendLabel(),
                'scaled_average': 'c*M/N'
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
        monetarySupply: {
            xFormat: DATE_PATTERN,
            xs: {
                'monetary_supply' : 'x_monetary_supply',
                'cruising_monetary_supply': 'x_cruising_monetary_supply'
            },
            names: {
                'monetary_supply': 'Masse Monétaire "M"',
                'cruising_monetary_supply': 'N*DU/c'
            },
            columns: []
        }
    };

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
    
	var xScaledAverages = ['x_scaled_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xScaledAverages.push(asDate(money.averages.x[i]));
	}
    c3Data.dividend.columns.push(xScaledAverages);
    c3Data.dividend.columns.push(money.scaledAverages.y);
    c3Data.dividend.columns[c3Data.dividend.columns.length - 1].unshift('scaled_average');
    
	var xPeople = ['x_people'];
	for (i = 0; i < money.headcounts.x.length; i++) {
	    xPeople.push(asDate(money.headcounts.x[i]));
	}
    c3Data.headcount.columns.push(xPeople);
    c3Data.headcount.columns.push(money.headcounts.y);
    c3Data.headcount.columns[c3Data.headcount.columns.length - 1].unshift('people');
    
	var xMonetarySupply = ['x_monetary_supply'];
	for (i = 0; i < money.monetarySupplies.x.length; i++) {
	    xMonetarySupply.push(asDate(money.monetarySupplies.x[i]));
	}
    c3Data.monetarySupply.columns.push(xMonetarySupply);
    c3Data.monetarySupply.columns.push(money.monetarySupplies.y);
    c3Data.monetarySupply.columns[c3Data.monetarySupply.columns.length - 1].unshift('monetary_supply');
    
	var xCruisingMonetarySupply = ['x_cruising_monetary_supply'];
	for (i = 0; i < money.cruisingMonetarySupplies.x.length; i++) {
	    xCruisingMonetarySupply.push(asDate(money.cruisingMonetarySupplies.x[i]));
	}
    c3Data.monetarySupply.columns.push(xCruisingMonetarySupply);
    c3Data.monetarySupply.columns.push(money.cruisingMonetarySupplies.y);
    c3Data.monetarySupply.columns[c3Data.monetarySupply.columns.length - 1].unshift('cruising_monetary_supply');
    
	var xAverage = ['x_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xAverage.push(asDate(money.averages.x[i]));
	}
    c3Data.accounts.columns.push(xAverage);
    c3Data.accounts.columns.push(money.averages.y);
    c3Data.accounts.columns[c3Data.accounts.columns.length - 1].unshift('average');

	var xScaledDividends = ['x_scaled_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xScaledDividends.push(asDate(money.dividends.x[i]));
	}
    c3Data.accounts.columns.push(xScaledDividends);
    c3Data.accounts.columns.push(money.scaledDividends.y);
    c3Data.accounts.columns[c3Data.accounts.columns.length - 1].unshift('scaled_dividend');

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

// capture configurations list
setConfigSelector();

// capture reference frames list
setReferenceFrameSelector(money);

// capture formulas list
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
d3.select('#TimeLowerBound').property("value", money.timeLowerBoundInYears);
d3.select('#TimeUpperBound').property("value", money.timeUpperBoundInYears);
d3.select('#CalculateGrowth').property("checked", money.calculateGrowth);
d3.select('#LogScale').property("checked", money.referenceFrames[money.referenceFrameKey].logScale);
d3.selectAll("input[value=\"byMonth\"]").property("checked", money.growthTimeUnit === money.MONTH);
d3.selectAll("input[value=\"byYear\"]").property("checked", money.growthTimeUnit === money.YEAR);
d3.select('#MaxDemography').property("value", money.maxDemography);
d3.select('#xMinDemography').property("value", money.xMinDemography);
d3.select('#xMaxDemography').property("value", money.xMaxDemography);
d3.select('#xMpvDemography').property("value", money.xMpvDemography);
d3.select('#plateauDemography').property("value", money.plateauDemography);
d3.select('#xScaleDemography').property("value", money.xScaleDemography);
updateAddedMemberArea();

// update in form with calculated growth
if (money.calculateGrowth) {
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}
enableGrowthForms(money.calculateGrowth);
enableUD0Forms();
enableDemographyFields();

function getRefLabel(referenceFrameKey) {
    var refLabel;
    switch(referenceFrameKey) {
        case 'monetaryUnit':
            refLabel = "Unité Monétaire";
            break;
        case 'dividend': 
            refLabel = "Dividende";
            break;
        case 'average':
            refLabel = "%(M/N)";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (money.referenceFrames[money.referenceFrameKey].logScale) {
        refLabel = refLabel + " (log)";
    }
    return refLabel;
}

function getRefUnitLabel(referenceFrameKey) {
    var refUnitLabel;
    switch(referenceFrameKey) {
        case 'monetaryUnit':
            refUnitLabel = 'Unités Monétaires';
            break;
        case 'dividend': 
            refUnitLabel = "DU";
            break;
        case 'average':
            refUnitLabel = "%(M/N)";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (money.referenceFrames[money.referenceFrameKey].logScale) {
        refUnitLabel = refUnitLabel + " (log)";
    }
    return refUnitLabel;
}

function getUdFormulaLabel(udFormulaKey) {
    switch(udFormulaKey) {
        case 'BasicUD':
            return "Basique : DU(t) = c*M(t)/N(t)";
        case 'UDA':
            return "DUA : DU(t) = max[DU(t-1) ; c*M(t)/N(t)]";
        case 'UDB': 
            return "DUB : DU(t) = (1+c)*DU(t-1)";
        case 'UDC': 
            return "DUC : DU(t) = 1/2 [(1+c)*DU(t-1) + c*M(t)/N(t)]";
        case 'UDG':
            return "DUĞ : DU(t) = DU(t-1) + c²*M(t-1)/N(t-1)";
        default:
            throw new Error("Dividend formula not managed: " + udFormulaKey);
    }
}

function getDemographicProfileLabel(demographicProfileKey) {
    switch(demographicProfileKey) {
        case 'None':
            return "Aucun";
        case 'Triangular':
            return "Triangulaire";
        case 'Plateau':
            return "Plateau";
        case 'Cauchy': 
            return "Cauchy";
        case 'DampedWave':
            return "Ondulation Amortie";
        default:
            throw new Error("Demographic profile not managed: " + demographicProfileKey);
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
                text: timeLabel(),
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: DATE_PATTERN,
                count: 2
            }
        },
        y: {
            label: {
                text: accountYLabel(),
                position: 'outer-middle'
            },
            tick: {
                format: tickFormat
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return tooltipFormat(value);
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
                text: timeLabel(),
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: DATE_PATTERN,
                count: 2 
            }
        },
        y: {
            label: {
                text: accountYLabel(),
                position: 'outer-middle'
            },
            position: 'outer-top',
            tick: {
                format: tickFormat
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return tooltipFormat(value);
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
                text: timeLabel(),
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: DATE_PATTERN,
                count: 2
            }
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
                text: timeLabel(),
                position: 'outer-center'
            },
            type: 'timeseries',
            tick: {
                format: DATE_PATTERN,
                count: 2
            }
        },
        y: {
            label: {
                text: accountYLabel(),
                position: 'outer-middle'
            },
            position: 'outer-top',
            tick: {
                format: tickFormat
            }
        }
    },
    tooltip: {
        format: {
            value: function (value, ratio, id, index) {
                return tooltipFormat(value);
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

setChartTimeBounds();

function tickFormat(value) {
    var f = d3.format('.2s');
    return withExp(f(value));
}

function tooltipFormat(value) {
    var isInfinite = money.isInfinite(value);
    if (isInfinite < 0) {
        return '-Infini';
    }
    if (isInfinite > 0) {
        return '+Infini';
    }
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
    
    setChartTimeBounds();
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
        return format(new Date(2000 + Math.trunc(timeStep / 12), timeStep % 12, 1));
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

function enableDemographyFields() {
    document.getElementById("MaxDemography").parentNode.style.display='none';
    document.getElementById("xMinDemography").parentNode.style.display='none';
    document.getElementById("xMaxDemography").parentNode.style.display='none';
    document.getElementById("xMpvDemography").parentNode.style.display='none';
    document.getElementById("plateauDemography").parentNode.style.display='none';
    document.getElementById("xScaleDemography").parentNode.style.display='none';

    if (money.demographicProfileKey === "None") {
        d3.select("#DemographyParamSection").style("display", "none");
    }
    else {
        d3.select("#DemographyParamSection").style("display", "block");
    }

    switch(money.demographicProfileKey) {
        case 'None':
            break;
        case 'Triangular': 
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMinDemography").parentNode.style.display='block';
            document.getElementById("xMaxDemography").parentNode.style.display='block';
            document.getElementById("xMpvDemography").parentNode.style.display='block';
            break;
        case 'Plateau': 
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMinDemography").parentNode.style.display='block';
            document.getElementById("xMaxDemography").parentNode.style.display='block';
            document.getElementById("plateauDemography").parentNode.style.display='block';
            break;
        case 'Cauchy':
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMpvDemography").parentNode.style.display='block';
            document.getElementById("xScaleDemography").parentNode.style.display='block';
            break;
        case 'DampedWave':
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xScaleDemography").parentNode.style.display='block';
            break;
        default:
            throw new Error("Demographic profile not managed: " + udFormulaKey);
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

d3.select("#ConfigSelector").on("change", changeConfiguration);
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
d3.select("#LogScale").on("click", changeLogScale);
d3.select("#TimeLowerBound").on("change", changeTimeLowerBound);
d3.select("#TimeUpperBound").on("change", changeTimeUpperBound);
d3.select("#MaxDemography").on("change", changeMaxDemography);
d3.select("#xMinDemography").on("change", changeXMinDemography);
d3.select("#xMaxDemography").on("change", changeXMaxDemography);
d3.select("#xMpvDemography").on("change", changeXMpvDemography);
d3.select("#plateauDemography").on("change", changePlateauDemography);
d3.select("#xScaleDemography").on("change", changeXScaleDemography);
d3.select("#AccountBirth").on("change", changeAccountBirth);
d3.select("#ProduceUd").on("click", changeProduceUd);
d3.select("#StartingPercentage").on("change", changeStartingPercentage);

d3.selectAll(".tablinks").on("click", openTab);

d3.selectAll("input[type=\"text\"]").on("click", function() { comment(this.id); });

d3.selectAll(".chart").on("click", function() { comment(this.id); });

document.getElementById("IntroItem").click();

function setChartTimeBounds() {
    var lowerBoundDate = asDate(money.getTimeLowerBound(money.YEAR), money.YEAR);
    var upperBoundDate = asDate(money.getTimeUpperBound(money.YEAR), money.YEAR);
    accountsChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
}

function changeConfiguration() {
}

function changeReferenceFrame() {
    money.referenceFrameKey = this.options[this.selectedIndex].value;
    d3.select('#LogScale').property("checked", money.referenceFrames[money.referenceFrameKey].logScale);
        
    // Axes
    accountsChart.axis.labels({
        y: accountYLabel()
    });
    dividendChart.axis.labels({
        y: accountYLabel()
    });
    monetarySupplyChart.axis.labels({
        y: accountYLabel()
    });
    
    updateChartData();
    
    comment(money.referenceFrameKey);
}

function accountYLabel() {
    return 'Montant (en ' + getRefUnitLabel(money.referenceFrameKey) + ')'
}

function timeLabel() {
    if (money.growthTimeUnit == money.MONTH) {
        return 'Temps (émission mensuelle)';
    }
    else {
        return 'Temps (émission anuelle)';
    }
}

function universalDividendLabel() {
    switch(money.udFormulaKey) {
        case 'BasicUD':
            return "Dividende Universel (Basique)";
        case 'UDA':
            return "Dividende Universel (DUA)";
        case 'UDB': 
            return "Dividende Universel (DUB)";
        case 'UDC': 
            return "Dividende Universel (DUC)";
        case 'UDG':
            return "Dividende Universel (DUĞ)";
        default:
            throw new Error("Dividend formula not managed: " + udFormulaKey);
    }
}

function changeUdFormula() {
    money.udFormulaKey = this.options[this.selectedIndex].value;
    updateChartData();
    
    comment(money.udFormulaKey);
}

function changeDemographicProfile() {
    money.demographicProfileKey = this.options[this.selectedIndex].value;
    enableDemographyFields();
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
        
    // Axes
    accountsChart.axis.labels({
        x: timeLabel()
    });
    dividendChart.axis.labels({
        x: timeLabel()
    });
    headcountChart.axis.labels({
        x: timeLabel()
    });
    monetarySupplyChart.axis.labels({
        x: timeLabel()
    });
    
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

function changeLogScale() {
    money.referenceFrames[money.referenceFrameKey].logScale = !money.referenceFrames[money.referenceFrameKey].logScale
        
    // Axes
    accountsChart.axis.labels({
        y: accountYLabel()
    });
    dividendChart.axis.labels({
        y: accountYLabel()
    });
    monetarySupplyChart.axis.labels({
        y: accountYLabel()
    });
    
    updateChartData();
    
    comment(this.id);
}

function changeTimeLowerBound() {
    var timeLowerBound = parseInt(this.value);
    if (timeLowerBound >= 0 && timeLowerBound < 200) {
        money.setTimeLowerBound(timeLowerBound); 
        updateChartData();
        d3.select('#TimeUpperBound').property("value", money.getTimeUpperBound(money.YEAR));
    }
    else {
        d3.select('#TimeLowerBound').property("value", money.getTimeLowerBound(money.YEAR));
    }
}

function changeTimeUpperBound() {
    var timeUpperBound = parseInt(this.value);
    if (timeUpperBound > 0 && timeUpperBound <= 200) {
        money.setTimeUpperBound(timeUpperBound); 
        updateChartData();
        d3.select('#TimeLowerBound').property("value", money.getTimeLowerBound(money.YEAR));
    }
    else {
        d3.select('#TimeUpperBound').property("value", money.getTimeUpperBound(money.YEAR));
    }
}

function changeMaxDemography() {
    var maxDemography = parseInt(this.value);
    if (maxDemography >= 0 && maxDemography < 1000000) {
        money.maxDemography = maxDemography;
        updateChartData();
    }
    else {
        d3.select('#MaxDemography').property("value", money.maxDemography);
    }
}

function changeXMinDemography() {
    var xMinDemography = parseInt(this.value);
    if (xMinDemography >= 0 && xMinDemography < 200) {
        money.xMinDemography = xMinDemography;
        updateChartData();
    }
    else {
        d3.select('#xMinDemography').property("value", money.xMinDemography);
    }
}

function changeXMaxDemography() {
    var xMaxDemography = parseInt(this.value);
    if (xMaxDemography >= 1 && xMaxDemography < 199) {
        money.xMaxDemography = xMaxDemography;
        updateChartData();
    }
    else {
        d3.select('#xMaxDemography').property("value", money.xMaxDemography);
    }
}

function changeXMpvDemography() {
    var xMpvDemography = parseInt(this.value);
    if (xMpvDemography >= 1 && xMpvDemography < 199) {
        money.xMpvDemography = xMpvDemography;
        updateChartData();
    }
    else {
        d3.select('#xMpvDemography').property("value", money.xMpvDemography);
    }
}

function changePlateauDemography() {
    var plateauDemography = parseInt(this.value);
    if (plateauDemography >= 0 && plateauDemography < 199) {
        money.plateauDemography = plateauDemography;
        updateChartData();
    }
    else {
        d3.select('#plateauDemography').property("value", money.plateauDemography);
    }
}

function changeXScaleDemography() {
    var xScaleDemography = parseFloat(this.value);
    if (xScaleDemography > 0) {
        money.xScaleDemography = xScaleDemography;
        updateChartData();
    }
    else {
        d3.select('#xScaleDemography').property("value", money.xScaleDemography);
    }
}

function changeAccountBirth() {
    var birth = parseInt(this.value);
    if (birth >= 0 && birth < 200) {
        money.setAccountBirth(getSelectedAccountIndex(), birth);
        updateChartData();
    }
    else {
        d3.select('#AccountBirth').property("value", money.getAccountBirth(getSelectedAccountIndex()));
    }
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
    var startingPercentage = parseFloat(this.value);
    if (startingPercentage >= 0) {
        money.setStartingPercentage(getSelectedAccountIndex(), startingPercentage);
        updateChartData();
    }
    else {
        d3.select('#StartingPercentage').property("value", money.getStartingPercentage(getSelectedAccountIndex()));
    }
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