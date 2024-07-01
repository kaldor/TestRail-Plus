import fs from 'fs';
import path from 'path';

// Get the new version from the command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Please provide the new version as a command line argument.');
    process.exit(1);
}

const updateFile = (manifestPath) => {
    // Read the manifest.json file
    fs.readFile(manifestPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading manifest.json: ${err}`);
            process.exit(1);
        }

        // Parse the JSON data
        let manifest;
        try {
            manifest = JSON.parse(data);
        } catch (parseErr) {
            console.error(`Error parsing manifest.json: ${parseErr}`);
            process.exit(1);
        }

        // Update the version field
        manifest.version = newVersion;

        // Convert the JSON object back to a string
        const updatedManifest = JSON.stringify(manifest, null, 2);

        // Write the updated string back to manifest.json
        fs.writeFile(manifestPath, updatedManifest, 'utf8', writeErr => {
            if (writeErr) {
                console.error(`Error writing to manifest.json: ${writeErr}`);
                process.exit(1);
            }

            console.log(`${path.parse(manifestPath).base} version updated to ${newVersion}`);
        });
    });
}

// Define the path to the manifest.json file
const chromeManifestPath = path.join(process.cwd(), './manifest.chrome.json');
const firefoxManifestPath = path.join(process.cwd(), './manifest.firefox.json');

updateFile(chromeManifestPath)
updateFile(firefoxManifestPath)
