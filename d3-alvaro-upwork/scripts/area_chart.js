function renderAreaChart(params) {
    // we want to have animation only on load
    var isFirstLoad = true;
    // Exposed variables
    var attrs = {
      id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
      svgWidth: 400,
      svgHeight: 400,
      marginTop: 15,
      marginBottom: 15,
      marginRight: 5,
      marginLeft: 5,
      animationSpeed: 1500,
      spacingAfterchart: 50,
      legendColumnCount: 5,
      legendRowHeight: 40,
      tooltipTextColor: '#C5C5C5',
      tooltipTextFontSize: 12,
      tooltipBackgroundColor: '#222222',
      axisLeftWidth : 30,
      axisBottomHeight : 20,
      container: 'body',
      data: null
    };
  
  
    //InnerFunctions which will update visuals
    var updateData;
  
    //Main chart object
    var main = function (selection) {
      selection.each(function scope() {
  
        //Calculated properties
        var calc = {}
        calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
        calc.legendHeight = calc.chartHeight * 0.2;
        calc.lineChartHeight = calc.chartHeight * 0.8;
  
        calc.legendRowCount = Math.ceil(attrs.data.length / attrs.legendColumnCount);
        calc.eachLegendWidth = calc.chartWidth / attrs.legendColumnCount;
          
        // define the area
        var area = d3.area()
                     .x(function(d) { return x(d[0]); })
                     .y0(function(d) { return y(d[1])})
                     .y1(function(d) { return y(d[2]);});
        // define the line
        var valuelineUpper = d3.line()
                        .x(function(d) { return x(d[0]); })
                        .y(function(d) { return y(d[2]); });
        
        // define the line
        var valuelineLower = d3.line()
                        .x(function(d) { return x(d[0]); })
                        .y(function(d) { return y(d[1]); });

        // transition
        var t = d3.transition(attrs.id)
                  .duration(attrs.animationSpeed)
                  .ease(d3.easeLinear)
                  .on("start", function(d){ 

                   })
                  .on("end", function(d){ 
                    
                  });

        // ############ scales ##############
        var xLabels = d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, calc.chartWidth - attrs.axisLeftWidth]);
        var x = d3.scaleLinear().range([attrs.axisLeftWidth, calc.chartWidth])
                                .domain([ d3.min(attrs.data, d => {
                                                                return d[0];
                                                            }), d3.max(attrs.data, d => {
                                                                return d[0];
                                                            })
                                                            ]),
            y = d3.scaleLinear().range([calc.lineChartHeight - attrs.axisBottomHeight, 0]).domain([d3.min(attrs.data, function(d){
                                                                                            return d[1] < d[2] ? d[1] : d[2];
                                                                                        }), d3.max(attrs.data, function(d){
                                                                                            return d[1] > d[2] ? d[1] : d[2];
                                                                                        })]);
  
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(attrs.data.map(d => { 
          return d[0].name; 
        }));
        
        //Drawing containers
        var container = d3.select(this);
        container.html('');
  
        //Add svg
        var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
          .attr('width', attrs.svgWidth)
          .attr('height', attrs.svgHeight);
        // ###### tooltip #####
        var tooltip = d3
          .componentsTooltip()
          .container(svg)
          .content([
            {
              left: "Date: ",
              right: "{date}"
            },
            {
              left: "Temperate range:",
              right: "{range}"
            }
          ]);
        //Add container g element
        var chart = svg.patternify({ tag: 'g', selector: 'chart' })
          .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');
        
        // ############# axes ##################
        var xAxis = chart.patternify({ tag: 'g', selector: 'axis axis--x' });
  
        xAxis.attr("transform", "translate(" + attrs.axisLeftWidth + "," + (calc.lineChartHeight - attrs.axisBottomHeight) + ")")
            .call(d3.axisBottom(xLabels).tickFormat(d3.timeFormat("%b")).tickSize(-calc.lineChartHeight));

        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", calc.chartWidth < 600 ? "-.1em" : "")
            .attr("dy", calc.chartWidth < 600 ? "1.2em" : "2.5em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
            });

        var yAxis = chart.patternify({ tag: 'g', selector: 'axis axis--y'});
  
        yAxis.attr("transform", "translate("+attrs.axisLeftWidth+", 0)")
            .call(d3.axisLeft(y).ticks(5).tickSize(-calc.chartWidth)
            .tickPadding(8));
        
        var areaPath = chart.patternify({ tag: 'path', selector: 'area', data: [attrs.data] })
             .attr("class", "area")
             .attr("d", area);

        var lineUpper = chart.patternify({ tag: 'path', selector: 'lineUpper', data: [attrs.data] })
            .attr("d", valuelineUpper);

        var lineLower = chart.patternify({ tag: 'path', selector: 'lineLower', data: [attrs.data] })
            .attr("d", valuelineLower);

             // animate if it is first load
        if (isFirstLoad){

            lineLower.attr("stroke-dasharray", function(d){ return this.getTotalLength() })
                    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
                    .transition(t)
                    .attr("stroke-dashoffset", 0);
            lineUpper.attr("stroke-dasharray", function(d){ return this.getTotalLength() })
                    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
                    .transition(t)
                    .attr("stroke-dashoffset", 0);

            isFirstLoad = !isFirstLoad; // turn off animation
        }

        var collectedData = [1, 2].map(function(i) {
                          return {
                            name: (i == 1) ? "lower" : "upper",
                            values: attrs.data.map(function(d) {
                              return {
                                date: d[0],
                                temperature: d[i]
                              };
                            })
                          };
                        });

        var mouseG = chart.append("g")
                        .attr("class", "mouse-over-effects")
                        //.attr("transform", "translate(" + attrs.axisLeftWidth + "," + 0 + ")")

        mouseG.append("path") // this is the black vertical line to follow mouse
              .attr("class", "mouse-line")
              .style("stroke", "black")
              .style("stroke-width", "0.5px")
              .style("opacity", "0");

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
                                .data(collectedData)
                                .enter()
                                .append("g")
                                .attr("class", "mouse-per-line");

        mousePerLine.append("circle")
                    .attr("r", 7)
                    .style("stroke", function(d) {
                      return "green";
                    })
                    .style("fill", "none")
                    .style("stroke-width", "1px")
                    .style("opacity", "0");

        mousePerLine.append("text")
                    .attr("transform", "translate(10,3)");

        var lines = [lineUpper.node(), lineLower.node()];
        
        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', calc.chartWidth) // can't catch mouse events on a g element
            .attr('height', calc.lineChartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
              tooltip.hide();
            })
            .on('mouseover', function() { // on mouse in show line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "1");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
              d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
            })
            .on('mousemove', function() { // mouse moving over canvas
                var mouse = d3.mouse(this);
                if (mouse[0] < attrs.axisLeftWidth - 1){
                  d3.select(".mouse-line")
                    .style("opacity", "0");
                  d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                  d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");
                  tooltip.hide();
                }
                else{
                  d3.select(".mouse-line")
                .style("opacity", "1");
                d3.selectAll(".mouse-per-line circle")
                  .style("opacity", "1");
                d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
                }
                d3.select(".mouse-line")
                  .attr("d", function() {
                    var d = "M" + mouse[0] + "," + (calc.lineChartHeight - 20);
                    d += " " + mouse[0] + "," + (-20);
                    return d;
                  });

                d3.selectAll(".mouse-per-line")
                  .attr("transform", function(d, i) {
                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true){
                      target = Math.floor((beginning + end) / 2);
                      pos = lines[i].getPointAtLength(target);
                      if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                          break;
                      }
                      if (pos.x > mouse[0])      end = target;
                      else if (pos.x < mouse[0]) beginning = target;
                      else break; //position found
                    }

                    var xDate = Math.floor(x.invert(mouse[0]));
                    var dataValue = findDate(xDate);
                    
                    if (dataValue.length > 0){
                      var date = new Date(dataValue["0"][0]);
                      var dd = date.getDate();
                      var mm = date.getMonth()+1; //January is 0!

                      var yyyy = date.getFullYear();
                      if(dd<10){
                          dd='0'+dd;
                      } 
                      if(mm<10){
                          mm='0'+mm;
                      } 
                      var dateStr = dd+'-'+mm+'-'+yyyy;
                      var direction = "left";
                      if (mouse[0] + 120 >= calc.chartWidth){
                        direction = "right";
                       }
                       else if (mouse[0] - 120 < attrs.axisLeftWidth){
                         direction = "left";
                       }
                      tooltip
                            .x(mouse[0] + 10)
                            .y(pos.y)
                            .direction(direction)
                            .show({ date: dateStr, range: dataValue["0"][1] + " - " + dataValue["0"][2]})
                    }
                    return "translate(" + mouse[0] + "," + pos.y +")";
                  });
            });

        //RESPONSIVENESS
         d3.select(window).on('resize.' + attrs.id, function () {
          setDimensions();
         });
  
        function setDimensions() {
          var width = container.node().getBoundingClientRect().width;
          main.svgWidth(width);
          container.call(main);
        }
  
        // Smoothly handle data updating
        updateData = function () {
  
        }
  
        //#########################################  UTIL FUNCS #################################
        function findDate(dateInt){
          return attrs.data.filter((x,i) => x[0] >= dateInt && attrs.data[i-1][0] <= dateInt);
        }

        function debug() {
          if (attrs.isDebug) {
            //Stringify func
            var stringified = scope + "";
  
            // Parse variable names
            var groupVariables = stringified
              //Match var x-xx= {};
              .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
              //Match xxx
              .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
              //Get xxx
              .map(v => v[0].trim())
  
            //Assign local variables to the scope
            groupVariables.forEach(v => {
              main['P_' + v] = eval(v)
            })
          }
        }
        debug();
      });
    };
  
    //----------- PROTOTYEPE FUNCTIONS  ----------------------
    d3.selection.prototype.patternify = function (params) {
      var container = this;
      var selector = params.selector;
      var elementTag = params.tag;
      var data = params.data || [selector];
  
      // Pattern in action
      var selection = container.selectAll('.' + selector).data(data, (d, i) => {
          if (typeof d === "object") {
              if (d.id) {
                  return d.id;
              }
          }
          return i;
      });
      selection.exit().remove();
      selection = selection.enter().append(elementTag).merge(selection)
      selection.attr('class', selector);
      return selection;
    }
  
    //Dynamic keys functions
    Object.keys(attrs).forEach(key => {
      // Attach variables to main function
      return main[key] = function (_) {
        var string = `attrs['${key}'] = _`;
        if (!arguments.length) { return eval(` attrs['${key}'];`); }
        eval(string);
        return main;
      };
    });

    //Set attrs as property
    main.attrs = attrs;
  
    //Debugging visuals
    main.debug = function (isDebug) {
      attrs.isDebug = isDebug;
      if (isDebug) {
        if (!window.charts) window.charts = [];
        window.charts.push(main);
      }
      return main;
    }
  
    //Exposed update functions
    main.data = function (value) {
      if (!arguments.length) return attrs.data;
      attrs.data = value;
      if (typeof updateData === 'function') {
        updateData();
      }
      return main;
    }
  
    // Run  visual
    main.run = function () {
      d3.selectAll(attrs.container).call(main);
      return main;
    }
  
    return main;
  }
  