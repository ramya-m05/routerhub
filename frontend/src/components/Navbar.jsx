import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

function Navbar({ setSearch }){

  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);

  const [open,setOpen] = useState(false);
  const navigate = useNavigate();

  return(

    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"15px 30px",
      background:"white",
      boxShadow:"0 4px 15px rgba(0,0,0,0.08)"
    }}>

      <h2 style={{color:"#ff6a00", cursor:"pointer"}}
        onClick={()=>navigate("/store")}
      >
        ROUTERHUB
      </h2>

      <input
        placeholder="Search..."
        onChange={(e)=>setSearch(e.target.value)}
        style={{
          padding:"10px",
          width:"350px",
          borderRadius:"25px",
          border:"1px solid #ddd"
        }}
      />

      <div style={{display:"flex", gap:"20px", alignItems:"center"}}>

        {/* ❤️ Wishlist */}
        <div style={{cursor:"pointer"}} onClick={()=>navigate("/wishlist")}>
          ❤️ {wishlist.length}
        </div>

        {/* 🛒 Cart */}
        <div style={{cursor:"pointer"}} onClick={()=>navigate("/cart")}>
          🛒 {cart.length}
        </div>

        {/* 👤 Profile */}
        <div style={{position:"relative"}}>
          <span onClick={()=>setOpen(!open)} style={{cursor:"pointer"}}>👤</span>

          {open && (
            <div style={{
              position:"absolute",
              right:0,
              top:"30px",
              background:"white",
              padding:"10px",
              borderRadius:"8px",
              boxShadow:"0 5px 15px rgba(0,0,0,0.2)"
            }}>
              <p onClick={()=>navigate("/profile")}>Profile</p>
              <p onClick={()=>navigate("/orders")}>Orders</p>
              <p onClick={()=>{
                localStorage.clear();
                navigate("/login");
              }} style={{color:"red"}}>
                Logout
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Navbar;