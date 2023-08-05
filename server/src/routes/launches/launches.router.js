const express = require('express');
const { httpgetAllLaunches,
    httpNewLaunch,
    httpAbortLaunch


} = require('./launches.controller');

const launchRouter = express.Router();

launchRouter.get('/', httpgetAllLaunches);
launchRouter.post('/',httpNewLaunch)
launchRouter.delete('/:id',httpAbortLaunch)
module.exports = launchRouter;