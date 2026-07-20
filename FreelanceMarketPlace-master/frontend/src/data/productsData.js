// Shared Digital Products mock database for AdFreelancin - Cleared for Supabase direct execution

const INITIAL_PRODUCTS_DATA = [];

export const PRODUCT_CATEGORIES = [
  'All',
  'UI Kits',
  'Templates',
  'Icons',
  'Spreadsheets',
  'Code Snippets',
  'Ebooks',
  'Accounting & Finance',
  'Sales & Marketing',
  'Human Resources',
  'Legal & Compliance',
  'Operations & Management'
];

export const getProducts = () => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS_DATA;
  const stored = localStorage.getItem('adfreelancin_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse cached Vercel products", e);
    }
  }
  localStorage.setItem('adfreelancin_products', JSON.stringify(INITIAL_PRODUCTS_DATA));
  return INITIAL_PRODUCTS_DATA;
};

export const saveProduct = (newProduct) => {
  if (typeof window === 'undefined') return [];
  const current = getProducts();
  const updated = [newProduct, ...current];
  localStorage.setItem('adfreelancin_products', JSON.stringify(updated));
  return updated;
};

export const MOCK_PRODUCTS_DATA = INITIAL_PRODUCTS_DATA;
