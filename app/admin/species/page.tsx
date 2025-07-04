"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Fish } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { ImageUpload } from "@/components/admin/image-upload"

interface Species {
  id: string
  name: string
  scientific_name: string
  category: string
  conservation_status: string
  description: string
  habitat: string
  diet: string
  lifespan: string
  size_range: string
  population_trend: string
  population_percentage: number
  image_url?: string
  tags: string[]
  threats: string[]
  created_at: string
}

export default function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newSpecies, setNewSpecies] = useState<Omit<Species, 'id' | 'created_at'>>({
    name: '',
    scientific_name: '',
    category: 'Fish',
    conservation_status: 'Least Concern',
    description: '',
    habitat: '',
    diet: '',
    lifespan: '',
    size_range: '',
    population_trend: 'Stable',
    population_percentage: 50,
    image_url: '',
    tags: [],
    threats: []
  })

  const categories = [
    { value: 'Fish', label: 'Fish' },
    { value: 'Mammals', label: 'Mammals' },
    { value: 'Reptiles', label: 'Reptiles' },
    { value: 'Birds', label: 'Birds' },
    { value: 'Invertebrates', label: 'Invertebrates' }
  ]

  const statusOptions = [
    { value: 'Least Concern', label: 'Least Concern', color: 'bg-green-100 text-green-800' },
    { value: 'Near Threatened', label: 'Near Threatened', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Vulnerable', label: 'Vulnerable', color: 'bg-orange-100 text-orange-800' },
    { value: 'Endangered', label: 'Endangered', color: 'bg-red-100 text-red-800' },
    { value: 'Critically Endangered', label: 'Critically Endangered', color: 'bg-red-200 text-red-900' }
  ]

  const populationTrendOptions = [
    { value: 'Increasing', label: 'Increasing' },
    { value: 'Stable', label: 'Stable' },
    { value: 'Decreasing', label: 'Decreasing' },
    { value: 'Unknown', label: 'Unknown' }
  ]

  useEffect(() => {
    fetchSpecies()
  }, [])

  const fetchSpecies = async () => {
    try {
      const { data, error } = await supabase
        .from('marine_species')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching species:', error)
        toast.error('Failed to fetch species list')
      } else {
        setSpecies(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch species list')
    }
  }

  const saveSpecies = async (speciesData: Omit<Species, 'id' | 'created_at'>) => {
    try {
      if (isAddingNew) {
        const { data, error } = await supabase
          .from('marine_species')
          .insert([speciesData])
          .select()

        if (error) {
          console.error('Error adding species:', error)
          toast.error('Failed to add species')
          return
        }
        toast.success('Species added successfully')
      } else if (editingSpecies) {
        const { error } = await supabase
          .from('marine_species')
          .update(speciesData)
          .eq('id', editingSpecies.id)

        if (error) {
          console.error('Error updating species:', error)
          toast.error('Failed to update species')
          return
        }
        toast.success('Species updated successfully')
      }
      
      // Refresh the list
      await fetchSpecies()
      
      setIsAddingNew(false)
      setEditingSpecies(null)
      setNewSpecies({
        name: '',
        scientific_name: '',
        category: 'Fish',
        conservation_status: 'Least Concern',
        description: '',
        habitat: '',
        diet: '',
        lifespan: '',
        size_range: '',
        population_trend: 'Stable',
        population_percentage: 50,
        image_url: '',
        tags: [],
        threats: []
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Operation failed')
    }
  }

  const deleteSpecies = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marine_species')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting species:', error)
        toast.error('Failed to delete species')
        return
      }
      
      toast.success('Species deleted successfully')
      await fetchSpecies()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Delete failed')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status)
    return (
      <Badge className={statusOption?.color}>
        {statusOption?.label || status}
      </Badge>
    )
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category
  }

  const filteredSpecies = species.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Species Management</h1>
          <p className="text-gray-600 mt-2">Manage marine species information</p>
        </div>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Species
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Species</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSpecies.name}
                  onChange={(e) => setNewSpecies({...newSpecies, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input
                  id="scientificName"
                  value={newSpecies.scientific_name}
                  onChange={(e) => setNewSpecies({...newSpecies, scientific_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newSpecies.category} onValueChange={(value) => setNewSpecies({...newSpecies, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Conservation Status</Label>
                <Select value={newSpecies.conservation_status} onValueChange={(value) => setNewSpecies({...newSpecies, conservation_status: value})}>
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
              <div>
                <Label htmlFor="habitat">Habitat</Label>
                <Input
                  id="habitat"
                  value={newSpecies.habitat}
                  onChange={(e) => setNewSpecies({...newSpecies, habitat: e.target.value})}
                  placeholder="e.g., Temperate deep ocean waters"
                />
              </div>
              <div>
                <Label htmlFor="diet">Diet</Label>
                <Input
                  id="diet"
                  value={newSpecies.diet}
                  onChange={(e) => setNewSpecies({...newSpecies, diet: e.target.value})}
                  placeholder="e.g., Fish, crustaceans"
                />
              </div>
              <div>
                <Label htmlFor="lifespan">Lifespan</Label>
                <Input
                  id="lifespan"
                  value={newSpecies.lifespan}
                  onChange={(e) => setNewSpecies({...newSpecies, lifespan: e.target.value})}
                  placeholder="e.g., 20-25 years"
                />
              </div>
              <div>
                <Label htmlFor="size_range">Size Range</Label>
                <Input
                  id="size_range"
                  value={newSpecies.size_range}
                  onChange={(e) => setNewSpecies({...newSpecies, size_range: e.target.value})}
                  placeholder="e.g., 2-4 meters"
                />
              </div>
              <div>
                <Label htmlFor="population_trend">Population Trend</Label>
                <Select value={newSpecies.population_trend} onValueChange={(value) => setNewSpecies({...newSpecies, population_trend: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {populationTrendOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="population_percentage">Population Percentage</Label>
                <Input
                  id="population_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={newSpecies.population_percentage}
                  onChange={(e) => setNewSpecies({...newSpecies, population_percentage: parseInt(e.target.value) || 0})}
                  placeholder="Historical level percentage"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSpecies.description}
                  onChange={(e) => setNewSpecies({...newSpecies, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newSpecies.tags.join(', ')}
                  onChange={(e) => setNewSpecies({...newSpecies, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                  placeholder="e.g., Apex predator, Endangered species, Migratory"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="threats">Threats (comma separated)</Label>
                <Input
                  id="threats"
                  value={newSpecies.threats.join(', ')}
                  onChange={(e) => setNewSpecies({...newSpecies, threats: e.target.value.split(',').map(threat => threat.trim()).filter(threat => threat)})}
                  placeholder="e.g., Overfishing, Ocean pollution, Habitat destruction"
                />
              </div>
              <div className="col-span-2">
                <Label>Species Image</Label>
                <ImageUpload
                  value={newSpecies.image_url}
                  onChange={(url) => setNewSpecies({...newSpecies, image_url: url})}
                />
              </div>
              <div className="col-span-2">
                <Button onClick={() => saveSpecies(newSpecies)} className="w-full">
                  Save Species
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Species Dialog */}
      <Dialog open={!!editingSpecies} onOpenChange={() => setEditingSpecies(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Species</DialogTitle>
          </DialogHeader>
          {editingSpecies && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingSpecies.name}
                  onChange={(e) => setEditingSpecies({...editingSpecies, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-scientificName">Scientific Name</Label>
                <Input
                  id="edit-scientificName"
                  value={editingSpecies.scientific_name}
                  onChange={(e) => setEditingSpecies({...editingSpecies, scientific_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editingSpecies.category} onValueChange={(value) => setEditingSpecies({...editingSpecies, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Conservation Status</Label>
                <Select value={editingSpecies.conservation_status} onValueChange={(value) => setEditingSpecies({...editingSpecies, conservation_status: value})}>
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
              <div>
                <Label htmlFor="edit-habitat">Habitat</Label>
                <Input
                  id="edit-habitat"
                  value={editingSpecies.habitat || ''}
                  onChange={(e) => setEditingSpecies({...editingSpecies, habitat: e.target.value})}
                  placeholder="e.g., Temperate deep ocean waters"
                />
              </div>
              <div>
                <Label htmlFor="edit-diet">Diet</Label>
                <Input
                  id="edit-diet"
                  value={editingSpecies.diet || ''}
                  onChange={(e) => setEditingSpecies({...editingSpecies, diet: e.target.value})}
                  placeholder="e.g., Fish, crustaceans"
                />
              </div>
              <div>
                <Label htmlFor="edit-lifespan">Lifespan</Label>
                <Input
                  id="edit-lifespan"
                  value={editingSpecies.lifespan || ''}
                  onChange={(e) => setEditingSpecies({...editingSpecies, lifespan: e.target.value})}
                  placeholder="e.g., 20-25 years"
                />
              </div>
              <div>
                <Label htmlFor="edit-size_range">Size Range</Label>
                <Input
                  id="edit-size_range"
                  value={editingSpecies.size_range || ''}
                  onChange={(e) => setEditingSpecies({...editingSpecies, size_range: e.target.value})}
                  placeholder="e.g., 2-4 meters"
                />
              </div>
              <div>
                <Label htmlFor="edit-population_trend">Population Trend</Label>
                <Select value={editingSpecies.population_trend || 'Stable'} onValueChange={(value) => setEditingSpecies({...editingSpecies, population_trend: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {populationTrendOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-population_percentage">Population Percentage</Label>
                <Input
                  id="edit-population_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={editingSpecies.population_percentage || 50}
                  onChange={(e) => setEditingSpecies({...editingSpecies, population_percentage: parseInt(e.target.value) || 0})}
                  placeholder="Historical level percentage"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingSpecies.description}
                  onChange={(e) => setEditingSpecies({...editingSpecies, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={(editingSpecies.tags || []).join(', ')}
                  onChange={(e) => setEditingSpecies({...editingSpecies, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                  placeholder="e.g., Apex predator, Endangered species, Migratory"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-threats">Threats (comma separated)</Label>
                <Input
                  id="edit-threats"
                  value={(editingSpecies.threats || []).join(', ')}
                  onChange={(e) => setEditingSpecies({...editingSpecies, threats: e.target.value.split(',').map(threat => threat.trim()).filter(threat => threat)})}
                  placeholder="e.g., Overfishing, Ocean pollution, Habitat destruction"
                />
              </div>
              <div className="col-span-2">
                <Label>Species Image</Label>
                <ImageUpload
                  value={editingSpecies.image_url || ''}
                  onChange={(url) => setEditingSpecies({...editingSpecies, image_url: url})}
                />
              </div>
              <div className="col-span-2">
                <Button onClick={() => {
                  const { id, created_at, ...speciesData } = editingSpecies
                  saveSpecies(speciesData)
                }} className="w-full">
                  Update Species
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by species name or scientific name..."
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
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Species</TableHead>
                <TableHead>Scientific Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Conservation Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpecies.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Fish className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="italic">{s.scientific_name}</TableCell>
                  <TableCell>{getCategoryLabel(s.category)}</TableCell>
                  <TableCell>{getStatusBadge(s.conservation_status)}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingSpecies(s)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSpecies(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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