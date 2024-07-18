// content.js

let floatBall = null;
let floatWindow = null;
let lastInput = '';
let typingInterval = null;
let processingTimeout = null;
let spotlight = null;

function getInputContent() {
  let input = '';
  const url = window.location.href;

  if (url.includes('chatglm.cn')) {
    input = document.querySelector('textarea[placeholder="输入@，召唤智能体"]')?.value;
  } else if (url.includes('tongyi.aliyun.com')) {
    input = document.querySelector('textarea[placeholder="输入"/"唤起指令中心，Shift+Enter换行，支持拖拽或粘贴上传文件"]')?.value;
  } else if (url.includes('yiyan.baidu.com')) {
    input = document.querySelector('span[data-lexical-text="true"]')?.textContent;
  } else if (url.includes('kimi.moonshot.cn')) {
    input = document.querySelector('div[data-testid="msh-chatinput-editor"]')?.textContent;
  } else if (url.includes('chatgpt.com')) {
    input = document.querySelector('textarea#prompt-textarea')?.value;
  }

  return input || '';
}

function checkForChanges() {
  const currentInput = getInputContent();
  if (currentInput !== lastInput) {
    lastInput = currentInput;
    updateFloatWindow(currentInput, '');
  }
}

// 创建悬浮球
function createFloatBall() {
  floatBall = document.createElement('div');
  floatBall.id = 'ai-assistant-float-ball';
  document.body.appendChild(floatBall);

  floatBall.addEventListener('click', processInput);
  makeDraggable(floatBall);
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      const newTop = element.offsetTop - pos2;
      const newLeft = element.offsetLeft - pos1;
      
      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
      
      updateFloatWindowPosition(newTop, newLeft);
  }

  function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
  }
}

function updateFloatWindowPosition(ballTop, ballLeft) {
  if (floatWindow) {
      floatWindow.style.right = (window.innerWidth - ballLeft - floatBall.offsetWidth) + "px";
      floatWindow.style.bottom = (window.innerHeight - ballTop) + "px";
  }
}

function createFloatWindow() {
  floatWindow = document.createElement('div');
  floatWindow.id = 'ai-assistant-float-window';

  const loading = document.createElement('div');
  loading.id = 'ai-assistant-loading';
  for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      loading.appendChild(dot);
  }
  floatWindow.appendChild(loading);

  const output = document.createElement('div');
  output.id = 'ai-assistant-output';
  floatWindow.appendChild(output);

  const replaceButton = document.createElement('button');
  replaceButton.id = 'ai-assistant-replace-button';
  replaceButton.innerHTML = '&#8634;';
  replaceButton.style.display = 'none';
  replaceButton.addEventListener('click', replaceInputContent);
  floatWindow.appendChild(replaceButton);

  document.body.appendChild(floatWindow);
  updateFloatWindowPosition(floatBall.offsetTop, floatBall.offsetLeft);
}

function toggleFloatWindow() {
  floatWindow.classList.toggle('active');
  updateFloatWindowDimensions();
}

function updateFloatWindow(text) {
  const output = floatWindow.querySelector('#ai-assistant-output');
  output.textContent = '';
  typeText(text, output);
}

function typeText(text, element) {
  let i = 0;
  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
      if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          updateFloatWindowDimensions();
      } else {
          clearInterval(typingInterval);
          showReplaceButton();
      }
  }, 50);
}

function updateFloatWindowDimensions() {
  const output = floatWindow.querySelector('#ai-assistant-output');
  const contentHeight = output.scrollHeight;
  floatWindow.style.height = Math.min(contentHeight + 80, window.innerHeight * 0.8) + 'px';
}

function showReplaceButton() {
  const replaceButton = floatWindow.querySelector('#ai-assistant-replace-button');
  replaceButton.style.display = 'block';
}

function processInput() {
  floatBall.classList.add('typing');
  toggleFloatWindow();
  chrome.runtime.sendMessage({action: "processInput", text: lastInput});
}

function replaceInputContent() {
  const output = floatWindow.querySelector('#ai-assistant-output');
  const apiResult = output.textContent;
  const input = getInputElement();
  
  if (input) {
      if (input.tagName.toLowerCase() === 'textarea' || input.tagName.toLowerCase() === 'input') {
          input.value = apiResult;
      } else {
          input.textContent = apiResult;
      }
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
  }
  toggleFloatWindow();
}

function getInputElement() {
    const url = window.location.href;
    let input = null;
  
    if (url.includes('chatglm.cn')) {
      input = document.querySelector('textarea[placeholder="输入@，召唤智能体"]');
    } else if (url.includes('tongyi.aliyun.com')) {
      input = document.querySelector('textarea[placeholder="输入"/"唤起指令中心，Shift+Enter换行，支持拖拽或粘贴上传文件"]');
    } else if (url.includes('yiyan.baidu.com')) {
      input = document.querySelector('span[data-lexical-text="true"]');
    } else if (url.includes('kimi.moonshot.cn')) {
      input = document.querySelector('div[data-testid="msh-chatinput-editor"]');
    } else if (url.includes('chatgpt.com')) {
      input = document.querySelector('textarea#prompt-textarea');
    }
  
    return input;
}

// 监听来自background的消息

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateFloatInput") {
      floatBall.classList.remove('typing');
      updateFloatWindow(request.apiResult);
  }
});

// 加载样式
function loadStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('style.css');
  document.head.appendChild(link);
}


function createSpotlight() {
  spotlight = document.createElement('div');
  spotlight.id = 'spotlight';
  document.body.appendChild(spotlight);

  floatWindow.addEventListener('mousemove', (e) => {
      const rect = floatWindow.getBoundingClientRect();
      spotlight.style.left = (e.clientX - rect.left) + 'px';
      spotlight.style.top = (e.clientY - rect.top) + 'px';
  });

  floatWindow.addEventListener('mouseenter', () => {
      spotlight.style.display = 'block';
  });

  floatWindow.addEventListener('mouseleave', () => {
      spotlight.style.display = 'none';
  });
}
loadStyles();
createFloatBall();
createFloatWindow();
createSpotlight();
setInterval(checkForChanges, 1000);