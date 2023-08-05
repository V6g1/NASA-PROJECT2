const launchesDataBase = require('./launch.mongo');
const planet = require('./planets.mongo');
const axios = require('axios');
const DEFAULT_LAUNCHE_NUMBER = 100;





const SPACEX_API_URI = 'https://api.spacexdata.com/v4/launches/query';


async function populateLaunches() {
    console.log("Downloading data...");
    const response = await axios.post(SPACEX_API_URI, {

        query: {},
        options: {
            pagination: false,


            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }

            ]
        }
    });

    if (response.status != 200) {
        console.log('Problem downloading launch data ');
        throw new Error(`Launch data Download faild code: ${response.status}`);

    }
    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        };

        await savelaunches(launch)
    }
}



async function loadLaunchData() {
    const firstlaunch = await findLaunches({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstlaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunches();
    }


}



async function getLatestFlight() {
    const latestLaunche = await launchesDataBase
        .findOne()
        .sort('-flightNumber');
    if (!latestLaunche) {
        return DEFAULT_LAUNCHE_NUMBER;
    }
    return latestLaunche.flightNumber;
}


async function getAllLaunches(skip, limit) {

    return await launchesDataBase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);

}



async function scheduleNewLaunch(launch) {

    const planets = await planet.findOne({
        keplerName: launch.target,
    })

    if (!planets) {
        throw new Error("No matching planets found!....")
    }

    const newFlightnum = await getLatestFlight() + 1;
    const newlaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to mastery', 'NASA'],
        flightNumber: newFlightnum,
    });
    await savelaunches(newlaunch);
}

async function findLaunches(filter) {

    const data = await launchesDataBase.findOne(filter);
    return data;
   
}

async function existLaunch(launchId) {
    return await findLaunches({
        flightNumber: launchId
    });

}

async function abortLaunchById(launchID) {

    const abort = await launchesDataBase.updateOne({
        flightNumber: launchID
    }, {
        upcoming: false,
        success: false,
    });
    return abort.ok === 1 && abort.nModified === 1;



}

async function savelaunches(launch) {

    await launchesDataBase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}





module.exports = {
    getAllLaunches,
    loadLaunchData,
    scheduleNewLaunch,
    existLaunch,
    abortLaunchById,
};