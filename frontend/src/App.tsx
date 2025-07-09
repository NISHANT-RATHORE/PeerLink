import { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileDownload from './components/FileDownload';
import InviteCode from './components/InviteCode';
import axios from 'axios';

function App() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [port, setPort] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        setIsUploading(true);
        setPort(null); // Reset port on new upload

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            console.log('Uploading file to backend:', backendUrl);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${backendUrl}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setPort(response.data.port);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please ensure the backend is running and try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (portToDownload: number) => {
        setIsDownloading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.get(`${backendUrl}/api/download/${portToDownload}`, {
                responseType: 'blob',
            });

            const contentDisposition = response.headers['content-disposition'];
            const mimeType = response.headers['content-type'] || 'application/octet-stream';
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            let filename = 'downloaded-file';

            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=(['"]?)([^;\n]*)\1/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[2]) {
                    filename = decodeURIComponent(matches[2]);
                }
            }

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please check the invite code and try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Set body font family via style - an easy way to apply the Google Font
    document.body.style.fontFamily = "'Inter', sans-serif";

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">PeerLink</h1>
                    <p className="text-xl text-gray-600">Secure P2P File Sharing</p>
                </header>

                <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                    <div className="flex border-b mb-6">
                        <button
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'upload'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('upload')}
                        >
                            Share a File
                        </button>
                        <button
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'download'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('download')}
                        >
                            Receive a File
                        </button>
                    </div>

                    {activeTab === 'upload' ? (
                        <div>
                            <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />

                            {uploadedFile && !isUploading && (
                                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                    <p className="text-sm text-gray-700">
                                        Selected file: <span className="font-medium">{uploadedFile.name}</span> ({Math.round(uploadedFile.size / 1024)} KB)
                                    </p>
                                </div>
                            )}

                            {isUploading && (
                                <div className="mt-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-2 text-gray-600">Uploading file...</p>
                                </div>
                            )}

                            <InviteCode port={port} />
                        </div>
                    ) : (
                        <div>
                            <FileDownload onDownload={handleDownload} isDownloading={isDownloading} />

                            {isDownloading && (
                                <div className="mt-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-2 text-gray-600">Downloading file...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center text-gray-500 text-sm">
                    <p>PeerLink © 2025 - Secure P2P File Sharing</p>
                </footer>
            </div>
        </main>
    );
}

export default App;