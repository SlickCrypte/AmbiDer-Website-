import "./Modal.css";

import { FaTimes } from "react-icons/fa";

function Modal({

isOpen,

title = "Modal",

children,

onClose,

width = "700px"

}){

if(!isOpen) return null;

return(

<div className="modal-overlay">

<div

className="modal-container"

style={{maxWidth:width}}

>

<div className="modal-header">

<h2>

{title}

</h2>

<button

className="modal-close"

onClick={onClose}

>

<FaTimes/>

</button>

</div>

<div className="modal-body">

{children}

</div>

</div>

</div>

);

}

export default Modal;