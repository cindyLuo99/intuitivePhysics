import os
import subprocess
import pandas as pd
import json
import pickle
import numpy as np
from pathlib import Path
import sys

class SimulationRunner:
    def __init__(self, base_dir,  results_dir, model_name):
        self.base_dir = Path(base_dir)
        self.model_name = model_name
        self.model_dir = self.base_dir / model_name
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.json_params_file = self.model_dir / f'simulation72_parameters_{model_name}.json'
        self.results_dir = self.model_dir / results_dir
        self.results_dir.mkdir(parents=True, exist_ok=True)  # Ensure the directory exists

    def generate_parameters_file(self):
        # Define paths for x and y coordinates
        x_file_path = self.model_dir / f'x_coords_{self.model_name}.pkl'
        y_file_path = self.model_dir / f'y_coords_{self.model_name}.pkl'

        # Load coordinates from pickle files
        with open(x_file_path, 'rb') as f:
            obstacle_X = pickle.load(f)
        with open(y_file_path, 'rb') as f:
            obstacle_Y = pickle.load(f)

        # Define simulation parameters
        stimulus_idx = list(range(1, 13))
        obstacle_idx = list(range(1, 7))
        ball_X = [322.3] * 4 + [500.0] * 4 + [604.4] * 4

        # Create DataFrame of parameters
        data = {
            'stimulus_idx': np.repeat(stimulus_idx, 6),
            'obstacle_idx': obstacle_idx * 12,
            'ball_X': np.repeat(ball_X, 6),
            'obstacle_X': obstacle_X,
            'obstacle_Y': obstacle_Y
        }
        df = pd.DataFrame(data)
        df.to_json(self.json_params_file, orient='records')  # Save parameters to JSON file

    def run_simulation(self):
        # Command to run the Node.js script
        command = [
            "node",
            str(self.base_dir / "run72Simulations.js"),
            str(self.json_params_file),
            str(self.results_dir) 
        ]
        subprocess.run(command, check=True)

    def collect_results(self):
        # Aggregate all JSON results into a single DataFrame
        all_results = []
        for result_file in self.results_dir.glob("*.json"):
            with open(result_file, 'r') as file:
                data = json.load(file)
                all_results.append(data)
        
        return all_results

    def save_results(self, all_results, output_file):
        # Save the list of results to a JSON file
        output_path = self.model_dir / output_file
        with open(output_path, 'w') as file:
            json.dump(all_results, file, indent=4)  # Pretty print the JSON

# Check if any arguments were passed
if len(sys.argv) > 1:
    modelName = sys.argv[1]
else:
    modelName = 'random'

print(f"The model name is {modelName}")

# Usage
simulation_runner = SimulationRunner(base_dir='runSimulation/full72Trajectories', results_dir='results', model_name=modelName)
simulation_runner.generate_parameters_file()
simulation_runner.run_simulation()
all_results = simulation_runner.collect_results()
simulation_runner.save_results(all_results, 'all72_results.json')
