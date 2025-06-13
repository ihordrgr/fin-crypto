
'use client';

export default function TasksPage() {
  const tasks = [
    { id: 1, title: 'Подпишись на Telegram-канал', reward: '0.0005 BTC' },
    { id: 2, title: 'Посети сайт партнёра', reward: '0.0003 BTC' },
    { id: 3, title: 'Напиши отзыв на форуме', reward: '0.0004 BTC' },
  ];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Доступные задания</h1>
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="border p-4 rounded-xl shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <p className="text-sm text-gray-500">Награда: {task.reward}</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Выполнить
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
