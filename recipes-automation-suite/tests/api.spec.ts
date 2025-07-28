// tests/api.spec.ts
import { test, expect, APIResponse } from '@playwright/test';

// Define la URL base de tu backend API
const BACKEND_API_URL = 'http://localhost:5000/api';

// Variables para almacenar datos de prueba entre tests
let authToken: string;
let testUserId: string;
let createdRecipeId: string; // Para almacenar la ID de la receta creada en un test y usarla en otros

test.describe('Recipes API Automation Tests', () => {

  // --- Setup: Register and Login a test user ---
  test.beforeAll(async ({ request }) => {
    const uniqueEmail = `api_test_user_${Date.now()}@example.com`;
    const password = 'api_test_password123';

    // 1. Register a new user
    let registerResponse: APIResponse;
    try {
      registerResponse = await request.post(`${BACKEND_API_URL}/register`, {
        data: { email: uniqueEmail, password: password },
      });
      expect(registerResponse.ok()).toBeTruthy();
      console.log(`Registered user: ${uniqueEmail}`);
    } catch (error) {
      // If user already exists, it's fine for beforeAll, proceed to login
      console.warn(`Registration failed (might already exist): ${error.message}`);
    }

    // 2. Login the user to get a token
    const loginResponse = await request.post(`${BACKEND_API_URL}/login`, {
      data: { email: uniqueEmail, password: password },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('token');
    expect(loginData).toHaveProperty('userId');

    authToken = loginData.token;
    testUserId = loginData.userId;
    console.log(`Logged in user ${uniqueEmail} with token: ${authToken.substring(0, 10)}...`);
    console.log(`Test User ID: ${testUserId}`);
  });

  // --- Teardown: Clean up test data ---
  test.afterAll(async ({ request }) => {
    // Optional: Delete the created recipe if it exists
    if (createdRecipeId) {
      try {
        await request.delete(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log(`Cleaned up recipe with ID: ${createdRecipeId}`);
      } catch (error) {
        console.warn(`Failed to delete recipe ${createdRecipeId} during cleanup: ${error.message}`);
      }
    }

    // Note: Deleting users is more complex with simple JSON files and bcrypt.
    // In a real database, you would implement a DELETE /api/users/:id endpoint.
    console.log('Test cleanup complete. User data might persist in JSON file.');
  });

  // --- API Test Cases ---

  // Test 1: Positive - Get all recipes (authenticated)
  test('should get all recipes for an authenticated user', async ({ request }) => {
    const response = await request.get(`${BACKEND_API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const recipes = await response.json();
    expect(Array.isArray(recipes)).toBeTruthy();
    expect(recipes.length).toBeGreaterThanOrEqual(3); // Assuming initial data
    expect(recipes[0]).toHaveProperty('id');
    expect(recipes[0]).toHaveProperty('name');
  });

  // Test 2: Negative - Get all recipes (unauthenticated)
  test('should not get all recipes for an unauthenticated user', async ({ request }) => {
    const response = await request.get(`${BACKEND_API_URL}/recipes`); // No auth header
    expect(response.status()).toBe(401); // Unauthorized
    expect(await response.text()).toBe('Unauthorized'); // Default Express message for 401
  });

  // Test 3: Positive - Create a new recipe
  test('should create a new recipe', async ({ request }) => {
    const newRecipe = {
      name: `Playwright Test Recipe ${Date.now()}`,
      ingredients: ['Test Ing 1', 'Test Ing 2'],
      instructions: ['Test Step 1', 'Test Step 2'],
      image: 'https://placehold.co/150x100/aabbcc/ffffff?text=API+Test',
      premium: false,
    };

    const response = await request.post(`${BACKEND_API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: newRecipe,
    });

    expect(response.status()).toBe(201); // Created
    const createdData = await response.json();
    expect(createdData).toHaveProperty('id');
    expect(createdData.name).toBe(newRecipe.name);
    createdRecipeId = createdData.id; // Store ID for later tests
  });

  // Test 4: Negative - Create a new recipe (unauthenticated)
  test('should not create a new recipe for an unauthenticated user', async ({ request }) => {
    const newRecipe = {
      name: `Unauthorized Recipe ${Date.now()}`,
      ingredients: ['Ing'],
      instructions: ['Step'],
      image: 'https://placehold.co/150x100/aabbcc/ffffff?text=API+Test',
      premium: false,
    };

    const response = await request.post(`${BACKEND_API_URL}/recipes`, {
      data: newRecipe, // No auth header
    });
    expect(response.status()).toBe(401); // Unauthorized
  });

  // Test 5: Positive - Get a specific recipe by ID
  test('should get a specific recipe by ID', async ({ request }) => {
    // Ensure a recipe ID is available from a previous test (Test 3)
    expect(createdRecipeId).toBeDefined();

    const response = await request.get(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const recipe = await response.json();
    expect(recipe.id).toBe(createdRecipeId);
    expect(recipe).toHaveProperty('name');
  });

  // Test 6: Negative - Get a non-existent recipe
  test('should return 404 for a non-existent recipe ID', async ({ request }) => {
    const nonExistentId = 'nonexistent123';
    const response = await request.get(`${BACKEND_API_URL}/recipes/${nonExistentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
    expect(await response.text()).toBe('Recipe not found.'); // Backend's error message
  });

  // Test 7: Positive - Update an existing recipe
  test('should update an existing recipe', async ({ request }) => {
    expect(createdRecipeId).toBeDefined(); // Ensure recipe exists

    const updatedName = `Updated Test Recipe ${Date.now()}`;
    const updatedRecipeData = {
      name: updatedName,
      premium: true, // Change premium status
    };

    const response = await request.put(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: updatedRecipeData,
    });

    expect(response.ok()).toBeTruthy();
    const updatedRecipe = await response.json();
    expect(updatedRecipe.id).toBe(createdRecipeId);
    expect(updatedRecipe.name).toBe(updatedName);
    expect(updatedRecipe.premium).toBe(true);
  });

  // Test 8: Negative - Update a recipe (unauthenticated)
  test('should not update a recipe for an unauthenticated user', async ({ request }) => {
    expect(createdRecipeId).toBeDefined();
    const response = await request.put(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
      data: { name: 'Unauthorized Update' }, // No auth header
    });
    expect(response.status()).toBe(401); // Unauthorized
  });

  // Test 9: Positive - Add recipe to user's cookbook
  test('should add a recipe to the user\'s cookbook', async ({ request }) => {
    // Use an existing recipe ID, e.g., the first initial recipe
    const recipeIdToAdd = '1';

    const response = await request.post(`${BACKEND_API_URL}/user/cookbook/add`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { recipeId: recipeIdToAdd },
    });
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toBe('Receta añadida al libro.'); // Verify backend message

    // Verify it's in the cookbook
    const cookbookResponse = await request.get(`${BACKEND_API_URL}/user/cookbook`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(cookbookResponse.ok()).toBeTruthy();
    const cookbook = await cookbookResponse.json();
    expect(cookbook.some(r => r.id === recipeIdToAdd)).toBeTruthy();
  });

  // Test 10: Positive - Get user's cookbook
  test('should get the authenticated user\'s cookbook', async ({ request }) => {
    const response = await request.get(`${BACKEND_API_URL}/user/cookbook`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const cookbook = await response.json();
    expect(Array.isArray(cookbook)).toBeTruthy();
    // Expect at least the one added in Test 9
    expect(cookbook.length).toBeGreaterThanOrEqual(1);
    expect(cookbook[0]).toHaveProperty('name'); // Should return full recipe objects
  });

  // Test 11: Positive - Remove recipe from user's cookbook
  test('should remove a recipe from the user\'s cookbook', async ({ request }) => {
    // Use the same recipe ID added in Test 9
    const recipeIdToRemove = '1';

    const response = await request.post(`${BACKEND_API_URL}/user/cookbook/remove`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { recipeId: recipeIdToRemove },
    });
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toBe('Receta eliminada del libro.');

    // Verify it's no longer in the cookbook
    const cookbookResponse = await request.get(`${BACKEND_API_URL}/user/cookbook`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(cookbookResponse.ok()).toBeTruthy();
    const cookbook = await cookbookResponse.json();
    expect(cookbook.some(r => r.id === recipeIdToRemove)).toBeFalsy();
  });

  // Test 12: Positive - Delete a recipe (final cleanup of the created recipe)
  test('should delete the created recipe', async ({ request }) => {
    expect(createdRecipeId).toBeDefined(); // Ensure recipe ID is set

    const response = await request.delete(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(204); // No Content on successful deletion

    // Verify it's actually deleted by trying to get it
    const getResponse = await request.get(`${BACKEND_API_URL}/recipes/${createdRecipeId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(getResponse.status()).toBe(404); // Not Found
  });

  // Test 13: Negative - Delete a non-existent recipe
  test('should return 404 when trying to delete a non-existent recipe', async ({ request }) => {
    const nonExistentId = 'nonexistent_delete_123';
    const response = await request.delete(`${BACKEND_API_URL}/recipes/${nonExistentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
    expect(await response.text()).toBe('Receta no encontrada.');
  });
});
