#shaderstage vertex
#version 300 es
precision mediump float;

uniform vec2 camera_pos;
uniform vec2 camera_scale;

out vec2 uv;
out float camera_height;

void main(void) {
	uv = vec2(gl_VertexID & 1, gl_VertexID >> 1) * 2.0 - 1.0;
	gl_Position = vec4(uv, 0.0, 1.0);

	uv = uv / camera_scale - camera_pos;
	camera_height = 4.0 / camera_scale.y;
}



#shaderstage fragment
#version 300 es
precision mediump float;

in vec2 uv;
in float camera_height;
out vec4 FragColor;

float invLerp(float a, float b, float x) {
	return (x - a) / (b - a);
}

void main(void) {
	float camera_scale = invLerp(5.0, 250.0, camera_height);
	float border = mix(0.001, 0.1, camera_scale);
	
	vec2 t = uv - round(uv);
	float c = min(abs(t.x), abs(t.y));
	c = 1.0 - invLerp(-border, border, c);
	FragColor = vec4(c, c, c, 1.0);
}