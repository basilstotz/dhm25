#!/usr/bin/env node


import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync,readFileSync } from "fs"
import { intToRGBA, cssColorToHex, colorDiff } from "@jimp/utils";



function rgbaToHex(red, green, blue, alpha) {
    const rgba = (red << 24) | (green << 16) | (blue << 8) | (alpha <<0) ;
  return '#' + (0x100000000 + rgba).toString(16).slice(1);
}

function intToHex(color){
    return Number((0x1000000FF + color<8).toString(16).slice(1));
}


let ncols=15401;
let nrows=9121;

let blanc=cssColorToHex('rgba(0,0,0,0.0)');
//console.log(blanc);
let image= new Jimp({ width: ncols, height: nrows, color: blanc });

//let dhm25=[]

function lines(num){
    let formatter = new Intl.NumberFormat('de-CH',{ minimumIntegerDigits: 6, useGrouping: false});
    let file=formatter.format(num+7)+'.txt';
    process.stderr.write('.');

    
    let text=readFileSync(file).toString();
    let array=text.split(' ');
    for(let i=0;i<ncols;i++){
	let item=Number(array[i]);
	if(item>0){
	    let c=10*item;
	    //let r=Math.floor(c/(256*256))
	    let g=Math.floor(c/256);
	    let b=Math.round(c-(g*256));
	    //process.stderr.write(item+' '+g+' '+b+'  ');
	    image.setPixelColor(cssColorToHex('rgba(0,'+g+','+b+',1.0)'),i,num)
	} //else{
	    //image.setPixelColor(blanc,i,num)
	//}
    }
  			
}

for(let i=0;i<nrows;i++)lines(i);


await image.write('dhm25.png');

//process.stdout.write(JSON.stringify(dhm25));



/*
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
*/
