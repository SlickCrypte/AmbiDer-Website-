-- Migration to add category to profiles for Find Talent category filtering.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category TEXT;

-- 1. Extract category from skills array if it starts with 'cat:'
UPDATE profiles
SET category = 'DevOps',
    skills = array_remove(skills, 'cat:DevOps')
WHERE category IS NULL AND 'cat:DevOps' = ANY(skills);

UPDATE profiles
SET category = 'Development',
    skills = array_remove(skills, 'cat:Development')
WHERE category IS NULL AND 'cat:Development' = ANY(skills);

UPDATE profiles
SET category = 'Data Analyst',
    skills = array_remove(skills, 'cat:Data Analyst')
WHERE category IS NULL AND 'cat:Data Analyst' = ANY(skills);

UPDATE profiles
SET category = 'Design',
    skills = array_remove(skills, 'cat:Design')
WHERE category IS NULL AND 'cat:Design' = ANY(skills);

UPDATE profiles
SET category = 'Writing & Translation',
    skills = array_remove(skills, 'cat:Writing & Translation')
WHERE category IS NULL AND 'cat:Writing & Translation' = ANY(skills);

-- 2. Infer category from skills array content (case-insensitive checks)
UPDATE profiles
SET category = 'Design'
WHERE category IS NULL 
  AND (
    'figma' = ANY(skills) OR 
    'Figma' = ANY(skills) OR 
    'design' = ANY(skills) OR 
    'Design' = ANY(skills)
  );

UPDATE profiles
SET category = 'Development'
WHERE category IS NULL 
  AND (
    'react' = ANY(skills) OR 
    'React' = ANY(skills) OR 
    'python' = ANY(skills) OR 
    'Python' = ANY(skills) OR 
    'developer' = ANY(skills) OR 
    'web development' = ANY(skills) OR 
    'JavaScript' = ANY(skills) OR 
    'PYHTON' = ANY(skills)
  );

-- 3. Fallback remaining freelancer profiles to 'Development'
UPDATE profiles 
SET category = 'Development' 
WHERE category IS NULL AND (account_type = 'freelancer_seller' OR account_type IS NULL) AND skills IS NOT NULL AND array_length(skills, 1) > 0;

