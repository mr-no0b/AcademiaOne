import Card from '@/components/Card';
import Section from '@/components/Section';
import Badge from '@/components/Badge';
import Table from '@/components/Table';

const users = [
  { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U003', name: 'Dr. Alan Turing', email: 'turing@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U004', name: 'Dr. Ada Lovelace', email: 'ada@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U005', name: 'Emily Johnson', email: 'emily@example.com', role: 'student' as const, department_id: 'EEE' },
  { id: 'U006', name: 'Dr. Tesla', email: 'tesla@example.com', role: 'teacher' as const, department_id: 'EEE' },
];

const elections = [
  {
    id: 'E001',
    title: 'Student Council Election 2024',
    description: 'Annual student council election for academic year 2024-2025',
    start_date: '2024-03-20',
    end_date: '2024-03-22',
    status: 'upcoming' as const,
  },
  {
    id: 'E002',
    title: 'Sports Committee Election',
    description: 'Election for sports committee representatives',
    start_date: '2024-03-10',
    end_date: '2024-03-12',
    status: 'completed' as const,
  },
];

const candidates = [
  {
    id: 'C001',
    election_id: 'E001',
    student_id: 'U001',
    position: 'President',
    manifesto: 'Improve campus facilities and student welfare',
    votes: 0,
  },
  {
    id: 'C002',
    election_id: 'E001',
    student_id: 'U002',
    position: 'President',
    manifesto: 'Enhance academic support and extracurricular activities',
    votes: 0,
  },
  {
    id: 'C003',
    election_id: 'E002',
    student_id: 'U005',
    position: 'Sports Secretary',
    manifesto: 'Promote sports culture and organize more tournaments',
    votes: 145,
  },
];

export default function ElectionsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="info">Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="success">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Elections Page</h1>
    </div>
  );
}
