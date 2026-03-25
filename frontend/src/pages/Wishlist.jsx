import { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import Navbar from "../components/Navbar";

function Wishlist(){

  const { wishlist, removeFromWishlist } = useContext(WishlistContext);

  return(

    <div>
      <Navbar setSearch={()=>{}}/>

      <div style={{padding:"30px"}}>

        <h2>My Wishlist ❤️</h2>

        {wishlist.length === 0 && <p>No items yet</p>}

        <div style={{display:"flex", gap:"20px", flexWrap:"wrap"}}>

          {wishlist.map(item=>(
            <div key={item._id} style={{width:"200px"}}>

              <img src={item.image} style={{width:"100%"}}/>
              <p>{item.name}</p>

              <button onClick={()=>removeFromWishlist(item._id)}>
                Remove
              </button>

            </div>
          ))}

        </div>

      </div>

    </div>

  );

}

export default Wishlist;