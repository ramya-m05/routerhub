import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Store(){

  // products from database
  const [products,setProducts] = useState([]);

  // category filter
  const [selectedCategory,setSelectedCategory] = useState("All");

  // search filter
  const [search,setSearch] = useState("");

  // categories list
  const categories = [
    "All",
    "Router",
    "Fiber Cable",
    "Fiber Accessories",
    "Fiber Tools",
    "Security",
    "Streaming Device"
  ];

  // fetch products
  const fetchProducts = async () => {

    const res = await axios.get(
      "http://localhost:5000/api/products"
    );

    setProducts(res.data);

  };

  useEffect(()=>{
    fetchProducts();
  },[]);

  // filter products
  const filteredProducts =
    products
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

      {/* Navbar */}
      <Navbar setSearch={setSearch}/>

      <div style={{padding:"40px"}}>

        <h1>RouterHub Store</h1>

        {/* Category Buttons */}
        <div style={{marginBottom:"20px"}}>

          {categories.map((cat)=>(
            <button
              key={cat}
              onClick={()=>setSelectedCategory(cat)}
              style={{
                marginRight:"10px",
                padding:"8px 12px",
                background:
                  selectedCategory === cat ? "#333" : "#eee",
                color:
                  selectedCategory === cat ? "white" : "black",
                border:"none",
                borderRadius:"4px",
                cursor:"pointer"
              }}
            >
              {cat}
            </button>
          ))}

        </div>

        {/* Product Grid */}
        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:"20px"
          }}
        >

        {filteredProducts.map((p)=>(

          <Link
            key={p._id}
            to={`/product/${p._id}`}
            style={{textDecoration:"none",color:"black"}}
          >

            <div
              style={{
                border:"1px solid #ddd",
                borderRadius:"8px",
                width:"250px",
                padding:"15px",
                boxShadow:"0 2px 5px rgba(0,0,0,0.1)"
              }}
            >

              <img
                src={p.image}
                alt={p.name}
                style={{
                  width:"100%",
                  height:"150px",
                  objectFit:"cover"
                }}
              />

              <h3>{p.name}</h3>

              <p>{p.category}</p>

              <p>₹{p.price}</p>

            </div>

          </Link>

        ))}

        </div>

      </div>

    </div>

  );

}

export default Store;