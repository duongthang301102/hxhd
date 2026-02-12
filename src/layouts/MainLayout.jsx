import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import SchoolModal from '../components/SchoolModal';
import { PhoneCall } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from '../firebase';
import { ref, onValue, set, remove, update } from "firebase/database";

const MainLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  // State schools ban đầu là mảng rỗng, đợi Firebase load về
  const [schools, setSchools] = useState([]);

  // --- 1. LẮNG NGHE DỮ LIỆU TỪ FIREBASE (REALTIME) ---
  useEffect(() => {
    const schoolsRef = ref(db, 'schools');
    
    // onValue sẽ chạy mỗi khi dữ liệu trên Firebase thay đổi
    const unsubscribe = onValue(schoolsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase trả về Object (key: value), ta chuyển thành Array để React dễ dùng
        // Object.values(data) sẽ lấy ra mảng các school
        const schoolsArray = Object.keys(data).map(key => ({
            ...data[key],
            id: key // Đảm bảo ID khớp với Key trên Firebase
        }));
        setSchools(schoolsArray);
      } else {
        setSchools([]); // Nếu xóa hết thì set về rỗng
      }
    });

    return () => unsubscribe(); // Cleanup khi component unmount
  }, []);

  // 2. Hàm mở Modal Thêm mới
  const handleOpenAdd = () => {
    setEditingSchool(null);
    setIsModalOpen(true);
  };

  // 3. Hàm mở Modal Sửa
  const handleOpenEdit = (school) => {
    setEditingSchool({
        ...school,
        student_count: school.students ? (Array.isArray(school.students) ? school.students.length : school.students) : 0,
        expected_date: school.date,
    });
    setIsModalOpen(true);
  };

  // --- 4. XỬ LÝ LƯU (THÊM/SỬA) LÊN FIREBASE ---
  const handleSaveSchool = (dataReceived) => {
    if (editingSchool) {
      // --- LOGIC SỬA: Đẩy update lên Firebase ---
      const updatedData = {
        ...editingSchool, // Giữ lại data cũ
        ...dataReceived,  // Ghi đè data mới
        students: dataReceived.student_count || 0, // Lưu tạm số lượng
        date: dataReceived.expected_date,
        // Nếu có students array cũ thì giữ nguyên, không để bị mất
        students: editingSchool.students || [] 
      };

      // Update node cụ thể trên Firebase
      update(ref(db, `schools/${editingSchool.id}`), updatedData)
        .then(() => console.log("Đã cập nhật thành công"))
        .catch((err) => alert("Lỗi cập nhật: " + err));

    } else {
      // --- LOGIC THÊM MỚI: Đẩy set mới lên Firebase ---
      const inputData = Array.isArray(dataReceived) ? dataReceived : [dataReceived];

      inputData.forEach(item => {
        // Tạo ID duy nhất (dùng timestamp cho đơn giản và unique)
        // Lưu ý: ID phải là String để làm Key trên Firebase
        const newId = `school_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const newSchool = {
            ...item,
            id: newId,
            students: item.student_count || [],
            status: "Chưa bắt đầu",
            date: item.expected_date,
        };

        // Ghi dữ liệu mới vào path schools/newId
        set(ref(db, `schools/${newId}`), newSchool);
      });
    }
  };

  // --- 5. XÓA TRÊN FIREBASE ---
  const handleDeleteSchool = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa điểm trường này không? Dữ liệu trên Firebase sẽ mất vĩnh viễn.")) {
      remove(ref(db, `schools/${id}`))
        .catch(err => alert("Lỗi khi xóa: " + err));
    }
  };

  // --- 6. UPDATE (DÙNG CHO SCHOOL DETAIL & TELESALE) ---
  const updateSchool = (updatedData) => {
    // Chỉ update những trường thay đổi lên Firebase
    update(ref(db, `schools/${updatedData.id}`), updatedData);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light text-[#0d141b]">
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
                
                {/* MENU TELESALE */}
                <Link to="/telesale" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 transition-colors focus:bg-primary/10 focus:text-primary">
                  <PhoneCall size={24} />
                  <span className="text-sm font-medium">Telesale</span>
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