import { useEffect, useState } from "react";
import API from "../services/api";

function OrderHistory(){

  const [orders,setOrders] = useState([]);

  const fetchOrders = async ()=>{
    try{
      const res = await API.get("/orders/my");
      setOrders(res.data);
    }catch(err){
      console.log(err);
    }
  };

  useEffect(()=>{ fetchOrders(); },[]);

  return(
    <div style={{padding:"30px"}}>
      <h2>📦 My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (

        orders.map(order=>(
          <div key={order._id} style={card}>

            <h4>Order ID: {order._id}</h4>
            <p>Status: {order.status}</p>

            {order.items.map((item,i)=>(
              <div key={i} style={row}>
                <span>{item.name} x {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}

            <h3>Total: ₹{order.totalAmount}</h3>

          </div>
        ))

      )}

    </div>
  );
}

const card = {
  background:"white",
  padding:"20px",
  marginBottom:"15px",
  borderRadius:"10px"
};

const row = {
  display:"flex",
  justifyContent:"space-between"
};

export default OrderHistory;