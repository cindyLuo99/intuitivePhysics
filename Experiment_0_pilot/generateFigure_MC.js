document.addEventListener("DOMContentLoaded", function () {

    const jsPsych = initJsPsych({
        on_finish: () => {
            jsPsych.data.get().localSave('csv','myTestData.csv');
        }
    })

    // full 72 trials
    var full_design = jsPsych.randomization.factorial({first: fallingScene_info, second: reconstructionTask_info}, 1);

    var currentTrial = 0;
    var totalTrials = full_design.length

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Events = Matter.Events,
        Vector = Matter.Vector;

    // create an engine
    var engine = Engine.create();

    engine.timing.timeScale = 0.5

    // create a runner
    var runner = Runner.create({isFixed: false,})

    // create a render
    var render;

    // create a mouseConstraint
    var mouseConstraint;

    var mouse;

    // add bodies
    var ballCategory = 0x0001;
        defaultCategory = 0x0002

    function cleanupTrial() {
        if (mouseConstraint) {
            Matter.Events.off(mouseConstraint, 'startdrag');
            Matter.Events.off(mouseConstraint, 'enddrag');
            mouseConstraint = null; // Clear the reference
            // console.log('Removing mouseConstraint');
        }
        if (runner) {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
            Matter.World.clear(engine.world);
            render.canvas.remove();
            render.canvas = null;
            render.context = null;
            // console.log('Removing runner&render')
        }
    }
        
  
    function randomChoice(arr) {
        return arr[Math.floor(arr.length * Math.random())];
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

    function setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius) {
            Composite.clear(engine.world, false);
            engine.world.gravity.y = 1;

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

            render = Render.create({
                element: canvasContainer_task,
                engine: engine,
                options: {
                    wireframes: noColor,
                    width: canvasWidth,
                    height: canvasHeight
                }
            });
            // console.log(render)
            Render.run(render);

            // // run the engine
            // runner.enabled = true;
            console.log('Current Trial:'+ currentTrial)
            console.log(runner.fps)


            // Runner.run(runner, engine);

            // change timestep from 60 to 200
            var desiredTimeStep = 1000/200;

            setInterval(function() {
                Matter.Engine.update(engine, desiredTimeStep);
                Render.world(render);  // Ensure the renderer reflects the changes
            }, desiredTimeStep);


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
                    visible: false, // should be false
                    fillStyle: color_obstacle,
                    strokeStyle: 'black',
                    lineWidth: 1
                }
        
            });

            var obstacle_center = Bodies.circle(obstacle_X, obstacle_Y, 5, {
                isStatic: true,
                collisionFilter: {
                    mask: defaultCategory,
                },
                render: {
                    fillStyle: 'red', 
                    visible: true // should be true
                }
            });
            
            // Matter.Body.rotate(obstacle, 1);
            Matter.Body.setAngle(obstacle, Math.PI / 2); // Rotate the triangle to make it stand straight

            // add all of the bodies to the world
            Composite.add(engine.world, [ball, obstacle, obstacle_center]);

            // if events on engine
            let trail = [];

            Events.on(engine, 'afterUpdate', function() {
                if (ball.position.x >= 0 && ball.position.x <= canvasWidth &&
                    ball.position.y >= 0 && ball.position.y <= canvasHeight) {
                    trail.unshift({
                        position: Vector.clone(ball.position),
                        speed: ball.speed // Ensure that 'ball.speed' is correctly defined or calculated
                    });
                }
            });

            Events.on(render, 'afterRender', function() {
                Render.startViewTransform(render);
                render.context.globalAlpha = 0.7; // make the trail semi-transparent
            
                for (var i = 0; i < trail.length; i += 1) {
                    var point = trail[i].position,
                        speed = trail[i].speed;
            
                    var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
                    render.context.fillStyle = 'white';
                    render.context.fillRect(point.x, point.y, 2, 2);
                }
            
                render.context.globalAlpha = 1;
                Render.endViewTransform(render);   
            });            

            // if events on render
            // var trail = [];
            // Events.on(render, 'afterRender', function() {
            //     if (ball.position.x >= 0 && ball.position.x <= canvasWidth &&
            //         ball.position.y >= 0 && ball.position.y <= canvasHeight){
            //             trail.unshift({
            //                 position: Vector.clone(ball.position),
            //                 speed: ball.speed
            //             });
            //         }

            //     Render.startViewTransform(render);
            //     render.context.globalAlpha = 0.7 // make the trail semi-transparent

            //     for (var i = 0; i < trail.length; i += 1) {
            //         var point = trail[i].position,
            //             speed = trail[i].speed;
                    
            //         var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
            //         render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
            //         render.context.fillRect(point.x, point.y, 2, 2);
            //     }
        
            //     render.context.globalAlpha = 1;
            //     Render.endViewTransform(render);   
            // })
            console.log(trail)
            jsPsych.data.write({
                'trail': trail,
            });

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

            // var triangleDragged = false
            var triangleDragged = true

            // Create main container
            var mainContainer_task = document.createElement('div');
            mainContainer_task.id = 'main-container_task';
            document.body.appendChild(mainContainer_task);

            // progressContainer = document.getElementById('progress-container');
            var progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.innerHTML = "Progress: " + currentTrial + "/" + totalTrials
            mainContainer_task.appendChild(progressContainer);

            // Create canvas container and add it to main container
            var canvasContainer_task = document.createElement('div');
            canvasContainer_task.id = 'canvas-container_task';
            mainContainer_task.appendChild(canvasContainer_task);

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
            mouse = Mouse.create(render.canvas);
            mouseConstraint = MouseConstraint.create(engine, {
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
                // console.log("Start Dragging", event);
                Matter.Body.setInertia(event.body, 10);
                event.body.isStatic = false;
            });

            // Revert the body's properties when the drag is ended, back to static again
            Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
                // console.log("End Dragging", event);
                event.body.isStatic = true;
                triangleDragged = true;
            });

            // keep the mouse in sync with rendering
            render.mouse = mouse;

            // add bodies to the world
            World.add(engine.world, [triangle, mouseConstraint]);
            // World.add(engine.world, [triangle])

            // run the renderer
            Render.run(render);
            Runner.run(runner, engine);

            // Create and add submit button
            var submitButton = document.createElement('button');
                submitButton.id = 'submit-button';
                submitButton.innerHTML = 'Submit';
                document.body.appendChild(submitButton);

            var notification = document.createElement('div');
                notification.id = 'notification';
                document.body.appendChild(notification);

            function onSubmitClick() {
                // Store final position of triangle
                var finalPosition = { x: triangle.position.x, y: triangle.position.y };
                
                // Make triangle no longer draggable
                mouseConstraint.constraint.body = null;

                // Calculate response time
                var responseTime = performance.now() - startTime;

                if (!triangleDragged||responseTime<=1200) {
                    // Update the message and display the notification
                    notification.innerHTML = 'Please respond to the instruction and drag the triangle before submitting.';
                    notification.style.display = 'block';
                    setTimeout(function() {
                        notification.style.display = 'none';
                    }, 1500);
                    return;
                }

                // Write final position and response time to trial data
                jsPsych.data.write({
                    'triangle_final_x': finalPosition.x,
                    'triangle_final_y': finalPosition.y,
                    'response_time': responseTime
                });

                // End the current trial
                jsPsych.finishTrial();
            }
                
            // Event listener for submit button
            submitButton.addEventListener('click', onSubmitClick);
        }

    var timeline = []

    var practiceTrial_withOccluder_fall = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: 'NO_KEYS',
        trial_duration: 100000,
        on_start: function() {
            setupFallingObjectTrial(400, 50, ballRadius, obstacle_X_prac_occ, obstacle_Y_prac_occ, obstacleRadius)
            removeProgressBar();
    },
        on_finish: function(trial){
            jsPsych.data.addDataToLastTrial({
                ball_X_prac_occ,
                ball_Y_prac_occ,
                obstacle_X_prac_occ,
                obstacle_Y_prac_occ,
                trial_name: 'fallScene_practiceTrial_withOccluder'
            });
            cleanupTrial();
          }
    }
    timeline.push(practiceTrial_withOccluder_fall)


    

    var fallingObjectTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: 'NO_KEYS',
        trial_duration: firstTrialDuration,
        data: {
            flipped: false,
            runnerFPS: 0,
        },
        on_start: function(trial) {
            // console.log(jsPsych.timelineVariable('first').x)
            var ball_X = jsPsych.timelineVariable('first').x
            var obstacle_X = jsPsych.timelineVariable('first').y_1
            var obstacle_Y = jsPsych.timelineVariable('first').y_2
            // console.log(jsPsych.timelineVariable('first').stimulus_idx)
            // trial.data.flipped = Math.random() >= 0.5
            // if (trial.data.flipped) {
            //     // console.log('Flipped!')
            //     ball_X = canvasWidth - ball_X
            //     obstacle_X = canvasWidth - obstacle_X
            // }
            // console.log(ball_X, obstacle_X)
            currentTrial++;
            setupFallingObjectTrial(ball_X, ball_Y, ballRadius, obstacle_X, obstacle_Y, obstacleRadius);
            trial.data.runnerFPS = runner.fps
            // console.log('on_start',runner.fps)
    },
        on_finish: function(trial){
            jsPsych.data.addDataToLastTrial({
                ball_X: jsPsych.timelineVariable('first').x,
                obstacle_groundTruth_x: jsPsych.timelineVariable('first').y_1,
                obstacle_groundTruth_y: jsPsych.timelineVariable('first').y_2,
                stimulus_idx: jsPsych.timelineVariable('first').stimulus_idx,
                flipped: trial.flipped,
                trial_name: 'fallScene',
                currentTrial,
                runnerFPS: trial.runnerFPS
            });
            var existingMainContainer = document.getElementById('main-container_task');
            if (existingMainContainer) {
                existingMainContainer.remove();
            }
            cleanupTrial();
            // console.log('Removing Runner and Render_falling');
            // Matter.Render.stop(render);
            // Matter.Runner.stop(runner);
          }
    }

    var reconstructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        // type: jsPsychCallFunction,
        stimulus: "Move the triangle to where you think it was when the ball hit it behind the screen.",
        choices: 'NO_KEYS',
        // trial_duration: firstTrialDuration,
        on_start: function() {
            // if flipped in the fallingObject trial, then the initialization should be flipped, too
            var lastTrialData = jsPsych.data.getLastTrialData();
            var fallSceneFlipped = lastTrialData.trials[0].flipped
            // console.log(lastTrialData)
            // console.log(lastTrialData.trials[0].flipped)
            var obstacle_X = jsPsych.timelineVariable('second').initial_x
            var obstacle_Y = jsPsych.timelineVariable('second').initial_y
            // console.log('before flip:')
            // console.log(obstacle_X, obstacle_Y)
            if (fallSceneFlipped){
                obstacle_X = canvasWidth - obstacle_X
            }
            // console.log('after flip:')
            // console.log(obstacle_X, obstacle_Y)
            setupReconstructionTrial(obstacle_X, obstacle_Y, obstacleRadius)
        },
        on_finish: function() {
            var current_node_id = jsPsych.getCurrentTimelineNodeID();
            var data_from_current_node = jsPsych.data.getDataByTimelineNode(current_node_id);
            var triangle_final_x = data_from_current_node.trials[0].triangle_final_x;
            var triangle_final_y = data_from_current_node.trials[0].triangle_final_y;
            var response_time = data_from_current_node.trials[0].response_time;
            // var final_to_groundTruth_distance = getDistance(jsPsych.timelineVariable('first').y_1, jsPsych.timelineVariable('first').y_2, triangle_final_x, triangle_final_y);
            // var initial_to_groundTruth_distance = getDistance(jsPsych.timelineVariable('second').initial_x, jsPsych.timelineVariable('second').initial_y, jsPsych.timelineVariable('first').y_1, jsPsych.timelineVariable('first').y_2);
            // var final_to_initial_distance = getDistance(jsPsych.timelineVariable('second').initial_x, jsPsych.timelineVariable('second').initial_y, triangle_final_x, triangle_final_y)
            // var finalInBetweenInitGround = (initial_to_groundTruth_distance >= final_to_initial_distance) && (initial_to_groundTruth_distance >= final_to_groundTruth_distance)
            jsPsych.data.addDataToLastTrial({
                obstacle_idx: jsPsych.timelineVariable('second').obstacle_idx,
                obstacle_initial_x: jsPsych.timelineVariable('second').initial_x,
                obstacle_initial_y: jsPsych.timelineVariable('second').initial_y,
                triangle_final_x,
                triangle_final_y,
                response_time,
                // final_to_initial_distance,
                // initial_to_groundTruth_distance,
                // final_to_groundTruth_distance,
                // finalInBetweenInitGround,
                trial_name: 'reconstruct',
                currentTrial
            })
            var existingMainContainer = document.getElementById('main-container_task');
            if (existingMainContainer) {
                existingMainContainer.remove();
                existingMainContainer = null
            }
            var existingButton = document.getElementById('submit-button');
            if (existingButton) {
                existingButton.remove();
                existingButton = null
            };
            removeReminder();
            cleanupTrial();
            // console.log(existingButton)
            // if (render) {
            //     console.log('Removing Runner and Render_reconstructing');
            //     Matter.Render.stop(render);
            //     Matter.Runner.stop(runner);
            // }
        },
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

    function removeReminder() {
        var existingReminder = document.getElementById('notification')
        existingReminder.remove()
    }

    // Divide full_design into chunks
    function chunkArray(myArray, chunk_size){
        var results = [];
        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }
        return results;
    }

    var full_design_chunks = chunkArray(full_design, 18);
    // var full_design_chunks = chunkArray(full_design, 5);

    // full_design_chunks.forEach((chunk, index) => {
    //     var fullTrialDemos = {
    //         // timeline : [fallingObjectTrial, reconstructionTrial],
    //         timeline : [fallingObjectTrial],
    //         timeline_variables : chunk,
    //         // randomize_order: true,
    //         randomize_order: false
    //     }

    //     // Add the trials to the timeline
    //     timeline.push(fullTrialDemos);

    // });

    var check_understanding = {
        type: jsPsychSurveyText,
        preamble: "Well done, you've completed the study!",
        questions: [{prompt: 'Just to make sure you paid attention, please <u>briefly</u> say in your own words, what was the activity you just performed.', name: 'Summary', required: true}],
        button_label: 'Submit Answer',
        // on_finish: ()=>{jsPsych.data.get().localSave('csv','myTestData.csv')}
    };

    // timeline.push(check_understanding)

    var end_comments = {
        type: jsPsychSurveyText,
        preamble: "Feedback [Optional]",
        questions: [{prompt: 'Please share any suggestions, comments, or thoughts you may have about the study below – we welcome any and all feedback.', name: 'Comments'}],
        button_label: 'Submit Answer',
    };

    // function saveData(name, data){
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('POST', 'write_data.php');
    //     xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.send(JSON.stringify({filename: name, filedata: data}));
    //   }
      
    // grab data before the end of the experiment
    // var save_data = {
    // type: jsPsychCallFunction,
    // func: function(){ 
    //     // console.log(jsPsych.data.get().csv())
    //     saveData(subject_id + '_result', jsPsych.data.get().csv());
    // },
    // timing_post_trial: 0
    // };

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
              console.log(response.message);
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
    //   alert("A problem occurred while writing to the database. Please contact the researcher for more information.")
    // timeline.push(end_comments)

    // timeline.push(save_data);

    function generateFeedbackString() {
        var subset = jsPsych.data.get().filter({trial_name: 'reconstruct'})
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
        var finalMessage_hidden = generateFeedbackString()
        // console.log(finalMessage_hidden)
        var finalMessage = '<p> Thank you for your participation! Your responses have been successfully recorded. </p>'+
    //   '<p> Your completion code is</p><b>' + comp_code + '</b>' +
    '<p><a href="https://app.prolific.co/submissions/complete?cc=CKL1OX31">Click here to return to Prolific and complete the study</a>.</p>' +
    //   "<p> Please ensure to copy this code and paste it into Prolific, as you won't be able to access this code once you leave this page. </p>"+
    //   "<p> You're free to exit the window at your convenience.</p>" +
      "<p>Once again, we appreciate your time and effort! </p>"
        return finalMessage},
      choices: "NO_KEYS",
    //   trial_duration: 10000
    };

    // timeline.push(completion);
    
    jsPsych.run(timeline);

});

