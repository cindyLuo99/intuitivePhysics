// 416 464 296
// 416 365 249
// 660 666 221 // double collision on the edge
// change to
// 660 666 350
// 660 610 263
// 559 586 302 
// 559 495 317 // non-deterministic setting 
// changed to 
// 559 500 317

// [5, 'flip']
// [3, 'original']
// [1, 'original']
// [4, 'original']
// [1, 'flip']
// [1, 'original']
// [6, 'flip']
// [3, 'flip']
// [4, 'original']
// [5, 'original']
// [6, 'flip']
// [4, 'flip']
// [2, 'original']
// [4, 'flip']
// [5, 'original']
const l = ballRadius + (Math.sqrt(3) / 2) * obstacleRadius;

var pracFallingScene_general_info = [
    {   prac_stimulus_idx: 1, // <---- falling side-way
        x: 416,
        y_1: 464,
        y_2: 296, 
        fallingObjRegion: "left",
        trajectoryChange: "left",
        flipped: false
    },
    {   prac_stimulus_idx: 2,
        x: 416,
        y_1: 365,
        y_2: 249, 
        fallingObjRegion: "left",
        trajectoryChange: "right",
        flipped: false
    },
    {   prac_stimulus_idx: 3,
        x: 660,
        y_1: 666,
        y_2: 350, 
        fallingObjRegion: "mid-right",
        trajectoryChange: "left",
        flipped: false
    },
    {
        prac_stimulus_idx: 4, // <---- falling side-way
        x: 660,
        y_1: 610,
        y_2: 263, 
        fallingObjRegion: "mid-right",
        trajectoryChange: "right",
        flipped: false
    },
    {   prac_stimulus_idx: 5,
        x: 559, 
        y_1: 586,
        y_2: 302, 
        fallingObjRegion: "right", 
        trajectoryChange: "left",
        flipped: false
    },
    {   prac_stimulus_idx: 6,
        x: 559,
        y_1: 500,
        y_2: 317, 
        fallingObjRegion: "right",
        trajectoryChange: "right",
        flipped: false
    }
];

function generateScene(pracSceneInfo, stimulusIdx, flipped, canvasWidth = 1000) {
    const scene = pracSceneInfo.find((s) => s.prac_stimulus_idx === stimulusIdx);

    if (!scene) {
        console.error(`Stimulus index ${stimulusIdx} not found.`);
        return null;
    }

    const { x, y_1, y_2, fallingObjRegion, trajectoryChange} = scene;

    // Determine the new trajectoryChange based on the flipped state
    let newTrajectoryChange = trajectoryChange;
    if (flipped) {
        if (trajectoryChange === 'right') {
            newTrajectoryChange = 'left';
        } else if (trajectoryChange === 'left') {
            newTrajectoryChange = 'right';
        }
    }

    return {
        prac_stimulus_idx: stimulusIdx,
        x_ball: flipped ? canvasWidth - x : x,
        y_1: flipped ? canvasWidth - y_1 : y_1,
        y_2: y_2,
        fallingObjRegion: fallingObjRegion, // not updated
        trajectoryChange: trajectoryChange,
        newTrajChange: newTrajectoryChange,
        flipped: flipped,
    };
}

function generateRandomRange(min, max, rng = Math.random) {
    const sign = rng() < 0.5 ? -1 : 1;
    const value = rng() * (max - min) + min;
    return sign * value;
}

// Example usage:
const randomValue = generateRandomRange(20, 50);
console.log(randomValue);

function generateChoice(scene, type) {
    const { x_ball, y_1, y_2, newTrajChange } = scene;

    let x, y, n, m

    // Define the occluder boundaries
    var xMin = 251, xMax = 749;
    var yMin = 151, yMax = 449;

    if (type === "gt") {
        n = 0;
        m = 0;
    } else if (type === "wrong direction") {
        n = -30;
        m = 50;
    } else if (type === "close gt") {
        n = generateRandomRange(15, 40); // Random +/- 15, 40 (around ball)
        m = generateRandomRange(15, 40); // Random +/- 15, 40
    } else if (type === "far gt") {
        n = generateRandomRange(40, 100); 
        m = generateRandomRange(40, 200);
    } else {
        console.error(`Invalid choice type: ${type}`);
        return null;
    }
    console.log(n, m)
    x = y_1 + n;
    y = y_2 + m;
    // if right, then x > x_ball xMin = x_ball
    if (newTrajChange === 'right') {xMax = x_ball - 5} // prevent non-deterministic simulations
    else {xMin = x_ball + 5}
    // Constrain x and y within the occluder region
    x = Math.max(xMin, Math.min(xMax, x));  // Ensure x is between xMin and xMax
    y = Math.max(yMin, Math.min(yMax, y));  // Ensure y is between yMin and yMax

    return {
        prac_stimulus_idx: scene.prac_stimulus_idx,
        choice: type,
        x: Math.round(x), // Round for cleaner values
        y: Math.round(y),
    };
}

function generatePracticeTrials() {
    const practiceTrials = {
        noTime: [],
        timed3000: [],
        timed1500: [],
        timed1500Test: [],
        timed3000Test: [],
    };

    // Practice trial settings, determined before
    const trialSettings = [
        // No time constraint
        { stimulusIdx: 5, flipped: true, type: "close gt", timeConstraint: 'NA' },
        { stimulusIdx: 3, flipped: false, type: "wrong direction", timeConstraint: 'NA' },
        { stimulusIdx: 1, flipped: false, type: "gt", timeConstraint: 'NA' },

        // Timed trials (3s)
        { stimulusIdx: 4, flipped: false, type: "gt", timeConstraint: 3000 },
        { stimulusIdx: 1, flipped: true, type: "close gt", timeConstraint: 3000 },
        { stimulusIdx: 1, flipped: false, type: "far gt", timeConstraint: 3000 },

        // Timed trials (1.5s)
        { stimulusIdx: 6, flipped: true, type: "gt", timeConstraint: 1000 },
        { stimulusIdx: 3, flipped: true, type: "close gt", timeConstraint: 1000 },
        { stimulusIdx: 4, flipped: false, type: "far gt", timeConstraint: 1000 },

        // Test trials (1.5s)
        { stimulusIdx: 5, flipped: false, type: "gt", timeConstraint: 1000 },
        { stimulusIdx: 6, flipped: true, type: "close gt", timeConstraint: 1000 },
        { stimulusIdx: 4, flipped: true, type: "far gt", timeConstraint: 1000 },

        // Test trials (3s)
        { stimulusIdx: 2, flipped: false, type: "gt", timeConstraint: 3000 },
        { stimulusIdx: 4, flipped: true, type: "close gt", timeConstraint: 3000 },
        { stimulusIdx: 5, flipped: false, type: "far gt", timeConstraint: 3000 },
    ];

    trialSettings.forEach((setting) => {
        const scene = generateScene(pracFallingScene_general_info, setting.stimulusIdx, setting.flipped);
        if (scene) {
            const choice = generateChoice(scene, setting.type);
            const trial = { scene, choice, timeConstraint: setting.timeConstraint };

            // Assign to the correct trial type
            if (setting.timeConstraint === 'NA') {
                practiceTrials.noTime.push(trial);
            } else if (setting.timeConstraint === 3000 && practiceTrials.timed3000.length < 3) {
                practiceTrials.timed3000.push(trial);
            } else if (setting.timeConstraint === 1500 && practiceTrials.timed1500.length < 3) {
                practiceTrials.timed1500.push(trial);
            } else if (setting.timeConstraint === 1500) {
                practiceTrials.timed1500Test.push(trial);
            } else if (setting.timeConstraint === 3000) {
                practiceTrials.timed3000Test.push(trial);
            }
        }
    });

    return practiceTrials;
}

function saveToJsFile(data, filename = 'practiceTrials.js') {
    // Start the file content with the variable declaration
    let dataString = `const practiceTrials = {\n`;

    // Loop through each category (e.g., noTime, timed3000, etc.) and manually build the object
    for (const [key, value] of Object.entries(data)) {
        dataString += `  ${key}: [\n`; // Start each array for the key

        value.forEach((item) => {
            dataString += `    {\n`; // Open each object

            // Loop through each key-value pair in the object
            for (const [itemKey, itemValue] of Object.entries(item)) {
                if (typeof itemValue === 'object' && itemValue !== null) {
                    // Handle nested objects
                    dataString += `      ${itemKey}: {\n`;

                    for (const [nestedKey, nestedValue] of Object.entries(itemValue)) {
                        if (typeof nestedValue === 'string') {
                            dataString += `        ${nestedKey}: "${nestedValue}",\n`; // Quote strings
                        } else {
                            dataString += `        ${nestedKey}: ${nestedValue},\n`; // Keep numbers, booleans, etc.
                        }
                    }

                    dataString += `      },\n`; // Close the nested object
                } else if (typeof itemValue === 'string') {
                    // Handle string values
                    dataString += `      ${itemKey}: "${itemValue}",\n`;
                } else {
                    // Handle non-object values (numbers, booleans, etc.)
                    dataString += `      ${itemKey}: ${itemValue},\n`;
                }
            }

            dataString += `    },\n`; // Close each object
        });

        dataString += `  ],\n`; // Close the array for each key
    }

    dataString += `};\n`; // Close the practiceTrials object

    // Create a Blob from the data string
    const blob = new Blob([dataString], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Default name for the file
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Cleanup the link element
}

// Generate practice trials
const practiceTrials = generatePracticeTrials();
console.log(practiceTrials);

// Call the function to save the practiceTrials object
saveToJsFile(practiceTrials);