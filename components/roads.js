import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Roads() {
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('beyond_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('beyond_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('passes').select('*').eq('hidden', false);
      if (data) setPasses(data);
      if (error) console.error('Supabase error:', error);
    };
    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = passes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;
    const isFavorite = favorites.includes(p.id);
    return (
      matchesSearch &&
      matchesStatus &&
      (!showOnlyFavorites || isFavorite)
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>🚗 Swiss Passes</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="unknown">Unknown</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
          />
          &nbsp;Only favorites
        </label>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((pass) => (
          <li
            key={pass.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{pass.name}</span>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => toggleFavorite(pass.id)}
            >
              {favorites.includes(pass.id) ? '⭐' : '☆'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 
