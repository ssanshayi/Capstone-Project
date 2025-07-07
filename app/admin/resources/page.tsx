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
import { Switch } from "@/components/ui/switch"
import { Search, Edit, Trash2, Plus, FileText, Calendar, User, Star } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

interface Resource {
  id: string
  title: string
  category: string
  excerpt: string
  author: string
  image_url?: string
  read_time: string
  featured: boolean
  date: string
  author_avatar?: string
  created_at: string
  updated_at: string
}

export default function ResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newResource, setNewResource] = useState<Omit<Resource, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    category: 'Research',
    excerpt: '',
    author: '',
    image_url: '',
    read_time: '',
    featured: false,
    date: '',
    author_avatar: ''
  })

  const categoryOptions = [
    { value: 'Research', label: 'Research', color: 'bg-blue-100 text-blue-800' },
    { value: 'Education', label: 'Education', color: 'bg-green-100 text-green-800' },
    { value: 'Conservation', label: 'Conservation', color: 'bg-orange-100 text-orange-800' },
    { value: 'News', label: 'News', color: 'bg-purple-100 text-purple-800' },
    { value: 'Guide', label: 'Guide', color: 'bg-red-100 text-red-800' }
  ]

  const featuredOptions = [
    { value: 'featured', label: 'Featured', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'regular', label: 'Regular', color: 'bg-gray-100 text-gray-800' }
  ]

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error.message || error)
        toast.error('Failed to fetch resources list')
        return
      }

      setResources(data || [])
    } catch (err: any) {
      console.error('Unexpected error:', err.message || err)
      toast.error('Unexpected error fetching resources list')
    } finally {
      setIsLoading(false)
    }
  }

  const saveResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'> | Resource) => {
    try {
      console.log('saveResource called with:', resourceData)
      console.log('isAddingNew:', isAddingNew)
      console.log('editingResource:', editingResource)
      console.log('Current user:', user)
      console.log('User role:', user?.role)
      
      if (isAddingNew) {
        console.log('Adding new resource...')
        const { data, error } = await supabase
          .from('resources')
          .insert([resourceData])
          .select()

        if (error) {
          console.error('Error adding resource:', error)
          toast.error('Failed to add resource')
          return
        }
        console.log('Resource added successfully:', data)
        toast.success('Resource added successfully')
      } else if (editingResource) {
        console.log('Updating existing resource...')
        // Extract only the fields we want to update, excluding id, created_at, updated_at
        const { id, created_at, updated_at, ...updateData } = resourceData as Resource
        
        console.log('Update data:', updateData)
        console.log('Resource ID to update:', editingResource.id)
        
        const { data, error } = await supabase
          .from('resources')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id)
          .select()

        if (error) {
          console.error('Error updating resource:', error)
          console.error('Error details:', error.message, error.details, error.hint)
          toast.error('Failed to update resource')
          return
        }
        console.log('Resource updated successfully:', data)
        toast.success('Resource updated successfully')
      }

      await fetchResources()
      setIsAddingNew(false)
      setEditingResource(null)
      setNewResource({
        title: '',
        category: 'Research',
        excerpt: '',
        author: '',
        image_url: '',
        read_time: '',
        featured: false,
        date: '',
        author_avatar: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Operation failed')
    }
  }

  const deleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (error) {
        console.error('Error deleting resource:', error)
        toast.error('Failed to delete resource')
        return
      }

      toast.success('Resource deleted successfully')
      await fetchResources()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Delete failed')
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryOption = categoryOptions.find(c => c.value === category)
    return (
      <Badge className={categoryOption?.color}>
        {categoryOption?.label || category}
      </Badge>
    )
  }

  const getFeaturedBadge = (featured: boolean) => {
    const featuredOption = featuredOptions.find(f => f.value === (featured ? 'featured' : 'regular'))
    return (
      <Badge className={featuredOption?.color}>
        {featuredOption?.label || (featured ? 'Featured' : 'Regular')}
      </Badge>
    )
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter
    const matchesFeatured = featuredFilter === "all" || 
                           (featuredFilter === "featured" && resource.featured) ||
                           (featuredFilter === "regular" && !resource.featured)
    return matchesSearch && matchesCategory && matchesFeatured
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-2">Manage educational resources and materials</p>
        </div>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter resource title"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newResource.author}
                  onChange={(e) => setNewResource(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newResource.category} onValueChange={(value) => setNewResource(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={newResource.read_time}
                  onChange={(e) => setNewResource(prev => ({ ...prev, read_time: e.target.value }))}
                  placeholder="e.g., 5 min read"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newResource.date}
                  onChange={(e) => setNewResource(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={newResource.image_url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <Label htmlFor="author_avatar">Author Avatar URL</Label>
                <Input
                  id="author_avatar"
                  value={newResource.author_avatar}
                  onChange={(e) => setNewResource(prev => ({ ...prev, author_avatar: e.target.value }))}
                  placeholder="Enter author avatar URL"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newResource.excerpt}
                  onChange={(e) => setNewResource(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Enter resource excerpt..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={newResource.featured}
                    onCheckedChange={(checked) => setNewResource(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Resource</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button onClick={() => saveResource(newResource)}>
                Add Resource
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Resource Dialog */}
        <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            {editingResource && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingResource.title || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="Enter resource title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={editingResource.author || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, author: e.target.value } : null)}
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingResource.category} 
                    onValueChange={(value) => setEditingResource(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-read-time">Read Time</Label>
                  <Input
                    id="edit-read-time"
                    value={editingResource.read_time || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, read_time: e.target.value } : null)}
                    placeholder="e.g., 5 min read"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingResource.date || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, date: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image-url">Image URL</Label>
                  <Input
                    id="edit-image-url"
                    value={editingResource.image_url || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, image_url: e.target.value } : null)}
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-author-avatar">Author Avatar URL</Label>
                  <Input
                    id="edit-author-avatar"
                    value={editingResource.author_avatar || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, author_avatar: e.target.value } : null)}
                    placeholder="Enter author avatar URL"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-excerpt">Excerpt</Label>
                  <Textarea
                    id="edit-excerpt"
                    value={editingResource.excerpt || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                    placeholder="Enter resource excerpt..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-featured"
                      checked={editingResource.featured}
                      onCheckedChange={(checked) => setEditingResource(prev => prev ? { ...prev, featured: checked } : null)}
                    />
                    <Label htmlFor="edit-featured">Featured Resource</Label>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingResource(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingResource && saveResource(editingResource)}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, author, or excerpt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(category => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {featuredOptions.map(featured => (
                  <SelectItem key={featured.value} value={featured.value}>{featured.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={resource.image_url} />
                        <AvatarFallback>
                          <FileText className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-sm text-gray-500">{resource.read_time} read</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {resource.author}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(resource.category)}</TableCell>
                  <TableCell>{getFeaturedBadge(resource.featured)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {resource.date ? new Date(resource.date).toLocaleDateString('zh-CN') : 'No date'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingResource(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this resource?')) {
                            deleteResource(resource.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No resources found or you're not authorized to view the data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 