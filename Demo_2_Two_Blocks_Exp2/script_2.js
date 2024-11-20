document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.displayData()
            jsPsych.data.get().localSave('csv','mydata.csv');
        }
    })

    // full 72 trials
    // Combine fallingScene_info and yesOrNoTask_info
    const full_design = fallingScene_info.flatMap((scene) => {
        // Filter choices associated with the current falling scene
        const choices = yesOrNoTask_info.filter((choice) => choice.stimulus_idx === scene.stimulus_idx);

        // Return combined objects with separate 'scene' and 'choice' fields
        return choices.map((choice) => ({
            scene: scene, // Falling scene info
            choice: choice, // Choice info for the Yes/No trial
        }));
    });

    console.log(full_design); // Debugging: check the combined design

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;
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

    function addProgressBar(trialDuration) {
        // Create the container for the progress bar and timer
        var wrapperContainer = document.createElement('div');
        wrapperContainer.id = 'progress-bar-wrapper'; // A wrapper for the bar and timer
        document.body.appendChild(wrapperContainer);

        // Add the progress bar at the top-right corner
        var progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'progress-bar-container'; // Use the CSS ID
        wrapperContainer.appendChild(progressBarContainer);
    
        var progressBar = document.createElement('div');
        progressBar.id = 'progress-bar'; // Use the CSS ID
        // Dynamically set the duration for the transition
        progressBar.style.transition = `width ${trialDuration / 1000}s linear`;
        progressBarContainer.appendChild(progressBar);

        var timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display'
        wrapperContainer.appendChild(timerDisplay);

        // Start shrinking the progress bar
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 0);

        // Initialize the timer display
        let remainingTime = trialDuration / 1000; // Convert milliseconds to seconds
        timerDisplay.textContent = `${Math.floor(remainingTime)}:${Math.floor((remainingTime % 1) * 100).toString().padStart(2, '0')}`;
        
        // Start precise timing
        const startTime = performance.now(); // Record the start time
        const endTime = startTime + trialDuration; // Calculate the end time

        const updateTimer = () => {
            const now = performance.now(); // Current high-resolution time
            const remainingTime = Math.max(0, endTime - now); // Calculate remaining time in ms

            if (remainingTime > 0) {
                const seconds = Math.floor(remainingTime / 1000);
                const milliseconds = Math.floor((remainingTime % 1000) / 10); // 2-digit milliseconds
                timerDisplay.textContent = `${seconds}:${milliseconds.toString().padStart(2, '0')}`;
                requestAnimationFrame(updateTimer); // Schedule the next update
            } else {
                timerDisplay.textContent = '0:00'; // Ensure final state is 0:00
            }
        };

        updateTimer(); 
    }
        // Helper function to create a single hint
        function createHint(text, imagePath, imageAlt) {
            // Create a container for the hint
            const hintContainer = document.createElement("div");
            hintContainer.className = "hint"; // Matches the CSS class
        
            // Add the hint text
            const hintText = document.createElement("div");
            hintText.className = "hint-text";
            hintText.textContent = text;
            hintContainer.appendChild(hintText);
        
            // Add the image
            const hintImage = document.createElement("img");
            hintImage.className = "hint-image";
            hintImage.src = imagePath; // Set the image source
            hintImage.alt = imageAlt; // Set the alt text for accessibility
            hintContainer.appendChild(hintImage);
        
            return hintContainer;
        }

    function addHintTexts() {
        // Create a container for the hints
        const hintsContainer = document.createElement("div");
        hintsContainer.id = "hints-container"; // Matches the CSS ID
        document.body.appendChild(hintsContainer);
    
        // Add the "No (F)" hint on the left
        const noHint = createHint("No", "keyboard_key_f.png", "Keyboard Key F");
        hintsContainer.appendChild(noHint);
    
        // Add the "Yes (J)" hint on the right
        const yesHint = createHint("Yes", "keyboard_key_j.png", "Keyboard Key J");
        hintsContainer.appendChild(yesHint);
    }

    function yesNoTrial(promptMessage, obstacle_X, obstacle_Y, obstacleRadius, trialDuration) {

        // Add prompt element
        var promptContainer = document.createElement('div');
        promptContainer.id = 'prompt-container';
        document.body.appendChild(promptContainer);

        // Add the prompt message
        var promptText = document.createElement('div');
        promptText.className = 'prompt-text';
        promptText.innerHTML = promptMessage;
        promptContainer.appendChild(promptText);

        addProgressBar(trialDuration);
        addHintTexts()

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

        // add bodies to the world
        // World.add(engine.world, [triangle, mouseConstraint, occluder]); //<------- test
        World.add(engine.world, [triangle]);

        // run the renderer
        Render.run(render);

        // create runner
        var runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);
        }

    function cleanupUI() {
        const progressBar = document.getElementById('progress-bar-wrapper');
        const hints = document.getElementById('hints-container');
        const prompt = document.getElementById('prompt-container');
        const canvas = document.querySelector('canvas');
    
        if (progressBar) progressBar.remove();
        if (hints) hints.remove();
        if (prompt) prompt.remove();
        if (canvas) canvas.remove();
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
        choices: 'NO_KEYS',
        trial_duration: firstTrialDuration,
        data: {
            flipped: false,
            task: 'ballFalling',
        },
        on_start: function(trial) {
            // console.log(jsPsych.timelineVariable('first').x)
            // var ball_X = jsPsych.timelineVariable('first').x
            // var obstacle_X = jsPsych.timelineVariable('first').y_1
            // var obstacle_Y = jsPsych.timelineVariable('first').y_2
            // console.log(jsPsych.timelineVariable('first').stimulus_idx)
            cleanupUI()
            const scene = jsPsych.timelineVariable('scene'); // Access 'scene' info
            let ball_X = scene.x;
            let obstacle_X = scene.y_1;
            let obstacle_Y = scene.y_2;
            trial.data.flipped = Math.random() >= 0.5
            if (trial.data.flipped) {
                console.log('Flipped!')
                ball_X = canvasWidth - ball_X
                obstacle_X = canvasWidth - obstacle_X
            }
            console.log(ball_X, obstacle_X)
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius);
    },
        on_finish: function(trial){
            const scene = jsPsych.timelineVariable('scene');
            jsPsych.data.addDataToLastTrial({
                ball_X: scene.x,
                obstacle_groundTruth_x: scene.y_1,
                obstacle_groundTruth_y: scene.y_2,
                stimulus_idx: scene.stimulus_idx,
                flipped: trial.flipped
            })
          }
    }


    var yesNoResponseTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: ['f', 'j'],
        trial_duration: secondTrialRT,
        on_start: function() {
            cleanupUI()
            const choice = jsPsych.timelineVariable('choice'); // Access 'choice' info
            var lastTrialData = jsPsych.data.getLastTrialData();
            var fallSceneFlipped = lastTrialData.trials[0].flipped
            var obstacle_X = choice.x
            var obstacle_Y = choice.y
            // Add the progress bar
            if (fallSceneFlipped){
                obstacle_X = canvasWidth - obstacle_X
            }
            yesNoTrial(promptMessage, obstacle_X, obstacle_Y, obstacleRadius, secondTrialRT)
        },
        data: {
            task: 'yesOrNo',
        },
        on_finish: function(data) {
            jsPsych.data.addDataToLastTrial({
                stimulus_idx: jsPsych.timelineVariable('choice').stimulus_idx,
                choice: jsPsych.timelineVariable('choice').choice,
                response: data.response,
            })
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
        timeline : [fallingObjectTrial, yesNoResponseTrial],
        // timeline : [fallingObjectTrial],
        timeline_variables : full_design.slice(0,5),
        randomize_order: true
    }
    timeline.push(fullTrialDemos)
    
    jsPsych.run(timeline);

});
