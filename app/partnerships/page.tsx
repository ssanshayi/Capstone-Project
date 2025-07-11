"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useState } from "react"

export default function PartnershipsPage() {
  const [showInquiryDialog, setShowInquiryDialog] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#17a2b8] mb-6">Partner with MarineTracker</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collaborate with us to amplify your impact on marine conservation and research.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground text-lg">
              We're excited to explore how we can work together to protect our oceans. Please reach out to our team.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-[#17a2b8]" />
                <span>partnerships@marinetracker.org</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-[#17a2b8]" />
                <span>+1 (123) 456-7890</span>
              </div>
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-[#17a2b8] mt-1" />
                <span>123 Ocean Drive, Marine City, OC 98765, USA</span>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/donation">
                <Button
                  variant="outline"
                  className="border-[#17a2b8] text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Donation Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Partnership Inquiry Form */}
          <div className="bg-card border border-border p-8 rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">Partnership Inquiry</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input id="organization" placeholder="Oceanic Research Institute" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Partnership Proposal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" placeholder="Tell us about your partnership idea..." rows={5} />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white"
                onClick={(e) => {
                  e.preventDefault() // Prevent default form submission
                  console.log("Send Inquiry button clicked!") // Debugging log
                  setShowInquiryDialog(true)
                }}
              >
                Send Inquiry
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">© 2024 MarineTracker. All rights reserved.</p>
        </div>
      </footer>
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#17a2b8]">Inquiry Sent!</DialogTitle>
            <DialogDescription>
              Thank you for your inquiry! We have received your message and will contact you soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="bg-[#17a2b8] hover:bg-[#138496]">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
