import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App(){

  return(

    <Router>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />

        <Route
          path="/store"
          element={
            <ProtectedRoute>
              <Store/>
            </ProtectedRoute>
          }
        />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        <Route path="/wishlist" element={<Wishlist />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard/>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminOrders/>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

      </Routes>

    </Router>

  );

}

export default App;