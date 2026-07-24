# 003 — HomePage Talent Cards & Content Redesign

- **Status**: DONE
- **Commit**: 3f8f3be
- **Severity**: MEDIUM
- **Category**: Component patterns / Content / Surfaces
- **Estimated scope**: 3 files (`HomePage.module.css`, `index.css`, database script)

## Problem

The talent cards grid on the home page looks generic due to flat grey card borders, centered mathematical ratings, and placeholder user profiles containing test names ("Yash Tulsani", "Garv Sharma" multiple times) and garbage test bio contents ("eawaigawhjhdpiawjdojaw...").

## Target

1. **Card Visual Elevation**:
   - Remove the thin grey border on hover/rest.
   - Use dynamic colored shadow elevation: `box-shadow: 0 4px 20px rgba(27, 42, 65, 0.04), 0 1px 2px rgba(27, 42, 65, 0.02)`.
   - On hover, lift the card and tint the shadow with the navy brand hue: `box-shadow: 0 12px 30px rgba(27, 42, 65, 0.08)`.
2. **Content Redesign (Database Seed)**:
   - Provide a Python script to seed the database profiles with 8-10 highly professional, diverse, and realistic freelancer personas (realistic Indian & international names, premium custom biographies, actual skill arrays, non-round hourly rates like `₹2,250`, and real locations).
3. **Card Layout & Spacing**:
   - Align text in card sub-labels to sentence case.
   - Give the rating and badge indicators better optical alignment.

## Repo conventions to follow

- Frontend styling variables live in `index.css`.
- Core database connections are managed via Supabase client credentials in `database.py`.

## Steps

1. Create a Python database seed script `seed_profiles.py` in `scratch/seed_profiles.py`.
2. The script should:
   - Define a list of 10 realistic profiles with matching fields: `id` (matching existing UUIDs or creating fresh ones), `full_name`, `email`, `role`, `hourly_rate`, `bio`, `skills`, `location`, `category`, `response_time`, `on_time_delivery`, `repeat_clients`, etc.
   - Insert/upsert them into the Supabase `profiles` table to provide gorgeous sample cards.
3. Open [HomePage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/HomePage.module.css).
4. Update the `.card` selector to use the soft tinted shadow and no border:
   ```css
   .card {
     background-color: var(--color-card-white);
     border-radius: var(--border-radius-card);
     border: 1px solid rgba(27, 42, 65, 0.06);
     padding: 24px;
     box-shadow: 0 4px 20px rgba(27, 42, 65, 0.04);
     display: flex;
     flex-direction: column;
     position: relative;
     transition: all var(--transition-normal);
   }
   ```
5. Update `.card:hover` to lift the card and expand the soft navy shadow:
   ```css
   .card:hover {
     transform: translateY(-4px);
     box-shadow: 0 12px 30px rgba(27, 42, 65, 0.08);
     border-color: rgba(27, 42, 65, 0.12);
   }
   ```

## Boundaries

- Do NOT break existing Supabase database tables or delete user auth records.
- Do NOT delete columns in `profiles` schema.

## Verification

- **Mechanical**: Ensure the python seed script executes successfully without syntax or DB errors.
- **Feel check**:
  - Run the seed script and reload the local home page.
  - Verify that the listings look authentic, containing realistic and diverse details instead of copy-paste duplicate tests.
  - Inspect card elevations and hover animations. Verify they feel soft, premium, and integrated.
