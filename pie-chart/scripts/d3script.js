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

      var scales, 
					layouts,
          radius,
          userControls;

      radius = getRadius();

      scales = {
        x: d3.scaleLinear().range([-90 * (Math.PI/180), 90 * (Math.PI/180)]),
        y: d3.scaleLinear().range([0, radius])
      }

      layouts = {
        partition: d3.partition(),
        arc: d3.arc()
              .startAngle(function(d) { return Math.min(2 * Math.PI, scales.x(d.x0))})
              .endAngle(function(d) { return Math.min(2 * Math.PI, scales.x(d.x1))})
              .innerRadius(function(d) { return Math.max(0, scales.y(d.y0)); })
              .outerRadius(function(d) { return Math.max(0, scales.y(d.y1)); })
      }

      userControls = {
        pathClick: function(d) {
          var thisPath = d3.select(this);
          
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
        .attr('transform', `translate(${calc.chartLeftMargin + calc.chartWidth/2},${calc.chartTopMargin + calc.chartHeight})`);

      if (attrs.data) {
        drawPie(attrs.data);
      }

      function drawPie(data){
        var root = d3.hierarchy(data).sum(function(d) { return d.size; });
        var descendants = layouts.partition(root).descendants();
        chart.selectAll("path")
            .data(descendants)
            .enter()
            .append("path")
            .attr("class", "arc")
            .attr("d", layouts.arc)
            .attr("id", function(d,i) { return "arc_"+i; })
            .style("fill", "#13a2d7");

        var gTexts = groupText(descendants);
        chart.selectAll(".arcText")
            .data(gTexts)
            .enter().append("text")
            .attr("class", "arcText")
            // .attr("x", 6) 
            .attr("dy", d => {
              return d.pathIdOrder * 20 + 10;
            })
            .style("fill", "#fff")
            .append("textPath")
            .attr("xlink:href",function(d){return d.pathId;})
            .attr("startOffset","25%")
            .attr("text-anchor","middle")
            .text(function(d){return d.text;});
      }

      function groupText(data){
        var gTexts = [];
        data.forEach((d,i) => {
          var textArray;
          if (d.depth > 1) {
            var indexOfAmp = d.data.name.indexOf('&');
            if (indexOfAmp > -1) {
              textArray = d.data.name.split("& ");
            }
            else{
              textArray = d.data.name.split(" ");
            }
            textArray.forEach((t,j) => {
              gTexts.push({
                text: t,
                pathId: "#arc_"+i,
                pathIdOrder: j+1
              });
            })
          }
          else {
            gTexts.push({
              text: d.data.name,
              pathId: "#arc_"+i,
              pathIdOrder: 1
            });
          }
        });
        return gTexts;
      }

      // private functions
			function getRadius(){
				return 250;
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
