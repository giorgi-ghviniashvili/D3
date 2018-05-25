function renderPieChart(params) {

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
      chartOuterRadius: 250,
      chartInnerRadius: 75,
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
        calc.centerPoint = [calc.chartLeftMargin + calc.chartWidth/2, calc.chartTopMargin + calc.chartHeight/2]
        var scales, 
            layouts,
            radius,
            userControls,
            colors;
        
        colors = {
            lightblue: "#32C5D2",
            lightgrey: "#E1E5EC",
            white: "#fff",
            grey: "#ccc"
        }

        layouts = { 
          pie: d3.pie()
                .sort(null)
                .startAngle(1.1*Math.PI)
                .endAngle(3.1*Math.PI)
                .value(function(d) { return +d.value; }),

          arc: d3.arc()
                .outerRadius(attrs.chartOuterRadius)
                .innerRadius(attrs.chartInnerRadius),
         
          outerPie: d3.pie()
                .sort(null)
                .startAngle(-Math.PI/4)
                .endAngle(2*Math.PI - Math.PI/4)
                .value(function(d) { return +d.value; }),

          outerArc: d3.arc()
                .outerRadius(attrs.chartOuterRadius + 50)
                .innerRadius(attrs.chartOuterRadius)
        }
  
        userControls = {
          pathClick: function(d) {
            var thisPath = d3.select(this);
          },
          innerArcMouseOver: function(d){
            var thisElement = d3.select(this);
            var path = thisElement.select("path");
            var text = thisElement.select("text");
            path.style("fill", colors.lightblue);
            text.style("fill", colors.white);
          },
          innerArcMouseOut: function(d,i){
            var thisElement = d3.select(this);
            var path = thisElement.select("path");
            var text = thisElement.select("text");
            path.style("fill", i % 2 == 0 ? colors.white : colors.lightgrey);
            text.style("fill", i % 2 == 0 ? colors.grey : colors.lightblue);
          }
        };
  
        //Drawing containers
        var container = d3.select(this);
        container.html('');
  
        //Add svg
        var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
          .attr('width', attrs.svgWidth)
          .attr('height', attrs.svgHeight)
          .attr('font-family', attrs.defaultFont);
  
        //Add container g element
        var chart = svg.patternify({ tag: 'g', selector: 'chart' })
          .attr('transform', `translate(${calc.centerPoint})`);
  
        if (attrs.data) {
          drawPie();
          drawOuterPie();
          drawCenterCircle();
        }
        
        function drawCenterCircle(){
            var centerCircle = svg.patternify({ tag: 'g', selector: 'center-circle-container' })
                                .attr('transform', `translate(${calc.centerPoint})`);

            centerCircle.append("circle")
                        .attr("class", "center-circle")
                        .attr("r", attrs.chartInnerRadius)
                        .style("fill", colors.lightblue)

            centerCircle.selectAll(".center-circle-text")
                        .data(["Digital.", "Real Time.", "Real World.", "ObvioHealth"])
                        .enter()
                        .append("text")
                        .attr("dy", (d, i) => {
                            return i * 20;
                        })
                        .attr("y", "-30")
                        .attr("class", "center-circle-text")
                        .style("fill", colors.white)
                        .style("stroke-width", 10)
                        .attr("text-anchor", "middle")
                        .text(d => d);
        }

        function drawPie(){
            var arcs = chart.patternify({ tag: 'g', selector: 'arc-container', data: layouts.pie(attrs.data) })
                            .on("mouseover", userControls.innerArcMouseOver)
                            .on("mouseout", userControls.innerArcMouseOut);

            arcs.append("path")
            .attr("d", d => {
                return layouts.arc(d);
            })
            .attr("id", function(d,i) { return "arc_"+i; })
            .style("fill", function(d,i) { 
                return i % 2 == 0 ? colors.white : colors.lightgrey; 
            });

            arcs.append("text")
                .attr("transform", function(d) { 
                    var centroid = layouts.arc.centroid(d);
                    return "translate(" + [centroid[0], centroid[1]] + ")"; 
                })
                .attr("text-anchor", "middle")
                .attr("y", "0")
                .attr("dy", "0")
                .text(function(d) { return d.data.text; })
                .call(wrap, 100)
                .style("fill", function(d,i) { 
                    return i % 2 == 0 ? colors.grey : colors.lightblue; 
                })
                .style("stroke-width", 4);
        }
        
        function drawOuterPie(){
            var outerNames = [
                {
                    text: "Regulatory Compliance",
                    value: 1
                },
                {
                    text: "Good Clinical Practice",
                    value: 1
                },
                {
                    text: "System Certification",
                    value: 1
                },
                {
                    text: "AE/SAE Monitoring",
                    value: 1
                },
            ];

            var outerArc = chart.patternify({ tag: 'g', selector: 'outerarc-container', data: layouts.outerPie(outerNames) })

            outerArc.append("path")
                .attr("d", d => {
                    return layouts.outerArc(d);
                })
                .attr("id", function(d,i) { return "outerarc_"+i; })
                .style("fill", colors.lightblue);

            outerArc.append("text")
                .attr("class", "outerArcText")
                .attr("dy", 30)
                .style("fill", "#fff")
                .append("textPath")
                .attr("xlink:href", function(d,i) { return "#outerarc_"+i; })
                .attr("startOffset","25%")
                .attr("text-anchor","middle")
                .text(function(d){
                    return d.data.text;
                });
        }

        function wrap(text, width) {
            text.each(function() {
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = 1, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")),
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
              while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan")
                  .attr("x", 0).attr("y", y)
                  .attr("dy", (++lineNumber * lineHeight + dy) + "em")
                  .text(word);
                }
              }
            });
          }

        // Smoothly handle data updating
        updateData = function () {
  
        }
        handleWindowResize();
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
  