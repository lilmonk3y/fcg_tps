var planets = [];

async function loadAllPlanets(){
    var solarSystemProperties = [
        {
            index: 0,
            textureName: 'sun.jpg',
            height: -1,
            radius: 0,
            velocity: 0,
            size: 1.5,
        },
		{
            index: 1,
            textureName: 'mercury.jpeg',
            height: -0.5,
            radius: 2,
            velocity: 2,
            size: 0.7,
        },
		{
            index: 2,
            textureName: 'venus.jpeg',
            height: -0.5,
            radius: 4,
            velocity: 4,
            size: 0.7,
        },
		{
            index: 3,
            textureName: 'earth_day.jpg',
            height: -0.5,
            radius: 7,
            velocity: 6,
            size: 0.7,
        },
		{
            index: 4,
            textureName: 'mars.jpeg',
            height: -0.5,
            radius: 8,
            velocity: 8,
            size: 1,
        },
		{
            index: 5,
            textureName: 'jupiter.jpg',
            height: -0.5,
            radius: 10,
            velocity: 10,
            size: 1,
        },
		{
            index: 6,
            textureName: 'saturn.jpeg',
            height: -0.5,
            radius: 12,
            velocity: 12,
            size: 1,
        },
		{
            index: 7,
            textureName: 'uranus.jpeg',
            height: -0.5,
            radius: 13,
            velocity: 12,
            size: 1,
        },
		{
            index: 8,
            textureName: 'neptune.jpeg',
            height: -0.5,
            radius: 14,
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
	var texture = await downloadLocalImg(`models/${props.textureName}`);

	loadNewPlanet(planet, props, texture);
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

function loadNewPlanet(planetAsText, props, textureAsText){
	var mesh = new ObjMesh();
	mesh.parse(planetAsText);
	var buffers = mesh.getVertexBuffers();

	var initDt = Math.random() * 1000;

	var planet = {
		_selectedPlanetIdx: props.index,
		_dt: initDt,
		_radius: props.radius,
		_transZ: props.radius * Math.sin(initDt),
		_transX: props.radius * Math.cos(initDt),
		_transY : props.height,
		_numTriangles: 0,
		_orbitTimer: null,
		_vel: props.velocity,
		_scaleFactor: props.size,
		_following : false,
        _img: null,
		_texture: null,
        _vertex: buffers.vertexBuffer,
        _texCoord: buffers.texCoordBuffer,
        _normals: buffers.normalBuffer,
        _vTexCoord_buffer: null,
		_vertex_buffer: null,
		_normals_buffer: null,
        _mv: null,
		_mvp: null,
		_nrmTrans: null
	};

	meshDrawer.setMesh(planet);

    addTextureToPlanet(planet, textureAsText);

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