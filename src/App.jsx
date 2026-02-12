import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SchoolDetail from './pages/SchoolDetail'; // <--- Import mới
import Telesale from './pages/Telesale';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout bao trùm tất cả các trang con */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Đưa SchoolDetail vào bên trong MainLayout */}
          <Route path="school/:id" element={<SchoolDetail />} />
          
          <Route path="telesale" element={<Telesale />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;