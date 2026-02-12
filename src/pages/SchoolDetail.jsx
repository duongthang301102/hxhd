import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import * as XLSX from 'xlsx'; 
import { 
  ArrowLeft, School, Fingerprint, Calendar, HelpCircle,
  Edit, Upload, Download, Trash2, CheckCircle, XCircle, FileSpreadsheet, Phone
} from 'lucide-react';

const SchoolDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { schools, updateSchool } = useOutletContext(); 

  const fileInputRef = useRef(null);

  const foundSchool = schools.find(s => String(s.id) === String(id));
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (foundSchool && foundSchool.students) {
      if (Array.isArray(foundSchool.students)) {
        setStudents(foundSchool.students);
      } else {
        setStudents([]);
      }
    }
  }, [foundSchool]);

  const isLoaded = schools.length > 0;
  if (isLoaded && !foundSchool) {
      return <div className="p-10 text-center text-slate-500">Không tìm thấy trường này.<br/><button onClick={()=>navigate('/')} className="text-primary hover:underline">Quay lại</button></div>;
  }

  const displaySchool = foundSchool || { 
    name: "Đang tải dữ liệu...", address: "...", manager_name: "...", 
    status: "...", date: "...", phone: "..." 
  };

  const handleUpdateData = (newData) => {
    if (!foundSchool) return;
    updateSchool({ ...foundSchool, ...newData });
  };

  const toggleStatus = () => {
    if (!foundSchool) return;
    let newStatus = displaySchool.status === "Hoàn thành" ? "Đang chờ" : "Hoàn thành";
    if (displaySchool.status === "Hoàn thành" && !window.confirm("Đánh dấu là CHƯA hoàn thành?")) return;
    handleUpdateData({ status: newStatus });
  };

  const handleDeleteAllStudents = () => {
    if(window.confirm("Bạn chắc chắn muốn xóa toàn bộ danh sách học sinh?")) {
        setStudents([]);
        handleUpdateData({ students: [], student_count: 0 });
    }
  };

  // --- 1. CẬP NHẬT TEMPLATE EXCEL ---
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 
        "STT": 1, "Họ và tên": "Nguyễn Văn A", "Lớp": "1A", 
        "Thị lực Trái": "10/10", "Thị lực Phải": "10/10", 
        "Chẩn đoán": "Bình thường", "Loại": "OR", 
        "SĐT Phụ huynh": "0909123456", // <--- Cột Mới
        "Ghi chú": "" 
      }
    ]);
    // Chỉnh độ rộng cột
    ws['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 10 }, 
        { wch: 10 }, { wch: 10 }, { wch: 20 }, 
        { wch: 10 }, { wch: 15 }, { wch: 20 } // Thêm độ rộng cho cột SĐT
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachMau");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh_Moi.xlsx");
  };

  const handleImportClick = () => fileInputRef.current.click();

  // --- 2. CẬP NHẬT LOGIC IMPORT ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      const importedStudents = data.slice(1).map((row, index) => ({
        id: Date.now() + index,
        name: row[1] || "Không tên",
        class: row[2] || "",
        visionL: row[3] || "",
        visionR: row[4] || "",
        diagnosis: row[5] || "",
        type: row[6] || "",
        phone: row[7] || "", // <--- Đọc cột SĐT (Cột thứ 8, index 7)
        note: row[8] || ""   // <--- Ghi chú đẩy xuống index 8
      })).filter(s => s.name !== "Không tên");

      const newStudentList = [...students, ...importedStudents];
      setStudents(newStudentList);
      handleUpdateData({ students: newStudentList, student_count: newStudentList.length });

      alert(`Đã import thành công ${importedStudents.length} học sinh!`);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const getTypeBadge = (t) => t==='OR'?'bg-purple-100 text-purple-700 border-purple-200':(t==='OR-CK'?'bg-pink-100 text-pink-700 border-pink-200':'bg-gray-50 text-gray-500');
  const getDiagnosisStyle = (t) => t==='Bình thường'?'bg-green-100 text-green-700':(t==='Cận thị'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-700');

  return (
    <div className="flex-1 flex flex-col w-full h-full px-6 py-6 overflow-y-auto bg-background-light">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
         <div className="flex flex-wrap items-center gap-2 text-sm">
             <span className="text-slate-400 font-medium cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Trang chủ</span>
             <span className="text-slate-300">/</span><span className="text-gray-900 font-semibold">Chi tiết</span>
         </div>
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"><ArrowLeft size={18} /> Quay lại</button>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 shrink-0">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex gap-6 items-center">
            <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><School size={40} /></div>
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 text-3xl font-black leading-tight">{displaySchool.name}</h1>
              <div className="flex items-center gap-4 mt-1"><p className="text-slate-500 text-sm font-medium flex items-center gap-1"><Fingerprint size={16} /> Mã: REF-{displaySchool.id}</p><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${displaySchool.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{displaySchool.status}</span></div>
            </div>
          </div>
          <button onClick={toggleStatus} className={`flex items-center gap-2 h-11 px-5 border text-sm font-bold rounded-lg transition-colors ${displaySchool.status === 'Hoàn thành' ? 'bg-white border-amber-500 text-amber-600' : 'bg-white border-green-500 text-green-600'}`}>{displaySchool.status === 'Hoàn thành' ? <> <XCircle size={18} /> Báo chưa xong </> : <> <CheckCircle size={18} /> Xác nhận hoàn thành </>}</button>
        </div>
      </div>

      {/* Info Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 shrink-0">
        <div className="flex items-center gap-2 px-6 pt-6 pb-2"><HelpCircle size={20} className="text-primary" /><h2 className="text-gray-900 text-lg font-bold">Thông tin chung</h2></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <InfoItem label="Địa chỉ" value={displaySchool.address} />
          <InfoItem label="Người phụ trách" value={displaySchool.manager_name} isUser />
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ngày thực hiện</p><div className="flex items-center gap-2"><Calendar size={18} className="text-primary" /><p className="text-gray-900 text-base font-bold">{displaySchool.date}</p></div></div>
          <InfoItem label="Số điện thoại" value={displaySchool.phone || "---"} />
          <InfoItem label="Email liên hệ" value="email@school.edu.vn" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200">
             <div className="flex items-center gap-2"><div className="bg-primary/10 p-1.5 rounded text-primary"><FileSpreadsheet size={20} /></div><h2 className="text-gray-900 text-lg font-bold">Danh sách đo khúc xạ</h2><span className="text-sm text-slate-500 font-medium ml-2">({students.length} HS)</span></div>
             <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                <button onClick={handleDeleteAllStudents} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16} /> Xóa</button>
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"><Download size={16} /> Tải mẫu</button>
                <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm"><Upload size={16} /> Import Excel</button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider w-10">STT</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Họ tên</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider w-16">Lớp</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Thị lực</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Chẩn đoán</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Loại</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">SĐT PH</th><th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Ghi chú</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {students.length > 0 ? (
                    students.map((student, index) => (
                        <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{student.class}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">L:{student.visionL} - R:{student.visionR}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-bold ${getDiagnosisStyle(student.diagnosis)}`}>{student.diagnosis}</span></td>
                        <td className="px-6 py-4">{student.type && (<span className={`px-2 py-0.5 rounded border text-xs font-bold ${getTypeBadge(student.type)}`}>{student.type}</span>)}</td>
                        
                        {/* --- 3. HIỂN THỊ CỘT SĐT --- */}
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                           {student.phone ? (
                             <div className="flex items-center gap-1">
                               <Phone size={12} className="text-slate-400"/> {student.phone}
                             </div>
                           ) : '--'}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400 italic">{student.note}</td>
                        </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="px-6 py-10 text-center text-slate-400 italic">Chưa có dữ liệu. Hãy Import Excel.</td></tr>
                  )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};
const InfoItem = ({ label, value, isUser }) => (<div className="flex flex-col gap-1 border-t border-gray-100 pt-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>{isUser ? <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">NV</div><p className="text-gray-900 text-base font-medium">{value}</p></div> : <p className="text-gray-900 text-base font-medium">{value}</p>}</div>);
export default SchoolDetail;