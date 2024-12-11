// 416 464 296
// 416 365 249
// 660 666 221
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

var prac_no_time = [
    {   scene:  {   // [5, 'flip']
            prac_stimulus_idx: 5,
            x: 441, 
            y_1: 414,
            y_2: 302, 
            fallingObjRegion: "right", 
            trajectoryChange: "right",
            flipped: true
        },
        choice: {
            prac_stimulus_idx: 5,
            choice: 'close gt',
            x: 434,
            y: 272
        },
        timeConstraint: null
    },
    {   scene:  {   // [3, 'original']
            prac_stimulus_idx: 3,
            x: 660,
            y_1: 666,
            y_2: 221, 
            fallingObjRegion: "mid-right",
            trajectoryChange: "right",
            // obstacle_idx: 3,
            flipped: false
    },
        choice: {   //  wrong direction
            prac_stimulus_idx: 3,
            choice: 'wrong direction',
            x: 
            y: 
        },
        timeConstraint: null
    },
    {   scene:  {   // [1, 'original']
            prac_stimulus_idx: 1, // <---- falling side-way
            x: 416,
            y_1: 464,
            y_2: 296, 
            fallingObjRegion: "left",
            trajectoryChange: "right",
            flipped: false
    },
        choice: {   // gt
            prac_stimulus_idx: 1,
            choice: 'gt',
            x: 464,
            y: 296
        },
        timeConstraint: null
    }
]    
var prac_with_time_3000 = [
    {   scene:  {   // [4, 'original']

    },
    choice: {   // gt

    },
    timeConstraint: 3000
    },
    {   scene:  {   // [1, 'flip']
            prac_stimulus_idx: 1, // <---- falling side-way
            x: 584,
            y_1: 536,
            y_2: 296, 
            fallingObjRegion: "left",
            trajectoryChange: "right",
            flipped: true
    },
        choice: {   // close gt

        },
        timeConstraint: 3000
    },
    {   scene:  {   // [1, 'original']
            prac_stimulus_idx: 1, // <---- falling side-way
            x: 416,
            y_1: 464,
            y_2: 296, 
            fallingObjRegion: "left",
            trajectoryChange: "right",
            flipped: false
    },
        choice: {   // far gt

        },
        timeConstraint: 3000
    }
];

var prac_with_time_1500 = [
    {   scene:  {   // [6, 'flip']
        },
        choice: {   // gt

        },
        timeConstraint: 1500

    },
    {   scene:  {   // [3, 'flip']
    },
        choice: {   // close gt

        },
        timeConstraint: 1500
    },
    {   scene:  {   // [4, 'original']   
    },
        choice: {   // far gt

        },
        timeConstraint: 1500
    }
] 


var prac_with_time_1500_test = [
    {   scene:  {   // [5, 'original']
        },
        choice: {   // gt

        },
        timeConstraint: 1500

    },
    {   scene:  {   // [6, 'flip']
    },
        choice: {   // close gt

        },
        timeConstraint: 1500
    },
    {   scene:  {   // [4, 'flip']
    },
        choice: {   // far gt

        },
        timeConstraint: 1500
    }
] 

var prac_with_time_3000_test = [
    {   scene:  {   // [2, 'original']

    },
    choice: {   // gt

    },
    timeConstraint: 3000
    },
    {   scene:  {   // [4, 'flip']
    },
        choice: {   // close gt

        },
        timeConstraint: 3000
    },
    {   scene:  {   // [5, 'original']
    },
        choice: {   // far gt

        },
        timeConstraint: 3000
    }
];
var pracFallingScene_general_info = [
    {   prac_stimulus_idx: 1, // <---- falling side-way
        x: 416,
        y_1: 464,
        y_2: 296, 
        fallingObjRegion: "left",
        trajectoryChange: "right",
        flipped: false
    },
    {   prac_stimulus_idx: 2,
        x: 416,
        y_1: 365,
        y_2: 249, 
        fallingObjRegion: "left",
        trajectoryChange: "left",
        flipped: false
    },
    {   prac_stimulus_idx: 3,
        x: 660,
        y_1: 666,
        y_2: 221, 
        fallingObjRegion: "mid-right",
        trajectoryChange: "right",
        flipped: false
    },
    {
        prac_stimulus_idx: 4, // <---- falling side-way
        x: 660,
        y_1: 610,
        y_2: 263, 
        fallingObjRegion: "mid-right",
        trajectoryChange: "left",
        flipped: false
    },
    {   prac_stimulus_idx: 5,
        x: 559, 
        y_1: 586,
        y_2: 302, 
        fallingObjRegion: "right", 
        trajectoryChange: "right",
        flipped: false
    },
    {   prac_stimulus_idx: 6,
        x: 559,
        y_1: 500,
        y_2: 317, 
        fallingObjRegion: "right",
        trajectoryChange: "left",
        flipped: false
    }
];