import { Button } from "@/components/ui/button"
import { ArrowDown, Zap } from "lucide-react"

export function Hero() {
  return (
    <section id="home" className="py-20 text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Бесплатные
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {" "}
              Криптомонеты
            </span>
          </h1>

          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Получайте бесплатные криптомонеты каждые 5 минут! Никаких вложений, только честные награды за активность.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold"
            >
              <Zap className="mr-2 h-5 w-5" />
              Начать зарабатывать
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Узнать больше
            </Button>
          </div>

          <div className="animate-bounce">
            <ArrowDown className="h-8 w-8 text-white/60 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
