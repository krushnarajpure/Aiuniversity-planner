import { supabase, supabaseUrl } from "./supabase";

const BUCKET_NAME = "study-materials";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const AVATAR_BUCKET_NAME = "profile-avatars";
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Initialize the study materials bucket if it doesn't exist
 */
export async function initializeBucket() {
    try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        
        const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
        
        if (!bucketExists) {
            // Create bucket if it doesn't exist
            await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
            });
            console.log(`Created ${BUCKET_NAME} bucket`);
        } else {
            await supabase.storage.updateBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
            });
        }
    } catch (error) {
        console.error("Error initializing bucket:", error);
    }
}

async function ensureBucket(bucketName: string, maxFileSize: number) {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

        if (!bucketExists) {
            await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: maxFileSize,
            });
        } else {
            await supabase.storage.updateBucket(bucketName, {
                public: true,
                fileSizeLimit: maxFileSize,
            });
        }
    } catch (error) {
        console.error(`Error initializing ${bucketName} bucket:`, error);
    }
}

export async function initializeAvatarBucket() {
    await ensureBucket(AVATAR_BUCKET_NAME, MAX_AVATAR_FILE_SIZE);
}

export async function uploadProfileImageToSupabase(file: File, userId: string): Promise<string> {
    await initializeAvatarBucket();

    const filePath = `avatars/${userId}/profile`;
    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage.from(AVATAR_BUCKET_NAME).upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
    });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
}

export async function removeProfileImageFromSupabase(userId: string) {
    const filePath = `avatars/${userId}/profile`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET_NAME).remove([filePath]);

    if (error) {
        console.error(`Error deleting profile image: ${error.message}`);
    }
}

/**
 * Upload a file to Supabase Storage
 * 
 * @param file - File to upload
 * @param userId - User ID
 * @param subject - Subject name
 * @param materialId - Material ID
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToSupabase(
    file: File,
    userId: string,
    subject: string,
    materialId: string
): Promise<string> {
    try {
        // Ensure bucket exists
        await initializeBucket();
        
        // Create unique file path
        const fileExtension = file.name.split(".").pop() || "bin";
        const fileName = `${materialId}.${fileExtension}`;
        const filePath = `${userId}/${subject}/${fileName}`;
        
        // Convert file to buffer
        const buffer = await file.arrayBuffer();
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true, // Overwrite if exists
            });
        
        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        
        // Return public URL
        const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
        
        return publicData.publicUrl;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

/**
 * Delete a file from Supabase Storage
 * 
 * @param userId - User ID
 * @param subject - Subject name
 * @param materialId - Material ID
 */
export async function deleteFileFromSupabase(
    userId: string,
    subject: string,
    materialId: string,
    fileExtension: string
) {
    try {
        const fileName = `${materialId}.${fileExtension}`;
        const filePath = `${userId}/${subject}/${fileName}`;
        
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);
        
        if (error) {
            console.error(`Error deleting file: ${error.message}`);
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

/**
 * Get public URL for a stored file
 */
export function getPublicUrl(userId: string, subject: string, materialId: string, fileExtension: string): string {
    const fileName = `${materialId}.${fileExtension}`;
    const filePath = `${userId}/${subject}/${fileName}`;
    
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
}
