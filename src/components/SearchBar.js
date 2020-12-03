import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar(props) {
    const [value, setValue] = useState('')
    // const [negItems, setNegItems] = useState([])
    const [error, setError] = useState(null)
    // const [items, setItems] = useState([])

    // useEffect (() => {
    //     console.log(props);
    // })

    const handleKeyDown = (event) => {
        console.log(value)
        if(['Enter', 'Tab', ',', ';'].includes(event.key)){
            event.preventDefault()

            let val = value.trim()

            if(val && isValid(val)) {
                if (val.charAt(0) == '-'){
                    val = val.slice(1, val.length).trim()
                    props.setNegItems([...props.negItems, val])
                }
                else {
                    props.setItems([...props.items, val])
                }
                setValue("")
            }
            
        }
    }

    const handleChange = (event) => {
        setValue(event.target.value)
        setError(null)
    }

    const handleDelete = (item) => {
        props.setItems(props.items.filter(i => i !== item))
    }

    const handleNegDelete = (item) => {
        props.setNegItems(props.negItems.filter(i => i !== item))
    }

    const handlePaste = (event) => {
        event.preventDefault();

        let paste = event.clipboardData.getData('text')
        if (paste.charAt(0) == '-'){
            props.setNegItems([...props.negItems, paste])
        }
        else {
            props.setItems([...props.items, ...paste])
        }
    }

    const isValid = (item) => {
        let err = null

        if (props.items.includes(item)) {
            err = `${item} has already been added.`;
        }

        if (props.negItems.includes(item)) {
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