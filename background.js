chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processInput") {

    fetch('http://localhost:5000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("API response:", data);
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "updateFloatInput",
        text: request.text,
        apiResult: data.text || JSON.stringify(data)
      });
    })
    .catch(error => {
      console.error("API request failed:", error);
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "updateFloatInput",
        text: request.text,
        apiResult: "Error: " + error.message
      });
    });
  }
});