function renderBoxChart(params) {
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
    axisLeftWidth : 35,
    axisBottomHeight : 20,
    showLabels: true,
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

      calc.legendRowCount = Math.ceil(attrs.data.length / attrs.legendColumnCount);
      calc.eachLegendWidth = calc.chartWidth / attrs.legendColumnCount;

      
      // ########### layouts ##############
      var box = d3.box()
                      .whiskers(iqr(1.5))
                      .height(calc.lineChartHeight - attrs.axisBottomHeight) 
                      .domain([attrs.data.minValue, attrs.data.maxValue])
                      .showLabels(attrs.showLabels)
      if (isFirstLoad) {
        box.duration(attrs.animationSpeed);
        isFirstLoad = !isFirstLoad;
      }
      // ############ scales ##############
      // Compute an ordinal xScale for the keys in boxPlotData
      var x = d3.scaleBand()     
                .domain( attrs.data.dataArray.map(function(d) { console.log(d); return d[0]; } ) )     
                .range([attrs.axisLeftWidth, calc.chartWidth])
                .padding(0.7);
     
      var  y = d3.scaleLinear().range([calc.lineChartHeight - attrs.axisBottomHeight, 0])
                               .domain([attrs.data.minValue, attrs.data.maxValue]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);
      
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
      var xAxis = chart.patternify({ tag: 'g', selector: 'axis-visible axisX' });

      xAxis
          .attr("transform", "translate(0," + (calc.lineChartHeight - attrs.axisBottomHeight) + ")")
          .call(d3.axisBottom(x));

      var yAxis = chart.patternify({ tag: 'g', selector: 'axis-visible axisY'});

      yAxis.attr("transform", "translate("+attrs.axisLeftWidth+", 0)")
          .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s'))
          .tickPadding(8));


      // ##### tooltip #######
      var tooltip = d3
                    .componentsTooltip()
                    .container(svg)
                    .content([
                      {
                        left: "Max:",
                        right: "{max}"
                      },
                      {
                        left: "Median:",
                        right: "{median}"
                      },
                      {
                        left: "Min:",
                        right: "{min}"
                      }
                    ]);

      // draw the boxplots  
      var rects = chart.patternify({ tag: 'g', selector: 'box', data: attrs.data.dataArray})
          .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + 0 + ")"; } )
          .call(box.width(x.bandwidth()))


          rects.select("rect.box")
                .on("mouseover", function (d,i) {
                           var rect = d3.select(this);
                           var mouse = d3.mouse(this);
                           tooltip
                                .textColor("white")
                                .tooltipFill(rect.style("fill"))
                                .x(x(d[0]) + (+rect.attr("width")) / 2 + 4)
                                .y(mouse[1])
                                .show({ max: d3.max(d[1]), median: 4000, min: d3.min(d[1]) });

                        })
                        .on("mouseout", function(){
                            tooltip.hide();
                        });; 
      console.log("bandwidth:", x.bandwidth())




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
      // Returns a function to compute the interquartile range.
      function iqr(k) {
        return function(d, i) {
          var q1 = d.quartiles[0],
              q3 = d.quartiles[2],
              iqr = (q3 - q1) * k,
              i = -1,
              j = d.length;
          while (d[++i] < q1 - iqr);
          while (d[--j] > q3 + iqr);
          return [i, j];
        };
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
    attrs.data = preprocessData(value);
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

  var preprocessData = function (raw_data) {
      // using an array of arrays with
      // data[n][2] 
      // where n = number of columns in the csv file 
      // data[i][0] = name of the ith column
      // data[i][1] = array of values of ith column
      var keys = Object.keys(raw_data[0]);
      var data = [];
      keys.forEach((key,i) => {
        data[i] = [];
        data[i][0] = key;
        data[i][1] = [];
      });
      var min = Infinity,
          max = -Infinity;
      raw_data.forEach((x) => {
        var rowMax = +x[keys[0]], rowMin = +x[keys[0]]; // first items
        keys.forEach((key,i) => {
          data[i][1].push(+x[key]);
          var floor = Math.floor(+x[key]);
          if (floor > rowMax) {
            rowMax = floor;
          }
          if (floor < rowMin) {
            rowMin = floor;
          }
        });
        if (rowMax > max) {
          max = rowMax;
        }
        if (rowMin < min) {
          min = rowMin; 
        }
      });
      return {
        dataArray: data, 
        minValue: min,
        maxValue: max
      };
  }

  return main;
}
