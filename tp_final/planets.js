var planets = [];

async function loadAllPlanets(){
    var solarSystemProperties = [
        {
            index: 0,
            textureName: 'sun',
            height: -1,
            radius: 0,
            velocity: 0,
            size: 1.5,
        },
		{
            index: 1,
            textureName: 'earth_day',
            height: -0.5,
            radius: 2,
            velocity: 2,
            size: 0.7,
        },
		{
            index: 2,
            textureName: 'earth_night',
            height: -0.5,
            radius: 4,
            velocity: 4,
            size: 0.7,
        },
		{
            index: 3,
            textureName: 'earth_day',
            height: -0.5,
            radius: 7,
            velocity: 6,
            size: 0.7,
        },
		{
            index: 4,
            textureName: 'jupiter',
            height: -0.5,
            radius: 32,
            velocity: 8,
            size: 1,
        },
		{
            index: 5,
            textureName: 'earth_day',
            height: -0.5,
            radius: 10,
            velocity: 10,
            size: 1,
        },
		{
            index: 6,
            textureName: 'earth_day',
            height: -0.5,
            radius: 12,
            velocity: 12,
            size: 1,
        },
    ];

	for(const planetProps of solarSystemProperties){
		await loadPlanet(planetProps);
	}
	DrawScene();
}

async function loadPlanet(props){
	var planet = await downloadLocalObj('models/planet.obj');
	var texture = await downloadLocalImg(`models/${props.textureName}.jpg`);

	loadNewPlanet(planet, props);
	addTextureToPlanet(planets[props.index], texture);
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

function loadNewPlanet(planetAsText, props){
	var mesh = new ObjMesh;
	mesh.parse(planetAsText);

	var buffers = mesh.getVertexBuffers();

	var initDt = Math.random() * 1000;

	var planet = {
		_selectedPlanetIdx: props.index,
		_mv: null,
		_mvp: null,
		_nrmTrans: null,
		_dt: initDt,
		_radius: props.radius,
		_transZ: props.radius * Math.sin(initDt),
		_transX: props.radius * Math.cos(initDt),
		_transY : props.height,
		_vTexCoord_buffer: null,
		_position_buffer: null,
		_normals_buffer: null,
		_numTriangles: 0,
		_position: null,
		_texCoord: null,
		_normals: null,
		_orbitTimer: null,
		_vel: props.velocity,
		_img: null,
		_scaleFactor: props.size,
		_following : false,
		_texture: null
	};

	planet._position = buffers.positionBuffer;
	planet._texCoord = buffers.texCoordBuffer;
	planet._normals = buffers.normalBuffer;

	meshDrawer.setMesh(planet);

	planets.push(planet);
	//DrawScene();
}

function addTextureToPlanet(planet,textureImg){
	let img = new Image();
    img.style.visibility = 'hidden';
	planet._img = img;
	
	img.onload = function(){
		meshDrawer.setTexture( planet );
		//DrawScene();
	}
	img.src = URL.createObjectURL(textureImg);
	
	document.body.appendChild(img);
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