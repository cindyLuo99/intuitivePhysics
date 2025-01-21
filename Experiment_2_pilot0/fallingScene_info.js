function getX(x){return (canvasWidth - occluderWidth)/2 + ballRadius + occluderWidth*x}
function getY_1(y_1){return (canvasWidth - occluderWidth)/2 + obstacleRadius/2*Math.sqrt(3) + occluderWidth*y_1}
function getY_2(y_2){return (canvasHeight - occluderHeight)/2 + obstacleRadius + occluderHeight*y_2}
    
    // should be somewhat between ((canvasWidth - occluderWidth)/2 , (canvasWidth+occluderWidth)/2)
    // obstacle_X = (canvasWidth - occluderWidth)/2 + obstacleRadius/2*Math.sqrt(3) + occluderWidth*y_1,
    // obstacle_Y = (canvasHeight - occluderHeight)/2 + obstacleRadius + occluderHeight*y_2

var fallingScene_info = [
    {   stimulus_idx: 1, // <---- falling side-way
        x_ball: getX(0.0846),
        y_1: getY_1(0.1808),
        y_2: getY_2(0.1675), // (379.37, 245.25)
        fallingObjRegion: "left",
        trajectoryChange: "left",
        // obstacle_idx: 1,
        flipped: false
    },
    {   stimulus_idx: 2,
        x_ball: getX(0.0846),
        y_1: getY_1(0.0382),
        y_2: getY_2(0.1963), // (308.07, 253.89)
        fallingObjRegion: "left",
        trajectoryChange: "right",
        // obstacle_idx: 2,
        flipped: false
    },
    {   stimulus_idx: 3,
        x_ball: getX(0.0846),
        y_1: getY_1(0.0142),
        y_2: getY_2(0.5882), // (296.07, 371.46)
        fallingObjRegion: "left",
        trajectoryChange: "right",
        // obstacle_idx: 3,
        flipped: false
    },
    {
        stimulus_idx: 4, // <---- falling side-way
        x_ball: getX(0.0846),
        y_1: getY_1(0.1349),
        y_2: getY_2(0.5429), // (356.42, 357.87)
        fallingObjRegion: "left",
        trajectoryChange: "left",
        // obstacle_idx: 4,
        flipped: false
    },
    {   stimulus_idx: 5,
        x_ball: getX(0.44), // <---- if want to be at the middle, (canvasWidth - 4r)/(2*canvasWidth) = 0.44
        y_1: getY_1(0.3294),
        y_2: getY_2(0.0511), //(453.67, 210.33)
        fallingObjRegion: "mid", 
        trajectoryChange: "right",
        // obstacle_idx: 1,
        flipped: false
    },
    {   stimulus_idx: 6,
        x_ball: getX(0.44),
        y_1: getY_1(0.3819),
        y_2: getY_2(0.4529), //(479.96, 330.87)
        fallingObjRegion: "mid",
        trajectoryChange: "right",
        // obstacle_idx: 2,
        flipped: false
    },
    {   stimulus_idx: 7,
        x_ball: getX(0.44),
        y_1: getY_1(0.5290),
        y_2: getY_2(0.2917), //(553.47, 282.51)
        fallingObjRegion: "mid",
        trajectoryChange: "left",
        // obstacle_idx: 3,
        flipped: false
    },
    {   stimulus_idx: 8,
        x_ball: getX(0.44),
        y_1: getY_1(0.4438),
        y_2: getY_2(0.5801), //(510.89, 369.03)
        fallingObjRegion: "mid",
        trajectoryChange: "left",
        // obstacle_idx: 4,
        flipped: false
    },
    {   stimulus_idx: 9,
        x_ball: getX(0.6488),
        y_1: getY_1(0.7573), 
        y_2: getY_2(0.0226), // (667.62, 201.78)
        fallingObjRegion: "right",
        trajectoryChange: "left",
        // obstacle_idx: 1,
        flipped: false
    },
    {   stimulus_idx: 10, // <---- falling side-way; if not good, use (0.5641.5643) for y_1, y_2
        x_ball: getX(0.6488),
        y_1: getY_1(0.6158),
        y_2: getY_2(0.6650), // (596.87, 394.5)
        fallingObjRegion: "right",
        trajectoryChange: "right",
        // obstacle_idx: 2,
        flipped: false
    },
    {   stimulus_idx: 11,
        x_ball: getX(0.6488),
        y_1: getY_1(0.7221),
        y_2: getY_2(0.6986), // (650.02, 404.58)
        fallingObjRegion: "right",
        trajectoryChange: "left",
        // obstacle_idx: 3,
        flipped: false
    },
    {   stimulus_idx: 12, // <---- falling out of the bottom-left corner
        x_ball: getX(0.6488),
        y_1: getY_1(0.5729),
        y_2: getY_2(0.2392), // (575.42, 266.76)
        fallingObjRegion: "right",
        trajectoryChange: "right",
        // obstacle_idx: 4,
        flipped: false
    },
];