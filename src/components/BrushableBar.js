import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './BrushableBar.css';

function BrushableBar(props) {
    const d3Container = useRef(null);

    useEffect(() => {
        let data = props.data;

        // console.log(data)

        // let color = ['#E37567', '#C2D15B', '#3A5487']

        // for (let i = 0; i < 12 * 3; i++) {
        //     let datum = {};
        //     datum.date = i + 1;
        //     datum.value = Math.floor(Math.random() * 100);
        //     datum.color = color[i % 3]
        //     data.push(datum);
        // }

        let margin = { top: 10, right: 10, bottom: 80, left: 40 },
            margin2 = { top: 130, right: 10, bottom: 20, left: 40 },
            width = 750 - margin.left - margin.right,
            height = 180 - margin.top - margin.bottom,
            height2 = 180 - margin2.top - margin2.bottom;

        let x = d3.scaleBand().range([0, width]).paddingInner(0.2),
            x2 = d3.scaleBand().range([0, width]).paddingInner(0.2),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]);

        let xAxis = d3.axisBottom(x),
            xAxis2 = d3.axisBottom(x2),//.tickValues([]),
            yAxis = d3.axisLeft(y);

        let brushedRange = [x2(d3.min(data, d => d.date)), x2(d3.max(data, d => d.value))];


        x.domain(data.map(d => { return d.date }));
        y.domain([0, d3.max(data, d => d.value)])
        x2.domain(x.domain());
        y2.domain(y.domain());

        let brush = d3.brushX()
            .extent([[x.range()[0], 0], [x.range()[1], height2]])
            .on("brush", brushed);

        d3.selectAll('.bar').selectAll('svg').remove('*')

        let svg = d3.select(".bar").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        let focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // console.log(x(data[0].date))
        enter(data)
        updateScale(data)

        let subBars = context.selectAll('.subBar')
            .data(data)

        subBars.enter().append("rect")
            .classed('subBar', true)
            .attr('height', d => height2 - y2(d.value))
            .attr('width', d => x.bandwidth())
            .attr('x', d => x2(d.date))
            .attr('y', d => y2(d.value))
            .style('fill', d => d.color)
            .style('opacity', 0.75)

        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "x brush")
            .attr('viewBox', [0, 0, width, height2])
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7)



        function brushed(event) {
            if (event.sourceEvent.typ === "brush") return;
            brushedRange = event.selection
            console.log(brushedRange)
            let selected = null;
            selected = x2.domain()
                .filter(function (d) {
                    return (event.selection[0] <= x2(d)) && (x2(d) <= event.selection[1]);
                });

            let start;
            let end;

            console.log(event.selection)

            if (brushedRange[0] != brushedRange[1]) {
                brushedRange[0] == 0 ? start = selected[0] - 1 : start = selected[0] - 2;
                end = selected[selected.length - 1];
            } else {
                start = 0;
                end = data.length;
            }

            // console.log(brush.extent()[1])

            let updatedData = data.slice(start, end);

            update(updatedData);
            enter(updatedData);
            exit(updatedData);
            updateScale(updatedData)

        }

        function updateScale(data) {
            let tickScale = d3.scalePow().range([data.length / 20, 0]).domain([data.length, 0]).exponent(.5)

            let brushValue = brushedRange[1] - brushedRange[0];
            if (brushValue === 0) {
                brushValue = width;
            }

            let tickValueMultiplier = Math.ceil(Math.abs(tickScale(brushValue)));
            // console.log(tickValueMultiplier)
            let filteredTickValues = data.filter(function (d, i) { return i % tickValueMultiplier === 0 }).map(function (d) { return d.date })
            // console.log(filteredTickValues)

            focus.select(".x.axis").call(xAxis.tickValues(filteredTickValues));
            focus.select(".y.axis").call(yAxis);
        }

        function update(data) {
            x.domain(data.map(function (d) { return d.date }));
            y.domain([0, d3.max(data, function (d) { return d.value; })]);

            let bars = focus.selectAll('.bar')
                .data(data)
            bars.attr('height', (d, i) => { return height - y(d.value) })
                .attr('width', (d) => { return x.bandwidth() })
                .attr('x', d => x(d.date))
                .attr('y', d => y(d.value))
                .attr('fill', d => d.color)
            // .style('opacity', 0)
            // .transition().duration(100)
            // .style('opacity', 1)
        }

        function exit(data) {
            let bars = focus.selectAll('.bar').data(data)
            bars.exit().remove() // .transition().duration(100)
        }

        function enter(data) {
            x.domain(data.map(function (d) { return d.date }));
            y.domain([0, d3.max(data, function (d) { return d.value; })]);

            let bars = focus.selectAll('.bar')
                .data(data)
            bars.enter().append("rect")
                .classed('bar', true)
                .attr('height', (d, i) => { return height - y(d.value) })
                .attr('width', (d) => { return x.bandwidth() })
                .attr('x', d => x(d.date))
                .attr('y', d => y(d.value))
                .attr('fill', d => d.color)
            // .transition().duration(500)
        }
    }, [d3Container.current, props.data])


    return (
        <div className='bar'></div>
    )
}

export default BrushableBar;