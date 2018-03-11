function getChart(params) {
    // exposed variables
    var attrs = {
        svgWidth: 700,
        svgHeight: 700,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        center: [43.5, 44],
        scale: 150,
        dotDeleteTime: 3000,
        container: 'body',
        geojson: null,
        data: null
    };


    /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */

    var attrKeys = Object.keys(attrs);
    attrKeys.forEach(function (key) {
        if (params && params[key]) {
            attrs[key] = params[key];
        }
    })


    //innerFunctions
    var updateData;


    //main chart object
    var main = function (selection) {
        selection.each(function () {

            //calculated properties
            var calc = {}

            calc.chartLeftMargin = attrs.marginLeft;
            calc.chartTopMargin = attrs.marginTop;

            calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
            calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;


            /*##################################   HANDLERS  ####################################### */
            var handlers = {
                zoomed: null
            }

            /*##################################   BEHAVIORS ####################################### */
            // var behaviors = {};

            // behaviors.zoom = d3.zoom().on("zoom", d => handlers.zoomed(d));

            //################################ DRAWING ######################  
            //drawing containers
            var container = d3.select(this);

            //drawing
            var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                // .call(behaviors.zoom);
            // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
            // .attr("preserveAspectRatio", "xMidYMid meet")

            var chart = svg.patternify({ tag: 'g', selector: 'chart' })
                // .attr('width', calc.chartWidth)
                // .attr('height', calc.chartHeight)
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')

            /* ############# PROJECTION ############### */

            var projection = d3.geoEquirectangular()
                .scale(attrs.scale)
                .translate([calc.chartWidth * 0.6, calc.chartHeight * 0.2])
                .center(attrs.center);

            var path = d3.geoPath()
                .projection(projection);

            /* ##############  DRAWING ################# */
            chart.patternify({ tag: 'path', selector: 'map-path', data: attrs.geojson.features })
                .attr('d', path)
                .attr('fill', "steelblue")

            /* #############################   HANDLER FUNCTIONS    ############################## */
            // handlers.zoomed = function () {
            //     var transform = d3.event.transform;
            //     chart.attr('transform', transform);
            // }

            // smoothly handle data updating
            updateData = function () {
                
                var dots = chart.selectAll(".dot").data(attrs.data, d => {
                    return d.id;
                });

                var tooltip = chart.selectAll('.tooltip').data(attrs.data, d => {
                    return d.id;
                });

                setTimeout(() => {
                    dots.exit().remove();
                    tooltip.exit().remove();
                }, attrs.dotDeleteTime / 2);
                
              // <animate attributeType="SVG" attributeName="r" begin="0s" dur="1.5s" repeatCount="indefinite" from="5%" to="25%"/>
              // <animate attributeType="CSS" attributeName="stroke-width" begin="0s"  dur="1.5s" repeatCount="indefinite" from="3%" to="0%" />
              // <animate attributeType="CSS" attributeName="opacity" begin="0s"  dur="1.5s" repeatCount="indefinite" from="1" to="0"/>
                
                dots.enter()
                    .append("circle").merge(dots).attr("class", "dot")
                    .attr("cx", function (d) { return projection([d.Longitude, d.Latitude])[0]; })
                    .attr("cy", function (d) { return projection([d.Longitude, d.Latitude])[1]; })
                    .attr("r", "1")
                    .attr("fill", d => {
                        return d.Class;
                    })
                    .append("animate")
                    .attr("attributeType", "SVG")
                    .attr( "attributeName","r")
                    .attr( "begin","0s")
                    .attr("dur","1.5s")
                    .attr("repeatCount", "indefinite")
                    .attr("from","0%")
                    .attr("to","1%");

                var groups = tooltip.enter().append("g").merge(tooltip).attr("class", "tooltip")
                                    .attr("transform", d => {
                                    var x = projection([d.Longitude, d.Latitude])[0] + 15;
                                    var y = projection([d.Longitude, d.Latitude])[1] - 15;

                                return "translate("+[x,y]+")"})
                            
                groups.append("rect")
                       .attr("width", 190)
                       .attr("height", 30)
                       .attr("rx", 5)
                       .attr("fill", "#667")

                var texts = groups.append("text")
                      .attr("dx", 0)
                      .attr("dy", 20)
                      .style("fill",d => {
                                return d.Class;
                            })
                      .text(d => { return d.Class.toUpperCase() + " event at " + d.City.toUpperCase(); });
            }

            //#########################################  UTIL FUNCS ##################################

            function debug() {
                if (attrs.isDebug) {
                    //stringify func
                    var stringified = scope + "";

                    // parse variable names
                    var groupVariables = stringified
                        //match var x-xx= {};
                        .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
                        //match xxx
                        .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
                        //get xxx
                        .map(v => v[0].trim())

                    //assign local variables to the scope
                    groupVariables.forEach(v => {
                        main['P_' + v] = eval(v)
                    })
                }
            }
            debug();

        });
    }
    
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

    //dinamic keys functions
    Object.keys(attrs).forEach(key => {
        // Attach variables to main function
        return main[key] = function (_) {
            var string = `attrs['${key}'] = _`;
            if (!arguments.length) { return eval(` attrs['${key}'];`); }
            eval(string);
            return main;
        };
    });

    //set attrs as property
    main.attrs = attrs;

    //debugging visuals
    main.debug = function (isDebug) {
        attrs.isDebug = isDebug;
        if (isDebug) {
            if (!window.charts) window.charts = [];
            window.charts.push(main);
        }
        return main;
    }

    //exposed update functions
    main.data = function (value) {
        if (!arguments.length) return attrs.data;
        attrs.data = value;
        if (typeof updateData === 'function') {
            updateData();
        }
        return main;
    }

    // run  visual
    main.run = function () {
        d3.selectAll(attrs.container).call(main);
        return main;
    }

    return main;
}