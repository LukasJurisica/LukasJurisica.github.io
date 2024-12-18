const Canvas = class {
	constructor(id) {
		let canvas = document.getElementById(id);
		if (canvas === null)
			throw new Error("No canvas with the ID: " + id + " was found.");
		this.context = canvas.getContext("webgl2");
		this.Resize();
	}
	
	Bind() {
		window.gl = this.context;
		return this.context;
	}
	
	Resize() {
		this.context.canvas.width = this.GetWidth();
		this.context.canvas.height = this.GetHeight();
		this.context.viewport(0, 0, this.GetWidth(), this.GetHeight());
	}

	GetWidth() {
		return this.context.canvas.offsetWidth;
	}
	
	GetHeight() {
		return this.context.canvas.offsetHeight;
	}
		
	GetAspectRatio() {
		return this.GetWidth() / this.GetHeight();
	}
}

// WebGL Shader Class
const Shader = class {
	constructor(sources) {
		let vertex_shader = this.#CreateShaderStage(window.gl.VERTEX_SHADER, sources["vertex"]);
		let fragment_shader = this.#CreateShaderStage(window.gl.FRAGMENT_SHADER, sources["fragment"]);

		// Create Shader
		this.id = window.gl.createProgram();
		window.gl.attachShader(this.id, vertex_shader);
		window.gl.attachShader(this.id, fragment_shader);
		window.gl.linkProgram(this.id);
		this.Bind();
		
		// Cleanup
		window.gl.deleteShader(vertex_shader);
		window.gl.deleteShader(fragment_shader);
		
		// Init uniform locations
		this.uniforms = {};
	}
	
	Bind() {
		window.gl.useProgram(this.id);
	}
	
	Free() {
		window.gl.deleteProgram(this.id);
	}
	
	#CreateShaderStage(stage, source) {
		let shader_stage = window.gl.createShader(stage);
		window.gl.shaderSource(shader_stage, source);
		window.gl.compileShader(shader_stage);
		if (!window.gl.getShaderParameter(shader_stage, window.gl.COMPILE_STATUS))
            throw new Error("Error compiling " + stage + " shader: " + window.gl.getShaderInfoLog(shader_stage));
		return shader_stage;
	}
	
	#GetUniformLocation(name) {
		if (!(name in this.uniforms)) {
			this.uniforms[name] = window.gl.getUniformLocation(this.id, name);
			if (this.uniforms[name] === null)
				console.log("Error: unform with name \"" + name + "\" not found.");
		}
		return this.uniforms[name];
	}
	
	static Parse(shader_source) {
		const shaderstage = "#shaderstage ";
		let sources = {};
		let current_key = "", current_value = "";
		
		for (const line of shader_source.split("\n")) {
			let idx = line.search(shaderstage);
			if (idx != -1) {
				sources[current_key] = current_value;
				current_key = line.substr(idx + shaderstage.length);
				current_value = "";
			}
			else {
				current_value += line + "\n";
			}
		}
		sources[current_key] = current_value;
		return sources;
	}
	
	SetFloatV(name, data) {
		let loc = this.#GetUniformLocation(name);
		if (data.length == 1)
			window.gl.uniform1fv(loc, data);
		else if (data.length == 2)
			window.gl.uniform2fv(loc, data);
		else if (data.length == 3)
			window.gl.uniform3fv(loc, data);
		else if (data.length == 4)
			window.gl.uniform4fv(loc, data);
	}
}

export { Canvas, Shader };