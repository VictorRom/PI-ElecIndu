import React from "react";
import { useState, useEffect } from "react";
import { getWeatherData } from "../../services/weatherService";
import Map from "../../components/map/map";
import DropdownComponent from "../../components/dropdown";
import LineChart from "../../components/lineChart";
import { formatByHour } from "../../utils/dateUtils";
import axios from "axios";
//import { set } from "date-fns";

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
    const [period, setSelectedPeriod] = useState("");
    // store the weather data of the last 24 hours
    const [weatherData24h, setWeatherData24h] = useState([]);
    // create const variable for the height of the chart
    const chartHeight = "22vh";

    const [geojsonData, setGeojson] = useState(null);
    const [pinRouteGeojson, setRoute] = useState(null);
    const [proto, setProto] = useState("1");

    useEffect(() => {
        const fetchData = async () => {
            axios.get(
                `http://localhost:5050/live/proto=${proto}`,
            ).then(response => {
                const data = response.data[0];
                console.log("data found :");
                console.log(data);
                if (data.points.length === 0) {
                    //console.log("No data found");
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
                                name: "Live",
                                time: data.timestamps,
                                speed: data.speeds
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

    const getDataForPeriod = (data, period) => {
        //console.log(data.features[0].properties.time);
        const last_timestamp = new Date().getTime() - period * 60 * 60 * 1000;
        //console.log("last_timestamp : " + last_timestamp);
        const times = data.features[0].properties.time;
        let count = 0;
        for (let i = 0; i < times.length; i++) {
            if (new Date(times[i]) > last_timestamp) {
                count++;
            }
        }
        const toTake = times.length - count;
        console.log(data.features[0].geometry.coordinates.slice(-toTake))
        //console.log("count : " + count);
        let slicedData = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: data.features[0].geometry.coordinates.slice(-toTake)
                }
            }]
        };
        return slicedData;
    }

    useEffect(() => {
        if (geojsonData) {
            console.log("period changed to : " + period);
            const newRoute = getDataForPeriod(geojsonData, period)
            console.log("route : " + newRoute.features[0].geometry.coordinates.length);
            setRoute(newRoute);
        }
    }, [period, geojsonData]);

    const getFirstPosition = (data) => {
        return data.features[0].geometry.coordinates[0];
    }

    useEffect(() => {
        if (pinRouteGeojson) {
            const fetchData = async () => {
                const [lon, lat] = getFirstPosition(pinRouteGeojson);
                const data = await getWeatherData(lat, lon);
                // console.log(data)

                // Check that the return doesn't look like this : {"reason":"Value of type 'Float' required for key 'longitude'.","error":true}
                if (data.error) {
                    console.log("Error while fetching weather data");
                    return;
                }

                setWeatherData(data);
            };
            fetchData();
        }
    }, [pinRouteGeojson]);

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
        } else {
            console.log("Error while creating weatherData24h, weatherData.hourly is undefined");
        }
    }, [weatherData]);

    const handlePeriodChange = (newOption) => {
        setSelectedPeriod(newOption);
    };

    const optionsPeriod = [
        { label: "1h", value: 1 },
        { label: "12h", value: 12 },
        { label: "24h", value: 24 },
    ];

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
                        <DropdownComponent options={optionsPeriod} onChange={handlePeriodChange} />
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
                                <div className="w-full h-1/2 border-2 shadow rounded-md" style={{ height: chartHeight }}>
                                    {/* <LineChart data={weatherData24h} lineNames={["Temperature", "Humidity", "Wind Speed"]} /> */}
                                    <LineChart data={weatherData24h.temperature} lineNames={["Temperature"]} xAxisTickFormat={formatByHour} />
                                </div>
                            )}

                            {weatherData24h.windspeed && (
                                <div className="w-full h-1/2 border-2 shadow rounded-md" style={{ height: chartHeight }}>
                                    <LineChart data={weatherData24h.windspeed} lineNames={["Wind speed"]} xAxisTickFormat={formatByHour} />
                                </div>
                            )}

                            {weatherData24h.humidity && (
                                <div className="w-full h-1/2 border-2 shadow rounded-md" style={{ height: chartHeight }}>
                                    <LineChart data={weatherData24h.humidity} lineNames={["Humidity"]} xAxisTickFormat={formatByHour} />
                                </div>
                            )}
                        </div>
                    )}
                    {!weatherData && !weatherData.current_weather(
                        <p>No data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Live;