\# AI-Powered Personal Document Analyzer



An AI-powered web application that helps users upload, understand, summarize, and compare documents using Google Gemini AI. It supports PDF, DOCX, and TXT files, including OCR for scanned PDFs.



\## Features



\- \*\*Document Upload:\*\* Upload PDF, DOCX, and TXT files.

\- \*\*Text Extraction:\*\* Extract text from supported document formats.

\- \*\*OCR Support:\*\* Recognize text from scanned PDF pages using Tesseract OCR.

\- \*\*AI Summarization:\*\* Generate concise summaries of uploaded documents.

\- \*\*Information Extraction:\*\* Identify key facts, people, organizations, dates, deadlines, requirements, and amounts.

\- \*\*Document Chat:\*\* Ask questions about an uploaded document and receive answers with page citations when available.

\- \*\*Document Comparison:\*\* Compare two documents to identify similarities, differences, and conflicting details.

\- \*\*Responsive UI:\*\* Clean interface designed for desktop and mobile screens.

\- \*\*File Validation:\*\* Restrict supported formats and uploads to 10 MB.



\## Technology Stack



\### Frontend

\- React

\- Vite

\- JavaScript

\- CSS



\### Backend

\- Python

\- FastAPI

\- Uvicorn

\- PyMuPDF

\- python-docx

\- Pillow

\- pytesseract



\### AI

\- Google Gemini API

\- Google Gen AI Python SDK



\## Project Structure



```text

ai-personal-document-analyzer/

├── backend/

│   ├── .gitignore

│   ├── main.py

│   └── .env                 # Create locally; never commit

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

└── README.md

```



\## Prerequisites



Install the following before running the application:



\- Python 3.10 or later

\- Node.js and npm

\- A Google Gemini API key

\- Tesseract OCR installed on your computer for scanned PDF text recognition



\## Installation and Setup



\### 1. Clone the repository



```powershell

git clone https://github.com/dinesh-5033/ai-personal-document-analyzer.git

cd ai-personal-document-analyzer

```



\### 2. Set up the backend



Open PowerShell in the project directory:



```powershell

cd backend

python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1

```



Install the Python dependencies:



```powershell

python -m pip install fastapi uvicorn python-multipart pymupdf python-docx Pillow pytesseract python-dotenv google-genai

```



\### 3. Configure environment variables



Create a file named `.env` inside the `backend` directory.



Add your own Gemini API key and model configuration:



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key\_here

GEMINI\_MODEL=your\_supported\_gemini\_model

```



Replace the placeholder values with your own valid credentials and a model available to your API key.



\*\*Security:\*\* Never commit your `.env` file or share your API key publicly.



\### 4. Install Tesseract OCR



Install Tesseract OCR for Windows and ensure its executable is available in your system PATH.



If Tesseract is installed but not found automatically, configure the executable path in `backend/main.py` using the commented configuration provided in the source file.



\### 5. Start the backend server



From the `backend` directory, run:



```powershell

python -m uvicorn main:app --reload --port 8000

```



The backend API will be available at:



\- API: http://127.0.0.1:8000

\- API documentation: http://127.0.0.1:8000/docs

\- Health check: http://127.0.0.1:8000/api/health



Keep this terminal running.



\### 6. Set up the frontend



Open a second PowerShell terminal:



```powershell

cd path\\

