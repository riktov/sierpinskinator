/* sierpinski.js */
console.log("This is Sierpinski") ;
"use strict" ;

let radioSquare = document.getElementById("radio_square") ;
let radioCircle = document.getElementById("radio_circle") ;
let radioDiamond = document.getElementById("radio_diamond") ;
let colorPicker = document.getElementById("colorpicker_wrapper") ;
let modeButton = document.getElementById("mode_button") ;
let randomStatesButton = document.getElementById("random_states_button") ;
let shuffleColorsButton = document.getElementById("shuffle_colors_button") ;
let scaleUpButton = document.getElementById("scale_up_button") ;
let scaleDownButton = document.getElementById("scale_down_button") ;
let pasteButton = document.getElementById("paste_button") ;

var isPlayMode = true ;

var scale = 4 ;
var orderX = 3 ;
var orderY = 3 ;

//true means recurse, false means solid
var states = [
    [true, true, true],
    [true, false, true],
    [true, true, true],
] ;

var colors = [
    ["blue", "green", "red"],
    ["orange", "black", "purple"],
    ["cyan", "magenta", "yellow"],
] ;


var paletteSelection = {} ;
var savedColor = null ;

var canvas=document.getElementById('sierpinski') ;
console.log("Canvas:", canvas) ;
	
function draw() {
    var ctx ;
    if(canvas.getContext){
        ctx = canvas.getContext('2d') ;
    } else {
        return null;
    }

    var image = renderCell(canvas.width) ;

    ctx.putImageData(image, 0, 0) ;
	setFavicon() ;
}

function filledCell(width, colorStr) {
	var cv = document.createElement("canvas") ;
	cv.width = width ;
	cv.height = width ;
	var ctx = cv.getContext("2d") ;//ready to draw into
	ctx.fillStyle = colorStr ;
	
	//ctx.fillRect(0, 0, width/2, width/2) ;
	//ctx.fillRect(0, width/2, width/2, width/2) ;
	if(radioSquare.checked) {
		ctx.fillRect(0, 0, width, width) ;
	}
	if(radioDiamond.checked) {
		ctx.beginPath();
		ctx.moveTo(width/2, 0);
		ctx.lineTo(width, width/2);
		ctx.lineTo(width/2, width);
		ctx.lineTo(0, width/2);
		ctx.fill() ;
	}
	if(radioCircle.checked) {
		ctx.arc(width/2, width/2, width/2, 0, 2 * Math.PI);
		ctx.fill() ;
	}

	return ctx.getImageData(0, 0, width, width) ;
}

function filledPaletteCell(width, colorStr) {
	var cv = document.createElement("canvas") ;
	cv.width = width ;
	cv.height = width ;
	var ctx = cv.getContext("2d") ;//ready to draw into
	ctx.fillStyle = colorStr ;
	
	//ctx.fillRect(0, 0, width/2, width/2) ;
	//ctx.fillRect(0, width/2, width/2, width/2) ;
	var inset = 10 ;

	ctx.fillRect(inset, inset, width - (2 * inset), width - (2 * inset)) ;

	return ctx.getImageData(0, 0, width, width) ;
}

function drawCellBorder(row, column) {
	var ctx = canvas.getContext("2d") ;//ready to draw into
	
	//ctx.fillRect(0, 0, width/2, width/2) ;
	//ctx.fillRect(0, width/2, width/2, width/2) ;

	subWidth = canvas.width / orderX ;
	subHeight = canvas.height / orderY ;
	originX = column * subWidth ;
	originY = row * subHeight ;
	
	ctx.strokeStyle = "gray" ;
	ctx.lineWidth = 5;
	ctx.strokeRect(originX + ctx.lineWidth / 2, originY + ctx.lineWidth/2, subWidth - ctx.lineWidth, subWidth - ctx.lineWidth) ;
//	ctx.fillRect(originX , originY, inset, inset) ;	
}

function renderCell(width) {
	if(width < 3) {
		return null ;
	}
	
	var subDim = width / 3 ;
	
	var tiledCanvas = document.createElement("canvas") ;
	tiledCanvas.width = width ;
	tiledCanvas.height = width ;
 	var tiledImg = tiledCanvas.getContext("2d") ;//ready to draw into
 
//     tiledImg.fillRect(0, 0, width, width) ;
	
// 	var solidSubImg = null ; 
	var recursedSubImg = null ;
  
  //console.log("Start generating image for size ", width) ;
  for(var row = 0 ; row < states.length ; row++) {
    for(var col = 0 ; col < states[0].length ; col++) {
		//console.log(col, row) ;
      if(!states[row][col]) {
		  //console.log("Solid square", width) ;
        //if(solidSubImg == null) {
          //solidSubImg = filledCell(subDim, "black") ;
         // solidSubImg = filledCell(subDim, 'rgb(200, 100, 0)') ;
        //}
        tiledImg.putImageData(filledCell(subDim, colors[row][col]), col * subDim, row * subDim) ;
//        tiledImg.putImageData(solidSubImg, col * subDim, row * subDim) ;
        //tiledImg.copy(solidImg, 0, 0, subDim, subDim, col * subDim, row * subDim, subDim, subDim) ;
      } else {
		//console.log("Recursing square:", width) ;
        if(recursedSubImg == null) {//not initialized
        	recursedSubImg = renderCell(subDim) ;
        }  
        if(recursedSubImg != null) {
        	tiledImg.putImageData(recursedSubImg, col * subDim, row * subDim) ;
        } else {//bottomed out
        	//tiledImg.putImageData(filledCell(subDim, "pink"), col * subDim, row * subDim) ;		
		}
      }
    }
  }
  //console.log("Finished generating image for size ", width) ;
  return tiledImg.getImageData(0, 0, width, width) ;
}

function setFavicon() {
// 	var link = document.createElement('link');
//     link.type = 'image/x-icon';
//     link.rel = 'shortcut icon';
//     link.href = canvas.toDataURL("image/x-icon");
//     document.getElementsByTagName('head')[0].appendChild(link);

	var favIconCanvas = document.createElement("canvas") ;
	favIconCanvas.width = 32 ;
	favIconCanvas.height = 32 ;
 	var favIconImg = favIconCanvas.getContext("2d") ;//ready to draw into
 
	let scaleWidth = 32 / canvas.width ;
	let scaleHeight = 32 / canvas.height ;
	favIconImg.scale(scaleWidth, scaleHeight) ;
	favIconImg.drawImage(canvas, 0, 0) ;
	
	let link = document.getElementById("shortcut_icon") ;
	link.href = favIconCanvas.toDataURL("image/x-icon");
}
//Get Mouse Position
function getMouseGridPos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((orderX * (evt.clientX - rect.left)) / rect.width),
        y: Math.floor((orderY * (evt.clientY - rect.top)) / rect.height)
    };
}

function drawPalette() {
	var ctx ;
    if(canvas.getContext){
        ctx = canvas.getContext('2d') ;
    } else {
        return null;
    }
    
	var width = canvas.width ;
	var subDim = width / 3 ;
	
	var tiledCanvas = document.createElement("canvas") ;
	tiledCanvas.width = width ;
	tiledCanvas.height = width ;
	var tiledImg = tiledCanvas.getContext("2d") ;//ready to draw into
	
	for(var row = 0 ; row < colors.length ; row++) {
		for(var col = 0 ; col < colors[0].length ; col++) {
			tiledImg.putImageData(filledPaletteCell(subDim, colors[row][col]), col * subDim, row * subDim) ;
		}
	}
	
	ctx.putImageData(tiledImg.getImageData(0, 0, width, width), 0, 0) ;
// 	placeColorPickers(canvas) ;
}

function onModeButtonClick() {
	if(isPlayMode) {
		//switch to palette mode
		paletteMode() ;
	} else {
		playMode() ;
	}
}

function paletteMode() {
	isPlayMode = false ;
	modeButton.innerHTML = "Done" ;
	$(colorPicker).show() ;
	$(".PlayControls button, .PlayControls input").prop("disabled", true) ;
	pasteButton.disabled = true ;
	drawPalette() ;
	selectCellToChange(0, 0) ;
}

function playMode() {
	isPlayMode = true ;
	modeButton.innerHTML = "Change Colors" ;
	$(colorPicker).hide() ;
	$(".PlayControls button, .PlayControls input").prop("disabled", false) ;
	draw() ;
}


function selectCellToChange(row, column) {
	paletteSelection.column = column ;
	paletteSelection.row = row ;
	drawPalette() ;
	drawCellBorder(row, column) ;
	let selectedCellColor = colors[row][column] ;
	console.log("Selected cell color: ", "#" + selectedCellColor) ;
	
	$("#colorpicker").spectrum("set", selectedCellColor);
}


function onCopyColor() {
	savedColor = colors[paletteSelection.row][paletteSelection.column] ;
	pasteButton.disabled = false ;
}

function onPasteColor() {
	colors[paletteSelection.row][paletteSelection.column] = savedColor ;
	drawPalette();
	drawCellBorder(paletteSelection.row, paletteSelection.column) ;
	$("#colorpicker").spectrum("set", savedColor);
}

function randomizeStates() {
	for(var row = 0 ; row < states.length ; row++) {
		for(var col = 0 ; col < states[0].length ; col++) {
			states[row][col] = (Math.random() < 0.5)
		}
	}
	draw() ;
}

function shuffle(arr) {
    var i;
    for (i = arr.length - 1; i > 0; i--) {
        let selectedIdx = Math.floor(Math.random() * (i + 1));
        let tailVal = arr[i];
        arr[i] = arr[selectedIdx];
        arr[selectedIdx] = tailVal;
    }
    return arr;
}

function shuffleColors() {
	var arrColors = [] ;
	var indices = [] ;
	
	var idxOrig = 0 ;
	
	for(var row = 0 ; row < colors.length ; row++) {
		for(var col = 0 ; col < colors[0].length ; col++) {
			arrColors.push(colors[row][col]) ;
			indices.push(idxOrig) ;
			idxOrig++ ;
		}
	}
	//console.log("arrColors", arrColors) ;
	let shuffled = shuffle(arrColors) ;
	//console.log("shuffled", shuffled) ;
	
	for(var row = 0 ; row < colors.length ; row++) {
		for(var col = 0 ; col < colors[0].length ; col++) {
			colors[row][col] = shuffled.shift() ;
		}
	}
	console.log(colors) ;
	draw() ;
}

function scaleDown() {
	let dim = canvas.getAttribute("width") ;
	canvas.setAttribute("width", dim / 3) ;
	canvas.setAttribute("height", dim / 3) ;
	draw() ;
}

function scaleUp() {
	let dim = canvas.getAttribute("width") ;
	canvas.setAttribute("width", dim * 3) ;
	canvas.setAttribute("height", dim * 3) ;
	draw() ;
}

///////////////////////////////////////////////////////////
// initialize from here

canvas.addEventListener("click", function (evt) {
    var gridPos = getMouseGridPos(canvas, evt);
	if(isPlayMode) {
		let gridState = states[gridPos.y][gridPos.x] ;
		states[gridPos.y][gridPos.x] = !gridState ;
		draw() ;
	} else {
		console.log("Palette Selection: ", paletteSelection) ;
		selectCellToChange(gridPos.y, gridPos.x) ;
	}
}, false);

playMode() ;

$("#colorpicker").spectrum({
	color: "#f00",
	change: function(color) {
		//$("#basic-log").text("change called: " + color.toHexString());
		colors[paletteSelection.row][paletteSelection.column] = color.toHexString() ;
		drawPalette();
		drawCellBorder(paletteSelection.row, paletteSelection.column) ;
	}
});

colorPicker.hidden = true ;
