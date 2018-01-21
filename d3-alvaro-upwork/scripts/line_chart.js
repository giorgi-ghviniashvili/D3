function renderLineChart(params) {
  // we want to have animation only on load
  var isFirstLoad = true;
  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 15,
    marginRight: 5,
    marginLeft: 5,
    animationSpeed: 1500,
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
      calc.legendHeigh = calc.chartHeight * 0.2;
      calc.lineChartHeight = calc.chartHeight * 0.8;

      var t = d3.transition()
            .duration(attrs.animationSpeed)
            .ease(d3.easeLinear)
            .on("start", function(d){ console.log("transiton start") })
            .on("end", function(d){ 
              console.log("transiton ended");
              
              container.selectAll(".dot")
                       .transition(200)
                       .ease(d3.easeLinear)
                       .attr("opacity", 1);
              
            });

      var line = d3.line()
                  .x(function(d, i) { return x(i); })
                  .y(function(d) { return y(d.value); });

      // ############ scales ##############
      var xLabels = d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, calc.chartWidth - attrs.axisLeftWidth]);
      var x = d3.scaleLinear().range([attrs.axisLeftWidth, calc.chartWidth]).domain([0, attrs.data[0].length]),
          y = d3.scaleLinear().range([calc.lineChartHeight - attrs.axisBottomHeight, 0]).domain([0, d3.max(attrs.data, function(d){
        return d3.max(d, function(x){
          return +x.value;
        });
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

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      // ############# axes ##################
      var xAxis = chart.patternify({ tag: 'g', selector: 'axis axis--x' });

      xAxis.attr("transform", "translate(" + attrs.axisLeftWidth + "," + (calc.lineChartHeight - attrs.axisBottomHeight) + ")")
          .call(d3.axisBottom(xLabels).tickFormat(d3.timeFormat("%b")).tickSize(-calc.lineChartHeight));

      var yAxis = chart.patternify({ tag: 'g', selector: 'axis axis--y'});

      yAxis.attr("transform", "translate("+attrs.axisLeftWidth+", 0)")
          .call(d3.axisLeft(y).ticks(5).tickSize(-calc.chartWidth)
          .tickPadding(8));

      // ############### lines ############
      var path = chart.patternify({ tag: 'path', selector: 'line', data: attrs.data})
                      .attr("d", d => { return line(d); })
                      .attr("stroke", (d, i) => {
                        return color(d[0].name);
                      })
                      .attr("data-name", d => {
                        return d[0].name;
                      });
           
      // animate if it is first load
      if (isFirstLoad){

        path.attr("stroke-dasharray", function(d){ return this.getTotalLength() })
           .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });
        chart.selectAll(".line").transition(t)
            .attr("stroke-dashoffset", 0);


        isFirstLoad = !isFirstLoad; // turn off animation
      }

      var div = d3.select(".tooltip")
                  .style("opacity", 0)
                  .style("background", attrs.tooltipBackgroundColor)
                  .style("color", attrs.tooltipTextColor)
                  .style("font-size", attrs.tooltipTextFontSize);

      // ############## circles ###############
      var circleData = [];
      attrs.data.forEach(x => {
        circleData = circleData.concat(x);
      });

      var fixeddot = chart.patternify({ tag: 'circle', selector: 'dot', data: circleData })
          .attr("r", 4)
          .attr("cx", function (d, i) {
              return x(i % attrs.data[0].length);
          })
          .attr("cy", function (d) {
              return y(d.value);
          })
          .attr("opacity", 0)
          .attr("data-name", d => {
            return d.name;
          })
          .style("fill", "#fff")
          .attr("stroke", (d,i) => {
            return color(d.name);
          })
          .attr("stroke-width", 2)
          .on("mouseover", function (d) {
               var circle = d3.select(this);
               circle.style("fill", d => {
                return color(d.name);
               });
               div.transition()
                  .duration(100)
                  .style("opacity", .9);
              div.html("<p>" + d.month + "</p> <p>value:" + d.value + "</p>")
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");  
          })
          .on("mouseout", function(){

            div.style("opacity", 0);

            var circle = d3.select(this);
            circle.style("fill", "#fff");

          })
          ;

      var xAxisDescription = chart.patternify({ tag: 'text', selector: 'xAxisDescr' })
                                  .attr("x", calc.chartWidth / 2)
                                  .attr("y", calc.lineChartHeight + 20)
                                  .text("Registered users number x Time");

      // ##### legend #####
      var legend = chart.patternify({ tag: 'g', selector: 'legend' })
                        .attr('transform', (d,i) => {
                              return "translate("+ [0, calc.lineChartHeight + 50] +")"
                        })
                        

      var legend_items = legend.patternify({ 
                                         tag: 'g', 
                                         selector: 'legend_item', 
                                         data: attrs.data.map(d => { 
                                            return d[0].name;
                                         })
                                       })
                           .attr('transform', (d,i) => {
                              return "translate("+ [x(i), 0] +")"
                           });

      legend_items.append("rect")
              .attr("width", 15)
              .attr("height", 15)
              .attr("x", (d, i) => {
                  return x(i);
              })
              .attr('rx', 2)
              .attr("fill", (d, i) => {
                return color(d);
              })
              .attr("data-selected", "true")
              .on("dblclick", function(d){
                var rect = d3.select(this);
                var isSelected = rect.attr("data-selected");
                var paths = chart.selectAll(".line[data-name='"+ d +"']");
                var dots = chart.selectAll(".dot[data-name='"+ d +"']");
                console.log("path:", path);
                if (isSelected == "true") {
                  rect.style("opacity", 0.5);
                  paths
                    .attr("opacity", 0);
                  dots
                    .attr("opacity", 0);
                  rect.attr("data-selected", "false");
                }
                else{
                  rect.style("opacity", 1);
                  paths
                    .attr("opacity", 1);
                  dots
                    .attr("opacity", 1);
                  rect.attr("data-selected", "true");
                }
                
              });

      legend_items.append("text")
              .attr("x", (d, i) => {
                  return x(i) + 20;
              })
              .attr("stroke", (d, i) => {
                return color(d);
              })
              .attr("stroke-width", 0.9)
              .text(d => {
                return d;
              })
              .attr("transform", "translate("+[0,12]+")");

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

  // data conversion
  function convertData(data) {
      var arr = [];

      Object.keys(data[0]).forEach(x => {
          if (x != "month") {
              var tempArr = [];
              data.forEach(d => {
                  tempArr.push({
                      month: d.month,
                      value: d[x],
                      name: x
                  });
              });
              arr.push(tempArr);
          }
      });

      return arr;
  }

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
    attrs.data = convertData(value);
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
