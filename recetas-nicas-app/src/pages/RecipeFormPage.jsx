import { RecipeForm } from "../components/recipes/RecipeForm";

export const RecipeFormPage = ({ editingRecipe, handleSaveRecipe, handleCancelForm }) => {
  return (
    <RecipeForm
      initialRecipe={editingRecipe}
      onSave={handleSaveRecipe}
      onCancel={handleCancelForm}
    />
  );
};