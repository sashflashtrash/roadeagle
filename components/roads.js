// components/roads.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function useRoads() {
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState([]);
  const [levelFilter, setLevelFilter] = useState([]);
  const [countryFilter, setCountryFilter] = useState([]);
  const [cantonFilter, setCantonFilter] = useState([]);
  const [regionFilter, setRegionFilter] = useState([]);
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
    if (p.hidden) return false;

    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter.length === 0 || typeFilter.includes(p.type);
    const matchesLevel = levelFilter.length === 0 || levelFilter.includes(p.level);
    const matchesCountry = countryFilter.length === 0 || countryFilter.includes(p.country);
    const matchesCanton = cantonFilter.length === 0 || cantonFilter.includes(p.canton);
    const matchesRegion = regionFilter.length === 0 || regionFilter.includes(p.region);
    const matchesFavorite = !showOnlyFavorites || favorites.includes(p.id);

    return matchesSearch && matchesStatus && matchesType && matchesLevel && matchesCountry && matchesCanton && matchesRegion && matchesFavorite;
  });

  return {
    filteredPasses: filtered,
    favorites,
    toggleFavorite,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    showOnlyFavorites,
    setShowOnlyFavorites,
    typeFilter,
    setTypeFilter,
    levelFilter,
    setLevelFilter,
    countryFilter,
    setCountryFilter,
    cantonFilter,
    setCantonFilter,
    regionFilter,
    setRegionFilter
  };


  
} 
