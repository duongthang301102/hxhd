import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LayoutGrid, List, Edit, Trash2, CalendarDays, Calendar, ChevronDown, Search } from 'lucide-react';

const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const SchoolListView = ({ schools, onEdit, onDelete, onViewDetail }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e7edf3] overflow-hidden animate-in fade-in duration-500 h-full flex flex-col">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider w-10">STT</th>
              <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Tên Điểm / Trường</th>
              <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Ngày thực hiện</th>
              <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {schools.length > 0 ? (
              schools.map((school, index) => (
                <tr key={school.id} onClick={() => onViewDetail(school)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4"><p className="text-sm font-bold text-[#0d141b]">{school.name}</p><p className="text-xs text-slate-400 mt-0.5">{school.address}</p></td>
                  <td className="px-6 py-4 text-sm text-slate-600">{school.date || "---"}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${school.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{school.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(school); }} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-primary transition-colors"><Edit size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(school.id); }} className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">Không có dữ liệu phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- FIX LỖI Ở COMPONENT NÀY ---
const SchoolCard = ({ schoolData, onEdit, onDelete, onClick }) => {
  const { name, students, address, status } = schoolData;
  
  // FIX: Kiểm tra nếu students là Mảng thì lấy length, nếu là số thì giữ nguyên
  const studentCount = Array.isArray(students) ? students.length : (students || 0);

  let statusClass = "text-slate-400 bg-slate-50";
  if (status === "Hoàn thành") statusClass = "text-green-600 bg-green-50";
  if (status === "Đang chờ") statusClass = "text-amber-600 bg-amber-50";

  return (
    <div onClick={onClick} className="relative bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer shrink-0 select-none mb-1 mx-1">
      <div className="absolute top-3 right-3 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={(e) => { e.stopPropagation(); onEdit(schoolData); }} className="p-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-primary border border-slate-100 shadow-sm transition-colors"><Edit size={14}/></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(schoolData.id); }} className="p-1.5 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100 shadow-sm transition-colors"><Trash2 size={14}/></button>
      </div>
      <div className="block p-4">
        <div className="flex justify-between items-start mb-3 pr-14"><h4 className="text-sm font-bold text-[#0d141b] leading-tight line-clamp-2">{name}</h4></div>
        <div className="flex flex-col gap-2">
            {/* Sửa hiển thị số lượng ở đây */}
            <div className="flex items-center gap-2 text-xs text-[#4c739a]"><span className="material-symbols-outlined text-[16px]">groups</span><span>{studentCount} học sinh</span></div>
            <div className="flex items-center gap-2 text-xs text-[#4c739a]"><span className="material-symbols-outlined text-[16px]">location_on</span><span className="truncate max-w-[150px]">{address}</span></div>
            <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${statusClass}`}>{status}</span></div>
        </div>
      </div>
    </div>
  );
};

const DateColumn = ({ day, dateFull, count, isToday, children }) => {
    return (
      <div className={`min-w-[220px] max-w-[220px] flex flex-col h-full gap-0 snap-start select-none transition-opacity duration-500 ${children.length === 0 ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>
        <div className={`flex shrink-0 items-center justify-between px-3 py-2 rounded-t-lg border-b transition-colors mb-2 ${isToday ? 'bg-blue-50 border-blue-100' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center gap-2">
             <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white border border-slate-200 text-slate-600'}`}>
                <span className="text-[10px] font-bold uppercase leading-none">{dateFull.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                <span className="text-lg font-bold leading-none">{day}</span>
             </div>
             <div className="flex flex-col">
                <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-slate-500'}`}>{isToday ? 'Hôm nay' : `Ngày ${day}`}</span>
                <span className="text-[10px] text-slate-400">{children.length} điểm</span>
             </div>
          </div>
          {children.length > 0 && <span className="size-2 rounded-full bg-green-500"></span>}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-20 pt-2 flex flex-col gap-3">
            {children}
            {children.length === 0 && (<div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs">Trống</div>)}
        </div>
      </div>
    );
};

const Dashboard = () => {
  const scrollRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('kanban'); 

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const yearsList = [currentYear - 1, currentYear, currentYear + 1];

  const navigate = useNavigate();
  const { schools, openAddModal, openEditModal, deleteSchool } = useOutletContext(); 

  const COL_WIDTH = 220; 
  const GAP = 24;       
  const SCROLL_AMOUNT = COL_WIDTH + GAP; 

  const scroll = (direction) => { if (scrollRef.current) scrollRef.current.scrollBy({ left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' }); };
  const handleScroll = () => { if (scrollRef.current) { const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current; setShowLeftBtn(scrollLeft > 5); setShowRightBtn(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1); } };
  
  useLayoutEffect(() => {
    if (scrollRef.current) {
        const today = new Date();
        const realYear = today.getFullYear();
        const realMonth = today.getMonth() + 1;
        const realDay = today.getDate();

        if (parseInt(selectedYear) === realYear && parseInt(selectedMonth) === realMonth) {
            const scrollPosition = (realDay - 1) * SCROLL_AMOUNT;
            scrollRef.current.scrollLeft = scrollPosition;
        } else {
            scrollRef.current.scrollLeft = 0;
        }
        setShowLeftBtn(scrollRef.current.scrollLeft > 5);
    }
  }, [viewMode, selectedMonth, selectedYear]); 

  useEffect(() => { const el = scrollRef.current; if (el) el.addEventListener('scroll', handleScroll); return () => el?.removeEventListener('scroll', handleScroll); }, []);

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  const filteredSchools = schools.filter(school => {
      const schoolDate = new Date(school.date);
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || (school.address && school.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTime = schoolDate.getFullYear() === parseInt(selectedYear) && (schoolDate.getMonth() + 1) === parseInt(selectedMonth);
      return matchesSearch && matchesTime;
  });

  const handleViewDetail = (school) => navigate(`/school/${school.id}`, { state: { school } });
  const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <style>{customScrollbarStyle}</style>

      <div className="px-6 py-4 flex flex-wrap items-center justify-between bg-white border-b border-[#e7edf3] shrink-0 gap-4 shadow-sm z-20">
         <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col min-w-[120px]">
              <p className="text-[10px] font-bold text-[#4c739a] uppercase tracking-[0.05em] mb-1.5">Năm học</p>
              <div className="relative group">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors"/>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 pl-9 pr-8 font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-primary/50 hover:bg-white transition-all focus:ring-2 focus:ring-primary/20">
                    {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600"/>
              </div>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <p className="text-[10px] font-bold text-[#4c739a] uppercase tracking-[0.05em] mb-1.5">Tháng</p>
              <div className="relative group">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors"/>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 pl-9 pr-8 font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-primary/50 hover:bg-white transition-all focus:ring-2 focus:ring-primary/20">
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600"/>
              </div>
            </div>
            <div className="flex flex-col flex-1 max-w-[400px]">
              <p className="text-[10px] font-bold text-[#4c739a] uppercase tracking-[0.05em] mb-1.5">Tìm nhanh</p>
              <div className="relative flex items-center group">
                <Search size={18} className="absolute left-3 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-sm w-full focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-slate-400 transition-all font-medium" placeholder="Nhập tên trường, địa chỉ..." type="text" />
              </div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`} title="Danh sách"><List size={20} /></button>
                <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`} title="Lịch"><LayoutGrid size={20} /></button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <span className="text-sm text-[#4c739a]"><strong>{filteredSchools.length}</strong> kết quả</span>
         </div>
      </div>

      <div className="flex-1 overflow-hidden bg-background-light relative">
        {viewMode === 'list' && (
            <div className="h-full overflow-hidden p-6 animate-in slide-in-from-bottom-2 duration-300">
                <SchoolListView schools={filteredSchools} onEdit={openEditModal} onDelete={deleteSchool} onViewDetail={handleViewDetail} />
            </div>
        )}

        {viewMode === 'kanban' && (
            <div className="h-full relative select-none group/board animate-in slide-in-from-bottom-2 duration-300">
                <button onClick={() => scroll('left')} className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-100 text-slate-400 hover:text-primary hover:shadow-lg hover:scale-110 transition-all duration-300 ${showLeftBtn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}><span className="material-symbols-outlined text-[24px]">chevron_left</span></button>
                <button onClick={() => scroll('right')} className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-100 text-slate-400 hover:text-primary hover:shadow-lg hover:scale-105 transition-all duration-300 ${showRightBtn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}><span className="material-symbols-outlined text-[24px]">chevron_right</span></button>

                <div ref={scrollRef} className="flex gap-6 h-full px-6 py-6 overflow-x-auto snap-x snap-mandatory scroll-pl-6 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                {daysArray.map((day) => {
                    const schoolsToday = filteredSchools.filter(s => new Date(s.date).getDate() === day);
                    const dateFull = new Date(selectedYear, selectedMonth - 1, day);
                    const isToday = new Date().toDateString() === dateFull.toDateString();
                    return (
                    <DateColumn key={day} day={day} dateFull={dateFull} count={schoolsToday.length} isToday={isToday}>
                        {schoolsToday.map(school => (
                            <SchoolCard key={school.id} schoolData={school} onEdit={openEditModal} onDelete={deleteSchool} onClick={() => handleViewDetail(school)} />
                        ))}
                    </DateColumn>
                    );
                })}
                <div className="min-w-[1px]"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;