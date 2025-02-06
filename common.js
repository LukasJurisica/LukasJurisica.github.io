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

export function Get(url, response_mode) {
	let options = { method: 'get' };
	return fetch(url, options).then(response => {
		return HandleResponse(response_mode, response);
	});
}

export function Post(url, data, response_mode) {
	let options = { method: 'post', headers: {'content-type': 'application/json'}, body: JSON.stringify(data) };
	return fetch(url, options).then(response => {
		return HandleResponse(response_mode, response);
	});
}

export function ClearSearchParams(params = []) {
	const url = new URL(window.location.href);
	function DeleteSearchParams(keys) {
		for (const key of keys) 
			url.searchParams.delete(key);
	}
	
	if (params.length > 0)
		DeleteSearchParams(params)
	else {
		const keys = []
		for (const [key, value] of url.searchParams)
			keys.push(key);
		DeleteSearchParams(keys);
	}
	history.replaceState({}, '', url.href);
}