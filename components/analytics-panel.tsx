"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { MarineSpecies } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsPanelProps {
  marineData: MarineSpecies[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Sample tagging history data
const taggingHistoryData = [
  { year: "2018", count: 12 },
  { year: "2019", count: 19 },
  { year: "2020", count: 25 },
  { year: "2021", count: 34 },
  { year: "2022", count: 45 },
  { year: "2025", count: 52 },
  { year: "2024", count: 58 },
]

export default function AnalyticsPanel({ marineData }: AnalyticsPanelProps) {
  const [chartType, setChartType] = useState("population")

  // Prepare data for charts
  const populationData = marineData.map((species) => ({
    name: species.name.length > 15 ? species.name.substring(0, 15) + "..." : species.name,
    value: species.populationPercentage,
  }))

  const conservationStatusData = [
    { name: "Least Concern", value: marineData.filter((s) => s.conservationStatus.includes("Least Concern")).length },
    {
      name: "Near Threatened",
      value: marineData.filter((s) => s.conservationStatus.includes("Near Threatened")).length,
    },
    { name: "Vulnerable", value: marineData.filter((s) => s.conservationStatus.includes("Vulnerable")).length },
    { name: "Endangered", value: marineData.filter((s) => s.conservationStatus.includes("Endangered")).length },
    {
      name: "Critically Endangered",
      value: marineData.filter((s) => s.conservationStatus.includes("Critically Endangered")).length,
    },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-cyan-800">Analytics Dashboard</h2>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="population">Population Data</SelectItem>
            <SelectItem value="conservation">Conservation Status</SelectItem>
            <SelectItem value="tagging">Tagging History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            {chartType === "population"
              ? "Species Population Levels"
              : chartType === "conservation"
                ? "Conservation Status Distribution"
                : "Tagging History"}
          </CardTitle>
          <CardDescription>
            {chartType === "population"
              ? "Current population as percentage of historic levels"
              : chartType === "conservation"
                ? "Number of species by conservation status"
                : "Number of new tags by year"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartType === "population" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={populationData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: "Population %", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "conservation" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conservationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conservationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            {chartType === "tagging" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taggingHistoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0891b2" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Key Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-xs text-cyan-700">Total Species</p>
              <p className="text-2xl font-bold text-cyan-900">{marineData.length}</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-xs text-cyan-700">Tagged Animals</p>
              <p className="text-2xl font-bold text-cyan-900">
                {marineData.reduce((sum, species) => sum + species.taggedCount, 0)}
              </p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-xs text-cyan-700">Endangered</p>
              <p className="text-2xl font-bold text-cyan-900">
                {
                  marineData.filter(
                    (s) =>
                      s.conservationStatus.includes("Endangered") ||
                      s.conservationStatus.includes("Critically Endangered"),
                  ).length
                }
              </p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-xs text-cyan-700">Research Projects</p>
              <p className="text-2xl font-bold text-cyan-900">12</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
