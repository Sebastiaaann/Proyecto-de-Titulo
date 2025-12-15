import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

interface AddressAutocompleteProps {
    label: string;
    value: string;
    onChange: (value: string, coords?: [number, number]) => void;
    placeholder?: string;
    error?: string;
}

// Mock Database of Chilean Logistics Hubs
const MOCK_LOCATIONS = [
    { name: 'Santiago Centro', coords: [-33.4489, -70.6693] },
    { name: 'Santiago, Pudahuel (Aeropuerto)', coords: [-33.3930, -70.7858] },
    { name: 'Santiago, Quilicura (Industrial)', coords: [-33.3667, -70.7333] },
    { name: 'Valparaíso Puerto', coords: [-33.0472, -71.6127] },
    { name: 'San Antonio Puerto', coords: [-33.5933, -71.6128] },
    { name: 'Concepción', coords: [-36.8201, -73.0444] },
    { name: 'Talcahuano Puerto', coords: [-36.7167, -73.1167] },
    { name: 'Antofagasta', coords: [-23.6500, -70.4000] },
    { name: 'Calama', coords: [-22.4544, -68.9292] },
    { name: 'Puerto Montt', coords: [-41.4693, -72.9424] },
    { name: 'Arica', coords: [-18.4783, -70.3126] },
    { name: 'Iquique', coords: [-20.2307, -70.1357] },
    { name: 'La Serena', coords: [-29.9027, -71.2520] },
    { name: 'Coquimbo', coords: [-29.9533, -71.3436] },
    { name: 'Rancagua', coords: [-34.1708, -70.7444] },
    { name: 'Talca', coords: [-35.4264, -71.6554] },
    { name: 'Temuco', coords: [-38.7359, -72.5904] },
    { name: 'Osorno', coords: [-40.5739, -73.1335] },
    { name: 'Punta Arenas', coords: [-53.1638, -70.9171] },
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ label, value, onChange, placeholder, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [filtered, setFiltered] = useState<any[]>(MOCK_LOCATIONS);
    const [isLoading, setIsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Request geolocation on component mount
    useEffect(() => {
        const requestLocation = async () => {
            if ('geolocation' in navigator) {
                try {
                    const permission = await navigator.permissions.query({ name: 'geolocation' });
                    setLocationPermission(permission.state);
                    
                    if (permission.state === 'granted') {
                        getCurrentLocation();
                    }
                    
                    // Listen for permission changes
                    permission.addEventListener('change', () => {
                        setLocationPermission(permission.state);
                        if (permission.state === 'granted') {
                            getCurrentLocation();
                        }
                    });
                } catch (error) {
                    console.log('Geolocation permission API not supported');
                }
            }
        };
        
        requestLocation();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(coords);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationPermission('denied');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        }
    };

    const requestLocationPermission = () => {
        getCurrentLocation();
    };

    const searchNominatim = async (searchText: string) => {
        if (!searchText || searchText.length < 3) return;
        
        setIsLoading(true);
        try {
            // Build URL with optional viewbox (prioritizes nearby results if GPS available)
            let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=cl&addressdetails=1&limit=10&accept-language=es`;
            
            // If user location available, add viewbox to prioritize nearby results
            if (userLocation) {
                const [lat, lon] = userLocation;
                const radius = 0.1; // ~11km radius
                const viewbox = `${lon - radius},${lat + radius},${lon + radius},${lat - radius}`;
                url += `&viewbox=${viewbox}&bounded=0`; // bounded=0 allows results outside but prioritizes inside
            }
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FleetTech Logistics App'
                }
            });
            const data = await response.json();
            
            const formattedResults = data.map((item: any) => {
                // Extract detailed address components
                const address = item.address || {};
                const road = address.road || address.street || '';
                const houseNumber = address.house_number || '';
                const neighbourhood = address.neighbourhood || address.suburb || '';
                const city = address.city || address.town || address.village || address.municipality || '';
                const region = address.state || address.region || '';
                
                // Build formatted address like Uber (Calle Número, Barrio, Ciudad)
                let formattedName = '';
                if (road) {
                    formattedName = `${road}${houseNumber ? ' ' + houseNumber : ''}`;
                    if (neighbourhood) formattedName += `, ${neighbourhood}`;
                    if (city) formattedName += `, ${city}`;
                } else {
                    formattedName = item.display_name;
                }
                
                return {
                    name: formattedName,
                    fullAddress: item.display_name, // Dirección completa como fallback
                    coords: [parseFloat(item.lat), parseFloat(item.lon)],
                    type: item.type, // e.g., 'residential', 'commercial', 'building'
                    addressDetails: {
                        street: road,
                        number: houseNumber,
                        neighbourhood: neighbourhood,
                        city: city,
                        region: region
                    }
                };
            });

            // Only show API results (more precise than mock data)
            setFiltered(formattedResults);
            setIsOpen(true);
        } catch (error) {
            console.error("Error searching address:", error);
            // Fallback to mock locations if API fails
            const mockMatches = MOCK_LOCATIONS.filter(loc =>
                loc.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFiltered(mockMatches);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        onChange(text); // Update parent with raw text immediately

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (text.length >= 3) {
            // Reduced debounce to 300ms for faster response
            debounceRef.current = setTimeout(() => {
                searchNominatim(text);
            }, 300);
        } else {
            setFiltered([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (location: { name: string; coords: number[] }) => {
        setQuery(location.name);
        onChange(location.name, location.coords as [number, number]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                {locationPermission !== 'granted' && (
                    <button
                        onClick={requestLocationPermission}
                        className="flex items-center gap-1.5 px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg text-brand-400 text-xs font-semibold transition-all active:scale-95"
                        title="Activar GPS para mejores sugerencias"
                    >
                        <MapPin className="w-3 h-3" />
                        <span>Activar GPS</span>
                    </button>
                )}
                {userLocation && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                        <MapPin className="w-3 h-3" />
                        GPS Activo
                    </span>
                )}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    className={`w-full bg-dark-900 border rounded-xl px-4 py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-500 ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                    placeholder={placeholder || "Ej: Av. Libertador 1234, Santiago"}
                    autoComplete="off"
                />
                <div className="absolute left-3 top-3 w-5 h-5 flex items-center justify-center">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                    )}
                </div>
            </div>

            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

            {isOpen && (filtered.length > 0 || userLocation) && (
                <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar">
                    {/* Current Location Option */}
                    {userLocation && query.length === 0 && (
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    // Reverse geocode current location
                                    const [lat, lon] = userLocation;
                                    const response = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=es`,
                                        { headers: { 'User-Agent': 'FleetTech Logistics App' } }
                                    );
                                    const data = await response.json();
                                    const address = data.address || {};
                                    const road = address.road || '';
                                    const houseNumber = address.house_number || '';
                                    const neighbourhood = address.neighbourhood || address.suburb || '';
                                    const city = address.city || address.town || '';
                                    
                                    let formattedAddress = '';
                                    if (road) {
                                        formattedAddress = `${road}${houseNumber ? ' ' + houseNumber : ''}`;
                                        if (neighbourhood) formattedAddress += `, ${neighbourhood}`;
                                        if (city) formattedAddress += `, ${city}`;
                                    } else {
                                        formattedAddress = data.display_name;
                                    }
                                    
                                    setQuery(formattedAddress);
                                    onChange(formattedAddress, userLocation);
                                    setIsOpen(false);
                                } catch (error) {
                                    console.error('Error reverse geocoding:', error);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-brand-500/10 flex items-start gap-3 transition-colors border-b border-brand-500/20 group bg-brand-500/5"
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-500/30 transition-colors">
                                <MapPin className="w-5 h-5 text-brand-400 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-brand-400 font-bold mb-1">📍 Mi ubicación actual</p>
                                <p className="text-xs text-slate-400">Usar GPS para detectar dirección</p>
                            </div>
                        </button>
                    )}
                    
                    {filtered.map((loc, idx) => {
                        // Calculate distance from user location if available
                        let distance = null;
                        if (userLocation && loc.coords) {
                            const [lat1, lon1] = userLocation;
                            const [lat2, lon2] = loc.coords;
                            const R = 6371; // Earth radius in km
                            const dLat = (lat2 - lat1) * Math.PI / 180;
                            const dLon = (lon2 - lon1) * Math.PI / 180;
                            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            distance = R * c;
                        }
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(loc)}
                                className="w-full text-left px-4 py-3 hover:bg-brand-500/10 flex items-start gap-3 transition-colors border-b border-white/5 last:border-0 group"
                            >
                                <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-500/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-brand-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-semibold leading-snug mb-1 truncate">{loc.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                                        {loc.addressDetails?.city && (
                                            <span className="px-2 py-0.5 bg-white/5 rounded">
                                                📍 {loc.addressDetails.city}
                                            </span>
                                        )}
                                        {loc.type && (
                                            <span className="text-slate-500 capitalize">{loc.type}</span>
                                        )}
                                        {distance !== null && (
                                            <span className="text-green-400 font-semibold">
                                                🚗 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
