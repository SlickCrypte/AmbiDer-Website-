import "./FilterPanel.css";

import {
  FaFilter,
  FaTimes
} from "react-icons/fa";

function FilterPanel({

isOpen = true,

filters = {},

onChange,

onClear

}){

if(!isOpen) return null;

return(

<div className="filter-panel">

<div className="filter-header">

<h2>

<FaFilter/>

Filters

</h2>

<button

className="filter-clear"

onClick={onClear}

>

<FaTimes/>

Clear

</button>

</div>

<div className="filter-group">

<label>

Location

</label>

<input

type="text"

placeholder="Enter location"

value={filters.location || ""}

onChange={(e)=>

onChange("location",e.target.value)

}

/>

</div>

<div className="filter-group">

<label>

Experience

</label>

<select

value={filters.experience || ""}

onChange={(e)=>

onChange("experience",e.target.value)

}

>

<option value="">

All

</option>

<option value="Intern">

Intern

</option>

<option value="0-2 Years">

0-2 Years

</option>

<option value="2-5 Years">

2-5 Years

</option>

<option value="5+ Years">

5+ Years

</option>

</select>

</div>

<div className="filter-group">

<label>

Job Type

</label>

<select

value={filters.type || ""}

onChange={(e)=>

onChange("type",e.target.value)

}

>

<option value="">

All

</option>

<option value="Full Time">

Full Time

</option>

<option value="Part Time">

Part Time

</option>

<option value="Internship">

Internship

</option>

<option value="Remote">

Remote

</option>

</select>

</div>

</div>

);

}

export default FilterPanel;