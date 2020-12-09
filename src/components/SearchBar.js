import React, { useState } from 'react';
import * as axios from 'axios';
import './SearchBar.css';
import { Box, Heading } from 'grommet';
import { Instagram } from 'grommet-icons'

function SearchBar(props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  // const [props.items, props.setItems] = useState([])
  // const [props.negItems, props.setNegItems] = useState([])

  async function fetchData(include, exclude) {
    const { data } = await axios.get('http://147.46.242.161:10000/search', {
      crossdomain: true,
      params: { include, exclude }
    });
    props.setInstaData(data);
  }

  const handleKeyDown = (event) => {
    if (event.defaultPrevented) {
      // console.log('prevented')
      return; // Do nothing if the event was already processed
    }
    console.log(value)
    if (['Enter', 'Tab', ',', ';'].includes(event.key)) {
      event.preventDefault()

      let val = value.trim()

      // console.log(event)
      // console.log(val)

      if (val && isValid(val)) {
        setValue("");
        if (val.charAt(0) == '-') {
          val = val.slice(1, val.length).trim()
          fetchData(props.items, [...props.negItems, val]);
          props.setNegItems([...props.negItems, val]);
        }
        else {
          fetchData([...props.items, val], props.negItems);
          props.setItems([...props.items, val]);
        }
      }
    }
  }

  const handleChange = (event) => {
    setValue(event.target.value)
    setError(null)
  }

  const handleDelete = (item) => {
    const newItems = props.items.filter(i => i !== item);
    fetchData(newItems, props.negItems);
    props.setItems(newItems);
  }

  const handleNegDelete = (item) => {
    const newNegItems = props.negItems.filter(i => i !== item);
    fetchData(props.items, newNegItems);
    props.setNegItems(newNegItems);
  }

  const handlePaste = (event) => {
    event.preventDefault();

    let paste = event.clipboardData.getData('text')
    if (paste.charAt(0) == '-') {
      const newNegItems = [...props.negItems, paste];
      fetchData(props.items, newNegItems);
      props.setNegItems(newNegItems);
    }
    else {
      const newItems = [...props.items, ...paste];
      fetchData(newItems, props.negItems);
      props.setItems(newItems);
    }
  }

  const isValid = (item) => {
    let err = null

    if (props.items.includes(item)) {
      err = `${item} has already been added.`;
    }
    if (item.charAt(0) == '-') {
      let sliced = item.slice(1, item.length).trim()
      if (props.negItems.includes(sliced)) {
        err = `${sliced} has already been added.`;
      }
    }


    if (err) {
      setError(err)
      return false
    }

    return true

  }

  return (
    <div>
      <Box direction='row' pad='medium'>
        <Box margin={{ top: 'xsmall', right: 'xsmall' }}>
          <Instagram color='plain' style={{ 'padding-top': '5px' }} />
        </Box>
        <Heading level='3' margin='xsmall'>TamrAtlas</Heading>

        <Box margin={{ left: 'medium' }} style={{ width: '45%' }}>
          <input
            className={"input " + (error && " has-error")}
            value={value}
            placeholder="Type search tags"
            onKeyPress={handleKeyDown}
            onChange={handleChange}
            onPaste={handlePaste}
          />
        </Box>

        <Box margin={{ left: 'medium', top: 'xsmall' }} direction='row'>
          {props.items.map(item => (
            <div className="tag-item" key={item}>
              {item}
              <button
                type="button"
                className="button"
                onClick={() => handleDelete(item)}
              >
                &times;
                </button>
            </div>
          ))}
        </Box>


        <Box margin='xsmall' direction='row'>
          {props.negItems.map(negItem => (
            <div className="tag-item-neg" key={negItem}>
              {negItem}
              <button
                type="button"
                className="button"
                onClick={() => handleNegDelete(negItem)}
              >
                &times;
                </button>
            </div>
          ))}
        </Box>
      </Box>
      {error &&
      <Box margin={{ bottom: 'medium' }}>
        {<p className="error">{error}</p>}
      </Box>}

    </div>
  )
}

export default SearchBar;
