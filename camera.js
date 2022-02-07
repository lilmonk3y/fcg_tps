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

function keyDownMoveCamera(event){
    var name = event.key;
    var code = event.code;

    let cameraSpeed = 0.1;

    switch (name) {

        case 'w':
            camera.setPosition(add_vector(camera.cameraPos, multiply_vector(camera.cameraFront, cameraSpeed)));
            //global_transZ += cameraSpeed;
            DrawScene();
            break;
        case 's':
            camera.setPosition(substract_vector(camera.cameraPos, multiply_vector(camera.cameraFront, cameraSpeed)));
            //global_transZ -= cameraSpeed;
            DrawScene();
            break;
        case 'a':
            camera.setPosition(add_vector(camera.cameraPos, multiply_vector(cross_product(camera.cameraFront, camera.cameraUp), cameraSpeed)));
            //global_transX += cameraSpeed;
            DrawScene();
            break;
        case 'd':
            camera.setPosition(substract_vector(camera.cameraPos, multiply_vector(cross_product(camera.cameraFront, camera.cameraUp), cameraSpeed)));
            //global_transX -= cameraSpeed;
            DrawScene();
            break;
        default:
            break;
    }
}

function mouseMoveCamera(event){
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
        camera.setFront(normalize(direction));
        DrawScene();
    }
}