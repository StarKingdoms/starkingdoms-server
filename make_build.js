const options = require("./SERVER_OPTIONS.js");
const { execSync } = require("child_process");

console.log("[1/4] Reading server options to determine mode...");

console.log(options);

let mode = options.DEVELOPMENT_MODE;

if (mode) {
	console.log("-> Patching for target starkingdoms/development.");
	console.log("[2/4] Saving local changes.");
	console.log("exec -> git add *");
	execSync("sudo git add *");
	console.log("exec -> git commit -a -m \"Autosave of local changes by patch script.\"");
	try {
		execSync("sudo git commit -a -m \"Autosave of local changes by patch script\"");
	} catch (err) {
		console.log("No changes to save: Up-to-date");
	}
	console.log("[3/4] Running patch patches/02_client_prodtodev.patch");
	console.log("exec -> patch -f < patches/02_client_prodtodev.patch");
	execSync("sudo patch -f < patches/02_client_prodtodev.patch");
	console.log("[4/4] Save changes");
	console.log("exec -> git commit -a -m \"Swap to developer mode\"");
	execSync("sudo git commit -a -m \"Swap to developer mode\"");
	console.log("Finished patching for target starkingdoms/development.");
} else {
	console.log("-> Patching for target starkingdoms/production.");
        console.log("[2/4] Saving local changes.");
        console.log("exec -> git add *");
        execSync("sudo git add *");
        console.log("exec -> git commit -a -m \"Autosave of local changes by patch script.\"");
        try {
                execSync("sudo git commit -a -m \"Autosave of local changes by patch script\"");
        } catch (err) {
                console.log("No changes to save: Up-to-date");
        }
        console.log("[3/4] Running patch patches/01_client_devtoprod.patch");
        console.log("exec -> patch -f < patches/01_client_devtoprod.patch");
        execSync("sudo patch -f < patches/01_client_devtoprod.patch");
        console.log("[4/4] Save changes");
        console.log("exec -> git commit -a -m \"Swap to production mode\"");
        execSync("sudo git commit -a -m \"Swap to production mode\"");
        console.log("Finished patching for target starkingdoms/production.");
}
