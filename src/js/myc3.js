var myc3 = (function() {
    var LINE = 'line';
    var AREA = 'area';
    var LINEAR_CURVE = 'L';
    var STEP_AFTER_CURVE = 'SA';
        
    function generate(args) {
        var chart = {};
        chart.hiddenSerieIds = new Set();
        
        args.size.width = !args.size.width ? 0 : args.size.width;
        args.size.height = !args.size.height ? 0 : args.size.height;
        args.padding.left = !args.padding.left ? 0 : args.padding.left;
        args.padding.right = !args.padding.right ? 0 : args.padding.right;
        args.padding.top = !args.padding.top ? 15 : args.padding.top;
        args.padding.bottom = !args.padding.bottom ? 80 : args.padding.bottom;
    
        var color = d3.scaleOrdinal(args.color.pattern);

        var svg = d3.select(args.bindto).append("svg")
            .attr("width", args.size.width)
            .attr("height", args.size.height);

        // Define clipping (useful for zoom transition)
        // add 4 pixels to width and hight to avoid to cut curve lines and selection circle
        svg.append('defs')
            .append('clipPath')
            .attr('id', 'clip-' + args.bindto)
            .append('rect')
            .attr("transform", "translate(-4,-4)")
            .attr("width", args.size.width - args.padding.left - args.padding.right + 8)
            .attr("height", args.size.height - args.padding.bottom - args.padding.top + 8);
        
        var plotGroup = svg.append("g")
            .attr("transform", "translate(" + args.padding.left + "," + args.padding.top + ")");
    
        var legendPadding = {t: 38, r: 10, b: 2, l: 10},
            legendHeight = args.padding.bottom - legendPadding.t - legendPadding.b,
            legendWidth = args.size.width - legendPadding.l - legendPadding.r;
    
        chart.xScale = d3.scaleTime()
            .range([0, args.size.width - args.padding.left - args.padding.right]);
        chart.yScale = d3.scaleLinear()
            .range([args.size.height - args.padding.bottom - args.padding.top, 0]);
    
        var seriesGroup = plotGroup.append('g')
            .attr("clip-path", "url(#clip-" + args.bindto + ") ");
        var legendGroup = plotGroup.append('g')
            .attr('transform', "translate(" + (legendPadding.l - args.padding.left) +"," + (legendPadding.t + args.size.height - args.padding.bottom - args.padding.top) + ")");
    
        // Add the X Axis
        chart.xAxis = d3.axisBottom(chart.xScale)
            .ticks(5)
            .tickFormat(d3.timeFormat(args.axis.x.tick.format));
        plotGroup.append("g")
            .attr("transform", "translate(0," + (args.size.height - args.padding.bottom - args.padding.top) + ")")
            .attr("class", "x axis")
            .call(chart.xAxis);
        plotGroup.append("text")
            .attr("class", "x title")
            .attr("fill", "#000")
            .attr('transform', 'translate(' + (args.size.width - args.padding.left - args.padding.right) / 2 + ',' + (args.size.height - args.padding.top - 50) + ')')
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .text(args.axis.x.label.text);
    
        // Add the Y Axis
        chart.yAxis = d3.axisLeft(chart.yScale)
            .tickFormat(args.axis.y.tick.format)
            .ticks(1); // Initial transition looks better if there is only one tick
        plotGroup.append("g")
            .attr("class", "y axis")
            .call(chart.yAxis);
        plotGroup.append("text")
            .attr("class", "y title")
            .attr("fill", "#000")
            .attr('transform', 'translate(' + -55 + ',' + (args.size.height - args.padding.bottom - args.padding.top) / 2 + ')rotate(270)')
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .text(args.axis.y.label.text);
    
        // Add location supports
        var locLine = plotGroup.append("line")
            .attr('class', 'locLine')
            .style("stroke-dasharray", "3,3")
            .style("display", "none");

        var locCircle = plotGroup.append("circle")
            .attr("r", 3)
            .attr('class', 'locCircle')
            .style("display", "none");

        plotGroup.append('line')
            .attr("class", "xLocLine")
            .style("stroke-dasharray", "4,2,2,2")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", args.size.height - args.padding.bottom - args.padding.top)
            .style("display", "none");
    
        plotGroup.append('line')
            .attr("class", "yLocLine")
            .style("stroke-dasharray", "4,2,2,2")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", args.size.width - args.padding.left - args.padding.right)
            .attr("y2", 0)
            .style("display", "none");
    
        plotGroup.append("rect")
            .attr("class", "overlay")
            .attr("width", args.size.width - args.padding.left - args.padding.right)
            .attr("height", args.size.height - args.padding.bottom - args.padding.top)
            .style("opacity", 0)
            .on("mouseover", function() {
                var mouse = d3.mouse(this);
                var series = svg.selectAll('path.line');
                var closest = chart.closestPoint(series, mouse);
                if (closest) {
                    chart.updateLocDrawing(mouse, closest);
                    d3.selectAll('.xLocLine').style("display", null);
                    svg.selectAll('.yLocLine').style("display", null);
                    locLine.style("display", null);
                    locCircle.style("display", null);
                }
            })
            .on("mouseout", function() {
                chart.hideLocDrawing();
            })
            .on("mousemove", function() {
                var mouse = d3.mouse(this);
                var series = svg.selectAll('path.line');
                var closest = chart.closestPoint(series, mouse);
                if (closest) {
                    chart.updateLocDrawing(mouse, closest);
                }
            })
            .on('click', function() {
                var mouse = d3.mouse(this);
                var series = svg.selectAll('path.line');
                var closest = chart.closestPoint(series, mouse);
                args.data.onclick(closest.serie, closest.index);
            });

        // TODO: replace 'chart' by 'args'?
        chart.bindto = args.bindto;
        chart.axis = {};
    
        chart.axis.x = {};
        chart.axis.x.label = {};
        chart.axis.x.label.text = args.axis.x.label.text;
    
        chart.axis.y = {};
        chart.axis.y.label = {};
        chart.axis.y.label.text = args.axis.y.label.text;
    
        chart.legend = {};
        chart.legend.item = {};
        chart.legend.item.onclick = args.legend.item.onclick;
    
        // ***********************************
        // Get and set axis min and max value.
        // ***********************************
        chart.axis.range = function(range) {
            if (!range) return chart.axis.rangeVal;
    
            if (!chart.axis.rangeVal) chart.axis.rangeVal = {};
    
            if (!chart.axis.rangeVal.min) chart.axis.rangeVal.min = {};
            if (range.min.x) chart.axis.rangeVal.min.x = range.min.x;
            if (range.min.y) chart.axis.rangeVal.min.y = range.min.y;
    
            if (!chart.axis.rangeVal.max) chart.axis.rangeVal.max = {};
            if (range.max.x) chart.axis.rangeVal.max.x = range.max.x;
            if (range.max.y) chart.axis.rangeVal.max.y = range.max.y;
        };
    
        // ************************
        // Get and set axis labels.
        // ************************
        chart.axis.labels = function(labels) {
            if (!labels) return {x:chart.axis.x.label.text, y:chart.axis.y.label.text};
            if (labels.x) chart.axis.x.label.text = labels.x;
            if (labels.y) chart.axis.y.label.text = labels.y;
        };
    
        // *****************************
        // Get data loaded in the chart.
        // *****************************
        chart.getData = function(serieId) {
            var toReturn = [];
            seriesGroup.selectAll('.serieGroup').each(function(d) {
                if (!serieId || serieId == d.id) {
                    toReturn.push(d);
                }
            });
            return toReturn;
        };
    
        // ***********************
        // Load data to the chart.
        // ***********************
        chart.load = function(data) {
            chart.theData = data;
    
            var ySerieIds = new Set(chart.theData.series.map(s=>s.id));
            var intersection = new Set();
            for (var elem of ySerieIds) {
                if (chart.hiddenSerieIds.has(elem)) {
                    intersection.add(elem);
                }
            }
            chart.hiddenSerieIds = intersection;
        }

        chart.hideLocDrawing = function() {
            d3.selectAll('.xLocLine').style("display", "none");
            svg.selectAll('.yLocLine').style("display", "none");
            locLine.style("display", "none");
            locCircle.style("display", "none");
        }

        chart.updateLocDrawing = function(mouse, closest) {
            var p = closest.serie.points[closest.index].slice();
            p[0] = chart.xScale(p[0]);
            p[1] = chart.yScale(p[1]);
            locLine.attr("x1", p[0]).attr("y1", p[1]).attr("x2", mouse[0]).attr("y2", mouse[1]);
            locCircle.attr("cx", p[0]).attr("cy", p[1]);
            d3.selectAll('.xLocLine').attr("transform", "translate(" + p[0] + ",0)");
            svg.selectAll('.yLocLine').attr("transform", "translate(0," + p[1] + ")");
        }
    
        chart.draw = function() {
            // Desactivate 'pointer-events' for '.overlay' and hide mouse drawing
            plotGroup.select("rect.overlay").style('pointer-events', 'none');
            chart.hideLocDrawing();

            var series = chart.theData.series;
            var oldSeries = seriesGroup.selectAll('.serieGroup').data();
            var oldYDomain = chart.yScale.domain();
            chart.updateXYScalesDomain();

            // Draw lines and areas representing each serie
            var serieGroup = seriesGroup.selectAll('.serieGroup').data(series, function(d) { return d.id; });
    
            var serieGroupEnter = serieGroup.enter()
                .append('g')
                .attr('class', 'serieGroup');
            serieGroupEnter.filter(d=>chart.theData.repTypes && chart.theData.repTypes[d.id] == AREA)
                .append('path')
                .attr('class', 'area')
                .attr('d', function(d) { return chart.areaGenerator0(d.linkType)(d.points); })
                .style('fill', (d, i) => color(i))
                .style('stroke', 'none')
                .style('fill-opacity', 0.2);
            serieGroupEnter
                .append('path')
                .attr('class', 'line')
                .attr('d', function(d) { return chart.lineGenerator0(d.linkType)(d.points); })
                .style('stroke', (d, i) => color(i))
                .style('fill', 'none')
                .style('stroke-width', 2);

            chart.updateCurves(oldSeries, oldYDomain);
                
            // Draw circles representing a selection and a reference for each serie
            serieGroupEnter
                .append('circle')
                .attr('class', 'selection')
                .attr('r', 3.5)
                .style('stroke-width', 1);
            
            serieGroupEnter
                .append('circle')
                .attr('class', 'reference')
                .attr('r', 2)
                .style('stroke-width', 2);
            
            chart.updateSelectionCircle();
            chart.updateReferencedCircle();

            var t = d3.transition().duration(args.transition.duration);
            var serieGroupExit = serieGroup.exit();
            serieGroupExit.select('path.area')
                .transition(t)
                .attr('d', function(d) { return chart.areaGenerator0(d.linkType)(d.points); });
            serieGroupExit.select('path.line')
                .transition(t)
                .attr('d', function(d) { return chart.lineGenerator0(d.linkType)(d.points); });
            serieGroupExit
                .transition(t)
                .remove();

            // Draw axes
            if (series.length > 0 && series[0].id == HEADCOUNT_ID && chart.axis.rangeVal.max.y < 10) {
                chart.yAxis.ticks(chart.axis.rangeVal.max.y);
            }
            else {
                chart.yAxis.ticks(10);
            }
            plotGroup.select('.x.axis')
                .transition(t)
                .call(chart.xAxis);
            plotGroup.select('.y.axis')
                .transition(t)
                .call(chart.yAxis);
    
            plotGroup.select('.x.title').text(chart.axis.x.label.text);
            plotGroup.select('.y.title').text(chart.axis.y.label.text);
    
            // Draw legend items associated to each serie
            legendGroup.selectAll('.legend-item').remove();
            var legendItem = legendGroup.selectAll('.legend-item').data(series).enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', function(d, i) { return 'translate(' + 0 + ',' + (args.size.height - args.padding.top - 50 + i*15) + ')'; })
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0.3 : 1; })
                .on("mouseover", function(d) { chart.focus(d.id); })
                .on("mouseout", function(d) { chart.revert(); })
                .on('click', function(d) { chart.legend.item.onclick(d.id); });
        
            legendItem
                .append('line')
                .attr("stroke", "#000")
                .attr('stroke-width', 10);
    
            var legendItemText = legendItem
                .append('text')
                .attr("fill", "#000")
                .attr('font-size', 10)
                .text(function(d) { return chart.theData.names[d.id]; });
    
            var ratio = legendHeight / legendWidth;
            var itemLengthList = legendItemText.nodes().map(item=>item.getComputedTextLength() + 16).reverse();
            for (var nLines = 1 ; nLines <= itemLengthList.length; nLines++) {
                var wMax = nLines * 10 / ratio;
                var totalLengthList = cut(itemLengthList.slice(), nLines, wMax);
                if (totalLengthList != null && (totalLengthList.length <= nLines)) {
                    var greatestLine = d3.max(totalLengthList);
                    var fontSize = d3.min([18, legendHeight / totalLengthList.length, legendWidth / greatestLine * 10]) * 0.9;
                    var strokeWidth = fontSize * 0.9
                    legendItem.each(function(d, i) {
                        var xCentering = Math.max(0, (legendWidth - totalLengthList[d.lLegend] / 10 * fontSize * 1.03) / 2);
                        d3.select(this).attr('transform', 'translate(' + (xCentering + d.xLegend / 10 * fontSize * 1.03) + ',' + (d.lLegend * legendHeight / totalLengthList.length + fontSize) + ')');
                        d3.select(this).select('text')
                            .attr('font-size', fontSize + 'px')
                            .attr('transform', function() { return 'translate(' + (1.4 * fontSize) + ',0)'; });
                        d3.select(this).select('line')
                            .attr('x1', strokeWidth * 0.3)
                            .attr('y1', -strokeWidth * 0.4)
                            .attr('x2', strokeWidth * 1.3)
                            .attr('y2', -strokeWidth * 0.4)
                            .attr('stroke-width', strokeWidth)
                            .style('stroke', color(i));
                    });
                    break;
                }
            }
    
            function cut(lengthList, nLines, wMax) {
                var curTotalLength = 0;
                var curLineCount = 0;
                var curColumnIndex = 0;
                var serieIndex = 0;
                var totalLengthList = [];
    
                series[serieIndex].xLegend = curTotalLength;
                series[serieIndex].lLegend = curLineCount;
                series[serieIndex].cLegend = curColumnIndex;
                var len = lengthList.pop();
                series[serieIndex].len = len;
                curTotalLength = curTotalLength + len;
                serieIndex++;
                curColumnIndex++;
    
                while (lengthList.length != 0) {
                    len = lengthList.pop();
                    series[serieIndex].len = len;
                    if ((curTotalLength + len) > wMax) {
                        curColumnIndex = 0;
                        curLineCount++;
                        totalLengthList.push(curTotalLength);
                        curTotalLength = 0;
                    }
                    series[serieIndex].xLegend = curTotalLength;
                    series[serieIndex].lLegend = curLineCount;
                    series[serieIndex].cLegend = curColumnIndex;
    
                    curTotalLength = curTotalLength + len;
                    serieIndex++;
                    curColumnIndex++;
                }
                if (curLineCount > nLines) {
                    return null;
                }
                totalLengthList.push(curTotalLength);
                return totalLengthList;
            }
        }

        chart.updateZoom = function() {
            // Desactivate 'pointer-events' for '.overlay' and hide mouse drawing
            plotGroup.select("rect.overlay").style('pointer-events', 'none');
            chart.hideLocDrawing();

            var series = chart.theData.series;
            var serieGroup = seriesGroup.selectAll('.serieGroup').data(series, function(d) { return d.id; });
    
            var serieGroupEnter = serieGroup.enter()
                .append('g')
                .attr('class', 'serieGroup');
            serieGroupEnter.filter(d=>chart.theData.repTypes && chart.theData.repTypes[d.id] == AREA)
                .append('path')
                .attr('class', 'area')
                .attr('d', function(d) { return chart.areaGenerator(d.linkType)(d.points); })
                .style('fill', (d, i) => color(i))
                .style('stroke', 'none')
                .style('fill-opacity', 0.2);
            serieGroupEnter
                .append('path')
                .attr('class', 'line')
                .attr('d', function(d) { return chart.lineGenerator(d.linkType)(d.points); })
                .style('stroke', (d, i) => color(i))
                .style('fill', 'none')
                .style('stroke-width', 2);

            serieGroup.filter(d=>chart.theData.repTypes && chart.theData.repTypes[d.id] == AREA)
                .select('path.area')
                .attr('d', function(d) { return chart.areaGenerator(d.linkType)(d.points); });
            serieGroup
                .select('path.line')
                .attr('d', function(d) { return chart.lineGenerator(d.linkType)(d.points); });

            // Draw circles representing a selection and a reference for each serie
            serieGroupEnter
                .append('circle')
                .attr('class', 'selection')
                .attr('r', 3.5)
                .style('stroke-width', 1);
            
            serieGroupEnter
                .append('circle')
                .attr('class', 'reference')
                .attr('r', 2)
                .style('stroke-width', 2);
            
            chart.updateSelectionCircle();
            chart.updateReferencedCircle();

            serieGroup.exit().remove();

            // Transition to new X and Y range
            chart.updateXYScalesDomain();

            serieGroup = seriesGroup.selectAll('.serieGroup');
            serieGroup.filter(d=>chart.theData.repTypes && chart.theData.repTypes[d.id] == AREA)
                .select('path.area')
                .transition().duration(args.transition.duration)
                .attr('d', function(d) { return chart.areaGenerator(d.linkType)(d.points); });
            var zoomTransition = serieGroup
                .select('path.line')
                .transition().duration(args.transition.duration)
                .attr('d', function(d) { return chart.lineGenerator(d.linkType)(d.points); });

            // Draw axes
            if (series.length > 0 && series[0].id == HEADCOUNT_ID && chart.axis.rangeVal.max.y < 10) {
                chart.yAxis.ticks(chart.axis.rangeVal.max.y);
            }
            else {
                chart.yAxis.ticks(10);
            }
            plotGroup.select('.x.axis')
                .transition().duration(args.transition.duration)
                .call(chart.xAxis);
            plotGroup.select('.y.axis')
                .transition().duration(args.transition.duration)
                .call(chart.yAxis);

            // Finalization after transition
            zoomTransition
                .on("end", function(p,j) {
                    // If transition 0 is ended, no need to wait the others, they are virtually ended
                    if (j==0) {
                        // Activate 'pointer-events' for '.overlay'
                        plotGroup.select("rect.overlay").style('pointer-events', 'auto');
                    }
                });
            return zoomTransition;
        }

        chart.updateXYScalesDomain = function() {
            var series = chart.theData.series;
            var visibleSeries = series.filter(s=>!chart.hiddenSerieIds.has(s.id));
            
            if (!chart.axis.rangeVal) chart.axis.rangeVal = {};
            if (!chart.axis.rangeVal.min) chart.axis.rangeVal.min = {};
            if (!chart.axis.rangeVal.max) chart.axis.rangeVal.max = {};
            if (!chart.axis.rangeVal.min.x) {
                chart.axis.rangeVal.min.x = d3.min(series, function (d) { 
                    return d.points.length == 0 ? 0 : d3.min(d.points, function (p) { 
                        return p[0];
                    });
                });
            }
            if (!chart.axis.rangeVal.max.x) {
                chart.axis.rangeVal.max.x = d3.max(series, function (d) { 
                    return d.points.length == 0 ? 1 : d3.max(d.points, function (p) { 
                        return p[0];
                    });
                });
            }
            if (visibleSeries.length != 0) {
                chart.axis.rangeVal.min.y = d3.min(visibleSeries, function (d) { 
                    // During zoom process, some points can have to be ignored (when out of the X range)
                    var points = d.points.filter(p=>p[0]>= chart.axis.rangeVal.min.x && p[0] <= chart.axis.rangeVal.max.x);
                    return points.length == 0 ? 1 : d3.min(points, function (p) { 
                        return p[1];
                    });
                });
                chart.axis.rangeVal.min.y = Math.min(chart.axis.rangeVal.min.y, 0);
                chart.axis.rangeVal.max.y = d3.max(visibleSeries, function (d) { 
                    // During zoom process, some points can have to be ignored (when out of the X range)
                    var points = d.points.filter(p=>p[0]>= chart.axis.rangeVal.min.x && p[0] <= chart.axis.rangeVal.max.x);
                    return points.length == 0 ? 1 : d3.max(points, function (p) { 
                        return p[1];
                    });
                });
            }
            // Don't change bounds set by user for X domain using 'nice' function
            chart.xScale.domain([chart.axis.rangeVal.min.x, chart.axis.rangeVal.max.x]);
            chart.yScale.domain([chart.axis.rangeVal.min.y, chart.axis.rangeVal.max.y]).nice();
        }

        chart.lineCurveFactory = function(linkType) {
            if (!linkType || linkType == LINEAR_CURVE) {
                return d3.curveLinear;
            }
            if (linkType == STEP_AFTER_CURVE) {
                return d3.curveStepAfter;
            }
            throw new Error(linkType + " is an unknown link type");
        }
        
        chart.lineGenerator = function(linkType) {
            return d3.line()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y(function(d) { 
                    return chart.yScale(d[1]);
                })
                .curve(chart.lineCurveFactory(linkType));
        }

        chart.areaGenerator = function(linkType) {
            return d3.area()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y0(args.size.height - args.padding.bottom - args.padding.top)
                .y1(function(d) { 
                    return chart.yScale(d[1]);
                })
                .curve(chart.lineCurveFactory(linkType));
        }
        
        chart.lineGenerator0 = function(linkType) {
            return d3.line()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y(function(d) { 
                    return chart.yScale(0);
                })
                .curve(chart.lineCurveFactory(linkType));
        }
        
        chart.areaGenerator0 = function(linkType) {
            return d3.area()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y0(args.size.height - args.padding.bottom - args.padding.top)
                .y1(function(d) { 
                    return chart.yScale(0);
                })
                .curve(chart.lineCurveFactory(linkType));
        }
        
        chart.updateCurves = function(oldSeries, oldYDomain) {
            var serieGroup = d3.select(args.bindto).selectAll('.serieGroup');
            var trans = d3.transition().duration(args.transition.duration);
    
            serieGroup.select('path.area')
                .transition(trans)
                .attrTween('d', function(d) { return lineTween.call(this, d); })
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0 : 1; });
            serieGroup.select('path.line')
                .style('stroke-width', 2)
                .transition(trans)
                .attrTween("d", function(d) { return lineTween.call(this, d); })
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0 : 1; })
                .on("end", function(p,j) {
                    // If transition 0 is ended, no need to wait the others, they are virtually ended
                    if (j==0) {
                        // Activate 'pointer-events' for '.overlay'
                        plotGroup.select("rect.overlay").style('pointer-events', 'auto');
                    }
                });
                
            
            function lineTween(newSerie) {
                var areaRep = d3.select(this).classed('area');
                // Build 'oldPoints' and 'newpoints', adding some interpolated points to have same X values
                var oldSerie = oldSeries.filter(s => (s.id == newSerie.id))[0];
                var noOldSerie = (oldSerie == null);
                if (noOldSerie) {
                    oldSerie = newSerie;
                    oldYDomain = chart.yScale.domain();
                }

                var xSet = new Set(oldSerie.points.map(p=>p[0].getTime()));
                newSerie.points.forEach(p=>xSet.add(p[0].getTime()));
                var xArray = [...xSet].sort((a, b) => a - b);

                function addingScale(serie, domain, range) {
                    return (serie.linkType == STEP_AFTER_CURVE)
                    ? function(x) {
                        var insertionIndex = d3.bisectRight(domain, x);
                        return serie.points[insertionIndex == 0 ? insertionIndex : insertionIndex - 1][1];
                    }
                    : d3.scaleLinear()
                        .domain(domain)
                        .range(range);
                }

                var oldDomain = oldSerie.points.map(p=>p[0].getTime());
                var oldRange = oldSerie.points.map(p=>p[1]);
                var addingOldScale = addingScale(oldSerie, oldDomain, oldRange);
                var oldYArray = xArray.map(x=>addingOldScale(x));

                var newDomain = newSerie.points.map(p=>p[0].getTime());
                var newRange = newSerie.points.map(p=>p[1]);
                var addingNewScale = addingScale(newSerie, newDomain, newRange);
                var newYArray = xArray.map(x=>addingNewScale(x));
                
                // Build oldPoints and newPoints with pixel values
                var oldYScale = d3.scaleLinear()
                    .range(chart.yScale.range())
                    .domain(oldYDomain);

                var oldPoints = xArray.map((x,i)=>[chart.xScale(new Date(x)), oldYScale(noOldSerie ? 0 : oldYArray[i])]);
                var newPoints = xArray.map((x,i)=>[chart.xScale(new Date(x)), chart.yScale(newYArray[i])]);

                // If needed, duplicate points to manage 'step_after' style
                if (oldSerie.linkType == STEP_AFTER_CURVE || newSerie.linkType == STEP_AFTER_CURVE) {
                    function duplicate(points, linkType) {
                        return points.reduce(function(accu, p, i) {
                            if (i == 0) {
                                accu.push(p);
                            }
                            else {
                                var duplicatedPoint = (linkType == STEP_AFTER_CURVE) ? [p[0], points[i - 1][1]] : p;
                                accu.push(duplicatedPoint, p);
                            }
                            return accu;
                        }, []);
                    }
                    oldPoints = duplicate(oldPoints, oldSerie.linkType);
                    newPoints = duplicate(newPoints, newSerie.linkType);
                }

                // Build interpolator between oldPoints and newPoints
                var interpolate = d3.interpolate(oldPoints, newPoints);
                // Build svg path generator 
                var generateSvgPath = areaRep
                    ? d3.area()
                        .x(function(d) { return d[0]; })
                        .y0(args.size.height - args.padding.bottom - args.padding.top)
                        .y1(function(d) { return d[1]; })
                        .curve(chart.lineCurveFactory(LINEAR_CURVE))
                    : d3.line()
                        .x(function(d) { return d[0]; })
                        .y(function(d) { return d[1]; })
                        .curve(chart.lineCurveFactory(LINEAR_CURVE));
                
                return function(t) {
                    if (t < 1) {
                        return generateSvgPath(interpolate(t));
                    }
                    else {
                        return areaRep
                            ? chart.areaGenerator(newSerie.linkType)(newSerie.points)
                            : chart.lineGenerator(newSerie.linkType)(newSerie.points);
                    }
                };
            }
        }
            
        chart.updateHiddenCurves = function() {
            var serieGroup = d3.select(args.bindto).selectAll('.serieGroup');
            var t = d3.transition().duration(args.transition.duration);
    
            serieGroup.select('path.area')
                .transition(t)
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0 : 1; })
                .attr('d', function(d) { return chart.areaGenerator(d.linkType)(d.points); });
            serieGroup.select('path.line')
                .transition(t)
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0 : 1; })
                .attr('d', function(d) { return chart.lineGenerator(d.linkType)(d.points); });

            plotGroup.select('.x.axis')
                .transition(t)
                .call(chart.xAxis);
            plotGroup.select('.y.axis')
                .transition(t)
                .call(chart.yAxis);
        }
            
        chart.updateSelectionCircle = function(noTransition) {
            var t = d3.transition().duration(noTransition ? 0 : args.transition.duration);
            d3.select(args.bindto).selectAll('.serieGroup').select('circle.selection')
                .style('stroke', (d, i) => color(i))
                .style('display', function(d) {
                    return (chart.selectedPoint && d.id == chart.selectedPoint.serieId && !chart.hiddenSerieIds.has(d.id)) ? null : 'none'; 
                })
                .transition(t)
                .attr('cx', function(d) {
                    if (chart.selectedPoint && d.id == chart.selectedPoint.serieId 
                        && d.points.length != 0 && d.points.length > chart.selectedPoint.pointIndex) {
                        return chart.xScale(d.points[chart.selectedPoint.pointIndex][0]);
                    }
                    return 0;
                })
                .attr('cy', function(d) {
                    if (chart.selectedPoint && d.id == chart.selectedPoint.serieId 
                        && d.points.length != 0 && d.points.length > chart.selectedPoint.pointIndex) {
                        return chart.yScale(d.points[chart.selectedPoint.pointIndex][1]);
                    }
                    return 0;
                });
        }
    
        chart.updateReferencedCircle = function() {
            d3.select(args.bindto).selectAll('.serieGroup').select('circle.reference')
                .attr('cx', function(d) {
                    if (chart.referencedPoint && d.id == chart.referencedPoint.serieId 
                        && d.points.length != 0 && d.points.length > chart.referencedPoint.pointIndex) {
                        return chart.xScale(d.points[chart.referencedPoint.pointIndex][0]);
                    }
                    return 0;
                })
                .attr('cy', function(d) {
                    if (chart.referencedPoint && d.id == chart.referencedPoint.serieId 
                        && d.points.length != 0 && d.points.length > chart.referencedPoint.pointIndex) {
                        return chart.yScale(d.points[chart.referencedPoint.pointIndex][1]);
                    }
                    return 0;
                })
                .style('stroke', (d, i) => color(i))
                .style('display', function(d) {
                    return (chart.referencedPoint && d.id == chart.referencedPoint.serieId) ? null : 'none'; 
                });
        }
    
        // ************************************
        // Change data point state to selected.
        // ************************************
        chart.doSelect = function(serieId, index) {
            chart.selectedPoint = {serieId:serieId, pointIndex:index};
            chart.updateSelectionCircle(true);
        };
    
        // **************************************
        // Change data point state to unselected.
        // **************************************
        chart.unselect = function() {
            chart.selectedPoint = null;
            chart.updateSelectionCircle(true);
        };

        // **************************************
        // Change data point state to referenced.
        // **************************************
        chart.reference = function(serieId, index) {
            chart.referencedPoint = {serieId:serieId, pointIndex:index};
            chart.updateReferencedCircle();
        };
    
        // ****************************************
        // Change data point state to unreferenced.
        // ****************************************
        chart.unreference = function() {
            chart.referencedPoint = null;
            chart.updateReferencedCircle();
        };
    
        // *********************************
        // This API hides specified targets.
        // *********************************
        chart.hide = function(serieIds) {
            chart.hiddenSerieIds.clear();
            serieIds.forEach(function(serieId) {chart.hiddenSerieIds.add(serieId); });
            chart.applyHiddenSeries();
        };
    
        // ****************************************************
        // This API toggles (shows or hides) specified targets.
        // ****************************************************
        chart.toggle = function(serieId) {
            if (chart.hiddenSerieIds.has(serieId)) {
                chart.hiddenSerieIds.delete(serieId);
            }
            else {
                chart.hiddenSerieIds.add(serieId);
            }
            chart.applyHiddenSeries();
            chart.updateXYScalesDomain();
            chart.updateHiddenCurves();
            chart.updateSelectionCircle();
        };
    
        chart.applyHiddenSeries = function() {
            legendGroup.selectAll('.legend-item')
                .style("opacity", function(d) { return chart.hiddenSerieIds.has(d.id) ? 0.3 : 1; })
        };
    
        // ****************************
        // Get data shown in the chart.
        // ****************************
        chart.shownData = function() {
            return chart.getData().filter(d=>chart.hiddenSerieIds.has(d.id));
        };
    
        // ****************************
        // Get data hidden in the chart.
        // ****************************
        chart.getHiddenSerieIds = function() {
            return [...chart.hiddenSerieIds];
        };
    
        // **************************************************************
        // This API highlights specified targets and fade out the others.
        // **************************************************************
        chart.focus = function(serieId) {
            if (chart.hiddenSerieIds.has(serieId)) return;
    
            legendGroup.selectAll('.legend-item').filter(d => (d.id != serieId) && !chart.hiddenSerieIds.has(d.id))
                .style("opacity", 0.3);
    
            seriesGroup.selectAll('.serieGroup').filter(d => (d.id != serieId) && !chart.hiddenSerieIds.has(d.id))
                .style("opacity", 0.3);
            seriesGroup.selectAll('.serieGroup>path.line').filter(d => (d.id == serieId) && !chart.hiddenSerieIds.has(d.id))
                .style('stroke-width', 3);
        };
    
        // ***********************************
        // This API reverts specified targets.
        // ***********************************
        chart.revert = function() {
            legendGroup.selectAll('.legend-item').filter(d=>!chart.hiddenSerieIds.has(d.id))
                .style("opacity", 1);
    
            seriesGroup.selectAll('.serieGroup').filter(d=>!chart.hiddenSerieIds.has(d.id))
                .style("opacity", 1);
            seriesGroup.selectAll('.serieGroup>path.line').filter(d=>!chart.hiddenSerieIds.has(d.id))
                .style('stroke-width', 2);
        };
    
        // *********************************************
        // Search the closest point among all the series
        // *********************************************
        chart.closestPoint = function(series, point) {
            function sqrDistance(p) {
                var dx = p[0] - point[0],
                    dy = p[1] - point[1];
                return dx * dx + dy * dy;
            }
            var closestList = [];
            series.filter(s=>!chart.hiddenSerieIds.has(s.id)).each(function(serie) {
                var pathPoints = serie.points.map(p=>[chart.xScale(p[0]), chart.yScale(p[1])]);
                var closest = {};
                closest.serie = serie;
                closest.index = -1;
                closest.distance2 = Infinity;
    
                pathPoints.forEach(function(pathPoint, i) {
                    var distance2 = sqrDistance(pathPoint);
                    if (distance2 < closest.distance2) {
                        closest.distance2 = distance2;
                        closest.index = i;
                    }
                })
    
                closestList.push(closest);
            });
            return closestList[d3.scan(closestList, (a, b) => a.distance2 - b.distance2)];
        }

        chart.load(args.data);
    
        return chart;
    }
    
    return {
      "generate": function(args) {
        return generate(args);
      },
      "LINE": LINE,
      "AREA": AREA,
      "LINEAR_CURVE": LINEAR_CURVE,
      "STEP_AFTER_CURVE": STEP_AFTER_CURVE
    };
  })();