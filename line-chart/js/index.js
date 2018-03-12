//NB you may need to change your table name on line (34)!!!!

// uncomment this to set event listener to file input
//get db file from user input 
// var inputElement = document.getElementById("input");
// inputElement.addEventListener("change", handleFiles, false);
var parseTime = d3.timeParse("%Y%m%d");
var transitionTime = 1000;
var svg = d3.select("svg"),
  margin = {top: 20, right: 80, bottom: 30, left: 50},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
  .curve(d3.curveBasis)
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.value); });

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")");

g.append("g")
    .attr("class", "axis axis--y");


// Use this function for sqliteDb
function handleFiles(value) {
    console.log(value)
    d3.csv(value, function(raw_data){
    
    var data = getData(raw_data);
    var categorizedData = [];
    var keys = [];

    Object.keys(data[0]).forEach(key => {
        
        if (key != 'report_value'){
          keys.push(key);
          
          categorizedData.push(
            {
              id: key,
              values: data.map(d => {

                return { date: d['report_value'],
                         value: d[key]
                        };
              })
            }
          );
        }
    });

  x.domain(d3.extent(data, function(d) { return d['report_value']; }));

  y.domain([
    d3.min(categorizedData, function(c) { return d3.min(c.values, function(d) { return d.value; }); }),
    d3.max(categorizedData, function(c) { return d3.max(c.values, function(d) { return d.value; }); })
  ]);

  z.domain(keys);

  g.select('.axis--x').call(d3.axisBottom(x)
                      .ticks(d3.timeDay));

  g.select('.axis--y').call(d3.axisLeft(y));


  var column = g.selectAll("path.line")
    .data(categorizedData, function(d){
      return d.id;
    });

  column
    .transition().duration(transitionTime)
    .attr("d", function(d) { return line(d.values); })
    
  column.enter()
    .append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", d => {
      return z(d.id);
    });

  column.exit().remove();

  var text = g.selectAll("text.labels")
    .data(categorizedData, function(d){
      return d.id;
  });

  text.datum(function(d) { return { id: d.id, value: d.values[d.values.length - 1]}; })
      .transition().duration(transitionTime)
      .attr("x", d => {
        return x(d.value.date);
      })
      .attr("y", d => {
        return y(d.value.value);
      });

  text.enter()
      .append("text")
      .attr("class", "labels")
      .datum(function(d) { return { id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("x", d => {
        return x(d.value.date);
      })
      .attr("y", d => {
        return y(d.value.value);
      })
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

  text.exit().remove();

  });
};

// preprocess data
function getData(objs) {
  var data = [];

  for (var i = 0; i < objs.length; i++) {
    var value = objs[i];
    var thisObj = {};
    for (var key in objs[0]) {
      if (key == 'report_value'){
        thisObj[key] = parseTime(value[key]);
      }
      else{
        thisObj[key] = +value[key];
      }
    }
    data.push(thisObj);
  }
  return data;
}
