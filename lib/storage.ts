import { supabase, supabaseUrl } from "./supabase";

const BUCKET_NAME = "study-materials";

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
            });
            console.log(`Created ${BUCKET_NAME} bucket`);
        }
    } catch (error) {
        console.error("Error initializing bucket:", error);
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
