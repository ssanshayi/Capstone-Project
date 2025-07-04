'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Shield,
  Clock,
  Server
} from 'lucide-react'

interface DiagnosticResult {
  timestamp: string
  connection: {
    status: 'connected' | 'error' | 'unknown'
    url: string
    latency: number
    error: string | null
  }
  tables: Record<string, {
    status: 'healthy' | 'error'
    count: number
    error: string | null
    lastChecked: string
  }>
  summary: {
    totalTables: number
    totalRecords: number
    healthyTables: number
    errors: string[]
  }
  auth?: {
    status: 'available' | 'error'
    error: string | null
  }
  rls?: {
    status: 'active' | 'error'
    error: string | null
  }
}

interface TableDetails {
  table: string
  timestamp: string
  details: {
    status: 'success' | 'error'
    count: number
    sampleData: any[]
    columns: string[]
    error?: string
  }
}

export default function SupabaseDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null)
  const [loadingTable, setLoadingTable] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/supabase-diagnostic')
      const data = await response.json()
      setDiagnostic(data)
    } catch (error) {
      console.error('Diagnostic failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkTableDetails = async (table: string) => {
    setLoadingTable(true)
    setSelectedTable(table)
    try {
      const response = await fetch('/api/supabase-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table })
      })
      const data = await response.json()
      setTableDetails(data)
    } catch (error) {
      console.error('Table check failed:', error)
    } finally {
      setLoadingTable(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'available':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'available':
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Diagnostics</h1>
          <p className="text-gray-600 mt-2">Check Supabase connectivity and database health</p>
        </div>
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Re-run Check'}
        </Button>
      </div>

      {diagnostic && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Server className="w-4 h-4" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.connection.status)}
                  {getStatusBadge(diagnostic.connection.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Latency: {diagnostic.connection.latency}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4" />
                  Table Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Healthy Tables</span>
                    <span className="font-medium">{diagnostic.summary.healthyTables}/{diagnostic.summary.totalTables}</span>
                  </div>
                  <Progress 
                    value={(diagnostic.summary.healthyTables / diagnostic.summary.totalTables) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Auth Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.auth?.status || 'unknown')}
                  {getStatusBadge(diagnostic.auth?.status || 'unknown')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Last Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {new Date(diagnostic.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Errors */}
          {diagnostic.summary.errors.length > 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Detected the following issues:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {diagnostic.summary.errors.map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Details */}
          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Supabase URL</label>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                        {diagnostic.connection.url}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Latency</label>
                      <p className="text-sm text-gray-600">{diagnostic.connection.latency}ms</p>
                    </div>
                  </div>
                  {diagnostic.connection.error && (
                    <Alert>
                      <XCircle className="w-4 h-4" />
                      <AlertDescription>
                        Connection Error: {diagnostic.connection.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Table Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(diagnostic.tables).map(([table, info]) => (
                        <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(info.status)}
                            <div>
                              <p className="font-medium">{table}</p>
                              <p className="text-sm text-gray-500">{info.count} records</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkTableDetails(table)}
                            disabled={loadingTable}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedTable && tableDetails && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Table Details: {selectedTable}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingTable ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          <span className="ml-2">Loading...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Record Count: {tableDetails.details.count}</p>
                            <p className="text-sm text-gray-600">
                              Column Count: {tableDetails.details.columns?.length || 0}
                            </p>
                          </div>

                          {tableDetails.details.columns && (
                            <div>
                              <p className="text-sm font-medium mb-2">Columns:</p>
                              <div className="flex flex-wrap gap-1">
                                {tableDetails.details.columns.map((col, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {tableDetails.details.error && (
                            <Alert>
                              <XCircle className="w-4 h-4" />
                              <AlertDescription>
                                {tableDetails.details.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostic.auth?.status || 'unknown')}
                      {getStatusBadge(diagnostic.auth?.status || 'unknown')}
                    </div>
                    {diagnostic.auth?.error && (
                      <Alert>
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>
                          {diagnostic.auth.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Row-Level Security (RLS)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostic.rls?.status || 'unknown')}
                      {getStatusBadge(diagnostic.rls?.status || 'unknown')}
                    </div>
                    {diagnostic.rls?.error && (
                      <Alert>
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>
                          {diagnostic.rls.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
