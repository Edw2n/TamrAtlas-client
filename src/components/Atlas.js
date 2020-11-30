import React, {useState} from 'react';
import * as d3 from 'd3';
import './Atlas.css';

function generateMountain(layers) {
  const grid = 20;
  const data = [];
  const numGrids = layers + 2 * (layers - 1);
  data.push({
    x: grid * (numGrids / 2),
    y: grid * (numGrids / 2),
    size: grid * (layers - 0.1)
  });

  for (let i = 1; i < layers; i += 1) {
    const size = grid * (1 - i * 0.15);

    // Top
    for (let j = layers - 0.5; j <= numGrids - layers + 0.5; j += 1) {
      const min = grid * (layers - i - 0.5);
      const max = grid * numGrids - min;
      data.push({x: grid * j, y: min, size});
      data.push({x: grid * j, y: max, size});
      data.push({x: min, y: grid * j, size});
      data.push({x: max, y: grid * j, size});
    }

    for (let j = 0; j < i - 1; j += 1) {
      const min = layers - i + 0.5;
      const max = layers - 1.5;
      data.push({x: grid * (min + j), y: grid * (max - j), size});
      data.push({x: grid * (numGrids - min - j), y: grid * (max - j), size});
      data.push({x: grid * (min + j), y: grid * (numGrids - max + j), size});
      data.push({
        x: grid * (numGrids - min - j),
        y: grid * (numGrids - max + j),
        size
      });
    }
  }

  return data
}

async function makeGridInfo(jsonUrl, imgUrl, start, end, next, prev, w, h) {
  let info = {
    grid: await d3.json(jsonUrl),
    fill: imgUrl,
    start: start,
    end: end,
    prev: prev,
    next: next,
    width: w,
    height: h
  };

  return info;
}


function Atlas() {
  let w = 2000;
  let h = 1100;

  let gridInfo;
  const [level, setGrids] = useState(['vanila']);

  React.useEffect(() => {
    async function drawMap() {

      if (!gridInfo) {
        gridInfo = {
          'vanila': await makeGridInfo(
            "/jeju-1x.json",
            "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg",
            1,
            2.5,
            'half',
            'none',
            16.75,
            16.75
          ),
          'half': await makeGridInfo(
            "/jeju-2x.json",
            "https://seedling.kr/data/shop/item/1506491618_s",
            2.5,
            5,
            'quarter',
            'vanila',
            8.44,
            8.44
          ),
          'quarter': await makeGridInfo(
            "/jeju-4x.json",
            "https://image.yes24.com/blogimage/blog/k/s/kse10034/5a33xTQt.jpg",
            5,
            80,
            'none',
            'half',
            4.22,
            4.22
          )
        };
      }
      const svg = d3.select('#mapCanvas');
      svg
        .attr("preserveAspectRatio", "xMinYMin meet")
        .style("background-color", "#c9e8fd")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .classed("svg-content", true)
        .selectAll('*').remove();

      // load data
      const gridMap = gridInfo[level].grid;

      // draw map
      svg.append("defs")
        .append("pattern")
        .attr("id", `${level}`)
        .attr("width", "100%")
        .attr('height', "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", "1") // value is ratio : "image height /pattern height"
        .attr("width", "1") // value is ratio : "image width /pattern width"
        .attr("xlink:href", // use square size image
          gridInfo[level].fill);


      var geo = svg.append('g');
      geo
        .selectAll('.grid')
        .data(gridMap)
        .enter()
        .append('rect')
        .attr('class', 'grid')
        .attr('x', (d) => d.point[0] * 1800)
        .attr('y', (d) => d.point[1] * 1800)
        .attr('width', gridInfo[level].width)
        .attr('height', gridInfo[level].height)
        .attr('fill', `url(#${level})`);

      function zoomed({transform}) {
        const zoomState = d3.zoomTransform(svg.node());
        console.log(zoomState.k);
        if (zoomState.k > gridInfo[level].end) {
          setGrids(gridInfo[level].next);
          console.log('scale up');
        } else if (zoomState.k < gridInfo[level].start) {
          setGrids(gridInfo[level].prev);
          console.log('scale down');
        } else {
          geo.attr("transform", transform);
        }
      }

      function isSelected(data, selection) {

        let x0 = selection[0][0];
        let y0 = selection[0][1];
        let x1 = selection[1][0];
        let y1 = selection[1][1];

        let [d_x, d_y] = [data.point[0] * 1800, data.point[1] * 1800];

        //TODO: change each data with spatial-selected class

        if (x0 < d_x && d_x < x1 && y0 < d_y && d_y < y1) {
          return true;
        } else {
          return false;
        }


      }

      function brushed({transform}) {
        let selection = d3.brushSelection(this); // selection 범위를 반올림해서 면적 넓히면 제대로 겹칠듯
        if (selection === null) {
          geo.selectAll('.grid')
            .attr("stroke", "#e0cabc")
            .attr('stroke-width', 0.5); // make general grid
        } else { // brush end 때 해야할 듯

          geo.selectAll('.grid')
            .attr("stroke", d => isSelected(d,selection) ? "red" : "#e0cabc")
            .attr('stroke-width', 0.5);
        }

      }

      svg.call(
        d3.zoom()
          .extent([[0, 0], [w, h]])
          .scaleExtent([1, 60])
          .on("zoom", zoomed)
      );

      const brush = d3.brush()
        .filter(event => event.ctrlKey)
        .on("start brush", brushed);

      geo.append("g")
        .attr("class", `spatial-brush`)
        .call(brush)

      function resetBrush() {
        // console.log( d3.selectAll('#spatial-brush'))
        //d3.selectAll('#spatial-brush').call(brush.clear());
      }

      svg.on('click', resetBrush)
    }

    drawMap();
  }, [level]);

  return (
    <div>
      <div>
        <svg id="mapCanvas"/>
      </div>
    </div>
  );
}

export default Atlas;
