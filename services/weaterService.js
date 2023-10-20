const axios = require("axios");
const API_KEY = process.env.OPENWEATHER_KEY;

const getGeo = async (cityName) => {
    const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      if(!response.data[0]){
        return null;
      }
      const {name, ...geoData} = response.data[0];
      return geoData;
}

const getLocationData = async (location) => {
    const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${location.latitude}&lon=${location.longitude}&limit=1&appid=${API_KEY}`
      );
      return response.data[0];
}

const getWeather = async (location) => {
    const response = await axios.get(
        `https:///api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
    );
    return response.data;
}

module.exports = {getGeo, getLocationData, getWeather};