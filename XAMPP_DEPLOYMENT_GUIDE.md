# FindIt XAMPP Deployment Guide

A complete checklist for deploying the FindIt Lost & Found application locally using XAMPP.

## Prerequisites Checklist

- [ ] Windows, macOS, or Linux operating system
- [ ] XAMPP installed (https://www.apachefriends.org/)
- [ ] Node.js 18+ installed (https://nodejs.org/)
- [ ] Git installed (optional, for version control)

---

## Part 1: Backend Setup (PHP API)

### Step 1: Install and Configure XAMPP

1. **Download XAMPP** from https://www.apachefriends.org/
2. **Install XAMPP** with the following components:
   - Apache
   - MySQL
   - PHP
   - phpMyAdmin

3. **Start XAMPP Control Panel** and start:
   - [ ] Apache
   - [ ] MySQL

### Step 2: Copy API Files

1. **Locate your XAMPP htdocs folder:**
   - Windows: `C:\xampp\htdocs\`
   - macOS: `/Applications/XAMPP/htdocs/`
   - Linux: `/opt/lampp/htdocs/`

2. **Copy the `php-api` folder** from this project to htdocs:
   ```
   [Project Root]/php-api/ → [XAMPP]/htdocs/php-api/
   ```

3. **Verify the folder structure:**
   ```
   htdocs/
   └── php-api/
       ├── api/
       │   ├── auth/
       │   ├── items/
       │   ├── matches/
       │   └── upload/
       ├── config/
       ├── database/
       ├── models/
       ├── uploads/
       └── .htaccess
   ```

### Step 3: Create the Database

1. **Open phpMyAdmin:** http://localhost/phpmyadmin

2. **Import the database schema:**
   - Click "Import" in the top menu
   - Choose file: `php-api/database/schema.sql`
   - Click "Go" to execute

   **OR manually create:**
   - Click "SQL" tab
   - Copy and paste contents of `schema.sql`
   - Click "Go"

3. **Verify database creation:**
   - [ ] Database `findit_db` exists
   - [ ] Tables created: `users`, `profiles`, `user_roles`, `items`, `matches`
   - [ ] Admin user exists: `admin@findit.local`

### Step 4: Configure Database Connection

1. **Edit** `php-api/config/database.php` if needed:

   ```php
   private $host = "localhost";
   private $database = "findit_db";
   private $username = "root";
   private $password = ""; // Default XAMPP has no password
   ```

2. **If using custom MySQL credentials**, update accordingly.

### Step 5: Configure JWT Secret (IMPORTANT for Production)

1. **Edit** `php-api/config/jwt.php`:

   ```php
   define('JWT_SECRET', 'your-unique-secret-key-here');
   ```

2. **Generate a secure secret** (recommended 32+ characters):
   - Use a password generator
   - Or run: `openssl rand -base64 32`

### Step 6: Configure CORS (if needed)

1. **Edit** `php-api/config/cors.php` to allow your frontend URL:

   ```php
   $allowed_origins = [
       'http://localhost:5173',      // Vite dev server
       'http://localhost:3000',      // Alternative port
       'http://your-production-url.com'
   ];
   ```

### Step 7: Enable Apache Modules

1. **Open** `[XAMPP]/apache/conf/httpd.conf`

2. **Ensure these modules are enabled** (uncommented):
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   LoadModule headers_module modules/mod_headers.so
   ```

3. **Find the `<Directory>` block** for htdocs and set:
   ```apache
   AllowOverride All
   ```

4. **Restart Apache** from XAMPP Control Panel

### Step 8: Create Uploads Directory

1. **Create the uploads folder** if it doesn't exist:
   ```
   php-api/uploads/
   ```

2. **Set permissions** (Linux/macOS):
   ```bash
   chmod 755 php-api/uploads/
   ```

### Step 9: Test the API

1. **Test the API endpoint:**
   ```
   http://localhost/php-api/api/items/index.php
   ```
   Should return: `[]` or list of items

2. **Test authentication:**
   ```bash
   curl -X POST http://localhost/php-api/api/auth/login.php \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@findit.local","password":"admin123"}'
   ```
   Should return: JWT token and user data

---

## Part 2: Frontend Setup (React)

### Step 1: Install Dependencies

```bash
cd [project-root]
npm install
```

### Step 2: Configure Environment Variables

1. **Create** `.env.local` file in project root:

   ```env
   VITE_API_URL=http://localhost/php-api/api
   ```

2. **Alternative:** The app defaults to `http://localhost/php-api/api` if not set.

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:5173

### Step 4: Build for Production (Optional)

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## Part 3: Testing the Full Stack

### Test Checklist

- [ ] **Homepage loads** at http://localhost:5173
- [ ] **Registration works** - Create a new user account
- [ ] **Login works** - Login with the new account
- [ ] **Admin login works** - Login with `admin@findit.local` / `admin123`
- [ ] **Report item works** - Create a new lost/found item
- [ ] **Items list works** - View all reported items
- [ ] **Item details work** - Click on an item to view details
- [ ] **Dashboard works** - View user dashboard with stats

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** Browser console shows CORS policy errors

**Solution:**
- Check `php-api/config/cors.php` includes your frontend URL
- Ensure Apache `mod_headers` is enabled
- Restart Apache

#### 2. 404 Not Found on API
**Symptom:** API endpoints return 404

**Solution:**
- Enable `mod_rewrite` in Apache
- Check `.htaccess` file exists in `php-api/`
- Set `AllowOverride All` in httpd.conf
- Restart Apache

#### 3. Database Connection Failed
**Symptom:** API returns database connection error

**Solution:**
- Verify MySQL is running in XAMPP
- Check credentials in `config/database.php`
- Ensure `findit_db` database exists

#### 4. Login/Register Not Working
**Symptom:** Authentication fails with 500 error

**Solution:**
- Check PHP error logs: `[XAMPP]/apache/logs/error.log`
- Verify all PHP files have no syntax errors
- Ensure PDO extension is enabled

#### 5. Image Upload Fails
**Symptom:** Images don't upload

**Solution:**
- Verify `uploads/` directory exists
- Check write permissions on `uploads/`
- Check PHP `upload_max_filesize` in php.ini

---

## Quick Reference

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register.php` | POST | No | Register user |
| `/api/auth/login.php` | POST | No | Login user |
| `/api/auth/me.php` | GET | Yes | Get current user |
| `/api/items/index.php` | GET | No | List all items |
| `/api/items/index.php` | POST | Yes | Create item |
| `/api/items/single.php?id=X` | GET | No | Get item details |
| `/api/items/single.php?id=X` | PUT | Yes | Update item |
| `/api/items/single.php?id=X` | DELETE | Yes | Delete item |
| `/api/items/user.php` | GET | Yes | Get user's items |
| `/api/matches/index.php` | GET | Yes | Get matches |
| `/api/upload/image.php` | POST | Yes | Upload image |

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@findit.local | admin123 |

### Important Paths

| Component | Windows Path | Mac/Linux Path |
|-----------|--------------|----------------|
| XAMPP htdocs | `C:\xampp\htdocs\` | `/Applications/XAMPP/htdocs/` |
| PHP Config | `C:\xampp\php\php.ini` | `/Applications/XAMPP/etc/php.ini` |
| Apache Config | `C:\xampp\apache\conf\httpd.conf` | `/Applications/XAMPP/etc/httpd.conf` |
| Apache Logs | `C:\xampp\apache\logs\` | `/Applications/XAMPP/logs/` |

---

## Security Checklist (Before Production)

- [ ] Change JWT secret key in `config/jwt.php`
- [ ] Change admin password
- [ ] Update CORS settings for production URL only
- [ ] Set MySQL root password
- [ ] Enable HTTPS
- [ ] Review file upload restrictions
- [ ] Implement rate limiting
- [ ] Regular database backups

---

## Support

For issues:
1. Check Apache error logs
2. Check browser console for frontend errors
3. Test API endpoints directly with curl or Postman
4. Verify all services are running in XAMPP
