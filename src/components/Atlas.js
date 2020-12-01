import React, {useState} from 'react';
import * as d3 from 'd3';
import './Atlas.css';

function generateMountain(layers) {
  const grid = 20;
  const data = [];
  data.push({ x: 0, y: 0, size: layers });

  const innerStep = (layers - 1) * 0.5;
  const outerStep = (layers + 1) * 0.5;

  for (let i = 1; i < layers; i += 1) {
    const size = 1 - i * 0.1;

    // Draw edges
    for (let j = -innerStep; j <= innerStep; j += 1) {
      const min = -innerStep - i;
      const max = innerStep + i;
      data.push({x: j, y: min, size}); // top
      data.push({x: j, y: max, size}); // bottom
      data.push({x: min, y: j, size}); // left
      data.push({x: max, y: j, size}); // right
    }

    // Draw corners
    for (let j = 0; j < i - 1; j += 1) {
      const min = outerStep;
      const max = outerStep + (i - 2);
      data.push({ x: -(min + j), y: max - j, size }); // bottom left
      data.push({ x: min + j, y: max - j, size }); // bottom right
      data.push({ x: min + j, y: -(max - j), size }); // top right
      data.push({ x: -(min + j), y: -(max - j), size }); // top left
    }
  }

  return data;
}

async function makeGridInfo(jsonUrl, imgUrl, start, end, next, prev, w, h) {
  const jsonData = d3.json(jsonUrl);
  let info = {
    gridData: await d3.json(jsonUrl),
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
            "/jeju-1x-array.json",
            "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg",
            1,
            3,
            'half',
            'none',
            16.75,
            16.75
          ),
          'half': await makeGridInfo(
            "/jeju-2x-array.json",
            "https://seedling.kr/data/shop/item/1506491618_s",
            3,
            5,
            'quarter',
            'vanila',
            8.44,
            8.44
          ),
          'quarter': await makeGridInfo(
            "/jeju-4x-array.json",
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
      const gridData = gridInfo[level].gridData;

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

      const atlas = svg.append('g');
      const map = atlas.append('g');
      map
        .selectAll('rect')
        .data([].concat( ...gridData.array).filter(d => d))
        .enter()
        .append('rect')
        .attr('x', (d) => d.index[1] * 18 + 300)
        .attr('y', (d) => d.index[0] * 18 + 150)
        .attr('width', gridInfo[level].width/5)
        .attr('height', gridInfo[level].height/5)
        .attr('fill', 'orange');

      const mountains = atlas.append('g');
      mountains
        .append('g')
        .selectAll('rect')
        .data(generateMountain(6))
        .enter()
        .append('rect')
        .attr('x', (d) => 1007 + 16.75 * (d.x - d.size / 2) )
        .attr('y', (d) => 500 + 16.75 * (d.y - d.size / 2) )
        .attr('width', (d) => 16.75 * d.size )
        .attr('height', (d) => 16.75 * d.size )
        .attr('fill', () => {
          let color = '#'+Math.floor(Math.random() * Math.pow(2,32) ^ 0xffffff).toString(16).substr(-6);
        	return color;
        });

      function zoomed({transform}) {
        atlas.attr("transform", transform);
        const zoomState = d3.zoomTransform(svg.node());
        console.log(zoomState.k);
        if (zoomState.k > gridInfo[level].end) {
          setGrids(gridInfo[level].next);
          console.log('scale up');
        } else if (zoomState.k < gridInfo[level].start) {
          setGrids(gridInfo[level].prev);
          console.log('scale down');
        } else {
          atlas.attr("transform", transform);
        }
      }

      svg.call(
        d3.zoom()
          .extent([[0, 0], [w, h]])
          .scaleExtent([1, 60])
          .on("zoom", zoomed)
      );
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
