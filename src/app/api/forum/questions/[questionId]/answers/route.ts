import { NextRequest, NextResponse } from 'next/server';
import { ForumFacade } from '@/facades/ForumFacade';
import { AuthTokenService } from '@/lib/auth';

const forumFacade = new ForumFacade();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const answers = await forumFacade.getAnswers(questionId);
    return NextResponse.json({ success: true, answers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = AuthTokenService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const answer = await forumFacade.createAnswer({
      questionId,
      authorId: decoded.userId,
      content,
    });

    return NextResponse.json({
      success: true,
      answer,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create answer' },
      { status: 500 }
    );
  }
}
