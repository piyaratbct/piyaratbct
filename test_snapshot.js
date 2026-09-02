// Simulate the issue
let isLoaded = true;
let selectedMonth = "";
let allAssessments = []; // from cache

if (isLoaded && selectedMonth === "") {
    if (allAssessments.length > 0) {
        selectedMonth = "2026-08";
    } else {
        selectedMonth = "2026-09";
    }
}
console.log("After cache:", selectedMonth);

allAssessments = [{month: "2026-08"}]; // from server
if (isLoaded && selectedMonth === "") {
    if (allAssessments.length > 0) {
        selectedMonth = "2026-08";
    } else {
        selectedMonth = "2026-09";
    }
}
console.log("After server:", selectedMonth);
