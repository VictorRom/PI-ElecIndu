import React from 'react';
import { useState } from 'react';
import Map from '../../components/map/map';
import LineChart from '../../components/lineChart';

const TrailGroupInfo = () => {
    // Implement useEffect -> voir dans [] en bas de useEffect qui va reload le tout dès que ça change
    const page_props = {
        infos: {
            distance: 0,
            time: 0,
            speed: 0,
        },
        improvements: {
            distance: 0,
            time: 0,
            speed: 0,
        },
    }

    const data1 = [
        [{ x: '2020-01-01 12:00:00', y: 500 },
        { x: '2020-01-02 12:10:00', y: 500 },
        { x: '2020-01-03 12:20:00', y: 520 },
        { x: '2020-01-03 12:30:00', y: 550 },
        { x: '2020-01-03 12:40:00', y: 550 },
        { x: '2020-01-03 12:50:00', y: 580 },
        { x: '2020-01-01 13:00:00', y: 610 },
        { x: '2020-01-02 13:10:00', y: 670 },
        { x: '2020-01-03 13:20:00', y: 690 },
        { x: '2020-01-03 13:30:00', y: 710 },
        { x: '2020-01-03 13:40:00', y: 700 },
        { x: '2020-01-03 13:50:00', y: 1600 },]
    ];

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
        <div className="w-1/3 h-full p-2 mx-2">
            <div className="p-3 h-1/8 flex flex-wrap items-center border-2 shadow rounded-md">
                <form onSubmit={handleSubmit} className="flex flex-wrap w-full">
                    <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                        <label className="mr-4">From</label>
                        <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full" name="fromDate" value={formData.fromDate} onChange={handleChange} />
                    </div>
                    <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                        <label className="mr-2 ml-2">to</label>
                        <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full flex-grow" name="toDate" value={formData.toDate} onChange={handleChange} />
                    </div>
                    {/* <div className="items-center mb-2 mt-4 lg:mt-0">
                        <input type="checkbox" className="mr-2" name="connectEmpty" value={formData.connectEmpty} onChange={handleChange} />
                        <label>Connect empty</label>
                    </div> */}
                    <div className="flex justify-center w-full">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">Submit</button>
                    </div>
                </form>
            </div>
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
                            <span className='my-1'>{page_props.infos.distance} km</span>
                            <span className='my-1'>{page_props.infos.speed} km/h</span>
                            <span className='my-1'>{page_props.infos.time} hours</span>
                        </div>
                        <div className="w-1/4 flex flex-col items-center">
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.distance}%</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.speed}%</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.time}%</span>
                            </div>
                        </div>
                        <div className="w-1/4 flex flex-col items-center">
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.distance}%</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.speed}%</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span>{page_props.improvements.time}%</span>
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
                        <p className="w-1/2">0.0</p>
                    </div>
                    <div className="w-1/3 flex">
                        <p className="w-1/2">Speed</p>
                        <p className="w-1/2">0.0</p>
                    </div>
                    <div className="w-1/3 flex">
                        <p className="w-1/2">Elevation</p>
                        <p className="w-1/2">0.0</p>

                    </div>
                </div>
            </div>
            <div className="w-full h-4/6 border-2 shadow rounded-md p-4">
                <LineChart data={data1} lineNames={["Elevation"]}/>
            </div>
        </div>
        <div className="w-2/3 m-2 h-full">
            <Map />
        </div>
    
    </div>
    );
}

export default TrailGroupInfo;