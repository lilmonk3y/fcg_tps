window.onload = function() 
{
	showBox = document.getElementById('show-box');
	InitWebGL();
	
	// Componente para la luz
	//lightView = new LightView();

	loadAllPlanets();
	
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

	DrawScene();
};