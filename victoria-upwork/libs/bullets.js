(function() {

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
d3.bullet = function() {
  var orient = "left", // TODO top & bottom
      duration = 0,
      confidenceLevels = bulletConfidenceLevels,
      _mean = bulletMean,
      standardErrors = bulletStandardErrors,
      colorTheme = bulletColorTheme,
      width = 380,
      height = 30,
      // Formats a relative price (e.g., 2) as percentage change (e.g., +100%).
      tickFormat = function (x) {
        return x + '%';
      };

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {
      var clz = confidenceLevels.call(this, d, i).slice().sort(d3.ascending),
          meanz = _mean.call(this, d, i),
          sez = standardErrors.call(this, d, i).slice().sort(d3.ascending),
          color = colorTheme.call(this, d, i),
          g = d3.select(this);

      // Compute the new x-scale.
      var x = d3.scale.linear()
          .domain([-100, 100])
          .range([0, width]);

      var backRects = g.selectAll("rect.backRects")
                       .data([1]);

      backRects.enter().append("rect")
          .attr("class", "backRects")
          .attr("x", x(-100))
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .style("fill", "#E9EDEF")

      var confLevels = g.selectAll("rect.confLevel")
          .data([clz]);

      confLevels.enter().append("rect")
          .attr("class", "confLevel")
          .attr("x", d => {
            return x(d[0]);
          })
          .attr("y", 2)
          .attr("width", d => {
            return Math.abs(x(d[1]) - x(d[0]));
          })
          .attr("height", height - 4)
          .style("fill", ColorLuminance(color, 0.4));

      var stdErrors = g.selectAll("rect.standardError")
          .data([sez]);

      stdErrors.enter().append("rect")
          .attr("class", "standardError")
          .attr("x", d => {
            return x(d[0]);
          })
          .attr("y", 4)
          .attr("width", d => {
            return Math.abs(x(d[1]) - x(d[0]));
          })
          .attr("height", height - 8)
          .style("fill", color);

      // Update the mean lines.
      var mean = g.selectAll("line.mean")
          .data([meanz]);

      mean.enter().append("line")
          .attr("class", "mean")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", 4)
          .attr("y2", height - 4);

      if (d.hasAxis) {
        // Compute the tick format.
        var format =  tickFormat;

        // Update the tick groups.
        var tick = g.selectAll("g.tick")
            .data(x.ticks(5), function(d) {
              return this.textContent || format(d);
            });

        var tickEnter = tick.enter().append("g")
            .attr("class", "tick")
            .attr("transform", bulletTranslate(x))
            .style("opacity", 1e-6);

        tickEnter.append("line")
            .attr("y1", height)
            .attr("y2", height * 7 / 6);

        tickEnter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("y", height * 7 / 6)
            .text(format);

        // Transition the entering ticks to the new scale, x1.
        tickEnter.transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x))
            .style("opacity", 1);

        // Transition the updating ticks to the new scale, x1.
        var tickUpdate = tick.transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x))
            .style("opacity", 1);

        tickUpdate.select("line")
            .attr("y1", height)
            .attr("y2", height * 7 / 6);

        tickUpdate.select("text")
            .attr("y", height * 7 / 6);

        // Transition the exiting ticks to the new scale, x1.
        tick.exit().transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x))
            .style("opacity", 1e-6)
            .remove();
      }
    });
  }

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    return bullet;
  };

  // ranges (bad, satisfactory, good)
  bullet.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return bullet;
  };

  // means (previous, goal)
  bullet.mean = function(x) {
    if (!arguments.length) return means;
    means = x;
    return bullet;
  };

  // measures (actual, forecast)
  bullet.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function bulletConfidenceLevels(d) {
  return d.confidenceLevels;
}

function bulletMean(d) {
  return d.mean;
}

function bulletStandardErrors(d) {
  return d.standardErrors;
}

function bulletColorTheme(d) {
  return d.colorTheme;
}

function bulletTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function bulletWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

})();
