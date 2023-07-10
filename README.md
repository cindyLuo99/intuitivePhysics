July 10
Demo_1 Current Set Up

Trial_1:
- Pre-determined Parameters:
    - Canvas:
        - canvasWidth = 1000, canvasHeight = 600,
    -	Occluder:
        -	occluderWidth = canvasWidth / 2, occluderHeight = canvasHeight / 2
    -	Ball (falling object):
        -	radius: 30
    -	Triangular Obstacle:
        -	Radius: 50

-	Data Recorded:
    -	The initial position of the triangle (obstacle) <- Ground truth:
        -	triangle_groundTruth_x; triangle_groundTruth_y

Trial_2:
-	Pre-determined Parameters
    -	Engine.world.gravity = 0
    -	Canvas:
        -	canvasWidth = 1000, canvasHeight = 600,
    -	Triangle:
        -	Radius: 50
    -	Mouse Constraint (when dragging the triangle in the physics engine, to prevent bouncing of the object while dragging and moving object after placing it on the canvas):
        -	Constraint.stiffness = 1
        -	Inertia while dragging = 10

-	Data Recorded:
    -	The initial position of the triangle (randomly initialized so that the whole triangle should be behind where the occlude was)
        -	triangle_initial_x; triangle_initial_y
    -	The final position of the triangle after the participant pressed the submit button
        -	triangle_final_x; triangle_final_y
    -	The response time between the start of the second trial and when the participant clicks the ‘submit’ button
        -	Response_time
