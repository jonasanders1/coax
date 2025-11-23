import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  correlationId: string;
  userQuery: string;
  request: {
    messages: Array<{
      id: string;
      role: string;
      content: string;
      timestamp: string;
    }>;
  };
  response: any;
}

export async function POST(request: NextRequest) {
  try {
    const data: LogEntry = await request.json();

    console.log('📝 Received log request:', {
      correlationId: data.correlationId,
      userQuery: data.userQuery,
      hasResponse: !!data.response,
    });

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    console.log('📁 Logs directory:', logsDir);
    
    if (!existsSync(logsDir)) {
      console.log('📁 Creating logs directory...');
      await mkdir(logsDir, { recursive: true });
    }

    // Create a filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chat-log-${timestamp}.json`;
    const filePath = path.join(logsDir, filename);

    console.log('💾 Writing log file:', filePath);

    // Write the log entry to file
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    console.log('✅ Log file written successfully:', filename);

    return NextResponse.json({ success: true, file: filename }, { status: 200 });
  } catch (error) {
    console.error('❌ Error logging chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

