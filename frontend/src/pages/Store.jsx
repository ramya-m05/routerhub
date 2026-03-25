import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useLocation } from "react-router-dom";

function Store(){

  const { cart, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const [products,setProducts] = useState([]);
  const [selectedCategory,setSelectedCategory] = useState("All");
  const [search,setSearch] = useState("");

  const location = useLocation();

  const categories = [
    "All",
    "Router",
    "Fiber Cable",
    "Fiber Accessories",
    "Fiber Tools",
    "Security",
    "Streaming Device"
  ];

  // FETCH PRODUCTS
  const fetchProducts = async ()=>{
    try{
      const res = await API.get("/products");
      setProducts(res.data);
    }catch(err){
      console.log(err);
    }
  };

  useEffect(()=>{
    fetchProducts();
  },[]);

  // URL CATEGORY SUPPORT
  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");

    if(cat){
      setSelectedCategory(cat);
    }else{
      setSelectedCategory("All");
    }
  },[location]);

  // FILTER
  const filteredProducts = products
    .filter(p =>
      selectedCategory === "All"
        ? true
        : p.category === selectedCategory
    )
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  return(

    <div>

      <Navbar setSearch={setSearch}/>

      <div style={{padding:"30px"}}>

        <h2>Store</h2>

        {/* CATEGORY */}
        <div style={{marginBottom:"20px"}}>
          {categories.map(cat=>(
            <button
              key={cat}
              onClick={()=>setSelectedCategory(cat)}
              style={{
                marginRight:"10px",
                padding:"8px 12px",
                borderRadius:"20px",
                border:"none",
                background: selectedCategory === cat ? "#ff6a00" : "#eee",
                color: selectedCategory === cat ? "white" : "black",
                cursor:"pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{
          display:"flex",
          flexWrap:"wrap",
          gap:"20px"
        }}>

          {filteredProducts.map(p=>{

            const cartItem = cart.find(i => i._id === p._id);
            const wishItem = wishlist.find(i => i._id === p._id);

            return(

              <div
                key={p._id}
                style={{
                  width:"220px",
                  background:"white",
                  borderRadius:"12px",
                  padding:"15px",
                  boxShadow:"0 10px 20px rgba(0,0,0,0.08)",
                  transition:"0.3s",
                  position:"relative"
                }}
              >

                {/* ❤️ WISHLIST */}
                <span
                  onClick={()=> wishItem ? removeFromWishlist(p._id) : addToWishlist(p)}
                  style={{
                    position:"absolute",
                    right:"10px",
                    top:"10px",
                    cursor:"pointer",
                    fontSize:"18px"
                  }}
                >
                  {wishItem ? "❤️" : "🤍"}
                </span>

                {/* IMAGE */}
                <img
                  src={p.image}
                  style={{
                    width:"100%",
                    height:"140px",
                    objectFit:"cover",
                    borderRadius:"10px"
                  }}
                />

                {/* DETAILS */}
                <h4 style={{marginTop:"10px"}}>{p.name}</h4>

                <p style={{color:"gray", fontSize:"14px"}}>
                  {p.category}
                </p>

                <h3 style={{color:"#ff6a00"}}>
                  ₹{p.price}
                </h3>

                {/* CART SECTION */}
                {cartItem ? (

                  <div style={{
                    display:"flex",
                    justifyContent:"space-between",
                    marginTop:"10px",
                    border:"2px solid #ff6a00",
                    borderRadius:"20px",
                    padding:"5px"
                  }}>

                    <button onClick={()=>decreaseQty(p._id)}>-</button>

                    <span>{cartItem.qty}</span>

                    <button onClick={()=>increaseQty(p._id)}>+</button>

                  </div>

                ) : (

                  <button
                    onClick={()=>addToCart(p)}
                    style={{
                      width:"100%",
                      marginTop:"10px",
                      background:"#ff6a00",
                      color:"white",
                      border:"none",
                      padding:"8px",
                      borderRadius:"8px",
                      cursor:"pointer"
                    }}
                  >
                    Add to Cart
                  </button>

                )}

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}

export default Store;