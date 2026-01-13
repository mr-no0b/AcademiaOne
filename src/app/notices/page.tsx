'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Section from '@/components/Section';
import Badge from '@/components/Badge';

const departments = [
  { id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'EEE', name: 'Electrical & Electronic Engineering', code: 'EEE' },
  { id: 'ME', name: 'Mechanical Engineering', code: 'ME' },
  { id: 'CE', name: 'Civil Engineering', code: 'CE' },
  { id: 'BBA', name: 'Business Administration', code: 'BBA' },
];

const notices = [
  {
    id: 'N001',
    title: 'University Closed on March 21',
    content: 'The university will remain closed on March 21 due to a public holiday.',
    type: 'central' as const,
    date: '2024-03-05',
    priority: 'high' as const,
  },
  {
    id: 'N002',
    title: 'Final Exam Schedule Released',
    content: 'Final exam schedule for Spring 2024 has been published on the portal.',
    type: 'central' as const,
    date: '2024-03-08',
    priority: 'high' as const,
  },
  {
    id: 'N003',
    title: 'CSE Department Seminar',
    content: 'Join us for a seminar on AI and Machine Learning on March 18.',
    type: 'department' as const,
    department_id: 'CSE',
    date: '2024-03-10',
    priority: 'medium' as const,
  },
  {
    id: 'N004',
    title: 'Lab Equipment Maintenance',
    content: 'EEE labs will be under maintenance from March 15-17.',
    type: 'department' as const,
    department_id: 'EEE',
    date: '2024-03-12',
    priority: 'medium' as const,
  },
];

export default function NoticesPage() {
  const [filter, setFilter] = useState<'all' | 'central' | 'department'>('all');

  const filteredNotices = notices.filter(notice => {
    if (filter === 'all') return true;
    return notice.type === filter;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="info">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <Section title="Notice Board">
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Notices
          </button>
          <button
            onClick={() => setFilter('central')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'central'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Central
          </button>
          <button
            onClick={() => setFilter('department')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'department'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Department
          </button>
        </div>

        <div className="space-y-4">
          {filteredNotices.map(notice => {
            const department = notice.department_id
              ? departments.find(d => d.id === notice.department_id)
              : null;

            return (
              <Card key={notice.id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{notice.title}</h3>
                  <div className="flex space-x-2">
                    {getPriorityBadge(notice.priority)}
                    <Badge variant={notice.type === 'central' ? 'primary' : 'success'}>
                      {notice.type === 'central' ? 'Central' : department?.code || 'Department'}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{notice.content}</p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {notice.date}
                </p>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
