import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';

const FromScratchMap = ({ center_lat, center_lon, zooma }) => {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(6.58968);
    const [lat, setLat] = useState(45.39701);
    const [zoom, setZoom] = useState(13);

    // Initialize map when component mounts
    useEffect(() => {
        if (!map.current) // initialize map only once
        {
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                center: [lng, lat],
                zoom: zoom,
                pitch: 76, // effet 3d
                bearing: 150,
                hash: false
            });
        }
        else { // wait for map to initialize
            map.current.on('load', () => {
                map.current.resize(); // la fonction est appelable mais ne fait rien -> obligé de redimensionner la fenetre pour qu'il se passe un bail
                // check if source mapbox-dem already exists
                map.current.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.terrain-rgb',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

                map.current.addLayer({
                    id: 'terrain-data',
                    type: 'line',
                    source: {
                        type: 'vector',
                        url: 'mapbox://mapbox.mapbox-terrain-v2'
                    },
                    'source-layer': 'contour'
                });

                map.current.once('idle')
            });
        }
    },[lng, lat, zoom]);

    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    });

    /*
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('load', () => {
            map.current.resize(); // la fonction est appelable mais ne fait rien -> obligé de redimensionner la fenetre pour qu'il se passe un bail
            // check if source mapbox-dem already exists
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
    */


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