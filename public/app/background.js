

const injectLinksToDOM = () => {
  const linksToOtherSuites = document.createElement("a")
  linksToOtherSuites.textContent = "Navigate to the other suite"
  linksToOtherSuites.href = "https://www.google.com"

  const injectLinksForSectionView = (document, element) => {
    const config = { attributes: true, childList: true, subtree: true }

    var injected = false
    // Create an observer instance to add the injection after it is loaded
    var observer = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        var injectToElement = document.querySelector("div.details-in-qpane")
        if (injectToElement && mutation.type === "childList" && !injected) {
          injected = true
          injectToElement.parentElement.insertBefore(linksToOtherSuites, injectToElement)
          observer.disconnect();
          break
        }
      }
    });

    observer.observe(element, config);
  }

  // Try inserting it in the TestRail full screen view
  const fullScreenViewElement = document.querySelector("div.content-breadcrumb")
  if (fullScreenViewElement) {
    var injectToElement = document.querySelector("div.io-container.io-framed")
    injectToElement.parentElement.insertBefore(linksToOtherSuites, injectToElement)
    console.log('Injected in containerFullScreenView YAYYY')
    return
  }

  // Try inserting it in the TestRail section view
  const sectionViewElement = document.querySelector("div#qpane-content")
  if (sectionViewElement) {
    injectLinksForSectionView(document, sectionViewElement)
    console.log('Injected in containerSectionView YAYYY')
    return
  }

}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status != "complete" || !tab.url || tab.url == "chrome://newtab") {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectLinksToDOM
  })
});