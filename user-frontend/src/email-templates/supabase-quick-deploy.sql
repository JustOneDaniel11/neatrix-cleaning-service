-- =====================================================
-- IMPORTANT: Supabase Email Templates Configuration
-- =====================================================
-- 
-- ❌ SQL CONFIGURATION NOT SUPPORTED
-- Supabase does not use SQL for email template configuration.
-- The auth.config table does not exist in Supabase.
-- 
-- ✅ USE ONE OF THESE METHODS INSTEAD:
-- 1. Supabase Dashboard (Recommended for beginners)
-- 2. Management API (Recommended for automation)
-- 3. Local Development (config.toml)
-- 
-- =====================================================

-- This file has been updated to provide the correct configuration methods.
-- Please see the accompanying files:
-- - supabase-management-api-deploy.sh (for API deployment)
-- - supabase-dashboard-guide.md (for manual dashboard setup)

-- =====================================================
-- WHY SQL DOESN'T WORK:
-- =====================================================
-- Supabase Auth uses configuration keys stored in their internal
-- system, not in user-accessible database tables. Email templates
-- are managed through:
-- 
-- 1. Dashboard: Authentication > Email Templates
-- 2. Management API: PATCH /v1/projects/{ref}/config/auth
-- 3. Local config: supabase/config.toml
-- 
-- The correct configuration keys are:
-- - mailer_subjects_confirmation
-- - mailer_templates_confirmation_content
-- - mailer_subjects_recovery  
-- - mailer_templates_recovery_content
-- 
-- =====================================================

SELECT 'Please use the Management API script or Dashboard instead' as message;