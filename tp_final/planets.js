planets = [];
// Initial values when first loading our planets.
planets_height = [-1, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5]

planets_radius = [0, 2, 4, 7, 32, 10, 12];

planets_velocity = [0, 2, 4, 6, 8, 10, 12];

planets_size = [1.5, 0.7, 0.7, 0.7, 1, 1, 1];

async function loadPlanet(){
	var planet = await downloadLocalObj('models/planet.obj');
	var texture = await downloadLocalImg('models/earth_day.jpg');

	loadNewPlanet(planet, 0);
	addTextureToPlanet(planets[0], texture);
}

async function downloadLocalObj(path){
	return fetch(path)
		.then(resp => resp.text())
		.catch(err => console.log(err));
}

async function downloadLocalImg(path){
	return fetch(path)
		.then(resp => resp.blob())
		.catch(err => console.log(err));
}

function loadNewPlanet(planetAsText, selectedPlanetIdx){
	var mesh = new ObjMesh;
	mesh.parse(planetAsText);
	/*
	var box = mesh.getBoundingBox();
	var shift = [
		-(box.min[0]+box.max[0])/2,
		-(box.min[1]+box.max[1])/2,
		-(box.min[2]+box.max[2])/2
	];
	var size = [
		(box.max[0]-box.min[0])/2,
		(box.max[1]-box.min[1])/2,
		(box.max[2]-box.min[2])/2
	];
	var maxSize = Math.max( size[0], size[1], size[2] );
	var scale = 1/maxSize;
	mesh.shiftAndScale( shift, scale );
	*/
	var buffers = mesh.getVertexBuffers();

	var initDt = Math.random() * 1000;

	var planet = {
		_selectedPlanetIdx: selectedPlanetIdx,
		_mv: null,
		_mvp: null,
		_nrmTrans: null,
		_dt: initDt,
		_radius: planets_radius[selectedPlanetIdx],
		_transZ: planets_radius[selectedPlanetIdx] * Math.sin(initDt),
		_transX: planets_radius[selectedPlanetIdx] * Math.cos(initDt),
		_transY : planets_height[selectedPlanetIdx],
		_vTexCoord_buffer: null,
		_position_buffer: null,
		_normals_buffer: null,
		_numTriangles: 0,
		_position: null,
		_texCoord: null,
		_normals: null,
		_orbitTimer: null,
		_vel: planets_velocity[selectedPlanetIdx],
		_img: null,
		_scaleFactor: planets_size[selectedPlanetIdx],
		_following : false
	};

	planet._position = buffers.positionBuffer;
	planet._texCoord = buffers.texCoordBuffer;
	planet._normals = buffers.normalBuffer;

	meshDrawer.setMesh(planet);

	planets.push(planet);
	DrawScene();
}

function addTextureToPlanet(planet,textureImg){
	let img = new Image();
	document.body.appendChild(img);
	planet._img = img;
	img.onload = function(){
		console.log("addTextureToPlanet");
		console.log(planet);
		console.log(this);

		meshDrawer.setTexture( planet );
		DrawScene();
	}
	img.src = URL.createObjectURL(textureImg);
}






/*                           LO DEJO POR ACÁ POR LAS DUDAS (POR AHORA)                                  */


//async function loadPlanet(){
//	var planetFromInternet = await downloadObj("hosting-publico.s3.amazonaws.com/planet.obj");
//	var textureImg = await downloadImg("hosting-publico.s3.amazonaws.com/earth_day.jpg");
//}

async function downloadObj(url){
	return download(url, "text/plain")
		.then(resp => resp.text())
		.catch(err => console.log(err));
}

async function downloadImg(url){
	return download(url, "image/jpeg")
		.then(resp => resp.text())
		.catch(err => console.log(err));
}

async function download(url, contentType){
	return fetch('https://'+url, 
		{ 
			//mode: 'no-cors' ,
			method: 'GET',
			headers: 
				{
					'Content-Type':contentType,
					/*'Access-Control-Allow-Origin':'*',
					'Access-Control-Allow-Credentials':'true',*/
					'accept':'*/*'
				} 
		});	
}