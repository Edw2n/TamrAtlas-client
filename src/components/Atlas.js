import React from 'react';
import * as d3 from 'd3';
import './Atlas.css';

function Atlas() {
    React.useEffect(() => {
        // TODO draw the map using d3
        var w = 2000;
        var h = 2000;

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

        // load data
        var tamraMap = d3.json("https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-square-vanilla.geojson", function (data) {
            console.log(data);
        });

        Promise.all([tamraMap]).then(function (values) {
            // draw map
            svg.append("defs")
                .append("pattern")
                .attr("id", "bg")
                .attr("width","100%")
                .attr('height',"100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                .attr("height","1") // value is ratio : "image height /pattern height"
                .attr("width","1") // value is ratio : "image widht /pattern width"
                .attr("xlink:href", // use square size image
                    "https://previews.123rf.com/images/taratata/taratata1711/taratata171100020/89494129-%EC%88%98%EA%B5%AD-%EC%88%98%EA%B5%AD-%EA%B1%B0%EB%AF%B8-%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B3%B4%EB%9D%BC%EC%83%89-%EC%88%98-%EA%B5%AD-%EA%BD%83-%EA%B7%BC%EC%A0%91%EC%9E%85%EB%8B%88%EB%8B%A4-%EA%BD%83%EC%A7%91%EC%97%90-%EC%84%A0%EB%B0%98%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%8F%89%EB%A9%B4%EB%8F%84-.jpg");

            svg.selectAll("path")
                .data(values[0].features)
                .enter()
                .append("path")
                .attr("class", "tamra")
                .attr("d", path)
                .style('fill', "url(#bg)");

        });
    });

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
