import React, {useState} from 'react';
import * as d3 from 'd3';
import './Atlas.css';


function Atlas() {
    let w = 2000;
    let h = 2000;

    async function makeGridInfo(geojson, imgUrl, start, end, next, prev) {
        let info = {
            grid: await d3.json(geojson),
            fill: imgUrl,
            start: start,
            end: end,
            prev: prev,
            next: next
        };

        return info;
    }

    let gridInfo;
    const [level, setGrids] = useState(['vanila']);

    React.useEffect(() => {
        async function drawMap() {
            // TODO draw the map using d3
            if (!gridInfo) {
                gridInfo = {
                    'vanila': await makeGridInfo(
                        "https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-square-vanilla.geojson",
                        "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg",
                        1,
                        3,
                        'half',
                        'none'
                    ),
                    'half': await makeGridInfo(
                        "https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-square-half.geojson",
                        "https://lh3.googleusercontent.com/proxy/5bAQCC1wqCWuLDk6g70SEWUEoqC1Pec7fc3pGEFSVQx3iGOy0VHQYZlyOkAVclYwSt3cU1OkPvBavHZU-isNQMrHebWwoUkagcld531HIn4y96HmVYhhVvOKnd8",
                        3,
                        5,
                        'quarter',
                        'vanila'
                    ),
                    'quarter': await makeGridInfo(
                        "https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-square-quarter.geojson",
                        "https://image.yes24.com/blogimage/blog/k/s/kse10034/5a33xTQt.jpg",
                        5,
                        80,
                        'none',
                        'half'
                    )
                };
            }

            const svg = d3.select('#mapCanvas');
            svg
                .attr("preserveAspectRatio", "xMinYMin meet")
                .style("background-color", "#c9e8fd")
                .attr("viewBox", "0 0 " + w + " " + h)
                .classed("svg-content", true);

            var projection = d3.geoMercator()
                .translate([0, 0])
                .scale(90000)
                .center([125.8, 34.1]);
            var path = d3.geoPath().projection(projection);

            console.log(gridInfo);
            console.log(level[0]);
            var tamraMap = gridInfo[level].grid;
            console.log(tamraMap);
            Promise.all([tamraMap]).then(function (values) {
                // draw map
                svg.append("defs")
                    .append("pattern")
                    .attr("id", `${level}`)
                    .attr("width", "100%")
                    .attr('height', "100%")
                    .attr("patternContentUnits", "objectBoundingBox")
                    .append("image")
                    .attr("height", "1") // value is ratio : "image height /pattern height"
                    .attr("width", "1") // value is ratio : "image widht /pattern width"
                    .attr("xlink:href", // use square size image
                        gridInfo[level].fill);

                svg.selectAll('g').remove();
                var geo = svg.append('g');
                geo.selectAll("path")
                    .data(values[0].features)
                    .enter()
                    .append("path")
                    .attr("class", "tamra")
                    .attr("d", path)
                    .style('fill', `url(#${level})`);

                svg.call(d3.zoom()
                    .scaleExtent([1, 60])
                    .on("zoom", zoomed));

                function zoomed({transform}) {
                    console.log('zoom')
                    const zoomState = d3.zoomTransform(svg.node());
                    console.log(zoomState.k)
                    if (zoomState.k > gridInfo[level].end) {
                        setGrids(gridInfo[level].next)
                        console.log('scale up')
                    } else if (zoomState.k < gridInfo[level].start) {
                        setGrids(gridInfo[level].prev)
                        console.log('scale down')
                    } else
                    geo.attr("transform", transform)
                }

            });
        }

        drawMap();

    }, [level, gridInfo, h, w]);

    return (
        <div>
            <h1>Welcome to the Fantastic TamrAtlas 😎</h1>
            <div>
                <svg id="mapCanvas"/>
            </div>
        </div>
    );
}

export default Atlas;
