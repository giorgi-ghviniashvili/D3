(
  function () {
    let brect = document.getElementById('chart').getBoundingClientRect()
    let width = brect.width
    let height = 850

    let links = [
      {
        source: 0, target: 24, group: 'A',
      },
      {
        source: 0, target: 21, group: 'A',
      },
      {
        source: 0, target: 37, group: 'A',
      },
      {
        source: 1, target: 25, group: 'A',
      },
      {
        source: 1, target: 28, group: 'A',
      },
      {
        source: 2, target: 25, group: 'A',
      },
      {
        source: 2, target: 28, group: 'A',
      },
      {
        source: 2, target: 35, group: 'A',
      },
      {
        source: 2, target: 37, group: 'A',
      },
      {
        source: 3, target: 39, group: 'A',
      },
      {
        source: 3, target: 22, group: 'A',
      },
      {
        source: 3, target: 41, group: 'A',
      },
      {
        source: 4, target: 39, group: 'A',
      },
      {
        source: 4, target: 22, group: 'A',
      },
      {
        source: 4, target: 41, group: 'A',
      },
      {
        source: 5, target: 39, group: 'A',
      },
      {
        source: 5, target: 20, group: 'A',
      },
      {
        source: 5, target: 29, group: 'A',
      },
      {
        source: 5, target: 32, group: 'A',
      },
      {
        source: 5, target: 23, group: 'A',
      },
      {
        source: 6, target: 43, group: 'A',
      },
      {
        source: 7, target: 23, group: 'A',
      },
      {
        source: 8, target: 33, group: 'A',
      },
      {
        source: 9, target: 35, group: 'A',
      },
      {
        source: 10, target: 35, group: 'A',
      },
      {
        source: 11, target: 41, group: 'A',
      },
      {
        source: 12, target: 39, group: 'A',
      },
      {
        source: 13, target: 22, group: 'A',
      },
      {
        source: 14, target: 41, group: 'A',
      },
      {
        source: 15, target: 39, group: 'A',
      },
      {
        source: 15, target: 20, group: 'A',
      },
      {
        source: 15, target: 29, group: 'A',
      },
      {
        source: 16, target: 32, group: 'A',
      },
      {
        source: 17, target: 23, group: 'A',
      },
      {
        source: 18, target: 30, group: 'A',
      },
      {
        source: 19, target: 23, group: 'A',
      },
      {
        source: 19, target: 28, group: 'A',
      },
      {
        source: 19, target: 25, group: 'A',
      },
      {
        source: 19, target: 31, group: 'A',
      }
    ]

    let data = {
      nodes: getRandomNodes(),
      links: links
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