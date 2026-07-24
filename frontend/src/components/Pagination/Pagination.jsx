import "./Pagination.css";

import {
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

function Pagination({

currentPage = 1,

totalPages = 1,

onPageChange

}) {

const handlePrevious = () => {

if(currentPage > 1){

onPageChange(currentPage - 1);

}

};

const handleNext = () => {

if(currentPage < totalPages){

onPageChange(currentPage + 1);

}

};

return(

<div className="pagination">

<button

className="page-btn"

onClick={handlePrevious}

disabled={currentPage===1}

>

<FaChevronLeft/>

Previous

</button>

<div className="page-numbers">

{

Array.from(

{length:totalPages},

(_,index)=>(

<button

key={index}

className={

currentPage===index+1

?

"page-number active"

:

"page-number"

}

onClick={()=>onPageChange(index+1)}

>

{index+1}

</button>

)

)

}

</div>

<button

className="page-btn"

onClick={handleNext}

disabled={currentPage===totalPages}

>

Next

<FaChevronRight/>

</button>

</div>

);

}

export default Pagination;