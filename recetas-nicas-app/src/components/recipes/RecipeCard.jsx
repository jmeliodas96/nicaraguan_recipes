import React, { useState, useEffect } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

// --- src/components/recipes/RecipeCard.jsx ---
export const RecipeCard = ({ recipe, onViewDetail, onAddRemoveCookbook, isCookbookView, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const { userId } = useAuth();

  const [inCookbook, setInCookbook] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkCookbookStatus = async () => {
      if (userId) { // Only check if userId is available
        const status = await apiService.isRecipeInCookbook(recipe.id);
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
  }, [recipe.id, userId]);

  const handleAddRemoveClick = async (e) => {
    e.stopPropagation();
    await onAddRemoveCookbook(recipe);
    // Re-check status after action to reflect immediate change
    if (userId) {
      setInCookbook(await apiService.isRecipeInCookbook(recipe.id));
    }
  };

  return (
    <div className="recipe-card w-full" onClick={() => onViewDetail(recipe)}>
      <img src={recipe.image} alt={recipe.name} className="w-full h-auto rounded-md object-cover sm:w-24 sm:h-24" />
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-xl font-semibold">{recipe.name} {recipe.premium && <span className="text-yellow-300 text-sm">{t.premium}</span>}</h3>
        <p className="text-gray-400 text-sm">{recipe.ingredients[0]}...</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
        {/* Add/Remove from Cookbook button */}
        <button
          onClick={handleAddRemoveClick}
          className={`px-3 py-1 rounded-full text-sm font-semibold ${inCookbook ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
        >
          {inCookbook ? t.remove : t.add}
        </button>
        {/* Edit and Delete buttons (only for main recipe list, not cookbook view) */}
        {!isCookbookView && onDelete && onEdit && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
              className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 hover:bg-green-600 text-white transition"
            >
              {t.editRecipe}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(recipe.id, recipe.name); }}
              className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500 hover:bg-gray-600 text-white transition"
            >
              {t.deleteRecipe}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
