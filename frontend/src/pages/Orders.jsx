import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Orders(){

  const [orders,setOrders] = useState([]);

  useEffect(()=>{
    fetchOrders();
  },[]);

  const fetchOrders = async ()=>{

    try{

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "${import.meta.env.VITE_API_URL}/api/orders/my",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      setOrders(res.data);

    }catch(err){
      console.log(err);
    }

  };

  return(

    <div>
      <Navbar setSearch={()=>{}}/>

      <div style={{padding:"30px"}}>

        <h2>Your Orders</h2>

        {orders.length === 0 ? (
          <h3>No orders yet</h3>
        ) : (

          orders.map((o)=>(

            <div key={o._id} style={{
              marginBottom:"20px",
              display:"flex",
              gap:"15px",
              alignItems:"center",
              border:"1px solid #eee",
              padding:"10px",
              borderRadius:"8px"
            }}>

              <img
                src={o.image}
                style={{width:"80px", height:"80px", objectFit:"cover"}}
              />

              <div>

                <h3>{o.name}</h3>

                <p>₹{o.price}</p>

                <p style={{
                  fontWeight:"bold",
                  color:
                    o.status==="Pending"?"orange":
                    o.status==="Shipped"?"blue":"green"
                }}>
                  {o.status}
                </p>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}

export default Orders;