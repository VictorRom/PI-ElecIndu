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
            setPinRouteGeojson(pinRouteGeojson);
        };

        if (map){
            fetchPinRouteGeojson(map);
        }
    }, [map]); 

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoidnJwbHMiLCJhIjoiY2wxd29ocWR1MDduZDNicDgzOGhkMWczaCJ9.y40lsszh2YysSIHUeWaOgA';
        
        if (!map){

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
            
                if (pinRouteGeojson){
                    const pinRoute = pinRouteGeojson.features[0].geometry.coordinates;
                    console.log(pinRoute);
                    // Create the marker and popup that will display the elevation queries
                    const popup = new mapboxgl.Popup({ closeButton: false});
                    const marker = new mapboxgl.Marker({ 
                        color: 'red',
                        scale: 0.8,
                        draggable: false,
                        pitchAlignment: 'auto',
                        rotationAlignment: 'auto' 
                    })
                    .setLngLat(pinRoute[0])
                    .setPopup(popup)
                    .addTo(map)
                    .togglePopup();
                    
                    // Add a line feature and layer. This feature will get updated as we progress the animation
                    map.addSource('line', {
                        type: 'geojson',
                        lineMetrics: true, // line metrics are required for the line-progress property
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

                    map.once('idle');
                    // The total animation duration, in milliseconds
                    const animationDuration = 20000;
                    // Use the https://turfjs.org/ library to calculate line distances and
                    // sample the line at a given percentage with the turf.along function.
                    const path = turf.lineString(pinRoute);
                    // Get the total line distance
                    const pathDistance = turf.lineDistance(path);
                    let start;
                    function frame(time){
                        if(!start) start = time;
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
                    } // end of frame()
                    window.requestAnimationFrame(frame);
                } // end of if (pinRouteGeojson)
            });
        } // end of if (!map)
        setMap(map);
    }, [center_lat, center_lon, pinRouteGeojson, zoom, map]);

    
    return (
        // <div id="map">The map is loading...</div>
        <div id="map" /*style={{ width: '100%', height: '100%' }}*/ />
    );
};

export default MeditrakkerMap;