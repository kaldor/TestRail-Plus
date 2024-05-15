async function onPageLoad() {
  // ===== Constants ======
  const { link, email, token } = await chrome.storage.local.get(["link", "email", "token"])

  const suiteList = [{ name: "Android", project_id: 1, suite_id: 1 }, { name: "iOS", project_id: 2, suite_id: 2 }, { name: "Web", project_id: 5, suite_id: 6 }, { name: "Timeline", project_id: 20, suite_id: 62 }]

  // ===== Helper Functions =====
  const isEmptyObject = (object) => {
    return Object.keys(object).length === 0
  }

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

  // Use TestRail API Helper Function
  const fetchTestRailAPI = async (apiPath) => {
    try {
      const testcaseResponse = await fetch(link + `api/v2/${apiPath}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa(`${email}:${token}`)
        }
      })

      console.log('API Response: ', testcaseResponse)

      if (!testcaseResponse.ok) {
        throw await testcaseResponse.text()
      }
      return testcaseResponse.json()
    } catch (error) {
      throw 'API error: ' + error
    }
  }

  // Find foreign case using TestRail API
  const fetchForeignCase = async (suite, currentCase) => {
    if (!suite || !currentCase) {
      return
    }

    // Find foreign case by title
    try {
      // Remove all non-character when searching, TestRail not good at this
      const currentCaseTitleQuery = currentCase.title.replace('+', '%2B').replace('&', '%26')

      const query = `get_cases/${suite.project_id}&suite_id=${suite.suite_id}&filter=${currentCaseTitleQuery}`
      const result = await fetchTestRailAPI(query)

      console.log('Foreign Json: ', result)
      const casesResult = result.cases
      console.log('Foreign case candidates: ', casesResult)

      // If no matches
      if (casesResult.length === 0) {
        throw 'Cannot find match'
      }

      // If only one matches
      if (casesResult.length === 1) {
        return casesResult[0]
      }

      const casesWithExactSameName = casesResult.filter((test) => test.title === currentCase.title)

      // Only one candidate with the exact title
      if (casesWithExactSameName.length === 1) {
        return casesWithExactSameName[0]
      }

      // Update current case with more information by calling get_case API
      const currentCaseUpdated = await fetchTestRailAPI(`get_case/${currentCase.id}`)

      // There are muliple candidates with the exact title
      if (casesWithExactSameName.length > 1) {
        // Check if section name match up
        const currentCaseSection = await fetchTestRailAPI(`get_section/${currentCaseUpdated.section_id}`)
        for (let candidate of casesWithExactSameName) {
          const candidateSection = await fetchTestRailAPI(`get_section/${candidate.section_id}`)
          if (currentCaseSection.name === candidateSection.name) {
            return candidate
          }
        }
        return casesWithExactSameName[0]
      }

      // If no section name match up, get the best candidate by the details
      const currentCaseDetails = currentCaseUpdated.title + currentCaseUpdated.custom_preconds + currentCaseUpdated.custom_steps + currentCaseUpdated.custom_expected

      var minEditDistance = Infinity
      var bestCandidate = null
      casesResult.forEach((testcase) => {
        const candidateDetails = testcase.title + testcase.custom_preconds + testcase.custom_steps + testcase.custom_expected
        const totalEditDistance = editDistance(currentCaseDetails, candidateDetails)
        if (minEditDistance > totalEditDistance) {
          minEditDistance = totalEditDistance
          bestCandidate = testcase
        }
      })

      console.log(minEditDistance)

      return bestCandidate

    } catch (error) {
      alert(error)
      throw error
    }
  }

  const onClickForeignSuite = async (suite, currentCase) => {
    try {
      // Check if the account is set up
      if (isEmptyObject(link) || isEmptyObject(email) || isEmptyObject(token)) {
        const notSetUpErrorMessage = "Please set up your email, token and testrail link in the extension pop up."
        throw notSetUpErrorMessage
      }

      const foreignCase = await fetchForeignCase(suite, currentCase)
      console.log('Foreign case: ', foreignCase)
      const { id } = foreignCase
      const foreignCaseLink = link + "cases/view/" + id
      window.open(foreignCaseLink, "_blank");
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const injectForeignTestCases = (suiteList, injectToElement, currentCase) => {
    injectToElement.innerHTML = ''
    suiteList.forEach((suite) => {
      const foreignCaseElement = document.createElement("a")
      try {
        foreignCaseElement.onclick = async () => await onClickForeignSuite(suite, currentCase)
        foreignCaseElement.textContent = suite.name
        foreignCaseElement.style.marginRight = "10px";
        injectToElement.appendChild(foreignCaseElement)
      } catch (error) {
        alert(error)
      }
    })
  }

  // 
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
        const currentCaseTitle = caseNameElement.textContent.trim()

        const currentCase = { title: currentCaseTitle, id: currentCaseId }
        console.log('Current case: ', currentCase)
        injectElementContainer.innerHTML = ''

        // Inject Link to case number
        if (injectLinkToCaseNumber) {
          const idLink = document.createElement("a")
          idLink.id = "injectedIdLink"
          idLink.href = link + "cases/view/" + currentCaseId
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

  // Inject elements to TestRail Site
  const injectTestRail = () => {
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

  // ===== OnPageLoad Main =====

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