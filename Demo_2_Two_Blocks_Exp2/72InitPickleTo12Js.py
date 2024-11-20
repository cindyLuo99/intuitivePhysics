import pickle
import json

# File paths for the pickle files
pickle_files = {
    "x_lp": "x_lp.pkl",
    "y_lp": "y_lp.pkl",
    "x_gt": "x_gt.pkl",
    "y_gt": "y_gt.pkl",
    "x_mid": "x_mid.pkl",
    "y_mid": "y_mid.pkl",
}

# Load data from pickle files
data = {}
for key, path in pickle_files.items():
    with open(path, 'rb') as f:
        data[key] = pickle.load(f)

# Generate yesOrNoTask_info structure
yesOrNoTask_info = []
for stimulus_idx in range(1, 13):  # 12 stimuli
    yesOrNoTask_info.extend([
        {
            "stimulus_idx": stimulus_idx,
            "choice": "lp",
            "x": data["x_lp"][stimulus_idx - 1],
            "y": data["y_lp"][stimulus_idx - 1],
        },
        {
            "stimulus_idx": stimulus_idx,
            "choice": "gt",
            "x": data["x_gt"][stimulus_idx - 1],
            "y": data["y_gt"][stimulus_idx - 1],
        },
        {
            "stimulus_idx": stimulus_idx,
            "choice": "mid",
            "x": data["x_mid"][stimulus_idx - 1],
            "y": data["y_mid"][stimulus_idx - 1],
        },
    ])

# Save yesOrNoTask_info as JSON
with open("yesOrNoTask_info.json", "w") as json_file:
    json.dump(yesOrNoTask_info, json_file, indent=4)

print("JSON file created successfully!")

# Load your JSON data
with open("yesOrNoTask_info.json", "r") as json_file:
    data = json.load(json_file)

# Convert JSON to a JavaScript object string with unquoted keys
def json_to_js_object(data):
    js_lines = ["const yesOrNoTask_info = ["]
    for entry in data:
        js_lines.append("    {")
        for key, value in entry.items():
            # Format the key-value pair with unquoted keys
            formatted_key = key if isinstance(key, str) else repr(key)
            formatted_value = repr(value) if isinstance(value, str) else value
            js_lines.append(f"        {formatted_key}: {formatted_value},")
        js_lines[-1] = js_lines[-1][:-1]  # Remove the trailing comma from the last key-value pair
        js_lines.append("    },")
    js_lines[-1] = js_lines[-1][:-1]  # Remove the trailing comma from the last object
    js_lines.append("];")
    return "\n".join(js_lines)

# Generate JavaScript file
with open("yesOrNoTask_info.js", "w") as js_file:
    js_file.write(json_to_js_object(data))