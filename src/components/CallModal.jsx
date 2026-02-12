import React, { useEffect, useState, useRef } from 'react';
import { PhoneOff, Mic, MicOff, User } from 'lucide-react';
import { sipController } from '../utils/SipController';

const SIP_CONFIG = {
  domain: "192.168.145.128", 
  port: "8089",            
  extension: "101",        
  password: "Thang30112002@"
};

const CallModal = ({ isOpen, onClose, phoneNumber, studentName, onRecordingFound }) => {
  const [status, setStatus] = useState("Đang khởi tạo...");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Hàm lấy ghi âm
  const fetchRecording = async (phone) => {
    // Đợi 4s để server lưu file xong
    setTimeout(async () => {
        try {
            console.log("📡 Đang lấy ghi âm...");
            const res = await fetch(`http://localhost:3001/api/recording?phone=${phone}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                
                // Gửi URL ra ngoài cho Telesale.js hiển thị nút Play
                if (onRecordingFound) {
                    onRecordingFound(phone, url);
                }
                console.log("✅ Đã lấy được file ghi âm:", url);
            } 
        } catch (err) {
            console.error("Lỗi lấy ghi âm:", err);
        }
    }, 4000); 
  };

  useEffect(() => {
    let mounted = true;

    if (isOpen && phoneNumber) {
      const initCall = async () => {
        try {
          setStatus("Đang kết nối...");
          // 1. Kết nối tổng đài
          await sipController.connect(SIP_CONFIG);
          
          if (!mounted) return;

          // 2. Gọi điện
          // QUAN TRỌNG: Phải truyền đủ 4 tham số: Số, Domain, Audio, Callback
          await sipController.call(
            phoneNumber,
            SIP_CONFIG.domain,  // <--- Đã thêm tham số này để sửa lỗi "undefined"
            audioRef.current,
            (newStatus) => {
              if (mounted) setStatus(newStatus);
              
              // KHI KẾT THÚC -> GỌI HÀM LẤY GHI ÂM
              if (newStatus === "Cuộc gọi kết thúc") {
                 fetchRecording(phoneNumber);
                 // Đóng modal sau 2 giây
                 setTimeout(() => { if (mounted) onClose(); }, 2000);
              }
            }
          );
        } catch (error) {
          if (mounted) setStatus("Lỗi: " + error.message);
        }
      };
      initCall();
    } else {
      sipController.hangup();
    }
    return () => { mounted = false; };
  }, [isOpen, phoneNumber]);

  const handleHangup = () => {
    sipController.hangup();
    onClose();
  };

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    sipController.toggleMute(newState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-80 rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-slate-700 animate-in zoom-in duration-300">
        <div className="size-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 border-4 border-slate-700 shadow-inner">
            <User size={40} className="text-slate-400" />
        </div>
        <h3 className="text-white text-xl font-bold mb-1">{studentName}</h3>
        <p className="text-slate-400 text-lg font-mono mb-6">{phoneNumber}</p>
        
        <div className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full mb-8 animate-pulse">
            {status}
        </div>

        <div className="flex items-center gap-6">
            <button onClick={handleToggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                {isMuted ? <MicOff size={24}/> : <Mic size={24}/>}
            </button>
            <button onClick={handleHangup} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all transform hover:scale-110">
                <PhoneOff size={28} fill="currentColor" />
            </button>
        </div>
        <audio ref={audioRef} autoPlay hidden />
      </div>
    </div>
  );
};

export default CallModal;