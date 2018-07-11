function renderBulletChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 20,
    marginBottom: 100,
    marginRight: 0,
    marginLeft: 0,
    marginBulletLeft: 80,
    marginBulletTop: 20,
    marginBulletBottom: 20,
    marginBulletRight: 20,
    bulletHeight: 25,
    marginBetweenBullets: 40,
    container: 'body',
    defaultTextFill: '#2C3E50',
    xAxisHeader: "",
    defaultFont: 'Helvetica',
    data: null
  };


  //InnerFunctions which will update visuals
  var updateData;

  //Main chart object
  var main = function (selection) {
    selection.each(function scope() {
      var sumHeight = 0;
      attrs.data.forEach(d => {
        sumHeight += d.bulletHeight;
      })
      attrs.svgHeight = sumHeight + 
                       (attrs.data.length - 1) * attrs.marginBetweenBullets + attrs.marginBottom;

      //Calculated properties
      var calc = {}
      calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

      //Drawing containers
      var container = d3.select(this);
      container.html("")
      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)
        .attr('font-family', attrs.defaultFont);
      
      var hiddenTexts = svg.selectAll("text.title-hidden")
                          .data(attrs.data)
                          .enter()
                          .append("text")
                          .text(d => d.title)
                          .style("visibility", "hidden")

      var hiddenTexts2 = svg.selectAll("text.subtitle-hidden")
          .data(attrs.data)
          .enter()
          .append("text")
          .text(d => d.subtitle)
          .style("visibility", "hidden")

      hiddenTexts.each(function () {
        var textWidth = d3.select(this).node().getBBox().width;
        if (textWidth > attrs.marginBulletLeft) attrs.marginBulletLeft = textWidth;
      })
      hiddenTexts2.each(function () {
        var textWidth = d3.select(this).node().getBBox().width;
        if (textWidth > attrs.marginBulletLeft) attrs.marginBulletLeft = textWidth;
      })
      
      var bulletChartHeight = attrs.bulletHeight;
      var bulletChartWidth = calc.chartWidth - attrs.marginBulletLeft - attrs.marginBulletRight;

      // ###### layouts ######## //
      var bulletChart = d3.bullet()
                          .width(bulletChartWidth);

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      var tooltip = d3
                .componentsTooltip()
                .container(svg)
                .content([
                  {
                    left: "StandardErrors:",
                    right: "{se}"
                  },
                  {
                    left: "ConfidenceLevels:",
                    right: "{cl}"
                  },
                  {
                    left: "Mean:",
                    right: "{m}"
                  }
                ]);

      var bullet = chart.patternify({ 
                                      tag: 'g', 
                                      selector: 'bullet', 
                                      data: attrs.data.map(function(d,i){
                                        d.hasAxis = i ==  attrs.data.length - 1;
                                        return d;
                                      }) 
                                    })
                        .attr("id", d => {return "bullet" + d.Id;})
                        .attr('transform', (d,i) => {
                          var sum = 0;
                          for (var j = 0; j < i; j++) {
                            sum += attrs.data[j].bulletHeight;
                          }
                          var yAxisTransform = i == 0 ? sum : sum + i * attrs.marginBetweenBullets;
                          return 'translate(' + attrs.marginBulletLeft + ',' + yAxisTransform  + ')'
                        })
                        .on("mouseover", function(d){
                          var mouse = d3.mouse(svg.node());
                          var direction = "bottom";
                          if (mouse[1] - 80 < 0) {
                            direction = "top";
                          }
                          if (mouse[0] - 100 < 0) {
                            direction = "left";
                          }
                          else if (mouse[0] + 50 > attrs.svgWidth){
                            direction = "right";
                          }
                          tooltip.x(mouse[0])
                                 .y(mouse[1])
                                 .tooltipFill(ColorLuminance(d.colorTheme, 0.4))
                                 .direction(direction)
                                 .show({ se: "[" + d.standardErrors.toString() + "]", cl: "[" + d.confidenceLevels.toString()  + "]", m: d.mean});
                        })
                        .on("mouseout", tooltip.hide)
                        .call(bulletChart);

      var title = bullet.append("g")
                    .attr("class", "title-group")
                    .style("text-anchor", "end")
                    .attr("transform", function(d){
                      return  "translate(-6," + d.bulletHeight / 2 + ")"
                    });

      title.append("text")
          .attr("class", "title")
          .text(function(d) { return d.title; })
          .style("fill", attrs.defaultTextFill);

      title.append("text")
          .attr("class", "subtitle")
          .attr("dy", "1.4em")
          .text(function(d) { return d.subtitle; });

      var zeroBar = chart.patternify({ tag: 'line', selector: 'zeroBar' })
                         .attr("x1", bulletChartWidth / 2 + attrs.marginBulletLeft)
                         .attr("x2", bulletChartWidth / 2 + attrs.marginBulletLeft)
                         .attr("y1", 0)
                         .attr("y2", calc.chartHeight + attrs.marginTop);

      var linearScale = d3.scale.linear().domain([-100, 100])
                              .range([0, bulletChartWidth]);

      chart.patternify({ tag: 'line', selector: 'overallBar', data: attrs.data.filter(x => x.hasMeanLine) })
                         .attr("x1", function(d) {
                            return linearScale(d.mean) + attrs.marginBulletLeft;
                         })
                         .attr("x2", function(d) {
                            return linearScale(d.mean) + attrs.marginBulletLeft;
                         })
                         .attr("y1", 4)
                         .attr("y2", calc.chartHeight + attrs.marginTop);

      chart.patternify({ tag: "text", selector: "xAxisHeader" })
                             .attr("x", "48%")
                             .attr("y", calc.chartHeight + 80)
                             .text(attrs.xAxisHeader);
      
      // Smoothly handle data updating
      updateData = function () {

      }
      //#########################################  UTIL FUNCS ##################################

      function handleWindowResize() {
        d3.select(window).on('resize.' + attrs.id, function () {
          setDimensions();
        });
      }

      handleWindowResize();

      function setDimensions() {
        setSvgWidthAndHeight();
        container.call(main);
      }

      function setSvgWidthAndHeight() {
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0)
          attrs.svgWidth = containerRect.width;
        // if (containerRect.height > 0)
        //   attrs.svgHeight = containerRect.height;
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
    selection = selection.enter().append(elementTag)
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
