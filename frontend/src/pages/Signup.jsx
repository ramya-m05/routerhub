import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Signup(){

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");

  const [showPassword,setShowPassword] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // 🔥 PASSWORD STRENGTH
  const getStrength = (pwd)=>{
    if(pwd.length < 6) return "Weak";
    if(pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const strength = getStrength(password);

  const handleSignup = async ()=>{

    if(password !== confirmPassword){
      toast.error("Passwords do not match");
      return;
    }

    try{
      await API.post("/auth/signup",{ name,email,password });
      toast.success("Signup successful 🎉");
      navigate("/login");
    }catch(err){
      toast.error(err.response?.data?.message || "Signup failed");
    }

  };

  return(

    <div style={wrapper}>

      <div style={card}>

        <h2 style={{textAlign:"center"}}>Create Account</h2>

        <input
          placeholder="Name"
          onChange={(e)=>setName(e.target.value)}
          style={input}
        />

        <input
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
          style={input}
        />

        {/* PASSWORD */}
        <div style={{position:"relative"}}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            style={input}
          />

          <span
            onClick={()=>setShowPassword(!showPassword)}
            style={eye}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* 🔥 STRENGTH */}
        {password && (
          <p style={{
            color:
              strength === "Weak" ? "red" :
              strength === "Medium" ? "orange" : "green",
            fontSize:"13px"
          }}>
            Strength: {strength}
          </p>
        )}

        {/* CONFIRM PASSWORD */}
        <div style={{position:"relative"}}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter Password"
            onChange={(e)=>setConfirmPassword(e.target.value)}
            style={input}
          />

          <span
            onClick={()=>setShowConfirm(!showConfirm)}
            style={eye}
          >
            {showConfirm ? "🙈" : "👁"}
          </span>
        </div>

        {/* 🔥 MATCH CHECK */}
        {confirmPassword && (
          <p style={{
            color:
              password === confirmPassword ? "green" : "red",
            fontSize:"13px"
          }}>
            {password === confirmPassword
              ? "Passwords match ✅"
              : "Passwords do not match ❌"}
          </p>
        )}

        <button onClick={handleSignup} style={btn}>
          Signup
        </button>

        <p style={{textAlign:"center", marginTop:"10px"}}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color:"blue",
              textDecoration:"underline"
            }}
          >
            Login
          </Link>
        </p>

      </div>

    </div>

  );

}

// 🎨 styles
const wrapper = {
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"linear-gradient(135deg,#ff9a00,#ff6a00)"
};

const card = {
  background:"white",
  padding:"35px",
  borderRadius:"15px",
  width:"350px",
  boxShadow:"0 20px 40px rgba(0,0,0,0.2)"
};

const input = {
  width:"100%",
  padding:"12px",
  marginBottom:"10px",
  border:"1px solid #ddd",
  borderRadius:"8px"
};

const btn = {
  width:"100%",
  padding:"12px",
  background:"#ff6a00",
  color:"white",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  fontWeight:"bold"
};

const eye = {
  position:"absolute",
  right:"10px",
  top:"12px",
  cursor:"pointer"
};

export default Signup;