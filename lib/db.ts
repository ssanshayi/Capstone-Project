// Server-side database connection (only runs on server)
let pool: any = null

if (typeof window === 'undefined') {
  // Only import and initialize on server side
  const { Pool } = require('pg')
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://star@localhost:5432/capstone_project'
  })
}

export const db = {
  async query(text: string, params?: any[]) {
    if (typeof window !== 'undefined') {
      throw new Error('Database queries can only be made on the server side')
    }
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }
}

// Query builder for Supabase-like interface
class QueryBuilder {
  private table: string
  private selectedColumns: string = '*'
  private conditions: string[] = []
  private conditionValues: any[] = []
  private orderColumn?: string
  private orderAscending?: boolean

  constructor(table: string) {
    this.table = table
  }

  select(columns: string = '*') {
    this.selectedColumns = columns
    return this
  }

  eq(column: string, value: any) {
    this.conditions.push(`${column} = $${this.conditionValues.length + 1}`)
    this.conditionValues.push(value)
    return this
  }

  gte(column: string, value: any) {
    this.conditions.push(`${column} >= $${this.conditionValues.length + 1}`)
    this.conditionValues.push(value)
    return this
  }

  lt(column: string, value: any) {
    this.conditions.push(`${column} < $${this.conditionValues.length + 1}`)
    this.conditionValues.push(value)
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column
    this.orderAscending = options?.ascending !== false
    return this
  }

  private buildQuery(): { sql: string, params: any[] } {
    let sql = `SELECT ${this.selectedColumns} FROM ${this.table}`
    
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`
    }
    
    if (this.orderColumn) {
      sql += ` ORDER BY ${this.orderColumn} ${this.orderAscending ? 'ASC' : 'DESC'}`
    }
    
    return { sql, params: this.conditionValues }
  }

  async single() {
    try {
      const { sql, params } = this.buildQuery()
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sql, params })
      })
      
      if (response.ok) {
        const result = await response.json()
        return { data: result.rows[0] || null, error: null }
      }
      return { data: null, error: { message: 'Query failed' } }
    } catch (error) {
      return { data: null, error }
    }
  }

  async then() {
    try {
      const { sql, params } = this.buildQuery()
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sql, params })
      })
      
      if (response.ok) {
        const result = await response.json()
        return { data: result.rows, error: null }
      }
      return { data: [], error: { message: 'Query failed' } }
    } catch (error) {
      return { data: [], error }
    }
  }
}

// Real Supabase-like interface using PostgreSQL
export const supabase = {
  auth: {
    getUser: async () => {
      try {
        if (typeof window !== 'undefined') {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const data = await response.json()
            return { data: { user: data.user }, error: null }
          }
        }
        return { data: { user: null }, error: null }
      } catch (error) {
        return { data: { user: null }, error }
      }
    },
    getSession: async () => {
      try {
        if (typeof window !== 'undefined') {
          const response = await fetch('/api/auth/me', {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            const user = data.user
            if (user) {
              return { 
                data: { 
                  session: { 
                    user: {
                      id: user.id,
                      email: user.email,
                      user_metadata: { name: user.full_name }
                    }
                  } 
                }, 
                error: null 
              }
            }
          }
        }
        return { data: { session: null }, error: null }
      } catch (error) {
        return { data: { session: null }, error }
      }
    },
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          return {
            data: {
              user: data.user,
              session: { user: data.user }
            },
            error: null
          }
        } else {
          return { data: { user: null, session: null }, error: { message: data.error } }
        }
      } catch (error) {
        return { data: { user: null, session: null }, error }
      }
    },
    signUp: async ({ email, password, options }: { email: string, password: string, options?: any }) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            name: options?.data?.name || 'New User' 
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          return {
            data: {
              user: data.user,
              session: { user: data.user }
            },
            error: null
          }
        } else {
          return { data: { user: null, session: null }, error: { message: data.error } }
        }
      } catch (error) {
        return { data: { user: null, session: null }, error }
      }
    },
    signOut: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
        return { error: null }
      } catch (error) {
        return { error }
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const data = await response.json()
            callback('SIGNED_IN', { user: data.user })
          } else {
            callback('SIGNED_OUT', null)
          }
        } catch (error) {
          callback('SIGNED_OUT', null)
        }
      }
      
      checkAuth()
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // Auth listener unsubscribed
            }
          }
        }
      }
    }
  },
  from: (table: string) => ({
    ...new QueryBuilder(table),
    insert: async (data: any) => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          const result = await response.json()
          return { data: result.user, error: null }
        }
        return { data: null, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: value, ...data })
          })
          
          if (response.ok) {
            const result = await response.json()
            return { data: result.user, error: null }
          }
          return { data: null, error: null }
        } catch (error) {
          return { data: null, error }
        }
      }
    })
  }),
  rpc: async (functionName: string, params: any) => {
    try {
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ function: functionName, params })
      })
      
      if (response.ok) {
        const data = await response.json()
        return { data, error: null }
      }
      return { data: null, error: { message: 'RPC call failed' } }
    } catch (error) {
      return { data: null, error }
    }
  }
}