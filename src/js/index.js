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

var LINEAR_CURVE = 'L';

var STEP_AFTER_CURVE = 'SA';

var LOG_UNIT_SUFFIX = " [log]";

var AVERAGE_ID = "average";

var ACCOUNT_ID_PREFIX = "account";

var STABLE_AVERAGE_ID = "stableAverage";

var DIVIDEND_ID = "dividend";

var STABLE_DIVIDEND_ID = "stableDividend";

var HEADCOUNT_ID = "headcount";

var MONETARY_SUPPLY_ID = "monetarySupply";

var STABLE_MONETARY_SUPPLY_ID = "stableMonetarySupply";

var ACCOUNT_COLORS = d3.schemeCategory20b;

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

var STABLE_AVERAGE_LABEL = 'M/N' + NONBREAKING_SPACE + 'pleine';

var DIVIDEND_LABEL = 'Dividende Universel';

var STABLE_DIVIDEND_LABEL = 'DU pleine';

var HEADCOUNT_LABEL = 'Nombre d\'individus "N"';

var MONETARY_SUPPLY_LABEL = 'Masse Monétaire "M"';

var STABLE_MONETARY_SUPPLY_LABEL = 'Masse pleine';

var ACCOUNT_LABEL_PREFIX = 'Compte';

var CO_CREATOR_LABEL = 'Co-créateur';

var NON_CREATOR_LABEL = 'Non-créateur';

var COMMUNITY_LABEL = 'Commun';

var TRANSACTION_LABEL_PREFIX = 'Transaction';

var ALL_ACCOUNTS_LABEL = 'Tous';

// Add a 'format' function to String
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\$\{p(\d)\}/g, function(match, id) {
        return args[id];
    });
};

extendD3();

function extendD3() {
    d3.selection.prototype.after = function (tagName) {
        var elements = [];

        this.each(function () {
            var element = document.createElement(tagName);
            this.parentNode.insertBefore(element, this.nextSibling);
            elements.push(element);
        });

        return d3.selectAll(elements);
    }
    d3.selection.prototype.before = function (tagName) {
        var elements = [];

        this.each(function () {
            var element = document.createElement(tagName);
            this.parentNode.insertBefore(element, this);
            elements.push(element);
        });

        return d3.selectAll(elements);
    }
}

// Create instance context
var money = {};
// Create instance of class in context with constructor parameters
libreMoneyClass.call(money);

var accountsChart;
var dividendChart;
var headcountChart;
var monetarySupplyChart;

var workshops = [
    {
        jsonRep: configs1,
        selectorId: 'ConfigSelector1'
    }, 
    {
        jsonRep: configs2,
        selectorId: 'ConfigSelector2'
    }, 
    {
        jsonRep: configs3,
        selectorId: 'ConfigSelector3'
    }, 
    {
        jsonRep: configs4,
        selectorId: 'ConfigSelector4'
    }, 
    {
        jsonRep: configs5,
        selectorId: 'ConfigSelector5'
    }];

var curConfigId = "";
var curTabId = "";
var curSelectedDataId = "";
var selectedPointIndex = -1;
var commentedId = "";
var curveType = LINEAR_CURVE;
var paramBgColor;

window.addEventListener('popstate', function(e) {
    var encodedURI = e.state;

    if (encodedURI !== null) {
        applyEncodedURI(encodedURI);
    }
});

initSelectors();

addTabEffectsFromHtml();
addParamLinksFromHtml();

generateC3Charts();

if (!applyEncodedURIFromLocation()) {
    applyJSonRep(configs1['cS0']);
    unsetCurConfig();
    openTab('WorkshopsTab');
    comment('WorkshopsTab');
    var encodedURI = asEncodedURI();
    window.history.replaceState(encodedURI, '', '?' + encodedURI);
}

addConfigLinksFromHtml();
addChartEffectsFromHtml();
initCallbacks();

// Add date value buttons
d3.selectAll('.dateValue').after('span')
    .attr('class', 'increaseDate')
    .text('+')
    .on('mousedown', function() {
        d3.event.preventDefault();
        changeTimeStep(1);
    });

d3.selectAll('.dateValue').before('span')
    .attr('class', 'decreaseDate')
    .text('-')
    .on('mousedown', function() {
        d3.event.preventDefault();
        changeTimeStep(-1);
    });

function changeTimeStep(offset) {
    var toSelectIndex = selectedPointIndex + offset;
    if (toSelectIndex >= 0) {
        var curChart = searchChartWithData(curSelectedDataId);
        var upperBound = curChart.getData(curSelectedDataId)[0].points.length;
        if (toSelectIndex < upperBound) {
            commentChartData(curChart, curSelectedDataId, toSelectIndex);
            pushNewHistoryState();
        }
    }
}

// Fill the forms
function fillForms() {
    d3.select('#LifeExpectancy').property("value", money.lifeExpectancy);
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR, money.YEAR)).toFixed(2));
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH, money.MONTH)).toFixed(2));
    d3.select('#YearMonthDividendStart').property("value", (money.getDividendStart(money.YEAR, money.MONTH)).toFixed(2));
    d3.select('#TimeLowerBound').property("value", toYearRep(money.timeLowerBoundInYears));
    d3.select('#TimeUpperBound').property("value", toYearRep(money.timeUpperBoundInYears));
    d3.select('#CalculateGrowth').property("checked", money.calculateGrowth);
    d3.select('#LogScale').property("checked", money.referenceFrames[money.referenceFrameKey].logScale);
    d3.select('#StepCurves').property("checked", curveType == STEP_AFTER_CURVE);
    d3.select("input[value=\"byMonth\"]").property("checked", money.growthStepUnit === money.MONTH);
    d3.select("input[value=\"byYear\"]").property("checked", money.growthStepUnit === money.YEAR);
    d3.select("input[value=\"ud0ByMonth\"]").property("checked", money.growthStepUnit === money.MONTH && money.getProdStepUnit() === money.MONTH);
    d3.select("input[value=\"ud0ByYear\"]").property("checked", money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.YEAR);
    d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.MONTH);
    d3.select('#MaxDemography').property("value", money.maxDemography);
    d3.select('#xMinDemography').property("value", toYearRep(money.xMinDemography));
    d3.select('#xMaxDemography').property("value", toYearRep(money.xMaxDemography));
    d3.select('#xMpvDemography').property("value", toYearRep(money.xMpvDemography));
    d3.select('#plateauDemography').property("value", money.plateauDemography);
    d3.select('#xScaleDemography').property("value", money.xScaleDemography);
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
}

function toYearRep(value) {
    return 1999 + value;
}

function fromYearRep(value) {
    return value - 1999;
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
}

function addParamLinksFromHtml() {
    var paramIdList = ['LifeExpectancy', 'growth', 'AnnualGrowth', 'MonthlyGrowth', 'UD0', 'StartingPercentage', 'ReferenceFrameSelector'/*, 'CalculateGrowth', 'AnnualDividendStart', 'YearMonthDividendStart', 'MonthlyDividendStart', 'TimeUpperBound', 'StepCurves'*/];
    
    paramIdList.forEach(function(paramId) {
        d3.selectAll('span.' + paramId + '.ParamLink')
            .style('background-color', '#f1f1f1')
            .on('mouseover', function () {
                var adaptedParamId = adaptParamId(paramId);
                var tabId = getParentTabContentId(adaptedParamId) + 'Tab';

                d3.selectAll('span.' + paramId + '.ParamLink').style('background-color', '#DDDD00');
                d3.select('#' + tabId).classed('focused', true);

                paramBgColor = d3.select('#' + adaptedParamId).style('background-color')
                d3.select('#' + adaptedParamId).style('background-color', '#DDDD00');
                showTab(tabId);

                var paramElemId = d3.select(this).attr('id');
                if (paramElemId) {
                    var modelId = + paramElemId.split('-')[1];
                    setSelectorIndex(tabId, modelId);
                }
            })
            .on('mouseout', function () {
                var adaptedParamId = adaptParamId(paramId);
                var tabId = getParentTabContentId(adaptedParamId) + 'Tab';

                d3.selectAll('span.' + paramId + '.ParamLink').style('background-color', '#f1f1f1');
                d3.select('#' + tabId).classed('focused', false);

                d3.select('#' + adaptedParamId).style('background-color', paramBgColor);
                showTab(curTabId);
            })
            .on('click', function() {
                var adaptedParamId = adaptParamId(paramId);
                var tabId = getParentTabContentId(adaptedParamId) + 'Tab';
                d3.select('#' + tabId).classed('focused', false);
                clickParamInput(tabId, adaptedParamId);
            });
    });
}

function getParentTabContentId(id) {
    var param = d3.select('#' + id);
    var parentNode = d3.select(param.node().parentNode);
    while (!parentNode.classed('tabcontent')) {
        parentNode = d3.select(parentNode.node().parentNode);
    }
    return parentNode.node().id;
}

function adaptParamId(id) {
    switch (id) {
        case 'UD0':
            if (money.growthStepUnit === money.MONTH && money.getProdStepUnit() === money.MONTH) {
                return 'MonthlyDividendStart';
            }
            else if (money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.YEAR) {
                return 'AnnualDividendStart';
            }
            else {
                return 'YearMonthDividendStart';
            }
        case 'growth':
            if (money.growthStepUnit === money.MONTH) {
                return 'MonthlyGrowth';
            }
            else {
                return 'AnnualGrowth';
            }
        default:
            break;
    }
    return id;
}

function addTabEffectsFromHtml() {
    var workshopsTabAttributes = {
        tabId: 'WorkshopsTab',
        referingClass: 'workshopsTabLink'
    };
    var growthTabAttributes = {
        tabId: 'GrowingRateTab',
        referingClass: 'growthTabLink'
    };
    var udTabAttributes = {
        tabId: 'UniversalDividendTab',
        referingClass: 'dividendTabLink'
    };
    var referenceTabAttributes = {
        tabId: 'ReferenceTab',
        referingClass: 'referenceTabLink'
    };
    var displayTabAttributes = {
        tabId: 'DisplayTab',
        referingClass: 'DisplayTabLink'
    };
    var accountsTabAttributes = {
        tabId: 'AccountsTab',
        referingClass: 'accountsTabLink'
    };
    var demographyTabAttributes = {
        tabId: 'DemographyTab',
        referingClass: 'demographyTabLink'
    };
    var transactionsTabAttributes = {
        tabId: 'TransactionsTab',
        referingClass: 'transactionsTabLink'
    };
    var tabAttributesList = [workshopsTabAttributes, growthTabAttributes, udTabAttributes, referenceTabAttributes, displayTabAttributes, accountsTabAttributes, demographyTabAttributes, transactionsTabAttributes];
    
    tabAttributesList.forEach(function(tabAttributes) {
        d3.selectAll('span.' + tabAttributes.referingClass)
            .style('background-color', '#f1f1f1')
            .on('mouseover', function () {
                d3.selectAll('span.' + tabAttributes.referingClass).style('background-color', '#dddddd');
                d3.select('#' + tabAttributes.tabId).classed('focused', true);
                showTab(tabAttributes.tabId);
            })
            .on('mouseout', function () {
                d3.selectAll('span.' + tabAttributes.referingClass).style('background-color', '#f1f1f1');
                d3.select('#' + tabAttributes.tabId).classed('focused', false);
                showTab(curTabId);
            })
            .on('click', function() {
                d3.select('#' + tabAttributes.tabId).classed('focused', false);
                clickTab(tabAttributes.tabId);
            });
    });
    initTransactionSpans();    
}

function addConfigLinksFromHtml() {
    for (var i = 0; i < workshops.length; i++) {
        const workshopJSonRep = workshops[i].jsonRep;
        Object.keys(workshopJSonRep).forEach(function(key) {
            const configIdToSelect = key;
            d3.selectAll('.configLink.' + key).on('click', function() {
                changeConfiguration(configIdToSelect, workshopJSonRep);
            });
        });
    }
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
            var curSelectedData = searchChartWithData(curSelectedDataId).getData(curSelectedDataId)[0];
            var targetedData = searchChartWithData(targetedSerieId).getData(targetedSerieId)[0];
            for (j = 0; j < targetedData.points.length; j++) {
                if (targetedData.points[j][0].getTime() == curSelectedData.points[selectedPointIndex][0].getTime()) {
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
            return money.previousGrowthStep(indexToSelect - 1);
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
        
    function clickSerieValue(serieSpan) {
        var referenceFrameKey = getReferenceFrameKey(serieSpan);
        var clickedSerieAttributes = getSerieAttributes(serieSpan);
        var clickedSerieId = getTargetedSerieId(serieSpan, clickedSerieAttributes);
        var curSelectedData = searchChartWithData(curSelectedDataId).getData(curSelectedDataId)[0];
        var selectedPointTime = curSelectedData.points[selectedPointIndex][0].getTime();
        
        if (money.referenceFrames[money.referenceFrameKey].logScale) {
            d3.select('#LogScale').property("checked", false);
        }
        if (referenceFrameKey && money.referenceFrameKey != referenceFrameKey) {
            money.referenceFrameKey = referenceFrameKey;
            setReferenceFrameSelection(money);
        }
        updateAccountYLabels();
        redrawCharts();
        unsetCurConfig();

        // Since new chart data are computed, search index to select 
        var clickedData = searchChartWithData(clickedSerieId).getData(clickedSerieId)[0];
        var indexToSelect = d3.bisectLeft(clickedData.points.map(p=>p[0].getTime()), selectedPointTime);
        if (serieSpan.classed('previous')) {
            indexToSelect = indexToSelect - 1;
        }
        else if (serieSpan.classed('previous2')) {
            indexToSelect = money.previousGrowthStep(indexToSelect - 1);
        }

        commentChartData(clickedSerieAttributes.chart, clickedSerieId, indexToSelect);
        pushNewHistoryState();
    }

    function getTargetedSerieId(serieSpan, serieAttributes) {
        var serieClass = serieAttributes.class;
        if (serieClass == ACCOUNT_ID_PREFIX) {
            var accountElemId = serieSpan.attr('id');
            if (accountElemId) {
                var accountId = + accountElemId.split('-')[1];
                return c3IdFromAccountId(accountId);
            }
            else {
                return curSelectedDataId;
            }
        }
        return serieClass;
    }

    function getSerieColor(serieSpan, serieAttributes) {
        var serieColor = serieAttributes.color;
        if (serieAttributes.class == ACCOUNT_ID_PREFIX) {
            var accountElemId = serieSpan.attr('id');
            if (accountElemId) {
                var accountId = + accountElemId.split('-')[1];
                return ACCOUNT_COLORS[accountId - 1];
            }
            else {
                return serieSpan.style('color');
            }
        }
        return serieColor;
    }

    function mouseoverSerieSpan(serieSpan, serieAttributes) {
        var targetedSerieId = getTargetedSerieId(serieSpan, serieAttributes);
        // Highlight specified targets and fade out the others.
        serieAttributes.chart.focus(targetedSerieId);

        if (isLinkedValue(serieSpan)) {
            var toSelectIndex = getIndexToSelect(serieSpan, targetedSerieId);
            if (toSelectIndex >= 0) {
                serieAttributes.chart.reference(targetedSerieId, toSelectIndex);
            }
        }
    }

    function mouseoutSerieSpan(serieSpan, serieAttributes) {
        // Revert highlighted and faded out targets
        serieAttributes.chart.revert();
        // Remove point reference
        serieAttributes.chart.unreference();
    }

    serieAttributesList.forEach(function(serieAttributes) {
        d3.selectAll('span.' + serieAttributes.class)
            .style('color', function () {
                return getSerieColor(d3.select(this), serieAttributes);
            })
            .on('mouseover', function () {
                mouseoverSerieSpan(d3.select(this), serieAttributes);
            })
            .on('mouseout', function () {
                mouseoutSerieSpan(d3.select(this), serieAttributes);
            });
    });
        
    d3.selectAll('span.current:not(.nolink), span.previous, span.previous2').on('click', function() {
        clickSerieValue(d3.select(this));
    });
}

function initCallbacks() {
    for (var i = 0; i < workshops.length; i++) {
        const workshopJSonRep = workshops[i].jsonRep;
        d3.select('#' + workshops[i].selectorId).on("change", function() { changeConfiguration(this.options[this.selectedIndex].value, workshopJSonRep); });
    }
    d3.select("#ReferenceFrameSelector").on("change", changeReferenceFrame);
    d3.select("#UdFormulaSelector").on("change", changeUdFormula);
    d3.select("#DemographySelector").on("change", changeDemographicProfile);
    d3.select("#AccountSelector").on("change", changeAccountSelection);
    d3.select("#TransactionSelector").on("change", changeTransactionSelection);
    d3.select("#TransactionSrc").on("change", changeTransactionSrcSelection);
    d3.select("#TransactionDest").on("change", changeTransactionDestSelection);
    d3.select("#TransactionRef").on("change", changeTransactionRefSelection);
    
    d3.selectAll(".rythm").on("change", changeRythm);
    d3.selectAll(".ud0Rythm").on("change", changeUd0Rythm);

    d3.select("#AddAccount").on("click", clickAddAccount);
    d3.select("#DeleteAccount").on("click", clickDeleteAccount);

    d3.select("#AddTransaction").on("click", clickAddTransaction);
    d3.select("#DeleteTransaction").on("click", clickDeleteTransaction);

    d3.select("#LifeExpectancy").on("change", changeLifeExpectancy);
    d3.select("#AnnualGrowth").on("change", changeAnnualGrowth);
    d3.select("#MonthlyGrowth").on("change", changeMonthlyGrowth);
    d3.select("#CalculateGrowth").on("click", changeCalculateGrowth);
    d3.select("#AnnualDividendStart").on("change", changeAnnualDividendStart);
    d3.select("#MonthlyDividendStart").on("change", changeMonthlyDividendStart);
    d3.select("#YearMonthDividendStart").on("change", changeYearMonthDividendStart);
    d3.select("#LogScale").on("click", changeLogScale);
    d3.select("#StepCurves").on("click", changeStepCurves);
    d3.select("#TimeLowerBound").on("change", changeTimeLowerBound);
    d3.select("#TimeUpperBound").on("change", changeTimeUpperBound);
    d3.select("#MaxDemography").on("change", changeMaxDemography);
    d3.select("#xMinDemography").on("change", changeXMinDemography);
    d3.select("#xMaxDemography").on("change", changeXMaxDemography);
    d3.select("#xMpvDemography").on("change", changeXMpvDemography);
    d3.select("#plateauDemography").on("change", changePlateauDemography);
    d3.select("#xScaleDemography").on("change", changeXScaleDemography);
    d3.select("#AccountBirth").on("change", changeAccountBirth);
    d3.select("#AccountDuration").on("change", changeAccountDuration);
    d3.select("#TypeSelector").on("change", changeAccountType);
    d3.select("#StartingPercentage").on("change", changeStartingPercentage);
    d3.select("#TransactionYear").on("change", changeTransactionYear);
    d3.select("#TransactionRep").on("change", changeTransactionRep);
    d3.select("#TransactionAmount").on("change", changeTransactionAmount);
    
    d3.selectAll(".tablinks").on("click", function() { clickTab(this.id); });

    d3.selectAll("input[type=\"text\"]").on("click", function() { comment(this.id); });
}

function asEncodedURI() {
    var moneyAsJSon = money.asJSonRep();
    var guiAsJSon = {
        t : curTabId,
        c : curConfigId,
        ac : {
            hs : accountsChart.getHiddenSerieIds()
        },
        dc : {
            hs : dividendChart.getHiddenSerieIds()
        },
        hc : {
            hs : headcountChart.getHiddenSerieIds()
        },
        sc : {
            hs : monetarySupplyChart.getHiddenSerieIds()
        },
        ct: curveType,
        a : document.getElementById("AccountSelector").selectedIndex,
        tr : document.getElementById("TransactionSelector").selectedIndex,
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
    // If current X range has changed, apply zoom first (except if no serie is already drawn)
    var zoomTransition;
    if (!d3.selectAll('.serieGroup').empty() && 
            ((money.timeLowerBoundInYears != jsonRep.m.tm)
            || (money.timeUpperBoundInYears != jsonRep.m.tM))) {
        var oldTimeBounds = { lower: money.getTimeLowerBound(money.YEAR), upper: money.getTimeUpperBound(money.YEAR) };
        money.setTimeLowerBound(jsonRep.m.tm); 
        money.setTimeUpperBound(jsonRep.m.tM);
        zoomTransition = updateZoom(oldTimeBounds);
    }
    if (zoomTransition) {
        zoomTransition
            .on("end", function(p,j) {
                // If transition 0 is ended, no need to wait the others, they are virtually ended
                if (j==0) {
                    // Finalize drawing (do a chained transition)  
                    applyJSonRepFinal(jsonRep);
                    var encodedURI = asEncodedURI();
                    window.history.replaceState(encodedURI, '', '?' + encodedURI);
                }
            });
    } else {
        applyJSonRepFinal(jsonRep);
    }
}

function applyJSonRepFinal(jsonRep) {
    curveType = jsonRep.g.ct;
    money.applyJSonRep(jsonRep.m);
    
    unselectChartPoints();
    fillForms();
    enableForms();

    joinAccountSelectorsToData();
    document.getElementById("AccountSelector").selectedIndex = jsonRep.g.a;
    
    joinTransactionSelectorToData();
    document.getElementById("TransactionSelector").selectedIndex = jsonRep.g.tr;

    curConfigId = jsonRep.g.c;
    setConfigSelection();
    
    setReferenceFrameSelection(money);
    setUdFormulaSelection(money);
    setDemographySelection(money);
    
    updateAddedAccountArea();
    updateTimeXLabels();
    updateAccountYLabels();
    updateTransactionArea();

    accountsChart.hide(jsonRep.g.ac.hs);
    dividendChart.hide(jsonRep.g.dc.hs);
    headcountChart.hide(jsonRep.g.hc.hs);
    monetarySupplyChart.hide(jsonRep.g.sc.hs);
    redrawCharts();

    openTab(jsonRep.g.t);
    if (jsonRep.g.s) {
        var chart = searchChartWithData(jsonRep.g.s);
        commentChartData(chart, jsonRep.g.s, jsonRep.g.i);
    }
    else {
        comment(jsonRep.g.com);
    }
}
    
// Init the different selectors
function initSelectors() {
    for (var i = 0; i < workshops.length; i++) {
        feedConfigSelector(workshops[i]);
    }
    feedReferenceFrameSelectors(money);
    feedUdFormulaSelector(money);
    feedAccountTypeSelector();
    feedDemographySelector(money);
}

// Create configuration selector
function feedConfigSelector(workshop) {
    d3.select('#' + workshop.selectorId).selectAll("option")
        .data(Object.keys(workshop.jsonRep))
      .enter().append("option")
        .text(function(d) { return getConfigLabel(d); })
        .attr('value', function(d) { return d; });
        
    d3.select('#' + workshop.selectorId).selectAll("option").filter(d => d == 'none')
        .attr('disabled', true);
}

function setConfigSelection() {
    for (var i = 0; i < workshops.length; i++) {
        var selectedIndex = Object.keys(workshops[i].jsonRep).indexOf(curConfigId);
        if (selectedIndex != -1) {
            document.getElementById(workshops[i].selectorId).selectedIndex = selectedIndex;
            for (var j = 0; j < workshops.length; j++) {
                if (i != j) {
                    document.getElementById(workshops[j].selectorId).selectedIndex = 0;
                }
            }
            return;
        }
    }
    console.log("Configuration not managed: " + curConfigId);
};

function unsetCurConfig() {
    curConfigId = 'none';
    setConfigSelection();
}

// Create reference frame selectors
function feedReferenceFrameSelectors(money) {
    var referenceKeys = Object.keys(money.referenceFrames);
    feedReferenceFrameSelector(referenceKeys.slice(0, referenceKeys.length - 1), 'ReferenceFrameSelector');
    feedReferenceFrameSelector(referenceKeys, 'TransactionRef');
};

function feedReferenceFrameSelector(referenceKeys, selectorId) {
    d3.select('#' + selectorId).selectAll("option")
        .data(referenceKeys)
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

// Create account type selector
function feedAccountTypeSelector() {
    d3.select('#TypeSelector').selectAll("option")
        .data(money.ACCOUNT_TYPES)
      .enter().append("option")
        .text(function(d) { return getAccountTypeLabel(d); })
        .attr('value', function(d) { return d; });
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

// Join (via D3) account selectors to 'money.accounts'
function joinAccountSelectorsToData() {
    joinAccountSelectorToData('AccountSelector', money.accounts, accountName2);
    joinAccountSelectorToData('TransactionSrc', money.accounts, accountName1);
    joinAccountSelectorToData('TransactionDest', money.accounts, accountName1);
    // Add 'ALL_ACCOUNT' to the end of the transaction selectors
    joinAccountSelectorToData('TransactionSrc', getTransAccounts(), accountName1);
    joinAccountSelectorToData('TransactionDest', getTransAccounts(), accountName1);
};

function joinAccountSelectorToData(accountSelectorId, accounts, nameFunc) {
    var options = d3.select('#' + accountSelectorId).selectAll("option")
        .data(accounts, function(d) { return d.id; });
            
    options.text(nameFunc);
    
    options.enter().append("option")
        .text(nameFunc)
        .attr('value', function(d) { return d.id; })
        
    options.exit().remove();
};

// Join (via D3) transaction selector to 'money.transactions'
function joinTransactionSelectorToData() {
    var options = d3.select('#TransactionSelector').selectAll("option")
        .data(money.transactions, function(d) { return d.id; });
            
    options.text(function(d) { return transactionName(d); });
    
    options.enter().append("option")
        .text(function(d) { return transactionName(d); })
        .attr('value', function(d) { return d.id; })
        
    options.exit().remove();
};

function generateAccountsData() {
	var accountsData = {
        names: {
            'average': AVERAGE_LABEL,
            'stableAverage': STABLE_AVERAGE_LABEL
        },
        series: [],
        repTypes: {
            average: myc3.AREA,
            stableAverage: myc3.LINE
        },
        onclick: function(d, i) {
            commentChartData(accountsChart, d.id, i);
            pushNewHistoryState();
        }
    };

    var averageSerie = {};
    averageSerie.id = AVERAGE_ID;
    averageSerie.points = [];
    averageSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.averages.x.length; i++) {
	    averageSerie.points.push([asDate(money.averages.x[i]), money.averages.y[i]]);
    }
    accountsData.series.push(averageSerie);
    
    var stableAverageSerie = {};
    stableAverageSerie.id = STABLE_AVERAGE_ID;
    stableAverageSerie.points = [];
    stableAverageSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.stableAverages.x.length; i++) {
	    stableAverageSerie.points.push([asDate(money.stableAverages.x[i]), money.stableAverages.y[i]]);
	}
    accountsData.series.push(stableAverageSerie);
    
    // Depending on X axis bounds, some accounts are not visible
    for (var iAccount = 0; iAccount < money.accounts.length; iAccount++) {
        var accountSerie = {};
        accountSerie.id = c3IdFromAccountId(money.accounts[iAccount].id);
        accountSerie.points = [];
        accountSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
        if (money.accounts[iAccount].x.length > 1) {
            for (var i = 0; i < money.accounts[iAccount].x.length; i++) {
                accountSerie.points.push([asDate(money.accounts[iAccount].x[i]), money.accounts[iAccount].y[i]]);
            }
            accountsData.series.push(accountSerie);
            accountsData.names[accountSerie.id] = accountName3(money.accounts[iAccount]);
            accountsData.repTypes[accountSerie.id] = myc3.LINE;
        }
    }

    return accountsData;
}

function unselectChartPoints() {
    curSelectedDataId = "";
    selectedPointIndex = -1;
    var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    charts.forEach(function(c) {
        c.unselect();
    });
}

function generateDividendData() {
    var dividendData = {
        names: {
            'dividend': "${p0} (${p1})".format(DIVIDEND_LABEL, universalDividendName()),
            'stableDividend': STABLE_DIVIDEND_LABEL
        },
        series: [],
        repTypes: {
            dividend: myc3.AREA,
            stableDividend: myc3.LINE
        },
        onclick: function(d, i) {
            commentChartData(dividendChart, d.id, i);
            pushNewHistoryState();
        }
    };

    var dividendSerie = {};
    dividendSerie.id = DIVIDEND_ID;
    dividendSerie.points = [];
    dividendSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.dividends.x.length; i++) {
	    dividendSerie.points.push([asDate(money.dividends.x[i]), money.dividends.y[i]]);
    }
    dividendData.series.push(dividendSerie);
    
    var stableDividendSerie = {};
    stableDividendSerie.id = STABLE_DIVIDEND_ID;
    stableDividendSerie.points = [];
    stableDividendSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.stableDividends.x.length; i++) {
	    stableDividendSerie.points.push([asDate(money.stableDividends.x[i]), money.stableDividends.y[i]]);
    }
    dividendData.series.push(stableDividendSerie);
    
    return dividendData;
}

function generateHeadcountData() {
    var headcountData = {
        names: {
            'headcount': HEADCOUNT_LABEL + ' (' + getDemographicProfileLabel(money.demographicProfileKey) + ')'
        },
        series: [],
        repTypes: {
            headcount: myc3.AREA
        },
        onclick: function(d, i) {
            commentChartData(headcountChart, d.id, i);
            pushNewHistoryState();
        }
    };

    var headcountSerie = {};
    headcountSerie.id = HEADCOUNT_ID;
    headcountSerie.points = [];
    headcountSerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.headcounts.x.length; i++) {
	    headcountSerie.points.push([asDate(money.headcounts.x[i]), money.headcounts.y[i]]);
    }
    headcountData.series.push(headcountSerie);
    
    return headcountData;
}
    
function generateMonetarySupplyData() {
    var monetarySupplyData = {
        names: {
            'monetarySupply': MONETARY_SUPPLY_LABEL,
            'stableMonetarySupply': STABLE_MONETARY_SUPPLY_LABEL
        },
        series: [],
        repTypes: {
            monetarySupply: myc3.AREA,
            stableMonetarySupply: myc3.LINE
        },
        onclick: function(d, i) {
            commentChartData(monetarySupplyChart, d.id, i);
            pushNewHistoryState();
        }
    };

    var monetarySupplySerie = {};
    monetarySupplySerie.id = MONETARY_SUPPLY_ID;
    monetarySupplySerie.points = [];
    monetarySupplySerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.monetarySupplies.x.length; i++) {
	    monetarySupplySerie.points.push([asDate(money.monetarySupplies.x[i]), money.monetarySupplies.y[i]]);
    }
    monetarySupplyData.series.push(monetarySupplySerie);
    
    var stableMonetarySupplySerie = {};
    stableMonetarySupplySerie.id = STABLE_MONETARY_SUPPLY_ID;
    stableMonetarySupplySerie.points = [];
    stableMonetarySupplySerie.linkType = (curveType == LINEAR_CURVE) ? myc3.LINEAR_CURVE : myc3.STEP_AFTER_CURVE;
	for (var i = 0; i < money.stableMonetarySupplies.x.length; i++) {
	    stableMonetarySupplySerie.points.push([asDate(money.stableMonetarySupplies.x[i]), money.stableMonetarySupplies.y[i]]);
    }
    monetarySupplyData.series.push(stableMonetarySupplySerie);
    
	return monetarySupplyData;
};

function c3IdFromAccountId(accountId) {
    return ACCOUNT_ID_PREFIX + accountId;
}

function idFromC3AccountId(c3AccountId) {
    if (c3AccountId.substr(0, ACCOUNT_ID_PREFIX.length) === ACCOUNT_ID_PREFIX) {
        return c3AccountId.substring(ACCOUNT_ID_PREFIX.length);
    }
    throw new Error(c3AccountId + " doesn't start with the expected prefix: " + ACCOUNT_ID_PREFIX);
}

function getConfigLabel(configKey) {
    var configLabel;
    switch(configKey) {
        case 'none':
            configLabel = "Sélectionnez...";
            break;
        case 'cS0':
            configLabel = "Départ à 0";
            break;
        case 'cSMN':
            configLabel = "Départ à DU0/c";
            break;
        case 'cX40':
            configLabel = "Vue sur 40 ans";
            break;
        case 'cNOSTEP':
            configLabel = "Sans escalier";
            break;
        case 'cS0-M':
            configLabel = "Départ à 0 (mois)";
            break;
        case 'cSMN-M':
            configLabel = "Départ à DU0/c (mois)";
            break;
        case 'cS0-YM':
            configLabel = "Départ à 0 (an/mois)";
            break;
        case 'c2CC':
            configLabel = "2nd co-créateur";
            break;
        case 'cCAUCHY':
            configLabel = "Profil pour N";
            break;
        case 'c4DATES':
            configLabel = "4 dates d'entrée";
            break;
        case 'cLMU1':
            configLabel = "Prêt en UM (V1)";
            break;
        case 'cLMU2':
            configLabel = "Prêt en UM (V2)";
            break;
        case 'cLUD':
            configLabel = "Prêt en DU";
            break;
        case 'c3CC':
            configLabel = "3 co-créateurs";
            break;
        case 'c3UBI':
            configLabel = "RdB via une taxe";
            break;
        case 'c4CC':
            configLabel = "Nouvel entrant (DU)";
            break;
        case 'c4UBI':
            configLabel = "Nouvel entrant (RdB)";
            break;
        case 'c4CC-M':
            configLabel = "Nouvel entrant (DU/mois)";
            break;
        case 'c4UBI-M':
            configLabel = "Nouvel entrant (RdB/mois)";
            break;
        case 'c160f':
            configLabel = "La part des morts";
            break;
        case 'c160h':
            configLabel = "Héritage";
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
        case money.ACCOUNT_REF_KEY:
            refLabel = "% Compte";
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
            return "Basique : DU(t) = c*M(t)/N(t)";
        case money.UDA_KEY:
            return "DUA : DU(t) = max[DU(t-1) ; c*M(t)/N(t)]";
        case money.UDB_KEY: 
            return "DUB : DU(t) = (1+c)*DU(t-1)";
        case money.UDC_KEY: 
            return "DUC : DU(t) = 1/2 [c*M(t)/N(t) + (1+c)*DU(t-1)]";
        case money.UDG_KEY:
            return "DUĞ : DU(t) = DU(t-1) + c²*M(t-1)/N(t-1)";
        default:
            throw new Error("Dividend formula not managed: " + udFormulaKey);
    }
}

function getAccountTypeLabel(type) {
    switch(type) {
        case money.CO_CREATOR:
            return CO_CREATOR_LABEL;
        case money.NON_CREATOR:
            return NON_CREATOR_LABEL;
        case money.COMMUNITY:
            return COMMUNITY_LABEL;
        default:
            throw new Error("Account type not managed: " + type);
    }
}

function getDemographicProfileLabel(demographicProfileKey) {
    switch(demographicProfileKey) {
        case money.NONE_PROFILE_KEY:
            return "Aucun profil";
        case money.TRIANGULAR_PROFILE_KEY:
            return "Triangulaire";
        case money.PLATEAU_PROFILE_KEY:
            return "Plateau";
        case money.CAUCHY_PROFILE_KEY: 
            return "Cauchy";
        case money.DAMPEDWAVE_PROFILE_KEY:
            return "Ondulation Amortie";
        case money.SIGMOID_PROFILE_KEY:
            return "Sigmoïde";
        default:
            throw new Error("Demographic profile not managed: " + demographicProfileKey);
    }
}

// create and display chart from money.accounts
function generateAccountsChart() {
    accountsChart = myc3.generate({
        bindto: '#AccountsChart',
        padding: {
            left: 70,
            right: 30
        },
        size: {
            height: 320,
            width: 500
        },
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(money.YEAR), money.YEAR),
                max: asDate(money.getTimeUpperBound(money.YEAR), money.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            }
        },
        legend: {
            item: {
                onclick: function (id) {
                    accountsChart.toggle(id);
                    unsetCurConfig();
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
        }
    });
}

// create and display chart from money.dividend
function generateDividendChart() {
    dividendChart = myc3.generate({
        bindto: '#DividendChart',
        padding: {
            left: 70,
            right: 30
        },
        size: {
            height: 320,
            width: 500
        },
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(money.YEAR), money.YEAR),
                max: asDate(money.getTimeUpperBound(money.YEAR), money.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            }
        },
        legend: {
            item: {
                onclick: function (id) {
                    dividendChart.toggle(id);
                    unsetCurConfig();
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
        }
    });
}

// create and display chart from money.headcount
function generateHeadcountChart() {
    headcountChart = myc3.generate({
        bindto: '#HeadcountChart',
        padding: {
            left: 70,
            right: 30,
        },
        size: {
            height: 320,
            width: 500
        },
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(money.YEAR), money.YEAR),
                max: asDate(money.getTimeUpperBound(money.YEAR), money.YEAR)
            },
            y: {
                label: {
                    text: "Nombre d\'individus"
                },
                tick: {
                    format: d3.format("d")
                }
            }
        },
        legend: {
            item: {
                onclick: function (id) {
                    headcountChart.toggle(id);
                    unsetCurConfig();
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
        }
    });
}

// create and display chart from money.monetarySupply
function generateMonetarySupplyChart() {
    monetarySupplyChart = myc3.generate({
        bindto: '#MonetarySupplyChart',
        padding: {
            left: 70,
            right: 30
        },
        size: {
            height: 320,
            width: 500
        },
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(money.YEAR), money.YEAR),
                max: asDate(money.getTimeUpperBound(money.YEAR), money.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            }
        },
        legend: {
            item: {
                onclick: function (id) {
                    monetarySupplyChart.toggle(id);
                    unsetCurConfig();
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
        }
    });
}

function tickFormat(value) {
    var f = d3.format('.2s');
    return withExp(f(value));
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
 * Update chart data ans redraw
 */
function redrawCharts() {

    // calculate C3 data
    money.generateData();
    var accountsData = generateAccountsData();
    var dividendData = generateDividendData();
    var headcountData = generateHeadcountData();
    var monetarySupplyData = generateMonetarySupplyData();

    // reload data in chart
    accountsChart.load(accountsData);
    dividendChart.load(dividendData);
    headcountChart.load(headcountData);
    monetarySupplyChart.load(monetarySupplyData);
    
    var lowerBoundDate = asDate(money.getTimeLowerBound(money.YEAR), money.YEAR);
    var upperBoundDate = asDate(money.getTimeUpperBound(money.YEAR), money.YEAR);
    accountsChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

    accountsChart.draw();
    dividendChart.draw();
    headcountChart.draw();
    monetarySupplyChart.draw();
}

function updateZoom(oldTimeBounds) {
    // calculate C3 data
    money.generateData({ 
        lower: Math.min(money.getTimeLowerBound(), money.toTimeStep(oldTimeBounds.lower, money.YEAR)), 
        upper: Math.max(money.getTimeUpperBound(), money.toTimeStep(oldTimeBounds.upper, money.YEAR))
    });
    var accountsData = generateAccountsData();
    var dividendData = generateDividendData();
    var headcountData = generateHeadcountData();
    var monetarySupplyData = generateMonetarySupplyData();

    // reload data in chart
    accountsChart.load(accountsData);
    dividendChart.load(dividendData);
    headcountChart.load(headcountData);
    monetarySupplyChart.load(monetarySupplyData);
    
    var lowerBoundDate = asDate(money.getTimeLowerBound(money.YEAR), money.YEAR);
    var upperBoundDate = asDate(money.getTimeUpperBound(money.YEAR), money.YEAR);
    accountsChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axis.range({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

    // If the transition of one of the charts is ended, no need to wait the others, they are virtually ended
    accountsChart.updateZoom();
    dividendChart.updateZoom();
    headcountChart.updateZoom();
    return monetarySupplyChart.updateZoom();
}

function searchChartWithData(c3DataId) {
    var charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    for (var i = 0; i < charts.length; i++) {
        if (charts[i].getData(c3DataId).length != 0) {
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
    var accounts = money.deleteAccount(selectedAccountIndex);
    // If account deleted...
    if (accounts != false && accounts.length > 0) {
        redrawCharts();
        unsetCurConfig();
        joinAccountSelectorsToData();
        document.getElementById("AccountSelector").selectedIndex = selectedAccountIndex - 1;
        updateAddedAccountArea();
    }
}

function updateAddedAccountArea() {
    var selectedAccount = money.getAccount(getSelectedAccountIndex());
    d3.select('#AccountBirth').property("value", toYearRep(selectedAccount.birth));
    d3.select('#AccountDuration').property("value", selectedAccount.duration);
    document.getElementById("TypeSelector").selectedIndex = money.ACCOUNT_TYPES.indexOf(selectedAccount.type);
    d3.select('#StartingPercentage').property("value", selectedAccount.startingPercentage);
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
    
    redrawCharts();
    unsetCurConfig();
    joinAccountSelectorsToData();
    document.getElementById("AccountSelector").selectedIndex = money.accounts.length - 1;
    updateAddedAccountArea();
}

function accountName1(account) {
    if (account === money.ALL_ACCOUNT) {
        return ALL_ACCOUNTS_LABEL;
    }
    return "${p0} ${p1}".format(ACCOUNT_LABEL_PREFIX, account.id);
}

function accountName2(account) {
    return "${p0} (${p1})".format(accountName1(account), accountTypeLabel(account));
}

function accountName3(account) {
    return "${p0} (${p1}, ${p2})".format(accountName1(account), accountTypeLabel(account), account.startingPercentage);
}

function idFromAccountName(accountName) {
    if (accountName.substr(0, ACCOUNT_LABEL_PREFIX.length) === ACCOUNT_LABEL_PREFIX) {
        return accountName.substring(ACCOUNT_LABEL_PREFIX.length);
    }
    throw new Error(accountName + " doesn't start with the expected prefix: " + ACCOUNT_LABEL_PREFIX);
}

function accountTypeLabel(account) {
    if (money.isCoCreator(account)) {
        return CO_CREATOR_LABEL;
    }
    else if (money.isNonCreator(account)) {
        return NON_CREATOR_LABEL;
    }
    else if (money.isCommunity(account)) {
        return COMMUNITY_LABEL;
    }
    else {
        throw new Error("Unknown account type: " + account.type);
    }
}

function accountAgeLabel(account, timeStep) {
    var year = 0;
    var month = 0;
    if (money.getProdStepUnit() === money.MONTH) {
        year = Math.trunc(timeStep / 12)  - account.birth;
        month = timeStep % 12;
    }
    else if (money.getProdStepUnit() === money.YEAR) {
        year = timeStep - account.birth;
        month = 0;
    }
    else {
        throw new Error("Time resolution not managed: " + money.getProdStepUnit());
    }
    if (year == 0 && month == 0) {
        if (money.getProdStepUnit() === money.MONTH) {
            return "0 mois";
        }
        else if (money.getProdStepUnit() === money.YEAR) {
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

/**
 * Delete current transaction
 */
function deleteTransaction() {
    var selectedTransactionIndex = getSelectedTransactionIndex();
    var transactions = money.deleteTransaction(selectedTransactionIndex);
    // If transaction deleted...
    if (transactions != false && transactions.length > 0) {
        redrawCharts();
        unsetCurConfig();
        joinTransactionSelectorToData();
        if (selectedTransactionIndex > 0) {
            document.getElementById("TransactionSelector").selectedIndex = selectedTransactionIndex - 1;
        }
        else if (money.transactions.length > 0) {
            document.getElementById("TransactionSelector").selectedIndex = 0;
        }
        updateTransactionArea();
    }
}

function updateTransactionArea() {
    if (money.transactions.length > 0) {
        var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
        d3.select('#TransactionYear').property("value", toYearRep(selectedTransaction.year));
        d3.select('#TransactionRep').property("value", selectedTransaction.repetitionCount);
        document.getElementById("TransactionSrc").selectedIndex = getTransAccounts().indexOf(selectedTransaction.from);
        document.getElementById("TransactionDest").selectedIndex = getTransAccounts().indexOf(selectedTransaction.to);
        d3.select('#TransactionAmount').property("value", selectedTransaction.amount);
        document.getElementById("TransactionRef").selectedIndex = Object.keys(money.referenceFrames).indexOf(selectedTransaction.amountRef);
    }
    enableTransactionArea();
}

function getTransAccounts() {
    return money.accounts.concat(money.ALL_ACCOUNT);
}
    
function getSelectedTransactionIndex() {
    var sel = document.getElementById('TransactionSelector');
    return sel.selectedIndex;
}

function getTransactionSrcIndex() {
    var sel = document.getElementById('TransactionSrc');
    return sel.selectedIndex;
}

function getTransactionDestIndex() {
    var sel = document.getElementById('TransactionDest');
    return sel.selectedIndex;
}

/**
 * add a transaction 
 */
function addTransaction() {
    money.addTransaction();
    redrawCharts();
    unsetCurConfig();
    joinTransactionSelectorToData();
    document.getElementById("TransactionSelector").selectedIndex = money.transactions.length - 1;
    updateTransactionArea();
}

function transactionName(transaction) {
    return "${p0} ${p1}".format(TRANSACTION_LABEL_PREFIX, transaction.id);
}

function enableTransactionArea() {
    if (money.transactions.length > 0) {
        d3.select("#Transactions>.ParamSection").style("display", "block");
    }
    else {
        d3.select("#Transactions>.ParamSection").style("display", "none");
    }
}

function asDate(timeStep, timeUnit) {
    timeUnit = timeUnit || money.getProdStepUnit();
    
    if (timeUnit === money.MONTH) {
        return new Date(1999 + Math.trunc(timeStep / 12), timeStep % 12, 1);
    }
    else if (timeUnit === money.YEAR) {
        return new Date(1999 + timeStep, 0, 1);
    }
    else {
        throw new Error("Time unit not managed: " + timeUnit);
    }
}

function asFormattedDate(timeStep, timeUnit) {
    return d3.timeFormat(DATE_PATTERN)(asDate(timeStep, timeUnit));
}

function enableGrowthForms(calculateGrowth) {
    if (calculateGrowth) {
        d3.select('#AnnualGrowth').attr('disabled', 'disabled');
        d3.select('#MonthlyGrowth').attr('disabled', 'disabled');
    } else {
        if (money.growthStepUnit === money.MONTH) {
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
    if (money.growthStepUnit === money.MONTH) {
        d3.select('#AnnualDividendStart').attr('disabled', 'disabled');
        d3.select('#MonthlyDividendStart').attr('disabled', null);
        d3.select('#YearMonthDividendStart').attr('disabled', 'disabled');
    }
    else {
        if (money.getProdStepUnit() === money.YEAR) {
            d3.select('#AnnualDividendStart').attr('disabled', null);
            d3.select('#MonthlyDividendStart').attr('disabled', 'disabled');
            d3.select('#YearMonthDividendStart').attr('disabled', 'disabled');
        }
        else {
            d3.select('#AnnualDividendStart').attr('disabled', 'disabled');
            d3.select('#MonthlyDividendStart').attr('disabled', 'disabled');
            d3.select('#YearMonthDividendStart').attr('disabled', null);
        }
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
        case money.SIGMOID_PROFILE_KEY:
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
        d3.select('#DeleteAccount').attr('disabled', null);
    }
    else {
        d3.select('#AccountBirth').attr('disabled', 'disabled');
        d3.select('#DeleteAccount').attr('disabled', 'disabled');
    }
}

function accountYLabel() {
    return "Montant (en ${p0})".format(getRefUnitLabel3(money.referenceFrameKey));
}

function timeLabel() {
    if (money.growthStepUnit == money.MONTH) {
        return 'Temps (émission mensuelle)';
    }
    else {
        if (money.getProdStepUnit() == money.MONTH) {
            return 'Temps (émission mensuelle, réévaluation annuelle)';
        }
        else {
            return 'Temps (émission annuelle)';
        }
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
    showTab(tabId);
    curTabId = tabId;
}

function showTab(tabId) {
    d3.selectAll(".tabcontent").style("display", "none");
    var tabContentId = d3.select("#" + tabId).attr("tab-content-id");
    d3.select("#" + tabContentId).style("display", "block");
}

function comment(id) {
    unselectChartPoints();
    return comment0(id);
}

function commentChartData(chart, c3DataId, pointIndex) {
    unselectChartPoints();
    chart.doSelect(c3DataId, pointIndex);
    curSelectedDataId = c3DataId;
    selectedPointIndex = pointIndex;

    if (c3DataId.startsWith(ACCOUNT_ID_PREFIX)) {
        var accountId = idFromC3AccountId(c3DataId);
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

    d3.selectAll("span.dateValue").text(asFormattedDate(timeStep));
    var pTimeStep = timeStep - 1;
    var ppTimeStep = money.previousGrowthStep(pTimeStep);

    d3.selectAll("span.growth.value").text(commentFormat(growthValue * 100) + NONBREAKING_SPACE + '%');
    d3.selectAll(".prodFactor").style("display", (money.prodFactor() == 12) ? null : "none");
    
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
            var stableAverageMuValue = (1 + growthValue) * dividendMuValue / growthValue * money.prodFactor();
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
            var previousDividendMuValue = money.dividends.values[pTimeStep];
            var previousMonetarySupplyMuValue = money.monetarySupplies.values[pTimeStep];
            var previous2MonetarySupplyMuValue = money.monetarySupplies.values[ppTimeStep];
            var previousHeadcountValue = money.headcounts.values[pTimeStep];
            d3.selectAll("span.dividend.label").text(DIVIDEND_LABEL);
            d3.selectAll("span.dividend.formulaName").text(universalDividendName());
            d3.selectAll("span.dividend.previous.mu.value").text(commentFormat(previousDividendMuValue));
            d3.selectAll("span.dividend.basicMuValue").text(commentFormat(growthValue * previousMonetarySupplyMuValue / headcountValue / money.prodFactor()));
            d3.selectAll("span.dividend.mu.logValue").text(commentFormat(dividendMuLogValue));
            d3.selectAll("span.dividend.ud.value").text(commentFormat(dividendUdValue));
            d3.selectAll("span.dividend.ud.logValue").text(commentFormat(dividendUdLogValue));
            d3.selectAll("span.dividend.mn.value").text(commentFormat(dividendMnValue));
            d3.selectAll("span.dividend.mn.logValue").text(commentFormat(dividendMnLogValue));
            d3.selectAll("span.udbMuValue").text(commentFormat((1 + growthValue) * previousDividendMuValue));
            d3.selectAll("span.headcount.previous.value").text(f(previousHeadcountValue));
            d3.selectAll("span.monetarySupply.previous.mu.value").text(commentFormat(previousMonetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.previous2.mu.value").text(commentFormat(previous2MonetarySupplyMuValue));
            commentAccordingToUD(timeStep);
            break;
    
        case STABLE_DIVIDEND_ID: 
            var stableDividendMuValue = growthValue * averageMuValue / (1 + growthValue) / money.prodFactor();
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
            var demographyValue = money.demographicProfiles[money.demographicProfileKey].calculate(money, money.fromTimeStep(timeStep, money.YEAR));
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
            var previousMonetarySupplyMuValue = money.monetarySupplies.values[pTimeStep];
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
            commentAccordingToMoneyBirth(timeStep);
            break;
        
        case STABLE_MONETARY_SUPPLY_ID: 
            var stableMonetarySupplyMuValue = headcountValue * (1 + growthValue) * dividendMuValue / growthValue * money.prodFactor();
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
                var accountSpan = d3.select("#accountComment").selectAll('span.account');
                accountSpan.style('color', ACCOUNT_COLORS[account.id - 1]);
                var accountMuValue = account.values[timeStep];
                var accountMuLogValue = Math.log(accountMuValue) / Math.log(10);
                var accountUdValue = accountMuValue / dividendMuValue;
                var accountUdLogValue = Math.log(accountUdValue) / Math.log(10);
                var accountMnValue = 100 * accountMuValue / averageMuValue;
                var accountMnLogValue = Math.log(accountMnValue) / Math.log(10);
                d3.selectAll("span.account.name").text(accountName1(account));
                d3.selectAll("span.accountAge").text(accountAgeLabel(account, timeStep));
                d3.selectAll("span.account.current.mu.value").text(commentFormat(accountMuValue));
                d3.selectAll("span.account.mu.logValue").text(commentFormat(accountMuLogValue));
                d3.selectAll("span.account.ud.value").text(commentFormat(accountUdValue));
                d3.selectAll("span.account.ud.logValue").text(commentFormat(accountUdLogValue));
                d3.selectAll("span.account.mn.value").text(commentFormat(accountMnValue));
                d3.selectAll("span.account.mn.logValue").text(commentFormat(accountMnLogValue));
                if (timeStep > 0) {
                    var previousMuAccountValue = account.values[pTimeStep];
                    d3.selectAll("span.account.previous.mu.value").text(commentFormat(previousMuAccountValue));
                }
                d3.selectAll("span.UD0.value").text(commentFormat(money.getDividendStart()));
                commentAccordingToAccount(timeStep, account)
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
    var moneyBirthStep = money.toTimeStep(money.moneyBirth, money.YEAR);
    if (timeStep == moneyBirthStep) {
        d3.selectAll("div.NoUD").style("display", "block");
    }
    else if (timeStep == moneyBirthStep + 1) {
        d3.selectAll("div.UD0").style("display", "block");
    }
    else if (money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.MONTH && (timeStep - moneyBirthStep) % 12 != 1) {
            d3.selectAll("div.UDM").style("display", "block");
    }
    else {
        d3.selectAll("div." + money.udFormulaKey).style("display", "block");
    }
}

function commentAccordingToMoneyBirth(timeStep) {
    d3.selectAll("div.MbComment").style("display", "none");
    var moneyBirthStep = money.toTimeStep(money.moneyBirth, money.YEAR);
    if (timeStep == moneyBirthStep) {
        d3.selectAll("div.MB").style("display", "block");
    }
    else {
        d3.selectAll("div.NoMB").style("display", "block");
    }
}

function commentAccordingToAccount(timeStep, account) {
    d3.selectAll(".AmountComment").style("display", "none");
    var pTimeStep = timeStep - 1;
    var moneyBirthStep = money.toTimeStep(money.moneyBirth, money.YEAR);
    var birthStep = money.toTimeStep(account.birth, money.YEAR);
    var deathStep = money.toTimeStep(account.birth + money.lifeExpectancy, money.YEAR);
    var udProductorClass = money.isCoCreator(account) ? 'CoCreator' : 'NonCreator';
    var coCreatorsClass = money.hasNoCoCreators() ? 'NoCreators' : 'CoCreators';
    d3.selectAll(".prodFactor.AtMoneyBirth").style("display", (timeStep == moneyBirthStep && money.prodFactor() == 12) ? null : "none");
    if (timeStep == moneyBirthStep) {
        var previousAverageMuValue = money.getAverage(pTimeStep);
        // Change 'id' to have a link to the corresponding account
        d3.select("#accountComment").selectAll("span.StartingPercentage").attr('id', function(d, i) { return 'sp' + i + '-' + account.id; });
        d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + NONBREAKING_SPACE + '%');
        d3.selectAll("span.AtMoneyBirth." + coCreatorsClass).style("display", "inline");
    }
    else if (timeStep == birthStep) {
        var previousAverageMuValue = money.getAverage(pTimeStep);
        // Change 'id' to have a link to the corresponding account
        d3.select("#accountComment").selectAll("span.StartingPercentage").attr('id', function(d, i) { return 'sp' + i + '-' + account.id; });
        d3.selectAll("span.average.previous.mu.value").text(commentFormat(previousAverageMuValue));
        d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + NONBREAKING_SPACE + '%');
        d3.selectAll("span.AtBirth." + coCreatorsClass).style("display", "inline");
    }
    else if (timeStep > deathStep) {
        d3.selectAll("span.AfterDeath." + udProductorClass).style("display", "inline");
    }
    else {
        d3.selectAll("span.WhenAlive." + udProductorClass).style("display", "inline");
    }

    var commentsMap = money.applyTransactions(timeStep, account);
    if (commentsMap.size > 0) {
        d3.selectAll("span.TransactionsDesc").style("display", "inline");
        d3.selectAll("span.TransactionsValuesDesc").style("display", "inline");
        d3.selectAll("span.TransactionsDesc").html(function (d, i) {
            var prefixId = 'ac' + account.id + 'td' + i;
            return Array.from(commentsMap.entries()).map(e=>transactionsDesc(prefixId, e[0], e[1])).join(' ');
        });
        d3.selectAll("span.TransactionsValuesDesc").html(function (d, i) {
            var prefixId = 'ac' + account.id + 'tvd' + i;
            return Array.from(commentsMap.entries()).map(e=>transactionsValuesDesc(prefixId, e[0], e[1])).join(' ');
        });
        initTransactionSpans();
    }
    else {
        d3.selectAll("span.TransactionsDesc").style("display", "none");
        d3.selectAll("span.TransactionsValuesDesc").style("display", "none");
    }
}

function initTransactionSpans() {
    d3.selectAll('span.transaction')
    .style('background-color', '#f1f1f1')
    .on('mouseover', function () {
        d3.select('#TransactionsTab').classed('focused', true);
        showTab('TransactionsTab');

        var paramElemId = d3.select(this).attr('id');
        if (paramElemId) {
            var modelId = + paramElemId.split('-')[1];
            setSelectorIndex('TransactionsTab', modelId);
            d3.selectAll('span.transaction').filter(function() { return this.id.endsWith('-' + modelId); })
                .style('background-color', '#dddddd');
        }
    })
    .on('mouseout', function () {
        d3.selectAll('span.transactionsTabLink').style('background-color', '#f1f1f1');
        d3.selectAll('span.transaction').style('background-color', '#f1f1f1');
        d3.select('#TransactionsTab').classed('focused', false);
        showTab(curTabId);
    })
    .on('click', function() {
        d3.select('#TransactionsTab').classed('focused', false);
        var paramElemId = d3.select(this).attr('id');
        if (paramElemId) {
            var modelId = + paramElemId.split('-')[1];
            setSelectorIndex('TransactionsTab', modelId);
            clickTab('TransactionsTab');
        }
    });
}

function transactionsDesc(prefixId, transaction, actualAmountMap) {
    var descrId = prefixId + '-' + transaction.id;
    var firstActualAmount = actualAmountMap.entries().next().value[1];
    var direction = (firstActualAmount<0) ? '- ' : '+ ';
    return direction + '<span id="${p0}" class="transaction name">${p1} ${p2}</span> (${p3} vers ${p4} : ${p5} ${p6})'
        .format(
            descrId,
            TRANSACTION_LABEL_PREFIX, 
            transaction.id, 
            accountName1(transaction.from), 
            accountName1(transaction.to), 
            transaction.amount, 
            getRefLabel(transaction.amountRef));

}

function transactionsValuesDesc(prefixId, transaction, actualAmountMap) {
    var descrId = prefixId + '-' + transaction.id;
    var firstActualAmount = actualAmountMap.entries().next().value[1];
    var direction = (firstActualAmount<0) ? '- ' : '+ ';
    var values; 
    if (actualAmountMap.size > 1) {
        values = '(' + Array.from(actualAmountMap.values()).map(a=>Math.abs(a)).join('+') + ')' ;
    }
    else {
        values = Math.abs(firstActualAmount);
    }
    return direction + '<span id="${p0}" class="transaction value">${p1}</span>'.format(descrId, values);
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

function changeConfiguration(configIdToSelect, configs) {
    curConfigId = configIdToSelect;
    if (curConfigId != 'none') {
        var jsonRep = configs[curConfigId];
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment("WorkshopsTab");
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

function changeTransactionSelection() {
    updateTransactionArea();
    pushNewHistoryState();
}

function changeTransactionSrcSelection() {
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.from = getTransAccounts()[getTransactionSrcIndex()];
    redrawCharts();
    unsetCurConfig();
    pushNewHistoryState();
}

function changeTransactionDestSelection() {
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.to = getTransAccounts()[getTransactionDestIndex()];
    redrawCharts();
    unsetCurConfig();
    pushNewHistoryState();
}

function changeTransactionYear() {
    var transactionYear = fromYearRep(parseInt(this.value));
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionYear >= 0 && transactionYear < 240) {
        selectedTransaction.year = transactionYear;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#TransactionYear').property("value", toYearRep(selectedTransaction.year));
    }
}

function changeTransactionRep() {
    var transactionRep = parseInt(this.value);
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionRep > 0 && transactionRep < money.toTimeStep(240, money.YEAR)) {
        selectedTransaction.repetitionCount = transactionRep;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#TransactionRep').property("value", selectedTransaction.repetitionCount);
    }
}

function changeTransactionAmount() {
    var transactionAmount = parseFloat(this.value);
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionAmount >= 0) {
        selectedTransaction.amount = transactionAmount;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#TransactionAmount').property("value", selectedTransaction.amount);
    }
}

function changeTransactionRefSelection() {
    var selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.amountRef = this.options[this.selectedIndex].value;
    redrawCharts();
    unsetCurConfig();
    pushNewHistoryState();
}

function clickAddTransaction() {
    addTransaction();
    pushNewHistoryState();
}

function clickDeleteTransaction() {
    deleteTransaction();
    pushNewHistoryState();
}

function changeReferenceFrame() {
    money.referenceFrameKey = this.options[this.selectedIndex].value;
    d3.select('#LogScale').property("checked", money.referenceFrames[money.referenceFrameKey].logScale);
        
    updateAccountYLabels();
    
    redrawCharts();
    unsetCurConfig();
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

function updateTimeXLabels() {
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
}

function changeUdFormula() {
    money.udFormulaKey = this.options[this.selectedIndex].value;
    redrawCharts();
    unsetCurConfig();
    comment(money.udFormulaKey);
    pushNewHistoryState();
}

function changeDemographicProfile() {
    money.demographicProfileKey = this.options[this.selectedIndex].value;
    enableDemographyFields();
    redrawCharts();
    unsetCurConfig();
    comment(money.demographicProfileKey);
    pushNewHistoryState();
}

function changeRythm() {
    if (this.value === "byMonth") {
        money.growthStepUnit = money.MONTH;
    	money.growth = parseFloat(document.getElementById('MonthlyGrowth').value) / 100;
    }
    else {
        money.growthStepUnit = money.YEAR;
    	money.growth = parseFloat(document.getElementById('AnnualGrowth').value) / 100;
    }
    rythmAndUD0Update.call(this);
}

function changeUd0Rythm() {
    if (this.value === "ud0ByMonth") {
        money.growthStepUnit = money.MONTH;
        money.prodStepUnit = money.MONTH;
    	money.growth = parseFloat(document.getElementById('MonthlyGrowth').value) / 100;
    }
    else if (this.value === "ud0ByYear") {
        money.growthStepUnit = money.YEAR;
        money.prodStepUnit = money.YEAR;
    	money.growth = parseFloat(document.getElementById('AnnualGrowth').value) / 100;
    }
    else {
        money.growthStepUnit = money.YEAR;
        money.prodStepUnit = money.MONTH;
    	money.growth = parseFloat(document.getElementById('AnnualGrowth').value) / 100;
    }
    rythmAndUD0Update.call(this);
}

function rythmAndUD0Update() {
    d3.select("input[value=\"byMonth\"]").property("checked", money.growthStepUnit === money.MONTH);
    d3.select("input[value=\"byYear\"]").property("checked", money.growthStepUnit === money.YEAR);
        
    d3.select("input[value=\"ud0ByMonth\"]").property("checked", money.growthStepUnit === money.MONTH && money.getProdStepUnit() === money.MONTH);
    d3.select("input[value=\"ud0ByYear\"]").property("checked", money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.YEAR);
    d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.MONTH);
        
    if (money.growthStepUnit === money.MONTH && money.getProdStepUnit() === money.MONTH) {
        money.dividendStart = parseFloat(document.getElementById('MonthlyDividendStart').value);
    }
    else if (money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.YEAR) {
        money.dividendStart = parseFloat(document.getElementById('AnnualDividendStart').value);
    }
    else {
        money.dividendStart = parseFloat(document.getElementById('YearMonthDividendStart').value);
    }

    updateTimeXLabels();
    
    enableGrowthForms(money.calculateGrowth);
    enableUD0Forms();
    redrawCharts();
    unsetCurConfig();
    comment(this.value);
    pushNewHistoryState();
}

function changeLifeExpectancy() {
    money.lifeExpectancy = parseInt(this.value);
    redrawCharts();
    unsetCurConfig();
    updateCalculateGrowth();
    pushNewHistoryState();
}

function changeAnnualGrowth() {
	money.growth = parseFloat(this.value) / 100;
    redrawCharts();
    unsetCurConfig();
    growthChanged();
    d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeMonthlyGrowth() {
	money.growth = parseFloat(this.value) / 100;
    redrawCharts();
    unsetCurConfig();
    growthChanged();
    d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeCalculateGrowth() {
    money.calculateGrowth = this.checked;
    
    enableGrowthForms(money.calculateGrowth);
    redrawCharts();
    unsetCurConfig();
    updateCalculateGrowth();
    comment(this.id);
    pushNewHistoryState();
}

function updateCalculateGrowth() {
    if (money.calculateGrowth) {
        d3.select('#AnnualGrowth').property("value", (money.getGrowth(money.YEAR) * 100).toFixed(2));
        d3.select('#MonthlyGrowth').property("value", (money.getGrowth(money.MONTH) * 100).toFixed(2));
        growthChanged();
    }
}

function growthChanged() {
    if (money.growthStepUnit === money.MONTH && money.getProdStepUnit() === money.MONTH) {
        d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR, money.YEAR)).toFixed(2));
        d3.select('#YearMonthDividendStart').property("value", (money.getDividendStart(money.YEAR, money.MONTH)).toFixed(2));
    }
    else if (money.growthStepUnit === money.YEAR && money.getProdStepUnit() === money.YEAR) {
        d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH, money.MONTH)).toFixed(2));
        d3.select('#YearMonthDividendStart').property("value", (money.getDividendStart(money.YEAR, money.MONTH)).toFixed(2));
    }
    else {
        d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR, money.YEAR)).toFixed(2));
        d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH, money.MONTH)).toFixed(2));
    }
}

function changeAnnualDividendStart() {
    money.dividendStart = parseFloat(this.value);
    redrawCharts();
    unsetCurConfig();
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH, money.MONTH)).toFixed(2));
    d3.select('#YearMonthDividendStart').property("value", (money.getDividendStart(money.YEAR, money.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeMonthlyDividendStart() {
    money.dividendStart = parseFloat(this.value);
    redrawCharts();
    unsetCurConfig();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR, money.YEAR)).toFixed(2));
    d3.select('#YearMonthDividendStart').property("value", (money.getDividendStart(money.YEAR, money.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeYearMonthDividendStart() {
    money.dividendStart = parseFloat(this.value);
    redrawCharts();
    unsetCurConfig();
    d3.select('#AnnualDividendStart').property("value", (money.getDividendStart(money.YEAR, money.YEAR)).toFixed(2));
    d3.select('#MonthlyDividendStart').property("value", (money.getDividendStart(money.MONTH, money.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeLogScale() {
    money.referenceFrames[money.referenceFrameKey].logScale = !money.referenceFrames[money.referenceFrameKey].logScale
    
    updateAccountYLabels();
    
    redrawCharts();
    unsetCurConfig();
    comment(this.id);
    pushNewHistoryState();
}

function changeStepCurves() {
    if (this.checked) {
        curveType = STEP_AFTER_CURVE;
    }
    else {
        curveType = LINEAR_CURVE;
    }
    
    redrawCharts();
    unsetCurConfig();
    comment(this.id);
    pushNewHistoryState();
}

function changeTimeLowerBound() {
    var timeLowerBound = fromYearRep(parseInt(this.value));
    if (timeLowerBound >= 0 && timeLowerBound < 240) {
        var oldTimeBounds = { lower: money.getTimeLowerBound(money.YEAR), upper: money.getTimeUpperBound(money.YEAR) };
        money.setTimeLowerBound(timeLowerBound); 
        updateZoom(oldTimeBounds);
        unsetCurConfig();
        d3.select('#TimeUpperBound').property("value", toYearRep(money.getTimeUpperBound(money.YEAR)));
        pushNewHistoryState();
    }
    else {
        d3.select('#TimeLowerBound').property("value", toYearRep(money.getTimeLowerBound(money.YEAR)));
    }
}

function changeTimeUpperBound() {
    var timeUpperBound = fromYearRep(parseInt(this.value));
    if (timeUpperBound > 0 && timeUpperBound <= 240) {
        var oldTimeBounds = { lower: money.getTimeLowerBound(money.YEAR), upper: money.getTimeUpperBound(money.YEAR) };
        money.setTimeUpperBound(timeUpperBound); 
        updateZoom(oldTimeBounds);
        unsetCurConfig();
        d3.select('#TimeLowerBound').property("value", toYearRep(money.getTimeLowerBound(money.YEAR)));
        pushNewHistoryState();
    }
    else {
        d3.select('#TimeUpperBound').property("value", toYearRep(money.getTimeUpperBound(money.YEAR)));
    }
}

function changeMaxDemography() {
    var maxDemography = parseInt(this.value);
    if (maxDemography >= 0 && maxDemography < 1000000) {
        money.maxDemography = maxDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#MaxDemography').property("value", money.maxDemography);
    }
}

function changeXMinDemography() {
    var xMinDemography = fromYearRep(parseInt(this.value));
    if (xMinDemography >= 0 && xMinDemography < 240) {
        money.xMinDemography = xMinDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#xMinDemography').property("value", toYearRep(money.xMinDemography));
    }
}

function changeXMaxDemography() {
    var xMaxDemography = fromYearRep(parseInt(this.value));
    if (xMaxDemography >= 1 && xMaxDemography < 239) {
        money.xMaxDemography = xMaxDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#xMaxDemography').property("value", toYearRep(money.xMaxDemography));
    }
}

function changeXMpvDemography() {
    var xMpvDemography = fromYearRep(parseInt(this.value));
    if (xMpvDemography >= 1 && xMpvDemography < 239) {
        money.xMpvDemography = xMpvDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#xMpvDemography').property("value", toYearRep(money.xMpvDemography));
    }
}

function changePlateauDemography() {
    var plateauDemography = parseInt(this.value);
    if (plateauDemography >= 0 && plateauDemography < 239) {
        money.plateauDemography = plateauDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#plateauDemography').property("value", money.plateauDemography);
    }
}

function changeXScaleDemography() {
    var xScaleDemography = parseFloat(this.value);
    if (xScaleDemography > 0) {
        money.xScaleDemography = xScaleDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#xScaleDemography').property("value", money.xScaleDemography);
    }
}

function changeAccountBirth() {
    var birth = fromYearRep(parseInt(this.value));
    var selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (birth >= 0 && birth < 240) {
        selectedAccount.birth = birth;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#AccountBirth').property("value", toYearRep(selectedAccount.birth));
    }
}

function changeAccountDuration() {
    var duration = parseInt(this.value);
    var selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (duration > 0 && duration <= 120) {
        selectedAccount.duration = duration;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#AccountDuration').property("value", selectedAccount.duration);
    }
}

function changeAccountType() {
    var selectedAccount = money.getAccount(getSelectedAccountIndex());
    selectedAccount.type = this.options[this.selectedIndex].value;
    
    joinAccountSelectorsToData();
    redrawCharts();
    unsetCurConfig();
    
    comment(this.id);
    pushNewHistoryState();
}

function changeStartingPercentage() {
    var startingPercentage = parseFloat(this.value);
    var selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (startingPercentage >= 0) {
        selectedAccount.startingPercentage = startingPercentage;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select('#StartingPercentage').property("value", selectedAccount.startingPercentage);
    }
}

function getCurConfigJsonRep() {
    for (var i = 0; i < workshops.length; i++) {
        if (Object.keys(workshops[i].jsonRep).indexOf(curConfigId) != -1) {
            return workshops[i].jsonRep[curConfigId];
        }
    }
    throw new Error("Configuration not managed: " + curConfigId);
}

function clickTab(tabId) {
    openTab(tabId);
    if (tabId == "WorkshopsTab" && curConfigId != "none") {
        var jsonRep = getCurConfigJsonRep();
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment(tabId);
    }
    pushNewHistoryState();
    
    return false;
}

function clickParamInput(tabId, paramId) {
    openTab(tabId);
    document.getElementById(paramId).focus();
    comment(paramId);
    pushNewHistoryState();
}

function setSelectorIndex(tabId, modelId) {
    if (tabId == "AccountsTab") {
        var toSelectIndex = money.accountIndex(modelId);
        if (document.getElementById("AccountSelector").selectedIndex != toSelectIndex) {
            document.getElementById("AccountSelector").selectedIndex = toSelectIndex;
            updateAddedAccountArea();
        }
    }
    if (tabId == "TransactionsTab") {
        var toSelectIndex = money.transactionIndex(modelId);
        if (document.getElementById("TransactionSelector").selectedIndex != toSelectIndex) {
            document.getElementById("TransactionSelector").selectedIndex = toSelectIndex;
            updateTransactionArea();
        }
    }
}

