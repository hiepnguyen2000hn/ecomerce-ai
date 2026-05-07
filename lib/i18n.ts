import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        search: "Search...",
        loading: "Loading...",
        error: "An error occurred",
        save: "Save Changes",
        discard: "Discard",
        back: "Back",
        no_results: "No results found"
      },
      nav: {
        dashboard: "Dashboard",
        products: "Inventory",
        sales: "Sales",
        customers: "Customers",
        settings: "Settings",
        help: "Help Center"
      },
      products: {
        inventory: "Inventory",
        management: "Management",
        select_product: "Select Product",
        to_begin: "To Begin",
        search_catalog: "Search Catalog...",
        sku: "SKU",
        status: "Status",
        category: "Category",
        all: "All",
        draft: "Draft",
        testing: "Testing",
        scaling: "Scaling",
        mature: "Mature",
        stopped: "Stopped"
      }
    }
  }
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false
      }
    });
}

export default i18n;
