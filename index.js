require('dotenv').config();

let express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Settlement = require("./app/db/models/Settlement"),
    User = require("./app/db/models/User"),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

let app = express(),
    router = express.Router();

const PORT = process.env.PORT || 3000,
      DB_URL = `mongodb+srv://${process.env.MONGODB_USERNAME}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@cluster0-d6pne.mongodb.net/the_power_of_without?retryWrites=true&w=majority`;

// ** SETUP **

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(session({secret: "cookie key", cookie: { maxAge: 60000 }}));
app.use(flash());

// ** CONNECT TO DB **
mongoose.connect(DB_URL, function(err, res) {
  if(err) console.log("ERROR connecting to database");
  else console.log("SUCCESSfully connected to database");
});

// ** ROUTES **
app.get("/", function(req, res){
  res.render("index");
});

app.get("/contribute", function(req, res){ // Create the initial settlement
  let sections = [[
    {
      label: "Name of the Informal Settlement",
      name: "settlement",
      type: "text"
    },
    {
      label: "Name of the City",
      name: "city",
      type: "text"
    },
    {
      label: "Name of the Country",
      name: "country",
      type: "text"
    },
    {
      label: "Coordinates",
      name: "geolocation",
      type: "coords",
    },
    {
      label: "Email Address",
      name: "email",
      type: "text",
    },
  ]];
  res.render("form", {sections: sections, method: "POST"});
});

app.get("/contribute/u/:contribution/:secret", function(req, res){ // Update the settlement
  let sections = [
    // Site
    [
      {
        label: "Origin",
        name: "siteOriginCauses",
        type: "radio",
        options: ["Squatting", "Refugee Camp", "Illegal Subdivision", "Other"],
        info: "Historical evolution of the settlement"
      },
      {
        label: "Continent",
        name: "siteOriginGeolocation",
        type: "radio",
        options: ['Africa', 'Europe', 'North America', 'South America', 'Asia', 'Oceania', 'Antarctica']
      },
      {
        label: "Population",
        name: "siteOriginPopulation",
        type: "text",
      },
      {
        label: "Topography",
        name: "siteGeographyTopography",
        type: "radio",
        options: ["By the coast", "Desert", "Valley", "Mountain", "Forest", "Water"],
        info: "Geographical features of the location of the Settlement "
      },
      {
        label: "Within cities",
        name: "siteGeographyWithinCities",
        type: "radio",
        options: ["Squatting on the fringe", "In the path of development", "In the heart of the city", "Along railway tracks", "Residential centers", "Suburban industrial areas", "Old city slum"],
        info: "Relationship between the settlement geolocation and the city of reference"
      },
      {
        label: "Climate",
        name: "siteGeographyClimate",
        type: "radio",
        options: ["Tropical (Type A)", "Arid (Type B)", "Temperate (Type C)", "Continental (Type D)", "Polar (Type E)"]
      },
      {
        label: "Security",
        name: "siteVulnerabilitySecurityCrimeRate",
        type: "radio",
        options: ["Low crime rate", "Moderate crime rate", "High crime rate"],
        info: "Level of crime and insecurity in the Settlement"
      },
    ],

    // Architecture
    [
      {
        label: "House quality",
        name: "architecturePhysicalNatureHouseQuality",
        type: "radio",
        options: ["Inadequate", "Suitable", "Optimal"]
      },
      {
        label: "Materials from which the house in the Settlement is made with",
        name: "architecturePhysicalNatureMaterials",
        type: "checkbox",
        options: ["Mud", "Brick", "Wood", "Concrete", "Corrugated sheet", "Tarpaulin", "Tiles", "Other"],
      },
      {
        label: "Development State",
        name: "architecturePhysicalNatureDevelopmentState",
        type: "radio",
        options: ["Initial occupancy", "Transitional", "Establish"],
        info: "Stage of the evolution process where the Settlement is into"
      },
      {
        label: "Access to Energy",
        name: "architectureInfrastructureAccessEnergy",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"],
        info: "Percentage of dwellings that have access to power/electricity in the Settlement"
      },
      {
        label: "Access to Water",
        name: "architectureInfrastructureAccessWater",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"],
        info: "Percentage of dwellings that have access to drinking water in the Settlement"
      },
      {
        label: "Access to Sanitation",
        name: "architectureInfrastructureAccessSanitation",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"],
        info: "Percentage of dwellings that have access to sanitation in the Settlement"
      },
      {
        label: "Access to Internet or Phone Fare",
        name: "architectureInfrastructureAccessInternet",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"],
        info: "Percentage of people that has access to data-plans or phone fare"
      },
      {
        label: "Mobility systems",
        name: "architectureMobility",
        type: "checkbox",
        options: ["Walk", "Bike", "Car", "Public transportation"],
        info: "Mobility systems used by the people in the Settlement"
      },
      {
        label: "Average number of floors in the buildings",
        name: "architectureDensityElevation",
        type: "radio",
        options: ["1", "2", "3", ">3"]
      },
      {
        label: " Number of people living in a house",
        name: "architectureDensityHouseholdPerHouseSize",
        type: "text"
      },
    ],

    // Population
    [
      {
        label: "Health Care: Percentage of people that has access to health care",
        name: "populaceHealthCare",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"]
      },
      {
        label: "Number of hospitals, clinics or health cares in the Settlement",
        name: "populaceHospitals",
        type: "text",
      },
      {
        label: "Education: Percentage of people that has access to schools/ Percentage of people attending to schools",
        name: "populaceEducation",
        type: "radio",
        options: ["0-10%", "10-25%", "25-50%", ">50%"]
      },
      {
        label: "Number of schools in the settlement",
        name: "populaceSchools",
        type: "text",
      },
      {
        label: "Proximity to public areas or leisure activities",
        name: "populacePublicAreas",
        type: "radio",
        options: ["5 min walking distance", "5-20 min walking distance", ">20 min walking distance", "I need to take a car/public transportation"]
      },
      {
        label: "Unemployment rate",
        name: "populaceUnemploymentRate",
        type: "text",
      },
      {
        label: "Ownership: Level of rights that the householder has on possessing the land at the Settlement",
        name: "populaceOwnership",
        type: "radio",
        options: ["Community/city property", "Private house", "Illegal"]
      },
      // {
      //   label: "Ethnic and racial categories in the Settlement",
      //   name: "populaceEthnic",
      //   type: "text",
      // },
      // {
      //   label: "Demography: Percentage of people in each age groups in the Settlement",
      //   name: "populaceDemography",
      //   type: "text",
      // },
    ]
  ];

  User.findOne({secret: req.params.secret, contribution: req.params.contribution}, function(err, user){
    Settlement.findOne({_id: user.contribution}, function(err, settlement){
      res.render("form", {settlement: settlement, sections: sections, redirect: req.flash('form-redirect'), method: "POST"});
    });
  })
});

app.get("/toolkit", function(req, res){
  res.render("toolkit");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/map", function(req, res){
  Settlement.find({}, function(err, settlements){
    if(err) throw err;

    let countries = {}; // Aggregate settlements by country

    settlements.forEach(function(settlement){
      if (!(settlement.country in countries)) countries[settlement.country] = [];
      countries[settlement.country].push(settlement);
    });

    res.render("map", {"settlements": settlements, "countries": countries});
  });
});

app.use("/api", require("./app/routes/api.js"));

// ** START THE SERVER **

app.listen(PORT);
console.log("Running on http://127.0.0.1:" + PORT);
module.exports = app;
