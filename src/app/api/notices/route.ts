import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { AuthTokenService } from '@/lib/auth';
import { User } from '@/models/User';
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
});

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = AuthTokenService.verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectMongo();

    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      notices,
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenUser = AuthTokenService.verifyToken(token);

    if (!tokenUser || (tokenUser.role !== 'admin' && tokenUser.role !== 'teacher')) {
      return NextResponse.json({ error: 'Forbidden - Only admin and teachers can post notices' }, { status: 403 });
    }

    await connectMongo();

    // Fetch full user details
    const user = await User.findOne({ userId: tokenUser.userId }).select('firstName lastName').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, priority } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const notice = await Notice.create({
      title,
      content,
      priority: priority || 'normal',
      authorId: tokenUser.userId,
      authorName: `${user.firstName} ${user.lastName}`,
      authorRole: tokenUser.role,
    });

    return NextResponse.json({
      success: true,
      notice,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create notice' },
      { status: 500 }
    );
  }
}
