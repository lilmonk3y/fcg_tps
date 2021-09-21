// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform( positionX, positionY, rotation, scale )
{
	var transformacionEscala = Array(scale,0,0,0,scale,0,0,0,1);
	rotation = rotation * Math.PI/180;
	var transformacionRotacion = 
		Array(Math.cos(rotation),Math.sin(rotation),0,-Math.sin(rotation),Math.cos(rotation),0,0,0,1);
	var transformacionTraslacion = Array(1,0,0,0,1,0,positionX,positionY,1);
	
	var primerProducto = productoMatriz(transformacionRotacion, transformacionEscala);
	return ComposeTransforms(ComposeTransforms(transformacionEscala, transformacionRotacion), transformacionTraslacion);
}

function productoMatriz(matriz1, matriz2){
	if (matriz1.length != matriz2.length) console.log("Matrices tienen dimensiones distintas")
	var result = Array()
	var matrixSquareDimension = Math.round(Math.sqrt(matriz1.length));
	for (j = 0; j < matrixSquareDimension; j++) {
		for(i = 0; i < matrixSquareDimension; i++) {
			var sum = 0;
			for (k = 0; k < matrixSquareDimension; k++) {
				sum += matriz1[i + k * 3] * matriz2[j * 3 + k]
			}
			result.push(sum)
		}
	}
	return result;
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms( trans1, trans2 )
{
	return productoMatriz(trans2, trans1);
}


