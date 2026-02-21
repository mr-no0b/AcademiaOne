'use client';

import { useState } from 'react';
import * as React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'departments' | 'courses' | 'notices'>('overview');

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, departments, and courses</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'users', label: 'Users' },
                  { id: 'departments', label: 'Departments' },
                  { id: 'courses', label: 'Courses' },
                  { id: 'notices', label: 'Notice Board' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
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
              {activeTab === 'users' && <UsersTab token={token} />}
              {activeTab === 'departments' && <DepartmentsTab token={token} />}
              {activeTab === 'courses' && <CoursesTab token={token} />}
              {activeTab === 'notices' && <NoticesTab token={token} userRole="admin" />}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800">245</h3>
        <p className="text-gray-600">Total Users</p>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800">8</h3>
        <p className="text-gray-600">Departments</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800">156</h3>
        <p className="text-gray-600">Active Courses</p>
      </div>
    </div>
  );
}

function UsersTab({ token }: { token: string | null }) {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    role: 'student',
    firstName: '',
    lastName: '',
    email: '',
  });

  React.useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('User created successfully!');
        setShowCreateForm(false);
        setFormData({
          userId: '',
          password: '',
          role: 'student',
          firstName: '',
          lastName: '',
          email: '',
        });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="e.g., STU-011"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: any) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'teacher' ? 'bg-gray-100 text-gray-700' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 text-center">No users found.</p>
        </div>
      )}
    </div>
  );
}

function DepartmentsTab({ token }: { token: string | null }) {
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      fetchDepartments();
    }
  }, [token]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Department Management</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading departments...</p>
        </div>
      ) : departments.length > 0 ? (
        <div className="grid gap-4">
          {departments.map((dept: any) => (
            <div key={dept._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Code: {dept.code}</p>
                  {dept.head && (
                    <p className="text-sm text-gray-600 mt-1">Head: {dept.head.firstName} {dept.head.lastName}</p>
                  )}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {dept.courses?.length || 0} Courses
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 text-center">No departments found. Run 'npm run seed' to populate data.</p>
        </div>
      )}
    </div>
  );
}

function CoursesTab({ token }: { token: string | null }) {
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Course Management</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course: any) => (
            <div key={course._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Code: {course.code}</p>
                  <p className="text-sm text-gray-600">Credits: {course.credits} | Semester: {course.semester}</p>
                  {course.department && (
                    <p className="text-sm text-gray-600">Department: {course.department.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {course.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 text-center">No courses found. Run 'npm run seed' to populate data.</p>
        </div>
      )}
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

