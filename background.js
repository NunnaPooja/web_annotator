chrome.commands.onCommand.addListener(function(command) {
    if (command === 'highlight') {
      highlightSelectedText();
    } else if (command === 'annotate') {
      annotateSelectedText();
    }
  });  
  
  function highlightSelectedText() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: highlightText
      }, function(results) {
        if (chrome.runtime.lastError) {
          console.error('Error executing script:', chrome.runtime.lastError.message);
        }
      });
    });
  }
  function annotateSelectedText() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: annotateText
        }, function(results) {
            if (chrome.runtime.lastError) {
                console.error('Error executing script:', chrome.runtime.lastError.message);
            }
        });
    });
}
  function highlightText() {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
      chrome.storage.sync.get('highlightColor', function(data) {
        const highlightColor = data.highlightColor || 'yellow';
        const span = document.createElement('span');
        span.style.backgroundColor = highlightColor;
        span.textContent = selectedText;
        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
        saveAnnotation(window.location.href, span.outerHTML, '');
      });
    }
  }
  
  function saveAnnotation(url, highlight, note) {
    if (!note.trim()) {
      console.warn('Skipping saving empty annotation.');
      return;
    }
    
    const date = new Date().toISOString();
    chrome.storage.sync.get([url], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving annotations:', chrome.runtime.lastError.message);
        return;
      }
      const annotations = result[url] || [];
      annotations.push({ highlight, note, date });
      chrome.storage.sync.set({ [url]: annotations }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error saving annotation:', chrome.runtime.lastError.message);
        } else {
          console.log('Annotation saved:', { highlight, note, date });
        }
      });
    });
    
  }
