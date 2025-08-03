import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: '1inch Fusion Plus API key not configured' },
        { status: 500 }
      );
    }

    // Reconstruct the path from the params
    const path = params.path.join('/');
    
    // Construct the Fusion+ API URL
    const baseUrl = 'https://api.1inch.dev/fusion-plus';
    const apiUrl = `${baseUrl}/${path}`;

    // Get query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullApiUrl = searchParams ? `${apiUrl}?${searchParams}` : apiUrl;

    console.log('🔄 Fusion+ API GET Request:', {
      fullApiUrl,
      path,
      searchParams
    });

    const response = await fetch(fullApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Fusion+ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `Fusion+ API request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Fusion+ API Response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in Fusion+ API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const body = await request.json();
    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: '1inch Fusion Plus API key not configured' },
        { status: 500 }
      );
    }

    // Reconstruct the path from the params
    const path = params.path.join('/');
    
    // Construct the Fusion+ API URL
    const baseUrl = 'https://api.1inch.dev/fusion-plus';
    const apiUrl = `${baseUrl}/${path}`;

    console.log('🔄 Fusion+ API POST Request:', {
      apiUrl,
      path,
      body
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Fusion+ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `Fusion+ API request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check if response has content
    const responseText = await response.text();
    console.log('✅ Fusion+ API Response Text:', responseText);
    
    let data;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('✅ Fusion+ API Response Parsed:', data);
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        console.error('Response text:', responseText);
        return NextResponse.json(
          { error: 'Invalid JSON response from Fusion+ API' },
          { status: 500 }
        );
      }
    } else {
      console.log('⚠️ Empty response from Fusion+ API');
      data = { success: true, message: 'Empty response - assuming success' };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in Fusion+ API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 