import { Button } from "@/components/ui/button"
import { Coins, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">CryptoKran</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-white/80 hover:text-white transition-colors">
              Главная
            </a>
            <a href="#faucet" className="text-white/80 hover:text-white transition-colors">
              Кран
            </a>
            <a href="#stats" className="text-white/80 hover:text-white transition-colors">
              Статистика
            </a>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              Войти
            </Button>
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
