"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConservationStats() {
  const [activeTab, setActiveTab] = useState("threats")

  // Sample data for threats to marine life
  const threatData = [
    { name: "Plastic Pollution", value: 35 },
    { name: "Climate Change", value: 25 },
    { name: "Overfishing", value: 20 },
    { name: "Habitat Destruction", value: 15 },
    { name: "Oil Spills", value: 5 },
  ]

  // Sample data for protected areas growth
  const protectedAreasData = [
    { year: "2000", area: 2 },
    { year: "2005", area: 3 },
    { year: "2010", area: 4 },
    { year: "2015", area: 6 },
    { year: "2020", area: 8 },
    { year: "2025", area: 10 },
  ]

  // Sample data for species status
  const speciesStatusData = [
    { name: "Least Concern", value: 40, color: "#10b981" },
    { name: "Near Threatened", value: 15, color: "#3b82f6" },
    { name: "Vulnerable", value: 20, color: "#f59e0b" },
    { name: "Endangered", value: 15, color: "#f97316" },
    { name: "Critically Endangered", value: 10, color: "#ef4444" },
  ]

  // Colors for the threat chart
  const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#10b981"]

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="protected">Protected Areas</TabsTrigger>
          <TabsTrigger value="status">Species Status</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Major Threats to Marine Life</CardTitle>
              <CardDescription>Percentage impact of different threats on marine ecosystems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={threatData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {threatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {threatData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="h-3 w-full rounded-full mb-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth of Marine Protected Areas</CardTitle>
              <CardDescription>Percentage of global oceans under protection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={protectedAreasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      label={{ value: "% of Oceans Protected", angle: -90, position: "insideLeft" }}
                      domain={[0, 12]}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "Protected Area"]} />
                    <Bar dataKey="area" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  The international target is to protect 30% of the world's oceans by 2030.
                </p>
                <div className="mt-2 bg-gray-200 h-4 rounded-full overflow-hidden">
                  <div className="bg-cyan-600 h-full" style={{ width: "33%" }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Current progress: 10% of 30% goal</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Marine Species Conservation Status</CardTitle>
              <CardDescription>Distribution of conservation status among tracked marine species</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speciesStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {speciesStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {speciesStatusData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="h-3 w-full rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-cyan-700 mb-2">7.7M</div>
            <p className="text-sm text-gray-600">Square kilometers of marine protected areas worldwide</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-cyan-700 mb-2">17%</div>
            <p className="text-sm text-gray-600">Decline in global marine biodiversity since 1970</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-cyan-700 mb-2">250K</div>
            <p className="text-sm text-gray-600">Marine species currently being tracked and monitored</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-cyan-700 mb-2">30%</div>
            <p className="text-sm text-gray-600">Target for ocean protection by 2030</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
