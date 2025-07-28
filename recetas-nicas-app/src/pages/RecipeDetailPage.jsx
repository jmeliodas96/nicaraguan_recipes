import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

export const RecipeDetailPage = ({ selectedRecipe, navigateTo, handleAddRemoveCookbook, handleEditRecipe, handleDeleteRecipe, handleAddIngredientsToList }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [inCookbook, setInCookbook] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkCookbookStatus = async () => {
      if (currentUser) {
        const status = await apiService.isRecipeInCookbook(selectedRecipe.id);
        if (isMounted) {
          setInCookbook(status);
        }
      } else {
        if (isMounted) setInCookbook(false);
      }
    };
    checkCookbookStatus();

    return () => {
      isMounted = false;
    };
  }, [selectedRecipe.id, currentUser]);

  const handleAddRemoveClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      console.log("Please login to add/remove recipes from your cookbook.");
      return;
    }
    await handleAddRemoveCookbook(selectedRecipe);
    if (currentUser) {
      setInCookbook(await apiService.isRecipeInCookbook(selectedRecipe.id));
    }
  };

  return (
    <div className="screen-background flex flex-col w-full h-full rounded-b-xl p-4 overflow-y-auto">
      <button
        onClick={() => navigateTo('recipesList')}
        className="self-start text-blue-300 hover:text-blue-100 mb-4 transition"
      >
        {t.backToRecipes}
      </button>
      <h2 className="text-3xl font-bold mb-4 text-center">{selectedRecipe.name}</h2>
      <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-48 object-cover rounded-lg mb-4" />

      {selectedRecipe.premium && !inCookbook && (
        <div className="bg-yellow-800 text-yellow-100 p-3 rounded-md mb-4 text-center">
          {t.premiumRecipeMessage}
        </div>
      )}

      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <h3 className="text-xl font-semibold mb-2">{t.ingredients}</h3>
        <ul className="list-disc list-inside text-gray-300">
          {selectedRecipe.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <h3 className="text-xl font-semibold mb-2">{t.instructions}</h3>
        <ol className="list-decimal list-inside text-gray-300">
          {selectedRecipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      {currentUser && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleAddRemoveClick}
            className={`flex-grow px-6 py-3 rounded-full text-white font-bold transition-transform transform hover:scale-105 ${inCookbook ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {inCookbook ? t.removeFromCookbook : t.addToCookbook}
          </button>
          <button
            onClick={() => handleAddIngredientsToList(selectedRecipe.ingredients)}
            className="flex-grow px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-transform transform hover:scale-105"
          >
            {t.addIngredientsToList}
          </button>
        </div>
      )}
      {currentUser && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button
            onClick={() => handleEditRecipe(selectedRecipe)}
            className="flex-grow px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            {t.editRecipe}
          </button>
          <button
            onClick={() => handleDeleteRecipe(selectedRecipe.id, selectedRecipe.name)}
            className="flex-grow px-6 py-3 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-700 transition-transform transform hover:scale-105"
          >
            {t.deleteRecipe}
          </button>
        </div>
      )}
    </div>
  );
};