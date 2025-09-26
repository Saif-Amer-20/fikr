"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface StageStats {
  stage: string;
  label: string;
  count: number;
}

interface StatusStats {
  status: string;
  label: string;
  count: number;
}

interface Idea {
  id: number;
  title: string;
  summary: string;
  stage: string;
  status: string;
  stageLabel: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    department: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

interface StageWorkflow {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const stageColors = {
  'muqadama': 'bg-blue-100 text-blue-800 border-blue-200',
  'taqyeem_alaqran': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800 border-orange-200',
  'almuwafaqa': 'bg-green-100 text-green-800 border-green-200',
  'altasleem': 'bg-purple-100 text-purple-800 border-purple-200',
  'altanfeedh': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusColors = {
  'maswada': 'bg-gray-100 text-gray-800',
  'mursala': 'bg-blue-100 text-blue-800',
  'qaid_almurajaa': 'bg-yellow-100 text-yellow-800',
  'muwafaq_alayha': 'bg-green-100 text-green-800',
  'marfuda': 'bg-red-100 text-red-800',
  'qaid_altanfeedh': 'bg-purple-100 text-purple-800',
};

export default function StagesManagementPage() {
  const [stats, setStats] = useState<{ stageStats: StageStats[]; statusStats: StatusStats[]; totalIdeas: number } | null>(null);
  const [workflow, setWorkflow] = useState<{ stages: StageWorkflow[] } | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [ideasByStage, setIdeasByStage] = useState<{ ideas: Idea[]; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, workflowRes] = await Promise.all([
        api.get('/stages/statistics'),
        api.get('/stages/workflow'),
      ]);
      setStats(statsRes.data);
      setWorkflow(workflowRes.data);
      
      // Load first stage by default
      if (statsRes.data.stageStats.length > 0) {
        const firstStage = statsRes.data.stageStats[0].stage;
        setSelectedStage(firstStage);
        await fetchIdeasByStage(firstStage);
      }
    } catch (error) {
      console.error('Error fetching stage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeasByStage = async (stage: string) => {
    try {
      const response = await api.get(`/stages/ideas/${stage}`);
      setIdeasByStage(response.data);
    } catch (error) {
      console.error('Error fetching ideas by stage:', error);
    }
  };

  const updateIdeaStage = async (ideaId: number, newStage: string, newStatus?: string) => {
    try {
      setUpdating(ideaId);
      await api.put(`/stages/ideas/${ideaId}/stage`, {
        stage: newStage,
        status: newStatus,
        updatedBy: user?.email || 'admin',
        reason: 'Stage updated by admin',
      });
      
      // Refresh data
      await fetchData();
      if (selectedStage) {
        await fetchIdeasByStage(selectedStage);
      }
    } catch (error) {
      console.error('Error updating idea stage:', error);
      alert('خطأ في تحديث المرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdating(null);
    }
  };

  const handleStageClick = async (stage: string) => {
    setSelectedStage(stage);
    await fetchIdeasByStage(stage);
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
                <h1 className="text-3xl font-bold text-gray-900">إدارة مراحل التقدم</h1>
                <p className="text-gray-600 mt-2">
                  إدارة وتتبع مراحل الأفكار المختلفة في النظام
                  {stats && (
                    <span className="mr-2 text-blue-600 font-medium">
                      ({stats.totalIdeas} فكرة إجمالية)
                    </span>
                  )}
                </p>
              </div>
              <Link
                href="/ideas"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                عرض جميع الأفكار
              </Link>
            </div>
          </div>

          {/* Workflow Overview */}
          {workflow && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">مسار العمل</h2>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between space-x-reverse space-x-4 overflow-x-auto">
                  {workflow.stages.map((stage, index) => (
                    <div key={stage.key} className="flex items-center flex-shrink-0">
                      <div 
                        className={`${stageColors[stage.key as keyof typeof stageColors]} rounded-xl p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
                          selectedStage === stage.key ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleStageClick(stage.key)}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{stage.icon}</div>
                          <div className="font-bold text-sm mb-1">{stage.label}</div>
                          <div className="text-xs opacity-75">{stage.description}</div>
                          {stats && (
                            <div className="mt-2 bg-white/50 rounded px-2 py-1 text-xs font-bold">
                              {stats.stageStats.find(s => s.stage === stage.key)?.count || 0} فكرة
                            </div>
                          )}
                        </div>
                      </div>
                      {index < workflow.stages.length - 1 && (
                        <div className="flex-shrink-0 mx-2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأفكار</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalIdeas}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">قيد المراجعة</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.statusStats.find(s => s.status === 'qaid_almurajaa')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مُوافق عليها</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.statusStats.find(s => s.status === 'muwafaq_alayha')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">قيد التنفيذ</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.statusStats.find(s => s.status === 'qaid_altanfeedh')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ideas by Stage */}
          {ideasByStage && selectedStage && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  أفكار مرحلة: {workflow?.stages.find(s => s.key === selectedStage)?.label}
                  <span className="mr-2 text-gray-500 font-normal">({ideasByStage.count} فكرة)</span>
                </h2>
              </div>
              
              {ideasByStage.ideas.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أفكار في هذه المرحلة</h3>
                  <p className="text-gray-600">لم يتم العثور على أفكار في هذه المرحلة حالياً</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {ideasByStage.ideas.map((idea) => (
                    <div key={idea.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={`/ideas/${idea.id}`}
                              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {idea.title}
                            </Link>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status as keyof typeof statusColors]}`}>
                              {idea.statusLabel}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-3 line-clamp-2">{idea.summary}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{idea.owner.name}</span>
                              {idea.owner.department && <span>• {idea.owner.department}</span>}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                              </svg>
                              <span>{idea._count.votes} أصوات</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{idea._count.comments} تعليقات</span>
                            </div>
                            
                            <span>{new Date(idea.updatedAt).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mr-4">
                          {workflow?.stages.map((stage) => {
                            if (stage.key === idea.stage) return null;
                            return (
                              <button
                                key={stage.key}
                                onClick={() => updateIdeaStage(idea.id, stage.key)}
                                disabled={updating === idea.id}
                                className={`px-3 py-1 rounded-lg text-xs font-medium border-2 transition-all hover:scale-105 ${
                                  stageColors[stage.key as keyof typeof stageColors]
                                } ${updating === idea.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
                                title={`نقل إلى ${stage.label}`}
                              >
                                {updating === idea.id ? '...' : stage.icon} {stage.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}