let originalInput = document.getElementById('originalInput');
let reversedInput = document.getElementById('reversedInput');
let copyButton = document.getElementById('copyButton');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateFloatInput") {
    originalInput.value = request.text;
    reversedInput.value = request.reversed;
  }
});

copyButton.addEventListener('click', function() {
  reversedInput.select();
  document.execCommand('copy');
});