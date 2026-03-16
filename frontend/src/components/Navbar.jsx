import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar({setSearch}){

  const [value,setValue] = useState("");

  const handleSearch = (e)=>{
    setValue(e.target.value);
    setSearch(e.target.value);
  };

  return(

    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"15px",
      background:"#333",
      color:"white"
    }}>

      <h2>RouterHub</h2>

      <input
        placeholder="Search products..."
        value={value}
        onChange={handleSearch}
        style={{
          padding:"8px",
          width:"250px",
          borderRadius:"4px",
          border:"none"
        }}
      />

      <div>

        <Link to="/store" style={{color:"white",marginRight:"15px"}}>
          Store
        </Link>

        <Link to="/" style={{color:"white"}}>
          Admin
        </Link>

      </div>

    </div>

  );

}

export default Navbar;