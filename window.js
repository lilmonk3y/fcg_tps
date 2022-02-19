window.onload = function() 
{
	loadModal();
	
	InitWebGL();
	
	loadAllPlanets();
	
	canvas.zoom = function( s ) 
	{
		fov += s;

	    if (fov > 60.0)
	        fov = 60.0; 
	    perspectiveMatrix = ProjectionMatrix( canvas, n = 0.1, f = 100, fov );

		//UpdateProjectionMatrix();
		DrawScene();
	}

	canvas.onwheel = function() { canvas.zoom(0.01*event.deltaY); }
	
	SetShininess(document.getElementById('shininess-exp'));

	// When selecting another planet, we must clear all checkboxes and stop all active timers of local properties (planet size, ... )
	// Make it load with its prev value
	document.getElementById('planet').addEventListener('change', function () {

		// Clear planet size control and timers
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
		if ( isIndexOfPlanet(name) ){
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
		if( isIndexOfPlanet(name) ){
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
	
	document.getElementById("controls-div").addEventListener("mouseenter", function(  ) {
		isOnDiv=true;
	});


	document.getElementById("controls-div").addEventListener("mouseleave", function(  ) {
		isOnDiv=false;
	});

	// Add event listener for mouse movement
	document.addEventListener('mousemove', event => mouseMoveCamera(event));

	DrawScene();
};