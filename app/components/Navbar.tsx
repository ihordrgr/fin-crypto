'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/login', label: 'Вход' },
  { href: '/register', label: 'Регистрация' },
  { href: '/tasks', label: 'Задания' },
  { href: '/dashboard', label: 'Дашборд' },
  { href: '/admin', label: 'Админка' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm py-4 px-6 mb-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${pathname === href ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500'}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
