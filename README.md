# AcademiaOne - University Management System

A frontend-only prototype for a university management system built with Next.js 14 (App Router) and TypeScript.

## Features

This prototype includes the following modules:

- **Dashboard** - Overview and quick access to all modules
- **Courses** - View courses with details, announcements, assignments, submissions, and attendance
- **Forum** - Discussion board for questions and answers
- **Notices** - Central and department-specific announcements
- **Results** - Academic results and department rankings
- **Elections** - Student elections with candidates and voting
- **Books** - Course-wise book recommendations
- **Notes** - Share and download study notes

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.x or higher recommended)
- **npm** (comes with Node.js)

## Installation

1. Navigate to the project directory:
```bash
cd /home/lionking/Desktop/System_Project
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Building for Production

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
System_Project/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with navbar
│   │   ├── page.tsx            # Dashboard page
│   │   ├── globals.css         # Global styles
│   │   ├── courses/
│   │   │   ├── page.tsx        # Courses list
│   │   │   └── [course_code]/
│   │   │       └── page.tsx    # Course details
│   │   ├── forum/
│   │   │   ├── page.tsx        # Forum questions list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Forum thread
│   │   ├── notices/
│   │   │   └── page.tsx        # Notice board
│   │   ├── results/
│   │   │   └── page.tsx        # Academic results
│   │   ├── elections/
│   │   │   └── page.tsx        # Elections
│   │   ├── books/
│   │   │   └── page.tsx        # Book recommendations
│   │   └── notes/
│   │       └── page.tsx        # Notes sharing
│   ├── components/
│   │   ├── Badge.tsx           # Badge component
│   │   ├── Card.tsx            # Card component
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Section.tsx         # Section component
│   │   └── Table.tsx           # Table component
│   └── lib/
│       └── mockData.ts         # All mock data
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Mock Data

All data is hardcoded in `/src/lib/mockData.ts`. No database or API calls are used. The mock data includes:

- Departments (CSE, EEE, ME, CE, BBA)
- Users (students, teachers, admins)
- Courses with announcements and assignments
- Forum questions and answers
- Notices (central and department-specific)
- Student results and rankings
- Elections and candidates
- Book recommendations
- Study notes

## Notes

- This is a **frontend-only prototype** with no backend, database, or authentication
- All forms are disabled and for demonstration purposes only
- Dynamic routes use course codes (`/courses/CSE101`) and numeric IDs (`/forum/1`)
- The `notFound()` function handles invalid routes
- All components are responsive and use Tailwind CSS for styling

## License

This is a university project prototype and is not licensed for production use.
