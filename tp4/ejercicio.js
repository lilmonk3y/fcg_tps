// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar: 
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.  
// <=====================================================================================================>



// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es 
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla. 

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	var traslacion = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	const cosX = Math.cos(rotationX);
	const senX = Math.sin(rotationX);
	var rotacionX = [
		1, 0, 0, 0,
		0, cosX, senX, 0,
		0, senX*(-1), cosX, 0,
		0, 0, 0, 1
	];

	const cosY = Math.cos(rotationY);
	const senY = Math.sin(rotationY);
	var rotacionY = [
		cosY, 0, senY*(-1), 0,
		0, 1, 0, 0,
		senY, 0, cosY, 0,
		0, 0, 0, 1
	];

	var res = projectionMatrix;
	res = MatrixMult( res, traslacion );
	res = MatrixMult( res, rotacionX);
	res = MatrixMult( res, rotacionY);
	
	// matrix * translation * rotationX * rotationY
	return res; 
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( meshVS, meshFS );
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.uSampler = gl.getUniformLocation(this.prog, 'uSampler');
		this.tEnable_v = gl.getUniformLocation(this.prog, 'tEnabled');

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation( this.prog, 'pos' );
		this.text_coord = gl.getAttribLocation( this.prog, 'attr_text_coord' );
		
		// 4. Obtenemos los IDs de los atributos de los vértices en los shaders

		this.traingle_buffer = gl.createBuffer();
		this.texture_buffer = gl.createBuffer();
		this.texture = gl.createTexture();

		this.swap = false;
		this.tEnabled = true;
		this.tLoaded = false;
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float. 
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las cooredenadas de textura se componen de a 2 elementos consecutivos y se 
	// asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices
		this.numTriangles = vertPos.length / 3 / 3;

		// Buffer de coordenadas de triangulos
		gl.bindBuffer(gl.ARRAY_BUFFER, this.traingle_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		// Debatible, no se si esto si quiera se pasa a la placa
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		this.swap = swap;
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw( trans )
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );

		if (this.swap) {
			trans = GetModelViewProjection( trans, 0, 0, 0, 4.71239, 0);
		}
		// 2. Setear matriz de transformacion
		gl.uniformMatrix4fv( this.mvp, false, trans);
		
		gl.uniform1f(this.tEnable_v, this.tEnabled && this.tLoaded ? 1.0 : 0.0);
 
		// 3.Binding de los buffers
		gl.bindBuffer( gl.ARRAY_BUFFER, this.traingle_buffer);

		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );
		
		// Textura
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texture_buffer);
		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.text_coord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.text_coord );

		// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles*3);
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( image )
	{	
		this.tLoaded = true;
		// Cortesia de https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
			gl.RGBA, gl.UNSIGNED_BYTE, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		gl.useProgram( this.prog );
		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);
		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(this.uSampler, 0);
	}

	isPowerOf2(value) {
		return (value & (value - 1)) == 0;
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		this.tEnabled = show;
	}
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var meshVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	attribute vec2 attr_text_coord;
	
	varying vec2 var_text_coord;

	void main()
	{ 
		gl_Position = mvp * vec4(pos,1);
		
		var_text_coord = attr_text_coord;
	}
`;

// Fragment Shader
var meshFS = `
	precision mediump int;
	precision mediump float;

	// The texture unit to use for the color lookup
	uniform sampler2D uSampler;
	uniform float tEnabled;

	// Data coming from the vertex shader
	varying vec2 var_text_coord;
	
	void main() {
		gl_FragColor = tEnabled * texture2D(uSampler, var_text_coord) + (1.0 - tEnabled) * vec4(1.0, 0.0, 0.0, 1.0);
	}
`;

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(image) {
	const texture = gl.createTexture();

	const level = 0;
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				srcFormat, srcType, image);

	// WebGL1 has different requirements for power of 2 images
	// vs non power of 2 images so check if the image is a
	// power of 2 in both dimensions.
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		// Yes, it's a power of 2. Generate mips.
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		// No, it's not a power of 2. Turn off mips and set
		// wrapping to clamp to edge
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	return texture;
}
  
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}