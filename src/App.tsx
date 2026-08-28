import { Routes, Route, Navigate } from "react-router-dom";
import BuyerHunting from "./pages/BuyerHunting";
import CostSheets from "./pages/CostSheets";
import Login from "./pages/Login";
import { useConvexAuth } from "convex/react";

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={isAuthenticated ? <BuyerHunting /> : <Navigate to="/login" />} />
      <Route path="/costs" element={isAuthenticated ? <CostSheets /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
