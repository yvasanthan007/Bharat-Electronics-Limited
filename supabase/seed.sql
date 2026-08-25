-- This seed file relies on users being created via Supabase Auth first, 
-- but for a complete seed, we'll insert dummy users into auth.users (Note: This requires pgcrypto or similar in a real environment, or creating users via the UI).
-- To make this seed easy to run in the SQL Editor without bypassing Auth, we will assume you create the Manager user (belmanager@gmail.com, password manager123) manually in the Supabase Auth UI, which will auto-populate the profiles table via the trigger.

-- Since we can't reliably predict the UUID of the manager created via Auth UI, we will use a DO block to seed data associated with that specific email.

DO $$
DECLARE
  manager_uuid uuid;
  employee1_uuid uuid := uuid_generate_v4();
  employee2_uuid uuid := uuid_generate_v4();
  employee3_uuid uuid := uuid_generate_v4();
  role_manager_uuid uuid := uuid_generate_v4();
  role_engineer_uuid uuid := uuid_generate_v4();
BEGIN
  -- Get the manager's UUID (Assumes you created belmanager@gmail.com in Auth UI)
  SELECT id INTO manager_uuid FROM auth.users WHERE email = 'belmanager@gmail.com';

  -- If manager doesn't exist, we can't seed properly. Let's create dummy auth users for the employees for the sake of the prototype.
  -- WARNING: Directly inserting into auth.users is generally discouraged, but useful for seeding a local dev environment.
  
  IF manager_uuid IS NOT NULL THEN
    
    -- Update manager profile
    UPDATE public.profiles SET full_name = 'Neha Gupta', department = 'Operations', avatar_url = 'NG' WHERE id = manager_uuid;

    -- Create Employee Auth Users (Raw insert for testing purposes)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, is_sso_user)
    VALUES 
      (employee1_uuid, '00000000-0000-0000-0000-000000000000', 'rahul.verma@bel.in', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Rahul Verma","avatar_url":"RV"}', now(), now(), 'authenticated', false),
      (employee2_uuid, '00000000-0000-0000-0000-000000000000', 'priya.singh@bel.in', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Priya Singh","avatar_url":"PS"}', now(), now(), 'authenticated', false),
      (employee3_uuid, '00000000-0000-0000-0000-000000000000', 'amit.kumar@bel.in', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Amit Kumar","avatar_url":"AK"}', now(), now(), 'authenticated', false);
    
    -- Update Employee Profiles
    UPDATE public.profiles SET department = 'IT Security' WHERE id = employee1_uuid;
    UPDATE public.profiles SET department = 'R&D' WHERE id = employee2_uuid;
    UPDATE public.profiles SET department = 'Digital Systems' WHERE id = employee3_uuid;

    -- Roles
    INSERT INTO public.roles (id, name, description) VALUES
      (role_manager_uuid, 'Manager', 'Department Manager'),
      (role_engineer_uuid, 'Engineer', 'Technical Staff');

    -- User Roles
    INSERT INTO public.user_roles (user_id, role_id) VALUES
      (manager_uuid, role_manager_uuid),
      (employee1_uuid, role_engineer_uuid),
      (employee2_uuid, role_engineer_uuid),
      (employee3_uuid, role_engineer_uuid);

    -- Team Members
    INSERT INTO public.team_members (manager_id, employee_id, access_status) VALUES
      (manager_uuid, employee1_uuid, 'Active'),
      (manager_uuid, employee2_uuid, 'Active'),
      (manager_uuid, employee3_uuid, 'Active');

    -- Access Requests
    INSERT INTO public.access_requests (requester_id, resource, permission, status) VALUES
      (employee3_uuid, 'Project Atlas Repository', 'Read Access', 'Pending'),
      (employee2_uuid, 'R&D Documentation System', 'Write Access', 'Pending'),
      (employee1_uuid, 'Digital Certificate System', 'Read Access', 'Pending');

    -- Digital Assets
    INSERT INTO public.digital_assets (asset_id, name, owner_id, type, status, description, issued_at) VALUES
      ('NFT-1245', 'Digital Certificate NFT #1245', employee1_uuid, 'Digital Certificate', 'Verified', 'Security clearance certificate for Project Atlas access.', now() - interval '2 days'),
      ('NFT-1244', 'Access Badge NFT #1244', employee2_uuid, 'Access Badge', 'Verified', 'R&D facility access badge.', now() - interval '3 days'),
      ('NFT-1243', 'Training Certificate NFT #1243', employee3_uuid, 'Training Certificate', 'Verified', 'Advanced cybersecurity training.', now() - interval '4 days');

    -- Audit Logs
    INSERT INTO public.audit_logs (user_id, action, resource, category, status, created_at) VALUES
      (employee1_uuid, 'logged in', 'BEL Platform', 'Authentication', 'info', now() - interval '5 minutes'),
      (employee2_uuid, 'requested access to', 'R&D Documentation System', 'Access', 'warning', now() - interval '1 hour'),
      (manager_uuid, 'exported', 'Team Report (CSV)', 'Team', 'success', now() - interval '2 hours');

    -- Notifications
    INSERT INTO public.notifications (user_id, title, description, type, is_read, link) VALUES
      (manager_uuid, '3 pending access requests', 'You have 3 new access requests awaiting approval', 'request', false, '/manager/access-requests'),
      (manager_uuid, 'Monthly team report ready', 'Your team performance report is available', 'system', true, '/manager');

  END IF;
END $$;
