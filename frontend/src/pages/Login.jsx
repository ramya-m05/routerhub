import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useEffect } from "react";
function Login(){

    useEffect(()=>{
  const token = localStorage.getItem("token");

  if(token){
    const role = localStorage.getItem("role");

    if(role === "admin"){
      navigate("/admin");
    }else{
      navigate("/store");
    }
  }
},[]);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async ()=>{

    try{

      const res = await API.post("/auth/login",{ email,password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast.success("Login successful 🚀");

      if(res.data.role === "admin"){
        navigate("/admin");
      }else{
        navigate("/store");
      }

    }catch(err){
      toast.error(err.response?.data?.message || "Login failed");
    }

  };

  return(

    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"linear-gradient(135deg,#ff9a00,#ff6a00)"
    }}>

      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"15px",
        width:"350px",
        boxShadow:"0 20px 40px rgba(0,0,0,0.2)"
      }}>

        <h2 style={{textAlign:"center", marginBottom:"20px"}}>
          RouterHub Login
        </h2>

        <input
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={btnStyle}>
          Login
        </button>

        <p style={{textAlign:"center", marginTop:"15px"}}>
          New here? <Link to="/signup">Signup</Link>
        </p>

      </div>

    </div>

  );
}

const inputStyle = {
  width:"100%",
  padding:"12px",
  marginBottom:"12px",
  border:"1px solid #ddd",
  borderRadius:"8px"
};

const btnStyle = {
  width:"100%",
  padding:"12px",
  background:"orange",
  color:"white",
  border:"none",
  borderRadius:"8px",
  fontWeight:"bold",
  cursor:"pointer"
};

export default Login;