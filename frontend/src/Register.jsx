import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "./services/authService";

function Register() {

const navigate = useNavigate();

const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [loading,setLoading]=useState(false);

const handleRegister=async()=>{

if(!name || !email || !password){

toast.error("Please fill all fields");

return;

}

try{

setLoading(true);

await registerUser({

name,

email,

password

});

toast.success("Account Created Successfully");

setTimeout(()=>{

navigate("/login");

},1000);

}

catch(error){

toast.error(

error.response?.data?.message ||

"Registration Failed"

);

}

finally{

setLoading(false);

}

};

return(

<div className="register-page">

<div className="register-box">

<h1>

Create Account

</h1>

<p>

Start your AmbiDer Journey

</p>

<input

type="text"

placeholder="Full Name"

value={name}

onChange={(e)=>setName(e.target.value)}

/>

<input

type="email"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>

<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>

<button

onClick={handleRegister}

disabled={loading}

>

{

loading ?

"Creating..."

:

"Create Account"

}

</button>

</div>

</div>

);

}

export default Register;