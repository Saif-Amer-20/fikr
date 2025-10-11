"use client";
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              منصة فِكْر
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              الرئيسية
            </Link>
            <Link
              href="/ideas"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              الأفكار
            </Link>
            <Link
              href="/ideas/new"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              فكرة جديدة
            </Link>
            {/* Admin-only link */}
            {user && user.role && user.role.name === 'admin' && (
              <>
                <Link
                  href="/admin/stages"
                  className="text-purple-700 hover:text-purple-800 px-3 py-2 text-sm font-bold"
                >
                  إدارة المراحل
                </Link>
                <Link
                  href="/admin/users"
                  className="text-indigo-700 hover:text-indigo-800 px-3 py-2 text-sm font-bold"
                >
                  إدارة المستخدمين
                </Link>
                <Link
                  href="/admin/pending"
                  className="text-orange-700 hover:text-orange-800 px-3 py-2 text-sm font-bold"
                >
                  الأفكار المعلقة
                </Link>
                <Link
                  href="/admin/lookups"
                  className="text-green-700 hover:text-green-800 px-3 py-2 text-sm font-bold"
                >
                  إدارة البيانات الأساسية
                </Link>
              </>
            )}
           
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-reverse space-x-4">
            {user ? (
              <div className="flex items-center space-x-reverse space-x-4">
                <Link href="/profile" className="flex items-center space-x-reverse space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.role?.description || user.department}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-reverse space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
          <Link
            href="/"
            className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            الرئيسية
          </Link>
          <Link
            href="/ideas"
            className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            الأفكار
          </Link>
          <Link
            href="/ideas/new"
            className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            فكرة جديدة
          </Link>
          {/* Admin-only link for mobile */}
          {user && user.role && user.role.name === 'admin' && (
            <>
              <Link
                href="/admin/stages"
                className="block text-purple-700 hover:text-purple-800 px-3 py-2 text-sm font-bold"
              >
                إدارة المراحل
              </Link>
              <Link
                href="/admin/users"
                className="block text-indigo-700 hover:text-indigo-800 px-3 py-2 text-sm font-bold"
              >
                إدارة المستخدمين
              </Link>
              <Link
                href="/admin/pending"
                className="block text-orange-700 hover:text-orange-800 px-3 py-2 text-sm font-bold"
              >
                الأفكار المعلقة
              </Link>
              <Link
                href="/admin/lookups"
                className="block text-green-700 hover:text-green-800 px-3 py-2 text-sm font-bold"
              >
                إدارة البيانات الأساسية
              </Link>
            </>
          )}
          {/* Profile link for all users on mobile */}
          {user && (
            <Link
              href="/profile"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              الملف الشخصي
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}