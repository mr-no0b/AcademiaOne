import Link from 'next/link';
import Card from '@/components/Card';
import Section from '@/components/Section';

export default function HomePage() {
  const modules = [
    { name: 'Courses', href: '/courses', description: 'View and manage your courses', icon: '📚' },
    { name: 'Forum', href: '/forum', description: 'Ask questions and discuss topics', icon: '💬' },
    { name: 'Notices', href: '/notices', description: 'View important announcements', icon: '📢' },
    { name: 'Results', href: '/results', description: 'Check your academic results', icon: '📊' },
    { name: 'Elections', href: '/elections', description: 'Participate in student elections', icon: '🗳️' },
    { name: 'Books', href: '/books', description: 'Browse recommended books', icon: '📖' },
    { name: 'Notes', href: '/notes', description: 'Share and download notes', icon: '📝' },
  ];

  return (
    <div>
      <Section title="Welcome to AcademiaOne">
        <Card>
          <p className="text-lg text-gray-700 mb-4">
            AcademiaOne is your comprehensive university management system. Access all your academic
            resources, connect with peers, and stay updated with the latest announcements.
          </p>
          <p className="text-gray-600">
            Select a module below to get started.
          </p>
        </Card>
      </Section>

      <Section title="Quick Access">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-4xl mb-3">{module.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{module.name}</h3>
                <p className="text-gray-600">{module.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
