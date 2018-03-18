const needle = require("needle");

const getAccessToken = require("./getAccessToken");

const getCustomerDetailsCacheGenerator = () => {
	let cache = {};
	return async userID => {
		if(cache[userID]){
			return cache[userID];
		} else {
			let token = (await getAccessToken()).access_token;
			let url = "https://api.sbanken.no/Customers/api/v1/Customers/"+userID;
			let resp = await needle("get", url, {
				headers: {
					Authorization: "Bearer " + token,
					Accept: "application/json",
				}
			});
			console.log(Date.now()+" Hit "+url);
			cache[userID] = resp.body.item;
			return cache[userID];
		}
	}
}

module.exports = getCustomerDetailsCacheGenerator();