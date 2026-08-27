// Hand-derived from `supabase/schema.sql` because this environment has no
// Docker/local Postgres to run `supabase gen types typescript --local`
// against (see `npm run db:types`). The CI `database-migrations` job
// regenerates this file against a fresh migrated database and fails the
// build on any drift — treat that check, not this comment, as the source of
// truth once it has run.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          business: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          category: string;
          car_model: string;
          location: string;
          year: number;
          cover_image: string;
          gallery_images: string[];
          gallery_captions: string[];
          gallery_items: Json;
          video_url: string | null;
          uploaded_video: string | null;
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
          behind_the_scenes: string | null;
        };
        Insert: {
          id?: string;
          business?: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          category: string;
          car_model: string;
          location: string;
          year: number;
          cover_image: string;
          gallery_images?: string[];
          gallery_captions?: string[];
          gallery_items?: Json;
          video_url?: string | null;
          uploaded_video?: string | null;
          featured?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          behind_the_scenes?: string | null;
        };
        Update: {
          id?: string;
          business?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          full_description?: string;
          category?: string;
          car_model?: string;
          location?: string;
          year?: number;
          cover_image?: string;
          gallery_images?: string[];
          gallery_captions?: string[];
          gallery_items?: Json;
          video_url?: string | null;
          uploaded_video?: string | null;
          featured?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          behind_the_scenes?: string | null;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          brief: string;
          created_at: string;
          notification_status: string;
          notification_attempts: number;
          notification_last_attempt_at: string | null;
          notification_sent_at: string | null;
          service_type: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          brief: string;
          created_at?: string;
          notification_status?: string;
          notification_attempts?: number;
          notification_last_attempt_at?: string | null;
          notification_sent_at?: string | null;
          service_type?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          brief?: string;
          created_at?: string;
          notification_status?: string;
          notification_attempts?: number;
          notification_last_attempt_at?: string | null;
          notification_sent_at?: string | null;
          service_type?: string | null;
        };
        Relationships: [];
      };
      inquiry_rate_limits: {
        Row: {
          id: number;
          client_key_hash: string;
          attempted_at: string;
        };
        Insert: {
          id?: number;
          client_key_hash: string;
          attempted_at?: string;
        };
        Update: {
          id?: number;
          client_key_hash?: string;
          attempted_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          brand_name: string;
          brand_mark: string;
          brand_strapline: string;
          contact_email: string;
          contact_phone: string;
          contact_city: string;
          social_links: Json;
          updated_at: string;
          seo_title: string | null;
          seo_description: string | null;
          hero_eyebrow: string | null;
          hero_headline_lead: string | null;
          hero_headline_trail: string | null;
          hero_copy: string | null;
          hero_video_url: string | null;
          about_founder_note: string | null;
          about_positioning: string | null;
          about_team_images: string[];
          about_team_members: Json;
          about_values: Json;
          services: Json;
          selected_frames: string[];
          motion_frames: string[];
          navigation_visibility: Json;
          site_copy: Json;
        };
        Insert: {
          id: string;
          brand_name: string;
          brand_mark: string;
          brand_strapline: string;
          contact_email: string;
          contact_phone: string;
          contact_city: string;
          social_links?: Json;
          updated_at?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          hero_eyebrow?: string | null;
          hero_headline_lead?: string | null;
          hero_headline_trail?: string | null;
          hero_copy?: string | null;
          hero_video_url?: string | null;
          about_founder_note?: string | null;
          about_positioning?: string | null;
          about_team_images?: string[];
          about_team_members?: Json;
          about_values?: Json;
          services?: Json;
          selected_frames?: string[];
          motion_frames?: string[];
          navigation_visibility?: Json;
          site_copy?: Json;
        };
        Update: {
          id?: string;
          brand_name?: string;
          brand_mark?: string;
          brand_strapline?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_city?: string;
          social_links?: Json;
          updated_at?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          hero_eyebrow?: string | null;
          hero_headline_lead?: string | null;
          hero_headline_trail?: string | null;
          hero_copy?: string | null;
          hero_video_url?: string | null;
          about_founder_note?: string | null;
          about_positioning?: string | null;
          about_team_images?: string[];
          about_team_members?: Json;
          about_values?: Json;
          services?: Json;
          selected_frames?: string[];
          motion_frames?: string[];
          navigation_visibility?: Json;
          site_copy?: Json;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      email_settings: {
        Row: {
          id: string;
          smtp_host: string | null;
          smtp_port: number | null;
          smtp_secure: boolean;
          smtp_user: string | null;
          smtp_password: string | null;
          inquiry_email_to: string | null;
          inquiry_email_from: string | null;
          verified_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          smtp_host?: string | null;
          smtp_port?: number | null;
          smtp_secure?: boolean;
          smtp_user?: string | null;
          smtp_password?: string | null;
          inquiry_email_to?: string | null;
          inquiry_email_from?: string | null;
          verified_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          smtp_host?: string | null;
          smtp_port?: number | null;
          smtp_secure?: boolean;
          smtp_user?: string | null;
          smtp_password?: string | null;
          inquiry_email_to?: string | null;
          inquiry_email_from?: string | null;
          verified_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      projects_public: {
        Row: {
          id: string;
          business: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          category: string;
          car_model: string;
          location: string;
          year: number;
          cover_image: string;
          gallery_images: string[];
          gallery_captions: string[];
          gallery_items: Json;
          video_url: string | null;
          uploaded_video: string | null;
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
          behind_the_scenes: string | null;
        };
        Relationships: [];
      };
      site_settings_public: {
        Row: {
          id: string;
          updated_at: string;
          brand_name: string;
          brand_mark: string;
          brand_strapline: string;
          contact_email: string;
          contact_phone: string;
          contact_city: string;
          social_links: Json;
          seo_title: string | null;
          seo_description: string | null;
          hero_eyebrow: string | null;
          hero_headline_lead: string | null;
          hero_headline_trail: string | null;
          hero_copy: string | null;
          hero_video_url: string | null;
          about_founder_note: string | null;
          about_positioning: string | null;
          about_team_images: string[];
          about_team_members: Json;
          about_values: Json;
          services: Json;
          selected_frames: string[];
          motion_frames: string[];
          navigation_visibility: Json;
          site_copy: Json;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      consume_inquiry_rate_limit: {
        Args: {
          p_client_key_hash: string;
          p_max_attempts: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      delete_expired_inquiries: {
        Args: { p_retention_days: number };
        Returns: number;
      };
      claim_inquiry_notifications: {
        Args: { p_batch_size?: number; p_max_attempts?: number };
        Returns: {
          inquiry_id: string;
          name: string;
          email: string;
          company: string | null;
          service_type: string | null;
          brief: string;
          notification_attempts: number;
        }[];
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
