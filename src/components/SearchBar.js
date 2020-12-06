import React, { useState } from 'react';
import * as axios from 'axios';
import './SearchBar.css';

function SearchBar(props) {
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
    const [items, setItems] = useState([])
    const [negItems, setNegItems] = useState([])

    async function fetchData(include, exclude) {
      const { data } = await axios.get('http://147.46.242.161:10000/search', {
        crossdomain: true,
        params: { include, exclude }
      });
      props.setInstaData(data);
    }

    const handleKeyDown = (event) => {
      console.log(value)
      if(['Enter', 'Tab', ',', ';'].includes(event.key)){
        event.preventDefault()

        let val = value.trim()

        if(val && isValid(val)) {
          if (val.charAt(0) == '-'){
            val = val.slice(1, val.length).trim()
            fetchData(items, [...negItems, val]);
            setNegItems([...negItems, val]);
          }
          else {
            fetchData(items, [...negItems, val]);
            setItems([...items, val]);
          }
          setValue("");
        }
      }
    }

    const handleChange = (event) => {
        setValue(event.target.value)
        setError(null)
    }

    const handleDelete = (item) => {
      const newItems = items.filter(i => i !== item);
      fetchData(newItems, negItems);
      setItems(newItems);
    }

    const handleNegDelete = (item) => {
      const newNegItems = negItems.filter(i => i !== item);
      fetchData(items, newNegItems);
      setNegItems(newNegItems);
    }

    const handlePaste = (event) => {
        event.preventDefault();

        let paste = event.clipboardData.getData('text')
        if (paste.charAt(0) == '-'){
          const newNegItems = [...negItems, paste];
          fetchData(items, newNegItems);
          setNegItems(newNegItems);
        }
        else {
          const newItems = [...items, ...paste];
          fetchData(newItems, negItems);
          setItems(newItems);
        }
    }

    const isValid = (item) => {
        let err = null

        if (items.includes(item)) {
            err = `${item} has already been added.`;
        }

        if (negItems.includes(item)) {
            err = `${item} has already been added.`;
        }

        if (err){
            setError(err)
            return false
        }

        return true

    }

    return(
        <div>
            {items.map(item => (
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

            {negItems.map(negItem => (
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

            <input
            className={"input " + (error && " has-error")}
            value={value}
            placeholder="Type search tags"
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            onPaste={handlePaste}
            />

        {error && <p className="error">{error}</p>}

        </div>
    )
}

export default SearchBar;
