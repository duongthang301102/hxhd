import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import SchoolModal from '../components/SchoolModal';

const MainLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null); // Lưu trường đang sửa

  // Dữ liệu mẫu
  const [schools, setSchools] = useState([
    { id: 1, name: "TH Tiểu học Kim Đồng", students: 420, address: "Quận 1, TP.HCM", status: "Hoàn thành", date: "2024-01-12", month: 1, phone: "090123456", manager_name: "Cô Lan", expected_date: "2024-01-12", student_count: 420 },
    { id: 2, name: "THCS Lê Quý Đôn", students: 650, address: "Quận 3, TP.HCM", status: "Đang chờ", date: "2024-01-25", month: 1, phone: "0909888777", manager_name: "Thầy Hùng", expected_date: "2024-01-25", student_count: 650 },
  ]);

  // 1. Hàm mở Modal Thêm mới
  const handleOpenAdd = () => {
    setEditingSchool(null); // Reset về thêm mới
    setIsModalOpen(true);
  };

  // 2. Hàm mở Modal Sửa
  const handleOpenEdit = (school) => {
    setEditingSchool({
        ...school,
        student_count: school.students,
        expected_date: school.date,
    });
    setIsModalOpen(true);
  };

  // 3. Hàm Xử lý Lưu (CẬP NHẬT LOGIC MỚI Ở ĐÂY)
  // Hàm này giờ thông minh hơn: nhận vào 1 Object (khi sửa) HOẶC 1 Mảng (khi thêm nhiều ngày)
  const handleSaveSchool = (dataReceived) => {
    if (editingSchool) {
      // --- LOGIC SỬA (dataReceived là 1 object) ---
      setSchools(prev => prev.map(s => s.id === editingSchool.id ? {
        ...s,
        ...dataReceived,
        students: dataReceived.student_count,
        date: dataReceived.expected_date,
      } : s));
    } else {
      // --- LOGIC THÊM MỚI (dataReceived có thể là MẢNG do chọn range ngày) ---
      
      // Chuyển đổi thành mảng nếu nó chưa phải là mảng (để xử lý thống nhất)
      const inputData = Array.isArray(dataReceived) ? dataReceived : [dataReceived];

      const newSchoolsArray = inputData.map(item => ({
        ...item,
        // Map lại các trường cho khớp với cấu trúc hiển thị Dashboard
        id: item.id || (Date.now() + Math.random()), // Đảm bảo luôn có ID
        students: item.student_count,
        status: "Chưa bắt đầu",
        date: item.expected_date, 
      }));

      // Thêm toàn bộ mảng mới vào state cũ
      setSchools(prev => [...prev, ...newSchoolsArray]);
    }
  };

  // 4. Hàm Xóa
  const handleDeleteSchool = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa điểm trường này không?")) {
      setSchools(prev => prev.filter(s => s.id !== id));
    }
  };

  // 5. Hàm Cập nhật trạng thái (Dùng cho trang Chi tiết gọi ngược lên)
  const updateSchool = (updatedData) => {
    setSchools(prev => prev.map(s => s.id === updatedData.id ? { ...s, ...updatedData } : s));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light text-[#0d141b]">
      {/* Component Modal */}
      <SchoolModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveSchool}
        initialData={editingSchool} 
      />

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[#e7edf3] flex flex-col bg-white shrink-0 transition-all">
         <div className="p-6 flex flex-col gap-6">
             <div className="flex items-center gap-3">
               <div className="bg-primary rounded-lg w-10 h-10 flex items-center justify-center text-white">
                 <span className="material-symbols-outlined">visibility</span>
               </div>
               <div className="flex flex-col">
                 <h1 className="text-base font-bold leading-tight">Quản lý Khúc xạ</h1>
                 <p className="text-[#4c739a] text-xs font-normal">Hệ thống học đường</p>
               </div>
             </div>
             <nav className="flex flex-col gap-1">
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[24px]">list_alt</span>
                  <span className="text-sm font-semibold">Danh sách</span>
                </Link>
                <Link to="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">bar_chart</span>
                  <span className="text-sm font-medium">Báo cáo</span>
                </Link>
             </nav>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-light overflow-hidden">
        <header className="h-16 border-b border-[#e7edf3] bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Danh sách Điểm Khúc xạ</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenAdd} 
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm điểm mới
            </button>
            <div className="flex gap-2">
               <button className="p-2 rounded-lg bg-slate-100 text-[#0d141b] hover:bg-slate-200">
                 <span className="material-symbols-outlined text-[20px]">notifications</span>
               </button>
            </div>
          </div>
        </header>

        {/* QUAN TRỌNG: Truyền updateSchool xuống Dashboard và SchoolDetail */}
        <Outlet context={{ 
          schools, 
          openAddModal: handleOpenAdd, 
          openEditModal: handleOpenEdit,
          deleteSchool: handleDeleteSchool,
          updateSchool: updateSchool 
        }} />
      </main>
    </div>
  );
};

export default MainLayout;