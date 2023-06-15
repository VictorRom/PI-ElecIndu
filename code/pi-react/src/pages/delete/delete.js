import React from 'react';
import { useState, useEffect } from 'react';
import Map from '../../components/map/map';
import axios from 'axios';

const DeletePage = () => {
    const fetchData = async (proto) => {
        axios.get(
            `http://localhost:5050/trail/dts=${"2020-01-01T12:00:00"}&dte=${"2100-12-31T00:00:00"}&proto=${proto}`
        )
            .then((response) => {
                const data = response.data[0];
                if (data.timestamps.length === 0) {
                    console.log("No data found");
                } else {
                    setRoute(getRoute(data));
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

    const [proto, setProto] = useState("1");
    const [route, setRoute] = useState(null);

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

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const convertDate = (date) => {
        const dateObj = new Date(date);

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const [formData, setFormData] = useState({
        fromDate: convertDate(today.toISOString()),
        toDate: convertDate(tomorrow.toISOString()),
        connectEmpty: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.delete(
            `http://localhost:5050/gps/delete/dts=${formData.fromDate}&dte=${formData.toDate}&proto=${proto}`
        )
        fetchData(proto);
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: val
        });
    }

    useEffect(() => {
        fetchData(proto);
    }, [proto]);

    return (
        <div className="flex" style={{ height: "90vh" }}>
            <div className="w-1/3 h-full p-4 mx-2 my-2">
                <div className="p-3 h-1/6 flex flex-wrap items-center border-2 shadow rounded-md">
                    <form onSubmit={handleSubmit} className="flex flex-wrap w-full">
                        <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                            <label className="mr-4">From</label>
                            <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full" name="fromDate" value={formData.fromDate} onChange={handleChange} />
                        </div>
                        <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                            <label className="mr-2 ml-2">to</label>
                            <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full flex-grow" name="toDate" value={formData.toDate} onChange={handleChange} />
                        </div>
                        <div className="flex justify-center w-full">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded mt-4">Delete</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="w-2/3 m-2 h-full">
                {route && (
                    <Map routePoints={route} />
                )}
                {!route && (
                    <p> No data for this session </p>
                )}
            </div>
        </div>
    );
}

export default DeletePage;