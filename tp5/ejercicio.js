// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal  	 (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
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
	
	res = trans;
	res = MatrixMult( res, rotacionX);
	res = MatrixMult( res, rotacionY);
	
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
		this.mv = gl.getUniformLocation( this.prog, 'mv');
		this.mn = gl.getUniformLocation( this.prog, 'mn');
		this.uSampler = gl.getUniformLocation(this.prog, 'uSampler');
		this.tEnable_v = gl.getUniformLocation(this.prog, 'tEnabled');
		this.lSource = gl.getUniformLocation(this.prog, 'lSource');
		this.alpha = gl.getUniformLocation(this.prog, 'alpha');

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation( this.prog, 'pos' );
		this.texCoord = gl.getAttribLocation( this.prog, 'attrTexCoord');
		this.normCoord = gl.getAttribLocation( this.prog, 'attrNormCoord');
		
		// 4. Obtenemos los IDs de los atributos de los vértices en los shaders

		this.traingle_buffer = gl.createBuffer();
		this.texture_buffer = gl.createBuffer();
		this.normal_buffer = gl.createBuffer();
		this.texture = gl.createTexture();

		this.swap = false;
		this.tEnabled = true;
		this.tLoaded = false;	
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices
		this.numTriangles = vertPos.length / 3 / 3;

		// Buffer de coordenadas de triangulos
		gl.bindBuffer(gl.ARRAY_BUFFER, this.traingle_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		// Coordenadas de la textura
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		
		// Normales
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		this.swap = swap;
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );

		if (this.swap) {
			var yzRotation = GetModelViewMatrix(0, 0, 0, 4.71239, 0);
			matrixMVP = MatrixMult(matrixMVP, yzRotation);
			matrixMV = MatrixMult(matrixMV, yzRotation);
			matrixNormal = [ matrixMV[0],matrixMV[1],matrixMV[2], matrixMV[4],matrixMV[5],matrixMV[6], matrixMV[8],matrixMV[9],matrixMV[10] ];
		}
		// 2. Setear matriz de transformacion
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv( this.mv, false, matrixMV);

		var matrixT = math.matrix(
			[
				[matrixNormal[0],matrixNormal[3],matrixNormal[6]],
				[matrixNormal[1],matrixNormal[4],matrixNormal[7]],
				[matrixNormal[2],matrixNormal[5],matrixNormal[8]]
			]
		);
		var mn = math.transpose(math.inv(matrixT))
		gl.uniformMatrix3fv( this.mn, false, [
			mn.get([0,0]),
			mn.get([1,0]),
			mn.get([2,0]),
			mn.get([0,1]),
			mn.get([1,1]),
			mn.get([2,1]),
			mn.get([0,2]),
			mn.get([1,2]),
			mn.get([2,2])
		]);

		gl.uniform1f(this.tEnable_v, this.tEnabled && this.tLoaded ? 1.0 : 0.0);
 
		// 3.Binding de los buffers
		gl.bindBuffer( gl.ARRAY_BUFFER, this.traingle_buffer);
		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );
		
		// Textura
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texture_buffer);
		// Habilitamos el atributo
		gl.vertexAttribPointer( this.texCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoord );

		// Textura
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normal_buffer);
		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.normCoord, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normCoord );

		// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles*3);
	}
		
	isPowerOf2(value) {
		return (value & (value - 1)) == 0;
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
		if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
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
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		this.tEnabled = show;
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram(this.prog);
		gl.uniform3fv(this.lSource,  [x,y,z]);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram(this.prog);
		gl.uniform1f(this.alpha, shininess);
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec2 attrTexCoord;
	attribute vec3 attrNormCoord;

	uniform mat4 mvp;
	uniform mat4 mv;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;
	
	varying vec3 camaraVec;

	void main()
	{
		normCoord = attrNormCoord;
		camaraVec = -1.0 * (mv * vec4(attrNormCoord,1.0)).xyz;
		vertCoord = mvp * vec4(pos,1);
		texCoord = attrTexCoord;

		gl_Position = vertCoord;
		
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

var meshFS = `
	precision mediump int;
	precision mediump float;

	uniform sampler2D uSampler;
	uniform float tEnabled;

	uniform mat3 mn;
	uniform vec3 lSource;
	uniform float alpha;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;
	varying vec3 camaraVec;

	void main() {
		vec4 rgba = tEnabled * texture2D(uSampler, texCoord) + (1.0 - tEnabled) * vec4(1.0, 0.0, 0.0, 1.0);

		vec3 li = vec3(1.0, 1.0, 1.0);

		vec3 kd = rgba.xyz;
		vec3 ks = vec3(1.0, 1.0, 1.0);
		vec3 mvNorm = mn * normCoord;

		vec3 lv = lSource + camaraVec;
		vec3 h = lv / normalize(lv);
		float cos_w = dot(mvNorm, h);
		float cos_t = dot(mvNorm, lSource);

		vec3 c = li * max(0.0, cos_t) * (kd + ks * pow(max(0.0, cos_w), alpha) / cos_t); 
		//c = vec3(cos_t,cos_t,cos_t);
		gl_FragColor = vec4(c, 1.0);
	}
	

`;
