import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';

export default function Roadpage() {
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { language } = useAppContext();
  const lang = language || 'DE';

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

  const filtered = passes
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesRegion = regionFilter === '' || p.canton === regionFilter;
      const matchesCountry = countryFilter === '' || (p.countries || []).includes(countryFilter);
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const isFavorite = favorites.includes(p.id);
      return (
        matchesSearch &&
        matchesStatus &&
        matchesRegion &&
        matchesCountry &&
        matchesType &&
        (!showOnlyFavorites || isFavorite)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'green';
      case 'closed': return 'red';
      case 'unknown': return 'gray';
      default: return 'black';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚗 Swiss Passes</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={lang === 'DE' ? '🔍 Suche' : lang === 'FR' ? '🔍 Rechercher' : lang === 'IT' ? '🔍 Cerca' : '🔍 Search'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{lang === 'DE' ? 'Alle Status' : lang === 'FR' ? 'Tous les statuts' : lang === 'IT' ? 'Tutti gli stati' : 'All Status'}</option>
          <option value="open">{lang === 'DE' ? 'Offen' : lang === 'FR' ? 'Ouvert' : lang === 'IT' ? 'Aperto' : 'Open'}</option>
          <option value="closed">{lang === 'DE' ? 'Geschlossen' : lang === 'FR' ? 'Fermé' : lang === 'IT' ? 'Chiuso' : 'Closed'}</option>
          <option value="unknown">{lang === 'DE' ? 'Unbekannt' : lang === 'FR' ? 'Inconnu' : lang === 'IT' ? 'Sconosciuto' : 'Unknown'}</option>
        </select>

        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
          <option value="">{lang === 'DE' ? 'Alle Länder' : lang === 'FR' ? 'Tous les pays' : lang === 'IT' ? 'Tutti i paesi' : 'All countries'}</option>
          {[...new Set(passes.flatMap(p => p.countries || []))].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">{lang === 'DE' ? 'Alle Kantone' : lang === 'FR' ? 'Tous les cantons' : lang === 'IT' ? 'Tutti i cantoni' : 'All cantons'}</option>
          {[...new Set(passes.map(p => p.canton).filter(Boolean))].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">{lang === 'DE' ? 'Alle Typen' : lang === 'FR' ? 'Tous les types' : lang === 'IT' ? 'Tutti i tipi' : 'All types'}</option>
          <option value="pass">{lang === 'DE' ? 'Pässe' : lang === 'FR' ? 'Cols' : lang === 'IT' ? 'Passi' : 'Passes'}</option>
          <option value="road">{lang === 'DE' ? 'Strassen' : lang === 'FR' ? 'Routes' : lang === 'IT' ? 'Strade' : 'Roads'}</option>
          <option value="transit">{lang === 'DE' ? 'Transit' : lang === 'FR' ? 'Transit' : lang === 'IT' ? 'Transito' : 'Transit'}</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
          />
          &nbsp;{lang === 'DE' ? 'Nur Favoriten' : lang === 'FR' ? 'Favoris seulement' : lang === 'IT' ? 'Solo preferiti' : 'Only favorites'}
        </label>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((pass) => (
          <li
            key={pass.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 16,
              marginBottom: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{pass.name}</h3>
              <span
                style={{ cursor: 'pointer', fontSize: 20 }}
                onClick={() => toggleFavorite(pass.id)}
              >
                {favorites.includes(pass.id) ? '⭐' : '☆'}
              </span>
            </div>
            <div><strong>{lang === 'DE' ? 'Land' : lang === 'FR' ? 'Pays' : lang === 'IT' ? 'Paese' : 'Country'}:</strong> {Array.isArray(pass.countries) ? pass.countries.join(', ') : String(pass.countries || '')}</div>
            <div><strong>{lang === 'DE' ? 'Kanton' : lang === 'FR' ? 'Canton' : lang === 'IT' ? 'Cantone' : 'Canton'}:</strong> {pass.canton}</div>
            <div>
              <strong>Status:</strong> <span style={{ color: getStatusColor(pass.status) }}>{
  pass.status === 'open' ? (lang === 'DE' ? 'Offen' : lang === 'FR' ? 'Ouvert' : lang === 'IT' ? 'Aperto' : 'Open') :
  pass.status === 'closed' ? (lang === 'DE' ? 'Geschlossen' : lang === 'FR' ? 'Fermé' : lang === 'IT' ? 'Chiuso' : 'Closed') :
  lang === 'DE' ? 'Unbekannt' : lang === 'FR' ? 'Inconnu' : lang === 'IT' ? 'Sconosciuto' : 'Unknown'
}</span>
            </div>
            <div><strong>{lang === 'DE' ? 'Länge' : lang === 'FR' ? 'Longueur' : lang === 'IT' ? 'Lunghezza' : 'Length'}:</strong> {pass.length} km</div>
            <div><strong>{lang === 'DE' ? 'Höhe' : lang === 'FR' ? 'Altitude' : lang === 'IT' ? 'Altitudine' : 'Height'}:</strong> {pass.height} m</div>
            <div><strong>{lang === 'DE' ? 'Beschreibung' : lang === 'FR' ? 'Description' : lang === 'IT' ? 'Descrizione' : 'Description'}:</strong> {lang === 'DE' ? pass.description_de : lang === 'FR' ? pass.description_fr : lang === 'IT' ? pass.description_it : pass.description_en || '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
