import { useEffect, useState } from "react";

function HeroSlider(){

  const slides = [
    {
      title:"Networking Products",
      subtitle:"Fast Delivery",
      image:"https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
    },
    {
      title:"Fiber Equipment",
      subtitle:"Best Quality",
      image:"https://cdn-icons-png.flaticon.com/512/2920/2920277.png"
    },
    {
      title:"Security Devices",
      subtitle:"Stay Safe",
      image:"https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
    }
  ];

  const [current,setCurrent] = useState(0);

  // auto slide
  useEffect(()=>{
    const interval = setInterval(()=>{
      setCurrent((prev)=>(prev + 1) % slides.length);
    },3000);

    return ()=>clearInterval(interval);
  },[]);

  const prevSlide = ()=>{
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = ()=>{
    setCurrent((current + 1) % slides.length);
  };

  return(

    <div className="relative bg-white rounded-lg shadow p-10 flex items-center justify-between">

      {/* TEXT */}
      <div>
        <h1 className="text-5xl mb-3">{slides[current].subtitle}</h1>
        <h2 className="text-xl text-gray-600">{slides[current].title}</h2>

        <button className="mt-5 bg-orange-500 text-white px-6 py-2 rounded">
          Shop Now
        </button>
      </div>

      {/* IMAGE */}
      <img
        src={slides[current].image}
        className="w-80"
      />

      {/* LEFT BUTTON */}
      <button
        onClick={prevSlide}
        className="absolute left-2 text-2xl"
      >
        ⬅
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={nextSlide}
        className="absolute right-2 text-2xl"
      >
        ➡
      </button>

      {/* DOTS */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">

        {slides.map((_,index)=>(
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-orange-500" : "bg-gray-300"
            }`}
          ></div>
        ))}

      </div>

    </div>

  );

}

export default HeroSlider;