import { useState, useEffect } from "react";
import API from "../services/api";

function AdminDashboard() {

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [stock,setStock] = useState("");
  const [image,setImage] = useState(null);
  const [editingId,setEditingId] = useState(null);
  const [category,setCategory] = useState("");
  const [products,setProducts] = useState([]);

  // ✅ FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(()=>{
    fetchProducts();
  },[]);

  // ✅ ADD PRODUCT
  const addProduct = async () => {

    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);

    if (image) {
      formData.append("image", image);
    }

    try {
      await API.post("/products", formData);
      alert("Product added");
      fetchProducts();

      // reset
      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage(null);

    } catch (err) {
      console.log(err);
      alert("Error adding product");
    }
  };

  // ✅ DELETE
  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      alert("Deleted");
      fetchProducts();
    } catch (err) {
      alert("Error deleting");
    }
  };

  // ✅ UPDATE
  const updateProduct = async (id) => {
    try {
      await API.put(`/products/${id}`, {
        name, description, price, stock, category
      });

      alert("Updated");
      fetchProducts();

      setEditingId(null);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage(null);

    } catch (err) {
      console.log(err);
      alert("Error updating");
    }
  };

  // ✅ AUTH CHECK
  const token = localStorage.getItem("token");
  if(!token){
    window.location.href = "/";
  }

  return (
    <div style={{padding:"30px"}}>

      <h2>RouterHub Admin Dashboard</h2>

      <h3>Add Router</h3>

      <input
        value={name}
        placeholder="Product Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <br/><br/>

      <select value={category} onChange={(e)=>setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="Router">Router</option>
        <option value="Fiber Cable">Fiber Cable</option>
        <option value="Fiber Accessories">Fiber Accessories</option>
        <option value="Fiber Tools">Fiber Tools</option>
        <option value="Security">Security</option>
        <option value="Streaming Device">Streaming Device</option>
      </select>

      <br/><br/>

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

      <button onClick={()=>{
        if(editingId){
          updateProduct(editingId);
        } else {
          addProduct();
        }
      }}>
        {editingId ? "Update Router" : "Add Router"}
      </button>

      <h3>All Routers</h3>

      <div style={{display:"flex",flexWrap:"wrap"}}>

        {products.map((p)=>(
          <div key={p._id} style={{
            border:"1px solid #ddd",
            borderRadius:"8px",
            padding:"15px",
            margin:"15px",
            width:"250px"
          }}>

            <img
              src={p.image}
              alt={p.name}
              style={{width:"100%",height:"150px",objectFit:"cover"}}
            />

            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>₹{p.price}</p>
            <p>Stock: {p.stock}</p>

            <button onClick={()=>{
              setName(p.name);
              setDescription(p.description);
              setPrice(p.price);
              setStock(p.stock);
              setCategory(p.category);
              setEditingId(p._id);
            }}>
              Edit
            </button>

            <button onClick={()=>deleteProduct(p._id)}>
              Delete
            </button>

          </div>
        ))}

      </div>

      <button
        onClick={()=>{
          localStorage.removeItem("token");
          window.location.href="/";
        }}
      >
        Logout
      </button>

    </div>
  );
}

export default AdminDashboard;