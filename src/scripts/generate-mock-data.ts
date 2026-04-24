import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import * as dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { getMongoConnectionConfig } from "../lib/mongo-config";
import { encodeForumQuestion } from "../lib/forum-similarity";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MOCK_PASSWORD = "123456";
const ACTIVE_YEAR = "2025-26";
const PREVIOUS_YEAR = "2024-25";
const ACTIVE_SEMESTER = "1-1";
const NEXT_SEMESTER = "1-2";

const COLLECTIONS_TO_CLEAR = [
  "users",
  "departments",
  "courses",
  "courseofferings",
  "enrollments",
  "registrations",
  "registrationwindows",
  "resultwindows",
  "sessions",
  "attendancerecords",
  "attendancesessions",
  "results",
  "markentries",
  "notices",
  "forumposts",
  "forumanswers",
  "elections",
  "electioncandidates",
  "electionvotes",
  "notes",
  "bookrecommendations",
  "assignments",
  "submissions",
  "notifications",
];

const gradeScale = [
  { min: 80, letter: "A+", point: 4.0 },
  { min: 75, letter: "A", point: 3.75 },
  { min: 70, letter: "A-", point: 3.5 },
  { min: 65, letter: "B+", point: 3.25 },
  { min: 60, letter: "B", point: 3.0 },
  { min: 55, letter: "B-", point: 2.75 },
  { min: 50, letter: "C+", point: 2.5 },
  { min: 45, letter: "C", point: 2.25 },
  { min: 40, letter: "D", point: 2.0 },
  { min: 0, letter: "F", point: 0 },
];

function parseArgs(argv: string[]) {
  return {
    allowAtlas: argv.includes("--allow-atlas"),
  };
}

function oid() {
  return new ObjectId();
}

function nowMinus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function nowPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function gradeFor(marks: number) {
  return gradeScale.find((grade) => marks >= grade.min) ?? gradeScale[gradeScale.length - 1];
}

function calculateGpa(courses: Array<{ credits: number; gradePoint: number }>) {
  const credits = courses.reduce((sum, course) => sum + course.credits, 0);
  if (!credits) return 0;
  const qualityPoints = courses.reduce(
    (sum, course) => sum + course.credits * course.gradePoint,
    0
  );
  return Math.round((qualityPoints / credits) * 100) / 100;
}

async function clearCollections() {
  const db = mongoose.connection.db!;
  for (const collectionName of COLLECTIONS_TO_CLEAR) {
    try {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`Cleared ${collectionName}: ${result.deletedCount}`);
    } catch {
      console.log(`Skipped ${collectionName} (missing collection)`);
    }
  }
}

async function generateMockData() {
  const args = parseArgs(process.argv.slice(2));
  const { target, uri } = getMongoConnectionConfig();

  if (target !== "local" && !args.allowAtlas) {
    throw new Error(
      "Refusing to seed a non-local MongoDB target. Re-run with --allow-atlas if you intentionally want this."
    );
  }

  console.log(`Connecting to MongoDB (${target})...`);
  console.log(`Target URI: ${uri.replace(/\/\/.*@/, "//<credentials>@")}`);

  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  });

  await clearCollections();

  const db = mongoose.connection.db!;
  const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 12);
  const createdAt = nowMinus(20);
  const updatedAt = new Date();

  const adminId = oid();
  const cseDeptId = oid();
  const eeeDeptId = oid();

  const teacherIds = {
    cseHead: oid(),
    cseAdvisor: oid(),
    cseTeacher: oid(),
    eeeHead: oid(),
    eeeAdvisor: oid(),
    eeeTeacher: oid(),
  };

  const students = [
    { _id: oid(), userId: "S1", name: "Afsana Rahman", deptId: cseDeptId, advisorId: teacherIds.cseAdvisor },
    { _id: oid(), userId: "S2", name: "Nabil Hassan", deptId: cseDeptId, advisorId: teacherIds.cseAdvisor },
    { _id: oid(), userId: "S3", name: "Maliha Islam", deptId: cseDeptId, advisorId: teacherIds.cseAdvisor },
    { _id: oid(), userId: "S4", name: "Rafi Chowdhury", deptId: cseDeptId, advisorId: teacherIds.cseAdvisor },
    { _id: oid(), userId: "S5", name: "Ishraq Ahmed", deptId: eeeDeptId, advisorId: teacherIds.eeeAdvisor },
    { _id: oid(), userId: "S6", name: "Tasnim Jahan", deptId: eeeDeptId, advisorId: teacherIds.eeeAdvisor },
    { _id: oid(), userId: "S7", name: "Arman Karim", deptId: eeeDeptId, advisorId: teacherIds.eeeAdvisor },
    { _id: oid(), userId: "S8", name: "Muna Sultana", deptId: eeeDeptId, advisorId: teacherIds.eeeAdvisor },
  ];

  const users = [
    {
      _id: adminId,
      userId: "admin",
      name: "Admin",
      email: "admin@academiaone.test",
      password: passwordHash,
      role: "admin",
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.cseHead,
      userId: "T1",
      name: "Dr. Nusrat Karim",
      email: "nusrat.karim@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: cseDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.cseAdvisor,
      userId: "T2",
      name: "Farhan Ahmed",
      email: "farhan.ahmed@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: cseDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.cseTeacher,
      userId: "T3",
      name: "Samira Rahman",
      email: "samira.rahman@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: cseDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.eeeHead,
      userId: "T4",
      name: "Dr. Mahmud Hasan",
      email: "mahmud.hasan@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: eeeDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.eeeAdvisor,
      userId: "T5",
      name: "Rubaiyat Islam",
      email: "rubaiyat.islam@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: eeeDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    {
      _id: teacherIds.eeeTeacher,
      userId: "T6",
      name: "Tanvir Chowdhury",
      email: "tanvir.chowdhury@academiaone.test",
      password: passwordHash,
      role: "teacher",
      departmentId: eeeDeptId,
      isActive: true,
      createdAt,
      updatedAt,
    },
    ...students.map((student) => ({
      _id: student._id,
      userId: student.userId,
      name: student.name,
      email: `${student.userId.toLowerCase()}@academiaone.test`,
      password: passwordHash,
      role: "student",
      departmentId: student.deptId,
      advisorId: student.advisorId,
      currentSemester: ACTIVE_SEMESTER,
      session: ACTIVE_YEAR,
      isActive: true,
      forumBanned: student.userId === "S4",
      createdAt,
      updatedAt,
    })),
  ];

  const departments = [
    {
      _id: cseDeptId,
      name: "Computer Science and Engineering",
      code: "CSE",
      headId: teacherIds.cseHead,
      advisorIds: [teacherIds.cseAdvisor],
      createdAt,
      updatedAt,
    },
    {
      _id: eeeDeptId,
      name: "Electrical and Electronic Engineering",
      code: "EEE",
      headId: teacherIds.eeeHead,
      advisorIds: [teacherIds.eeeAdvisor],
      createdAt,
      updatedAt,
    },
  ];

  const sessions = [
    {
      _id: oid(),
      year: ACTIVE_YEAR,
      isActive: true,
      createdBy: adminId,
      createdAt,
      updatedAt,
    },
    {
      _id: oid(),
      year: PREVIOUS_YEAR,
      isActive: false,
      createdBy: adminId,
      createdAt: nowMinus(300),
      updatedAt: nowMinus(300),
    },
  ];

  const courses = [
    { _id: oid(), code: "CSE101", title: "Structured Programming", credits: 3, departmentId: cseDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Programming fundamentals with C." },
    { _id: oid(), code: "CSE102", title: "Discrete Mathematics", credits: 3, departmentId: cseDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Logic, sets, relations, and graph theory." },
    { _id: oid(), code: "MATH101", title: "Calculus I", credits: 3, departmentId: cseDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Differential and integral calculus." },
    { _id: oid(), code: "CSE103", title: "Object Oriented Programming", credits: 3, departmentId: cseDeptId, semesterLabel: NEXT_SEMESTER, description: "Classes, objects, inheritance, and polymorphism." },
    { _id: oid(), code: "CSE104", title: "Data Structures", credits: 3, departmentId: cseDeptId, semesterLabel: NEXT_SEMESTER, description: "Arrays, linked lists, stacks, queues, trees, and graphs." },
    { _id: oid(), code: "MATH102", title: "Calculus II", credits: 3, departmentId: cseDeptId, semesterLabel: NEXT_SEMESTER, description: "Integration techniques, series, and multivariable basics." },
    { _id: oid(), code: "EEE101", title: "Basic Electrical Engineering", credits: 3, departmentId: eeeDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Circuit laws and electrical measurements." },
    { _id: oid(), code: "EEE102", title: "Electronic Devices", credits: 3, departmentId: eeeDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Diodes, transistors, and semiconductor basics." },
    { _id: oid(), code: "MATH101", title: "Calculus I", credits: 3, departmentId: eeeDeptId, semesterLabel: ACTIVE_SEMESTER, description: "Differential and integral calculus." },
    { _id: oid(), code: "EEE103", title: "Circuit Analysis I", credits: 3, departmentId: eeeDeptId, semesterLabel: NEXT_SEMESTER, description: "Network theorems, transient analysis, and AC circuits." },
    { _id: oid(), code: "EEE104", title: "Digital Logic Design", credits: 3, departmentId: eeeDeptId, semesterLabel: NEXT_SEMESTER, description: "Boolean algebra, combinational logic, and sequential circuits." },
    { _id: oid(), code: "MATH102", title: "Calculus II", credits: 3, departmentId: eeeDeptId, semesterLabel: NEXT_SEMESTER, description: "Integration techniques, series, and multivariable basics." },
  ].map((course) => ({ ...course, createdAt, updatedAt }));

  const courseSections = courses.map((course, index) => {
    const cseTeachers = [teacherIds.cseHead, teacherIds.cseAdvisor, teacherIds.cseTeacher];
    const eeeTeachers = [teacherIds.eeeHead, teacherIds.eeeAdvisor, teacherIds.eeeTeacher];
    const teacherPool = course.departmentId.equals(cseDeptId) ? cseTeachers : eeeTeachers;
    return {
      _id: oid(),
      courseId: course._id,
      teacherId: teacherPool[index % 3],
      semesterLabel: course.semesterLabel,
      academicYear: ACTIVE_YEAR,
      section: "A",
      departmentId: course.departmentId,
      plannedClasses: 36,
      isActive: true,
      createdAt,
      updatedAt,
    };
  });

  const registrationWindows = [
    {
      _id: oid(),
      semesterLabel: ACTIVE_SEMESTER,
      academicYear: ACTIVE_YEAR,
      takaPerCredit: 2200,
      isOpen: true,
      openedBy: adminId,
      openedAt: nowMinus(15),
      createdAt: nowMinus(15),
      updatedAt,
    },
  ];

  const registrations = students.map((student, index) => {
    const offeringIds = courseSections
      .filter((section) => section.departmentId.equals(student.deptId) && section.semesterLabel === ACTIVE_SEMESTER)
      .map((section) => section._id);
    return {
      _id: oid(),
      studentId: student._id,
      semesterLabel: ACTIVE_SEMESTER,
      academicYear: ACTIVE_YEAR,
      departmentId: student.deptId,
      courseOfferingIds: offeringIds,
      status: "admitted",
      advisorId: student.advisorId,
      advisorApprovedAt: nowMinus(12),
      headId: student.deptId.equals(cseDeptId) ? teacherIds.cseHead : teacherIds.eeeHead,
      headApprovedAt: nowMinus(11),
      paymentCompletedAt: nowMinus(10),
      paymentProvider: "Stripe",
      paymentAmount: 19800,
      paymentCurrency: "BDT",
      paymentReference: `mock_stripe_${index + 1}`,
      adminAdmittedAt: nowMinus(10),
      adminAdmittedBy: adminId,
      createdAt: nowMinus(13),
      updatedAt,
    };
  });

  const enrollments = registrations.flatMap((registration) =>
    registration.courseOfferingIds.map((courseOfferingId) => ({
      _id: oid(),
      studentId: registration.studentId,
      courseOfferingId,
      semesterLabel: registration.semesterLabel,
      academicYear: registration.academicYear,
      registrationId: registration._id,
      createdAt: nowMinus(10),
      updatedAt,
    }))
  );

  const assignments = courseSections.flatMap((section, index) => [
    {
      _id: oid(),
      courseOfferingId: section._id,
      teacherId: section.teacherId,
      title: `Assignment ${index + 1}: Core Concepts`,
      description: "Solve the attached practice set and submit a drive link.",
      driveLink: `https://drive.example.com/assignments/${index + 1}`,
      dueDate: nowPlus(7 + index),
      totalMarks: 20,
      isPublished: true,
      createdAt: nowMinus(5),
      updatedAt,
    },
  ]);

  const submissions = assignments.flatMap((assignment) => {
    const enrolledStudents = enrollments
      .filter((enrollment) => enrollment.courseOfferingId.equals(assignment.courseOfferingId))
      .slice(0, 3);
    return enrolledStudents.map((enrollment, index) => ({
      _id: oid(),
      assignmentId: assignment._id,
      studentId: enrollment.studentId,
      driveLink: `https://drive.example.com/submissions/${assignment._id.toString()}-${index + 1}`,
      submittedAt: nowMinus(index + 1),
      marks: 14 + index,
      feedback: index === 0 ? "Strong submission with clear reasoning." : "Good work. Review formatting.",
      gradedBy: assignment.teacherId,
      gradedAt: nowMinus(1),
      createdAt: nowMinus(index + 1),
      updatedAt,
    }));
  });

  const attendanceRecords = courseSections.flatMap((section) =>
    [1, 2, 3, 4].map((lectureNumber) => {
      const enrolledStudents = enrollments.filter((enrollment) =>
        enrollment.courseOfferingId.equals(section._id)
      );
      return {
        _id: oid(),
        courseOfferingId: section._id,
        teacherId: section.teacherId,
        date: nowMinus(lectureNumber + 1),
        lectureNumber,
        records: enrolledStudents.map((enrollment, index) => ({
          studentId: enrollment.studentId,
          status: index === lectureNumber % enrolledStudents.length ? "absent" : index === 2 ? "late" : "present",
        })),
        createdAt: nowMinus(lectureNumber + 1),
        updatedAt,
      };
    })
  );

  const attendanceSessions = [
    {
      _id: oid(),
      courseOfferingId: courseSections[0]._id,
      teacherId: courseSections[0].teacherId,
      code: "ABC123",
      date: new Date(),
      lectureNumber: 5,
      presentStudentIds: enrollments
        .filter((enrollment) => enrollment.courseOfferingId.equals(courseSections[0]._id))
        .slice(0, 2)
        .map((enrollment) => enrollment.studentId),
      isOpen: true,
      createdAt: new Date(),
      updatedAt,
    },
  ];

  const resultWindows = [
    {
      _id: oid(),
      semesterLabel: ACTIVE_SEMESTER,
      academicYear: ACTIVE_YEAR,
      isOpen: true,
      openedBy: adminId,
      openedAt: nowMinus(3),
      createdAt: nowMinus(3),
      updatedAt,
    },
    {
      _id: oid(),
      semesterLabel: "4-2",
      academicYear: PREVIOUS_YEAR,
      isOpen: false,
      openedBy: adminId,
      openedAt: nowMinus(100),
      closedAt: nowMinus(80),
      publishedCount: 4,
      createdAt: nowMinus(100),
      updatedAt: nowMinus(80),
    },
  ];

  const markEntries = enrollments.map((enrollment, index) => ({
    _id: oid(),
    resultWindowId: resultWindows[0]._id,
    courseOfferingId: enrollment.courseOfferingId,
    studentId: enrollment.studentId,
    teacherId: courseSections.find((section) => section._id.equals(enrollment.courseOfferingId))!.teacherId,
    achievedMarks: 68 + (index % 20),
    totalMarks: 100,
    createdAt: nowMinus(2),
    updatedAt,
  }));

  const results = students.slice(0, 4).map((student, index) => {
    const deptSections = courseSections.filter(
      (section) => section.departmentId.equals(student.deptId) && section.semesterLabel === ACTIVE_SEMESTER
    );
    const coursesForResult = deptSections.map((section, courseIndex) => {
      const course = courses.find((item) => item._id.equals(section.courseId))!;
      const marks = 70 + ((index + courseIndex) % 15);
      const grade = gradeFor(marks);
      return {
        courseOfferingId: section._id,
        courseCode: course.code,
        courseTitle: course.title,
        credits: course.credits,
        marks,
        gradePoint: grade.point,
        gradeLetter: grade.letter,
      };
    });
    const semesterGPA = calculateGpa(coursesForResult);
    return {
      _id: oid(),
      studentId: student._id,
      departmentId: student.deptId,
      semesterLabel: "4-2",
      academicYear: PREVIOUS_YEAR,
      courses: coursesForResult,
      semesterGPA,
      cgpa: Math.min(4, Math.round((semesterGPA + 0.08) * 100) / 100),
      departmentRank: index + 1,
      isPublished: true,
      publishedBy: adminId,
      publishedAt: nowMinus(80),
      createdAt: nowMinus(80),
      updatedAt: nowMinus(80),
    };
  });

  const notices = [
    {
      _id: oid(),
      title: "Welcome to the Academic Year 2025-26",
      content: "All students and teachers are requested to check their dashboards for updated schedules.",
      scope: "central",
      target: "all",
      publishedBy: adminId,
      isPinned: true,
      isActive: true,
      createdAt: nowMinus(9),
      updatedAt,
    },
    {
      _id: oid(),
      title: "CSE Lab Orientation",
      content: "CSE 1-1 students should attend the lab orientation this Thursday.",
      scope: "departmental",
      target: "students",
      departmentId: cseDeptId,
      publishedBy: teacherIds.cseHead,
      isPinned: false,
      isActive: true,
      createdAt: nowMinus(6),
      updatedAt,
    },
    {
      _id: oid(),
      title: "EEE Safety Briefing",
      content: "EEE lab safety briefing is mandatory before using circuit benches.",
      scope: "departmental",
      target: "students",
      departmentId: eeeDeptId,
      publishedBy: teacherIds.eeeHead,
      isPinned: false,
      isActive: true,
      createdAt: nowMinus(6),
      updatedAt,
    },
    {
      _id: oid(),
      title: "Assignment Discussion",
      content: "Bring your questions for the first programming assignment.",
      scope: "classroom",
      target: "students",
      departmentId: cseDeptId,
      courseSectionId: courseSections[0]._id,
      publishedBy: courseSections[0].teacherId,
      isPinned: false,
      isActive: true,
      createdAt: nowMinus(2),
      updatedAt,
    },
  ];

  const elections = [
    {
      _id: oid(),
      departmentId: cseDeptId,
      positionType: "class_representative",
      positionLabel: "Class Representative - CSE 1-1",
      session: ACTIVE_SEMESTER,
      academicYear: ACTIVE_YEAR,
      status: "voting",
      createdBy: teacherIds.cseHead,
      isEmpty: false,
      createdAt: nowMinus(8),
      updatedAt,
    },
    {
      _id: oid(),
      departmentId: eeeDeptId,
      positionType: "department_representative",
      positionLabel: "EEE Department Representative",
      session: "Full Department",
      academicYear: ACTIVE_YEAR,
      status: "completed",
      createdBy: teacherIds.eeeHead,
      selectedCandidateId: undefined as ObjectId | undefined,
      isEmpty: false,
      createdAt: nowMinus(20),
      updatedAt,
    },
  ];

  const electionCandidates = [
    {
      _id: oid(),
      electionId: elections[0]._id,
      studentId: students[0]._id,
      manifesto: "I will organize peer study sessions and improve class communication.",
      cgpa: 3.82,
      status: "approved",
      reviewedBy: teacherIds.cseHead,
      reviewedAt: nowMinus(5),
      voteCount: 2,
      createdAt: nowMinus(7),
      updatedAt,
    },
    {
      _id: oid(),
      electionId: elections[0]._id,
      studentId: students[1]._id,
      manifesto: "I will make sure lab resources and deadlines are communicated early.",
      cgpa: 3.74,
      status: "approved",
      reviewedBy: teacherIds.cseHead,
      reviewedAt: nowMinus(5),
      voteCount: 1,
      createdAt: nowMinus(7),
      updatedAt,
    },
    {
      _id: oid(),
      electionId: elections[1]._id,
      studentId: students[4]._id,
      manifesto: "I will represent EEE students in academic coordination meetings.",
      cgpa: 3.88,
      status: "approved",
      reviewedBy: teacherIds.eeeHead,
      reviewedAt: nowMinus(15),
      voteCount: 3,
      createdAt: nowMinus(18),
      updatedAt,
    },
  ];
  elections[1].selectedCandidateId = electionCandidates[2]._id;

  const electionVotes = [
    { _id: oid(), electionId: elections[0]._id, voterId: students[0]._id, candidateId: electionCandidates[0]._id, createdAt: nowMinus(2), updatedAt },
    { _id: oid(), electionId: elections[0]._id, voterId: students[1]._id, candidateId: electionCandidates[0]._id, createdAt: nowMinus(2), updatedAt },
    { _id: oid(), electionId: elections[0]._id, voterId: students[2]._id, candidateId: electionCandidates[1]._id, createdAt: nowMinus(2), updatedAt },
    { _id: oid(), electionId: elections[1]._id, voterId: students[4]._id, candidateId: electionCandidates[2]._id, createdAt: nowMinus(12), updatedAt },
    { _id: oid(), electionId: elections[1]._id, voterId: students[5]._id, candidateId: electionCandidates[2]._id, createdAt: nowMinus(12), updatedAt },
    { _id: oid(), electionId: elections[1]._id, voterId: students[6]._id, candidateId: electionCandidates[2]._id, createdAt: nowMinus(12), updatedAt },
  ];

  const forumPostIds = [oid(), oid(), oid()];
  const forumAnswerIds = [oid(), oid(), oid()];
  const forumPosts = [
    {
      _id: forumPostIds[0],
      authorId: students[0]._id,
      title: "How should I prepare for CSE101 lab exams?",
      body: "I want a practical checklist for programming lab exam preparation.",
      tags: ["cse101", "lab", "exam"],
      upvotes: [students[1]._id, teacherIds.cseAdvisor],
      downvotes: [],
      views: 42,
      acceptedAnswerId: forumAnswerIds[0],
      answerCount: 1,
      isClosed: false,
      isModerated: false,
      ...encodeForumQuestion({
        title: "How should I prepare for CSE101 lab exams?",
        body: "I want a practical checklist for programming lab exam preparation.",
      }),
      createdAt: nowMinus(4),
      updatedAt,
    },
    {
      _id: forumPostIds[1],
      authorId: students[5]._id,
      title: "Recommended books for basic circuit analysis",
      body: "Which book should I follow for EEE101 circuit problems?",
      tags: ["eee101", "books", "circuits"],
      upvotes: [students[4]._id],
      downvotes: [],
      views: 31,
      answerCount: 1,
      isClosed: false,
      isModerated: false,
      ...encodeForumQuestion({
        title: "Recommended books for basic circuit analysis",
        body: "Which book should I follow for EEE101 circuit problems?",
      }),
      createdAt: nowMinus(3),
      updatedAt,
    },
    {
      _id: forumPostIds[2],
      authorId: teacherIds.cseTeacher,
      title: "Office hour schedule for discrete math",
      body: "Post your questions here before this week's consultation hour.",
      tags: ["office-hour", "cse102"],
      upvotes: [],
      downvotes: [],
      views: 18,
      answerCount: 1,
      isClosed: false,
      isModerated: false,
      ...encodeForumQuestion({
        title: "Office hour schedule for discrete math",
        body: "Post your questions here before this week's consultation hour.",
      }),
      createdAt: nowMinus(2),
      updatedAt,
    },
  ];

  const forumAnswers = [
    {
      _id: forumAnswerIds[0],
      postId: forumPostIds[0],
      authorId: teacherIds.cseAdvisor,
      body: "Practice loops, arrays, functions, and file I/O. Time yourself with old lab tasks.",
      upvotes: [students[0]._id, students[2]._id],
      downvotes: [],
      isAccepted: true,
      createdAt: nowMinus(3),
      updatedAt,
    },
    {
      _id: forumAnswerIds[1],
      postId: forumPostIds[1],
      authorId: teacherIds.eeeAdvisor,
      body: "Alexander and Sadiku is a good primary text, with extra practice from class sheets.",
      upvotes: [students[5]._id],
      downvotes: [],
      isAccepted: false,
      createdAt: nowMinus(2),
      updatedAt,
    },
    {
      _id: forumAnswerIds[2],
      postId: forumPostIds[2],
      authorId: students[2]._id,
      body: "Can we discuss recurrence relations and graph traversal examples?",
      upvotes: [],
      downvotes: [],
      isAccepted: false,
      createdAt: nowMinus(1),
      updatedAt,
    },
  ];

  const notes = [
    {
      _id: oid(),
      title: "CSE101 Week 1 Notes",
      description: "Variables, expressions, and control flow summary.",
      driveLink: "https://drive.example.com/notes/cse101-week1",
      courseId: courses[0]._id,
      departmentId: cseDeptId,
      semesterLabel: ACTIVE_SEMESTER,
      uploadedBy: students[0]._id,
      tags: ["programming", "week1"],
      createdAt: nowMinus(5),
      updatedAt,
    },
    {
      _id: oid(),
      title: "EEE101 Circuit Laws Cheat Sheet",
      description: "Ohm's law, KCL, KVL, and solved examples.",
      driveLink: "https://drive.example.com/notes/eee101-circuit-laws",
      courseId: courses[3]._id,
      departmentId: eeeDeptId,
      semesterLabel: ACTIVE_SEMESTER,
      uploadedBy: students[4]._id,
      tags: ["circuits", "laws"],
      createdAt: nowMinus(5),
      updatedAt,
    },
  ];

  const bookRecommendations = courses.map((course, index) => {
    const section = courseSections.find((item) => item.courseId.equals(course._id))!;
    return {
      _id: oid(),
      courseId: course._id,
      teacherId: section.teacherId,
      title: index % 2 === 0 ? "Schaum's Outline Series" : "Core Concepts and Problems",
      author: index % 2 === 0 ? "Schaum Editors" : "Course Faculty",
      link: `https://books.example.com/${course.code.toLowerCase()}`,
      comment: `Useful companion text for ${course.code}.`,
      createdAt: nowMinus(4),
      updatedAt,
    };
  });

  const notifications = [
    ...students.map((student) => ({
      _id: oid(),
      userId: student._id,
      title: "Enrollment Confirmed",
      message: `You are enrolled for Semester ${ACTIVE_SEMESTER} (${ACTIVE_YEAR}).`,
      type: "registration",
      link: "/student",
      isRead: false,
      createdAt: nowMinus(9),
      updatedAt,
    })),
    ...users
      .filter((user) => user.role === "teacher")
      .map((teacher) => ({
        _id: oid(),
        userId: teacher._id,
        title: "Welcome to AcademiaOne",
        message: "Your mock teaching dashboard is ready with assigned courses.",
        type: "general",
        link: "/teacher",
        isRead: false,
        createdAt: nowMinus(8),
        updatedAt,
      })),
  ];

  await db.collection("users").insertMany(users);
  await db.collection("departments").insertMany(departments);
  await db.collection("sessions").insertMany(sessions);
  await db.collection("courses").insertMany(courses);
  await db.collection("courseofferings").insertMany(courseSections);
  await db.collection("registrationwindows").insertMany(registrationWindows);
  await db.collection("registrations").insertMany(registrations);
  await db.collection("enrollments").insertMany(enrollments);
  await db.collection("assignments").insertMany(assignments);
  await db.collection("submissions").insertMany(submissions);
  await db.collection("attendancerecords").insertMany(attendanceRecords);
  await db.collection("attendancesessions").insertMany(attendanceSessions);
  await db.collection("resultwindows").insertMany(resultWindows);
  await db.collection("markentries").insertMany(markEntries);
  await db.collection("results").insertMany(results);
  await db.collection("notices").insertMany(notices);
  await db.collection("elections").insertMany(elections);
  await db.collection("electioncandidates").insertMany(electionCandidates);
  await db.collection("electionvotes").insertMany(electionVotes);
  await db.collection("forumposts").insertMany(forumPosts);
  await db.collection("forumanswers").insertMany(forumAnswers);
  await db.collection("notes").insertMany(notes);
  await db.collection("bookrecommendations").insertMany(bookRecommendations);
  await db.collection("notifications").insertMany(notifications);

  console.log("");
  console.log("Mock data generated successfully.");
  console.log(`Password for every generated account: ${MOCK_PASSWORD}`);
  console.log("Useful accounts:");
  console.log("  admin / 123456");
  console.log("  T1     / 123456");
  console.log("  S1     / 123456");
  console.log("");
  console.log("Created:");
  console.log(`  users: ${users.length}`);
  console.log(`  departments: ${departments.length}`);
  console.log(`  courses: ${courses.length}`);
  console.log(`  sections: ${courseSections.length}`);
  console.log(`  enrollments: ${enrollments.length}`);
  console.log(`  assignments: ${assignments.length}`);
  console.log(`  notices: ${notices.length}`);
  console.log(`  forum posts: ${forumPosts.length}`);
  console.log(`  notifications: ${notifications.length}`);
}

generateMockData()
  .catch(async (error) => {
    console.error("Mock data generation failed:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
