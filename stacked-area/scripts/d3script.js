function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 25,
    marginRight: 15,
    marginLeft: 40,
    container: 'body',
    defaultTextFill: '#2C3E50',
    defaultFont: 'Helvetica',
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

      // formats
      var formats = {};
      formats.parseDate = d3.timeParse('%Y');
      formats.formatSi = d3.format(".3s");
      formats.formatNumber = d3.format(".1f");
      formats.formatPercent = d3.format(".0%");

      // scales
      var x = d3.scaleTime().range([0, calc.chartWidth]);
      var y = d3.scaleLinear().range([calc.chartHeight, 0]);

      // axis
      var xAxis = d3.axisBottom().scale(x);
      var yAxis = d3.axisLeft()
                    .scale(y)
                    .tickFormat(formats.formatPercent);
      // colors
      var color = d3.scaleOrdinal(d3.schemeCategory20)
                    .domain(d3.keys(attrs.data[0]).filter(function(key) { return key !== 'date'; }));;

      // layouts
      var area = d3.area()
                  .x(function(d) { 
                    return x(d.data.date); })
                  .y0(function(d) { return y(d[0]); })
                  .y1(function(d) { return y(d[1]); }); 

      // data processing
      var keys = attrs.data.columns.filter(function(key) { return key !== 'date'; })
          attrs.data.forEach(function(d) {
            d.date = formats.parseDate(d.date); 
          });
          tsvData = (function(){ return attrs.data; })();

      // Set domains for axes
      x.domain(d3.extent(attrs.data, function(d) { return d.date; }));
      y.domain([0, 1]);

      // stack
      var stack = d3.stack();
      stack.keys(keys);
      stack.order(d3.stackOrderNone);
      stack.offset(d3.stackOffsetNone);

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)
        .attr('font-family', attrs.defaultFont);

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      var browser = chart.patternify({ tag: 'g', selector: 'browser', data: stack(attrs.data)})
                        .attr('class', function(d){ return 'browser ' + d.key; })
                        .attr('fill-opacity', 0.5);

      browser.append('path')
          .attr('class', 'area')
          .attr('d', area)
          .style('fill', function(d) { return color(d.key); });

      chart.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + calc.chartHeight + ')')
          .call(xAxis);

      chart.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

      // Smoothly handle data updating
      updateData = function () {

      }
      //#########################################  UTIL FUNCS ##################################

      function handleWindowResize() {
        d3.select(window).on('resize.' + attrs.id, function () {
          setDimensions();
        });
      }

      function setDimensions() {
        setSvgWidthAndHeight();
        container.call(main);
      }

      function setSvgWidthAndHeight() {
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0)
          attrs.svgWidth = containerRect.width;
        if (containerRect.height > 0)
          attrs.svgHeight = containerRect.height;
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
