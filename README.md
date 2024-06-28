# TestRail+
A Chrome / Firefox Extension for supercharging the TestRail workflow.

# Features
1. Allow navigating to a similar case in the other suites.
<img width="284" alt="Screenshot 2024-05-14 at 23 12 59" src="https://github.com/StevenChenWaiHo/TestRail-Plus/assets/122108964/88af5096-16f4-4f76-a216-04140b8a8229">

2. Allow link copying in full screen view.
<img width="301" alt="Screenshot 2024-05-14 at 23 12 07" src="https://github.com/StevenChenWaiHo/TestRail-Plus/assets/122108964/9ab9f299-d75c-49c2-be26-ab145a17d872">

# Table of Content
- [Installation](#installation)
  * [Chrome](#chrome)
  * [Firefox](#firefox)
- [Setup](#setup)
- [Versions](#versions)
- [Privacy](#privacy)
- [For Developer](#for-developer)
  * [Behind the Scene](#behind-the-scene)
  * [Manifest](#manifest)
  * [Build](#build)
  * [Version Control](#version-control)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


# Installation
## Chrome
1. Download the [Chrome Extension Folder](https://www.dropbox.com/scl/fo/6fjut3exg3iwgnf241wyf/ANALisPMwtFHy9R_ZuMzv3Y?rlkey=8zut23rmjowixyqk2gcbz6lgv&st=yaklwnxo&dl=0)
2. Go to `chrome://extensions` (i.e. Chrome extension settings)
3. Turn on Developer mode
4. Click `Load unpacked` and select the Chrome Extension Folder
5. Go to your TestRail site and right click the TestRail+ Extension icon in the browser
6. In `This can Read and Change Site Data`, select `On *.testrail.net`

## Firefox
Submitting the add-on to Firefox store is free!!! So here is the [link](https://addons.mozilla.org/en-GB/firefox/addon/testrail/)

# Setup
1. Click the extension icon, a pop up should appear
2. Enter the TestRail link (e.g. https://*.testrail.net/index.php?/) and press `Save`
3. Enter your TestRail email and press `Save`
4. Enter your token (Create in TestRail/My Settings/API Keys) and press `Save`
5. Add the test suites you want to navigate to in the `Test Suites` tab

# Versions
### v2.0.1 (Latest)
1. Added custom suite list
2. Fix cannot search test cases with comma
3. Fix duplicate error alerts

### v1.0.0 (deprecated)
1. Allow linking to foreign cases
2. Add links to case number label
3. Only works for users in Pugpig

# Privacy
No data is collected, everything is stored locally on the browser.

# For Developer
1. Run `npm run build`
2. Load the `dist` file to the Chrome extension settings

## Behind the Scene
###  Links to Foreign test case (a similar test case in the other suite)
When the link is pressed, it fires a TestRail API call to find test case in the other suite with the same test case title.
The test case return follows the heuristic below:
1. If there is no match, return 'Cannot find match' error.
2. If there are only one match, then return this test case.
3. If there is only one match with the same title, then return this test case.
3. If there are more than one match with the same title, it will try to compare their section name if still no match return the first one.
4. If there are no match with the same title, then we compare the edit distance between cases and return the best result.

## Manifest
The `manifest.json` for Chrome and Firefox is different, use `manifest.chrome.json` for Chrome and `manifest.firefox.json` for Firefox

## Build
Since the `manifest.json` for Chrome and Firefox is different, use `npm run build-chrome` or `npm run build-firefox` to build the application with their respective `manfest.json`

## Version Control
The application version is the latest Git tag with the x.x.x format.

### Get Current Version
`git describe --tags --abbrev=0`

### Update Files on `manifest.json` and `package.json`
`npm run new-version --tag=<VERSION_NUMBER>`
