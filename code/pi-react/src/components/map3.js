import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';

export default function Map3() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(6.58968);
    const [lat, setLat] = useState(45.39701);
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (!map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [lng, lat],
            zoom: zoom
        });

        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
            });
    });

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div className="map-container" ref={mapContainer} />
        </div>
    );
}
