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
    let nodes = [
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Paul Manafort',
        href: 'manafort.jpg'
      },
      {
        group: 'A',
        name: 'Michael Flynn',
        href: 'flynn.jpg'
      },
      {
        group: 'A',
        name: 'Carter Page',
        href: 'page.jpg'
      },
      {
        group: 'A',
        name: 'Jeff Sessions',
        href: 'sessions.jpg'
      },
      {
        group: 'A',
        name: 'Jared Kushner',
        href: 'kushner.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump-Jr.',
        href: 'trump-jr.jpg'
      },
      {
        group: 'A',
        name: 'Rex Tillerson',
        href: 'tillerson.jpg'
      },
      {
        group: 'A',
        name: 'Willbur Ross',
        href: 'ross.jpg'
      },{
        group: 'A',
        name: 'Roger Stone',
        href: 'stone.jpg'
      },
      {
        group: 'A',
        name: 'J.D. Gordon',
        href: 'gordon.jpg'
      },
      
      {
        group: 'A',
        name: 'Michael Caputo',
        href: 'generic-male.jpg'
      },
      {
        group: 'A',
        name: 'Rick Gates',
        href: 'gates.jpg'
      },
      {
        group: 'A',
        name: 'Mark Kasowitz',
        href: 'kasowitz.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'A',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Vladimir Putin',
        href: 'putin.jpg'
      },
      {
        group: 'B',
        name: 'Russian Business',
        href: 'russian-business.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      },
      {
        group: 'B',
        name: 'Donald Trump',
        href: 'trump.jpg'
      }
    ]
    let data = {
      nodes: nodes,
      links: links
    }

    let chart = renderChart()
      .container('#chart')
      .svgWidth(width)
      .svgHeight(height)
      .data(data)
      .run()
  }
)()