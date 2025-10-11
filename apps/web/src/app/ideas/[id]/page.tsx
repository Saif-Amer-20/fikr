"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  updatedAt: string;
  owner: { 
    id: number;
    name: string; 
    department?: string;
    email?: string;
  };
  votes: any[];
  comments: any[];
  _count?: {
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
  'muqadama': 'bg-blue-100 text-blue-800',
  'taqyeem_alaqran': 'bg-indigo-100 text-indigo-800',
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800',
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800',
  'almuwafaqa': 'bg-green-100 text-green-800',
  'altasleem': 'bg-purple-100 text-purple-800',
  'altanfeedh': 'bg-emerald-100 text-emerald-800',
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
};

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoted, setIsVoted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await api.get(`/ideas/${params.id}`);
        setIdea(res.data);
        
        console.log('📊 Idea loaded:', {
          ideaId: res.data.id,
          totalVotes: res.data._count?.votes || res.data.votes?.length || 0,
          allVotes: res.data.votes,
          currentUserId: user?.id
        });
        
        // Check if current user has voted - this will run every time user or idea changes
        if (user && res.data.votes) {
          const userId = Number(user.id);
          const userVotes = res.data.votes.filter((vote: any) => {
            const voterId = Number(vote.voterId);
            return voterId === userId;
          });
          const hasVoted = userVotes.length > 0;
          
          // Set the vote state immediately
          setIsVoted(hasVoted);
          console.log(`Vote state set to: ${hasVoted} for user ${userId}`);
        }
      } catch (e) {
        console.error(e);
        router.push('/ideas');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have a user, otherwise wait
    if (user) {
      fetchIdea();
    }
  }, [params.id, user]);

  // Additional effect to check vote state when both idea and user are available
  useEffect(() => {
    if (user && idea && idea.votes) {
      const userId = Number(user.id);
      const userVotes = idea.votes.filter((vote: any) => {
        const voterId = Number(vote.voterId);
        return voterId === userId;
      });
      const hasVoted = userVotes.length > 0;
      
      // Always update vote state when user or idea changes
      setIsVoted(hasVoted);
      console.log(`Vote state updated to: ${hasVoted} for user ${userId}`);
    }
  }, [user, idea]);

  const handleVote = async () => {
    if (!user || !idea || voteLoading) return;

    // Prevent multiple clicks
    setVoteLoading(true);

    try {
      // Call the vote API
      const voteResponse = await api.post(`/ideas/${idea.id}/vote?userId=${user.id}`);
      
      // Use the API response "voted" field to set the button state immediately
      const apiVotedStatus = voteResponse.data.voted;
      setIsVoted(apiVotedStatus);
      
      // Refetch data to get accurate vote count
      const refreshResponse = await api.get(`/ideas/${params.id}`);
      const refreshedIdea = refreshResponse.data;
      
      // Update idea data
      setIdea(refreshedIdea);
      
      // Verify and set final vote state from database
      const userId = Number(user.id);
      const actualUserVoted = refreshedIdea.votes.some((vote: any) => Number(vote.voterId) === userId);
      setIsVoted(actualUserVoted);
      
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleCommentSubmit = async (e: any) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !idea) return;

    setCommentLoading(true);
    try {
      const response = await api.post(`/ideas/${idea.id}/comments?authorId=${user.id}`, {
        content: newComment
      });
      
      const newComments = [response.data, ...idea.comments];
      setIdea({
        ...idea,
        comments: newComments,
        _count: {
          ...idea._count,
          votes: idea._count?.votes || idea.votes.length,
          comments: newComments.length,
        }
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
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

  if (!idea) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">الفكرة غير موجودة</h2>
            <Link href="/ideas" className="text-blue-600 hover:text-blue-700">العودة إلى قائمة الأفكار</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const votesCount = idea._count?.votes || idea.votes.length;
  const commentsCount = idea._count?.comments || idea.comments.length;

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
            <span className="text-gray-900 truncate">{idea.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Idea Header */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{idea.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{idea.owner.name}{idea.owner.department && ` • ${idea.owner.department}`}</span>
                      </div>
                      {idea.createdAt && (
                        <span>{new Date(idea.createdAt).toLocaleDateString('ar-SA')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Edit button - only show for owner and if idea is in editable status */}
                    {user && user.id === idea.owner.id && ['maswada', 'mursala'].includes(idea.status) && (
                      <Link
                        href={`/ideas/${idea.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تعديل
                      </Link>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[idea.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[idea.status as keyof typeof statusLabels] || idea.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[idea.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}>
                      {stageLabels[idea.stage as keyof typeof stageLabels] || idea.stage}
                    </span>
                    {idea.category && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {idea.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">الملخص</h2>
                  <p className="text-gray-700 leading-relaxed">{idea.summary}</p>
                </div>

                {/* Details */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">التفاصيل</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="leading-relaxed whitespace-pre-line">{idea.details}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleVote}
                    disabled={voteLoading}
                    className={`
                      flex items-center justify-between w-56 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300
                      ${isVoted 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                      ${voteLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg 
                          className={`w-5 h-5 ${isVoted ? 'text-blue-600' : 'text-gray-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                      </div>
                      <span>
                        {voteLoading ? 'جاري التصويت...' : (isVoted ? 'تم التصويت' : 'صوّت')}
                      </span>
                    </div>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${isVoted ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                    `}>
                      {votesCount}
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{commentsCount} تعليق</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div id="comments" className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">التعليقات ({commentsCount})</h2>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      إضافة تعليق
                    </label>
                    <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="شاركنا رأيك في هذه الفكرة..."
                      disabled={commentLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {commentLoading ? 'جاري الإرسال...' : 'إرسال التعليق'}
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {idea.comments.length > 0 ? (
                    idea.comments.map((comment, index) => (
                      <div key={comment.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">
                                {comment.author?.name || 'مجهول'}
                              </span>
                              {comment.author?.department && (
                                <span className="text-sm text-gray-500 mr-2">{comment.author.department}</span>
                              )}
                            </div>
                          </div>
                          {comment.createdAt && (
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed mr-10">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تعليقات بعد</h3>
                      <p className="text-gray-600">كن أول من يعلق على هذه الفكرة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Idea Info */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الفكرة</h3>
                <div className="space-y-3">
                  {idea.category && (
                    <div>
                      <span className="text-sm text-gray-500">الفئة:</span>
                      <span className="block font-medium text-gray-900">{idea.category}</span>
                    </div>
                  )}
                  {idea.createdAt && (
                    <div>
                      <span className="text-sm text-gray-500">تاريخ الإنشاء:</span>
                      <span className="block font-medium text-gray-900">
                        {new Date(idea.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                    <div>
                      <span className="text-sm text-gray-500">آخر تحديث:</span>
                      <span className="block font-medium text-gray-900">
                        {new Date(idea.updatedAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">إجمالي الأصوات:</span>
                    <span className="block font-medium text-gray-900">{votesCount}</span>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">مراحل التقدم</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                    <div>
                      <span className="font-medium text-gray-900">تم الإرسال</span>
                      {idea.createdAt && (
                        <p className="text-sm text-gray-500">
                          {new Date(idea.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      ['qaid_almurajaa', 'muwafaq_alayha', 'qaid_altanfeedh'].includes(idea.status) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <span className={`font-medium ${
                        ['qaid_almurajaa', 'muwafaq_alayha', 'qaid_altanfeedh'].includes(idea.status) 
                          ? 'text-gray-900' 
                          : 'text-gray-500'
                      }`}>قيد المراجعة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      ['muwafaq_alayha', 'qaid_altanfeedh'].includes(idea.status) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <span className={`font-medium ${
                        ['muwafaq_alayha', 'qaid_altanfeedh'].includes(idea.status) 
                          ? 'text-gray-900' 
                          : 'text-gray-500'
                      }`}>مُوافق عليها</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      idea.status === 'qaid_altanfeedh' 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <span className={`font-medium ${
                        idea.status === 'qaid_altanfeedh' 
                          ? 'text-gray-900' 
                          : 'text-gray-500'
                      }`}>مُنفذة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات</h3>
                <div className="space-y-3">
                  <Link
                    href="/ideas"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors block text-center font-medium"
                  >
                    العودة إلى قائمة الأفكار
                  </Link>
                  {user?.id === idea.owner.id && ['maswada', 'mursala'].includes(idea.status) && (
                    <Link
                      href={`/ideas/${idea.id}/edit`}
                      className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors block text-center font-medium"
                    >
                      تعديل الفكرة
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}