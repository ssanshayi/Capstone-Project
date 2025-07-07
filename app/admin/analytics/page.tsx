"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { CalendarDays, Fish, TrendingUp, Users, Activity, Search, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface TrackingData {
  date: string
  count: number
}

interface SpeciesData {
  species: string
  count: number
  lastTracked: string
}

interface ActivityData {
  activity_type: string
  count: number
  percentage: number
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  adminUsers: number
}

interface SystemStats {
  totalSpecies: number
  totalProjects: number
  totalNews: number
  totalResources: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [dailyData, setDailyData] = useState<TrackingData[]>([])
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([])
  const [totalTracking, setTotalTracking] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0, newUsers: 0, adminUsers: 0 })
  const [systemStats, setSystemStats] = useState<SystemStats>({ totalSpecies: 0, totalProjects: 0, totalNews: 0, totalResources: 0 })
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [totalActivities, setTotalActivities] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // Fetch all data using Supabase
      const [
        trackingResult,
        usersResult,
        speciesResult,
        projectsResult,
        newsResult,
        resourcesResult,
        activitiesResult
      ] = await Promise.all([
        supabase.from('species_tracking').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('profiles').select('*'),
        supabase.from('marine_species').select('*'),
        supabase.from('conservation_projects').select('*'),
        supabase.from('news_articles').select('*'),
        supabase.from('educational_resources').select('*'),
        supabase.from('user_activities').select('*').gte('created_at', startDate.toISOString())
      ])

      // Handle tracking data
      if (trackingResult.error) {
        console.error('Error fetching tracking data:', trackingResult.error)
      } else {
        const tracking = trackingResult.data || []
        const dailyMap = new Map<string, number>()
        const speciesMap = new Map<string, { count: number; lastTracked: string }>()
        
        tracking.forEach((item: any) => {
          const date = item.created_at.split('T')[0]
          dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
          
          const species = item.species_name || 'Unknown Species'
          const existing = speciesMap.get(species)
          if (!existing || item.created_at > existing.lastTracked) {
            speciesMap.set(species, {
              count: (existing?.count || 0) + 1,
              lastTracked: item.created_at
            })
          }
        })
        
        // Build date array
        const dailyArray: TrackingData[] = []
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          dailyArray.push({
            date: dateStr,
            count: dailyMap.get(dateStr) || 0
          })
        }
        
        const speciesArray: SpeciesData[] = Array.from(speciesMap.entries())
          .map(([species, data]) => ({
            species,
            count: data.count,
            lastTracked: data.lastTracked
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setDailyData(dailyArray)
        setSpeciesData(speciesArray)
        setTotalTracking(tracking.length)
      }

      // Handle user stats
      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error)
      } else {
        const users = usersResult.data || []
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        setUserStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => !u.is_banned).length,
          newUsers: users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length,
          adminUsers: users.filter(u => u.role === 'admin').length
        })
      }

      // Handle system stats
      setSystemStats({
        totalSpecies: speciesResult.data?.length || 0,
        totalProjects: projectsResult.data?.length || 0,
        totalNews: newsResult.data?.length || 0,
        totalResources: resourcesResult.data?.length || 0
      })

      // Handle activity data
      if (activitiesResult.error) {
        console.error('Error fetching activities:', activitiesResult.error)
      } else {
        const activities = activitiesResult.data || []
        const activityMap = new Map<string, number>()
        
        activities.forEach((activity: any) => {
          const type = activity.activity_type || 'unknown'
          activityMap.set(type, (activityMap.get(type) || 0) + 1)
        })
        
        const total = activities.length
        const activityArray: ActivityData[] = Array.from(activityMap.entries())
          .map(([type, count]) => ({
            activity_type: getActivityDisplayName(type),
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setActivityData(activityArray)
        setTotalActivities(total)
      }
      
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }
  
  const getActivityDisplayName = (type: string): string => {
    const displayNames: { [key: string]: string } = {
      'page_view': 'Page View',
      'search': 'Search',
      'species_favorite': 'Species Favorite',
      'user_login': 'User Login',
      'user_register': 'User Register',
      'resource_download': 'Resource Download',
      'resource_view': 'Resource View',
      'admin_species_create': 'Add Species',
      'admin_species_edit': 'Edit Species',
      'data_export': 'Data Export'
    }
    return displayNames[type] || type
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of platform usage and user behavior</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-gray-600">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
            <p className="text-xs text-gray-600">Non-banned users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <CalendarDays className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.newUsers}</div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Fish className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.adminUsers}</div>
            <p className="text-xs text-gray-600">Administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Species</CardTitle>
            <Fish className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalSpecies}</div>
            <p className="text-xs text-gray-600">Marine species</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conservation Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalProjects}</div>
            <p className="text-xs text-gray-600">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Articles</CardTitle>
            <Search className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalNews}</div>
            <p className="text-xs text-gray-600">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Educational Resources</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalResources}</div>
            <p className="text-xs text-gray-600">Available resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tracking Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Tracked Species</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speciesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="species" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ activity_type, percentage }) => `${activity_type} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Activity Breakdown</h3>
              {activityData.map((activity, index) => (
                <div key={activity.activity_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{activity.activity_type}</span>
                  </div>
                  <Badge variant="secondary">{activity.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}