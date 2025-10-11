"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import api from '../../../../lib/api';

interface Idea {
  id: number;
  title: string;
  summary: string;
  details: string;
  category?: string;
  status: string;
  stage: string;
  owner: { 
    id: number;
    name: string; 
  };
}

export default function EditIdeaPage({ params }: { params: { id: string } }) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await api.get(`/ideas/${params.id}`);
        const ideaData = res.data;
        
        // Check if current user is the owner
        if (!user || user.id !== ideaData.owner.id) {
          setError('غير مصرح لك بتعديل هذه الفكرة');
          return;
        }
        
        // Only allow editing if idea is in draft or submitted status
        if (!['maswada', 'mursala'].includes(ideaData.status)) {
          setError('لا يمكن تعديل الفكرة في هذه المرحلة');
          return;
        }
        
        setIdea(ideaData);
        setTitle(ideaData.title);
        setSummary(ideaData.summary);
        setDetails(ideaData.details);
        setCategory(ideaData.category || '');
      } catch (e) {
        console.error(e);
        setError('حدث خطأ في تحميل الفكرة');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchIdea();
    }
  }, [params.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !summary.trim() || !details.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.put(`/ideas/${params.id}?ownerId=${user?.id}`, {
        title: title.trim(),
        summary: summary.trim(),
        details: details.trim(),
        category: category.trim() || null,
      });

      router.push(`/ideas/${params.id}`);
    } catch (error: any) {
      console.error('Error updating idea:', error);
      setError(error.response?.data?.message || 'حدث خطأ في حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !idea) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
            <div className="space-x-reverse space-x-4">
              <Link href={`/ideas/${params.id}`} className="text-blue-600 hover:text-blue-700">
                العودة إلى الفكرة
              </Link>
              <Link href="/ideas" className="text-gray-600 hover:text-gray-700">
                قائمة الأفكار
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-reverse space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/ideas" className="hover:text-blue-600">الأفكار</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/ideas/${params.id}`} className="hover:text-blue-600 truncate">{idea?.title}</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">تعديل</span>
          </nav>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">تعديل الفكرة</h1>
                <p className="text-gray-600 mt-1">قم بتعديل تفاصيل فكرتك</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/ideas/${params.id}`}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الفكرة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل عنوان الفكرة"
                  required
                  disabled={saving}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: تكنولوجيا، إدارة، تطوير..."
                  disabled={saving}
                />
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  ملخص الفكرة <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ملخص موجز للفكرة في بضعة أسطر"
                  required
                  disabled={saving}
                />
              </div>

              {/* Details */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                  تفاصيل الفكرة <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="وصف مفصل للفكرة، أهدافها، فوائدها، وكيفية تطبيقها"
                  required
                  disabled={saving}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> الحقول المطلوبة
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/ideas/${params.id}`}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    إلغاء
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}