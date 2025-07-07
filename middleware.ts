import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // No admin route interception - allow all access
  return NextResponse.next()
}

export const config = {
  matcher: [
    // No matchers - don't intercept any routes
  ],
}