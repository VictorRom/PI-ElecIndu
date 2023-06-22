import React from 'react';
import { useState, useEffect } from 'react';
import Map from '../../components/map/map';
import DataForm from '../../components/DataForm';
import axios from 'axios';

const DeletePage = ({proto}) => {
    const fetchData = async (proto, formData) => {
        axios.get(`http://localhost:5050/trail/dts=${formData.fromDate}&dte=${formData.toDate}&proto=${proto}`)
            .then((response) => {
                const data = response.data[0];
                if (data.message === "No data found" || data.timestamps.length === 0) {
                    console.log("No data found");
                    setRoute(null);
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
        fetchData(proto, formData);
    }

    const handleDelete = (e) => {
        console.log('Delete');
        axios.delete(
            `http://localhost:5050/gps/delete/dts=${formData.fromDate}&dte=${formData.toDate}&proto=${proto}`
        )
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

    useEffect(() => {
        if (formData.fromDate !== "" && formData.toDate !== "") {
            fetchData(proto, formData);
        }
    }, [proto]);

    return (
        <div className="flex" style={{ height: "90vh" }}>
            <div className="w-1/3 h-full p-4 mx-2 my-2">
                <DataForm name="Select data" buttonName="Select" dates={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
                <div className="p-3 h-1/8 flex flex-wrap items-center border-2 shadow rounded-md">
                    <div className="flex justify-center w-full">
                        <button type="submit" className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded" onClick={handleDelete}>DELETE SELECTION</button>
                    </div>
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