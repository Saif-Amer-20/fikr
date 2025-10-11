"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Idea {
  id: number;
  title: string;
  summary: string;
  details: string;
  category?: string;
  status: string;
  stage: string;
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

export default function PendingIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingIdeas();
  }, []);

  const fetchPendingIdeas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ideas/pending/review');
      setIdeas(response.data);
    } catch (error) {
      console.error('Error fetching pending ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveIdea = async (ideaId: number) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذه الفكرة ونقلها إلى مرحلة تقييم الأقران؟')) {
      return;
    }

    try {
      setProcessing(ideaId);
      await api.put(`/ideas/${ideaId}/approve`);
      
      // Remove the idea from the list
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      
      alert('تم الموافقة على الفكرة ونقلها إلى مرحلة تقييم الأقران');
    } catch (error) {
      console.error('Error approving idea:', error);
      alert('خطأ في الموافقة على الفكرة. يرجى المحاولة مرة أخرى.');
    } finally {
      setProcessing(null);
    }
  };

  const rejectIdea = async (ideaId: number) => {
    if (!confirm('هل أنت متأكد من رفض هذه الفكرة؟')) {
      return;
    }

    try {
      setProcessing(ideaId);
      await api.put(`/ideas/${ideaId}/reject`);
      
      // Remove the idea from the list
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      
      alert('تم رفض الفكرة');
    } catch (error) {
      console.error('Error rejecting idea:', error);
      alert('خطأ في رفض الفكرة. يرجى المحاولة مرة أخرى.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">مراجعة الأفكار المُقدمة</h1>
                <p className="text-gray-600 mt-2">راجع الأفكار الجديدة ووافق عليها أو ارفضها</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/admin/users"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  إدارة المستخدمين
                </Link>
                <Link
                  href="/ideas"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  عرض جميع الأفكار
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">أفكار في انتظار المراجعة</p>
                  <p className="text-3xl font-bold text-yellow-600">{ideas.length}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">أفكار لهذا الأسبوع</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {ideas.filter(idea => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return new Date(idea.createdAt) > oneWeekAgo;
                    }).length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط التصويتات</p>
                  <p className="text-3xl font-bold text-green-600">
                    {ideas.length > 0 ? Math.round(ideas.reduce((sum, idea) => sum + idea._count.votes, 0) / ideas.length) : 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Ideas List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                الأفكار المُقدمة للمراجعة ({ideas.length})
              </h2>
            </div>

            {ideas.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أفكار في انتظار المراجعة</h3>
                <p className="text-gray-600">جميع الأفكار المُقدمة تمت مراجعتها</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {ideas.map((idea) => (
                  <div key={idea.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                          {idea.category && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {idea.category}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{idea.summary}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {idea.owner.name.charAt(0)}
                              </span>
                            </div>
                            <span>{idea.owner.name}</span>
                            {idea.owner.department && (
                              <span className="text-gray-400">• {idea.owner.department}</span>
                            )}
                          </div>
                          <span>{new Date(idea.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                            </svg>
                            <span>{idea._count.votes} تصويت</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{idea._count.comments} تعليق</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors text-center"
                        >
                          عرض التفاصيل
                        </Link>
                        
                        <button
                          onClick={() => approveIdea(idea.id)}
                          disabled={processing === idea.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === idea.id ? 'جاري الموافقة...' : 'موافقة'}
                        </button>
                        
                        <button
                          onClick={() => rejectIdea(idea.id)}
                          disabled={processing === idea.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === idea.id ? 'جاري الرفض...' : 'رفض'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}