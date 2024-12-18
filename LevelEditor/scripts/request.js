function HandleResponse(response_mode, response) {
	switch(response_mode) {
		case "text":
			return response.text();
		case "json":
			return response.json();
		default:
			throw new Error(response_mode, 'is not a valid response type for a get/post request.');
	}
}

function CleanNewlines(data) {
	return new Promise((resolve, reject) => {
		resolve(data.replaceAll("\r\n", "\n"));
	});
}

function Get(url, response_mode) {
	let options = { method: 'get' };
	return fetch(url, options).then(response => {
		return HandleResponse(response_mode, response);
	}).then(data => {
		return CleanNewlines(data);
	});
}

function Post(url, data, response_mode) {
	let options = { method: 'post', headers: {'content-type': 'application/json'}, body: JSON.stringify(data) };
	return fetch(url, options).then(response => {
		return HandleResponse(response_mode, response);
	}).then(data => {
		return CleanNewlines(data);
	});
}

export { Get, Post };