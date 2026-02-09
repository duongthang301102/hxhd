import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'; // Thêm useOutletContext
import * as XLSX from 'xlsx'; // Import thư viện Excel
import { 
  ArrowLeft, School, Fingerprint, Calendar, HelpCircle, MessageSquare,
  Edit, Upload, Download, Trash2, CheckCircle, XCircle, FileSpreadsheet
} from 'lucide-react';

const SchoolDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy hàm updateSchool từ MainLayout
  const { updateSchool } = useOutletContext(); 

  const schoolDataInitial = location.state?.school || {
    id: 0, name: "Dữ liệu mẫu", status: "Chưa bắt đầu", address: "", manager_name: "", phone: "", date: ""
  };

  // State local
  const [schoolData, setSchoolData] = useState(schoolDataInitial);
  const [students, setStudents] = useState([
    { id: 1, name: "Nguyễn Văn A", class: "3A", visionL: "10/10", visionR: "10/10", diagnosis: "Bình thường", note: "" }
  ]);
  const fileInputRef = useRef(null);

  // Cập nhật lại schoolData khi location thay đổi (để đảm bảo dữ liệu mới nhất)
  useEffect(() => {
    if (location.state?.school) {
        setSchoolData(location.state.school);
    }
  }, [location.state]);

  // --- LOGIC MỚI: ĐỒNG BỘ TRẠNG THÁI ---
  const toggleStatus = () => {
    let newStatus = schoolData.status;
    
    if (schoolData.status === "Hoàn thành") {
      if(window.confirm("Đánh dấu là CHƯA hoàn thành?")) newStatus = "Đang chờ";
    } else {
      newStatus = "Hoàn thành";
    }

    // 1. Cập nhật state tại trang này (để giao diện đổi màu ngay)
    const updatedSchool = { ...schoolData, status: newStatus };
    setSchoolData(updatedSchool);

    // 2. Gọi ngược lên MainLayout để Dashboard cũng đổi theo
    updateSchool(updatedSchool);
  };

  // --- LOGIC MỚI: TẢI FILE XLSX ---
  const handleDownloadTemplate = () => {
    // Tạo dữ liệu mẫu chuẩn Excel
    const ws = XLSX.utils.json_to_sheet([
      { "STT": 1, "Họ và tên": "Nguyễn Văn A", "Lớp": "1A", "Thị lực Trái": "10/10", "Thị lực Phải": "10/10", "Chẩn đoán": "Bình thường", "Ghi chú": "" }
    ]);
    
    // Chỉnh độ rộng cột cho đẹp
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachMau");
    
    // Tải file xuống
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh.xlsx");
  };

  // --- LOGIC MỚI: IMPORT FILE XLSX ---
  const handleImportClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // Chuyển Excel thành JSON
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // header: 1 để lấy mảng mảng
      
      // Bỏ dòng tiêu đề (dòng 0), map dữ liệu
      // Giả sử file excel cột theo thứ tự: STT, Tên, Lớp, L, R, Chẩn đoán, Ghi chú
      const importedStudents = data.slice(1).map((row, index) => ({
        id: Date.now() + index,
        name: row[1] || "Không tên",
        class: row[2] || "",
        visionL: row[3] || "",
        visionR: row[4] || "",
        diagnosis: row[5] || "",
        note: row[6] || ""
      })).filter(s => s.name !== "Không tên"); // Lọc dòng rỗng

      setStudents(prev => [...prev, ...importedStudents]);
      alert(`Đã import thành công ${importedStudents.length} học sinh!`);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input
  };

  // Các hàm helper cũ
  const getDiagnosisStyle = (type) => { switch (type) { case 'Bình thường': return 'bg-green-100 text-green-700'; case 'Cận thị': return 'bg-orange-100 text-orange-700'; default: return 'bg-gray-100 text-gray-700'; } };
  const getVisionStyle = (val) => { 
      if(!val) return 'bg-slate-100 text-slate-700';
      const score = parseInt(String(val).split('/')[0]); 
      return score < 7 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'; 
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full px-6 py-6 overflow-y-auto bg-background-light">
      {/* Header Breadcrumb giữ nguyên */}
      <div className="flex items-center justify-between mb-6 shrink-0">
         <div className="flex flex-wrap items-center gap-2 text-sm">
             <span className="text-slate-400 font-medium cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Trang chủ</span>
             <span className="text-slate-300">/</span>
             <span className="text-slate-400 font-medium hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Danh sách điểm</span>
             <span className="text-slate-300">/</span>
             <span className="text-gray-900 font-semibold">Chi tiết</span>
         </div>
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"><ArrowLeft size={18} /> Quay lại</button>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 shrink-0">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex gap-6 items-center">
            <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><School size={40} /></div>
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 text-3xl font-black leading-tight">{schoolData.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-slate-500 text-sm font-medium flex items-center gap-1"><Fingerprint size={16} /> Mã điểm: REF-2024-{schoolData.id}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${schoolData.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {schoolData.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleStatus}
                className={`flex items-center gap-2 h-11 px-5 border text-sm font-bold rounded-lg transition-colors ${
                  schoolData.status === 'Hoàn thành' 
                    ? 'bg-white border-amber-500 text-amber-600 hover:bg-amber-50' 
                    : 'bg-white border-green-500 text-green-600 hover:bg-green-50'
                }`}
             >
                {schoolData.status === 'Hoàn thành' ? ( <> <XCircle size={18} /> Báo chưa xong </> ) : ( <> <CheckCircle size={18} /> Xác nhận hoàn thành </> )}
             </button>
             <button className="flex items-center gap-2 h-11 px-5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors"><Edit size={18} /> Chỉnh sửa</button>
          </div>
        </div>
      </div>

      {/* ... (INFO SECTION giữ nguyên) ... */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 shrink-0">
        <div className="flex items-center gap-2 px-6 pt-6 pb-2"><HelpCircle size={20} className="text-primary" /><h2 className="text-gray-900 text-lg font-bold">Thông tin chung</h2></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <InfoItem label="Địa chỉ" value={schoolData.address} />
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Người phụ trách</p><div className="flex items-center gap-2"><div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">NV</div><p className="text-gray-900 text-base font-medium">{schoolData.manager_name || "Chưa cập nhật"}</p></div></div>
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ngày đến điểm</p><div className="flex items-center gap-2"><Calendar size={18} className="text-primary" /><p className="text-gray-900 text-base font-bold">{schoolData.date}</p></div></div>
          <InfoItem label="Số điện thoại" value={schoolData.phone || "---"} />
          <InfoItem label="Email liên hệ" value="email@school.edu.vn" className="md:col-span-1 lg:col-span-2" />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200">
             <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded text-primary"><FileSpreadsheet size={20} /></div>
                <h2 className="text-gray-900 text-lg font-bold">Danh sách đo khúc xạ</h2>
                <span className="text-sm text-slate-500 font-medium ml-2">({students.length} học sinh)</span>
             </div>
             
             <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => setStudents([])} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16} /> Xóa dữ liệu</button>
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Download size={16} /> Tải file mẫu XLSX</button>
                <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"><Upload size={16} /> Import Excel</button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider w-16">STT</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Họ và tên học sinh</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Lớp</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Thị lực (L/R)</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Chẩn đoán</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Ghi chú</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 select-text">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{student.class}</td>
                      <td className="px-6 py-4"><div className="flex gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getVisionStyle(student.visionL)}`}>L: {student.visionL}</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${getVisionStyle(student.visionR)}`}>R: {student.visionR}</span></div></td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getDiagnosisStyle(student.diagnosis)}`}>{student.diagnosis}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-400 italic">{student.note}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};
const InfoItem = ({ label, value, className = "" }) => (<div className={`flex flex-col gap-1 border-t border-gray-100 pt-4 ${className}`}><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p><p className="text-gray-900 text-base font-medium">{value}</p></div>);
export default SchoolDetail;