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
        var tamraMap = d3.json("https://raw.githubusercontent.com/Edw2n/geojson-prac/master/tamra-grid.geojson", function (data){
            console.log(data);
        });

        Promise.all([tamraMap]).then(function (values) {
            // draw map
            svg.selectAll("path")
                .data(values[0].features)
                .enter()
                .append("path")
                .attr("class", "tamra")
                .attr("d", path)
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
