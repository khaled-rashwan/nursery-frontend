import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';

const storage = getStorage(app);

/**
 * Uploads an image file to Firebase Storage.
 *
 * @param file The image file to upload.
 * @param path The path in Firebase Storage where the file should be saved (e.g., 'images/hero').
 * @param onProgress A callback function to track the upload progress.
 * @param customFileName Optional custom filename. If not provided, uses the original file name.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadImage = (
  file: File,
  path: string,
  onProgress: (progress: number) => void,
  customFileName?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file provided.');
      return;
    }

    const fileName = customFileName || file.name;
    const storageRef = ref(storage, `${path}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};
