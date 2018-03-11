/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
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

      var line = d3.line()
                    .curve(d3.curveCatmullRom)
                    .x(function(d){ return d.x })
                    .y(function(d){ return d.y })

      chart.patternify({tag: "path", selector: "outerCircle", data: [attrs.data.outerPoints.concat(attrs.data.outerPoints[0])] })
             .attr("d",line)
             .style("fill", "none")
             .style("stroke-dasharray", "5, 5")
             .style("stroke", "#000080")

      chart.patternify({tag: "path", selector: "innerCircle", data: [attrs.data.innerPoints.concat(attrs.data.innerPoints[0])] })
             .attr("d", line)
             .style("fill", "none")
             .style("stroke-dasharray", "5, 5")
             .style("stroke", "#000080")

      chart.patternify({ tag: "path", selector: "line", data: attrs.data.links })
           .style("fill", "none")
           .style("stroke", "#fff")
           .attr("data-source", function(d){
              return d.s;
           })
           .attr("d", function(d){
               var source = attrs.data.outerPoints[d.s];
               var target = attrs.data.innerPoints[d.t];
               return link({source: source, target: target});
         })

      var pointsData = getPointsData();

      chart.patternify({ tag: "circle", selector: 'nodes', data: pointsData })
           .attr("r", 5)
           .attr("cx",function(d) {return d.x;})
           .attr("cy", function(d) {return d.y;})
           .style("stroke-width", 2)
           .style("fill", "white")
           .style("stroke", "#000080")
           .on("mouseenter", function(d){
              var i = attrs.data.outerPoints.indexOf(d);
              d3.select(this)
                .transition()
                .duration(100)
                .style("fill", "#000080");
              chart.selectAll('path[data-source="' + i + '"]')
                   .transition()
                   .duration(100)
                   .style("stroke", "#000080");

           })
           .on("mouseleave", function(d){
              var i = pointsData.indexOf(d);
              d3.select(this)
                .transition()
                .duration(100)
                .style("fill", "#fff");
              chart.selectAll('path[data-source="' + i + '"]')
                   .transition()
                   .duration(100)
                   .style("stroke", "#fff");
           });



      // Smoothly handle data updating
      updateData = function () {

      }

      //#########################################  UTIL FUNCS ##################################
      function link(d) {
        return "M" + d.source.x + "," + d.source.y
            + "C" + d.source.x + "," + (d.source.y + d.target.y) / 2
            + " " + d.target.x + "," + (d.source.y + d.target.y) / 2
            + " " + d.target.x + "," + d.target.y;
      }

      function getPointsData () {
        return attrs.data.outerPoints.concat(attrs.data.innerPoints);
      }

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
            .map(function(d) { return d.match(/\s+\w*/gi).filter(s => s.trim()) })
            //Get xxx
            .map(function(v) { return v[0].trim() })

          //Assign local variables to the scope
          groupVariables.forEach(function(v) {
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
    var selection = container.selectAll('.' + selector).data(data, function(d,i) {
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
  Object.keys(attrs).forEach(function(key) {
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
