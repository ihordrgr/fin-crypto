
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Админ-панель</h1>
      <p className="text-gray-600 mt-2">Добро пожаловать, {session.user.email}</p>
    </main>
  );
}
