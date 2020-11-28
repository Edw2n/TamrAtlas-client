const fs = require('fs');
const d3 = require('d3');

function geojson2data(geojson, num_grid) {
  const threshold = {
    same: 0.0001,
    adjacent: 0.01 / num_grid
  };

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
        && Math.abs(element.point[0] - d.point[0]) < threshold.same
        && d.point[1] > element.point[1]
        && d.point[1] - element.point[1] < threshold.adjacent;
    });

    const bottomIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[0] - d.point[0]) < threshold.same
        && d.point[1] < element.point[1]
        && element.point[1] - d.point[1] < threshold.adjacent;
    });

    const leftIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[1] - d.point[1]) < threshold.same
        && d.point[0] > element.point[0]
        && d.point[0] - element.point[0] < threshold.adjacent;
    });

    const rightIndex = onlyJeju.findIndex((element, j) => {
      return i !== j
        && Math.abs(element.point[1] - d.point[1]) < threshold.same
        && d.point[0] < element.point[0]
        && element.point[0] - d.point[0] < threshold.adjacent;
    });

    d.top = topIndex < 0 ? undefined : topIndex;
    d.bottom = bottomIndex < 0 ? undefined : bottomIndex;
    d.left = leftIndex < 0 ? undefined : leftIndex;
    d.right = rightIndex < 0 ? undefined : rightIndex;
  });
  return onlyJeju;
}

args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node convert_map <num_grid> <geojson_file_to_convert> <new_file_name>');
  console.log('Supported values for num_grid: 1x, 2x, 4x');
  process.exit(1)
}

let num_grid;
if (args[0] === '1x') {
  num_grid = 1;
} else if (args[0] === '2x') {
  num_grid = 2;
} else if (args[0] === '4x') {
  num_grid = 4;
} else {
  console.log('Unsuppored value. Supported values for num_grid: 1x, 2x, 4x');
  process.exit(1)
}

console.log(`Converting ${args[1]} to ${args[2]}`);
datastr = fs.readFileSync(args[1], { encoding: 'utf-8', flag: 'r' });
geo = JSON.parse(datastr);

const data = geojson2data(geo, num_grid);

fs.writeFileSync(args[2], JSON.stringify(data));
