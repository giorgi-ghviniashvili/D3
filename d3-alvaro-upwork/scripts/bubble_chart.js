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
    minimumDistance: 250,
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

      // ###### layouts #######
      var simulation = d3.forceSimulation(attrs.data)
            .force("charge", d3.forceManyBody().strength([-attrs.minimumDistance]))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

      function ticked(e) {
          var q = d3.quadtree(attrs.data),
              i = 0,
              n = attrs.data.length;

          while (++i < n) q.visit(collide(attrs.data[i]));
          node.attr("cx", function(d) {
                  return d.x;
              })
              .attr("cy", function(d) {
                  return d.y;
              });
      }

      // ###### scales ######
      var colorCircles = d3.scaleOrdinal(d3.schemeCategory20);
      var scaleRadius = d3.scaleLinear().domain([d3.min(attrs.data, function(d) {
          return +d[columnForRadius];
      }), d3.max(attrs.data, function(d) {
          return +d[columnForRadius];
      })]).range([attrs.bubbleMinRadius, attrs.bubbleMaxRadius]);

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg:svg', selector: 'svg-chart-container' })
        .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight )
        .attr("preserveAspectRatio", "xMinYMin")

      //Add container g element
      var chart = svg.patternify({ tag: 'svg:g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      // ###### tooltip #####
      var tooltip = d3.select("body").selectAll(".bubbleTooltip")
            .data([1])
            .enter()
            .append("div")
            .attr("class", "bubbleTooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("color", "white")
            .style("padding", "8px")
            .style("background-color", "#626D71")
            .style("border-radius", "6px")
            .style("text-align", "center")
            .style("font-family", "monospace")
            .style("width", "100px")
            .text("");

      var node = chart.patternify({ tag: 'svg:circle', selector: 'bubble', data: attrs.data })
            .attr('r', function(d) {
                return scaleRadius(d[columnForRadius])
            })
            .style("fill", function(d) {
                return colorCircles(d[columnForColors])
            })
            .attr('transform', 'translate(' + [calc.chartWidth / 2, calc.chartHeight / 2] + ')')
            .on("mouseover", function(d) {
                tooltip.html("name: " + d[columnForColors] + "<br>number: " + d[columnForRadius] + "");
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("left", (0) + "px")
                return tooltip.style("visibility", "hidden");
            });

      

      function collide(node) {
        var r = node.radius + 16,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
              l = (l - r) / l * .5;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
      }

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
