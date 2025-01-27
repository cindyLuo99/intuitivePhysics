document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            // jsPsych.data.displayData() // for debugging purpose
            // jsPsych.data.get().localSave('csv','mydata.csv');
        } // for debugging purpose
    })

    var images = ["instruction_illustration.png", "MC_7.png", "YesOrNo_instruction.png"]
    // var video = ["fallingScene_with_Occluder.mp4", "fallingScene_without_Occluder.mp4"]
    var video = ["fallingScene_with_Occluder.mp4", "fallingScene_without_Occluder.mp4",
        "fallingScene_without_Occluder_ex1.mp4", "fallingScene_without_Occluder_ex4.mp4",
        "fallingScene_without_Occluder_ex3.mp4"]
    var preload = {
        type:jsPsychPreload,
        images: images,
        video: video
    }

    // full 36 trials
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

    // Duplicate trials to get 72 trials (12 stimuli × 3 choices × 2 repetitions)
    // not necessary to shuffle here, but just to create 72 trials
    const rand_full_design = jsPsych.randomization.repeat(full_design, 2)

    // Shuffle time constraints (3 blocks for each time constraint)
    // randomize the order of the blocks
    const rand_time_limits = jsPsych.randomization.repeat(secondTrialTimeLimits, 3);

    // Double loop to create and split trials for each time constraint
    const blocks = []
    for (const timeLimit of secondTrialTimeLimits) {
        const trials = rand_full_design.map((trial) => {
            return {
                scene: trial.scene,
                choice: trial.choice,
                timeConstraint: timeLimit,
            };
        });

        // Shuffle trials and split into two blocks
        // shffle to prevent the blocks of trials to have the same order (so randomized order trials within each block)
        const shuffledTrials = jsPsych.randomization.shuffle(trials);
        const divPoint = shuffledTrials.length / 3;

        blocks.push(
            shuffledTrials.slice(0, divPoint),           // First block 1000
            shuffledTrials.slice(divPoint, divPoint * 2), // Second block 1000
            shuffledTrials.slice(divPoint * 2, divPoint * 3)            // Third block 1000
        );
    }

    const randomizedBlocks = [];
    const counters = { 1000: 0, 3000: 0 }; // Counters to track the block index for each time constraint

    rand_time_limits.forEach((timeConstraint) => {
        // Find the list of blocks for the current time constraint
        const availableBlocks = blocks.filter((block) => block[0].timeConstraint === timeConstraint);

        // Use the counter to pick the correct block and increment the counter
        const block = availableBlocks[counters[timeConstraint]];
        randomizedBlocks.push(block);

        // Increment the counter for this time constraint
        counters[timeConstraint]++;
    });

    // console.log(randomizedBlocks); // Debugging: check the combined design

    var currentTrial = 0;
    // var totalTrials = full_design.length

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

    // create a runner
    var runner = Runner.create({
        delta: 1000 / 60
    })

    // create a render
    var render;

    // add bodies
    var ballCategory = 0x0001;
        defaultCategory = 0x0002

    function cleanupTrial() {
        const progressBar = document.getElementById('progress-bar-wrapper');
        const hints = document.getElementById('hints-container');
        const prompt = document.getElementById('prompt-container');
        const mainContainer = document.getElementById('main-container_task');
        // Remove the waiting message
        const msg = document.getElementById('waiting-message');
        
        if (mainContainer) mainContainer.remove();
        if (progressBar) progressBar.remove();
        if (hints) hints.remove();
        if (prompt) prompt.remove();
        if (msg) msg.remove();

        // Cleanup Matter.js engine, render, and runner
        if (render) {
            Matter.Render.stop(render);
            if (render.canvas) {
                render.canvas.remove();
                render.canvas = null;
                render.context = null;
                render = null; // Reset the render reference
            }
        }
        if (runner) {
            Matter.Runner.stop(runner);
        }
        if (engine) {
            Matter.World.clear(engine.world);
            engine.events = {};
        }
        
        // if (runner) {
        //     Matter.Render.stop(render);
        //     Matter.Runner.stop(runner);
        //     Matter.World.clear(engine.world);
        //     render.canvas.remove();
        //     render.canvas = null;
        //     render.context = null;
        // }
    }

    // Helper function to create a single hint
    function createHint(text, imagePath, imageAlt, textColor) {
        // Create a container for the hint
        const hintContainer = document.createElement("div");
        hintContainer.className = "hint"; // Matches the CSS class
    
        // Add the hint text
        const hintText = document.createElement("div");
        hintText.className = "hint-text";
        hintText.textContent = text;
        hintText.style.color = textColor;
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
        const noHint = createHint("No", "keyboard_key_f.png", "Keyboard Key F", "orange");
        hintsContainer.appendChild(noHint);

        // Add the "Yes (J)" hint on the right
        const yesHint = createHint("Yes", "keyboard_key_j.png", "Keyboard Key J", "#12AD2B");
        hintsContainer.appendChild(yesHint);
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

    function addWaitingMessage() {
        // Create a new waiting message
        const waitingMessage = document.createElement('div');
        waitingMessage.id = 'waiting-message';
        waitingMessage.innerHTML = '<p>Response recorded. Waiting for trial to end.</p>';

        // Add the waiting message to the document body
        document.body.appendChild(waitingMessage);
    }
        
  
    function randomChoice(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    function drawCircle(ctx, ball_x, ball_y) {
        var r = ballRadius;
    
        ctx.beginPath();
        ctx.arc(ball_x, ball_y, r, 0, 2 * Math.PI, false);
    
        // Dotted white outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 3]); // 5 pixels on, 3 pixels off
        ctx.stroke();
        
        // Reset the dash pattern to solid for other drawings
        ctx.setLineDash([]);
    }
    

    // capture info from Prolific
    var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
    var study_id = jsPsych.data.getURLVariable('STUDY_ID');
    var session_id = jsPsych.data.getURLVariable('SESSION_ID');

    jsPsych.data.addProperties({
        subject_id: subject_id,
        study_id: study_id,
        session_id: session_id
    });
        
    var color_occluder = '#bfc5cf'

    function yesNoTrial_notTimed(promptMessage, obstacle_X, obstacle_Y, ball_X, ball_Y, obstacleRadius) {

        // Create main container
        var mainContainer_task = document.createElement('div');
        mainContainer_task.id = 'main-container_task';
        document.body.appendChild(mainContainer_task);

        // Create canvas container and add it to main container
        var canvasContainer_task = document.createElement('div');
        canvasContainer_task.id = 'canvas-container_task';
        mainContainer_task.appendChild(canvasContainer_task);

        // Add prompt element
        var promptContainer = document.createElement('div');
        promptContainer.id = 'prompt-container';
        document.body.appendChild(promptContainer);

        // Add the prompt message
        var promptText = document.createElement('div');
        promptText.className = 'prompt-text';
        promptText.innerHTML = promptMessage;
        promptContainer.appendChild(promptText);

        addHintTexts()

        // Reset the world and adjust gravity
        Composite.clear(engine.world, false);
        engine.world.gravity.y = 0;

        // create a renderer
        render = Render.create({
            element: canvasContainer_task,
            engine: engine,
            options: {
                wireframes: noColor,
                width: canvasWidth,
                height: canvasHeight,
            }
        });

        // add draggable triangle
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

        Matter.Events.on(render, 'afterRender', function() {
            drawCircle(render.context, ball_X, ball_Y);
        });

        Matter.Body.setAngle(triangle, Math.PI / 2);

        // add bodies to the world
        World.add(engine.world, [triangle]);

        // run the renderer
        Render.run(render);
        Runner.run(runner, engine);
    }


    function setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius) {

        Composite.clear(engine.world, false);
        engine.world.gravity.y = 1;

        // Create main container
        var mainContainer_task = document.createElement('div');
        mainContainer_task.id = 'main-container_task';
        document.body.appendChild(mainContainer_task);

        // Create canvas container and add it to main container
        var canvasContainer_task = document.createElement('div');
        canvasContainer_task.id = 'canvas-container_task';
        mainContainer_task.appendChild(canvasContainer_task);

        render = Render.create({
            element: canvasContainer_task,
            engine: engine,
            options: {
                wireframes: noColor,
                width: canvasWidth,
                height: canvasHeight
            }
        });
        

        // var color_fallingObject = randomChoice(['#ffc200', '#ff9900', '#ff6800', '#ff0000']);
        var color_fallingObject = randomChoice(['#ffca14', '#ffab1f', '#ff892c', '#ff603b'])
        // var color_obstacle = randomChoice(['#acaad7', '#988edf', '#5c77fb', '#7f44f9'])
        var color_obstacle = '#988edf'
            

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

        Render.run(render);
        Runner.run(runner, engine);
        // const fps = 1000 / runner.frameDelta;
        // console.log(`Current FPS: ${fps.toFixed(2)}`);
        // Monitor the ball's position
        let trialEnded = false;
        Matter.Events.on(engine, 'afterUpdate', function () {
            if (!trialEnded && ball.position.y > canvasHeight + ballRadius) {
                trialEnded = true; // Prevent multiple triggers
                jsPsych.pluginAPI.setTimeout(() => {
                    // Cleanup and trigger the next trial
                    cleanupTrial();
                    jsPsych.finishTrial();
                }, 400); // End trial 400 ms after the ball exits the screen
            }
        });
        }

    function yesNoTrial(promptMessage, obstacle_X, obstacle_Y, ball_X, ball_Y, obstacleRadius, trialDuration) {
        // Create main container
        var mainContainer_task = document.createElement('div');
        mainContainer_task.id = 'main-container_task';
        document.body.appendChild(mainContainer_task);

        // Create canvas container and add it to main container
        var canvasContainer_task = document.createElement('div');
        canvasContainer_task.id = 'canvas-container_task';
        mainContainer_task.appendChild(canvasContainer_task);

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
        render = Render.create({
            element: canvasContainer_task,
            engine: engine,
            options: {
                wireframes: noColor,
                width: canvasWidth,
                height: canvasHeight,
            }
        });

        var startTime = performance.now();
        // console.log(`Trial Start Time: ${startTime}`);

        // add draggable triangle
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

        Matter.Events.on(render, 'afterRender', function() {
            drawCircle(render.context, ball_X, ball_Y);
        });

        Matter.Body.setAngle(triangle, Math.PI / 2);


        // add bodies to the world
        World.add(engine.world, [triangle]);

        // run the renderer
        Render.run(render);
        Runner.run(runner, engine);

        // Define the response handler function inside the trial
        const handleKeyResponse = (event) => {
            if (['f', 'j'].includes(event.key)) {
                const responseTime = performance.now() - startTime;
                const remainingTime = trialDuration - responseTime;

                // Only show the waiting message if there's more than 50ms left
                if (remainingTime > 50) {
                    // Dim the canvas
                    canvasContainer_task.style.opacity = '0.5';

                    // Add waiting message
                    addWaitingMessage();
                } 

                // Remove the event listener to prevent multiple triggers
                document.removeEventListener('keydown', handleKeyResponse);
            }
        };

        // Add the event listener
        document.addEventListener('keydown', handleKeyResponse);

        // Ensure cleanup occurs at the end of the trial duration
        setTimeout(() => {
            document.removeEventListener('keydown', handleKeyResponse); // Double-check removal
        }, trialDuration);
    }

    var timeline = []
    var repeat_prac = false
    timeline.push(preload)

    var beforeYouBegin = {
        type: jsPsychInstructions,
        pages: [
            '<p style="text-align: left;"><b><span style="font-size:25px;">Before you begin:</span></b></p>' +
            '<p style="text-align: left;"><i>To ensure smooth performance, please follow these guidelines:</i></p>'+
            '<p style="text-align: left;"><b>Device Preparation:</b></p>'+
            '<ul>'+
              '<li style="text-align: left;"><b>Keep Plugged In:</b> Please make sure to keep your device plugged into a power source during the whole experiment.</li>'+
              '<li style="text-align: left;"><b>Close Unneeded Tabs/Applications:</b> Close all unnecessary tabs and applications.</li>'+
              '<li style="text-align: left;"><b>Switch Off Power-Saving Mode:</b> If your device is currently set to power-saving mode, please switch it to performance mode.</li>'+
              '<li style="text-align: left;"><b>Disable VPNs:</b> If you are using a VPN, please turn it off to avoid potential issues with connection stability.</li>'+
            '</ul>'+
            '<p style="text-align: left;"><b>Browser Recommendations:</b></p>'+
            '<ul>'+
              '<li style="text-align: left;"><b>Google Chrome</b> is is our recommended browser for this experiment.</li>'+
              '<li style="text-align: left;"><b>Safari</b>/<b>Edge</b> is also an acceptable browser for participation.</li>'+
            '</ul>'
            
        ],
        show_clickable_nav: true,
        allow_backward: false
    }
    // timeline.push(beforeYouBegin)

    var checkBrowserDevice = {
        type: jsPsychBrowserCheck,
        inclusion_function: (data) => {
          return ['chrome', 'safari', 'edge', 'edge-chromium'].includes(data.browser) && data.mobile === false
        },
        exclusion_message: (data) => {
          if(data.mobile){
            return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
          } else if(data.browser !== 'chrome' || data.browser !== 'safari'|| data.browser !== 'edge'|| data.browser !== 'edge-chromium'){
            // console.log(data.browser)
            return '<p>You must use Safari, Edge, or Chrome as your browser to complete this experiment.</p>'
          }
        }
      };
    // timeline.push(checkBrowserDevice)
      
    var consent = {
        type: jsPsychExternalHtml,
        url: 'consent.html',
        cont_btn: "consent_checkbox_accept",
        check_fn: function() { // no need to check anything as jsPsych will only continue when the 'consent' button is clicked
            return true; 
        }
    };
    // timeline.push(consent)

    var enter_fullscreen = {
        type: jsPsychFullscreen,
        fullscreen_mode: true,
        message: '<p><b>Thank you for joining our study!</b></p>'+
        '<p>For the best experience, the experiment should be played in <b>full screen</b> mode.</p>'+
        '<p>Click the button below to start full screen.</p>'+
        '<p>Once in full screen mode, we kindly ask you <b> not to exit, switch tabs, minimize, or adjust your browser </b> until the experiment ends.</p>'+ 
        '<p>Thank you in advance for your cooperation.</p>',
        button_label:'Enter Full Screen Mode',
        delay_after: 300
    }

    var checkWindowSize = {
        type: jsPsychBrowserCheck,
        allow_window_resize: true,
        minimum_width: 1000,
        minimum_height: 700
      };
    // timeline.push(enter_fullscreen, checkWindowSize)

    var checkKeyboardSpace = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p><b>This experiment requires keyboard input.</b></p> 
        <p><b>To ensure your response will be recorded successfully, please press 'Space' to continue.</b></p>
        <p>If you can't proceed, you won't be able to complete this study.</p>
        <p></p> <!-- Blank line -->
        <p id="blinking-text" style="font-weight; animation: blink 2s infinite;">Press Space to continue</p>
        <style>
            @keyframes blink {
                50% {
                    opacity: 0;
                }
            }
        </style>`,
        choices: ' '
    }
    var checkKeyboardF = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p><b>This experiment requires keyboard input.</b></p> 
        <p><b>To ensure your response will be recorded successfully, please press the 'f' key to continue.</b></p>
        <p>If you can't proceed, you won't be able to complete this study.</p>
        <p></p> <!-- Blank line -->
        <p id="blinking-text" style="font-weight; animation: blink 2s infinite;">Press f to continue</p>
        <style>
            @keyframes blink {
                50% {
                    opacity: 0;
                }
            }
        </style>`,
        choices: 'f'
    }

    var checkKeyboardJ = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p><b>This experiment requires keyboard input.</b></p> 
        <p><b>To ensure your response will be recorded successfully, please press the 'j' key to continue.</b></p>
        <p>If you can't proceed, you won't be able to complete this study.</p>
        <p></p> <!-- Blank line -->
        <p id="blinking-text" style="font-weight; animation: blink 2s infinite;">Press j to continue</p>
        <style>
            @keyframes blink {
                50% {
                    opacity: 0;
                }
            }
        </style>`,
        choices: 'j'
    }

    var askProlificID = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "Before continuing, please copy and paste your Prolific ID:", rows: 1, columns: 40, name: 'prolificID', required: true}
        ],
        button_label: "Continue"
    };

    // timeline.push(checkKeyboardSpace, checkKeyboardF, checkKeyboardJ, checkWindowSize)
    // timeline.push(askProlificID)


    var instructions = { 
        type: jsPsychInstructions,
        pages: [ // should be an array here
            '<p><b><span style = "font-size:25px;">INSTRUCTIONS: Please Read Carefully!</span></b></p>'+
            '<p>In this experiment, there are 144 short videos. Each video is 1.5 seconds long. The study is expected to take 25 minutes.</p>'+
            '<p>Each video shows a <b>ball falling</b>. Part of the fall happens behind a <b>gray screen</b>.</p>'+
            '<p>When the ball is behind the screen, <b>it will hit a triangle</b>.</p>'+
            '<p>You will not see the triangle, because it is behind the <b>gray screen</b>.</p>'+
            '<p><b><u>YOUR TASK:</u></b> After seeing the video, you will be shown a proposed position for the hidden triangle.</p>'+
            '<p>You will decide <b>if the triangle is in the correct position.</b> You will have <b>limited time</b></p> to make your decision.'+
            '<p>On the next page, we will explain how to do this.</p>'+
            '<br>'+
            '<img src = "instruction_illustration.png" style="width: 70%;"></img>',
            '<p><b><span style = "font-size:25px;">INSTRUCTIONS (Continued): Please Read Carefully!</span></b></p>'+
            '<p>After each video plays, the gray screen will disappear, and a triangle will appear on the screen.</p>'+
            "<p>Your task is to decide <b>whether <u>the triangle is in the correct position</u> based on <u>what you saw during the ball's fall.</u></b></p>"+
            '<p>You need to decide <b><u>before time runs out.</u></b></p>'+
            '<p>To make your decision:</p>'+
                '<p style="margin-bottom: 5px; text-indent: -20px; padding-left: 20px;">- Press <b style="color: #12AD2B;">J for Yes</b>, if you think the triangle is in the correct position</p>' +
                '<p style="margin-top: 0; text-indent: -20px; padding-left: 20px;">- Press <b style="color: orange;">F for No</b>, if you think the triangle is not in the correct position</p>' +
            "<p>We will show the ball's starting position to help guide your guess.</p>"+
            "<p>Click 'Next' to see some examples of the videos.</p>"+
            '<br>'+
            '<img src = "instruction_illustration.png" style="width: 70%;"></img>',
            '<p>Here is an example video of a ball falling.</p>'+
            "<p>Once you are done watching the video, please click 'Next'.</p>"+
            '<video width="65%" controls muted><source src="fallingScene_with_Occluder.mp4" type="video/mp4"></video>',
            '<p>Here is what happened behind the gray screen.</p>'+
            '<p>Notice how the ball hit a triangle, which changed its course?</p>'+
            '<p>The ball always hits a triangle, but it happens behind the gray screen.</p>'+
            '<video width="65%" controls muted><source src="fallingScene_without_Occluder.mp4" type="video/mp4"></video>'

        ],
        show_clickable_nav: true,
        post_trial_gap: 500
    }
    // timeline.push(instructions)

    var praticeTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<br>Remember! After a ball falls, the screen will disappear, and you'll decide if the proposed position is where the hidden triangle was. "+ 
        "<br>You will now practice this by watching a few videos and making decisions." +  
        "<p>To respond:"+
        '<br style="margin-bottom: 5px; text-indent: -20px; padding-left: 20px;">- Press <b style="color: #12AD2B;">J for Yes</b>, if you think the triangle is in the correct position.' +
        '<br style="margin-top: 0; text-indent: -20px; padding-left: 20px;">- Press <b style="color: orange;">F for No</b>, if you think the triangle is not in the correct position.</p>'+
        "<p>In this practice round, there is no time limit. Focus on getting comfortable with the task first."+
        "<br>Press either J or F to begin your practice trials.</p>"+
        '<img src = "YesOrNo_instruction.png" style="width: 65%;"></img>',
        choices: ['j', 'f'],
        on_start: function() {
            addHintTexts()
        },
        on_finish: function() {
            cleanupTrial();
        }
    };
    // timeline.push(praticeTrial)

    var fallingObjectTrial_prac = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: 'NO_KEYS',
        trial_duration: firstTrialDuration,
        data: {
            // runnerFPS: 0, // update in matter.js 0.20.0, no longer working
            task: 'ballFalling_prac',
        },
        on_start: function(trial) {
            const scene = jsPsych.timelineVariable('scene'); // Access 'scene' info
            let ball_X = scene.x_ball;
            let obstacle_X = scene.y_1;
            let obstacle_Y = scene.y_2;
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius);
            // trial.data.runnerFPS = runner.fps
    },
        on_finish: function(trial){
            const scene = jsPsych.timelineVariable('scene');
            jsPsych.data.addDataToLastTrial({
                ball_X: scene.x_ball,
                obstacle_groundTruth_x: scene.y_1, // recording the original coordinates (not the flipped one)
                obstacle_groundTruth_y: scene.y_2,
                stimulus_idx: scene.prac_stimulus_idx,
                trial_name: 'fallScene',
                // runnerFPS: trial.runnerFPS,
                flipped: scene.flipped
            });
          }
    }

    var yesNoResponseTrial_prac_noTimed = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: ['f', 'j'],
        trial_duration: null,
        on_start: function() {
            cleanupTrial()
            const choice = jsPsych.timelineVariable('choice'); // Access 'choice' info
            const scene = jsPsych.timelineVariable('scene');
            const obstacle_X = choice.x
            const obstacle_Y = choice.y
            const ball_X = scene.x_ball // flip has already been taken care of in the info
            // console.log(runner.fps)
            yesNoTrial_notTimed(promptMessage, obstacle_X, obstacle_Y, ball_X, ball_Y, obstacleRadius)
        },
        data: {
            task: 'yesOrNo_prac_noTimed',
        },
        on_finish: function(data) {
            jsPsych.data.addDataToLastTrial({
                stimulus_idx: jsPsych.timelineVariable('choice').prac_stimulus_idx,
                choice: jsPsych.timelineVariable('choice').choice,
                response: data.response,
                timeLimit: jsPsych.timelineVariable('timeConstraint')
            })
            cleanupTrial()
        }
    };

    var yesNoResponseTrial_prac = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: ['f', 'j'],
        trial_duration: jsPsych.timelineVariable('timeConstraint'),
        response_ends_trial: false,
        on_start: function() {
            cleanupTrial()
            const choice = jsPsych.timelineVariable('choice'); // Access 'choice' info
            const scene = jsPsych.timelineVariable('scene');
            const timeConstraint = jsPsych.timelineVariable('timeConstraint');
            const obstacle_X = choice.x
            const obstacle_Y = choice.y
            const ball_X = scene.x_ball // flip has already been taken care of in the info
            // console.log(scene)
            yesNoTrial(promptMessage, obstacle_X, obstacle_Y, ball_X, ball_Y, obstacleRadius, timeConstraint)
        },
        data: {
            task: 'yesOrNo_prac',
        },
        on_finish: function(data) {
            jsPsych.data.addDataToLastTrial({
                stimulus_idx: jsPsych.timelineVariable('choice').prac_stimulus_idx,
                choice: jsPsych.timelineVariable('choice').choice,
                response: data.response,
                timeLimit: jsPsych.timelineVariable('timeConstraint')
            })
            cleanupTrial()
        }
    };

//////// ---- above are modified 12/2/24
    var practiceTrial_notTimed_block = {
        timeline : [fallingObjectTrial_prac, yesNoResponseTrial_prac_noTimed],
        timeline_variables : practiceTrials.noTime,
        randomize_order: true
        }

    var instructions_timeLimit = { 
        type: jsPsychInstructions,
        pages: [ // should be an array here
            '<p><b><span style = "font-size:25px;">INSTRUCTIONS (Continued): Please Read Carefully!</span></b></p>'+
            '<p>In this experiment, each trial will have a <b>time limit</b> for your response.</p>'+
            '<p>You will complete <b>6 blocks of trials</b>, with each block having <b>the same time limit</b> for all trials in that block.</p>'+
            '<p>There is a break between each block of trials.</p>'+
            '<p><b>Before each block begins</b>, you will be notified of <b>the time limit for that block</b>.</p>'+
            '<p>The time limits will be one of the following:</p>'+
            '<p style="margin-bottom: 0px; text-indent: -20px; padding-left: 20px;"><b>-   1 second</b></p>'+
            '<p style="margin-top: 0px; text-indent: -20px; padding-left: 20px;"><b>-   3 seconds</b></p>'+
            '<p><b>A countdown timer</b> <img src = "countdown_Timer.png" style="width: 15%; vertical-align: middle;"></img> will be visible at the top of the screen ' +
            'during each trial to help you track how much time is left. <br>As the timer bar decreases, you will see your remaining time.</p>'+
            '<p>You must press <b>J for Yes</b> or <b>F for No </b>before the timer runs out.</p>'+
            '<p>If <b>you do not respond in time</b>, the trial will automatically move to the next one, and <b>your response will not be recorded.</b></p>'+
            "<p>Click 'Next' to continue.</p>",
            '<div style="max-width: 900px; margin: auto;">' + 
            '<p><b><span style="font-size:25px;">INSTRUCTIONS (Continued): Important Points to Keep in Mind</span></b></p>' +
            '<br>' +
            '<p style="text-align: left;"><b>-  Answer within time limits (1s/3s), even if you’re unsure.</b></p>' +
            '<p style="text-align: left;">We know this might feel like a hard task, especially when you will need to make decisions <i>very</i> quickly in blocks with shorter time limits. <br>It might not feel like enough time. We are intentionally trying to look at decisions that happen when you have very little time to make them, just try and do your best!</p>' +
            '<p style="text-align: left;"><b>-  Please be as accurate as possible.</b></p>' +
            '<p style="text-align: left;">Even small differences in the triangle’s position are important. Try your best to base your decision on whether the proposed position seems <i>exactly</i> correct. <br>In some trials, the proposed triangle position may be slightly off from where it should be, and that should count as a “No.”</p>'
        ],
        show_clickable_nav: true,
        post_trial_gap: 500
    }


    var repeatInstructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus:   "<p>To make sure you understood the task, we just have a <b>brief quiz</b> here.</p>"+
                    "<p>If you need to review the instructions, click 'Previous'.</p>"+
                    "<p>It's important to understand the task to do the study, so you have to pass the quiz to move to the study.</p>",
        choices: ['Previous', 'Next'],
    };
    
    // Loop that conditionally repeats the instructions and practice trials
    var instructions_review_loop = {
        timeline: [instructions, praticeTrial, practiceTrial_notTimed_block, instructions_timeLimit, repeatInstructions],
        loop_function: function(data){
            // console.log(jsPsych.data.getLastTrialData().values()[0].response)
            // If the participant clicked "Previous" on the repeatInstructions trial, repeat the loop
            if(jsPsych.data.getLastTrialData().values()[0].response == 0){
                return true;
            } else {
                return false;
            }
            }
    }
    // timeline.push(instructions_review_loop)

    var compreCheck_All = {
        type: jsPsychSurveyMultiChoice,
        timeline: [
            {questions: [
                {
                    prompt: 'What will you be doing in this study?',
                    name: 'generalProcedure',
                    options: ['Watch a video of a ball falling, some of it behind a gray screen. After each video, decide if the triangle is below the ball.', 
                    'Watch a video of a ball falling, some of it behind a gray screen. After each video, decide if the triangle is at the spot where the ball hit the triangle behind the screen. There is NO time limit for the response.',
                    'Watch a video of a ball falling, some of it behind a gray screen. After each video, decide if the triangle is at the spot where the ball hit the triangle behind the screen. There is time limit for the response.',
                    'I am not sure.'],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "Does the ball always hit a triangle when it's falling (behind the gray screen)?",
                    name: 'checkBallHitObstacle',
                    options: ['Yes.', 
                    'No.',
                    'I am not sure.'],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "While watching the video, can you see the ball hit the triangle?",
                    name: 'checkTriangleVisibility',
                    options: ['Yes, you can see everything in the video.', 
                    'No, the triangle is hidden behind the gray screen.',
                    'I am not sure.'],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "What happens if you do not respond before the time runs out?",
                    name: 'checkTimedResponse',
                    options: ['The trial will wait for your response.', 
                    'Your response will not be recorded, and the trial will move to the next one.',
                    'I am not sure.'],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "When will you be notified about the time limit for each trial?",
                    name: 'checkTimeBlockNotice',
                    options: ['At the beginning of each block.', 
                    'Before every individual trial.',
                    'At the end of each block.',
                    "You won't be notified about the time limit."],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "Will the time limit be the same for all trials <b>within a block</b>?",
                    name: 'checkTimeBlockSameness',
                    options: ['Yes, the time limit is the same for all trials within a block.', 
                    'No, the time limit changes for each trial within a block.',
                    'The time limit changes halfway through the block.',
                    "I am not sure."],
                    required:true
                }
            ]},
            {questions: [
                {
                    prompt: "<img src='MC_7.png' width='800'/><br>If the line shows the actual path of the ball, and the white triangle is at the true position where the ball hit it, <b>is the proposed purple triangle in the correct position?</b>",
                    name: 'checkTrianglePrecision',
                    options: ["Yes. The proposed purple triangle is very close to the correct position, so I should choose 'Yes.'", 
                            "No. The proposed purple triangle is not in the correct position because it doesn't match the location of the white triangle exactly."],
                    required:true
                }
            ]}
        ]
    }

    var failPage = {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>Oops! You did not pass the quiz.</p>" + 
        "<p>You will now repeat the instructions and practice.</p>",
        on_finish: function(data) {
            jsPsych.data.addDataToLastTrial({comprehensionCheck: 'failed'});
        },
        choices: ['Next']
    }

    var repeat_prac_conditional = {
        timeline: [failPage],
        conditional_function: function() { // <----- should I do this or not (return true if we do want this to happen; return false if not)
            var last_prac_trials = jsPsych.data.get().last(7).values()
            // console.log(last_prac_trials)
            var ans1 = last_prac_trials[0].response.generalProcedure,
                ans2 = last_prac_trials[1].response.checkBallHitObstacle,
                ans3 = last_prac_trials[2].response.checkTriangleVisibility,
                ans4 = last_prac_trials[3].response.checkTimedResponse,
                ans5 = last_prac_trials[4].response.checkTimeBlockNotice,
                ans6 = last_prac_trials[5].response.checkTimeBlockSameness,
                ans7 = last_prac_trials[6].response.checkTrianglePrecision
            // console.log(last_prac_trials, ans1, ans2, ans3, ans4, ans5, ans6, ans7)
            if (ans1 == 'Watch a video of a ball falling, some of it behind a gray screen. After each video, decide if the triangle is at the spot where the ball hit the triangle behind the screen. There is time limit for the response.'
             && ans2 == 'Yes.' && ans3 == 'No, the triangle is hidden behind the gray screen.' && ans4 == 'Your response will not be recorded, and the trial will move to the next one.'
             && ans5 == 'At the beginning of each block.' && ans6 == 'Yes, the time limit is the same for all trials within a block.'
             && ans7 == "No. The proposed purple triangle is not in the correct position because it doesn't match the location of the white triangle exactly.") {
                repeat_prac = false
                return false} else {
                repeat_prac = true
                return true}
        }
    }

    var instructions_check_loop = {
        timeline: [instructions_review_loop, compreCheck_All, repeat_prac_conditional], // <---- timeline will get execute once before looping, so need to remove the original procedure from the timeline
        loop_function: function() {return repeat_prac}
    }
    // timeline.push(instructions_check_loop)
    
    var view_collisions = {
        type : jsPsychInstructions,
        pages: [
            "<p><b>Nice, you've passed the quiz!</b></p>"+
            "<p>To help you get more comfortable with the task and prepare you for the practice trials, let's see some examples of collisions first!</p>"+
            "<p>These examples will help you get a better sense of what’s happening behind the gray screen.</p>"+
            "<p>Click ‘Next’ to see the examples.</p>",
            '<video width=1000px controls muted><source src="fallingScene_without_Occluder_ex1.mp4" type="video/mp4"></video>',
            '<video width=1000px controls muted><source src="fallingScene_without_Occluder_ex4.mp4" type="video/mp4"></video>',
            '<video width=1000px controls muted><source src="fallingScene_without_Occluder_ex3.mp4" type="video/mp4"></video>',
        ],
        show_clickable_nav: true,
        allow_backward: true
    }
    // timeline.push(view_collisions)


    var start_practice_timed = {
        type : jsPsychInstructions,
        pages: [
            "<p>Great! Now, let's begin with some practice trials!"+
            "<p>As described previously, you will see a video of a ball falling, some of it behind a gray screen.</p>"+
            "<p>After the video, you will press either <b>j (for Yes)</b> or <b>f (for No)</b> to decide whether the triangle is at the spot you think the ball hit the triangle behind the screen.</p>"+
            "<p>You can use the ball's starting position as a hint for your guess.</p>"+
            "<p>Be sure to respond within the time limits.</p>"+
            "<p>Click 'Next' to start your practice trial.</p>"
        ],
        show_clickable_nav: true,
        allow_backward: false
    }

    var start_practice_test_timed = {
        type : jsPsychInstructions,
        pages: [
            "<p>Ok! You have now practiced responding within the time limits.</p>"+
            "<p>We’re almost ready to get started!</p>"+
            "<p>Before continuing, we will test if you are ready to proceed.</p>"+
            "<p>For the next few trials, respond <b>as accurately as possible</b> and <b>be aware of the time limit</b>.</p>"+
            "<p>You have to pass the practice test to move to the study.</p>"+
            "<p>Press 'Next' to begin the practice test.</p>"
        ],
        show_clickable_nav: true,
        allow_backward: false
    }

    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: 'NO_KEYS',
        trial_duration: firstTrialDuration,
        data: {
            flipped: false,
            // runnerFPS: 0,
            task: 'ballFalling',
        },
        on_start: function(trial) {
            const scene = jsPsych.timelineVariable('scene'); // Access 'scene' info
            let ball_X = scene.x_ball;
            let obstacle_X = scene.y_1;
            let obstacle_Y = scene.y_2;
            trial.data.flipped = Math.random() >= 0.5
            if (trial.data.flipped) {
                // console.log('Flipped!')
                ball_X = canvasWidth - ball_X
                obstacle_X = canvasWidth - obstacle_X
            }
            // console.log(ball_X, obstacle_X)
            currentTrial++;
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius);
            // trial.data.runnerFPS = runner.fps
            // console.log('on_start',runner.fps)
    },
        on_finish: function(trial){
            const scene = jsPsych.timelineVariable('scene');
            jsPsych.data.addDataToLastTrial({
                ball_X: scene.x_ball,
                obstacle_groundTruth_x: scene.y_1, // recording the original coordinates (not the flipped one)
                obstacle_groundTruth_y: scene.y_2,
                stimulus_idx: scene.stimulus_idx,
                flipped: trial.flipped,
                trial_name: 'fallScene',
                currentTrial
                // runnerFPS: trial.runnerFPS
            });
          }
    }

    var yesNoResponseTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: ['f', 'j'],
        trial_duration: jsPsych.timelineVariable('timeConstraint'),
        response_ends_trial: false,
        on_start: function() {
            cleanupTrial()
            const choice = jsPsych.timelineVariable('choice'); // Access 'choice' info
            const scene = jsPsych.timelineVariable('scene');
            const timeConstraint = jsPsych.timelineVariable('timeConstraint')
            var lastTrialData = jsPsych.data.getLastTrialData();
            var fallSceneFlipped = lastTrialData.trials[0].flipped
            var obstacle_X = choice.x
            var obstacle_Y = choice.y
            var ball_X = scene.x_ball
            if (fallSceneFlipped){
                obstacle_X = canvasWidth - obstacle_X
                ball_X = canvasWidth - ball_X
            }
            yesNoTrial(promptMessage, obstacle_X, obstacle_Y, ball_X, ball_Y, obstacleRadius, timeConstraint)
        },
        data: {
            task: 'yesOrNo',
        },
        on_finish: function(data) {
            cleanupTrial()
            jsPsych.data.addDataToLastTrial({
                stimulus_idx: jsPsych.timelineVariable('choice').stimulus_idx,
                choice: jsPsych.timelineVariable('choice').choice,
                obstacle_choice_x: jsPsych.timelineVariable('choice').x, // recording the original coordinates before flipping (not the flipped one)
                obstacle_choice_y: jsPsych.timelineVariable('choice').y,
                response: data.response,
                timeLimit: jsPsych.timelineVariable('timeConstraint'),
                currentTrial
            })
        }
    };

    function createInstructionBlock(blockName, timeConstraint) {
        return {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<p><span style="font-size:40px;">${blockName}</span></p>` +
                `<p><span style="font-size:25px;">You have <strong>${timeConstraint / 1000} second(s)</strong> to respond to the following trials.</span><br></p>` +
                `<p id="blinking-text" style="font-weight; animation: blink 2s infinite;">Press Space to continue</p>` +
                `<style>
                    @keyframes blink {
                        50% {
                            opacity: 0;
                        }
                    }
                </style>`,
            choices: ' ',
        };
    }

    var pracBlock_3000 = createInstructionBlock('Practice BLOCK 1', 3000)
    var pracBlock_1000 = createInstructionBlock('Practice BLOCK 2', 1000)

    var practiceTrial_timed3000_block = {
        timeline: [fallingObjectTrial_prac, yesNoResponseTrial_prac], // Adjust the trials here as needed
        timeline_variables: practiceTrials.timed3000,
        randomize_order: true,
    };

    var practiceTrial_timed1000_block = {
        timeline: [fallingObjectTrial_prac, yesNoResponseTrial_prac], // Adjust the trials here as needed
        timeline_variables: practiceTrials.timed1000,
        randomize_order: true,
    };

    var pracBlock_1000_test = createInstructionBlock('Practice Test BLOCK 1', 1000)
    var pracBlock_3000_test = createInstructionBlock('Practice Test BLOCK 2', 3000)

    var practiceTestTrial_timed3000_block = {
        timeline: [fallingObjectTrial_prac, yesNoResponseTrial_prac], // Adjust the trials here as needed
        timeline_variables: practiceTrials.timed3000Test,
        randomize_order: true,
    };

    var practiceTestTrial_timed1000_block = {
        timeline: [fallingObjectTrial_prac, yesNoResponseTrial_prac], // Adjust the trials here as needed
        timeline_variables: practiceTrials.timed1000Test,
        randomize_order: true,
    };

    var failPracticeTestPage = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            var lastPracticeTestData = jsPsych.data.get().filter({task: 'yesOrNo_prac'}).last(6).values();
            var validResponses = lastPracticeTestData.filter(trial => trial.response !== null).length;
    
            return `<p>Oops! You did not pass the practice test. You missed ${6 - validResponses} out of 6 trials.</p>` +
                   `<p>You will now repeat the practice and the test.</p>`;
        },
        on_finish: function(data) {
            jsPsych.data.addDataToLastTrial({practiceTest: 'failed'});
        },
        choices: ['Next']
    };

    var repeatPracticeIfFailed = {
        timeline: [failPracticeTestPage],
        conditional_function: function() {
            var lastPracticeTestData = jsPsych.data.get().filter({task: 'yesOrNo_prac'}).last(6).values();
            var validResponses = lastPracticeTestData.filter(trial => trial.response !== null).length;
    
            // Log pass/fail explicitly
            var passed = validResponses >= 5;
            jsPsych.data.addProperties({practiceTestResult: passed ? 'passed' : 'failed'});
    
            return !passed; // Return true if they failed
        }
    };

    var practiceAndTestLoop = {
        timeline: [
            start_practice_timed, // Instructions for practice
            pracBlock_3000, practiceTrial_timed3000_block, // Practice Block 1
            pracBlock_1000, practiceTrial_timed1000_block, // Practice Block 2
            start_practice_test_timed, // Instructions for practice test
            pracBlock_1000_test, practiceTestTrial_timed1000_block, // Practice Test Block 1
            pracBlock_3000_test, practiceTestTrial_timed3000_block, // Practice Test Block 2
            repeatPracticeIfFailed // Check pass/fail condition
        ],
        loop_function: function() {
            // Check if the participant passed or failed
            var lastTrialData = jsPsych.data.get().last(1).values()[0];
            if (lastTrialData.practiceTest === 'failed') {
                return true; // Repeat the loop if they failed
            } else {
                return false; // Exit the loop if they passed
            }
        }
    };

    // timeline.push(practiceAndTestLoop);

    var start_task = {
        type : jsPsychInstructions,
        pages: [
            "<p><b>Great job, you've passed the test!</b></p>"+
            "<p>You are now ready to start the study.</p>"+
            "<p><b>Remember!</b> There will be 144 videos (6 blocks) in total. To ensure your data is saved correctly, it's important to complete the entire study, until you see the completion page with a link that redirects you to the Prolific website.</p>"+
            "<p>To make things less repetitive, you can take a break between each block. When you see the 'Block' page, feel free to pause, or to keep going.</p>"+
            "<p>Please click 'Next' to start the study.</p>"
        ],
        show_clickable_nav: true,
        allow_backward: false
    }
    // timeline.push(start_task)

/// TODO: in the practice test trial, should make all collision possible (the choices should all be valid)
//////// ---- above are modified 12/8/24 

    // Add blocks and instructions
    randomizedBlocks.forEach((block, blockIndex) => {
        const timeConstraint = block[0].timeConstraint; // All trials in the block have the same time limit
    
        // Add instruction page
        timeline.push({
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<p><span style="font-size:40px;">BLOCK ${blockIndex + 1}</span></p>` +
                `<p><span style="font-size:25px;">You have <strong>${timeConstraint / 1000} second(s)</strong> to respond to the following trials.</span><br></p>`+
                `<p></p> <!-- Blank line -->
                <p id="blinking-text" style="font-weight; animation: blink 2s infinite;">Press Space to continue</p>
                <style>
                    @keyframes blink {
                        50% {
                            opacity: 0;
                        }
                    }
                </style></p>`,
            choices: ' ',
        });
    
        // Add trials for the block
        timeline.push({
            timeline: [fallingObjectTrial, yesNoResponseTrial],
            // timeline_variables: block,
            timeline_variables: block.slice(0,3), // for demo purpose, only three trials per block
            randomize_order: false, // Already randomized
        });
    });

    var check_understanding = {
        type: jsPsychSurveyText,
        preamble: "Well done, you've completed the study!",
        questions: [{prompt: 'Just to make sure you paid attention, please <u>briefly</u> say in your own words, what was the activity you just performed.', name: 'Summary', required: true}],
        button_label: 'Submit Answer',
        // on_finish: ()=>{jsPsych.data.get().localSave('csv','myTestData.csv')} // for local debugging purpose
    };

    timeline.push(check_understanding)

    var end_comments = {
        type: jsPsychSurveyText,
        preamble: "Feedback [Optional]",
        questions: [{prompt: 'Please share any suggestions, comments, or thoughts you may have about the study below – we welcome any and all feedback.', name: 'Comments'}],
        button_label: 'Submit Answer',
    };

    var save_data = {
        type: jsPsychCallFunction,
        async: true,
        func: function(done){
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'write_data.php');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = function() {
            if(xhr.status == 200){
              var response = JSON.parse(xhr.responseText);
            //   console.log(response.message);
              done(); // invoking done() causes experiment to progress to next trial.;
            } else {
                alert("A problem occurred while writing to the database. Please contact the researcher for more information.")
            }
          };
          xhr.onerror = function() { // network-level error
            alert("A problem occurred while writing to the database. Please contact the researcher for more information.");
            // Not calling done() here will prevent the experiment from progressing.
          };
          xhr.send(JSON.stringify({filename: subject_id + '_result', filedata: jsPsych.data.get().csv()}));
        }
      }      
      
    timeline.push(end_comments)

    timeline.push(save_data);

    // function generateFeedbackString() {
    //     var subset = jsPsych.data.get().filter({trial_name: 'reconstruct'})
    //     // console.log(subset.select('response_time'))
    //     var mean_rt =  subset.select('response_time').mean()
    //     // console.log(subset.count())
    //     var mean_distance_final_initial = subset.select('final_to_initial_distance').mean()
    //     var prop_between = subset.filter({finalInBetweenInitGround: true}).count()/subset.count()*100
    //     return `<p><br>Mean Response Time: ${Math.round(mean_rt)} 
    //             <br>Mean Distance Between Obstacle's Final Position and Initial Position: ${Math.round(mean_distance_final_initial)}
    //             <br>Percent of Placed Obstacle in between Initial and Groundtruth Condition: ${Math.round(prop_between)} %</p>`
    // }
    

    // participant clicks a link to return to Prolific
    // var comp_code = "XxCyhyzl553k";
    var completion = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        // var finalMessage_hidden = generateFeedbackString()
        // console.log(finalMessage_hidden)
        var finalMessage = '<p> Thank you for your participation! Your responses have been successfully recorded. </p>'+
    //   '<p> Your completion code is</p><b>' + comp_code + '</b>' +
    '<p><a href="https://app.prolific.com/submissions/complete?cc=CKL1OX31">Click here to return to Prolific and complete the study</a>.</p>' +
    //   "<p> Please ensure to copy this code and paste it into Prolific, as you won't be able to access this code once you leave this page. </p>"+
    //   "<p> You're free to exit the window at your convenience.</p>" +
      "<p>Once again, we appreciate your time and effort! </p>"
        return finalMessage},
      choices: "NO_KEYS",
    //   trial_duration: 10000
    };

    timeline.push(completion);
    
    jsPsych.run(timeline);

});

