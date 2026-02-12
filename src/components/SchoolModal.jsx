import React, { useState, useEffect, useRef } from 'react';
import { X, School, MapPin, User, Phone, Users, Save, Calendar as CalIcon, Search, Check } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from 'date-fns/locale/vi';

registerLocale('vi', vi);

// Danh sách trường mẫu để gợi ý
const MOCK_SCHOOLS = [
  "Trường THCS Nguyễn Du", "Trường THCS Lê Quý Đôn", "Trường THCS Trưng Vương",
  "Trường Tiểu học Kim Đồng", "Trường Tiểu học Lê Văn Tám", "Trường THPT Chuyên Trần Hưng Đạo"
];

const datePickerClass = `w-full rounded-lg border border-gray-300 h-12 px-4 pl-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base text-gray-700`;

const SchoolModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', address: '', manager_name: '', phone: '',
    startDate: new Date(), endDate: new Date(),
    student_count: 0, notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const date = initialData.expected_date ? new Date(initialData.expected_date) : new Date();
        setFormData({ ...initialData, startDate: date, endDate: date });
      } else {
        const today = new Date();
        today.setHours(0,0,0,0);
        setFormData({ 
            name: '', address: '', manager_name: '', phone: '', 
            startDate: today, endDate: null, student_count: 0, notes: '' 
        });
      }
      setShowSuggestions(false);
    }
  }, [isOpen, initialData]);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    if (value.length > 0) {
      const filtered = MOCK_SCHOOLS.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setFilteredSchools(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSchool = (name) => {
    setFormData(prev => ({ ...prev, name }));
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  // Helper date logic
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(12, 0, 0, 0); 
    let stopDate = new Date(endDate || startDate);
    stopDate.setHours(12, 0, 0, 0);
    while (currentDate.getTime() <= stopDate.getTime()) {
      dates.push(new Date(currentDate)); 
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = () => {
    if (!formData.name) { alert("Vui lòng nhập tên trường!"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (initialData) {
         const formattedDate = formatLocalDate(formData.startDate);
         onSubmit({ ...formData, expected_date: formattedDate }); 
      } else {
         const dateList = getDatesInRange(formData.startDate, formData.endDate);
         const newSchoolsList = dateList.map(date => ({
            ...formData,
            id: Date.now() + Math.random(),
            expected_date: formatLocalDate(date) 
         }));
         onSubmit(newSchoolsList);
      }
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div><h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Chỉnh sửa' : 'Thêm mới'} Điểm Khúc xạ</h1></div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tên trường Autocomplete */}
            <div className="col-span-1 md:col-span-2 relative" ref={wrapperRef}>
              <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Tên trường <span className="text-red-500">*</span></span>
                <div className="relative">
                  <School size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="name" value={formData.name} onChange={handleNameChange} onFocus={() => formData.name && setShowSuggestions(true)} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nhập tên trường..." autoComplete="off" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><Search size={16} /></div>
                </div>
              </label>
              {showSuggestions && filteredSchools.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredSchools.map((s, i) => (
                    <li key={i} onClick={() => selectSchool(s)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between group">
                      <span className="font-medium group-hover:text-primary">{s}</span><Check size={16} className="text-primary opacity-0 group-hover:opacity-100" />
                    </li>
                  ))}
                </ul>
              )}
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
            <div className="col-span-1">
               <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Ngày thực hiện</span><div className="relative w-full"><CalIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" /><DatePicker selected={formData.startDate} onChange={handleDateChange} startDate={formData.startDate} endDate={formData.endDate} selectsRange={!initialData} dateFormat="dd/MM/yyyy" locale="vi" className={datePickerClass} wrapperClassName="w-full" placeholderText="Chọn thời gian" /></div></label>
            </div>
            <div className="col-span-1">
               <label className="flex flex-col gap-2"><span className="text-gray-900 text-sm font-semibold">Số lượng HS</span><div className="relative"><Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" name="student_count" value={formData.student_count} onChange={handleChange} className="w-full rounded-lg border border-gray-300 h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none" /></div></label>
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