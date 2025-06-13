import { Coins } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Coins className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold text-white">CryptoKran</span>
          </div>

          <div className="text-white/60 text-center md:text-right">
            <p>&copy; 2024 CryptoKran. Все права защищены.</p>
            <p className="text-sm mt-1">Бесплатные криптомонеты каждый день</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
