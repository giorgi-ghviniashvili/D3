function getCloropleth(params) {
    // exposed variables
    var attrs = {
        svgWidth: 700,
        svgHeight: 700,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        center: [43.5, 44],
        scale: 1,
        container: 'body',
        geojson: null,
        data: null,
        header: "Header"
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

            /* ########### SCALES ###################### */

            var color = d3.scaleSequential(d3.interpolateGreens)
                          .domain([0, d3.max(attrs.data, function(d){
                            return +d.TTPP;
                          })]);

            /*##################################   HANDLERS  ####################################### */
            var handlers = {
                zoomed: null
            }

            /*##################################   BEHAVIORS ####################################### */
            var behaviors = {};

            behaviors.zoom = d3.zoom().on("zoom", d => handlers.zoomed(d));

            //################################ DRAWING ######################  
            //drawing containers
            var container = d3.select(this);

            //drawing
            var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                                .attr('width', attrs.svgWidth)
                                .attr('height', attrs.svgHeight)
                                .call(behaviors.zoom);
            // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
            // .attr("preserveAspectRatio", "xMidYMid meet")
            // Add a legend for the color values.

            
            var chart = svg.patternify({ tag: 'g', selector: 'chart' })
                .attr('width', calc.chartWidth)
                .attr('height', calc.chartHeight)
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')


            /* ############# PROJECTION ############### */

            var projection = d3.geoAlbersUsa()
                                   //.translate([w/2, h/2])
                                   .scale(attrs.scale)
                                   .fitSize([calc.chartWidth,calc.chartHeight], attrs.geojson);

            var path = d3.geoPath()
                         .projection(projection);

            

            /* ##############  DRAWING ################# */
            chart.patternify({ tag: 'text', selector: 'header' })
                 .attr("x", calc.chartWidth / 3)
                 .attr("y", 30)
                 .text(attrs.header)
                 .style("fill", "green")

            chart.patternify({ tag: 'path', selector: 'districts', data: attrs.geojson.features })
                 .attr('d', path)
                 .attr('fill', d => {

                    var spendingDataEnty = attrs.data.filter(function(x){
                        return x.District.includes(d.properties.DISTRICT);
                    });

                    if (spendingDataEnty.length > 0){
                        return color(+spendingDataEnty[0].TTPP);
                    }
                    return "rgb(167, 219, 162)";
                 }) 

            if (attrs.container == "#mapRight"){
                var legend = svg.selectAll(".legend")
                      .data(color.ticks(6).slice(1).reverse())
                      .enter()
                      .append("g")
                      .attr("class", "legend")
                      .attr("transform", function(d, i) { return "translate(" + (calc.chartWidth - 60) + "," + (20 + i * 20) + ")"; });

                legend.append("rect")
                      .attr("width", 20)
                      .attr("height", 20)
                      .style("fill", d => {
                        return color(d);
                      });

                legend.append("text")
                      .attr("x", 26)
                      .attr("y", 10)
                      .attr("dy", ".35em")
                      .text(String);

            }
            /* #############################   HANDLER FUNCTIONS    ############################## */
            handlers.zoomed = function () {
                var transform = d3.event.transform;
                chart.attr('transform', transform);
            }

            // smoothly handle data updating
            updateData = function () {


            }

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
          })
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
