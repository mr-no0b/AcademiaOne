import { notFound } from 'next/navigation';
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

const forumAnswers = [
  {
    id: 'ANS001',
    question_id: '1',
    content: 'Focus on normalization, SQL queries, and ER diagrams. Practice past papers!',
    author_id: 'U002',
    created_at: '2024-03-10T11:00:00Z',
  },
  {
    id: 'ANS002',
    question_id: '1',
    content: 'The textbook chapters 5-8 are really important. Make sure you understand ACID properties.',
    author_id: 'U003',
    created_at: '2024-03-10T15:30:00Z',
  },
  {
    id: 'ANS003',
    question_id: '1',
    content: 'Join our study group! We meet every Tuesday at the library.',
    author_id: 'U001',
    created_at: '2024-03-11T08:00:00Z',
  },
  {
    id: 'ANS004',
    question_id: '2',
    content: 'Python is more beginner-friendly with cleaner syntax.',
    author_id: 'U003',
    created_at: '2024-03-09T16:00:00Z',
  },
  {
    id: 'ANS005',
    question_id: '2',
    content: 'I started with Java and it helped me understand OOP better.',
    author_id: 'U001',
    created_at: '2024-03-09T17:00:00Z',
  },
];

interface PageProps {
  params: {
    id: string;
  };
}

export default function ForumThreadPage({ params }: PageProps) {
  const question = forumQuestions.find(q => q.id === params.id);
  
  if (!question) {
    notFound();
  }

  const author = users.find(u => u.id === question.author_id);
  const department = departments.find(d => d.id === question.department_id);
  const answers = forumAnswers.filter(a => a.question_id === question.id);

  return (
    <div>
      <Section title="Question">
        <Card>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{question.title}</h2>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="mr-4">
                <strong>Asked by:</strong> {author?.name}
              </span>
              <Badge variant="primary">{department?.code}</Badge>
              <span className="ml-4">{new Date(question.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-700">{question.content}</p>
        </Card>
      </Section>

      <Section title={`Answers (${answers.length})`}>
        {answers.length > 0 ? (
          <div className="space-y-4">
            {answers.map(answer => {
              const answerAuthor = users.find(u => u.id === answer.author_id);
              return (
                <Card key={answer.id}>
                  <p className="text-gray-700 mb-3">{answer.content}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      <strong>Answered by:</strong> {answerAuthor?.name}
                    </span>
                    <span className="ml-4">{new Date(answer.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">No answers yet. Be the first to answer!</p>
          </Card>
        )}
      </Section>

      <Section title="Post Your Answer">
        <Card>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
            rows={5}
            placeholder="Write your answer here..."
            disabled
          />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            Submit Answer (Demo Only)
          </button>
        </Card>
      </Section>
    </div>
  );
}
