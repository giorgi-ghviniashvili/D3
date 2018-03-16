function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 30,
    marginRight: 30,
    marginLeft: 30,
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
     

      //Scales
      var x = d3.scaleLinear()
                   .rangeRound([0, calc.chartWidth])
                   .domain(d3.extent(attrs.data, function(d) { return d[0]; }));

      var y = d3.scaleLinear()
                   .rangeRound([calc.chartHeight, 0])
                   .domain(d3.extent(attrs.data, function(d) { return d[1]; }));

      var xAxis = d3.axisBottom(x),
          yAxis = d3.axisLeft(y);

      var line = d3.line()
          .curve(d3.curveCardinal)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); });

      var drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

      var brush = d3.brush()
                    .on("end", brushended),
          idleTimeout,
          idleDelay = 350;

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      //Draw axes
      chart.patternify({ tag: 'g', selector: 'axisX' })
           .attr("transform", "translate("+[0, calc.chartHeight]+")")
           .call(xAxis);
      chart.patternify({ tag: 'g', selector: 'axisY' })
           .call(yAxis);
      
      //Draw line
      var path = chart.patternify({ tag: 'path', selector: 'line', data: [attrs.data] })
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line );
            
      chart.patternify({ tag: 'circle', selector: 'circle', data: attrs.data })
          .attr('r', 10)
          .attr('cx', function(d) { return x(d[0]);  })
          .attr('cy', function(d) { return y(d[1]); })
          .style('cursor', 'pointer')
          .style('fill', '#fff')
          .style('stroke-width', 1)
          .style('stroke', "red");

      var brushGroup = svg.append("g")
                          .attr("class", "brush");

      chart.selectAll('.circle').call(drag);

      var zoomEnalbed = false;
      d3.select("#zoom").on("click", function(){
        if (!zoomEnalbed){
          brushGroup
            .call(brush);
          d3.select(this).style("color", "black");
        }
        else {
          brushGroup.html("");
          d3.select(this).style("color", "grey");
        }
        zoomEnalbed = !zoomEnalbed;
      });
      

      //###################### Drag ############################
      function dragstarted(d) {
          d3.select(this).raise().classed('active', true);
      }

      function dragged(d) {
          d[0] = x.invert(d3.event.x);
          d[1] = y.invert(d3.event.y);
          d3.select(this)
              .attr('cx', x(d[0]))
              .attr('cy', y(d[1]))
          path.attr('d',d => { 
            return line(d); 
          });
      }

      function dragended(d) {
          d3.select(this).classed('active', false);
      }

      //######################## Zoom ##########################
      function brushended() {
        var s = d3.event.selection;
        if (!s) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
          x.domain(d3.extent(attrs.data, function(d) { return d[0]; }));
          y.domain(d3.extent(attrs.data, function(d) { return d[1]; }));;
        } else {
          x.domain([s[0][0], s[1][0]].map(x.invert, x));
          y.domain([s[1][1], s[0][1]].map(y.invert, y));
          svg.select(".brush").call(brush.move, null);
        }
        zoom();
      }

      function idled() {
        idleTimeout = null;
      }

      function zoom() {
        var t = svg.transition().duration(750);
        svg.select(".axisX").transition(t).call(xAxis);
        svg.select(".axisY").transition(t).call(yAxis);
        svg.selectAll(".circle").transition(t)
            .attr("cx", function(d) { return x(d[0]); })
            .attr("cy", function(d) { return y(d[1]); });
        path.attr('d',d => { 
            return line(d); 
          });
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
