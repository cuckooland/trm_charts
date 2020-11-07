// eslint-disable-next-line no-unused-vars
class Chart {
    static readonly LINE = "line";
    static readonly AREA = "area";
    static readonly LINEAR_CURVE = "L";
    static readonly STEP_AFTER_CURVE = "SA";

    static readonly legendPadding = {t: 38, r: 10, b: 2, l: 10};
        
    bindto: string;

    config: ChartConfig;

    theData: SeriesData | null = null;

    xScale = d3.scaleTime();

    xAxis = d3.axisBottom<Date>(this.xScale);

    yScale = d3.scaleLinear<number, number>()

    yAxis = d3.axisLeft<number>(this.yScale);

    color: d3.ScaleOrdinal<number, string>;

    hiddenSerieIds = new Set<string>();

    selectedPoint: {serieId: string, pointIndex: number} | null = null;

    referencedPoint: {serieId: string, pointIndex: number} | null = null;

    // eslint-disable-next-line max-lines-per-function
    constructor(config: ChartConfig) {
        const thisChart = this;
        this.config = Object.assign({}, config);
    
        this.bindto = this.config.bindto;
        this.color = d3.scaleOrdinal<number, string>(this.config.color.pattern);

        const svg = d3.select(this.bindto).append("svg")
            .attr("width", this.config.size.width)
            .attr("height", this.config.size.height);

        // Define clipping (useful for zoom transition)
        // add 4 pixels to width and hight to avoid to cut curve lines and selection circle
        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip-" + this.bindto)
            .append("rect")
            .attr("transform", "translate(-4,-4)")
            .attr("width", this.config.size.width - this.config.padding.left - this.config.padding.right + 8)
            .attr("height", this.config.size.height - this.config.padding.bottom - this.config.padding.top + 8);
        
        const plotGroup = svg.append("g")
            .attr("class", "plotGroup")
            .attr("transform", "translate(" + this.config.padding.left + "," + this.config.padding.top + ")");
    
        this.xScale.range([0, this.config.size.width - this.config.padding.left - this.config.padding.right]);
        this.yScale.range([this.config.size.height - this.config.padding.bottom - this.config.padding.top, 0]);
    
        plotGroup.append("g")
            .attr("class", "seriesGroup")
            .attr("clip-path", "url(#clip-" + this.bindto + ") ");
        plotGroup.append("g")
            .attr("class", "legendGroup")
            .attr("transform", "translate(" + (Chart.legendPadding.l - this.config.padding.left) +"," + (Chart.legendPadding.t + this.config.size.height - this.config.padding.bottom - this.config.padding.top) + ")");
    
        // Add the X Axis
        this.xAxis
            .ticks(5)
            .tickFormat(d3.timeFormat(this.config.axis.x.tick.format));
        plotGroup.append("g")
            .attr("transform", "translate(0," + (this.config.size.height - this.config.padding.bottom - this.config.padding.top) + ")")
            .attr("class", "x axis")
            .call(this.xAxis);
        plotGroup.append("text")
            .attr("class", "x title")
            .attr("fill", "#000")
            .attr("transform", "translate(" + (this.config.size.width - this.config.padding.left - this.config.padding.right) / 2 + "," + (this.config.size.height - this.config.padding.top - 50) + ")")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .text(this.config.axis.x.label.text);
    
        // Add the Y Axis
        this.yAxis.tickFormat(this.config.axis.y.tick.format)
            .ticks(1); // Initial transition looks better if there is only one tick
        plotGroup.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
        plotGroup.append("text")
            .attr("class", "y title")
            .attr("fill", "#000")
            .attr("transform", "translate(" + -55 + "," + (this.config.size.height - this.config.padding.bottom - this.config.padding.top) / 2 + ")rotate(270)")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .text(this.config.axis.y.label.text);
    
        // Add location supports
        const locLine = plotGroup.append("line")
            .attr("class", "locLine")
            .style("stroke-dasharray", "3,3")
            .style("display", "none");

        const locCircle = plotGroup.append("circle")
            .attr("r", 3)
            .attr("class", "locCircle")
            .style("display", "none");

        plotGroup.append("line")
            .attr("class", "xLocLine")
            .style("stroke-dasharray", "4,2,2,2")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", this.config.size.height - this.config.padding.bottom - this.config.padding.top)
            .style("display", "none");
    
        plotGroup.append("line")
            .attr("class", "yLocLine")
            .style("stroke-dasharray", "4,2,2,2")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.config.size.width - this.config.padding.left - this.config.padding.right)
            .attr("y2", 0)
            .style("display", "none");
    
        plotGroup.append("rect")
            .attr("class", "overlay")
            .attr("width", this.config.size.width - this.config.padding.left - this.config.padding.right)
            .attr("height", this.config.size.height - this.config.padding.bottom - this.config.padding.top)
            .style("opacity", 0)
            .on("mouseover", function() {
                const mouse = d3.mouse(this);
                const series = svg.selectAll<SVGPathElement, Serie>("path.line");
                const closest = thisChart.closestPoint(series, mouse);
                if (closest) {
                    thisChart.updateLocDrawing(mouse, closest);
                    d3.selectAll(".xLocLine").style("display", null);
                    svg.selectAll(".yLocLine").style("display", null);
                    locLine.style("display", null);
                    locCircle.style("display", null);
                }
            })
            .on("mouseout", function() {
                thisChart.hideLocDrawing();
            })
            .on("mousemove", function() {
                const mouse = d3.mouse(this);
                const series = svg.selectAll<SVGPathElement, Serie>("path.line");
                const closest = thisChart.closestPoint(series, mouse);
                if (closest) {
                    thisChart.updateLocDrawing(mouse, closest);
                }
            })
            .on("click", function() {
                const mouse = d3.mouse(this);
                const series = svg.selectAll<SVGPathElement, Serie>("path.line");
                const closest = thisChart.closestPoint(series, mouse);
                if (closest) {
                    thisChart.config.data.onclick(closest.serie, closest.index);
                }
            });

        this.load(this.config.data);

    }

    // ***************************
    // Set axis min and max value.
    // ***************************
    axisRange(range: {min: {x?: Date, y?: number}, max: {x?: Date, y?: number}}) {
        if (range.min.x) {
            this.config.axis.rangeVal.min.x = range.min.x;
        }
        if (range.min.y) {
            this.config.axis.rangeVal.min.y = range.min.y;
        }
        if (range.max.x) {
            this.config.axis.rangeVal.max.x = range.max.x;
        }
        if (range.max.y) {
            this.config.axis.rangeVal.max.y = range.max.y;
        }
    }

    // ****************
    // Set axis labels.
    // ****************
    axisLabels(labels: {x?: string, y?: string}) {
        if (labels.x) {
            this.config.axis.x.label.text = labels.x;
        }
        if (labels.y) {
            this.config.axis.y.label.text = labels.y;
        }
    }

    // *****************************
    // Get data loaded in the chart.
    // *****************************
    getData(serieId?: string) {
        const svg = d3.select(this.bindto + " svg");
        const seriesGroup = svg.select(".seriesGroup");
        const toReturn: Serie[] = [];
        seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup").each(function(serie) {
            if (!serieId || serieId === serie.id) {
                toReturn.push(serie);
            }
        });
        return toReturn;
    }

    // ***********************
    // Load data to the chart.
    // ***********************
    load(data: SeriesData) {
        this.theData = data;

        const ySerieIds = new Set(this.theData.series.map(s => s.id));
        const intersection = new Set<string>();
        for (const elem of ySerieIds) {
            if (this.hiddenSerieIds.has(elem)) {
                intersection.add(elem);
            }
        }
        this.hiddenSerieIds = intersection;
    }

    hideLocDrawing() {
        const svg = d3.select(this.bindto + " svg");
        const locLine = svg.select(".plotGroup .locLine")
        const locCircle = svg.select(".plotGroup .locCircle")
        d3.selectAll(".xLocLine").style("display", "none");
        svg.selectAll(".yLocLine").style("display", "none");
        locLine.style("display", "none");
        locCircle.style("display", "none");
    }

    updateLocDrawing(mouse: [number, number], closest: Closest) {
        const svg = d3.select(this.bindto + " svg");
        const locLine = svg.select(".plotGroup .locLine")
        const locCircle = svg.select(".plotGroup .locCircle")
        const point = closest.serie.points[closest.index].slice();
        const scaledPX = this.xScale(point[0]);
        const scaledPY = this.yScale(point[1]);
        if (scaledPX && scaledPY) {
            locLine.attr("x1", scaledPX).attr("y1", scaledPY).attr("x2", mouse[0]).attr("y2", mouse[1]);
            locCircle.attr("cx", scaledPX).attr("cy", scaledPY);
            d3.selectAll(".xLocLine").attr("transform", "translate(" + scaledPX + ",0)");
            svg.selectAll(".yLocLine").attr("transform", "translate(0," + scaledPY + ")");
        }
    }

    // eslint-disable-next-line max-lines-per-function
    draw() {
        const seriesData = this.theData;
        if (seriesData === null) {
            console.log("'draw' called but 'theData' is not defined");
            return;
        }
        const thisChart = this;
        const svg = d3.select(this.bindto + " svg");
        const plotGroup = svg.select(".plotGroup");
        const seriesGroup = svg.select(".seriesGroup");
        const legendGroup = svg.select(".legendGroup");
        // Desactivate 'pointer-events' for '.overlay' and hide mouse drawing
        plotGroup.select("rect.overlay").style("pointer-events", "none");
        this.hideLocDrawing();

        const series = seriesData.series;
        const oldSeries = seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup").data();
        const oldYDomain = this.yScale.domain();
        this.updateXYScalesDomain();

        // Draw lines and areas representing each serie
        const serieGroup = seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup").data(series, serie => serie.id);

        const serieGroupEnter = serieGroup.enter()
            .append("g")
            .attr("class", "serieGroup");
        serieGroupEnter.filter(serie => seriesData.repTypes && seriesData.repTypes[serie.id] === Chart.AREA)
            .append("path")
            .attr("class", "area")
            .attr("d", function(serie) { return thisChart.areaGenerator0(serie.linkType)(serie.points); })
            .style("fill", (_d, i) => this.color(i))
            .style("stroke", "none")
            .style("fill-opacity", 0.2);
        serieGroupEnter
            .append("path")
            .attr("class", "line")
            .attr("d", function(serie) { return thisChart.lineGenerator0(serie.linkType)(serie.points); })
            .style("stroke", (_d, i) => this.color(i))
            .style("fill", "none")
            .style("stroke-width", 2);

        this.updateCurves(oldSeries, oldYDomain);
            
        // Draw circles representing a selection and a reference for each serie
        serieGroupEnter
            .append("circle")
            .attr("class", "selection")
            .attr("r", 3.5)
            .style("stroke-width", 1);
        
        serieGroupEnter
            .append("circle")
            .attr("class", "reference")
            .attr("r", 2)
            .style("stroke-width", 2);
        
        this.updateSelectionCircle();
        this.updateReferencedCircle();

        // @ts-ignore
        const t: d3.Transition<d3.BaseType,Serie,any,any> = d3.transition().duration(this.config.transition.duration);
        const serieGroupExit = serieGroup.exit<Serie>();
        serieGroupExit.select("path.area")
            .transition(t)
            .attr("d", function(serie) { return thisChart.areaGenerator0(serie.linkType)(serie.points); });
        serieGroupExit.select("path.line")
            .transition(t)
            .attr("d", function(serie) { return thisChart.lineGenerator0(serie.linkType)(serie.points); });
        serieGroupExit
            .transition(t)
            .remove();

        // Draw axes
        if (series.length > 0 && series[0].id === HEADCOUNT_ID && this.config.axis.rangeVal.max.y < 10) {
            this.yAxis.ticks(this.config.axis.rangeVal.max.y);
        }
        else {
            this.yAxis.ticks(10);
        }
        plotGroup.select<SVGGElement>(".x.axis")
            .transition(t)
            .call(this.xAxis);
        plotGroup.select<SVGGElement>(".y.axis")
            .transition(t)
            .call(this.yAxis);

        plotGroup.select(".x.title").text(this.config.axis.x.label.text);
        plotGroup.select(".y.title").text(this.config.axis.y.label.text);

        // Draw legend items associated to each serie
        legendGroup.selectAll(".legend-item").remove();
        const legendItem = legendGroup.selectAll(".legend-item").data(series).enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", function(_d, i) { return "translate(" + 0 + "," + (thisChart.config.size.height - thisChart.config.padding.top - 50 + i*15) + ")"; })
            .style("opacity", function(d) { return thisChart.hiddenSerieIds.has(d.id) ? 0.3 : 1; })
            .on("mouseover", function(d) { thisChart.focus(d.id); })
            .on("mouseout", function(_d) { thisChart.revert(); })
            .on("click", function(d) { thisChart.config.legend.item.onclick(d.id); });
    
        legendItem
            .append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 10);

        const legendItemText = legendItem
            .append("text")
            .attr("fill", "#000")
            .attr("font-size", 10)
            .text(function(d) { return seriesData.names[d.id]; });

        const legendHeight = this.config.padding.bottom - Chart.legendPadding.t - Chart.legendPadding.b;
        const legendWidth = this.config.size.width - Chart.legendPadding.l - Chart.legendPadding.r;
    
        const ratio = legendHeight / legendWidth;
        const itemLengthList = legendItemText.nodes().map(item => item.getComputedTextLength() + 16).reverse();
        for (let nLines = 1 ; nLines <= itemLengthList.length; nLines++) {
            const wMax = nLines * 10 / ratio;
            const totalLengthList = cut(itemLengthList.slice(), nLines, wMax);
            if (totalLengthList !== null && (totalLengthList.length <= nLines)) {
                const greatestLine = d3.max(totalLengthList) as number;
                const fontSize = d3.min([18, legendHeight / totalLengthList.length, legendWidth / greatestLine * 10]) as number * 0.9;
                const strokeWidth = fontSize * 0.9
                legendItem.each(function(d, i) {
                    const legendDef = d.legendDef;
                    if (legendDef) {
                        const xCentering = Math.max(0, (legendWidth - totalLengthList[legendDef.lLegend] / 10 * fontSize * 1.03) / 2);
                        d3.select(this).attr("transform", "translate(" + (xCentering + legendDef.xLegend / 10 * fontSize * 1.03) + "," + (legendDef.lLegend * legendHeight / totalLengthList.length + fontSize) + ")");
                    }
                    d3.select(this).select("text")
                        .attr("font-size", fontSize + "px")
                        .attr("transform", function() { return "translate(" + (1.4 * fontSize) + ",0)"; });
                    d3.select(this).select("line")
                        .attr("x1", strokeWidth * 0.3)
                        .attr("y1", -strokeWidth * 0.4)
                        .attr("x2", strokeWidth * 1.3)
                        .attr("y2", -strokeWidth * 0.4)
                        .attr("stroke-width", strokeWidth)
                        .style("stroke", thisChart.color(i));
                });
                break;
            }
        }

        function cut(lengthList: number[], nLines: number, wMax: number) {
            if (lengthList.length === 0) {
                console.log("'cut' is called but there is no item in legend");
            }
            let curTotalLength = 0;
            let curLineCount = 0;
            let curColumnIndex = 0;
            let serieIndex = 0;
            const totalLengthList = [];

            let len = lengthList.pop() as number;
            series[serieIndex].legendDef = {
                xLegend: curTotalLength,
                lLegend: curLineCount,
                cLegend: curColumnIndex,
                len: len
            };
            curTotalLength = curTotalLength + len;
            serieIndex = serieIndex + 1;
            curColumnIndex = curColumnIndex + 1;

            while (lengthList.length !== 0) {
                len = lengthList.pop() as number;
                if ((curTotalLength + len) > wMax) {
                    curColumnIndex = 0;
                    curLineCount = curLineCount + 1;
                    totalLengthList.push(curTotalLength);
                    curTotalLength = 0;
                }
                series[serieIndex].legendDef = {
                    len: len,
                    xLegend: curTotalLength,
                    lLegend: curLineCount,
                    cLegend: curColumnIndex
                }

                curTotalLength = curTotalLength + len;
                serieIndex = serieIndex + 1;
                curColumnIndex = curColumnIndex + 1;
            }
            if (curLineCount > nLines) {
                return null;
            }
            totalLengthList.push(curTotalLength);
            return totalLengthList;
        }
    }

    // eslint-disable-next-line max-lines-per-function
    updateZoom() {
        const seriesData = this.theData;
        if (seriesData === null) {
            throw Error("'updateZoom' called but 'theData' is not defined");
        }
        const thisChart = this;
        const svg = d3.select(this.bindto + " svg");
        const plotGroup = svg.select(".plotGroup");
        const seriesGroup = svg.select(".seriesGroup");
        // Desactivate 'pointer-events' for '.overlay' and hide mouse drawing
        plotGroup.select("rect.overlay").style("pointer-events", "none");
        this.hideLocDrawing();

        const series = seriesData.series;
        const serieGroup = seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup").data(series, serie => serie.id);

        const serieGroupEnter = serieGroup.enter()
            .append("g")
            .attr("class", "serieGroup");
        serieGroupEnter.filter(serie => seriesData.repTypes && seriesData.repTypes[serie.id] === Chart.AREA)
            .append("path")
            .attr("class", "area")
            .attr("d", function(serie) { return thisChart.areaGenerator(serie.linkType)(serie.points); })
            .style("fill", (_serie, i) => this.color(i))
            .style("stroke", "none")
            .style("fill-opacity", 0.2);
        serieGroupEnter
            .append("path")
            .attr("class", "line")
            .attr("d", function(serie) { return thisChart.lineGenerator(serie.linkType)(serie.points); })
            .style("stroke", (_serie, i) => this.color(i))
            .style("fill", "none")
            .style("stroke-width", 2);

        serieGroup.filter(serie => seriesData.repTypes && seriesData.repTypes[serie.id] === Chart.AREA)
            .select("path.area")
            .attr("d", function(serie) { return thisChart.areaGenerator(serie.linkType)(serie.points); });
        serieGroup
            .select("path.line")
            .attr("d", function(serie) { return thisChart.lineGenerator(serie.linkType)(serie.points); });

        // Draw circles representing a selection and a reference for each serie
        serieGroupEnter
            .append("circle")
            .attr("class", "selection")
            .attr("r", 3.5)
            .style("stroke-width", 1);
        
        serieGroupEnter
            .append("circle")
            .attr("class", "reference")
            .attr("r", 2)
            .style("stroke-width", 2);
        
        this.updateSelectionCircle();
        this.updateReferencedCircle();

        serieGroup.exit().remove();

        // Transition to new X and Y range
        this.updateXYScalesDomain();

        serieGroup.filter(d => seriesData.repTypes && seriesData.repTypes[d.id] === Chart.AREA)
            .select("path.area")
            .transition().duration(this.config.transition.duration)
            .attr("d", function(serie) { return thisChart.areaGenerator(serie.linkType)(serie.points); });
        const zoomTransition = serieGroup
            .select("path.line")
            .transition().duration(this.config.transition.duration)
            .attr("d", function(serie) { return thisChart.lineGenerator(serie.linkType)(serie.points); });

        // Draw axes
        if (series.length > 0 && series[0].id === HEADCOUNT_ID && this.config.axis.rangeVal.max.y < 10) {
            this.yAxis.ticks(this.config.axis.rangeVal.max.y);
        }
        else {
            this.yAxis.ticks(10);
        }
        plotGroup.select<SVGGElement>(".x.axis")
            .transition().duration(this.config.transition.duration)
            .call(this.xAxis);
        plotGroup.select<SVGGElement>(".y.axis")
            .transition().duration(this.config.transition.duration)
            .call(this.yAxis);

        // Finalization after transition
        zoomTransition
            .on("end", function(_p,j) {
                // If transition 0 is ended, no need to wait the others, they are virtually ended
                if (j === 0) {
                    // Activate 'pointer-events' for '.overlay'
                    plotGroup.select("rect.overlay").style("pointer-events", "auto");
                }
            });
        return zoomTransition;
    }

    // eslint-disable-next-line max-lines-per-function
    updateXYScalesDomain() {
        const seriesData = this.theData;
        if (seriesData === null) {
            console.log("'updateXYScalesDomain' called but 'theData' is not defined");
            return;
        }
        const thisChart = this;
        const series = seriesData.series;
        const visibleSeries = series.filter(s => !this.hiddenSerieIds.has(s.id));
        
        if (!this.config.axis.rangeVal.min.x) {
            const xSeriesMin = d3.min(series, function (serie) {
                if (serie.points.length !== 0) {
                    const serieMin = d3.min(serie.points, point => point[0]);
                    if (typeof serieMin !== "undefined") {
                        return serieMin;
                    }
                }
                return new Date(-Infinity); // should not occured
            });
            this.config.axis.rangeVal.min.x = typeof xSeriesMin === "undefined" 
                ? new Date(-Infinity) // should not occured
                : xSeriesMin;
        }
        if (!this.config.axis.rangeVal.max.x) {
            const xSeriesMax = d3.max(series, function (serie) { 
                if (serie.points.length !== 0) {
                    const serieMax = d3.max(serie.points, function (point) { 
                        return point[0];
                    });
                    if (typeof serieMax !== "undefined") {
                        return serieMax;
                    }
                }
                return new Date(Infinity); // should not occured
            });
            this.config.axis.rangeVal.max.x = typeof xSeriesMax === "undefined" 
                ? new Date(Infinity) // should not occured
                : xSeriesMax;
        }
        if (visibleSeries.length !== 0) {
            const visibleYSeriesMin = d3.min(visibleSeries, function (serie) { 
                // During zoom process, some points can have to be ignored (when out of the X range)
                const points = serie.points.filter(point => 
                    point[0]>= thisChart.config.axis.rangeVal.min.x 
                    && point[0] <= thisChart.config.axis.rangeVal.max.x
                );
                return points.length === 0 
                    ? 1 
                    : d3.min(points, point => point[1]);
            });
            this.config.axis.rangeVal.min.y = typeof visibleYSeriesMin === "undefined" ? 0 : Math.min(visibleYSeriesMin, 0);
            const visibleYSeriesMax = d3.max(visibleSeries, function (d) { 
                // During zoom process, some points can have to be ignored (when out of the X range)
                const points = d.points.filter(point => 
                    point[0]>= thisChart.config.axis.rangeVal.min.x 
                    && point[0] <= thisChart.config.axis.rangeVal.max.x
                );
                return points.length === 0 
                    ? 1 
                    : d3.max(points, point => point[1]);
            });
            this.config.axis.rangeVal.max.y = typeof visibleYSeriesMax === "undefined" ? 1 : visibleYSeriesMax;
        }
        // Don't change bounds set by user for X domain using 'nice' function
        this.xScale.domain([this.config.axis.rangeVal.min.x, this.config.axis.rangeVal.max.x]);
        this.yScale.domain([this.config.axis.rangeVal.min.y, this.config.axis.rangeVal.max.y]).nice();
    }

    static lineCurveFactory(linkType: string) {
        if (!linkType || linkType === Chart.LINEAR_CURVE) {
            return d3.curveLinear;
        }
        if (linkType === Chart.STEP_AFTER_CURVE) {
            return d3.curveStepAfter;
        }
        throw new Error(linkType + " is an unknown link type");
    }
    
    lineGenerator(linkType: string) {
        const thisChart = this;
        return d3.line<[Date, number]>()
            .x(function(point) { 
                const scaled = thisChart.xScale(point[0]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .y(function(point) { 
                const scaled = thisChart.yScale(point[1]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .curve(Chart.lineCurveFactory(linkType));
    }

    areaGenerator(linkType: string) {
        const thisChart = this;
        return d3.area<[Date, number]>()
            .x(function(point) { 
                const scaled = thisChart.xScale(point[0]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .y0(this.config.size.height - this.config.padding.bottom - this.config.padding.top)
            .y1(function(point) { 
                const scaled = thisChart.yScale(point[1]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .curve(Chart.lineCurveFactory(linkType));
    }
    
    lineGenerator0(linkType: string) {
        const thisChart = this;
        return d3.line<[Date, number]>()
            .x(function(point) { 
                const scaled = thisChart.xScale(point[0]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .y(function(_point) { 
                const scaled = thisChart.yScale(0);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .curve(Chart.lineCurveFactory(linkType));
    }
    
    areaGenerator0(linkType: string) {
        const thisChart = this;
        return d3.area<[Date, number]>()
            .x(function(d) { 
                const scaled = thisChart.xScale(d[0]);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .y0(this.config.size.height - this.config.padding.bottom - this.config.padding.top)
            .y1(function(_d) { 
                const scaled = thisChart.yScale(0);
                return typeof scaled === "undefined" ? NaN : scaled;
            })
            .curve(Chart.lineCurveFactory(linkType));
    }
    
    // eslint-disable-next-line max-lines-per-function
    updateCurves(oldSeries: Serie[], anOldYDomain: number[]) {
        const thisChart = this;
        const svg = d3.select(this.bindto + " svg");
        const plotGroup = svg.select(".plotGroup");
        const serieGroup = d3.select(this.config.bindto).selectAll<SVGGElement, Serie>(".serieGroup");
        // @ts-ignore
        const trans: d3.Transition<d3.BaseType,Serie,any,any> = d3.transition().duration(this.config.transition.duration);

        serieGroup.select<SVGPathElement>("path.area")
            .transition(trans)
            .attrTween("d", function(serie) { return lineTween.call(this, serie, d3.select(this)); })
            .style("opacity", function(serie) { return thisChart.hiddenSerieIds.has(serie.id) ? 0 : 1; });
        serieGroup.select<SVGPathElement>("path.line")
            .style("stroke-width", 2)
            .transition(trans)
            .attrTween("d", function(serie) { return lineTween.call(this, serie, d3.select(this)); })
            .style("opacity", function(serie) { return thisChart.hiddenSerieIds.has(serie.id) ? 0 : 1; })
            .on("end", function(_serie,j) {
                // If transition 0 is ended, no need to wait the others, they are virtually ended
                if (j === 0) {
                    // Activate 'pointer-events' for '.overlay'
                    plotGroup.select("rect.overlay").style("pointer-events", "auto");
                }
            });
            
        function duplicate(points: [number, number][], linkType: string) {
            return points.reduce(function(accu: [number, number][], point: [number, number], i: number) {
                if (i === 0) {
                    accu.push(point);
                }
                else {
                    const duplicatedPoint = (linkType === Chart.STEP_AFTER_CURVE) ? [point[0], points[i - 1][1]] : point;
                    accu.push(duplicatedPoint as [number, number], point);
                }
                return accu;
            }, []);
        }

        // eslint-disable-next-line max-lines-per-function
        function lineTween(
            newSerie: Serie, 
            area: d3.Selection<SVGPathElement, Serie, null, undefined>
        ) {
            const areaRep = area.classed("area");
            // Build 'oldPoints' and 'newpoints', adding some interpolated points to have same X values
            const filteredOldSeries = oldSeries.filter(s => (s.id === newSerie.id));
            const noOldSerie = (filteredOldSeries.length === 0);
            let oldSerie;
            let oldYDomain;
            if (noOldSerie) {
                oldSerie = newSerie;
                oldYDomain = thisChart.yScale.domain();
            }
            else {
                oldSerie = filteredOldSeries[0];
                oldYDomain = anOldYDomain
            }

            const xSet = new Set(oldSerie.points.map(point => point[0].getTime()));
            newSerie.points.forEach(point => xSet.add(point[0].getTime()));
            const xArray = [...xSet].sort((a, b) => a - b);

            function addingScale(serie: Serie, domain: number[], range: number[]) {
                return (serie.linkType === Chart.STEP_AFTER_CURVE)
                ? function(x: number) {
                    const insertionIndex = d3.bisectRight(domain, x);
                    return serie.points[insertionIndex === 0 ? insertionIndex : insertionIndex - 1][1];
                }
                : d3.scaleLinear()
                    .domain(domain)
                    .range(range) as (x: number) => number;
            }

            const oldDomain = oldSerie.points.map(point => point[0].getTime());
            const oldRange = oldSerie.points.map(point => point[1]);
            const addingOldScale = addingScale(oldSerie, oldDomain, oldRange);
            const oldYArray = xArray.map(x => addingOldScale(x));

            const newDomain = newSerie.points.map(point => point[0].getTime());
            const newRange = newSerie.points.map(point => point[1]);
            const addingNewScale = addingScale(newSerie, newDomain, newRange);
            const newYArray = xArray.map(x => addingNewScale(x));
            
            // Build oldPoints and newPoints with pixel values
            const oldYScale = d3.scaleLinear()
                .range(thisChart.yScale.range())
                .domain(oldYDomain);

            let oldPoints = xArray.map((x,i) => {
                const xScaled = thisChart.xScale(new Date(x));
                const yScaled = oldYScale(noOldSerie ? 0 : oldYArray[i]);
                return [
                    typeof xScaled === "undefined" ? 0 : xScaled, 
                    typeof yScaled === "undefined" ? 0 : yScaled
                ];
            }) as [number, number][];
            let newPoints = xArray.map((x,i) => {
                const xScaled = thisChart.xScale(new Date(x));
                const yScaled = thisChart.yScale(newYArray[i]);
                return [
                    typeof xScaled === "undefined" ? 0 : xScaled, 
                    typeof yScaled === "undefined" ? 0 : yScaled
                ];
            }) as [number, number][];

            // If needed, duplicate points to manage 'step_after' style
            if (oldSerie.linkType === Chart.STEP_AFTER_CURVE || newSerie.linkType === Chart.STEP_AFTER_CURVE) {
                oldPoints = duplicate(oldPoints, oldSerie.linkType);
                newPoints = duplicate(newPoints, newSerie.linkType);
            }

            // Build interpolator between oldPoints and newPoints
            const interpolate = d3.interpolate(oldPoints, newPoints);
            // Build svg path generator 
            const generateSvgPath = areaRep
                ? d3.area<[number, number]>()
                    .x(function(point) { return point[0]; })
                    .y0(thisChart.config.size.height - thisChart.config.padding.bottom - thisChart.config.padding.top)
                    .y1(function(point) { return point[1]; })
                    .curve(Chart.lineCurveFactory(Chart.LINEAR_CURVE))
                : d3.line<[number, number]>()
                    .x(function(point) { return point[0]; })
                    .y(function(point) { return point[1]; })
                    .curve(Chart.lineCurveFactory(Chart.LINEAR_CURVE));
            
            return function(t: number) {
                let path
                if (t < 1) {
                    path = generateSvgPath(interpolate(t));
                }
                else {
                    path = areaRep
                        ? thisChart.areaGenerator(newSerie.linkType)(newSerie.points)
                        : thisChart.lineGenerator(newSerie.linkType)(newSerie.points);
                }
                return (path === null) ? "" : path;
            };
        }
    }
        
    updateHiddenCurves() {
        const thisChart = this;
        const svg = d3.select(this.bindto + " svg");
        const plotGroup = svg.select(".plotGroup");
        const serieGroup = d3.select(this.config.bindto).selectAll<SVGGElement, Serie>(".serieGroup");
        //@ts-ignore
        const t: d3.Transition<d3.BaseType,Serie,any,any> = d3.transition().duration(this.config.transition.duration);

        serieGroup.select("path.area")
            .transition(t)
            .style("opacity", function(serie) { return thisChart.hiddenSerieIds.has(serie.id) ? 0 : 1; })
            .attr("d", function(d) { return thisChart.areaGenerator(d.linkType)(d.points); });
        serieGroup.select("path.line")
            .transition(t)
            .style("opacity", function(serie) { return thisChart.hiddenSerieIds.has(serie.id) ? 0 : 1; })
            .attr("d", function(serie) { return thisChart.lineGenerator(serie.linkType)(serie.points); });

        plotGroup.select<SVGGElement>(".x.axis")
            .transition(t)
            .call(this.xAxis);
        plotGroup.select<SVGGElement>(".y.axis")
            .transition(t)
            .call(this.yAxis);
    }
        
    updateSelectionCircle(noTransition?: boolean) {
        const thisChart = this;
        // @ts-ignore
        const t: d3.Transition<d3.BaseType,Serie,any,any> = d3.transition()
            .duration(noTransition ? 0 : this.config.transition.duration);
        d3.select(this.bindto).selectAll<SVGGElement, Serie>(".serieGroup").select("circle.selection")
            .style("stroke", (_serie, i) => this.color(i))
            .style("display", function(serie) {
                return (thisChart.selectedPoint && serie.id === thisChart.selectedPoint.serieId && !thisChart.hiddenSerieIds.has(serie.id)) ? null : "none"; 
            })
            .transition(t)
            .attr("cx", function(serie) {
                if (thisChart.selectedPoint && serie.id === thisChart.selectedPoint.serieId 
                    && serie.points.length !== 0 && serie.points.length > thisChart.selectedPoint.pointIndex) {
                    const xScaled = thisChart.xScale(serie.points[thisChart.selectedPoint.pointIndex][0]);
                    if (typeof xScaled !== "undefined") {
                        return xScaled;
                    }
                }
                return 0;
            })
            .attr("cy", function(serie) {
                if (thisChart.selectedPoint && serie.id === thisChart.selectedPoint.serieId 
                    && serie.points.length !== 0 && serie.points.length > thisChart.selectedPoint.pointIndex) {
                    const yScaled = thisChart.yScale(serie.points[thisChart.selectedPoint.pointIndex][1]);
                    if (typeof yScaled !== "undefined") {
                        return yScaled;
                    }
                }
                return 0;
            });
    }

    updateReferencedCircle() {
        const thisChart = this;
        const serieGroup = d3.select(this.bindto).selectAll<SVGGElement, Serie>(".serieGroup");
        serieGroup.select<SVGCircleElement>("circle.reference")
            .attr("cx", function(serie) {
                if (thisChart.referencedPoint && serie.id === thisChart.referencedPoint.serieId 
                    && serie.points.length !== 0 && serie.points.length > thisChart.referencedPoint.pointIndex) {
                    const xScaled = thisChart.xScale(serie.points[thisChart.referencedPoint.pointIndex][0]);
                    if (typeof xScaled !== "undefined") {
                        return xScaled;
                    }
                }
                return 0;
            })
            .attr("cy", function(serie) {
                if (thisChart.referencedPoint && serie.id === thisChart.referencedPoint.serieId 
                    && serie.points.length !== 0 && serie.points.length > thisChart.referencedPoint.pointIndex) {
                    const yScaled = thisChart.yScale(serie.points[thisChart.referencedPoint.pointIndex][1]);
                    if (typeof yScaled !== "undefined") {
                        return yScaled;
                    }
                }
                return 0;
            })
            .style("stroke", (_serie, i) => this.color(i))
            .style("display", function(serie) {
                return (thisChart.referencedPoint && serie.id === thisChart.referencedPoint.serieId) ? null : "none"; 
            });
    }

    // ************************************
    // Change data point state to selected.
    // ************************************
    doSelect(serieId: string, index: number) {
        this.selectedPoint = {serieId:serieId, pointIndex:index};
        this.updateSelectionCircle(true);
    }

    // **************************************
    // Change data point state to unselected.
    // **************************************
    unselect() {
        this.selectedPoint = null;
        this.updateSelectionCircle(true);
    }

    // **************************************
    // Change data point state to referenced.
    // **************************************
    reference(serieId: string, index: number) {
        this.referencedPoint = {serieId:serieId, pointIndex:index};
        this.updateReferencedCircle();
    }

    // ****************************************
    // Change data point state to unreferenced.
    // ****************************************
    unreference() {
        this.referencedPoint = null;
        this.updateReferencedCircle();
    }

    // *********************************
    // This API hides specified targets.
    // *********************************
    hide(serieIds: string[]) {
        const thisChart = this;
        this.hiddenSerieIds.clear();
        serieIds.forEach(function(serieId) {thisChart.hiddenSerieIds.add(serieId); });
        this.applyHiddenSeries();
    }

    // ****************************************************
    // This API toggles (shows or hides) specified targets.
    // ****************************************************
    toggle(serieId: string) {
        if (this.hiddenSerieIds.has(serieId)) {
            this.hiddenSerieIds.delete(serieId);
        }
        else {
            this.hiddenSerieIds.add(serieId);
        }
        this.applyHiddenSeries();
        this.updateXYScalesDomain();
        this.updateHiddenCurves();
        this.updateSelectionCircle();
    }

    applyHiddenSeries() {
        const thisChart = this;
        const svg = d3.select(this.bindto + " svg");
        const legendGroup = svg.select(".legendGroup");
        legendGroup.selectAll<SVGGElement, Serie>(".legend-item")
            .style("opacity", function(d) { return thisChart.hiddenSerieIds.has(d.id) ? 0.3 : 1; })
    }

    // ****************************
    // Get data shown in the chart.
    // ****************************
    shownData() {
        return this.getData().filter(d => this.hiddenSerieIds.has(d.id));
    }

    // ****************************
    // Get data hidden in the chart.
    // ****************************
    getHiddenSerieIds() {
        return [...this.hiddenSerieIds];
    }

    // **************************************************************
    // This API highlights specified targets and fade out the others.
    // **************************************************************
    focus(serieId: string) {
        if (this.hiddenSerieIds.has(serieId)) {
            return;
        }

        const svg = d3.select(this.bindto + " svg");
        const legendGroup = svg.select(".legendGroup");
        const seriesGroup = svg.select(".seriesGroup");
        legendGroup.selectAll<SVGGElement, Serie>(".legend-item").filter(d => (d.id !== serieId) && !this.hiddenSerieIds.has(d.id))
            .style("opacity", 0.3);

        seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup")
            .filter(serie => (serie.id !== serieId) && !this.hiddenSerieIds.has(serie.id))
            .style("opacity", 0.3);
        seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup>path.line")
            .filter(serie => (serie.id === serieId) && !this.hiddenSerieIds.has(serie.id))
            .style("stroke-width", 3);
    }

    // ***********************************
    // This API reverts specified targets.
    // ***********************************
    revert() {
        const svg = d3.select(this.bindto + " svg");
        const legendGroup = svg.select(".legendGroup");
        const seriesGroup = svg.select(".seriesGroup");
        legendGroup.selectAll<SVGGElement, Serie>(".legend-item").filter(d => !this.hiddenSerieIds.has(d.id))
            .style("opacity", 1);

        seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup")
            .filter(serie => !this.hiddenSerieIds.has(serie.id))
            .style("opacity", 1);
        seriesGroup.selectAll<SVGGElement, Serie>(".serieGroup>path.line")
            .filter(serie => !this.hiddenSerieIds.has(serie.id))
            .style("stroke-width", 2);
    }

    // *********************************************
    // Search the closest point among all the series
    // *********************************************
    closestPoint(series: d3.Selection<SVGPathElement, Serie, SVGSVGElement, unknown>, point: [number, number]) {
        const thisChart = this;
        function sqrDistance(point2: [number, number]) {
            const dx = point2[0] - point[0],
                dy = point2[1] - point[1];
            return dx * dx + dy * dy;
        }
        const closestList: Closest[] = [];
        series.filter(serie => !this.hiddenSerieIds.has(serie.id))
            .each(function(serie) {
                const pathPoints = serie.points.map(curPoint => {
                    const xScaled = thisChart.xScale(curPoint[0]);
                    const yScaled = thisChart.yScale(curPoint[1]);
                    return [
                        typeof xScaled === "undefined" ? 0 : xScaled, 
                        typeof yScaled === "undefined" ? 0 : yScaled
                    ];
                }) as [number, number][];
                const closest: Closest = {
                    serie: serie,
                    index: -1,
                    distance2: Infinity
                };

                pathPoints.forEach(function(pathPoint: [number, number], i: number) {
                    const distance2 = sqrDistance(pathPoint);
                    if (distance2 < closest.distance2) {
                        closest.distance2 = distance2;
                        closest.index = i;
                    }
                })

                closestList.push(closest);
            });
        const min = d3.scan(closestList, (a, b) => a.distance2 - b.distance2);
        if (typeof min === "undefined") {
            return undefined;
        }
        return closestList[min];
    }

}

type ChartConfig = {
    bindto: string;
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    },
    size: {
        height: number;
        width: number;
    },
    axis: {
        x: {
            label: {
                text: string;
            },
            tick: {
                format: string;
            },
            min: Date;
            max: Date;
        },
        y: {
            label: {
                text: string
            },
            tick: {
                format: (value: number) => string
            }
        },
        rangeVal: {
            min: {
                x: Date;
                y: number;
            },
            max: {
                x: Date;
                y: number;
            }
        }
    },
    legend: {
        item: {
            onclick: (id: string) => void;
        }
    },
    data: SeriesData;
    color: {
        pattern: string[];
    },
    transition: {
        duration: number;
    }
};

type SeriesData = {
    names: {[serieKey: string]: string};
    series: Serie[];
    repTypes: {[serieKey: string]: string};
    onclick: (serie: Serie, i: number) => void;
};

type Serie = {
    id: string;
    points: [Date, number][];
    linkType: string;
    legendDef?: LegendDef;
}

type LegendDef = {
    xLegend: number;
    lLegend: number;
    cLegend: number;
    len: number;
}

type Closest = {
    serie: Serie;
    index: number;
    distance2: number;
}