import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import * as turf from '@turf/turf';


mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';

const Map = () => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [pinRouteGeojson, setGeojson] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            axios.get(
                'https://docs.mapbox.com/mapbox-gl-js/assets/route-pin.geojson'
            ).then((response) => {
                const data = response.data;
                setGeojson(data);
            });
        };
        fetchData();
    }, []);

    useEffect(() => {
        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [6.58968, 45.39701],
            zoom: 13,
            pitch: 76, // effet 3d
            pitchWithRotate: true,
            bearing: 150,
            hash: false
        });
        newMap.on('style.load', () => {
            newMap.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            newMap.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        });
        setMap(newMap);
        return () => newMap.remove();
    }, []);

    useEffect(() => {
        if (pinRouteGeojson && map) {
            const pinRoute = pinRouteGeojson.features[0].geometry.coordinates;
            const popup = new mapboxgl.Popup({ closeButton: false });
            const marker = new mapboxgl.Marker({
                color: 'red',
                scale: 0.8,
                draggable: false,
                pitchAlignment: 'auto',
                rotationAlignment: 'auto'
            })
                .setLngLat(pinRoute[0])
                .setPopup(popup);

            map.on('load', () => {
                marker.addTo(map)
                    .togglePopup();

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
                            'line-color': 'rgba(0,0,0,0)',
                            'line-width': 5
                        },
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        }
                    });
                }
            });

            map.once('idle', () => {
                const animationDuration = 20000;
                // Use the https://turfjs.org/ library to calculate line distances and
                // sample the line at a given percentage with the turf.along function.
                const path = turf.lineString(pinRoute);
                // Get the total line distance
                const pathDistance = turf.lineDistance(path);
                let start;
                function frame(time) {
                    if (!start) start = time;
                    const animationPhase = (time - start) / animationDuration;
                    if (animationPhase > 1) {
                        return;
                    }

                    // Get the new latitude and longitude by sampling along the path
                    const alongPath = turf.along(path, pathDistance * animationPhase)
                        .geometry.coordinates;
                    const lngLat = {
                        lng: alongPath[0],
                        lat: alongPath[1]
                    };

                    // Sample the terrain elevation. We round to an integer value to
                    // prevent showing a lot of digits during the animation
                    const elevation = Math.floor(
                        // Do not use terrain exaggeration to get actual meter values
                        map.queryTerrainElevation(lngLat, { exaggerated: false })
                    );

                    // Update the popup altitude value and marker location
                    popup.setHTML('Altitude: ' + elevation + 'm<br/>');
                    marker.setLngLat(lngLat);

                    // Reduce the visible length of the line by using a line-gradient to cutoff the line
                    // animationPhase is a value between 0 and 1 that reprents the progress of the animation
                    map.setPaintProperty('line', 'line-gradient', [
                        'step',
                        ['line-progress'],
                        'red',
                        animationPhase,
                        'rgba(255, 0, 0, 0)'
                    ]);

                    // Rotate the camera at a slightly lower speed to give some parallax effect in the background
                    const rotation = 150 - animationPhase * 40.0;
                    map.setBearing(rotation % 360);

                    window.requestAnimationFrame(frame);
                }

                window.requestAnimationFrame(frame);
            })

            // Nettoyage du marqueur et du pop-up lorsque le composant est démonté
            return () => {
                marker.remove();
                popup.remove();
            };
        }
    }, [map, pinRouteGeojson])

    return <div ref={mapContainer} style={{ width: '100vw', height: '100vh' }} />;
};

export default Map;
