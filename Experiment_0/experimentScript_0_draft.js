document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.displayData()
            jsPsych.data.get().localSave('csv','myTestData.csv');
        }
    })

    // jsPsych.pluginAPI.preloadImages(["intruction_illustration.png"], function(){ startExperiment(); })

    var images = ["intruction_illustration.png"]
    var video = ["fallingScene_with_Occluder.mp4", "fallingScene_without_Occluder.mp4"]
    var preload = {
        type:jsPsychPreload,
        images: images,
        video: video
    }

    // full 72 trials
    // var full_design = jsPsych.randomization.factorial({first: jsPsych.randomization.shuffle(fallingScene_info), second: jsPsych.randomization.shuffle(reconstructionTask_info)}, 1);
    // for debugging
    // var full_design = jsPsych.randomization.factorial({first: jsPsych.randomization.shuffle(fallingScene_info), second: jsPsych.randomization.shuffle(reconstructionTask_info)}, 1).slice(0,5);
    var full_design = jsPsych.randomization.factorial({first: fallingScene_info, second: reconstructionTask_info}, 1).slice(0,5);
    // var full_design = jsPsych.randomization.factorial({first: trial_1_info}, 1);
    console.log(full_design) //.slice(0,3)

    var currentTrial = 0;
    var totalTrials = full_design.length

    // Initialize the progress indicator container
    // var progressContainer = document.createElement('div');
    // progressContainer.id = 'progress-container';
    // progressContainer.innerHTML = "Progress: " + currentTrial + "/" + totalTrials
    // document.body.appendChild(progressContainer);

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

    // add bodies
    var ballCategory = 0x0001;
        defaultCategory = 0x0002
  
    function randomChoice(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
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
        
    // var colorA = '#f55a3c',
    var color_occluder = '#bfc5cf'

    function setupPracticeTrial(obstacle_X_prac, obstacle_Y_prac, obstacleRadius) {
        // Create a new engine
        engine = Engine.create();
        engine.world.gravity.y = 0;

        // Remove existing canvas if there is one
        var existingCanvas = document.querySelector("canvas");
        if (existingCanvas) {
            existingCanvas.remove();
        }
        else {
            var mainContainer_prac = document.createElement('div');
            mainContainer_prac.id = 'main-container_prac';
            
            // var promptContainer_prac = document.createElement('div');
            // promptContainer_prac.id = 'prompt-container_prac';
            
            // var promptText_prac = document.createElement('p');  
            // promptText_prac.innerHTML = promptMessage_prac;
            // promptContainer_prac.appendChild(promptText_prac);
            
            // mainContainer_prac.appendChild(promptContainer_prac);
            
            var canvas_prac = document.createElement('div');
            canvas_prac.id = 'canvas-container_prac';
            mainContainer_prac.appendChild(canvas_prac);
            
            document.body.appendChild(mainContainer_prac);
        }

        Composite.clear(engine.world, false);
        

        // Add prompt element
        // var promptContainer = document.createElement('div');
        // promptContainer.id = 'prompt-container';
        // document.body.appendChild(promptContainer);

        // var promptText = document.createElement('div');
        // promptText.className = 'prompt-text';
        // promptText.innerHTML = promptMessage_prac;
        // promptContainer.appendChild(promptText);

        // var canvas = document.createElement('div');;
        // canvas.id = 'canvas-container'
        // document.body.appendChild(canvas);

        var triangleDragged = false
        

        // create a renderer
        var render = Render.create({
            element: document.getElementById('canvas-container_prac'),
            engine: engine,
            options: {
                wireframes: noColor,
                width: canvasWidth,
                height: canvasHeight,
            }
        });


        // add draggable triangle
        var triangle = Bodies.polygon(obstacle_X_prac, obstacle_Y_prac, 3, obstacleRadius, {
            isStatic: false,
            density: 0.04,
            friction: 0.01,
            frictionAir: 0.00001,
            restitution: 0.3,
            render: {
                fillStyle: '#9933ff',
                strokeStyle: 'black',
                lineWidth: 1
            }
        });

        Matter.Body.setAngle(triangle, Math.PI / 2);

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
            triangleDragged = true;
        });

        // keep the mouse in sync with rendering
        render.mouse = mouse;

        // add bodies to the world
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

        var notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);

        // Event listener for submit button
        submitButton.addEventListener('click', function() {

        if (!triangleDragged) {
            // alert('Please drag the triangle before submitting.');
            // return
            // Find the notification area
            // var notification = document.getElementById('notification');
            // Update the message and display the notification
            notification.innerHTML = 'Please drag the triangle before submitting.';
            notification.style.display = 'block';
            setTimeout(function() {
                notification.style.display = 'none';
            }, 1500);
            return;
        }

        // Store final position of triangle
        var finalPosition = { x: triangle.position.x, y: triangle.position.y };
        
        // Make triangle no longer draggable
        mouseConstraint.constraint.body = null;

        // Remove the submit button & prompt
        submitButton.remove();
        mainContainer_prac.remove()

        // Write final position and response time to trial data
        jsPsych.data.write({
            'triangle_prac_final_x': finalPosition.x,
            'triangle_prac_final_y': finalPosition.y,
        });

        // End the current trial
        jsPsych.finishTrial();
        });
    }

    var mainContainer_task = document.createElement('div');
    mainContainer_task.id = 'main-container_task';
    document.body.appendChild(mainContainer_task);

    function setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius) {
            // Stop runner and engine from previous trials
            if (runner) {
                Runner.stop(runner);
            }
            // Create a new engine
            engine = Engine.create();
            engine.world.gravity.y = 1;

            // // Remove existing main-container if there is one
            // // Clear main container
            // while (mainContainer_task.firstChild) {
            //     mainContainer_task.firstChild.remove();
            // }

            // // Now add necessary elements
            // // For example, in setupFallingObjectTrial you might add a canvasContainer_task:
            // var canvasContainer_task = document.createElement('div');
            // canvasContainer_task.id = 'canvas-container_task';
            // mainContainer_task.appendChild(canvasContainer_task);

            Composite.clear(engine.world, false);

            // Create main container
            var mainContainer_task = document.createElement('div');
            mainContainer_task.id = 'main-container_task';
            document.body.appendChild(mainContainer_task);

            var progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.innerHTML = "Progress: " + currentTrial + "/" + totalTrials
            mainContainer_task.appendChild(progressContainer);

            // Create canvas container and add it to main container
            var canvasContainer_task = document.createElement('div');
            canvasContainer_task.id = 'canvas-container_task';
            mainContainer_task.appendChild(canvasContainer_task);


            // // Initialize the progress indicator container
            // var progressContainer = document.createElement('div');
            // progressContainer.id = 'progress-container';
            // document.body.appendChild(progressContainer);

            // // Position the container in the top right corner
            // progressContainer.style.position = 'fixed';
            // progressContainer.style.top = '10px';
            // progressContainer.style.right = '10px';

            var render = Render.create({
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

            // mainContainer.remove()
        }

    function setupReconstructionTrial(obstacle_X, obstacle_Y, obstacleRadius) {
            // Remove existing main-container if there is one
            var existingMainContainer = document.getElementById('main-container_task');
            if (existingMainContainer) {
                existingMainContainer.remove();
            }

            // Reset the world and adjust gravity
            Composite.clear(engine.world, false);
            engine.world.gravity.y = 0;

            var triangleDragged = false

            // Add prompt element
            // var promptContainer = document.createElement('div');
            // promptContainer.id = 'prompt-container';
            // document.body.appendChild(promptContainer);

            // var promptText = document.createElement('div');
            // promptText.className = 'prompt-text';
            // promptText.innerHTML = promptMessage;
            // promptContainer.appendChild(promptText);

            // Create main container
            var mainContainer_task = document.createElement('div');
            mainContainer_task.id = 'main-container_task';
            document.body.appendChild(mainContainer_task);

            var progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.innerHTML = "Progress: " + currentTrial + "/" + totalTrials
            mainContainer_task.appendChild(progressContainer);

            // Create prompt container and add it to main container
            // var promptContainer = document.createElement('div');
            // promptContainer.id = 'prompt-container';
            // mainContainer.appendChild(promptContainer);

            // var promptText = document.createElement('p');
            // promptText.innerHTML = promptMessage;
            // promptContainer.appendChild(promptText);

            // Create canvas container and add it to main container
            var canvasContainer_task = document.createElement('div');
            canvasContainer_task.id = 'canvas-container_task';
            mainContainer_task.appendChild(canvasContainer_task);

            // Clear main container
            // while (mainContainer_task.firstChild) {
            //     mainContainer_task.firstChild.remove();
            // }

            // Now add necessary elements
            // For example, in setupFallingObjectTrial you might add a canvasContainer_task:
            // var canvasContainer_task = document.createElement('div');
            // canvasContainer_task.id = 'canvas-container_task';
            // mainContainer_task.appendChild(canvasContainer_task);

            console.log(mainContainer_task);  // Log the mainContainer_task variable to see if it's correctly defined


            // create a renderer
            var render = Render.create({
                element: canvasContainer_task,
                engine: engine,
                options: {
                    wireframes: noColor,
                    width: canvasWidth,
                    height: canvasHeight,
                }
            });

            var startTime = performance.now();

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

            Matter.Body.setAngle(triangle, Math.PI / 2);

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
                event.body.isStatic = true;
                triangleDragged = true;
            });

            // keep the mouse in sync with rendering
            render.mouse = mouse;

            // add bodies to the world
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

            var notification = document.createElement('div');
                notification.id = 'notification';
                document.body.appendChild(notification);


                
    
            // Event listener for submit button
            submitButton.addEventListener('click', function() {
    
            if (!triangleDragged) {
                // Update the message and display the notification
                notification.innerHTML = 'Please respond to the instruction and drag the triangle before submitting.';
                notification.style.display = 'block';
                setTimeout(function() {
                    notification.style.display = 'none';
                }, 1500);
                return;
            }

            // Store final position of triangle
            var finalPosition = { x: triangle.position.x, y: triangle.position.y };
            
            // Make triangle no longer draggable
            mouseConstraint.constraint.body = null;

            // Calculate response time
            var responseTime = performance.now() - startTime;

            // Remove the submit button
            // submitButton.remove();
            // mainContainer_task.remove()

            // Write final position and response time to trial data
            jsPsych.data.write({
                'triangle_final_x': finalPosition.x,
                'triangle_final_y': finalPosition.y,
                'response_time': responseTime
            });

            // End the current trial
            jsPsych.finishTrial();
            });
        }

    var timeline = []
    var repeat_prac = false
    timeline.push(preload)

    // consent
    // consent to participate.
    var check_consent = function(elem) {
        if (document.getElementById('consent_checkbox_accept').checked) {
            return true;
        }
        else {
            alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
            return false;
        }
    };

    // declare the block.
    var consent = {
        type: jsPsychExternalHtml,
        url: 'consent.html',
        cont_btn: "start",
        check_fn: check_consent
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
        delay_after: 500
    }
    timeline.push(enter_fullscreen)

    var askProlificID = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: 'Before continuing, please copy and paste your Prolific ID:'}
        ]
    }
    // timeline.push(enter_fullscreen, askProlificID)


    var instructions = { 
        type: jsPsychInstructions,
        pages: [ // should be an array here
            '<p><b><span style = "font-size:25px;">INSTRUCTIONS: Please Read Carefully!</span></b></p>'+
            '<p>In this experiment, there are 72 short videos. Each video is 3 seconds long. The study is expected to take 20 minutes.</p>'+
            '<p>Each video shows a <b>ball falling</b>. Part of the fall happens behind a <b>gray screen</b>.</p>'+
            '<p>When the ball is behind the screen, <b>it will hit a triangle</b>.</p>'+
            '<p>You will not see the triangle, because it is behind the <b>gray screen</b>.</p>'+
            '<p><b><u>YOUR TASK:</u></b> After seeing the video, give us your best guess for where you think the triangle was.</p>'+
            '<p>On the next page, we will explain how to do this.</p>'+
            '<br>'+
            '<img src = "intruction_illustration.png" style="width: 70%;"></img>',
            '<p><b><span style = "font-size:25px;">INSTRUCTIONS (Continued): Please Read Carefully!</span></b></p>'+
            '<p>After each video plays, the gray screen will disappear. Now it is time for you to <u>guess</u>.</p>'+
            '<p>A triangle will appear in a <b>random position</b>.</p>'+
            '<p>We ask that you <b><u>“drag” the triangle</u> to where it was <u>when the ball hit it behind the gray screen</u></b>.</p>'+
            "<p>Click 'Next' to see some examples.</p>"+
            '<br>'+
            '<img src = "intruction_illustration.png" style="width: 70%;"></img>',
            '<p>Here is an example video of a ball falling.</p>'+
            "<p>Once you are done watching the video, please click 'Next'.</p>"+
            '<video width="65%" controls><source src="fallingScene_with_Occluder.mp4" type="video/mp4"></video>',
            '<p>Here is what happened behind the gray screen.</p>'+
            '<p>Notice how the ball hit a triangle, which changed its course?</p>'+
            '<p>The ball always hits a triangle, but it happens behind the gray screen.</p>'+
            '<video width="65%" controls><source src="fallingScene_without_Occluder.mp4" type="video/mp4"></video>'

        ],
        show_clickable_nav: true,
        post_trial_gap: 500
    }
    // timeline.push(instructions)

    var praticeTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "Remember! After a ball falls, the screen will disappear, and you'll guess where the triangle was."+ 
        "<p>You'll enter your guess by dragging a triangle, and clicking 'submit'.</p>" + 
        "<p>Let's practice moving the triangle around!</p>" +  
        "Please drag the triangle below, then click 'submit'.</p>",
        choices: [],
        on_start: function() {
            setupPracticeTrial(obstacle_X_prac, obstacle_Y_prac, obstacleRadius)
        },
        on_finish: function() {
            var canvas = document.querySelector('canvas');
            if (canvas) canvas.remove();
        }
    };


    // timeline.push(praticeTrial)

    
    var repeatInstructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>Ok! We're almost ready to get started.</p>"+
                    "<p>We just have a <b>brief quiz</b>, to make sure you understood the task.</p>"+
                    "<p>If you need to review the instructions, click 'Previous'.</p>"+
                    "<p>It's important to understand the task to do the study, so you have to pass the quiz to move to the study.</p>",
        choices: ['Previous', 'Next'],
    };
    
    // Loop that conditionally repeats the instructions and practice trials
    var instructions_review_loop = {
        timeline: [instructions, praticeTrial, repeatInstructions],
        loop_function: function(data){
            console.log(jsPsych.data.getLastTrialData().values()[0].response)
            // If the participant clicked "Previous" on the repeatInstructions trial, repeat the loop
            if(jsPsych.data.getLastTrialData().values()[0].response == 0){
                return true;
            } else {
                return false;
            }
            }
    }
    // timeline.push(reviewBeforeCheck)

    var compreCheck_All = {
        type: jsPsychSurveyMultiChoice,
        timeline: [
            {questions: [
                {
                    prompt: 'What will you be doing in this study?',
                    name: 'generalProcedure',
                    options: ['Watch a video of a ball falling, some of it behind a gray screen. After each video, drag a triangle to some random place', 
                    'Watch a video of a ball falling, some of it behind a gray screen. After each video, drag a triangle to where I think the ball hit the triangle behind the screen.',
                    'Watch a video of a triangle falling. Nothing is hidden. After each video, drag a ball to some random place.',
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
            var last_prac_trials = jsPsych.data.get().last(3).values()
            console.log(last_prac_trials)
            var ans1 = last_prac_trials[0].response.generalProcedure,
                ans2 = last_prac_trials[1].response.checkBallHitObstacle,
                ans3 = last_prac_trials[2].response.checkTriangleVisibility
            console.log(last_prac_trials, ans1, ans2, ans3)
            if (ans1 == 'Watch a video of a ball falling, some of it behind a gray screen. After each video, drag a triangle to where I think the ball hit the triangle behind the screen.'
             && ans2 == 'Yes.' && ans3 == 'No, the triangle is hidden behind the gray screen.') {
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
    timeline.push(instructions_check_loop)

    // timeline.push(compreCheck_1, compreCheck_2, compreCheck_3)

    var start_task = {
        type : jsPsychInstructions,
        pages: [
            "<p><b>Great job, you've passed the quiz!</b></p>"+
            "<p>You are now ready to start the study.</p>"+
            "<p><b>Remember!</b> There will be 72 videos in total. To ensure your data is saved correctly, it's important to complete the entire study, until you see the completion code screen at the end.</p>"+
            "<p>To make things less repetitive, there is a break between each 18 trials. When you see the 'break' page, feel free to pause, or to keep going.</p>"+
            "<p>Please click 'Next' to start the study.</p>"
        ],
        show_clickable_nav: true,
        allow_backward: false
    }
    timeline.push(start_task)

    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        trial_duration: firstTrialDuration,
        data: {
            flipped: false,
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
            currentTrial++;
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius)
    },
        on_finish: function(trial){
            console.log(trial)
            // console.log(trial.flipped)
            jsPsych.data.addDataToLastTrial({
                ball_X: jsPsych.timelineVariable('first').x,
                obstacle_groundTruth_x: jsPsych.timelineVariable('first').y_1,
                obstacle_groundTruth_y: jsPsych.timelineVariable('first').y_2,
                stimulus_idx: jsPsych.timelineVariable('first').stimulus_idx,
                flipped: trial.flipped,
                trial_cate: 'fallScene'
            })
            // var mainContainer = document.querySelector('main-container_task');
            // if (mainContainer) mainContainer.remove();
          }
    }


    var reconstructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "Move the triangle to where you think the ball hit it behind the screen.",
        choices: [],
        // data: {
        // },
        on_start: function() {
            var obstacle_X = jsPsych.timelineVariable('second').initial_x
            var obstacle_Y = jsPsych.timelineVariable('second').initial_y
            setupReconstructionTrial(obstacle_X, obstacle_Y, obstacleRadius)
        },
        on_finish: function() {
            var current_node_id = jsPsych.getCurrentTimelineNodeID();
            var data_from_current_node = jsPsych.data.getDataByTimelineNode(current_node_id);
            var triangle_final_x = data_from_current_node.trials[0].triangle_final_x;
            var triangle_final_y = data_from_current_node.trials[0].triangle_final_y;
            var response_time = data_from_current_node.trials[0].response_time;
            var final_to_groundTruth_distance = getDistance(jsPsych.timelineVariable('first').y_1, jsPsych.timelineVariable('first').y_2, triangle_final_x, triangle_final_y);
            var initial_to_groundTruth_distance = getDistance(jsPsych.timelineVariable('second').initial_x, jsPsych.timelineVariable('second').initial_y, jsPsych.timelineVariable('first').y_1, jsPsych.timelineVariable('first').y_2);
            // console.log(data_from_current_node.trials[0])
            var final_to_initial_distance = getDistance(jsPsych.timelineVariable('second').initial_x, jsPsych.timelineVariable('second').initial_y, triangle_final_x, triangle_final_y)
            var finalInBetweenInitGround = (initial_to_groundTruth_distance >= final_to_initial_distance) && (initial_to_groundTruth_distance >= final_to_groundTruth_distance)
            jsPsych.data.addDataToLastTrial({
                obstacle_idx: jsPsych.timelineVariable('second').obstacle_idx,
                obstacle_initial_x: jsPsych.timelineVariable('second').initial_x,
                obstacle_initial_y: jsPsych.timelineVariable('second').initial_y,
                triangle_final_x,
                triangle_final_y,
                response_time,
                final_to_initial_distance,
                initial_to_groundTruth_distance,
                final_to_groundTruth_distance,
                finalInBetweenInitGround,
                trial_cate: 'reconstruct'
            })
            var existingMainContainer = document.getElementById('main-container_task');
            if (existingMainContainer) {
                existingMainContainer.remove();
            }
            var existingButton = document.getElementById('submit-button');
            if (existingButton) {
                existingButton.remove();
            }
        },
        // post_trial_gap: 500
    };

    function showProgressBar() {
        var progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.innerHTML = "Progress: " + currentTrial + "/" + totalTrials
            document.body.appendChild(progressContainer);
    }

    function removeProgressBar() {
        var existingProgressBar = document.getElementById('progress-container');
        existingProgressBar.remove()
    }

    var breakSession_1 = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<p><span style = "font-size:40px;">BREAK</span></p>' + 
        "<p>You are doing great! Click 'Next' when you are ready for the next set.</p>",
        choices: ['Next'],
        on_start: showProgressBar,
        on_finish: removeProgressBar
    }

    var breakSession_2 = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<p><span style = "font-size:40px;">BREAK</span></p>' + 
        "<p>You are halfway done! Click 'Next' when you are ready for the next set.</p>",
        choices: ['Next'],
        on_start: showProgressBar,
        on_finish: removeProgressBar
    }

    var breakSession_3 = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<p><span style = "font-size:40px;">BREAK</span></p>' + 
        "<p>You are almost done! Click 'Next' when you are ready for the next set.</p>",
        choices: ['Next'],
        on_start: showProgressBar,
        on_finish: removeProgressBar
    }

    // Divide full_design into chunks
    function chunkArray(myArray, chunk_size){
        var results = [];
        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }
        return results;
    }

    // var full_design_chunks = chunkArray(full_design, 18);
    var full_design_chunks = chunkArray(full_design, 1);

    full_design_chunks.forEach((chunk, index) => {
        var fullTrialDemos = {
            timeline : [fallingObjectTrial, reconstructionTrial],
            timeline_variables : chunk,
            randomize_order: true
        }

        // Add the trials to the timeline
        timeline.push(fullTrialDemos);

        // Add a break after every chunk, except the last one
        if(index == 0) {
            timeline.push(breakSession_1);
        }
        else if (index == 1) {
            timeline.push(breakSession_2)
        }
        else if (index == 2) {
            timeline.push(breakSession_3)
        }
    });

    function saveData(name, data){
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'write_data.php'); // 'write_data.php' is the path to the php file described above.
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({filename: name, filedata: data}));
      }
      
    // grab data before the end of the experiment
    var save_data = {
    type: jsPsychCallFunction,
    func: function(){ saveData(subject_id + '_result', jsPsych.data.get().csv());
    },
    timing_post_trial: 0
    };
    timeline.push(save_data);

    var check_understanding = {
        type: jsPsychSurveyText,
        preamble: "Well done, you've completed the study!",
        questions: [{prompt: 'Just to make sure you paid attention, please <u>briefly</u> say in your own words, what was the activity you just performed.', name: 'Summary', required: true}],
        button_label: 'Submit Answer',
        on_finish: jsPsych.data.get().localSave('csv','myTestData.csv')
    };
    
    var end_comments = {
        type: jsPsychSurveyText,
        preamble: "Feedback [Optional]",
        questions: [{prompt: 'Please share any suggestions, comments, or thoughts you may have about the study below – we welcome any and all feedback.', name: 'Comments'}],
        button_label: 'Submit Answer',
        // on_finish: function(data) {
        //     var interaction_data = jsPsych.data.getInteractionData();
        //     data.screen = interaction_data.json();
        // }
    };

    function generateFeedbackString() {
        var subset = jsPsych.data.get().filter({trial_cate: 'reconstruct'})
        console.log(subset.select('response_time'))
        var mean_rt =  subset.select('response_time').mean()
        console.log(subset.count())
        var mean_distance_final_initial = subset.select('final_to_initial_distance').mean()
        var prop_between = subset.filter({finalInBetweenInitGround: true}).count()/subset.count()*100
        return `<p><br>Mean Response Time: ${Math.round(mean_rt)} 
                <br>Mean Distance Between Obstacle's Final Position and Initial Position: ${Math.round(mean_distance_final_initial)}
                <br>Percent of Placed Obstacle in between Initial and Groundtruth Condition: ${Math.round(prop_between)} %</p>`
    }

    // participant clicks a link to return to Prolific
    // var comp_code = "XxCyhyzl553k";
    var completion = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        var finalMessage = generateFeedbackString()
        finalMessage += '<p> Thank you for your participation! Your responses have been successfully recorded. </p>'+
    //   '<p> Your completion code is</p><b>' + comp_code + '</b>' +
    '<p><a href="https://app.prolific.co/submissions/complete?cc=XXXXXXX">Click here to return to Prolific and complete the study</a>.</p>' +
    //   "<p> Please ensure to copy this code and paste it into Prolific, as you won't be able to access this code once you leave this page. </p>"+
    //   "<p> You're free to exit the window at your convenience.</p>" +
      "<p>Once again, we appreciate your time and effort! </p>"
        return finalMessage},
      choices: "NO_KEYS",
    //   trial_duration: 10000
    };

    timeline.push(check_understanding, end_comments)
    timeline.push(completion);
    
    jsPsych.run(timeline);

});
