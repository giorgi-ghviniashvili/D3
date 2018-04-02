function getCloropleth(params) {
            //calculated properties
            var calc = {}

            calc.chartLeftMargin = params.marginLeft;
            calc.chartTopMargin = params.marginTop;

            calc.chartWidth = params.svgWidth - params.marginRight - calc.chartLeftMargin;
            calc.chartHeight = params.svgHeight - params.marginBottom - calc.chartTopMargin;


            //################################ DRAWING ######################  
            //drawing containers
            var container =  d3.select(params.container, function(d,i){
                return i;
            })

            //drawing
            var svg = container .append('svg')
                                .attr('class', 'svg-chart-container')
                                .attr('width', params.svgWidth)
                                .attr('height', params.svgHeight);
            
            var chart = svg
                        .append('g')
                        .attr('class', 'chart')
                        .attr('width', calc.chartWidth)
                        .attr('height', calc.chartHeight)
                        .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')


            /* ############# PROJECTION ############### */

            var projection = d3.geoAlbersUsa()
                                   .scale(params.scale)
                                   .fitSize([calc.chartWidth,calc.chartHeight], params.geojson);

            var path = d3.geoPath()
                         .projection(projection);


            /* ##############  DRAWING ################# */
            chart
                 .append('text')
                 .attr('class', 'header')
                
                 .attr("x", calc.chartWidth / 3)
                 .attr("y", 30)
                 .text(params.header)
                 .style("fill", "green")

            chart.selectAll('path.districts')
                 .data(params.geojson.features)
                 .enter()
                 .append('path')
                 .attr('class', 'districts')
                 .attr('d', path)
                 .attr('fill', d => {

                    var spendingDataEnty = params.data.filter(function(x){
                        return x.District.includes(d.properties.DISTRICT);
                    });

                    if (spendingDataEnty.length > 0){
                        return params.color(+spendingDataEnty[0].TTPP);
                    }
                    return "rgb(167, 219, 162)";
                 }) 

            if (params.container == "#mapRight"){
                var legend = svg.selectAll(".legend")
                      .data(params.color.ticks(6).slice(1).reverse())
                      .enter()
                      .append("g")
                      .attr("class", "legend")
                      .attr("transform", function(d, i) { return "translate(" + (calc.chartWidth - 60) + "," + (20 + i * 20) + ")"; });

                legend.append("rect")
                      .attr("width", 20)
                      .attr("height", 20)
                      .style("fill", d => {
                        return params.color(d);
                      });

                legend.append("text")
                      .attr("x", 26)
                      .attr("y", 10)
                      .attr("dy", ".35em")
                      .text(String);
            }
}
