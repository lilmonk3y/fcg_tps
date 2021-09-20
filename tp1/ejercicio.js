// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function dither(image, factor)
{
    ditherAlgorithm(image, factor, FLOYD_NEIGHBORHOOD);
    //ditherAlgorithm(image, factor, JARVIS_NEIGHBORHOOD)
}


/*
    Cada elemento de un vecindario es un ofset en x, un offset en y y un porcentaje del error a repartir.
    Así entonces: [offset en x, offset en y, porcentaje del error a repartir]
*/
var FLOYD_NEIGHBORHOOD = [ [0,1,7 / 16], [1,1,1/16], [1,0,5/16], [1,-1,3/16]];
var JARVIS_NEIGHBORHOOD = [ [0,1,7/48], [0,2,5/48], [1,-2,3/48], [1,-1,5/48], [1,0,7/48], [1,1,5/48], [1,2,3/48], [2,-2,1/48], [2,-1,3/48], [2,0,5/48], [2,1,3/48], [2,2,1/48]];



function ditherAlgorithm(image, factor, errorNeighborhood)
{
    forEachPixelAndColor(function(alto,ancho,color){
        var oldColor = getPixel(image, alto, ancho, color);
        var newColor = clampPixel(oldColor, factor);

        updatePixel(image,alto,ancho,color, newColor);

        // repartir el error
        var error = oldColor - newColor;
        errorNeighborhood.forEach(vecino => updatePixelWithError(image,alto,ancho,color,error, vecino));
    }, image);
}

function forEachPixelAndColor(applyFunction,image){
    for(var alto = 0; alto < image.height; alto++){
        for(var ancho = 0; ancho < image.width; ancho++){
            for(var color = 0; color < 4; color++){
                applyFunction(alto,ancho,color);
            }
        }
    }
}

function clampPixel(value, factor) {
	var spacing = 255.0 / factor;
	var factorIndex = Math.round(value * 1.0/ spacing);
	return Math.round((factorIndex * spacing));
}

function getPixel(image,alto,ancho,color){
    return image.data[pixelCoordenate(image, alto, ancho, color)];
}

function pixelCoordenate(image, alto, ancho, color){
    return (image.width * 4 * alto) + (ancho * 4) + color;
}

function updatePixel(image,alto,ancho,color,value){
    image.data[pixelCoordenate(image, alto, ancho, color)] = value;
}

function updatePixelWithError(image,alto,ancho,color,error,vecino){
    let altoVecino = alto + vecino[0];
    let anchoVecino = ancho + vecino[1];
    let porcentajeDeError = error * vecino[2];

    if( (anchoVecino < image.width) && (altoVecino < image.height) && (anchoVecino >= 0) ){
        let nuevoColor = porcentajeDeError + getPixel(image,altoVecino,anchoVecino,color);
        let nuevoColorOBlanco = nuevoColor > 255 ? 255 : Math.floor(nuevoColor);
        image.data[pixelCoordenate(image, altoVecino, anchoVecino, color)] =  nuevoColorOBlanco;
    }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
{
    forEachPixelAndColor(function(alto,ancho,color){
        // omitimos la cuarta componente que es la transparencia
        if(color != 3){
            let pixelDifference = getPixel(imageA,alto,ancho,color) - getPixel(imageB,alto,ancho,color);
            let differenceOrZero = pixelDifference < 0 ? 0 : pixelDifference;
            updatePixel(result,alto,ancho,color, differenceOrZero);
        } 
    },imageA);      
}