import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Polymer Trading System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your polymer trading operations with automated deal registration,
            messaging, and comprehensive business intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Deal Registration Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Deal Registration
              </CardTitle>
              <CardDescription>
                Create new polymer deals with automated calculations and messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Register new deals with customer and supplier details, product specifications,
                and automatic WhatsApp/Telegram notifications.
              </p>
              <Link href="/deals/register">
                <Button className="w-full">
                  Register New Deal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Chatbot Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Assistant
              </CardTitle>
              <CardDescription>
                Chat with your business data using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Ask questions about your deals, customers, products, and get instant
                insights from your trading data.
              </p>
              <Link href="/chatbot">
                <Button variant="outline" className="w-full">
                  Chat with Data
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Health Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ System Health
              </CardTitle>
              <CardDescription>
                Monitor system status and messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Check database connectivity, messaging services, and system performance
                in real-time.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Statistics Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Your Trading Data at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600">34,200+</div>
              <div className="text-gray-600">Total Deals</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-green-600">200</div>
              <div className="text-gray-600">Customers</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-purple-600">200</div>
              <div className="text-gray-600">Suppliers</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-orange-600">312</div>
              <div className="text-gray-600">Products</div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p>Polymer Trading Management System - Built with Next.js 14 & Supabase</p>
        </footer>
      </div>
    </div>
  )
}
