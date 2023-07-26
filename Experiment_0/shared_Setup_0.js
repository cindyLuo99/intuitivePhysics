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
const promptMessage = "Move the triangle to where you think the ball hit it behind the screen."
// First trial response time
const firstTrialDuration = 3000
// Wireframe status
const noColor = false

// Setup for practice trial
const obstacle_X_prac = 600, 
      obstacle_Y_prac = 400

// Setup for practice trial with occluder
const ball_X_prac_occ = 400, 
      ball_Y_prac_occ = 50,
      obstacle_X_prac_occ = 420,
      obstacle_Y_prac_occ = 415,
      obstacle_X_prac_occ_init = canvasWidth/2, 
      obstacle_Y_prac_occ_init = canvasHeight/2

