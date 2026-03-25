import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Profile(){

  const [user,setUser] = useState(null);

  useEffect(()=>{
    fetchProfile();
  },[]);

  const fetchProfile = async ()=>{

    const token = localStorage.getItem("token");

    try{
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL}/api/users/profile",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      setUser(res.data);

    }catch(err){
      console.log(err);
    }
  };

  if(!user) return <h2>Loading...</h2>;

  return(

    <div>
      <Navbar setSearch={()=>{}}/>

      <div style={{padding:"30px"}}>

        <h2>My Profile</h2>

        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>

      </div>

    </div>

  );

}

export default Profile;