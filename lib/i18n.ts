export type Locale =
  | "en"
  | "es"
  | "pt"
  | "fr"
  | "de"
  | "it"
  | "nl"
  | "pl"
  | "uk"
  | "ru"
  | "tr"
  | "ar"
  | "hi"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko";

export type LanguageMeta = {
  code: Locale;
  label: string;
  short: string;
  flag: string;
  rtl?: boolean;
};

export const LANGUAGES: LanguageMeta[] = [
  { code: "en",    label: "English",           short: "EN", flag: "🇬🇧" },
  { code: "es",    label: "Español",            short: "ES", flag: "🇪🇸" },
  { code: "pt",    label: "Português (Brasil)", short: "BR", flag: "🇧🇷" },
  { code: "fr",    label: "Français",           short: "FR", flag: "🇫🇷" },
  { code: "de",    label: "Deutsch",            short: "DE", flag: "🇩🇪" },
  { code: "it",    label: "Italiano",           short: "IT", flag: "🇮🇹" },
  { code: "nl",    label: "Nederlands",         short: "NL", flag: "🇳🇱" },
  { code: "pl",    label: "Polski",             short: "PL", flag: "🇵🇱" },
  { code: "uk",    label: "Українська",         short: "UA", flag: "🇺🇦" },
  { code: "ru",    label: "Русский",            short: "RU", flag: "🇷🇺" },
  { code: "tr",    label: "Türkçe",             short: "TR", flag: "🇹🇷" },
  { code: "ar",    label: "العربية",            short: "AR", flag: "🇸🇦", rtl: true },
  { code: "hi",    label: "हिन्दी",              short: "HI", flag: "🇮🇳" },
  { code: "zh-CN", label: "中文 (简体)",         short: "ZH", flag: "🇨🇳" },
  { code: "zh-TW", label: "中文 (繁體)",         short: "TW", flag: "🇹🇼" },
  { code: "ja",    label: "日本語",              short: "JA", flag: "🇯🇵" },
  { code: "ko",    label: "한국어",              short: "KO", flag: "🇰🇷" },
];

export type BaseTranslations = {
  // Accessibility
  skip_to_content: string;
  skip_to_dashboard: string;
  // Header / menu
  open_menu: string;
  close_menu: string;
  // PWA install
  install_app: string;
  install_app_short: string;
  install_how: string;
  // Auth
  auth_account: string;
  auth_checking_session: string;
  auth_sign_in: string;
  auth_sign_in_short: string;
  auth_sign_in_google: string;
  auth_continue_google: string;
  auth_signing_in: string;
  auth_sign_out: string;
  auth_signing_out: string;
  auth_dashboard: string;
  auth_open_dashboard: string;
  auth_back_home: string;
  auth_signed_in_as: string;
  auth_sync_description: string;
  auth_sign_out_info: string;
  auth_profile: string;
  auth_firebase_account: string;
  auth_profile_photo: string;
  // App shell states
  app_loading: string;
  app_sign_in_title: string;
  app_sign_in_description: string;
  app_firestore_not_ready: string;
  // Sidebar
  sidebar_quick_actions: string;
  sidebar_add_habit: string;
  sidebar_settings: string;
  sidebar_habits: string;
  sidebar_no_habits_title: string;
  sidebar_no_habits_desc: string;
  sidebar_create_habit: string;
  sidebar_close: string;
  sidebar_open: string;
  // Navigation
  nav_dashboard: string;
  nav_stats: string;
  nav_archive: string;
  nav_settings: string;
  // Mobile tab bar
  tab_add_habit_aria: string;
  tab_add_habit: string;
  // Footer
  footer_sitemap: string;
  footer_privacy: string;
  footer_terms: string;
  // Settings page
  settings_tag: string;
  settings_heading: string;
  settings_heading_desc_mobile: string;
  settings_heading_desc: string;
  settings_back: string;
  settings_account_snapshot: string;
  settings_profile_desc: string;
  settings_appearance: string;
  settings_appearance_desc: string;
  settings_quick_routes: string;
  settings_quick_routes_desc: string;
  settings_stats_detail: string;
  settings_archive_detail: string;
  settings_dashboard_detail: string;
  settings_sync_health: string;
  settings_sync_desc: string;
  settings_account_access: string;
  settings_account_fallback: string;
  settings_account_email_fallback: string;
  settings_pending_records: string;
  settings_active_saves: string;
  settings_last_save_error: string;
  settings_live_sync_warning: string;
  // Sync states
  sync_synced: string;
  sync_saving: string;
  sync_needs_attention: string;
  sync_title_attention_listener: string;
  sync_title_attention_mutation: string;
  sync_detail_attention: string;
  sync_title_saving: string;
  sync_detail_saving_records: string;
  sync_detail_saving_habits: string;
  sync_short_saving: string;
  sync_title_synced: string;
  sync_detail_synced: string;
  sync_short_synced: string;
  // Sync banner
  banner_records_sync: string;
  banner_habits_sync: string;
  banner_last_change: string;
  theme_light: string;
  theme_dark: string;
  theme_switch_to_light: string;
  theme_switch_to_dark: string;
  archive_count: string;
  archive_none_yet: string;
  archive_none_title: string;
  archive_none_desc: string;
  archive_restore: string;
  archive_delete: string;
  archive_delete_permanently: string;
  archive_delete_confirm: string;
  archive_frequency_single: string;
  tracker_hit_rate: string;
  tracker_total: string;
  tracker_empty_desc: string;
  tracker_matrix: string;
  tracker_latest: string;
  stats_empty_title: string;
  stats_empty_desc: string;
  // Language switcher
  language_select: string;
  // Marketing home
  home_open_dashboard: string;
  home_review_privacy: string;
  home_go_to_dashboard: string;
  home_read_terms: string;
  home_point_1: string;
  home_point_2: string;
  home_point_3: string;
};

export type ExtraTranslations = {
  dashboard_error_title: string;
  dashboard_error_desc: string;
  try_again: string;
  back_to_dashboard: string;
  nav_home: string;
  archive_feedback_title: string;
  archive_feedback_desc: string;
  archive_feedback_undo: string;
  archive_feedback_open: string;
  archive_feedback_dismiss: string;
  form_edit_habit: string;
  form_new_habit: string;
  form_intro: string;
  form_close: string;
  form_icon: string;
  form_icon_help: string;
  form_choose_icon: string;
  form_name: string;
  form_name_placeholder: string;
  form_name_help: string;
  form_name_required: string;
  form_description: string;
  form_optional: string;
  form_description_placeholder: string;
  form_description_help: string;
  form_color: string;
  form_color_help: string;
  form_custom: string;
  form_custom_color_aria: string;
  form_custom_hex_aria: string;
  form_random_color_aria: string;
  form_times_per_day: string;
  form_decrease_frequency: string;
  form_increase_frequency: string;
  form_once_a_day: string;
  form_times_a_day: string;
  form_frequency_help: string;
  form_time_slot_names: string;
  form_slot_help: string;
  cancel: string;
  saving: string;
  creating: string;
  save_changes: string;
  create_habit: string;
  delete: string;
  habit_actions_open: string;
  habit_actions: string;
  edit: string;
  chart: string;
  chart_no_data: string;
  chart_aria: string;
  chart_custom: string;
  date_from: string;
  date_to: string;
  date_today: string;
  chart_summary: string;
  chart_day_average: string;
  stats_history_error_title: string;
  stats_history_loading_title: string;
  stats_history_error_desc: string;
  stats_history_loading_desc: string;
  retry_history_load: string;
  stats_habits_in_scope: string;
  stats_archived_habits: string;
  stats_average_hit_rate: string;
  stats_completed_days: string;
  stats_habit_days_range: string;
  stats_habit_days_visible: string;
  stats_best_live_streak: string;
  stats_longest_current_run: string;
  stats_daily_completion_desc: string;
  stats_peak: string;
  stats_average_daily_rate: string;
  stats_best_day: string;
  stats_recent_snapshot: string;
  stats_strongest_habit: string;
  stats_strongest_desc: string;
  stats_completed: string;
  stats_live_streak: string;
  stats_open_habit_details: string;
  stats_leaderboard: string;
  stats_leaderboard_desc: string;
  stats_tracked: string;
  stats_streak_short: string;
  stats_weekday_rhythm: string;
  stats_weekday_desc: string;
  stats_weekday_hint: string;
  stats_heading_title: string;
  stats_heading_desc_mobile: string;
  stats_heading_desc: string;
  stats_filters: string;
  stats_time_range: string;
  stats_monthly: string;
  habit_not_found_label: string;
  habit_not_found_title: string;
  habit_not_found_desc: string;
  back_to_tracker: string;
  back: string;
  habit_no_description: string;
  habit_slots_today: string;
  habit_completed_today: string;
  habit_not_done_today: string;
  habit_this_month: string;
  habit_this_month_label: string;
  habit_day_streak: string;
  habit_times_per_day_badge: string;
  habit_history_error_title: string;
  habit_history_loading_title: string;
  habit_history_error_desc: string;
  habit_history_loading_desc: string;
  habit_slot_breakdown: string;
  habit_days: string;
  habit_all_time: string;
  habit_partial_history: string;
  habit_current_streak: string;
  habit_best_streak: string;
  habit_best_run: string;
  habit_monthly_trend: string;
  habit_last_6_months: string;
  habit_weekday_pattern: string;
  habit_delete_confirm: string;
  tracker_previous_week: string;
  tracker_next_week: string;
  tracker_open_stats: string;
  tracker_slots_done_today: string;
  tracker_days_completed: string;
  tracker_slots: string;
  tracker_cell_aria: string;
  tracker_cell_aria_slot: string;
  tracker_completed: string;
  tracker_not_completed: string;
  tracker_matrix_desc: string;
  tracker_previous_month: string;
  tracker_next_month: string;
  tracker_habit: string;
  tracker_drag_reorder: string;
  tracker_view_stats: string;
  profile_settings_title: string;
  profile_settings_desc: string;
  profile_close_settings: string;
  profile_avatar_alt: string;
  profile_upload_avatar: string;
  profile_google_account: string;
  profile_synced_profile: string;
  profile_your_profile: string;
  profile_signed_in_account: string;
  profile_keep_same: string;
  profile_upload_photo: string;
  profile_use_google_photo: string;
  profile_remove_photo: string;
  profile_choose_photo: string;
  profile_display_name: string;
  profile_your_name: string;
  profile_save_help: string;
  pwa_offline_mode: string;
  pwa_offline_desc: string;
  pwa_install_title: string;
  pwa_install_heading: string;
  pwa_install_browser_desc: string;
  pwa_install_ios_desc: string;
  pwa_dismiss_install: string;
  pwa_opening_prompt: string;
  pwa_not_now: string;
  pwa_hide_tip: string;
  offline_label: string;
  offline_title: string;
  offline_desc: string;
  offline_note_1: string;
  offline_note_2: string;
  offline_note_3: string;
  home_nav_workspace: string;
  home_nav_signal: string;
  home_nav_system: string;
  home_hero_title: string;
  home_hero_desc: string;
  home_section_workspace_eyebrow: string;
  home_section_workspace_title: string;
  home_section_workspace_body: string;
  home_section_workspace_alt: string;
  home_section_signal_eyebrow: string;
  home_section_signal_title: string;
  home_section_signal_body: string;
  home_section_signal_alt: string;
  home_section_system_eyebrow: string;
  home_section_system_title: string;
  home_section_system_body: string;
  home_section_system_alt: string;
  home_video_eyebrow: string;
  home_video_title: string;
  home_video_desc: string;
  home_ready_label: string;
  home_ready_title: string;
  home_ready_desc: string;
  public_nav_aria: string;
  public_nav_mobile_aria: string;
  dashboard_mobile_nav_aria: string;
  legal_last_updated: string;
  legal_last_updated_date: string;
  legal_quick_links: string;
  legal_contact: string;
  privacy_title: string;
  privacy_intro: string;
  terms_title: string;
  terms_intro: string;
  sitemap_title_label: string;
  sitemap_heading: string;
  sitemap_intro: string;
  sitemap_open_page: string;
  sitemap_seo_files: string;
  sitemap_view: string;
  sitemap_blocked_label: string;
  sitemap_blocked_heading: string;
  sitemap_blocked_desc: string;
  privacy_highlight_account_data_label: string;
  privacy_highlight_account_data_value: string;
  privacy_highlight_habit_data_label: string;
  privacy_highlight_habit_data_value: string;
  privacy_highlight_advertising_label: string;
  privacy_highlight_advertising_value: string;
  privacy_section_coverage_title: string;
  privacy_section_coverage_p1: string;
  privacy_section_coverage_p2: string;
  privacy_section_collect_title: string;
  privacy_section_collect_p1: string;
  privacy_section_collect_p2: string;
  privacy_section_collect_p3: string;
  privacy_section_use_title: string;
  privacy_section_use_p1: string;
  privacy_section_use_p2: string;
  privacy_section_sharing_title: string;
  privacy_section_sharing_p1: string;
  privacy_section_sharing_p2: string;
  privacy_section_retention_title: string;
  privacy_section_retention_p1: string;
  privacy_section_retention_p2: string;
  privacy_section_security_title: string;
  privacy_section_security_p1: string;
  privacy_section_security_p2: string;
  privacy_section_changes_title: string;
  privacy_section_changes_p1: string;
  privacy_section_changes_p2: string;
  terms_highlight_license_label: string;
  terms_highlight_license_value: string;
  terms_highlight_data_label: string;
  terms_highlight_data_value: string;
  terms_highlight_availability_label: string;
  terms_highlight_availability_value: string;
  terms_section_acceptance_title: string;
  terms_section_acceptance_p1: string;
  terms_section_acceptance_p2: string;
  terms_section_eligibility_title: string;
  terms_section_eligibility_p1: string;
  terms_section_eligibility_p2: string;
  terms_section_permitted_title: string;
  terms_section_permitted_p1: string;
  terms_section_permitted_p2: string;
  terms_section_content_title: string;
  terms_section_content_p1: string;
  terms_section_content_p2: string;
  terms_section_changes_availability_title: string;
  terms_section_changes_availability_p1: string;
  terms_section_changes_availability_p2: string;
  terms_section_termination_title: string;
  terms_section_termination_p1: string;
  terms_section_termination_p2: string;
  terms_section_disclaimers_title: string;
  terms_section_disclaimers_p1: string;
  terms_section_disclaimers_p2: string;
  terms_section_liability_title: string;
  terms_section_liability_p1: string;
  terms_section_liability_p2: string;
  terms_section_revisions_title: string;
  terms_section_revisions_p1: string;
  terms_section_revisions_p2: string;
  sitemap_file_xml_desc: string;
  sitemap_file_robots_desc: string;
  sitemap_route_home_title: string;
  sitemap_route_home_desc: string;
  sitemap_route_privacy_title: string;
  sitemap_route_privacy_desc: string;
  sitemap_route_terms_title: string;
  sitemap_route_terms_desc: string;
  sitemap_route_sitemap_title: string;
  sitemap_route_sitemap_desc: string;
  form_rewardable?: string;
  form_rewardable_help?: string;
  tracker_streak_tooltip?: string;
};

export type Translations = BaseTranslations & ExtraTranslations;

import { EXTRA_TRANSLATIONS, TRANSLATIONS } from "@/lib/i18n-catalog";

export function getTranslations(locale: Locale): Translations {
  return {
    ...TRANSLATIONS.en,
    ...EXTRA_TRANSLATIONS.en,
    ...(TRANSLATIONS[locale] ?? TRANSLATIONS.en),
    ...(EXTRA_TRANSLATIONS[locale] ?? EXTRA_TRANSLATIONS.en),
  };
}

export function getLanguageMeta(locale: Locale): LanguageMeta {
  return LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
}
