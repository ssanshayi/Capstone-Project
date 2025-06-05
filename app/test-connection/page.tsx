'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/test-connection'

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState<string>('')

  useEffect(() => {
    async function checkConnection() {
      try {
        const isConnected = await testSupabaseConnection()
        setStatus(isConnected ? 'success' : 'error')
        setMessage(isConnected ? 'Successfully connected to Supabase!' : 'Failed to connect to Supabase')
        
        // Check environment variables
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!hasUrl || !hasKey) {
          setErrorDetails(
            `Environment variables check:\n` +
            `- NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? '✅' : '❌'}\n` +
            `- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasKey ? '✅' : '❌'}`
          )
        }
      } catch (error) {
        setStatus('error')
        setMessage('Error testing connection: ' + (error as Error).message)
        setErrorDetails((error as Error).stack || '')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className={`p-4 rounded ${
        status === 'loading' ? 'bg-yellow-100' :
        status === 'success' ? 'bg-green-100' :
        'bg-red-100'
      }`}>
        <p className="font-medium">
          Status: {status === 'loading' ? 'Testing connection...' :
                 status === 'success' ? 'Connected' :
                 'Error'}
        </p>
        {message && <p className="mt-2">{message}</p>}
        {errorDetails && (
          <pre className="mt-4 p-2 bg-gray-100 rounded text-sm overflow-auto">
            {errorDetails}
          </pre>
        )}
      </div>
    </div>
  )
} 