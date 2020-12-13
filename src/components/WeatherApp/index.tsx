import React, {useState, useEffect, ReactElement} from "react";

import useGeolocation from "../../services/geolocation";
import WeatherPanels from "../../components/WeatherPanels";
import LocationInput from "../../components/LocationInput";
import LocationSuggestions from "../../components/LocationSuggestions";
import UnitToggler from "../../components/UnitToggler";
import LocationTitle from "../../components/LocationTitle";
import {getLocationByLatLng, getWeather, getLocation} from "../../services/api";

const LS_LOCATION_KEY = 'weather_app_location_id';
const DAYS_LIMIT = 3;
const CHAR_LIMIT = 2;

const WeatherApp = (): ReactElement => {
    const geolocation = useGeolocation();

    const [unit, setUnit] = useState<TempUnit>('C');
    const [location, setLocation] = useState<WeatherLocation | undefined | null>(undefined);
    const [weather, setWeather] = useState<WeatherDatapoint[] | undefined>(undefined);
    const [locationString, setLocationString] = useState<string>('');
    const [locationSuggestions, setLocationSuggestions] = useState<WeatherLocation[]>([]);

    const setLocationData = (response: WeatherLocation[]): void => response && setLocation(response[0]);
    const setLocationSuggestionsData = (response: WeatherLocation[]): void => setLocationSuggestions(response);
    const setWeatherData = (response: Weather): void => setWeather(response.consolidated_weather.slice(0, DAYS_LIMIT));

    const onLocationStringChange = ({target}) => setLocationString(target.value);

    const onLocationSelect = (locationSuggestion: WeatherLocation): void => setLocation(locationSuggestion);
    const onUnitSelect = (unitSelected: TempUnit): void => setUnit(unitSelected);

    useEffect(() => {
        const {latitude, longitude} = geolocation;
        if (latitude === null || longitude === null) {
            setLocation(null);
        } else {
            getLocationByLatLng(latitude, longitude).then(setLocationData);
        }
    }, [geolocation]);

    useEffect(() => {
        if (!location) return;
        const {woeid} = location;
        getWeather(woeid).then(setWeatherData);
        localStorage.setItem(LS_LOCATION_KEY, `${woeid}`);
    }, [location]);

    useEffect(() => {
        if (locationString.length > CHAR_LIMIT) {
            getLocation(locationString).then(setLocationSuggestionsData);
        }
    }, [locationString]);

    return (
        <>
            <UnitToggler units={['C', 'F']} unitSelected={unit} onSelect={onUnitSelect} />
            <LocationTitle location={location} />
            <WeatherPanels unit={unit} weather={weather} />
            <LocationInput value={locationString} onChange={onLocationStringChange} />
            <LocationSuggestions locations={locationSuggestions} onSelect={onLocationSelect} />
        </>
    )


};

export default WeatherApp;