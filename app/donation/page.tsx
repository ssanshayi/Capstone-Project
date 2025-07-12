"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox
import { Heart, ArrowRight, Users, Target, CreditCard, Smartphone, Wallet, Building2, Quote, Mail } from "lucide-react" // Added Mail icon
import { useState, useEffect, useMemo } from "react" // Added useMemo
import Link from "next/link"
// Add these imports at the top of the file
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase";

// Move static data above the component so it's available for initial state
const fundingData = [
  { project: "Marine Species Tracking", raised: 75000, goal: 100000, percentage: 75 },
  { project: "Ocean Habitat Restoration", raised: 45000, goal: 80000, percentage: 56 },
  { project: "Seabird Protection Program", raised: 62000, goal: 90000, percentage: 69 },
];

const paymentMethods = [
  {
    id: "credit-card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Wallet,
    description: "Pay with your PayPal account",
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: Smartphone,
    description: "Quick payment with Touch ID",
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: Smartphone,
    description: "Pay with Google Wallet",
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    icon: Building2,
    description: "Direct bank account transfer",
  },
];

const testimonials = [
  {
    quote:
      "MarineTracker has allowed me to contribute directly to ocean conservation. Their transparency and impact reports are truly inspiring!",
    author: "Sarah L., Ocean Enthusiast",
  },
  {
    quote:
      "As a marine biologist, I appreciate the cutting-edge research MarineTracker funds. My donations feel like they're making a tangible difference.",
    author: "Dr. Alex Chen, Marine Biologist",
  },
  {
    quote:
      "It's wonderful to see my monthly contributions actively protecting marine life. MarineTracker makes it easy to be part of something bigger.",
    author: "David R., Regular Donor",
  },
];

const faqs = [
  {
    question: "How are my donations used?",
    answer:
      "Your donations directly fund our marine research, species tracking programs, habitat restoration projects, and community outreach initiatives. We ensure maximum impact with every dollar.",
  },
  {
    question: "Are donations tax-deductible?",
    answer:
      "Yes, MarineTracker is a registered non-profit organization. All donations are tax-deductible to the fullest extent of the law. You will receive an email receipt for your records.",
  },
  {
    question: "Can I choose which project my donation supports?",
    answer:
      "Currently, donations contribute to our general fund, allowing us to allocate resources where they are most needed across all active projects. We are working on options for project-specific donations in the future.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit/debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and direct bank transfers for your convenience.",
  },
];

export default function DonationPage() {
  const [donationAmount, setDonationAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedPayment, setSelectedPayment] = useState("")
  const [animatedStats, setAnimatedStats] = useState({
    totalRaised: 0,
    donors: 0,
    projects: 0,
    animals: 0,
  })
  const [newsletterOptIn, setNewsletterOptIn] = useState(false) // New state for newsletter opt-in
  // Add this state variable inside the `DonationPage` component, after `useState` declarations
  const [showThankYouDialog, setShowThankYouDialog] = useState(false)
  // Add state for all form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [project, setProject] = useState(fundingData[0]?.project || "");
  const [frequency, setFrequency] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animated counter effect
  useEffect(() => {
    const targets = {
      totalRaised: 2500000,
      donors: 500,
      projects: 25,
      animals: 150000,
    }

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedStats({
        totalRaised: Math.floor(targets.totalRaised * progress),
        donors: Math.floor(targets.donors * progress),
        projects: Math.floor(targets.projects * progress),
        animals: Math.floor(targets.animals * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedStats(targets)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  const currentDonationValue = Number.parseFloat(customAmount) || Number.parseFloat(donationAmount) || 0

  const impactMessage = useMemo(() => {
    if (currentDonationValue >= 250) {
      return `Your donation of $${currentDonationValue} can help plant ${Math.floor(currentDonationValue / 5)} mangrove trees, vital for coastal ecosystems.`
    } else if (currentDonationValue >= 100) {
      return `Your donation of $${currentDonationValue} can support ${Math.floor(currentDonationValue / 100)} day(s) of critical marine research.`
    } else if (currentDonationValue >= 50) {
      return `Your donation of $${currentDonationValue} can help restore ${Math.floor(currentDonationValue / 5)} sq meters of coral reef.`
    } else if (currentDonationValue >= 25) {
      return `Your donation of $${currentDonationValue} can protect ${Math.floor(currentDonationValue / 5)} marine animals.`
    }
    return "Choose an amount to see your potential impact!"
  }, [currentDonationValue])

  // Donation handler
  async function handleDonation() {
    setError("");
    // Validate required fields
    if (!firstName || !lastName || !email || !selectedPayment || !currency || !project || !frequency) {
      setError("Please fill in all required fields.");
      return;
    }
    const amount = Number.parseFloat(customAmount) || Number.parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }
    setLoading(true);
    const { error: supabaseError } = await supabase.from("donations").insert([
      {
        donor_name: `${firstName} ${lastName}`,
        donor_email: email,
        amount,
        currency,
        project_name: project,
        payment_method: selectedPayment,
        frequency,
        message,
        newsletter_opt_in: newsletterOptIn, 
      },
    ])
    
    setLoading(false);
    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      setShowThankYouDialog(true);
      // Optionally reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setDonationAmount("");
      setCustomAmount("");
      setCurrency("USD");
      setProject(fundingData[0]?.project || "");
      setSelectedPayment("");
      setFrequency("");
      setMessage("");
      setNewsletterOptIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/placeholder.svg?height=600&width=1200')`,
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Support Marine
            <br />
            Conservation Efforts
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your donation helps fund critical research, protection programs, and technology development for marine
            ecosystem preservation.
          </p>
          <Button className="bg-[#17a2b8] hover:bg-[#138496] text-white px-8 py-3 text-lg">
            Start Donating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Animated Impact Stats */}
      <section id="impact" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Our Donation Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See the real-time impact of donations from our global community of marine conservation supporters.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gradient-to-br from-[#17a2b8]/10 to-[#17a2b8]/5 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-[#17a2b8] mb-2">
                ${animatedStats.totalRaised.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Funds Raised</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-green-600 mb-2">{animatedStats.animals.toLocaleString()}</div>
              <div className="text-muted-foreground">Marine Animals Protected</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">{animatedStats.donors}+</div>
              <div className="text-muted-foreground">Active Donors</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">{animatedStats.projects}</div>
              <div className="text-muted-foreground">Research Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Funding Progress Charts */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Project Funding Progress</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Track the funding progress of our active marine conservation projects in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fundingData.map((project, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{project.project}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    ${project.raised.toLocaleString()} raised of ${project.goal.toLocaleString()} goal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Progress value={project.percentage} className="h-3 bg-muted" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {project.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-[#17a2b8]">
                        ${(project.goal - project.raised).toLocaleString()} remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Make Your Donation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your contribution directly supports marine research and conservation efforts worldwide. Every donation
              helps protect our ocean's biodiversity.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Donation Amount */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Heart className="h-5 w-5 text-red-500" />
                  Choose Your Impact
                </CardTitle>
                <CardDescription>Select a donation amount that works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-foreground">
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency} defaultValue="USD">
                    <SelectTrigger className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-selection" className="text-foreground">
                    Select Project
                  </Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]">
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {fundingData.map((project) => (
                        <SelectItem key={project.project} value={project.project}>
                          {project.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-medium text-foreground">Donation Amount</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["25", "50", "100", "250"].map((amount) => (
                      <Button
                        key={amount}
                        variant={donationAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setDonationAmount(amount)
                          setCustomAmount("") // Clear custom amount when a preset is selected
                        }}
                        className={`h-12 ${
                          donationAmount === amount
                            ? "bg-[#17a2b8] hover:bg-[#138496] text-white"
                            : "border-border text-foreground hover:border-[#17a2b8]"
                        }`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount" className="text-foreground">
                      Custom Amount
                    </Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setDonationAmount("") // Clear preset amount when custom is entered
                      }}
                      className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                    />
                  </div>
                </div>

                {/* Impact Calculator Display */}
                <div className="bg-muted/20 p-3 rounded-md text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Your Impact:</p>
                  <p>{impactMessage}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donation-frequency" className="text-foreground">
                    Donation Frequency
                  </Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Donation</SelectItem>
                      <SelectItem value="monthly">Monthly Recurring</SelectItem>
                      <SelectItem value="quarterly">Quarterly Recurring</SelectItem>
                      <SelectItem value="annual">Annual Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? "border-[#17a2b8] bg-[#17a2b8]/5"
                        : "border-border hover:border-[#17a2b8]/50"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon
                        className={`h-5 w-5 ${
                          selectedPayment === method.id ? "text-[#17a2b8]" : "text-muted-foreground"
                        }`}
                      />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            selectedPayment === method.id ? "text-[#17a2b8]" : "text-foreground"
                          }`}
                        >
                          {method.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedPayment === method.id ? "border-[#17a2b8] bg-[#17a2b8]" : "border-muted-foreground"
                        }`}
                      >
                        {selectedPayment === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Donor Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Your Information</CardTitle>
                <CardDescription>Help us stay connected and share impact updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-foreground">
                      First Name
                    </Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Newsletter Opt-in */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter-opt-in"
                    checked={newsletterOptIn}
                    onCheckedChange={(checked) => setNewsletterOptIn(!!checked)}
                    className="border-border data-[state=checked]:bg-[#17a2b8] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="newsletter-opt-in" className="text-sm text-foreground cursor-pointer">
                    Subscribe to our newsletter for impact updates
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Personal Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Share why marine conservation matters to you..."
                    rows={3}
                    className="border-border focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white"
                  size="lg"
                  onClick={handleDonation}
                  disabled={loading}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  {loading ? "Processing..." : "Complete Donation"}
                </Button>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <p className="text-xs text-muted-foreground text-center">
                  Your donation is secure and tax-deductible. You'll receive a receipt via email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Corporate / Large Donations Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Partner With Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
            Interested in making a significant impact through corporate partnerships or large-scale donations? We'd love
            to discuss how your contribution can drive major conservation initiatives.
          </p>
          <Link href="/partnerships">
            <Button
              size="lg"
              variant="outline"
              className="border-[#17a2b8] text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white bg-transparent"
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Our Partnerships Team
            </Button>
          </Link>
        </div>
      </section>

      {/* Donor Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Hear From Our Supporters</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Real stories from individuals making a difference with MarineTracker.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border p-6 flex flex-col items-center text-center">
                <Quote className="h-8 w-8 text-[#17a2b8] mb-4" />
                <CardContent className="p-0">
                  <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                  <p className="font-semibold text-foreground">- {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#17a2b8] mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Find answers to common questions about donating to MarineTracker.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-foreground hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#17a2b8] mb-8">About Our Platform</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our marine tracking system provides real-time data on marine species movements, helping researchers,
            conservationists, and ocean enthusiasts monitor and protect our ocean's biodiversity through advanced
            technology and community-driven conservation efforts.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#17a2b8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Marine Conservation Mission</h2>
          <p className="text-xl text-white/90 mb-8">
            Become part of a global community dedicated to protecting our oceans for future generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/conservation">
              <Button size="lg" variant="secondary" className="bg-white text-[#17a2b8] hover:bg-gray-50">
                <Users className="mr-2 h-5 w-5" />
                View Conservation Projects
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#17a2b8] bg-transparent"
            >
              <Target className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="/" className="text-2xl font-bold text-[#17a2b8]">
                MarineTracker
              </Link>
              <p className="text-muted-foreground leading-relaxed">
                Dedicated to protecting our oceans through advanced tracking technology, research, and community-driven
                conservation efforts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/conservation" className="hover:text-foreground transition-colors">
                    Conservation
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#donate" className="hover:text-foreground transition-colors">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href="#impact" className="hover:text-foreground transition-colors">
                    Impact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Marine Conservation</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Species Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Habitat Protection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Ocean Research
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Climate Impact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#donate" className="hover:text-foreground transition-colors">
                    Donate
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Volunteer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 MarineTracker Platform. All rights reserved. Protecting our oceans together.
            </p>
          </div>
        </div>
      </footer>
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#17a2b8]">Thank You!</DialogTitle>
            <DialogDescription>
              Thank you for your generous donation! Your contribution makes a significant impact on marine conservation.
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
