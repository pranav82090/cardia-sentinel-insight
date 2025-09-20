-- Allow users to delete their own heart recordings
CREATE POLICY "Users can delete their own recordings" 
ON public.heart_recordings 
FOR DELETE 
USING (auth.uid() = user_id);