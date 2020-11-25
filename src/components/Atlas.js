import React from 'react';
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
      data.push({ x: grid * j, y: min, size });
      data.push({ x: grid * j, y: max, size });
      data.push({ x: min, y: grid * j, size });
      data.push({ x: max, y: grid * j, size });
    }

    for (let j = 0; j < i - 1; j += 1) {
      const min = layers - i + 0.5;
      const max = layers - 1.5;
      data.push({ x: grid * (min + j), y: grid * (max - j), size });
      data.push({ x: grid * (numGrids - min - j), y: grid * (max - j), size });
      data.push({ x: grid * (min + j), y: grid * (numGrids - max + j), size });
      data.push({
        x: grid * (numGrids - min - j),
        y: grid * (numGrids - max + j),
        size
      });
    }
  }

  return data
}

function geojson2data(geojson) {
  const coords = geojson.features.map((f) => {
    let latAvg = 0;
    let lonAvg = 0;
    for (let i = 0; i < 4; i += 1) {
      lonAvg += f.geometry.coordinates[0][i][0] / 4;
      latAvg += f.geometry.coordinates[0][i][1] / 4;
    }

    const projection = d3.geoMercator()
      .translate([0, 0])
      .center([126.1, 34.12])
      .rotate([0, 0, 0.6])
      .scale(50);
    const [ x, y ] = projection([lonAvg, latAvg]);
    return {
      coord: [lonAvg, latAvg],
      point: [x, y]
    }
  });
  /* Filter out unnecessary regions (except the main island) */
  const onlyJeju = coords.filter((c) => c.point[0] >= 0 && c.point[1] >= 0 );
  /* Search for neighbours */
  onlyJeju.forEach((d, i) => {
    const topIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[0] - d.point[0]) < 0.001
        && d.point[1] > element.point[1]
        && d.point[1] - element.point[1] < 0.01;
    });

    const bottomIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[0] - d.point[0]) < 0.001
        && d.point[1] < element.point[1]
        && element.point[1] - d.point[1] < 0.01;
    });

    const leftIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[1] - d.point[1]) < 0.001
        && d.point[0] > element.point[0]
        && d.point[0] - element.point[0] < 0.01;
    });

    const rightIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[1] - d.point[1]) < 0.001
        && d.point[0] < element.point[0]
        && element.point[0] - d.point[0] < 0.01;
    });

    d.top = topIndex < 0 ? undefined : topIndex;
    d.bottom = bottomIndex < 0 ? undefined : bottomIndex;
    d.left = leftIndex < 0 ? undefined : leftIndex;
    d.right = rightIndex < 0 ? undefined : rightIndex;
  });
  console.log(onlyJeju);
  return onlyJeju;
}

function Atlas() {
  let w = 2000;
  let h = 1100;
  React.useEffect(() => {
    async function drawMap() {
      const svg = d3.select('#mapCanvas');
      svg
          .attr("preserveAspectRatio", "xMinYMin meet")
          .style("background-color", "#c9e8fd")
          .attr("viewBox", `0 0 ${w} ${h}`)
          .classed("svg-content", true)
          .selectAll('*').remove();

      var projection = d3.geoMercator()
          .translate([0, 0])
          .scale(90000)
          .rotate([-10, 1, 0])
          .center([125.8, 34.1]);
      var path = d3.geoPath().projection(projection);

      // load data
      const tamraMap = await d3.json("https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-square-vanilla.geojson");
      const tamraData = geojson2data(tamraMap);

      // draw map
      svg.append("defs")
          .append("pattern")
          .attr("id", "bg")
          .attr("width", "100%")
          .attr('height', "100%")
          .attr("patternContentUnits", "objectBoundingBox")
          .append("image")
          .attr("height", "1") // value is ratio : "image height /pattern height"
          .attr("width", "1") // value is ratio : "image widht /pattern width"
          .attr("xlink:href", // use square size image
              "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg");

      var geo = svg.append('g');
      geo
        .selectAll('circle')
        .data(tamraData)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.point[0] * 1800)
        .attr('cy', (d) => d.point[1] * 1800)
        //.attr('cx', (d) => (d[0]-125.8) * 1000)
        //.attr('cy', (d) => (d[1]-33) * 1000)
        .attr('r', 2)
        .attr('fill', 'orange');

      /*
      geo.selectAll("path")
          .data(tamraMap.features)
          .enter()
          .append("path")
          .attr("class", "tamra")
          .attr("d", path)
          .attr('fill', 'orange')*/
      //    .style('fill', "url(#bg)");

      function zoomed({transform}) {
        geo.attr("transform", transform);
      }

      svg.call(d3.zoom()
        .extent([[0, 0], [w, h]])
        .scaleExtent([1, 6])
        .on("zoom", zoomed));
    }
    drawMap();
  });

  return (
      <div>
          <div>
              <svg id="mapCanvas"/>
          </div>
      </div>
  );
}

export default Atlas;
