# TestRail-Plus
Chrome Extension for supercharging the TestRail workflow

# Features
1. Allow navigating to a similiar case in the other suites.
<img width="284" alt="Screenshot 2024-05-14 at 23 12 59" src="https://github.com/StevenChenWaiHo/TestRail-Plus/assets/122108964/88af5096-16f4-4f76-a216-04140b8a8229">

2. Allow link copying in full screen view.
<img width="301" alt="Screenshot 2024-05-14 at 23 12 07" src="https://github.com/StevenChenWaiHo/TestRail-Plus/assets/122108964/9ab9f299-d75c-49c2-be26-ab145a17d872">

# Installation
## Chrome
1. Download the [Chrome Extension Folder](https://www.dropbox.com/scl/fo/6fjut3exg3iwgnf241wyf/ANALisPMwtFHy9R_ZuMzv3Y?rlkey=8zut23rmjowixyqk2gcbz6lgv&st=yaklwnxo&dl=0)
2. Go to `chrome://extensions` (i.e. Chrome extension settings)
3. Turn on Developer mode
4. Click `Load unpacked` and select the Chrome Extension Folder
5. Go to your TestRail site and Right click the extension icon
6. In `This can Read and Change Site Data`, select `On *.testrail.net`

## Firefox
1. Download the [Firefox Extension Folder](https://www.dropbox.com/scl/fo/10nfa9uud3dyw0r4avgb0/ALwJ-0_FS2lt1Pe7-qiuhtM?rlkey=1i1y34rgqqf9dzgjbxlp8kg3y&st=n83uo1cc&dl=0)
2. Go to `about:debugging#/runtime/this-firefox` (i.e. Firefox extension settings)
3. At Temporary Extensions, click `Load Temporary Add-on...`
4. Select the `manifest.json` in the Firefox Extension Folder
5. Go to your TestRail site and Right click the extension icon
6. In `Extension can Read and Change Data:`, select `Always allow on *.testrail.net`

# Set up
1. Click the extension icon, a pop up should appear
2. Enter the TestRail link (e.g. https://*.testrail.net/index.php?/) and press `Save`
3. Enter your TestRail email and press `Save`
4. Enter your token (Create in TestRail/My Settings/API Keys) and press `Save`

# For Developer
1. Run `npm run build`
2. Load the `dist` file to the Chrome extension settings
