const Camera2D = class {
	constructor(aspect_ratio, height, min_height, max_height) {
		this.aspect_ratio = aspect_ratio;
		this.height = height;
		this.position = [0, 0];
		this.UpdateProjection();
		this.min_height = min_height;
		this.max_height = max_height;
	}

	SetPosition(position) {
		this.position = position;
	}

	Translate(offset) {
		return (this.position = [this.position[0] + offset[0], this.position[1] + offset[1]]);
	}

	TranslatePixels(offset) {
		return this.Translate(this.GetWorldSpaceTranslation(offset));
	}

	SetAspectRatio(aspect_ratio) {
		this.aspect_ratio = aspect_ratio;
		return this.UpdateProjection();
	}

	SetHeight(height) {
		this.height = height;
		return this.UpdateProjection();
	}
	
	Zoom(zoom) {
		this.SetHeight(Math.max(Math.min(this.height * zoom, this.max_height), this.min_height));
	}

	GetPosition() {
		return this.position;
	}

	GetScale() {
		return this.scale;
	}

	GetWorldSpaceTranslation(offset) {
		let canvas_height = window.gl.canvas.offsetHeight;
		return [(offset[0] / canvas_height) * this.height, (offset[1] / canvas_height) * this.height];
	}

	GetWorldSpacePosition(coordinate) {
		let canvas_size = [window.gl.canvas.offsetWidth / 2.0, window.gl.canvas.offsetHeight / 2.0];
		coordinate = [coordinate[0] - canvas_size[0], coordinate[1] - canvas_size[1]];
		coordinate = this.GetWorldSpaceTranslation([coordinate[0], -coordinate[1]]);
		return [this.position[0] + coordinate[0], this.position[1] + coordinate[1]];
	}

	UpdateProjection() {
		this.width = this.height * this.aspect_ratio;
		return (this.scale = [2.0 / this.width, 2.0 / this.height]);
	}
}

export { Camera2D };