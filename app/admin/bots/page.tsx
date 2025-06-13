'use client';
import { useEffect, useState } from 'react';

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);

  async function fetchBots() {
    const res = await fetch('/api/admin/bots');
    const data = await res.json();
    setBots(data.bots);
  }

  async function addBot() {
    await fetch('/api/admin/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, active })
    });
    setName('');
    setActive(true);
    fetchBots();
  }

  async function deleteBot(id: string) {
    await fetch('/api/admin/bots/' + id, { method: 'DELETE' });
    fetchBots();
  }

  useEffect(() => {
    fetchBots();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Manage Bots</h1>

      <div className="bg-white shadow p-4 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Bot</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Bot name"
          className="border px-2 py-1 rounded mr-2"
        />
        <label className="mr-2">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="mr-1"
          />
          Active
        </label>
        <button
          onClick={addBot}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          Add
        </button>
      </div>

      <div className="space-y-4">
        {bots.length === 0 ? (
          <p>No bots found.</p>
        ) : (
          bots.map(bot => (
            <div key={bot._id} className="bg-white shadow p-4 rounded-xl">
              <p><strong>Name:</strong> {bot.name}</p>
              <p><strong>Status:</strong> {bot.active ? 'Active' : 'Inactive'}</p>
              <button
                onClick={() => deleteBot(bot._id)}
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}