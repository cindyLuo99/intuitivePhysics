document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.displayData()
        }
    })

    // Set Up
    // Object Size parameters
    const ballRadius = 30
    const obstacleRadius = 60
    // Position parameters
    const canvasWidth = 1000,
          canvasHeight = 600,
          occluder_X = canvasWidth / 2, 
          occluder_Y = canvasHeight / 2,
          occluderWidth = canvasWidth / 2,
          occluderHeight = canvasHeight / 2,
          ball_X = canvasWidth / 2, 
          ball_Y = 50,
          obstacle_X = canvasWidth / 2,
          obstacle_Y = 300;
    // Prompt
    const promptMessage = "Reconstruct the physical scene by moving the position of the obstacle with your cursor."



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

    function setupFallingObjectTrial() {
        // module aliases
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite;

        // create an engine
        var engine = Engine.create();

        // create a renderer
        var render = Render.create({
            element: document.body,
            // element: document.getElementById('simulation'),
            engine: engine,
            options: {
                // wireframes: false,
                wireframes: true,
                width: canvasWidth,
                height: canvasHeight
            }
        });

        // add bodies
        var colorA = '#f55a3c',
            colorB = '#f5d259';

        var ballCategory = 0x0001;
            defaultCategory = 0x0002

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

    function setupReconstructionTrial() {
        // Remove existing canvas if there is one
        var existingCanvas = document.querySelector("canvas");
        if (existingCanvas) {
            existingCanvas.remove();
        }

        var startTime = performance.now();

        // Add prompt element
        var promptContainer = document.createElement('div');
        promptContainer.id = 'prompt-container';
        document.body.appendChild(promptContainer);

        var promptText = document.createElement('div');
        promptText.className = 'prompt-text';
        promptText.innerHTML = promptMessage;
        promptContainer.appendChild(promptText);


        // module aliases
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            World = Matter.World

        // create an engine
        var engine = Engine.create();

        // Disable gravity
        engine.world.gravity.y = 0;

        // create a renderer
        var render = Render.create({
            element: document.body,
            engine: engine,
            options: {
                // wireframes: true,    <------- test
                wireframes: false,
                width: canvasWidth,
                height: canvasHeight,
            }
        });

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

        ///////// test
        // var occluder = Bodies.rectangle(occluder_X, occluder_Y, occluderWidth, occluderHeight, {
        //     isStatic: true,
        //     collisionFilter: {
        //         mask: 0x0002,
        //     },
        //     render: {
        //         fillStyle: 'blue',
        //         visible: true
        //     }
        // });

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

        // // Add event listeners for mouse hover
        // Events.on(triangle, 'mouseover', function() {
        //     document.body.classList.add('draggable'); // Add the draggable class to body
        // });
        
        // // Add event listener for mouse out
        // Events.on(triangle, 'mouseout', function() {
        //     document.body.classList.remove('draggable'); // Remove the draggable class from body
        // });

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

        // jsPsych.data.get().addToLast({
        //     'triangle_initial_x': initialPosition.x,
        //     'triangle_initial_y': initialPosition.y
        // });

    
        // Event listener for submit button
        submitButton.addEventListener('click', function() {

        // Store final position of triangle
        var finalPosition = { x: triangle.position.x, y: triangle.position.y };
        
        // Make triangle no longer draggable
        mouseConstraint.constraint.body = null;

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

    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        trial_duration: 3000,
        on_load: setupFallingObjectTrial
    };

    // if want to have a next button & using the instruction plugin
    // var fallingObjectTrial = {
    //     type: jsPsychInstructions,
    //     pages: ["<div id='simulation'></div>"],
    //     show_clickable_nav: true,
    //     allow_backward: false,
    //     button_label_next: "Next",
    //     on_load: function() {
    //         setupFallingObjectTrial();
    
    //         // Hide the 'Next' button initially
    //         var nextButton = document.querySelector('#jspsych-instructions-next');
    //         nextButton.style.visibility = 'hidden';
    
    //         // Make the 'Next' button appear after 5 seconds
    //         setTimeout(function() {
    //             nextButton.style.visibility = 'visible';
    //         }, 3000);
    //     }
    // };
    

    var reconstructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        // prompt: "<p>Reconstruct the physical scene by moving the position of the obstacle with your cursor.</p>",
        choices: [],
        // trial_duration: 30000,
        on_load: setupReconstructionTrial
    };

    jsPsych.run([fallingObjectTrial, reconstructionTrial]);
});
