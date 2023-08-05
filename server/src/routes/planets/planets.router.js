const express=require('express');

const planetsRouter=express.Router();
const controller=require('./planets.constroller')


planetsRouter.get('/',controller.httpgetAllPlanets);


module.exports=planetsRouter;