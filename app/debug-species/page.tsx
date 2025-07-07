"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function DebugSpeciesPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results = []

    // Test 1: Check environment variables
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      results.push({
        test: 'Environment Variables',
        status: supabaseUrl && supabaseAnonKey ? 'success' : 'error',
        message: supabaseUrl && supabaseAnonKey 
          ? 'Environment variables are set' 
          : 'Missing environment variables',
        data: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing'
        }
      })
    } catch (error) {
      results.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Failed to check environment variables',
        data: error
      })
    }

    // Test 2: Check Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      results.push({
        test: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? `Connection failed: ${error.message}` : 'Connected to Supabase',
        data: error || data
      })
    } catch (error) {
      results.push({
        test: 'Supabase Connection',
        status: 'error',
        message: 'Connection failed',
        data: error
      })
    }

    // Test 3: Check if marine_species table exists
    try {
      const { data, error } = await supabase
        .from('marine_species')
        .select('count')
        .limit(1)

      results.push({
        test: 'Marine Species Table',
        status: error ? 'error' : 'success',
        message: error ? `Table doesn't exist or access denied: ${error.message}` : 'Table exists and accessible',
        data: error || data
      })
    } catch (error) {
      results.push({
        test: 'Marine Species Table',
        status: 'error',
        message: 'Failed to access marine_species table',
        data: error
      })
    }

    // Test 4: Try to fetch actual species data
    try {
      const { data, error } = await supabase
        .from('marine_species')
        .select('*')
        .limit(5)

      results.push({
        test: 'Fetch Species Data',
        status: error ? 'error' : 'success',
        message: error ? `Failed to fetch data: ${error.message}` : `Successfully fetched ${data?.length || 0} species`,
        data: error || { count: data?.length, sample: data?.slice(0, 2) }
      })
    } catch (error) {
      results.push({
        test: 'Fetch Species Data',
        status: 'error',
        message: 'Failed to fetch species data',
        data: error
      })
    }

    // Test 5: Check user authentication
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      results.push({
        test: 'User Authentication',
        status: session ? 'success' : 'warning',
        message: session ? `Logged in as: ${session.user.email}` : 'Not logged in',
        data: session ? { email: session.user.email, id: session.user.id } : 'No session'
      })
    } catch (error) {
      results.push({
        test: 'User Authentication',
        status: 'error',
        message: 'Failed to check authentication',
        data: error
      })
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Species Data Debug</h1>
          <p className="text-gray-600 mt-2">
            This page will help diagnose why species data isn't loading
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run Diagnostic Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Running Tests..." : "Run All Tests"}
            </Button>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.test}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500">View Details</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Common Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">If Environment Variables are Missing:</p>
                <ol className="list-decimal list-inside mt-2 text-blue-700">
                  <li>Create a <code>.env.local</code> file in your project root</li>
                  <li>Add your Supabase credentials</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800">If Table Doesn't Exist:</p>
                <ol className="list-decimal list-inside mt-2 text-yellow-700">
                  <li>Go to Supabase Dashboard > SQL Editor</li>
                  <li>Run the <code>sql/supabase_setup.sql</code> script</li>
                  <li>This will create all necessary tables</li>
                </ol>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">If Everything Works:</p>
                <p className="text-green-700 mt-2">
                  The issue might be in the specific page code. Check the browser console for more detailed errors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 