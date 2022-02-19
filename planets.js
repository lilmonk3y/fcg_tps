var planets = [];

function planetProperties(){
    return [
        {
            index: 0,
            textureName: 'sun.jpg',
            radius: 0,
            velocity: 0,
            size: 5,
        },
		{
            index: 1,
            textureName: 'mercury.jpeg',
            radius: 4,
            velocity: 2,
            size: 0.7,
        },
		{
            index: 2,
            textureName: 'venus.jpeg',
            radius: 10,
            velocity: 4,
            size: 1,
        },
		{
            index: 3,
            textureName: 'earth_day.jpg',
            radius: 13,
            velocity: 6,
            size: 1.5,
        },
		{
            index: 4,
            textureName: 'mars.jpeg',
            radius: 17,
            velocity: 8,
            size: 1,
        },
		{
            index: 5,
            textureName: 'jupiter.jpg',
            radius: 25,
            velocity: 10,
            size: 3,
        },
		{
            index: 6,
            textureName: 'saturn.jpeg',
            radius: 30,
            velocity: 12,
            size: 2,
        },
		{
            index: 7,
            textureName: 'uranus.jpeg',
            radius: 34,
            velocity: 12,
            size: 2,
        },
		{
            index: 8,
            textureName: 'neptune.jpeg',
            radius: 38,
            velocity: 12,
            size: 3,
        },
    ];
}

async function loadAllPlanets(){
    var solarSystemProperties = planetProperties();

    Promise.all( solarSystemProperties.map( props => {
            return new Promise((resolve, reject) => resolve(loadPlanet(props)));
        })).then( resPlanets => {
            resPlanets.forEach(planet => planets.push(planet));
        }).then( () =>  {
            DrawScene();
        });
}

async function loadPlanet(props){
    var planetProm = new Promise(resolve => resolve(downloadLocalObj('models/planet.obj')));
    var textureProm = new Promise(resolve => resolve(downloadLocalImg(`models/${props.textureName}`)));
	
    return Promise.all([planetProm, textureProm])
        .then( res => loadNewPlanet(res[0], props, res[1]));
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

async function loadNewPlanet(planetAsText, props, textureAsText){
	var mesh = new ObjMesh();
	mesh.parse(planetAsText);
	var buffers = mesh.getVertexBuffers();

	var planet = createPlanet(props, buffers);

	meshDrawer.setMesh(planet);

    return addTextureToPlanet(planet, textureAsText);
}

async function addTextureToPlanet(planet,textureImg){
    
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.style.visibility = 'hidden';
	    planet._img = img;
        img.addEventListener('load', () => {
            meshDrawer.setTexture( planet );
            resolve(planet);
        });
        img.addEventListener('error', (err) => reject(err));
	    document.body.appendChild(img);

        img.src = URL.createObjectURL(textureImg);
      });
}

function createPlanet(props, buffers){
    var initDt = Math.random() * 1000;

	return {
		_selectedPlanetIdx: props.index,
		_dt: initDt,
		_radius: props.radius,
		_scaleFactor: props.size/10,
        _vel: props.velocity,
		_transZ: props.radius * Math.sin(initDt),
		_transX: props.radius * Math.cos(initDt),
		_transY : 0,
		_numTriangles: 0,
		_orbitTimer: null,
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
}

function updateRealDimesions(planet){
    /**
     * UA es unidad astronómica, donde 1 UA es la distancia de la tierra al sol. 
     * El resto de los planetas se suelen definir de manera proporcional a ella.
     */
    var UA = 10; 
    var UA_factors = [ 0, 0.39, 0.72, 1, 1.52, 5.2, 9.54, 19.22, 30.06];

    /**
     * size_factors es el diametro proporcional del planeta respecto a la tierra.
     */
    var base_size = 1;
    var size_factors = [ 109.2, 0.39, 0.95, 1, 0.53, 11.21, 9.41, 3.98, 3.81];


    /**
     * velocity_factors es la velocidad a la que un planeta da una vuelta al sol, respecto de la velocidad de la tierra. 
     */
    var base_velocity = 1;
    var velocity_factors = [ 0, 0.24, 0.62, 1, 1.88, 11.86, 29.46, 84.01, 164.8];

    planet._radius = UA * UA_factors[planet._selectedPlanetIdx];
	planet._scaleFactor = (base_size * size_factors[planet._selectedPlanetIdx])/100;
    planet._vel = base_velocity * velocity_factors[planet._selectedPlanetIdx];
}

function updateFakeDimensions(planet){
    let props = planetProperties().find(props => props.index === planet._selectedPlanetIdx);

    planet._radius = props.radius;
	planet._scaleFactor = props.size/10;
    planet._vel = props.velocity;
}

function getPlanetByIndex(index){
    return planets.find(planet => index === planet._selectedPlanetIdx);
}