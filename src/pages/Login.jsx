import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[600px]">
        
        {/* Cột Trái: Hình ảnh */}
        <div className="w-full md:w-1/2 bg-gray-100 relative hidden md:block">
          {/* Bạn thay đường dẫn ảnh thật vào src bên dưới */}
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" 
            alt="Phòng khám mắt" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent text-white">
            <h2 className="text-2xl font-bold mb-2">Chuyển đổi số công tác khám khúc xạ</h2>
            <p className="text-sm opacity-90">Đồng bộ hóa dữ liệu từ Google Sheets vào hệ thống quản lý chuyên nghiệp, an toàn.</p>
          </div>
        </div>

        {/* Cột Phải: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               {/* Logo giả lập */}
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                 <Eye size={24} />
               </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Đăng nhập Hệ thống</h1>
            <p className="text-gray-500 mt-2">Quản lý dữ liệu khúc xạ học đường tập trung</p>
          </div>

          <form className="space-y-6">
            {/* Input Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                  placeholder="Nhập tên đăng nhập của bạn"
                />
              </div>
            </div>

            {/* Input Mật khẩu */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <a href="#" className="text-sm text-primary font-medium hover:underline">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox Ghi nhớ */}
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ghi nhớ đăng nhập</label>
            </div>

            {/* Nút Submit */}
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              Đăng nhập ngay
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Phiên bản hệ thống 2.0.4 • © 2026 Cổng thông tin Y tế
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;