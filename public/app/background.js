function onPageLoad() {
  const injectTestRail = () => {

    const TESTRAIL_LINK = "https://pugpig.testrail.net/index.php?/"

    const EMAIL = "Email"
    const PASSWORD = "Password"

    const EDIT_DISTANCE_ALLOWANCE = 5

    const suiteList = [{ name: "iOS", project_id: 2, suite_id: 2 }, { name: "Web", project_id: 5, suite_id: 6 }, { name: "Timeline", project_id: 20, suite_id: 62 }]

    const fetchForeignCase = async (suite, currentCase) => {
      if (!suite || !currentCase) {
        return
      }

      // Find foreign case by title
      try {
        const foreignCaseResponse = await fetch(TESTRAIL_LINK + `api/v2/get_cases/${suite.project_id}&suite_id=${suite.suite_id}&filter=${currentCase.name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Basic ' + btoa(`${EMAIL}:${PASSWORD}`)
          }
        })

        console.log(foreignCaseResponse)

        // Fetch Foreign case failed
        if (!foreignCaseResponse.ok) {
          const result = await foreignCaseResponse.text()
          console.log(result)
          throw result
        }

        const casesResult = await foreignCaseResponse.json().cases
        console.log('Foreign case candidates: ', casesResult)

        // If only one matches
        if (casesResult.length === 1) {
          return casesResult[0]
        }

        // Check edit distance
        const editDistance = (s, t) => {
          if (!s.length) return t.length;
          if (!t.length) return s.length;
          const arr = [];
          for (let i = 0; i <= t.length; i++) {
            arr[i] = [i];
            for (let j = 1; j <= s.length; j++) {
              arr[i][j] =
                i === 0
                  ? j
                  : Math.min(
                    arr[i - 1][j] + 1,
                    arr[i][j - 1] + 1,
                    arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                  );
            }
          }
          return arr[t.length][s.length];
        };

        if (editDistance(casesResult.cases[0], currentCase.name) <= EDIT_DISTANCE_ALLOWANCE) {
          return casesResult.cases[0]
        }

        throw 'Missed case'

      } catch (error) {
        throw error
      }
    }

    const openForeignCase = async (suite, currentCase) => {
      var foreignCase
      try {
        foreignCase = await fetchForeignCase(suite, currentCase)
        console.log('Foreign case: ', foreignCase)
      } catch (error) {
        alert('Fetch operation failed: ' + error)
      }
      const { id } = foreignCase
      const foreignCaseLink = TESTRAIL_LINK + "cases/view/" + id
      window.open(foreignCaseLink, "_blank");
    }

    const injectForeignTestCases = (suiteList, injectToElement, currentCase) => {
      suiteList.forEach((suite) => {
        const foreignCaseElement = document.createElement("a")
        try {
          foreignCaseElement.onclick = async () => await openForeignCase(suite, currentCase)
          foreignCaseElement.textContent = suite.name
          foreignCaseElement.style.marginRight = "10px";
          injectToElement.appendChild(foreignCaseElement)
        } catch (error) {
          alert(error)
        }
      })
    }

    const injectAfterLoad = ({ document, parentElement, injectToElementQuery, caseIdElementQuery, caseNameElementQuery, injectLinkToCaseNumber }) => {

      const injectElementContainer = document.createElement("div")
      injectElementContainer.id = "injected"
      injectElementContainer.style.marginBottom = "10px";

      const inject = () => {
        const injectToElement = document.querySelector(injectToElementQuery)
        if (injectToElement) {
          injectToElement.parentElement.insertBefore(injectElementContainer, injectToElement)

          const caseNumberElement = document.querySelector(caseIdElementQuery)
          const caseNameElement = document.querySelector(caseNameElementQuery)

          if (!caseNumberElement || !caseNameElement) {
            throw 'Could not get case name and id'
          }

          const currentCaseId = Number(caseNumberElement.textContent.trim().substring(1))
          const currentCaseName = caseNameElement.textContent.trim()

          const currentCase = { name: currentCaseName, id: currentCaseId }
          console.log('Current case: ', currentCase)
          injectElementContainer.innerHTML = ''

          // Inject Link to case number
          if (injectLinkToCaseNumber) {
            const idLink = document.createElement("a")
            idLink.id = "injectedIdLink"
            idLink.href = TESTRAIL_LINK + "cases/view/" + currentCaseId
            idLink.textContent = 'C' + currentCaseId
            idLink.classList.add("nolink")

            caseNumberElement.innerHTML = ''
            caseNumberElement.appendChild(idLink)
          }

          // Inject Foreign Case
          injectForeignTestCases(suiteList, injectElementContainer, currentCase)
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
        injectToElementQuery: "div.io-container.io-framed",
        caseIdElementQuery: "div[data-testid='contentHeaderId']",
        caseNameElementQuery: "div[data-testid='testCaseContentHeaderTitle']",
        injectLinkToCaseNumber: true
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
        injectToElementQuery: "div.details-in-qpane",
        caseIdElementQuery: "div[data-testid='contentHeaderId']>a.nolink",
        caseNameElementQuery: "div[data-testid='contentHeaderTitle']>span.link-tooltip.content-header-title-tooltip",
        injectLinkToCaseNumber: false
      })
      console.log('Injected in Section View YAYYY')
      return
    }

  }


  injectTestRail()
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status != "complete" || !tab.url || tab.url == "chrome://newtab") {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: onPageLoad
  })
});