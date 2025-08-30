'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../../../hooks/useAuth';
import { uploadImage } from '../../../../../services/storageService';
import { MediaItem } from './MediaLibrary'; // Reuse the MediaItem interface

// Define props for the component, if any are needed in the future
interface MediaManagementProps {
  locale: string;
}

const pageStyles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: 0,
  },
  content: {
    overflowY: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  imageContainer: {
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
    fontWeight: 'bold'
  },
};

export default function MediaManagement({ locale }: MediaManagementProps) {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const fetchMedia = useCallback(async () => {
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
    fetchMedia();
  }, [fetchMedia]);

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    const files = Array.from(event.target.files);
    setUploading(true);
    setUploadProgress({});

    const uploadPromises = files.map(async (file) => {
      try {
        const storagePath = `media/${Date.now()}_${file.name}`;

        const downloadURL = await uploadImage(file, 'media', (progress) => {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        });

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
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        // Optionally, update state to show which files failed
      }
    });

    await Promise.all(uploadPromises);

    setUploading(false);
    fetchMedia(); // Refresh the media library
  };

  const handleDelete = async (mediaId: string) => {
    if (!user) return;

    const confirmationMessage = locale === 'ar-SA'
      ? 'هل أنت متأكد أنك تريد حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to delete this image? This action cannot be undone.';

    if (window.confirm(confirmationMessage)) {
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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete media');
        }

        // Refresh media list after successful deletion
        fetchMedia();

      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete media. Please check the console for details.');
      }
    }
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <h2 style={pageStyles.title}>{locale === 'ar-SA' ? 'إدارة الوسائط' : 'Media Management'}</h2>
        {/* Bulk Upload Button */}
        <div>
          <label htmlFor="bulk-media-upload" style={{...pageStyles.button, background: 'var(--primary-purple)', color: 'white', cursor: 'pointer'}}>
            {uploading ? (locale === 'ar-SA' ? 'جاري الرفع...' : 'Uploading...') : (locale === 'ar-SA' ? 'رفع صور متعددة' : 'Bulk Upload Images')}
          </label>
          <input
            id="bulk-media-upload"
            type="file"
            accept="image/*"
            multiple={true}
            onChange={handleBulkUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>
      </div>
      <div style={pageStyles.content}>
        {uploading && (
          <div style={{ marginBottom: '1rem' }}>
            <h4>{locale === 'ar-SA' ? 'جاري الرفع...' : 'Uploading...'}</h4>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} style={{ marginBottom: '0.5rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{filename}</p>
                <div style={{ background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: 'var(--primary-green)', height: '10px' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loading ? (
          <p>{locale === 'ar-SA' ? 'جاري تحميل الوسائط...' : 'Loading media...'}</p>
        ) : (
          <div style={pageStyles.grid}>
            {media.map((item) => (
              <div
                key={item.id}
                style={pageStyles.imageContainer}
              >
                <Image src={item.url} alt={item.filename} width={150} height={150} style={pageStyles.image} />
                {/* Delete button will be added here */}
                <button
                  onClick={() => handleDelete(item.id)}
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
                    cursor: 'pointer'
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
