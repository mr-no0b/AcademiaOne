import { notFound } from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import Badge from '@/components/Badge';
import Table from '@/components/Table';

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

const announcements = [
  {
    id: 'A001',
    course_code: 'CSE101',
    title: 'Midterm Exam Schedule',
    content: 'The midterm exam will be held on March 15, 2024, at 10:00 AM in Room 301.',
    date: '2024-03-01',
    author_id: 'U003',
  },
  {
    id: 'A002',
    course_code: 'CSE101',
    title: 'Assignment Extension',
    content: 'Assignment 2 deadline has been extended to March 20, 2024.',
    date: '2024-03-05',
    author_id: 'U003',
  },
  {
    id: 'A003',
    course_code: 'CSE201',
    title: 'Guest Lecture',
    content: 'We will have a guest lecture on Advanced Algorithms next week.',
    date: '2024-03-08',
    author_id: 'U004',
  },
];

const assignments = [
  {
    id: 'AS001',
    course_code: 'CSE101',
    title: 'Python Basics Assignment',
    description: 'Complete exercises on variables, loops, and functions',
    due_date: '2024-03-15',
    total_marks: 20,
  },
  {
    id: 'AS002',
    course_code: 'CSE101',
    title: 'Object-Oriented Programming',
    description: 'Build a simple class hierarchy',
    due_date: '2024-03-25',
    total_marks: 30,
  },
  {
    id: 'AS003',
    course_code: 'CSE201',
    title: 'Linked List Implementation',
    description: 'Implement singly and doubly linked lists',
    due_date: '2024-03-20',
    total_marks: 25,
  },
];

const submissions = [
  {
    id: 'SUB001',
    assignment_id: 'AS001',
    student_id: 'U001',
    submitted_date: '2024-03-14',
    marks_obtained: 18,
    file_name: 'python_basics_john.py',
  },
  {
    id: 'SUB002',
    assignment_id: 'AS001',
    student_id: 'U002',
    submitted_date: '2024-03-15',
    marks_obtained: 19,
    file_name: 'python_basics_jane.py',
  },
];

const attendanceSummaries = [
  {
    course_code: 'CSE101',
    student_id: 'U001',
    total_classes: 30,
    attended_classes: 27,
    percentage: 90,
  },
  {
    course_code: 'CSE201',
    student_id: 'U001',
    total_classes: 28,
    attended_classes: 25,
    percentage: 89.3,
  },
];

interface PageProps {
  params: {
    course_code: string;
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  const course = courses.find(c => c.course_code === params.course_code);
  
  if (!course) {
    notFound();
  }

  const teacher = users.find(u => u.id === course.teacher_id);
  const department = departments.find(d => d.id === course.department_id);
  const courseAnnouncements = announcements.filter(a => a.course_code === course.course_code);
  const courseAssignments = assignments.filter(a => a.course_code === course.course_code);
  const attendance = attendanceSummaries.find(a => a.course_code === course.course_code);

  // Get submissions for the course assignments
  const assignmentIds = courseAssignments.map(a => a.id);
  const courseSubmissions = submissions.filter(s => assignmentIds.includes(s.assignment_id));

  return (
    <div>
      <Section title={course.title}>
        <Card>
          <div className="mb-4">
            <Badge variant="primary">{course.course_code}</Badge>
            <Badge variant="info" className="ml-2">{department?.code}</Badge>
            <Badge variant="success" className="ml-2">{course.term}</Badge>
          </div>
          <p className="text-gray-700 mb-2">
            <strong>Teacher:</strong> {teacher?.name}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Department:</strong> {department?.name}
          </p>
          <p className="text-gray-700">{course.description}</p>
        </Card>
      </Section>

      {attendance && (
        <Section title="Attendance Summary">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">
                  <strong>Total Classes:</strong> {attendance.total_classes}
                </p>
                <p className="text-gray-700">
                  <strong>Classes Attended:</strong> {attendance.attended_classes}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {attendance.percentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </Card>
        </Section>
      )}

      <Section title="Announcements">
        {courseAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {courseAnnouncements.map(announcement => {
              const author = users.find(u => u.id === announcement.author_id);
              return (
                <Card key={announcement.id}>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {announcement.date} • {author?.name}
                  </p>
                  <p className="text-gray-700">{announcement.content}</p>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">No announcements yet.</p>
          </Card>
        )}
      </Section>

      <Section title="Assignments">
        {courseAssignments.length > 0 ? (
          <div className="space-y-4">
            {courseAssignments.map(assignment => (
              <Card key={assignment.id}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {assignment.title}
                  </h3>
                  <Badge variant="warning">Due: {assignment.due_date}</Badge>
                </div>
                <p className="text-gray-700 mb-2">{assignment.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Total Marks:</strong> {assignment.total_marks}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">No assignments yet.</p>
          </Card>
        )}
      </Section>

      {courseSubmissions.length > 0 && (
        <Section title="Submissions">
          <Card>
            <Table
              headers={['Assignment', 'Student', 'Submitted Date', 'Marks', 'File']}
              data={courseSubmissions.map(sub => {
                const assignment = assignments.find(a => a.id === sub.assignment_id);
                const student = users.find(u => u.id === sub.student_id);
                return [
                  assignment?.title || 'N/A',
                  student?.name || 'N/A',
                  sub.submitted_date,
                  `${sub.marks_obtained}/${assignment?.total_marks || 0}`,
                  sub.file_name,
                ];
              })}
            />
          </Card>
        </Section>
      )}
    </div>
  );
}
