chrome.runtime.onInstalled.addListener(() => {
	console.log("BingSearcher started!");
});

function testBackgroundjs() {
	console.log("This is coming from background.js!");
}