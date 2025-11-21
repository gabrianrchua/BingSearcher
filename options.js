const saveBtn = document.getElementById('saveBtn');
const addBtn = document.getElementById('addTermBtn');
const delBtn = document.getElementById('deleteTermBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const termsDiv = document.getElementById('textHolderDiv');
const delayTime = document.getElementById('delayTime');
const delayJitter = document.getElementById('delayJitter');
const searchAmt = document.getElementById('searchAmt');
const feedbackSpn = document.getElementById('feedbackSpn');

let searchTerms = [];
let delayTimeMs = 4000;
let delayJitterMs = 1000;
let numSearches = 1;
let dirty = false; // if any inputs are touched, display "unsaved changes" text

chrome.storage.sync.get('terms', function ({ terms }) {
  searchTerms = terms
    ? terms.split('$')
    : ['Sample Search 1', 'Sample Search 2', 'The third one'];
  renderTermBoxes();
});
chrome.storage.sync.get('delay', function ({ delay }) {
  delayTimeMs = delay ? parseInt(delay) : 4000;
  delayTime.value = delayTimeMs;
});
chrome.storage.sync.get('jitter', function ({ jitter }) {
  delayJitterMs = jitter ? parseInt(jitter) : 1000;
  delayJitter.value = delayJitterMs;
});
chrome.storage.sync.get('searches', function ({ searches }) {
  numSearches = searches ? parseInt(searches) : 25;
  searchAmt.value = numSearches;
});

// apply changes
saveBtn.addEventListener('click', function () {
  let terms = searchTerms.join('$');
  let delay = delayTimeMs.toString();
  let jitter = delayJitterMs.toString();
  let searches = numSearches.toString();
  chrome.storage.sync.set({ terms, delay, jitter, searches });
  feedbackSpn.innerText = 'Changes saved!';
  feedbackSpn.style.color = '';
  setTimeout(function () {
    feedbackSpn.innerText = '';
  }, 2000);
});

addBtn.addEventListener('click', function () {
  searchTerms.push('');
  renderTermBoxes();
  setDirty();
});

delBtn.addEventListener('click', function () {
  searchTerms.pop();
  renderTermBoxes();
  setDirty();
});

exportBtn.addEventListener('click', function () {
  const termsString = searchTerms.join('$');
  const blob = new Blob([termsString], { type: 'text/plain' });

  // Get current date and time in the format mm-dd-yyyy-hh-mm
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const filename = `bing-searcher-${month}-${day}-${year}-${hours}-${minutes}.search`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', function () {
  importFileInput.click();
});

importFileInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  console.log(file);
  if (!file) {
    return;
  }
  // ensure .search file is given
  if (file.name.split('.').pop() === 'search') {
    const reader = new FileReader();
    reader.onload = function (e) {
      const termsString = e.target.result;
      searchTerms = termsString.split('$');
      renderTermBoxes();
      chrome.storage.sync.set({ terms: searchTerms.join('$') });
      feedbackSpn.innerText = 'Changes imported!';
      feedbackSpn.style.color = '';
      setTimeout(function () {
        feedbackSpn.innerText = '';
      }, 2000);
    };
    reader.readAsText(file);
  } else {
    alert('Please select a valid BingSearcher file (.search)');
  }
});

delayTime.addEventListener('focusout', function () {
  delayTimeMs = parseInt(delayTime.value);
});
delayTime.addEventListener('input', setDirty);

delayJitter.addEventListener('focusout', function () {
  delayJitter = parseInt(delayJitter.value);
});
delayJitter.addEventListener('input', setDirty);

searchAmt.addEventListener('focusout', function () {
  numSearches = parseInt(searchAmt.value);
});
searchAmt.addEventListener('input', setDirty);

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
    const element = document.getElementById('term' + i);

    element.addEventListener('focusout', function () {
      updateTerm(i);
    });
    element.addEventListener('input', setDirty);
  }
}

function updateTerm(index) {
  searchTerms[index] = document.getElementById('term' + index).value;
}

function setDirty() {
  dirty = true;
  feedbackSpn.style.color = 'red';
  feedbackSpn.innerText = 'Unsaved changes';
}
