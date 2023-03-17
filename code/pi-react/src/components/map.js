import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';


const MeditrakkerMap = ({ center_lat, center_lon, zoom }) => {

    const [map, setMap] = useState(null); 
    const [pinRouteGeojson, setPinRouteGeojson] = useState(null);

    useEffect(() => { 
        const fetchPinRouteGeojson = async (map) => {
            const [pinRouteGeojson] = await Promise.all([
                fetch('https://docs.mapbox.com/mapbox-gl-js/assets/route-pin.geojson')
                .then(response => response.json()),
                map.once('style.load') // is this correct?
            ]);
        };
        setPinRouteGeojson(pinRouteGeojson);
        
        
        fetchPinRouteGeojson(map);

    }, [pinRouteGeojson]); // is the pinRouteGeojson correct here?


    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';
        const map = new mapboxgl.Map({
            container: 'map',
            zoom: zoom,
            center: [center_lon, center_lat],
            pitch: 76,
            bearing: 150,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            hash: false
        });

        map.on('load', () => {
            // Add terrain source, with slight exaggeration
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        
            map.addSource('line', {
                'type': 'geojson',
                lineMetrics: true, // line metrics are required for the line-progress property
                'data': pinRouteGeojson
            });
        });



        setMap(map);
    }, [center_lat, center_lon, pinRouteGeojson, zoom]);

    


    return (
        <div id="map">The map is loading...</div>
    );
};

export default MeditrakkerMap;