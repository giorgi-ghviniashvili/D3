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
      calc.lineChartHeight = calc.chartHeight * 0.8;
      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                        .attr('width', attrs.svgWidth)
                        .attr('height', attrs.svgHeight);

      // ############ scales ##############
      var xLabels = d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, calc.chartWidth - attrs.axisLeftWidth]);
      var x = d3.scaleLinear().range([attrs.axisLeftWidth, calc.chartWidth]).domain([0, attrs.data.length]),
          y = d3.scaleLinear().range([calc.lineChartHeight - attrs.axisBottomHeight, 0]).domain([0, d3.max(attrs.data, function(d){
          var sum = 0;
          Object.keys(d).forEach(x => {
            if (x != 'month'){
              sum += +d[x];
            }
          });
          return sum;
      })]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      // ############# axes ##################
      var xAxis = chart.patternify({ tag: 'g', selector: 'axis axis--x' });

      xAxis.attr("transform", "translate(" + attrs.axisLeftWidth + "," + (calc.lineChartHeight - attrs.axisBottomHeight) + ")")
          .call(d3.axisBottom(xLabels).tickFormat(d3.timeFormat("%b")).tickSize(-calc.lineChartHeight));

      var yAxis = chart.patternify({ tag: 'g', selector: 'axis axis--y'})

      yAxis.attr("transform", "translate("+attrs.axisLeftWidth+", 0)")
          .call(d3.axisLeft(y).ticks(5).tickSize(-calc.chartWidth)
          .tickPadding(8));
      
      // Add a group for each row of data
      var groups = chart.selectAll("g.bars")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "bar")
        .style("fill", function(d, i) {
          return color(i);
        });

      // Add a rect for each data value
      var rects = groups.selectAll("rect")
                    .data(function(d) { return d; });

       rects.enter()
            .append("rect")                    
            .attr("x", function(d, i) {
              return x(i) + attrs.barPadding / 2;
            })
            .attr("width", (x(1) - x(0)) - attrs.barPadding);

      // // animate if it is first load
      if (isFirstLoad){
        var t = d3.transition(attrs.id)
            .duration(attrs.animationSpeed)
            .ease(d3.easeLinear)
            .on("start", function(d){})
            .on("end", function(d){});

        chart.selectAll(".bar rect").transition(t)
                    .attr("height", function(d) {
                      return y(d[0]) - y(d[1]);
                    })
                    .attr("y", function(d) {
                      return y(d[1]);
                    })


        isFirstLoad = !isFirstLoad; // turn off animation
      }

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