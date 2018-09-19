(
  function () {
    let brect = document.getElementById('chart').getBoundingClientRect()
    let width = brect.width
    let height = 850

    let data = {
      nodes: getRandomNodes(),
      links: getRandomLinks()
    }

    let chart = renderChart()
      .container('#chart')
      .svgWidth(width)
      .svgHeight(height)
      .data(data)
      .run()

    function getRandomNodes () {
      return d3.range(44).map((d, i) => {
        return {
          group: i < 20 ? 'A' : 'B',
          name: 'wubba dubba'
        }
      })
    }

    function getRandomLinks () {
      let links = []

      d3.range(44).forEach((d, i) => {
        let targets;

        if (i < 20) {
          targets = d3.range(20, Math.floor(Math.random() * 24 + 20)).map((d, l) => {
            return l * Math.floor(Math.random() * 10)
          })
        } else {
          targets = d3.range(0, Math.floor(Math.random() * 20)).map((d, l) => {
            return l * Math.floor(Math.random() * 10)
          })
        }

        targets.forEach(m => {
          links.push({
            source: i,
            group: i < 20 ? 'A' : 'B',
            target: m
          })
        })
      })

      return links
    }
  }
)()