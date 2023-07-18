
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
const promptMessage = "Reconstruct the physical scene by moving the position of the obstacle with your cursor."
// First trial response time
const firstTrialDuration = 3000
// Wireframe status
const noColor = false

// colorB = randomChoice(['#66FF00', '#1974D2', '#08E8DE', '#FFF000', '#FFAA1D', '#FF007F'])
// colorB = randomChoice(['#35BBCA', '#0191B4', '#F8D90F', '#D3DD18', '#FE7A15']);

// color_obstacle = randomChoice(['#b2a8d6', '#a58add', '#5c77fb', '#7f44f9'])