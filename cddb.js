/** Takes a 8-character hex string and generates state and color grids.
 * The input string is assumed to be a cddb id, so there are some bits that
 * rarely or never change. We minimize their effect by using them as the least
 * signigicant bits in the colors.
 */
function cddbToGrid(cddb) {
    //convert a 32-bit cddb string to a 9-bits of state and 15 bits of color.
    //a state of True means filled, not recursing
    var states8 = parseInt(cddb.substring(0, 2), 16) ;  //8 bits, track time checksum
    var states1 = parseInt(cddb.substring(5, 6), 16) % 2 ;  //1 bit, last bit of total time
    var statesBits = (states8 << 1) + states1 ;   //append the bit

    //we only need as many colors as there are non-recursing cells
    var numFilled = 0 ;

    var states = [] ;

    for(var i = 0 ; i < 9 ; i++) {
        stateval = ((statesBits % 2) == 1) ;   //last bit
        states[i] = stateval ;
        if(stateval) {
            numFilled++ ;
        }
        statesBits >>= 1 ;
    }

    //There is a 1/512 chance that all the state bits will recursing
    //check for that, and in that case invert one of them
    //all non-recursing is boring but will display
    if(numFilled == 0) {
        statesBits[4] = !statesBits[4] ;
        numFilled = 1;
    }

    var colorPalette = [] ;

    //15 bits, total time. First is almost always 0, 1 if over 68 minutes.
    var colors15 = parseInt(cddb.substring(2, 6), 16) >> 1 ;   
    //we should pick off the LSBs and feed them to the front of the three colors

    //last 8 bits, number of tracks 
    //usually close to 15, not random enough
    var last8 = parseInt(cddb.substring(6), 16) ;  

    //extend the palette to the number of filled cells
    for(var i = 0 ; i < numFilled ; i++) {
        colorPalette[i] = 0 ;
    }

    var idx = 0 ;

    //deal the bits off the tail to the palette trays
    for(var i = 0 ; i < 15 ; i++) {
        idx = i % numFilled ;
        let lsb = colors15 % 2 ;

        colorPalette[idx] = (colorPalette[idx] << 1) + lsb ;
        colors15 >>= 1 ;        
    }

    console.log(colorPalette) ;

    var colors = [] ;

    for(var i = 0 ; i < 9 ; i++) {
        if(states[i]) {
            colors[i] = intToRGB(colorPalette.pop()) ;
        } else {
            colors[i] = "#000000" ;
        }
    }

    console.log(colors) ;
    
    //temporary hack - reverse the states, because is everything is coming out black and white
    for(var i = 0; i < 9 ; i++) {
        states[i] = !states[i] ;
    }

    let slicedStates = [
        states.slice(0, 3),
        states.slice(3, 6),
        states.slice(6),
    ]

    let slicedColors = [
        colors.slice(0, 3),
        colors.slice(3, 6),
        colors.slice(6),
    ]

    return {
        "states": slicedStates,
        "colors": slicedColors
    } ;
}

function intToRGB(n) {
    //convert an integer of any size to a 24-bit color, 
    //round-robin the least significant bits to the the three channels
    var cols = [
        0,0,0
    ]

    for(var i = 0 ; i < 24; i++) {
        let bit = n % 2 ;
        let idx = i % 3 ;
        cols[idx] = cols[idx] * 2 + bit ;
        n >>= 1 ;
    }

    
    
    var rgbStr = "" ;


    for(var i = 0 ; i < 3 ; i++) {
        //Since we have few bits to work with, most colors will be mostly zero. 
        //We prefer bright colors, so invert the bits.        
        let chan =  (cols[i]).toString(16) ;
        if(chan.length == 1) {  //pad
            chan = "0" + chan ;
        }
        rgbStr += chan;
    }

    rgbStr = "#" + rgbStr ;

    return rgbStr ;
    // return cols ;
}

function main() {
    // process.argv.forEach(element => {
    //     console.log(element) ;
    // });
    process.argv.shift() ; //node
    process.argv.shift() ; //this script

    var firstArg = process.argv.shift() ;
    console.log("arg:", firstArg)

    var num = parseInt(firstArg, 16) ;
    // console.log(num) ;
    console.log(cddbToGrid(firstArg)) ;
    // console.log(intToRGB(num)) ;
}

main() ;
