**July 17**
**Demo_2 Current Set Up**

Falling Scene:
- Overview:
    - 3 different x_positions of the falling object, y_position constant (y = 50)
    - 4 different obstacle positions for each falling object position
    - => 12 different scenes
    - for each scene, allows for horizontal flip of the trial, (50% of selecting the flipped version)
    - obstacle & falling object colors randomly initialized 
        - colors selected from a color-blind friendly palatte

- Pre-determined Parameters:
    - Canvas:
        - canvasWidth = 1000, canvasHeight = 600,
    - Occluder:
        - occluderWidth = canvasWidth / 2, occluderHeight = canvasHeight / 2
    - Ball (falling object):
        - radius: 30
    - Triangular Obstacle:
        - radius: 45

- Data Recorded:
    - The initial position of the ball
    - The initial position of the triangle (obstacle) <- Ground truth:
        - triangle_groundTruth_x; triangle_groundTruth_y
    - The stimulus index (1-12)
    - Whether the stimulus got flipped (True/False)


Reconstruction Task:
- Overview:
    - 6 different initialization positions (12*6 = 72 different trials in total)
    - obstacle colors randomly initialized

- Pre-determined Parameters
    - Engine.world.gravity = 0
    - Canvas:
        - canvasWidth = 1000, canvasHeight = 600,
    - Triangle:
        - Radius: 50
    - Mouse Constraint (when dragging the triangle in the physics engine, to prevent bouncing of the object while dragging and moving object after placing it on the canvas):
        - Constraint.stiffness = 1
        - Inertia while dragging = 10

- Data Recorded:
    - The initial position of the triangle (randomly initialized so that the whole triangle should be behind where the occlude was)
        - triangle_initial_x; triangle_initial_y
    - The final position of the triangle after the participant pressed the submit button
        - triangle_final_x; triangle_final_y
    - The response time between the start of the second trial and when the participant clicks the ‘submit’ button
        - Response_time
    - Obstacle Index (1-6)
