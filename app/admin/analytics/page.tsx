"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { CalendarDays, Fish, TrendingUp, Users, Activity, Search, Download } from "lucide-react"
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
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [dailyData, setDailyData] = useState<TrackingData[]>([])
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([])
  const [totalTracking, setTotalTracking] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0, newUsers: 0 })
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [totalActivities, setTotalActivities] = useState(0)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get tracking data
    const { data: tracking } = await supabase
      .from('species_tracking')
      .select('*, species_name, created_at')
      .gte('created_at', startDate.toISOString())
    
    // Get user data
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, created_at')
    
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', startDate.toISOString())
    
    // Get user activity data
    const { data: activities } = await supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .gte('created_at', startDate.toISOString())
    
    // Process tracking data
    const dailyMap = new Map<string, number>()
    const speciesMap = new Map<string, { count: number; lastTracked: string }>()
    
    tracking?.forEach(item => {
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
    
    // Process user activity data
    const activityMap = new Map<string, number>()
    activities?.forEach(item => {
      const type = item.activity_type
      activityMap.set(type, (activityMap.get(type) || 0) + 1)
    })
    
    const totalActivitiesCount = activities?.length || 0
    const activityArray: ActivityData[] = Array.from(activityMap.entries())
      .map(([activity_type, count]) => ({
        activity_type: getActivityDisplayName(activity_type),
        count,
        percentage: Math.round((count / Math.max(totalActivitiesCount, 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    
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
    
    // Calculate active users (users with activity records)
    const activeUserIds = new Set(activities?.map(a => a.user_id).filter(Boolean))
    
    setDailyData(dailyArray)
    setSpeciesData(speciesArray)
    setTotalTracking(tracking?.length || 0)
    setUserStats({
      totalUsers: allUsers?.length || 0,
      activeUsers: activeUserIds.size,
      newUsers: recentUsers?.length || 0
    })
    setActivityData(activityArray)
    setTotalActivities(totalActivitiesCount)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">User behavior and species tracking data</p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracking</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTracking}</div>
            <p className="text-xs text-gray-600">Within selected time range</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-gray-600">
              {userStats.newUsers} new users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
            <p className="text-xs text-gray-600">Users with activity records</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activities</CardTitle>
            <CalendarDays className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-gray-600">Total activity count</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Tracking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Popular Species</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speciesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="species" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Behavior Analysis</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {activityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.map((activity, index) => (
                <div key={activity.activity_type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                    />
                    <span className="font-medium">{activity.activity_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{activity.count} times</Badge>
                    <span className="text-sm text-gray-600">{activity.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Species Tracking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {speciesData.map((species, index) => (
              <div key={species.species} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{species.species}</h3>
                    <p className="text-sm text-gray-600">Last tracked: {new Date(species.lastTracked).toLocaleDateString('en-US')}</p>
                  </div>
                </div>
                <Badge variant="secondary">{species.count} tracking records</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}