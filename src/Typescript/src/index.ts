/**
 * Created by vit on 14/10/16.
 */
 
const PADDING = {
    top: 15,
    right: 30,
    bottom: 80,
    left: 70
};
const SIZE = {
    height: 320,
    width: 500
}

const RANGE = {
    min: {
        x: new Date(1999, 0, 1),
        y: 0
    },
    max: {
        x: new Date(2001, 0, 1),
        y: 1
    }
};

const TRANSITION_DURATION = 1000;

const EXP_FORMATS: {[s: string]: string} = {
    "y": "-24",
    "z": "-21",
    "a": "-18",
    "f": "-15",
    "p": "-12",
    "n": "-9",
    "µ": "-6",
    "m": "-3",
    "k": "3",
    "M": "6",
    "G": "9",
    "T": "12",
    "P": "15",
    "E": "18",
    "Z": "21",
    "Y": "24"
}

const NONBREAKING_SPACE = String.fromCharCode(0xA0);

const DATE_PATTERN = "%d-%m-%Y";

const LINEAR_CURVE = "L";

const STEP_AFTER_CURVE = "SA";

const LOG_UNIT_SUFFIX = " [log]";

const AVERAGE_ID = "average";

const ACCOUNT_ID_PREFIX = "account";

const STABLE_AVERAGE_ID = "stableAverage";

const DIVIDEND_ID = "dividend";

const STABLE_DIVIDEND_ID = "stableDividend";

const HEADCOUNT_ID = "headcount";

const MONETARY_SUPPLY_ID = "monetarySupply";

const STABLE_MONETARY_SUPPLY_ID = "stableMonetarySupply";

const ACCOUNT_COLORS = d3.schemeCategory10;

const AVERAGE_COLOR = "#e6550d";

const STABLE_AVERAGE_COLOR = "#fdae6b";

const ACCOUNT_CHART_COLORS = ACCOUNT_COLORS.slice();
ACCOUNT_CHART_COLORS.unshift(AVERAGE_COLOR, STABLE_AVERAGE_COLOR);

const DIVIDEND_COLOR = "#31a354";

const STABLE_DIVIDEND_COLOR = "#bd9e39";

const HEADCOUNT_COLOR = "#17becf";

const MONETARY_SUPPLY_COLOR = "#9467bd";

const STABLE_MONETARY_SUPPLY_COLOR = "#ff9896";

const AVERAGE_LABEL = "Moyenne \"M/N\"";

const STABLE_AVERAGE_LABEL = "M/N" + NONBREAKING_SPACE + "pleine";

const DIVIDEND_LABEL = "Dividende Universel";

const STABLE_DIVIDEND_LABEL = "DU pleine";

const HEADCOUNT_LABEL = "Nombre d'individus \"N\"";

const MONETARY_SUPPLY_LABEL = "Masse Monétaire \"M\"";

const STABLE_MONETARY_SUPPLY_LABEL = "Masse pleine";

const ACCOUNT_LABEL_PREFIX = "Compte";

const CO_CREATOR_LABEL = "Co-créateur";

const NON_CREATOR_LABEL = "Non-créateur";

const COMMUNITY_LABEL = "Commun";

const TRANSACTION_LABEL_PREFIX = "Transaction";

const ALL_ACCOUNTS_LABEL = "Tous";

function after(
    selection: d3.Selection<HTMLElement, any, HTMLElement, any>, 
    tagName: string
) {
    const elements: d3.BaseType[] = [];

    selection.each(function () {
        if (this.parentNode) {
            const element = document.createElement(tagName);
            this.parentNode.insertBefore(element, this.nextSibling);
            elements.push(element);
        }
    });

    return d3.selectAll(elements);
}

function before(
    selection: d3.Selection<HTMLElement, any, HTMLElement, any>, 
    tagName: string
) {
    const elements: d3.BaseType[] = [];

    selection.each(function () {
        if (this.parentNode) {
            const element = document.createElement(tagName);
            this.parentNode.insertBefore(element, this);
            elements.push(element);
        }
    });

    return d3.selectAll(elements);
}

// Create instance context
const money = new LibreCurrency();

let accountsChart: Chart;
let dividendChart: Chart;
let headcountChart: Chart;
let monetarySupplyChart: Chart;

const workshops: Workshop[] = [
    {
        jsonRep: configs1,
        selectorId: "ConfigSelector1"
    }, 
    {
        jsonRep: configs2,
        selectorId: "ConfigSelector2"
    }, 
    {
        jsonRep: configs3,
        selectorId: "ConfigSelector3"
    }, 
    {
        jsonRep: configs4,
        selectorId: "ConfigSelector4"
    }, 
    {
        jsonRep: configs5,
        selectorId: "ConfigSelector5"
    }];

let curConfigId = "";
let curTabId = "";
let curSelectedDataId = "";
let selectedPointIndex = -1;
let commentedId = "";
let curveType = LINEAR_CURVE;
let paramBgColor: string;

window.addEventListener("popstate", function(e) {
    const encodedURI = e.state;

    if (encodedURI !== null) {
        applyEncodedURI(encodedURI);
    }
});

initSelectors();

addTabEffectsFromHtml();
addParamLinksFromHtml();

generateC3Charts();

if (!applyEncodedURIFromLocation()) {
    applyJSonRep(configs1.cS0 as JSonRep);
    unsetCurConfig();
    openTab("WorkshopsTab");
    comment("WorkshopsTab");
    const encodedURI = asEncodedURI();
    window.history.replaceState(encodedURI, "", "?" + encodedURI);
}

addConfigLinksFromHtml();
addChartEffectsFromHtml();
initCallbacks();

// Add date value buttons
after(d3.selectAll(".dateValue"), "span")
    .attr("class", "increaseDate")
    .text("+")
    .on("mousedown", function() {
        d3.event.preventDefault();
        changeTimeStep(1);
    });

before(d3.selectAll(".dateValue"), "span")
    .attr("class", "decreaseDate")
    .text("-")
    .on("mousedown", function() {
        d3.event.preventDefault();
        changeTimeStep(-1);
    });

function changeTimeStep(offset: number) {
    const toSelectIndex = selectedPointIndex + offset;
    if (toSelectIndex >= 0) {
        const curChart = searchChartWithData(curSelectedDataId);
        const upperBound = curChart.getData(curSelectedDataId)[0].points.length;
        if (toSelectIndex < upperBound) {
            commentChartData(curChart, curSelectedDataId, toSelectIndex);
            pushNewHistoryState();
        }
    }
}

// Fill the forms
function fillForms() {
    d3.select("#LifeExpectancy").property("value", money.lifeExpectancy);
    d3.select("#AnnualDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
    d3.select("#MonthlyDividendStart").property("value", (money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
    d3.select("#YearMonthDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
    d3.select("#TimeLowerBound").property("value", toYearRep(money.timeLowerBoundInYears));
    d3.select("#TimeUpperBound").property("value", toYearRep(money.timeUpperBoundInYears));
    d3.select("#CalculateGrowth").property("checked", money.calculateGrowth);
    d3.select("#LogScale").property("checked", LibreCurrency.referenceFrames[money.referenceFrameKey].logScale);
    d3.select("#StepCurves").property("checked", curveType === STEP_AFTER_CURVE);
    d3.select("input[value=\"byMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.MONTH);
    d3.select("input[value=\"byYear\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR);
    d3.select("input[value=\"ud0ByMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.MONTH && money.getProdStepUnit() === LibreCurrency.MONTH);
    d3.select("input[value=\"ud0ByYear\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.YEAR);
    d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.MONTH);
    d3.select("#MaxDemography").property("value", money.maxDemography);
    d3.select("#xMinDemography").property("value", toYearRep(money.xMinDemography));
    d3.select("#xMaxDemography").property("value", toYearRep(money.xMaxDemography));
    d3.select("#xMpvDemography").property("value", toYearRep(money.xMpvDemography));
    d3.select("#plateauDemography").property("value", money.plateauDemography);
    d3.select("#xScaleDemography").property("value", money.xScaleDemography);
    d3.select("#AnnualGrowth").property("value", (money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
    d3.select("#MonthlyGrowth").property("value", (money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
}

function toYearRep(value: number) {
    return 1999 + value;
}

function fromYearRep(value: number) {
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
    const paramIdList = ["LifeExpectancy", "growth", "AnnualGrowth", "MonthlyGrowth", "UD0", "StartingPercentage", "ReferenceFrameSelector"/*, "CalculateGrowth", "AnnualDividendStart", "YearMonthDividendStart", "MonthlyDividendStart", "TimeUpperBound", "StepCurves"*/];
    
    paramIdList.forEach(function(paramId) {
        d3.selectAll("span." + paramId + ".ParamLink")
            .style("background-color", "#f1f1f1")
            .on("mouseover", function () {
                const adaptedParamId = adaptParamId(paramId);
                const tabId = getParentTabContentId(adaptedParamId) + "Tab";

                d3.selectAll("span." + paramId + ".ParamLink").style("background-color", "#DDDD00");
                d3.select("#" + tabId).classed("focused", true);

                paramBgColor = d3.select("#" + adaptedParamId).style("background-color")
                d3.select("#" + adaptedParamId).style("background-color", "#DDDD00");
                showTab(tabId);

                const paramElemId = d3.select(this).attr("id");
                if (paramElemId) {
                    const modelId = + paramElemId.split("-")[1];
                    setSelectorIndex(tabId, modelId);
                }
            })
            .on("mouseout", function () {
                const adaptedParamId = adaptParamId(paramId);
                const tabId = getParentTabContentId(adaptedParamId) + "Tab";

                d3.selectAll("span." + paramId + ".ParamLink").style("background-color", "#f1f1f1");
                d3.select("#" + tabId).classed("focused", false);

                d3.select("#" + adaptedParamId).style("background-color", paramBgColor);
                showTab(curTabId);
            })
            .on("click", function() {
                const adaptedParamId = adaptParamId(paramId);
                const tabId = getParentTabContentId(adaptedParamId) + "Tab";
                d3.select("#" + tabId).classed("focused", false);
                clickParamInput(tabId, adaptedParamId);
            });
    });
}

function getParentTabContentId(id: string) {
    const param = d3.select<HTMLDivElement, unknown>("#" + id);
    const paramNode = param.node();
    if (paramNode === null) {
        throw new Error("No node with id:#" + id);
    }
    if (paramNode.parentNode === null) {
        throw new Error("No parent for node with id:#" + id);
    }
    // @ts-ignore
    let parent = d3.select<HTMLDivElement, unknown>(paramNode.parentNode);
    while (!parent.classed("tabcontent")) {
        const parentNode = parent.node();
        if (parentNode === null) {
            throw new Error("Unexpected empty selection searching ancester for:#" + id);
        }
        if (parentNode.parentNode === null) {
            throw new Error("No 'tabcontent' parent for id:#" + id);
        }
        // @ts-ignore
        parent = d3.select(parentNode.parentNode);
    }
    const parentNode = parent.node();
    if (parentNode === null) {
        throw new Error("Unexpected empty selection searching ancester for:#" + id);
    }
    return parentNode.id;
}

function adaptParamId(id: string) {
    switch (id) {
        case "UD0":
            if (money.growthStepUnit === LibreCurrency.MONTH && money.getProdStepUnit() === LibreCurrency.MONTH) {
                return "MonthlyDividendStart";
            }
            else if (money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.YEAR) {
                return "AnnualDividendStart";
            }
            else {
                return "YearMonthDividendStart";
            }
        case "growth":
            if (money.growthStepUnit === LibreCurrency.MONTH) {
                return "MonthlyGrowth";
            }
            else {
                return "AnnualGrowth";
            }
        default:
            break;
    }
    return id;
}

// eslint-disable-next-line max-lines-per-function
function addTabEffectsFromHtml() {
    const workshopsTabAttributes = {
        tabId: "WorkshopsTab",
        referingClass: "workshopsTabLink"
    };
    const growthTabAttributes = {
        tabId: "GrowingRateTab",
        referingClass: "growthTabLink"
    };
    const udTabAttributes = {
        tabId: "UniversalDividendTab",
        referingClass: "dividendTabLink"
    };
    const referenceTabAttributes = {
        tabId: "ReferenceTab",
        referingClass: "referenceTabLink"
    };
    const displayTabAttributes = {
        tabId: "DisplayTab",
        referingClass: "DisplayTabLink"
    };
    const accountsTabAttributes = {
        tabId: "AccountsTab",
        referingClass: "accountsTabLink"
    };
    const demographyTabAttributes = {
        tabId: "DemographyTab",
        referingClass: "demographyTabLink"
    };
    const transactionsTabAttributes = {
        tabId: "TransactionsTab",
        referingClass: "transactionsTabLink"
    };
    const tabAttributesList = [workshopsTabAttributes, growthTabAttributes, udTabAttributes, referenceTabAttributes, displayTabAttributes, accountsTabAttributes, demographyTabAttributes, transactionsTabAttributes];
    
    tabAttributesList.forEach(function(tabAttributes) {
        d3.selectAll("span." + tabAttributes.referingClass)
            .style("background-color", "#f1f1f1")
            .on("mouseover", function () {
                d3.selectAll("span." + tabAttributes.referingClass).style("background-color", "#dddddd");
                d3.select("#" + tabAttributes.tabId).classed("focused", true);
                showTab(tabAttributes.tabId);
            })
            .on("mouseout", function () {
                d3.selectAll("span." + tabAttributes.referingClass).style("background-color", "#f1f1f1");
                d3.select("#" + tabAttributes.tabId).classed("focused", false);
                showTab(curTabId);
            })
            .on("click", function() {
                d3.select("#" + tabAttributes.tabId).classed("focused", false);
                clickTab(tabAttributes.tabId);
            });
    });
    initTransactionSpans();    
}

function addConfigLinksFromHtml() {
    for (let i = 0; i < workshops.length; i++) {
        const workshopJSonRep = workshops[i].jsonRep;
        Object.keys(workshopJSonRep).forEach(function(key) {
            const configIdToSelect = key;
            d3.selectAll(".configLink." + key).on("click", function() {
                changeConfiguration(configIdToSelect, workshopJSonRep);
            });
        });
    }
}

// eslint-disable-next-line max-lines-per-function
function addChartEffectsFromHtml() {

    const accountSerieAttributes: SerieAttributes = {
        class: ACCOUNT_ID_PREFIX,
        color: ACCOUNT_COLORS[0], // Special case => not used
        chart: accountsChart
    };
    const averageSerieAttributes: SerieAttributes = {
        class: AVERAGE_ID,
        color: AVERAGE_COLOR,
        chart: accountsChart
    };
    const stableAverageSerieAttributes: SerieAttributes = {
        class: STABLE_AVERAGE_ID,
        color: STABLE_AVERAGE_COLOR,
        chart: accountsChart
    };
    const dividendSerieAttributes: SerieAttributes = {
        class: DIVIDEND_ID,
        color: DIVIDEND_COLOR,
        chart: dividendChart
    };
    const stableDividendSerieAttributes: SerieAttributes = {
        class: STABLE_DIVIDEND_ID,
        color: STABLE_DIVIDEND_COLOR,
        chart: dividendChart
    };
    const headcountSerieAttributes: SerieAttributes = {
        class: HEADCOUNT_ID,
        color: HEADCOUNT_COLOR,
        chart: headcountChart
    };
    const monetarySupplySerieAttributes: SerieAttributes = {
        class: MONETARY_SUPPLY_ID,
        color: MONETARY_SUPPLY_COLOR,
        chart: monetarySupplyChart
    };
    const stableMonetarySupplySerieAttributes: SerieAttributes = {
        class: STABLE_MONETARY_SUPPLY_ID,
        color: STABLE_MONETARY_SUPPLY_COLOR,
        chart: monetarySupplyChart
    };
    const serieAttributesList = [accountSerieAttributes, averageSerieAttributes, stableAverageSerieAttributes, dividendSerieAttributes, stableDividendSerieAttributes, headcountSerieAttributes, monetarySupplySerieAttributes, stableMonetarySupplySerieAttributes];

    function isLinkedValue(serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>) {
        return (serieSpan.classed("current") && !serieSpan.classed("nolink"))
            || serieSpan.classed("previous")
            || serieSpan.classed("previous2");
    }
        
    function getIndexToSelect(
        serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
        targetedSerieId: string
    ) {
        let indexToSelect = selectedPointIndex;

        // Depending on the targeted serie, an offset must be applied (especially for 'account' series)
        if (targetedSerieId !== curSelectedDataId) {
            const curSelectedData = searchChartWithData(curSelectedDataId).getData(curSelectedDataId)[0];
            const targetedData = searchChartWithData(targetedSerieId).getData(targetedSerieId)[0];
            for (let j = 0; j < targetedData.points.length; j++) {
                if (targetedData.points[j][0].getTime() === curSelectedData.points[selectedPointIndex][0].getTime()) {
                    indexToSelect = j;
                    break;
                }
            }
        }

        if (serieSpan.classed("current")) {
            return indexToSelect;
        }
        else if (serieSpan.classed("previous")) {
            return indexToSelect - 1;
        }
        else if (serieSpan.classed("previous2")) {
            return money.previousGrowthStep(indexToSelect - 1);
        }
        return -1;
    }
        
    function getSerieAttributes(serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>) {
        for (let i = 0; i < serieAttributesList.length; i++) {
            if (serieSpan.classed(serieAttributesList[i].class)) {
                return serieAttributesList[i];
            }
        }
        throw new Error("Serie class not found: " + serieSpan);
    }

    function getReferenceFrameKey(serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>) {
        if (serieSpan.classed("mu")) {
            return LibreCurrency.MONETARY_UNIT_REF_KEY;
        }
        else if (serieSpan.classed("ud")) {
            return LibreCurrency.DIVIDEND_REF_KEY;
        }
        else if (serieSpan.classed("mn")) {
            return LibreCurrency.AVERAGE_REF_KEY;
        }
        throw Error("Span with unexpected class:" + serieSpan.attr("class"));
    }
        
    function clickSerieValue(serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>) {
        const referenceFrameKey = getReferenceFrameKey(serieSpan);
        const clickedSerieAttributes = getSerieAttributes(serieSpan);
        const clickedSerieId = getTargetedSerieId(serieSpan, clickedSerieAttributes);
        const curSelectedData = searchChartWithData(curSelectedDataId).getData(curSelectedDataId)[0];
        const selectedPointTime = curSelectedData.points[selectedPointIndex][0].getTime();
        
        if (LibreCurrency.referenceFrames[money.referenceFrameKey].logScale) {
            d3.select("#LogScale").property("checked", false);
        }
        if (referenceFrameKey && money.referenceFrameKey !== referenceFrameKey) {
            money.referenceFrameKey = referenceFrameKey;
            setReferenceFrameSelection();
        }
        updateAccountYLabels();
        redrawCharts();
        unsetCurConfig();

        // Since new chart data are computed, search index to select 
        const clickedData = searchChartWithData(clickedSerieId).getData(clickedSerieId)[0];
        let indexToSelect = d3.bisectLeft(clickedData.points.map(p => p[0].getTime()), selectedPointTime);
        if (serieSpan.classed("previous")) {
            indexToSelect = indexToSelect - 1;
        }
        else if (serieSpan.classed("previous2")) {
            indexToSelect = money.previousGrowthStep(indexToSelect - 1);
        }

        commentChartData(clickedSerieAttributes.chart, clickedSerieId, indexToSelect);
        pushNewHistoryState();
    }

    function getTargetedSerieId(
        serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
        serieAttributes: SerieAttributes
    ) {
        const serieClass = serieAttributes.class;
        if (serieClass === ACCOUNT_ID_PREFIX) {
            const accountElemId = serieSpan.attr("id");
            if (accountElemId) {
                const accountId = + accountElemId.split("-")[1];
                return c3IdFromAccountId(accountId);
            }
            else {
                return curSelectedDataId;
            }
        }
        return serieClass;
    }

    function getSerieColor(
        serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
        serieAttributes: SerieAttributes
    ) {
        if (serieAttributes.class === ACCOUNT_ID_PREFIX) {
            const accountElemId = serieSpan.attr("id");
            if (accountElemId) {
                const accountId = + accountElemId.split("-")[1];
                return ACCOUNT_COLORS[accountId - 1];
            }
            else {
                return serieSpan.style("color");
            }
        }
        return serieAttributes.color;
    }

    function mouseoverSerieSpan(
        serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
        serieAttributes: SerieAttributes
    ) {
        const targetedSerieId = getTargetedSerieId(serieSpan, serieAttributes);
        // Highlight specified targets and fade out the others.
        serieAttributes.chart.focus(targetedSerieId);

        if (isLinkedValue(serieSpan)) {
            const toSelectIndex = getIndexToSelect(serieSpan, targetedSerieId);
            if (toSelectIndex >= 0) {
                serieAttributes.chart.reference(targetedSerieId, toSelectIndex);
            }
        }
    }

    function mouseoutSerieSpan(
        _serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
        serieAttributes: SerieAttributes
    ) {
        // Revert highlighted and faded out targets
        serieAttributes.chart.revert();
        // Remove point reference
        serieAttributes.chart.unreference();
    }

    serieAttributesList.forEach(function(serieAttributes) {
        d3.selectAll<HTMLSpanElement, unknown>("span." + serieAttributes.class)
            .style("color", function () {
                return getSerieColor(d3.select(this), serieAttributes);
            })
            .on("mouseover", function () {
                mouseoverSerieSpan(d3.select(this), serieAttributes);
            })
            .on("mouseout", function () {
                mouseoutSerieSpan(d3.select(this), serieAttributes);
            });
    });
        
    d3.selectAll<HTMLSpanElement, unknown>("span.current:not(.nolink), span.previous, span.previous2")
        .on("click", function() {
            clickSerieValue(d3.select(this));
        });
}

// eslint-disable-next-line max-lines-per-function
function initCallbacks() {
    for (let i = 0; i < workshops.length; i++) {
        const workshopJSonRep = workshops[i].jsonRep;
        d3.select<HTMLSelectElement, unknown>("#" + workshops[i].selectorId).on("change", function() {
            changeConfiguration(this.options[this.selectedIndex].value, workshopJSonRep);
        });
    }
    d3.select<HTMLSelectElement, unknown>("#ReferenceFrameSelector").on("change", function() { changeReferenceFrame(this); });
    d3.select<HTMLSelectElement, unknown>("#UdFormulaSelector").on("change", function() { changeUdFormula(this); });
    d3.select<HTMLSelectElement, unknown>("#DemographySelector").on("change", function() { changeDemographicProfile(this); });
    d3.select<HTMLSelectElement, unknown>("#AccountSelector").on("change", function() { changeAccountSelection(); });
    d3.select<HTMLSelectElement, unknown>("#TransactionSelector").on("change", function() { changeTransactionSelection(); });
    d3.select<HTMLSelectElement, unknown>("#TransactionSrc").on("change", function() { changeTransactionSrcSelection(); });
    d3.select<HTMLSelectElement, unknown>("#TransactionDest").on("change", function() { changeTransactionDestSelection(); });
    d3.select<HTMLSelectElement, unknown>("#TransactionRef").on("change", function() { changeTransactionRefSelection(this); });
    
    d3.selectAll<HTMLInputElement, unknown>(".rythm").on("change", function() { changeRythm(this); });
    d3.selectAll<HTMLInputElement, unknown>(".ud0Rythm").on("change", function() { changeUd0Rythm(this); });

    d3.select("#AddAccount").on("click", clickAddAccount);
    d3.select("#DeleteAccount").on("click", clickDeleteAccount);

    d3.select("#AddTransaction").on("click", clickAddTransaction);
    d3.select("#DeleteTransaction").on("click", clickDeleteTransaction);

    d3.select<HTMLInputElement, unknown>("#LifeExpectancy").on("change", function() { changeLifeExpectancy(this); });
    d3.select<HTMLInputElement, unknown>("#AnnualGrowth").on("change", function() { changeAnnualGrowth(this); });
    d3.select<HTMLInputElement, unknown>("#MonthlyGrowth").on("change", function() { changeMonthlyGrowth(this); });
    d3.select<HTMLInputElement, unknown>("#CalculateGrowth").on("click", function() { changeCalculateGrowth(this); });
    d3.select<HTMLInputElement, unknown>("#AnnualDividendStart").on("change", function() { changeAnnualDividendStart(this); });
    d3.select<HTMLInputElement, unknown>("#MonthlyDividendStart").on("change", function() { changeMonthlyDividendStart(this); });
    d3.select<HTMLInputElement, unknown>("#YearMonthDividendStart").on("change", function() { changeYearMonthDividendStart(this); });
    d3.select<HTMLInputElement, unknown>("#LogScale").on("click", function() { changeLogScale(this); });
    d3.select<HTMLInputElement, unknown>("#StepCurves").on("click", function() { changeStepCurves(this); });
    d3.select<HTMLSelectElement, unknown>("#TimeLowerBound").on("change", function() { changeTimeLowerBound(this); });
    d3.select<HTMLSelectElement, unknown>("#TimeUpperBound").on("change", function() { changeTimeUpperBound(this); });
    d3.select<HTMLSelectElement, unknown>("#MaxDemography").on("change", function() { changeMaxDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#xMinDemography").on("change", function() { changeXMinDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#xMaxDemography").on("change", function() { changeXMaxDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#xMpvDemography").on("change", function() { changeXMpvDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#plateauDemography").on("change", function() { changePlateauDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#xScaleDemography").on("change", function() { changeXScaleDemography(this); });
    d3.select<HTMLSelectElement, unknown>("#AccountBirth").on("change", function() { changeAccountBirth(this); });
    d3.select<HTMLSelectElement, unknown>("#AccountDuration").on("change", function() { changeAccountDuration(this); });
    d3.select<HTMLSelectElement, unknown>("#TypeSelector").on("change", function() { changeAccountType(this); });
    d3.select<HTMLSelectElement, unknown>("#StartingPercentage").on("change", function() { changeStartingPercentage(this); });
    d3.select<HTMLInputElement, unknown>("#TransactionYear").on("change", function() { changeTransactionYear(this); });
    d3.select<HTMLInputElement, unknown>("#TransactionRep").on("change", function() { changeTransactionRep(this); });
    d3.select<HTMLInputElement, unknown>("#TransactionAmount").on("change", function() { changeTransactionAmount(this); });
    
    d3.selectAll<HTMLSpanElement, unknown>(".tablinks").on("click", function() { clickTab(this.id); });

    d3.selectAll<HTMLInputElement, unknown>("input[type=\"text\"]").on("click", function() { comment(this.id); });
}

function asEncodedURI() {
    const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
    if (accountSelector === null) {
        console.log("asEncodedURI, #AccountSelector not found");
    }

    const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
    if (transactionSelector === null) {
        console.log("asEncodedURI, #TransactionSelector not found");
    }

    const moneyAsJSon = money.asJSonRep();
    const guiAsJSon: GuiAsJSon = {
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
        a : accountSelector === null ? 0 : accountSelector.selectedIndex,
        tr : transactionSelector === null ? 0 : transactionSelector.selectedIndex,
        s : curSelectedDataId,
        i : selectedPointIndex,
        com : commentedId
    };
    const jsonRep: JSonRep = {
        m : moneyAsJSon,
        g : guiAsJSon
    };
    const stringRep = JSON.stringify(jsonRep);
    const encodedURI = LZString.compressToEncodedURIComponent(stringRep);
    return encodedURI;
}

function applyEncodedURIFromLocation() {
    if (window.location.search.length > 1) {
        const encodedURI = window.location.search.substr(1);
        return applyEncodedURI(encodedURI);
    }
    return false;
}

function applyEncodedURI(encodedURI: string) {
    const stringRep = LZString.decompressFromEncodedURIComponent(encodedURI);
    if (stringRep !== null && stringRep.length !== 0) {
        const jsonRep = JSON.parse(stringRep);
        applyJSonRep(jsonRep);
        return true;
    }
    return false;
}

function applyJSonRep(jsonRep: JSonRep) {
    // If current X range has changed, apply zoom first (except if no serie is already drawn)
    let zoomTransition;
    if (!d3.selectAll(".serieGroup").empty() && 
            ((money.timeLowerBoundInYears !== jsonRep.m.tm)
            || (money.timeUpperBoundInYears !== jsonRep.m.tM))) {
        const oldTimeBounds = { lower: money.getTimeLowerBound(LibreCurrency.YEAR), upper: money.getTimeUpperBound(LibreCurrency.YEAR) };
        money.setTimeLowerBound(jsonRep.m.tm); 
        money.setTimeUpperBound(jsonRep.m.tM);
        zoomTransition = updateZoom(oldTimeBounds);
    }
    if (zoomTransition) {
        zoomTransition
            .on("end", function(_p,j) {
                // If transition 0 is ended, no need to wait the others, they are virtually ended
                if (j === 0) {
                    // Finalize drawing (do a chained transition)  
                    applyJSonRepFinal(jsonRep);
                    const encodedURI = asEncodedURI();
                    window.history.replaceState(encodedURI, "", "?" + encodedURI);
                }
            });
    } else {
        applyJSonRepFinal(jsonRep);
    }
}

// eslint-disable-next-line max-lines-per-function
function applyJSonRepFinal(jsonRep: JSonRep) {
    const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
    if (accountSelector === null) {
        console.log("applyJSonRepFinal, #AccountSelector not found");
    }

    const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
    if (transactionSelector === null) {
        console.log("applyJSonRepFinal, #TransactionSelector not found");
    }

    curveType = jsonRep.g.ct;
    money.applyJSonRep(jsonRep.m);
    
    unselectChartPoints();
    fillForms();
    enableForms();

    joinAccountSelectorsToData();
    if (accountSelector !== null) {
        accountSelector.selectedIndex = jsonRep.g.a;
    }
    
    joinTransactionSelectorToData();
    if (transactionSelector !== null) {
        transactionSelector.selectedIndex = jsonRep.g.tr;
    }

    curConfigId = jsonRep.g.c;
    setConfigSelection();
    
    setReferenceFrameSelection();
    setUdFormulaSelection();
    setDemographySelection();
    
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
        const chart = searchChartWithData(jsonRep.g.s);
        commentChartData(chart, jsonRep.g.s, jsonRep.g.i);
    }
    else {
        comment(jsonRep.g.com);
    }
}
    
// Init the different selectors
function initSelectors() {
    for (let i = 0; i < workshops.length; i++) {
        feedConfigSelector(workshops[i]);
    }
    feedReferenceFrameSelectors();
    feedUdFormulaSelector();
    feedAccountTypeSelector();
    feedDemographySelector();
}

// Create configuration selector
function feedConfigSelector(workshop: Workshop) {
    d3.select("#" + workshop.selectorId).selectAll("option")
        .data(Object.keys(workshop.jsonRep))
      .enter().append("option")
        .text(function(d) { return getConfigLabel(d); })
        .attr("value", function(d) { return d; });
        
    d3.select("#" + workshop.selectorId).selectAll("option").filter(d => d === "none")
        .attr("disabled", true);
}

function setConfigSelection() {
    for (let i = 0; i < workshops.length; i++) {
        const selectedIndex = Object.keys(workshops[i].jsonRep).indexOf(curConfigId);
        if (selectedIndex !== -1) {
            const wsConfigSelector = document.getElementById(workshops[i].selectorId) as HTMLSelectElement;
            if (wsConfigSelector === null) {
                console.log("setConfigSelection, #", workshops[i].selectorId, " not found");
                continue;
            }
            wsConfigSelector.selectedIndex = selectedIndex;
            for (let j = 0; j < workshops.length; j++) {
                if (i === j) {
                    continue;
                }
                const curConfigSelector = document.getElementById(workshops[j].selectorId) as HTMLSelectElement;
                if (curConfigSelector === null) {
                    console.log("setConfigSelection, #", workshops[j].selectorId, " not found");
                }
                else {
                    curConfigSelector.selectedIndex = 0;
                }
            }
            return;
        }
    }
    console.log("Configuration not managed: " + curConfigId);
}

function unsetCurConfig() {
    curConfigId = "none";
    setConfigSelection();
}

// Create reference frame selectors
function feedReferenceFrameSelectors() {
    const referenceKeys = Object.keys(LibreCurrency.referenceFrames);
    feedReferenceFrameSelector(referenceKeys.slice(0, referenceKeys.length - 1), "ReferenceFrameSelector");
    feedReferenceFrameSelector(referenceKeys, "TransactionRef");
}

function feedReferenceFrameSelector(referenceKeys: string[], selectorId: string) {
    d3.select("#" + selectorId).selectAll("option")
        .data(referenceKeys)
      .enter().append("option")
        .text(function(d) { return getRefLabel(d); })
        .attr("value", function(d) { return d; });
}

function setReferenceFrameSelection() {
    const selectedIndex = Object.keys(LibreCurrency.referenceFrames).indexOf(money.referenceFrameKey);
    if (selectedIndex === -1) {
        throw new Error("Reference frame not managed: " + money.referenceFrameKey);
    }
    const refSelector = document.getElementById("ReferenceFrameSelector") as HTMLSelectElement;
    if (refSelector === null) {
        console.log("setReferenceFrameSelection, #ReferenceFrameSelector not found");
    }
    else {
        refSelector.selectedIndex = selectedIndex;
    }
}

// Create formula selector
function feedUdFormulaSelector() {
    d3.select("#UdFormulaSelector").selectAll("option")
        .data(Object.keys(LibreCurrency.udFormulas))
      .enter().append("option")
        .text(function(d) { return getUdFormulaLabel(d); })
        .attr("value", function(d) { return d; });
}

function setUdFormulaSelection() {
    const selectedIndex = Object.keys(LibreCurrency.udFormulas).indexOf(money.udFormulaKey);
    if (selectedIndex === -1) {
        throw new Error("Reference frame not managed: " + money.udFormulaKey);
    }
    const udFormulaSelector = document.getElementById("UdFormulaSelector") as HTMLSelectElement;
    if (udFormulaSelector === null) {
        console.log("setUdFormulaSelection, #UdFormulaSelector not found");
    }
    else {
        udFormulaSelector.selectedIndex = selectedIndex;
    }
}

// Create account type selector
function feedAccountTypeSelector() {
    d3.select("#TypeSelector").selectAll("option")
        .data(LibreCurrency.ACCOUNT_TYPES)
      .enter().append("option")
        .text(function(d) { return getAccountTypeLabel(d); })
        .attr("value", function(d) { return d; });
}

// Create demographic profile selector
function feedDemographySelector() {
    d3.select("#DemographySelector").selectAll("option")
        .data(Object.keys(LibreCurrency.demographicProfiles))
      .enter().append("option")
        .text(function(d) { return getDemographicProfileLabel(d); })
        .attr("value", function(d) { return d; });
}

function setDemographySelection() {
    const selectedIndex = Object.keys(LibreCurrency.demographicProfiles).indexOf(money.demographicProfileKey);
    if (selectedIndex === -1) {
        throw new Error("Reference frame not managed: " + money.demographicProfileKey);
    }
    const demographySelector = document.getElementById("DemographySelector") as HTMLSelectElement;
    if (demographySelector === null) {
        console.log("setDemographySelection, #DemographySelector not found");
    }
    else {
        demographySelector.selectedIndex = selectedIndex;
    }
}

// Join (via D3) account selectors to 'money.accounts'
function joinAccountSelectorsToData() {
    joinAccountSelectorToData("AccountSelector", money.accounts, accountName2);
    joinAccountSelectorToData("TransactionSrc", money.accounts, accountName1);
    joinAccountSelectorToData("TransactionDest", money.accounts, accountName1);
    // Add 'ALL_ACCOUNT' to the end of the transaction selectors
    joinAccountSelectorToData("TransactionSrc", getTransAccounts(), accountName1);
    joinAccountSelectorToData("TransactionDest", getTransAccounts(), accountName1);
}

function joinAccountSelectorToData(
    accountSelectorId: string, 
    accounts: MAccount[], 
    nameFunc: (account: MAccount) => string)
{
    const options = d3.select("#" + accountSelectorId)
        .selectAll<HTMLOptionElement, MAccount>("option")
        .data(accounts, function(d) { return d.id; });
            
    options.text(nameFunc);
    
    options.enter().append("option")
        .text(nameFunc)
        .attr("value", function(d) { return d.id; })
        
    options.exit().remove();
}

// Join (via D3) transaction selector to 'money.transactions'
function joinTransactionSelectorToData() {
    const options = d3.select("#TransactionSelector")
        .selectAll<HTMLOptionElement, Transaction>("option")
        .data(money.transactions, function(d) { return d.id; });
            
    options.text(function(d) { return transactionName(d); });
    
    options.enter().append("option")
        .text(function(d) { return transactionName(d); })
        .attr("value", function(d) { return d.id; })
        
    options.exit().remove();
}

// eslint-disable-next-line max-lines-per-function
function generateAccountsData() {
	const accountsData: SeriesData = {
        names: {
            "average": AVERAGE_LABEL,
            "stableAverage": STABLE_AVERAGE_LABEL
        },
        series: [],
        repTypes: {
            average: Chart.AREA,
            stableAverage: Chart.LINE
        },
        onclick: function(d, i) {
            commentChartData(accountsChart, d.id, i);
            pushNewHistoryState();
        }
    }

    const averageSerie: Serie = {
        id: AVERAGE_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.averages.x.length; i++) {
        averageSerie.points.push([asDate(money.averages.x[i]), money.averages.y[i]]);
    }
    accountsData.series.push(averageSerie);
    
    const stableAverageSerie: Serie = {
        id: STABLE_AVERAGE_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.stableAverages.x.length; i++) {
        stableAverageSerie.points.push([asDate(money.stableAverages.x[i]), money.stableAverages.y[i]]);
	}
    accountsData.series.push(stableAverageSerie);
    
    // Depending on X axis bounds, some accounts are not visible
    for (let iAccount = 0; iAccount < money.accounts.length; iAccount++) {
        const accountSerie: Serie = {
            id: c3IdFromAccountId(money.accounts[iAccount].id),
            points: [],
            linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        if (money.accounts[iAccount].x.length > 1) {
            for (let i = 0; i < money.accounts[iAccount].x.length; i++) {
                accountSerie.points.push([asDate(money.accounts[iAccount].x[i]), money.accounts[iAccount].y[i]]);
            }
            accountsData.series.push(accountSerie);
            accountsData.names[accountSerie.id] = accountName3(money.accounts[iAccount]);
            accountsData.repTypes[accountSerie.id] = Chart.LINE;
        }
    }

    return accountsData;
}

function unselectChartPoints() {
    curSelectedDataId = "";
    selectedPointIndex = -1;
    const charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    charts.forEach(function(c) {
        c.unselect();
    });
}

function generateDividendData() {
    const dividendData: SeriesData = {
        names: {
            "dividend": `${DIVIDEND_LABEL} (${universalDividendName()})`,
            "stableDividend": STABLE_DIVIDEND_LABEL
        },
        series: [],
        repTypes: {
            dividend: Chart.AREA,
            stableDividend: Chart.LINE
        },
        onclick: function(d, i) {
            commentChartData(dividendChart, d.id, i);
            pushNewHistoryState();
        }
    };

    const dividendSerie: Serie = {
        id: DIVIDEND_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.dividends.x.length; i++) {
        dividendSerie.points.push([asDate(money.dividends.x[i]), money.dividends.y[i]]);
    }
    dividendData.series.push(dividendSerie);
    
    const stableDividendSerie: Serie = {
        id: STABLE_DIVIDEND_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.stableDividends.x.length; i++) {
        stableDividendSerie.points.push([asDate(money.stableDividends.x[i]), money.stableDividends.y[i]]);
    }
    dividendData.series.push(stableDividendSerie);
    
    return dividendData;
}

function generateHeadcountData() {
    const headcountData: SeriesData = {
        names: {
            "headcount": HEADCOUNT_LABEL + " (" + getDemographicProfileLabel(money.demographicProfileKey) + ")"
        },
        series: [],
        repTypes: {
            headcount: Chart.AREA
        },
        onclick: function(d, i) {
            commentChartData(headcountChart, d.id, i);
            pushNewHistoryState();
        }
    };

    const headcountSerie: Serie = {
        id: HEADCOUNT_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.headcounts.x.length; i++) {
        headcountSerie.points.push([asDate(money.headcounts.x[i]), money.headcounts.y[i]]);
    }
    headcountData.series.push(headcountSerie);
    
    return headcountData;
}
    
function generateMonetarySupplyData() {
    const monetarySupplyData: SeriesData = {
        names: {
            "monetarySupply": MONETARY_SUPPLY_LABEL,
            "stableMonetarySupply": STABLE_MONETARY_SUPPLY_LABEL
        },
        series: [],
        repTypes: {
            monetarySupply: Chart.AREA,
            stableMonetarySupply: Chart.LINE
        },
        onclick: function(d, i) {
            commentChartData(monetarySupplyChart, d.id, i);
            pushNewHistoryState();
        }
    };

    const monetarySupplySerie: Serie = {
        id: MONETARY_SUPPLY_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.monetarySupplies.x.length; i++) {
        monetarySupplySerie.points.push([asDate(money.monetarySupplies.x[i]), money.monetarySupplies.y[i]]);
    }
    monetarySupplyData.series.push(monetarySupplySerie);
    
    const stableMonetarySupplySerie: Serie = {
        id: STABLE_MONETARY_SUPPLY_ID,
        points: [],
        linkType: (curveType === LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
    };
	for (let i = 0; i < money.stableMonetarySupplies.x.length; i++) {
        stableMonetarySupplySerie.points.push([asDate(money.stableMonetarySupplies.x[i]), money.stableMonetarySupplies.y[i]]);
    }
    monetarySupplyData.series.push(stableMonetarySupplySerie);
    
	return monetarySupplyData;
}

function c3IdFromAccountId(accountId: number) {
    return ACCOUNT_ID_PREFIX + accountId;
}

function idFromC3AccountId(c3AccountId: string) {
    if (c3AccountId.substr(0, ACCOUNT_ID_PREFIX.length) === ACCOUNT_ID_PREFIX) {
        return parseInt(c3AccountId.substring(ACCOUNT_ID_PREFIX.length), 10);
    }
    throw new Error(c3AccountId + " doesn't start with the expected prefix: " + ACCOUNT_ID_PREFIX);
}

// eslint-disable-next-line max-lines-per-function, complexity
function getConfigLabel(configKey: string) {
    let configLabel;
    switch(configKey) {
        case "none":
            configLabel = "Sélectionnez...";
            break;
        case "cS0":
            configLabel = "Départ à 0";
            break;
        case "cSMN":
            configLabel = "Départ à DU0/c";
            break;
        case "cX40":
            configLabel = "Vue sur 40 ans";
            break;
        case "cNOSTEP":
            configLabel = "Sans escalier";
            break;
        case "cS0-M":
            configLabel = "Départ à 0 (mois)";
            break;
        case "cSMN-M":
            configLabel = "Départ à DU0/c (mois)";
            break;
        case "cS0-YM":
            configLabel = "Départ à 0 (an/mois)";
            break;
        case "c2CC":
            configLabel = "2nd co-créateur";
            break;
        case "cCAUCHY":
            configLabel = "Profil pour N";
            break;
        case "c4DATES":
            configLabel = "4 dates d'entrée";
            break;
        case "cLMU1":
            configLabel = "Prêt en UM (V1)";
            break;
        case "cLMU2":
            configLabel = "Prêt en UM (V2)";
            break;
        case "cLUD":
            configLabel = "Prêt en DU";
            break;
        case "c3CC":
            configLabel = "3 co-créateurs";
            break;
        case "c3UBI":
            configLabel = "RdB via une taxe";
            break;
        case "c4CC":
            configLabel = "Nouvel entrant (DU)";
            break;
        case "c4UBI":
            configLabel = "Nouvel entrant (RdB)";
            break;
        case "c4CC-M":
            configLabel = "Nouvel entrant (DU/mois)";
            break;
        case "c4UBI-M":
            configLabel = "Nouvel entrant (RdB/mois)";
            break;
        case "c160f":
            configLabel = "La part des morts";
            break;
        case "c160h":
            configLabel = "Héritage";
            break;
        default:
            throw new Error("Unknown configuration: " + configKey);
    }
    return configLabel;
}

function getRefLabel(referenceFrameKey: string, withoutLog?: boolean) {
    let refLabel;
    switch(referenceFrameKey) {
        case LibreCurrency.MONETARY_UNIT_REF_KEY:
            refLabel = "Unité Monétaire";
            break;
        case LibreCurrency.DIVIDEND_REF_KEY: 
            refLabel = "Dividende";
            break;
        case LibreCurrency.AVERAGE_REF_KEY:
            refLabel = "% (M/N)";
            break;
        case LibreCurrency.ACCOUNT_REF_KEY:
            refLabel = "% Compte";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (!withoutLog && LibreCurrency.referenceFrames[money.referenceFrameKey].logScale) {
        refLabel = refLabel + LOG_UNIT_SUFFIX;
    }
    return refLabel;
}

function getRefUnitLabel1(referenceFrameKey: string) {
    let refUnitLabel;
    switch(referenceFrameKey) {
        case LibreCurrency.MONETARY_UNIT_REF_KEY:
            refUnitLabel = "unités";
            break;
        case LibreCurrency.DIVIDEND_REF_KEY: 
            refUnitLabel = "DU";
            break;
        case LibreCurrency.AVERAGE_REF_KEY:
            refUnitLabel = "% (M/N)";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    return refUnitLabel;
}

function getRefUnitLabel2(referenceFrameKey: string) {
    let refUnitLabel = getRefUnitLabel1(referenceFrameKey);
    if (referenceFrameKey === LibreCurrency.MONETARY_UNIT_REF_KEY) {
        refUnitLabel = "unités monétaires";
    }
    return refUnitLabel;
}

function getRefUnitLabel3(referenceFrameKey: string) {
    let refUnitLabel = getRefUnitLabel2(referenceFrameKey);
    if (LibreCurrency.referenceFrames[money.referenceFrameKey].logScale) {
        refUnitLabel = refUnitLabel + LOG_UNIT_SUFFIX;
    }
    return refUnitLabel;
}

function getUdFormulaLabel(udFormulaKey: string) {
    switch(udFormulaKey) {
        case LibreCurrency.BASIC_UD_KEY:
            return "Basique : DU(t) = c*M(t)/N(t)";
        case LibreCurrency.UDA_KEY:
            return "DUA : DU(t) = max[DU(t-1) ; c*M(t)/N(t)]";
        case LibreCurrency.UDB_KEY: 
            return "DUB : DU(t) = (1+c)*DU(t-1)";
        case LibreCurrency.UDC_KEY: 
            return "DUC : DU(t) = 1/2 [c*M(t)/N(t) + (1+c)*DU(t-1)]";
        case LibreCurrency.UDG_KEY:
            return "DUĞ : DU(t) = DU(t-1) + c²*M(t-1)/N(t-1)";
        default:
            throw new Error("Dividend formula not managed: " + udFormulaKey);
    }
}

function getAccountTypeLabel(type: string) {
    switch(type) {
        case LibreCurrency.CO_CREATOR:
            return CO_CREATOR_LABEL;
        case LibreCurrency.NON_CREATOR:
            return NON_CREATOR_LABEL;
        case LibreCurrency.COMMUNITY:
            return COMMUNITY_LABEL;
        default:
            throw new Error("Account type not managed: " + type);
    }
}

function getDemographicProfileLabel(demographicProfileKey: string) {
    switch(demographicProfileKey) {
        case LibreCurrency.NONE_PROFILE_KEY:
            return "Aucun profil";
        case LibreCurrency.TRIANGULAR_PROFILE_KEY:
            return "Triangulaire";
        case LibreCurrency.PLATEAU_PROFILE_KEY:
            return "Plateau";
        case LibreCurrency.CAUCHY_PROFILE_KEY: 
            return "Cauchy";
        case LibreCurrency.DAMPEDWAVE_PROFILE_KEY:
            return "Ondulation Amortie";
        case LibreCurrency.SIGMOID_PROFILE_KEY:
            return "Sigmoïde";
        default:
            throw new Error("Demographic profile not managed: " + demographicProfileKey);
    }
}

// create and display chart from money.accounts
function generateAccountsChart() {
    accountsChart = new Chart({
        bindto: "#AccountsChart",
        padding: PADDING,
        size: SIZE,
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                max: asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            },
            rangeVal: RANGE
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
    dividendChart = new Chart({
        bindto: "#DividendChart",
        padding: PADDING,
        size: SIZE,
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                max: asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            },
            rangeVal: RANGE
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
    headcountChart = new Chart({
        bindto: "#HeadcountChart",
        padding: PADDING,
        size: SIZE,
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                max: asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
            },
            y: {
                label: {
                    text: "Nombre d'individus"
                },
                tick: {
                    format: d3.format("d")
                }
            },
            rangeVal: RANGE
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
    monetarySupplyChart = new Chart({
        bindto: "#MonetarySupplyChart",
        padding: PADDING,
        size: SIZE,
        axis: {
            x: {
                label: {
                    text: timeLabel()
                },
                tick: {
                    format: DATE_PATTERN
                },
                min: asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                max: asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
            },
            y: {
                label: {
                    text: accountYLabel()
                },
                tick: {
                    format: tickFormat
                }
            },
            rangeVal: RANGE
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

function tickFormat(value: number) {
    const f = d3.format(".2s");
    return withExp(f(value));
}

function commentFormat(value: number) {
    // const isInfinite = LibreCurrency.isInfinite(value);
    if (value === Number.NEGATIVE_INFINITY) {
        return "-Infini";
    }
    if (value === Number.POSITIVE_INFINITY) {
        return "+Infini";
    }
    const f = d3.format(".3s");
    return withExp(f(value));
}

function withExp(siValue: string) {
    const siStr: RegExpExecArray | null = /[yzafpnµmkMGTPEZY]/.exec(siValue)
    if (siStr !== null) {
        return siValue.replace(siStr[0], NONBREAKING_SPACE + "E" + EXP_FORMATS[siStr[0]]);
    }
    return siValue;
}

/**
 * Update chart data ans redraw
 */
function redrawCharts() {

    // calculate C3 data
    money.generateData();
    const accountsData = generateAccountsData();
    const dividendData = generateDividendData();
    const headcountData = generateHeadcountData();
    const monetarySupplyData = generateMonetarySupplyData();

    // reload data in chart
    accountsChart.load(accountsData);
    dividendChart.load(dividendData);
    headcountChart.load(headcountData);
    monetarySupplyChart.load(monetarySupplyData);
    
    const lowerBoundDate = asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
    const upperBoundDate = asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
    accountsChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

    accountsChart.draw();
    dividendChart.draw();
    headcountChart.draw();
    monetarySupplyChart.draw();
}

function updateZoom(oldTimeBounds: TimeStepBounds) {
    // calculate C3 data
    money.generateData({ 
        lower: Math.min(money.getTimeLowerBound(), money.toTimeStep(oldTimeBounds.lower, LibreCurrency.YEAR)), 
        upper: Math.max(money.getTimeUpperBound(), money.toTimeStep(oldTimeBounds.upper, LibreCurrency.YEAR))
    });
    const accountsData = generateAccountsData();
    const dividendData = generateDividendData();
    const headcountData = generateHeadcountData();
    const monetarySupplyData = generateMonetarySupplyData();

    // reload data in chart
    accountsChart.load(accountsData);
    dividendChart.load(dividendData);
    headcountChart.load(headcountData);
    monetarySupplyChart.load(monetarySupplyData);
    
    const lowerBoundDate = asDate(money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
    const upperBoundDate = asDate(money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
    accountsChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    dividendChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    headcountChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
    monetarySupplyChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

    // If the transition of one of the charts is ended, no need to wait the others, they are virtually ended
    accountsChart.updateZoom();
    dividendChart.updateZoom();
    headcountChart.updateZoom();
    return monetarySupplyChart.updateZoom();
}

function searchChartWithData(c3DataId: string) {
    const charts = [accountsChart, dividendChart, headcountChart, monetarySupplyChart];
    for (let i = 0; i < charts.length; i++) {
        if (charts[i].getData(c3DataId).length !== 0) {
            return charts[i];
        }
    }
    throw new Error("c3DataId not managed: " + c3DataId);
}

/**
 * Delete current account
 */
function deleteAccount() {
    const selectedAccountIndex = getSelectedAccountIndex();
    if (money.deleteAccount(selectedAccountIndex)) {
        redrawCharts();
        unsetCurConfig();
        joinAccountSelectorsToData();

        const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
        if (accountSelector === null) {
            console.log("deleteAccount, #AccountSelector not found");
        }
        else {
            accountSelector.selectedIndex = selectedAccountIndex - 1;
        }

        updateAddedAccountArea();
    }
}

function updateAddedAccountArea() {
    const selectedAccount = money.getAccount(getSelectedAccountIndex());
    d3.select("#AccountBirth").property("value", toYearRep(selectedAccount.birth));
    d3.select("#AccountDuration").property("value", selectedAccount.duration);

    const typeSelector = document.getElementById("TypeSelector") as HTMLSelectElement;
    if (typeSelector === null) {
        console.log("updateAddedAccountArea, #TypeSelector not found");
    }
    else {
        typeSelector.selectedIndex = LibreCurrency.ACCOUNT_TYPES.indexOf(selectedAccount.type);
    }

    d3.select("#StartingPercentage").property("value", selectedAccount.startingPercentage);
    enableAddedAccountArea();
}

function getSelectedAccountIndex() {
    const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
    if (accountSelector === null) {
        console.log("getSelectedAccountIndex, #AccountSelector not found");
        return 0;
    }
    else {
        return accountSelector.selectedIndex;
    }
}

/**
 * add a member account with same attributes as the last account
 */
function addAccount() {
    money.addAccount();
    
    redrawCharts();
    unsetCurConfig();
    joinAccountSelectorsToData();

    const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
    if (accountSelector === null) {
        console.log("addAccount, #AccountSelector not found");
    }
    else {
        accountSelector.selectedIndex = money.accounts.length - 1;
    }

    updateAddedAccountArea();
}

function accountName1(account: MAccount) {
    if (account === LibreCurrency.ALL_ACCOUNT) {
        return ALL_ACCOUNTS_LABEL;
    }
    return `${ACCOUNT_LABEL_PREFIX} ${account.id}`;
}

function accountName2(account: MAccount) {
    return `${accountName1(account)} (${accountTypeLabel(account)})`;
}

function accountName3(account: MAccount) {
    return `${accountName1(account)} (${accountTypeLabel(account)}, ${account.startingPercentage})`;
}

// function idFromAccountName(accountName: string) {
//     if (accountName.substr(0, ACCOUNT_LABEL_PREFIX.length) === ACCOUNT_LABEL_PREFIX) {
//         return accountName.substring(ACCOUNT_LABEL_PREFIX.length);
//     }
//     throw new Error(accountName + " doesn't start with the expected prefix: " + ACCOUNT_LABEL_PREFIX);
// }

function accountTypeLabel(account: MAccount) {
    if (LibreCurrency.isCoCreator(account)) {
        return CO_CREATOR_LABEL;
    }
    else if (LibreCurrency.isNonCreator(account)) {
        return NON_CREATOR_LABEL;
    }
    else if (LibreCurrency.isCommunity(account)) {
        return COMMUNITY_LABEL;
    }
    else {
        throw new Error("Unknown account type: " + account.type);
    }
}

function accountAgeLabel(account: MAccount, timeStep: number) {
    let year = 0;
    let month = 0;
    if (money.getProdStepUnit() === LibreCurrency.MONTH) {
        year = Math.trunc(timeStep / 12) - account.birth;
        month = timeStep % 12;
    }
    else if (money.getProdStepUnit() === LibreCurrency.YEAR) {
        year = timeStep - account.birth;
        month = 0;
    }
    else {
        throw new Error("Time resolution not managed: " + money.getProdStepUnit());
    }
    if (year === 0 && month === 0) {
        if (money.getProdStepUnit() === LibreCurrency.MONTH) {
            return "0 mois";
        }
        else if (money.getProdStepUnit() === LibreCurrency.YEAR) {
            return "0 année";
        }
    }
    if (year === 0) {
        return `${month} mois`;
    }
    if (month === 0) {
        if (year === 1) {
            return `${year} an`;
        }
        return `${year} ans`;
    }
    else if (month === 1) {
        if (year === 1) {
            return `${year} an et ${month} mois`;
        }
        return `${year} ans et ${month} mois`;
    }
    else {
        if (year === 1) {
            return `${year} an et ${month} mois`;
        }
        return `${year} ans et ${month} mois`;
    }
}

/**
 * Delete current transaction
 */
function deleteTransaction() {
    const selectedTransactionIndex = getSelectedTransactionIndex();
    const transactions = money.deleteTransaction(selectedTransactionIndex);
    // If transaction deleted...
    if (transactions.length > 0) {
        redrawCharts();
        unsetCurConfig();
        joinTransactionSelectorToData();

        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("deleteTransaction, #TransactionSelector not found");
        }
        else {
            if (selectedTransactionIndex > 0) {
                transactionSelector.selectedIndex = selectedTransactionIndex - 1;
            }
            else if (money.transactions.length > 0) {
                transactionSelector.selectedIndex = 0;
            }
        }

        updateTransactionArea();
    }
}

function updateTransactionArea() {
    if (money.transactions.length > 0) {
        const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
        d3.select("#TransactionYear").property("value", toYearRep(selectedTransaction.year));
        d3.select("#TransactionRep").property("value", selectedTransaction.repetitionCount);

        const transactionSrcSelector = document.getElementById("TransactionSrc") as HTMLSelectElement;
        if (transactionSrcSelector === null) {
            console.log("updateTransactionArea, #TransactionSrc not found");
        }
        else {
            transactionSrcSelector.selectedIndex = getTransAccounts().indexOf(selectedTransaction.from);
        }

        const transactionDestSelector = document.getElementById("TransactionDest") as HTMLSelectElement;
        if (transactionDestSelector === null) {
            console.log("updateTransactionArea, #TransactionDest not found");
        }
        else {
            transactionDestSelector.selectedIndex = getTransAccounts().indexOf(selectedTransaction.to);
        }

        d3.select("#TransactionAmount").property("value", selectedTransaction.amount);

        const transactionRefSelector = document.getElementById("TransactionRef") as HTMLSelectElement;
        if (transactionRefSelector === null) {
            console.log("updateTransactionArea, #TransactionRef not found");
        }
        else {
            transactionRefSelector.selectedIndex = Object.keys(LibreCurrency.referenceFrames).indexOf(selectedTransaction.amountRef);
        }
    }
    enableTransactionArea();
}

function getTransAccounts() {
    return money.accounts.concat(LibreCurrency.ALL_ACCOUNT);
}
    
function getSelectedTransactionIndex() {
    const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
    if (transactionSelector === null) {
        console.log("getSelectedTransactionIndex, #TransactionSelector not found");
        return 0;
    }
    else {
        return transactionSelector.selectedIndex;
    }
}

function getTransactionSrcIndex() {
    const transactionSrcSelector = document.getElementById("TransactionSrc") as HTMLSelectElement;
    if (transactionSrcSelector === null) {
        console.log("getTransactionSrcIndex, #TransactionSrc not found");
        return 0;
    }
    else {
        return transactionSrcSelector.selectedIndex;
    }
}

function getTransactionDestIndex() {
    const transactionDestSelector = document.getElementById("TransactionDest") as HTMLSelectElement;
    if (transactionDestSelector === null) {
        console.log("getTransactionDestIndex, #TransactionDest not found");
        return 0;
    }
    else {
        return transactionDestSelector.selectedIndex;
    }
}

/**
 * add a transaction 
 */
function addTransaction() {
    money.addTransaction();
    redrawCharts();
    unsetCurConfig();
    joinTransactionSelectorToData();

    const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
    if (transactionSelector === null) {
        console.log("addTransaction, #TransactionSelector not found");
    }
    else {
        transactionSelector.selectedIndex = money.transactions.length - 1;
    }
    updateTransactionArea();
}

function transactionName(transaction: Transaction) {
    return `${TRANSACTION_LABEL_PREFIX} ${transaction.id}`;
}

function enableTransactionArea() {
    if (money.transactions.length > 0) {
        d3.select("#Transactions>.ParamSection").style("display", "block");
    }
    else {
        d3.select("#Transactions>.ParamSection").style("display", "none");
    }
}

function asDate(timeStep: number, aTimeUnit?: string) {
    const timeUnit = aTimeUnit || money.getProdStepUnit();
    
    if (timeUnit === LibreCurrency.MONTH) {
        return new Date(1999 + Math.trunc(timeStep / 12), timeStep % 12, 1);
    }
    else if (timeUnit === LibreCurrency.YEAR) {
        return new Date(1999 + timeStep, 0, 1);
    }
    else {
        throw new Error("Time unit not managed: " + timeUnit);
    }
}

function asFormattedDate(timeStep: number, timeUnit?: string) {
    return d3.timeFormat(DATE_PATTERN)(asDate(timeStep, timeUnit));
}

function enableGrowthForms(calculateGrowth: boolean) {
    if (calculateGrowth) {
        d3.select("#AnnualGrowth").attr("disabled", "disabled");
        d3.select("#MonthlyGrowth").attr("disabled", "disabled");
    } else {
        if (money.growthStepUnit === LibreCurrency.MONTH) {
            d3.select("#AnnualGrowth").attr("disabled", "disabled");
            d3.select("#MonthlyGrowth").attr("disabled", null);
        }
        else {
            d3.select("#AnnualGrowth").attr("disabled", null);
            d3.select("#MonthlyGrowth").attr("disabled", "disabled");
        }
    }
}

function enableUD0Forms() {
    if (money.growthStepUnit === LibreCurrency.MONTH) {
        d3.select("#AnnualDividendStart").attr("disabled", "disabled");
        d3.select("#MonthlyDividendStart").attr("disabled", null);
        d3.select("#YearMonthDividendStart").attr("disabled", "disabled");
    }
    else {
        if (money.getProdStepUnit() === LibreCurrency.YEAR) {
            d3.select("#AnnualDividendStart").attr("disabled", null);
            d3.select("#MonthlyDividendStart").attr("disabled", "disabled");
            d3.select("#YearMonthDividendStart").attr("disabled", "disabled");
        }
        else {
            d3.select("#AnnualDividendStart").attr("disabled", "disabled");
            d3.select("#MonthlyDividendStart").attr("disabled", "disabled");
            d3.select("#YearMonthDividendStart").attr("disabled", null);
        }
    }
}

function enableDemographyFields() {
    const styleDisplay = (id: string, display: string) => {
        const htmlInputElement = document.getElementById(id) as HTMLInputElement;
        if (htmlInputElement === null) {
            console.log("enableDemographyFields, #" + id + " not found");
        }
        else {
            // @ts-ignore
            htmlInputElement.parentNode.style.display = display;
        }
    }
    ["MaxDemography", "xMinDemography", "xMpvDemography", "plateauDemography", "xScaleDemography"]
        .forEach(id => styleDisplay(id, "none"));
    
    if (money.demographicProfileKey === "None") {
        d3.select("#DemographyParamSection").style("display", "none");
    }
    else {
        d3.select("#DemographyParamSection").style("display", "block");
    }

    switch(money.demographicProfileKey) {
        case LibreCurrency.NONE_PROFILE_KEY:
            break;
        case LibreCurrency.TRIANGULAR_PROFILE_KEY: 
            ["MaxDemography", "xMinDemography", "xMpvDemography", "plateauDemography"]
                .forEach(id => styleDisplay(id, "block"));
            break;
        case LibreCurrency.PLATEAU_PROFILE_KEY: 
            ["MaxDemography", "xMinDemography", "xMpvDemography", "plateauDemography"]
                .forEach(id => styleDisplay(id, "block"));
            break;
        case LibreCurrency.CAUCHY_PROFILE_KEY:
            ["MaxDemography", "xMpvDemography", "xScaleDemography"]
                .forEach(id => styleDisplay(id, "block"));
            break;
        case LibreCurrency.DAMPEDWAVE_PROFILE_KEY:
            ["MaxDemography", "xScaleDemography"]
                .forEach(id => styleDisplay(id, "block"));
            break;
        case LibreCurrency.SIGMOID_PROFILE_KEY:
            ["MaxDemography", "xMinDemography", "xScaleDemography"]
                .forEach(id => styleDisplay(id, "block"));
            break;
        default:
            throw new Error("Demographic profile not managed: " + money.demographicProfileKey);
    }
}

function enableAddedAccountArea() {
    if (getSelectedAccountIndex() === 0) {
        d3.select("#AccountBirth").attr("disabled", "disabled");
        d3.select("#DeleteAccount").attr("disabled", "disabled");
    }
    else {
        d3.select("#AccountBirth").attr("disabled", null);
        d3.select("#DeleteAccount").attr("disabled", null);
    }
}

function accountYLabel() {
    return `Montant (en ${getRefUnitLabel3(money.referenceFrameKey)})`;
}

function timeLabel() {
    if (money.growthStepUnit === LibreCurrency.MONTH) {
        return "Temps (émission mensuelle)";
    }
    else {
        if (money.getProdStepUnit() === LibreCurrency.MONTH) {
            return "Temps (émission mensuelle, réévaluation annuelle)";
        }
        else {
            return "Temps (émission annuelle)";
        }
    }
}

function universalDividendName() {
    switch(money.udFormulaKey) {
        case LibreCurrency.BASIC_UD_KEY:
            return "Basique";
        case LibreCurrency.UDA_KEY:
            return "DUA";
        case LibreCurrency.UDB_KEY: 
            return "DUB";
        case LibreCurrency.UDC_KEY: 
            return "DUC";
        case LibreCurrency.UDG_KEY:
            return "DUĞ";
        default:
            throw new Error("Dividend formula not managed: " + money.udFormulaKey);
    }
}

function openTab(tabId: string) {
    d3.selectAll(".tablinks").classed("active", false);
    d3.select("#" + tabId).classed("active", true);
    showTab(tabId);
    curTabId = tabId;
}

function showTab(tabId: string) {
    d3.selectAll(".tabcontent").style("display", "none");
    const tabContentId = d3.select("#" + tabId).attr("tab-content-id");
    d3.select("#" + tabContentId).style("display", "block");
}

function comment(id: string) {
    unselectChartPoints();
    return comment0(id);
}

function commentChartData(chart: Chart, c3DataId: string, pointIndex: number) {
    unselectChartPoints();
    chart.doSelect(c3DataId, pointIndex);
    curSelectedDataId = c3DataId;
    selectedPointIndex = pointIndex;

    if (c3DataId.startsWith(ACCOUNT_ID_PREFIX)) {
        const accountId = idFromC3AccountId(c3DataId);
        const account = money.searchAccount(accountId);
        if (account === null) {
            return false;
        }
        const selectedTimeStep = account.x[selectedPointIndex];
        return commentSelectedPoint(ACCOUNT_ID_PREFIX, selectedTimeStep, account);
    }
    
    let selectedTimeStep;
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

function getRefDisplay(referenceFrameKey: string) {
    let refDisplay;
    switch(referenceFrameKey) {
        case LibreCurrency.MONETARY_UNIT_REF_KEY:
            refDisplay = "MU";
            break;
        case LibreCurrency.DIVIDEND_REF_KEY: 
            refDisplay = "UD";
            break;
        case LibreCurrency.AVERAGE_REF_KEY:
            refDisplay = "MN";
            break;
        default:
            throw new Error("Reference frame not managed: " + referenceFrameKey);
    }
    if (LibreCurrency.referenceFrames[money.referenceFrameKey].logScale) {
        refDisplay = refDisplay + "-log";
    }
    return refDisplay;
}

// eslint-disable-next-line max-lines-per-function
function commentSelectedPoint(c3DataId: string, timeStep: number, account?: MAccount) {
    const f = d3.format(".3d");
    
    // Process some elements which are common to several series
    
    const growthValue = money.getGrowth();

    d3.selectAll("span.dateValue").text(asFormattedDate(timeStep));
    const pTimeStep = timeStep - 1;
    const ppTimeStep = money.previousGrowthStep(pTimeStep);

    d3.selectAll("span.growth.value").text(commentFormat(growthValue * 100) + NONBREAKING_SPACE + "%");
    if (money.prodFactor() === 12) {
        d3.selectAll(".prodFactor").style("display", null);
    }
    else {
        d3.selectAll(".prodFactor").style("display", "none");
    }
    
    const dividendMuValue = money.dividends.values[timeStep];
    d3.selectAll("span.dividend.current.mu.value").text(commentFormat(dividendMuValue));

    const headcountValue = money.headcounts.values[timeStep];
    d3.selectAll("span.headcount.current.value").text(f(headcountValue));
    
    // const averageMuValue = money.monetarySupplies.values[timeStep] / money.headcounts.values[timeStep];
    const averageMuValue = money.getAverage(timeStep);
    d3.selectAll("span.average.current.mu.value").text(commentFormat(averageMuValue));
    
    const muUnitLabel = getRefUnitLabel2(LibreCurrency.MONETARY_UNIT_REF_KEY);
    d3.selectAll("span.muUnit").text(muUnitLabel);
    d3.selectAll("span.muLogUnit").text(muUnitLabel + LOG_UNIT_SUFFIX);
    
    const duUnitLabel = getRefUnitLabel2(LibreCurrency.DIVIDEND_REF_KEY);
    d3.selectAll("span.duUnit").text(duUnitLabel);
    d3.selectAll("span.duLogUnit").text(duUnitLabel + LOG_UNIT_SUFFIX);
    
    const mnUnitLabel = getRefUnitLabel2(LibreCurrency.AVERAGE_REF_KEY);
    d3.selectAll("span.mnUnit").text(mnUnitLabel);
    d3.selectAll("span.mnLogUnit").text(mnUnitLabel + LOG_UNIT_SUFFIX);

    // Process elements which are more specific to each serie
    
    switch(c3DataId) {
        case AVERAGE_ID: {
            const averageMuLogValue = Math.log(averageMuValue) / Math.log(10);
            const averageUdValue = averageMuValue / dividendMuValue;
            const averageUdLogValue = Math.log(averageUdValue) / Math.log(10);
            const averageMnValue = 100 * averageMuValue / averageMuValue;
            const averageMnLogValue = Math.log(averageMnValue) / Math.log(10);
            const monetarySupplyMuValue = money.monetarySupplies.values[timeStep];
            d3.selectAll("span.average.label").text(AVERAGE_LABEL);
            d3.selectAll("span.average.mu.logValue").text(commentFormat(averageMuLogValue));
            d3.selectAll("span.average.ud.value").text(commentFormat(averageUdValue));
            d3.selectAll("span.average.ud.logValue").text(commentFormat(averageUdLogValue));
            d3.selectAll("span.average.mn.value").text(commentFormat(averageMnValue));
            d3.selectAll("span.average.mn.logValue").text(commentFormat(averageMnLogValue));
            d3.selectAll("span.monetarySupply.current.mu.value").text(commentFormat(monetarySupplyMuValue));
            break;
        }            
        case STABLE_AVERAGE_ID: {
            const stableAverageMuValue = (1 + growthValue) * dividendMuValue / growthValue * money.prodFactor();
            const stableAverageMuLogValue = Math.log(stableAverageMuValue) / Math.log(10);
            const stableAverageUdValue = stableAverageMuValue / dividendMuValue;
            const stableAverageUdLogValue = Math.log(stableAverageUdValue) / Math.log(10);
            const stableAverageMnValue = 100 * stableAverageMuValue / averageMuValue;
            const stableAverageMnLogValue = Math.log(stableAverageMnValue) / Math.log(10);
            d3.selectAll("span.stableAverage.label").text(STABLE_AVERAGE_LABEL);
            d3.selectAll("span.stableAverage.current.mu.value").text(commentFormat(stableAverageMuValue));
            d3.selectAll("span.stableAverage.mu.logValue").text(commentFormat(stableAverageMuLogValue));
            d3.selectAll("span.stableAverage.ud.value").text(commentFormat(stableAverageUdValue));
            d3.selectAll("span.stableAverage.ud.logValue").text(commentFormat(stableAverageUdLogValue));
            d3.selectAll("span.stableAverage.mn.value").text(commentFormat(stableAverageMnValue));
            d3.selectAll("span.stableAverage.mn.logValue").text(commentFormat(stableAverageMnLogValue));
            break;
        }
        case DIVIDEND_ID: {
            const dividendMuLogValue = Math.log(dividendMuValue) / Math.log(10);
            const dividendUdValue = dividendMuValue / dividendMuValue;
            const dividendUdLogValue = Math.log(dividendUdValue) / Math.log(10);
            const dividendMnValue = 100 * dividendMuValue / averageMuValue;
            const dividendMnLogValue = Math.log(dividendMnValue) / Math.log(10);
            const previousDividendMuValue = money.dividends.values[pTimeStep];
            const previousMonetarySupplyMuValue = money.monetarySupplies.values[pTimeStep];
            const previous2MonetarySupplyMuValue = money.monetarySupplies.values[ppTimeStep];
            const previousHeadcountValue = money.headcounts.values[pTimeStep];
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
        }
        case STABLE_DIVIDEND_ID: {
            const stableDividendMuValue = growthValue * averageMuValue / (1 + growthValue) / money.prodFactor();
            const stableDividendMuLogValue = Math.log(stableDividendMuValue) / Math.log(10);
            const stableDividendUdValue = stableDividendMuValue / dividendMuValue;
            const stableDividendUdLogValue = Math.log(stableDividendUdValue) / Math.log(10);
            const stableDividendMnValue = 100 * stableDividendMuValue / averageMuValue;
            const stableDividendMnLogValue = Math.log(stableDividendMnValue) / Math.log(10);
            d3.selectAll("span.stableDividend.label").text(STABLE_DIVIDEND_LABEL);
            d3.selectAll("span.stableDividend.current.mu.value").text(commentFormat(stableDividendMuValue));
            d3.selectAll("span.stableDividend.mu.logValue").text(commentFormat(stableDividendMuLogValue));
            d3.selectAll("span.stableDividend.ud.value").text(commentFormat(stableDividendUdValue));
            d3.selectAll("span.stableDividend.ud.logValue").text(commentFormat(stableDividendUdLogValue));
            d3.selectAll("span.stableDividend.mn.value").text(commentFormat(stableDividendMnValue));
            d3.selectAll("span.stableDividend.mn.logValue").text(commentFormat(stableDividendMnLogValue));
            break;
        }
        case HEADCOUNT_ID: {
            const demographyValue = LibreCurrency.demographicProfiles[money.demographicProfileKey].calculate(money, money.fromTimeStep(timeStep, LibreCurrency.YEAR));
            d3.selectAll("span.headcount.label").text(HEADCOUNT_LABEL);
            d3.selectAll("span.demographyLabel").text(getDemographicProfileLabel(money.demographicProfileKey));
            d3.selectAll("span.accountsNumberValue").text(headcountValue - demographyValue);
            d3.selectAll("span.demographyValue").text(demographyValue);
            break;
        }
        case MONETARY_SUPPLY_ID: {
            const monetarySupplyMuValue = money.monetarySupplies.values[timeStep];
            const monetarySupplyMuLogValue = Math.log(monetarySupplyMuValue) / Math.log(10);
            const monetarySupplyUdValue = monetarySupplyMuValue / dividendMuValue;
            const monetarySupplyUdLogValue = Math.log(monetarySupplyUdValue) / Math.log(10);
            const monetarySupplyMnValue = 100 * monetarySupplyMuValue / averageMuValue;
            const monetarySupplyMnLogValue = Math.log(monetarySupplyMnValue) / Math.log(10);
            const previousMonetarySupplyMuValue = money.monetarySupplies.values[pTimeStep];
            d3.selectAll("span.monetarySupply.label").text(MONETARY_SUPPLY_LABEL);
            d3.selectAll("span.monetarySupply.previous.mu.value").text(commentFormat(previousMonetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.current.mu.value").text(commentFormat(monetarySupplyMuValue));
            d3.selectAll("span.monetarySupply.mu.logValue").text(commentFormat(monetarySupplyMuLogValue));
            d3.selectAll("span.monetarySupply.ud.value").text(commentFormat(monetarySupplyUdValue));
            d3.selectAll("span.monetarySupply.ud.logValue").text(commentFormat(monetarySupplyUdLogValue));
            d3.selectAll("span.monetarySupply.mn.value").text(commentFormat(monetarySupplyMnValue));
            d3.selectAll("span.monetarySupply.mn.logValue").text(commentFormat(monetarySupplyMnLogValue));
            let birthAmountsValue = monetarySupplyMuValue - previousMonetarySupplyMuValue - dividendMuValue * headcountValue;
            if (birthAmountsValue < 0.01) {
                birthAmountsValue = 0;
            }
            d3.selectAll("span.birthAmounts.value").text(commentFormat(birthAmountsValue));
            commentAccordingToMoneyBirth(timeStep);
            break;
        }
        case STABLE_MONETARY_SUPPLY_ID: {
            const stableMonetarySupplyMuValue = headcountValue * (1 + growthValue) * dividendMuValue / growthValue * money.prodFactor();
            const stableMonetarySupplyMuLogValue = Math.log(stableMonetarySupplyMuValue) / Math.log(10);
            const stableMonetarySupplyUdValue = stableMonetarySupplyMuValue / dividendMuValue;
            const stableMonetarySupplyUdLogValue = Math.log(stableMonetarySupplyUdValue) / Math.log(10);
            const stableMonetarySupplyMnValue = 100 * stableMonetarySupplyMuValue / averageMuValue;
            const stableMonetarySupplyMnLogValue = Math.log(stableMonetarySupplyMnValue) / Math.log(10);
            d3.selectAll("span.stableMonetarySupply.label").text(STABLE_MONETARY_SUPPLY_LABEL);
            d3.selectAll("span.stableMonetarySupply.current.mu.value").text(commentFormat(stableMonetarySupplyMuValue));
            d3.selectAll("span.stableMonetarySupply.mu.logValue").text(commentFormat(stableMonetarySupplyMuLogValue));
            d3.selectAll("span.stableMonetarySupply.ud.value").text(commentFormat(stableMonetarySupplyUdValue));
            d3.selectAll("span.stableMonetarySupply.ud.logValue").text(commentFormat(stableMonetarySupplyUdLogValue));
            d3.selectAll("span.stableMonetarySupply.mn.value").text(commentFormat(stableMonetarySupplyMnValue));
            d3.selectAll("span.stableMonetarySupply.mn.logValue").text(commentFormat(stableMonetarySupplyMnLogValue));
            break;
        }
        default: {
            if (c3DataId.startsWith(ACCOUNT_ID_PREFIX) && account) {
                const accountSpan = d3.select("#accountComment").selectAll("span.account");
                accountSpan.style("color", ACCOUNT_COLORS[account.id - 1]);
                const accountMuValue = account.values[timeStep];
                const accountMuLogValue = Math.log(accountMuValue) / Math.log(10);
                const accountUdValue = accountMuValue / dividendMuValue;
                const accountUdLogValue = Math.log(accountUdValue) / Math.log(10);
                const accountMnValue = 100 * accountMuValue / averageMuValue;
                const accountMnLogValue = Math.log(accountMnValue) / Math.log(10);
                d3.selectAll("span.account.name").text(accountName1(account));
                d3.selectAll("span.accountAge").text(accountAgeLabel(account, timeStep));
                d3.selectAll("span.account.current.mu.value").text(commentFormat(accountMuValue));
                d3.selectAll("span.account.mu.logValue").text(commentFormat(accountMuLogValue));
                d3.selectAll("span.account.ud.value").text(commentFormat(accountUdValue));
                d3.selectAll("span.account.ud.logValue").text(commentFormat(accountUdLogValue));
                d3.selectAll("span.account.mn.value").text(commentFormat(accountMnValue));
                d3.selectAll("span.account.mn.logValue").text(commentFormat(accountMnLogValue));
                if (timeStep > 0) {
                    const previousMuAccountValue = account.values[pTimeStep];
                    d3.selectAll("span.account.previous.mu.value").text(commentFormat(previousMuAccountValue));
                }
                d3.selectAll("span.UD0.value").text(commentFormat(money.getDividendStart()));
                commentAccordingToAccount(timeStep, account)
            }
            else {
                throw new Error("Unknown c3DataId: " + c3DataId);
            }
        }
    }
    
    commentAccordingToRef();
    
    return comment0(c3DataId);
}

function commentAccordingToRef() {
    d3.selectAll("div.RefComment").style("display", "none");
    const refDisplay = getRefDisplay(money.referenceFrameKey);
    d3.selectAll("div." + refDisplay).style("display", "block");
}

function commentAccordingToUD(timeStep: number) {
    d3.selectAll("div.DuComment").style("display", "none");
    const moneyBirthStep = money.toTimeStep(money.moneyBirth, LibreCurrency.YEAR);
    if (timeStep === moneyBirthStep) {
        d3.selectAll("div.NoUD").style("display", "block");
    }
    else if (timeStep === moneyBirthStep + 1) {
        d3.selectAll("div.UD0").style("display", "block");
    }
    else if (money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.MONTH && (timeStep - moneyBirthStep) % 12 !== 1) {
            d3.selectAll("div.UDM").style("display", "block");
    }
    else {
        d3.selectAll("div." + money.udFormulaKey).style("display", "block");
    }
}

function commentAccordingToMoneyBirth(timeStep: number) {
    d3.selectAll("div.MbComment").style("display", "none");
    const moneyBirthStep = money.toTimeStep(money.moneyBirth, LibreCurrency.YEAR);
    if (timeStep === moneyBirthStep) {
        d3.selectAll("div.MB").style("display", "block");
    }
    else {
        d3.selectAll("div.NoMB").style("display", "block");
    }
}

// eslint-disable-next-line max-lines-per-function
function commentAccordingToAccount(timeStep: number, account: MAccount) {
    d3.selectAll(".AmountComment").style("display", "none");
    const pTimeStep = timeStep - 1;
    const moneyBirthStep = money.toTimeStep(money.moneyBirth, LibreCurrency.YEAR);
    const birthStep = money.toTimeStep(account.birth, LibreCurrency.YEAR);
    const deathStep = money.toTimeStep(account.birth + money.lifeExpectancy, LibreCurrency.YEAR);
    const udProductorClass = LibreCurrency.isCoCreator(account) ? "CoCreator" : "NonCreator";
    const coCreatorsClass = money.hasNoCoCreators() ? "NoCreators" : "CoCreators";
    if (timeStep === moneyBirthStep && money.prodFactor() === 12) {
        d3.selectAll(".prodFactor.AtMoneyBirth").style("display", null);
    }
    else {
        d3.selectAll(".prodFactor.AtMoneyBirth").style("display", "none");
    }
    if (timeStep === moneyBirthStep) {
        // Change 'id' to have a link to the corresponding account
        d3.select("#accountComment").selectAll("span.StartingPercentage").attr("id", function(_d, i) { return "sp" + i + "-" + account.id; });
        d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + NONBREAKING_SPACE + "%");
        d3.selectAll("span.AtMoneyBirth." + coCreatorsClass).style("display", "inline");
    }
    else if (timeStep === birthStep) {
        const previousAverageMuValue = money.getAverage(pTimeStep);
        // Change 'id' to have a link to the corresponding account
        d3.select("#accountComment").selectAll("span.StartingPercentage").attr("id", function(_d, i) { return "sp" + i + "-" + account.id; });
        d3.selectAll("span.average.previous.mu.value").text(commentFormat(previousAverageMuValue));
        d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + NONBREAKING_SPACE + "%");
        d3.selectAll("span.AtBirth." + coCreatorsClass).style("display", "inline");
    }
    else if (timeStep > deathStep) {
        d3.selectAll("span.AfterDeath." + udProductorClass).style("display", "inline");
    }
    else {
        d3.selectAll("span.WhenAlive." + udProductorClass).style("display", "inline");
    }

    const commentsMap = money.applyTransactions(timeStep, account);
    if (commentsMap.size > 0) {
        d3.selectAll("span.TransactionsDesc").style("display", "inline");
        d3.selectAll("span.TransactionsValuesDesc").style("display", "inline");
        d3.selectAll("span.TransactionsDesc").html(function (_d, i) {
            const prefixId = "ac" + account.id + "td" + i;
            return Array.from(commentsMap.entries()).map(e => transactionsDesc(prefixId, e[0], e[1])).join(" ");
        });
        d3.selectAll("span.TransactionsValuesDesc").html(function (_d, i) {
            const prefixId = "ac" + account.id + "tvd" + i;
            return Array.from(commentsMap.entries()).map(e => transactionsValuesDesc(prefixId, e[0], e[1])).join(" ");
        });
        initTransactionSpans();
    }
    else {
        d3.selectAll("span.TransactionsDesc").style("display", "none");
        d3.selectAll("span.TransactionsValuesDesc").style("display", "none");
    }
}

function initTransactionSpans() {
    d3.selectAll("span.transaction")
    .style("background-color", "#f1f1f1")
    .on("mouseover", function () {
        d3.select("#TransactionsTab").classed("focused", true);
        showTab("TransactionsTab");

        const paramElemId = d3.select(this).attr("id");
        if (paramElemId) {
            const modelId = + paramElemId.split("-")[1];
            setSelectorIndex("TransactionsTab", modelId);
            d3.selectAll<HTMLSpanElement, unknown>("span.transaction").filter(function() { return this.id.endsWith("-" + modelId); })
                .style("background-color", "#dddddd");
        }
    })
    .on("mouseout", function () {
        d3.selectAll("span.transactionsTabLink").style("background-color", "#f1f1f1");
        d3.selectAll("span.transaction").style("background-color", "#f1f1f1");
        d3.select("#TransactionsTab").classed("focused", false);
        showTab(curTabId);
    })
    .on("click", function() {
        d3.select("#TransactionsTab").classed("focused", false);
        const paramElemId = d3.select(this).attr("id");
        if (paramElemId) {
            const modelId = + paramElemId.split("-")[1];
            setSelectorIndex("TransactionsTab", modelId);
            clickTab("TransactionsTab");
        }
    });
}

function transactionsDesc(prefixId: string, transaction: Transaction, actualAmountMap: Map<MAccount, number>) {
    const descrId = prefixId + "-" + transaction.id;
    const firstActualAmount = actualAmountMap.entries().next().value[1];
    const direction = (firstActualAmount<0) ? "- " : "+ ";
    return direction + `<span id="${descrId}" class="transaction name">${TRANSACTION_LABEL_PREFIX} ${transaction.id}</span> (${accountName1(transaction.from)} vers ${accountName1(transaction.to)} : ${transaction.amount} ${getRefLabel(transaction.amountRef)})`;

}

function transactionsValuesDesc(prefixId: string, transaction: Transaction, actualAmountMap: Map<MAccount, number>) {
    const descrId = prefixId + "-" + transaction.id;
    const firstActualAmount = actualAmountMap.entries().next().value[1];
    const direction = (firstActualAmount<0) ? "- " : "+ ";
    let values; 
    if (actualAmountMap.size > 1) {
        values = "(" + Array.from(actualAmountMap.values()).map(a => Math.abs(a)).join("+") + ")" ;
    }
    else {
        values = Math.abs(firstActualAmount);
    }
    return direction + `<span id="${descrId}" class="transaction value">${values}</span>`;
}

function comment0(id: string) {
    d3.selectAll(".Comment").style("display", "none");
    d3.select("#" + id + "Comment").style("display", "block");

    commentedId = id;
    
    return false;
}

function pushNewHistoryState() {
    const encodedURI = asEncodedURI();
    window.history.pushState(encodedURI, "", "?" + encodedURI);
}

// Callbacks
// *********

function changeConfiguration(configIdToSelect: string, configs: {[s: string]: JSonRep | {}}) {
    curConfigId = configIdToSelect;
    if (curConfigId === "none") {
        comment("WorkshopsTab");
    }
    else {
        const jsonRep = configs[curConfigId] as JSonRep;
        applyJSonRep(jsonRep);
        comment(curConfigId);
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
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.from = getTransAccounts()[getTransactionSrcIndex()];
    redrawCharts();
    unsetCurConfig();
    pushNewHistoryState();
}

function changeTransactionDestSelection() {
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.to = getTransAccounts()[getTransactionDestIndex()];
    redrawCharts();
    unsetCurConfig();
    pushNewHistoryState();
}

function changeTransactionYear(htmlInputElement: HTMLInputElement) {
    const transactionYear = fromYearRep(parseInt(htmlInputElement.value, 10));
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionYear >= 0 && transactionYear < 240) {
        selectedTransaction.year = transactionYear;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#TransactionYear").property("value", toYearRep(selectedTransaction.year));
    }
}

function changeTransactionRep(htmlInputElement: HTMLInputElement) {
    const transactionRep = parseInt(htmlInputElement.value, 10);
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionRep > 0 && transactionRep < money.toTimeStep(240, LibreCurrency.YEAR)) {
        selectedTransaction.repetitionCount = transactionRep;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#TransactionRep").property("value", selectedTransaction.repetitionCount);
    }
}

function changeTransactionAmount(htmlInputElement: HTMLInputElement) {
    const transactionAmount = parseFloat(htmlInputElement.value);
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    if (transactionAmount >= 0) {
        selectedTransaction.amount = transactionAmount;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#TransactionAmount").property("value", selectedTransaction.amount);
    }
}

function changeTransactionRefSelection(htmlSelectElement: HTMLSelectElement) {
    const selectedTransaction = money.getTransaction(getSelectedTransactionIndex());
    selectedTransaction.amountRef = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
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

function changeReferenceFrame(htmlSelectElement: HTMLSelectElement) {
    money.referenceFrameKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
    d3.select("#LogScale").property("checked", LibreCurrency.referenceFrames[money.referenceFrameKey].logScale);
        
    updateAccountYLabels();
    
    redrawCharts();
    unsetCurConfig();
    comment(money.referenceFrameKey + "Ref");
    pushNewHistoryState();
}

function updateAccountYLabels() {
    accountsChart.axisLabels({
        y: accountYLabel()
    });
    dividendChart.axisLabels({
        y: accountYLabel()
    });
    monetarySupplyChart.axisLabels({
        y: accountYLabel()
    });
}

function updateTimeXLabels() {
    accountsChart.axisLabels({
        x: timeLabel()
    });
    dividendChart.axisLabels({
        x: timeLabel()
    });
    headcountChart.axisLabels({
        x: timeLabel()
    });
    monetarySupplyChart.axisLabels({
        x: timeLabel()
    });
}

function changeUdFormula(htmlSelectElement: HTMLSelectElement) {
    money.udFormulaKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
    redrawCharts();
    unsetCurConfig();
    comment(money.udFormulaKey);
    pushNewHistoryState();
}

function changeDemographicProfile(htmlSelectElement: HTMLSelectElement) {
    money.demographicProfileKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
    enableDemographyFields();
    redrawCharts();
    unsetCurConfig();
    comment(money.demographicProfileKey);
    pushNewHistoryState();
}

function changeRythm(htmlInputElement: HTMLInputElement) {
    if (htmlInputElement.value === "byMonth") {
        const monthlyGrowth = document.getElementById("MonthlyGrowth") as HTMLInputElement;
        if (monthlyGrowth === null) {
            console.log("changeRythm, #MonthlyGrowth not found");
        }
        else {
            money.growthStepUnit = LibreCurrency.MONTH;
            money.growth = parseFloat(monthlyGrowth.value) / 100;
        }
    }
    else {
        const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
        if (annualGrowth === null) {
            console.log("changeRythm, #AnnualGrowth not found");
        }
        else {
            money.growthStepUnit = LibreCurrency.YEAR;
            money.growth = parseFloat(annualGrowth.value) / 100;
        }
    }
    rythmAndUD0Update(htmlInputElement);
}

function changeUd0Rythm(htmlInputElement: HTMLInputElement) {
    if (htmlInputElement.value === "ud0ByMonth") {
        const monthlyGrowth = document.getElementById("MonthlyGrowth") as HTMLInputElement;
        if (monthlyGrowth === null) {
            console.log("changeUd0Rythm, #MonthlyGrowth not found");
        }
        else {
            money.growthStepUnit = LibreCurrency.MONTH;
            money.prodStepUnit = LibreCurrency.MONTH;
            money.growth = parseFloat(monthlyGrowth.value) / 100;
        }
    }
    else if (htmlInputElement.value === "ud0ByYear") {
        const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
        if (annualGrowth === null) {
            console.log("changeUd0Rythm, #AnnualGrowth not found (for 'ud0ByYear')");
        }
        else {
            money.growthStepUnit = LibreCurrency.YEAR;
            money.prodStepUnit = LibreCurrency.YEAR;
            money.growth = parseFloat(annualGrowth.value) / 100;
        }
    }
    else {
        const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
        if (annualGrowth === null) {
            console.log("changeUd0Rythm, #AnnualGrowth not found");
        }
        else {
            money.growthStepUnit = LibreCurrency.YEAR;
            money.prodStepUnit = LibreCurrency.MONTH;
            money.growth = parseFloat(annualGrowth.value) / 100;
        }
    }
    rythmAndUD0Update(htmlInputElement);
}

function rythmAndUD0Update(htmlInputElement: HTMLInputElement) {
    d3.select("input[value=\"byMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.MONTH);
    d3.select("input[value=\"byYear\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR);
        
    d3.select("input[value=\"ud0ByMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.MONTH && money.getProdStepUnit() === LibreCurrency.MONTH);
    d3.select("input[value=\"ud0ByYear\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.YEAR);
    d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.MONTH);
        
    if (money.growthStepUnit === LibreCurrency.MONTH && money.getProdStepUnit() === LibreCurrency.MONTH) {
        const monthlyDividendStart = document.getElementById("MonthlyDividendStart") as HTMLInputElement;
        if (monthlyDividendStart === null) {
            console.log("rythmAndUD0Update, #MonthlyDividendStart not found");
        }
        else {
            money.dividendStart = parseFloat(monthlyDividendStart.value);
        }
    }
    else if (money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.YEAR) {
        const annualDividendStart = document.getElementById("AnnualDividendStart") as HTMLInputElement;
        if (annualDividendStart === null) {
            console.log("rythmAndUD0Update, #AnnualDividendStart not found");
        }
        else {
            money.dividendStart = parseFloat(annualDividendStart.value);
        }
    }
    else {
        const yearMonthDividendStart = document.getElementById("YearMonthDividendStart") as HTMLInputElement;
        if (yearMonthDividendStart === null) {
            console.log("rythmAndUD0Update, #YearMonthDividendStart not found");
        }
        else {
            money.dividendStart = parseFloat(yearMonthDividendStart.value);
        }
    }

    updateTimeXLabels();
    
    enableGrowthForms(money.calculateGrowth);
    enableUD0Forms();
    redrawCharts();
    unsetCurConfig();
    comment(htmlInputElement.value);
    pushNewHistoryState();
}

function changeLifeExpectancy(htmlInputElement: HTMLInputElement) {
    money.lifeExpectancy = parseInt(htmlInputElement.value, 10);
    redrawCharts();
    unsetCurConfig();
    updateCalculateGrowth();
    pushNewHistoryState();
}

function changeAnnualGrowth(htmlInputElement: HTMLInputElement) {
	money.growth = parseFloat(htmlInputElement.value) / 100;
    redrawCharts();
    unsetCurConfig();
    growthChanged();
    d3.select("#MonthlyGrowth").property("value", (money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeMonthlyGrowth(htmlInputElement: HTMLInputElement) {
	money.growth = parseFloat(htmlInputElement.value) / 100;
    redrawCharts();
    unsetCurConfig();
    growthChanged();
    d3.select("#AnnualGrowth").property("value", (money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
    pushNewHistoryState();
}

function changeCalculateGrowth(htmlInputElement: HTMLInputElement) {
    money.calculateGrowth = htmlInputElement.checked;
    
    enableGrowthForms(money.calculateGrowth);
    redrawCharts();
    unsetCurConfig();
    updateCalculateGrowth();
    comment(htmlInputElement.id);
    pushNewHistoryState();
}

function updateCalculateGrowth() {
    if (money.calculateGrowth) {
        d3.select("#AnnualGrowth").property("value", (money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
        d3.select("#MonthlyGrowth").property("value", (money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
        growthChanged();
    }
}

function growthChanged() {
    if (money.growthStepUnit === LibreCurrency.MONTH && money.getProdStepUnit() === LibreCurrency.MONTH) {
        d3.select("#AnnualDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
        d3.select("#YearMonthDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
    }
    else if (money.growthStepUnit === LibreCurrency.YEAR && money.getProdStepUnit() === LibreCurrency.YEAR) {
        d3.select("#MonthlyDividendStart").property("value", (money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
        d3.select("#YearMonthDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
    }
    else {
        d3.select("#AnnualDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
        d3.select("#MonthlyDividendStart").property("value", (money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
    }
}

function changeAnnualDividendStart(htmlInputElement: HTMLInputElement) {
    money.dividendStart = parseFloat(htmlInputElement.value);
    redrawCharts();
    unsetCurConfig();
    d3.select("#MonthlyDividendStart").property("value", (money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
    d3.select("#YearMonthDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeMonthlyDividendStart(htmlInputElement: HTMLInputElement) {
    money.dividendStart = parseFloat(htmlInputElement.value);
    redrawCharts();
    unsetCurConfig();
    d3.select("#AnnualDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
    d3.select("#YearMonthDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeYearMonthDividendStart(htmlInputElement: HTMLInputElement) {
    money.dividendStart = parseFloat(htmlInputElement.value);
    redrawCharts();
    unsetCurConfig();
    d3.select("#AnnualDividendStart").property("value", (money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
    d3.select("#MonthlyDividendStart").property("value", (money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
    pushNewHistoryState();
}

function changeLogScale(htmlInputElement: HTMLInputElement) {
    LibreCurrency.referenceFrames[money.referenceFrameKey].logScale = !LibreCurrency.referenceFrames[money.referenceFrameKey].logScale
    
    updateAccountYLabels();
    
    redrawCharts();
    unsetCurConfig();
    comment(htmlInputElement.id);
    pushNewHistoryState();
}

function changeStepCurves(htmlInputElement: HTMLInputElement) {
    if (htmlInputElement.checked) {
        curveType = STEP_AFTER_CURVE;
    }
    else {
        curveType = LINEAR_CURVE;
    }
    
    redrawCharts();
    unsetCurConfig();
    comment(htmlInputElement.id);
    pushNewHistoryState();
}

function changeTimeLowerBound(htmlSelectElement: HTMLSelectElement) {
    const timeLowerBound = fromYearRep(parseInt(htmlSelectElement.value, 10));
    if (timeLowerBound >= 0 && timeLowerBound < 240) {
        const oldTimeBounds = { lower: money.getTimeLowerBound(LibreCurrency.YEAR), upper: money.getTimeUpperBound(LibreCurrency.YEAR) };
        money.setTimeLowerBound(timeLowerBound); 
        updateZoom(oldTimeBounds);
        unsetCurConfig();
        d3.select("#TimeUpperBound").property("value", toYearRep(money.getTimeUpperBound(LibreCurrency.YEAR)));
        pushNewHistoryState();
    }
    else {
        d3.select("#TimeLowerBound").property("value", toYearRep(money.getTimeLowerBound(LibreCurrency.YEAR)));
    }
}

function changeTimeUpperBound(htmlSelectElement: HTMLSelectElement) {
    const timeUpperBound = fromYearRep(parseInt(htmlSelectElement.value, 10));
    if (timeUpperBound > 0 && timeUpperBound <= 240) {
        const oldTimeBounds = { lower: money.getTimeLowerBound(LibreCurrency.YEAR), upper: money.getTimeUpperBound(LibreCurrency.YEAR) };
        money.setTimeUpperBound(timeUpperBound); 
        updateZoom(oldTimeBounds);
        unsetCurConfig();
        d3.select("#TimeLowerBound").property("value", toYearRep(money.getTimeLowerBound(LibreCurrency.YEAR)));
        pushNewHistoryState();
    }
    else {
        d3.select("#TimeUpperBound").property("value", toYearRep(money.getTimeUpperBound(LibreCurrency.YEAR)));
    }
}

function changeMaxDemography(htmlSelectElement: HTMLSelectElement) {
    const maxDemography = parseInt(htmlSelectElement.value, 10);
    if (maxDemography >= 0 && maxDemography < 1000000) {
        money.maxDemography = maxDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#MaxDemography").property("value", money.maxDemography);
    }
}

function changeXMinDemography(htmlSelectElement: HTMLSelectElement) {
    const xMinDemography = fromYearRep(parseInt(htmlSelectElement.value, 10));
    if (xMinDemography >= 0 && xMinDemography < 240) {
        money.xMinDemography = xMinDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#xMinDemography").property("value", toYearRep(money.xMinDemography));
    }
}

function changeXMaxDemography(htmlSelectElement: HTMLSelectElement) {
    const xMaxDemography = fromYearRep(parseInt(htmlSelectElement.value, 10));
    if (xMaxDemography >= 1 && xMaxDemography < 239) {
        money.xMaxDemography = xMaxDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#xMaxDemography").property("value", toYearRep(money.xMaxDemography));
    }
}

function changeXMpvDemography(htmlSelectElement: HTMLSelectElement) {
    const xMpvDemography = fromYearRep(parseInt(htmlSelectElement.value, 10));
    if (xMpvDemography >= 1 && xMpvDemography < 239) {
        money.xMpvDemography = xMpvDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#xMpvDemography").property("value", toYearRep(money.xMpvDemography));
    }
}

function changePlateauDemography(htmlSelectElement: HTMLSelectElement) {
    const plateauDemography = parseInt(htmlSelectElement.value, 10);
    if (plateauDemography >= 0 && plateauDemography < 239) {
        money.plateauDemography = plateauDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#plateauDemography").property("value", money.plateauDemography);
    }
}

function changeXScaleDemography(htmlSelectElement: HTMLSelectElement) {
    const xScaleDemography = parseFloat(htmlSelectElement.value);
    if (xScaleDemography > 0) {
        money.xScaleDemography = xScaleDemography;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#xScaleDemography").property("value", money.xScaleDemography);
    }
}

function changeAccountBirth(htmlSelectElement: HTMLSelectElement) {
    const birth = fromYearRep(parseInt(htmlSelectElement.value, 10));
    const selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (birth >= 0 && birth < 240) {
        selectedAccount.birth = birth;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#AccountBirth").property("value", toYearRep(selectedAccount.birth));
    }
}

function changeAccountDuration(htmlSelectElement: HTMLSelectElement) {
    const duration = parseInt(htmlSelectElement.value, 10);
    const selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (duration > 0 && duration <= 120) {
        selectedAccount.duration = duration;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#AccountDuration").property("value", selectedAccount.duration);
    }
}

function changeAccountType(htmlSelectElement: HTMLSelectElement) {
    const selectedAccount = money.getAccount(getSelectedAccountIndex());
    selectedAccount.type = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
    
    joinAccountSelectorsToData();
    redrawCharts();
    unsetCurConfig();
    
    comment(htmlSelectElement.id);
    pushNewHistoryState();
}

function changeStartingPercentage(htmlSelectElement: HTMLSelectElement) {
    const startingPercentage = parseFloat(htmlSelectElement.value);
    const selectedAccount = money.getAccount(getSelectedAccountIndex());
    if (startingPercentage >= 0) {
        selectedAccount.startingPercentage = startingPercentage;
        redrawCharts();
        unsetCurConfig();
        pushNewHistoryState();
    }
    else {
        d3.select("#StartingPercentage").property("value", selectedAccount.startingPercentage);
    }
}

function getCurConfigJsonRep() {
    for (let i = 0; i < workshops.length; i++) {
        if (Object.keys(workshops[i].jsonRep).indexOf(curConfigId) !== -1) {
            return workshops[i].jsonRep[curConfigId];
        }
    }
    throw new Error("Configuration not managed: " + curConfigId);
}

function clickTab(tabId: string) {
    openTab(tabId);
    if (tabId === "WorkshopsTab" && curConfigId !== "none") {
        const jsonRep = getCurConfigJsonRep() as JSonRep;
        applyJSonRep(jsonRep);
        comment(curConfigId);
    }
    else {
        comment(tabId);
    }
    pushNewHistoryState();
    
    return false;
}

function clickParamInput(tabId: string, paramId: string) {
    openTab(tabId);
    const clickedParamInput = document.getElementById(paramId) as HTMLInputElement;
    if (clickedParamInput === null) {
        console.log("clickParamInput, #" + paramId + " not found");
    }
    else {
        clickedParamInput.focus();
        comment(paramId);
        pushNewHistoryState();
    }
}

function setSelectorIndex(tabId: string, modelId: number) {
    if (tabId === "AccountsTab") {
        const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
        if (accountSelector === null) {
            console.log("setSelectorIndex, #AccountSelector not found");
        }
        else {
            const toSelectIndex = money.accountIndex(modelId);
            if (accountSelector.selectedIndex !== toSelectIndex) {
                accountSelector.selectedIndex = toSelectIndex;
                updateAddedAccountArea();
            }
        }
    }
    if (tabId === "TransactionsTab") {
        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("setSelectorIndex, #TransactionSelector not found");
        }
        else {
            const toSelectIndex = money.transactionIndex(modelId);
            if (transactionSelector.selectedIndex !== toSelectIndex) {
                transactionSelector.selectedIndex = toSelectIndex;
                updateTransactionArea();
            }
        }
    }
}

type SerieAttributes = {
    class: string;
    color: string;
    chart: Chart;
};

type GuiAsJSon = {
    t : string; // curTabId
    c : string; // curConfigId
    ac : {
        hs : string[]; // accountsChart hiddenSerieIds
    },
    dc : {
        hs : string[]; // dividendChart hiddenSerieIds
    },
    hc : {
        hs : string[]; // headcountChart hiddenSerieIds
    },
    sc : {
        hs : string[]; // monetarySupplyChart hiddenSerieIds
    },
    ct: string; // curveType
    a : number; // accountSelector selectedIndex
    tr : number; // transactionSelector selectedIndex
    s : string; // curSelectedDataId
    i : number; // selectedPointIndex
    com : string; // commentedId
};

type JSonRep = {
    m: ModelAsJSon;
    g: GuiAsJSon;
};

type Workshop = {
    jsonRep: {[s: string]: JSonRep | {}};
    selectorId: string;
};
