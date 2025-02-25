#!/usr/bin/env node


import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync,readFileSync } from "fs"
import { intToRGBA, cssColorToHex, colorDiff } from "@jimp/utils";


/*
function rgbaToHex(red, green, blue, alpha) {
    const rgba = (red << 24) | (green << 16) | (blue << 8) | (alpha <<0) ;
  return '#' + (0x100000000 + rgba).toString(16).slice(1);
}

function intToHex(color){
    return Number((0x1000000FF + color<8).toString(16).slice(1));
}
*/

// set and get for ping
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

function H(idx){
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

let ncols=15401;
let nrows=9121;

// read ersi ascii file (needs: split.sh)
function readHoehe(){
    for(let y=0;y<nrows;y++){
	 let formatter = new Intl.NumberFormat('de-CH',{ minimumIntegerDigits: 6, useGrouping: false});
	let file='lines/'+formatter.format(y+7)+'.txt';
	 //process.stderr.write(file+'\n');


	let text=readFileSync(file,'utf-8');
	process.stderr.write('+')
	 let array=text.split(' ');
	 for(let x=0;x<ncols;x++){
	     let item=Number(array[x]);
	     if(item>0){
		 let ele=item-50.0;
                 setHoehe(ele,x,y);
		 
	     } 
	 }
    }
}


function makeSlope(){
    let disp=1;
    for(let x=disp;x<ncols-disp;x++){
	//process.stderr.write('.');
	for(let y=disp;y<nrows-disp;y++){

	    let slope;
	    let aspect;

            /*
            let N= getHoehe(x,y-disp);
            let S= getHoehe(x,y+disp);
            let E= getHoehe(x+disp,y);
            let W= getHoehe(x-disp,y);
            //let C= getHoehe(x,y);
            */
	    
            let zFactor=1.0/25.0

	    let r=4*ncols;
	    let i=4*(y*ncols+x)
	    let H11= H(i-r-4);
	    let H13= H(i-r+4);
	    let H31= H(i+r-4);
	    let H33= H(i+r+4);
	    
	    let dzdy = ( H11 + 2*H(i-r) + H13 - H31 - 2*H(i+r) - H33 ) / 8.0
	    let dzdx = ( H11 + 2*H(i-4) + H31 - H13 - 2*H(i+4) - H33 ) / 8.0
/*		
	    let N= ( 2*getHoehe(x,y-disp) + getHoehe(x-disp,y-disp) + getHoehe(x+disp,y-disp ) ) / 4.0
	    let S= ( 2*getHoehe(x,y+disp) + getHoehe(x-disp,y+disp) + getHoehe(x+disp,y+disp ) ) / 4.0
	    let E= ( 2*getHoehe(x+disp,y) + getHoehe(x+disp,y-disp) + getHoehe(x+disp,y+disp ) ) / 4.0
	    let W= ( 2*getHoehe(x-disp,y) + getHoehe(x-disp,y-disp) + getHoehe(x-disp,y+disp ) ) / 4.0
            let dzdy=N-S;
	    let dzdx=E-W;
*/
            //console.log(N+' '+S+' '+E+' '+W);
	    
	    let dx=2*disp;
	    let dy=2*disp;

	    dzdx= dzdx/dx;
	    dzdy= dzdy/dy;

	    let d2=zFactor*Math.sqrt( dzdx*dzdx + dzdy*dzdy)

	    //if(d2>0)console.log(d2+' '+dzdy+' '+dzdx);
	    
	    slope=Math.atan(d2) * (180 / Math.PI);
	    aspect = dx !== 0 // counterclockwise from east
		? ( Math.atan2( dzdy, dzdx ) * (180 / Math.PI) + 180 ) % 360
		: ( 90 * (dy > 0 ? 1 : -1) + 180 ) % 360;

            /*
	    slope=Math.atan( zFactor*( dzdx*dzdy + dzdy*dxdy));
	    if(dx!==0){
		aspect= Math.atan2(dzdy,dzdy)
	    }else{
		aspect= Math.PI/2.0;
		if(dy<0)aspect*=-1.0
	    }
	    */		     
	    
	    setSlope(slope,aspect,x,y);
	}	
    }
}


// main

//let image= new Jimp({ width: ncols, height: nrows, color: 0x000000ff });
let image = await Jimp.read('dhm25-0.png');

let data= image.bitmap.data;

//readHoehe();
//await image.write('dhm25-0.png');

//process.exit(0);

makeSlope();
await image.write('dhm25.png');

