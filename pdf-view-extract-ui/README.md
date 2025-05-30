
# PDF Extraction Demo

A professional, interactive web application for PDF data extraction built with React, Vite, Tailwind CSS, and DaisyUI.

## Features

- **Modern UI**: Built with Tailwind CSS and DaisyUI components
- **PDF Viewer**: Interactive PDF viewing with react-pdf
- **Data Extraction**: Displays extracted supplier info and product tables
- **File Management**: Upload and switch between multiple PDFs
- **Responsive Design**: Mobile-friendly two-column layout
- **Dark/Light Mode**: Theme toggle with persistent settings
- **Animations**: Smooth transitions with Framer Motion
- **Data Table**: Sortable and paginated product listings

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **PDF Viewing**: react-pdf
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Backend**: FastAPI (localhost:8000)

## Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Start your FastAPI backend:**
Make sure your FastAPI server is running on `http://localhost:8000` with these endpoints:
- `POST /upload` - Upload PDF files
- `GET /files` - List uploaded files
- `GET /files/{filename}/preview` - Get PDF preview
- `GET /data/{filename}` - Get extracted data

4. **Open browser:**
Navigate to `http://localhost:8080`

## Project Structure

```
src/
├── components/
│   ├── ThemeToggle.tsx     # Dark/light mode switch
│   ├── FileList.tsx        # PDF file selector dropdown
│   ├── Uploader.tsx        # File upload component
│   ├── PdfViewer.tsx       # PDF display with navigation
│   └── DataPanel.tsx       # Extracted data display
├── pages/
│   ├── Index.tsx           # Main application page
│   └── NotFound.tsx        # 404 page
├── App.tsx                 # Root component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## API Integration

The app expects these FastAPI endpoints:

- `POST /upload` - Accepts multipart/form-data with 'file' field
- `GET /files` - Returns `{"files": ["filename1.pdf", "filename2.pdf"]}`
- `GET /files/{filename}/preview` - Returns PDF file for viewing
- `GET /data/{filename}` - Returns extracted data:
```json
{
  "supplier_name": "Company Name",
  "order_number": "ORD-12345",
  "products": [
    {
      "sku": "ABC123",
      "description": "Product description",
      "unit_price": 10.99,
      "total_price": 21.98
    }
  ]
}
```

## Usage

1. **Upload PDF**: Click "Upload PDF" button and select a file
2. **View PDF**: Select uploaded files from the dropdown to view
3. **Extract Data**: Extracted supplier info and products display automatically
4. **Navigate**: Use page controls to navigate multi-page PDFs
5. **Sort Data**: Click table headers to sort product data
6. **Theme**: Toggle between light and dark modes

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
