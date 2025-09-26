"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface IdeaForm {
  title: string;
  summary: string;
  details: string;
  category: string;
}

interface FormErrors {
  title?: string;
  summary?: string;
  details?: string;
  category?: string;
  submit?: string;
}

const categories = [
  'تقنية المعلومات',
  'التسويق والمبيعات',
  'الموارد البشرية',
  'العمليات والإنتاج',
  'الخدمات المالية',
  'خدمة العملاء',
  'البحث والتطوير',
  'الاستدامة والبيئة',
  'التدريب والتعلم',
  'الإدارة والقيادة',
  'أخرى'
];

const statusLabels = {
  'maswada': 'مسودة',
  'mursala': 'مُرسلة',
  'qaid_almurajaa': 'قيد المراجعة',
  'muwafaq_alayha': 'مُوافق عليها',
  'marfuda': 'مرفوضة',
  'qaid_altanfeedh': 'قيد التنفيذ',
};

const stageLabels = {
  'muqadama': 'مُقدمة',
  'taqyeem_alaqran': 'تقييم الأقران',
  'murajaat_allajana': 'مراجعة اللجنة',
  'dirasat_aljadwa': 'دراسة الجدوى',
  'almuwafaqa': 'الموافقة',
  'altasleem': 'التسليم',
  'altanfeedh': 'التنفيذ',
};

export default function NewIdeaPage() {
  const [formData, setFormData] = useState<IdeaForm>({
    title: '',
    summary: '',
    details: '',
    category: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الفكرة مطلوب';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'عنوان الفكرة يجب أن يكون 10 أحرف على الأقل';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'عنوان الفكرة يجب أن يكون أقل من 100 حرف';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'ملخص الفكرة مطلوب';
    } else if (formData.summary.trim().length < 20) {
      newErrors.summary = 'ملخص الفكرة يجب أن يكون 20 حرفاً على الأقل';
    } else if (formData.summary.trim().length > 300) {
      newErrors.summary = 'ملخص الفكرة يجب أن يكون أقل من 300 حرف';
    }

    if (!formData.details.trim()) {
      newErrors.details = 'تفاصيل الفكرة مطلوبة';
    } else if (formData.details.trim().length < 50) {
      newErrors.details = 'تفاصيل الفكرة يجب أن تكون 50 حرفاً على الأقل';
    } else if (formData.details.trim().length > 2000) {
      newErrors.details = 'تفاصيل الفكرة يجب أن تكون أقل من 2000 حرف';
    }

    if (!formData.category) {
      newErrors.category = 'يرجى اختيار فئة للفكرة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setErrors({
        submit: 'يجب تسجيل الدخول أولاً لإنشاء فكرة جديدة'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/ideas?ownerId=${user.id}`, {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        details: formData.details.trim(),
        category: formData.category
      });

      // Redirect to the created idea page
      router.push(`/ideas/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating idea:', error);
      setErrors({
        submit: error.response?.data?.message || 'فشل في إرسال الفكرة، يرجى المحاولة مرة أخرى'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof IdeaForm, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      details: '',
      category: ''
    });
    setErrors({});
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">معاينة الفكرة</h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'جاري الإرسال...' : 'إرسال الفكرة'}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formData.category}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {stageLabels['muqadama']}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{formData.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user?.name}</span>
                  <span>•</span>
                  <span>الآن</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">الملخص</h3>
                <p className="text-gray-700 leading-relaxed">{formData.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">التفاصيل</h3>
                <div className="prose max-w-none text-gray-700">
                  <p className="leading-relaxed whitespace-pre-line">{formData.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                  </svg>
                  <span>0 أصوات</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>0 تعليقات</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إضافة فكرة جديدة</h1>
                <p className="text-gray-600 mt-2">شاركنا فكرتك الإبداعية وساهم في تطوير بيئة العمل</p>
              </div>
              <Link
                href="/ideas"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                العودة إلى قائمة الأفكار
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (validateForm()) {
                  setShowPreview(true);
                }
              }} className="space-y-8">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الفكرة *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل عنوان واضح ومختصر للفكرة"
                    maxLength={100}
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.title && (
                      <p className="text-red-600 text-sm">{errors.title}</p>
                    )}
                    <p className="text-sm text-gray-500 mr-auto">
                      {formData.title.length}/100
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    فئة الفكرة *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">اختر فئة الفكرة</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                    ملخص الفكرة *
                  </label>
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.summary ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="اكتب ملخصاً موجزاً وواضحاً للفكرة في 2-3 جمل"
                    maxLength={300}
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.summary && (
                      <p className="text-red-600 text-sm">{errors.summary}</p>
                    )}
                    <p className="text-sm text-gray-500 mr-auto">
                      {formData.summary.length}/300
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                    تفاصيل الفكرة *
                  </label>
                  <textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => handleChange('details', e.target.value)}
                    rows={8}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.details ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="اشرح فكرتك بالتفصيل، بما في ذلك:
• المشكلة التي تحلها الفكرة
• كيفية تطبيق الفكرة
• الفوائد المتوقعة
• الموارد المطلوبة (إن وجدت)
• أي معلومات إضافية مهمة"
                    maxLength={2000}
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.details && (
                      <p className="text-red-600 text-sm">{errors.details}</p>
                    )}
                    <p className="text-sm text-gray-500 mr-auto">
                      {formData.details.length}/2000
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                      disabled={loading}
                    >
                      مسح الكل
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      href="/ideas"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      إلغاء
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                    >
                      معاينة الفكرة
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border-t border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">نصائح لكتابة فكرة ناجحة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900">كن واضحاً ومحدداً</h4>
                    <p className="text-sm text-blue-700">استخدم لغة بسيطة وواضحة لشرح فكرتك</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900">ركز على الحل</h4>
                    <p className="text-sm text-blue-700">اشرح كيف ستحل فكرتك مشكلة معينة</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900">اذكر الفوائد</h4>
                    <p className="text-sm text-blue-700">وضح كيف ستساهم فكرتك في تحسين العمل</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900">فكر في التطبيق</h4>
                    <p className="text-sm text-blue-700">اقترح خطوات عملية لتنفيذ الفكرة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}