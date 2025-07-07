"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function SupabaseDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      // Test 1: Check if Supabase client is initialized
      results.clientInitialized = !!supabase
      results.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'
      results.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'

      // Test 2: Check authentication status (client-side)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      results.authStatus = authError ? `Error: ${authError.message}` : user ? 'Authenticated' : 'Not authenticated'
      results.userId = user?.id || 'None'
      results.userEmail = user?.email || 'None'
      results.userRole = user?.user_metadata?.role || 'None'

      // Test 3: Test simple auth API route
      try {
        const authResponse = await fetch('/api/test-auth')
        const authData = await authResponse.json()
        results.simpleAuthApi = authResponse.ok ? 'Success' : `Error: ${authResponse.status} - ${authData.error || 'Unknown error'}`
        results.simpleAuthData = authData
      } catch (apiError: any) {
        results.simpleAuthApi = `Error: ${apiError.message}`
      }

      // Test 4: Test profiles table access (only if authenticated)
      if (user) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5)
        
        results.profilesAccess = profilesError ? `Error: ${profilesError.message}` : `Success: ${profiles?.length || 0} records`
        results.profilesData = profiles || []
      } else {
        results.profilesAccess = 'Skipped: Not authenticated'
        results.profilesData = []
      }

      // Test 5: Test species_tracking table access (only if authenticated)
      if (user) {
        const { data: tracking, error: trackingError } = await supabase
          .from('species_tracking')
          .select('*')
          .limit(5)
        
        results.trackingAccess = trackingError ? `Error: ${trackingError.message}` : `Success: ${tracking?.length || 0} records`
        results.trackingData = tracking || []
      } else {
        results.trackingAccess = 'Skipped: Not authenticated'
        results.trackingData = []
      }

      // Test 6: Test user_activities table access (only if authenticated)
      if (user) {
        const { data: activities, error: activitiesError } = await supabase
          .from('user_activities')
          .select('*')
          .limit(5)
        
        results.activitiesAccess = activitiesError ? `Error: ${activitiesError.message}` : `Success: ${activities?.length || 0} records`
        results.activitiesData = activities || []
      } else {
        results.activitiesAccess = 'Skipped: Not authenticated'
        results.activitiesData = []
      }

      // Test 7: Test admin API endpoint (only if authenticated)
      if (user) {
        try {
          const response = await fetch('/api/admin/users')
          const apiData = await response.json()
          results.adminApiAccess = response.ok ? 'Success' : `Error: ${response.status} - ${apiData.error || 'Unknown error'}`
          results.adminApiData = apiData
        } catch (apiError: any) {
          results.adminApiAccess = `Error: ${apiError.message}`
        }
      } else {
        results.adminApiAccess = 'Skipped: Not authenticated'
      }

    } catch (error: any) {
      results.generalError = error.message
    }

    setDiagnostics(results)
    setIsLoading(false)
  }

  const getStatusIcon = (status: any) => {
    if (!status || typeof status !== 'string') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    
    if (status.includes('Success') || status === 'Set' || status === 'Yes') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (status.includes('Error') || status === 'Missing' || status === 'No') {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: any) => {
    if (!status || typeof status !== 'string') {
      return <Badge variant="secondary">Unknown</Badge>
    }
    
    if (status.includes('Success') || status === 'Set' || status === 'Yes') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
    } else if (status.includes('Error') || status === 'Missing' || status === 'No') {
      return <Badge variant="destructive">Error</Badge>
    } else {
      return <Badge variant="secondary">Warning</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supabase Diagnostic Tool</h1>
          <p className="text-gray-600 mt-2">Check your Supabase setup and authentication</p>
        </div>
        <Button onClick={runDiagnostics} disabled={isLoading}>
          {isLoading ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      {!diagnostics.authStatus && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Click "Run Diagnostics" to check your Supabase setup. If you're not authenticated, 
            visit <a href="/login-test" className="text-blue-600 underline">Login Test</a> to authenticate first.
          </AlertDescription>
        </Alert>
      )}

      {Object.keys(diagnostics).length > 0 && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment & Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Client Initialized:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.clientInitialized)}
                  {getStatusBadge(diagnostics.clientInitialized)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Supabase URL:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.supabaseUrl)}
                  {getStatusBadge(diagnostics.supabaseUrl)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Supabase Key:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.supabaseKey)}
                  {getStatusBadge(diagnostics.supabaseKey)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Auth Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.authStatus)}
                  {getStatusBadge(diagnostics.authStatus)}
                </div>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-sm">{diagnostics.userId}</span>
              </div>
              <div className="flex justify-between">
                <span>User Email:</span>
                <span className="font-mono text-sm">{diagnostics.userEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>User Role:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={diagnostics.userRole === 'admin' ? 'default' : 'secondary'}>
                    {diagnostics.userRole}
                  </Badge>
                  {diagnostics.userRole === 'admin' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Simple Auth API:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.simpleAuthApi)}
                    {getStatusBadge(diagnostics.simpleAuthApi)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{diagnostics.simpleAuthApi}</p>
                {diagnostics.simpleAuthData && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(diagnostics.simpleAuthData, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Admin Users API:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.adminApiAccess)}
                    {getStatusBadge(diagnostics.adminApiAccess)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{diagnostics.adminApiAccess}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Profiles Table:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.profilesAccess)}
                    {getStatusBadge(diagnostics.profilesAccess)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{diagnostics.profilesAccess}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Species Tracking:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.trackingAccess)}
                    {getStatusBadge(diagnostics.trackingAccess)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{diagnostics.trackingAccess}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>User Activities:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.activitiesAccess)}
                    {getStatusBadge(diagnostics.activitiesAccess)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{diagnostics.activitiesAccess}</p>
              </div>
            </CardContent>
          </Card>

          {diagnostics.generalError && (
            <Card>
              <CardHeader>
                <CardTitle>General Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{diagnostics.generalError}</p>
              </CardContent>
            </Card>
          )}

          {diagnostics.authStatus === 'Not authenticated' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Authentication Required:</strong> You need to log in to test admin functionality. 
                Visit the <a href="/login-test" className="text-blue-600 underline">Login Test page</a> to authenticate.
              </AlertDescription>
            </Alert>
          )}

          {diagnostics.userRole !== 'admin' && diagnostics.userEmail && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Access Required:</strong> Your user doesn't have admin privileges. 
                Either use admin@admin.com or admin@example.com, or set your user's role to "admin" in Supabase.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
