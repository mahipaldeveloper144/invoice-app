Act as a senior full-stack developer.

I want to build a complete Invoice & Customer Management Web Application using:

- Frontend: Next.js (App Router)
- Backend: Next.js API Routes (Serverless)
- Database: MongoDB Atlas
- Styling: Tailwind CSS
- Auth: JWT आधारित authentication

The system should be production-ready, scalable, and cleanly structured.

-----------------------------------
📌 CORE FEATURES
-----------------------------------

1. Authentication System
- Login / Signup
- JWT token based authentication
- Protected routes (Admin only access)
- Logout functionality

Validation:
- Email format validation
- Password min 6 characters

-----------------------------------

2. Dashboard
- Overview cards:
  - Total Customers
  - Total Invoices
  - Total Revenue
- Recent invoices list

-----------------------------------

3. Customer Management

Pages:
- Customer List Page
- Add Customer Page
- Edit Customer Page

Fields:
- Name (required)
- Phone (10 digits validation)
- Address
- GST Number (optional)

Actions:
- Add Customer
- Edit Customer
- Delete Customer (confirmation popup)

-----------------------------------

4. Product / Premix Management

Fields:
- Product Name
- Price
- Category (Cold Coco, Premix, Add-ons)

Actions:
- Add / Edit / Delete Product

-----------------------------------

5. Invoice Management (MAIN MODULE)

Create Invoice Page:

Fields:
- Select Customer (dropdown)
- Add multiple products
- Quantity input
- Price auto-fill
- GST % (e.g. 5%, 12%, 18%)

Auto Calculation:
- Subtotal
- GST Amount
- Total Amount

Options:
- GST Included / Excluded toggle

Buttons:
- Save Invoice
- Generate PDF
- Print Invoice

Validation:
- At least 1 product required
- Quantity > 0

-----------------------------------

6. Invoice List Page
- Table view:
  - Invoice No
  - Customer Name
  - Date
  - Total Amount

Actions:
- View Invoice
- Delete Invoice
- Download PDF

-----------------------------------

7. PDF Generation
- Clean invoice design
- Business name, logo
- Customer details
- Item table
- GST breakdown

-----------------------------------

8. Search & Filters
- Search by:
  - Customer Name
  - Invoice Number
- Date filter

-----------------------------------

9. API STRUCTURE

Create REST APIs:

Auth:
- POST /api/auth/login
- POST /api/auth/register

Customer:
- GET /api/customers
- POST /api/customers
- PUT /api/customers/:id
- DELETE /api/customers/:id

Products:
- GET /api/products
- POST /api/products

Invoices:
- POST /api/invoices
- GET /api/invoices
- GET /api/invoices/:id

-----------------------------------

10. DATABASE SCHEMA (MongoDB)

Customer:
{
  name,
  phone,
  address,
  gstNumber,
  createdAt
}

Product:
{
  name,
  price,
  category
}

Invoice:
{
  customerId,
  items: [
    { productId, quantity, price }
  ],
  subtotal,
  gst,
  total,
  createdAt
}

-----------------------------------

11. UI/UX REQUIREMENTS

- Mobile responsive
- Clean admin dashboard UI
- Sidebar navigation
- Toast notifications
- Loading states

-----------------------------------

12. DEPLOYMENT

- Frontend: Vercel
- Database: MongoDB Atlas

-----------------------------------

13. BONUS FEATURES

- Dark mode toggle
- Export to Excel
- WhatsApp invoice share button

-----------------------------------

IMPORTANT:
- Write clean, modular code
- Use reusable components
- Follow best practices
- Use environment variables for DB connection
- Include comments in code

-----------------------------------

OUTPUT FORMAT:
- Folder structure
- Step-by-step implementation
- Full working code