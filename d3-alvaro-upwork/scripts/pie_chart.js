/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderPieChart(params) {
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
    chartInnerRadius: 50,
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
      calc.chartOuterRadius = calc.chartWidth / 4;

      // ########## scales #######
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      // layouts
      var arc = d3.arc()
                  .outerRadius(calc.chartOuterRadius)
                  .innerRadius(attrs.chartInnerRadius);

      var pie = d3.pie()
          .sort(null)
          .startAngle(1.1*Math.PI)
          .endAngle(3.1*Math.PI)
          .value(function(d) { return +d.value; });

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

      var slices = chart.patternify({ tag: 'g', selector: 'slices' })
                        .attr("transform", "translate(" + calc.chartWidth / 2 + "," + calc.chartHeight / 2 + ")");

      var arcs = slices.patternify({ tag: 'g', selector: 'arc', data: pie(attrs.data) });

      arcs.append("path")
          .style("fill", function(d) { 
            return color(d.data.name); 
          })
          .transition(attrs.id)
          .duration(attrs.animationSpeed)
          .attrTween('d', function(d) {
            var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
            return function(t) {
              d.endAngle = i(t); 
              return arc(d)
              }
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