import { Get } from './request.js';
import { Canvas, Shader } from './webgl_utils.js';
import { Camera2D } from './camera.js'

let gl, canvas;
let grid_shader;
let camera_moving = false;
let mouse_x = 0, mouse_y = 0;
let camera;

async function Init() {
	canvas = new Canvas("editor");
	gl = canvas.Bind();
	camera = new Camera2D(canvas.GetAspectRatio(), 10, 5, 100);
	
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	grid_shader = new Shader(Shader.Parse(await Get("./shaders/grid.glsl", "text")));
	grid_shader.SetFloat("camera_pos", camera.GetPosition());
	grid_shader.SetFloat("camera_scale", camera.GetScale());
	
	Render(0);
}

function Render(time) {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Compute the number of horizontal and vertical lines to draw for the grid
	let scale = camera.GetScale();
	let vertical = Math.ceil(1 / scale[0] * 2);
	let horizontal = Math.ceil(1 / scale[1] * 2);
	
	grid_shader.SetInt("axis", [0]);
	gl.drawArrays(gl.LINES, 0, vertical * 2);
	grid_shader.SetInt("axis", [1]);
	gl.drawArrays(gl.LINES, 0, horizontal * 2);
	
	window.requestAnimationFrame(Render);
}

Init();


// Event listeners

gl.canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
});

gl.canvas.addEventListener("wheel", (e) => {
	e.preventDefault();
	camera.Zoom(1 - (-e.deltaY * 0.001));
	grid_shader.SetFloat("camera_scale", camera.GetScale());
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
	if (e.button == 2) {

	}
});

gl.canvas.addEventListener("mousemove", (e) => {
	if (camera_moving) {
		grid_shader.SetFloat("camera_pos", camera.TranslatePixels([e.offsetX - mouse_x, mouse_y - e.offsetY]));
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
	grid_shader.SetFloat("camera_scale", camera.GetScale());
});

document.getElementById("Center").onclick = (e) => {
	camera.SetPosition([0, 0]);
	grid_shader.SetFloat("camera_pos", camera.GetPosition());
}