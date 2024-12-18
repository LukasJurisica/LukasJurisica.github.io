// Function to create post request and do something with response
export function request(url, method, data, responseMode, callback) {
	let options = { method, headers: {'content-type': 'application/json'}  };
	if (method.toLowerCase() != "get")
		options["body"] = JSON.stringify(data);

	return fetch(url, options).then(response => {
		if (responseMode == "json")
			return response.json();
		else {
			return response.text().then(data => {
				return data.replaceAll("\r\n", "\n");
			});
		}
	}).then(data => {
		callback(data);
	});
}

export function ClearQueryParams() {
	const url = new URL(window.location.href);
	url.searchParams.delete('i');
	history.replaceState({}, '', url.href);
}