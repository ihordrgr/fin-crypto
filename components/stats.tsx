import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Coins, TrendingUp, Clock } from "lucide-react"

export function Stats() {
  const stats = [
    {
      title: "Активных пользователей",
      value: "12,847",
      icon: Users,
      change: "+12%",
    },
    {
      title: "Выплачено BTC",
      value: "2.847",
      icon: Coins,
      change: "+8%",
    },
    {
      title: "Всего клеймов",
      value: "847,293",
      icon: TrendingUp,
      change: "+15%",
    },
    {
      title: "Время работы",
      value: "847 дней",
      icon: Clock,
      change: "100%",
    },
  ]

  return (
    <section id="stats" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Статистика платформы</h2>
          <p className="text-white/70 text-lg">Наши достижения говорят сами за себя</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-green-400">{stat.change} за месяц</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
