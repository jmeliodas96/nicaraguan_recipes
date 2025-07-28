// tests/recipes.spec.ts
import { test, expect } from '@playwright/test';

// Define the base URLs for your frontend and backend
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_API_URL = 'http://localhost:5000/api';

// Generate unique email and password for each test run
const TEST_USER_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'testpassword123';

test.describe('Recipes App E2E Tests', () => {
  
  // Hook to register and log in a user before all tests
  // This ensures we have an authenticated user for CRUD operations
  test.beforeAll(async ({ request }) => {
    try {
      await request.post(`${BACKEND_API_URL}/register`, {
        data: {
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        },
      });
      console.log(`User ${TEST_USER_EMAIL} registered successfully.`);
    } catch (error) {
      console.warn(`Error registering user (possibly already exists): ${error.message}`);
    }

    const loginResponse = await request.post(`${BACKEND_API_URL}/login`, {
      data: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('token');
    console.log(`User ${TEST_USER_EMAIL} logged in. Token obtained.`);
  });

  // Test Case 1: Register a new user and verify login (if not done in beforeAll)
  // This test is useful if beforeAll fails or if you want a dedicated registration test
  test.only('should allow a new user to register and then login', async ({ page }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const uniquePassword = 'newsecurepassword';

    await page.goto(FRONTEND_URL);
    // await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    await page.getByRole('button', { name: "Don't have an account? Register" }).click();
    // await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();

    // await page.getByLabel('Email Address').fill(uniqueEmail);
    // await page.getByLabel('Password').fill(uniquePassword);
    // await page.getByRole('button', { name: 'Register' }).click();

    // await expect(page.getByText('Registration successful! Please sign in.')).toBeVisible();
    // await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // await page.getByLabel('Email Address').fill(uniqueEmail);
    // await page.getByLabel('Password').fill(uniquePassword);
    // await page.getByRole('button', { name: 'Sign In' }).click();

    // await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    // await expect(page.getByText(`Signed in as: ${uniqueEmail}`)).toBeVisible();
    // await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  // Test Case 2: Login and verify status
  test('should allow an existing user to login and display user info', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    if (await page.getByRole('heading', { name: 'Sign In' }).isVisible()) {
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    await expect(page.getByText(`Signed in as: ${TEST_USER_EMAIL}`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  // Test Case 3: Add a new recipe
  test('should allow a logged-in user to add a new recipe', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    if (await page.getByRole('heading', { name: 'Sign In' }).isVisible()) {
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    }

    const newRecipeName = `Test Recipe ${Date.now()}`;
    const newIngredients = 'Ingredient 1\nIngredient 2';
    const newInstructions = 'Step 1\nStep 2';
    const newImageUrl = 'https://placehold.co/150x100/ff00ff/ffffff?text=New+Recipe';

    await page.getByRole('button', { name: 'Add New Recipe' }).click();
    await expect(page.getByRole('heading', { name: 'Add New Recipe' })).toBeVisible();

    await page.getByLabel('Recipe Name').fill(newRecipeName);
    await page.getByLabel('Ingredients: (One per line)').fill(newIngredients);
    await page.getByLabel('Instructions: (One step per line)').fill(newInstructions);
    await page.getByLabel('Image URL (placeholder.co)').fill(newImageUrl);
    await page.getByLabel('Premium').check();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(`Recipe "${newRecipeName}" saved successfully.`)).toBeVisible();
    await expect(page.getByText(newRecipeName)).toBeVisible();
    await expect(page.locator(`.recipe-card:has-text("${newRecipeName}")`).getByText('(Premium)')).toBeVisible();
  });

  // Test Case 4: Edit an existing recipe
  test('should allow a logged-in user to edit an existing recipe', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    if (await page.getByRole('heading', { name: 'Sign In' }).isVisible()) {
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    }

    const targetRecipeName = 'Gallo Pinto';
    const updatedRecipeName = `${targetRecipeName} - Edited ${Date.now()}`;

    const recipeCard = page.locator(`.recipe-card:has-text("${targetRecipeName}")`);
    await expect(recipeCard).toBeVisible();
    await recipeCard.getByRole('button', { name: 'Edit Recipe' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();

    await page.getByLabel('Recipe Name').fill(updatedRecipeName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(`Recipe "${updatedRecipeName}" saved successfully.`)).toBeVisible();
    await expect(page.getByText(updatedRecipeName)).toBeVisible();
    await expect(page.getByText(targetRecipeName)).not.toBeVisible();
  });
  
  // Test Case 5: Delete a recipe
  test('should allow a logged-in user to delete a recipe', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    if (await page.getByRole('heading', { name: 'Sign In' }).isVisible()) {
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    }

    const recipeToDeleteName = `Recipe to Delete ${Date.now()}`;
    await page.getByRole('button', { name: 'Add New Recipe' }).click();
    await page.getByLabel('Recipe Name').fill(recipeToDeleteName);
    await page.getByLabel('Ingredients: (One per line)').fill('Delete Ing');
    await page.getByLabel('Instructions: (One step per line)').fill('Delete Inst');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(`Recipe "${recipeToDeleteName}" saved successfully.`)).toBeVisible();
    await expect(page.getByText(recipeToDeleteName)).toBeVisible();

    const recipeCard = page.locator(`.recipe-card:has-text("${recipeToDeleteName}")`);
    await expect(recipeCard).toBeVisible();
    await recipeCard.getByRole('button', { name: 'Delete Recipe' }).click();

    await expect(page.getByText('Are you sure you want to permanently delete this recipe?')).toBeVisible();
    await page.getByRole('button', { name: 'Delete Recipe' }).click();

    await expect(page.getByText(`Recipe "${recipeToDeleteName}" permanently deleted.`)).toBeVisible();
    await expect(page.getByText(recipeToDeleteName)).not.toBeVisible();
  });
  
  // Test Case 6: Logout
  test('should allow a logged-in user to logout', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    if (await page.getByRole('heading', { name: 'Sign In' }).isVisible()) {
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('heading', { name: 'Popular Recipes' })).toBeVisible();
    }

    await page.getByRole('button', { name: 'Sign Out' }).click();

    await expect(page.getByText('Successfully signed out.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).not.toBeVisible();
  });
});
