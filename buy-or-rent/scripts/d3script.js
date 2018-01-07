var rentPrice = d3.range(0, 2000);
var scaleForYScale = d3.scaleLinear().domain([30000, 3000000])
                    .range([1200, 120000]);
// hp - home price
// rt - mortgate rate
// dr - down rate
// ys - years
function getPayment(hp, ys,  rt, dr) {
  // down deduction
  hp = hp * ( 1 - (dr / 100) );
  // how many months?
  var n = ys * 12;
  // monthly rate
  var i = ( rt / 100 ) / 12;
  var d = (Math.pow((1 + i), n) - 1) / (i * Math.pow((1 + i), n));
  var p = hp / d;
  return p;
}

function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000), // Id for event handlings
    chartName: null,
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    container: 'body',
    xScale: null,
    yScale: null,
    sliderCallback: null,
    data: null
  };


  //InnerFunctions which will update visuals
  var updateData;

  //Main chart object
  var main = function(selection) {
    selection.each(function scope() {

      //Calculated properties
      var calc = {}
      calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartRightMargin = attrs.marginRight;
      calc.chartBottomMargin = attrs.marginBottom;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      calc.chartRightPadding = 30;
      calc.chartBottomPadding = 30;

      // scales
      attrs.xScale = d3.scaleBand()
        .domain(d3.range(attrs.data.length))
        .range([calc.chartLeftMargin, calc.chartWidth - calc.chartRightPadding])
        .paddingInner(0.05);

      attrs.yScale = d3.scaleLinear()
        .domain([0, scaleForYScale(250000)])
        .range([calc.chartHeight, calc.chartBottomMargin + calc.chartBottomPadding]);

      //Define Y axis
      var yAxis = d3.axisRight()
        .scale(attrs.yScale)
        .ticks(5)
        .tickFormat(d3.format("$.0s"));

      var x = d3.scalePow()
        .exponent(0.2)
        .domain([30000, 3000000])
        .range([calc.chartLeftMargin, calc.chartWidth - calc.chartRightPadding]);

      //Define X axis
      var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(8)
        .tickFormat(d3.format("$.00s"));

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({
          tag: 'svg',
          selector: 'svg-chart-container'
        })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)

      //Add container g element
      var chart = svg.patternify({
          tag: 'g',
          selector: 'chart'
        })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      // draw bars
      chart.patternify({
          tag: 'rect',
          selector: 'bar',
          data: attrs.data
        })
        .attr("x", function(d, i) {
          return attrs.xScale(i);
        })
        .attr("y", function(d) {
          return attrs.yScale(getPayment(d, 30, 3.92, 20));
        })
        .attr("width", attrs.xScale.bandwidth())
        .attr("height", function(d) {
          return calc.chartHeight - attrs.yScale(getPayment(d, 30, 3.92, 20));
        })
        .attr("fill", function(d) {
          return "#ccc";
        });

      // y axis
      chart.patternify({
          tag: 'g',
          selector: 'y axis'
        })
        .attr("transform", "translate(" + (calc.chartWidth - calc.chartRightPadding) + ", 0)")
        .call(yAxis);

      // x axis
      chart.patternify({
          tag: 'g',
          selector: 'x axis'
        })
        .attr("transform", "translate(0," + (calc.chartHeight + 8) + ")")
        .call(xAxis);

      var slider = chart.patternify({
          tag: 'g',
          selector: 'slider'
        })
        .attr("transform", "translate(0," + (calc.chartHeight + 5.5) + ")");

      slider.patternify({
          tag: 'line',
          selector: 'track'
        })
        .attr("x1", attrs.xScale(0))
        .attr("x2", attrs.xScale(attrs.data.length - 1) + attrs.xScale.bandwidth())
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        ;

      var handle = slider.append("circle")
        .attr("class", "handle")
        .attr("r", 9)
        .attr('cx', function(){
          var p = getPayment(250000, 30, 3.92, 20);
          var result = document.getElementById("result");
          result.innerText = "$ " + Math.round(p) + " per month";
          return  x(250000);
        })
        .call(d3.drag()
          .on("start.interrupt", function() {
            slider.interrupt();
          })
          .on("start drag", function() {
            drag(x.invert(d3.event.x));

          }));

      // Smoothly handle data updating
      updateData = function() {

      }

      function drag(h) {

        var currentSliderCx = handle.attr("cx");

        var scaledX = x(h);
        var invert = x.invert(scaledX);
        if (invert < 30000 || invert > 3000000)
          return;
        console.log(invert);
        var p = getPayment(invert, 30, 3.92, 20);
        var result = document.getElementById("result");

        result.innerText = "$ " + Math.round(p) + " per month";
        
        attrs.yScale.domain([0, scaleForYScale(invert)])
        
        //Update Y axis
        svg.select(".y")
           .transition()
           .duration(1000)
           .call(yAxis);

        svg.selectAll('.bar')
           .transition()
           .duration(1000)
           .attr("y", function(d) {
            return attrs.yScale(getPayment(d, 30, 3.92, 20));
          })
          .attr("width", attrs.xScale.bandwidth())
          .attr("height", function(d) {
            return calc.chartHeight - attrs.yScale(getPayment(d, 30, 3.92, 20));
          });

        handle.attr("cx", scaledX);
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
  d3.selection.prototype.patternify = function(params) {
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
    return main[key] = function(_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) {
        return eval(` attrs['${key}'];`);
      }
      eval(string);
      return main;
    };
  });

  //Set attrs as property
  main.attrs = attrs;

  //Debugging visuals
  main.debug = function(isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  }

  //Exposed update functions
  main.data = function(value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === 'function') {
      updateData();
    }
    return main;
  }

  // Run  visual
  main.run = function() {
    d3.selectAll(attrs.container).call(main);
    return main;
  }

  return main;
}



