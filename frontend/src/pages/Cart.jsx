import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Cart(){

  const { cart, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);

  return(

    <div>
      <Navbar setSearch={()=>{}}/>

      <div style={{padding:"30px"}}>

        <h2>Cart</h2>

        {cart.length === 0 ? (
          <h3>Your cart is empty</h3>
        ) : (

          cart.map((item)=>(
            <div key={item._id} style={{display:"flex", gap:"20px", marginBottom:"20px"}}>

              <img src={item.image} style={{width:"80px"}}/>

              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>

                <button onClick={()=>decreaseQty(item._id)}>-</button>
                {item.qty}
                <button onClick={()=>increaseQty(item._id)}>+</button>

                <br/>

                <button onClick={()=>removeFromCart(item._id)}>
                  Remove
                </button>
              </div>

            </div>
          ))

        )}

        <h3>Total: ₹{total}</h3>

        <button onClick={()=>navigate("/checkout")}>
          Checkout
        </button>

      </div>

    </div>

  );
}

export default Cart;