const http = require('http');
require('dotenv')
const app = require('./app');
const mongoose = require('mongoose')
const { loadPlanetData } = require('./model/planet.model')
const{mongoConnect}=require('../src/services/mongo')
const {loadLaunchData}=require('./model/lanch.model')
const PORT = 5000;

const server = http.createServer(app);


async function startServer() {

    await mongoConnect();

    await loadPlanetData();
    await loadLaunchData();
    server.listen(PORT, () => {
        console.log(`server is listening at ${PORT}.....`);
    })
}

startServer();







