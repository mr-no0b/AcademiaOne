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

export default function CoursesPage() {
  return (
    <div>
      <Section title="My Courses">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const teacher = users.find(u => u.id === course.teacher_id);
            const department = departments.find(d => d.id === course.department_id);
            
            return (
              <Link key={course.course_code} href={`/courses/${course.course_code}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="mb-3">
                    <Badge variant="primary">{course.course_code}</Badge>
                    <Badge variant="info" className="ml-2">{department?.code}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Teacher:</strong> {teacher?.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Term:</strong> {course.term}
                  </p>
                  <p className="text-sm text-gray-700">{course.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
