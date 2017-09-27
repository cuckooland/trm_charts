/**
 * Created by vit on 14/10/16.
 */
 
const TRANSITION_DURATION = 1000;

const EXP_FORMATS = {
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

const DATE_PATTERN = "%d-%m-%Y";

// Add a 'format' function to String
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\$\{p(\d)\}/g, function(match, id) {
        return args[id];
    });
};

// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libreMoneyClass.call(money);

var curConfigId = "";
var curTabId = "";
var commentedId = "";

window.addEventListener('popstate', function(e) {
    var encodedURI = e.state;

    if (encodedURI !== null) {
        applyEncodedURI(encodedURI);
    }
});

initSelectors();

generateC3Charts();

if (!applyEncodedURIFromLocation()) {
    applyJSonRep(configs1['config1-1']);
    var encodedURI = asEncodedURI();
    window.history.replaceState(encodedURI, '', '?' + encodedURI);
}

initCallbacks();

// Fill the forms
function fillForms() {
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
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}

function enableForms() {
    enableGrowthForms(money.calculateGrowth);
    enableUD0Forms();
    enableDemographyFields();
}

// generate C3 charts
function generateC3Charts() {
    money.generateData();
    generateAccountsChart();
    generateDividendChart();
    generateHeadcountChart();
    generateMonetarySupplyChart();
    setChartTimeBounds();
}

function initCallbacks() {
    d3.select("#ConfigSelector1").on("change", changeConfiguration1);
    d3.select("#ConfigSelector2").on("change", changeConfiguration2);
    d3.select("#ReferenceFrameSelector").on("change", changeReferenceFrame);
    d3.select("#UdFormulaSelector").on("change", changeUdFormula);
    d3.select("#DemographySelector").on("change", changeDemographicProfile);
    d3.select("#AccountSelector").on("change", changeAccountSelection);

    d3.selectAll(".rythm").on("change", changeRythm);
    d3.selectAll(".firstDividend").on("change", changeRythm);

    d3.select("#AddAccount").on("click", clickAddAccount);
    d3.select("#DeleteAccount").on("click", clickDeleteAccount);

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

    d3.selectAll(".tablinks").on("click", clickTab);

    d3.selectAll("input[type=\"text\"]").on("click", function() { comment(this.id); });

    d3.selectAll(".chart").on("click", function() { comment(this.id); });
}

function asEncodedURI() {
    var moneyAsJSon = money.asJSonRep();
    var guiAsJSon = {
        'curTabId' : curTabId,
        'curConfigId' : curConfigId,
        'accountsChart' : {
            'hiddenSeries' : getHiddenDataKeys(accountsChart)
        },
        'dividendChart' : {
            'hiddenSeries' : getHiddenDataKeys(dividendChart)
        },
        'headcountChart' : {
            'hiddenSeries' : getHiddenDataKeys(headcountChart)
        },
        'monetarySupplyChart' : {
            'hiddenSeries' : getHiddenDataKeys(monetarySupplyChart)
        },
        'selectedAccount' : document.getElementById("AccountSelector").selectedIndex,
        'commentedId' : commentedId
    };
    var jsonRep = {
        'moneyAsJSon' : moneyAsJSon,
        'guiAsJSon' : guiAsJSon
    };
    var stringRep = JSON.stringify(jsonRep);
    var encodedURI = LZString.compressToEncodedURIComponent(stringRep);
    return encodedURI;
}

function applyEncodedURIFromLocation() {
    if (window.location.search.length > 1) {
        var encodedURI = window.location.search.substr(1);
        return applyEncodedURI(encodedURI);
    }
    return false;
}

function applyEncodedURI(encodedURI) {
    var stringRep = LZString.decompressFromEncodedURIComponent(encodedURI);
    if (stringRep.length != 0) {
        var jsonRep = JSON.parse(stringRep);
        applyJSonRep(jsonRep);
        return true;
    }
    return false;
}

function applyJSonRep(jsonRep) {
    money.applyJSonRep(jsonRep.moneyAsJSon);
    
    fillForms();
    enableForms();
    joinAccountSelectorToData();
    document.getElementById("AccountSelector").selectedIndex = jsonRep.guiAsJSon.selectedAccount;
    
    curConfigId = jsonRep.guiAsJSon.curConfigId;
    setConfigSelection();
    
    setReferenceFrameSelection(money);
    setUdFormulaSelection(money);
    setDemographySelection(money);
    
    updateAddedMemberArea();
    updateAccountYLabels();
    updateChartData();
    openTab(jsonRep.guiAsJSon.curTabId);
    comment(jsonRep.guiAsJSon.commentedId);
    
    setHiddenSeries(accountsChart, jsonRep.guiAsJSon.accountsChart.hiddenSeries);
    setHiddenSeries(dividendChart, jsonRep.guiAsJSon.dividendChart.hiddenSeries);
    setHiddenSeries(headcountChart, jsonRep.guiAsJSon.headcountChart.hiddenSeries);
    setHiddenSeries(monetarySupplyChart, jsonRep.guiAsJSon.monetarySupplyChart.hiddenSeries);
}
    
function setHiddenSeries(chart, hiddenSeries) {
    chart.hide(hiddenSeries);
    
    var data = chart.data();
    var shownDataKeys = [];
    for (var i = 0; i < data.length; i++) {
        if (hiddenSeries.indexOf(data[i].id) < 0) {
            shownDataKeys.push(data[i].id);
        }
    }
    
    chart.show(shownDataKeys);
}

// Init the different selectors
function initSelectors() {
    feedConfigSelector1();
    feedConfigSelector2();
    feedReferenceFrameSelector(money);
    feedUdFormulaSelector(money);
    feedDemographySelector(money);
}

// Create configuration selector
function feedConfigSelector1() {
    d3.select('#ConfigSelector1').selectAll("option")
        .data(Object.keys(configs1))
      .enter().append("option")
        .text(function(d) { return getConfigLabel(d); })
        .attr('value', function(d) { return d; });
}

function feedConfigSelector2() {
    d3.select('#ConfigSelector2').selectAll("option")
        .data(Object.keys(configs2))
      .enter().append("option")
        .text(function(d) { return getConfigLabel(d); })
        .attr('value', function(d) { return d; });
}

function setConfigSelection() {
    var selectedIndex = Object.keys(configs1).indexOf(curConfigId);
    if (selectedIndex != -1) {
        document.getElementById("ConfigSelector1").selectedIndex = selectedIndex;
        document.getElementById("ConfigSelector2").selectedIndex = 0;
        return;
    }
    var selectedIndex = Object.keys(configs2).indexOf(curConfigId);
    if (selectedIndex != -1) {
        document.getElementById("ConfigSelector2").selectedIndex = selectedIndex;
        document.getElementById("ConfigSelector1").selectedIndex = 0;
        return;
    }
    throw new Error("Configuration not managed: " + curConfigId);
};

// Create reference frame selector
function feedReferenceFrameSelector(money) {
    d3.select('#ReferenceFrameSelector').selectAll("option")
        .data(Object.keys(money.referenceFrames))
      .enter().append("option")
        .text(function(d) { return getRefLabel(d); })
        .attr('value', function(d) { return d; });
};

function setReferenceFrameSelection(money) {
    var selectedIndex = Object.keys(money.referenceFrames).indexOf(money.referenceFrameKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed: " + money.referenceFrameKey);
    }
    document.getElementById("ReferenceFrameSelector").selectedIndex = selectedIndex;
};

// Create formula selector
function feedUdFormulaSelector(money) {
    d3.select('#UdFormulaSelector').selectAll("option")
        .data(Object.keys(money.udFormulas))
      .enter().append("option")
        .text(function(d) { return getUdFormulaLabel(d); })
        .attr('value', function(d) { return d; });
};

function setUdFormulaSelection(money) {
    var selectedIndex = Object.keys(money.udFormulas).indexOf(money.udFormulaKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed: " + money.udFormulaKey);
    }
    document.getElementById("UdFormulaSelector").selectedIndex = selectedIndex;
};

// Create demographic profile selector
function feedDemographySelector(money) {
    d3.select('#DemographySelector').selectAll("option")
        .data(Object.keys(money.demographicProfiles))
      .enter().append("option")
        .text(function(d) { return getDemographicProfileLabel(d); })
        .attr('value', function(d) { return d; });
};

function setDemographySelection(money) {
    var selectedIndex = Object.keys(money.demographicProfiles).indexOf(money.demographicProfileKey);
    if (selectedIndex == -1) {
        throw new Error("Reference frame not managed: " + money.demographicProfileKey);
    }
    document.getElementById("DemographySelector").selectedIndex = selectedIndex;
};

// Join (via D3) account selector to 'money.accounts'
function joinAccountSelectorToData() {
    var options = d3.select('#AccountSelector').selectAll("option")
        .data(money.accounts, function(d) { return d.id; });
            
    options.text(function(d) { return accountName(d); });
    
    options.enter().append("option")
        .text(function(d) { return accountName(d); })
        .attr('value', function(d) { return d.id; })
        
    options.exit().remove();
};

function generateAccountsData() {
	var accountsData = {
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
        onmouseover : function(d) { 
            showAllTooltips(accountsChart, d);
        },
        onmouseout : function(d) {
            hideAllTooltips();
        }
    };
    
    var iAccount, i;
    // For each account...
	for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
		// add axis mapping
		var c3Id = getC3Id(money.accounts[iAccount].id);
		accountsData.xs[c3Id] = 'x_' + c3Id;
        accountsData.names[c3Id] = fullAccountName(money.accounts[iAccount]);
	}
	
    // add data to columns and add axis header 
	var xAverage = ['x_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xAverage.push(asDate(money.averages.x[i]));
	}
    accountsData.columns.push(xAverage);
    accountsData.columns.push(money.averages.y);
    accountsData.columns[accountsData.columns.length - 1].unshift('average');

	var xScaledDividends = ['x_scaled_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xScaledDividends.push(asDate(money.dividends.x[i]));
	}
    accountsData.columns.push(xScaledDividends);
    accountsData.columns.push(money.scaledDividends.y);
    accountsData.columns[accountsData.columns.length - 1].unshift('scaled_dividend');

    // Depending on X axis bounds, some accounts are not visible => use 'unload' flag
    var toUnload = [];
    // for each account...
    for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
  		var c3Id = getC3Id(money.accounts[iAccount].id);
        // add data to columns
        if (money.accounts[iAccount].x.length > 1) {
            
        	var xAccount = [accountsData.xs[c3Id]];
        	for (i = 0; i < money.accounts[iAccount].x.length; i++) {
        	    xAccount.push(asDate(money.accounts[iAccount].x[i]));
        	}
            accountsData.columns.push(xAccount);
            
            accountsData.columns.push(money.accounts[iAccount].y);
            accountsData.columns[accountsData.columns.length - 1].unshift(c3Id);
        }
        else {
            toUnload.push(c3Id);
        }
    }
    if (toUnload.length > 0) {
        accountsData.unload = toUnload;
    }
    return accountsData;
}

var tooltipingChart = null;

function showAllTooltips(chart, d) {
    if (tooltipingChart == null) {
        tooltipingChart = chart;
        showTooltip(accountsChart, d);
        showTooltip(dividendChart, d);
        showTooltip(headcountChart, d);
        showTooltip(monetarySupplyChart, d);
        tooltipingChart = null;
    }
}

function showTooltip(chart, d) {
    if (chart != tooltipingChart) {
        var shownDataList = chart.data.shown();
        for (i = 0; i < shownDataList.length; i++) {
            for (j = 0; j < shownDataList[i].values.length; j++) {
                if (shownDataList[i].values[j].x.getTime() == d.x.getTime()) {
                    chart.tooltip.show({ data: {x: d.x, value: shownDataList[i].values[j].value, id: shownDataList[i].id} });
                    return;
                }
            }
        }
    }
}
	
function hideAllTooltips() {
    accountsChart.tooltip.hide();
    dividendChart.tooltip.hide();
    headcountChart.tooltip.hide();
    monetarySupplyChart.tooltip.hide();
}

function generateDividendData() {
    var dividendData = {
        xFormat: DATE_PATTERN,
        xs: {
            'dividend' : 'x_dividend',
            'scaled_average': 'x_scaled_average'
        },
        names: {
            'dividend': universalDividendLabel(),
            'scaled_average': 'c*M/N'
        },
        columns: [],
        onmouseover : function(d) { 
            showAllTooltips(dividendChart, d);
        },
        onmouseout : function(d) {
            hideAllTooltips();
        }
    };
    
    // add data to columns and add axis header 
	var xDividends = ['x_dividend'];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xDividends.push(asDate(money.dividends.x[i]));
	}
    dividendData.columns.push(xDividends);
    dividendData.columns.push(money.dividends.y);
    dividendData.columns[dividendData.columns.length - 1].unshift('dividend');
    
	var xScaledAverages = ['x_scaled_average'];
	for (i = 0; i < money.averages.x.length; i++) {
	    xScaledAverages.push(asDate(money.averages.x[i]));
	}
    dividendData.columns.push(xScaledAverages);
    dividendData.columns.push(money.scaledAverages.y);
    dividendData.columns[dividendData.columns.length - 1].unshift('scaled_average');
    
    return dividendData;
}

function generateHeadcountData() {
    var headcountData = {
        xFormat: DATE_PATTERN,
        x: 'x_people',
        names: {
            'people': 'Nombre d\'individus "N" (' + getDemographicProfileLabel(money.demographicProfileKey) + ')'
        },
        columns: [],
        onmouseover : function(d) { 
            showAllTooltips(headcountChart, d);
        },
        onmouseout : function(d) {
            hideAllTooltips();
        }
    };
    
    // add data to columns and add axis header 
	var xPeople = ['x_people'];
	for (i = 0; i < money.headcounts.x.length; i++) {
	    xPeople.push(asDate(money.headcounts.x[i]));
	}
    headcountData.columns.push(xPeople);
    headcountData.columns.push(money.headcounts.y);
    headcountData.columns[headcountData.columns.length - 1].unshift('people');
    
    return headcountData;
}
    
function generateMonetarySupplyData() {
    var monetarySupplyData = {
        xFormat: DATE_PATTERN,
        xs: {
            'monetary_supply' : 'x_monetary_supply',
            'cruising_monetary_supply': 'x_cruising_monetary_supply'
        },
        names: {
            'monetary_supply': 'Masse Monétaire "M"',
            'cruising_monetary_supply': 'N*DU/c'
        },
        columns: [],
        onmouseover : function(d) { 
            showAllTooltips(monetarySupplyChart, d);
        },
        onmouseout : function(d) {
            hideAllTooltips();
        }
    };

    // add data to columns and add axis header 
	var xMonetarySupply = ['x_monetary_supply'];
	for (i = 0; i < money.monetarySupplies.x.length; i++) {
	    xMonetarySupply.push(asDate(money.monetarySupplies.x[i]));
	}
    monetarySupplyData.columns.push(xMonetarySupply);
    monetarySupplyData.columns.push(money.monetarySupplies.y);
    monetarySupplyData.columns[monetarySupplyData.columns.length - 1].unshift('monetary_supply');
    
	var xCruisingMonetarySupply = ['x_cruising_monetary_supply'];
	for (i = 0; i < money.cruisingMonetarySupplies.x.length; i++) {
	    xCruisingMonetarySupply.push(asDate(money.cruisingMonetarySupplies.x[i]));
	}
    monetarySupplyData.columns.push(xCruisingMonetarySupply);
    monetarySupplyData.columns.push(money.cruisingMonetarySupplies.y);
    monetarySupplyData.columns[monetarySupplyData.columns.length - 1].unshift('cruising_monetary_supply');
    
	return monetarySupplyData;
};

function getC3Id(accountId) {
    return 'member_' + accountId;
}

function getConfigLabel(configKey) {
    var configLabel;
    switch(configKey) {
        case 'none':
            configLabel = "";
            break;
        case 'config1-1':
            configLabel = "Configuration 1";
            break;
        case 'config1-2': 
            configLabel = "Configuration 2";
            break;
        case 'config1-3': 
            configLabel = "Configuration 3";
            break;
        case 'config2-1': 
            configLabel = "Configuration 1";
            break;
        case 'config2-2': 
            configLabel = "Configuration 2";
            break;
        default:
            throw new Error("Unknown configuration: " + configKey);
    }
    return configLabel;
}

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
            return "Aucun profile";
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

// create and display chart from money.accounts
function generateAccountsChart() {
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
                onclick: function (id) {
                    accountsChart.toggle(id);
                    pushNewHistoryState();
                }
            }
        },
        data: generateAccountsData(),
        transition: {
            duration: TRANSITION_DURATION
        },
        point: {
            show: false,
            r: 2
        }
    });
}

// create and display chart from money.dividend
function generateDividendChart() {
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
                onclick: function (id) {
                    dividendChart.toggle(id);
                    pushNewHistoryState();
                }
            }
        },
        data: generateDividendData(),
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
}

// create and display chart from money.headcount
function generateHeadcountChart() {
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
                onclick: function (id) {
                    headcountChart.toggle(id);
                    pushNewHistoryState();
                }
            }
        },
        data: generateHeadcountData(),
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
}

// create and display chart from money.monetarySupply
function generateMonetarySupplyChart() {
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
                onclick: function (id) {
                    monetarySupplyChart.toggle(id);
                    pushNewHistoryState();
                }
            }
        },
        data: generateMonetarySupplyData(),
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
}

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
function updateChartData() {

    // calculate C3 data
    money.generateData();
    var accountsData = generateAccountsData();
    var dividendData = generateDividendData();
    var headcountData = generateHeadcountData();
    var monetarySupplyData = generateMonetarySupplyData();

    updateToUnload(accountsChart, accountsData);
    
    // reload data in chart
    accountsChart.load(accountsData);
    dividendChart.load(dividendData);
    headcountChart.load(headcountData);
    monetarySupplyChart.load(monetarySupplyData);
    
    setChartTimeBounds();
}

function updateToUnload(chart, newData) {
    var oldData = chart.data();
    var newDataKeys = Object.keys(newData.xs);
    // on cherche les oldData[i].id qui ne sont pas présents dans Object.keys(newData.xs)
    var toUnload = newData.unload;
    if (!toUnload) {
        toUnload = [];
    }
    for (var i = 0; i < oldData.length; i++) {
        if (newDataKeys.indexOf(oldData[i].id) < 0) {
            toUnload.push(oldData[i].id);
        }
    }
    newData.unload = toUnload;
}

function getHiddenDataKeys(chart) {
    var data = chart.data();
    var shownDataKeys = chart.data.shown().map(function(d) { return d.id; });
    var hiddenDataKeys = [];
    for (var i = 0; i < data.length; i++) {
        if (shownDataKeys.indexOf(data[i].id) < 0) {
            hiddenDataKeys.push(data[i].id);
        }
    }
    
    return hiddenDataKeys;
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
        updateChartData();
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
    money.addAccount();
    
    updateChartData();
    joinAccountSelectorToData();
    document.getElementById("AccountSelector").selectedIndex = money.accounts.length - 1;
    updateAddedMemberArea();
}

function accountName(account) {
    if (account.udProducer) {
        return "Compte ${p0} (Co-créateur)".format(account.id);
    }
    else {
        return "Compte ${p0} (Non-créateur)".format(account.id);
    }
}

function fullAccountName(account) {
    if (account.udProducer) {
        return "Compte ${p0} (Co-créateur, ${p1})".format(account.id, account.StartingPercentage);
    }
    else {
        return "Compte ${p0} (Non-créateur, ${p1})".format(account.id, account.StartingPercentage);
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
        throw new Error("Time unit not managed: " + timeUnit);
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

function setChartTimeBounds() {
    var lowerBoundDate = asDate(money.getTimeLowerBound(money.YEAR), money.YEAR);
    var upperBoundDate = asDate(money.getTimeUpperBound(money.YEAR), money.YEAR);
    accountsChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
}

function accountYLabel() {
    return 'Montant (en ' + getRefUnitLabel(money.referenceFrameKey) + ')'
}

function timeLabel() {
    if (money.growthTimeUnit == money.MONTH) {
        return 'Temps (émission mensuelle)';
    }
    else {
        return 'Temps (émission annuelle)';
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

function openTab(tabId) {
    d3.selectAll(".tablinks").classed("active", false);
    d3.select("#" + tabId).classed("active", true);
    
    d3.selectAll(".tabcontent").style("display", "none");
    var tabContentId = d3.select("#" + tabId).attr("tabContentId");
    d3.select("#" + tabContentId).style("display", "block");

    curTabId = tabId;
}

function comment(id) {
    d3.selectAll(".Comment").style("display", "none");
    d3.select("#" + id + "Comment").style("display", "block");

    commentedId = id;
    
    return false;
}

function pushNewHistoryState() {
    var encodedURI = asEncodedURI();
    window.history.pushState(encodedURI, '', '?' + encodedURI);
}

// Callbacks
// *********

function changeConfiguration1() {
    curConfigId = this.options[this.selectedIndex].value;
    if (curConfigId != 'none') {
        var jsonRep = configs1[curConfigId];
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment("IntroItem");
    }
    pushNewHistoryState();
}

function changeConfiguration2() {
    curConfigId = this.options[this.selectedIndex].value;
    if (curConfigId != 'none') {
        var jsonRep = configs2[curConfigId];
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment("IntroItem");
    }
    pushNewHistoryState();
}

function changeAccountSelection() {
    updateAddedMemberArea();
    pushNewHistoryState();
}

function clickAddAccount() {
    addAccount();
    pushNewHistoryState();
}

function clickDeleteAccount() {
    deleteAccount();
    pushNewHistoryState();
}

function changeReferenceFrame() {
    money.referenceFrameKey = this.options[this.selectedIndex].value;
    d3.select('#LogScale').property("checked", money.referenceFrames[money.referenceFrameKey].logScale);
        
    updateAccountYLabels();
    
    updateChartData();
    comment(money.referenceFrameKey);
    pushNewHistoryState();
}

function updateAccountYLabels() {
    accountsChart.axis.labels({
        y: accountYLabel()
    });
    dividendChart.axis.labels({
        y: accountYLabel()
    });
    monetarySupplyChart.axis.labels({
        y: accountYLabel()
    });
}

function changeUdFormula() {
    money.udFormulaKey = this.options[this.selectedIndex].value;
    updateChartData();
    comment(money.udFormulaKey);
    pushNewHistoryState();
}

function changeDemographicProfile() {
    money.demographicProfileKey = this.options[this.selectedIndex].value;
    enableDemographyFields();
    updateChartData();
    comment(money.demographicProfileKey);
    pushNewHistoryState();
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
    pushNewHistoryState();
}

function changeLifeExpectancy() {
    money.lifeExpectancy = parseInt(this.value);
    updateChartData();
    updateCalculateGrowth();
    pushNewHistoryState();
}

function changeAnnualGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH)).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeMonthlyGrowth() {
	money.growth = parseFloat(this.value) / 100;
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeCalculateGrowth() {
    money.calculateGrowth = this.checked;
    
    enableGrowthForms(money.calculateGrowth);
    updateChartData();
    updateCalculateGrowth();
    comment(this.id);
    pushNewHistoryState();
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
    pushNewHistoryState();
}

function changeMonthlyDividendStart() {
    money.dividendStart = parseFloat(this.value);
    updateChartData();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR)).toFixed(2));
    pushNewHistoryState();
}

function changeLogScale() {
    money.referenceFrames[money.referenceFrameKey].logScale = !money.referenceFrames[money.referenceFrameKey].logScale
    
    updateAccountYLabels();
    
    updateChartData();
    comment(this.id);
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
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
    pushNewHistoryState();
}

function changeProduceUd() {
    var selectedAccountIndex = getSelectedAccountIndex();
    money.setUdProducer(selectedAccountIndex, this.checked);
    
    joinAccountSelectorToData();
    updateChartData();
    
    comment(this.id);
    pushNewHistoryState();
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
    pushNewHistoryState();
}

function clickTab() {
    openTab(this.id);
    comment(this.id);
    pushNewHistoryState();
    
    return false;
}
