import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PDFProvider } from './context/PDFContext'
import { usePDFContext } from './hooks/usePDFContext'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import PDFViewer from './components/PDFViewer'
import DropZone from './components/DropZone'
import LibraryPage from './pages/LibraryPage'
import { useDropzone } from 'react-dropzone'
import { usePDF } from './hooks/usePDF'

function ReaderView() {
  const { tabs } = usePDFContext()
  const { loadFile } = usePDF()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Global drag-and-drop on the reader page window
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files.forEach(loadFile),
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div
      {...getRootProps()}
      className="flex flex-col flex-1 overflow-hidden relative"
    >
      <input {...getInputProps()} />

      {/* Global drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 backdrop-blur-sm border-4 border-dashed border-indigo-500 pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-2xl font-bold text-indigo-300">Soltá el PDF aquí</p>
          </div>
        </div>
      )}

      <Toolbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} />

      <div className="flex flex-1 min-h-0">
        {tabs.length > 0 && <Sidebar open={sidebarOpen} />}
        {tabs.length > 0 ? <PDFViewer /> : <DropZone />}
      </div>
    </div>
  )
}

function MainLayout() {
  const { darkMode } = usePDFContext()

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}>
      <TabBar />
      <div className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/reader" replace />} />
          <Route path="/reader" element={<ReaderView />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PDFProvider>
        <MainLayout />
      </PDFProvider>
    </BrowserRouter>
  )
}
