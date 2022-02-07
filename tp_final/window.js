window.onload = function() 
{
	showBox = document.getElementById('show-box');
	InitWebGL();
	
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
	document.addEventListener('keydown', event => keyDownMoveCamera(event), false);

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
				//Save camera Position + Front
				camera.savedCamPosition = camera.cameraPos;
				camera.savedCamFront = camera.cameraFront;
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
			//Save camera Position + Front
			
			selectedPlanet._following = false;
			camera.setPosition(camera.savedCamPosition);
			camera.setFront(camera.savedCamFront);


		}
	});

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
	
	document.getElementById("controls").addEventListener("mouseenter", function(  ) {
		isOnDiv=true;
	});
	document.getElementById("controls").addEventListener("mouseout", function(  ) {
		isOnDiv=false;
	});

	

	// Add event listener for mouse movement
	document.addEventListener('mousemove', event => mouseMoveCamera(event));

	DrawScene();
};