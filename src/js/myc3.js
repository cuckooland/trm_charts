var myc3 = (function() {
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
            .attr("height", args.size.height)
            .on("mouseover", function() { d3.selectAll('.xMouseLine').style("display", null); })
            .on("mouseout", function() {
                d3.selectAll('.xMouseLine').style("display", "none");
            })
            .on("mousemove", function() {
                d3.selectAll('.xMouseLine').attr("transform", "translate(" + d3.mouse(this)[0] + ",0)");
            });
    
        var plotGroup = svg.append("g")
            .attr("transform", "translate(" + args.padding.left + "," + args.padding.top + ")");
    
        var legendPadding = {t: 38, r: 10, b: 2, l: 10},
            legendHeight = args.padding.bottom - legendPadding.t - legendPadding.b,
            legendWidth = args.size.width - legendPadding.l - legendPadding.r;
    
        chart.xScale = d3.scaleTime()
            .range([0, args.size.width - args.padding.left - args.padding.right]);
        chart.yScale = d3.scaleLinear()
            .range([args.size.height - args.padding.bottom - args.padding.top, 0]);
        var bisectDate = d3.bisector(function(d) { return d[0]; }).left
    
        // plotGroup.append("rect")
        //     .attr("class", "overlay")
        //     .attr("width", args.size.width - args.padding.left - args.padding.right)
        //     .attr("height", args.size.height - args.padding.bottom - args.padding.top)
        //     .style("visibility", "hidden");
    
        var seriesGroup = plotGroup.append('g');
        var legendGroup = plotGroup.append('g')
            .attr('transform', "translate(" + (legendPadding.l - args.padding.left) +"," + (legendPadding.t + args.size.height - args.padding.bottom - args.padding.top) + ")");
    
        svg.append('line')
            .attr("class", "xMouseLine")
            .attr("x1", 0)
            .attr("y1", args.padding.top)
            .attr("x2", 0)
            .attr("y2", args.size.height - args.padding.bottom)
            .style("display", "none");
    
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
            .tickFormat(args.axis.y.tick.format);
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
    
        // ********************************************
        // Get and set axis min and max value. => redraw 
        // *********************************************
        chart.axis.range = function(range) {
            if (!range) return chart.axis.rangeVal;
    
            if (!chart.axis.rangeVal) chart.axis.rangeVal = {};
    
            if (!chart.axis.rangeVal.min) chart.axis.rangeVal.min = {};
            if (range.min.x) chart.axis.rangeVal.min.x = d3.timeParse(chart.theData.xFormat)(range.min.x);
            if (range.min.y) chart.axis.rangeVal.min.y = range.min.y;
    
            if (!chart.axis.rangeVal.max) chart.axis.rangeVal.max = {};
            if (range.max.x) chart.axis.rangeVal.max.x = d3.timeParse(chart.theData.xFormat)(range.max.x);
            if (range.max.y) chart.axis.rangeVal.max.y = range.max.y;
    
            chart.draw();
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
    
            chart.draw();
        }
    
        chart.draw = function() {
            var series = chart.theData.series;
            chart.updateXYScalesDomain();

            // Draw lines and areas representing each serie
            var serieGroup = seriesGroup.selectAll('.serieGroup').data(series, function(d) { return d.id; });
    
            var lineGenerator0 = chart.lineGenerator0();
            var areaGenerator0 = chart.areaGenerator0();

            var serieGroupEnter = serieGroup.enter()
                .append('g')
                .attr('class', 'serieGroup');
            serieGroupEnter.filter(d=>chart.theData.types && chart.theData.types[d.id] == 'area')
                .append('path')
                .attr('class', 'area')
                .attr('d', function(d) { return areaGenerator0(d.points); })
                .style('fill', (d, i) => color(i))
                .style('stroke', 'none')
                .style('fill-opacity', 0.2);
            serieGroupEnter
                .append('path')
                .attr('class', 'line')
                .attr('d', function(d) { return lineGenerator0(d.points); })
                .style('stroke', (d, i) => color(i))
                .style('fill', 'none')
                .style('stroke-width', 2)
                .on("mouseover", function(d) { chart.focus(d.id); })
                .on("mouseout", function(d) { chart.revert(); })
                .on("mousemove", function() { d3.event.stopPropagation(); })
                .on('click', function(d) {
                    var clickedDate = chart.xScale.invert(d3.mouse(this)[0]),
                        i = bisectDate(d.points, clickedDate, 1),
                        p0 = d.points[i - 1],
                        p1 = d.points[i],
                        iNearest = clickedDate - p0[0] > p1[0] - clickedDate ? i : i - 1;
                    args.data.onclick(d, iNearest);
                });

            chart.updateCurves();
                
            // Draw circles representing a selection and a reference for each serie
            serieGroupEnter
                .append('circle')
                .attr('class', 'selection')
                .attr('r', 3)
                .style('stroke-width', 2);
            
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
                .attr('d', function(d) { return areaGenerator0(d.points); });
            serieGroupExit.select('path.line')
                .transition(t)
                .attr('d', function(d) { return lineGenerator0(d.points); });
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
            plotGroup.select('.x.axis').call(chart.xAxis);
            plotGroup.select('.y.axis').call(chart.yAxis);
    
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
        };

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
                    return d.points.length == 0 ? 1 : d3.min(d.points, function (p) { 
                        return p[1];
                    });
                });
                chart.axis.rangeVal.min.y = Math.min(chart.axis.rangeVal.min.y, 0);
                chart.axis.rangeVal.max.y = d3.max(visibleSeries, function (d) { 
                    return d.points.length == 0 ? 1 : d3.max(d.points, function (p) { 
                        return p[1];
                    });
                });
            }
            chart.xScale.domain([chart.axis.rangeVal.min.x, chart.axis.rangeVal.max.x]).nice();
            chart.yScale.domain([chart.axis.rangeVal.min.y, chart.axis.rangeVal.max.y]).nice();
        }

        chart.lineGenerator = function() {
            return d3.line()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y(function(d) { 
                    return chart.yScale(d[1]);
                });
        }
        
        chart.areaGenerator = function() {
            return d3.area()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y0(args.size.height - args.padding.bottom - args.padding.top)
                .y1(function(d) { 
                    return chart.yScale(d[1]);
                });
        }
        
        chart.lineGenerator0 = function() {
            return d3.line()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y(function(d) { 
                    return chart.yScale(0);
                });
        }
        
        chart.areaGenerator0 = function() {
            return d3.area()
                .x(function(d) { 
                    return chart.xScale(d[0]);
                })
                .y0(args.size.height - args.padding.bottom - args.padding.top)
                .y1(function(d) { 
                    return chart.yScale(0);
                });
        }
        
        chart.updateCurves = function() {
            var lineGenerator = chart.lineGenerator();
            var areaGenerator = chart.areaGenerator();
        
            var serieGroup = d3.select(args.bindto).selectAll('.serieGroup');
            var t = d3.transition().duration(args.transition.duration);
    
            serieGroup.select('path.area')
                .style("display", function(d) { return chart.hiddenSerieIds.has(d.id) ? 'none' : null; })
                .transition(t)
                .attr('d', function(d) { return areaGenerator(d.points); });
            serieGroup.select('path.line')
                .style("display", function(d) { return chart.hiddenSerieIds.has(d.id) ? 'none' : null; })
                .transition(t)
                .attr('d', function(d) { return lineGenerator(d.points); });

            plotGroup.select('.x.axis')
                .transition(t)
                .call(chart.xAxis);
            plotGroup.select('.y.axis')
                .transition(t)
                .call(chart.yAxis);
        }
            
        chart.updateSelectionCircle = function() {
            var t = d3.transition().duration(args.transition.duration);
            d3.select(args.bindto).selectAll('.serieGroup').select('circle.selection')
                .style('stroke', (d, i) => color(i))
                .style('display', function(d) {
                    return (chart.selectedPoint && d.id == chart.selectedPoint.serieId) ? null : 'none'; 
                })
                .transition(t)
                .attr('cx', function(d) {
                    if (chart.selectedPoint && d.id == chart.selectedPoint.serieId && d.points.length != 0) {
                        return chart.xScale(d.points[chart.selectedPoint.pointIndex][0]);
                    }
                    return 0;
                })
                .attr('cy', function(d) {
                    if (chart.selectedPoint && d.id == chart.selectedPoint.serieId && d.points.length != 0) {
                        return chart.yScale(d.points[chart.selectedPoint.pointIndex][1]);
                    }
                    return 0;
                });
        }
    
        chart.updateReferencedCircle = function() {
            d3.select(args.bindto).selectAll('.serieGroup').select('circle.reference')
                .attr('cx', function(d) {
                    if (chart.referencedPoint && d.id == chart.referencedPoint.serieId && d.points.length != 0) {
                        return chart.xScale(d.points[chart.referencedPoint.pointIndex][0]);
                    }
                    return 0;
                })
                .attr('cy', function(d) {
                    if (chart.referencedPoint && d.id == chart.referencedPoint.serieId && d.points.length != 0) {
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
            chart.updateSelectionCircle();
        };
    
        // **************************************
        // Change data point state to unselected.
        // **************************************
        chart.unselect = function() {
            chart.selectedPoint = null;
            chart.updateSelectionCircle();
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
        chart.hide = function(serieIds, resetOthers) {
            if (resetOthers) chart.hiddenSerieIds.clear();
            serieIds.forEach(function(serieId) {chart.hiddenSerieIds.add(serieId); });
            chart.updateXYScalesDomain();
            chart.updateCurves();
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
            chart.updateXYScalesDomain();
            chart.updateCurves();
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
    
        chart.load(args.data);
    
        return chart;
    }
    
    return {
      "generate": function(args) {
        return generate(args);
      }
    };
  })();