'use strict'

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for ActivityTable
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";
const allDB = "select * from ActivityTable where activity = ?";
const wholeTable = "select * from ActivityTable";
const getPlannedActivities = "select * from ActivityTable where amount = -1"
const deletePlannedActivites = "delete from ActivityTable where rowIdNum = ?"
const getPastActivites = "select * from ActivityTable where amount != -1"

async function printDB(){
  console.log("Current values in Database: ", await db.all(wholeTable))
}

// async function testDB () {

//   // for testing, always use today's date
//   const today = new Date().getTime();

//   // all DB commands are called using await

//   // empty out database - probably you don't want to do this in your program
//   await db.deleteEverything();

//   await db.run(insertDB,["running",today,2.4]);
//   await db.run(insertDB,["walking",today,1.1]);
//   await db.run(insertDB,["walking",today,2.7]);
  
//   console.log("inserted two items");

//   // look at the item we just inserted
//   let result = await db.get(getOneDB,["running",today,2.4]);
//   console.log(result);

//   // get multiple items as a list
//   result = await db.all(allDB,["walking"]);
//   console.log(result);
// }


async function addRowPastActivites(data){
  console.log("got the data", data)
  await db.run(insertDB,[data.activity,data.date, data.scalar])

  let result = await db.all(wholeTable);
  console.log("Database after add of past activity: ", result);
  
}

async function addRowFutureActivities(data){
  console.log("future activities got the data", data);
  await db.run(insertDB,[data.activity,data.date, -1]);

  let result = await db.all(wholeTable);
  console.log("Database after add of future activity: ", result);
}

 // find most recent planned activity, delete the past activities that are before the most recent, and ignore if most recent is greater than week
async function getPlannedActivites(){
  let pastActs = await db.all(getPlannedActivities);
  
  if(Object.keys(pastActs).length === 0)
  {
    console.log("length of planned activies is 0")
    return {};
  }
    
  let current_date = new Date();
  let compare_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()) //minimum date of current day
  let max_idNum = 0; //set max index to first element and let for loop change if needed
  let minSet = false;
  let max_date;
  
  for(let i = 0; i < pastActs.length; i++)
  {
    //convert into Date objects and find most recent
    let [yyyy, mm, dd] = pastActs[i].date.split("-");
    let date = new Date(yyyy, mm-1, dd)
    let j = 0;

    //set minimum for comparison 
    while(!minSet)
    {
      //convert into Date objects and find most recent
      let [yyyy, mm, dd] = pastActs[j].date.split("-");
      let date = new Date(yyyy, mm-1, dd)
      if(date < current_date)
      {
        max_date = date;
        minSet = true;
      }
      j+=1;
      
      if(j == pastActs.length && !minSet)//no values in DB less than current date
      {
        console.log("No value fits reminder criteria")
        return {};
      }
        
    }
    
    if(date < current_date && date > max_date)
    {
      max_idNum = i;
      max_date = date;
    }
    
  }

  //Delete if retrieved date is greater than a week ago
  let minDate = new Date(new Date() - (60*60*24*7*1000))
  let return_date = new Date(pastActs[max_idNum].date.replace("-", "/"))

  if(minDate > return_date)
  {
    console.log("No activites within last 7 days so returning a blank JSON")
    return {};
  }
  
  //delete past activites less than max_date
  for(let i = 0; i < pastActs.length; i++)
  {
    let [yyyy, mm, dd] = pastActs[i].date.split("-");
    let date = new Date(yyyy, mm-1, dd)
    
    if(date < max_date && i != max_idNum)
      await db.run(deletePlannedActivites, pastActs[i].rowIdNum)
  
      
  }

  return pastActs[max_idNum]; 
}

async function getPastWeekActivities(weekEnding, activity)
{
  let return_activites = [];

  //check if this week in at least one week in the past from current date and is greater than 0 
  //find the date that is 7 day previous to input date
  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  currentDate = currentDate.getTime();

  let startOfWeek = new Date(weekEnding - (60*60*24*7*1000));//set lower bound to 7 days prior to end
  startOfWeek.setHours(0,0,0,0);
  startOfWeek = startOfWeek.getTime();

  //round down weekend to beginning of day 
  weekEnding = new Date(Number(weekEnding));
  weekEnding.setHours(0,0,0,0);
  weekEnding = weekEnding.getTime();

  //get list of activites from database 
  let past_acts = await db.all(getPastActivites);

  //Error handing
  if(weekEnding < 0)
  {
    console.log("Seconds were negative.")
    return {};
  }
  if(startOfWeek < 0)
  {
    console.log("Week ago seconds are less than 0: ", startOfWeek)
    return {};
  }
  if(past_acts.length == 0)
  {
    console.log("No DB activites matched activites for chart")
    return {};
  }
  if(startOfWeek > currentDate - (60*60*24*7*1000))
  {
    console.log("Seconds were too late -> seconds: ", weekEnding, "Week before: ", startOfWeek, "difference", )
    return {};
  }
  
  //if activity is blank find most recent entry and set as activity.
  if(activity == "")
  {
    console.log("Default activity set to: ", past_acts[0].activity)
    activity = past_acts[0].activity;
  }

  //iterate through pastacts and check if date within upper and lower bound. If so append to return_activites arr
  for(let i = 0; i < past_acts.length; i++)
  {
    //create date from json
    let possible_activity = new Date(past_acts[i].date.replace('-', '/')).getTime();

    if((possible_activity >= startOfWeek && possible_activity <= weekEnding) && past_acts[i].activity == activity) //append json within range
      return_activites.push(past_acts[i])

  }

  return return_activites;
}

async function deleteByRowID(rowId){
  await db.run(deletePlannedActivites, rowId)
  return;
}



// module.exports.testDB = testDB;
module.exports.addRowPastActivities = addRowPastActivites;
module.exports.addRowFutureActivities = addRowFutureActivities;
module.exports.getPlannedActivites = getPlannedActivites;
module.exports.getPastWeekActivities = getPastWeekActivities;
module.exports.deleteByRowID = deleteByRowID;
module.exports.printDB = printDB;