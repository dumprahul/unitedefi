import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: '1inch Fusion Plus API key not configured' },
        { status: 500 }
      );
    }

    // Get the path from the request URL
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/fusion-plus', '');
    
    // Construct the Fusion+ API URL
    const baseUrl = 'https://api.1inch.dev/fusion-plus';
    const apiUrl = `${baseUrl}${path}`;

    console.log('🔄 Fusion+ API Request:', {
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

export async function GET(request: NextRequest) {
  try {
    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: '1inch Fusion Plus API key not configured' },
        { status: 500 }
      );
    }

    // Get the path from the request URL
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/fusion-plus', '');
    
    // Construct the Fusion+ API URL
    const baseUrl = 'https://api.1inch.dev/fusion-plus';
    const apiUrl = `${baseUrl}${path}`;

    console.log('🔄 Fusion+ API GET Request:', {
      apiUrl,
      path
    });

    const response = await fetch(apiUrl, {
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