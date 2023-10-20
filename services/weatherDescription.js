const dayjs = require("dayjs");

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
}

const getWeatherDescription = (location, weather) => {
    let res = `${location.name}\n`;
    res += `${mapIconToSmile[weather.weather[0].icon]} ${weather.weather[0].description}\n`
    res += `🌡️ Текущая температура: ${weather.main.temp}\n`;
    res += `🤌 Ощущается как: ${weather.main.feels_like}\n`;
    res += `🔺 Максимальная температура: ${weather.main.temp_max}\n`;
    res += `🔻 Минимальная температура: ${weather.main.temp_min}\n\n`;

    res += `👁️ Видимость: ${Math.ceil(weather.visibility / 1000)}км\n`
    res += `☁️ Облачность: ${weather.clouds.all}%\n`
    res += `💧 Влажность: ${weather.main.humidity}%\n`
    res += `🗜 Давление: ${weather.main.pressure}гПа\n`
    res += `🍃 Скорость ветра: ${weather.main.humidity}м/с\n\n`

    res += `🌅 Восход: ${dayjs(weather.sys.sunrise * 1000).format("HH:mm")}\n`;
    res += `🌄 Закат: ${dayjs(weather.sys.sunset * 1000).format("HH:mm")}\n`;
    return res;
}

module.exports = getWeatherDescription;