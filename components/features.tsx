import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Gift, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      title: "Безопасность",
      description: "Все транзакции защищены современным шифрованием",
      icon: Shield,
    },
    {
      title: "Быстрые выплаты",
      description: "Автоматические выплаты каждые 24 часа",
      icon: Zap,
    },
    {
      title: "Бонусы",
      description: "Дополнительные награды за активность",
      icon: Gift,
    },
    {
      title: "Сообщество",
      description: "Присоединяйтесь к тысячам активных пользователей",
      icon: Users,
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Почему выбирают нас?</h2>
          <p className="text-white/70 text-lg">Преимущества нашего криптокрана</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-black/40 border-white/20 backdrop-blur-sm text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
