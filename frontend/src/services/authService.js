import API from "./api";

export const loginUser = async (userData) => {

try{

const response = await API.post("/api/auth/login", userData);

return response.data;

}

catch(error){

throw error;

}

};

export const registerUser = async (userData) => {

try{

    const response = await API.post("/api/auth/register", userData);

return response.data;

}

catch(error){

throw error;

}

};

export const logoutUser = () => {

localStorage.removeItem("token");

localStorage.removeItem("user");

};