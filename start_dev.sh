#!/bin/bash

# This script automates dependency installation and starting
# of the recipe application's subprojects.

# Exit immediately if a command fails
set -e

echo "Starting the Nicaraguan Recipes app setup..."

# --- 1. Set up and start the backend (recipes-api) ---
echo "----------------------------------------------------"
echo "Setting up and starting recipes-api..."
cd api-recipes || { echo "Error: recipes-api directory not found. Make sure the path is correct."; exit 1; }

echo "Installing recipes-api dependencies..."
npm install

echo "Starting the Node.js server (backend.js) in the background..."
# The & at the end runs the command in the background
node backend.js &
BACKEND_PID=$! # Stores the PID of the backend process
echo "recipes-api started with PID: $BACKEND_PID"

# Go back to the My-app root directory
cd ..

# --- 2. Set up and start the frontend (app-recipes-nicaraguan) ---
echo "----------------------------------------------------"
echo "Setting up and starting app-recipes-nicaraguan..."
cd recetas-nicas-app || { echo "Error: app-recipes-nicaraguan directory not found. Make sure the path is correct."; exit 1; }

echo "Installing app-recipes-nicaraguan dependencies..."
npm install

echo "Starting the React application (frontend) in the background..."
# npm start often automatically opens a new browser window
npm start &
FRONTEND_PID=$! # Stores the PID of the frontend process
echo "app-recipes-nicaraguan started with PID: $FRONTEND_PID"

# Go back to the My-app root directory
cd ..

# --- 3. Set up the automation suite (recipes-suite-automation) ---
echo "----------------------------------------------------"
echo "Setting up recipes-suite-automation..."
cd recipes-automation-suite || { echo "Error: recipes-suite-automation directory not found. Make sure the path is correct."; exit 1; }

echo "Installing recipes-suite-automation dependencies..."
npm install

echo "recipes-suite-automation dependencies installed."
echo "You can run Playwright tests with: npx playwright test"

# Go back to the My-app root directory
cd ..

echo "----------------------------------------------------"
echo "Setup complete."
echo "The backend (recipes-api) is running in the background (PID: $BACKEND_PID)."
echo "The frontend (app-recipes-nicaraguan) is running in the background (PID: $FRONTEND_PID)."
echo "You can access the application at http://localhost:3000 (or the configured React port)."
echo "To stop the servers, use 'kill $BACKEND_PID' and 'kill $FRONTEND_PID' or find processes by port."
echo "To view server logs, check your terminal output or log files if you configured them."

# Optional: Keep the script running so background processes don't stop
# If you close this terminal, background processes might stop.
# If you want the script to wait indefinitely, you can use 'wait'
# wait # Uncomment this line if you want the script to wait for background processes to finish.
