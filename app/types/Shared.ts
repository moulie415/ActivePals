export default interface ImagePickerOptions {
  title?: string;
  cancelButtonTitle?: string;
  takePhotoButtonTitle?: string;
  chooseFromLibraryButtonTitle?: string;
  customButtons?: Array<CustomButtonOptions>;
  cameraType?: 'front' | 'back';
  mediaType?: 'photo' | 'video' | 'mixed';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  videoQuality?: 'low' | 'medium' | 'high';
  durationLimit?: number;
  rotation?: number;
  allowsEditing?: boolean;
  noData?: boolean;
  storageOptions?: StorageOptions;
}

interface CustomButtonOptions {
  name?: string;
  title?: string;
}

interface StorageOptions {
  skipBackup?: boolean;
  path?: string;
  cameraRoll?: boolean;
  waitUntilSaved?: boolean;
}