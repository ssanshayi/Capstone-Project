"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface Donation {
  id: string
  donor_name: string
  donor_email: string
  amount: number
  currency: string
  project_name: string
  frequency: string
  created_at: string
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])

  useEffect(() => {
    async function fetchDonations() {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setDonations(data)
    }

    fetchDonations()
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Donation Records</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.donor_name}</TableCell>
                  <TableCell>{donation.donor_email}</TableCell>
                  <TableCell>${donation.amount.toFixed(2)}</TableCell>
                  <TableCell>{donation.currency}</TableCell>
                  <TableCell>{donation.project_name}</TableCell>
                  <TableCell>{donation.frequency}</TableCell>
                  <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
