$(".execSearch").on("click", () => {
    const search = $("input")[0].value;
    console.log(search);
    sendToServer(search);
})


//send data to server
async function sendToServer(data) {
	const delay = ms => new Promise(res => setTimeout(res, ms));

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('', options);
	await delay(1000);
}