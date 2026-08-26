import { useState } from 'react'
import { PDFProvider, usePDFContext } from './context/PDFContext'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import PDFViewer from './components/PDFViewer'
import DropZone from './components/DropZone'
import { useDropzone } from 'react-dropzone'
import { usePDF } from './hooks/usePDF'

function AppLayout() {
  const { tabs, darkMode } = usePDFContext()
  const { loadFile } = usePDF()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Global drag-and-drop on the whole app window
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files.forEach(loadFile),
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}
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

      <TabBar />
      <Toolbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} />

      <div className="flex flex-1 min-h-0">
        {tabs.length > 0 && <Sidebar open={sidebarOpen} />}
        {tabs.length > 0 ? <PDFViewer /> : <DropZone />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PDFProvider>
      <AppLayout />
    </PDFProvider>
  )
}
