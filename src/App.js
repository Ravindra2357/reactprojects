/* eslint-disable no-unused-vars */
import React,{useState, useEffect} from 'react';
import './App.css';
import {MenuItem, FormControl, Select,Card, CardContent} from "@material-ui/core";
import Infobox from "./Infobox";
import Map from "./Map";
import Table from "./Table";
import {sortData, prettyPrintStat} from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
function App() {
 const [countries,setCountries] = useState([]);
 const [country, setCountry] = useState('Worldwide');
 const [tableData,setTableData] = useState([]);
 const [countryInfo, setCountryInfo] = useState({});
 const [casesType, setCasesType] = useState("cases");
 const [mapCenter,setMapCenter] = 
 useState({lat:34.80746,lng:-40.4790});
 const [zoom,setZoom] = useState(3);
 const [mapCountries,setMapCountries] = useState([]);
 
 useEffect( ()=> {
  fetch("https://disease.sh/v3/covid-19/all")
  .then((response) => response.json())
  .then((data) =>{
    setCountryInfo(data);
  });
},[])

 useEffect( ()=> {
   //async -> send a request, wait for it,
   const getCountriesData = async () =>{
     await fetch("https://disease.sh/v3/covid-19/countries")
     .then((response) => response.json())
     .then((data) =>{
       
         const countries = data.map((country)=>({
           name : country.country,
           value : country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
          
     });
   };
   getCountriesData();
 }, []);

 const onCountryChange = async (event) =>{
    const countryCode = event.target.value;
    const url = countryCode === 'Worldwide'
    ?"https://disease.sh/v3/covid-19/all"
    :`https://disease.sh/v3/covid-19/countries/${countryCode}`;
 
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      {
        countryCode === 'Worldwide' ?  
        setMapCenter([34.80746,-40.4790]):
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      }
      
    });
    


 };
  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
        <h1>Covid-19 Tracker</h1>
        <FormControl className="app_dopdown">
            <Select variant="outlined" onChange={onCountryChange} value={country} >
              <MenuItem value="Worldwide">Worldwide</MenuItem>
              {
                countries.map((country)=>(
                <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
        </FormControl>
      </div>

      {/*info boxes*/}
      <div className="app_stats">
        <Infobox 
        isRed
        active ={casesType === "cases"}
          onClick= {(e) => setCasesType("cases")}
          title="Coronavirus Cases" 
          cases={prettyPrintStat(countryInfo.todayCases) } 
          total={prettyPrintStat(countryInfo.cases)} 
        />
        <Infobox 
          active ={casesType === "recovered"}
          onClick= {(e) => setCasesType("recovered")}
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={prettyPrintStat(countryInfo.recovered)} 
        />
        <Infobox 
        isRed
          active ={casesType === "deaths"}
          onClick= {(e) => setCasesType("deaths")}
          title="Deaths" 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={prettyPrintStat(countryInfo.deaths)} 
        />
      </div>
      
      {/*info boxes*/}
      <Map countries={mapCountries} center={mapCenter} zoom={zoom} casesType={casesType}/>
      </div>

      <Card className="app_right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
        <h3 className="graph_heading">Worlwide new {casesType}</h3>
        <LineGraph className="app_graph" casesType = {casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
