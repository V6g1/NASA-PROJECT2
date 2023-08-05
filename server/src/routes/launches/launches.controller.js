const { getAllLaunches,
  scheduleNewLaunch,
  existLaunch,
  abortLaunchById,

} = require('../../model/lanch.model');

const {getPagination}=require('../../services/query')

async function httpgetAllLaunches(req, res) {
  const {skip,limit} = getPagination(req.query)
  const launches=await getAllLaunches(skip,limit)
  return res.status(200).json();
}

function httpNewLaunch(req,res){

  const launch=req.body;


if (!launch.mission ||!launch.rocket|| !launch.launchDate || !launch.target) {

  res.status(400).json({
    error:"Miising ! required launch property",
  });
}



  launch.launchDate=new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error:'Invalid launch  date'
    })
    
  }
  scheduleNewLaunch(launch);
 return res.status(201).json(launch);
 
}


async function httpAbortLaunch(req,res){
const launchID=+ req.params.id
const existLaunchWithId=await existLaunch(launchID);
  if(!existLaunchWithId){
    return res.status(404).json({
      error:'Launch Not Found !'
    })
  }

  const aborted=abortLaunchById(launchID);
if(!aborted){
  return res.status(400).json({
    error:'Launch not aborted',
  })
}

  return res.status(200).json({
    ok:true
  });
}

  
  


module.exports = {
  httpgetAllLaunches,
  httpNewLaunch,
  httpAbortLaunch,
  }