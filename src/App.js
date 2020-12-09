import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import Atlas from './components/Atlas';
import SearchBar from './components/SearchBar'
import BrushableBar from './components/BrushableBar'
import './App.css';
import axios from 'axios';
import { Box, Button } from 'grommet';
import * as d3 from 'd3';
import { Filter } from 'grommet-icons';

function App() {
  const [instaData, setInstaData] = useState([]);
  const [level, setGrids] = useState(['vanila'])
  const [monthData, setMonthData] = useState([])
  const [monthDataReady, setMonthDataReady] = useState(false)
  const [timeData, setTimeData] = useState([])
  const [timeDataReady, setTimeDataReady] = useState(false)
  const [monthFrom, setMonthFrom] = useState(0);
  const [monthTo, setMonthTo] = useState(0);
  const [timeFrom, setTimeFrom] = useState(0);
  const [timeTo, setTimeTo] = useState(0);
  const [initData, setInitData] = useState(null);
  const [items, setItems] = useState([])
  const [negItems, setNegItems] = useState([])
  const [filteredData, setFilteredData] = useState(null)

  // let data = null;
  // async function fetchData() {
  //     data  = await axios.get('http://147.46.242.161:10000/search', {
  //     crossdomain: true,
  //     // params: { include, exclude }
  //   });
  //   console.log(data)
  // }

  async function fetchData(include, exclude, monthFrom, monthTo, timeFrom, timeTo) {
    const { data } = await axios.get('http://147.46.242.161:10000/search', {
      crossdomain: true,
      params: {
        include,
        exclude,
        start_date: monthFrom.yearRaw ? monthFrom.yearRaw+'-'+monthFrom.monthRaw.toString().padStart(2, '0')+'-'+'01' : '2018-01-01',
        end_date: monthTo.yearRaw ? monthTo.yearRaw+'-'+monthTo.monthRaw.toString().padStart(2, '0')+'-'+'30' : '2020-11-30',
        start_hour: timeFrom.hourRaw ? timeFrom.hourRaw : 0,
        end_hour: timeTo.hourRaw ? timeTo.hourRaw : 23
      }
    });
    
    console.log(monthFrom, monthTo)
    setFilteredData(data);
  }

  function brushEndFetch() {
    console.log("brush end fetch")
    if(items.length >= 1 || negItems.length >= 1){
      console.log("valid brush end fetch")
      console.log(monthFrom)
      console.log(monthTo)
      console.log(timeFrom)
      console.log(timeTo)
      fetchData([...items], [...negItems], monthFrom, monthTo, timeFrom, timeTo)
    }
  }

  // fetchData()

  useEffect(() => {
    setMonthDataReady(false);
    setTimeDataReady(false);
    axios.get('http://147.46.242.161:10000/search', {
      crossdomain: true
    })
      .then((response) => {
        console.log(response.data)
        setInitData(response.data)
        let data = [];
        let parseMonth = d3.timeParse("%m %Y")
        response.data.periods.forEach((item, index) => {
          let datum = {};
          datum.date = parseMonth(`${item.month} ${item.year}`);
          datum.monthRaw = item.month
          datum.yearRaw = item.year
          datum.value = item.count
          datum.color = item.dominant_color ? item.dominant_color : '#FFFFFF'
          data.push(datum)
        })

        setMonthData(data);
        setMonthDataReady(true);
        let color = ['#E37567', '#C2D15B', '#3A5487']
        let hourData = []
        let parseHour = d3.timeParse("%H")

        response.data.hours.forEach((item, index) => {
          let datum = {};
          datum.date = parseHour(item.hour);
          datum.hourRaw = item.hour;
          datum.value = item.count;
          datum.color = color[index % 3]
          hourData.push(datum)
        })

        setTimeData(hourData);
        setTimeDataReady(true);

      })
  }, [])

  useEffect(() => {
    if (instaData.periods) {
      setMonthDataReady(false);
      setTimeDataReady(false);
      setMonthData(null);

      let data = [];
      let parseMonth = d3.timeParse("%m %Y")
      instaData.periods.forEach((item, index) => {
        let datum = {};
        datum.date = parseMonth(`${item.month} ${item.year}`);
        datum.monthRaw = item.month
        datum.yearRaw = item.year
        datum.value = item.count
        datum.color = item.dominant_color ? item.dominant_color : '#FFFFFF'
        data.push(datum)
      })

      console.log(monthData)

      setMonthData(data);
      setMonthDataReady(true);
      setTimeData(null);

      let color = [
        '#001322', '#012459', '#003972', '#004372', '#011d34', '#016792', '#07729f', '#12a1c1', '#74d4cc', '#efeebc', '#fee154', '#fdc352', '#ffac6f',
        '#fda65a', '#fd9e58', '#f18448', '#f06b7e', '#ca5a92', '#5b2c83', '#371a79', '#28166b', '#192861',  '#012459', '#040b3c'
      ]
      let hourData = []
      let parseHour = d3.timeParse("%H")

      instaData.hours.forEach((item, index) => {
        let datum = {};
        datum.date = parseHour(item.hour);
        datum.hourRaw = item.hour;
        datum.value = item.count;
        datum.color = color[index]
        hourData.push(datum)
      })

      console.log(hourData)

      setTimeData(hourData);
      setTimeDataReady(true);
    }

  }, [instaData])

  return (
    <div className="App">
      <SearchBar setInstaData={setInstaData} items={items} negItems={negItems} setItems={setItems} setNegItems={setNegItems}/>
      {/* <button onClick={() => console.log(monthFrom.yearRaw+'-'+monthFrom.monthRaw.padStart(2, '0')+'-'+'01', monthTo)}>Month</button>
      <button onClick={() => console.log(timeFrom, timeTo)}>Time</button>
      <button onClick={() => console.log(instaData)}>Print Data</button> */}

      <Box direction='row' pad='medium' justify='center'>
        {monthDataReady ? <BrushableBar data={monthData} type='month' from={monthFrom} to={monthTo} setFrom={setMonthFrom} setTo={setMonthTo} /> : null}
        {timeDataReady ? <BrushableBar data={timeData} type='time' from={timeFrom} to={timeTo} setFrom={setTimeFrom} setTo={setTimeTo} /> : null}
        {timeDataReady && monthDataReady ? <Button onClick={brushEndFetch} icon={<Filter/>} label='Filter' color='orange'/> : null}
      </Box>
      
      <Atlas instaData={filteredData?filteredData:instaData}  level={level} setGrids={setGrids} />
    </div>
  );
}

export default App;
