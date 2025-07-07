"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity, HardDrive, Users, Fish, FileText } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

interface TableInfo {
  name: string
  rowCount: number
  size?: string
  lastModified?: string
}

export default function DatabaseDiagnosticPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    
    try {
      const diagnosticResults: DiagnosticResult[] = []
      
      // Test 1: Basic Connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) {
          diagnosticResults.push({
            test: 'Database Connection',
            status: 'error',
            message: 'Failed to connect to database',
            details: error.message
          })
          setConnectionStatus('disconnected')
        } else {
          diagnosticResults.push({
            test: 'Database Connection',
            status: 'success',
            message: 'Successfully connected to database'
          })
          setConnectionStatus('connected')
        }
      } catch (err: any) {
        diagnosticResults.push({
          test: 'Database Connection',
          status: 'error',
          message: 'Connection failed',
          details: err.message
        })
        setConnectionStatus('disconnected')
      }

      // Test 2: Authentication
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          diagnosticResults.push({
            test: 'Authentication',
            status: 'success',
            message: `Authenticated as ${session.user.email}`
          })
        } else {
          diagnosticResults.push({
            test: 'Authentication',
            status: 'warning',
            message: 'No active session found'
          })
        }
      } catch (err: any) {
        diagnosticResults.push({
          test: 'Authentication',
          status: 'error',
          message: 'Authentication check failed',
          details: err.message
        })
      }

      // Test 3: Table Access
      const tables = ['profiles', 'marine_species', 'resources', 'species_tracking', 'user_favorites', 'conservation_projects', 'news_articles', 'educational_resources']
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          if (error) {
            diagnosticResults.push({
              test: `Table Access: ${table}`,
              status: 'error',
              message: `Cannot access ${table} table`,
              details: error.message
            })
          } else {
            diagnosticResults.push({
              test: `Table Access: ${table}`,
              status: 'success',
              message: `Successfully accessed ${table} table`
            })
          }
        } catch (err: any) {
          diagnosticResults.push({
            test: `Table Access: ${table}`,
            status: 'error',
            message: `Failed to access ${table} table`,
            details: err.message
          })
        }
      }

      // Test 4: RLS Policies
      try {
        const { data: policies, error } = await supabase.rpc('get_policies')
        if (error) {
          diagnosticResults.push({
            test: 'RLS Policies',
            status: 'warning',
            message: 'Could not check RLS policies',
            details: error.message
          })
        } else {
          diagnosticResults.push({
            test: 'RLS Policies',
            status: 'success',
            message: 'RLS policies are configured'
          })
        }
      } catch (err: any) {
        diagnosticResults.push({
          test: 'RLS Policies',
          status: 'warning',
          message: 'RLS policy check not available'
        })
      }

      // Test 5: Storage Access
      try {
        const { data, error } = await supabase.storage.listBuckets()
        if (error) {
          diagnosticResults.push({
            test: 'Storage Access',
            status: 'warning',
            message: 'Storage access limited',
            details: error.message
          })
        } else {
          diagnosticResults.push({
            test: 'Storage Access',
            status: 'success',
            message: `Storage accessible (${data.length} buckets)`
          })
        }
      } catch (err: any) {
        diagnosticResults.push({
          test: 'Storage Access',
          status: 'warning',
          message: 'Storage not available'
        })
      }

      setResults(diagnosticResults)
      
      // Get table information
      await getTableInfo()
      
    } catch (error) {
      console.error('Diagnostic error:', error)
      toast.error('Failed to run diagnostics')
    } finally {
      setIsRunning(false)
    }
  }

  const getTableInfo = async () => {
    const tables = ['profiles', 'marine_species', 'resources', 'species_tracking', 'user_favorites', 'conservation_projects', 'news_articles', 'educational_resources']
    const tableInfoResults: TableInfo[] = []
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (!error) {
          tableInfoResults.push({
            name: table,
            rowCount: count || 0
          })
        }
      } catch (err) {
        tableInfoResults.push({
          name: table,
          rowCount: 0
        })
      }
    }
    
    setTableInfo(tableInfoResults)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Diagnostic</h1>
          <p className="text-gray-600 mt-2">Monitor database health and performance</p>
        </div>
        <Button onClick={runDiagnostics} disabled={isRunning}>
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {connectionStatus === 'disconnected' && <XCircle className="h-5 w-5 text-red-600" />}
            {connectionStatus === 'checking' && <Activity className="h-5 w-5 text-yellow-600 animate-pulse" />}
            <span className="font-medium">
              {connectionStatus === 'connected' && 'Connected to Database'}
              {connectionStatus === 'disconnected' && 'Database Connection Failed'}
              {connectionStatus === 'checking' && 'Checking Connection...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Successful Tests</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-blue-600">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isRunning ? 'Running diagnostics...' : 'No diagnostic results available'}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Information */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Row Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableInfo.map((table) => (
                <TableRow key={table.name}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{table.rowCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {table.rowCount > 0 ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Empty</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {errorCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issues detected:</strong> {errorCount} diagnostic test(s) failed. 
            Please check your database configuration and ensure all required tables and policies are properly set up.
          </AlertDescription>
        </Alert>
      )}

      {warningCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warnings:</strong> {warningCount} diagnostic test(s) have warnings. 
            These may not affect functionality but should be reviewed.
          </AlertDescription>
        </Alert>
      )}

      {successCount === results.length && results.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>All systems operational:</strong> All diagnostic tests passed successfully. 
            Your database is healthy and functioning properly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 