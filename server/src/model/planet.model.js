const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse');
const planets = require('./planets.mongo')

// const habitablePlanets = [];

function isHabitable(palnet) {
    return palnet['koi_disposition'] === 'CONFIRMED'
        && palnet['koi_insol'] > 0.36
        && palnet['koi_insol'] < 1.11
        && palnet['koi_prad'] < 1.6;
}

function loadPlanetData() {

    return new Promise((resolve, reject) => {



        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))

            .on('data', async (data) => {
                if (isHabitable(data)) {
                    savePlanet(data);
                
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err)
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound} habitable planets found!`);
                resolve();
              });
          });
        }
        
        async function getAllPlanets() {
          return await planets.find({})
        }
        // find({}, {
        //   '_id': 0, '__v': 0,
        // });
        async function savePlanet(planet) {
          try {
            await planets.updateOne({
              keplerName: planet.kepler_name,
            }, {
              keplerName: planet.kepler_name,
            }, {
              upsert: true,
            });
          } catch(err) {
            console.error(`Could not save planet ${err}`);
          }
        }





module.exports = {
    loadPlanetData,
    getAllPlanets,
};