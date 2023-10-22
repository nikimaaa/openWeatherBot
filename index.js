require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

const { createUser, getLocation, setLocation } = require("./services/locationsService");
const WeatherService = require("./services/WeatherService");

require('dayjs/locale/ru');
const get = require("lodash/get");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/weather/, async (msg) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;

  const location = getLocation(userId);

  const weatherService = new WeatherService(location, language_code);
  const weatherDescription = await weatherService.getWeather();

  bot.sendMessage(chatId, weatherDescription);
});

bot.onText(/\/dayForecast/, async (msg) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;

  const location = getLocation(userId);

  const weatherService = new WeatherService(location, language_code);
  const forecastDescription = await weatherService.getDayForecast();

  bot.sendMessage(chatId, forecastDescription);
});

bot.onText(/\/forecast/, async (msg) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;

  const location = getLocation(userId);

  const weatherService = new WeatherService(location, language_code);
  const forecastDescription = await weatherService.getForecast();

  bot.sendMessage(chatId, forecastDescription);
});

bot.onText(/\/location/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const location = getLocation(userId);

  bot.sendMessage(chatId, `Текущая локация: ${location.name}`);
});

bot.onText(/\/locate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;
  const cityName = match[1];

  const geoData = await WeatherService.fetchGeo(cityName);

  if(!geoData){
    await bot.sendMessage(chatId, `Локация не найдена`);
    return;
  }

  const name = get(geoData, `local_names[${language_code}]`, cityName);
  const location = setLocation(userId, {...geoData, name});

  await bot.sendMessage(chatId, `Локация установлена: ${location.name}`);
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const location = createUser(userId);

  await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}, твоя локация была установлена в городе ${location.name}, чтобы поменять локацию используй команду /locate [имя города], или скинь текущую геопозицию`);
});

bot.on("location", async (msg) => {
  const chatId = msg.chat.id;
  const {id: userId, language_code} = msg.from;
  const {location: msgLocation} = msg;

  const geoData = await WeatherService.fetchLocationData(msgLocation);
  const name = geoData.local_names[language_code] || geoData.name;
  const location = setLocation(userId, {...geoData, name});

  await bot.sendMessage(chatId, `Локация установлена: ${location.name}`);
})