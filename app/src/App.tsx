import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminContent from "./pages/admin/AdminContent";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSubscribers from "./pages/admin/AdminSubscribers";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}
