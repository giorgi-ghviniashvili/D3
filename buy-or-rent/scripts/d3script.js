var rentPrice = d3.range(0, 2000);
var scaleForYScale = d3.scaleLinear().domain([30000, 3000000])
                    .range([1200, 120000]);

var scaleForOtherYScales = d3.scaleLinear().domain([1200, 120000])
                    .range([400, 50000]);

var currentIndicators = constants;

var currentPayment = getPayment(constants.homePrice, constants.mortgageYears, constants.mortgageRate, constants.downRate);

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
    xScaleExtern: null,
    sliderCallback: null,
    xAxisFormat: d3.format("$.2s"),
    yAxisFormat: d3.format("$.2s"),
    indicator: null,
    barHeight: null,
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
      var xScale = d3.scaleBand()
                    .domain(d3.range(attrs.data.length))
                    .range([calc.chartLeftMargin, calc.chartWidth - calc.chartRightPadding])
                    .paddingInner(0.05);

      var yScale = d3.scaleLinear()
                      .range([calc.chartHeight, calc.chartBottomMargin + calc.chartBottomPadding]);

      if (attrs.chartName == "home-price"){
        yScale.domain([0, scaleForYScale(250000)]);
      }else{
         yScale.domain([0, scaleForOtherYScales(scaleForYScale(250000))]);
      }

      //Define Y axis
      var yAxis = d3.axisRight()
        .scale(yScale)
        .ticks(5)
        .tickFormat(attrs.yAxisFormat);

      attrs.xScaleExtern
           .range([calc.chartLeftMargin, calc.chartWidth - calc.chartRightPadding]);

      //Define X axis
      var xAxis = d3.axisBottom()
        .scale(attrs.xScaleExtern)
        .ticks(8)
        .tickFormat(attrs.xAxisFormat);

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
        .attr("data-lower-bound", function(d, i) {
          var lowerBound = xScale(i);
          return attrs.xScaleExtern.invert(lowerBound);
        })
        .attr("data-upper-bound", function(d, i) {
          var upperBound = xScale(i+1);
          return attrs.xScaleExtern.invert(upperBound);
        })
        .attr("x", function(d, i) {
          return xScale(i);
        })
        .attr("y", function(d) {
          if (attrs.chartName != "home-price"){
            return yScale(currentPayment);
          }
          return yScale(getPayment(d, currentIndicators.mortgageYears, 
                currentIndicators.mortgageRate, currentIndicators.downRate));
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
          if (attrs.chartName != "home-price"){
            return calc.chartHeight - yScale(currentPayment);
          }
          var payment  = getPayment(d, currentIndicators.mortgageYears, 
                currentIndicators.mortgageRate, currentIndicators.downRate);
          console.log(yScale(payment));
          return calc.chartHeight - yScale(payment);
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
        .attr("x1", xScale(0))
        .attr("x2", xScale(attrs.data.length - 1) + xScale.bandwidth())
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
          var p = getPayment(constants.homePrice, constants.mortgageYears, constants.mortgageRate, constants.downRate);
          var result = document.getElementById("result");
          result.innerText = "$ " + Math.round(p) + " per month";
          return  attrs.xScaleExtern(constants[attrs.indicator]);
        })
        .call(d3.drag()
          .on("start.interrupt", function() {
            slider.interrupt();
          })
          .on("start drag", function() {

            var invert = attrs.xScaleExtern.invert(d3.event.x);

            var bar = chart.selectAll(".bar").attr("fill", function(d) {
              return "#ccc";
            }).filter(function(){ return d3.select(this).attr("data-lower-bound") <= invert && d3.select(this).attr("data-upper-bound") >= invert; });

            bar.attr("fill", function(d) {
              return "rgb(186, 216, 10)";
            });

            var scaledX = attrs.xScaleExtern(invert);

            if (attrs.chartName == 'home-price')
              if (invert < 30000 || invert > 3000000)
                return;

            handle.attr("cx", scaledX);

            attrs.sliderCallback(invert);

          }));

      // Smoothly handle data updating
      updateData = function() {

      }

      main.updateChart = function(invert) {
        var scaledAxis;
        if (attrs.chartName == "home-price"){
          scaledAxis  = scaleForYScale(invert);
          yScale.domain([0, scaledAxis]);
        }
        else{
          scaledAxis = scaleForOtherYScales(scaleForYScale(invert));
          yScale.domain([0, scaleForOtherYScales(scaleForYScale(invert))]);
        }
       
        //Update Y axis
        svg.select(".y")
           .transition()
           .duration(1000)
           .call(yAxis);

        svg.selectAll('.bar')
           .transition()
           .duration(1000)
           .attr("y", function(d) {
            if (attrs.chartName != "home-price"){
              if (currentPayment > scaledAxis){
              return yScale(scaledAxis);
              }
              return yScale(currentPayment);
            }
            var payment = getPayment(d, currentIndicators.mortgageYears, 
                currentIndicators.mortgageRate, currentIndicators.downRate);
            console.log(d + " : " + payment);
            if (payment > scaledAxis){
              return yScale(scaledAxis);
            }
            return yScale(payment);
          })
          .attr("width", xScale.bandwidth())
          .attr("height", function(d) {
            if (attrs.chartName != "home-price"){
            if (currentPayment > scaledAxis){
              return calc.chartHeight - yScale(scaledAxis);
            }
            return calc.chartHeight - yScale(currentPayment);
          }
            var payment = getPayment(d, currentIndicators.mortgageYears, 
                currentIndicators.mortgageRate, currentIndicators.downRate);

            if (payment > scaledAxis){
              return calc.chartHeight - yScale(scaledAxis);
            }

            return calc.chartHeight - yScale(payment);
          });

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

  main.onDrag = function(callback){
    attrs.sliderCallback = callback;
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



