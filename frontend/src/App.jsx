import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";  

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<AdminLogin/>}/>
        <Route path="/dashboard" element={<AdminDashboard/>}/>
        <Route path="/store" element={<Store/>}/>
        <Route path="/product/:id" element={<ProductDetails/>}/>
      </Routes>

    </BrowserRouter>

  );

}

export default App;