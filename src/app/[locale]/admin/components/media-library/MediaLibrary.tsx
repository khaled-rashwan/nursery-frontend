'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../../../hooks/useAuth';
import { uploadImage } from '../../../../../services/storageService';

// Define the structure of a media item
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  uploadedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Define the props for the Media Library Modal
interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    width: '80%',
    maxWidth: '1200px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  imageContainer: {
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  footer: {
    borderTop: '1px solid #ccc',
    paddingTop: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
};

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const fetchMedia = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/mediaApi`;
      const response = await fetch(functionUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch media');
      const { data } = await response.json();
      setMedia(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    const file = event.target.files[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload the image using the existing service
      const storagePath = `media/${file.name}`;
      const downloadURL = await uploadImage(file, 'media', setUploadProgress);

      // 2. Save metadata to Firestore via our new mediaApi
      const token = await user.getIdToken();
      const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/mediaApi`;
      await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          url: downloadURL,
          path: storagePath,
        }),
      });

      // 3. Refresh media library to show the new image
      fetchMedia();
    } catch (error) {
      console.error('Upload and metadata creation failed:', error);
      // Optionally show an error message to the user
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  const handleDelete = async (mediaId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent image selection when clicking delete
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const token = await user.getIdToken();
        const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/mediaApi/${mediaId}`;
        const response = await fetch(functionUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete media');
        }

        // Unselect if the deleted media was selected
        if (selectedMedia?.id === mediaId) {
          setSelectedMedia(null);
        }

        fetchMedia(); // Refresh media list
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete media.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2>Media Library</h2>
          <button onClick={onClose} style={{...modalStyles.button, background: '#eee'}}>Close</button>
        </div>
        <div style={modalStyles.content}>
          {loading ? (
            <p>Loading media...</p>
          ) : (
            <div style={modalStyles.grid}>
              {media.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...modalStyles.imageContainer,
                    borderColor: selectedMedia?.id === item.id ? 'var(--primary-blue)' : 'transparent',
                  }}
                  onClick={() => setSelectedMedia(item)}
                >
                  <Image src={item.url} alt={item.filename} width={150} height={150} style={modalStyles.image} />
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(255, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={modalStyles.footer}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <div>
                <label htmlFor="media-upload" style={{...modalStyles.button, background: 'var(--primary-purple)', color: 'white'}}>
                  {uploading ? 'Uploading...' : 'Upload New Image'}
                </label>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
             </div>
             <button onClick={handleSelect} disabled={!selectedMedia} style={{...modalStyles.button, background: 'var(--primary-green)', color: 'white'}}>
                Select Image
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
