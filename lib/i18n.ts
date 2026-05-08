import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = i18next.createInstance();

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
        no_results: "No results found",
        advanced_filter: "Advanced Filter",
        add_manual: "Add Manual Product",
        lifecycle_status: "Lifecycle Status",
        available_variants: "Available Variants",
        showing: "Showing",
        of: "of",
        products: "Products"
      },
      nav: {
        dashboard: "Dashboard",
        products: "Inventory",
        sales: "Sales",
        customers: "Customers",
        settings: "Settings",
        help: "Help Center",
        landing_pages: "Landing Pages",
        ads_command: "Ads Command",
        orders: "Orders & Fulfillment",
        storage: "Storage",
        identity: "Identity",
        preference: "Preference",
        membership: "Membership",
        logout: "Logout",
        language: "Language"
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
        stopped: "Stopped",
        search_description: "Enter SKU or Product Name to see generated documents or start creating new ones.",
        add_variant: "Add Variant",
        new_variant_group: "New Variant Group",
        variant_groups: "Variant Groups",
        product_name: "Product Name",
        description: "Description",
        ai_polish: "AI Polish",
        ai_rewrite: "AI Rewrite",
        variants: "Variants",
        stock: "Stock",
        available_units: "Available: {{qty}} units",
        add_variant_group: "Add variant group",
        sku_reference: "SKU Reference"
      },
      landing_pages: {
        portfolio: "Landing Page Portfolio",
        search_placeholder: "Search LP...",
        import_html: "Import HTML",
        create_new: "Create New Landing Page",
        table: {
          status: "Status",
          config: "Configuration & Preview",
          traffic: "Traffic",
          conversion: "Conversion (CVR)",
          created: "Created"
        },
        analytics: {
          title: "Analytics",
          edit: "Edit",
          kpi: {
            cv_rate: "Conversion Rate",
            cpa: "Cost Per Action",
            roi: "Estimated ROI",
            active_users: "Active Users"
          },
          charts: {
            source_dist: "Source Distribution",
            funnel: "Conversion Funnel",
            scroll_depth: "Scroll Depth & Drop-off"
          },
          ai_insight: {
            title: "AI INSIGHT",
            subtitle: "Auto-Advisory Module",
            apply: "APPLY AI OPTIMIZATIONS"
          }
        },
        selector: {
          title: "Select product to start",
          placeholder: "Enter SKU or Product Name"
        },
        batch: {
          title: "AI Batch Generation",
          subtitle: "Generating LPs for",
          display_language: "Display Language",
          number_of_lps: "Number of LP(s)",
          source_selection: "Content Source Selection",
          one_click: "1-Click AI",
          one_click_desc: "Auto-mix creative content",
          google_drive: "Google Drive",
          google_drive_desc: "Fetch custom materials",
          template_strategy: "Template Selection Strategy",
          opt_a: "Opt A: AI Optimize",
          opt_a_desc: "AI automatically selects patterns based on conversion history (Recommended)",
          opt_b: "Opt B: Select manually",
          opt_b_desc: "Choose a landing page template from the library",
          create_button: "Create a Batch Landing Page"
        },
        editor: {
          export: "Export HTML",
          draft: "Draft",
          publish: "Publish & Tracking",
          ai_optimizer: "AI Optimizer",
          cvr_insight: "CVR Insight",
          rewrite: "Rewrite with AI",
          ai_editor: "AI Editor",
          ai_placeholder: "Which content do you want to update?",
          hero_section: "Hero Section",
          h1_headline: "H1.Headline"
        }
      }
    }
  },
  vi: {
    translation: {
      common: {
        search: "Tìm kiếm...",
        loading: "Đang tải...",
        error: "Có lỗi xảy ra",
        save: "Lưu thay đổi",
        discard: "Hủy bỏ",
        back: "Quay lại",
        no_results: "Không tìm thấy kết quả",
        advanced_filter: "Bộ lọc nâng cao",
        add_manual: "Thêm sản phẩm thủ công",
        lifecycle_status: "Trạng thái chu kỳ",
        available_variants: "Biến thể có sẵn",
        showing: "Hiển thị",
        of: "của",
        products: "Sản phẩm"
      },
      nav: {
        dashboard: "Bảng điều khiển",
        products: "Kho hàng",
        sales: "Bán hàng",
        customers: "Khách hàng",
        settings: "Cài đặt",
        help: "Trung tâm hỗ trợ",
        landing_pages: "Trang đích",
        ads_command: "Ads Command",
        orders: "Đơn hàng & Vận chuyển",
        storage: "Bộ nhớ",
        identity: "Danh tính",
        preference: "Sở thích",
        membership: "Thành viên",
        logout: "Đăng xuất",
        language: "Ngôn ngữ"
      }
    }
  },
  ro: {
    translation: {
      common: {
        search: "Căutare...",
        loading: "Se încarcă...",
        error: "A apărut o eroare",
        save: "Salvează",
        discard: "Anulează",
        back: "Înapoi",
        no_results: "Niciun rezultat",
        advanced_filter: "Filtru Avansat",
        products: "Produse"
      },
      nav: {
        dashboard: "Panou Control",
        products: "Inventar",
        identity: "Identitate",
        preference: "Preferințe",
        membership: "Membru",
        logout: "Deconectare",
        language: "Limbă"
      }
    }
  }
};

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

export default i18n;
