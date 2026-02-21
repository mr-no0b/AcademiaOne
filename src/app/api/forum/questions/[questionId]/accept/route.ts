import { NextRequest, NextResponse } from 'next/server';
import { ForumFacade } from '@/facades/ForumFacade';
import { AuthTokenService } from '@/lib/auth';

const forumFacade = new ForumFacade();

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
    const { answerId } = body;

    if (!answerId) {
      return NextResponse.json(
        { error: 'Answer ID is required' },
        { status: 400 }
      );
    }

    const answer = await forumFacade.acceptAnswer(
      questionId,
      answerId,
      decoded.userId
    );

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to accept answer' },
      { status: 500 }
    );
  }
}
