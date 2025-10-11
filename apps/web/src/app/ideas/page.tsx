"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';

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
    name: string;
    department: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

const statusColors = {
  'maswada': 'bg-gray-100 text-gray-800',
  'mursala': 'bg-blue-100 text-blue-800',
  'qaid_almurajaa': 'bg-yellow-100 text-yellow-800',
  'muwafaq_alayha': 'bg-green-100 text-green-800',
  'marfuda': 'bg-red-100 text-red-800',
  'qaid_altanfeedh': 'bg-purple-100 text-purple-800',
};

const stageColors = {
  'muqadama': 'bg-gray-100 text-gray-800',
  'taqyeem_alaqran': 'bg-blue-100 text-blue-800', 
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800',
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800',
  'almuwafaqa': 'bg-green-100 text-green-800',
  'altasleem': 'bg-indigo-100 text-indigo-800',
  'altanfeedh': 'bg-purple-100 text-purple-800',
};

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
};export default function IdeasWall() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'جميع الفئات',
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
  const statuses = [
    { value: '', label: 'جميع الحالات' },
    { value: 'maswada', label: 'مسودة' },
    { value: 'mursala', label: 'مُرسلة' },
    { value: 'qaid_almurajaa', label: 'قيد المراجعة' },
    { value: 'muwafaq_alayha', label: 'مُوافق عليها' },
    { value: 'marfuda', label: 'مرفوضة' },
    { value: 'qaid_altanfeedh', label: 'قيد التنفيذ' },
  ];
  
  const stages = [
    { value: '', label: 'جميع المراحل' },
    { value: 'muqadama', label: 'مُقدمة' },
    { value: 'taqyeem_alaqran', label: 'تقييم الأقران' },
    { value: 'murajaat_allajana', label: 'مراجعة اللجنة' },
    { value: 'dirasat_aljadwa', label: 'دراسة الجدوى' },
    { value: 'almuwafaqa', label: 'الموافقة' },
    { value: 'altasleem', label: 'التسليم' },
    { value: 'altanfeedh', label: 'التنفيذ' },
  ];

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    filterAndSortIdeas();
  }, [ideas, searchTerm, selectedCategory, selectedStatus, selectedStage, sortBy]);

  const loadIdeas = async () => {
    try {
      // تمرير دور المستخدم إذا كان متاحاً
      const userRole = user?.role?.name || '';
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ideas?userRole=${userRole}`);
      setIdeas(response.data);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortIdeas = () => {
    let filtered = ideas;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'جميع الفئات') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus && selectedStatus !== '') {
      filtered = filtered.filter(idea => idea.status === selectedStatus);
    }

    // Stage filter
    if (selectedStage && selectedStage !== '') {
      filtered = filtered.filter(idea => idea.stage === selectedStage);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_voted':
        filtered.sort((a, b) => b._count.votes - a._count.votes);
        break;
      case 'most_commented':
        filtered.sort((a, b) => b._count.comments - a._count.comments);
        break;
      default:
        break;
    }

    setFilteredIdeas(filtered);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">جدار الأفكار</h1>
              <p className="text-gray-600 mt-1">استعرض وصوّت للأفكار المميزة</p>
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

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث في العنوان أو التفاصيل..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'جميع الفئات' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {stages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">الأحدث</option>
                  <option value="oldest">الأقدم</option>
                  <option value="most_voted">الأكثر تصويتاً</option>
                  <option value="most_commented">الأكثر تعليقاً</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>عرض {filteredIdeas.length} من أصل {ideas.length} فكرة</span>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setSelectedStage('');
                  setSortBy('newest');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>

          {/* Ideas Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-200 h-6 w-3/4 rounded"></div>
                      <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="bg-gray-200 h-4 w-full rounded"></div>
                      <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <div className="bg-gray-200 h-8 w-16 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-16 rounded-full"></div>
                      </div>
                      <div className="bg-gray-200 h-6 w-24 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/ideas/${idea.id}`} className="group flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {idea.title}
                          </h3>
                        </Link>
                        <div className="flex gap-2 mr-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status as keyof typeof statusColors]}`}>
                            {statusLabels[idea.status as keyof typeof statusLabels] || idea.status}
                          </span>
                          {idea.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {idea.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {idea.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{idea.owner.name} • {idea.owner.department}</span>
                        </div>
                        <span>{new Date(idea.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                            </svg>
                            <span className="font-medium">{idea._count.votes}</span>
                          </button>
                          <Link 
                            href={`/ideas/${idea.id}#comments`} 
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium">{idea._count.comments}</span>
                          </Link>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[idea.stage as keyof typeof stageColors]}`}>
                          {stageLabels[idea.stage as keyof typeof stageLabels] || idea.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أفكار</h3>
                <p className="text-gray-600 mb-8">لم يتم العثور على أفكار تطابق معايير البحث الخاصة بك</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedStatus('');
                    setSelectedStage('');
                    setSortBy('newest');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}