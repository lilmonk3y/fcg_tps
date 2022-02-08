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

class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram( meshVS, meshFS );
		this.lightSourceProg = InitShaderProgram( meshVS, lightSourceFS );

		// Get uniforms for planet colors
		//this.objectColor = gl.getUniformLocation(this.prog, 'objectColor');
		//this.lightColor = gl.getUniformLocation(this.prog, 'lightColor');

		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.yz_swap = this.yz_swap = gl.getUniformLocation(this.prog, 'yz_swap');

		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mvpLightSource = gl.getUniformLocation(this.lightSourceProg, 'mvp');

		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mvLightSource = gl.getUniformLocation(this.lightSourceProg, 'mv');

		this.mn = gl.getUniformLocation(this.prog, 'mn');
		this.mnLightSource = gl.getUniformLocation(this.lightSourceProg, 'mn');

		//this.show_texture = gl.getUniformLocation(this.prog, 'show_texture'); 

		//this.light_direction = gl.getUniformLocation(this.prog, 'light_direction'); 
		this.shininess = gl.getUniformLocation(this.prog, 'shininess'); 
		
		this.I = gl.getUniformLocation(this.prog, 'I');
		this.Ks = gl.getUniformLocation(this.prog, 'Ks');
		this.Kd_no_tex = gl.getUniformLocation(this.prog, 'Kd_no_tex');

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation( this.prog, 'pos'); // Vertices 3D consecutivos
		this.posLightSource = gl.getAttribLocation( this.prog, 'pos'); // Vertices 3D consecutivos

		this.vTexCoord = gl.getAttribLocation( this.prog, 'vTexCoord'); // Coordenada 2D de la textura asociadas a los vertices, en orden.
		this.vTexCoordLightSource = gl.getAttribLocation( this.prog, 'vTexCoord'); // Coordenada 2D de la textura asociadas a los vertices, en orden.

		this.normals = gl.getAttribLocation( this.prog, 'normals'); // Normal a cada vertice
		this.normalsLightSource = gl.getAttribLocation( this.prog, 'normals'); // Normal a cada vertice

		// 4. Creamos arreglos para los buffers de cada uno de mis objetos
		this.position_buffer = [];
		this.vTexCoord_buffer = [];
		this.normals_buffer = [];
		this.numTriangles = [];
		
		// 6. Binding del programa y seteo de variables de la formula de iluminacion
		let white = [1.0, 1.0, 1.0, 1.0];
		gl.useProgram(this.prog);
		gl.uniform4fv(this.I, white);
		gl.uniform4fv(this.Ks, white);
		gl.uniform4fv(this.Kd_no_tex, white);
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
	setMesh( drawableObject )
	// Llenar los buffers con los datos cargados por el usuario.
	{

		var vertPos = drawableObject._position;
		var texCoords = drawableObject._texCoord;
		var normals = drawableObject._normals

		drawableObject._numTriangles = vertPos.length / 3 / 3;

		// 1. Binding y seteo del buffer de vértices
		// Fill vertex buffer
		drawableObject._position_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, drawableObject._position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// 2. Binding y seteo del buffer de coordenadas de textura
		// Fill texCoord buffer
		drawableObject._vTexCoord_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, drawableObject._vTexCoord_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// 3. Binding y seteo del buffer de normales
		// Fill normal buffer
		drawableObject._normals_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, drawableObject._normals_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// Binding del programa y seteo de la variable uniforme que indica el estado del checkbox.
		gl.useProgram( this.prog );
		if( swap == true )  {
			gl.uniform1i(this.yz_swap, 1);
		} else {
			gl.uniform1i(this.yz_swap, 0);
		}
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( drawableObject )
	{
		//let white = [1.0, 1.0, 1.0, 1.0];

		var matrixMVP = drawableObject._mvp;
		var matrixMV = drawableObject._mv;
		var matrixNormal = drawableObject._nrmTrans;

		var positionBuffer = drawableObject._position_buffer;
		var normalsBuffer = drawableObject._normals_buffer;
		var texCoordBuffer = drawableObject._vTexCoord_buffer;

		var numTriangles = drawableObject._numTriangles;

		var selectedIdx = drawableObject._selectedPlanetIdx;

		var texture = drawableObject._texture;
		
		if( this.isTheSun(drawableObject) ) {
			gl.useProgram(this.lightSourceProg);

			gl.uniformMatrix4fv( this.mvpLightSource, false, matrixMVP );
			gl.uniformMatrix4fv( this.mvLightSource, false, matrixMV );
			gl.uniformMatrix3fv( this.mnLightSource, false, matrixNormal );

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.vertexAttribPointer( this.posLightSource, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( this.posLightSource );

			gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
			gl.vertexAttribPointer( this.normalsLightSource, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray(this.normalsLightSource);

			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
   			gl.vertexAttribPointer( this.vTexCoordLightSource, 2, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( this.vTexCoordLightSource );

			gl.activeTexture(gl.TEXTURE0);

			gl.bindTexture(gl.TEXTURE_2D, texture);
			var sampler = gl.getUniformLocation(this.lightSourceProg, 'texGPU');
			gl.uniform1i(sampler, selectedIdx);
			
		}else{

			gl.useProgram(this.prog);

			//gl.uniform4fv(this.lightColor, white);
			//gl.uniform4fv(this.objectColor, [1.0, 0.5, 0.31, 1.0]);

			gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
			gl.uniformMatrix4fv( this.mv, false, matrixMV );
			gl.uniformMatrix3fv( this.mn, false, matrixNormal );

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( this.pos );

			gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
			gl.vertexAttribPointer( this.normals, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray(this.normals);

			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
   			gl.vertexAttribPointer( this.vTexCoord, 2, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( this.vTexCoord );

			switch (selectedIdx) {
				case 1:
					gl.activeTexture(gl.TEXTURE1);
					break;
				case 2:
					gl.activeTexture(gl.TEXTURE2);
					break;
				case 3:
					gl.activeTexture(gl.TEXTURE3);
					break;
				case 4:
					gl.activeTexture(gl.TEXTURE4);
					break;
				case 5:
					gl.activeTexture(gl.TEXTURE5);
					break;
				case 6:
					gl.activeTexture(gl.TEXTURE6);
					break;
				case 7:
					gl.activeTexture(gl.TEXTURE7);
					break;
				case 8:
					gl.activeTexture(gl.TEXTURE8);
					break;
				default:
					break;
			}
			
			gl.bindTexture(gl.TEXTURE_2D, texture);
			var sampler = gl.getUniformLocation(this.prog, 'texGPU');
			gl.uniform1i(sampler, selectedIdx);
		
		}
		
		// 2. Setear uniformes con las matrices de transformaciones
		

   		// 3. Habilitar atributos: vértices, normales, texturas
   		// Aca estamos pasandole los buffers a los atributos. OK

		// 4. Dibujar los triangulos. OK
		gl.drawArrays(gl.TRIANGLES, 0, numTriangles * 3);

		//5. Dibujamos la orbita
		/*
		var orbit_buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, orbit_buffer);

		let vertices = []
		let radius = drawableObject._radius;
		for(let i = 0; i < 360; i++) {
			let x = radius * Math.cos(i);
			let y = 0;
			let z = radius * Math.sin(i);
			vertices.push(x);
			vertices.push(y);
			vertices.push(z);
		}

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		//gl.uniform1i(sampler, 0);
		
		gl.drawArrays(gl.LINE_LOOP, 0, 20);
		*/

	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( drawableObject )
	{
		drawableObject._texture = gl.createTexture();

		var img = drawableObject._img;
		var selectedIdx = drawableObject._selectedPlanetIdx;
		var texture = drawableObject._texture;

		// Binding de la textura
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		// Genero los mipmaps de la textura del ultimo buffer bindeado
		gl.generateMipmap( gl.TEXTURE_2D );
	}
			
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	// No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
	setLightDir( x, y, z )
	{		
		// Binding del programa y seteo de la variable uniforme que especifica la dirección de la luz.
		gl.useProgram( this.prog );
		//gl.uniform3fv(this.light_direction, [x, y, z]);

	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// Binding del programa y seteo de la variable uniforme que especifica el brillo.
		gl.useProgram( this.prog );
		gl.uniform1f(this.shininess, shininess);
	}

	isTheSun(planet){
		return planet._selectedPlanetIdx == 0;
	}
}

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec3 normals;
	attribute vec2 vTexCoord;

	uniform mat4 mvp;
	uniform mat4 mv;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	uniform int yz_swap;

	void main()
	{ 
	
		gl_Position = mvp * vec4(pos.x, pos.y, pos.z ,1);


		texCoord = vTexCoord;
		normCoord = normals;
		vertCoord = mv * vec4(pos,1);
		
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

/*

1) Pasaje de normales (en espacio objeto) y vertices (en espacio camara) al shader. OK.
2) Setear uniformes para la direccion de la luz en espacio camara (l), shininess, I, Ks y Kd. OK
3) Computar la formula de Phong.

Parametros de entrada:
normCoord (R3) =  Me llega en espacio objecto. La transformo con la matriz mn.
vertCoord (R4) = Me llega en espacio camara. Fueron transformados en vertex shader.

*/

var meshFS = `
	precision mediump float;

	uniform mat3 mn;

	uniform sampler2D texGPU;
	uniform int show_texture;

	vec3 light_direction;
	uniform float shininess;

	uniform vec4 I;
	uniform vec4 Ks;
	uniform vec4 Kd_no_tex;
	
	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	void main()
	{		

		float ambient_strength = 0.1;
		vec4 ambient = I * ambient_strength;

		light_direction = vec3(0, 0, 0) - vec3(vertCoord.x, vertCoord.y, vertCoord.z);
		
		vec3 n = normalize( mn * normCoord );
		vec3 l = normalize( light_direction );
		vec3 v = normalize( vec3(-vertCoord.x, -vertCoord.y, -vertCoord.z) );
		vec3 h = normalize( l + v );

		vec4 Kd = Kd_no_tex;
		Kd = texture2D(texGPU, texCoord);

		float cos_theta = dot(n, l);
		float cos_omega = dot(n, h);

		if( cos_theta <= 0.0 ) {
			gl_FragColor = ambient * Kd + vec4(0, 0, 0, 0);
		} else if( cos_omega <= 0.0 ) {
			gl_FragColor = ambient * Kd + ( I * cos_theta * Kd );
		} else {
			gl_FragColor = ambient * Kd + (  ( I * cos_theta ) * (Kd + ( Ks * pow(cos_omega, shininess) ) / cos_theta ) ); 
		}
	}
`;

var lightSourceFS = `

	precision mediump float;

	varying vec2 texCoord;
	uniform sampler2D texGPU;

	void main()
	{		
		
		gl_FragColor = texture2D(texGPU, texCoord);

	}
`;
