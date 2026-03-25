import { useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Checkout(){

  const [address,setAddress] = useState("");
  const [phone,setPhone] = useState("");

  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const placeOrder = async ()=>{

    for(const item of cart){

      await axios.post("${import.meta.env.VITE_API_URL}/api/orders/create",{
        name:item.name,
        price:item.price,
        image:item.image,
        address,
        phone
      });

    }

    clearCart();
    navigate("/orders");
  };

  return(

    <div style={{padding:"30px"}}>

      <h2>Checkout</h2>

      <input
        placeholder="Address"
        onChange={(e)=>setAddress(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Phone"
        onChange={(e)=>setPhone(e.target.value)}
      />

      <br/><br/>

      <button onClick={placeOrder}>
        Place Order
      </button>

    </div>

  );
}

export default Checkout;