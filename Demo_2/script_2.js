document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.displayData()
            jsPsych.data.get().localSave('csv','mydata.csv');
        }
    })

    // full 72 trials
    var full_design = jsPsych.randomization.factorial({first: jsPsych.randomization.shuffle(fallingScene_info), second: jsPsych.randomization.shuffle(reconstructionTask_info)}, 1);
    // for debugging
    // var full_design = jsPsych.randomization.factorial({first: jsPsych.randomization.shuffle(fallingScene_info), second: jsPsych.randomization.shuffle(reconstructionTask_info)}, 1).slice(0,5);
    // var full_design = jsPsych.randomization.factorial({first: trial_1_info}, 1);
    console.log(full_design) //.slice(0,3)

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
    var ballCategory = 0x0001;
        defaultCategory = 0x0002
  
    function randomChoice(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }
        
    // var colorA = '#f55a3c',
    var color_occluder = '#bfc5cf'
        
    
    function setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius) {
            // Stop runner and engine from previous trials
            if (runner) {
                Runner.stop(runner);
            }
            // Create a new engine
            engine = Engine.create();
            engine.world.gravity.y = 1;

            // Remove existing canvas if there is one
            var existingCanvas = document.querySelector("canvas");
            if (existingCanvas) {
                existingCanvas.remove();
            }
            Composite.clear(engine.world, false);

            var render = Render.create({
                element: document.body,
                engine: engine,
                options: {
                    wireframes: noColor,
                    width: canvasWidth,
                    height: canvasHeight
                }
            });

            // // var colorA = '#f55a3c',
            // var colorA = '#f55a3c',
            //     colorB = randomChoice(['#00BFFF', '#01F9C6', '#52D017', '#f5d259', '#FF33AA']);
            //     // colorB = randomChoice(['#66FF00', '#1974D2', '#08E8DE', '#FFF000', '#FFAA1D', '#FF007F'])
            //     // colorB = randomChoice(['#35BBCA', '#0191B4', '#F8D90F', '#D3DD18', '#FE7A15']);

            // var color_fallingObject = randomChoice(['#ffc200', '#ff9900', '#ff6800', '#ff0000']);
            var color_fallingObject = randomChoice(['#ffca14', '#ffab1f', '#ff892c', '#ff603b'])
                color_obstacle = randomChoice(['#acaad7', '#988edf', '#5c77fb', '#7f44f9'])
                

            var ball = Matter.Bodies.circle(ball_X, ball_Y, ballRadius, {
                density: 0.04,
                friction: 0.01,
                frictionAir: 0.00001,
                restitution: 0.3,
                collisionFilter: {
                    category: ballCategory,
                },
                render: {
                    fillStyle: color_fallingObject,
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
                    fillStyle: color_obstacle,
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
                    fillStyle: color_occluder,
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
        }

    function setupReconstructionTrial(promptMessage, obstacle_X, obstacle_Y, obstacleRadius) {
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

            // add draggable triangle
            // var colorB = randomChoice(['#9933ff', '#6527BE','#FF008E' ,'#45CFDD','#FF7000'])
            var color_obstacle = randomChoice(['#acaad7', '#988edf', '#5c77fb', '#7f44f9'])
            var triangle = Bodies.polygon(obstacle_X, obstacle_Y, 3, obstacleRadius, {
                isStatic: false,
                density: 0.04,
                friction: 0.01,
                frictionAir: 0.00001,
                restitution: 0.3,
                render: {
                    fillStyle: color_obstacle,
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

            // jsPsych.data.addDataToLastTrial({
            //     triangle_final_x: finalPosition.x,
            //     triangle_final_y: finalPosition.y,
            //     response_time: responseTime
            // })

            // End the current trial
            jsPsych.finishTrial();
            });
        }

    var timeline = []

    var fixation = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<span style = "font-size:40px;">+</span>',
        choices: 'NO_KEYS',
        trial_duration: 5000,
        data: {
            trial_part: 'fixation',
        }
    }
    // timeline.push(fixation) // for warming up


    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        trial_duration: firstTrialDuration,
        data: {
            flipped: false
        },
        on_start: function(trial) {
            console.log(jsPsych.timelineVariable('first').x)
            var ball_X = jsPsych.timelineVariable('first').x
            var obstacle_X = jsPsych.timelineVariable('first').y_1
            var obstacle_Y = jsPsych.timelineVariable('first').y_2
            console.log(jsPsych.timelineVariable('first').stimulus_idx)
            trial.data.flipped = Math.random() >= 0.5
            if (trial.data.flipped) {
                console.log('Flipped!')
                ball_X = canvasWidth - ball_X
                obstacle_X = canvasWidth - obstacle_X
            }
            console.log(ball_X, obstacle_X)
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius)
    },
        on_finish: function(trial){
            console.log(trial)
            jsPsych.data.addDataToLastTrial({
                ball_X: jsPsych.timelineVariable('first').x,
                obstacle_groundTruth_x: jsPsych.timelineVariable('first').y_1,
                obstacle_groundTruth_y: jsPsych.timelineVariable('first').y_2,
                stimulus_idx: jsPsych.timelineVariable('first').stimulus_idx,
                flipped: trial.flipped
            })
          }
    }


    var reconstructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: [],
        // trial_duration: 30000,
        on_start: function() {
            var obstacle_X = jsPsych.timelineVariable('second').initial_x
            var obstacle_Y = jsPsych.timelineVariable('second').initial_y
            setupReconstructionTrial(promptMessage, obstacle_X, obstacle_Y, obstacleRadius)
        },
        on_finish: function() {
            jsPsych.data.addDataToLastTrial({
                obstacle_idx: jsPsych.timelineVariable('second').obstacle_idx,
                obstacle_initial_x: jsPsych.timelineVariable('second').initial_x,
                obstacle_initial_y: jsPsych.timelineVariable('second').initial_y
            })
            var canvas = document.querySelector('canvas');
            if (canvas) canvas.remove();
        }
    };

    // jsPsych.run([fallingObjectTrial, reconstructionTrial]);

    // if only looping through the 12 first trials:
    // var trial1Demos = {
    //     timeline : [fallingObjectTrial, reconstructionTrial],
    //     timeline_variables : trial_1_info,
    //     randomize_order: true
    // }
    // timeline.push(trial1Demos)

    // loop through 72 trials:
    var fullTrialDemos = {
        timeline : [fallingObjectTrial, reconstructionTrial],
        // timeline : [fallingObjectTrial],
        timeline_variables : full_design,
        randomize_order: true
    }
    timeline.push(fullTrialDemos)
    
    jsPsych.run(timeline);

});
