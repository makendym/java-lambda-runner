import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
    const origin = event.headers.origin || '*';

    // Handle OPTIONS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
        body: '',
      };
    }
  try {
    console.log('Lambda started');
    console.log('Event:', JSON.stringify(event, null, 2));

    // Parse Java code from request body
    let userCode: string;
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Parsed body:', JSON.stringify(body, null, 2));
      userCode = body.code;
    } catch (e) {
      console.error('JSON parsing failed:', e);
      userCode = event.body || '';
    }

    if (!userCode) {
      console.error('No user code provided');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing Java code in request body' }),
      };
    }

    console.log('User code received:', userCode);

    // Extract class name from the code
    const classNameMatch = userCode.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Main';
    const filePath = `/tmp/${className}.java`;
    const classFile = `/tmp/${className}.class`;

    console.log('Detected class name:', className);

    // Check if the code already contains a class definition
    const hasClassDefinition = /public\s+class\s+\w+/.test(userCode);
    let fullCode: string;

    if (hasClassDefinition) {
      // If code already has a class, use it as is
      fullCode = userCode;
    } else {
      // Otherwise, wrap it in a Main class
      fullCode = `public class ${className} {
    public static void main(String[] args) {
        ${userCode}
    }
}`;
    }

    console.log('Final Java code:', fullCode);

    // Write Java file
    writeFileSync(filePath, fullCode);
    console.log(`Wrote Java file to: ${filePath}`);

    // Compile Java file
    const compile = spawnSync('javac', [filePath]);
    console.log('Javac stdout:', compile.stdout?.toString() || '');
    console.log('Javac stderr:', compile.stderr?.toString() || '');
    console.log('Javac status:', compile.status);

    if (compile.status !== 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: compile.stderr?.toString() || 'Compilation failed',
          code: fullCode,
        }),
      };
    }

    if (!existsSync(classFile)) {
      console.error(`Class file not found: ${classFile}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Compiled class file not found at ${classFile}`,
          code: fullCode,
        }),
      };
    }

    // Run Java program
    const run = spawnSync('java', ['-cp', '/tmp', className]);
    console.log('Java stdout:', run.stdout?.toString() || '');
    console.log('Java stderr:', run.stderr?.toString() || '');
    console.log('Java exit code:', run.status);

    // Clean up
    try {
      unlinkSync(filePath);
      unlinkSync(classFile);
      console.log('Temporary files cleaned up.');
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        output: run.stdout?.toString() || '',
        error: run.stderr?.toString() || '',
      }),
    };
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;

  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: err instanceof Error ? err.message : String(err)
      }),
    };
    console.log('Error response:', JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
};