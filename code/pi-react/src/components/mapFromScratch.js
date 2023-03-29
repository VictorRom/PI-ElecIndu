import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';

const FromScratchMap = ({ center_lat, center_lon, zooma }) => {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    // Uncaught Error: Invalid LngLat object: (NaN, NaN)
    // const [lng, setLng] = useState(center_lon);
    // const [lat, setLat] = useState(center_lat);
    // const [zoom, setZoom] = useState(zooma);
    const [lng, setLng] = useState(6.58968);
    const [lat, setLat] = useState(45.39701);
    const [zoom, setZoom] = useState(13);
    
    // Initialize map when component mounts
    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lng, lat],
        zoom: zoom,
        pitch: 76,
        bearing: 150,
        hash: false
        });

        map.current.on('load', () => {
            map.current.resize(); // la fonction est appelable mais ne fait rien -> obligé de redimensionner la fenetre pour qu'il se passe un bail
            map.current.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

            // map.current.addLayer({
            //     type: 'line',
            //     source: 'line',
            //     id: 'line',
            //     paint: {
            //         'line-color': 'rgba(0,0,0,0)',
            //         'line-width': 5
            //     },
            //     layout: {
            //         'line-cap': 'round',
            //         'line-join': 'round'
            //     }
            // });

            map.current.once('idle')

        });

    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    

    return (
        <div>
            <div className="sidebarStyle">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div className="map-container" ref={mapContainerRef} />
        </div>
    );
}

export default FromScratchMap;