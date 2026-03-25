import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function ProductDetails(){

  const { id } = useParams();
  const [product,setProduct] = useState(null);
  const [qty,setQty] = useState(1);

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const fetchProduct = async ()=>{
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
    setProduct(res.data);
  };

  useEffect(()=>{
    fetchProduct();
  },[]);

  if(!product) return <h2>Loading...</h2>;

  return(

    <div>
      <Navbar setSearch={()=>{}}/>

      <div style={{display:"flex", padding:"40px", gap:"40px"}}>

        {/* IMAGE */}
        <img
          src={product.image}
          style={{width:"350px", borderRadius:"10px"}}
        />

        {/* DETAILS */}
        <div>

          <h1>{product.name}</h1>

          <p style={{color:"gray"}}>{product.category}</p>

          <h2 style={{color:"orange"}}>₹{product.price}</h2>

          <p>{product.description}</p>

          <p>Stock: {product.stock}</p>

          {/* QUANTITY */}
          <div style={{margin:"10px 0"}}>
            <button onClick={()=>setQty(qty>1?qty-1:1)}>-</button>
            <span style={{margin:"0 10px"}}>{qty}</span>
            <button onClick={()=>setQty(qty+1)}>+</button>
          </div>

          {/* BUTTONS */}
          <button
            onClick={()=>{
              addToCart({...product, qty});
            }}
            style={{background:"orange", color:"white", padding:"10px"}}
          >
            Add to Cart
          </button>

          <button
            onClick={()=>{
              addToCart({...product, qty});
              navigate("/checkout");
            }}
            style={{marginLeft:"10px"}}
          >
            Buy Now
          </button>

        </div>

      </div>

    </div>

  );
}

export default ProductDetails;