import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PhoneCall, Calendar, User, School, Phone, PlayCircle } from 'lucide-react'; 
import CallModal from '../components/CallModal';

const Telesale = () => {
  const { schools } = useOutletContext();
  const [isCalling, setIsCalling] = useState(false);
  const [currentCall, setCurrentCall] = useState({ name: "", phone: "" });

  // 1. State lưu danh sách file ghi âm: { "090123": "blob:http://..." }
  const [recordings, setRecordings] = useState({});

  const telesaleData = schools.flatMap(school => {
    if (!school.students || !Array.isArray(school.students)) return [];
    return school.students
      .filter(s => s.type === 'OR' || s.type === 'OR-CK')
      .map(s => ({
        ...s,
        schoolName: school.name,
        visitDate: school.date,
        schoolAddress: school.address,
        phone: s.phone || school.phone || "101" 
      }));
  });

  const handleCall = (student) => {
    if (!student.phone) return alert("Không tìm thấy số điện thoại!");
    setCurrentCall({ name: student.name, phone: student.phone });
    setIsCalling(true);
  };

  // 2. Hàm nhận file từ Modal bắn ra
  const handleRecordingUpdate = (phone, url) => {
      setRecordings(prev => ({
          ...prev,
          [phone]: url // Lưu URL vào state theo số điện thoại
      }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light overflow-hidden">
      <CallModal 
        isOpen={isCalling} 
        onClose={() => setIsCalling(false)} 
        phoneNumber={currentCall.phone}
        studentName={currentCall.name}
        // Truyền hàm callback vào đây
        onRecordingFound={handleRecordingUpdate}
      />

      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><PhoneCall size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách Telesale</h1>
            <p className="text-slate-500 text-sm">Tổng hợp học sinh loại OR và OR-CK cần tư vấn ({telesaleData.length} kết quả)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Họ tên học sinh</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">SĐT Liên hệ</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Thông tin khúc xạ</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Loại</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Trường học</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Ngày khám</th>
                {/* Mở rộng cột này ra chút để chứa Player */}
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-right min-w-[200px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {telesaleData.length > 0 ? (
                telesaleData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={16}/></div>
                        <div><p className="text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-slate-500">Lớp: {item.class}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 font-mono">
                            <Phone size={14} className="text-slate-400"/>
                            {item.phone}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700"><span className="mr-2">L: <b>{item.visionL}</b></span><span>R: <b>{item.visionR}</b></span></div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.diagnosis}</p>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded border text-xs font-bold ${item.type === 'OR' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-pink-100 text-pink-700 border-pink-200'}`}>{item.type}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-700"><School size={14} className="text-slate-400"/><span className="truncate max-w-[200px]" title={item.schoolName}>{item.schoolName}</span></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-700"><Calendar size={14} className="text-slate-400"/><span>{item.visitDate}</span></div></td>
                    
                    {/* CỘT HÀNH ĐỘNG: LOGIC HIỂN THỊ */}
                    <td className="px-6 py-4 text-right">
                        {/* Nếu đã có ghi âm -> Hiện nút Play */}
                        {recordings[item.phone] ? (
                            <div className="flex flex-col items-end gap-1 animate-in fade-in zoom-in duration-300">
                                <audio controls src={recordings[item.phone]} className="h-8 w-48 shadow-sm rounded-full" />
                                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 rounded-full">Đã gọi xong</span>
                            </div>
                        ) : (
                            /* Nếu chưa có -> Hiện nút Gọi */
                            <button onClick={() => handleCall(item)} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-blue-600 shadow-sm transition-colors flex items-center gap-1 ml-auto">
                                <PhoneCall size={14} /> Gọi điện
                            </button>
                        )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">Chưa có dữ liệu telesale (Cần có học sinh loại OR hoặc OR-CK).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Telesale;