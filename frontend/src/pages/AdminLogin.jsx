import { useState } from "react";
import axios from "axios";

function AdminLogin() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const login = async () => {

    try {

      const res = await axios.post(
        "${import.meta.env.VITE_API_URL}/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      window.location.href="/dashboard";

    } catch(err) {
      console.log("LOGIN ERROR: ", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login Failed");

    }

  };

  return (
    <div style={{padding:"30px"}}>

      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={login}>Login</button>

    </div>
  );
}

export default AdminLogin;