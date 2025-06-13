import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FaucetForm } from "@/components/faucet-form"
import { Stats } from "@/components/stats"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Header />
      <main>
        <Hero />
        <FaucetForm />
        <Stats />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
