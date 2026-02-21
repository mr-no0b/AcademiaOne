'use client';

import { useState } from 'react';
import * as React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'registration' | 'attendance' | 'results' | 'forum' | 'notices'>('overview');

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'registration', label: 'Registration' },
                  { id: 'attendance', label: 'Attendance' },
                  { id: 'results', label: 'Results' },
                  { id: 'forum', label: 'Forum' },
                  { id: 'notices', label: 'Notice Board' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab user={user} />}
              {activeTab === 'registration' && <RegistrationTab token={token} />}
              {activeTab === 'attendance' && <AttendanceTab token={token} />}
              {activeTab === 'results' && <ResultsTab token={token} />}
              {activeTab === 'forum' && <ForumTab token={token} user={user} />}
              {activeTab === 'notices' && <NoticesTab token={token} userRole="student" />}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OverviewTab({ user }: { user: any }) {
  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">6</h3>
          <p className="text-gray-600">Enrolled Courses</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">87%</h3>
          <p className="text-gray-600">Attendance</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">3.65</h3>
          <p className="text-gray-600">CGPA</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">5</h3>
          <p className="text-gray-600">Pending Tasks</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Attendance Warning</h3>
          <p className="text-sm text-yellow-700">Your attendance in CSE 301 is below 70%. Current: 68%</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Latest Announcements</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Mid-term exam schedule released - Check your courses</li>
            <li>• Registration for Spring 2027 opens next week</li>
            <li>• New books available in the library</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function RegistrationTab({ token }: { token: string | null }) {
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const availableCourses = [
    { id: 'CSE401', name: 'Software Engineering', credits: 3, semester: 'Fall 2026' },
    { id: 'CSE402', name: 'Computer Networks', credits: 3, semester: 'Fall 2026' },
    { id: 'CSE403', name: 'Database Systems', credits: 3, semester: 'Fall 2026' },
    { id: 'CSE404', name: 'Operating Systems', credits: 3, semester: 'Fall 2026' },
  ];

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmitRegistration = async () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          semester: 'Fall 2026',
          year: 2026,
          courseIds: selectedCourses,
        }),
      });

      if (response.ok) {
        alert('Registration submitted successfully!');
        setSelectedCourses([]);
        setShowRegistration(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to submit registration');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Course Registration</h2>
        <button
          onClick={() => setShowRegistration(!showRegistration)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showRegistration ? 'Cancel' : '+ New Registration'}
        </button>
      </div>

      {showRegistration ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Select Courses (Fall 2026)</h3>
          <div className="space-y-3 mb-6">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedCourses.includes(course.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => toggleCourse(course.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{course.name}</h4>
                    <p className="text-sm text-gray-600">{course.id} • {course.credits} Credits</p>
                  </div>
                  <div className="flex items-center">
                    {selectedCourses.includes(course.id) && (
                      <span className="text-green-600 font-bold mr-2">Selected</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Credits:</span>
              <span className="font-bold">{selectedCourses.length * 3}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitRegistration}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Submit Registration
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Fall 2026 Registration</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Pending Advisor Approval
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">6 courses • 18 credits</p>
              <p className="text-xs text-gray-500">Submitted on: Feb 10, 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendanceTab({ token }: { token: string | null }) {
  const courses = [
    { name: 'CSE 301 - Algorithms', attendance: 68, status: 'warning' },
    { name: 'CSE 302 - Database Systems', attendance: 85, status: 'good' },
    { name: 'CSE 303 - Software Engineering', attendance: 92, status: 'excellent' },
    { name: 'CSE 304 - Computer Networks', attendance: 78, status: 'good' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Attendance</h2>
      
      <div className="space-y-4">
        {courses.map((course, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">{course.name}</h3>
              <span className={`text-2xl font-bold ${
                course.status === 'warning' ? 'text-red-600' :
                course.status === 'good' ? 'text-gray-700' : 'text-green-600'
              }`}>
                {course.attendance}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  course.status === 'warning' ? 'bg-red-500' :
                  course.status === 'good' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${course.attendance}%` }}
              ></div>
            </div>
            {course.status === 'warning' && (
              <p className="text-sm text-red-600 mt-2">Below minimum threshold (70%)</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab({ token }: { token: string | null }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Results</h2>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Semester (Fall 2026)</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-purple-600">3.72</p>
            <p className="text-sm text-gray-600">Semester GPA</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">3.65</p>
            <p className="text-sm text-gray-600">Cumulative CGPA</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { course: 'CSE 301 - Algorithms', credits: 3, grade: 'A', points: 4.0 },
              { course: 'CSE 302 - Database Systems', credits: 3, grade: 'A-', points: 3.7 },
              { course: 'CSE 303 - Software Engineering', credits: 3, grade: 'B+', points: 3.3 },
              { course: 'CSE 304 - Computer Networks', credits: 3, grade: 'A', points: 4.0 },
            ].map((result, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 text-sm text-gray-800">{result.course}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{result.credits}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{result.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForumTab({ token, user }: { token: string | null; user: any }) {
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showQuestionForm, setShowQuestionForm] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: '', content: '', tags: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<{ [key: string]: any[] }>({});
  const [answerContent, setAnswerContent] = React.useState<{ [key: string]: string }>({});
  const [loadingAnswers, setLoadingAnswers] = React.useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    if (token) {
      fetchQuestions();
    }
  }, [token]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forum/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questionId: string) => {
    setLoadingAnswers(prev => ({ ...prev, [questionId]: true }));
    try {
      const response = await fetch(`/api/forum/questions/${questionId}/answers`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(prev => ({ ...prev, [questionId]: data.answers || [] }));
      }
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const toggleQuestion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      if (!answers[questionId]) {
        fetchAnswers(questionId);
      }
    }
  };

  const handleVoteQuestion = async (questionId: string, voteType: 'up' | 'down') => {
    if (!token) return;
    try {
      const response = await fetch(`/api/forum/questions/${questionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });
      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleVoteAnswer = async (answerId: string, voteType: 'up' | 'down', questionId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/forum/answers/${answerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });
      if (response.ok) {
        fetchAnswers(questionId);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!token || !answerContent[questionId]) return;
    try {
      const response = await fetch(`/api/forum/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: answerContent[questionId] }),
      });
      if (response.ok) {
        setAnswerContent(prev => ({ ...prev, [questionId]: '' }));
        fetchAnswers(questionId);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Failed to post answer:', error);
    }
  };

  const handleAcceptAnswer = async (questionId: string, answerId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/forum/questions/${questionId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answerId }),
      });
      if (response.ok) {
        fetchAnswers(questionId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept answer');
      }
    } catch (error) {
      console.error('Failed to accept answer:', error);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/forum/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setFormData({ title: '', content: '', tags: '' });
        setShowQuestionForm(false);
        fetchQuestions();
      } else {
        const error = await response.json();
        alert('Failed to post question: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to post question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Forum Q&A</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="border-b pb-4">
            <button 
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showQuestionForm ? 'Cancel' : 'Ask a Question'}
            </button>
          </div>

          {showQuestionForm && (
            <form onSubmit={handleSubmitQuestion} className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="What's your question?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Details</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="Provide more details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., programming, data-structures"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Question'}
              </button>
            </form>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((q: any) => (
                <div key={q._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleVoteQuestion(q._id, 'up')}
                        className="text-gray-600 hover:text-green-600"
                      >
                        ▲
                      </button>
                      <span className="font-semibold text-gray-900">
                        {(q.upvotes || 0) - (q.downvotes || 0)}
                      </span>
                      <button
                        onClick={() => handleVoteQuestion(q._id, 'down')}
                        className="text-gray-600 hover:text-red-600"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                        onClick={() => toggleQuestion(q._id)}
                      >
                        {q.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Asked by {q.authorId} • {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                      {q.tags && q.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {q.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <button onClick={() => toggleQuestion(q._id)} className="hover:text-indigo-600">
                          {answers[q._id]?.length || q.answerCount || 0} answers
                        </button>
                        <span>{q.views || 0} views</span>
                      </div>

                      {expandedQuestion === q._id && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-gray-700 mb-4">{q.content}</p>
                          
                          <h5 className="font-semibold text-gray-900 mb-3">Answers</h5>
                          {loadingAnswers[q._id] ? (
                            <p className="text-gray-600">Loading answers...</p>
                          ) : answers[q._id] && answers[q._id].length > 0 ? (
                            <div className="space-y-3 mb-4">
                              {answers[q._id].map((ans: any) => (
                                <div key={ans._id} className={`bg-white rounded p-3 flex gap-3 ${ans.isAccepted ? 'border-2 border-green-500' : ''}`}>
                                  <div className="flex flex-col items-center gap-1">
                                    <button
                                      onClick={() => handleVoteAnswer(ans._id, 'up', q._id)}
                                      className="text-gray-600 hover:text-green-600 text-sm"
                                    >
                                      ▲
                                    </button>
                                    <span className="font-semibold text-sm">
                                      {(ans.upvotes || 0) - (ans.downvotes || 0)}
                                    </span>
                                    <button
                                      onClick={() => handleVoteAnswer(ans._id, 'down', q._id)}
                                      className="text-gray-600 hover:text-red-600 text-sm"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <p className="text-gray-900 flex-1">{ans.content}</p>
                                      {ans.isAccepted && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold">
                                          ✓ Accepted
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs text-gray-600">
                                        Answered by {ans.authorId} • {new Date(ans.createdAt).toLocaleDateString()}
                                      </p>
                                      {q.authorId === user?.userId && !ans.isAccepted && (
                                        <button
                                          onClick={() => handleAcceptAnswer(q._id, ans._id)}
                                          className="text-xs text-green-600 hover:text-green-700 font-semibold"
                                        >
                                          Mark as Accepted
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 mb-4">No answers yet. Be the first to answer!</p>
                          )}

                          <div className="bg-white rounded p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                            <textarea
                              value={answerContent[q._id] || ''}
                              onChange={(e) => setAnswerContent(prev => ({ ...prev, [q._id]: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                              placeholder="Write your answer..."
                            />
                            <button
                              onClick={() => handleSubmitAnswer(q._id)}
                              disabled={!answerContent[q._id]}
                              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Post Answer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No questions yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoticesTab({ token, userRole }: { token: string | null; userRole: string }) {
  const [notices, setNotices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      fetchNotices();
    }
  }, [token]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Notice Board</h2>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading notices...</p>
          </div>
        ) : notices.length > 0 ? (
          notices.map((notice: any) => (
            <div
              key={notice._id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                notice.priority === 'urgent' ? 'border-red-500' :
                notice.priority === 'important' ? 'border-yellow-500' :
                'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                {notice.priority !== 'normal' && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    notice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notice.priority.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{notice.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Posted by {notice.authorName} ({notice.authorRole})</span>
                <span>{new Date(notice.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No notices yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

