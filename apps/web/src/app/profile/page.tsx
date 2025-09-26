"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProfileSettings from '../../components/ProfileSettings';
import api from '../../lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  profilePicture?: string;
  role?: {
    id: number;
    name: string;
    description: string;
  };
}

interface UserIdea {
  id: number;
  title: string;
  summary: string;
  status: string;
  stage: string;
  stageLabel?: string;
  statusLabel?: string;
  createdAt: string;
  _count: {
    votes: number;
    comments: number;
  };
}

interface UserStats {
  totalIdeas: number;
  totalVotes: number;
  totalComments: number;
  ideasByStatus: { status: string; count: number; label: string }[];
  ideasByStage: { stage: string; count: number; label: string }[];
}

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

const statusColors = {
  'maswada': 'bg-gray-100 text-gray-800',
  'mursala': 'bg-blue-100 text-blue-800',
  'qaid_almurajaa': 'bg-yellow-100 text-yellow-800',
  'muwafaq_alayha': 'bg-green-100 text-green-800',
  'marfuda': 'bg-red-100 text-red-800',
  'qaid_altanfeedh': 'bg-purple-100 text-purple-800',
};

const stageColors = {
  'muqadama': 'bg-blue-100 text-blue-800',
  'taqyeem_alaqran': 'bg-indigo-100 text-indigo-800',
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800',
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800',
  'almuwafaqa': 'bg-green-100 text-green-800',
  'altasleem': 'bg-purple-100 text-purple-800',
  'altanfeedh': 'bg-emerald-100 text-emerald-800',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userIdeas, setUserIdeas] = useState<UserIdea[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'ideas' | 'stats' | 'settings'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [profilePicture, setProfilePicture] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, ideasRes] = await Promise.all([
        api.get(`/users/${user?.id}`),
        api.get(`/ideas?ownerId=${user?.id}`)
      ]);

      const profileData = profileRes.data;
      const ideasData = ideasRes.data;

      setProfile(profileData);
      setUserIdeas(ideasData);
      
      // Set form data for editing
      setProfileData({
        name: profileData.name || '',
        email: profileData.email || '',
        department: profileData.department || '',
      });
      setProfilePicture(profileData.profilePicture || '');

      // Calculate user statistics
      const totalVotes = ideasData.reduce((acc: number, idea: UserIdea) => acc + idea._count.votes, 0);
      const totalComments = ideasData.reduce((acc: number, idea: UserIdea) => acc + idea._count.comments, 0);
      
      const statusCounts = ideasData.reduce((acc: any, idea: UserIdea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {});

      const stageCounts = ideasData.reduce((acc: any, idea: UserIdea) => {
        acc[idea.stage] = (acc[idea.stage] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalIdeas: ideasData.length,
        totalVotes,
        totalComments,
        ideasByStatus: Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number,
          label: statusLabels[status as keyof typeof statusLabels] || status
        })),
        ideasByStage: Object.entries(stageCounts).map(([stage, count]) => ({
          stage,
          count: count as number,
          label: stageLabels[stage as keyof typeof stageLabels] || stage
        }))
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await api.put(`/users/${user.id}/profile`, {
        ...profileData,
        profilePicture,
      });
      
      setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
      setEditMode(false);
      await fetchUserData(); // Refresh data
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'فشل في تحديث الملف الشخصي' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.id) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'فشل في تغيير كلمة المرور' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProfileData({
      name: profile?.name || '',
      email: profile?.email || '',
      department: profile?.department || '',
    });
    setProfilePicture(profile?.profilePicture || '');
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
                <p className="text-gray-600 mt-2">إدارة معلوماتك الشخصية وعرض إحصائياتك</p>
              </div>
              <Link
                href="/ideas/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                إضافة فكرة جديدة
              </Link>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6">
              {!editMode ? (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">معلومات الملف الشخصي</h3>
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      تعديل الملف الشخصي
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-reverse space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      {profile?.profilePicture ? (
                        <img 
                          src={profile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {profile?.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                      <p className="text-gray-600 mb-2">{profile?.email}</p>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {profile?.department}
                        </span>
                        {profile?.role && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {profile.role.description}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          profile?.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {profile?.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      عضو منذ: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA') : ''}
                    </div>
                  </div>
                  
                  {/* Password Change Section */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">كلمة المرور</h4>
                        <p className="text-sm text-gray-500">آخر تغيير منذ فترة طويلة</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        تغيير كلمة المرور
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">تعديل الملف الشخصي</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex items-center space-x-reverse space-x-6">
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        {profilePicture ? (
                          <img 
                            src={profilePicture} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {profileData.name.charAt(0) || '؟'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">الصورة الشخصية</p>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            تحديد صورة
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleProfilePictureUpload}
                            />
                          </label>
                          {profilePicture && (
                            <button
                              onClick={() => setProfilePicture('')}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              إزالة الصورة
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF حتى 5MB</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Modal */}
          {showPasswordForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">تغيير كلمة المرور</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأفكار</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalIdeas}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأصوات</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalVotes}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي التعليقات</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">معدل التفاعل</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.totalIdeas > 0 ? Math.round((stats.totalVotes + stats.totalComments) / stats.totalIdeas * 10) / 10 : 0}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-reverse space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ideas'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  أفكاري ({userIdeas.length})
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الإحصائيات
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الإعدادات
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'ideas' && (
                <div className="space-y-4">
                  {userIdeas.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💡</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لم تقم بإضافة أفكار بعد</h3>
                      <p className="text-gray-600 mb-6">ابدأ بمشاركة أفكارك الإبداعية مع الفريق</p>
                      <Link
                        href="/ideas/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        إضافة فكرة جديدة
                      </Link>
                    </div>
                  ) : (
                    userIdeas.map((idea) => (
                      <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <Link
                            href={`/ideas/${idea.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {idea.title}
                          </Link>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status as keyof typeof statusColors]}`}>
                              {statusLabels[idea.status as keyof typeof statusLabels] || idea.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[idea.stage as keyof typeof stageColors]}`}>
                              {stageLabels[idea.stage as keyof typeof stageLabels] || idea.stage}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3 line-clamp-2">{idea.summary}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5v2c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5v-2" />
                              </svg>
                              <span>{idea._count.votes} أصوات</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{idea._count.comments} تعليقات</span>
                            </div>
                          </div>
                          <span>{new Date(idea.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Status Distribution */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الأفكار حسب الحالة</h3>
                    <div className="space-y-3">
                      {stats.ideasByStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                            {item.label}
                          </span>
                          <span className="font-bold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage Distribution */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الأفكار حسب المرحلة</h3>
                    <div className="space-y-3">
                      {stats.ideasByStage.map((item) => (
                        <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[item.stage as keyof typeof stageColors]}`}>
                            {item.label}
                          </span>
                          <span className="font-bold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <ProfileSettings user={profile} onProfileUpdate={fetchUserData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}