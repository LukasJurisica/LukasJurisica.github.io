#shaderstage vertex
#version 300 es
precision mediump float;

uniform vec2 camera_pos;
uniform vec2 camera_scale;
uniform int axis;

out float camera_height;

void main(void) {
	vec2 range = ceil(1.0 / camera_scale);

	float line_vertex = float(gl_VertexID & 1);
	float line_index = float(gl_VertexID >> 1);
	
	camera_height = 4.0 / camera_scale[1];

	vec2 pos;
	pos[axis] = (fract(camera_pos[axis]) - range[axis] + line_index) * camera_scale[axis];
	pos[1 - axis] = line_vertex * 2.0 - 1.0;
	
	gl_Position = vec4(pos, 0.0, 1.0);
}



#shaderstage fragment
#version 300 es
precision mediump float;

in float camera_height;
out vec4 FragColor;

float invLerp(float a, float b, float x) {
	return (x - a) / (b - a);
}

void main(void) {
	float camera_scale = invLerp(5.0, 250.0, camera_height);
	
	
	
	FragColor = vec4(mix(1.0, 0.1, camera_scale));
}