"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit, Ban, User } from "lucide-react"
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
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to fetch users list')
      return
    }
    setUsers(data || [])
    setIsLoading(false)
  }

  const updateUser = async (userData: Partial<User>) => {
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

    if (error) return toast.error('Failed to update user')
    toast.success('User updated successfully')
    await fetchUsers()
    setEditingUser(null)
  }

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !isBanned, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) return toast.error('Failed to update user status')
    toast.success(`User ${!isBanned ? 'banned' : 'unbanned'} successfully`)
    await fetchUsers()
  }

  const getRoleBadge = (role: string) => {
    const option = roleOptions.find(r => r.value === role)
    return <Badge className={option?.color}>{option?.label || role}</Badge>
  }

  const getStatusBadge = (banned: boolean) => {
    const status = banned ? 'banned' : 'active'
    const option = statusOptions.find(s => s.value === status)
    return <Badge className={option?.color}>{option?.label || status}</Badge>
  }

  const filteredUsers = users.filter(user => {
    const searchMatch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const roleMatch = roleFilter === "all" || user.role === roleFilter
    const statusMatch = statusFilter === "all" ||
                       (statusFilter === "banned" && user.is_banned) ||
                       (statusFilter === "active" && !user.is_banned)
    return searchMatch && roleMatch && statusMatch
  })

  if (isLoading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search by name or email" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="Filter role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar_url?.trim() || undefined}
                        />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{user.location || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.is_banned)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => toggleBanUser(user.id, user.is_banned)}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
