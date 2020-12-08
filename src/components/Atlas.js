import React, {useState} from 'react';
import * as d3 from 'd3';
import {select} from 'd3-transition';
import './Atlas.css';
import cloud from 'd3-cloud';

let tooltipConfigVanila = {
  width: 50,
  height: 30,
  fontSize: 25
}

let popUpConfigVanila = {
  length: 200,
  fontSize: 10
}

let rightConfig = {
  w: 380,
  h: 280
}

async function makeGridInfo(jsonUrl, imgUrl, start, end, next, prev, size) {
  const jsonData = d3.json(jsonUrl);
  let info = {
    gridData: await d3.json(jsonUrl),
    fill: imgUrl,
    start: start,
    end: end,
    prev: prev,
    next: next,
    size: size
  };

  return info;
}

function haversineDistance(coord1, coord2) {
  const {lat: lat1, lon: lon1} = coord1;
  const {lat: lat2, lon: lon2} = coord2;

  // Haversine fomula
  // https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
  const R = 6371; // km
  const x1 = lat2 - lat1;
  const dLat = x1 / 180 * Math.PI;
  const x2 = lon2 - lon1;
  const dLon = x2 / 180 * Math.PI;
  ;
  const a
    = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 / 180 * Math.PI) * Math.cos(lat2 / 180 * Math.PI)
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function mountain(layers, coord, gridData) {
  function generateMountain(layers) {
    const grid = 20;
    const data = [];
    data.push({x: 0, y: 0, size: layers});

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
        data.push({x: -(min + j), y: max - j, size}); // bottom left
        data.push({x: min + j, y: max - j, size}); // bottom right
        data.push({x: min + j, y: -(max - j), size}); // top right
        data.push({x: -(min + j), y: -(max - j), size}); // top left
      }
    }

    return data;
  }

  let grids = generateMountain(layers);

  // Find the nearest grid
  let nearlest;
  let minDistance = 100000;
  gridData.array.forEach((d) => {
    const dist = haversineDistance(coord, d.coord);

    if (dist < minDistance) {
      nearlest = d;
      minDistance = dist;
    }
  });

  // Find the center position
  let centerPos = nearlest.index;
  if (layers % 2 === 0) {
    centerPos[0] += 0.5;
    centerPos[1] += 0.5;
  }

  /*
  // Move center if going outside of the map boundary
  for (let i = -(layers - 1) / 2; i <= (layers - 1) / 2; i += 1) {
    for (let j = -(layers - 1); j <= (layers - 1) / 2; j += 1) {
      const row = Math.round(i + centerPos[0] - i);
      const col = Math.round(i + centerPos[1] - j);
      if (!gridData.matrix[row][col]) {

      }
    }
  }*/

  // Clip along the map boundary
  grids = grids.filter((g) => {
    const row = Math.round(g.y + centerPos[0]);
    const col = Math.round(g.x + centerPos[1]);
    return gridData.matrix[row][col]; // filter out if undefined
  });

  // Calculate the bounding box
  const xs = grids.map((g) => g.x);
  const ys = grids.map((g) => g.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const bbox = [
    [minX - 0.5 + centerPos[0], minY - 0.5 + centerPos[1]],
    [maxX + 0.5 + centerPos[0], maxY + 0.5 + centerPos[1]]
  ];

  return {centerPos, bbox, grids};
}


function Atlas(props) {
  let data = props.instaData;
  console.log(data);

  let w = 2000;
  let h = 1100;

  let tooltipConfig = {}
  let popUpConfig = {}

  let gridInfo;
  const [level, setGrids] = useState(['vanila']);

  React.useEffect(() => {
    async function drawMap() {

      let hashtags = props.instaData.hashtags;
      console.log(hashtags);

      if (!gridInfo) {
        gridInfo = {
          'vanila': await makeGridInfo(
            "/jeju-1x-array.json",
            "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg",
            1,
            2.5,
            'half',
            'none',
            18
          ),
          'half': await makeGridInfo(
            "/jeju-2x-array.json",
            "https://seedling.kr/data/shop/item/1506491618_s",
            2.5,
            5,
            'quarter',
            'vanila',
            9
          ),
          'quarter': await makeGridInfo(
            "/jeju-4x-array.json",
            "https://image.yes24.com/blogimage/blog/k/s/kse10034/5a33xTQt.jpg",
            5,
            80,
            'none',
            'half',
            4.5
          )
        };
      }

      for (let key in tooltipConfigVanila) {
        tooltipConfig[key] = tooltipConfigVanila[key] / gridInfo[level].start;
      }

      for (let key in popUpConfigVanila) {
        popUpConfig[key] = popUpConfigVanila[key] / gridInfo[level].start;
      }


      const svg = d3.select('#mapCanvas');
      svg
        .attr("preserveAspectRatio", "xMinYMin meet")
        .style("background-color", "#c9e8fd")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .classed("svg-content", true)
        .selectAll('*').remove();

      // Load map grid data
      const gridData = gridInfo[level].gridData;

      // Draw map as grids
      const atlas = svg.append('g');
      const map = atlas.append('g');
      map
        .selectAll('rect')
        .data(gridData.array)
        .enter()
        .append('rect')
        .attr('class', 'grid')
        .attr('x', (d) => d.index[1] * gridInfo[level].size + 300 - gridInfo[level].size / 6)
        .attr('y', (d) => d.index[0] * gridInfo[level].size + 150 - gridInfo[level].size / 6)
        .attr('width', gridInfo[level].size / 3)
        .attr('height', gridInfo[level].size / 3)
        .attr('fill', 'orange');

      // Generate mountain data
      let mountainData = [];
      let mountainPhotos = [];

      function thumbnailUrl(idx) {
        const index = idx.toString().padStart(6, '0');
        return 'http://147.46.242.161:10000/thumbnail/' + index;
      }

      if (props.instaData.clusters) {
        mountainData = props.instaData.clusters.map((c) => {
          const layers = Math.floor(2 + c.photos.length / 100);
          const m = mountain(layers, c.center, gridData);
          const photos = c.photos.slice(0, m.grids.length);
          m.grids = m.grids.map((g, i) => ({
            ...g,
            id: 'insta_' + photos[i].idx
          }));
          mountainPhotos = [...mountainPhotos, ...photos.map((p, i) => ({
            id: 'insta_' + p.idx,
            url: i === 0 ? p.img_url : thumbnailUrl(p.idx)
          }))];
          return m;
        });
      }

      // Add photos as patterns
      svg.append("defs")
        .selectAll('pattern')
        .data(mountainPhotos)
        .enter()
        .append("pattern")
        .attr("id", (d) => d.id)
        .attr("width", "100%")
        .attr('height', "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", "1") // value is ratio : "image height /pattern height"
        .attr("width", "1") // value is ratio : "image width /pattern width"
        .attr("href", (d) => d.url);

      // Draw mountains
      const mountains = atlas.append('g')

      mountains
        .selectAll('g')
        .data(mountainData)
        .enter()
        .append('g')
        .attr('id', (d, i) => `mountain${i + 1}`)
        .each(function (p, i) {
          d3.select(this)
            .selectAll('rect')
            .data((d) => d.grids)
            .enter()
            .append('rect')
            .classed("oreum-grid", true)
            .attr('x', (d) => (p.centerPos[1] + d.x - d.size / 2) * gridInfo[level].size + 300)
            .attr('y', (d) => (p.centerPos[0] + d.y - d.size / 2) * gridInfo[level].size + 150)
            .attr('width', (d) => d.size * gridInfo[level].size)
            .attr('height', (d) => d.size * gridInfo[level].size)
            //.attr('fill', () => {
            //  let color = '#' + Math.floor(Math.random() * Math.pow(2, 32) ^ 0xffffff).toString(16).substr(-6);
            //  return color;
            //})
            .attr('fill', (d) => `url(#${d.id})`)
            .on('click', (e, d) => detailClicked(e, d));

        });

      const top3Data = [ // need to initialize when searched
        {
          rank: 1,
          region: '애월읍',
          value: 309,
          clusterNumber: 2
        },
        {
          rank: 2,
          region: '서산면',
          value: 61,
          clusterNumber: 3
        }
        ,
        {
          rank: 3,
          region: '중문읍',
          value: 17,
          clusterNumber: 1
        }
      ];

      d3.selectAll('.tooltip').remove()

      const detailsPopUP = mountains
        .append('g')
        .attr('class', 'popup')
        .style("visibility", "hidden")
        .attr('x', "0")
        .attr('y', "0")
        .attr("width", popUpConfig.length)
        .attr("height", (popUpConfig.length / 10) * 11)

      detailsPopUP
        .append("rect")
        .attr('x', "0")
        .attr('y', "0")
        .attr("width", popUpConfig.length)
        .attr("height", popUpConfig.length / 10)
        .attr('fill', '#ffffff')

      detailsPopUP.append('text')
        .text('제주 서귀포시 안덕면 병악로 166          👍563')
        .attr('x', popUpConfig.length / 2)
        .attr('y', popUpConfig.length / 20)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', "central")
        .attr('fill', 'black')
        .attr('font-size', popUpConfig.fontSize)

      detailsPopUP
        .append('a')
        .attr('xlink:href', 'https://www.instagram.com/')
        .append("svg:image")
        .attr('x', "0")
        .attr('y', popUpConfig.length / 10)
        .attr("width", popUpConfig.length)
        .attr("height", popUpConfig.length)
        .attr('xlink:href', 'http://jetprogramme.org/wp-content/uploads/2017/03/Square-Instagram-Logo.png')


      function zoomed({transform}) {
        const zoomState = d3.zoomTransform(svg.node());
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

      function brushStart() {
        tooltip.style("visibility", "hidden");

        if (d3.brushSelection(this)[0][0] == d3.brushSelection(this)[1][0]) {
          d3.selectAll('.spatial-brush').raise();
          mountains
            .selectAll('.oreum-grid')
            .classed("brushed", false);
        }
      }

      function isBrushed(rect, selection) {
        let width = +rect.attr("width");
        let height = +rect.attr("height");
        let mid_x = width / 2 + Number(rect.attr("x"));
        let mid_y = height / 2 + Number(rect.attr("y"));
        if (
          mid_x >= selection[0][0] - width / 2 &&
          mid_x <= selection[1][0] + width / 2 &&
          mid_y >= selection[0][1] - height / 2 &&
          mid_y <= selection[1][1] + height / 2
        ) {
          //TODO: change each data with spatial-selected class
          rect.classed("brushed", true);
          return true;
        }
        //TODO: change each data with spatial-non-selected class
        rect.classed("brushed", false);
        return false;
      }

      function brushed() {
        let selection = d3.brushSelection(this); // selection 범위를 반올림해서 면적 넓히면 제대로 겹칠듯

        mountains.selectAll('.oreum-grid').each(function (d, i) {
          let rect = d3.select(this);
          rect.attr("stroke", isBrushed(rect, selection) ? 'red' : 'none')
        });
      }

      function brushEnd(e) {
        let counts = 0;
        counts = mountains.selectAll('.brushed').size()
        let selection_box = d3.selectAll('.spatial-brush > .selection')

        if (mountains.selectAll('.brushed').size() > 0) {
          tooltip.selectAll('text').text(counts)
          return tooltip
            .attr("transform", "translate(" + selection_box.attr("x") + "," + (+selection_box.attr("y") - tooltipConfig.height) + ")")
            .style("visibility", "visible")
        }
        return tooltip
          .style("visibility", "hidden")
      }

      function detailClicked(e, data) {
        let rect = e.currentTarget;
        // rect 변화 주기 // 해당 사각형 선택된 표시로 바꾸기 // brightness를 조절해야함 나중에

        // data 가져오기
        console.log(data)

        // 사진, 주소, 좋아요, url 수정
        detailsPopUP
          .select('text')
          .text('서귀포, 대한민국 👍563') // 주소 + 좋아요 로 수정
        detailsPopUP
          .select('a')
          .attr('xlink:href', 'https://www.instagram.com/p/CISn7CPn02Z/')
          .select('image')
          .attr('xlink:href', 'https://cdn.shopify.com/s/files/1/1206/7736/products/WMPeonyPinkFlowers0781Square_1080x.jpg?v=1586743131')

        return detailsPopUP.attr("transform", "translate(" + d3.pointer(e)[0] + "," + d3.pointer(e)[1] + ")")
          .style("visibility", "visible")
      }

      svg.call(
        d3.zoom()
          .extent([[0, 0], [w, h]])
          .scaleExtent([1, 60])
          .on("zoom", zoomed),
        d3.zoomIdentity
          .scale(gridInfo[level].start * 2)
      )

      const brush = d3.brush()
        .filter(event => event.ctrlKey)
        .on("start", brushStart)
        .on("brush", brushed)
        .on("end", e => brushEnd(e));

      mountains.append("g")
        .attr("class", `spatial-brush`)
        .call(brush)

      const tooltip = d3.select(".spatial-brush")
        .append('g')
        .attr('class', 'tooltip')
        .style("visibility", "hidden")

      tooltip
        .append("rect")
        .attr('x', "0")
        .attr('y', "0")
        .attr("width", tooltipConfig.width)
        .attr("height", tooltipConfig.height)
        .attr('fill', 'lightgray')

      tooltip.append('text')
        .text('hi')
        .attr('x', tooltipConfig.width / 2)
        .attr('y', tooltipConfig.height / 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', "central")
        .attr('fill', 'black')
        .attr('font-size', tooltipConfig.fontSize)


      //.on('click',e=>resetBrush(e))

      function resetBrush(e) {
        //d3.brush().clear;
        //d3.select(this).call(brush.move,null);

        if (e.srcElement.classList[0] !== "oreum-grid") {
          detailsPopUP.style('visibility', 'hidden');
        }

        if (!(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
          d3.selectAll('.spatial-brush').lower();

          // selection 을 0으로 만들면 될듯
          //selection = e.selection
          //d3.selectAll('#spatial-brush').call(brush.move, null);
          //d3.selectAll('.spatial-brush').call(brush.clear);
        }

      }

      svg.on('click', resetBrush)

      const top3BarChart = svg
        .append('g')
        .attr('id', 'top3')
        .attr('transform', 'translate(10,0)')

      const bars = top3BarChart
        .selectAll('g')
        .data(top3Data)
        .join('g')
        .attr('transform', d => `translate(0,${10 + (d.rank - 1) * 50})`)
        .on('mouseover', highlightMountain)
        .on('mouseout', dehighlightMountain)
        .on('click', brushMountain)

      bars
        .append('rect')
        .classed('top3-bar', true)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', d => d.value)
        .attr('height', 30)

      bars
        .append('text')
        .classed('top3-text', true)
        .text(d => d.region)
        .attr('x', d => d.value + 5)
        .attr('y', 15)
        .attr('fill', '#000000')
        .attr('font-size', 25)
        .attr('alignment-baseline', "central")

      function highlightMountain() {
        let hoveredGroup = d3.select(this)
        let clusterNum = hoveredGroup.data()[0].clusterNumber;

        let top3 = top3BarChart
          .selectAll('g')

        top3.selectAll('.top3-bar,.top3-text')
          .classed('unhovered', true);

        hoveredGroup
          .transition()
          .delay(1000)
          .call(function () {
            hoveredGroup
              .selectAll('.top3-bar,.top3-text')
              .classed('unhovered', false)
              .classed('hovered', true);

            // Mountain 하이라이트
            mountains
              .select(`#mountain${clusterNum}`)
              .selectAll('.oreum-grid')
              .classed('highlighted', true)
          })


      }

      function handleMouseOver() {
        let text = d3.select(this);
        text
          .transition()
          .duration(200)
          .ease(d3.easeLinear)
          .style('font-size', d => {
            return (d.size + 3) + 'px'
          })
          .attr("font-weight", "bold")
          .attr("fill", d => d3.rgb(color(Math.log(d.fill) / 3)).darker(2));
      }

      function handleMouseOut() {
        let text = d3.select(this);
        text
          .style('font-size', d => {
            return (d.size) + 'px'
          })
          .attr("fill", d => color(Math.log(d.fill) / 3));
      }

      function handleClick() {
        let text = d3.select(this)
        console.log(text.text());
        text.classed('word-selected', !text.classed('word-selected'))
      };

      function dehighlightMountain() {
        let hoveredGroup = d3.select(this)
        let clusterNum = hoveredGroup.data()[0].clusterNumber;

        let top3 = top3BarChart
          .selectAll('g')

        top3.selectAll('.top3-bar,.top3-text')
          .classed('unhovered', false);

        hoveredGroup
          .selectAll('.top3-bar,.top3-text')
          .classed('hovered', false)
          .transition()
          .delay(1000)
          .call(function () { // Mountain de하이라이트
            mountains
              .select(`#mountain${clusterNum}`)
              .selectAll('.oreum-grid')
              .classed('highlighted', false)
          })

      }

      function brushMountain() {
        let selectedGroup = d3.select(this)
        let left = top3BarChart.selectAll('g').filter(d => d.rank !== selectedGroup.data()[0].rank)
        selectedGroup.classed('selected', !selectedGroup.classed('selected'))

        selectedGroup
          .transition()
          .delay(1000)
          .call(function () {
            if (selectedGroup.classed('selected')) {
              left
                .classed('selected', false)
                .selectAll('.top3-bar,.top3-text')
                .classed('selected', false)
            }

            selectedGroup
              .selectAll('.top3-bar,.top3-text')
              .classed('selected', selectedGroup.classed('selected'))
          })

      }

      const wordCloud = svg
        .append('g')
        .style('background-color', 'white')
        .attr('id', 'wordCloud')
        .attr('transform', `translate(${w - rightConfig.w},0)`);

      wordCloud
        .append('rect')
        .attr('width', rightConfig.w)
        .attr('height', rightConfig.h)
        .attr('fill', 'white');

      let color = d3.scaleSequential(d3.interpolateSpectral); //d3.scaleSequential(d3.interpolateRainbow)

      let wordSeed
      let bannedWords = ['제주도', '제주', 'jeju', '광고', 'jejudo', 'JEJU'];
      console.log(hashtags)
      if (hashtags) {
        wordSeed = Object.keys(hashtags).filter(d => !bannedWords.includes(d)).map(d => ({
          text: d,
          size: hashtags[d],
          fill: hashtags[d]

        }))

        console.log(wordSeed);

        makecloud(wordSeed.filter(d => d.size).sort((a, b) => b.size - a.size));
      }

      function makecloud(words) {
        console.log(words.length);
        let mycloud = d3.select('#wordCloud');

        var layout = cloud()
          .size([rightConfig.w, rightConfig.h])
          .words(words)
          .padding(3)
          .rotate(d => ~~(Math.random() * 1) * 90)
          .font("Nanum Gothic")
          .fontSize(d => 20 * Math.log(d.size))
          .on("end", draw);

        layout.start();

        function draw(words) {
          mycloud
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr(
              "transform",
              "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
            )
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Nanum Gothic")
            .attr("text-anchor", "middle")
            .attr("transform", d => {
              return `translate(${[d.x, d.y]})rotate(${d.rotate})`
            })
            .attr("fill", d => color(Math.log(d.fill) / 3))
            .text(d => d.text)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);
        }

        return mycloud;
      }

      const minimap = svg
        .append('g')
        .attr('id', 'minimap')
        .attr('transform', `translate(${w - rightConfig.w},${h - rightConfig.h})`)


      minimap
        .append('image')
        .attr('xlink:href', process.env.PUBLIC_URL + 'minimap-background.png')
        .attr('width', rightConfig.w)
        .attr('height', rightConfig.h)

      const mBrush = d3
        .brush()
        .extent([[0, 0], [rightConfig.w, rightConfig.h]])
        .on('brush', onPrevBrush);

      const minimapBrush = minimap
        .append('g')
        .attr('id','#minimap-brush')
        .call(mBrush)

      mBrush.move(minimapBrush, [
      [0, 0],
      [
        rightConfig.w,
        rightConfig.h
      ]
    ]);

      function onPrevBrush(){
        return 0;
      }

    }

    drawMap();
  }, [level, props.instaData]);

  const svg = d3.select('#SummaryView');
  svg
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "red")
    .attr("viewBox", `0 0 500 500`)
    .classed("svg-content", true)
    .selectAll('*').remove();

  return (
    <div>
      <div className="Atlas">
        <svg id="mapCanvas"/>
      </div>
    </div>
  );
}

export default Atlas;
