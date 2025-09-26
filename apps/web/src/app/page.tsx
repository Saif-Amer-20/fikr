"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Idea {
  id: number;
  title: string;
  summary: string;
  status: string;
  stage: string;
  category?: string;
  createdAt: string;
  _count?: {
    votes: number;
    comments: number;
  };
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalVotes: 0,
    totalUsers: 0, // Changed from placeholder to 0
    activeIdeas: 0
  });
  const { user } = useAuth();
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiUrl = 'http://localhost:4000/api';
      const [ideasResponse, usersResponse] = await Promise.all([
        axios.get(`${apiUrl}/ideas`),
        axios.get(`${apiUrl}/users`)
      ]);
      
      const ideasData = ideasResponse.data;
      const usersData = usersResponse.data;
      
      setIdeas(ideasData);
      
      // Calculate stats with real data
      setStats({
        totalIdeas: ideasData.length,
        totalVotes: ideasData.reduce((acc: number, idea: Idea) => acc + (idea._count?.votes || 0), 0),
        totalUsers: usersData.length, // Real user count
        activeIdeas: ideasData.filter((idea: Idea) => idea.status === 'qaid_altanfeedh' || idea.stage === 'altanfeedh').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                منصة <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">فِكْر</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                منصة شاملة لجمع وإدارة الأفكار الإبداعية في مؤسستك. شارك أفكارك، صوّت للأفكار المميزة، وكن جزءاً من التطوير والابتكار
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  ابدأ الآن
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
                >
                  تسجيل الدخول
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalIdeas}+</div>
                  <div className="text-gray-600 font-medium">فكرة مبتكرة</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.totalVotes}+</div>
                  <div className="text-gray-600 font-medium">تصويت</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalUsers}+</div>
                  <div className="text-gray-600 font-medium">مشارك نشط</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeIdeas}</div>
                  <div className="text-gray-600 font-medium">فكرة قيد التنفيذ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">لماذا منصة فِكْر؟</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                نوفر لك كل الأدوات اللازمة لتحويل أفكارك إلى واقع ملموس
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">أفكار إبداعية</h3>
                <p className="text-gray-600 leading-relaxed">شارك أفكارك الإبداعية والمبتكرة مع فريق العمل واحصل على التغذية الراجعة</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">تصويت ذكي</h3>
                <p className="text-gray-600 leading-relaxed">صوّت للأفكار التي تراها مناسبة وساعد في اختيار الأفضل للتنفيذ</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">تنفيذ سريع</h3>
                <p className="text-gray-600 leading-relaxed">تابع مراحل تنفيذ الأفكار المختارة من البداية حتى النهاية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مرحباً، {user.name}</h1>
              <p className="text-gray-600 mt-1">{user.department} • {user.role?.name || 'موظف'}</p>
            </div>
            <Link
              href="/ideas/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة فكرة جديدة
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الأفكار</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalIdeas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي التصويتات</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalVotes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">أفكار قيد التنفيذ</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeIdeas}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المشاركون النشطون</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Ideas */}
        <section className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">أحدث الأفكار</h2>
              <Link href="/ideas" className="text-blue-600 hover:text-blue-700 font-medium">
                عرض الكل
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="bg-gray-200 h-6 w-16 rounded-full"></div>
                      <div className="bg-gray-200 h-6 w-16 rounded-full"></div>
                    </div>
                  </div>
                ))
              ) : ideas.length > 0 ? (
                ideas.slice(0, 6).map((idea) => (
                  <Link
                    key={idea.id}
                    href={`/ideas/${idea.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{idea.title}</h3>
                      {idea.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap mr-2">
                          {idea.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{idea.summary}</p>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="px-2 py-1 bg-gray-200 rounded-full">{idea.status}</span>
                      <span className="px-2 py-1 bg-gray-200 rounded-full">{idea.stage}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أفكار</h3>
                  <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة فكرتك الأولى</p>
                  <div className="mt-6">
                    <Link
                      href="/ideas/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      إضافة فكرة جديدة
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}