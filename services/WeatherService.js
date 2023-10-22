const axios = require("axios");
const dayjs = require("dayjs");
const groupBy = require("lodash/groupBy");
const capitalize = require("lodash/capitalize");
const API_KEY = process.env.OPENWEATHER_KEY;

const mapIconToSmile = {
    "01d": "☀️",
    "01n": "🌕",
    "02d": "⛅",
    "02n": "⛅",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌧️",
    "10n": "🌧️",
    "11d": "🌩️",
    "11n": "🌩️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
};

class WeatherService {
    constructor(location, locale = "ua", units = "metric") {
        this.location = location;
        this.locale = locale;
        this.units = units;
    }

    static async openWeatherRequest(url, params) {
        try{
            const response = await axios({
                url: `https://api.openweathermap.org${url}`,
                method: "get",
                params: {
                    ...params,
                    appid: API_KEY
                }
            });
            return response.data;
        } catch(e){
            console.log(e);
            return null;
        }
    }

    static async fetchGeo(cityName) {
        const geo = await WeatherService.openWeatherRequest("/geo/1.0/direct", {
            q: cityName,
            limit: 1
        });

        if(!geo[0]){
            return null;
        }

        const {name, ...geoData} = geo[0];
        return geoData;
    }

    static async fetchLocationData(location) {
        const data = await WeatherService.openWeatherRequest("/geo/1.0/reverse", {
            lat: location.latitude,
            lon: location.longitude,
            limit: 1
        });
        return data[0];
    }

    async fetchWeather() {
        return WeatherService.openWeatherRequest("/data/2.5/weather", {
            ...this.location,
            units: this.units,
            lang: this.locale
        })
    }

    async fetchForecast() {
        return WeatherService.openWeatherRequest("/data/2.5/forecast", {
            ...this.location,
            units: this.units,
            lang: this.locale
        })
    }

    async getWeather () {
        const weather = await this.fetchWeather();
        console.log(JSON.stringify(weather.weather[0]))

        let res = `${this.location.name} ${dayjs().locale(this.locale).format("DD MMMM HH:mm")}\n`;
        res += `${mapIconToSmile[weather.weather[0].icon]} ${capitalize([weather.weather[0].description])}\n`
        res += `🌡️ Текущая температура: ${weather.main.temp}°C\n`;
        res += `🤌 Ощущается как: ${weather.main.feels_like}°C\n`;
        res += `🔺 Максимальная температура: ${weather.main.temp_max}°C\n`;
        res += `🔻 Минимальная температура: ${weather.main.temp_min}°C\n\n`;

        res += `👁️ Видимость: ${Math.ceil(weather.visibility / 1000)}км\n`
        res += `☁️ Облачность: ${weather.clouds.all}%\n`
        res += `💧 Влажность: ${weather.main.humidity}%\n`
        res += `🗜 Давление: ${weather.main.pressure}гПа\n`
        res += `🍃 Скорость ветра: ${weather.main.humidity}м/с\n\n`

        res += `🌅 Восход: ${dayjs(weather.sys.sunrise * 1000).format("HH:mm")}\n`;
        res += `🌄 Закат: ${dayjs(weather.sys.sunset * 1000).format("HH:mm")}\n`;
        return res;
    }

    async getDayForecast(){
        const forecast = await this.fetchForecast();
        const todayForecast = forecast.list.filter((item) => dayjs(item.dt * 1000).isSame(new Date(), "day"));

        let res = `${this.location.name} ${dayjs().locale(this.locale).format("DD MMMM")}\n\n`;

        todayForecast.forEach((item) => {
            res += `${dayjs(item.dt * 1000).format("HH:mm")}\n`
            res += `${mapIconToSmile[item.weather[0].icon]} ${mapIdToDescription[item.weather[0].id]}\n`
            res += `🌡️ Температура: ${item.main.temp}°C\n`;
            res += `🤌 Ощущается как: ${item.main.feels_like}°C\n\n`;
        })

        return res;
    }

    async getForecast () {
        const forecast = await this.fetchForecast();
        let res = `${this.location.name}\n\n`;
    
        const groupedByDay = groupBy(
            forecast.list,
            (item) => dayjs(item.dt * 1000).locale(this.locale).format("DD MMMM")
        );
    
        for(let day in groupedByDay){
            const currentGroup = groupedByDay[day];
            res += `${day}\n`;
            
            const maxTemp = Math.round(Math.max(...currentGroup.map((item) => item.main.temp_max)));
            const minTemp = Math.round(Math.min(...currentGroup.map((item) => item.main.temp_min)));
            const averageTemp = Math.round((maxTemp + minTemp) / 2);
            
            res += `🌡️ Средняя температура: ${averageTemp}°C\n`;
            res += `🔺 Максимальная температура: ${maxTemp}°C\n`;
            res += `🔻 Минимальная температура: ${minTemp}°C\n\n`;
        }
    
        return res;
    }
}

module.exports = WeatherService;