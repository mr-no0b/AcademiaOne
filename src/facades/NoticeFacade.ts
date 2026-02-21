import { connectMongo } from '@/lib/mongodb';
import { Notice, Note, BookRecommendation } from '@/models/Common';
import { getEventPublisher } from '@/observers/EventPublisher';
import { Semester } from '@/types';

export class NoticeFacade {
  private eventPublisher = getEventPublisher();

  async createNotice(data: {
    title: string;
    content: string;
    type: 'central' | 'departmental';
    departmentId?: string;
    publishedBy: string;
    isPinned?: boolean;
    expiresAt?: Date;
    attachments?: string[];
  }): Promise<any> {
    await connectMongo();

    if (data.type === 'departmental' && !data.departmentId) {
      throw new Error('Department ID required for departmental notices');
    }

    const notice = await Notice.create(data);

    await this.eventPublisher.publish({
      type: 'notice_published',
      data: {
        noticeId: notice._id,
        type: data.type,
        departmentId: data.departmentId,
        title: data.title,
      },
      timestamp: new Date(),
    });

    return notice;
  }

  async getNotices(filters: {
    type?: 'central' | 'departmental';
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notices: any[]; total: number }> {
    await connectMongo();

    const query: any = {};
    
    if (filters.type) query.type = filters.type;
    if (filters.departmentId) query.departmentId = filters.departmentId;

    // Exclude expired notices
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const notices = await Notice.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notice.countDocuments(query);

    return { notices, total };
  }

  async createNote(data: {
    title: string;
    description: string;
    driveLink: string;
    departmentId: string;
    semester: Semester;
    courseId?: string;
    uploadedBy: string;
    tags?: string[];
  }): Promise<any> {
    await connectMongo();

    const note = await Note.create({
      ...data,
      downloadCount: 0,
    });

    return note;
  }

  async getNotes(filters: {
    departmentId: string;
    semester?: Semester;
    courseId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notes: any[]; total: number }> {
    await connectMongo();

    const query: any = { departmentId: filters.departmentId };
    
    if (filters.semester) query.semester = filters.semester;
    if (filters.courseId) query.courseId = filters.courseId;
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(query);

    return { notes, total };
  }

  async incrementNoteDownload(noteId: string): Promise<any> {
    await connectMongo();

    const note = await Note.findByIdAndUpdate(
      noteId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    return note;
  }

  async createBookRecommendation(data: {
    courseId: string;
    teacherId: string;
    title: string;
    author: string;
    edition?: string;
    isbn?: string;
    link?: string;
    description?: string;
  }): Promise<any> {
    await connectMongo();

    const book = await BookRecommendation.create(data);
    return book;
  }

  async getBookRecommendations(courseId: string): Promise<any[]> {
    await connectMongo();

    return BookRecommendation.find({ courseId }).sort({ createdAt: -1 });
  }

  async deleteBookRecommendation(bookId: string, teacherId: string): Promise<any> {
    await connectMongo();

    const book = await BookRecommendation.findOne({ _id: bookId, teacherId });
    if (!book) throw new Error('Book not found or unauthorized');

    await BookRecommendation.findByIdAndDelete(bookId);
    return { success: true };
  }
}
