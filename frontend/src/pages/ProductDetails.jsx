<div style={{marginBottom:"20px"}}>

{categories.map((cat)=>(
  <button
    key={cat}
    onClick={()=>setSelectedCategory(cat)}
    style={{
      marginRight:"10px",
      padding:"8px 12px",
      background: selectedCategory === cat ? "#333" : "#eee",
      color: selectedCategory === cat ? "white" : "black",
      border:"none",
      borderRadius:"4px",
      cursor:"pointer"
    }}
  >
    {cat}
  </button>
))}

</div>