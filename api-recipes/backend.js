// backend.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Change this in production!

// Middleware
app.use(cors()); // Allows requests from the React frontend
app.use(bodyParser.json()); // To parse JSON request bodies

// Directory to store JSON data files
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const usersFilePath = path.join(dataDir, 'users.json');
const recipesFilePath = path.join(dataDir, 'recipes.json');
const cookbookFilePath = path.join(dataDir, 'cookbook.json'); // To store recipe IDs in each user's cookbook

// Initialize data files if they don't exist
const initializeDataFile = (filePath, defaultContent) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
};

// Initial data for recipes (simulating public recipes)
const initialRecipesData = [
  {
    id: '1',
    name: 'Gallo Pinto',
    ingredients: [
      '2 tazas de arroz cocido (del día anterior)',
      '1 taza de frijoles rojos cocidos (con su caldo)',
      '1/2 cebolla picada',
      '1/4 taza de chiltoma (pimiento verde) picada',
      '2 dientes de ajo picados',
      '2 cucharadas de aceite vegetal',
      'Sal al gusto'
    ],
    instructions: [
      'Calentar el aceite en una sartén grande a fuego medio.',
      'Sofreír la cebolla, la chiltoma y el ajo hasta que estén suaves y fragantes.',
      'Añadir los frijoles cocidos con un poco de su caldo y cocinar por unos minutos, aplastando algunos frijoles para espesar.',
      'Incorporar el arroz cocido y mezclar bien, asegurándose de que el arroz se impregne del color y sabor de los frijoles. Cocinar hasta que el líquido se evapore y el gallo pinto esté seco y suelto.',
      'Servir caliente, idealmente con huevo, queso, o carne asada.'
    ],
    image: 'https://placehold.co/150x100/4a00e0/ffffff?text=Gallo+Pinto'
  },
  {
    id: '2',
    name: 'Vigorón',
    ingredients: [
      '2 tazas de yuca cocida y troceada',
      '1 taza de chicharrón (cueritos de cerdo fritos)',
      '1/2 repollo finamente picado',
      '2 tomates picados',
      '1 cebolla morada encurtida (con vinagre y sal)',
      'Chile al gusto',
      'Sal al gusto'
    ],
    instructions: [
      'En un plato, colocar una cama de hojas de plátano (opcional).',
      'Disponer la yuca cocida en trozos.',
      'Cubrir con el chicharrón.',
      'Mezclar el repollo picado con el tomate y la cebolla encurtida. Añadir sal y chile al gusto.',
      'Colocar la mezcla de repollo sobre el chicharrón.',
      'Servir inmediatamente.'
    ],
    premium: true, // Example of a premium recipe
    image: 'https://placehold.co/150x100/00c6ff/ffffff?text=Vigoron'
  },
  {
    id: '3',
    name: 'Nacatamal',
    ingredients: [
      'Masa de maíz para nacatamales',
      'Carne de cerdo o pollo',
      'Arroz',
      'Papas',
      'Hierbabuena',
      'Tomate, cebolla, chiltoma (para el recado)',
      'Naranja agria',
      'Hojas de plátano',
      'Achiote',
      'Sal y pimienta'
    ],
    instructions: [
      'Preparar la masa con achiote y sal.',
      'Marinar la carne con naranja agria y especias.',
      'Preparar el recado con vegetales sofritos.',
      'Extender las hojas de plátano, colocar la masa, luego la carne, arroz, papas y recado.',
      'Envolver cuidadosamente y amarrar.',
      'Cocer en agua hirviendo por varias horas.'
    ],
    image: 'https://placehold.co/150x100/f7971e/ffffff?text=Nacatamal'
  }
];

initializeDataFile(usersFilePath, []);
initializeDataFile(recipesFilePath, initialRecipesData);
initializeDataFile(cookbookFilePath, {}); // { userId: [recipeId1, recipeId2], ... }

// Function to read data from a JSON file
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Function to write data to a JSON file
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid or expired token
    req.user = user; // Store the JWT payload in req.user
    next();
  });
};

// --- Authentication Routes ---

// Register User
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const users = readData(usersFilePath);

  if (!users) return res.status(500).send('Error reading user data.');

  if (users.find(u => u.email === email)) {
    return res.status(409).send('User already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword };
  users.push(newUser);

  if (writeData(usersFilePath, users)) {
    res.status(201).send('User registered successfully.');
  } else {
    res.status(500).send('Error registering user.');
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readData(usersFilePath);

  if (!users) return res.status(500).send('Error reading user data.');

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).send('Invalid credentials.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send('Invalid credentials.');
  }

  // Generate JWT
  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token: accessToken, userId: user.id });
});

// --- Recipe Routes (Protected) ---

// Get all recipes
app.get('/api/recipes', authenticateToken, (req, res) => {
  const recipes = readData(recipesFilePath);
  if (!recipes) return res.status(500).send('Error reading recipes.');
  res.json(recipes);
});

// Get a recipe by ID
app.get('/api/recipes/:id', authenticateToken, (req, res) => {
  const recipes = readData(recipesFilePath);
  if (!recipes) return res.status(500).send('Error reading recipes.');
  const recipe = recipes.find(r => r.id === req.params.id);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).send('Recipe not found.');
  }
});

// Add a new recipe
app.post('/api/recipes', authenticateToken, (req, res) => {
  const recipes = readData(recipesFilePath);
  if (!recipes) return res.status(500).send('Error reading recipes.');

  const newRecipe = { id: Date.now().toString(), ...req.body };
  recipes.push(newRecipe);

  if (writeData(recipesFilePath, recipes)) {
    res.status(201).json(newRecipe);
  } else {
    res.status(500).send('Error adding recipe.');
  }
});

// Update an existing recipe
app.put('/api/recipes/:id', authenticateToken, (req, res) => {
  let recipes = readData(recipesFilePath);
  if (!recipes) return res.status(500).send('Error reading recipes.');

  const index = recipes.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    recipes[index] = { ...recipes[index], ...req.body, id: req.params.id }; // Ensures the ID doesn't change
    if (writeData(recipesFilePath, recipes)) {
      res.json(recipes[index]);
    } else {
      res.status(500).send('Error updating recipe.');
    }
  } else {
    res.status(404).send('Recipe not found.');
  }
});

// Delete a recipe
app.delete('/api/recipes/:id', authenticateToken, (req, res) => {
  let recipes = readData(recipesFilePath);
  if (!recipes) return res.status(500).send('Error reading recipes.');

  const initialLength = recipes.length;
  recipes = recipes.filter(r => r.id !== req.params.id);

  if (initialLength === recipes.length) {
    return res.status(404).send('Recipe not found.');
  }

  // Also remove from users' cookbooks
  const cookbooks = readData(cookbookFilePath);
  if (cookbooks) {
    for (const userId in cookbooks) {
      cookbooks[userId] = cookbooks[userId].filter(recipeId => recipeId !== req.params.id);
    }
    writeData(cookbookFilePath, cookbooks);
  }

  if (writeData(recipesFilePath, recipes)) {
    res.status(204).send(); // No Content
  } else {
    res.status(500).send('Error deleting recipe.');
  }
});

// --- User Cookbook Routes (Protected) ---

// Get a user's cookbook
app.get('/api/user/cookbook', authenticateToken, (req, res) => {
  const cookbooks = readData(cookbookFilePath);
  if (!cookbooks) return res.status(500).send('Error reading cookbooks.');

  const userCookbookIds = cookbooks[req.user.id] || [];
  const allRecipes = readData(recipesFilePath);
  if (!allRecipes) return res.status(500).send('Error reading recipes.');

  // Filter full recipes based on the user's cookbook IDs
  const userCookbookRecipes = allRecipes.filter(recipe => userCookbookIds.includes(recipe.id));

  res.json(userCookbookRecipes);
});

// Add a recipe to a user's cookbook
app.post('/api/user/cookbook/add', authenticateToken, (req, res) => {
  const { recipeId } = req.body;
  const cookbooks = readData(cookbookFilePath);
  if (!cookbooks) return res.status(500).send('Error reading cookbooks.');

  if (!cookbooks[req.user.id]) {
    cookbooks[req.user.id] = [];
  }

  if (!cookbooks[req.user.id].includes(recipeId)) {
    cookbooks[req.user.id].push(recipeId);
    if (writeData(cookbookFilePath, cookbooks)) {
      res.status(200).send('Recipe added to cookbook.');
    } else {
      res.status(500).send('Error adding recipe to cookbook.');
    }
  } else {
    res.status(200).send('Recipe is already in the cookbook.');
  }
});

// Remove a recipe from a user's cookbook
app.post('/api/user/cookbook/remove', authenticateToken, (req, res) => {
  const { recipeId } = req.body;
  const cookbooks = readData(cookbookFilePath);
  if (!cookbooks) return res.status(500).send('Error reading cookbooks.');

  if (cookbooks[req.user.id]) {
    const initialLength = cookbooks[req.user.id].length;
    cookbooks[req.user.id] = cookbooks[req.user.id].filter(id => id !== recipeId);
    if (initialLength === cookbooks[req.user.id].length) {
      return res.status(404).send('Recipe not found in cookbook.');
    }
    if (writeData(cookbookFilePath, cookbooks)) {
      res.status(200).send('Recipe removed from cookbook.');
    } else {
      res.status(500).send('Error removing recipe from cookbook.');
    }
  } else {
    res.status(404).send('User cookbook not found.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node JS server running http://localhost:${PORT}`);
  console.log(`Make sure your React app is pointing to this url.`);
});
