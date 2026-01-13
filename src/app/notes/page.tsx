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

const notes = [
  {
    id: 'NT001',
    title: 'Python Basics Cheat Sheet',
    course_code: 'CSE101',
    uploaded_by: 'U002',
    upload_date: '2024-03-01',
    file_name: 'python_cheatsheet.pdf',
    downloads: 45,
  },
  {
    id: 'NT002',
    title: 'Data Structures Summary',
    course_code: 'CSE201',
    uploaded_by: 'U001',
    upload_date: '2024-03-05',
    file_name: 'ds_summary.pdf',
    downloads: 32,
  },
  {
    id: 'NT003',
    title: 'SQL Query Examples',
    course_code: 'CSE301',
    uploaded_by: 'U002',
    upload_date: '2024-03-08',
    file_name: 'sql_examples.pdf',
    downloads: 28,
  },
];

export default function NotesPage() {
  return (
    <div>

      <Section title="Available Notes">
        <Card>
          <Table
            headers={['Title', 'Course', 'Uploaded By', 'Date', 'Downloads', 'File']}
            data={notes.map(note => {
              const course = courses.find(c => c.course_code === note.course_code);
              const uploader = users.find(u => u.id === note.uploaded_by);
              return [
                note.title,
                `${note.course_code} - ${course?.title || 'N/A'}`,
                uploader?.name || 'N/A',
                note.upload_date,
                note.downloads,
                note.file_name,
              ];
            })}
          />
        </Card>
      </Section>

      <Section title="Popular Notes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 6)
            .map(note => {
              const course = courses.find(c => c.course_code === note.course_code);
              const uploader = users.find(u => u.id === note.uploaded_by);
              
              return (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <Badge variant="primary" className="mb-2">
                    {note.course_code}
                  </Badge>
                  <h4 className="font-semibold text-gray-800 mb-2">{note.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>By:</strong> {uploader?.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Downloads:</strong> {note.downloads}
                  </p>
                  <button
                    className="text-blue-600 hover:underline text-sm cursor-not-allowed"
                    disabled
                  >
                    Download (Demo)
                  </button>
                </Card>
              );
            })}
        </div>
      </Section>
    </div>
  );
}
