import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SchoolDetail from './pages/SchoolDetail'; // <--- Import mới

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/* Route chi tiết trường học (dùng id động) */}
          <Route path="school/:id" element={<SchoolDetail />} /> 
          
          <Route path="schools" element={<div>Trang danh sách trường</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;