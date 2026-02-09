import React, { useState, useEffect } from 'react';
import { X, School, MapPin, User, Phone, Users, Save, Calendar as CalIcon } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from  "react-datepicker";
import vi from 'date-fns/locale/vi';

registerLocale('vi', vi);

const datePickerClass = `
  w-full rounded-lg border border-gray-300 h-12 px-4 pl-12 
  focus:ring-2 focus:ring-primary/20 focus:border-primary 
  outline-none transition-all text-base text-gray-700
`;

const SchoolModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // 1. Thay đổi state để lưu startDate và endDate
  const [formData, setFormData] = useState({
    name: '', address: '', manager_name: '', phone: '',
    startDate: new Date(),
    endDate: new Date(), // Thêm endDate
    student_count: 0, notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Nếu là Sửa: startDate và endDate giống nhau (chỉ sửa ngày của card đó)
        const date = initialData.expected_date ? new Date(initialData.expected_date) : new Date();
        setFormData({
            ...initialData,
            startDate: date,
            endDate: date
        });
      } else {
        // Nếu là Thêm mới: Reset
        setFormData({ 
            name: '', address: '', manager_name: '', phone: '', 
            startDate: new Date(), endDate: null, // endDate null để bắt buộc chọn
            student_count: 0, notes: '' 
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Hàm xử lý khi chọn khoảng ngày
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  // 3. Helper tạo danh sách ngày giữa khoảng (Start -> End)
  const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());
    const dates = [];
    // Nếu không có endDate (chọn 1 ngày), thì endDate = startDate
    const finalEnd = endDate || startDate; 

    while (date <= finalEnd) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) { alert("Vui lòng nhập tên trường và số điện thoại!"); return; }
    if (!formData.startDate) { alert("Vui lòng chọn ngày thực hiện!"); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // --- LOGIC QUAN TRỌNG: TẠO MẢNG DỮ LIỆU ---
      // Nếu đang Sửa (initialData có) -> Chỉ trả về 1 object (update chính nó)
      // Nếu đang Thêm Mới -> Trả về 1 mảng các object (mỗi ngày 1 object)
      
      if (initialData) {
         // Chế độ Sửa: Chỉ lấy startDate làm ngày thực hiện
         const formattedDate = formData.startDate.toISOString().split('T')[0];
         onSubmit({ ...formData, expected_date: formattedDate }); 
      } else {
         // Chế độ Thêm mới: Tạo ra N bản ghi
         const dateList = getDatesInRange(formData.startDate, formData.endDate);
         
         const newSchoolsList = dateList.map(date => ({
            ...formData,
            id: Date.now() + Math.random(), // Tạo ID giả ngẫu nhiên
            expected_date: date.toISOString().split('T')[0] // Format YYYY-MM-DD
         }));
         
         onSubmit(newSchoolsList); // Trả về MẢNG
      }

      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Chỉnh sửa' : 'Thêm mới'} Điểm Khúc xạ</h1>
            <p className="text-slate-500 text-sm">Chọn "Từ ngày - Đến ngày" để tạo lịch cho nhiều ngày liên tiếp.</p>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Tên trường <span className="text-red-500">*</span></span><div className="relative"><School size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Tên trường..." /></div></label>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Địa chỉ</span><div className="relative"><MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input name="address" value={formData.address} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" /></div></label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Người phụ trách</span><div className="relative"><User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input name="manager_name" value={formData.manager_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" /></div></label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">SĐT Liên hệ</span><div className="relative"><Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" /></div></label>
            </div>

            {/* 4. DATE PICKER RANGE */}
            <div className="col-span-1">
               <label className="flex flex-col gap-2">
                  <span className="text-gray-900 text-sm font-semibold">Ngày thực hiện (Từ - Đến)</span>
                  <div className="relative w-full">
                    <CalIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                    <DatePicker 
                        selected={formData.startDate} 
                        onChange={handleDateChange} 
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        selectsRange={!initialData} // Chỉ cho chọn Range khi Thêm mới, Sửa thì tắt
                        dateFormat="dd/MM/yyyy"
                        locale="vi"
                        className={datePickerClass}
                        wrapperClassName="w-full"
                        placeholderText="Chọn khoảng thời gian"
                    />
                  </div>
               </label>
            </div>

            <div className="col-span-1">
               <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Số lượng HS (Mỗi ngày)</span><div className="relative"><Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" name="student_count" value={formData.student_count} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" /></div></label>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0 z-20">
          <button onClick={onClose} className="px-6 py-3 rounded-lg text-gray-700 font-semibold border border-gray-300 hover:bg-slate-100">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"><Save size={18} /> Lưu thông tin</button>
        </div>
      </div>
    </div>
  );
};

export default SchoolModal;