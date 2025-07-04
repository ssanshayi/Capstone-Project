"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AdminResourceManagement() {
  const { user, isAuthenticated } = useAuth()
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [creating, setCreating] = useState(false)
  const [newResource, setNewResource] = useState<any>({
    title: "",
    category: "Research",
    excerpt: "",
    author: "",
    image_url: "",
    read_time: "",
    featured: false,
  })
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false })
    if (error) toast({ title: "Error", description: error.message })
    setResources(data || [])
    setLoading(false)
  }

  const handleEdit = (resource: any) => {
    setEditingId(resource.id)
    setEditData({ ...resource })
    setEditDialogOpen(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('resources').upload(fileName, file)
    if (error) {
      toast({ title: "Image upload failed", description: error.message })
      return
    }
    const url = supabase.storage.from('resources').getPublicUrl(fileName).data.publicUrl
    if (isEdit) {
      setEditData({ ...editData, image_url: url })
    } else {
      setNewResource({ ...newResource, image_url: url })
    }
  }

  // Validation
  const validateResource = (resource: any) => {
    if (!resource.title || !resource.author || !resource.category) return false
    if (resource.image_url && !resource.image_url.startsWith('http')) return false
    return true
  }

  const handleEditSave = async () => {
    if (!validateResource(editData)) {
      toast({ title: "Validation failed", description: "Title, author, and category are required. Image URL must be valid." })
      return
    }
    try {
      // Only send allowed fields
      const allowedFields = [
        "title", "category", "author", "image_url", "read_time", "excerpt", "date", "featured"
      ];
      const updatePayload: any = {};
      allowedFields.forEach(field => {
        if (editData[field] !== undefined) updatePayload[field] = editData[field];
      });

      const { error } = await supabase
        .from("resources")
        .update(updatePayload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Update failed", description: error.message });
        console.error("Supabase update error:", error);
      } else {
        toast({ title: "Resource updated" });
        setEditingId(null);
        setEditDialogOpen(false);
        fetchResources();
      }
    } catch (err) {
      toast({ title: "Unexpected error", description: String(err) });
      console.error("Unexpected error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return
    const { error } = await supabase.from("resources").delete().eq("id", id)
    if (error) {
      toast({ title: "Delete failed", description: error.message })
    } else {
      toast({ title: "Resource deleted" })
      fetchResources()
    }
  }

  const handleCreate = async () => {
    if (!validateResource(newResource)) {
      toast({ title: "Validation failed", description: "Title, author, and category are required. Image URL must be valid." })
      return
    }
    const { error } = await supabase.from("resources").insert([newResource])
    if (error) {
      toast({ title: "Create failed", description: error.message })
    } else {
      toast({ title: "Resource created" })
      setCreating(false)
      setNewResource({
        title: "",
        category: "Research",
        excerpt: "",
        author: "",
        image_url: "",
        read_time: "",
        featured: false,
      })
      fetchResources()
    }
  }

  // Filtered and paginated resources
  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.author.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filteredResources.length / pageSize)
  const paginatedResources = filteredResources.slice((page-1)*pageSize, page*pageSize)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Resource Management</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button onClick={() => setCreating((c) => !c)}>
          {creating ? "Cancel" : "Add New Resource"}
        </Button>
        <Input
          placeholder="Search by title, author, or category..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
      </div>
      {creating && (
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">New Resource</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="title" placeholder="Title*" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} required />
            <Input name="category" placeholder="Category*" value={newResource.category} onChange={e => setNewResource({ ...newResource, category: e.target.value })} required />
            <Input name="author" placeholder="Author*" value={newResource.author} onChange={e => setNewResource({ ...newResource, author: e.target.value })} required />
            <Input name="image_url" placeholder="Image URL" value={newResource.image_url} onChange={e => setNewResource({ ...newResource, image_url: e.target.value })} />
            <Input name="read_time" placeholder="Read Time" value={newResource.read_time} onChange={e => setNewResource({ ...newResource, read_time: e.target.value })} />
            <Input name="excerpt" placeholder="Excerpt" value={newResource.excerpt} onChange={e => setNewResource({ ...newResource, excerpt: e.target.value })} />
            <Input name="date" placeholder="Date (YYYY-MM-DD)" value={newResource.date || ""} onChange={e => setNewResource({ ...newResource, date: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!newResource.featured} onChange={e => setNewResource({ ...newResource, featured: e.target.checked })} />
              Featured
            </label>
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={e => handleImageUpload(e, false)} />
              {newResource.image_url && <img src={newResource.image_url} alt="Preview" className="mt-2 h-16 rounded" />}
            </div>
          </div>
          <Button onClick={handleCreate} className="mt-4">Create</Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Author</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Excerpt</th>
              <th className="p-2 border">Featured</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
            ) : paginatedResources.length === 0 ? (
              <tr><td colSpan={8} className="text-center p-4">No resources found.</td></tr>
            ) : paginatedResources.map((resource) => (
              <tr key={resource.id} className="border-b">
                <td className="p-2 border">
                  <span>{resource.title}</span>
                </td>
                <td className="p-2 border">
                  <Badge>{resource.category}</Badge>
                </td>
                <td className="p-2 border">
                  <span>{resource.author}</span>
                </td>
                <td className="p-2 border">
                  <span>{resource.date}</span>
                </td>
                <td className="p-2 border">
                  <span className="line-clamp-2 max-w-xs">{resource.excerpt}</span>
                </td>
                <td className="p-2 border text-center">
                  {resource.featured ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                </td>
                <td className="p-2 border">
                  {resource.image_url && <img src={resource.image_url} alt="Preview" className="h-10 rounded" />}
                </td>
                <td className="p-2 border space-x-2">
                  <>
                    <Dialog open={editingId === resource.id && editDialogOpen} onOpenChange={open => { setEditDialogOpen(open); if (!open) setEditingId(null) }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Resource</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input name="title" placeholder="Title*" value={editData.title || ""} onChange={handleEditChange} required />
                          <Input name="category" placeholder="Category*" value={editData.category || ""} onChange={handleEditChange} required />
                          <Input name="author" placeholder="Author*" value={editData.author || ""} onChange={handleEditChange} required />
                          <Input name="image_url" placeholder="Image URL" value={editData.image_url || ""} onChange={handleEditChange} />
                          <Input name="read_time" placeholder="Read Time" value={editData.read_time || ""} onChange={handleEditChange} />
                          <Input name="excerpt" placeholder="Excerpt" value={editData.excerpt || ""} onChange={handleEditChange} />
                          <Input name="date" placeholder="Date (YYYY-MM-DD)" value={editData.date || ""} onChange={handleEditChange} />
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={!!editData.featured} onChange={e => setEditData({ ...editData, featured: e.target.checked })} />
                            Featured
                          </label>
                          <div>
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} />
                            {editData.image_url && <img src={editData.image_url} alt="Preview" className="mt-2 h-16 rounded" />}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={handleEditSave}>Save</Button>
                          <Button variant="outline" onClick={() => { setEditingId(null); setEditDialogOpen(false) }}>Cancel</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(resource.id)}>Delete</Button>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page-1)}>Previous</Button>
          <span className="px-2">Page {page} of {totalPages}</span>
          <Button size="sm" disabled={page === totalPages} onClick={() => setPage(page+1)}>Next</Button>
        </div>
      )}
    </div>
  )
} 