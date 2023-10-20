const fs = require("fs");

const defaultLocation = {
    name: "Киев",
    lat: 50.4500336,
    lon: 30.5241361,
    country: 'UA'
};

const setLocation = (userId, location) => {
    fs.writeFileSync(`services/locations/${userId}.json`, typeof location !== "string" ? JSON.stringify(location) : location);
    return location;
}

const createUser = (userId) => {
    setLocation(userId, defaultLocation);
    return defaultLocation;
}

const getLocation = (userId) => {
    return JSON.parse(fs.readFileSync(`services/locations/${userId}.json`, "utf8"));
}

module.exports = {setLocation, getLocation, createUser}