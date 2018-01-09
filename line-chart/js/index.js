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
function handleFiles() {
    
    var dbFile = this.files[0]; /* now you can work with the file list */

    //instantiate a reader for the loaded db
    var reader = new FileReader();
    reader.readAsArrayBuffer(dbFile);

    var fileBuffer = [];
    reader.onload = function(){
      //need to transform to a typed array to correctly load db from sql js
      var db = new SQL.Database((reader.result ? new Uint8Array(reader.result) : void 0));
      var results = db.exec("SELECT * FROM 'zread_report';");

      // get data
    var  data = getData(results[0]);
    
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
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("y", 6)
    // .attr("dy", "0.71em")
    // .attr("fill", "#000")
    // .text("Values");

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

  };
};

function handleFilesCsv(fileName){
  d3.csv(fileName, function(data){
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
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("y", 6)
    // .attr("dy", "0.71em")
    // .attr("fill", "#000")
    // .text("Values");

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
}

// pass object returned from sql.js and get data as json
function getData(obj) {
  var data = [];
  var columnNames = obj.columns;
  var values = obj.values;
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    var thisObj = {};
    for (var j = 0; j < columnNames.length; j++) {
      if (columnNames[j] == 'report_value'){
        thisObj[columnNames[j]] = parseTime(value[j]);
      }
      else{
        thisObj[columnNames[j]] = +value[j];
      }
    }
    data.push(thisObj);
  }
  return data;
}
