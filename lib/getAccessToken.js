const btoa = require("btoa");
const needle = require("needle");

const config = require("./../config");

const getAccessTokenCacheGenerator = () => {
	let cache;
	return async ()=>{
		if(cache && cache.expirationStamp > Date.now()){
			console.log("Cached token")
			return cache;
		} else {
			// fetch a new token and add it to the cache
			let authHeader = "Basic " + btoa(config.apiKey+":"+config.secret);
			let resp = await needle("post", "https://api.sbanken.no/identityserver/connect/token", "grant_type=client_credentials", {
				headers: {
					Authorization: authHeader,
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				}
			});
			console.log(Date.now()+" Generated new access token")
			cache = resp.body;
			cache.expirationStamp = Date.now() + cache.expires_in * 500;
			return cache;
		}
	}
}
module.exports = getAccessTokenCacheGenerator();
