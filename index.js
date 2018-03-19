const needle = require("needle");
const btoa = require("btoa");
const http = require("http");

const config = require("./config");
const getAccessToken = require("./lib/getAccessToken");
const getCustomerDetails = require("./lib/getCustomerDetails");
const util = require("./lib/util");

// set up logging software
const prometheusPrefix = "sbanken_";
const Prometheus = require('prom-client');
Prometheus.collectDefaultMetrics({ timeout: 10000 }); // collects RAM usage etc every 10 s

let promAccountBalance = new Prometheus.Gauge({
	name: prometheusPrefix+'accountBalance',
	help: "Current account balance",
	labelNames: ["customerName", "accountNumber", "ownerName", "name", "accountType"],
});
async function populateAccountGauges(){
	let accountDetails = await getAccountDetails();
	console.log(accountDetails)
	await util.asyncForEach(accountDetails, async account => {
		let customerName = await useridToName(account.customerId);
		let ownerName = await useridToName(account.ownerCustomerId);
		console.log(customerName)
		promAccountBalance
		.labels(customerName, account.accountNumber, ownerName, account.name, account.accountType)
		.set(account.balance);
	});
}
// HTTP server
async function requestHandler(req, res){
	// console.log(req)
	if(req.url == "/metrics"){
		await populateAccountGauges();
		res.end(Prometheus.register.metrics());
	}
}
const server = http.createServer(requestHandler);
server.listen(12900, err => {
	if(err) return console.log(Date.now(), ' something bad happened', err);
	console.log(`${Date.now()} Server is listening on 12900`)
});
// getCustomerDetails("16119933343").then(d => console.log(JSON.stringify(d, null, 4)))

// SBanken interfacing functions
async function useridToName(userID){
	let customerDetails = await getCustomerDetails(userID);
	let fullName = customerDetails.firstName+" "+customerDetails.lastName;
	return fullName;
}
async function getAccountDetails(){
	let token = (await getAccessToken()).access_token;
	let url = "https://api.sbanken.no/bank/api/v1/accounts/"+config.userID;
	let resp = await needle("get", url, {
		headers: {
			Authorization: "Bearer "+token,
			Accept: "application/json",
		}
	});
	console.log(Date.now()+" Hit "+url);
	return resp.body.items;
}
async function getTransactions(accountNumber){
	let token = (await getAccessToken()).access_token;
	let url = "https://api.sbanken.no/bank/api/v2/transactions/"+config.userID+"/"+accountNumber;
	let resp = await needle("get", url, {
		headers: {
			Authorization: "Bearer " + token,
			Accept: "application/json",
		}
	});
	console.log(Date.now()+" Hit "+url);
	return resp.body;
}
async function getAllTransactions(){
	let accountDetails = await getAccountDetails();
	let transactions = [];
	accountDetails.forEach(account => {
		transactions.push(getTransactions(account.accountNumber));
	});
	// wait for all requests to complete
	let transactionsByAccount = await Promise.all(transactions)
	let transactionList = [];
	// transform from an array of accounts each with an array of transactions
	// to a single 1 dimensional array of transactions
	transactionsByAccount.forEach(account => {
		account.items.forEach(transaction => {
			transactionList.push(transaction)
		})
	});
	return transactionList;
}
// getAllTransactions().then(transactions => {
	// console.log(JSON.stringify(transactions, null, 4));
// }).catch(e => console.log(e))