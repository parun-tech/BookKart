# 📚 BookKart: Premium Book Management MERN Stack App

Welcome to **BookKart**, a state-of-the-art MERN stack Bookstore featuring a highly polished **Deep Space Dark Theme** blended with modern **Glassmorphism**, Flipkart-style pricing/listings, and a fully functional Stripe Test Checkout integration.

---

## ✨ Features

### 🛡️ Administrator Panel
- **Dedicated Portal**: Clean login portal located at `/admin/login`.
- **Book CRUD Controls**: Seamlessly **Add**, **Edit**, and **Delete** books from a centralized administrative control center.
- **Dynamic Updates**: Modifying a book or creating a new entry updates the catalog interface instantly using reactive client state without requiring manual page refreshes.

### 👤 User Storefront
- **Flipkart-Style Cards**: Books are displayed with rating stars, reviews count, custom genre tags, original slash-through prices, and discount percentages (e.g. *30% off*).
- **Interactive Shopping Cart**: Add books, modify item quantities dynamically, or remove them with real-time subtotal updates.
- **Stripe Checkout**: Seamlessly complete purchases through the secure Stripe Checkout sandboxed test environment.
- **Library Vault**: A dedicated "My Books" column displaying all purchased books with a premium **eBook Reader overlay** to read chapters.

---

## 📁 Project Architecture & Folder Structure

The project code is fully modular, simple to understand, and structured as follows:

```text
book-management/
├── package.json                 # Core scripts to launch server & client concurrently
├── README.md                    # Setup and documentation guide
├── server/                      # Express + Mongoose Node.js Backend
│   ├── server.js                # Main API Entry point
│   ├── seed.js                  # Database seeder (mock books & admin account)
│   ├── config/                  # DB Connection setup
│   ├── middleware/              # JWT authorization & global error handlers
│   ├── models/                  # Mongo schemas (User, Book, Order)
│   └── routes/                  # REST Router mappings (Auth, Books, Cart)
└── client/                      # React.js + Vite Frontend
    ├── index.html
    ├── src/
    │   ├── main.jsx             # React entry
    │   ├── App.jsx              # Main routes and context layout
    │   ├── index.css            # Custom CSS Variables, premium glassmorphism rules
    │   ├── context/             # AuthContext and CartContext state engines
    │   ├── components/          # Navbar, ProtectedRoute, BookCard
    │   └── pages/               # Home, Cart, MyBooks, Logins, Success redirect
```

---

## 🛠️ Step-by-Step Installation & Setup

### 1. Configure Server Environment Variables
Open the `server/.env` file and insert your configuration:

```env
PORT=5000
NODE_ENV=development

# 1. MongoDB Atlas Cluster Connection String
# Replace with your actual MongoDB Atlas cluster connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/bookkart?retryWrites=true&w=majority

# 2. JWT authentication token key
JWT_SECRET=super_secret_jwt_token_key_change_me_in_production

# 3. Stripe Secret Sandbox Key (Optional - Mock Sandbox checkout activates if left empty!)
# Find yours at: dashboard.stripe.com -> Developers -> API keys -> Secret key (sk_test_...)
STRIPE_SECRET_KEY=sk_test_...

# 4. Client port
CLIENT_URL=http://localhost:5173
```

> [!NOTE]
> **Zero-Configuration Sandbox Checkout**: If you don't have a Stripe developer account yet, simply leave the `STRIPE_SECRET_KEY` empty or configured with `sk_test_mock...`! The backend will automatically activate a simulated developer sandbox checkout. This generates standard checkout links and fully completes mock payments successfully so you can test the full "My Books" integration instantly without configuring Stripe!

---

### 2. Install Project Dependencies
Run the command below at the root folder of the project. This will automatically execute `npm install` for the root, backend, and frontend concurrently!

```bash
npm run install-all
```

---

### 3. Seed Database Catalog (Highly Recommended 🚀)
To pre-load high-quality bookstore catalog entries with beautiful high-resolution cover images and setup a default Admin credential, execute the seeding script:

```bash
npm run seed
```

---

### 4. Boot Up the Application
Launch both the Express backend and React-Vite client servers simultaneously using a single command:

```bash
npm run dev
```

The frontend will start on **`http://localhost:5173`** and the server will start on **`http://localhost:5000`**.

---

## 🔑 Demo Access Credentials

If you populated the database using `npm run seed`, you can immediately log in using these demo credentials:

### 🛡️ Administrator User
- **Email**: `admin@bookkart.com`
- **Password**: `admin123`
- **Portal Link**: `http://localhost:5173/admin/login`

### 👤 Standard Customer User
Feel free to sign up a fresh account directly using the **Register** link on the home page, or log in after registering. Any new user can instantly buy books using Stripe cards (or sandbox checkout) and read them immediately!
