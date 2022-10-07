const btn = document.getElementById("searchBtn");
const preSearchDiv = document.getElementById("beforeSearchDiv");
const postSearchDiv = document.getElementById("duringSearchDiv");
const searchFeedback = document.getElementById("searchFeedback");
let delayMs = 4000;
let numSearches = 1;
let [tab] = [null];

(async function() {
	[tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	console.log("Got active tab.");
	console.log(tab);
	if (tab.url.indexOf("bing.com") == -1) {
		// we are not on bing
		btn.innerText = "Go to Bing";
	}
})();

chrome.storage.sync.get("delay", function({ delay }) {
	if (delay == null || delay == "") {
		delayMs = 4000;
	} else {
		delayMs = parseInt(delay);
	}
});
chrome.storage.sync.get("searches", function({ searches }) {
	if (searches == null || searches == "") {
		numSearches = 25;
	} else {
		numSearches = parseInt(searches);
	}
});

btn.addEventListener("click", async function() {
	preSearchDiv.style.display = "none";
	postSearchDiv.style.display = "block";
	searchFeedback.innerText = "Initializing search...";
	
	if (tab.url.indexOf("bing.com") == -1) {
		// we are not on bing
		chrome.tabs.create({ url: "https://www.bing.com" });
	}
	
	// wait 2 seconds before searching
	setTimeout(function() {
		let searchTerms;
		chrome.storage.sync.get("terms", function({ terms }) {
			console.log(terms);
			if (terms == null || terms == "") {
				searchTerms = ["Jeff bezos net worth", "Jeff bezos wiki", "Jeff bezos"];
			} else {
				searchTerms = terms.split("$");
			}
			console.log("Got search terms from storage.");
			console.log(searchTerms);
			console.log("searching for " + numSearches + " searches from " + searchTerms.length + " total.");
			// shuffle array
			let finalSearchTerms = searchTerms.map(value => ({ value, sort: Math.random() }))
											  .sort((a, b) => a.sort - b.sort)
											  .map(({ value }) => value)
											  .splice(0, numSearches);
			const termsLength = finalSearchTerms.length;
			console.log("shuffled and selected first " + numSearches + " items. final terms are:");
			console.log(finalSearchTerms);
			
			let curTermIndex = 1;
			const searchRecur = (curTerms) => {
				if (curTerms.length == 0) {
					searchFeedback.innerText = "Done searching! Searched " + termsLength + " terms.";
					return;
				}
				let curTerm = curTerms.pop();
				console.log("Searching for: " + curTerm);
				searchFeedback.innerText = "(" + curTermIndex + "/" + termsLength + ") Searching '" + curTerm + "'";
				
				chrome.storage.local.set({
					curTerm: curTerm
				}, function() {
					chrome.scripting.executeScript({
						target: { tabId: tab.id },
						function: function() {
							let term = "";
							chrome.storage.local.get('curTerm', function (items) {
								console.log("In tab: curTerm is " + items.curTerm);
								console.log(items);
								term = items.curTerm;
								chrome.storage.local.remove('curTerm');
								
								console.log("In tab: searching for: " + term);
								document.querySelector("input#sb_form_q").value = term;
								document.querySelector("input#sb_form_go").click();
							});
						}
					});
					curTermIndex++;
				});
				
				setTimeout(function() {
					searchRecur(finalSearchTerms);
				}, delayMs);
			}
			searchRecur(finalSearchTerms);
		});
	}, 2000);
});

function doSearch() {
	document.querySelector("input#sb_form_q").value = curTerm;
	document.querySelector("input#sb_form_go").click();
}