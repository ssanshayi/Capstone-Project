"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function TestProfilesPage() {
  const { user } = useAuth()
  const [profilesData, setProfilesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [myProfile, setMyProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchMyProfile()
    }
  }, [user])

  const fetchMyProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching my profile:', error)
        toast.error('Failed to fetch your profile')
      } else {
        setMyProfile(data)
        console.log('My profile:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchAllProfiles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles:', error)
        toast.error('Failed to fetch profiles')
      } else {
        setProfilesData(data || [])
        console.log('All profiles:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTestProfile = async () => {
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.name,
          role: 'admin'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        toast.error('Failed to create profile: ' + error.message)
      } else {
        toast.success('Profile created/updated successfully')
        fetchMyProfile()
        fetchAllProfiles()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create profile')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profiles Table Test</h1>
          <p className="text-gray-600 mt-2">
            Test and verify your profiles table setup
          </p>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.role}</span></p>
                <p><strong>ID:</strong> <span className="font-mono text-sm">{user.id}</span></p>
              </div>
            ) : (
              <p className="text-gray-500">Not logged in</p>
            )}
          </CardContent>
        </Card>

        {/* My Profile */}
        <Card>
          <CardHeader>
            <CardTitle>My Profile in Database</CardTitle>
          </CardHeader>
          <CardContent>
            {myProfile ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {myProfile.email}</p>
                <p><strong>Full Name:</strong> {myProfile.full_name}</p>
                <p><strong>Role:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{myProfile.role}</span></p>
                <p><strong>Created:</strong> {new Date(myProfile.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(myProfile.updated_at).toLocaleString()}</p>
                <p><strong>Banned:</strong> {myProfile.is_banned ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">No profile found in database</p>
                <Button onClick={createTestProfile}>
                  Create Admin Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Profiles */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Profiles in Database</CardTitle>
              <Button onClick={fetchAllProfiles} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profilesData.length > 0 ? (
              <div className="space-y-2">
                {profilesData.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{profile.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <p className="text-xs text-gray-500">ID: {profile.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        profile.role === 'admin' ? 'bg-green-100 text-green-800' : 
                        profile.role === 'researcher' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No profiles found. Click "Refresh" to load profiles.</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What to Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Verify your profile exists</strong> in the database</p>
              <p>2. <strong>Check your role</strong> is set to "admin" in the database</p>
              <p>3. <strong>If no profile exists</strong>, click "Create Admin Profile"</p>
              <p>4. <strong>After creating profile</strong>, go back to <code>/admin-sync</code> and use "Sync My Role"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 