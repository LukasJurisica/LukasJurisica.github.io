import { Get } from './scripts/request.js';
import { Canvas, Shader } from './scripts/webgl_utils.js';
import { Camera2D } from './scripts/camera.js'

let gl, canvas;
let grid_shader;
let camera_moving = false;
let mouse_x = 0, mouse_y = 0;
let camera;

async function Init() {
	canvas = new Canvas("editor");
	gl = canvas.Bind();
	camera = new Camera2D(canvas.GetAspectRatio(), 10, 5, 100);
	grid_shader = new Shader(Shader.Parse(await Get("./shaders/grid.glsl", "text")));
	
	grid_shader.SetFloatV("camera_pos", camera.GetPosition());
	grid_shader.SetFloatV("camera_scale", camera.GetScale());
	
	Render(0);
}

function Render(time) {
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
	window.requestAnimationFrame(Render);
}

Init();


// Event listeners

gl.canvas.addEventListener("wheel", (e) => {
	e.preventDefault();
	camera.Zoom(1 - (-e.deltaY * 0.001));
	grid_shader.SetFloatV("camera_scale", camera.GetScale());
});

gl.canvas.addEventListener("mousedown", (e) => {
	if (e.button == 0) {
		let coord = camera.GetWorldSpacePosition([e.offsetX, e.offsetY]);
		console.log(Math.floor(coord[0]), Math.floor(coord[1]));
	}
	if (e.button == 1) {
		camera_moving = true
		mouse_x = e.offsetX
		mouse_y = e.offsetY;
	}
});

gl.canvas.addEventListener("mousemove", (e) => {
	if (camera_moving) {
		grid_shader.SetFloatV("camera_pos", camera.TranslatePixels([e.offsetX - mouse_x, mouse_y - e.offsetY]));
		mouse_x = e.offsetX;
		mouse_y = e.offsetY;
	}
});

window.addEventListener("mouseup", (e) => {
	if (e.button == 1)
		camera_moving = false
});

window.addEventListener("resize", (e) => {
	canvas.Resize();
	camera.SetAspectRatio(canvas.GetAspectRatio());
	grid_shader.SetFloatV("camera_scale", camera.GetScale());
});

document.getElementById("Center").onclick = (e) => {
	camera.SetPosition([0, 0]);
	grid_shader.SetFloatV("camera_pos", camera.GetPosition());
}