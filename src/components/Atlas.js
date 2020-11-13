import React from 'react';
import * as d3 from 'd3';
import './Atlas.css';

function Atlas() {
  React.useEffect(() => {
    // TODO draw the map using d3
    const svg = d3.select('#mapCanvas');
    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 100)
      .attr('height', 100)
      .attr('fill', 'blue');
  });

  return (
    <div>
      Hello I'm a map! :)
      <div>
        <svg id="mapCanvas" />
      </div>
    </div>
  );
}

export default Atlas;
