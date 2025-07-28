// --- src/services/apiService.js ---
// This service handles all communication with the Node.js backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Make sure this matches your Node.js server port

export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token) => localStorage.setItem('authToken', token);
export const removeAuthToken = () => localStorage.removeItem('authToken');
export const getUserId = () => localStorage.getItem('userId');
export const setUserId = (id) => localStorage.setItem('userId', id);
export const removeUserId = () => localStorage.removeItem('userId');


const apiRequest = async (endpoint, method = 'GET', data = null, needsAuth = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (needsAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (endpoint !== '/login' && endpoint !== '/register') {
      // For protected routes, if no token, throw an error
      throw new Error('No authentication token found. Please log in.');
    }
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Something went wrong with the API request.');
    }
    // Handle 204 No Content for DELETE requests
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const apiService = {
  // Auth
  register: async (email, password) => {
    return apiRequest('/register', 'POST', { email, password }, false);
  },
  login: async (email, password) => {
    const data = await apiRequest('/login', 'POST', { email, password }, false);
    if (data && data.token) {
      setAuthToken(data.token);
      setUserId(data.userId);
    }
    return data;
  },
  logout: () => {
    removeAuthToken();
    removeUserId();
  },

  // Recipes (Public)
  getAllRecipes: async () => {
    return apiRequest('/recipes', 'GET');
  },
  addRecipe: async (recipe) => {
    return apiRequest('/recipes', 'POST', recipe);
  },
  updateRecipe: async (id, recipe) => {
    return apiRequest(`/recipes/${id}`, 'PUT', recipe);
  },
  deleteRecipe: async (id) => {
    return apiRequest(`/recipes/${id}`, 'DELETE');
  },

  // User Cookbook
  getCookbook: async () => {
    return apiRequest('/user/cookbook', 'GET');
  },
  addToCookbook: async (recipeId) => {
    return apiRequest('/user/cookbook/add', 'POST', { recipeId });
  },
  removeFromCookbook: async (recipeId) => {
    return apiRequest('/user/cookbook/remove', 'POST', { recipeId });
  },
  isRecipeInCookbook: async (recipeId) => {
    try {
      const cookbook = await apiService.getCookbook();
      return cookbook.some(recipe => recipe.id === recipeId);
    } catch (error) {
      console.error("Error checking if recipe is in cookbook:", error);
      return false;
    }
  }
};