const fs = require('fs');
const d3 = require('d3');

function geojson2array(geojson, gridMultiplier) {
  const distance = 0.00944 / gridMultiplier;

  const coords = geojson.features.map((f) => {
    let latAvg = 0;
    let lonAvg = 0;
    for (let i = 0; i < 4; i += 1) {
      lonAvg += f.geometry.coordinates[0][i][0] / 4;
      latAvg += f.geometry.coordinates[0][i][1] / 4;
    }

    const projection = d3.geoMercator()
      .translate([0, 0])
      .center([126.25, 34.12])
      .rotate([0, 0, 0.65])
      .scale(50);
    const [ x, y ] = projection([lonAvg, latAvg]);
    return {
      coord: { lon: lonAvg, lat: latAvg },
      point: [x, y]
    }
  });
  /* Filter out unnecessary regions (except the main island) */
  const onlyJeju = coords.filter((c) => c.point[0] >= 0 && c.point[1] >= 0 );

  // Calculate min and max
  const xs = onlyJeju.map((d) => d.point[0]);
  const ys = onlyJeju.map((d) => d.point[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const cols = Math.round((xMax - xMin) / distance) + 1;
  const rows = Math.round((yMax - yMin) / distance) + 1;

  function getIndex(x, y) {
    return [
      Math.round((y - yMin) / (yMax - yMin) * (rows - 1)),
      Math.round((x - xMin) / (xMax - xMin) * (cols - 1))
    ]
  }

  function getRawIndex(x, y) {
    return [
      ((y - yMin) / (yMax - yMin) * (rows - 1)),
      ((x - xMin) / (xMax - xMin) * (cols - 1))
    ]
  }

  const dataArray = [];
  for (let i = 0; i < rows; i++) {
    dataArray.push(new Array(cols));
  }

  onlyJeju.forEach((d) => {
    [ row, col ] = getIndex( ...d.point );
    if (!dataArray[row][col]) {
      d.index = [ row, col ];
      dataArray[row][col] = d;
    } else {
      console.log('Error: Two point collides!', row, col, dataArray[row][col], d);
      console.log(getRawIndex(...dataArray[row][col].point));
      console.log(getRawIndex(...d.point));
      process.exit(1);
    }
  })


  return {
    rows,
    cols,
    array: [].concat( ...dataArray).filter(d => d),
    matrix: dataArray
  };
}

args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node geojson2array <num_grid> <geojson_file_to_convert> <new_file_name>');
  console.log('Supported values for num_grid: 1x, 2x, 4x');
  process.exit(1);
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
  process.exit(1);
}

console.log(`Converting ${args[1]} to ${args[2]}`);
datastr = fs.readFileSync(args[1], { encoding: 'utf-8', flag: 'r' });
geo = JSON.parse(datastr);

const data = geojson2array(geo, num_grid);

fs.writeFileSync(args[2], JSON.stringify(data));
