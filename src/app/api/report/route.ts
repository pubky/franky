import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/libs';

/**
 * API Route for post report submission
 *
 * TODO: Implement Core layer integration (ReportController) in next PR.
 * Currently validates request and returns success for UI development.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pubky, postUrl, issueType, reason, name } = body;

    // Basic validation - full validation will be in Core layer
    if (!pubky || !postUrl || !issueType || !reason || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Replace with Core.ReportController.submit() in next PR
    Logger.info('[STUB] Report received:', { pubky, postUrl, issueType, name });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    Logger.error('[STUB] Error in report API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST instead.' }, { status: 405 });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
