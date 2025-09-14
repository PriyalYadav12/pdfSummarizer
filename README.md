![Logo](https://github.com/Jadhav-Krishna/Adobe-PDF-Summarize/blob/main/public/icon.png?raw=true)

# PDF Document Processor

A Next.js web application that processes PDF documents to extract headings and generate AI-powered summaries using Google's Gemini API.

## Features

- **PDF Upload**: Drag-and-drop or click-to-upload interface for PDF files
- **Heading Extraction**: Automatically identifies and extracts document headings and section titles
- **AI Summarization**: Generates comprehensive summaries using AI
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Real-time Processing**: Live feedback during PDF processing with loading states
- **Error Handling**: Comprehensive error handling for file validation and API failures

## Getting Started

### Prerequisites

- Node.js 18+ 
- AI

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd pdf-document-processor
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Add your AI API key to `.env.local`:


5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Usage

1. **Upload PDF**: Click the upload area or drag and drop a PDF file
2. **Process**: Click "Process PDF" to analyze the document
3. **View Results**: Review extracted headings and AI-generated summary
4. **Process More**: Use "Process Another Document" to analyze additional files

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **AI Integration**: via AI SDK
- **Styling**: Tailwind CSS with shadcn/ui components
- **PDF Processing**: Direct PDF analysis through AI
- **TypeScript**: Full type safety throughout the application

## API Endpoints

### POST `/api/process-pdf`

Processes uploaded PDF files and returns extracted headings and summary.

**Request**: FormData with PDF file
**Response**: JSON with headings array and summary string

## Deployment

The application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `AI_API_KEY` environment variable in Vercel dashboard
4. Deploy
5. Visit your deployed application URL

## License

MIT License - see LICENSE file for details.
