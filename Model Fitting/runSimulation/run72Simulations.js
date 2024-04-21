const fs = require('fs');
const { Engine, Bodies, Body, Events, Composite } = require('matter-js');

// Extract command line arguments passed from Python
const jsonFilePath = process.argv[2];  // Get the path of the JSON file from command line arguments
const storePath = process.argv[3]

// Read parameters from a JSON file
const params = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

const canvasWidth = 1000;
const canvasHeight = 600;
const ballRadius = 30;
const obstacleRadius = 45;
const ball_Y = 50;

function runSimulation(stimulus_idx, obstacle_idx, ball_X, obstacle_X, obstacle_Y, callback) {
    // Create an engine
    let engine = Engine.create({
        // Consider any engine options you need
    });

    // Set the gravity for the simulation
    engine.timing.timeScale = 1
	engine.world.gravity.y = 1;

    var ballCategory = 0x0001;
		defaultCategory = 0x0002

	var desiredTimeStep = 1000/200;

    let intervalId = setInterval(function() {
        Engine.update(engine, desiredTimeStep);
    }, desiredTimeStep);

    // Create ball and obstacle bodies
    var ball = Bodies.circle(ball_X, ball_Y, ballRadius, {
		density: 0.04,
		friction: 0.01,
		frictionAir: 0.00001,
		restitution: 0.3,
		collisionFilter: {
			category: ballCategory,
		}
	});

    var obstacle = Bodies.polygon(obstacle_X, obstacle_Y, 3, obstacleRadius, {
		isStatic: true,
		density: 0.04,
		friction: 0.01,
		frictionAir: 0.00001,
		restitution: 0.3,
		collisionFilter: {
			category: ballCategory,
		}
	});

    Body.setAngle(obstacle, Math.PI / 2);

    // Add bodies to the world
    Composite.add(engine.world, [ball, obstacle]);

    let trail = [];

    // Set up the event to capture the ball's position at each step
    Events.on(engine, 'afterUpdate', function() {
		if (ball.position.x >= 0 && ball.position.x <= canvasWidth &&
			ball.position.y >= 0 && ball.position.y <= canvasHeight) {
			trail.unshift(
				[ball.position.x, ball.position.y]
			);
		}
	});

    // Set a delay for the simulation to run
    setTimeout(() => {
        // Stop the engine
        Engine.clear(engine);
        clearInterval(intervalId);

        let simulationData = {
            stimulus_idx: stimulus_idx,
            obstacle_idx: obstacle_idx,
            ball_X: ball_X,
            obstacle_X: obstacle_X,
            obstacle_Y: obstacle_Y,
            simulated_trial: trail
        };

        // Execute callback with the simulation data
        callback(simulationData);

        // Optionally, stop the render if you have one
    }, 3000); // Adjust delay as needed for your simulation
}

params.forEach(param => {
    runSimulation(param.stimulus_idx, param.obstacle_idx, param.ball_X, param.obstacle_X, param.obstacle_Y, simulationData => {
        const fileName = `${storePath}/simulation-results-${param.stimulus_idx}-${param.obstacle_idx}.json`;
        fs.writeFileSync(fileName, JSON.stringify(simulationData), 'utf-8');
        console.log(`Simulation data saved to ${fileName}.`);
    });
});
