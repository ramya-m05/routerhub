import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Home(){

  const [products,setProducts] = useState([]);

  const categories = [
    { name:"Router", icon:"📡" },
    { name:"Fiber Cable", icon:"🧵" },
    { name:"Fiber Tools", icon:"🛠" },
    { name:"Security", icon:"📷" },
    { name:"Streaming Device", icon:"📺" }
  ];

  return(

    <div className="bg-gray-100 min-h-screen">

      {/* NAVBAR */}
      <Navbar setSearch={()=>{}}/>

      {/* MAIN SECTION */}
      <div className="flex p-6 gap-6">

        {/* SIDEBAR */}
        

        {/* HERO SLIDER */}
        <div className="flex-1">
          <HeroSlider />
        </div>

      </div>

      {/* CATEGORY CARDS */}
      <div className="p-6">

        <h2 className="text-2xl font-semibold mb-4">
          Shop by Category
        </h2>

        <div className="grid grid-cols-5 gap-6">

          {categories.map((cat)=>(

            <Link
              key={cat.name}
              to={`/store?category=${cat.name}`}
              className="block"
            >

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer text-center transition">

                <div className="text-4xl mb-2">
                  {cat.icon}
                </div>

                <h3 className="font-medium">
                  {cat.name}
                </h3>

              </div>

            </Link>

          ))}

        </div>

      </div>

      {/* FEATURED PRODUCTS (dummy for now) */}
      <div className="p-6">

        <h2 className="text-2xl font-semibold mb-4">
          Featured Products
        </h2>

        <div className="grid grid-cols-4 gap-6">

          {products.slice(0,4).map((p)=>(

  <div
    key={p._id}
    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
  >

    <img
      src="https://via.placeholder.com/200"
      className="w-full h-40 object-cover mb-3 rounded"
    />

    <h3 className="font-semibold">{p.name}</h3>

    <p className="text-gray-500 text-sm">{p.category}</p>

    <p className="text-orange-500 font-bold">₹{p.price}</p>

  </div>

))}

        </div>

      </div>

    </div>

  );

}

export default Home;