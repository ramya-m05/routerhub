// React hooks
import { useState, useEffect } from "react";

// Axios for API calls
import API from "../services/api";

API.get("/products")
API.post("/products/add");

function AdminDashboard() {

  // ------------------------------
  // FORM STATE (for adding router)
  // ------------------------------

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [stock,setStock] = useState("");
  const [image,setImage] = useState("");
  const [editingId,setEditingId] = useState(null); // to track which router is being edited
  const [category,setCategory] = useState("");
  // ------------------------------
  // PRODUCT LIST STATE
  // stores routers fetched from DB
  // ------------------------------

  const [products,setProducts] = useState([]);

  // ------------------------------
  // FETCH PRODUCTS FROM BACKEND
  // runs when page loads
  // ------------------------------

  const fetchProducts = async () => {

    const res = await axios.get(
      "http://localhost:5000/api/products"
    );

    setProducts(res.data);

  };

  // React lifecycle hook
  useEffect(()=>{
    fetchProducts();
  },[]);

  // ------------------------------
  // ADD ROUTER FUNCTION
  // sends POST request to backend
  // ------------------------------

  const addProduct = async () => {

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("name", name);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("image", image);

  try {

    await axios.post(
      "http://localhost:5000/api/products/add",
      formData,
      {
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"multipart/form-data"
        }
      }
    );

    alert("Router added successfully");

    fetchProducts();

    // reset form
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage(null);

  } catch(err){

    console.log(err.response?.data);

    alert("Error adding router");

  }

};

  // ------------------------------
  // DELETE ROUTER FUNCTION
  // ------------------------------

  const deleteProduct = async (id) => {

    const token = localStorage.getItem("token");

    try{

      await axios.delete(
        `http://localhost:5000/api/products/${id}`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      alert("Router deleted");

      fetchProducts();

    }catch(err){

      alert("Error deleting router");

    }

  };

  // ------------------------------
  // UPDATE ROUTER FUNCTION
  // ------------------------------

 const updateProduct = async (id) => {

  const token = localStorage.getItem("token");

  try{

    await axios.put(
      `http://localhost:5000/api/products/${id}`,
      { name, description, price, stock, image },
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    alert("Router updated");

    // refresh router list
    fetchProducts();

    // reset form fields
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage("");

  }catch(err){

    console.log(err.response?.data);

    alert("Error updating router");

  }



};

const token = localStorage.getItem("token");

if(!token){
  window.location.href = "/";
}
  // ------------------------------
  // UI SECTION
  // ------------------------------

  return (

    <div style={{padding:"30px"}}>

      {/* PAGE TITLE */}
      <h2>RouterHub Admin Dashboard</h2>

      {/* ------------------------------
          ADD ROUTER FORM
      --------------------------------*/}

      <h3>Add Router</h3>

      <input
        value={name}
        placeholder="Router Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <br/><br/>

      <select
  value={category}
  onChange={(e)=>setCategory(e.target.value)}
>

<option value="">Select Category</option>
<option value="Router">Router</option>
<option value="Fiber Cable">Fiber Cable</option>
<option value="Fiber Accessories">Fiber Accessories</option>
<option value="Fiber Tools">Fiber Tools</option>
<option value="Security">Security</option>
<option value="Streaming Device">Streaming Device</option>

</select>
<br></br>

      <input
        value={description}
        placeholder="Description"
        onChange={(e)=>setDescription(e.target.value)}
      />

      <br/><br/>

      <input
        value={price}
        placeholder="Price"
        onChange={(e)=>setPrice(e.target.value)}
      />

      <br/><br/>

      <input
        value={stock}
        placeholder="Stock"
        onChange={(e)=>setStock(e.target.value)}
      />

      <br/><br/>

      <input
  type="file"
  onChange={(e)=>setImage(e.target.files[0])}
/>

      <br/><br/>

      <button
  onClick={()=>{
    if(editingId){
      updateProduct(editingId);
    }else{
      addProduct();
    }
  }}
>
{editingId ? "Update Router" : "Add Router"}
</button>

      {/* ------------------------------
          PRODUCT LIST SECTION
      --------------------------------*/}

      <h3>All Routers</h3>

      {/* grid container */}
      <div style={{display:"flex",flexWrap:"wrap"}}>

      {/* LOOP START */}
      {products.map((p)=>(

        <div
          key={p._id}
          style={{
            border:"1px solid #ddd",
            borderRadius:"8px",
            padding:"15px",
            margin:"15px",
            width:"250px",
            boxShadow:"0px 2px 5px rgba(0,0,0,0.1)"
          }}
        >

          {/* router image */}
          <img
            src={p.image}
            alt={p.name}
            style={{width:"100%",height:"150px",objectFit:"cover"}}
          />

          {/* router details */}
          <h3>{p.name}</h3>

          <p>{p.description}</p>

          <p><b>Price:</b> ₹{p.price}</p>

          <p><b>Stock:</b> {p.stock}</p>

          {/* action buttons */}
          <div style={{display:"flex",gap:"10px",marginTop:"10px",justifyContent:"center"}}>

            <button
              onClick={()=>{
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setImage(p.image);
    setEditingId(p._id);
  }}
              style={{
                background:"blue",
                color:"white",
                border:"none",
                padding:"6px 10px",
                borderRadius:"4px"
              }}
            >
              Edit
            </button>

            <button
              onClick={()=>deleteProduct(p._id)}
              style={{
                background:"red",
                color:"white",
                border:"none",
                padding:"6px 10px",
                borderRadius:"4px"
              }}
            >
              Delete
            </button>

            <button
  onClick={()=>{
    localStorage.removeItem("token");
    window.location.href="/";
  }}
  style={{
    position:"absolute",
    right:"20px",
    top:"20px",
    background:"red",
    color:"white",
    border:"none",
    padding:"8px 12px",
    borderRadius:"4px"
  }}
>
Logout
</button>

          </div>

        </div>

      ))}

      {/* LOOP END */}

      </div>

    </div>

  );
}

export default AdminDashboard;