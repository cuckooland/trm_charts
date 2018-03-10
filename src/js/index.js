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

var NONBREAKING_SPACE = String.fromCharCode(0xA0);

var DATE_PATTERN = "%d-%m-%Y";

var LOG_UNIT_SUFFIX = " [log]";

var AVERAGE_ID = "average";

var ACCOUNT_ID_PREFIX = "account";

var STABLE_AVERAGE_ID = "stableAverage";

var DIVIDEND_ID = "dividend";

var STABLE_DIVIDEND_ID = "stableDividend";

var HEADCOUNT_ID = "headcount";

var MONETARY_SUPPLY_ID = "monetarySupply";

var STABLE_MONETARY_SUPPLY_ID = "stableMonetarySupply";

var ACCOUNT_COLORS = d3.range(20).map(d3.scale.category20b());

var AVERAGE_COLOR = '#e6550d';

var STABLE_AVERAGE_COLOR = '#fdae6b';

var ACCOUNT_CHART_COLORS = ACCOUNT_COLORS.slice();
ACCOUNT_CHART_COLORS.unshift(AVERAGE_COLOR, STABLE_AVERAGE_COLOR);

var DIVIDEND_COLOR = '#31a354';

var STABLE_DIVIDEND_COLOR = '#bd9e39';

var HEADCOUNT_COLOR = '#17becf';

var MONETARY_SUPPLY_COLOR = '#9467bd';

var STABLE_MONETARY_SUPPLY_COLOR = '#ff9896';

var AVERAGE_LABEL = 'Moyenne "M/N"';

var STABLE_AVERAGE_LABEL = 'M/N' + NONBREAKING_SPACE + 'stable';

var DIVIDEND_LABEL = 'Dividende Universel';

var STABLE_DIVIDEND_LABEL = 'DU stable';

var HEADCOUNT_LABEL = 'Nombre d\'individus "N"';

var MONETARY_SUPPLY_LABEL = 'Masse Monétaire "M"';

var STABLE_MONETARY_SUPPLY_LABEL = 'Masse stable';

var ACCOUNT_LABEL_PREFIX = 'Compte';

var CO_CREATOR_LABEL = 'Co-créateur';

var NON_CREATOR_LABEL = 'Non-créateur';

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
var curSelectedDataId = "";
var selectedPointIndex = -1;
var commentedId = "";

window.addEventListener('popstate', function(e) {
    var encodedURI = e.state;

    if (encodedURI !== null) {
        applyEncodedURI(encodedURI);
    }
});

initSelectors();

addTabEffectsFromHtml();

generateC3Charts();
addChartEffectsFromHtml();

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

function addTabEffectsFromHtml() {
    var growthTabAttributes = {
        tabId: 'GrowingRateItem',
        referingClass: 'growth'
    };
    var udTabAttributes = {
        tabId: 'UdItem',
        referingClass: 'dividendTabLink'
    };
    var referenceTabAttributes = {
        tabId: 'ReferenceItem',
        referingClass: 'referenceTabLink'
    };
    var boundsTabAttributes = {
        tabId: 'BoundsItem',
        referingClass: 'boundsTabLink'
    };
    var accountsTabAttributes = {
        tabId: 'AccountsItem',
        referingClass: 'accountsTabLink'
    };
    var demogarphyTabAttributes = {
        tabId: 'DemographyItem',
        referingClass: 'demographyTabLink'
    };
    var tabAttributesList = [growthTabAttributes, udTabAttributes, referenceTabAttributes, boundsTabAttributes, accountsTabAttributes, demogarphyTabAttributes];
    
    tabAttributesList.forEach(function(tabAttributes) {
        d3.selectAll('span.' + tabAttributes.referingClass)
            .style('background-color', '#f1f1f1')
            .on('mouseover', function () {
                d3.selectAll('span.' + tabAttributes.referingClass).style('background-color', '#dddddd');
                d3.select('#' + tabAttributes.tabId).classed('focused', true);
            })
            .on('mouseout', function () {
                d3.selectAll('span.' + tabAttributes.referingClass).style('background-color', '#f1f1f1');
                d3.select('#' + tabAttributes.tabId).classed('focused', false);
            })
            .on('click', function() {
                d3.select('#' + tabAttributes.tabId).classed('focused', false);
                clickTab(tabAttributes.tabId);
            });
    });
    
}

function addChartEffectsFromHtml() {

    var accountSerieAttributes = {
        class: ACCOUNT_ID_PREFIX,
        color: ACCOUNT_COLORS,
        chart: accountsChart
    };
    var averageSerieAttributes = {
        class: AVERAGE_ID,
        color: AVERAGE_COLOR,
        chart: accountsChart
    };
    var stableAverageSerieAttributes = {
        class: STABLE_AVERAGE_ID,
        color: STABLE_AVERAGE_COLOR,
        chart: accountsChart
    };
    var dividendSerieAttributes = {
        class: DIVIDEND_ID,
        color: DIVIDEND_COLOR,
        chart: dividendChart
    };
    var stableDividendSerieAttributes = {
        class: STABLE_DIVIDEND_ID,
        color: STABLE_DIVIDEND_COLOR,
        chart: dividendChart
    };
    var headcountSerieAttributes = {
        class: HEADCOUNT_ID,
        color: HEADCOUNT_COLOR,
        chart: headcountChart
    };
    var monetarySupplySerieAttributes = {
        class: MONETARY_SUPPLY_ID,
        color: MONETARY_SUPPLY_COLOR,
        chart: monetarySupplyChart
    };
    var stableMonetarySupplySerieAttributes = {
        class: STABLE_MONETARY_SUPPLY_ID,
        color: STABLE_MONETARY_SUPPLY_COLOR,
        chart: monetarySupplyChart
    };
    var serieAttributesList = [accountSerieAttributes, averageSerieAttributes, stableAverageSerieAttributes, dividendSerieAttributes, stableDividendSerieAttributes, headcountSerieAttributes, monetarySupplySerieAttributes, stableMonetarySupplySerieAttributes];

    function isLinkedValue(serieSpan) {
        return (serieSpan.classed('current') && !serieSpan.classed('nolink'))
            || serieSpan.classed('previous')
            || serieSpan.classed('previous2');
    }
        
    function getIndexToSelect(serieSpan, targetedSerieId) {
        var indexToSelect = selectedPointIndex;

        // Depending on the targeted serie, an offset must be applied (especially for 'account' series)
        if (targetedSerieId != curSelectedDataId) {
            var curSelectedData = searchChartWithData(curSelectedDataId).data(curSelectedDataId)[0];
            var targetedData = searchChartWithData(targetedSerieId).data(targetedSerieId)[0];
            for (j = 0; j < targetedData.values.length; j++) {
                if (targetedData.values[j].x.getTime() == curSelectedData.values[selectedPointIndex].x.getTime()) {
                    indexToSelect = j;
                    break;
                }
            }
        }

        if (serieSpan.classed('current')) {
            return indexToSelect;
        }
        else if (serieSpan.classed('previous')) {
            return indexToSelect - 1;
        }
        else if (serieSpan.classed('previous2')) {
            return indexToSelect - 2;
        }
        return -1;
    }
        
    function getSerieAttributes(serieSpan) {
        for (var i = 0; i < serieAttributesList.length; i++) {
            if (serieSpan.classed(serieAttributesList[i].class)) {
                return serieAttributesList[i];
            }
        }
        throw new Error("Serie class not found: " + serieSpan);
    }

    function getReferenceFrameKey(serieSpan) {
        var toSelectIndex = selectedPointIndex;
        if (serieSpan.classed('mu')) {
            return money.MONETARY_UNIT_REF_KEY;
        }
        else if (serieSpan.classed('ud')) {
            return money.DIVIDEND_REF_KEY;
        }
        else if (serieSpan.classed('mn')) {
            return money.AVERAGE_REF_KEY;
        }
        return;
    }
        
    function clickValue(serieSpan) {
        var referenceFrameKey = getReferenceFrameKey(serieSpan);
        var clickedSerieAttributes = getSerieAttributes(serieSpan);
        var clickedSerieId = getTargetedSerieId(clickedSerieAttributes);
        var toSelectIndex = getIndexToSelect(serieSpan, clickedSerieId);
        
        if (money.referenceFrames[money.referenceFrameKey].logScale) {
            d3.select('#LogScale').property("checked", false);
        }
        if (referenceFrameKey && money.referenceFrameKey != referenceFrameKey) {
            money.referenceFrameKey = referenceFrameKey;
            setReferenceFrameSelection(money);
        }
        updateAccountYLabels();
        updateChartData();

        if (curSelectedDataId != clickedSerieId || selectedPointIndex != toSelectIndex) {
            searchChartWithData(curSelectedDataId).unselect([curSelectedDataId], [selectedPointIndex]);
        }
        clickedSerieAttributes.chart.select([clickedSerieId], [toSelectIndex]);
        commentChartData(clickedSerieAttributes.chart, clickedSerieId);
        pushNewHistoryState();
    }

    function getTargetedSerieId(serieAttributes) {
        var serieClass = serieAttributes.class;
        if (serieClass == ACCOUNT_ID_PREFIX && curSelectedDataId.startsWith(ACCOUNT_ID_PREFIX)) {
            // For now, if an account serie is targeted, it necessarly corresponds to the current selected serie
            return curSelectedDataId;
        }
        return serieClass;
    }

    function getSerieColor(serieAttributes) {
        var serieColor = serieAttributes.color;
        if (serieAttributes.class == ACCOUNT_ID_PREFIX && curSelectedDataId.startsWith(ACCOUNT_ID_PREFIX)) {
            // For now, if an account serie is targeted, it necessarly corresponds to the current selected serie
            var accountId = extractAccountId(curSelectedDataId);
            return ACCOUNT_COLORS[accountId];
        }
        return serieColor;
    }

    function mouseoverSerieSpan(serieSpan, serieAttributes) {
        var targetedSerieId = getTargetedSerieId(serieAttributes);
        // Highlight specified targets and fade out the others.
        serieAttributes.chart.focus(targetedSerieId);

        // Highlight background of the span.
        serieSpan.style('background-color', '#c9c9c9');

        if (isLinkedValue(serieSpan)) {
            var toSelectIndex = getIndexToSelect(serieSpan, targetedSerieId);
            if (toSelectIndex >= 0) {
                serieAttributes.chart.select([targetedSerieId], [toSelectIndex]);
            }
        }
    }

    function mouseoutSerieSpan(serieSpan, serieAttributes) {
        // Revert highlighted and faded out targets
        serieAttributes.chart.revert();

        // Restore common background of the span.
        serieSpan.style('background-color', '#dedede');

        if (isLinkedValue(serieSpan)) {
            var targetedSerieId = getTargetedSerieId(serieAttributes);
            var toSelectIndex = getIndexToSelect(serieSpan,targetedSerieId);
            if (curSelectedDataId != targetedSerieId || selectedPointIndex != toSelectIndex) {
                serieAttributes.chart.unselect([targetedSerieId], [toSelectIndex]);
            }
            else {
                // Select current selected point (probably useless)
                serieAttributes.chart.select([targetedSerieId], [toSelectIndex]);
            }
        }
    }

    serieAttributesList.forEach(function(serieAttributes) {
        d3.selectAll('span.' + serieAttributes.class)
            .style('color', getSerieColor(serieAttributes))
            .on('mouseover', function () {
                mouseoverSerieSpan(d3.select(this), serieAttributes);
            })
            .on('mouseout', function () {
                mouseoutSerieSpan(d3.select(this), serieAttributes);
            });
    });
        
    d3.selectAll('span.current:not(.nolink), span.previous, span.previous2').on('click', function() {
        clickValue(d3.select(this));
    });
}

function initCallbacks() {
    d3.select("#ConfigSelector1").on("change", function() { changeConfiguration(this, configs1); });
    d3.select("#ConfigSelector2").on("change", function() { changeConfiguration(this, configs2); });
    d3.select("#ConfigSelector3").on("change", function() { changeConfiguration(this, configs3); });
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

    d3.selectAll(".tablinks").on("click", function() { clickTab(this.id); });

    d3.selectAll("input[type=\"text\"]").on("click", function() { comment(this.id); });
}

function asEncodedURI() {
    var moneyAsJSon = money.asJSonRep();
    var guiAsJSon = {
        t : curTabId,
        c : curConfigId,
        ac : {
            hs : getHiddenDataKeys(accountsChart)
        },
        dc : {
            hs : getHiddenDataKeys(dividendChart)
        },
        hc : {
            hs : getHiddenDataKeys(headcountChart)
        },
        sc : {
            hs : getHiddenDataKeys(monetarySupplyChart)
        },
        a : document.getElementById("AccountSelector").selectedIndex,
        s : curSelectedDataId,
        i : selectedPointIndex,
        com : commentedId
    };
    var jsonRep = {
        m : moneyAsJSon,
        g : guiAsJSon
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
    money.applyJSonRep(jsonRep.m);
    
    fillForms();
    enableForms();
    joinAccountSelectorToData();
    document.getElementById("AccountSelector").selectedIndex = jsonRep.g.a;
    
    curConfigId = jsonRep.g.c;
    setConfigSelection();
    
    setReferenceFrameSelection(money);
    setUdFormulaSelection(money);
    setDemographySelection(money);
    
    updateAddedAccountArea();
    updateAccountYLabels();
    updateChartData();
    openTab(jsonRep.g.t);
    unselectChartPoints();
    if (jsonRep.g.s) {
        var chart = searchChartWithData(jsonRep.g.s);
        chart.select([jsonRep.g.s], [jsonRep.g.i]);
        commentChartData(chart, jsonRep.g.s);
    }
    else {
        comment(jsonRep.g.com);
    }
    
    setHiddenSeries(accountsChart, jsonRep.g.ac.hs);
    setHiddenSeries(dividendChart, jsonRep.g.dc.hs);
    setHiddenSeries(headcountChart, jsonRep.g.hc.hs);
    setHiddenSeries(monetarySupplyChart, jsonRep.g.sc.hs);
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
    feedConfigSelector('ConfigSelector1', configs1);
    feedConfigSelector('ConfigSelector2', configs2);
    feedConfigSelector('ConfigSelector3', configs3);
    feedReferenceFrameSelector(money);
    feedUdFormulaSelector(money);
    feedDemographySelector(money);
}

// Create configuration selector
function feedConfigSelector(configSelectorId, configs) {
    d3.select('#' + configSelectorId).selectAll("option")
        .data(Object.keys(configs))
      .enter().append("option")
        .text(function(d) { return getConfigLabel(d); })
        .attr('value', function(d) { return d; });
}

function setConfigSelection() {
    var selectedIndex = Object.keys(configs1).indexOf(curConfigId);
    if (selectedIndex != -1) {
        document.getElementById("ConfigSelector1").selectedIndex = selectedIndex;
        document.getElementById("ConfigSelector2").selectedIndex = 0;
        document.getElementById("ConfigSelector3").selectedIndex = 0;
        return;
    }
    var selectedIndex = Object.keys(configs2).indexOf(curConfigId);
    if (selectedIndex != -1) {
        document.getElementById("ConfigSelector2").selectedIndex = selectedIndex;
        document.getElementById("ConfigSelector1").selectedIndex = 0;
        document.getElementById("ConfigSelector3").selectedIndex = 0;
        return;
    }
    var selectedIndex = Object.keys(configs3).indexOf(curConfigId);
    if (selectedIndex != -1) {
        document.getElementById("ConfigSelector3").selectedIndex = selectedIndex;
        document.getElementById("ConfigSelector1").selectedIndex = 0;
        document.getElementById("ConfigSelector2").selectedIndex = 0;
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
            
    options.text(function(d) { return accountName2(d); });
    
    options.enter().append("option")
        .text(function(d) { return accountName2(d); })
        .attr('value', function(d) { return d.id; })
        
    options.exit().remove();
};

function generateAccountsData() {
	var accountsData = {
        xFormat: DATE_PATTERN,
        xs: {
            'average': 'x_' + AVERAGE_ID,
            'stableAverage': 'x_' + STABLE_AVERAGE_ID
        },
        names: {
            'average': AVERAGE_LABEL,
            'stableAverage': STABLE_AVERAGE_LABEL
        },
        columns: [],
        types: {
            average: 'area'
        },
        onclick: function(d, element) {
            commentChartData(accountsChart, d.id);
            pushNewHistoryState();
        },
        selection: {
            enabled: true,
            multiple: false
        }        
    };
    
    var iAccount, i;
    // For each account...
	for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
		// add axis mapping
		var c3Id = getC3AccountId(money.accounts[iAccount].id);
		accountsData.xs[c3Id] = 'x_' + c3Id;
        accountsData.names[c3Id] = accountName3(money.accounts[iAccount]);
	}
	
    // add data to columns and add axis header 
	var xAverage = ['x_' + AVERAGE_ID];
	for (i = 0; i < money.averages.x.length; i++) {
	    xAverage.push(asDate(money.averages.x[i]));
	}
    accountsData.columns.push(xAverage);
    accountsData.columns.push(money.averages.y);
    accountsData.columns[accountsData.columns.length - 1].unshift(AVERAGE_ID);

	var xStableAverages = ['x_' + STABLE_AVERAGE_ID];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xStableAverages.push(asDate(money.dividends.x[i]));
	}
    accountsData.columns.push(xStableAverages);
    accountsData.columns.push(money.stableAverages.y);
    accountsData.columns[accountsData.columns.length - 1].unshift(STABLE_AVERAGE_ID);

    // Depending on X axis bounds, some accounts are not visible => use 'unload' flag
    var toUnload = [];
    // for each account...
    for (iAccount = 0; iAccount < money.accounts.length; iAccount++) {
  		var c3Id = getC3AccountId(money.accounts[iAccount].id);
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
        var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
        charts.forEach(function(c) {
            if (c != chart) {
                showTooltip(c, d);
            }
        });
        tooltipingChart = null;
    }
}

function showTooltip(chart, d) {
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
	
function hideAllTooltips(chart) {
    var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    charts.forEach(function(c) {
        if (c != chart) {
            c.tooltip.hide();
        }
    });
}

function unselectChartPoints(chart) {
    curSelectedDataId = "";
    selectedPointIndex = -1;
    var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    charts.forEach(function(c) {
        if (c != chart) {
            c.unselect();
        }
    });
}

function generateDividendData() {
    var dividendData = {
        xFormat: DATE_PATTERN,
        xs: {
            'dividend' : 'x_' + DIVIDEND_ID,
            'stableDividend': 'x_' + STABLE_DIVIDEND_ID
        },
        names: {
            'dividend': "${p0} (${p1})".format(DIVIDEND_LABEL, universalDividendName()),
            'stableDividend': STABLE_DIVIDEND_LABEL
        },
        columns: [],
        types: {
            dividend: 'area'
        },
        onclick: function(d, element) {
            commentChartData(dividendChart, d.id);
            pushNewHistoryState();
        },
        selection: {
            enabled: true,
            multiple: false
        }
    };
    
    // add data to columns and add axis header 
	var xDividends = ['x_' + DIVIDEND_ID];
	for (i = 0; i < money.dividends.x.length; i++) {
	    xDividends.push(asDate(money.dividends.x[i]));
	}
    dividendData.columns.push(xDividends);
    dividendData.columns.push(money.dividends.y);
    dividendData.columns[dividendData.columns.length - 1].unshift(DIVIDEND_ID);
    
	var xStableDividends = ['x_' + STABLE_DIVIDEND_ID];
	for (i = 0; i < money.averages.x.length; i++) {
	    xStableDividends.push(asDate(money.averages.x[i]));
	}
    dividendData.columns.push(xStableDividends);
    dividendData.columns.push(money.stableDividends.y);
    dividendData.columns[dividendData.columns.length - 1].unshift(STABLE_DIVIDEND_ID);
    
    return dividendData;
}

function generateHeadcountData() {
    var headcountData = {
        xFormat: DATE_PATTERN,
        x: 'x_' + HEADCOUNT_ID,
        names: {
            'headcount': HEADCOUNT_LABEL + ' (' + getDemographicProfileLabel(money.demographicProfileKey) + ')'
        },
        columns: [],
        types: {
            headcount: 'area'
        },
        onmouseover : function(d) { 
            showAllTooltips(headcountChart, d);
        },
        onmouseout : function(d) {
            hideAllTooltips(headcountChart);
        },
        onclick: function(d, element) {
            commentChartData(headcountChart, d.id);
            pushNewHistoryState();
        },
        selection: {
            enabled: true,
            multiple: false
        }
    };
    
    // add data to columns and add axis header 
	var xHeadcount = ['x_' + HEADCOUNT_ID];
	for (i = 0; i < money.headcounts.x.length; i++) {
	    xHeadcount.push(asDate(money.headcounts.x[i]));
	}
    headcountData.columns.push(xHeadcount);
    headcountData.columns.push(money.headcounts.y);
    headcountData.columns[headcountData.columns.length - 1].unshift(HEADCOUNT_ID);
    
    return headcountData;
}
    
function generateMonetarySupplyData() {
    var monetarySupplyData = {
        xFormat: DATE_PATTERN,
        xs: {
            'monetarySupply' : 'x_' + MONETARY_SUPPLY_ID,
            'stableMonetarySupply': 'x_' + STABLE_MONETARY_SUPPLY_ID
        },
        names: {
            'monetarySupply': MONETARY_SUPPLY_LABEL,
            'stableMonetarySupply': STABLE_MONETARY_SUPPLY_LABEL
        },
        columns: [],
        types: {
            monetarySupply: 'area'
        },
        onclick: function(d, element) {
            commentChartData(monetarySupplyChart, d.id);
            pushNewHistoryState();
        },
        selection: {
            enabled: true,
            multiple: false
        }
    };

    // add data to columns and add axis header 
	var xMonetarySupply = ['x_' + MONETARY_SUPPLY_ID];
	for (i = 0; i < money.monetarySupplies.x.length; i++) {
	    xMonetarySupply.push(asDate(money.monetarySupplies.x[i]));
	}
    monetarySupplyData.columns.push(xMonetarySupply);
    monetarySupplyData.columns.push(money.monetarySupplies.y);
    monetarySupplyData.columns[monetarySupplyData.columns.length - 1].unshift(MONETARY_SUPPLY_ID);
    
	var xStableMonetarySupply = ['x_' + STABLE_MONETARY_SUPPLY_ID];
	for (i = 0; i < money.stableMonetarySupplies.x.length; i++) {
	    xStableMonetarySupply.push(asDate(money.stableMonetarySupplies.x[i]));
	}
    monetarySupplyData.columns.push(xStableMonetarySupply);
    monetarySupplyData.columns.push(money.stableMonetarySupplies.y);
    monetarySupplyData.columns[monetarySupplyData.columns.length - 1].unshift(STABLE_MONETARY_SUPPLY_ID);
    
	return monetarySupplyData;
};

function getC3AccountId(accountId) {
    return ACCOUNT_ID_PREFIX + accountId;
}

function extractAccountId(c3AccountId) {
    if (c3AccountId.substr(0, ACCOUNT_ID_PREFIX.length) === ACCOUNT_ID_PREFIX) {
        return c3AccountId.substring(ACCOUNT_ID_PREFIX.length);
    }
    throw new Error(c3AccountId + " doesn't start with the expected prefix: " + ACCOUNT_ID_PREFIX);
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
        case 'config2-3': 
            configLabel = "Configuration 3";
            break;
        case 'config3-1': 
            configLabel = "Configuration 1";
            break;
        default:
            throw new Error("Unknown configuration: " + configKey);
    }
    return configLabel;
}

function getRefLabel(referenceFrameKey, withoutLog) {
    var refLabel;
    switch(referenceFrameKey) {
        case money.MONETARY_UNIT_REF_KEY:
            refLabel = "Unité Monétaire";
            break;
        case money.DIVIDEND_REF_KEY: 
            refLabel = "Dividende";
            break;
        case money.AVERAGE_REF_KEY:
            refLabel = "% (M/N)";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (!withoutLog && money.referenceFrames[money.referenceFrameKey].logScale) {
        refLabel = refLabel + LOG_UNIT_SUFFIX;
    }
    return refLabel;
}

function getRefUnitLabel1(referenceFrameKey) {
    var refUnitLabel;
    switch(referenceFrameKey) {
        case money.MONETARY_UNIT_REF_KEY:
            refUnitLabel = 'unités';
            break;
        case money.DIVIDEND_REF_KEY: 
            refUnitLabel = "DU";
            break;
        case money.AVERAGE_REF_KEY:
            refUnitLabel = "% (M/N)";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    return refUnitLabel;
}

function getRefUnitLabel2(referenceFrameKey) {
    var refUnitLabel = getRefUnitLabel1(referenceFrameKey);
    if (referenceFrameKey == money.MONETARY_UNIT_REF_KEY) {
        refUnitLabel = 'unités monétaires';
    }
    return refUnitLabel;
}

function getRefUnitLabel3(referenceFrameKey) {
    var refUnitLabel = getRefUnitLabel2(referenceFrameKey);
    if (money.referenceFrames[money.referenceFrameKey].logScale) {
        refUnitLabel = refUnitLabel + LOG_UNIT_SUFFIX;
    }
    return refUnitLabel;
}

function getUdFormulaLabel(udFormulaKey) {
    switch(udFormulaKey) {
        case money.BASIC_UD_KEY:
            return "Basique : DU(t) = c*M(t-1)/N(t)";
        case money.UDA_KEY:
            return "DUA : DU(t) = max[DU(t-1) ; c*M(t-1)/N(t)]";
        case money.UDB_KEY: 
            return "DUB : DU(t) = (1+c)*DU(t-1)";
        case money.UDC_KEY: 
            return "DUC : DU(t) = 1/2 [c*M(t-1)/N(t) + (1+c)*DU(t-1)]";
        case money.UDG_KEY:
            return "DUĞ : DU(t) = DU(t-1) + c²*M(t-2)/N(t-1)";
        default:
            throw new Error("Dividend formula not managed: " + udFormulaKey);
    }
}

function getDemographicProfileLabel(demographicProfileKey) {
    switch(demographicProfileKey) {
        case money.NONE_PROFILE_KEY:
            return "Aucun profile";
        case money.TRIANGULAR_PROFILE_KEY:
            return "Triangulaire";
        case money.PLATEAU_PROFILE_KEY:
            return "Plateau";
        case money.CAUCHY_PROFILE_KEY: 
            return "Cauchy";
        case money.DAMPEDWAVE_PROFILE_KEY:
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
                    return amountTooltipFormat(value);
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
        color: {
            pattern: ACCOUNT_CHART_COLORS
        },
        transition: {
            duration: TRANSITION_DURATION
        },
        point: {
            show: false,
            r: 2,
            select: {
                r: 3
            }
        },
        onmouseout: function() {
            hideAllTooltips(accountsChart);
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
                    return amountTooltipFormat(value);
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
            pattern: [DIVIDEND_COLOR, STABLE_DIVIDEND_COLOR]
        },
        transition: {
            duration: TRANSITION_DURATION
        },
        point: {
            show: false,
            r: 2,
            select: {
                r: 3
            }
        },
        onmouseout: function() {
            hideAllTooltips(dividendChart);
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
            pattern: [HEADCOUNT_COLOR]
        },
        transition: {
            duration: TRANSITION_DURATION
        },
        point: {
            show: false,
            r: 2,
            select: {
                r: 3
            }
        },
        onmouseout: function() {
            hideAllTooltips(headcountChart);
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
                    return amountTooltipFormat(value);
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
            pattern: [MONETARY_SUPPLY_COLOR, STABLE_MONETARY_SUPPLY_COLOR]
        },
        transition: {
            duration: TRANSITION_DURATION
        },
        point: {
            show: false,
            r: 2,
            select: {
                r: 3
            }
        },
        onmouseout: function() {
            hideAllTooltips(monetarySupplyChart);
        }
    });
}

function tickFormat(value) {
    var f = d3.format('.2s');
    return withExp(f(value));
}

function amountTooltipFormat(value) {
    var isInfinite = money.isInfinite(value);
    if (isInfinite < 0) {
        return '-Infini';
    }
    if (isInfinite > 0) {
        return '+Infini';
    }
    var f = d3.format('.3s');
    var unit = getRefUnitLabel1(money.referenceFrameKey);
    if (money.referenceFrames[money.referenceFrameKey].logScale) {
        var noLogValue = Math.exp(value * Math.log(10));
        var f3f = d3.format('.3f');
        return "${p0} ${p1} = 1E ${p2}".format(withExp(f(noLogValue)), unit, f3f(value));
    }
    else {
        return "${p0} ${p1}".format(withExp(f(value)), unit);
    }
}

function commentFormat(value) {
    var isInfinite = money.isInfinite(value);
    if (value == Number.NEGATIVE_INFINITY) {
        return '-Infini';
    }
    if (value == Number.POSITIVE_INFINITY) {
        return '+Infini';
    }
    var f = d3.format('.3s');
    return withExp(f(value));
}

function withExp(siValue) {
    var siStr = /[yzafpnµmkMGTPEZY]/.exec(siValue)
    if (siStr != null) {
        return siValue.replace(siStr, NONBREAKING_SPACE + "E" + EXP_FORMATS[siStr]);
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

function searchChartWithData(c3DataId) {
    var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    for (var i = 0; i < charts.length; i++) {
        if (charts[i].data(c3DataId).length != 0) {
            return charts[i];
        }
    };    
    throw new Error("c3DataId not managed: " + c3DataId);
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
        updateAddedAccountArea();
    }
}

function updateAddedAccountArea() {
    var selectedAccountIndex = getSelectedAccountIndex();
    d3.select('#AccountBirth').property("value", money.getAccountBirth(getSelectedAccountIndex()));
    d3.select('#ProduceUd').property("checked", money.isUdProducer(selectedAccountIndex));
    d3.select('#StartingPercentage').property("value", money.getStartingPercentage(selectedAccountIndex));
    enableAddedAccountArea();
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
    updateAddedAccountArea();
}

function accountName1(account) {
    return "${p0} ${p1}".format(ACCOUNT_LABEL_PREFIX, account.id);
}

function accountName2(account) {
    if (account.udProducer) {
        return "${p0} (${p1})".format(accountName1(account), CO_CREATOR_LABEL);
    }
    else {
        return "${p0} (${p1})".format(accountName1(account), NON_CREATOR_LABEL);
    }
}

function accountName3(account) {
    if (account.udProducer) {
        return "${p0} (${p1}, ${p2})".format(accountName1(account), CO_CREATOR_LABEL, account.StartingPercentage);
    }
    else {
        return "${p0} (${p1}, ${p2})".format(accountName1(account), NON_CREATOR_LABEL, account.StartingPercentage);
    }
}

function accountAgeLabel(account, timeStep, timeUnit) {
    timeUnit = timeUnit || money.growthTimeUnit;
    
    var year = 0;
    var month = 0;
    if (timeUnit === money.MONTH) {
        year = Math.trunc(timeStep / 12)  - account.birth;
        month = timeStep % 12;
    }
    else if (timeUnit === money.YEAR) {
        year = timeStep - account.birth;
        month = 0;
    }
    else {
        throw new Error("Time unit not managed: " + timeUnit);
    }
    if (year == 0 && month == 0) {
        if (timeUnit === money.MONTH) {
            return "0 mois";
        }
        else if (timeUnit === money.YEAR) {
            return "0 année";
        }
    }
    if (year == 0) {
        return "${p0} mois".format(month);
    }
    if (month == 0) {
        if (year == 1) {
            return "${p0} an".format(year);
        }
        return "${p0} ans".format(year);
    }
    else if (month == 1) {
        if (year == 1) {
            return "${p0} an et ${p1} mois".format(year, month);
        }
        return "${p0} ans et ${p1} mois".format(year, month);
    }
    else {
        if (year == 1) {
            return "${p0} an et ${p1} mois".format(year, month);
        }
        return "${p0} ans et ${p1} mois".format(year, month);
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
        case money.NONE_PROFILE_KEY:
            break;
        case money.TRIANGULAR_PROFILE_KEY: 
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMinDemography").parentNode.style.display='block';
            document.getElementById("xMaxDemography").parentNode.style.display='block';
            document.getElementById("xMpvDemography").parentNode.style.display='block';
            break;
        case money.PLATEAU_PROFILE_KEY: 
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMinDemography").parentNode.style.display='block';
            document.getElementById("xMaxDemography").parentNode.style.display='block';
            document.getElementById("plateauDemography").parentNode.style.display='block';
            break;
        case money.CAUCHY_PROFILE_KEY:
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xMpvDemography").parentNode.style.display='block';
            document.getElementById("xScaleDemography").parentNode.style.display='block';
            break;
        case money.DAMPEDWAVE_PROFILE_KEY:
            document.getElementById("MaxDemography").parentNode.style.display='block';
            document.getElementById("xScaleDemography").parentNode.style.display='block';
            break;
        default:
            throw new Error("Demographic profile not managed: " + udFormulaKey);
    }
}

function enableAddedAccountArea() {
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
    return "Montant (en ${p0})".format(getRefUnitLabel3(money.referenceFrameKey));
}

function timeLabel() {
    if (money.growthTimeUnit == money.MONTH) {
        return 'Temps (émission mensuelle)';
    }
    else {
        return 'Temps (émission annuelle)';
    }
}

function universalDividendName() {
    switch(money.udFormulaKey) {
        case money.BASIC_UD_KEY:
            return "Basique";
        case money.UDA_KEY:
            return "DUA";
        case money.UDB_KEY: 
            return "DUB";
        case money.UDC_KEY: 
            return "DUC";
        case money.UDG_KEY:
            return "DUĞ";
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
    unselectChartPoints();
    return comment0(id);
}

function commentChartData(chart, c3DataId) {
    unselectChartPoints(chart);
    curSelectedDataId = c3DataId;
    
    var selectedPoint = chart.selected()[0];
    selectedPointIndex = selectedPoint.index;
    if (c3DataId.startsWith(ACCOUNT_ID_PREFIX)) {
        var accountId = extractAccountId(c3DataId);
        var account = money.searchAccount(accountId);
        var selectedTimeStep = account.x[selectedPointIndex];
        return commentSelectedPoint(ACCOUNT_ID_PREFIX, selectedTimeStep, account);
    }
    
    var selectedTimeStep;
    switch(c3DataId) {
        case AVERAGE_ID:
            selectedTimeStep = money.averages.x[selectedPointIndex];
            break;
        case STABLE_AVERAGE_ID:
            selectedTimeStep = money.stableAverages.x[selectedPointIndex];
            break;
        case DIVIDEND_ID: 
            selectedTimeStep = money.dividends.x[selectedPointIndex];
            break;
        case STABLE_DIVIDEND_ID: 
            selectedTimeStep = money.stableDividends.x[selectedPointIndex];
            break;
        case HEADCOUNT_ID: 
            selectedTimeStep = money.headcounts.x[selectedPointIndex];
            break;
        case MONETARY_SUPPLY_ID: 
            selectedTimeStep = money.monetarySupplies.x[selectedPointIndex];
            break;
        case STABLE_MONETARY_SUPPLY_ID: 
            selectedTimeStep = money.stableMonetarySupplies.x[selectedPointIndex];
            break;
        default:
            throw new Error("Unknown c3DataId: " + c3DataId);
    }
    return commentSelectedPoint(c3DataId, selectedTimeStep);
}

function getRefDisplay(referenceFrameKey) {
    var refDisplay;
    switch(referenceFrameKey) {
        case money.MONETARY_UNIT_REF_KEY:
            refDisplay = "MU";
            break;
        case money.DIVIDEND_REF_KEY: 
            refDisplay = "UD";
            break;
        case money.AVERAGE_REF_KEY:
            refDisplay = "MN";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (money.referenceFrames[money.referenceFrameKey].logScale) {
        refDisplay = refDisplay + "-log";
    }
    return refDisplay;
}

function commentSelectedPoint(c3DataId, timeStep, account) {
    var f = d3.format('.3d');
    
    // Process some elements which are common to several series
    
    var growthValue = money.getGrowth();

    d3.selectAll("span.dateValue").text(asDate(timeStep));
    d3.selectAll("span.growth.value").text(commentFormat(growthValue * 100) + NONBREAKING_SPACE + '%');
    
    var dividendMuValue = money.dividends.values[timeStep];
    d3.selectAll("span.dividend.current.mu.value").text(commentFormat(dividendMuValue));
    
    var headcountValue = money.headcounts.values[timeStep];
    d3.selectAll("span.headcount.current.value").text(f(headcountValue));
    
    // var averageMuValue = money.monetarySupplies.values[timeStep] / money.headcounts.values[timeStep];
    var averageMuValue = money.getAverage(timeStep);
    d3.selectAll("span.average.current.mu.value").text(commentFormat(averageMuValue));
    
    var muUnitLabel = getRefUnitLabel2(money.MONETARY_UNIT_REF_KEY);
    d3.selectAll("span.muUnit").text(muUnitLabel);
    d3.selectAll("span.muLogUnit").text(muUnitLabel + LOG_UNIT_SUFFIX);
    
    var duUnitLabel = getRefUnitLabel2(money.DIVIDEND_REF_KEY);
    d3.selectAll("span.duUnit").text(duUnitLabel);
    d3.selectAll("span.duLogUnit").text(duUnitLabel + LOG_UNIT_SUFFIX);
    
    var mnUnitLabel = getRefUnitLabel2(money.AVERAGE_REF_KEY);
    d3.selectAll("span.mnUnit").text(mnUnitLabel);
    d3.selectAll("span.mnLogUnit").text(mnUnitLabel + LOG_UNIT_SUFFIX);

    // Process elements which are more specific to each serie
    
    switch(c3DataId) {
        case AVERAGE_ID:
            var averageMuLogValue = Math.log(averageMuValue) / Math.log(10);
            var averageUdValue = averageMuValue / dividendMuValue;
            var averageUdLogValue = Math.log(averageUdValue) / Math.log(10);
            var averageMnValue = 100 * averageMuValue / averageMuValue;
            var averageMnLogValue = Math.log(averageMnValue) / Math.log(10);
            var monetarySupplyMuValue = money.monetarySupplies.values[timeStep];
            d3.selectAll("span.average.label").text(AVERAGE_LABEL);
            d3.selectAll("span.average.mu.logValue").text(commentFormat(averageMuLogValue));
            d3.selectAll("span.average.ud.value").text(commentFormat(averageUdValue));
            d3.selectAll("span.average.ud.logValue").text(commentFormat(averageUdLogValue));
            d3.selectAll("span.average.mn.value").text(commentFormat(averageMnValue));
            d3.selectAll("span.average.mn.logValue").text(commentFormat(averageMnLogValue));
            d3.selectAll("span.monetarySupply.current.mu.value").text(commentFormat(monetarySupplyMuValue));
            break;
            
        case STABLE_AVERAGE_ID:
            var stableAverageMuValue = (1 + growthValue) * dividendMuValue / growthValue;
            var stableAverageMuLogValue = Math.log(stableAverageMuValue) / Math.log(10);
            var stableAverageUdValue = stableAverageMuValue / dividendMuValue;
            var stableAverageUdLogValue = Math.log(stableAverageUdValue) / Math.log(10);
            var stableAverageMnValue = 100 * stableAverageMuValue / averageMuValue;
            var stableAverageMnLogValue = Math.log(stableAverageMnValue) / Math.log(10);
            d3.selectAll("span.stableAverage.label").text(STABLE_AVERAGE_LABEL);
            d3.selectAll("span.stableAverage.current.mu.value").text(commentFormat(stableAverageMuValue));
            d3.selectAll("span.stableAverage.mu.logValue").text(commentFormat(stableAverageMuLogValue));
            d3.selectAll("span.stableAverage.ud.value").text(commentFormat(stableAverageUdValue));
            d3.selectAll("span.stableAverage.ud.logValue").text(commentFormat(stableAverageUdLogValue));
            d3.selectAll("span.stableAverage.mn.value").text(commentFormat(stableAverageMnValue));
            d3.selectAll("span.stableAverage.mn.logValue").text(commentFormat(stableAverageMnLogValue));
            break;

        case DIVIDEND_ID: 
            var dividendMuLogValue = Math.log(dividendMuValue) / Math.log(10);
            var dividendUdValue = dividendMuValue / dividendMuValue;
            var dividendUdLogValue = Math.log(dividendUdValue) / Math.log(10);
            var dividendMnValue = 100 * dividendMuValue / averageMuValue;
            var dividendMnLogValue = Math.log(dividendMnValue) / Math.log(10);
            var previousDividendMuValue = money.dividends.values[timeStep - 1];
            var monetarySupplyMuValue = money.monetarySupplies.values[timeStep];
            var previousMonetarySupplyMuValue = money.monetarySupplies.values[timeStep - 1];
            var previous2MonetarySupplyMuValue = money.monetarySupplies.values[timeStep - 2];
            var previousHeadcountValue = money.headcounts.values[timeStep - 1];
            d3.selectAll("span.dividend.label").text(DIVIDEND_LABEL);
            d3.selectAll("span.dividend.formulaName").text(universalDividendName());
            d3.selectAll("span.dividend.previous.mu.value").text(commentFormat(previousDividendMuValue));
            d3.selectAll("span.dividend.basicMuValue").text(commentFormat(growthValue * previousMonetarySupplyMuValue / headcountValue));
            d3.selectAll("span.dividend.mu.logValue").text(commentFormat(dividendMuLogValue));
            d3.selectAll("span.dividend.ud.value").text(commentFormat(dividendUdValue));
            d3.selectAll("span.dividend.ud.logValue").text(commentFormat(dividendUdLogValue));
            d3.selectAll("span.dividend.mn.value").text(commentFormat(dividendMnValue));
            d3.selectAll("span.dividend.mn.logValue").text(commentFormat(dividendMnLogValue));
            d3.selectAll("span.udbMuValue").text(commentFormat((1 + growthValue) * previousDividendMuValue));
            d3.selectAll("span.headcount.previous.value").text(f(previousHeadcountValue));
            d3.selectAll("span.monetarySupply.current.mu.value").text(commentFormat(monetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.previous.mu.value").text(commentFormat(previousMonetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.previous2.mu.value").text(commentFormat(previous2MonetarySupplyMuValue));
            commentAccordingToUD(timeStep);
            break;
    
        case STABLE_DIVIDEND_ID: 
            var stableDividendMuValue = growthValue * averageMuValue / (1 + growthValue);
            var stableDividendMuLogValue = Math.log(stableDividendMuValue) / Math.log(10);
            var stableDividendUdValue = stableDividendMuValue / dividendMuValue;
            var stableDividendUdLogValue = Math.log(stableDividendUdValue) / Math.log(10);
            var stableDividendMnValue = 100 * stableDividendMuValue / averageMuValue;
            var stableDividendMnLogValue = Math.log(stableDividendMnValue) / Math.log(10);
            d3.selectAll("span.stableDividend.label").text(STABLE_DIVIDEND_LABEL);
            d3.selectAll("span.stableDividend.current.mu.value").text(commentFormat(stableDividendMuValue));
            d3.selectAll("span.stableDividend.mu.logValue").text(commentFormat(stableDividendMuLogValue));
            d3.selectAll("span.stableDividend.ud.value").text(commentFormat(stableDividendUdValue));
            d3.selectAll("span.stableDividend.ud.logValue").text(commentFormat(stableDividendUdLogValue));
            d3.selectAll("span.stableDividend.mn.value").text(commentFormat(stableDividendMnValue));
            d3.selectAll("span.stableDividend.mn.logValue").text(commentFormat(stableDividendMnLogValue));
            break;
    
        case HEADCOUNT_ID: 
            var demographyValue = money.demographicProfiles[money.demographicProfileKey].calculate(money, money.getTimeValue(timeStep, money.YEAR));
            d3.selectAll("span.headcount.label").text(HEADCOUNT_LABEL);
            d3.selectAll("span.demographyLabel").text(getDemographicProfileLabel(money.demographicProfileKey));
            d3.selectAll("span.accountsNumberValue").text(headcountValue - demographyValue);
            d3.selectAll("span.demographyValue").text(demographyValue);
            break;

        case MONETARY_SUPPLY_ID: 
            var monetarySupplyMuValue = money.monetarySupplies.values[timeStep];
            var monetarySupplyMuLogValue = Math.log(monetarySupplyMuValue) / Math.log(10);
            var monetarySupplyUdValue = monetarySupplyMuValue / dividendMuValue;
            var monetarySupplyUdLogValue = Math.log(monetarySupplyUdValue) / Math.log(10);
            var monetarySupplyMnValue = 100 * monetarySupplyMuValue / averageMuValue;
            var monetarySupplyMnLogValue = Math.log(monetarySupplyMnValue) / Math.log(10);
            var previousMonetarySupplyMuValue = money.monetarySupplies.values[timeStep - 1];
            d3.selectAll("span.monetarySupply.label").text(MONETARY_SUPPLY_LABEL);
            d3.selectAll("span.monetarySupply.previous.mu.value").text(commentFormat(previousMonetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.current.mu.value").text(commentFormat(monetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.mu.logValue").text(commentFormat(monetarySupplyMuLogValue));
            d3.selectAll("span.monetarySupply.ud.value").text(commentFormat(monetarySupplyUdValue));
            d3.selectAll("span.monetarySupply.ud.logValue").text(commentFormat(monetarySupplyUdLogValue));
            d3.selectAll("span.monetarySupply.mn.value").text(commentFormat(monetarySupplyMnValue));
            d3.selectAll("span.monetarySupply.mn.logValue").text(commentFormat(monetarySupplyMnLogValue));
            var birthAmountsValue = monetarySupplyMuValue - previousMonetarySupplyMuValue - dividendMuValue * headcountValue;
            if (birthAmountsValue < 0.01) {
                birthAmountsValue = 0;
            }
            d3.selectAll("span.birthAmounts.value").text(commentFormat(birthAmountsValue));
            break;
        
        case STABLE_MONETARY_SUPPLY_ID: 
            var stableMonetarySupplyMuValue = headcountValue * (1 + growthValue) * dividendMuValue / growthValue;
            var stableMonetarySupplyMuLogValue = Math.log(stableMonetarySupplyMuValue) / Math.log(10);
            var stableMonetarySupplyUdValue = stableMonetarySupplyMuValue / dividendMuValue;
            var stableMonetarySupplyUdLogValue = Math.log(stableMonetarySupplyUdValue) / Math.log(10);
            var stableMonetarySupplyMnValue = 100 * stableMonetarySupplyMuValue / averageMuValue;
            var stableMonetarySupplyMnLogValue = Math.log(stableMonetarySupplyMnValue) / Math.log(10);
            d3.selectAll("span.stableMonetarySupply.label").text(STABLE_MONETARY_SUPPLY_LABEL);
            d3.selectAll("span.stableMonetarySupply.current.mu.value").text(commentFormat(stableMonetarySupplyMuValue));
            d3.selectAll("span.stableMonetarySupply.mu.logValue").text(commentFormat(stableMonetarySupplyMuLogValue));
            d3.selectAll("span.stableMonetarySupply.ud.value").text(commentFormat(stableMonetarySupplyUdValue));
            d3.selectAll("span.stableMonetarySupply.ud.logValue").text(commentFormat(stableMonetarySupplyUdLogValue));
            d3.selectAll("span.stableMonetarySupply.mn.value").text(commentFormat(stableMonetarySupplyMnValue));
            d3.selectAll("span.stableMonetarySupply.mn.logValue").text(commentFormat(stableMonetarySupplyMnLogValue));
            break;
    
        default:
            if (c3DataId.startsWith(ACCOUNT_ID_PREFIX)) {
                var accountSpan = d3.selectAll('span.account');
                accountSpan.style('color', ACCOUNT_COLORS[account.id - 1]);
                var accountMuValue = account.values[timeStep];
                var accountMuLogValue = Math.log(accountMuValue) / Math.log(10);
                var accountUdValue = accountMuValue / dividendMuValue;
                var accountUdLogValue = Math.log(accountUdValue) / Math.log(10);
                var accountMnValue = 100 * accountMuValue / averageMuValue;
                var accountMnLogValue = Math.log(accountMnValue) / Math.log(10);
                d3.selectAll("span.account.name").text(accountName1(account));
                d3.selectAll("span.account.age").text(accountAgeLabel(account, timeStep));
                d3.selectAll("span.account.current.mu.value").text(commentFormat(accountMuValue));
                d3.selectAll("span.account.mu.logValue").text(commentFormat(accountMuLogValue));
                d3.selectAll("span.account.ud.value").text(commentFormat(accountUdValue));
                d3.selectAll("span.account.ud.logValue").text(commentFormat(accountUdLogValue));
                d3.selectAll("span.account.mn.value").text(commentFormat(accountMnValue));
                d3.selectAll("span.account.mn.logValue").text(commentFormat(accountMnLogValue));
                if (timeStep > 0) {
                    var previousMuAccountValue = account.values[timeStep - 1];
                    d3.selectAll("span.account.previous.mu.value").text(commentFormat(previousMuAccountValue));
                }
                commentAccordingToBirth(timeStep, account)
            }
            else {
                throw new Error("Unknown c3DataId: " + c3DataId);
            }
    }
    
    commentAccordingToRef();
    
    return comment0(c3DataId);
}

function commentAccordingToRef() {
    d3.selectAll("div.RefComment").style("display", "none");
    var refDisplay = getRefDisplay(money.referenceFrameKey);
    d3.selectAll("div." + refDisplay).style("display", "block");
}

function commentAccordingToUD(timeStep) {
    d3.selectAll("div.DuComment").style("display", "none");
    var moneyBirthStep = money.getTimeStep(money.moneyBirth, money.YEAR);
    if (timeStep == moneyBirthStep) {
        d3.selectAll("div.UD0").style("display", "block");
    }
    else {
        d3.selectAll("div." + money.udFormulaKey).style("display", "block");
    }
}

function commentAccordingToBirth(timeStep, account) {
    d3.selectAll("div.AmountComment").style("display", "none");
    var moneyBirthStep = money.getTimeStep(money.moneyBirth, money.YEAR);
    var birthStep = money.getTimeStep(account.birth, money.YEAR);
    if (timeStep == moneyBirthStep) {
        var previousAverageMuValue = money.getAverage(timeStep - 1);
        d3.selectAll("span.amountAtBirth.value").text(account.StartingPercentage);
        d3.selectAll("div.AtMoneyBirth").style("display", "block");
    }
    else if (timeStep == birthStep) {
        var previousAverageMuValue = money.getAverage(timeStep - 1);
        d3.selectAll("span.average.previous.mu.value").text(commentFormat(previousAverageMuValue));
        d3.selectAll("span.amountAtBirth.value").text(account.StartingPercentage + NONBREAKING_SPACE + '%');
        d3.selectAll("div.AtBirth").style("display", "block");
    }
    else {
        d3.selectAll("div.AfterBirth").style("display", "block");
    }
}

function comment0(id) {
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

function changeConfiguration(selectElement, configs) {
    curConfigId = selectElement.options[selectElement.selectedIndex].value;
    if (curConfigId != 'none') {
        var jsonRep = configs[curConfigId];
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment("IntroItem");
    }
    pushNewHistoryState();
}

function changeAccountSelection() {
    updateAddedAccountArea();
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
    comment(money.referenceFrameKey + 'Ref');
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

function clickTab(tabItemId) {
    openTab(tabItemId);
    comment(tabItemId);
    pushNewHistoryState();
    
    return false;
}
