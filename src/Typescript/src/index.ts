/**
 * Created by vit on 14/10/16.
 */
// eslint-disable-next-line no-unused-vars
class TrmInTransition {

    static readonly PADDING = {
        top: 15,
        right: 30,
        bottom: 80,
        left: 70
    };
    static readonly SIZE = {
        height: 320,
        width: 500
    }

    static readonly RANGE = {
        min: {
            x: new Date(1999, 0, 1),
            y: 0
        },
        max: {
            x: new Date(2001, 0, 1),
            y: 1
        }
    };

    static readonly TRANSITION_DURATION = 1000;

    static readonly EXP_FORMATS: {[s: string]: string} = {
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

    static readonly NONBREAKING_SPACE = String.fromCharCode(0xA0);

    static readonly DATE_PATTERN = "%d-%m-%Y";

    static readonly LINEAR_CURVE = "L";

    static readonly STEP_AFTER_CURVE = "SA";

    static readonly LOG_UNIT_SUFFIX = " [log]";

    static readonly AVERAGE_ID = "average";

    static readonly ACCOUNT_ID_PREFIX = "account";

    static readonly STABLE_AVERAGE_ID = "stableAverage";

    static readonly DIVIDEND_ID = "dividend";

    static readonly STABLE_DIVIDEND_ID = "stableDividend";

    static readonly HEADCOUNT_ID = "headcount";

    static readonly MONETARY_SUPPLY_ID = "monetarySupply";

    static readonly STABLE_MONETARY_SUPPLY_ID = "stableMonetarySupply";

    static readonly ACCOUNT_COLORS = d3.schemeCategory10;

    static readonly AVERAGE_COLOR = "#e6550d";

    static readonly STABLE_AVERAGE_COLOR = "#fdae6b";

    static readonly ACCOUNT_CHART_COLORS = TrmInTransition.accountChartColors();
    private static accountChartColors() {
        const accountChartColors = TrmInTransition.ACCOUNT_COLORS.slice();
        accountChartColors.unshift(TrmInTransition.AVERAGE_COLOR, TrmInTransition.STABLE_AVERAGE_COLOR);
        return accountChartColors;
    }

    static readonly DIVIDEND_COLOR = "#31a354";

    static readonly STABLE_DIVIDEND_COLOR = "#bd9e39";

    static readonly HEADCOUNT_COLOR = "#17becf";

    static readonly MONETARY_SUPPLY_COLOR = "#9467bd";

    static readonly STABLE_MONETARY_SUPPLY_COLOR = "#ff9896";

    static readonly AVERAGE_LABEL = "Moyenne \"M/N\"";

    static readonly STABLE_AVERAGE_LABEL = "M/N" + TrmInTransition.NONBREAKING_SPACE + "pleine";

    static readonly DIVIDEND_LABEL = "Dividende Universel";

    static readonly STABLE_DIVIDEND_LABEL = "DU pleine";

    static readonly HEADCOUNT_LABEL = "Nombre d'individus \"N\"";

    static readonly MONETARY_SUPPLY_LABEL = "Masse Monétaire \"M\"";

    static readonly STABLE_MONETARY_SUPPLY_LABEL = "Masse pleine";

    static readonly ACCOUNT_LABEL_PREFIX = "Compte";

    static readonly CO_CREATOR_LABEL = "Co-créateur";

    static readonly NON_CREATOR_LABEL = "Non-créateur";

    static readonly COMMUNITY_LABEL = "Commun";

    static readonly TRANSACTION_LABEL_PREFIX = "Transaction";

    static readonly ALL_ACCOUNTS_LABEL = "Tous";

    static readonly workshops: Workshop[] = [
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

    money = new LibreCurrency();

    // @ts-ignore
    accountsChart: Chart;
    // @ts-ignore
    dividendChart: Chart;
    // @ts-ignore
    headcountChart: Chart;
    // @ts-ignore
    monetarySupplyChart: Chart;

    curConfigId = "";
    curTabId = "";
    curSelectedDataId = "";
    selectedPointIndex = -1;
    commentedId = "";
    curveType = TrmInTransition.LINEAR_CURVE;
    paramBgColor: string = "";

    constructor() {
        const thisApp = this;
        window.addEventListener("popstate", function(e) {
            const encodedURI = e.state;

            if (encodedURI !== null) {
                thisApp.applyEncodedURI(encodedURI);
            }
        });

        TrmInTransition.initSelectors();

        this.addTabEffectsFromHtml();
        this.addParamLinksFromHtml();

        this.generateC3Charts();

        if (!this.applyEncodedURIFromLocation()) {
            this.applyJSonRep(configs1.cS0 as JSonRep);
            this.unsetCurConfig();
            this.openTab("WorkshopsTab");
            this.comment("WorkshopsTab");
            const encodedURI = this.asEncodedURI();
            window.history.replaceState(encodedURI, "", "?" + encodedURI);
        }

        this.addConfigLinksFromHtml();
        this.addChartEffectsFromHtml();
        this.initCallbacks();

        // Add date value buttons
        TrmInTransition.after(d3.selectAll(".dateValue"), "span")
            .attr("class", "increaseDate")
            .text("+")
            .on("mousedown", function() {
                d3.event.preventDefault();
                thisApp.changeTimeStep(1);
            });

        TrmInTransition.before(d3.selectAll(".dateValue"), "span")
            .attr("class", "decreaseDate")
            .text("-")
            .on("mousedown", function() {
                d3.event.preventDefault();
                thisApp.changeTimeStep(-1);
            });
    }

    static after(
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

    static before(
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


    changeTimeStep(offset: number) {
        const toSelectIndex = this.selectedPointIndex + offset;
        if (toSelectIndex >= 0) {
            const curChart = this.searchChartWithData(this.curSelectedDataId);
            const upperBound = curChart.getData(this.curSelectedDataId)[0].points.length;
            if (toSelectIndex < upperBound) {
                this.commentChartData(curChart, this.curSelectedDataId, toSelectIndex);
                this.pushNewHistoryState();
            }
        }
    }

    // Fill the forms
    fillForms() {
        d3.select("#LifeExpectancy").property("value", this.money.lifeExpectancy);
        d3.select("#AnnualDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
        d3.select("#MonthlyDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
        d3.select("#YearMonthDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
        d3.select("#TimeLowerBound").property("value", TrmInTransition.toYearRep(this.money.timeLowerBoundInYears));
        d3.select("#TimeUpperBound").property("value", TrmInTransition.toYearRep(this.money.timeUpperBoundInYears));
        d3.select("#CalculateGrowth").property("checked", this.money.calculateGrowth);
        d3.select("#LogScale").property("checked", LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale);
        d3.select("#StepCurves").property("checked", this.curveType === TrmInTransition.STEP_AFTER_CURVE);
        d3.select("input[value=\"byMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.MONTH);
        d3.select("input[value=\"byYear\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR);
        d3.select("input[value=\"ud0ByMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.MONTH && this.money.getProdStepUnit() === LibreCurrency.MONTH);
        d3.select("input[value=\"ud0ByYear\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.YEAR);
        d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.MONTH);
        d3.select("#MaxDemography").property("value", this.money.maxDemography);
        d3.select("#xMinDemography").property("value", TrmInTransition.toYearRep(this.money.xMinDemography));
        d3.select("#xMaxDemography").property("value", TrmInTransition.toYearRep(this.money.xMaxDemography));
        d3.select("#xMpvDemography").property("value", TrmInTransition.toYearRep(this.money.xMpvDemography));
        d3.select("#plateauDemography").property("value", this.money.plateauDemography);
        d3.select("#xScaleDemography").property("value", this.money.xScaleDemography);
        d3.select("#AnnualGrowth").property("value", (this.money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
        d3.select("#MonthlyGrowth").property("value", (this.money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
    }

    static toYearRep(value: number) {
        return 1999 + value;
    }

    static fromYearRep(value: number) {
        return value - 1999;
    }

    enableForms() {
        this.enableGrowthForms(this.money.calculateGrowth);
        this.enableUD0Forms();
        this.enableDemographyFields();
    }

    // generate C3 charts
    generateC3Charts() {
        this.money.generateData();
        this.generateAccountsChart();
        this.generateDividendChart();
        this.generateHeadcountChart();
        this.generateMonetarySupplyChart();
    }

    addParamLinksFromHtml() {
        const paramIdList = ["LifeExpectancy", "growth", "AnnualGrowth", "MonthlyGrowth", "UD0", "StartingPercentage", "ReferenceFrameSelector"/*, "CalculateGrowth", "AnnualDividendStart", "YearMonthDividendStart", "MonthlyDividendStart", "TimeUpperBound", "StepCurves"*/];
        
        const thisApp = this;
        paramIdList.forEach(function(paramId) {
            d3.selectAll("span." + paramId + ".ParamLink")
                .style("background-color", "#f1f1f1")
                .on("mouseover", function () {
                    const adaptedParamId = thisApp.adaptParamId(paramId);
                    const tabId = TrmInTransition.getParentTabContentId(adaptedParamId) + "Tab";

                    d3.selectAll("span." + paramId + ".ParamLink").style("background-color", "#DDDD00");
                    d3.select("#" + tabId).classed("focused", true);

                    thisApp.paramBgColor = d3.select("#" + adaptedParamId).style("background-color")
                    d3.select("#" + adaptedParamId).style("background-color", "#DDDD00");
                    TrmInTransition.showTab(tabId);

                    const paramElemId = d3.select(this).attr("id");
                    if (paramElemId) {
                        const modelId = + paramElemId.split("-")[1];
                        thisApp.setSelectorIndex(tabId, modelId);
                    }
                })
                .on("mouseout", function () {
                    const adaptedParamId = thisApp.adaptParamId(paramId);
                    const tabId = TrmInTransition.getParentTabContentId(adaptedParamId) + "Tab";

                    d3.selectAll("span." + paramId + ".ParamLink").style("background-color", "#f1f1f1");
                    d3.select("#" + tabId).classed("focused", false);

                    d3.select("#" + adaptedParamId).style("background-color", thisApp.paramBgColor);
                    TrmInTransition.showTab(thisApp.curTabId);
                })
                .on("click", function() {
                    const adaptedParamId = thisApp.adaptParamId(paramId);
                    const tabId = TrmInTransition.getParentTabContentId(adaptedParamId) + "Tab";
                    d3.select("#" + tabId).classed("focused", false);
                    thisApp.clickParamInput(tabId, adaptedParamId);
                });
        });
    }

    static getParentTabContentId(id: string) {
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

    adaptParamId(id: string) {
        switch (id) {
            case "UD0":
                if (this.money.growthStepUnit === LibreCurrency.MONTH && this.money.getProdStepUnit() === LibreCurrency.MONTH) {
                    return "MonthlyDividendStart";
                }
                else if (this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.YEAR) {
                    return "AnnualDividendStart";
                }
                else {
                    return "YearMonthDividendStart";
                }
            case "growth":
                if (this.money.growthStepUnit === LibreCurrency.MONTH) {
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
    addTabEffectsFromHtml() {
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
        
        const thisApp = this;
        tabAttributesList.forEach(function(tabAttributes) {
            d3.selectAll("span." + tabAttributes.referingClass)
                .style("background-color", "#f1f1f1")
                .on("mouseover", function () {
                    d3.selectAll("span." + tabAttributes.referingClass).style("background-color", "#dddddd");
                    d3.select("#" + tabAttributes.tabId).classed("focused", true);
                    TrmInTransition.showTab(tabAttributes.tabId);
                })
                .on("mouseout", function () {
                    d3.selectAll("span." + tabAttributes.referingClass).style("background-color", "#f1f1f1");
                    d3.select("#" + tabAttributes.tabId).classed("focused", false);
                    TrmInTransition.showTab(thisApp.curTabId);
                })
                .on("click", function() {
                    d3.select("#" + tabAttributes.tabId).classed("focused", false);
                    thisApp.clickTab(tabAttributes.tabId);
                });
        });
        this.initTransactionSpans();    
    }

    addConfigLinksFromHtml() {
        const thisApp = this;
        for (let i = 0; i < TrmInTransition.workshops.length; i++) {
            const workshopJSonRep = TrmInTransition.workshops[i].jsonRep;
            Object.keys(workshopJSonRep).forEach(function(key) {
                const configIdToSelect = key;
                d3.selectAll(".configLink." + key).on("click", function() {
                    thisApp.changeConfiguration(configIdToSelect, workshopJSonRep);
                });
            });
        }
    }

    // eslint-disable-next-line max-lines-per-function
    addChartEffectsFromHtml() {
        const thisApp = this;

        const accountSerieAttributes: SerieAttributes = {
            class: TrmInTransition.ACCOUNT_ID_PREFIX,
            color: TrmInTransition.ACCOUNT_COLORS[0], // Special case => not used
            chart: this.accountsChart
        };
        const averageSerieAttributes: SerieAttributes = {
            class: TrmInTransition.AVERAGE_ID,
            color: TrmInTransition.AVERAGE_COLOR,
            chart: this.accountsChart
        };
        const stableAverageSerieAttributes: SerieAttributes = {
            class: TrmInTransition.STABLE_AVERAGE_ID,
            color: TrmInTransition.STABLE_AVERAGE_COLOR,
            chart: this.accountsChart
        };
        const dividendSerieAttributes: SerieAttributes = {
            class: TrmInTransition.DIVIDEND_ID,
            color: TrmInTransition.DIVIDEND_COLOR,
            chart: this.dividendChart
        };
        const stableDividendSerieAttributes: SerieAttributes = {
            class: TrmInTransition.STABLE_DIVIDEND_ID,
            color: TrmInTransition.STABLE_DIVIDEND_COLOR,
            chart: this.dividendChart
        };
        const headcountSerieAttributes: SerieAttributes = {
            class: TrmInTransition.HEADCOUNT_ID,
            color: TrmInTransition.HEADCOUNT_COLOR,
            chart: this.headcountChart
        };
        const monetarySupplySerieAttributes: SerieAttributes = {
            class: TrmInTransition.MONETARY_SUPPLY_ID,
            color: TrmInTransition.MONETARY_SUPPLY_COLOR,
            chart: this.monetarySupplyChart
        };
        const stableMonetarySupplySerieAttributes: SerieAttributes = {
            class: TrmInTransition.STABLE_MONETARY_SUPPLY_ID,
            color: TrmInTransition.STABLE_MONETARY_SUPPLY_COLOR,
            chart: this.monetarySupplyChart
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
            let indexToSelect = thisApp.selectedPointIndex;

            // Depending on the targeted serie, an offset must be applied (especially for 'account' series)
            if (targetedSerieId !== thisApp.curSelectedDataId) {
                const curSelectedData = thisApp.searchChartWithData(thisApp.curSelectedDataId).getData(thisApp.curSelectedDataId)[0];
                const targetedData = thisApp.searchChartWithData(targetedSerieId).getData(targetedSerieId)[0];
                for (let j = 0; j < targetedData.points.length; j++) {
                    if (targetedData.points[j][0].getTime() === curSelectedData.points[thisApp.selectedPointIndex][0].getTime()) {
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
                return thisApp.money.previousGrowthStep(indexToSelect - 1);
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
            const curSelectedData = thisApp.searchChartWithData(thisApp.curSelectedDataId).getData(thisApp.curSelectedDataId)[0];
            const selectedPointTime = curSelectedData.points[thisApp.selectedPointIndex][0].getTime();
            
            if (LibreCurrency.referenceFrames[thisApp.money.referenceFrameKey].logScale) {
                d3.select("#LogScale").property("checked", false);
            }
            if (referenceFrameKey && thisApp.money.referenceFrameKey !== referenceFrameKey) {
                thisApp.money.referenceFrameKey = referenceFrameKey;
                thisApp.setReferenceFrameSelection();
            }
            thisApp.updateAccountYLabels();
            thisApp.redrawCharts();
            thisApp.unsetCurConfig();

            // Since new chart data are computed, search index to select 
            const clickedData = thisApp.searchChartWithData(clickedSerieId).getData(clickedSerieId)[0];
            let indexToSelect = d3.bisectLeft(clickedData.points.map(p => p[0].getTime()), selectedPointTime);
            if (serieSpan.classed("previous")) {
                indexToSelect = indexToSelect - 1;
            }
            else if (serieSpan.classed("previous2")) {
                indexToSelect = thisApp.money.previousGrowthStep(indexToSelect - 1);
            }

            thisApp.commentChartData(clickedSerieAttributes.chart, clickedSerieId, indexToSelect);
            thisApp.pushNewHistoryState();
        }

        function getTargetedSerieId(
            serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
            serieAttributes: SerieAttributes
        ) {
            const serieClass = serieAttributes.class;
            if (serieClass === TrmInTransition.ACCOUNT_ID_PREFIX) {
                const accountElemId = serieSpan.attr("id");
                if (accountElemId) {
                    const accountId = + accountElemId.split("-")[1];
                    return TrmInTransition.c3IdFromAccountId(accountId);
                }
                else {
                    return thisApp.curSelectedDataId;
                }
            }
            return serieClass;
        }

        function getSerieColor(
            serieSpan: d3.Selection<HTMLSpanElement, d3.BaseType, null, undefined>, 
            serieAttributes: SerieAttributes
        ) {
            if (serieAttributes.class === TrmInTransition.ACCOUNT_ID_PREFIX) {
                const accountElemId = serieSpan.attr("id");
                if (accountElemId) {
                    const accountId = + accountElemId.split("-")[1];
                    return TrmInTransition.ACCOUNT_COLORS[accountId - 1];
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
    initCallbacks() {
        const thisApp = this;
        for (let i = 0; i < TrmInTransition.workshops.length; i++) {
            const workshopJSonRep = TrmInTransition.workshops[i].jsonRep;
            d3.select<HTMLSelectElement, unknown>("#" + TrmInTransition.workshops[i].selectorId).on("change", function() {
                thisApp.changeConfiguration(this.options[this.selectedIndex].value, workshopJSonRep);
            });
        }
        d3.select<HTMLSelectElement, unknown>("#ReferenceFrameSelector").on("change", function() {
            thisApp.changeReferenceFrame(this);
        });
        d3.select<HTMLSelectElement, unknown>("#UdFormulaSelector").on("change", function() {
            thisApp.changeUdFormula(this);
        });
        d3.select<HTMLSelectElement, unknown>("#DemographySelector").on("change", function() {
            thisApp.changeDemographicProfile(this);
        });
        d3.select<HTMLSelectElement, unknown>("#AccountSelector").on("change", function() {
            thisApp.changeAccountSelection();
        });
        d3.select<HTMLSelectElement, unknown>("#TransactionSelector").on("change", function() {
            thisApp.changeTransactionSelection();
        });
        d3.select<HTMLSelectElement, unknown>("#TransactionSrc").on("change", function() {
            thisApp.changeTransactionSrcSelection();
        });
        d3.select<HTMLSelectElement, unknown>("#TransactionDest").on("change", function() {
            thisApp.changeTransactionDestSelection();
        });
        d3.select<HTMLSelectElement, unknown>("#TransactionRef").on("change", function() {
            thisApp.changeTransactionRefSelection(this);
        });
        
        d3.selectAll<HTMLInputElement, unknown>(".rythm").on("change", function() {
            thisApp.changeRythm(this);
        });
        d3.selectAll<HTMLInputElement, unknown>(".ud0Rythm").on("change", function() {
            thisApp.changeUd0Rythm(this);
        });

        d3.select("#AddAccount").on("click", thisApp.clickAddAccount);
        d3.select("#DeleteAccount").on("click", thisApp.clickDeleteAccount);

        d3.select("#AddTransaction").on("click", thisApp.clickAddTransaction);
        d3.select("#DeleteTransaction").on("click", thisApp.clickDeleteTransaction);

        d3.select<HTMLInputElement, unknown>("#LifeExpectancy").on("change", function() {
            thisApp.changeLifeExpectancy(this);
        });
        d3.select<HTMLInputElement, unknown>("#AnnualGrowth").on("change", function() {
            thisApp.changeAnnualGrowth(this);
        });
        d3.select<HTMLInputElement, unknown>("#MonthlyGrowth").on("change", function() {
            thisApp.changeMonthlyGrowth(this);
        });
        d3.select<HTMLInputElement, unknown>("#CalculateGrowth").on("click", function() {
            thisApp.changeCalculateGrowth(this);
        });
        d3.select<HTMLInputElement, unknown>("#AnnualDividendStart").on("change", function() {
            thisApp.changeAnnualDividendStart(this);
        });
        d3.select<HTMLInputElement, unknown>("#MonthlyDividendStart").on("change", function() {
            thisApp.changeMonthlyDividendStart(this);
        });
        d3.select<HTMLInputElement, unknown>("#YearMonthDividendStart").on("change", function() {
            thisApp.changeYearMonthDividendStart(this);
        });
        d3.select<HTMLInputElement, unknown>("#LogScale").on("click", function() {
            thisApp.changeLogScale(this);
        });
        d3.select<HTMLInputElement, unknown>("#StepCurves").on("click", function() {
            thisApp.changeStepCurves(this);
        });
        d3.select<HTMLSelectElement, unknown>("#TimeLowerBound").on("change", function() {
            thisApp.changeTimeLowerBound(this);
        });
        d3.select<HTMLSelectElement, unknown>("#TimeUpperBound").on("change", function() {
            thisApp.changeTimeUpperBound(this);
        });
        d3.select<HTMLSelectElement, unknown>("#MaxDemography").on("change", function() {
            thisApp.changeMaxDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#xMinDemography").on("change", function() {
            thisApp.changeXMinDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#xMaxDemography").on("change", function() {
            thisApp.changeXMaxDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#xMpvDemography").on("change", function() {
            thisApp.changeXMpvDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#plateauDemography").on("change", function() {
            thisApp.changePlateauDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#xScaleDemography").on("change", function() {
            thisApp.changeXScaleDemography(this);
        });
        d3.select<HTMLSelectElement, unknown>("#AccountBirth").on("change", function() {
            thisApp.changeAccountBirth(this);
        });
        d3.select<HTMLSelectElement, unknown>("#AccountDuration").on("change", function() {
            thisApp.changeAccountDuration(this);
        });
        d3.select<HTMLSelectElement, unknown>("#TypeSelector").on("change", function() {
            thisApp.changeAccountType(this);
        });
        d3.select<HTMLSelectElement, unknown>("#StartingPercentage").on("change", function() {
            thisApp.changeStartingPercentage(this);
        });
        d3.select<HTMLInputElement, unknown>("#TransactionYear").on("change", function() {
            thisApp.changeTransactionYear(this);
        });
        d3.select<HTMLInputElement, unknown>("#TransactionRep").on("change", function() {
            thisApp.changeTransactionRep(this);
        });
        d3.select<HTMLInputElement, unknown>("#TransactionAmount").on("change", function() {
            thisApp.changeTransactionAmount(this);
        });
        
        d3.selectAll<HTMLSpanElement, unknown>(".tablinks").on("click", function() {
            thisApp.clickTab(this.id);
        });

        d3.selectAll<HTMLInputElement, unknown>("input[type=\"text\"]").on("click", function() {
            thisApp.comment(this.id);
        });
    }

    asEncodedURI() {
        const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
        if (accountSelector === null) {
            console.log("asEncodedURI, #AccountSelector not found");
        }

        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("asEncodedURI, #TransactionSelector not found");
        }

        const moneyAsJSon = this.money.asJSonRep();
        const guiAsJSon: GuiAsJSon = {
            t : this.curTabId,
            c : this.curConfigId,
            ac : {
                hs : this.accountsChart.getHiddenSerieIds()
            },
            dc : {
                hs : this.dividendChart.getHiddenSerieIds()
            },
            hc : {
                hs : this.headcountChart.getHiddenSerieIds()
            },
            sc : {
                hs : this.monetarySupplyChart.getHiddenSerieIds()
            },
            ct: this.curveType,
            a : accountSelector === null ? 0 : accountSelector.selectedIndex,
            tr : transactionSelector === null ? 0 : transactionSelector.selectedIndex,
            s : this.curSelectedDataId,
            i : this.selectedPointIndex,
            com : this.commentedId
        };
        const jsonRep: JSonRep = {
            m : moneyAsJSon,
            g : guiAsJSon
        };
        const stringRep = JSON.stringify(jsonRep);
        const encodedURI = LZString.compressToEncodedURIComponent(stringRep);
        return encodedURI;
    }

    applyEncodedURIFromLocation() {
        if (window.location.search.length > 1) {
            const encodedURI = window.location.search.substr(1);
            return this.applyEncodedURI(encodedURI);
        }
        return false;
    }

    applyEncodedURI(encodedURI: string) {
        const stringRep = LZString.decompressFromEncodedURIComponent(encodedURI);
        if (stringRep !== null && stringRep.length !== 0) {
            const jsonRep = JSON.parse(stringRep);
            this.applyJSonRep(jsonRep);
            return true;
        }
        return false;
    }

    applyJSonRep(jsonRep: JSonRep) {
        const thisApp = this;
        // If current X range has changed, apply zoom first (except if no serie is already drawn)
        let zoomTransition;
        if (!d3.selectAll(".serieGroup").empty() && 
                ((this.money.timeLowerBoundInYears !== jsonRep.m.tm)
                || (this.money.timeUpperBoundInYears !== jsonRep.m.tM))) {
            const oldTimeBounds = { lower: this.money.getTimeLowerBound(LibreCurrency.YEAR), upper: this.money.getTimeUpperBound(LibreCurrency.YEAR) };
            this.money.setTimeLowerBound(jsonRep.m.tm); 
            this.money.setTimeUpperBound(jsonRep.m.tM);
            zoomTransition = this.updateZoom(oldTimeBounds);
        }
        if (zoomTransition) {
            zoomTransition
                .on("end", function(_p,j) {
                    // If transition 0 is ended, no need to wait the others, they are virtually ended
                    if (j === 0) {
                        // Finalize drawing (do a chained transition)  
                        thisApp.applyJSonRepFinal(jsonRep);
                        const encodedURI = thisApp.asEncodedURI();
                        window.history.replaceState(encodedURI, "", "?" + encodedURI);
                    }
                });
        } else {
            this.applyJSonRepFinal(jsonRep);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    applyJSonRepFinal(jsonRep: JSonRep) {
        const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
        if (accountSelector === null) {
            console.log("applyJSonRepFinal, #AccountSelector not found");
        }

        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("applyJSonRepFinal, #TransactionSelector not found");
        }

        this.curveType = jsonRep.g.ct;
        this.money.applyJSonRep(jsonRep.m);
        
        this.unselectChartPoints();
        this.fillForms();
        this.enableForms();

        this.joinAccountSelectorsToData();
        if (accountSelector !== null) {
            accountSelector.selectedIndex = jsonRep.g.a;
        }
        
        this.joinTransactionSelectorToData();
        if (transactionSelector !== null) {
            transactionSelector.selectedIndex = jsonRep.g.tr;
        }

        this.curConfigId = jsonRep.g.c;
        this.setConfigSelection();
        
        this.setReferenceFrameSelection();
        this.setUdFormulaSelection();
        this.setDemographySelection();
        
        this.updateAddedAccountArea();
        this.updateTimeXLabels();
        this.updateAccountYLabels();
        this.updateTransactionArea();

        this.accountsChart.hide(jsonRep.g.ac.hs);
        this.dividendChart.hide(jsonRep.g.dc.hs);
        this.headcountChart.hide(jsonRep.g.hc.hs);
        this.monetarySupplyChart.hide(jsonRep.g.sc.hs);
        this.redrawCharts();

        this.openTab(jsonRep.g.t);
        if (jsonRep.g.s) {
            const chart = this.searchChartWithData(jsonRep.g.s);
            this.commentChartData(chart, jsonRep.g.s, jsonRep.g.i);
        }
        else {
            this.comment(jsonRep.g.com);
        }
    }
        
    // Init the different selectors
    static initSelectors() {
        for (let i = 0; i < TrmInTransition.workshops.length; i++) {
            TrmInTransition.feedConfigSelector(TrmInTransition.workshops[i]);
        }
        TrmInTransition.feedReferenceFrameSelectors();
        TrmInTransition.feedUdFormulaSelector();
        TrmInTransition.feedAccountTypeSelector();
        TrmInTransition.feedDemographySelector();
    }

    // Create configuration selector
    static feedConfigSelector(workshop: Workshop) {
        d3.select("#" + workshop.selectorId).selectAll("option")
            .data(Object.keys(workshop.jsonRep))
        .enter().append("option")
            .text(function(confKey) { return TrmInTransition.getConfigLabel(confKey); })
            .attr("value", function(confKey) { return confKey; });
            
        d3.select("#" + workshop.selectorId).selectAll("option").filter(confKey => confKey === "none")
            .attr("disabled", true);
    }

    setConfigSelection() {
        for (let i = 0; i < TrmInTransition.workshops.length; i++) {
            const selectedIndex = Object.keys(TrmInTransition.workshops[i].jsonRep).indexOf(this.curConfigId);
            if (selectedIndex !== -1) {
                const wsConfigSelector = document.getElementById(TrmInTransition.workshops[i].selectorId) as HTMLSelectElement;
                if (wsConfigSelector === null) {
                    console.log("setConfigSelection, #", TrmInTransition.workshops[i].selectorId, " not found");
                    continue;
                }
                wsConfigSelector.selectedIndex = selectedIndex;
                for (let j = 0; j < TrmInTransition.workshops.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    const curConfigSelector = document.getElementById(TrmInTransition.workshops[j].selectorId) as HTMLSelectElement;
                    if (curConfigSelector === null) {
                        console.log("setConfigSelection, #", TrmInTransition.workshops[j].selectorId, " not found");
                    }
                    else {
                        curConfigSelector.selectedIndex = 0;
                    }
                }
                return;
            }
        }
        console.log("Configuration not managed: " + this.curConfigId);
    }

    unsetCurConfig() {
        this.curConfigId = "none";
        this.setConfigSelection();
    }

    // Create reference frame selectors
    static feedReferenceFrameSelectors() {
        const referenceKeys = Object.keys(LibreCurrency.referenceFrames);
        TrmInTransition.feedReferenceFrameSelector(referenceKeys.slice(0, referenceKeys.length - 1), "ReferenceFrameSelector");
        TrmInTransition.feedReferenceFrameSelector(referenceKeys, "TransactionRef");
    }

    static feedReferenceFrameSelector(referenceKeys: string[], selectorId: string) {
        d3.select("#" + selectorId).selectAll("option")
            .data(referenceKeys)
        .enter().append("option")
            .text(refKey => TrmInTransition.getRefLabel(refKey))
            .attr("value", refKey => refKey);
    }

    setReferenceFrameSelection() {
        const selectedIndex = Object.keys(LibreCurrency.referenceFrames).indexOf(this.money.referenceFrameKey);
        if (selectedIndex === -1) {
            throw new Error("Reference frame not managed: " + this.money.referenceFrameKey);
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
    static feedUdFormulaSelector() {
        d3.select("#UdFormulaSelector").selectAll("option")
            .data(Object.keys(LibreCurrency.udFormulas))
        .enter().append("option")
            .text(formulaKey => TrmInTransition.getUdFormulaLabel(formulaKey))
            .attr("value", formulaKey => formulaKey);
    }

    setUdFormulaSelection() {
        const selectedIndex = Object.keys(LibreCurrency.udFormulas).indexOf(this.money.udFormulaKey);
        if (selectedIndex === -1) {
            throw new Error("Reference frame not managed: " + this.money.udFormulaKey);
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
    static feedAccountTypeSelector() {
        d3.select("#TypeSelector").selectAll("option")
            .data(LibreCurrency.ACCOUNT_TYPES)
        .enter().append("option")
            .text(accountType => TrmInTransition.getAccountTypeLabel(accountType))
            .attr("value", accountType => accountType);
    }

    // Create demographic profile selector
    static feedDemographySelector() {
        d3.select("#DemographySelector").selectAll("option")
            .data(Object.keys(LibreCurrency.demographicProfiles))
        .enter().append("option")
            .text(profileKey => TrmInTransition.getDemographicProfileLabel(profileKey))
            .attr("value", profileKey => profileKey);
    }

    setDemographySelection() {
        const selectedIndex = Object.keys(LibreCurrency.demographicProfiles).indexOf(this.money.demographicProfileKey);
        if (selectedIndex === -1) {
            throw new Error("Reference frame not managed: " + this.money.demographicProfileKey);
        }
        const demographySelector = document.getElementById("DemographySelector") as HTMLSelectElement;
        if (demographySelector === null) {
            console.log("setDemographySelection, #DemographySelector not found");
        }
        else {
            demographySelector.selectedIndex = selectedIndex;
        }
    }

    // Join (via D3) account selectors to 'this.money.accounts'
    joinAccountSelectorsToData() {
        TrmInTransition.joinAccountSelectorToData("AccountSelector", this.money.accounts, TrmInTransition.accountName2);
        TrmInTransition.joinAccountSelectorToData("TransactionSrc", this.money.accounts, TrmInTransition.accountName1);
        TrmInTransition.joinAccountSelectorToData("TransactionDest", this.money.accounts, TrmInTransition.accountName1);
        // Add 'ALL_ACCOUNT' to the end of the transaction selectors
        TrmInTransition.joinAccountSelectorToData("TransactionSrc", this.getTransAccounts(), TrmInTransition.accountName1);
        TrmInTransition.joinAccountSelectorToData("TransactionDest", this.getTransAccounts(), TrmInTransition.accountName1);
    }

    static joinAccountSelectorToData(
        accountSelectorId: string, 
        accounts: MAccount[], 
        nameFunc: (account: MAccount) => string)
    {
        const options = d3.select("#" + accountSelectorId)
            .selectAll<HTMLOptionElement, MAccount>("option")
            .data(accounts, function(account) { return account.id; });
                
        options.text(nameFunc);
        
        options.enter().append("option")
            .text(nameFunc)
            .attr("value", function(account) { return account.id; })
            
        options.exit().remove();
    }

    // Join (via D3) transaction selector to 'this.money.transactions'
    joinTransactionSelectorToData() {
        const options = d3.select("#TransactionSelector")
            .selectAll<HTMLOptionElement, Transaction>("option")
            .data(this.money.transactions, function(transaction) { return transaction.id; });
                
        options.text(transaction => TrmInTransition.transactionName(transaction));
        
        options.enter().append("option")
            .text(transaction => TrmInTransition.transactionName(transaction))
            .attr("value", transaction => transaction.id)
            
        options.exit().remove();
    }

    // eslint-disable-next-line max-lines-per-function
    generateAccountsData() {
        const thisApp = this;
        const accountsData: SeriesData = {
            names: {
                "average": TrmInTransition.AVERAGE_LABEL,
                "stableAverage": TrmInTransition.STABLE_AVERAGE_LABEL
            },
            series: [],
            repTypes: {
                average: Chart.AREA,
                stableAverage: Chart.LINE
            },
            onclick: function(serie, i) {
                thisApp.commentChartData(thisApp.accountsChart, serie.id, i);
                thisApp.pushNewHistoryState();
            }
        }

        const averageSerie: Serie = {
            id: TrmInTransition.AVERAGE_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.averages.x.length; i++) {
            averageSerie.points.push([this.asDate(this.money.averages.x[i]), this.money.averages.y[i]]);
        }
        accountsData.series.push(averageSerie);
        
        const stableAverageSerie: Serie = {
            id: TrmInTransition.STABLE_AVERAGE_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.stableAverages.x.length; i++) {
            stableAverageSerie.points.push([this.asDate(this.money.stableAverages.x[i]), this.money.stableAverages.y[i]]);
        }
        accountsData.series.push(stableAverageSerie);
        
        // Depending on X axis bounds, some accounts are not visible
        for (let iAccount = 0; iAccount < this.money.accounts.length; iAccount++) {
            const accountSerie: Serie = {
                id: TrmInTransition.c3IdFromAccountId(this.money.accounts[iAccount].id),
                points: [],
                linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
            };
            if (this.money.accounts[iAccount].x.length > 1) {
                for (let i = 0; i < this.money.accounts[iAccount].x.length; i++) {
                    accountSerie.points.push([this.asDate(this.money.accounts[iAccount].x[i]), this.money.accounts[iAccount].y[i]]);
                }
                accountsData.series.push(accountSerie);
                accountsData.names[accountSerie.id] = TrmInTransition.accountName3(this.money.accounts[iAccount]);
                accountsData.repTypes[accountSerie.id] = Chart.LINE;
            }
        }

        return accountsData;
    }

    unselectChartPoints() {
        this.curSelectedDataId = "";
        this.selectedPointIndex = -1;
        const charts = [this.accountsChart, this.dividendChart, this.headcountChart, this.monetarySupplyChart];
        charts.forEach(function(c) {
            c.unselect();
        });
    }

    generateDividendData() {
        const thisApp = this;
        const dividendData: SeriesData = {
            names: {
                "dividend": `${TrmInTransition.DIVIDEND_LABEL} (${this.universalDividendName()})`,
                "stableDividend": TrmInTransition.STABLE_DIVIDEND_LABEL
            },
            series: [],
            repTypes: {
                dividend: Chart.AREA,
                stableDividend: Chart.LINE
            },
            onclick: function(serie, i) {
                thisApp.commentChartData(thisApp.dividendChart, serie.id, i);
                thisApp.pushNewHistoryState();
            }
        };

        const dividendSerie: Serie = {
            id: TrmInTransition.DIVIDEND_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.dividends.x.length; i++) {
            dividendSerie.points.push([this.asDate(this.money.dividends.x[i]), this.money.dividends.y[i]]);
        }
        dividendData.series.push(dividendSerie);
        
        const stableDividendSerie: Serie = {
            id: TrmInTransition.STABLE_DIVIDEND_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.stableDividends.x.length; i++) {
            stableDividendSerie.points.push([this.asDate(this.money.stableDividends.x[i]), this.money.stableDividends.y[i]]);
        }
        dividendData.series.push(stableDividendSerie);
        
        return dividendData;
    }

    generateHeadcountData() {
        const thisApp = this;
        const headcountData: SeriesData = {
            names: {
                "headcount": TrmInTransition.HEADCOUNT_LABEL + " (" + TrmInTransition.getDemographicProfileLabel(this.money.demographicProfileKey) + ")"
            },
            series: [],
            repTypes: {
                headcount: Chart.AREA
            },
            onclick: function(serie, i) {
                thisApp.commentChartData(thisApp.headcountChart, serie.id, i);
                thisApp.pushNewHistoryState();
            }
        };

        const headcountSerie: Serie = {
            id: TrmInTransition.HEADCOUNT_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.headcounts.x.length; i++) {
            headcountSerie.points.push([this.asDate(this.money.headcounts.x[i]), this.money.headcounts.y[i]]);
        }
        headcountData.series.push(headcountSerie);
        
        return headcountData;
    }
        
    generateMonetarySupplyData() {
        const thisApp = this;
        const monetarySupplyData: SeriesData = {
            names: {
                "monetarySupply": TrmInTransition.MONETARY_SUPPLY_LABEL,
                "stableMonetarySupply": TrmInTransition.STABLE_MONETARY_SUPPLY_LABEL
            },
            series: [],
            repTypes: {
                monetarySupply: Chart.AREA,
                stableMonetarySupply: Chart.LINE
            },
            onclick: function(serie, i) {
                thisApp.commentChartData(thisApp.monetarySupplyChart, serie.id, i);
                thisApp.pushNewHistoryState();
            }
        };

        const monetarySupplySerie: Serie = {
            id: TrmInTransition.MONETARY_SUPPLY_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.monetarySupplies.x.length; i++) {
            monetarySupplySerie.points.push([this.asDate(this.money.monetarySupplies.x[i]), this.money.monetarySupplies.y[i]]);
        }
        monetarySupplyData.series.push(monetarySupplySerie);
        
        const stableMonetarySupplySerie: Serie = {
            id: TrmInTransition.STABLE_MONETARY_SUPPLY_ID,
            points: [],
            linkType: (this.curveType === TrmInTransition.LINEAR_CURVE) ? Chart.LINEAR_CURVE : Chart.STEP_AFTER_CURVE
        };
        for (let i = 0; i < this.money.stableMonetarySupplies.x.length; i++) {
            stableMonetarySupplySerie.points.push([this.asDate(this.money.stableMonetarySupplies.x[i]), this.money.stableMonetarySupplies.y[i]]);
        }
        monetarySupplyData.series.push(stableMonetarySupplySerie);
        
        return monetarySupplyData;
    }

    static c3IdFromAccountId(accountId: number) {
        return TrmInTransition.ACCOUNT_ID_PREFIX + accountId;
    }

    static idFromC3AccountId(c3AccountId: string) {
        if (c3AccountId.substr(0, TrmInTransition.ACCOUNT_ID_PREFIX.length) === TrmInTransition.ACCOUNT_ID_PREFIX) {
            return parseInt(c3AccountId.substring(TrmInTransition.ACCOUNT_ID_PREFIX.length), 10);
        }
        throw new Error(c3AccountId + " doesn't start with the expected prefix: " + TrmInTransition.ACCOUNT_ID_PREFIX);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    static getConfigLabel(configKey: string) {
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

    static getRefLabel(referenceFrameKey: string) {
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
        return refLabel;
    }

    static getRefUnitLabel1(referenceFrameKey: string) {
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

    static getRefUnitLabel2(referenceFrameKey: string) {
        let refUnitLabel = TrmInTransition.getRefUnitLabel1(referenceFrameKey);
        if (referenceFrameKey === LibreCurrency.MONETARY_UNIT_REF_KEY) {
            refUnitLabel = "unités monétaires";
        }
        return refUnitLabel;
    }

    getRefUnitLabel3(referenceFrameKey: string) {
        let refUnitLabel = TrmInTransition.getRefUnitLabel2(referenceFrameKey);
        if (LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale) {
            refUnitLabel = refUnitLabel + TrmInTransition.LOG_UNIT_SUFFIX;
        }
        return refUnitLabel;
    }

    static getUdFormulaLabel(udFormulaKey: string) {
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

    static getAccountTypeLabel(type: string) {
        switch(type) {
            case LibreCurrency.CO_CREATOR:
                return TrmInTransition.CO_CREATOR_LABEL;
            case LibreCurrency.NON_CREATOR:
                return TrmInTransition.NON_CREATOR_LABEL;
            case LibreCurrency.COMMUNITY:
                return TrmInTransition.COMMUNITY_LABEL;
            default:
                throw new Error("Account type not managed: " + type);
        }
    }

    static getDemographicProfileLabel(demographicProfileKey: string) {
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

    // create and display chart from this.money.accounts
    generateAccountsChart() {
        const thisApp = this;
        this.accountsChart = new Chart({
            bindto: "#AccountsChart",
            padding: TrmInTransition.PADDING,
            size: TrmInTransition.SIZE,
            axis: {
                x: {
                    label: {
                        text: this.timeLabel()
                    },
                    tick: {
                        format: TrmInTransition.DATE_PATTERN
                    },
                    min: this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                    max: this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
                },
                y: {
                    label: {
                        text: this.accountYLabel()
                    },
                    tick: {
                        format: TrmInTransition.tickFormat
                    },
                    intMode: false
                },
                rangeVal: TrmInTransition.RANGE
            },
            legend: {
                item: {
                    onclick: function (id) {
                        thisApp.accountsChart.toggle(id);
                        thisApp.unsetCurConfig();
                        thisApp.pushNewHistoryState();
                    }
                }
            },
            data: this.generateAccountsData(),
            color: {
                pattern: TrmInTransition.ACCOUNT_CHART_COLORS
            },
            transition: {
                duration: TrmInTransition.TRANSITION_DURATION
            }
        });
    }

    // create and display chart from this.money.dividend
    generateDividendChart() {
        const thisApp = this;
        this.dividendChart = new Chart({
            bindto: "#DividendChart",
            padding: TrmInTransition.PADDING,
            size: TrmInTransition.SIZE,
            axis: {
                x: {
                    label: {
                        text: this.timeLabel()
                    },
                    tick: {
                        format: TrmInTransition.DATE_PATTERN
                    },
                    min: this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                    max: this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
                },
                y: {
                    label: {
                        text: this.accountYLabel()
                    },
                    tick: {
                        format: TrmInTransition.tickFormat
                    },
                    intMode: false
                },
                rangeVal: TrmInTransition.RANGE
            },
            legend: {
                item: {
                    onclick: function (id) {
                        thisApp.dividendChart.toggle(id);
                        thisApp.unsetCurConfig();
                        thisApp.pushNewHistoryState();
                    }
                }
            },
            data: this.generateDividendData(),
            color: {
                pattern: [TrmInTransition.DIVIDEND_COLOR, TrmInTransition.STABLE_DIVIDEND_COLOR]
            },
            transition: {
                duration: TrmInTransition.TRANSITION_DURATION
            }
        });
    }

    // create and display chart from this.money.headcount
    generateHeadcountChart() {
        const thisApp = this;
        this.headcountChart = new Chart({
            bindto: "#HeadcountChart",
            padding: TrmInTransition.PADDING,
            size: TrmInTransition.SIZE,
            axis: {
                x: {
                    label: {
                        text: this.timeLabel()
                    },
                    tick: {
                        format: TrmInTransition.DATE_PATTERN
                    },
                    min: this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                    max: this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
                },
                y: {
                    label: {
                        text: "Nombre d'individus"
                    },
                    tick: {
                        format: d3.format("d")
                    },
                    intMode: true
                },
                rangeVal: TrmInTransition.RANGE
            },
            legend: {
                item: {
                    onclick: function (id) {
                        thisApp.headcountChart.toggle(id);
                        thisApp.unsetCurConfig();
                        thisApp.pushNewHistoryState();
                    }
                }
            },
            data: this.generateHeadcountData(),
            color: {
                pattern: [TrmInTransition.HEADCOUNT_COLOR]
            },
            transition: {
                duration: TrmInTransition.TRANSITION_DURATION
            }
        });
    }

    // create and display chart from this.money.monetarySupply
    generateMonetarySupplyChart() {
        const thisApp = this;
        this.monetarySupplyChart = new Chart({
            bindto: "#MonetarySupplyChart",
            padding: TrmInTransition.PADDING,
            size: TrmInTransition.SIZE,
            axis: {
                x: {
                    label: {
                        text: this.timeLabel()
                    },
                    tick: {
                        format: TrmInTransition.DATE_PATTERN
                    },
                    min: this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR),
                    max: this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR)
                },
                y: {
                    label: {
                        text: this.accountYLabel()
                    },
                    tick: {
                        format: TrmInTransition.tickFormat
                    },
                    intMode: false
                },
                rangeVal: TrmInTransition.RANGE
            },
            legend: {
                item: {
                    onclick: function (id) {
                        thisApp.monetarySupplyChart.toggle(id);
                        thisApp.unsetCurConfig();
                        thisApp.pushNewHistoryState();
                    }
                }
            },
            data: this.generateMonetarySupplyData(),
            color: {
                pattern: [TrmInTransition.MONETARY_SUPPLY_COLOR, TrmInTransition.STABLE_MONETARY_SUPPLY_COLOR]
            },
            transition: {
                duration: TrmInTransition.TRANSITION_DURATION
            }
        });
    }

    static tickFormat(value: number) {
        const f = d3.format(".2s");
        return TrmInTransition.withExp(f(value));
    }

    static commentFormat(value: number) {
        // const isInfinite = LibreCurrency.isInfinite(value);
        if (value === Number.NEGATIVE_INFINITY) {
            return "-Infini";
        }
        if (value === Number.POSITIVE_INFINITY) {
            return "+Infini";
        }
        const f = d3.format(".3s");
        return TrmInTransition.withExp(f(value));
    }

    static withExp(siValue: string) {
        const siStr: RegExpExecArray | null = /[yzafpnµmkMGTPEZY]/.exec(siValue)
        if (siStr !== null) {
            return siValue.replace(siStr[0], TrmInTransition.NONBREAKING_SPACE + "E" + TrmInTransition.EXP_FORMATS[siStr[0]]);
        }
        return siValue;
    }

    /**
     * Update chart data and redraw
     */
    redrawCharts() {

        // calculate C3 data
        this.money.generateData();
        const accountsData = this.generateAccountsData();
        const dividendData = this.generateDividendData();
        const headcountData = this.generateHeadcountData();
        const monetarySupplyData = this.generateMonetarySupplyData();

        // reload data in chart
        this.accountsChart.load(accountsData);
        this.dividendChart.load(dividendData);
        this.headcountChart.load(headcountData);
        this.monetarySupplyChart.load(monetarySupplyData);
        
        const lowerBoundDate = this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
        const upperBoundDate = this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
        this.accountsChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.dividendChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.headcountChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.monetarySupplyChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

        this.accountsChart.draw();
        this.dividendChart.draw();
        this.headcountChart.draw();
        this.monetarySupplyChart.draw();
    }

    updateZoom(oldTimeBounds: TimeStepBounds) {
        // calculate C3 data
        this.money.generateData({ 
            lower: Math.min(this.money.getTimeLowerBound(), this.money.toTimeStep(oldTimeBounds.lower, LibreCurrency.YEAR)), 
            upper: Math.max(this.money.getTimeUpperBound(), this.money.toTimeStep(oldTimeBounds.upper, LibreCurrency.YEAR))
        });
        const accountsData = this.generateAccountsData();
        const dividendData = this.generateDividendData();
        const headcountData = this.generateHeadcountData();
        const monetarySupplyData = this.generateMonetarySupplyData();

        // reload data in chart
        this.accountsChart.load(accountsData);
        this.dividendChart.load(dividendData);
        this.headcountChart.load(headcountData);
        this.monetarySupplyChart.load(monetarySupplyData);
        
        const lowerBoundDate = this.asDate(this.money.getTimeLowerBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
        const upperBoundDate = this.asDate(this.money.getTimeUpperBound(LibreCurrency.YEAR), LibreCurrency.YEAR);
        this.accountsChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.dividendChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.headcountChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});
        this.monetarySupplyChart.axisRange({min: {x: lowerBoundDate}, max: {x: upperBoundDate}});

        // If the transition of one of the charts is ended, no need to wait the others, they are virtually ended
        this.accountsChart.updateZoom();
        this.dividendChart.updateZoom();
        this.headcountChart.updateZoom();
        return this.monetarySupplyChart.updateZoom();
    }

    searchChartWithData(c3DataId: string) {
        const charts = [this.accountsChart, this.dividendChart, this.headcountChart, this.monetarySupplyChart];
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
    deleteAccount() {
        const selectedAccountIndex = TrmInTransition.getSelectedAccountIndex();
        if (this.money.deleteAccount(selectedAccountIndex)) {
            this.redrawCharts();
            this.unsetCurConfig();
            this.joinAccountSelectorsToData();

            const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
            if (accountSelector === null) {
                console.log("deleteAccount, #AccountSelector not found");
            }
            else {
                accountSelector.selectedIndex = selectedAccountIndex - 1;
            }

            this.updateAddedAccountArea();
        }
    }

    updateAddedAccountArea() {
        const selectedAccount = this.money.getAccount(TrmInTransition.getSelectedAccountIndex());
        d3.select("#AccountBirth").property("value", TrmInTransition.toYearRep(selectedAccount.birth));
        d3.select("#AccountDuration").property("value", selectedAccount.duration);

        const typeSelector = document.getElementById("TypeSelector") as HTMLSelectElement;
        if (typeSelector === null) {
            console.log("updateAddedAccountArea, #TypeSelector not found");
        }
        else {
            typeSelector.selectedIndex = LibreCurrency.ACCOUNT_TYPES.indexOf(selectedAccount.type);
        }

        d3.select("#StartingPercentage").property("value", selectedAccount.startingPercentage);
        TrmInTransition.enableAddedAccountArea();
    }

    static getSelectedAccountIndex() {
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
    addAccount() {
        this.money.addAccount();
        
        this.redrawCharts();
        this.unsetCurConfig();
        this.joinAccountSelectorsToData();

        const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
        if (accountSelector === null) {
            console.log("addAccount, #AccountSelector not found");
        }
        else {
            accountSelector.selectedIndex = this.money.accounts.length - 1;
        }

        this.updateAddedAccountArea();
    }

    static accountName1(account: MAccount) {
        if (account === LibreCurrency.ALL_ACCOUNT) {
            return TrmInTransition.ALL_ACCOUNTS_LABEL;
        }
        return `${TrmInTransition.ACCOUNT_LABEL_PREFIX} ${account.id}`;
    }

    static accountName2(account: MAccount) {
        return `${TrmInTransition.accountName1(account)} (${TrmInTransition.accountTypeLabel(account)})`;
    }

    static accountName3(account: MAccount) {
        return `${TrmInTransition.accountName1(account)} (${TrmInTransition.accountTypeLabel(account)}, ${account.startingPercentage})`;
    }

    static accountTypeLabel(account: MAccount) {
        if (LibreCurrency.isCoCreator(account)) {
            return TrmInTransition.CO_CREATOR_LABEL;
        }
        else if (LibreCurrency.isNonCreator(account)) {
            return TrmInTransition.NON_CREATOR_LABEL;
        }
        else if (LibreCurrency.isCommunity(account)) {
            return TrmInTransition.COMMUNITY_LABEL;
        }
        else {
            throw new Error("Unknown account type: " + account.type);
        }
    }

    accountAgeLabel(account: MAccount, timeStep: number) {
        let year = 0;
        let month = 0;
        if (this.money.getProdStepUnit() === LibreCurrency.MONTH) {
            year = Math.trunc(timeStep / 12) - account.birth;
            month = timeStep % 12;
        }
        else if (this.money.getProdStepUnit() === LibreCurrency.YEAR) {
            year = timeStep - account.birth;
            month = 0;
        }
        else {
            throw new Error("Time resolution not managed: " + this.money.getProdStepUnit());
        }
        if (year === 0 && month === 0) {
            if (this.money.getProdStepUnit() === LibreCurrency.MONTH) {
                return "0 mois";
            }
            else if (this.money.getProdStepUnit() === LibreCurrency.YEAR) {
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
    deleteTransaction() {
        const selectedTransactionIndex = TrmInTransition.getSelectedTransactionIndex();
        const transactions = this.money.deleteTransaction(selectedTransactionIndex);
        // If transaction deleted...
        if (transactions.length > 0) {
            this.redrawCharts();
            this.unsetCurConfig();
            this.joinTransactionSelectorToData();

            const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
            if (transactionSelector === null) {
                console.log("deleteTransaction, #TransactionSelector not found");
            }
            else {
                if (selectedTransactionIndex > 0) {
                    transactionSelector.selectedIndex = selectedTransactionIndex - 1;
                }
                else if (this.money.transactions.length > 0) {
                    transactionSelector.selectedIndex = 0;
                }
            }

            this.updateTransactionArea();
        }
    }

    updateTransactionArea() {
        if (this.money.transactions.length > 0) {
            const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
            d3.select("#TransactionYear").property("value", TrmInTransition.toYearRep(selectedTransaction.year));
            d3.select("#TransactionRep").property("value", selectedTransaction.repetitionCount);

            const transactionSrcSelector = document.getElementById("TransactionSrc") as HTMLSelectElement;
            if (transactionSrcSelector === null) {
                console.log("updateTransactionArea, #TransactionSrc not found");
            }
            else {
                transactionSrcSelector.selectedIndex = this.getTransAccounts().indexOf(selectedTransaction.from);
            }

            const transactionDestSelector = document.getElementById("TransactionDest") as HTMLSelectElement;
            if (transactionDestSelector === null) {
                console.log("updateTransactionArea, #TransactionDest not found");
            }
            else {
                transactionDestSelector.selectedIndex = this.getTransAccounts().indexOf(selectedTransaction.to);
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
        this.enableTransactionArea();
    }

    getTransAccounts() {
        return this.money.accounts.concat(LibreCurrency.ALL_ACCOUNT);
    }
        
    static getSelectedTransactionIndex() {
        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("getSelectedTransactionIndex, #TransactionSelector not found");
            return 0;
        }
        else {
            return transactionSelector.selectedIndex;
        }
    }

    static getTransactionSrcIndex() {
        const transactionSrcSelector = document.getElementById("TransactionSrc") as HTMLSelectElement;
        if (transactionSrcSelector === null) {
            console.log("getTransactionSrcIndex, #TransactionSrc not found");
            return 0;
        }
        else {
            return transactionSrcSelector.selectedIndex;
        }
    }

    static getTransactionDestIndex() {
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
    addTransaction() {
        this.money.addTransaction();
        this.redrawCharts();
        this.unsetCurConfig();
        this.joinTransactionSelectorToData();

        const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
        if (transactionSelector === null) {
            console.log("addTransaction, #TransactionSelector not found");
        }
        else {
            transactionSelector.selectedIndex = this.money.transactions.length - 1;
        }
        this.updateTransactionArea();
    }

    static transactionName(transaction: Transaction) {
        return `${TrmInTransition.TRANSACTION_LABEL_PREFIX} ${transaction.id}`;
    }

    enableTransactionArea() {
        if (this.money.transactions.length > 0) {
            d3.select("#Transactions>.ParamSection").style("display", "block");
        }
        else {
            d3.select("#Transactions>.ParamSection").style("display", "none");
        }
    }

    asDate(timeStep: number, aTimeUnit?: string) {
        const timeUnit = aTimeUnit || this.money.getProdStepUnit();
        
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

    asFormattedDate(timeStep: number, timeUnit?: string) {
        return d3.timeFormat(TrmInTransition.DATE_PATTERN)(this.asDate(timeStep, timeUnit));
    }

    enableGrowthForms(calculateGrowth: boolean) {
        if (calculateGrowth) {
            d3.select("#AnnualGrowth").attr("disabled", "disabled");
            d3.select("#MonthlyGrowth").attr("disabled", "disabled");
        } else {
            if (this.money.growthStepUnit === LibreCurrency.MONTH) {
                d3.select("#AnnualGrowth").attr("disabled", "disabled");
                d3.select("#MonthlyGrowth").attr("disabled", null);
            }
            else {
                d3.select("#AnnualGrowth").attr("disabled", null);
                d3.select("#MonthlyGrowth").attr("disabled", "disabled");
            }
        }
    }

    enableUD0Forms() {
        if (this.money.growthStepUnit === LibreCurrency.MONTH) {
            d3.select("#AnnualDividendStart").attr("disabled", "disabled");
            d3.select("#MonthlyDividendStart").attr("disabled", null);
            d3.select("#YearMonthDividendStart").attr("disabled", "disabled");
        }
        else {
            if (this.money.getProdStepUnit() === LibreCurrency.YEAR) {
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

    enableDemographyFields() {
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
        
        if (this.money.demographicProfileKey === "None") {
            d3.select("#DemographyParamSection").style("display", "none");
        }
        else {
            d3.select("#DemographyParamSection").style("display", "block");
        }

        switch(this.money.demographicProfileKey) {
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
                throw new Error("Demographic profile not managed: " + this.money.demographicProfileKey);
        }
    }

    static enableAddedAccountArea() {
        if (TrmInTransition.getSelectedAccountIndex() === 0) {
            d3.select("#AccountBirth").attr("disabled", "disabled");
            d3.select("#DeleteAccount").attr("disabled", "disabled");
        }
        else {
            d3.select("#AccountBirth").attr("disabled", null);
            d3.select("#DeleteAccount").attr("disabled", null);
        }
    }

    accountYLabel() {
        return `Montant (en ${this.getRefUnitLabel3(this.money.referenceFrameKey)})`;
    }

    timeLabel() {
        if (this.money.growthStepUnit === LibreCurrency.MONTH) {
            return "Temps (émission mensuelle)";
        }
        else {
            if (this.money.getProdStepUnit() === LibreCurrency.MONTH) {
                return "Temps (émission mensuelle, réévaluation annuelle)";
            }
            else {
                return "Temps (émission annuelle)";
            }
        }
    }

    universalDividendName() {
        switch(this.money.udFormulaKey) {
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
                throw new Error("Dividend formula not managed: " + this.money.udFormulaKey);
        }
    }

    openTab(tabId: string) {
        d3.selectAll(".tablinks").classed("active", false);
        d3.select("#" + tabId).classed("active", true);
        TrmInTransition.showTab(tabId);
        this.curTabId = tabId;
    }

    static showTab(tabId: string) {
        d3.selectAll(".tabcontent").style("display", "none");
        const tabContentId = d3.select("#" + tabId).attr("tab-content-id");
        d3.select("#" + tabContentId).style("display", "block");
    }

    comment(id: string) {
        this.unselectChartPoints();
        return this.comment0(id);
    }

    commentChartData(chart: Chart, c3DataId: string, pointIndex: number) {
        this.unselectChartPoints();
        chart.doSelect(c3DataId, pointIndex);
        this.curSelectedDataId = c3DataId;
        this.selectedPointIndex = pointIndex;

        if (c3DataId.startsWith(TrmInTransition.ACCOUNT_ID_PREFIX)) {
            const accountId = TrmInTransition.idFromC3AccountId(c3DataId);
            const account = this.money.searchAccount(accountId);
            if (account === null) {
                return false;
            }
            const selectedTimeStep = account.x[this.selectedPointIndex];
            return this.commentSelectedPoint(TrmInTransition.ACCOUNT_ID_PREFIX, selectedTimeStep, account);
        }
        
        let selectedTimeStep;
        switch(c3DataId) {
            case TrmInTransition.AVERAGE_ID:
                selectedTimeStep = this.money.averages.x[this.selectedPointIndex];
                break;
            case TrmInTransition.STABLE_AVERAGE_ID:
                selectedTimeStep = this.money.stableAverages.x[this.selectedPointIndex];
                break;
            case TrmInTransition.DIVIDEND_ID: 
                selectedTimeStep = this.money.dividends.x[this.selectedPointIndex];
                break;
            case TrmInTransition.STABLE_DIVIDEND_ID: 
                selectedTimeStep = this.money.stableDividends.x[this.selectedPointIndex];
                break;
            case TrmInTransition.HEADCOUNT_ID: 
                selectedTimeStep = this.money.headcounts.x[this.selectedPointIndex];
                break;
            case TrmInTransition.MONETARY_SUPPLY_ID: 
                selectedTimeStep = this.money.monetarySupplies.x[this.selectedPointIndex];
                break;
            case TrmInTransition.STABLE_MONETARY_SUPPLY_ID: 
                selectedTimeStep = this.money.stableMonetarySupplies.x[this.selectedPointIndex];
                break;
            default:
                throw new Error("Unknown c3DataId: " + c3DataId);
        }
        return this.commentSelectedPoint(c3DataId, selectedTimeStep);
    }

    getRefDisplay(referenceFrameKey: string) {
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
        if (LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale) {
            refDisplay = refDisplay + "-log";
        }
        return refDisplay;
    }

    // eslint-disable-next-line max-lines-per-function
    commentSelectedPoint(c3DataId: string, timeStep: number, account?: MAccount) {
        const f = d3.format(".3d");
        
        // Process some elements which are common to several series
        
        const growthValue = this.money.getGrowth();

        d3.selectAll("span.dateValue").text(this.asFormattedDate(timeStep));
        const pTimeStep = timeStep - 1;
        const ppTimeStep = this.money.previousGrowthStep(pTimeStep);

        d3.selectAll("span.growth.value").text(TrmInTransition.commentFormat(growthValue * 100) + TrmInTransition.NONBREAKING_SPACE + "%");
        if (this.money.prodFactor() === 12) {
            d3.selectAll(".prodFactor").style("display", null);
        }
        else {
            d3.selectAll(".prodFactor").style("display", "none");
        }
        
        const dividendMuValue = this.money.dividends.values[timeStep];
        d3.selectAll("span.dividend.current.mu.value").text(TrmInTransition.commentFormat(dividendMuValue));

        const headcountValue = this.money.headcounts.values[timeStep];
        d3.selectAll("span.headcount.current.value").text(f(headcountValue));
        
        // const averageMuValue = this.money.monetarySupplies.values[timeStep] / this.money.headcounts.values[timeStep];
        const averageMuValue = this.money.getAverage(timeStep);
        d3.selectAll("span.average.current.mu.value").text(TrmInTransition.commentFormat(averageMuValue));
        
        const muUnitLabel = TrmInTransition.getRefUnitLabel2(LibreCurrency.MONETARY_UNIT_REF_KEY);
        d3.selectAll("span.muUnit").text(muUnitLabel);
        d3.selectAll("span.muLogUnit").text(muUnitLabel + TrmInTransition.LOG_UNIT_SUFFIX);
        
        const duUnitLabel = TrmInTransition.getRefUnitLabel2(LibreCurrency.DIVIDEND_REF_KEY);
        d3.selectAll("span.duUnit").text(duUnitLabel);
        d3.selectAll("span.duLogUnit").text(duUnitLabel + TrmInTransition.LOG_UNIT_SUFFIX);
        
        const mnUnitLabel = TrmInTransition.getRefUnitLabel2(LibreCurrency.AVERAGE_REF_KEY);
        d3.selectAll("span.mnUnit").text(mnUnitLabel);
        d3.selectAll("span.mnLogUnit").text(mnUnitLabel + TrmInTransition.LOG_UNIT_SUFFIX);

        // Process elements which are more specific to each serie
        
        switch(c3DataId) {
            case TrmInTransition.AVERAGE_ID: {
                const averageMuLogValue = Math.log(averageMuValue) / Math.log(10);
                const averageUdValue = averageMuValue / dividendMuValue;
                const averageUdLogValue = Math.log(averageUdValue) / Math.log(10);
                const averageMnValue = 100 * averageMuValue / averageMuValue;
                const averageMnLogValue = Math.log(averageMnValue) / Math.log(10);
                const monetarySupplyMuValue = this.money.monetarySupplies.values[timeStep];
                d3.selectAll("span.average.label").text(TrmInTransition.AVERAGE_LABEL);
                d3.selectAll("span.average.mu.logValue").text(TrmInTransition.commentFormat(averageMuLogValue));
                d3.selectAll("span.average.ud.value").text(TrmInTransition.commentFormat(averageUdValue));
                d3.selectAll("span.average.ud.logValue").text(TrmInTransition.commentFormat(averageUdLogValue));
                d3.selectAll("span.average.mn.value").text(TrmInTransition.commentFormat(averageMnValue));
                d3.selectAll("span.average.mn.logValue").text(TrmInTransition.commentFormat(averageMnLogValue));
                d3.selectAll("span.monetarySupply.current.mu.value").text(TrmInTransition.commentFormat(monetarySupplyMuValue));
                break;
            }            
            case TrmInTransition.STABLE_AVERAGE_ID: {
                const stableAverageMuValue = (1 + growthValue) * dividendMuValue / growthValue * this.money.prodFactor();
                const stableAverageMuLogValue = Math.log(stableAverageMuValue) / Math.log(10);
                const stableAverageUdValue = stableAverageMuValue / dividendMuValue;
                const stableAverageUdLogValue = Math.log(stableAverageUdValue) / Math.log(10);
                const stableAverageMnValue = 100 * stableAverageMuValue / averageMuValue;
                const stableAverageMnLogValue = Math.log(stableAverageMnValue) / Math.log(10);
                d3.selectAll("span.stableAverage.label").text(TrmInTransition.STABLE_AVERAGE_LABEL);
                d3.selectAll("span.stableAverage.current.mu.value").text(TrmInTransition.commentFormat(stableAverageMuValue));
                d3.selectAll("span.stableAverage.mu.logValue").text(TrmInTransition.commentFormat(stableAverageMuLogValue));
                d3.selectAll("span.stableAverage.ud.value").text(TrmInTransition.commentFormat(stableAverageUdValue));
                d3.selectAll("span.stableAverage.ud.logValue").text(TrmInTransition.commentFormat(stableAverageUdLogValue));
                d3.selectAll("span.stableAverage.mn.value").text(TrmInTransition.commentFormat(stableAverageMnValue));
                d3.selectAll("span.stableAverage.mn.logValue").text(TrmInTransition.commentFormat(stableAverageMnLogValue));
                break;
            }
            case TrmInTransition.DIVIDEND_ID: {
                const dividendMuLogValue = Math.log(dividendMuValue) / Math.log(10);
                const dividendUdValue = dividendMuValue / dividendMuValue;
                const dividendUdLogValue = Math.log(dividendUdValue) / Math.log(10);
                const dividendMnValue = 100 * dividendMuValue / averageMuValue;
                const dividendMnLogValue = Math.log(dividendMnValue) / Math.log(10);
                const previousDividendMuValue = this.money.dividends.values[pTimeStep];
                const previousMonetarySupplyMuValue = this.money.monetarySupplies.values[pTimeStep];
                const previous2MonetarySupplyMuValue = this.money.monetarySupplies.values[ppTimeStep];
                const previousHeadcountValue = this.money.headcounts.values[pTimeStep];
                d3.selectAll("span.dividend.label").text(TrmInTransition.DIVIDEND_LABEL);
                d3.selectAll("span.dividend.formulaName").text(this.universalDividendName());
                d3.selectAll("span.dividend.previous.mu.value").text(TrmInTransition.commentFormat(previousDividendMuValue));
                d3.selectAll("span.dividend.basicMuValue").text(TrmInTransition.commentFormat(growthValue * previousMonetarySupplyMuValue / headcountValue / this.money.prodFactor()));
                d3.selectAll("span.dividend.mu.logValue").text(TrmInTransition.commentFormat(dividendMuLogValue));
                d3.selectAll("span.dividend.ud.value").text(TrmInTransition.commentFormat(dividendUdValue));
                d3.selectAll("span.dividend.ud.logValue").text(TrmInTransition.commentFormat(dividendUdLogValue));
                d3.selectAll("span.dividend.mn.value").text(TrmInTransition.commentFormat(dividendMnValue));
                d3.selectAll("span.dividend.mn.logValue").text(TrmInTransition.commentFormat(dividendMnLogValue));
                d3.selectAll("span.udbMuValue").text(TrmInTransition.commentFormat((1 + growthValue) * previousDividendMuValue));
                d3.selectAll("span.headcount.previous.value").text(f(previousHeadcountValue));
                d3.selectAll("span.monetarySupply.previous.mu.value").text(TrmInTransition.commentFormat(previousMonetarySupplyMuValue));
                d3.selectAll("span.monetarySupply.previous2.mu.value").text(TrmInTransition.commentFormat(previous2MonetarySupplyMuValue));
                this.commentAccordingToUD(timeStep);
                break;
            }
            case TrmInTransition.STABLE_DIVIDEND_ID: {
                const stableDividendMuValue = growthValue * averageMuValue / (1 + growthValue) / this.money.prodFactor();
                const stableDividendMuLogValue = Math.log(stableDividendMuValue) / Math.log(10);
                const stableDividendUdValue = stableDividendMuValue / dividendMuValue;
                const stableDividendUdLogValue = Math.log(stableDividendUdValue) / Math.log(10);
                const stableDividendMnValue = 100 * stableDividendMuValue / averageMuValue;
                const stableDividendMnLogValue = Math.log(stableDividendMnValue) / Math.log(10);
                d3.selectAll("span.stableDividend.label").text(TrmInTransition.STABLE_DIVIDEND_LABEL);
                d3.selectAll("span.stableDividend.current.mu.value").text(TrmInTransition.commentFormat(stableDividendMuValue));
                d3.selectAll("span.stableDividend.mu.logValue").text(TrmInTransition.commentFormat(stableDividendMuLogValue));
                d3.selectAll("span.stableDividend.ud.value").text(TrmInTransition.commentFormat(stableDividendUdValue));
                d3.selectAll("span.stableDividend.ud.logValue").text(TrmInTransition.commentFormat(stableDividendUdLogValue));
                d3.selectAll("span.stableDividend.mn.value").text(TrmInTransition.commentFormat(stableDividendMnValue));
                d3.selectAll("span.stableDividend.mn.logValue").text(TrmInTransition.commentFormat(stableDividendMnLogValue));
                break;
            }
            case TrmInTransition.HEADCOUNT_ID: {
                const demographyValue = LibreCurrency.demographicProfiles[this.money.demographicProfileKey].calculate(this.money, this.money.fromTimeStep(timeStep, LibreCurrency.YEAR));
                d3.selectAll("span.headcount.label").text(TrmInTransition.HEADCOUNT_LABEL);
                d3.selectAll("span.demographyLabel").text(TrmInTransition.getDemographicProfileLabel(this.money.demographicProfileKey));
                d3.selectAll("span.accountsNumberValue").text(headcountValue - demographyValue);
                d3.selectAll("span.demographyValue").text(demographyValue);
                break;
            }
            case TrmInTransition.MONETARY_SUPPLY_ID: {
                const monetarySupplyMuValue = this.money.monetarySupplies.values[timeStep];
                const monetarySupplyMuLogValue = Math.log(monetarySupplyMuValue) / Math.log(10);
                const monetarySupplyUdValue = monetarySupplyMuValue / dividendMuValue;
                const monetarySupplyUdLogValue = Math.log(monetarySupplyUdValue) / Math.log(10);
                const monetarySupplyMnValue = 100 * monetarySupplyMuValue / averageMuValue;
                const monetarySupplyMnLogValue = Math.log(monetarySupplyMnValue) / Math.log(10);
                const previousMonetarySupplyMuValue = this.money.monetarySupplies.values[pTimeStep];
                d3.selectAll("span.monetarySupply.label").text(TrmInTransition.MONETARY_SUPPLY_LABEL);
                d3.selectAll("span.monetarySupply.previous.mu.value").text(TrmInTransition.commentFormat(previousMonetarySupplyMuValue));
                d3.selectAll("span.monetarySupply.current.mu.value").text(TrmInTransition.commentFormat(monetarySupplyMuValue));
                d3.selectAll("span.monetarySupply.mu.logValue").text(TrmInTransition.commentFormat(monetarySupplyMuLogValue));
                d3.selectAll("span.monetarySupply.ud.value").text(TrmInTransition.commentFormat(monetarySupplyUdValue));
                d3.selectAll("span.monetarySupply.ud.logValue").text(TrmInTransition.commentFormat(monetarySupplyUdLogValue));
                d3.selectAll("span.monetarySupply.mn.value").text(TrmInTransition.commentFormat(monetarySupplyMnValue));
                d3.selectAll("span.monetarySupply.mn.logValue").text(TrmInTransition.commentFormat(monetarySupplyMnLogValue));
                let birthAmountsValue = monetarySupplyMuValue - previousMonetarySupplyMuValue - dividendMuValue * headcountValue;
                if (birthAmountsValue < 0.01) {
                    birthAmountsValue = 0;
                }
                d3.selectAll("span.birthAmounts.value").text(TrmInTransition.commentFormat(birthAmountsValue));
                this.commentAccordingToMoneyBirth(timeStep);
                break;
            }
            case TrmInTransition.STABLE_MONETARY_SUPPLY_ID: {
                const stableMonetarySupplyMuValue = headcountValue * (1 + growthValue) * dividendMuValue / growthValue * this.money.prodFactor();
                const stableMonetarySupplyMuLogValue = Math.log(stableMonetarySupplyMuValue) / Math.log(10);
                const stableMonetarySupplyUdValue = stableMonetarySupplyMuValue / dividendMuValue;
                const stableMonetarySupplyUdLogValue = Math.log(stableMonetarySupplyUdValue) / Math.log(10);
                const stableMonetarySupplyMnValue = 100 * stableMonetarySupplyMuValue / averageMuValue;
                const stableMonetarySupplyMnLogValue = Math.log(stableMonetarySupplyMnValue) / Math.log(10);
                d3.selectAll("span.stableMonetarySupply.label").text(TrmInTransition.STABLE_MONETARY_SUPPLY_LABEL);
                d3.selectAll("span.stableMonetarySupply.current.mu.value").text(TrmInTransition.commentFormat(stableMonetarySupplyMuValue));
                d3.selectAll("span.stableMonetarySupply.mu.logValue").text(TrmInTransition.commentFormat(stableMonetarySupplyMuLogValue));
                d3.selectAll("span.stableMonetarySupply.ud.value").text(TrmInTransition.commentFormat(stableMonetarySupplyUdValue));
                d3.selectAll("span.stableMonetarySupply.ud.logValue").text(TrmInTransition.commentFormat(stableMonetarySupplyUdLogValue));
                d3.selectAll("span.stableMonetarySupply.mn.value").text(TrmInTransition.commentFormat(stableMonetarySupplyMnValue));
                d3.selectAll("span.stableMonetarySupply.mn.logValue").text(TrmInTransition.commentFormat(stableMonetarySupplyMnLogValue));
                break;
            }
            default: {
                if (c3DataId.startsWith(TrmInTransition.ACCOUNT_ID_PREFIX) && account) {
                    const accountSpan = d3.select("#accountComment").selectAll("span.account");
                    accountSpan.style("color", TrmInTransition.ACCOUNT_COLORS[account.id - 1]);
                    const accountMuValue = account.values[timeStep];
                    const accountMuLogValue = Math.log(accountMuValue) / Math.log(10);
                    const accountUdValue = accountMuValue / dividendMuValue;
                    const accountUdLogValue = Math.log(accountUdValue) / Math.log(10);
                    const accountMnValue = 100 * accountMuValue / averageMuValue;
                    const accountMnLogValue = Math.log(accountMnValue) / Math.log(10);
                    d3.selectAll("span.account.name").text(TrmInTransition.accountName1(account));
                    d3.selectAll("span.accountAge").text(this.accountAgeLabel(account, timeStep));
                    d3.selectAll("span.account.current.mu.value").text(TrmInTransition.commentFormat(accountMuValue));
                    d3.selectAll("span.account.mu.logValue").text(TrmInTransition.commentFormat(accountMuLogValue));
                    d3.selectAll("span.account.ud.value").text(TrmInTransition.commentFormat(accountUdValue));
                    d3.selectAll("span.account.ud.logValue").text(TrmInTransition.commentFormat(accountUdLogValue));
                    d3.selectAll("span.account.mn.value").text(TrmInTransition.commentFormat(accountMnValue));
                    d3.selectAll("span.account.mn.logValue").text(TrmInTransition.commentFormat(accountMnLogValue));
                    if (timeStep > 0) {
                        const previousMuAccountValue = account.values[pTimeStep];
                        d3.selectAll("span.account.previous.mu.value").text(TrmInTransition.commentFormat(previousMuAccountValue));
                    }
                    d3.selectAll("span.UD0.value").text(TrmInTransition.commentFormat(this.money.getDividendStart()));
                    this.commentAccordingToAccount(timeStep, account)
                }
                else {
                    throw new Error("Unknown c3DataId: " + c3DataId);
                }
            }
        }
        
        this.commentAccordingToRef();
        
        return this.comment0(c3DataId);
    }

    commentAccordingToRef() {
        d3.selectAll("div.RefComment").style("display", "none");
        const refDisplay = this.getRefDisplay(this.money.referenceFrameKey);
        d3.selectAll("div." + refDisplay).style("display", "block");
    }

    commentAccordingToUD(timeStep: number) {
        d3.selectAll("div.DuComment").style("display", "none");
        const moneyBirthStep = this.money.toTimeStep(this.money.moneyBirth, LibreCurrency.YEAR);
        if (timeStep === moneyBirthStep) {
            d3.selectAll("div.NoUD").style("display", "block");
        }
        else if (timeStep === moneyBirthStep + 1) {
            d3.selectAll("div.UD0").style("display", "block");
        }
        else if (this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.MONTH && (timeStep - moneyBirthStep) % 12 !== 1) {
                d3.selectAll("div.UDM").style("display", "block");
        }
        else {
            d3.selectAll("div." + this.money.udFormulaKey).style("display", "block");
        }
    }

    commentAccordingToMoneyBirth(timeStep: number) {
        d3.selectAll("div.MbComment").style("display", "none");
        const moneyBirthStep = this.money.toTimeStep(this.money.moneyBirth, LibreCurrency.YEAR);
        if (timeStep === moneyBirthStep) {
            d3.selectAll("div.MB").style("display", "block");
        }
        else {
            d3.selectAll("div.NoMB").style("display", "block");
        }
    }

    // eslint-disable-next-line max-lines-per-function
    commentAccordingToAccount(timeStep: number, account: MAccount) {
        d3.selectAll(".AmountComment").style("display", "none");
        const pTimeStep = timeStep - 1;
        const moneyBirthStep = this.money.toTimeStep(this.money.moneyBirth, LibreCurrency.YEAR);
        const birthStep = this.money.toTimeStep(account.birth, LibreCurrency.YEAR);
        const deathStep = this.money.toTimeStep(account.birth + this.money.lifeExpectancy, LibreCurrency.YEAR);
        const udProductorClass = LibreCurrency.isCoCreator(account) ? "CoCreator" : "NonCreator";
        const coCreatorsClass = this.money.hasNoCoCreators() ? "NoCreators" : "CoCreators";
        if (timeStep === moneyBirthStep && this.money.prodFactor() === 12) {
            d3.selectAll(".prodFactor.AtMoneyBirth").style("display", null);
        }
        else {
            d3.selectAll(".prodFactor.AtMoneyBirth").style("display", "none");
        }
        if (timeStep === moneyBirthStep) {
            // Change 'id' to have a link to the corresponding account
            d3.select("#accountComment").selectAll("span.StartingPercentage").attr("id", function(_d, i) { return "sp" + i + "-" + account.id; });
            d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + TrmInTransition.NONBREAKING_SPACE + "%");
            d3.selectAll("span.AtMoneyBirth." + coCreatorsClass).style("display", "inline");
        }
        else if (timeStep === birthStep) {
            const previousAverageMuValue = this.money.getAverage(pTimeStep);
            // Change 'id' to have a link to the corresponding account
            d3.select("#accountComment").selectAll("span.StartingPercentage").attr("id", function(_d, i) { return "sp" + i + "-" + account.id; });
            d3.selectAll("span.average.previous.mu.value").text(TrmInTransition.commentFormat(previousAverageMuValue));
            d3.selectAll("span.StartingPercentage.value").text(account.startingPercentage + TrmInTransition.NONBREAKING_SPACE + "%");
            d3.selectAll("span.AtBirth." + coCreatorsClass).style("display", "inline");
        }
        else if (timeStep > deathStep) {
            d3.selectAll("span.AfterDeath." + udProductorClass).style("display", "inline");
        }
        else {
            d3.selectAll("span.WhenAlive." + udProductorClass).style("display", "inline");
        }

        const commentsMap = this.money.applyTransactions(timeStep, account);
        if (commentsMap.size > 0) {
            d3.selectAll("span.TransactionsDesc").style("display", "inline");
            d3.selectAll("span.TransactionsValuesDesc").style("display", "inline");
            d3.selectAll("span.TransactionsDesc").html(function (_d, i) {
                const prefixId = "ac" + account.id + "td" + i;
                return Array.from(commentsMap.entries()).map(e => TrmInTransition.transactionsDesc(prefixId, e[0], e[1])).join(" ");
            });
            d3.selectAll("span.TransactionsValuesDesc").html(function (_d, i) {
                const prefixId = "ac" + account.id + "tvd" + i;
                return Array.from(commentsMap.entries()).map(e => TrmInTransition.transactionsValuesDesc(prefixId, e[0], e[1])).join(" ");
            });
            this.initTransactionSpans();
        }
        else {
            d3.selectAll("span.TransactionsDesc").style("display", "none");
            d3.selectAll("span.TransactionsValuesDesc").style("display", "none");
        }
    }

    initTransactionSpans() {
        const thisApp = this;
        d3.selectAll("span.transaction")
        .style("background-color", "#f1f1f1")
        .on("mouseover", function () {
            d3.select("#TransactionsTab").classed("focused", true);
            TrmInTransition.showTab("TransactionsTab");

            const paramElemId = d3.select(this).attr("id");
            if (paramElemId) {
                const modelId = + paramElemId.split("-")[1];
                thisApp.setSelectorIndex("TransactionsTab", modelId);
                d3.selectAll<HTMLSpanElement, unknown>("span.transaction").filter(function() { return this.id.endsWith("-" + modelId); })
                    .style("background-color", "#dddddd");
            }
        })
        .on("mouseout", function () {
            d3.selectAll("span.transactionsTabLink").style("background-color", "#f1f1f1");
            d3.selectAll("span.transaction").style("background-color", "#f1f1f1");
            d3.select("#TransactionsTab").classed("focused", false);
            TrmInTransition.showTab(thisApp.curTabId);
        })
        .on("click", function() {
            d3.select("#TransactionsTab").classed("focused", false);
            const paramElemId = d3.select(this).attr("id");
            if (paramElemId) {
                const modelId = + paramElemId.split("-")[1];
                thisApp.setSelectorIndex("TransactionsTab", modelId);
                thisApp.clickTab("TransactionsTab");
            }
        });
    }

    static transactionsDesc(prefixId: string, transaction: Transaction, actualAmountMap: Map<MAccount, number>) {
        const descrId = prefixId + "-" + transaction.id;
        const firstActualAmount = actualAmountMap.entries().next().value[1];
        const direction = (firstActualAmount<0) ? "- " : "+ ";
        return direction + `<span id="${descrId}" class="transaction name">${TrmInTransition.TRANSACTION_LABEL_PREFIX} ${transaction.id}</span> (${TrmInTransition.accountName1(transaction.from)} vers ${TrmInTransition.accountName1(transaction.to)} : ${transaction.amount} ${TrmInTransition.getRefLabel(transaction.amountRef)})`;

    }

    static transactionsValuesDesc(prefixId: string, transaction: Transaction, actualAmountMap: Map<MAccount, number>) {
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

    comment0(id: string) {
        d3.selectAll(".Comment").style("display", "none");
        d3.select("#" + id + "Comment").style("display", "block");

        this.commentedId = id;
        
        return false;
    }

    pushNewHistoryState() {
        const encodedURI = this.asEncodedURI();
        window.history.pushState(encodedURI, "", "?" + encodedURI);
    }

    // Callbacks
    // *********

    changeConfiguration(configIdToSelect: string, configs: {[s: string]: JSonRep | {}}) {
        this.curConfigId = configIdToSelect;
        if (this.curConfigId === "none") {
            this.comment("WorkshopsTab");
        }
        else {
            const jsonRep = configs[this.curConfigId] as JSonRep;
            this.applyJSonRep(jsonRep);
            this.comment(this.curConfigId);
        }
        this.pushNewHistoryState();
    }

    changeAccountSelection() {
        this.updateAddedAccountArea();
        this.pushNewHistoryState();
    }

    clickAddAccount() {
        this.addAccount();
        this.pushNewHistoryState();
    }

    clickDeleteAccount() {
        this.deleteAccount();
        this.pushNewHistoryState();
    }

    changeTransactionSelection() {
        this.updateTransactionArea();
        this.pushNewHistoryState();
    }

    changeTransactionSrcSelection() {
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        selectedTransaction.from = this.getTransAccounts()[TrmInTransition.getTransactionSrcIndex()];
        this.redrawCharts();
        this.unsetCurConfig();
        this.pushNewHistoryState();
    }

    changeTransactionDestSelection() {
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        selectedTransaction.to = this.getTransAccounts()[TrmInTransition.getTransactionDestIndex()];
        this.redrawCharts();
        this.unsetCurConfig();
        this.pushNewHistoryState();
    }

    changeTransactionYear(htmlInputElement: HTMLInputElement) {
        const transactionYear = TrmInTransition.fromYearRep(parseInt(htmlInputElement.value, 10));
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        if (transactionYear >= 0 && transactionYear < 240) {
            selectedTransaction.year = transactionYear;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#TransactionYear").property("value", TrmInTransition.toYearRep(selectedTransaction.year));
        }
    }

    changeTransactionRep(htmlInputElement: HTMLInputElement) {
        const transactionRep = parseInt(htmlInputElement.value, 10);
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        if (transactionRep > 0 && transactionRep < this.money.toTimeStep(240, LibreCurrency.YEAR)) {
            selectedTransaction.repetitionCount = transactionRep;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#TransactionRep").property("value", selectedTransaction.repetitionCount);
        }
    }

    changeTransactionAmount(htmlInputElement: HTMLInputElement) {
        const transactionAmount = parseFloat(htmlInputElement.value);
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        if (transactionAmount >= 0) {
            selectedTransaction.amount = transactionAmount;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#TransactionAmount").property("value", selectedTransaction.amount);
        }
    }

    changeTransactionRefSelection(htmlSelectElement: HTMLSelectElement) {
        const selectedTransaction = this.money.getTransaction(TrmInTransition.getSelectedTransactionIndex());
        selectedTransaction.amountRef = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
        this.redrawCharts();
        this.unsetCurConfig();
        this.pushNewHistoryState();
    }

    clickAddTransaction() {
        this.addTransaction();
        this.pushNewHistoryState();
    }

    clickDeleteTransaction() {
        this.deleteTransaction();
        this.pushNewHistoryState();
    }

    changeReferenceFrame(htmlSelectElement: HTMLSelectElement) {
        this.money.referenceFrameKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
        d3.select("#LogScale").property("checked", LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale);
            
        this.updateAccountYLabels();
        
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(this.money.referenceFrameKey + "Ref");
        this.pushNewHistoryState();
    }

    updateAccountYLabels() {
        this.accountsChart.axisLabels({
            y: this.accountYLabel()
        });
        this.dividendChart.axisLabels({
            y: this.accountYLabel()
        });
        this.monetarySupplyChart.axisLabels({
            y: this.accountYLabel()
        });
    }

    updateTimeXLabels() {
        this.accountsChart.axisLabels({
            x: this.timeLabel()
        });
        this.dividendChart.axisLabels({
            x: this.timeLabel()
        });
        this.headcountChart.axisLabels({
            x: this.timeLabel()
        });
        this.monetarySupplyChart.axisLabels({
            x: this.timeLabel()
        });
    }

    changeUdFormula(htmlSelectElement: HTMLSelectElement) {
        this.money.udFormulaKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(this.money.udFormulaKey);
        this.pushNewHistoryState();
    }

    changeDemographicProfile(htmlSelectElement: HTMLSelectElement) {
        this.money.demographicProfileKey = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
        this.enableDemographyFields();
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(this.money.demographicProfileKey);
        this.pushNewHistoryState();
    }

    changeRythm(htmlInputElement: HTMLInputElement) {
        if (htmlInputElement.value === "byMonth") {
            const monthlyGrowth = document.getElementById("MonthlyGrowth") as HTMLInputElement;
            if (monthlyGrowth === null) {
                console.log("changeRythm, #MonthlyGrowth not found");
            }
            else {
                this.money.growthStepUnit = LibreCurrency.MONTH;
                this.money.growth = parseFloat(monthlyGrowth.value) / 100;
            }
        }
        else {
            const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
            if (annualGrowth === null) {
                console.log("changeRythm, #AnnualGrowth not found");
            }
            else {
                this.money.growthStepUnit = LibreCurrency.YEAR;
                this.money.growth = parseFloat(annualGrowth.value) / 100;
            }
        }
        this.rythmAndUD0Update(htmlInputElement);
    }

    changeUd0Rythm(htmlInputElement: HTMLInputElement) {
        if (htmlInputElement.value === "ud0ByMonth") {
            const monthlyGrowth = document.getElementById("MonthlyGrowth") as HTMLInputElement;
            if (monthlyGrowth === null) {
                console.log("changeUd0Rythm, #MonthlyGrowth not found");
            }
            else {
                this.money.growthStepUnit = LibreCurrency.MONTH;
                this.money.prodStepUnit = LibreCurrency.MONTH;
                this.money.growth = parseFloat(monthlyGrowth.value) / 100;
            }
        }
        else if (htmlInputElement.value === "ud0ByYear") {
            const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
            if (annualGrowth === null) {
                console.log("changeUd0Rythm, #AnnualGrowth not found (for 'ud0ByYear')");
            }
            else {
                this.money.growthStepUnit = LibreCurrency.YEAR;
                this.money.prodStepUnit = LibreCurrency.YEAR;
                this.money.growth = parseFloat(annualGrowth.value) / 100;
            }
        }
        else {
            const annualGrowth = document.getElementById("AnnualGrowth") as HTMLInputElement;
            if (annualGrowth === null) {
                console.log("changeUd0Rythm, #AnnualGrowth not found");
            }
            else {
                this.money.growthStepUnit = LibreCurrency.YEAR;
                this.money.prodStepUnit = LibreCurrency.MONTH;
                this.money.growth = parseFloat(annualGrowth.value) / 100;
            }
        }
        this.rythmAndUD0Update(htmlInputElement);
    }

    rythmAndUD0Update(htmlInputElement: HTMLInputElement) {
        d3.select("input[value=\"byMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.MONTH);
        d3.select("input[value=\"byYear\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR);
            
        d3.select("input[value=\"ud0ByMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.MONTH && this.money.getProdStepUnit() === LibreCurrency.MONTH);
        d3.select("input[value=\"ud0ByYear\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.YEAR);
        d3.select("input[value=\"ud0ByYearMonth\"]").property("checked", this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.MONTH);
            
        if (this.money.growthStepUnit === LibreCurrency.MONTH && this.money.getProdStepUnit() === LibreCurrency.MONTH) {
            const monthlyDividendStart = document.getElementById("MonthlyDividendStart") as HTMLInputElement;
            if (monthlyDividendStart === null) {
                console.log("rythmAndUD0Update, #MonthlyDividendStart not found");
            }
            else {
                this.money.dividendStart = parseFloat(monthlyDividendStart.value);
            }
        }
        else if (this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.YEAR) {
            const annualDividendStart = document.getElementById("AnnualDividendStart") as HTMLInputElement;
            if (annualDividendStart === null) {
                console.log("rythmAndUD0Update, #AnnualDividendStart not found");
            }
            else {
                this.money.dividendStart = parseFloat(annualDividendStart.value);
            }
        }
        else {
            const yearMonthDividendStart = document.getElementById("YearMonthDividendStart") as HTMLInputElement;
            if (yearMonthDividendStart === null) {
                console.log("rythmAndUD0Update, #YearMonthDividendStart not found");
            }
            else {
                this.money.dividendStart = parseFloat(yearMonthDividendStart.value);
            }
        }

        this.updateTimeXLabels();
        
        this.enableGrowthForms(this.money.calculateGrowth);
        this.enableUD0Forms();
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(htmlInputElement.value);
        this.pushNewHistoryState();
    }

    changeLifeExpectancy(htmlInputElement: HTMLInputElement) {
        this.money.lifeExpectancy = parseInt(htmlInputElement.value, 10);
        this.redrawCharts();
        this.unsetCurConfig();
        this.updateCalculateGrowth();
        this.pushNewHistoryState();
    }

    changeAnnualGrowth(htmlInputElement: HTMLInputElement) {
        this.money.growth = parseFloat(htmlInputElement.value) / 100;
        this.redrawCharts();
        this.unsetCurConfig();
        this.growthChanged();
        d3.select("#MonthlyGrowth").property("value", (this.money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
        this.pushNewHistoryState();
    }

    changeMonthlyGrowth(htmlInputElement: HTMLInputElement) {
        this.money.growth = parseFloat(htmlInputElement.value) / 100;
        this.redrawCharts();
        this.unsetCurConfig();
        this.growthChanged();
        d3.select("#AnnualGrowth").property("value", (this.money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
        this.pushNewHistoryState();
    }

    changeCalculateGrowth(htmlInputElement: HTMLInputElement) {
        this.money.calculateGrowth = htmlInputElement.checked;
        
        this.enableGrowthForms(this.money.calculateGrowth);
        this.redrawCharts();
        this.unsetCurConfig();
        this.updateCalculateGrowth();
        this.comment(htmlInputElement.id);
        this.pushNewHistoryState();
    }

    updateCalculateGrowth() {
        if (this.money.calculateGrowth) {
            d3.select("#AnnualGrowth").property("value", (this.money.getGrowth(LibreCurrency.YEAR) * 100).toFixed(2));
            d3.select("#MonthlyGrowth").property("value", (this.money.getGrowth(LibreCurrency.MONTH) * 100).toFixed(2));
            this.growthChanged();
        }
    }

    growthChanged() {
        if (this.money.growthStepUnit === LibreCurrency.MONTH && this.money.getProdStepUnit() === LibreCurrency.MONTH) {
            d3.select("#AnnualDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
            d3.select("#YearMonthDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
        }
        else if (this.money.growthStepUnit === LibreCurrency.YEAR && this.money.getProdStepUnit() === LibreCurrency.YEAR) {
            d3.select("#MonthlyDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
            d3.select("#YearMonthDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
        }
        else {
            d3.select("#AnnualDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
            d3.select("#MonthlyDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
        }
    }

    changeAnnualDividendStart(htmlInputElement: HTMLInputElement) {
        this.money.dividendStart = parseFloat(htmlInputElement.value);
        this.redrawCharts();
        this.unsetCurConfig();
        d3.select("#MonthlyDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
        d3.select("#YearMonthDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
        this.pushNewHistoryState();
    }

    changeMonthlyDividendStart(htmlInputElement: HTMLInputElement) {
        this.money.dividendStart = parseFloat(htmlInputElement.value);
        this.redrawCharts();
        this.unsetCurConfig();
        d3.select("#AnnualDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
        d3.select("#YearMonthDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.MONTH)).toFixed(2));
        this.pushNewHistoryState();
    }

    changeYearMonthDividendStart(htmlInputElement: HTMLInputElement) {
        this.money.dividendStart = parseFloat(htmlInputElement.value);
        this.redrawCharts();
        this.unsetCurConfig();
        d3.select("#AnnualDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.YEAR, LibreCurrency.YEAR)).toFixed(2));
        d3.select("#MonthlyDividendStart").property("value", (this.money.getDividendStart(LibreCurrency.MONTH, LibreCurrency.MONTH)).toFixed(2));
        this.pushNewHistoryState();
    }

    changeLogScale(htmlInputElement: HTMLInputElement) {
        LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale = !LibreCurrency.referenceFrames[this.money.referenceFrameKey].logScale
        
        this.updateAccountYLabels();
        
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(htmlInputElement.id);
        this.pushNewHistoryState();
    }

    changeStepCurves(htmlInputElement: HTMLInputElement) {
        if (htmlInputElement.checked) {
            this.curveType = TrmInTransition.STEP_AFTER_CURVE;
        }
        else {
            this.curveType = TrmInTransition.LINEAR_CURVE;
        }
        
        this.redrawCharts();
        this.unsetCurConfig();
        this.comment(htmlInputElement.id);
        this.pushNewHistoryState();
    }

    changeTimeLowerBound(htmlSelectElement: HTMLSelectElement) {
        const timeLowerBound = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        if (timeLowerBound >= 0 && timeLowerBound < 240) {
            const oldTimeBounds = { lower: this.money.getTimeLowerBound(LibreCurrency.YEAR), upper: this.money.getTimeUpperBound(LibreCurrency.YEAR) };
            this.money.setTimeLowerBound(timeLowerBound); 
            this.updateZoom(oldTimeBounds);
            this.unsetCurConfig();
            d3.select("#TimeUpperBound").property("value", TrmInTransition.toYearRep(this.money.getTimeUpperBound(LibreCurrency.YEAR)));
            this.pushNewHistoryState();
        }
        else {
            d3.select("#TimeLowerBound").property("value", TrmInTransition.toYearRep(this.money.getTimeLowerBound(LibreCurrency.YEAR)));
        }
    }

    changeTimeUpperBound(htmlSelectElement: HTMLSelectElement) {
        const timeUpperBound = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        if (timeUpperBound > 0 && timeUpperBound <= 240) {
            const oldTimeBounds = { lower: this.money.getTimeLowerBound(LibreCurrency.YEAR), upper: this.money.getTimeUpperBound(LibreCurrency.YEAR) };
            this.money.setTimeUpperBound(timeUpperBound); 
            this.updateZoom(oldTimeBounds);
            this.unsetCurConfig();
            d3.select("#TimeLowerBound").property("value", TrmInTransition.toYearRep(this.money.getTimeLowerBound(LibreCurrency.YEAR)));
            this.pushNewHistoryState();
        }
        else {
            d3.select("#TimeUpperBound").property("value", TrmInTransition.toYearRep(this.money.getTimeUpperBound(LibreCurrency.YEAR)));
        }
    }

    changeMaxDemography(htmlSelectElement: HTMLSelectElement) {
        const maxDemography = parseInt(htmlSelectElement.value, 10);
        if (maxDemography >= 0 && maxDemography < 1000000) {
            this.money.maxDemography = maxDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#MaxDemography").property("value", this.money.maxDemography);
        }
    }

    changeXMinDemography(htmlSelectElement: HTMLSelectElement) {
        const xMinDemography = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        if (xMinDemography >= 0 && xMinDemography < 240) {
            this.money.xMinDemography = xMinDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#xMinDemography").property("value", TrmInTransition.toYearRep(this.money.xMinDemography));
        }
    }

    changeXMaxDemography(htmlSelectElement: HTMLSelectElement) {
        const xMaxDemography = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        if (xMaxDemography >= 1 && xMaxDemography < 239) {
            this.money.xMaxDemography = xMaxDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#xMaxDemography").property("value", TrmInTransition.toYearRep(this.money.xMaxDemography));
        }
    }

    changeXMpvDemography(htmlSelectElement: HTMLSelectElement) {
        const xMpvDemography = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        if (xMpvDemography >= 1 && xMpvDemography < 239) {
            this.money.xMpvDemography = xMpvDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#xMpvDemography").property("value", TrmInTransition.toYearRep(this.money.xMpvDemography));
        }
    }

    changePlateauDemography(htmlSelectElement: HTMLSelectElement) {
        const plateauDemography = parseInt(htmlSelectElement.value, 10);
        if (plateauDemography >= 0 && plateauDemography < 239) {
            this.money.plateauDemography = plateauDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#plateauDemography").property("value", this.money.plateauDemography);
        }
    }

    changeXScaleDemography(htmlSelectElement: HTMLSelectElement) {
        const xScaleDemography = parseFloat(htmlSelectElement.value);
        if (xScaleDemography > 0) {
            this.money.xScaleDemography = xScaleDemography;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#xScaleDemography").property("value", this.money.xScaleDemography);
        }
    }

    changeAccountBirth(htmlSelectElement: HTMLSelectElement) {
        const birth = TrmInTransition.fromYearRep(parseInt(htmlSelectElement.value, 10));
        const selectedAccount = this.money.getAccount(TrmInTransition.getSelectedAccountIndex());
        if (birth >= 0 && birth < 240) {
            selectedAccount.birth = birth;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#AccountBirth").property("value", TrmInTransition.toYearRep(selectedAccount.birth));
        }
    }

    changeAccountDuration(htmlSelectElement: HTMLSelectElement) {
        const duration = parseInt(htmlSelectElement.value, 10);
        const selectedAccount = this.money.getAccount(TrmInTransition.getSelectedAccountIndex());
        if (duration > 0 && duration <= 120) {
            selectedAccount.duration = duration;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#AccountDuration").property("value", selectedAccount.duration);
        }
    }

    changeAccountType(htmlSelectElement: HTMLSelectElement) {
        const selectedAccount = this.money.getAccount(TrmInTransition.getSelectedAccountIndex());
        selectedAccount.type = htmlSelectElement.options[htmlSelectElement.selectedIndex].value;
        
        this.joinAccountSelectorsToData();
        this.redrawCharts();
        this.unsetCurConfig();
        
        this.comment(htmlSelectElement.id);
        this.pushNewHistoryState();
    }

    changeStartingPercentage(htmlSelectElement: HTMLSelectElement) {
        const startingPercentage = parseFloat(htmlSelectElement.value);
        const selectedAccount = this.money.getAccount(TrmInTransition.getSelectedAccountIndex());
        if (startingPercentage >= 0) {
            selectedAccount.startingPercentage = startingPercentage;
            this.redrawCharts();
            this.unsetCurConfig();
            this.pushNewHistoryState();
        }
        else {
            d3.select("#StartingPercentage").property("value", selectedAccount.startingPercentage);
        }
    }

    getCurConfigJsonRep() {
        for (let i = 0; i < TrmInTransition.workshops.length; i++) {
            if (Object.keys(TrmInTransition.workshops[i].jsonRep).indexOf(this.curConfigId) !== -1) {
                return TrmInTransition.workshops[i].jsonRep[this.curConfigId];
            }
        }
        throw new Error("Configuration not managed: " + this.curConfigId);
    }

    clickTab(tabId: string) {
        this.openTab(tabId);
        if (tabId === "WorkshopsTab" && this.curConfigId !== "none") {
            const jsonRep = this.getCurConfigJsonRep() as JSonRep;
            this.applyJSonRep(jsonRep);
            this.comment(this.curConfigId);
        }
        else {
            this.comment(tabId);
        }
        this.pushNewHistoryState();
        
        return false;
    }

    clickParamInput(tabId: string, paramId: string) {
        this.openTab(tabId);
        const clickedParamInput = document.getElementById(paramId) as HTMLInputElement;
        if (clickedParamInput === null) {
            console.log("clickParamInput, #" + paramId + " not found");
        }
        else {
            clickedParamInput.focus();
            this.comment(paramId);
            this.pushNewHistoryState();
        }
    }

    setSelectorIndex(tabId: string, modelId: number) {
        if (tabId === "AccountsTab") {
            const accountSelector = document.getElementById("AccountSelector") as HTMLSelectElement;
            if (accountSelector === null) {
                console.log("setSelectorIndex, #AccountSelector not found");
            }
            else {
                const toSelectIndex = this.money.accountIndex(modelId);
                if (accountSelector.selectedIndex !== toSelectIndex) {
                    accountSelector.selectedIndex = toSelectIndex;
                    this.updateAddedAccountArea();
                }
            }
        }
        if (tabId === "TransactionsTab") {
            const transactionSelector = document.getElementById("TransactionSelector") as HTMLSelectElement;
            if (transactionSelector === null) {
                console.log("setSelectorIndex, #TransactionSelector not found");
            }
            else {
                const toSelectIndex = this.money.transactionIndex(modelId);
                if (transactionSelector.selectedIndex !== toSelectIndex) {
                    transactionSelector.selectedIndex = toSelectIndex;
                    this.updateTransactionArea();
                }
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
