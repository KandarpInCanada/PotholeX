-- Create a function to increment likes for a report
CREATE OR REPLACE FUNCTION public.increment_likes(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pothole_reports
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = report_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_likes(UUID) TO authenticated;