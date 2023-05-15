import React from "react";
import { useState, useEffect } from "react";
import { getWeatherData } from "../../services/weatherService";
import Map from "../../components/map/map";
import DropdownComponent from "../../components/dropdown";
import LineChart from "../../components/lineChart";

function formatData(xData, ...yData) {
    return yData.map((yValues) => {
      return xData.map((xValue, i) => {
        return {
          x: xValue,
          y: yValues[i]
        };
      });
    });
  }
  


const Live = () => {
    const [weatherData, setWeatherData] = useState({});
    const [selectedPrototype, setSelectedPrototype] = useState("");

    // store the weather data of the last 24 hours
    const [weatherData24h, setWeatherData24h] = useState([]);

    const handlePrototypeChange = (newOption) => {
        setSelectedPrototype(newOption);
        // Faire des actions spécifiques pour le dropdown 1 ici
    };

    const optionsPrototype = [
        { label: "1h", value: "1h" },
        { label: "12h", value: "12h" },
        { label: "24h", value: "24h" },
    ];

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

    // use the weatherData to create the weatherData24h
    useEffect(() => {
        if (weatherData.hourly) {
            // create array of array like this : [['2020-01-01 12:00:00', '2020-01-02 12:10:00'], [500, 500]]
            const dataX = weatherData.hourly.time;
            const temperature = weatherData.hourly.temperature_2m;
            // const humidity = weatherData.hourly.relativehumidity_2m;
            const windSpeed = weatherData.hourly.windspeed_10m;

            const combined = formatData(dataX, temperature, windSpeed); //, humidity);
            // console.log(combined);
            setWeatherData24h(combined);
        }else{
            console.log("Error while creating weatherData24h, weatherData.hourly is undefined");
        }
    }, [weatherData]);

    return (
        <div className="page">
            <div className="w-full mx-2 my-2 flex" style={{height: "6vh"}}>
                <div className="p-4 w-1/2 text-center shadow rounded-md">
                    <span>Time since last sensor connection : </span>
                    <span className="text-red-500 ml-2">48min 12s</span>
                </div>
                <div className="p-1 w-1/2 flex justify-center items-center shadow rounded-md ">
                    <span>Choose the number of hours to display : </span>                    
                    <div className="ml-2 w-1/2">
                        <DropdownComponent options={optionsPrototype} onChange={handlePrototypeChange} />
                    </div>
                </div>
            </div>
            <div className="flex" style={{height: "84vh"}}>
                <div className="w-3/4 m-2 rounded-md">
                        <Map />
                </div>
                <div className="w-1/4 shadow border-2 rounded-md p-4 mx-2 my-2 ">
                    <h1 className="text-center text-2xl font-medium border-b-2">Weather Info</h1>
                    
                    {weatherData && weatherData.current_weather && (
                        <div>
                            <div className="text-center m-4">
                                <p>Temperature: {weatherData.current_weather.temperature}  °C</p>
                                <p>Wind Speed: {weatherData.current_weather.windspeed}  km/h</p>
                            </div>
                                {weatherData24h && (
                                        <div className="w-full h-1/2 border-2 shadow rounded-md" style={{height: "66vh"}}>
                                            <LineChart data={weatherData24h} lineNames={["Temperature", "Humidity", "Wind Speed"]} />
                                        </div>
                                    )}
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