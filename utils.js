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