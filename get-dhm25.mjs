#!/usr/bin/env node


import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync,readFileSync } from "fs"
import { intToRGBA, cssColorToHex, colorDiff } from "@jimp/utils";
//import { calculateDistance } from '@anatoliy-stepanchenko/geodistance-calculator';

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return (radians / Math.PI) * 180
}



function calculateDistance(coord1, coord2) {
  const { lat: lat1, lon: lon1 } = coord1;
  const { lat: lat2, lon: lon2 } = coord2;

  const earthRadius = 6371; // Earth's radius in kilometers.

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Calculation using the haversine formula (the formula is divided into two parts).

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;
    //return distance.toFixed(2); // The distance between two geographic points in kilometers rounded to the hundredths.
    return distance;
}


function getIndices(lat,lon){

    // https://www.swisstopo.admin.ch/en/coordinates-conversion-navref
    let oLat=45.806900086; //y  LV03: 73987.5
    let oLon=5.894943851;  //x  LV03: 479987.5
    let grid=25.0;         // grid is 25m
    
    let dx= 1000.0*calculateDistance( { lat: oLat , lon: oLon }, { lat: oLat, lon: lon }); 
    let dy= 1000.0*calculateDistance( { lat: oLat , lon: lon }, { lat: lat , lon: lon }); 

    let x = Math.round(dx/grid);
    let y = height - Math.round(dy/grid);

    //console.log(x+' '+y);
    return { x: x, y:y }
}

function setHoehe(hoehe,x,y){

    let h=hoehe*10.0;
    let r=Math.round(h/256.0);
    let g=Math.round(h-256.0*r);

    let idx= 4*(y*ncols+x)
    data[idx+0]=r;
    data[idx+1]=g;
}

function getHoehe(x,y){
    let idx= 4*(y*ncols+x)
    return (data[idx+0]*256+data[idx+1])/10.0
}

function setSlope(slope,aspect,x,y){
    let idx= 4*(y*ncols+x);

    slope=Math.round(slope/2.0);
    aspect=Math.round(aspect/2.0)
    
    data[idx+2]=slope;
    data[idx+3]=aspect;
}

function getSlope(x,y){
    let idx= 4*(y*ncols+x);
    let slope=data[idx+2]*2;
    let aspect=data[idx+3]*2;
    return { slope: slope, aspect: aspect }
}


// https://observablehq.com/@slutske22/slope-as-a-function-of-latlng-in-leaflet

function getSlopeLatLng(lat,lon){

    let indices=getIndices(lat,lon);
    let x=indices.x;
    let y=indices.y;

    let height=getHoehe(x,y);
    let s=getSlope(x,y);
    let slope=s.slope;
    let aspect=s.aspect;
    
    return { height: height, slope: slope, aspect: aspect };
}



let ncols=15401;
let nrows=9121;


let image= await Jimp.read('dhm25.png');
let height=image.height;
let width=image.width;
let data=image.bitmap.data;
//console.log(image.mime+' '+width+' '+height);


let out={ type: 'FeatureCollection', features: [] };

let factor=0.00002;

function doit(chunks){
    let geo=JSON.parse(chunks);
    let features=geo.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	let id=feature.id;
	let tags=feature.properties.tags;
	let coordinates=feature.geometry.coordinates;
	if(tags['addr:country']=='Schweiz/Suisse/Svizzera/Svizra'){
	    let lat=coordinates[1];
	    let lon=coordinates[0]
	    let s=getSlopeLatLng(lat,lon);
	    let ele=s.height;
	    let slope=s.slope;
	    let aspect=s.aspect;
	    let asp=toRadians(aspect);
	    let dy= -1.0*Math.sin(asp)*slope*factor;
	    let dx= Math.cos(asp)*slope*factor;

	    let lat2=lat+dy;
	    let lon2=lon+dx;

	    let item={ "type": "Feature",
		       "properties": { id: id, ele: ele, slope: slope, aspect: aspect },
		       "geometry": {
			   "type": "LineString",
			   "coordinates": [ coordinates, [ lon2, lat2 ]   ]
		       }
		     };
	   	       
            out.features.push(item);
	    
	    //out[id]=s;
	}
    }
    
    process.stdout.write(JSON.stringify(out,null,2));
}




var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', () => {
    doit(chunks)
});

