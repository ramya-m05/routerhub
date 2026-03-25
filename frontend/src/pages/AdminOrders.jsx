import { useEffect, useState } from "react";
import axios from "axios";

function AdminOrders(){

  const [orders,setOrders] = useState([]);

  const fetchOrders = async ()=>{

    const res = await axios.get(
      "${import.meta.env.VITE_API_URL}/api/orders"
    );

    setOrders(res.data);
  };

  useEffect(()=>{
    fetchOrders();
  },[]);

  return(

    <div style={{padding:"40px"}}>

      <h2>All Orders (Admin)</h2>

      {orders.map((o)=>(

  <div key={o._id} style={{
    border:"1px solid #ddd",
    padding:"15px",
    marginBottom:"10px"
  }}>

    <h3>{o.name}</h3>
    <p>₹{o.price}</p>

    <p><b>Address:</b> {o.address}</p>
    <p><b>Phone:</b> {o.phone}</p>

    {/* 🔥 STATUS DROPDOWN */}
    <select
  value={o.status}
  onChange={async (e)=>{
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/orders/${o._id}`,
      { status: e.target.value }
    );
    fetchOrders();
  }}
  style={{
    padding:"6px",
    borderRadius:"5px",
    marginTop:"10px"
  }}
><p style={{
  fontWeight:"bold",
  color:
    o.status === "Pending" ? "orange" :
    o.status === "Shipped" ? "blue" :
    "green"
}}>
  Status: {o.status}
</p>

<option value="Pending">Pending</option>
<option value="Shipped">Shipped</option>
<option value="Delivered">Delivered</option>

</select>

  </div>

))}

    </div>

  );

}

export default AdminOrders;