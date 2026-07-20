-- Migration to add support for multiple account roles on a single user profile

-- 1. Add enabled_roles column (text array to store all roles activated by the user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enabled_roles TEXT[] DEFAULT '{}';

-- 2. Add active_role column (text to store the currently active role workspace)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_role TEXT;

-- 3. Populate existing users' enabled_roles with their current account_type
UPDATE profiles 
SET enabled_roles = ARRAY[COALESCE(account_type, 'freelancer_seller')]
WHERE enabled_roles IS NULL OR enabled_roles = '{}';

-- 4. Populate existing users' active_role with their current account_type
UPDATE profiles 
SET active_role = COALESCE(account_type, 'freelancer_seller')
WHERE active_role IS NULL;
