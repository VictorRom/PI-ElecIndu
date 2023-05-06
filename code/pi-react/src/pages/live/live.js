import React from "react";
import { useState, useEffect } from "react";
import { getWeatherData } from "../../services/weatherService";
import RangeSlider from "../../components/slider";
import Map from "../../components/map/map";

const Live = () => {
    const [weatherData, setWeatherData] = useState({});

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
        <div>
            <div className="flex">
                <div className="w-full border border-gray-400 p-4 mx-2 my-2 flex">
                    <span>Time since last sensor connection : </span>
                    <span className="text-red-500 ml-2">48min 12s</span>
                </div>
            </div>
            <div className="flex">
                <div className="w-3/4 border border-gray-400 p-4 mx-2 my-2">
                    {/* import the map here */}
                    <Map />
                </div>
                <div className="w-1/4 border border-gray-400 p-4 mx-2 my-2">
                    {/* display meteo info here */}
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
            <div className="flex m-4">
                {/* display the slider here */}
                <RangeSlider />
            </div>
        </div>
    );
};

export default Live;