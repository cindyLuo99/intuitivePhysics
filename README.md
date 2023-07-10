Demo_1 Current Set Up

Trial_1:
•	Pre-determined Parameters:
    o	Canvas:
        -	canvasWidth = 1000, canvasHeight = 600,
    o	Occluder:
        -	occluderWidth = canvasWidth / 2, occluderHeight = canvasHeight / 2
    o	Ball (falling object):
        -	radius: 30
    o	Triangular Obstacle:
        -	Radius: 50

•	Data Recorded:
    o	The initial position of the triangle (obstacle) <- Ground truth:
        -	triangle_groundTruth_x; triangle_groundTruth_y

Trial_2:
•	Pre-determined Parameters
    o	Engine.world.gravity = 0
    o	Canvas:
        -	canvasWidth = 1000, canvasHeight = 600,
    o	Triangle:
        -	Radius: 50
    o	Mouse Constraint (when dragging the triangle in the physics engine, to prevent bouncing of the object while dragging and moving object after placing it on the canvas):
        -	Constraint.stiffness = 1
        -	Inertia while dragging = 10

•	Data Recorded:
    o	The initial position of the triangle (randomly initialized so that the whole triangle should be behind where the occlude was)
        -	triangle_initial_x; triangle_initial_y
    o	The final position of the triangle after the participant pressed the submit button
        -	triangle_final_x; triangle_final_y
    o	The response time between the start of the second trial and when the participant clicks the ‘submit’ button
        -	Response_time
