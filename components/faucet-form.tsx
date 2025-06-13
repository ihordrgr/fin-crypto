"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Clock, Gift } from "lucide-react"

export function FaucetForm() {
  const [wallet, setWallet] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canClaim, setCanClaim] = useState(true)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClaim = () => {
    if (wallet && canClaim) {
      setCanClaim(false)
      setTimeLeft(300)
      // Here you would implement the actual claim logic
      alert("Награда отправлена на ваш кошелек!")
    }
  }

  return (
    <section id="faucet" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
                <Gift className="h-8 w-8 text-yellow-400" />
                Криптокран
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Введите адрес вашего кошелька и получите бесплатные монеты
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Адрес кошелька
                </label>
                <Input
                  placeholder="Введите адрес вашего Bitcoin кошелька"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">0.00001 BTC</div>
                <div className="text-white/80">Награда за клейм</div>
              </div>

              {!canClaim && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
                    <Clock className="h-4 w-4" />
                    Следующий клейм через:
                  </div>
                  <div className="text-2xl font-mono text-yellow-400">{formatTime(timeLeft)}</div>
                </div>
              )}

              <Button
                onClick={handleClaim}
                disabled={!wallet || !canClaim}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 text-lg"
              >
                {canClaim ? "Получить награду" : "Ожидание..."}
              </Button>

              <div className="text-center text-white/60 text-sm">Минимальная выплата: 0.001 BTC</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
