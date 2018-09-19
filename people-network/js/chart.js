function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 80,
    marginBottom: 45,
    marginRight: 25,
    marginLeft: 25,
    itemsInARow: 10,
    rowHeight: 120,
    nodeCircleRadius: 28,
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

      let nested = d3.nest()
      .key(d => d.group)
      .entries(attrs.data.nodes)

      // scales
      let x = d3.scaleBand().range([0, calc.chartWidth]).domain(d3.range(attrs.itemsInARow))
      let yGroupA = (i) => Math.floor(i / attrs.itemsInARow) * attrs.rowHeight
      let yGroupB = (i) => Math.floor(i / attrs.itemsInARow) * attrs.rowHeight + calc.chartHeight / 2 - 50

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)
        .attr('font-family', attrs.defaultFont);

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', `translate(${calc.chartLeftMargin},${calc.chartTopMargin})`);

      svg.patternify({ tag: 'line', selector: 'division-line' })
        .attr('x1', 0)
        .attr('x2', attrs.svgWidth)
        .attr('y1', attrs.svgHeight / 2 - 50)
        .attr('y2', attrs.svgHeight / 2 - 50)
        .attr('stroke-width', 2)
        .attr('stroke', '#999')
        .attr('stroke-dasharray', '2,2')

      var links = chart.patternify({ tag: 'line', selector: 'link', data: attrs.data.links })
        .attr('x1', d => x(d.source % attrs.itemsInARow) + x.bandwidth() / 2)
        .attr('x2', d => x(d.target % attrs.itemsInARow) + x.bandwidth() / 2)
        .attr('y1', d => yGroupA(d.source) + attrs.nodeCircleRadius + 32)
        .attr('y2', d => yGroupB(d.target - nested[0].values.length) + 32 + attrs.nodeCircleRadius)
        .attr('stroke-width', 2)
        .attr('stroke', '#e9c5c5')
        .attr('opacity', '0.3')
        .attr('class', d => `link link-source-${d.source} link-target-${d.target}`)

      var nodes = chart.patternify({ tag: 'g', selector: 'node', data: attrs.data.nodes })
        .attr('class', (d, i) => `node node-${i}`)
        .attr('data-index', (d, i) => i)
        .attr('transform', (d, i) => {
          let translateX, translateY;

          translateX = x(i % attrs.itemsInARow)
          if (d.group == 'A') {
            translateY = yGroupA(i)
          } 
          else {
            translateY = yGroupB(i - nested[0].values.length)
          } 
          return `translate(${translateX},${translateY})`
        });
      
      //<clipPath id="clipPath-manafort"><circle class="clipPath manafort" r="37.55555555555556"></circle></clipPath>
      let clipPath = nodes.patternify({ tag: 'clipPath', selector: 'clip-path', data: d => [d] })
        .attr('id', d => `clipPath-${attrs.data.nodes.indexOf(d)}`)
      
      clipPath.patternify({ tag: 'circle', selector: 'clipPath' })
        .attr('r', attrs.nodeCircleRadius)
        .attr('cx', x.bandwidth() / 2)
        .attr('cy', 60)

      // <image class="nodeimg manafort" xlink:href="img/people/manafort.jpg" clip-path="url(#clipPath-manafort)" x="-37.55555555555556px" y="-37.55555555555556px" height="75.11111111111111" width="75.11111111111111"></image>
      nodes.patternify({ tag: 'image', selector: 'nodeimg', data: d => [d] })
        .attr('clip-path', d => `url(#clipPath-${attrs.data.nodes.indexOf(d)})`)
        .attr('x', `${x.bandwidth() / 4}`)
        .attr('y', `${30}`)
        .attr('width', attrs.nodeCircleRadius * 2)
        .attr('height', attrs.nodeCircleRadius * 2)
        .attr('href', d => `img/${d.href}`)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)

      var circles = nodes.patternify({ tag: 'circle', selector: 'stroke', data: d => [d] })
        .attr('r', attrs.nodeCircleRadius)
        .attr('cx', x.bandwidth() / 2)
        .attr('cy', 60)
        .attr('fill', 'none')
        .attr('cursor', 'pointer')
      
      nodes.patternify({ tag: 'text', selector: 'title', data: d => [d] })
        .attr('text-anchor', 'middle')
        .attr('dy', 0)
        .attr('y', d => d.group == 'A' ? 0 : attrs.rowHeight - 10)
        .attr('x', x.bandwidth() / 2)
        .text(d => d.name)
        .call(wrap, x.bandwidth() / 2)

      function mouseover (d) {
        let parent = d3.select(d3.select(this).node().parentElement)
        let i = parent.attr('data-index')

        let ls = d3.selectAll(d.group == 'A' ? `line.link-source-${i}` : `line.link-target-${i}`)
          .attr('stroke-width', 3)
          .attr('stroke', '#de7c7d')
          .attr('opacity', 1)
          .raise()
        
        nodes.attr('opacity', 0.4)

        parent.attr('opacity', 1)

        parent.select('.stroke')
          .attr('stroke-width', 3)
          .attr('stroke', '#de7c7d')
          .attr('r', attrs.nodeCircleRadius + 4)

        let group = d.group;
        ls.each(d => {
          let groups = d3.selectAll(group == 'A' ? `g.node-${d.target}` : `g.node-${d.source}`).raise()

          groups.selectAll('circle')
            .attr('stroke-width', 3)
            .attr('stroke', '#de7c7d')
            .attr('r', attrs.nodeCircleRadius + 4)
          
          groups.attr('opacity', 1)
        })

        parent.raise();
      }

      function mouseout (d) {
        let parent = d3.select(d3.select(this).node().parentElement)
        let i = parent.attr('data-index')

        nodes.attr('opacity', 1)

        parent.select('.stroke')
          .attr('stroke-width', null)
          .attr('stroke', null)
          .attr('r', attrs.nodeCircleRadius)

        let ls = d3.selectAll(d.group == 'A' ? `line.link-source-${i}` : `line.link-target-${i}`)
          .attr('stroke-width', 2)
          .attr('stroke', '#e9c5c5')
          .attr('opacity', '0.3')
          .lower()

        let group = d.group;
        ls.each(d => {
            let groups = d3.selectAll(group == 'A' ? `g.node-${d.target}` : `g.node-${d.source}`)

            groups.selectAll('circle')
              .attr('stroke-width', null)
              .attr('stroke', null)
              .attr('r', attrs.nodeCircleRadius)
          })

          nodes.raise();
      }

      function wrap(text, width) {
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                x = parseFloat(text.attr("x")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
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
