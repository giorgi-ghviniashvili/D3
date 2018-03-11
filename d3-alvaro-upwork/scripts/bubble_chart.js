/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderBubbleChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    bubbleMinRadius: 20,
    bubbleMaxRadius: 50,
    minimumDistance: 180,
    bubbleTextLimit: 5,
    container: 'body',
    data: null
  };


  //InnerFunctions which will update visuals
  var updateData;

  //Main chart object
  var main = function (selection) {
    selection.each(function scope() {
      var columnForRadius = "number";
      var columnForColors = "name";

      //Calculated properties
      var calc = {}
      calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      // ###### scales ######
      var colorCircles = d3.scaleOrdinal(d3.schemeCategory20);
      var scaleRadius = d3.scaleLinear().domain([d3.min(attrs.data, function(d) {
          return +d[columnForRadius];
      }), d3.max(attrs.data, function(d) {
          return +d[columnForRadius];
      })]).range([attrs.bubbleMinRadius, attrs.bubbleMaxRadius]);
      // ###### layouts #######
      var simulation = d3.forceSimulation(attrs.data)
            .force("collide", d3.forceCollide()
                                .radius(function(d) { 
                                  return scaleRadius(d[columnForRadius]) + 0.5; 
                                })
                                .iterations(60))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

      function ticked(e) {
          node.attr("cx", function(d) {
                  return d.x;
              })
              .attr("cy", function(d) {
                  return d.y;
              });

          text
              .attr("x", d => { return d.x; })
              .attr("y", d => { return d.y + 5; })
      }
      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg:svg', selector: 'svg-chart-container' })
        .attr("width", attrs.svgWidth)
        .attr("height", attrs.svgHeight)

      //Add container g element
      var chart = svg.patternify({ tag: 'svg:g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

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
                          left: "Value:",
                          right: "{value}"
                        }
                      ]);

      var node = chart.patternify({ tag: 'svg:circle', selector: 'bubble', data: attrs.data })
                      .attr('r', function(d) {
                          return scaleRadius(d[columnForRadius])
                      })
                      .style("fill", function(d) {
                          return colorCircles(d[columnForColors])
                      })
                      .attr('transform', 'translate(' + [calc.chartWidth / 2, calc.chartHeight / 2] + ')')
                      .on("mouseover", function(d) {
                           var direction = "bottom";
                           if (d.x > 0){
                              direction = "right";
                           } else{
                              direction = "left";
                           }
                           var x = calc.chartWidth / 2 + d.x;
                           var y = calc.chartHeight / 2 + d.y;
                           
                           tooltip
                              .x(x)
                              .y(y)
                              .direction(direction)
                              .show({ name: d.name, value: d.number });
                      })
                      .on("mouseout", function() {
                          tooltip.hide();
                      });

      var text = chart.patternify({ tag: 'text', selector: 'bubble-text', data: attrs.data })
                      .attr('transform', 'translate(' + [calc.chartWidth / 2, calc.chartHeight / 2] + ')')
                      .style("fill", "#fff")
                      .attr("text-anchor","middle")
                      .text(function(d) {
                        // measure text size and compate to the bubble rect
                        var limit = attrs.bubbleTextLimit;
                        var diameter = scaleRadius(d[columnForRadius]) * 2;
                        var width = d3.select(this).node().getBoundingClientRect().width;
                        if ((limit * 8 + 3 * 4) > diameter){
                          limit = 3;
                        }
                        if (d.name.length <= limit){
                          return d.name;
                        }
                        return d.name.substr(0, limit) + "..."; 
                      });

      //RESPONSIVENESS
       d3.select(window).on('resize.' + attrs.id, function () {
        setDimensions();
       });

      function setDimensions() {
        var width = container.node().getBoundingClientRect().width;
        main.svgWidth(width);
        container.call(main);
        simulation.restart();
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
