"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test: string, success: boolean, message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testEnvironment = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (url && key) {
      addResult("Environment", true, "Environment variables found", {
        url: url.substring(0, 30) + "...",
        key: key.substring(0, 30) + "...",
        urlLength: url.length,
        keyLength: key.length,
        fullUrl: url, // Show full URL for debugging
        keyStart: key.substring(0, 20) // Show start of key
      })
    } else {
      addResult("Environment", false, "Missing environment variables", {
        url: url ? "Found" : "Missing",
        key: key ? "Found" : "Missing"
      })
    }
  }

  const testNetworkConnectivity = async () => {
    setIsLoading(true)
    
    try {
      // Test basic internet connectivity
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        addResult("Network Connectivity", true, "Internet connection working", {
          status: response.status,
          statusText: response.statusText
        })
      } else {
        addResult("Network Connectivity", false, `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err: any) {
      addResult("Network Connectivity", false, `Network error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectFetch = async () => {
    setIsLoading(true)
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!url) {
        addResult("Direct Fetch", false, "No Supabase URL found")
        return
      }

      // Test multiple endpoints to isolate the issue
      const endpoints = [
        { path: '/rest/v1/', name: 'REST API Root' },
        { path: '/rest/v1/profiles', name: 'Profiles Table' },
        { path: '/auth/v1/', name: 'Auth API' }
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${url}${endpoint.path}`, {
            method: 'GET',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            addResult(`Direct Fetch - ${endpoint.name}`, true, `HTTP ${response.status}`, {
              status: response.status,
              statusText: response.statusText,
              endpoint: endpoint.path
            })
          } else {
            addResult(`Direct Fetch - ${endpoint.name}`, false, `HTTP ${response.status}: ${response.statusText}`, {
              status: response.status,
              statusText: response.statusText,
              endpoint: endpoint.path
            })
          }
        } catch (err: any) {
          addResult(`Direct Fetch - ${endpoint.name}`, false, `Fetch error: ${err.message}`, {
            error: err.message,
            type: err.name,
            endpoint: endpoint.path
          })
        }
      }
    } catch (err: any) {
      addResult("Direct Fetch", false, `General fetch error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSupabaseClient = async () => {
    setIsLoading(true)
    
    try {
      // Test basic client functionality
      addResult("Supabase Client", true, "Testing client configuration...")
      
      // Test 1: Check if client is properly initialized
      if (!supabase) {
        addResult("Supabase Client - Initialization", false, "Client not initialized")
        return
      }
      
      // Test 2: Try a simple query that should work even with RLS
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (error) {
        addResult("Supabase Client - Query", false, `Query error: ${error.message}`, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      } else {
        addResult("Supabase Client - Query", true, "Query successful", {
          data: data,
          hasData: !!data
        })
      }

      // Test 3: Try to get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        addResult("Supabase Client - Auth", false, `Auth error: ${authError.message}`, {
          error: authError.message,
          status: authError.status
        })
      } else {
        addResult("Supabase Client - Auth", true, `Auth working - User: ${user ? user.email : 'None'}`, {
          user: user ? { id: user.id, email: user.email } : null
        })
      }

    } catch (err: any) {
      addResult("Supabase Client", false, `Client error: ${err.message}`, {
        error: err.message,
        type: err.name,
        stack: err.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSupabaseProject = async () => {
    setIsLoading(true)
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        addResult("Supabase Project", false, "Missing environment variables")
        return
      }

      // Extract project reference from URL
      const urlMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/)
      if (!urlMatch) {
        addResult("Supabase Project", false, "Invalid Supabase URL format")
        return
      }
      
      const projectRef = urlMatch[1]
      addResult("Supabase Project", true, `Project reference: ${projectRef}`, {
        projectRef,
        url: url,
        keyLength: key.length
      })

      // Test project status via Supabase status API
      try {
        const statusResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        })

        if (statusResponse.ok) {
          const projectData = await statusResponse.json()
          addResult("Project Status", true, "Project is active", {
            name: projectData.name,
            status: projectData.status,
            region: projectData.region
          })
        } else {
          addResult("Project Status", false, `Project check failed: ${statusResponse.status}`, {
            status: statusResponse.status,
            statusText: statusResponse.statusText
          })
        }
      } catch (err: any) {
        addResult("Project Status", false, `Project check error: ${err.message}`)
      }

    } catch (err: any) {
      addResult("Supabase Project", false, `Project test error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      // Test 1: Basic connection
      addResult("Basic Connection", true, "Testing connection...")
      
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        addResult("Database Query", false, `Query failed: ${error.message}`, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      } else {
        addResult("Database Query", true, "Successfully connected to database", data)
      }
    } catch (err: any) {
      addResult("Connection", false, `Exception: ${err.message}`, {
        error: err.message,
        type: err.name,
        stack: err.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAuth = async () => {
    setIsLoading(true)
    
    try {
      // Test auth status
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        addResult("Auth Status", false, `Auth error: ${error.message}`, {
          error: error.message,
          status: error.status,
          name: error.name
        })
      } else if (user) {
        addResult("Auth Status", true, `User found: ${user.email}`, user)
      } else {
        addResult("Auth Status", true, "No user logged in (this is normal)", null)
      }
    } catch (err: any) {
      addResult("Auth Status", false, `Auth exception: ${err.message}`, {
        error: err.message,
        type: err.name,
        stack: err.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSignUp = async () => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: "test@example.com",
        password: "test123456"
      })
      
      if (error) {
        addResult("Sign Up", false, `Sign up error: ${error.message}`, {
          error: error.message,
          status: error.status,
          name: error.name
        })
      } else {
        addResult("Sign Up", true, "Sign up successful", data)
      }
    } catch (err: any) {
      addResult("Sign Up", false, `Sign up exception: ${err.message}`, {
        error: err.message,
        type: err.name,
        stack: err.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseSchema = async () => {
    setIsLoading(true)
    
    try {
      // Test if we can access the profiles table with different queries
      const queries = [
        { query: 'select count(*) from profiles', name: 'Count Query' },
        { query: 'select * from profiles limit 1', name: 'Select Query' },
        { query: 'select table_name from information_schema.tables where table_schema = \'public\'', name: 'Schema Query' }
      ]

      for (const queryTest of queries) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1)

          if (error) {
            addResult(`Database Schema - ${queryTest.name}`, false, `Query failed: ${error.message}`, {
              error: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            })
          } else {
            addResult(`Database Schema - ${queryTest.name}`, true, "Query successful", {
              data: data,
              count: data?.length || 0
            })
          }
        } catch (err: any) {
          addResult(`Database Schema - ${queryTest.name}`, false, `Exception: ${err.message}`, {
            error: err.message,
            type: err.name
          })
        }
      }
    } catch (err: any) {
      addResult("Database Schema", false, `General error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCORS = async () => {
    setIsLoading(true)
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!url) {
        addResult("CORS Test", false, "No Supabase URL found")
        return
      }

      // Test CORS preflight
      const corsResponse = await fetch(`${url}/rest/v1/profiles`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'apikey,authorization,content-type'
        }
      })

      if (corsResponse.ok) {
        addResult("CORS Preflight", true, "CORS preflight successful", {
          status: corsResponse.status,
          headers: Object.fromEntries(corsResponse.headers.entries())
        })
      } else {
        addResult("CORS Preflight", false, `CORS preflight failed: ${corsResponse.status}`, {
          status: corsResponse.status,
          statusText: corsResponse.statusText
        })
      }

      // Test actual request with CORS headers
      const actualResponse = await fetch(`${url}/rest/v1/profiles`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      })

      if (actualResponse.ok) {
        addResult("CORS Actual Request", true, "CORS actual request successful", {
          status: actualResponse.status,
          headers: Object.fromEntries(actualResponse.headers.entries())
        })
      } else {
        addResult("CORS Actual Request", false, `CORS actual request failed: ${actualResponse.status}`, {
          status: actualResponse.status,
          statusText: actualResponse.statusText
        })
      }

    } catch (err: any) {
      addResult("CORS Test", false, `CORS test error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testServiceRole = async () => {
    setIsLoading(true)
    
    try {
      // This test requires the service role key to be added to environment variables
      const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      
      if (!serviceKey) {
        addResult("Service Role Test", false, "Service role key not found in environment variables", {
          note: "Add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to .env.local to test this"
        })
        return
      }

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!url) {
        addResult("Service Role Test", false, "No Supabase URL found")
        return
      }

      // Test with service role key (bypasses RLS)
      const response = await fetch(`${url}/rest/v1/profiles`, {
        method: 'GET',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Service Role Test", true, "Service role request successful", {
          status: response.status,
          dataCount: data.length
        })
      } else {
        addResult("Service Role Test", false, `Service role request failed: ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        })
      }

    } catch (err: any) {
      addResult("Service Role Test", false, `Service role test error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testServerAPI = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/supabase-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Server API Test", true, "Server-side API test successful", data)
      } else {
        const errorData = await response.json()
        addResult("Server API Test", false, `Server API failed: ${response.status}`, errorData)
      }
    } catch (err: any) {
      addResult("Server API Test", false, `Server API error: ${err.message}`, {
        error: err.message,
        type: err.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    // Run tests in sequence
    testEnvironment()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testNetworkConnectivity()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testDirectFetch()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testSupabaseClient()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testSupabaseProject()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testConnection()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testAuth()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testSignUp()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testDatabaseSchema()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testCORS()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testServiceRole()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testServerAPI()
    
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This page helps diagnose Supabase connection issues. The "Failed to fetch" error usually means network problems, incorrect credentials, or a paused Supabase project.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Button onClick={runAllTests} disabled={isLoading} className="col-span-2 md:col-span-3">
              Run All Tests
            </Button>
            <Button onClick={testEnvironment} disabled={isLoading} variant="outline">
              Test Environment
            </Button>
            <Button onClick={testNetworkConnectivity} disabled={isLoading} variant="outline">
              Test Network
            </Button>
            <Button onClick={testDirectFetch} disabled={isLoading} variant="outline">
              Test Direct Fetch
            </Button>
            <Button onClick={testSupabaseClient} disabled={isLoading} variant="outline">
              Test Supabase Client
            </Button>
            <Button onClick={testSupabaseProject} disabled={isLoading} variant="outline">
              Test Supabase Project
            </Button>
            <Button onClick={testConnection} disabled={isLoading} variant="outline">
              Test Connection
            </Button>
            <Button onClick={testAuth} disabled={isLoading} variant="outline">
              Test Auth
            </Button>
            <Button onClick={testSignUp} disabled={isLoading} variant="outline">
              Test Sign Up
            </Button>
            <Button onClick={testDatabaseSchema} disabled={isLoading} variant="outline">
              Test Database Schema
            </Button>
            <Button onClick={testCORS} disabled={isLoading} variant="outline">
              Test CORS
            </Button>
            <Button onClick={testServiceRole} disabled={isLoading} variant="outline">
              Test Service Role
            </Button>
            <Button onClick={testServerAPI} disabled={isLoading} variant="outline">
              Test Server API
            </Button>
          </div>
          
          <Button onClick={clearResults} variant="destructive" className="mb-4">
            Clear Results
          </Button>

          {isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Running tests...</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{result.test}</span>
                  <span className="text-sm text-gray-500">({result.timestamp})</span>
                </div>
                <p className="text-sm mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            
            {testResults.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No test results yet. Click "Run All Tests" to start diagnostics.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Check Environment Variables</h4>
              <p>Ensure your <code>.env.local</code> file has the correct Supabase URL and anon key from your project dashboard.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Verify Supabase Project</h4>
              <p>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a> and check if your project is active and not paused.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Check Network</h4>
              <p>Ensure you have internet connectivity and no firewall blocking requests to Supabase.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Restart Development Server</h4>
              <p>After updating environment variables, restart your Next.js development server.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">5. Check Browser Console</h4>
              <p>Open browser developer tools and check the console for any additional error messages.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 