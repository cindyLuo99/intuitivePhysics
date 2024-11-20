document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.displayData()
        }
    })

    // Set Up
    // Object Size parameters
    const ballRadius = 30
    const obstacleRadius = 45
    // Position parameters
    const canvasWidth = 1000,
          canvasHeight = 600,
          occluder_X = canvasWidth / 2, 
          occluder_Y = canvasHeight / 2,
          occluderWidth = canvasWidth / 2,
          occluderHeight = canvasHeight / 2

    // Try-outs
    // should be between ((canvasWidth - occluderWidth)/2 + ballRadius, (canvasWidth+occluderWidth)/2 - ballRadius)
    // let x = Math.random()*0.8
    // let y_1 = Math.random()*0.9
    // let y_2 = Math.random()*0.7
    let x = 0.0846
        y_1 = 0.1349
        y_2 = 0.5429
    console.log(x, y_1, y_2)

    let ball_X = (canvasWidth - occluderWidth)/2 + ballRadius + occluderWidth*x, 
        ball_Y = 50,
        // should be somewhat between ((canvasWidth - occluderWidth)/2 , (canvasWidth+occluderWidth)/2)
        obstacle_X = (canvasWidth - occluderWidth)/2 + obstacleRadius/2*Math.sqrt(3) + occluderWidth*y_1,
        obstacle_Y = (canvasHeight - occluderHeight)/2 + obstacleRadius + occluderHeight*y_2
        // ball_X = canvasWidth - ball_X
        // obstacle_X = canvasWidth - obstacle_X
    console.log(ball_X, obstacle_X, obstacle_Y)

    // Prompt
    const promptMessage = "Reconstruct the physical scene by moving the position of the obstacle with your cursor."
    // First trial response time
    const firstTrialDuration = 3000
    // Wireframe status
    const noColor = true

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World

    // create an engine
    var engine = Engine.create();

    engine.timing.timeScale = 1

    // create a renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: noColor,
            width: canvasWidth,
            height: canvasHeight
        }
    });

    // add bodies
    var colorA = '#f55a3c',
        colorB = '#f5d259';

    var ballCategory = 0x0001;
        defaultCategory = 0x0002


    // get the length of the bandwidth
    function getBandwidth(ballR, triangleR) {
        return ballR + (Math. sqrt(3)/2)*triangleR
    }

    // returns (x_min, x_max) and (y_min, y_max) of the center of the obstacle
    function getObstacleXYRange(ballR, triangleR, ballX, occluderX, occluderY, occluderW, occluderH) {
        var bandwidth = getBandwidth(ballR, triangleR)
        var halfTriangleSide = (Math. sqrt(3)/2)*triangleR
        var x_min = Math.max(ballX - bandwidth, occluderX - occluderW/2 + halfTriangleSide),
            x_max = Math.min(ballX + bandwidth, occluderX + occluderW/2 - halfTriangleSide),
            y_min = (occluderY - occluderH/2) + triangleR, 
            y_max = (occluderY + occluderH/2) - triangleR/2
        return {x_min, x_max, y_min, y_max}
      }

    function createFallingObjectTrialSetUp(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius) {
        return function setupFallingObjectTrial() {
            // Composite.clear(engine.world, false);
            var render = Render.create({
                element: document.body,
                engine: engine,
                options: {
                    wireframes: noColor,
                    width: canvasWidth,
                    height: canvasHeight
                }
            });
            engine.world.gravity.y = 1;

            var ball = Matter.Bodies.circle(ball_X, ball_Y, ballRadius, {
                density: 0.04,
                friction: 0.01,
                frictionAir: 0.00001,
                restitution: 0.3,
                collisionFilter: {
                    category: ballCategory,
                },
                render: {
                    fillStyle: colorB,
                    strokeStyle: 'black',
                    lineWidth: 1
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
                },
                render: {
                    fillStyle: colorB,
                    strokeStyle: 'black',
                    lineWidth: 1
                }
        
            });
            
            // Matter.Body.rotate(obstacle, 1);
            Matter.Body.setAngle(obstacle, Math.PI / 2); // Rotate the triangle to make it stand straight

            var occluder = Bodies.rectangle(occluder_X, occluder_Y, occluderWidth, occluderHeight, {
                isStatic: true,
                collisionFilter: {
                    mask: defaultCategory,
                },
                render: {
                    fillStyle: colorA,
                    visible: true
                }
            });

            // add all of the bodies to the world
            Composite.add(engine.world, [ball, obstacle, occluder]);

            // run the renderer
            Render.run(render);

            // create runner
            var runner = Runner.create();

            // run the engine
            Runner.run(runner, engine);

            // Store initial position of triangle
            var initialPosition = { x: obstacle.position.x, y: obstacle.position.y };

            // Write initial position to trial data
            jsPsych.data.write({
                'triangle_groundTruth_x': initialPosition.x,
                'triangle_groundTruth_y': initialPosition.y
            });
        }
    }

    function createReconstructionTrialSetUp(promptMessage, obstacleRadius, obstacleRadius){
        return function setupReconstructionTrial() {
            // Remove existing canvas if there is one
            var existingCanvas = document.querySelector("canvas");
            if (existingCanvas) {
                existingCanvas.remove();
            }
            // Reset the world and adjust gravity
            Composite.clear(engine.world, false);
            engine.world.gravity.y = 0;

            // create a renderer
            var render = Render.create({
                element: document.body,
                engine: engine,
                options: {
                    wireframes: noColor,
                    width: canvasWidth,
                    height: canvasHeight,
                }
            });

            var startTime = performance.now();

            // Add prompt element
            var promptContainer = document.createElement('div');
            promptContainer.id = 'prompt-container';
            document.body.appendChild(promptContainer);

            var promptText = document.createElement('div');
            promptText.className = 'prompt-text';
            promptText.innerHTML = promptMessage;
            promptContainer.appendChild(promptText);

            // The triangle needs to be initialized behind the occluder
            var halfTriangleSide = (Math. sqrt(3)/2)*obstacleRadius
            var x_min = occluder_X - occluderWidth/2 + halfTriangleSide,
                x_max = occluder_X + occluderWidth/2 - halfTriangleSide,
                y_min = (occluder_Y - occluderHeight/2) + obstacleRadius,
                y_max = (occluder_Y + occluderHeight/2) - obstacleRadius
        
            // Calculate random position within occluder area
            var randomX = Math.random() * (x_max - x_min) + x_min;
            var randomY = Math.random() * (y_max - y_min) + y_min;

            // add draggable triangle
            var colorB = '#9933ff'
            var triangle = Bodies.polygon(randomX, randomY, 3, obstacleRadius, {
                isStatic: false,
                density: 0.04,
                friction: 0.01,
                frictionAir: 0.00001,
                restitution: 0.3,
                render: {
                    fillStyle: colorB,
                    strokeStyle: 'black',
                    lineWidth: 1
                }
            });

            Matter.Body.setAngle(triangle, Math.PI / 2);

            /////// test
            var occluder = Bodies.rectangle(occluder_X, occluder_Y, occluderWidth, occluderHeight, {
                isStatic: true,
                collisionFilter: {
                    mask: 0x0002,
                },
                render: {
                    fillStyle: 'blue',
                    visible: true
                }
            });

            // add mouse control
            var mouse = Mouse.create(render.canvas);
            var mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 1,
                    render: {
                        visible: false
                    }
                }
            });
            // Make the body kinematic while dragging to prevent bouncing
            Matter.Events.on(mouseConstraint, 'startdrag', function(event) {
                Matter.Body.setInertia(event.body, 10);
                event.body.isStatic = false;
            });

            // Revert the body's properties when the drag is ended, back to static again
            Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
                // Matter.Body.setInertia(event.body, event.body.inertia);
                event.body.isStatic = true;
            });

            // keep the mouse in sync with rendering
            render.mouse = mouse;

            // add bodies to the world
            // World.add(engine.world, [triangle, mouseConstraint, occluder]); //<------- test
            World.add(engine.world, [triangle, mouseConstraint]);

            // run the renderer
            Render.run(render);

            // create runner
            var runner = Runner.create();

            // run the engine
            Runner.run(runner, engine);

            // Create and add submit button
            var submitButton = document.createElement('button');
                submitButton.id = 'submit-button';
                submitButton.innerHTML = 'Submit';
                document.body.appendChild(submitButton);

            // Store initial position of triangle
            var initialPosition = { x: triangle.position.x, y: triangle.position.y };

            // Write initial position to trial data
            jsPsych.data.write({
                'triangle_initial_x': initialPosition.x,
                'triangle_initial_y': initialPosition.y
            });

        
            // Event listener for submit button
            submitButton.addEventListener('click', function() {

            // Store final position of triangle
            var finalPosition = { x: triangle.position.x, y: triangle.position.y };
            
            // Make triangle no longer draggable
            mouseConstraint.constraint.body = null;

            // World.remove(engine.world, mouseConstraint)

            // Calculate response time
            var responseTime = performance.now() - startTime;

            // Remove the submit button
            submitButton.remove();

            // Write final position and response time to trial data
            jsPsych.data.write({
                'triangle_final_x': finalPosition.x,
                'triangle_final_y': finalPosition.y,
                'response_time': responseTime
            });

            // jsPsych.data.get().addToLast({
            //         'triangle_final_x': finalPosition.x,
            //         'triangle_final_y': finalPosition.y,
            //         'response_time': responseTime
            //     });


            // End the current trial
            jsPsych.finishTrial();
            });
        }
    }

    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        trial_duration: firstTrialDuration,
        on_load: createFallingObjectTrialSetUp(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius)
    };

    var reconstructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: [],
        // trial_duration: 30000,
        on_load: createReconstructionTrialSetUp(promptMessage, obstacleRadius, obstacleRadius)
    };

    // jsPsych.run([fallingObjectTrial, reconstructionTrial]);
    jsPsych.run([fallingObjectTrial]);
});
