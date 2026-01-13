import Link from 'next/link';
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

const users = [
  { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U003', name: 'Dr. Alan Turing', email: 'turing@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U004', name: 'Dr. Ada Lovelace', email: 'ada@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U005', name: 'Emily Johnson', email: 'emily@example.com', role: 'student' as const, department_id: 'EEE' },
  { id: 'U006', name: 'Dr. Tesla', email: 'tesla@example.com', role: 'teacher' as const, department_id: 'EEE' },
];

const forumQuestions = [
  {
    id: '1',
    title: 'How to prepare for Database exam?',
    content: 'Can anyone share tips for the upcoming database management exam?',
    author_id: 'U001',
    department_id: 'CSE',
    created_at: '2024-03-10T10:00:00Z',
    answers_count: 3,
  },
  {
    id: '2',
    title: 'Python vs Java for beginners?',
    content: 'Which language would you recommend for someone starting programming?',
    author_id: 'U002',
    department_id: 'CSE',
    created_at: '2024-03-09T14:30:00Z',
    answers_count: 5,
  },
  {
    id: '3',
    title: 'Circuit analysis help needed',
    content: 'Struggling with Kirchhoff\'s laws. Any resources?',
    author_id: 'U005',
    department_id: 'EEE',
    created_at: '2024-03-08T09:15:00Z',
    answers_count: 2,
  },
];

export default function ForumPage() {
  return (
    <div>
      <Section title="Discussion Forum">
        <div className="space-y-4">
          {forumQuestions.map(question => {
            const author = users.find(u => u.id === question.author_id);
            const department = departments.find(d => d.id === question.department_id);
            
            return (
              <Link key={question.id} href={`/forum/${question.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{question.title}</h3>
                    <Badge variant="info">{question.answers_count} answers</Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{question.content}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-4">
                      <strong>Asked by:</strong> {author?.name}
                    </span>
                    <Badge variant="primary">{department?.code}</Badge>
                    <span className="ml-4">{new Date(question.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
