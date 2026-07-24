import "./ConfirmDialog.css";

function ConfirmDialog({

isOpen,

title = "Confirm Action",

message = "Are you sure you want to continue?",

confirmText = "Confirm",

cancelText = "Cancel",

onConfirm,

onCancel

}){

if(!isOpen) return null;

return(

<div className="confirm-overlay">

<div className="confirm-dialog">

<div className="confirm-icon">

⚠️

</div>

<h2>

{title}

</h2>

<p>

{message}

</p>

<div className="confirm-actions">

<button

className="confirm-cancel"

onClick={onCancel}

>

{cancelText}

</button>

<button

className="confirm-confirm"

onClick={onConfirm}

>

{confirmText}

</button>

</div>

</div>

</div>

);

}

export default ConfirmDialog;