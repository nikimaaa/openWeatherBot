require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const { createUser, getLocation, setLocation } = require("./services/locationsService");
const { getGeo, getLocationData, getWeather } = require("./services/weaterService");
const getWeatherDescription = require("./services/weatherDescription");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/weather/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const location = getLocation(userId);
  const weather = await getWeather(location);
  const weatherDescription = getWeatherDescription(location, weather);

  bot.sendMessage(chatId, weatherDescription);
});

bot.onText(/\/location/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const location = getLocation(userId);

  bot.sendMessage(chatId, `Твоя текущая локация: ${location.name}`);
});

bot.onText(/\/locate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;
  const cityName = match[1];

  const geoData = await getGeo(cityName);
  console.log(geoData);
  if(!geoData){
    bot.sendMessage(chatId, `Локация не найдена`);
    return;
  }
  const name = geoData.local_names[language_code] || cityName;
  const location = setLocation(userId, {...geoData, name});

  bot.sendMessage(chatId, `Локация установлена: ${location.name}`);
});

bot.onText(/\/start/, (msg) => {
  console.log(msg)
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const location = createUser(userId);

  bot.sendMessage(chatId, `Привет, ${msg.from.first_name}, твоя локация была установлена в городе ${location.name}, чтобы поменять локацию используй команду /locate`);
});

bot.on("location", async (msg) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;
  const {location: msgLocation} = msg;

  const geoData = await getLocationData(msgLocation);
  const name = geoData.local_names[language_code] || geoData.name;
  const location = setLocation(userId, {...geoData, name});

  bot.sendMessage(chatId, `Локация установлена: ${location.name}`);
})


// (async () => {
//   const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=Киев&limit=1&appid=${process.env.OPENWEATHER_KEY}`);
//   console.log(response.data)
// })()