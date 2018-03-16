/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderPieChart(params) {
  var isFirstLoad = true;
  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    axisLeftWidth: 30,
    axisBottomHeight: 20,
    barPadding: 2,
    animationSpeed: 1000,
    spacingAfterchart: 50,
    legendColumnCount: 3,
    legendRowHeight: 20,
    chartTitleXCoord: 2,
    chartTitle: "",
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
      calc.chartOuterRadius = calc.chartWidth < calc.chartHeight ? calc.chartHeight / 4 : calc.chartHeight / 3;
      calc.chartInnerRadius = calc.chartWidth < calc.chartHeight ? calc.chartHeight / 20 : calc.chartHeight / 10;
      calc.chartBruttoHeight = calc.chartOuterRadius * 2;
      calc.legendHeigh = calc.chartHeight - calc.chartBruttoHeight;
      calc.legendRowCount = Math.ceil(attrs.data.length / attrs.legendColumnCount);
      calc.eachLegendWidth = calc.chartWidth / attrs.legendColumnCount;
      calc.chartTitleXCoord = (calc.chartWidth - 5 * attrs.chartTitle.length) / 2;
      var sum = d3.sum(attrs.data, function(d){
        return +d.value;
      });

      var selectedSectors = attrs.data.map(d => { return d.name;});

      // ########## scales #######
      var color = d3.scaleOrdinal(d3.schemeCategory10).domain(selectedSectors);

      var x = d3.scaleLinear()
                .range([10, calc.chartWidth])
                .domain([0, attrs.data.length]);
      // layouts
      var arc = d3.arc()
                  .outerRadius(calc.chartOuterRadius)
                  .innerRadius(calc.chartInnerRadius);

      var pie = d3.pie()
                  .sort(null)
                  .startAngle(1.1*Math.PI)
                  .endAngle(3.1*Math.PI)
                  .value(function(d) { return +d.value; });

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

      var slices = chart.patternify({ tag: 'g', selector: 'slices' })
                        .attr("transform", "translate(" + calc.chartWidth / 2 + "," + (calc.chartOuterRadius) + ")");

      // ##### tooltip #######
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
                      },
                      {
                        left: "Percentage:",
                        right: "{percent}"
                      }
                    ]);

      var arcs = slices.patternify({ tag: 'g', selector: 'arc', data: pie(attrs.data) })
                        .on("mouseover", showTooltip)
                        .on("mouseout", function(){
                            tooltip.hide();
                        });

      arcs.append("path")
          .style("fill", function(d) { 
            return color(d.data.name); 
          })
          .transition(attrs.id)
          .duration(isFirstLoad ? attrs.animationSpeed : 0)
          .attrTween('d', function(d) {
            var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
            return function(t) {
              d.endAngle = i(t); 
              return arc(d)
              }
          });

      arcs.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.value; })
        .style("fill", "#fff");

      var xAxisDescription = chart.patternify({ tag: 'text', selector: 'xAxisDescr' })
                                  .attr("x", calc.chartTitleXCoord)
                                  .attr("y", calc.chartBruttoHeight + 20)
                                  .text(attrs.chartTitle);

      // ##### legend #####
      var legend = chart.patternify({ tag: 'g', selector: 'legend' })
                        .attr('transform', (d,i) => {
                              return "translate("+ [0, calc.chartBruttoHeight + 40] +")"
                        })
                        

      var legend_items = legend.patternify({ 
                                         tag: 'g', 
                                         selector: 'legend_item', 
                                         data: selectedSectors
                                       })
                                 .attr('transform', function (d, i) {
                                      return "translate(" + ((i % attrs.legendColumnCount) * calc.eachLegendWidth + calc.eachLegendWidth / 3)  + "," + Math.floor(i / attrs.legendColumnCount) * attrs.legendRowHeight + ")"
                                  });

      legend_items.append("rect")
              .attr("width", 15)
              .attr("height", 15)
              .attr('rx', 2)
              .attr("fill", (d, i) => {
                return color(d);
              })
              .attr("data-selected", "true")
              .on("click", function(d){
                var rect = d3.select(this);
                var isSelected = rect.attr("data-selected");
                if (isSelected == "true") {
                  rect.style("opacity", 0.5).attr("data-selected", "false");

                  selectedSectors.splice(selectedSectors.indexOf(d), 1);
                  var newData = attrs.data.filter(x => {
                                        if (selectedSectors.indexOf(x.name) > -1){
                                          return true;
                                        }
                                        return false
                                    });
                  var arcs = slices.selectAll("g.arc")
                                   .data(pie(newData), function(d) {
                                      return d.data.name;
                                    })
                  sum = d3.sum(newData, d => {
                    return +d.value;
                  });

                  arcs.exit().remove();

                  arcs.select("path")
                      .attr("fill", (d, i) => {
                        return color(d);
                      })
                      .transition(attrs.id)
                      .duration(attrs.animationSpeed)
                      .attrTween('d', acrTween);

                  arcs.selectAll("text").exit().remove();

                  arcs.select("text")
                      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                      .attr("text-anchor", "middle")
                      .text(function(d) { return d.value; });


                }
                else {
                  rect.style("opacity", 1).attr("data-selected", "true");
                  selectedSectors.push(d);
                  
                  var newData = attrs.data.filter(x => {
                                        if (selectedSectors.indexOf(x.name) > -1){
                                          return true;
                                        }
                                        return false
                                    })
                  sum = d3.sum(newData, d => {
                    return +d.value;
                  });
                  var arcs = slices.selectAll("g.arc")
                                   .data(pie(newData), function(d) {
                                      return d.data.name;
                                    });
                  var enterSel = arcs.enter()
                      .append("g")
                      .attr("class", "arc");
                  enterSel.append("path")
                      .style("fill", function(d) { 
                        return color(d.data.name); 
                      })
                      .on("mouseover", showTooltip)
                      .on("mouseout", function(){
                          tooltip.hide();
                      })
                      .transition(attrs.id)
                      .duration(attrs.animationSpeed)
                      .attrTween('d', acrTween)
                      ;

                  arcs.merge(arcs).select("path")
                      .transition(attrs.id)
                      .duration(attrs.animationSpeed)
                      .attrTween('d', acrTween)

                  arcs.exit().remove();
                        
                  enterSel
                      .append("text")
                      .text(function(d) { return d.value; })
                      .style("fill", "#fff")
                      .attr("text-anchor", "middle")
                      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });

                  arcs.select("text")
                      .transition(attrs.id)
                      .duration(attrs.animationSpeed)
                      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });
                      
                      
                }
              })

      legend_items.append("text")
              .attr("stroke", (d, i) => {
                return color(d);
              })
              .attr("stroke-width", 0.9)
              .text(d => {
                return d;
              })
              .attr("transform", "translate("+[18,12]+")");


      if (isFirstLoad){
        isFirstLoad = false;
      }

      //RESPONSIVENESS
       d3.select(window).on('resize.' + attrs.id, function () {
        setDimensions();
       });

      function setDimensions() {
        var width = container.node().getBoundingClientRect().width;
        main.svgWidth(width);
        main.svgHeight(window.innerWidth < 768 ? 400 : 600);

        container.call(main);
      }
      function showTooltip(d) {
          var centroidX = arc.centroid(d)[0];
          var centroidY = arc.centroid(d)[1];
          var x = calc.chartWidth / 2 + centroidX;
          var y = calc.chartBruttoHeight / 2 + centroidY;
          var direction;
          if (y - 80 < 0)
          {
            direction = "top";
          }
          else if (centroidX > 0){
            direction = "right";
          }
          else if (centroidX < 0){
            direction = "left";
          }
          else {
            direction = "bottom";
          }
          tooltip
                .x(x)
                .y(y)
                .direction(direction)
                .show({ name: d.data.name, value: d.data.value, percent: (( +d.data.value / sum ) * 100).toFixed(2) + "%"});
          
      }
      function acrTween(d) {
        var i = d3.interpolate(this._current, d);

          this._current = i(0);

          return function(t) {
            return arc(i(t))
          }
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
                if (d.data && d.data.name){
                  return d.data.name;
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