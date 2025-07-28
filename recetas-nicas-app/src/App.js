import React, { useState, useEffect, useCallback  } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'; 
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { apiService } from './services/apiService';
import { Header } from './components/layout/Header';
import { AuthForm } from './components/auth/AuthForm';

// Pages
import { RecipesListPage } from './pages/RecipesListPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CookbookPage } from './pages/CookbookPage';


// --- Main App Component
const AppContent = () => {
  const { currentUser, userId, loadingAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState('recipesList');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [rewardedAdReady, setRewardedAdReady] = useState(false);
  const [interstitialAdReady, setInterstitialAdReady] = useState(false);
  const [showAdMessage, setShowAdMessage] = useState('');
  const [cookbook, setCookbook] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deleteRecipeInfo, setDeleteRecipeInfo] = useState({ id: null, name: '' });

  const { t } = useLanguage();

  // Load all recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipes = await apiService.getAllRecipes();
        setAllRecipes(recipes);
      } catch (error) {
        console.error("Error fetching all recipes:", error);
        // If unauthenticated, it's expected to fail. Show login message.
        if (error.message.includes('No authentication token')) {
          setShowAdMessage("Por favor, inicia sesión para ver las recetas.");
          setTimeout(() => setShowAdMessage(''), 3000);
        } else {
          setShowAdMessage(`Error: ${error.message}`);
          setTimeout(() => setShowAdMessage(''), 3000);
        }
      }
    };
    fetchRecipes();
  }, [currentUser]); // Re-fetch when user logs in/out

  // Load user's cookbook when userId changes
  useEffect(() => {
    const fetchCookbook = async () => {
      if (userId) {
        try {
          const userCookbook = await apiService.getCookbook();
          setCookbook(userCookbook);
        } catch (error) {
          console.error("Error fetching cookbook:", error);
          // If unauthenticated, it's expected to fail.
        }
      } else {
        setCookbook([]); // Clear cookbook if no user
      }
    };
    fetchCookbook();
  }, [userId]); // Re-fetch when userId changes

  // --- AdMob Integration Concepts (Conceptual Code) ---
  const BannerAd = () => (
    <div className="w-full bg-gray-700 text-white text-center py-2 text-sm">
      [Placeholder: Anuncio Banner AdMob]
    </div>
  );

  useEffect(() => {
    const loadInterstitialAd = () => {
      console.log('Concepto: Cargando Anuncio Intersticial...');
      setTimeout(() => {
        setInterstitialAdReady(true);
        console.log('Concepto: Anuncio Intersticial Cargado.');
      }, 2000);
    };
    loadInterstitialAd();
  }, []);

  const showInterstitialAd = useCallback(() => {
    if (interstitialAdReady) {
      console.log('Concepto: Mostrando Anuncio Intersticial...');
      setShowAdMessage(t.adInterstitialLoading);
      setTimeout(() => {
        setShowAdMessage('');
        setInterstitialAdReady(false);
        console.log('Concepto: Anuncio Intersticial Descartado.');
      }, 3000);
    } else {
      setShowAdMessage(t.adInterstitialNotReady);
      console.log('Concepto: Anuncio Intersticial no listo.');
    }
  }, [interstitialAdReady, t]);

  useEffect(() => {
    const loadRewardedAd = () => {
      console.log('Concepto: Cargando Anuncio Recompensado...');
      setTimeout(() => {
        setRewardedAdReady(true);
        console.log('Concepto: Anuncio Recompensado Cargado.');
      }, 2500);
    };
    loadRewardedAd();
  }, []);

  const showRewardedAd = useCallback(async (recipeId, recipeName) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to use rewarded ads.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }

    if (rewardedAdReady) {
      console.log('Concepto: Mostrando Anuncio Recompensado...');
      setShowAdMessage(t.adRewardedLoading);
      setTimeout(async () => {
        try {
          const isInCookbook = await apiService.isRecipeInCookbook(recipeId);
          if (!isInCookbook) {
            await apiService.addToCookbook(recipeId);
            const updatedCookbook = await apiService.getCookbook(); // Re-fetch to update state
            setCookbook(updatedCookbook);
            setShowAdMessage(t.adRewardedComplete(recipeName));
          } else {
            setShowAdMessage(t.adRewardedAlreadyInCookbook);
          }
        } catch (error) {
          setShowAdMessage(`Error al añadir receta: ${error.message}`);
        }
        setRewardedAdReady(false);
        console.log('Concepto: Anuncio Recompensado Completado, Recompensa Otorgada.');
        setTimeout(() => setShowAdMessage(''), 1500);
      }, 4000);
    } else {
      setShowAdMessage(t.adRewardedNotReady);
      console.log('Concepto: Anuncio Recompensado no listo.');
    }
  }, [rewardedAdReady, currentUser, t]);

  // --- App Navigation & Logic ---
  const navigateTo = useCallback((page, recipe = null) => {
    setCurrentPage(page);
    setSelectedRecipe(recipe);
    setShowAdMessage(''); // Clear any ad messages
    setDeleteRecipeInfo({ id: null, name: '' }); // Clear delete info
    setShowConfirmationModal(false); // Hide confirmation modal

    if (page === 'recipeDetail' && recipe) {
      showInterstitialAd();
    }
  }, [showInterstitialAd]);

  const handleAddRemoveCookbook = useCallback(async (recipe) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to manage your cookbook.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }

    try {
      const isInCookbook = await apiService.isRecipeInCookbook(recipe.id);
      if (isInCookbook) {
        await apiService.removeFromCookbook(recipe.id);
        setShowAdMessage(t.recipeRemoved(recipe.name));
      } else {
        if (recipe.premium) {
          showRewardedAd(recipe.id, recipe.name);
          return; // Don't add directly, wait for ad reward
        } else {
          await apiService.addToCookbook(recipe.id);
          setShowAdMessage(t.recipeAdded(recipe.name));
        }
      }
      const updatedCookbook = await apiService.getCookbook(); // Re-fetch to update state
      setCookbook(updatedCookbook);
    } catch (error) {
      setShowAdMessage(`Error: ${error.message}`);
    }
    setTimeout(() => setShowAdMessage(''), 1500);
  }, [showRewardedAd, currentUser, t]);

  const handleAddNewRecipe = useCallback(() => {
    if (!currentUser) {
      setShowAdMessage("Please log in to add new recipes.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }
    navigateTo('recipeForm', null); // Navigate to form page for new recipe
  }, [navigateTo, currentUser]);

  const handleEditRecipe = useCallback((recipe) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to edit recipes.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }
    navigateTo('recipeForm', recipe); // Navigate to form page for editing
  }, [navigateTo, currentUser]);

  const handleDeleteRecipe = useCallback((id, name) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to delete recipes.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }
    setDeleteRecipeInfo({ id, name });
    setShowConfirmationModal(true);
  }, [currentUser]);

  const confirmDelete = useCallback(async () => {
    const { id, name } = deleteRecipeInfo;
    if (id && currentUser) {
      try {
        await apiService.deleteRecipe(id);
        setShowAdMessage(t.recipeDeleted(name));
        // Re-fetch all recipes and cookbook after deletion
        setAllRecipes(await apiService.getAllRecipes());
        if (userId) {
          setCookbook(await apiService.getCookbook());
        }
        setTimeout(() => setShowAdMessage(''), 1500);
        navigateTo('recipesList'); // Go back to list after deletion
      } catch (error) {
        setShowAdMessage(`Error al eliminar: ${error.message}`);
        setTimeout(() => setShowAdMessage(''), 3000);
      }
    }
    setShowConfirmationModal(false);
    setDeleteRecipeInfo({ id: null, name: '' });
  }, [deleteRecipeInfo, currentUser, t, navigateTo, userId]);

  const cancelDelete = useCallback(() => {
    setShowConfirmationModal(false);
    setDeleteRecipeInfo({ id: null, name: '' });
  }, []);

  const handleSaveRecipe = useCallback(async (recipeData) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to save recipes.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }

    try {
      if (recipeData.id) {
        // Editing existing recipe
        await apiService.updateRecipe(recipeData.id, recipeData);
      } else {
        // Adding new recipe
        await apiService.addRecipe(recipeData);
      }
      setShowAdMessage(t.recipeSaved(recipeData.name));
      setAllRecipes(await apiService.getAllRecipes()); // Re-fetch all recipes to update list
      setTimeout(() => setShowAdMessage(''), 1500);
      navigateTo('recipesList'); // Go back to list after saving
    } catch (error) {
      setShowAdMessage(`Error al guardar: ${error.message}`);
      setTimeout(() => setShowAdMessage(''), 3000);
    }
  }, [currentUser, t, navigateTo]);

  const handleCancelForm = useCallback(() => {
    navigateTo('recipesList'); // Go back to list
  }, [navigateTo]);

  const handleAddIngredientsToList = useCallback((ingredients) => {
    if (!currentUser) {
      setShowAdMessage("Please log in to add ingredients to your list.");
      setTimeout(() => setShowAdMessage(''), 1500);
      return;
    }
    // This is a conceptual implementation. In a real app, you'd integrate with a shopping list feature.
    console.log("Adding ingredients to list:", ingredients);
    setShowAdMessage(t.ingredientsAddedToList);
    setTimeout(() => setShowAdMessage(''), 2000);
  }, [currentUser, t]);

  // If auth is still loading, show a loading indicator
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-2xl">
        Cargando autenticación...
      </div>
    );
  }

  // --- UI Rendering ---
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start text-white p-4 sm:p-6 md:p-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .screen-background {
          background: linear-gradient(to bottom right, #4a00e0, #8e2de2);
        }
        .recipe-card {
          background-color: #2a2a2a;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          flex-direction: column; /* Stack on small screens */
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }
        @media (min-width: 640px) { /* sm breakpoint */
          .recipe-card {
            flex-direction: row; /* Row on larger screens */
            align-items: center;
          }
        }
        .recipe-card:hover {
          transform: translateY(-5px);
        }
        .recipe-card img {
          width: 100%; /* Full width on small screens */
          height: auto;
          max-width: 150px; /* Max width for image on larger screens */
        }
        @media (min-width: 640px) { /* sm breakpoint */
          .recipe-card img {
            width: 96px; /* Fixed width for image on larger screens */
            height: 96px;
          }
        }
      `}</style>

      {/* Main content wrapper */}
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg flex flex-col min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]">
        <Header onNavigate={navigateTo} />

        {/* User ID Display */}
        {currentUser && (
          <div className="w-full bg-gray-700 text-gray-300 text-center py-1 text-xs sm:text-sm rounded-b-lg">
            {t.loggedInAs} {currentUser.email} ({t.userId} {currentUser.id})
          </div>
        )}
        {!currentUser && !loadingAuth && currentPage !== 'auth' && (
          <div className="w-full bg-red-700 text-white text-center py-1 text-xs sm:text-sm rounded-b-lg">
            {t.loginToViewCookbook}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-grow w-full flex flex-col p-4 overflow-y-auto bg-gray-800 rounded-b-xl">
          {!currentUser && currentPage !== 'auth' ? (
            <AuthForm navigateTo={navigateTo} />
          ) : (
            <>
              {currentPage === 'recipesList' && (
                <RecipesListPage
                  allRecipes={allRecipes}
                  navigateTo={navigateTo}
                  handleAddRemoveCookbook={handleAddRemoveCookbook}
                  handleEditRecipe={handleEditRecipe}
                  handleDeleteRecipe={handleDeleteRecipe}
                />
              )}

              {currentPage === 'recipeDetail' && selectedRecipe && (
                <RecipeDetailPage
                  selectedRecipe={selectedRecipe}
                  navigateTo={navigateTo}
                  handleAddRemoveCookbook={handleAddRemoveCookbook}
                  handleEditRecipe={handleEditRecipe}
                  handleDeleteRecipe={handleDeleteRecipe}
                  handleAddIngredientsToList={handleAddIngredientsToList}
                />
              )}

              {currentPage === 'cookbook' && (
                <CookbookPage
                  cookbook={cookbook}
                  navigateTo={navigateTo}
                  handleAddRemoveCookbook={handleAddRemoveCookbook}
                />
              )}

              {currentPage === 'recipeForm' && (
                <RecipeFormPage
                  editingRecipe={selectedRecipe}
                  handleSaveRecipe={handleSaveRecipe}
                  handleCancelForm={handleCancelForm}
                />
              )}

              {currentPage === 'auth' && (
                <AuthForm navigateTo={navigateTo} />
              )}
            </>
          )}
        </div>

        {/* AdMob Message Display */}
        {showAdMessage && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-lg shadow-xl z-20 animate-pulse">
            {showAdMessage}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <ConfirmationModal
            message={t.confirmDelete}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            confirmText={t.deleteRecipe}
            cancelText={t.cancel}
          />
        )}

        {/* Bottom Banner Ad Placeholder */}
        <div className="w-full bg-gray-800 p-2 flex justify-center items-center z-10 rounded-b-xl">
          <BannerAd />
        </div>
      </div>
    </div>
  );
};

// The actual App component that will be exported and render the providers
const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
