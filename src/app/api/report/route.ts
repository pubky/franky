import { NextRequest, NextResponse } from 'next/server';
import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * API Route for post report submission to Chatwoot
 *
 * This endpoint receives report data from the UI and processes it through
 * the controller layer following Franky's architecture.
 *
 * All validation is handled by the controller layer.
 * This route only parses the request body and delegates to the controller.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pubky, postUrl, issueType, reason, name } = body;

    // Delegate to controller - validation happens there
    await Core.ReportController.submit({ pubky, postUrl, issueType, reason, name });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    // Handle AppError from controller/application/service layers
    if (error instanceof Libs.AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Handle unexpected errors
    Libs.Logger.error('Error in report API handler:', error);
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
