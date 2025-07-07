"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit, Ban, Shield, User, Users } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  bio?: string
  location?: string
  research_interests?: string[]
  is_banned: boolean
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const roleOptions = [
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' },
    { value: 'researcher', label: 'Researcher', color: 'bg-blue-100 text-blue-800' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'banned', label: 'Banned', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error.message || error)
        toast.error('Failed to fetch users list')
        return
      }

      setUsers(data || [])
    } catch (err: any) {
      console.error('Unexpected error:', err.message || err)
      toast.error('Unexpected error fetching users list')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!editingUser) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          bio: userData.bio,
          location: userData.location,
          research_interests: userData.research_interests,
          is_banned: userData.is_banned,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (error) {
        console.error('Error updating user:', error)
        toast.error('Failed to update user')
        return
      }

      toast.success('User updated successfully')
      await fetchUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Update failed')
    }
  }

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: !isBanned,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error toggling ban:', error)
        toast.error('Failed to update user status')
        return
      }

      toast.success(`User ${!isBanned ? 'banned' : 'unbanned'} successfully`)
      await fetchUsers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Operation failed')
    }
  }

  const getRoleBadge = (role: string) => {
    const roleOption = roleOptions.find(r => r.value === role)
    return (
      <Badge className={roleOption?.color}>
        {roleOption?.label || role}
      </Badge>
    )
  }

  const getStatusBadge = (isBanned: boolean) => {
    const status = isBanned ? 'banned' : 'active'
    const statusOption = statusOptions.find(s => s.value === status)
    return (
      <Badge className={statusOption?.color}>
        {statusOption?.label || status}
      </Badge>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "banned" && user.is_banned) ||
                         (statusFilter === "active" && !user.is_banned)
    return matchesSearch && matchesRole && matchesStatus
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all registered users and their permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{user.location || 'No location'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.is_banned)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={user.is_banned ? "default" : "destructive"}
                        onClick={() => toggleBanUser(user.id, user.is_banned)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No users found or you're not authorized to view the data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, role: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingUser.location || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, location: e.target.value } : null)}
                  placeholder="Enter location"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  placeholder="Enter user bio..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingUser.is_banned ? 'banned' : 'active'} 
                  onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, is_banned: value === 'banned' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingUser && updateUser(editingUser)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}