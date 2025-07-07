# 🌊 Marine Conservation Platform - Admin Setup Guide

This guide will help you set up admin functionality for your marine conservation platform.

## 📋 Prerequisites

1. **Supabase Project**: Make sure your Supabase project is set up and running
2. **Database Schema**: Ensure you've run the main database setup script (`sql/supabase_setup.sql`)
3. **User Account**: You need a user account in the system before making it an admin

## 🚀 Setting Up Your Admin Account

### Step 1: First, Create Your User Account

Since you need a user account before making it an admin, let's first create your account in the system. You can do this by:

1. **Go to your application** (http://localhost:3000)
2. **Click "Register" or "Sign Up"**
3. **Use these credentials**:
   - Email: `admin@marineeye.com`
   - Password: `admin123`
4. **Complete the registration process**

### Step 2: Run the Admin Setup Script

1. **Go to your Supabase Dashboard** → **SQL Editor**
2. **Copy and paste the entire contents** of `sql/admin_setup.sql`
3. **Click "Run"** to execute the script

### Step 3: Make Your Account Admin

After running the setup script, run this command in the SQL Editor:

```sql
SELECT create_admin_user('admin@marineeye.com', 'Marine Eye Admin');
```

### Step 4: Verify Admin Access

1. **Log in** to your application with `admin@marineeye.com` / `admin123`
2. **Navigate to** `/admin` 
3. **You should now have full admin access!**

## 🔧 Alternative: Direct Database Update

If you prefer to set up admin directly without the functions:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'admin@marineeye.com';

-- Update your profile to admin (replace USER_ID with your actual ID from above)
UPDATE profiles 
SET role = 'admin', updated_at = NOW() 
WHERE id = 'USER_ID';
```

## 📊 What You'll Have Access To

Once set up, you'll have admin access to:

- **User Management**: View, promote, demote, and ban users
- **Species Management**: Add, edit, delete marine species
- **Content Management**: Manage projects, news, and resources
- **Analytics**: View system statistics and user metrics
- **Settings**: Configure system settings

## 🛡️ Admin Features Available

Once set up, admins have access to:

### User Management
- View all users and their details
- Promote/demote users to admin
- Ban/unban users
- View user activity logs

### Content Management
- Manage marine species data
- Manage conservation projects
- Manage news articles
- Manage educational resources
- Manage tracking records

### System Administration
- View system statistics
- Manage system settings
- Access admin dashboard
- View audit logs

## 🔐 Security Features

The admin system includes:

- **Row Level Security (RLS)**: Only admins can access admin-specific data
- **Function Security**: Admin functions are protected with SECURITY DEFINER
- **Audit Logging**: Admin actions are logged for security
- **Session Management**: Configurable admin session timeouts

## 📊 Admin Dashboard Features

Your admin dashboard (`/admin`) includes:

- **Analytics**: System statistics and user metrics
- **User Management**: View, promote, demote, and ban users
- **Content Management**: Manage species, projects, news, and resources
- **Settings**: Configure system settings
- **Activity Logs**: View user and system activity

## 🚨 Troubleshooting

### "User not found" Error
- Make sure the user account exists before promoting to admin
- Check the email spelling
- Ensure the user has logged in at least once

### "Access denied" Error
- Verify your user has the 'admin' role
- Check if you're logged in
- Ensure the admin setup script was run successfully

### Admin Dashboard Not Loading
- Check browser console for errors
- Verify your user has admin privileges
- Ensure all admin RLS policies are in place

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure all database scripts have been run
4. Check that your user account exists and has admin role

## 🔄 Maintenance

### Adding More Admins
```sql
-- Promote additional users to admin
SELECT promote_to_admin('new-admin@example.com');
```

### Removing Admin Access
```sql
-- Demote admin to regular user
SELECT demote_from_admin('admin@example.com');
```

### System Statistics
```sql
-- View system statistics (admin only)
SELECT * FROM get_system_stats();
```

### User List
```sql
-- View all users (admin only)
SELECT * FROM get_all_users();
```

---

**🎉 Congratulations!** Your admin system is now set up and ready to use. 