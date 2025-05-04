
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPassEditor() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [imported, setImported] = useState([]);

  useEffect(() => {
    const session = sessionStorage.getItem("adminAuth");
    const expiry = sessionStorage.getItem("adminAuthExpiry");
    if (session === "true" && expiry && Date.now() < parseInt(expiry)) {
      setAuth(true);
    } else {
      router.push("/admin");
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const fetchPasses = async () => {
      const { data } = await supabase.from('passes').select('*');
      if (data) setPasses(data);
    };
    fetchPasses();
  }, [auth]);

  const filteredPasses = passes
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === 'all' || p.type === typeFilter)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (p) => {
    setSelected(p.id);
    setFormData(p);
    setIsNew(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (isNew) {
      const newData = { ...formData, id: crypto.randomUUID() };
      const { error } = await supabase.from('passes').insert(newData);
      if (!error) alert('✅ Neu gespeichert');
      else alert('❌ Fehler: ' + error.message);
    } else if (selected) {
      const { error } = await supabase.from('passes').update(formData).eq('id', selected);
      if (!error) alert('✅ Gespeichert');
      else alert('❌ Fehler: ' + error.message);
    }
    const { data } = await supabase.from('passes').select('*');
    if (data) setPasses(data);
  };

  const flattenPass = (parsed) => {
    return {
      ...parsed,
      description_de: parsed.description?.DE || '',
      description_en: parsed.description?.EN || '',
      description_it: parsed.description?.IT || '',
      description_fr: parsed.description?.FR || '',
      marker_lat: parsed.marker?.[0] || '',
      marker_lng: parsed.marker?.[1] || '',
    };
  };

  if (!auth) return null;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 280, borderRight: '1px solid #ccc', padding: 12 }}>
        <button
          style={{ width: '100%', marginBottom: 8 }}
          onClick={() => {
            const names = filteredPasses.map(p => p.name).join("\n");
            navigator.clipboard.writeText(names).then(() => {
              alert('📋 Liste kopiert');
            });
          }}
        >
          📋 Liste kopieren
        </button>
        <button
          style={{ width: '100%', marginBottom: 8 }}
          onClick={() => {
            setFormData({});
            setSelected(null);
            setIsNew(true);
            setImported([]);
          }}
        >
          ➕ Neu
        </button>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Suche..."
          style={{ width: '100%', marginBottom: 8 }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        >
          <option value="all">Alle Typen</option>
          <option value="pass">Pass</option>
          <option value="road">Strasse</option>
          <option value="transit">Transit</option>
        </select>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredPasses.map(p => (
            <li key={p.id}>
              <button
                style={{
                  width: '100%',
                  marginBottom: 4,
                  background: selected === p.id ? '#4a90e2' : '#eee',
                  border: 'none',
                  padding: 6,
                  textAlign: 'left'
                }}
                onClick={() => handleSelect(p)}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, display: 'flex', padding: 20, gap: 20, overflowY: 'auto' }}>
        {(selected || isNew) && (
          <div style={{ flex: 1, maxWidth: 600 }}>
            <h2>ID: {formData.id || '(neu)'}<br />{formData.name || 'Neuer Eintrag'}</h2>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button onClick={handleSave}>💾 Speichern</button>
              {!isNew && (
                <button onClick={async () => {
                  if (!selected) return alert("❌ Kein Pass ausgewählt.");
                  if (!confirm("Wirklich löschen?")) return;
                  try {
                    const deleted = { ...formData };
                    const { error } = await supabase.from('passes').delete().eq('id', selected);
                    if (error) throw error;
                    if (confirm('⏪ Wiederherstellen?')) {
                      const { error: restoreError } = await supabase.from('passes').insert(deleted);
                      if (restoreError) throw restoreError;
                      alert('🔁 Wiederhergestellt');
                    } else {
                      alert('❌ Pass gelöscht.');
                    }
                    setSelected(null);
                    setFormData({});
                    const { data } = await supabase.from('passes').select('*');
                    if (data) setPasses(data);
                  } catch (err) {
                    alert('Fehler beim Löschen: ' + err.message);
                  }
                }}>🗑️ Löschen</button>
              )}
            </div>

            {[
              'name','status','canton','countries','opens','closes','length','height','marker_lat','marker_lng','coords','level','spezialbeschreibung','region','datum_open','datum_close','type'
            ].map((field) => (
              <input
                key={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                placeholder={field}
                style={{ width: '100%', marginBottom: 8 }}
              />
            ))}

            {["description_de", "description_en", "description_it", "description_fr"].map((lang) => (
              <textarea
                key={lang}
                name={lang}
                value={formData[lang] || ''}
                onChange={handleChange}
                placeholder={`Beschreibung (${lang.split('_')[1].toUpperCase()})`}
                style={{ width: '100%', height: 60, marginBottom: 8 }}
              />
            ))}

            <label>
              <input
                type="checkbox"
                name="hidden"
                checked={!!formData.hidden}
                onChange={handleChange}
              /> Versteckt
            </label>
          </div>
        )}

        {isNew && (
          <div style={{ flex: 1 }}>
            <h3>Mehrere Pässe einfügen (JSON Array)</h3>
            <textarea
              placeholder='[{"name": "..."}, {"name": "..."}]'
              onBlur={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  const list = Array.isArray(parsed) ? parsed : [parsed];
                  const flatted = list.map(flattenPass);
                  setImported(flatted);
                } catch (err) {
                  alert('❌ JSON ungültig: ' + err.message);
                }
              }}
              style={{ width: '100%', height: 250, fontFamily: 'monospace', marginBottom: 12 }}
            />
            {imported.length > 0 && (
              <div>
                <h4>Importierte Pässe</h4>
                {imported.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setFormData(p)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}
                  >
                    {p.name || `Eintrag ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
