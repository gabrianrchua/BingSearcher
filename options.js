const saveBtn = document.getElementById('saveBtn');
const addBtn = document.getElementById('addTermBtn');
const delBtn = document.getElementById('deleteTermBtn');
const termsDiv = document.getElementById('textHolderDiv');
const delayTime = document.getElementById('delayTime');
const searchAmt = document.getElementById('searchAmt');
let searchTerms = [];
let delayTimeMs = 4000;
let numSearches = 1;
chrome.storage.sync.get('terms', function ({ terms }) {
  if (terms == null) {
    searchTerms = ['Sample Search 1', 'Sample Search 2', 'The third one'];
  } else {
    searchTerms = terms.split('$');
  }
  renderTermBoxes();
});
chrome.storage.sync.get('delay', function ({ delay }) {
  if (delay == null || delay == '') {
    delayTimeMs = 4000;
  } else {
    delayTimeMs = parseInt(delay);
  }
  delayTime.value = delayTimeMs;
});
chrome.storage.sync.get('searches', function ({ searches }) {
  if (searches == null || searches == '') {
    numSearches = 25;
  } else {
    numSearches = parseInt(searches);
  }
  searchAmt.value = numSearches;
});

// apply changes
saveBtn.addEventListener('click', function () {
  let terms = searchTerms.join('$');
  chrome.storage.sync.set({ terms });
  let delay = delayTimeMs.toString();
  chrome.storage.sync.set({ delay });
  let searches = numSearches.toString();
  chrome.storage.sync.set({ searches });
  document.getElementById('feedbackSpn').innerText = 'Applied!';
  setTimeout(function () {
    document.getElementById('feedbackSpn').innerText = '';
  }, 2000);
});

addBtn.addEventListener('click', function () {
  searchTerms.push('');
  renderTermBoxes();
});

delBtn.addEventListener('click', function () {
  searchTerms.pop();
  renderTermBoxes();
});

delayTime.addEventListener('focusout', function () {
  delayTimeMs = parseInt(delayTime.value);
});

searchAmt.addEventListener('focusout', function () {
  numSearches = parseInt(searchAmt.value);
});

function renderTermBoxes() {
  let finalHtml = '';
  for (let i in searchTerms) {
    finalHtml +=
      "<input type='text' id='term" +
      i +
      "' value='" +
      searchTerms[i] +
      "'><br>";
  }
  termsDiv.innerHTML = finalHtml;
  for (let i in searchTerms) {
    document
      .getElementById('term' + i)
      .addEventListener('focusout', function () {
        updateTerm(i);
      });
  }
}

function updateTerm(index) {
  searchTerms[index] = document.getElementById('term' + index).value;
}
