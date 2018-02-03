/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderBarChart(params) {
  var isFirstLoad = true;
  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    axisLeftWidth: 30,
    axisBottomHeight: 20,
    barPadding: 2,
    spacingAfterchart: 50,
    legendColumnCount: 3,
    legendRowHeight: 20,
    animationSpeed: 1000,
    container: 'body',
    data: null
  };


  //InnerFunctions which will update visuals
  var updateData;

  //Main chart object
  var main = function (selection) {
    selection.each(function scope() {

      //Set up stack layout
      var stack = d3.stack()
                    .keys(Object.keys(attrs.data[0]).filter(x => x !== 'month'))
                    .order(d3.stackOrderDescending);

      //Data, stacked
      var series = stack(attrs.data);

      //Calculated properties
      var calc = {}
      calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      calc.legendHeigh = calc.chartHeight * 0.2;
      calc.chartBruttoHeight = calc.chartHeight * 0.8;

      calc.eachLegendWidth = calc.chartWidth / attrs.legendColumnCount;

      //Drawing containers
      var container = d3.select(this);
      container.html('');

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                        .attr('width', attrs.svgWidth)
                        .attr('height', attrs.svgHeight);

      var firstMonth = attrs.data[0];
      var lastMonth = attrs.data[attrs.data.length - 1];

      // get date range
      var dateRange = getDataRange(firstMonth, lastMonth);

      // ############ scales ##############
      var xLabels = d3.scaleTime().domain(dateRange).range([0, calc.chartWidth - attrs.axisLeftWidth * 2]);
      var x = d3.scaleLinear().range([attrs.axisLeftWidth, calc.chartWidth]).domain([0, attrs.data.length]),
          y = d3.scaleLinear().range([calc.chartBruttoHeight - attrs.axisBottomHeight, 0]).domain([0, d3.max(attrs.data, function(d){
          var sum = 0;
          Object.keys(d).forEach(x => {
            if (x != 'month'){
              sum += +d[x];
            }
          });
          return sum;
      })]);

      // ###### tooltip #####
      var tooltip = d3
                      .componentsTooltip()
                      .container(svg)
                      .content([
                        {
                          left: "Name:",
                          right: "{name}"
                        },
                        {
                          left: "Month:",
                          right: "{month}"
                        },
                        {
                          left: "Value:",
                          right: "{value}"
                        }
                      ]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);
                 
      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      // ############# axes ##################
      var xAxis = chart.patternify({ tag: 'g', selector: 'axis axis--x' });

      xAxis.attr("transform", "translate(" + attrs.axisLeftWidth + "," + (calc.chartBruttoHeight - attrs.axisBottomHeight) + ")")
          .call(d3.axisBottom(xLabels).tickFormat(d3.timeFormat("%b")).ticks(attrs.data.length).tickSize(-calc.chartBruttoHeight));
      
      xAxis.selectAll(".tick")
           .attr("transform", (d,i) => {
              var barWidth = x(1) - x(0) - attrs.barPadding;
              return "translate("+[barWidth / 2 + i * (barWidth + attrs.barPadding), 0]+")";
         });

      xAxis.selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.18em")
          .attr("dy", "1.15em")
          .attr("transform", function(d) {
              return "rotate(-45)" 
          });

      var yAxis = chart.patternify({ tag: 'g', selector: 'axis axis--y'})

      yAxis.attr("transform", "translate("+attrs.axisLeftWidth+", 0)")
          .call(d3.axisLeft(y).ticks(5).tickSize(-calc.chartWidth)
          .tickPadding(8));

      // Add a group for each row of data
      var groups = chart.patternify({ tag: "g", selector: 'bars', data: series})
                        .style("fill", function(d, i) {
                          return color(i);
                        }); 

      // Add a rect for each data value
      var rects = groups.selectAll("rect")
                    .data(function(d) { return d; })
                    .enter()
                    .append("rect")                    
                    .attr("x", function(d, i) {
                      return x(i);
                    })
                    .attr("width", (x(1) - x(0)) - attrs.barPadding)
                    .attr("height", function(d) {
                      return y(d[0]) - y(d[1]);
                    })
                    .on("mouseover", function(d, i) {
                      var thisElement = d3.select(this);
                      var direction;
                      if (d.data.month === "January") {
                       direction = "left";
                      }
                      else if (d.data.month === "December") {
                       direction = "right";
                      }
                      else if (d[1] == y.domain()[1]){
                       direction = "top";
                      }
                      else {
                       direction = "bottom";
                      }
                      var value = d[1] - d[0];
                      var name = "";
                      Object.keys(d.data).forEach(k => {
                        if (+d.data[k] == value){
                          name = k;
                        }
                      });
                      tooltip
                            .x(+thisElement.attr("x") + (+thisElement.attr("width")) / 2 + attrs.barPadding)
                            .y(+thisElement.attr("y") + (+thisElement.attr("height") / 2) + 4)
                            .direction(direction)
                            .show({ name: name, month: d.data.month, value: value });

                    })
                    .on("mousemove", function() {
                        
                    })
                    .on("mouseout", function() {
                      tooltip.hide();
                    });
      

      var t = d3.transition(attrs.id)
            .duration(attrs.animationSpeed)
            .ease(d3.easeLinear)
            .on("start", function(d){})
            .on("end", function(d){});

      // // animate if it is first load
      if (isFirstLoad){
        rects.transition(t)
              .attr("y", function(d) {
                return y(d[1]);
              })
        isFirstLoad = !isFirstLoad; // turn off animation
      }
      else {
        rects
              .attr("y", function(d) {
                return y(d[1]);
              });
      }

      var xAxisDescription = chart.patternify({ tag: 'text', selector: 'xAxisDescr' })
                                  .attr("x", x(4))
                                  .attr("y", calc.chartBruttoHeight + 35)
                                  .text("Registered users number x Time");

      // ##### legend #####
      var legend = chart.patternify({ tag: 'g', selector: 'legend' })
                        .attr('transform', (d,i) => {
                              return "translate("+ [0, calc.chartBruttoHeight + attrs.spacingAfterchart] +")"
                        })
                        

      var legend_items = legend.patternify({ 
                                         tag: 'g', 
                                         selector: 'legend_item', 
                                         data: Object.keys(attrs.data[0]).filter(x => x !== 'month')
                                       })
                                 .attr('transform', function (d, i) {
                                      return "translate(" + ((i % attrs.legendColumnCount) * calc.eachLegendWidth + calc.eachLegendWidth / 3)  + "," + Math.floor(i / attrs.legendColumnCount) * attrs.legendRowHeight + ")"
                                  });

      legend_items.append("rect")
              .attr("width", 15)
              .attr("height", 15)
              .attr('rx', 2)
              .attr("fill", (d, i) => {
                return color(i);
              })
              

      legend_items.append("text")
              .attr("stroke", (d, i) => {
                return color(i);
              })
              .attr("stroke-width", 0.9)
              .text(d => {
                return d;
              })
              .attr("transform", "translate("+[18,12]+")");

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
      //#########################################  UTIL FUNCS ##################################

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
        })
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