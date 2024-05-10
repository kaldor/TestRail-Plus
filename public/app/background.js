const injectDOM = () => {
  const linksToOtherSuites = document.createElement("a")
  linksToOtherSuites.textContent = "Navigate to the other suite"
  linksToOtherSuites.href = "https://www.google.com"
  linksToOtherSuites.id = "injected"

  const injectAfterLoad = ({ document, parentElement, injectElement, injectToElementQuery, caseNameElementQuery }) => {

    const inject = () => {
      const injectToElement = document.querySelector(injectToElementQuery)
      if (injectToElement) {
        injectToElement.parentElement.insertBefore(injectElement, injectToElement)
        console.log(document.querySelector(caseNameElementQuery).textContent)
      }
    }

    // Try injecting before load
    inject()

    const config = { attributes: true, childList: true, subtree: true }

    // Create an observer instance to add the injection after it is loaded
    var observer = new MutationObserver((mutationList, observer) => {
      if (document.querySelector("#injected")) {
        return
      }
      inject()
    });

    observer.observe(parentElement, config);
  }

  // Try inserting it in the TestRail full screen view
  const fullScreenViewElement = document.querySelector("div.content-breadcrumb")
  if (fullScreenViewElement) {
    injectAfterLoad({
      document: document,
      parentElement: fullScreenViewElement,
      injectElement: linksToOtherSuites,
      injectToElementQuery: "div.io-container.io-framed",
      caseNameElementQuery: "span.link-tooltip.content-header-title-tooltip"
    })
    console.log('Injected in Full Screen YAYYY')
    return
  }

  // Try inserting it in the TestRail section view
  const sectionViewElement = document.querySelector("div#qpane-content")
  if (sectionViewElement) {
    injectAfterLoad({
      document: document,
      parentElement: sectionViewElement,
      injectElement: linksToOtherSuites,
      injectToElementQuery: "div.details-in-qpane",
      caseNameElementQuery: "span.link-tooltip.content-header-title-tooltip"
    })
    console.log('Injected in Section View YAYYY')
    return
  }

}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status != "complete" || !tab.url || tab.url == "chrome://newtab") {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectDOM
  })
});