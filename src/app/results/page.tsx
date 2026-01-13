import Card from '@/components/Card';
import Section from '@/components/Section';
import Table from '@/components/Table';
import Badge from '@/components/Badge';

const users = [
  { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', role: 'student' as const, department_id: 'CSE' },
  { id: 'U003', name: 'Dr. Alan Turing', email: 'turing@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U004', name: 'Dr. Ada Lovelace', email: 'ada@example.com', role: 'teacher' as const, department_id: 'CSE' },
  { id: 'U005', name: 'Emily Johnson', email: 'emily@example.com', role: 'student' as const, department_id: 'EEE' },
  { id: 'U006', name: 'Dr. Tesla', email: 'tesla@example.com', role: 'teacher' as const, department_id: 'EEE' },
];

const courses = [
  {
    course_code: 'CSE101',
    title: 'Introduction to Programming',
    teacher_id: 'U003',
    department_id: 'CSE',
    term: 'Spring 2024',
    description: 'Fundamentals of programming using Python',
  },
  {
    course_code: 'CSE201',
    title: 'Data Structures',
    teacher_id: 'U004',
    department_id: 'CSE',
    term: 'Spring 2024',
    description: 'Learn about arrays, linked lists, trees, and graphs',
  },
  {
    course_code: 'CSE301',
    title: 'Database Management Systems',
    teacher_id: 'U003',
    department_id: 'CSE',
    term: 'Spring 2024',
    description: 'Introduction to relational databases and SQL',
  },
  {
    course_code: 'EEE101',
    title: 'Circuit Analysis',
    teacher_id: 'U006',
    department_id: 'EEE',
    term: 'Spring 2024',
    description: 'Basic electrical circuits and analysis',
  },
];

const results = [
  {
    id: 'R001',
    student_id: 'U001',
    course_code: 'CSE101',
    marks_obtained: 85,
    total_marks: 100,
    grade: 'A',
    term: 'Fall 2023',
  },
  {
    id: 'R002',
    student_id: 'U001',
    course_code: 'CSE201',
    marks_obtained: 78,
    total_marks: 100,
    grade: 'B+',
    term: 'Fall 2023',
  },
  {
    id: 'R003',
    student_id: 'U001',
    course_code: 'CSE301',
    marks_obtained: 92,
    total_marks: 100,
    grade: 'A+',
    term: 'Fall 2023',
  },
];

const departmentRankings = [
  { rank: 1, student_id: 'U002', cgpa: 3.95, total_credits: 120 },
  { rank: 2, student_id: 'U001', cgpa: 3.85, total_credits: 120 },
  { rank: 3, student_id: 'U005', cgpa: 3.75, total_credits: 115 },
];

export default function ResultsPage() {
  

  return (
    <h1 className="text-2xl font-bold text-gray-800">Results Page</h1>
  );
}
