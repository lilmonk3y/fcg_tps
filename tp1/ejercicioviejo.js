// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function dither(image, factor)
{
    //floyd(image, factor);
    jarvis(image, factor);
}

function floyd(image, factor) {
	// completar
    for (var i = 0; i < image.height; i++) {
    	for (var j = 0; j < image.width; j++) {
    		for (var k = 0; k < 4; k++) {
    			pixelChannelIndex = i * image.width * 4 + j * 4 + k;
    			oldPixelChannel = image.data[pixelChannelIndex];
    			newPixelChannel = clampPixel(oldPixelChannel, factor);

    			image.data[pixelChannelIndex] = newPixelChannel;
    			error = oldPixelChannel - newPixelChannel;

  				modifyNeighborhoodFloyd(image, i, j, pixelChannelIndex)
    		}
    	}
    }
}

function jarvis(image, factor) {
	// completar
    for (var i = 0; i < image.height; i++) {
    	for (var j = 0; j < image.width; j++) {
    		for (var k = 0; k < 4; k++) {
    			pixelChannelIndex = i * image.width * 4 + j * 4 + k;
    			oldPixelChannel = image.data[pixelChannelIndex];
    			newPixelChannel = clampPixel(oldPixelChannel, factor);

    			image.data[pixelChannelIndex] = newPixelChannel;
    			error = oldPixelChannel - newPixelChannel;

  				modifyNeighborhoodJarvis(image, i, j, pixelChannelIndex)
    		}
    	}
    }
}

function clampPixel(value, factor) {
	spacing = 255.0 / factor;
	factorIndex = Math.round(value * 1.0/ spacing);
	return Math.round((factorIndex * spacing));
}

function modifyNeighborhoodFloyd(image, i, j, pixelChannelIndex) {
	if (i < image.height - 1) {
		image.data[pixelChannelIndex + image.width * 4] = Math.floor(image.data[pixelChannelIndex + (image.width) * 4] +error * 5.0 / 16);
		if (j > 0) {
			image.data[pixelChannelIndex + (image.width - 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width - 1) * 4] + error * 3.0 / 16);
		}
		if (j < image.width - 1) {
			image.data[pixelChannelIndex + (image.width + 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width + 1) * 4] +error * 1.0 / 16);
		}
	}

	if (j < image.width - 1) {
		image.data[pixelChannelIndex + 4] = Math.floor(image.data[pixelChannelIndex + 4] + error * 7.0 / 16);
	}
}

function modifyNeighborhoodJarvis(image, i, j, pixelChannelIndex) {
	if (i < image.height - 2) {
		image.data[pixelChannelIndex + image.width * 4] = Math.floor(image.data[pixelChannelIndex + (image.width * 2) * 4] +error * 5.0 / 48);
		if (j > 0) {
			image.data[pixelChannelIndex + (image.width * 2 - 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width * 2 - 1) * 4] + error * 3.0 / 48);
		}
		if (j > 1) {
			image.data[pixelChannelIndex + (image.width * 2 - 2) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width * 2 - 2) * 4] + error * 1.0 / 48);
		}

		if (j < image.width - 1) {
			image.data[pixelChannelIndex + (image.width * 2 + 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width * 2 + 1) * 4] +error * 3.0 / 48);
		}
		if (j < image.width - 2) {
			image.data[pixelChannelIndex + (image.width * 2 + 2) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width * 2 + 2) * 4] +error * 1.0 / 48);
		}
	}

	if (i < image.height - 1) {
		image.data[pixelChannelIndex + image.width * 4] = Math.floor(image.data[pixelChannelIndex + (image.width) * 4] + error * 7.0 / 48);
		if (j > 0) {
			image.data[pixelChannelIndex + (image.width - 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width - 1) * 4] + error * 5.0 / 48);
		}
		if (j > 1) {
			image.data[pixelChannelIndex + (image.width - 2) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width - 2) * 4] + error * 3.0 / 48);
		}

		if (j < image.width - 1) {
			image.data[pixelChannelIndex + (image.width + 1) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width + 1) * 4] +error * 3.0 / 48);
		}
		if (j < image.width - 2) {
			image.data[pixelChannelIndex + (image.width + 2) * 4] = Math.floor(image.data[pixelChannelIndex + (image.width + 2) * 4] +error * 5.0 / 48);
		}
	}

	if (j < image.width - 2) {
		image.data[pixelChannelIndex + 8] = Math.floor(image.data[pixelChannelIndex + 8] + error * 5.0 / 48);
	}

	if (j < image.width - 1) {
		image.data[pixelChannelIndex + 4] = Math.floor(image.data[pixelChannelIndex + 4] + error * 7.0 / 48);
	}
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
{
    // completar
}