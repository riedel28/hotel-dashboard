import { useState } from 'react';

export function useCategoryModals() {
  const [pendingAddSubcategoryForId, setPendingAddSubcategoryForId] = useState<
    number | null
  >(null);
  const [pendingAddRootCategory, setPendingAddRootCategory] = useState(false);
  const [pendingEditCategory, setPendingEditCategory] = useState<{
    categoryId: number;
    initialTitle: string;
  } | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<{
    categoryId: number;
    title: string;
  } | null>(null);

  const openAddSubcategoryModal = (categoryId: number) => {
    setPendingAddSubcategoryForId(categoryId);
  };

  const closeAddSubcategoryModal = () => {
    setPendingAddSubcategoryForId(null);
  };

  const openAddRootCategoryModal = () => {
    setPendingAddRootCategory(true);
  };

  const closeAddRootCategoryModal = () => {
    setPendingAddRootCategory(false);
  };

  const openEditCategoryModal = (categoryId: number, initialTitle: string) => {
    setPendingEditCategory({ categoryId, initialTitle });
  };

  const closeEditCategoryModal = () => {
    setPendingEditCategory(null);
  };

  const openDeleteCategoryModal = (categoryId: number, title: string) => {
    setPendingDeleteCategory({ categoryId, title });
  };

  const closeDeleteCategoryModal = () => {
    setPendingDeleteCategory(null);
  };

  return {
    // States
    pendingAddSubcategoryForId,
    pendingAddRootCategory,
    pendingEditCategory,
    pendingDeleteCategory,
    // Actions
    openAddSubcategoryModal,
    closeAddSubcategoryModal,
    openAddRootCategoryModal,
    closeAddRootCategoryModal,
    openEditCategoryModal,
    closeEditCategoryModal,
    openDeleteCategoryModal,
    closeDeleteCategoryModal
  };
}
