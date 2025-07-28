import React, { useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";


// --- src/components/recipes/RecipeForm.jsx ---
export const RecipeForm = ({ initialRecipe, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialRecipe?.name || '');
  const [ingredients, setIngredients] = useState(initialRecipe?.ingredients?.join('\n') || '');
  const [instructions, setInstructions] = useState(initialRecipe?.instructions?.join('\n') || '');
  const [image, setImage] = useState(initialRecipe?.image || 'https://placehold.co/150x100/cccccc/000000?text=Recipe');
  const [premium, setPremium] = useState(initialRecipe?.premium || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecipe = {
      id: initialRecipe?.id, // Keep ID if editing
      name,
      ingredients: ingredients.split('\n').map(item => item.trim()).filter(item => item),
      instructions: instructions.split('\n').map(item => item.trim()).filter(item => item),
      image,
      premium,
    };
    onSave(newRecipe);
  };

  return (
    <div className="screen-background flex flex-col w-full h-full rounded-b-xl p-4 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">{initialRecipe ? t.editRecipe : t.addNewRecipe}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200">{t.recipeName}:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-200">{t.ingredients}: (Una por línea)</label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows="5"
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-200">{t.instructions}: (Un paso por línea)</label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows="7"
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-200">{t.recipeImageURL}:</label>
          <input
            type="text"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="premium"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="premium" className="ml-2 block text-sm text-gray-200">{t.premium.replace('(', '').replace(')', '')}</label>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
};