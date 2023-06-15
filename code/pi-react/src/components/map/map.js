import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';

const Map = ({ routePoints }) => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [pinRouteGeojson, setPoints] = useState(routePoints);

    useEffect(() => {
        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: routePoints.features[0].geometry.coordinates[0],
            zoom: 13,
            pitch: 45, // effet 3d
            pitchWithRotate: true,
            bearing: 150,
            hash: true,
        });

        setMap(newMap);
        return () => newMap.remove();
    }, [routePoints]);

    useEffect(() => {
        if (map && routePoints) {
            setPoints(routePoints);
        }
    }, [map, routePoints]);

    useEffect(() => {
        if (pinRouteGeojson && map) {
            const pinRoute = pinRouteGeojson.features[0].geometry.coordinates;

            map.on('load', () => {
                if (pinRoute.length > 1 && map.getSource('line') === undefined) {
                    map.addSource('line', {
                        type: 'geojson',
                        // Line metrics is required to use the 'line-progress' property
                        lineMetrics: true,
                        data: pinRouteGeojson
                    });
                    map.addLayer({
                        type: 'line',
                        source: 'line',
                        id: 'line',
                        paint: {
                            'line-color': 'rgba(255,0,0,0)',
                            'line-width': 5
                        },
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        }
                    });
                    map.setPaintProperty('line', 'line-gradient', [
                        'step',
                        ['line-progress'],
                        'red',
                        1,
                        'rgba(255, 0, 0, 0)'
                    ]);
                    const rotation = 150 - 1 * 40.0;
                    map.setBearing(rotation % 360);
                }
            });
        }
    }, [map, pinRouteGeojson])

    return <div ref={mapContainer} className='h-full w-full' />;
};

export default Map;
