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


// Control de textura visible
function ShowTexture( param )
{
	meshDrawer.showTexture( param.checked );
	DrawScene();
}


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



// Control de intercambiar y-z
function SwapYZ( param )
{
	meshDrawer.swapYZ( param.checked );
	DrawScene();
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