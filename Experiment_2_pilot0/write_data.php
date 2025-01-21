<?php
// get the data from the POST message
$post_data = json_decode(file_get_contents('php://input'), true);
$data = $post_data['filedata'];
// generate a unique ID for the file, e.g., session-6feu833950202 
// $file = uniqid("session-");
// the directory "data" must be writable by the server
if ($post_data['filename'] == 'undefined_result') {
    $filename = uniqid() . "_result";  // if filename is not provided, create a unique filename
} else {
    $filename = $post_data['filename'];  // if filename is provided, use it
}
$name = "data/{$filename}.csv"; 
// write the file to disk
// file_put_contents($name, $data);
$result = file_put_contents($name, $data);

// check if the write was successful
if ($result !== false) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
} else {
    header('Content-Type: application/json');
    http_response_code(500); // Internal Server Error status code
    echo json_encode(['success' => false, 'message' => 'Failed to save data']);
}
?>