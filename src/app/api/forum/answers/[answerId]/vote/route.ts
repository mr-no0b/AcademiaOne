import { NextRequest, NextResponse } from 'next/server';
import { ForumFacade } from '@/facades/ForumFacade';
import { AuthTokenService } from '@/lib/auth';

const forumFacade = new ForumFacade();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ answerId: string }> }
) {
  try {
    const { answerId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = AuthTokenService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Vote type must be "up" or "down"' },
        { status: 400 }
      );
    }

    const answer = await forumFacade.voteAnswer(
      answerId,
      decoded.userId,
      voteType
    );

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to vote on answer' },
      { status: 500 }
    );
  }
}
