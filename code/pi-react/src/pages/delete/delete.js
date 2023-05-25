import React from 'react';
import { useState } from 'react';
import Map from '../../components/map/map';

const DeletePage = () => {
    // Implement useEffect -> voir dans [] en bas de useEffect qui va reload le tout dès que ça change
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [formData, setFormData] = useState({
        fromDate: today.toISOString(),
        toDate: tomorrow.toISOString(),
        connectEmpty: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // submit the formData to the server
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: val
        });
    }

    return (
    <div className="flex" style={{height: "90vh"}}>
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
            <Map />
        </div>
    
    </div>
    );
}

export default DeletePage;