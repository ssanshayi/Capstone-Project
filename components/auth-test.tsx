"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"

export default function AuthTest() {
  const { user, login, register, logout, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegistering) {
      const success = await register(name, email, password)
      if (success) {
        setIsRegistering(false)
        setEmail("")
        setPassword("")
        setName("")
      }
    } else {
      await login(email, password)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {isAuthenticated ? "Logged In" : "Authentication Test"}
      </h2>

      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-blue-500 hover:underline"
          >
            {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
          </button>
        </form>
      )}
    </div>
  )
} 