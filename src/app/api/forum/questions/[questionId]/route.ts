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
    const question = await forumFacade.getQuestion(questionId);
    const answers = await forumFacade.getAnswers(questionId);

    return NextResponse.json({
      success: true,
      question,
      answers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch question' },
      { status: 500 }
    );
  }
}
