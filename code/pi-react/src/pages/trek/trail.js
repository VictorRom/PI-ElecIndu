import React from 'react';
import { useState, useEffect } from 'react';
import Map from '../../components/map/map';
import DataForm from '../../components/DataForm';
import axios from 'axios';
import LineChart from '../../components/lineChart';

const TrailGroupInfo = () => {

    const convertDate = (date) => {
        const dateObj = new Date(date);

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [global_stats, setGlobalStats] = useState({
        distance: 0,
        speed: 0,
        elevation: 0
    });
    const [data, setData] = useState(null);
    const [proto, setProto] = useState("1");
    const [stats, setStats] = useState({
        avg_speed: 3,
        distance: 10,
        total_time: 3.3
    });
    const [segements, setSegements] = useState({
        best: {
            distance: 0,
            elevation: 0,
            speed: 0,
        },
        worst: {
            distance: 0,
            elevation: 0,
            speed: 0,
        },
    });

    const [formData, setFormData] = useState({
        fromDate: convertDate(today.toISOString()),
        toDate: convertDate(tomorrow.toISOString()),
        connectEmpty: false,
    });

    const fetchData = async (proto, formData) => {
        axios.get(`http://localhost:5050/trail/dts=${formData.fromDate}&dte=${formData.toDate}&proto=${proto}`)
            .then((response) => {
                const data = response.data[0];
                //console.log("data found :");
                //console.log(data);
                if (data.points.length === 0) {
                    //console.log("No data found");
                    setData(null);
                } else {
                    setData(data);
                    setGlobalStats(data.global_stats);
                    setStats(getStatistics(data.statistics));
                    setSegements(getSegments(data.segments));
                }
            }).catch(error => {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData(proto, formData);
    }
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: val
        });
    }

    const getRoute = (data) => {
        let geojson = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: data.points
                },
            }]
        };
        return geojson;
    }

    const getElevations = () => {
        if (data === null) {
            return [[{ x: 0, y: 0 }]];
        }
        let elevations = [];
        for (let i = 0; i < data.elevations.length; i++) {
            elevations.push({ x: data.timestamps[i], y: data.elevations[i] });
        }
        return [elevations];
    }

    const getStatistics = (data) => {
        return {
            avg_speed: data.avg_speed.toFixed(2),
            distance: data.distance.toFixed(2),
            total_time: (data.total_time / 3600).toFixed(2)
        }
    }

    const getSegments = (data) => {
        return {
            best: {
                distance: data.best.distance.toFixed(0),
                elevation: data.best.elevation.toFixed(0),
                speed: data.best.speed.toFixed(0),
            },
            worst: {
                distance: data.worst.distance.toFixed(0),
                elevation: data.worst.elevation.toFixed(0),
                speed: data.worst.speed.toFixed(0),
            },
        }
    }

    useEffect(() => {
        if (formData.fromDate !== "" && formData.toDate !== "") {
            fetchData(proto, formData);
        }
    }, [proto]);

    return (
        <div className="flex" style={{ height: "90vh" }}>
            <div className="w-1/3 h-full p-2 mx-2">
                <DataForm name="Select data" buttonName="Select" dates={formData} handleChange={handleChange} handleSubmit={handleSubmit} />

                <div className="flex h-1/8 items-center mt-2 my-1">
                    <div className="w-full border-2 shadow rounded-md">
                        <div className="flex m-2 border-b-2 justify-center font-medium">
                            <p className="w-2/3">Trail informations</p>
                            <p className="w-1/3">Best segment</p>
                            <p className="w-1/3">Worst segment</p>
                        </div>
                        <div className="flex m-1">
                            <div className="w-1/4 flex flex-col">
                                <label className="text-left m-1">Distance:</label>
                                <label className="text-left m-1">Average speed:</label>
                                <label className="text-left m-1">Total time:</label>
                            </div>
                            <div className="w-1/5 flex flex-col border-r-2 border-gray-400">
                                <span className='my-1'>{stats.distance} km</span>
                                <span className='my-1'>{stats.avg_speed} km/h</span>
                                <span className='my-1'>{stats.total_time} hours</span>
                            </div>
                            <div className="w-1/4 flex flex-col items-center">
                                <div className="flex items-center mb-2">
                                    <span>{segements.best.distance}%</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span>{segements.best.speed}%</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span>{segements.best.elevation}%</span>
                                </div>
                            </div>
                            <div className="w-1/4 flex flex-col items-center">
                                <div className="flex items-center mb-2">
                                    <span>{segements.worst.distance}%</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span>{segements.worst.speed}%</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span>{segements.worst.elevation}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full border-2 shadow rounded-md my-1">
                    <div className="flex m-1 border-b-2">
                        <p className="font-medium">General statistics</p>
                    </div>
                    <div className="flex flex-wrap m-2 justify-center">
                        <div className="w-1/3 flex">
                            <p className="w-1/2">Distance</p>
                            <p className="w-1/2">{global_stats.distance}</p>
                        </div>
                        <div className="w-1/3 flex">
                            <p className="w-1/2">Speed</p>
                            <p className="w-1/2">{global_stats.speed}</p>
                        </div>
                        <div className="w-1/3 flex">
                            <p className="w-1/2">Elevation</p>
                            <p className="w-1/2">{global_stats.elevation}</p>

                        </div>
                    </div>
                </div>
                <div className="w-full h-4/6 border-2 shadow rounded-md p-4">
                    <LineChart data={getElevations()} lineNames={["Elevation"]} />
                </div>
            </div>
            <div className="w-2/3 m-2 h-full">
                {data && (
                    <Map routePoints={getRoute(data)} />
                )}
                {!data && (
                    <p> Waiting for dates selection </p>
                )}
            </div>

        </div>
    );
}

export default TrailGroupInfo;