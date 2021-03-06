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


var showBox;  // boleano para determinar si se debe o no mostrar la caja

// Al cargar la página
var fov = 60;

// Control de la calesita de rotación
var timer;


camera = new Camera();
cam_spacing = 5;
keypressed = [0,0,0,0,0,0,0,0,0];

var mouseDown = 0;
var isOnDiv = false;



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
}

// Devuelve la matriz de perspectiva (column-major)
function UpdateProjectionMatrix()
{
	perspectiveMatrix = ProjectionMatrix( canvas );
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

// Funcion que reenderiza la escena. 
function DrawScene()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	planets.forEach((planet) => {

		planet._mv = GetModelViewMatrix(
			global_transX + planet._transX,
			global_transY + planet._transY, 
			global_transZ + planet._transZ, 
			global_rotX, 
			global_rotY + global_autorot, 
			0, 
			planet._scaleFactor * global_scale);

		let cameraMatrix = camera.getCameraMatrix();
		planet._view = MatrixMult(cameraMatrix, planet._mv);
		planet._mvp = MatrixMult(perspectiveMatrix, planet._view);
		planet._nrmTrans = transposeMatrix(planet._mv);

		meshDrawer.draw(planet);
	})
}

// Evento resize
function WindowResize()
{
	UpdateCanvasSize();
	DrawScene();
}

function AutoRotate( param )
{
	if ( param.checked ) 
	{
		// Vamos rotando una cantiad constante cada 30 ms
		timer = setInterval( function() 
		{
				var v = document.getElementById('rotation-speed').value;

				global_autorot = (global_autorot + 0.005 * v) % (2 * Math.PI);

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

					var camFollowPos = [global_transX + planet._transX, global_transY, global_transZ + planet._transZ - cam_spacing  ];
					camera.setPosition(camFollowPos);
					var front = [0, 0, 1];
					//var front = [ -planet._radius * Math.sin(planet._dt), 0, planet._radius * Math.cos(planet._dt)]
					camera.setFront(front);
				}

				DrawScene();
			}, 30);

		} else {

			clearInterval(planet._orbitTimer);
			document.getElementById('orbit-speed').disabled = true;
		}
	})

}

function getSelectedPlanet(){
	var selectedPlanetIdx = document.querySelector('#planet').selectedIndex;

	for(planet of planets){
		if (planet._selectedPlanetIdx == selectedPlanetIdx) {
			return planet;
		}
	};

	return null; /* maybe must throw an error */
}

function changeSize(param) {
	var selectedPlanet = getSelectedPlanet();
	
	if (param.checked) {
		document.getElementById('planet-size-control').disabled = false;
		// Loads from previous value
		document.getElementById('planet-size-control').value = 1;

		selectedPlanet._originalScaleFactor = selectedPlanet._scaleFactor;
		selectedPlanet._sizeTimer = setInterval(function () {
			var size = document.getElementById("planet-size-control").value;
			selectedPlanet._scaleFactor = size * selectedPlanet._originalScaleFactor;

			DrawScene();
		}, 30);

	} else {
		clearInterval(selectedPlanet._sizeTimer);
		document.getElementById('planet-size-control').disabled = true;
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

function SetRealDimensions(param){
	if(param.checked){
		planets.forEach(planet => updateRealDimesions(planet));
	}else{
		planets.forEach(planet => updateFakeDimensions(planet));
	}

	DrawScene();
}