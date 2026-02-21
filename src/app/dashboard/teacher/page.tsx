'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'attendance' | 'forum' | 'notices'>('overview');

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your classes and students</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'classrooms', label: 'My Classes' },
                  { id: 'attendance', label: 'Attendance' },
                  { id: 'forum', label: 'Forum' },
                  { id: 'notices', label: 'Notice Board' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'classrooms' && <ClassroomsTab token={token} />}
              {activeTab === 'attendance' && <AttendanceTab token={token} />}
              {activeTab === 'forum' && <ForumTab token={token} user={user} />}
              {activeTab === 'notices' && <NoticesTab token={token} userRole="teacher" />}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OverviewTab() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">4</h3>
          <p className="text-gray-600">Active Classes</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">142</h3>
          <p className="text-gray-600">Total Students</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800">28</h3>
          <p className="text-gray-600">Pending Tasks</p>
        </div>
      </div>


    </div>
  );
}

function ClassroomsTab({ token }: { token: string | null }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          + Create Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {['CSE 101 - Introduction to Programming', 'CSE 201 - Data Structures', 'CSE 301 - Algorithms'].map((course, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{course}</h3>
                <p className="text-sm text-gray-600 mt-1">Fall 2026 • 45 Students</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                Mark Attendance
              </button>
              <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm">
                Assignments
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceTab({ token }: { token: string | null }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' }>({});

  const handleMarkAttendance = async () => {
    if (!token || !selectedClass) {
      alert('Please select a class');
      return;
    }

    const presentStudents = Object.entries(attendance)
      .filter(([_, status]) => status === 'present')
      .map(([studentId]) => studentId);
    
    const absentStudents = Object.entries(attendance)
      .filter(([_, status]) => status === 'absent')
      .map(([studentId]) => studentId);

    if (presentStudents.length === 0 && absentStudents.length === 0) {
      alert('Please mark attendance for at least one student');
      return;
    }

    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          classroomId: selectedClass,
          date,
          lectureNumber: 1,
          presentStudents,
          absentStudents,
        }),
      });

      if (response.ok) {
        alert('Attendance marked successfully');
        setAttendance({});
      } else {
        const error = await response.json();
        alert(`Failed to mark attendance: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const toggleAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' as any : status
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Mark Attendance</h2>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Choose a class...</option>
              <option value="1">CSE 101 - Introduction to Programming</option>
              <option value="2">CSE 201 - Data Structures</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        {selectedClass && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Student List (45 students)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.from({ length: 10 }).map((_, idx) => {
                const studentId = `STU-${String(idx + 1).padStart(3, '0')}`;
                const status = attendance[studentId];
                return (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Student {idx + 1}</p>
                      <p className="text-sm text-gray-700">{studentId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleAttendance(studentId, 'present')}
                        className={`px-4 py-2 rounded-lg transition ${
                          status === 'present' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => toggleAttendance(studentId, 'absent')}
                        className={`px-4 py-2 rounded-lg transition ${
                          status === 'absent' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleMarkAttendance}
              className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Submit Attendance
            </button>
          </div>
        )}
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
      <h2 className="text-xl font-bold text-gray-800 mb-4">Forum Questions</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">All Questions</h3>
              <p className="text-sm text-gray-600">Ask questions and share knowledge with the community.</p>
            </div>
            <button 
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showQuestionForm ? 'Cancel' : 'Ask Question'}
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
                <div key={q._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
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
                                    <p className="text-xs text-gray-600 mt-1">
                                      Answered by {ans.authorId} • {new Date(ans.createdAt).toLocaleDateString()}
                                    </p>
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
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: '', content: '', priority: 'normal' });
  const [submitting, setSubmitting] = React.useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.title || !formData.content) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ title: '', content: '', priority: 'normal' });
        setShowForm(false);
        fetchNotices();
      }
    } catch (error) {
      console.error('Failed to post notice:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canPost = userRole === 'admin' || userRole === 'teacher';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Notice Board</h2>
        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {showForm ? 'Cancel' : '+ Post Notice'}
          </button>
        )}
      </div>

      {showForm && canPost && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Notice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter notice title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter notice content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Notice'}
            </button>
          </form>
        </div>
      )}

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

