#shaderstage vertex
#version 300 es
precision mediump float;

uniform vec2 camera_pos;
uniform vec2 camera_scale;

out vec2 uv;

void main(void) {
	uv = vec2(gl_VertexID & 1, gl_VertexID >> 1) * 2.0 - 1.0;
	gl_Position = vec4(uv, 0.0, 1.0);

	uv = uv / camera_scale - camera_pos;
}



#shaderstage fragment
#version 300 es
precision mediump float;

in vec2 uv;
out vec4 FragColor;

const float border_size = 0.05;
const float border_sharpness = 0.05;

float invLerp(float a, float b, float x) {
	return (x - a) / (b - a);
}

void main(void) {
	vec2 t = uv - round(uv);
	float c = min(abs(t.x), abs(t.y));
	c = invLerp(border_size - border_sharpness, border_size + border_sharpness, c);
	FragColor = vec4(c, c, c, 1.0);
}