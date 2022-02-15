function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY, rotationZ, scaleFactor=1 )
{
	// Matriz de escalamiento uniforme en formato Column - Major
	var scale = [
		scaleFactor, 0, 0, 0,
		0, scaleFactor, 0, 0,
		0, 0, scaleFactor, 0,
		0, 0, 0, 1
	];
	// Matriz de traslación en formato Column - Major
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// matriz de rotación (column major)
	let r00 = Math.cos(rotationZ) * Math.cos(rotationY);
	let r01 = Math.cos(rotationZ) * Math.sin(rotationY) * Math.sin(rotationX) - Math.sin(rotationZ) * Math.cos(rotationX);
	let r02 = Math.cos(rotationZ) * Math.sin(rotationY) * Math.cos(rotationX) + Math.sin(rotationZ) * Math.sin(rotationX);

	let r10 = Math.sin(rotationZ) * Math.cos(rotationY);
	let r11 = Math.sin(rotationZ) * Math.sin(rotationY) * Math.sin(rotationX) + Math.cos(rotationZ) * Math.cos(rotationX);
	let r12 = Math.sin(rotationZ) * Math.sin(rotationY) * Math.cos(rotationX) - Math.cos(rotationZ) * Math.sin(rotationX);

	let r20 = - Math.sin(rotationY);
	let r21 = Math.cos(rotationY) * Math.sin(rotationX);
	let r22 = Math.cos(rotationY) * Math.cos(rotationX);
	var rotations = [
		r00,	r10,	r20,	0,
		r01,	r11,	r21,	0,					
		r02,	r12,	r22,	0,					
		0,		0,		0,		1					
	];

	var mv = MatrixMult(trans, MatrixMult(rotations, scale));

	// rotations trasformation * scale transformation * translation transformation.
	return mv;
}

// matrix is column major
function transposeMatrix(matrix){
	return [matrix[0], matrix[1], matrix[2], matrix[4], matrix[5], matrix[6], matrix[8], matrix[9], matrix[10]];
}

function normalize(a) {
	let vectorLength = 0;
	let c = [];
	for (i = 0; i < a.length; i++) {
		vectorLength += (a[i] ** 2);
	}
	vectorLength = Math.sqrt(vectorLength);
	for (i = 0; i < a.length; i++) {
		c.push(a[i] / vectorLength);
	}
	return c;
}

function add_vector(a, b) {
	let c = []
	for (i = 0; i < a.length; i++) {
		c.push(a[i] + b[i]);
	}
	return c;
}

function substract_vector(a, b) {
	let c = []
	for (i = 0; i < a.length; i++) {
		c.push(a[i] - b[i]);
	}
	return c;
}

function multiply_vector(a, k) {
	let c = []
	for (i = 0; i < a.length; i++) {
		c.push(a[i] * k);
	}
	return c;
}

function cross_product(a, b) {
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// Multiplica 2 matrices y devuelve A*B.
// Los argumentos y el resultado son arreglos que representan matrices en orden column-major
function MatrixMult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) 
	{
		for ( var j=0; j<4; ++j ) 
		{
			var v = 0;
			for ( var k=0; k<4; ++k ) 
			{
				v += A[j+4*k] * B[k+4*i];
			}

			C.push(v);
		}
	}
	return C;
}

function isIndexOfPlanet(key){
	return parseInt(key) > -1 && parseInt(key) < 9;
}