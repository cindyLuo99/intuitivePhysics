// const canvasWidth = 1000,
//       canvasHeight = 600,
//       occluder_X = canvasWidth / 2, 
//       occluder_Y = canvasHeight / 2,
//       occluderWidth = canvasWidth / 2,
//       occluderHeight = canvasHeight / 2
const yesOrNoTask_info = [
    { stimulus_idx: 1, choice: 'mid', x: 180, y: 190 },
    { stimulus_idx: 1, choice: 'low-projection', x: 220, y: 250 },
    { stimulus_idx: 2, choice: 'ground-truth', x: 400, y: 300 },
];

var reconstructionTask_info = [
    {   trial_idx: 2.1, 
        initial_x: leftSideOccluder + (1/4)*occluderWidth,
        initial_y: upperSideOccluder + (1/3)*occluderHeight,
        initialPos: "top-left",
        obstacle_idx: 1,
    },
    {   trial_idx: 2.2, 
        initial_x: leftSideOccluder + (1/4)*occluderWidth,
        initial_y: upperSideOccluder + (2/3)*occluderHeight,
        initialPos: "bottom-left",
        obstacle_idx: 2,
    },
    {   trial_idx: 2.3, 
        initial_x: leftSideOccluder + (2/4)*occluderWidth,
        initial_y: upperSideOccluder + (1/3)*occluderHeight,
        initialPos: "top-mid",
        obstacle_idx: 3,
    },
    {   trial_idx: 2.4, 
        initial_x: leftSideOccluder + (2/4)*occluderWidth,
        initial_y: upperSideOccluder + (2/3)*occluderHeight,
        initialPos: "bottom-mid",
        obstacle_idx: 4,
    },
    {   trial_idx: 2.5, 
        initial_x: leftSideOccluder + (3/4)*occluderWidth,
        initial_y: upperSideOccluder + (1/3)*occluderHeight,
        initialPos: "top-right",
        obstacle_idx: 5,
    },
    {   trial_idx: 2.6, 
        initial_x: leftSideOccluder + (3/4)*occluderWidth,
        initial_y: upperSideOccluder + (2/3)*occluderHeight,
        initialPos: "bottom-right",
        obstacle_idx: 6,
    },
];