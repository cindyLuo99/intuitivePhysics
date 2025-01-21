
const canvasWidth = 1000, // Position parameters
      canvasHeight = 600,
      occluder_X = canvasWidth / 2, 
      occluder_Y = canvasHeight / 2,
      occluderWidth = canvasWidth / 2,
      occluderHeight = canvasHeight / 2,
      // Object Size parameters
      ballRadius = 30,
      obstacleRadius = 45,
      ball_Y = 50

// Prompt
const promptMessage = "Is the triangle in the correct position?"
// First trial response time
// const firstTrialDuration = 3000
const firstTrialDuration = null
const secondTrialTimeLimits = [1000, 3000]
const shortTimeMs = secondTrialTimeLimits[0];
const longTimeMs = secondTrialTimeLimits[1];
// Wireframe status
const noColor = false

// Setup for practice trial with occluder
const ball_X_prac_occ = 400, 
      ball_Y_prac_occ = 50,
      obstacle_X_prac_occ = 420,
      obstacle_Y_prac_occ = 415,
      obstacle_X_prac_occ_init = canvasWidth/2, 
      obstacle_Y_prac_occ_init = canvasHeight/2
// colorB = randomChoice(['#66FF00', '#1974D2', '#08E8DE', '#FFF000', '#FFAA1D', '#FF007F'])
// colorB = randomChoice(['#35BBCA', '#0191B4', '#F8D90F', '#D3DD18', '#FE7A15']);

// color_obstacle = randomChoice(['#b2a8d6', '#a58add', '#5c77fb', '#7f44f9'])