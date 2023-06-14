import React from "react";
import { useState, useEffect } from "react";
import { getWeatherData } from "../../services/weatherService";
import Map from "../../components/map/map";
import DropdownComponent from "../../components/dropdown";
import LineChart from "../../components/lineChart";
import { formatByHour } from "../../utils/dateUtils";
import axios from "axios";
import { set } from "date-fns";

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
    // create const variable for the height of the chart
    const chartHeight = "22vh";

    const [pinRouteGeojson, setGeojson] = useState(null);
    const [proto, setProto] = useState("1");

    useEffect(() => {
        const fetchData = async () => {
            axios.get(
                //'https://docs.mapbox.com/mapbox-gl-js/assets/route-pin.geojson'
                `http://localhost:5050/live/proto=${proto}`,
            ).then(response => {
                const data = response.data[0];
                console.log("data found :");
                console.log(data);
                if(data.points.length === 0) {
                    console.log("No data found");
                    setGeojson(null);
                }
                else {
                    let geojson = {
                        type: "FeatureCollection",
                        features: [{
                            type: "Feature",
                            geometry: {
                                    type: "LineString",
                                    coordinates: data.points
                            },
                            properties: {
                                name: "Trail",
                                elevation: data.distance,
                                time: data.time,
                                speed: data.speed
                            }
                        }]
                    };
                    setGeojson(geojson);
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
        fetchData();
    }, [proto]);

    useEffect(() => {
        console.log("pinRouteGeojson changed")
        console.log(pinRouteGeojson)
    }, [pinRouteGeojson]);

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

    // use the weatherData to create the weatherData24h
    useEffect(() => {
        if (weatherData.hourly) {
            // create array of array like this : [['2020-01-01 12:00:00', '2020-01-02 12:10:00'], [500, 500]]
            const dataX = weatherData.hourly.time;
            const temperature = weatherData.hourly.temperature_2m;
            const humidity = weatherData.hourly.relativehumidity_2m;
            const windSpeed = weatherData.hourly.windspeed_10m;

            // const combined = formatData(dataX, temperature, windSpeed); //, humidity);

            const combinedTemperature = formatData(dataX, temperature);
            const combinedWindSpeed = formatData(dataX, windSpeed);
            const combinedHumidity = formatData(dataX, humidity);

            // Create a dictionnary with the data set the name as temperature, humidity, windSpeed
            const data24h = {
                temperature: combinedTemperature,
                humidity: combinedHumidity,
                windspeed: combinedWindSpeed
            }

            // console.log(combined);
            // setWeatherData24h(combined);
            setWeatherData24h(data24h);
        }else{
            console.log("Error while creating weatherData24h, weatherData.hourly is undefined");
        }
    }, [weatherData]);

    return (
        <div className="page">
            <div className="w-full mx-2 my-2 flex" style={{ height: "6vh" }}>
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
            <div className="flex" style={{ height: "84vh" }}>
                <div className="w-3/4 m-2 rounded-md">
                    {pinRouteGeojson && (
                        <Map routePoints={pinRouteGeojson} />
                    )}
                    {!pinRouteGeojson && (
                        <p>No data on last period </p>
                    )}
                </div>
                <div className="w-1/4 shadow border-2 rounded-md p-4 mx-2 my-2 ">
                    <h1 className="text-center text-2xl font-medium border-b-2">Weather Info</h1>
                    {weatherData && weatherData.current_weather && (
                        <div>
                            <div className="text-center m-4">
                                <p>Temperature: {weatherData.current_weather.temperature}  °C</p>
                                <p>Wind Speed: {weatherData.current_weather.windspeed}  km/h</p>
                            </div>
                                {weatherData24h.temperature && (
                                        <div className="w-full h-1/2 border-2 shadow rounded-md" style={{height: chartHeight}}>
                                            {/* <LineChart data={weatherData24h} lineNames={["Temperature", "Humidity", "Wind Speed"]} /> */}
                                            <LineChart data={weatherData24h.temperature} lineNames={["Temperature"]} xAxisTickFormat={formatByHour} />
                                        </div>
                                    )}

                                {weatherData24h.windspeed && (
                                        <div className="w-full h-1/2 border-2 shadow rounded-md" style={{height: chartHeight}}>
                                            <LineChart data={weatherData24h.windspeed} lineNames={["Wind speed"]} xAxisTickFormat={formatByHour} />
                                        </div>
                                    )}

                                {weatherData24h.humidity && (
                                        <div className="w-full h-1/2 border-2 shadow rounded-md" style={{height: chartHeight}}>
                                            <LineChart data={weatherData24h.humidity} lineNames={["Humidity"]} xAxisTickFormat={formatByHour} />
                                        </div>
                                    )}
                        </div>
                    )}
                    {!weatherData && !weatherData.current_weather(
                        <p>Error while fetching weather data, abort</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Live;