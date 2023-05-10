import React from "react";
import { useState, useEffect } from "react";
import { getWeatherData } from "../../services/weatherService";
import Map from "../../components/map/map";
import DropdownComponent from "../../components/dropdown";

const Live = () => {
    const [weatherData, setWeatherData] = useState({});
    const [selectedPrototype, setSelectedPrototype] = useState("");

    const handlePrototypeChange = (newOption) => {
        setSelectedPrototype(newOption);
        // Faire des actions spécifiques pour le dropdown 1 ici
    };

    const optionsPrototype = [
        { label: "1h", value: "1h" },
        { label: "12h", value: "12h" },
        { label: "24h", value: "24h" },
    ];


    useEffect(() => {
        const fetchData = async () => {
            const data = await getWeatherData(45.832622, 6.865175);
            // console.log(data)

            // Check that the return doesn't look like this : {"reason":"Value of type 'Float' required for key 'longitude'.","error":true}
            if (data.error) {
                console.log("Error while fetching weather data");
                return;
            }

            setWeatherData(data);
        };
        fetchData();
    }, []);

    return (
        <div className="page">
            <div className="w-full border border-gray-400 mx-2 my-2 flex" style={{height: "6vh"}}>
                <div className="p-4 w-1/2 text-center">
                    <span>Time since last sensor connection : </span>
                    <span className="text-red-500 ml-2">48min 12s</span>
                </div>
                <div className="p-1 w-1/2 flex justify-center items-center">
                    <span>Choose the number of hours to display : </span>                    
                    <div className="ml-2 w-1/2">
                        <DropdownComponent options={optionsPrototype} onChange={handlePrototypeChange} />
                    </div>
                </div>
            </div>
            <div className="flex" style={{height: "84vh"}}>
                <div className="w-3/4 border border-gray-400 p-4 mx-2 my-2">
                        <Map />
                </div>
                <div className="w-1/4 border border-gray-400 p-4 mx-2 my-2">
                    <h2 className="text-center text-2xl">Weather Info</h2>
                    
                    {weatherData && weatherData.current_weather && (
                        <div>
                            <p>Temperature: {weatherData.current_weather.temperature}  °C</p>
                            <p>Wind Speed: {weatherData.current_weather.windspeed}  km/h</p>
                        </div>
                    )}
                    
                    {!weatherData && !weatherData.current_weather (
                        <p>Error while fetching weather data, abort</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Live;