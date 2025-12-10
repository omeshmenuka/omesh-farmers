
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import FarmerDetail from './pages/FarmerDetail';
import AdminDashboard from './pages/AdminDashboard';
import AddFarmer from './pages/AddFarmer';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import MyFarm from './pages/MyFarm';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import { FarmerProvider } from './context/FarmerContext';

function App() {
  return (
    <FarmerProvider>
      <Router>
        <Routes>
          {/* Main "Riga Harvest" Consumer App */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="farmer/:id" element={<FarmerDetail />} />
            <Route path="add-farmer" element={<AddFarmer />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="login" element={<Login />} />
            <Route path="my-farm" element={<MyFarm />} />
            <Route path="admin-login" element={<AdminLogin />} />
          </Route>

          {/* Separate "Admin Portal" App */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FarmerProvider>
  );
}

export default App;
