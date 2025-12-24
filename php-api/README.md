# FindIt PHP REST API

A PHP REST API for the FindIt Lost & Found application, designed to work with XAMPP and MySQL.

## Setup Instructions

### 1. Install XAMPP
Download and install XAMPP from https://www.apachefriends.org/

### 2. Copy API Files
Copy the entire `php-api` folder to your XAMPP htdocs directory:
```
C:\xampp\htdocs\php-api\
```

### 3. Create Database
1. Start XAMPP (Apache + MySQL)
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Run the SQL script in `database/schema.sql`
   - Or import it via phpMyAdmin's Import feature

### 4. Configure Database Connection
Edit `config/database.php` if needed:
```php
private $host = "localhost";
private $database = "findit_db";
private $username = "root";
private $password = ""; // XAMPP default
```

### 5. Update JWT Secret
Edit `config/jwt.php` and change the secret key:
```php
define('JWT_SECRET', 'your-secure-random-string-here');
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register.php` | Register new user |
| POST | `/api/auth/login.php` | Login user |
| GET | `/api/auth/me.php` | Get current user |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items/index.php` | Get all items |
| POST | `/api/items/index.php` | Create item (auth required) |
| GET | `/api/items/single.php?id={id}` | Get single item |
| PUT | `/api/items/single.php?id={id}` | Update item (auth required) |
| DELETE | `/api/items/single.php?id={id}` | Delete item (auth required) |
| GET | `/api/items/user.php` | Get user's items (auth required) |
| POST | `/api/items/qrcode.php` | Generate QR code (auth required) |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/index.php` | Get user's matches (auth required) |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image.php` | Upload image (auth required) |

## Authentication

Use Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Example Requests

### Register
```bash
curl -X POST http://localhost/php-api/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","full_name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost/php-api/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Item
```bash
curl -X POST http://localhost/php-api/api/items/index.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"lost","title":"iPhone 15","category":"electronics","location":"Library","date_occurred":"2024-12-20"}'
```

## Updating React Frontend

Replace Supabase imports with API calls. Create a new service file:

```typescript
// src/services/api.ts
const API_URL = 'http://localhost/php-api/api';

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  
  async getItems() {
    const res = await fetch(`${API_URL}/items/index.php`);
    return res.json();
  },
  
  // ... more methods
};
```

## Default Admin Account
- Email: admin@findit.local
- Password: admin123

## Troubleshooting

### CORS Issues
The API includes CORS headers. If you still have issues:
1. Check Apache mod_headers is enabled
2. Verify the frontend URL is allowed

### Database Connection Failed
1. Ensure MySQL is running in XAMPP
2. Check database credentials in `config/database.php`
3. Verify the database exists

### 404 Errors
1. Ensure mod_rewrite is enabled in Apache
2. Check .htaccess file is present
3. Verify AllowOverride is set to All in httpd.conf
