import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext';       
import { RecipeCard } from "../components/recipes/RecipeCard";


export const CookbookPage = ({ cookbook, navigateTo, handleAddRemoveCookbook }) => {
  const { t } = useLanguage();
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="screen-background flex flex-col items-center justify-center w-full h-full rounded-b-xl space-y-4 p-4 text-center">
        <p className="text-lg text-gray-300">Cargando libro de recetas...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="screen-background flex flex-col items-center justify-center w-full h-full rounded-b-xl space-y-4 p-4 text-center">
        <p className="text-lg text-gray-300">{t.loginToViewCookbook}</p>
        <button
          onClick={() => navigateTo('auth')}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          {t.login}
        </button>
      </div>
    );
  }

  return (
    <div className="screen-background flex flex-col items-center justify-start w-full h-full rounded-b-xl space-y-4 p-4">
      <h2 className="text-3xl font-bold mb-4 text-center">{t.cookbook}</h2>
      {cookbook.length === 0 ? (
        <p className="text-lg text-gray-300 text-center">{t.cookbookEmpty}</p>
      ) : (
        cookbook.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onViewDetail={navigateTo}
            onAddRemoveCookbook={handleAddRemoveCookbook}
            isCookbookView={true}
          />
        ))
      )}
    </div>
  );
};
