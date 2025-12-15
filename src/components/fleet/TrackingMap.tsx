import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const truckIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13, { duration: 2 });
    }, [center, map]);
    return null;
};

interface Truck {
    id: string;
    location: string;
    coords: [number, number];
    status: string;
    destination: string;
    load: number;
    driver: string;
}

interface TrackingMapProps {
    activeTruck: Truck;
    trucks: Truck[];
    onTruckClick: (origin: string, dest: string, id: string) => void;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ activeTruck, trucks, onTruckClick }) => {
    return (
        <MapContainer
            center={activeTruck.coords}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapController center={activeTruck.coords} />

            {trucks.map(truck => (
                <Marker
                    key={truck.id}
                    position={truck.coords}
                    icon={truckIcon}
                    eventHandlers={{
                        click: () => onTruckClick(truck.location, truck.destination, truck.id),
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-2">
                            <h3 className="font-bold text-dark-900">{truck.id}</h3>
                            <p className="text-xs text-dark-800">{truck.driver}</p>
                            <p className="text-xs font-semibold mt-1">{truck.status}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default TrackingMap;
