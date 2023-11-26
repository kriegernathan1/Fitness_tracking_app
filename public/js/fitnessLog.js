'use strict';

import barchart from './barchart.js'

/* Set default date in forms to current date */
document.getElementById('pAct-date').valueAsDate = newUTCDate()
document.getElementById('fAct-date').valueAsDate = newUTCDate()
document.getElementById("date-picker-chart").valueAsDate = newUTCDate()


/* Past Activity 'Add New Activity' Button - Show Form */
let add_past_activity_button = document.getElementById("addPastActivityButton")
add_past_activity_button.addEventListener("click", add_past_activity_onclick);


/* Future Activity 'Add New Activity' Button - Show Form */
let add_future_activity_button = document.getElementById("addFutureActivityButton")
add_future_activity_button.addEventListener("click", add_future_activity_onclick);


/* Past Activity Form Dropdown */
let past_activity_dropdown = document.getElementById("pAct-activity")
past_activity_dropdown.addEventListener("change", past_activity_dropdown_onchange);


/* Past Activity 'Submit' Button - Submit Form */
let submit_past_activity_button = document.getElementById("submitPastActivityButton")
submit_past_activity_button.addEventListener("click", submit_past_activity_onclick);


/* Future Activity 'Submit' Button - Submit Form */
let submit_future_activity_button = document.getElementById("submitFutureActivityButton")
submit_future_activity_button.addEventListener("click", submit_future_activity_onclick)

// "View progress" button 
let view_progress_button = document.getElementById("vp-btn")
view_progress_button.addEventListener("click", view_progress_onclick)

//Reminder yes button 
let reminder_yes_btn = document.getElementById("reminder-yes");
reminder_yes_btn.addEventListener("click", reminder_yes_onclick)

//Reminder no button
let reminder_no_btn = document.getElementById("reminder-no");
reminder_no_btn.addEventListener("click", reminder_no_onclick)

//go buttoin
let go_button = document.getElementById("view-activity-btn")
go_button.addEventListener("click", go_button_onclick)

//close button
let close_btn = document.getElementById("close-button")
close_btn.addEventListener("click", close_btn_onclick)


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Past Section and Show
 * Form to Add a Past Activity
 */
function add_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  pActAdd.classList.add("hide");
  pActForm.classList.remove("hide");
}


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Future Section and Show
 * Form to Add a Future Activity
 */
function add_future_activity_onclick() {
  /* Connect to Past Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  fActAdd.classList.add("hide");
  fActForm.classList.remove("hide");
}


/**
 * ONCHANGE - Automatically Change Units in Past Activty Form to accomodate the
 * selected Activity from the dropdown menu
 */
function past_activity_dropdown_onchange() {
  /* Connect to Past Activity Unit Input */
  let pActUnit = document.getElementById("pAct-unit");

  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swimm':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
}


/**
 * ONCLICK - Validate Past Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('pAct-date').value,
    activity: document.getElementById('pAct-activity').value,
    scalar: document.getElementById('pAct-scalar').value,
    units: document.getElementById('pAct-unit').value
  }

  if (!past_activity_form_is_valid(data)) {
    alert("Invalid Past Activity. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  pActAdd.classList.remove("hide");
  pActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button */
  let newActivity = create_submission_success_element(
    "Got it! ",
    `${data.activity} for ${data.scalar} ${data.units}. `,
    "Keep it up!"
  )
  insert_latest_response(pActAdd, newActivity)

  console.log('Past Activity Sending:', data);

  /* Post Activity Data to Server */
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Past Activity Success:', data);
    })
    .catch((error) => {
      console.error('Past Activity Error:', error);
    });

  /* Reset Form */
  document.getElementById('pAct-date').valueAsDate = newUTCDate()
  document.getElementById('pAct-activity').value = "Walk"
  document.getElementById('pAct-scalar').value = ""
  document.getElementById('pAct-unit').value = "km"
}


/**
 * ONCLICK - Validate Future Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_future_activity_onclick() {
  /* Connect to Future Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('fAct-date').value,
    activity: document.getElementById('fAct-activity').value,
    scalar: -1
  }

  /* Form Validation */
  if (!future_activity_form_is_valid(data)) {
    alert("Invalid Future Plan. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  fActAdd.classList.remove("hide");
  fActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button  */
  let newActivity = create_submission_success_element(
    "Sounds good! Don't forget to come back to update your session for ",
    `${data.activity} on ${reformat_date(data.date)}`,
    "!"
  )
  insert_latest_response(fActAdd, newActivity)

  console.log('Future Plans Sending:', data);

  /* Post Activity Data to Server */
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Future Plans Success:', data);
    })
    .catch((error) => {
      console.error('Future Plans Error:', error);
    });

  /* Reset Form */
  document.getElementById('fAct-date').valueAsDate = newUTCDate()
  document.getElementById('fAct-activity').value = "Walk"
}

function reminder_yes_onclick(){
  //show forms field in past activity
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  //  case 'Walk': case 'Run': case 'Bike':
  //     unit = 'Kilometers';
  //     break;
  //   case 'Swimm':
  //     unit = 'laps';
  //     break;
  //   case 'Yoga': case 'Soccer': case 'Basketball':
  //     unit = 'minutes';
  //     break;

  
  //auto fill activity 
  fetch('/reminder')
    .then(response => response.json())
    .then(data => {
       //check if data is blank
      if(Object.keys(data).length === 0)
      {
        console.error("There was no reminder even though a reminder was displayed. Possible error?")
        return;
      }

      let activity_select = document.getElementById("pAct-activity")
      switch(data.activity)
      {
        case "Walk":
          activity_select.selectedIndex = 0
          break;
        case "Run":
          activity_select.selectedIndex = 1
          break;
        case "Swim":
          activity_select.selectedIndex = 2;
          break;
        case "Bike":
          activity_select.selectedIndex = 3
          break;
        case "Yoga":
          activity_select.selectedIndex = 4;
          break;
        case "Soccer":
          activity_select.selectedIndex = 5;
          break;
        case "BasketBall":
          activity_select.selectedIndex = 6;
          break;
      }
      /* Show Form, Hide 'Add New Activity' Button */
      pActAdd.classList.add("hide");
      pActForm.classList.remove("hide"); 
      
    })
  return;
}

function reminder_no_onclick(){
  //remove reminder from display 
  let reminder_element = document.getElementById('reminder');
  reminder_element.classList.add("hide")

  fetch('/reminder')
    .then(response => response.json())
    .then(data => {
      let rowID = data.rowIdNum;

      //delete from database
      fetch(`/delete?rowID=${rowID}`)
        .then(response => {
          if(response.status == 200)
            console.log("Successful Deletion of: ", data)
          else
            console.log("Return status was not 200 so an error occurred", response)
        })
        .catch(error => console.log("An error occurred trying to delete activity"))
      
    })
  

  return;
}

function go_button_onclick(){
  let activity = document.getElementById("activity-date").value;
  let weekEnding = document.getElementById("date-picker-chart").value
  weekEnding = new Date(weekEnding.replace('-', '/'));
  weekEnding.setUTCHours(0,0,0,0);
  weekEnding = weekEnding.getTime();

  fetch(`/week?date=${weekEnding}&activity=${activity}`)
    .then(reponse => reponse.json())
    .then(data => {
    
      let weekOfData = generateWeekOfValues(weekEnding, data)

      if(Object.keys(data).length === 0)
      {
        console.log("Go BTN: no events in that time period so graph will be blank")
        // Render data with correct x and y axis
        barchart.render(weekOfData, "Undefined" , 'Day of the Week');
        return;
      }

      // Render data with correct x and y axis
      let yAxis = generateYAxis(data[0].activity)
      barchart.render(weekOfData, yAxis, 'Day of the Week');

      
      

    }
    )
}

window.onload = () => {
    fetch('/reminder')
    .then(response => response.json())
    .then(data => {

      //check if data is blank
      if(Object.keys(data).length === 0)
      {
        console.log("return object was empty so no reminder")
        return;
      }
        
      console.log("Reminder data:\n", data)

      //translate day of week into string
      let day = new Date(data.date.replace('-', '/'));
      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      let dayOfActivity = days[day.getDay()];
      let activity = data.activity;
      let currentDate = new Date();
      currentDate.setHours(0,0,0,0)
      currentDate = currentDate.getTime();

      //sets display message to either day of week or yesterday depending on time difference
      if(currentDate - day.getTime() <= 86400000)
        dayOfActivity = "yesterday";
      

      //Display reminder to user
      document.getElementById("reminder").classList.remove("hide")

      //change display message
      let reminder_message = document.getElementById("reminder-message");

      //Format message depending on activity and date 
      if(dayOfActivity == "yesterday")
        if(activity == "Yoga")
          reminder_message.textContent = `Did you do ${data.activity} ${dayOfActivity}?`
        else if(activity == "Basketball")
          reminder_message.textContent = `Did you play ${data.activity} ${dayOfActivity}?`

        else
          reminder_message.textContent = `Did you ${data.activity} ${dayOfActivity}?`
      else
      {
        if(activity == "Basketball")
          reminder_message.textContent = `Did you play ${data.activity} ${dayOfActivity}?`
        else
        reminder_message.textContent = `Did you do ${data.activity} on ${dayOfActivity}?`

      }
       
    })
    .catch(error => console.error("View progress GET unsuccessful: ", error))
};
  

function view_progress_onclick(){
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1)
  currentDate.setUTCHours(0,0,0,0);
  currentDate = currentDate.getTime();

 
  fetch(`/week?date=${currentDate}`)
    .then(response => response.json())
    .then(data => {
      let weekOfData = generateWeekOfValues(currentDate, data)

      if(Object.keys(data).length === 0)
      {
        console.log("View progress btn: no events in that time period so graph will be blank")

        // Render data with correct x and y axis
        barchart.render(weekOfData, "Undefined" , 'Day of the Week');
        return;
      }
  
      // Render data with correct x and y axis
      let yAxis = generateYAxis(data[0].activity)
      barchart.render(weekOfData, yAxis, 'Day of the Week');
    })

  document.getElementById("chart-container").classList.remove("hide");
  document.getElementById("center").classList.remove("hide")
  document.body.classList.add("noScroll")
  document.documentElement.scrollTop = 0; 
}

// Create a JSON that matches format for barchart that starts at 7 days prior to weekEnding and ends on WeekEnding
function generateWeekOfValues(weekEnding, data){
  let dayOfWeek = new Date(weekEnding - (60*60*24*7*1000))
  dayOfWeek.setUTCHours(0,0,0,0);
  let format_data = []
  //create array of dates b

  for(let i = 0; i < 7; i++)
  {
    let next_day = dayOfWeek.setDate(dayOfWeek.getDate() + 1);
    if(i == 0)
      format_data[i] = {
          'date': dayOfWeek.getTime(),
          'value': 0
        };
    else
      format_data[i] = {
        'date': next_day,
        'value': 0
      };
  }

  for(let i = 0; i < data.length; i++)
    {
      //Format date for comparison
      data[i].date = new Date(data[i].date.replace('-', '/'))
      data[i].date.setUTCHours(0,0,0,0);
      data[i].date = data[i].date.getTime();
    }

    for(let i = 0; i < format_data.length; i++)
    {
      let comparisonDate = format_data[i].date;
  
      let sum = 0;
      for(let j = 0; j < data.length; j++)
      {        
        if(data[j].date == comparisonDate)
          sum += data[j].amount;
      }

      //set sum for that date
      format_data[i].value = sum;
      let adjusted_date = new Date(comparisonDate);
      adjusted_date.setUTCHours(12);
      adjusted_date = adjusted_date.getTime();

      //change time so graph actually graphs correctly
      format_data[i].date = adjusted_date
    }


  return format_data;
}

function generateYAxis(activity)
{
  let unit = "";

  switch (activity) {
    case 'Walk': case 'Run': case 'Bike':
      unit = 'Kilometers';
      break;
    case 'Swimm':
      unit = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      unit = 'minutes';
      break;
    default:
      unit = 'units';
  }

  let message = `${unit} ${activity}`

  return message;
}

function close_btn_onclick(){
  document.getElementById("chart-container").classList.add("hide");
  document.getElementById("center").classList.add("hide");
  document.body.classList.remove("noScroll")

}


/**
 * Create DOM element for acknowledgment message to send to user for submitting a form
 * @param {string} beg - regular starting section
 * @param {string} mid - bolded middle section
 * @param {string} end - regular trailing text
 * @returns {HTMLElement} DOM element combining beg, mid, end
 */
function create_submission_success_element(beg, mid, end) {
  /* Create all HTML elements to add */
  let newMessage = document.createElement('p')
  let baseText = document.createElement('span')
  let dynamicText = document.createElement('strong')
  let exclamationText = document.createElement('span')

  /* Update textContent of all generated DOM elements */
  baseText.textContent = beg
  dynamicText.textContent = mid
  exclamationText.textContent = end

  /* Append all text contents back to back in wrapper 'p' tag */
  newMessage.appendChild(baseText)
  newMessage.appendChild(dynamicText)
  newMessage.appendChild(exclamationText)

  return newMessage
}


/**
 * Checks if past activity data is valid
 * @param {Object} data
 * @param {string} data.date - format 'mm-dd-yyyy'
 * @param {string} data.activity
 * @param {string} data.scalar - time or distance integer or float
 * @param {string} data.units - units for scalar value
 * @returns {boolean} Boolean represents if data is valid
 */
function past_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-', '/'))
  if (date != "Invalid Date" && date > newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "" || data.scalar == "" || data.units == "")
}


/**
 * Checks if future activity data is valid
 * @param {Object} data
 * @param {string} data.date
 * @param {string} data.activity
 * @returns {boolean} Boolean represents if data is valid
 */
function future_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-', '/'))
  if (date != "Invalid Date" && date < newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "")
}


/**
 * Insert Prompt at the top of parent and remove old prompts
 * @param {HTMLElement} parent - DOM element 
 * @param {HTMLElement} child - DOM element
 */
function insert_latest_response(parent, child) {
  if (parent.children.length > 1) {
    parent.removeChild(parent.children[0])
  }
  parent.insertBefore(child, parent.childNodes[0])
}


/**
 * Convert 'yyyy-mm-dd' to 'mm/dd/yy'
 * @param {string} date 
 * @returns {string} same date, but reformated
 */
function reformat_date(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy.substring(2, 4)}`
}


/**
 * Convert GMT date to UTC
 * @returns {Date} current date, but converts GMT date to UTC date
 */
function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}