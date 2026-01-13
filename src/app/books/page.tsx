import Card from '@/components/Card';
import Section from '@/components/Section';
import Badge from '@/components/Badge';

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

const books = [
  {
    id: 'B001',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    course_code: 'CSE201',
    type: 'textbook' as const,
  },
  {
    id: 'B002',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    course_code: 'CSE101',
    type: 'reference' as const,
  },
  {
    id: 'B003',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth, Sudarshan',
    course_code: 'CSE301',
    type: 'textbook' as const,
  },
  {
    id: 'B004',
    title: 'Fundamentals of Electric Circuits',
    author: 'Alexander, Sadiku',
    course_code: 'EEE101',
    type: 'textbook' as const,
  },
];

export default function BooksPage() {
  // Group books by course
  const booksByCourse = books.reduce((acc, book) => {
    const courseCode = book.course_code;
    if (!acc[courseCode]) {
      acc[courseCode] = [];
    }
    acc[courseCode].push(book);
    return acc;
  }, {} as Record<string, typeof books>);

  return (
    <div>
      <Section title="Book Recommendations">
        <div className="space-y-6">
          {Object.entries(booksByCourse).map(([courseCode, courseBooks]) => {
            const course = courses.find(c => c.course_code === courseCode);
            
            return (
              <Card key={courseCode}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {course?.title || courseCode}
                  <Badge variant="primary" className="ml-3">
                    {courseCode}
                  </Badge>
                </h3>
                
                <div className="space-y-4">
                  {courseBooks.map(book => (
                    <div key={book.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{book.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Author:</strong> {book.author}
                          </p>
                        </div>
                        <Badge variant={book.type === 'textbook' ? 'success' : 'info'}>
                          {book.type}
                        </Badge>
                      </div>
                      {book.link && (
                        <a
                          href={book.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          View Resource →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
