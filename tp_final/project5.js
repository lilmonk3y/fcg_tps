// Estructuras globales e inicializaciones
var boxDrawer;          // clase para contener el comportamiento de la caja
var meshDrawer;         // clase para contener el comportamiento de la malla
var canvas, gl;         // canvas y contexto WebGL
var perspectiveMatrix;	// matriz de perspectiva

// Aplicables a todos los objetos de mi escena.
var global_autorot = 0;
var global_rotX = 0;
var global_rotY = 0;
var global_rotZ = 0;

// Do not use! or alter light position in shader afterwards.
var global_transX = 0;
var global_transY = 0;
var global_transZ = 0;

var global_scale = 0.5;

var yaw = 90;
var pitch = 0;



class Camera {

	constructor() {
		this.cameraPos = [0, 0, -10];
		this.cameraFront = [0, 0, 1];
		this.cameraUp = [0, 1, 0];
		this.savedCamPosition = null;
		this.savedCamFront = null;
				
	}

	setPosition(pos) {
		this.cameraPos = pos;
	}

	setFront(front) {
		this.cameraFront = front;
	}

	setUpVector(up) {
		this.cameraUp = up;
	}
}

Camera = new Camera();
cam_spacing = 5;
keypressed = [0,0,0,0,0,0,0,0,0];


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

// Funcion de inicialización, se llama al cargar la página
function InitWebGL()
{
	// Inicializamos el canvas WebGL
	canvas = document.getElementById("canvas");
	canvas.oncontextmenu = function() {return false;};
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	
	if (!gl) 
	{
		alert("Imposible inicializar WebGL. Tu navegador quizás no lo soporte.");
		return;
	}

	// Inicializar color clear
	gl.clearColor(0,0,0,0);
	gl.enable(gl.DEPTH_TEST); // habilitar test de profundidad 
	
	// Inicializar los shaders y buffers para renderizar	
	meshDrawer = new MeshDrawer();
	
	// Setear el tamaño del viewport
	UpdateCanvasSize();

	//testLoad();

}

function readTextFile(file) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				var allText = rawFile.responseText;
				alert(allText);
			}
		}
	}
	rawFile.send(null);
}

// Funcion para actualizar el tamaño de la ventana cada vez que se hace resize
function UpdateCanvasSize()
{
	// 1. Calculamos el nuevo tamaño del viewport
	canvas.style.width  = "100%";
	canvas.style.height = "100%";

	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width  = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;

	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);

	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	
	// 2. Lo seteamos en el contexto WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );

	// 3. Cambian las matrices de proyección, hay que actualizarlas
	UpdateProjectionMatrix();
}

// Calcula la matriz de perspectiva (column-major)
function ProjectionMatrix( c, n = 0.1, f = 100, fov_angle=60 )
{
	var r = c.width / c.height;
	//var n = (global_transZ - 1.74);
	//const min_n = 0.001;
	//if ( n < min_n ) n = min_n;
	//var f = (transZ + 1.74);
	var n = 0.1;
	var f = 100;
	var fov = 3.145 * fov_angle / 180;
	var s = 1 / Math.tan( fov/2 );
	
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];

	/*return [1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1];
*/
}

// Devuelve la matriz de perspectiva (column-major)
function UpdateProjectionMatrix()
{
	perspectiveMatrix = ProjectionMatrix( canvas );
}


// Funcion que reenderiza la escena. 
function DrawScene()
{

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	planets.forEach((planet) => {

		planet._mv = GetModelViewMatrix(global_transX + planet._transX, global_transY + planet._transY, global_transZ + planet._transZ, global_rotX, global_autorot + global_rotY, planet._scaleFactor * global_scale);
		// Depende de camera position, a target position and a vector that represents the up vector in world space
		cameraMatrix = getCameraMatrix(Camera.cameraPos, add_vector(Camera.cameraPos, Camera.cameraFront) , Camera.cameraUp);
		planet._view = MatrixMult(cameraMatrix, planet._mv);
		planet._mvp = MatrixMult(perspectiveMatrix, planet._view);
		planet._nrmTrans = [planet._mv[0], planet._mv[1], planet._mv[2], planet._mv[4], planet._mv[5], planet._mv[6], planet._mv[8], planet._mv[9], planet._mv[10]];

		meshDrawer.draw(planet);
	})

}

// Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram( vsSource, fsSource, wgl=gl )
{
	// Función que compila cada shader individualmente
	const vs = CompileShader( wgl.VERTEX_SHADER,   vsSource, wgl );
	const fs = CompileShader( wgl.FRAGMENT_SHADER, fsSource, wgl );

	// Crea y linkea el programa 
	const prog = wgl.createProgram();
	wgl.attachShader(prog, vs);
	wgl.attachShader(prog, fs);
	wgl.linkProgram(prog);

	if (!wgl.getProgramParameter(prog, wgl.LINK_STATUS)) 
	{
		alert('No se pudo inicializar el programa: ' + wgl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader( type, source, wgl=gl )
{
	// Creamos el shader
	const shader = wgl.createShader(type);

	// Lo compilamos
	wgl.shaderSource(shader, source);
	wgl.compileShader(shader);

	// Verificamos si la compilación fue exitosa
	if (!wgl.getShaderParameter( shader, wgl.COMPILE_STATUS) ) 
	{
		alert('Ocurrió un error durante la compilación del shader:' + wgl.getShaderInfoLog(shader));
		wgl.deleteShader(shader);
		return null;
	}

	return shader;
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

// ======== Funciones para el control de la interfaz ========

var showBox;  // boleano para determinar si se debe o no mostrar la caja

// Al cargar la página
var fov = 60;
window.onload = function() 
{
	showBox = document.getElementById('show-box');
	InitWebGL();
	
	// Componente para la luz
	lightView = new LightView();

	// Evento de zoom (ruedita)
	
	loadPlanet();
	
	canvas.zoom = function( s ) 
	{
		fov += s;
	    //if (fov < 1.0)
	        //fov = 1.0;
	    if (fov > 60.0)
	        fov = 60.0; 
	    perspectiveMatrix = ProjectionMatrix( canvas, n = 0.1, f = 100, fov );
		//UpdateProjectionMatrix();
		DrawScene();
	}

	canvas.onwheel = function() { canvas.zoom(0.01*event.deltaY); }


	/*

	// Evento de click 
	canvas.onmousedown = function() 
	{
		var cx = event.clientX;
		var cy = event.clientY;
		if ( event.ctrlKey ) 
		{
			canvas.onmousemove = function() 
			{
				canvas.zoom(5*(event.clientY - cy));
				cy = event.clientY;
			}
		}
		else 
		{   
			// Si se mueve el mouse, actualizo las matrices de rotación
			canvas.onmousemove = function() 
			{
				global_rotY += (cx - event.clientX)/canvas.width*5;
				global_rotX += (cy - event.clientY)/canvas.height*5;
				cx = event.clientX;
				cy = event.clientY;
				UpdateProjectionMatrix();
				DrawScene();
			}
		}
	}

	// Evento soltar el mouse
	canvas.onmouseup = canvas.onmouseleave = function() 
	{
		canvas.onmousemove = null;
	}
	*/
	
	SetShininess(document.getElementById('shininess-exp'));


	// When selecting another planet, we must clear all checkboxes and stop all active timers of local properties (planet size, ... )
	// Make it load with its prev value
	document.getElementById('planet').addEventListener('change', function () {

		// Clear planet size control and timers
		//clearInterval(selectedPlanet._sizeTimer);
		document.getElementById('planet-size-control').disabled = true;
		document.getElementById("planet-size").checked = false;
		planets.forEach((planet) => {
			if (planet._sizeTimer != null) {
				clearInterval(planet._sizeTimer);
			}
		});

	});

	// Add key handlers to move camera around
	document.addEventListener('keydown', (event) => {

		var name = event.key;
		var code = event.code;

		let cameraSpeed = 0.1;

		switch (name) {

			case 'w':
				Camera.setPosition(add_vector(Camera.cameraPos, multiply_vector(Camera.cameraFront, cameraSpeed)));
				//global_transZ += cameraSpeed;
				DrawScene();
				break;
			case 's':
				Camera.setPosition(substract_vector(Camera.cameraPos, multiply_vector(Camera.cameraFront, cameraSpeed)));
				//global_transZ -= cameraSpeed;
				DrawScene();
				break;
			case 'a':
				Camera.setPosition(add_vector(Camera.cameraPos, multiply_vector(cross_product(Camera.cameraFront, Camera.cameraUp), cameraSpeed)));
				//global_transX += cameraSpeed;
				DrawScene();
				break;
			case 'd':
				Camera.setPosition(substract_vector(Camera.cameraPos, multiply_vector(cross_product(Camera.cameraFront, Camera.cameraUp), cameraSpeed)));
				//global_transX -= cameraSpeed;
				DrawScene();
				break;
			default:
				break;
		}

	}, false);

	document.addEventListener('keydown', (event) => {
		var name = event.key;
		if (parseInt(name) > 0 && parseInt(name) < 10){
			if(!keypressed[parseInt(name)]){
				keypressed[parseInt(name)] = true;
				var selectedPlanetIdx = parseInt(name);
				var selectedPlanet = null;
				planets.forEach((planet) => {
					if (planet._selectedPlanetIdx == selectedPlanetIdx) {
					selectedPlanet = planet;
					}
				});
				//Save Camera Position + Front
				Camera.savedCamPosition = Camera.cameraPos;
				Camera.savedCamFront = Camera.cameraFront;
				selectedPlanet._following = true;
			}
		}

	})

	document.addEventListener('keyup', (event) => {
		var name = event.key;
		if(parseInt(name) > 0 && parseInt(name) < 10){
			keypressed[parseInt(name)] = false;
			var selectedPlanetIdx = parseInt(name);
			var selectedPlanet = null;
			planets.forEach((planet) => {
				if (planet._selectedPlanetIdx == selectedPlanetIdx) {
					selectedPlanet = planet;
				}
			});
			//Save Camera Position + Front
			
			selectedPlanet._following = false;
			Camera.setPosition(Camera.savedCamPosition);
			Camera.setFront(Camera.savedCamFront);


		}
		
		
	});


	// Checks if mouse is down.
	var mouseDown = 0;

	document.body.onmousedown = function() {
		if(mouseDown == 0){
			mouseDown = 1;
		}
	}
	document.body.onmouseup = function() {
		if(mouseDown == 1){
			mouseDown = 0;
		}
	}

	var isOnDiv = false;
	document.getElementById("controls").addEventListener("mouseenter", function(  ) {
		isOnDiv=true;
	});
	document.getElementById("controls").addEventListener("mouseout", function(  ) {
		isOnDiv=false;
	});

	

	// Add event listener for mouse movement
	document.addEventListener('mousemove', (event) => {


		mouseSensitivity = 0.05;
		xoffset = event.movementX * mouseSensitivity;
		yoffset = event.movementY * mouseSensitivity;

		if(mouseDown && !isOnDiv){

			yaw += xoffset;
			pitch += yoffset;

			if(pitch > 89) {
				pitch = 89;
			}
			if(pitch < -89){
				pitch = -89;
			}

			var direction = [0, 0, 0];
			yaw_radians = yaw * (Math.PI / 180);
			pitch_radians = pitch * (Math.PI / 180);

			direction[0] = Math.cos(yaw_radians) * Math.cos(pitch_radians);
			direction[1] = Math.sin(pitch_radians);
			direction[2] = Math.sin(yaw_radians) * Math.cos(pitch_radians);
			Camera.setFront(normalize(direction));
			DrawScene();
		}
		
	});

	
	

	// Dibujo la escena
	DrawScene();
};

// Evento resize
function WindowResize()
{
	UpdateCanvasSize();
	DrawScene();
}

// Control de la calesita de rotación
var timer;
function AutoRotate( param )
{
	// Si hay que girar...
	if ( param.checked ) 
	{
		// Vamos rotando una cantiad constante cada 30 ms
		timer = setInterval( function() 
		{
				var v = document.getElementById('rotation-speed').value;
				global_autorot += 0.005 * v;
				if ( global_autorot > 2*Math.PI ) global_autorot -= 2*Math.PI;

				// Reenderizamos
				DrawScene();
			}, 30
		);
		document.getElementById('rotation-speed').disabled = false;
	} 
	else 
	{
		clearInterval( timer );
		document.getElementById('rotation-speed').disabled = true;
	}
}

function Orbit( param )
{

	planets.forEach((planet) => {

		if (param.checked) {
			document.getElementById('orbit-speed').disabled = false;
			
			planet._orbitTimer = setInterval(function () {
				var global_vel = document.getElementById('orbit-speed').value;
				planet._dt += 0.0005 * (global_vel + planet._vel);
				// Para que sea smooth, cada planeta comienza en (r,0), es el valor que toma en dt=0.
				planet._transX = planet._radius * Math.cos(planet._dt);
				planet._transZ = planet._radius * Math.sin(planet._dt);

				if(planet._following){
						// Sets position and front for following
						var camFollowPos = [global_transX + planet._transX, global_transY, global_transZ + planet._transZ - cam_spacing];
						Camera.setPosition(camFollowPos);
						var front = [0, 0, 1];
						//var front = [ -planet._radius * Math.sin(planet._dt), 0, planet._radius * Math.cos(planet._dt)]
						Camera.setFront(front);
					}

				

				DrawScene();


			}, 30);

		} else {

			clearInterval(planet._orbitTimer);
			document.getElementById('orbit-speed').disabled = true;
		}
	})

}

function changeSize(param) {

	var selectedPlanetIdx = document.querySelector('#planet').selectedIndex;

	var selectedPlanet = null;
	planets.forEach((planet) => {
		if (planet._selectedPlanetIdx == selectedPlanetIdx) {
			selectedPlanet = planet;
		}
	});
	
	if (param.checked) {
		document.getElementById('planet-size-control').disabled = false;
		// Loads from previous value
		document.getElementById('planet-size-control').value = selectedPlanet._scaleFactor;

		selectedPlanet._sizeTimer = setInterval(function () {
			var size = document.getElementById("planet-size-control").value;
			selectedPlanet._scaleFactor = size;

			DrawScene();
		}, 30);

	} else {
		clearInterval(selectedPlanet._sizeTimer);
		document.getElementById('planet-size-control').disabled = true;
	}

}


/*
dt = 0
function changeSize(param) {

	timer = setInterval(function () {
		dt += 0.05;
		let radius = 1;
		let camX = Math.sin(dt) * radius;
		let camZ = Math.cos(dt) * radius;

		Camera.setPosition([camX, 0, camZ]);
		DrawScene();

	}, 30);

}
*/

// Control de textura visible
function ShowTexture( param )
{
	meshDrawer.showTexture( param.checked );
	DrawScene();
}

// Control de intercambiar y-z
function SwapYZ( param )
{
	meshDrawer.swapYZ( param.checked );
	DrawScene();
}

// Cargar archivo obj
function LoadObj(param)

{	
	if ( param.files && param.files[0] ) 
	{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			// El sol coincide con el indice 0
			var selectedPlanetIdx = document.querySelector('#planet').selectedIndex;
			loadNewPlanet(e.target.result, selectedPlanetIdx);
		}
		reader.readAsText(param.files[0]);
		// Resets value to allow load multiple copies of same object.
		document.getElementById("obj").value = "";
	}
}

// Cargar textura
function LoadTexture( param )
{
	var selectedPlanetIdx = document.querySelector('#planet').selectedIndex;
	var selectedPlanet = null;
	planets.forEach((planet) => {
		if (planet._selectedPlanetIdx == selectedPlanetIdx) {
			selectedPlanet = planet;
		}
	});

	if ( param.files && param.files[0] ) 
	{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			var img = document.getElementById('texture-img');
			selectedPlanet._img = img;
			img.onload = function() 
			{
				meshDrawer.setTexture( selectedPlanet );
				DrawScene();
			}
			img.src = e.target.result;
		};
		reader.readAsDataURL(param.files[0]);
		document.getElementById("texture").value = "";
	}
}

// Setear Intensidad
function SetShininess( param )
{
	var exp = param.value;
	var s = Math.pow(10,exp/25);
	document.getElementById('shininess-value').innerText = s.toFixed( s < 10 ? 2 : 0 );
	meshDrawer.setShininess(s);
	DrawScene();
}

