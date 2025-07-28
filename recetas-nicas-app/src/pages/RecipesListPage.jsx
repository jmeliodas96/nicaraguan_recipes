import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext';
import { RecipeCard } from '../components/recipes/RecipeCard';

export const RecipesListPage = ({ allRecipes, navigateTo, handleAddRemoveCookbook, handleEditRecipe, handleDeleteRecipe }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  return (
    <div className="screen-background flex flex-col items-center justify-start w-full h-full rounded-b-xl space-y-4 p-4">
      <h2 className="text-3xl font-bold mb-4 text-center">{t.popularRecipes}</h2>
      {currentUser && (
        <button
          onClick={() => navigateTo('recipeForm')}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 mb-4"
        >
          {t.addNewRecipe}
        </button>
      )}
      {allRecipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onViewDetail={navigateTo}
          onAddRemoveCookbook={handleAddRemoveCookbook}
          isCookbookView={false}
          onEdit={currentUser ? handleEditRecipe : null}
          onDelete={currentUser ? handleDeleteRecipe : null}
        />
      ))}
    </div>
  );
};