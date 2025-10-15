-- Enhance order tracking system for dry cleaning orders
-- Run this in the Supabase SQL Editor

-- Add new columns to bookings table for detailed tracking stages
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS tracking_stage TEXT DEFAULT 'sorting' CHECK (tracking_stage IN ('sorting', 'stain_removing', 'washing', 'ironing', 'packing', 'ready_for_delivery', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered')),
ADD COLUMN IF NOT EXISTS pickup_option TEXT DEFAULT 'pickup' CHECK (pickup_option IN ('pickup', 'delivery')),
ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stage_notes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tracking_history JSONB DEFAULT '[]';

-- Update existing records to have proper tracking stage
UPDATE public.bookings 
SET tracking_stage = CASE 
  WHEN status = 'pending' THEN 'sorting'
  WHEN status = 'confirmed' THEN 'sorting'
  WHEN status = 'in_progress' THEN 'washing'
  WHEN status = 'completed' AND delivery_status = 'delivered' THEN 'delivered'
  WHEN status = 'completed' AND pickup_status = 'picked_up' THEN 'picked_up'
  ELSE 'sorting'
END
WHERE service_type = 'dry_cleaning' OR service_name ILIKE '%dry%';

-- Create function to update tracking stage with timestamp
CREATE OR REPLACE FUNCTION update_tracking_stage(
  booking_id UUID,
  new_stage TEXT,
  admin_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_timestamps JSONB;
  current_history JSONB;
  new_history_entry JSONB;
BEGIN
  -- Get current timestamps and history
  SELECT stage_timestamps, tracking_history 
  INTO current_timestamps, current_history
  FROM public.bookings 
  WHERE id = booking_id;
  
  -- Add timestamp for new stage
  current_timestamps = COALESCE(current_timestamps, '{}'::JSONB) || 
    jsonb_build_object(new_stage, NOW());
  
  -- Create history entry
  new_history_entry = jsonb_build_object(
    'stage', new_stage,
    'timestamp', NOW(),
    'notes', COALESCE(admin_notes, '')
  );
  
  -- Add to history array
  current_history = COALESCE(current_history, '[]'::JSONB) || 
    jsonb_build_array(new_history_entry);
  
  -- Update the booking
  UPDATE public.bookings 
  SET 
    tracking_stage = new_stage,
    stage_timestamps = current_timestamps,
    tracking_history = current_history,
    updated_at = NOW()
  WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get tracking progress for a booking
CREATE OR REPLACE FUNCTION get_tracking_progress(booking_id UUID)
RETURNS TABLE (
  stage_name TEXT,
  stage_label TEXT,
  completed BOOLEAN,
  timestamp TIMESTAMPTZ,
  notes TEXT
) AS $$
DECLARE
  booking_record RECORD;
  stage_order TEXT[] := ARRAY['sorting', 'stain_removing', 'washing', 'ironing', 'packing', 'ready_for_delivery'];
  pickup_stages TEXT[] := ARRAY['ready_for_pickup', 'picked_up'];
  delivery_stages TEXT[] := ARRAY['out_for_delivery', 'delivered'];
  current_stage_index INTEGER;
  stage_text TEXT;
  stage_completed BOOLEAN;
  stage_timestamp TIMESTAMPTZ;
  stage_notes TEXT;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record 
  FROM public.bookings 
  WHERE id = booking_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find current stage index
  current_stage_index := array_position(stage_order, booking_record.tracking_stage);
  
  -- Return progress for main stages
  FOR i IN 1..array_length(stage_order, 1) LOOP
    stage_text := stage_order[i];
    stage_completed := (current_stage_index IS NOT NULL AND i <= current_stage_index) OR 
                      booking_record.tracking_stage = ANY(pickup_stages || delivery_stages);
    
    -- Get timestamp if exists
    stage_timestamp := NULL;
    IF booking_record.stage_timestamps ? stage_text THEN
      stage_timestamp := (booking_record.stage_timestamps ->> stage_text)::TIMESTAMPTZ;
    END IF;
    
    -- Get notes if exists
    stage_notes := '';
    IF booking_record.stage_notes ? stage_text THEN
      stage_notes := booking_record.stage_notes ->> stage_text;
    END IF;
    
    -- Return row with proper label
    stage_name := stage_text;
    stage_label := CASE stage_text
      WHEN 'sorting' THEN 'Sorting'
      WHEN 'stain_removing' THEN 'Stain Removing'
      WHEN 'washing' THEN 'Washing'
      WHEN 'ironing' THEN 'Ironing'
      WHEN 'packing' THEN 'Packing'
      WHEN 'ready_for_delivery' THEN 'Ready to be Delivered'
    END;
    
    RETURN NEXT;
  END LOOP;
  
  -- Return final stage based on pickup option
  IF booking_record.pickup_option = 'pickup' THEN
    -- Pickup stages
    FOR i IN 1..array_length(pickup_stages, 1) LOOP
      stage_text := pickup_stages[i];
      stage_completed := booking_record.tracking_stage = stage_text OR 
                        (i = 1 AND booking_record.tracking_stage = pickup_stages[2]);
      
      stage_timestamp := NULL;
      IF booking_record.stage_timestamps ? stage_text THEN
        stage_timestamp := (booking_record.stage_timestamps ->> stage_text)::TIMESTAMPTZ;
      END IF;
      
      stage_notes := '';
      IF booking_record.stage_notes ? stage_text THEN
        stage_notes := booking_record.stage_notes ->> stage_text;
      END IF;
      
      stage_name := stage_text;
      stage_label := CASE stage_text
        WHEN 'ready_for_pickup' THEN 'Ready for Pickup'
        WHEN 'picked_up' THEN 'Picked Up'
      END;
      
      RETURN NEXT;
    END LOOP;
  ELSE
    -- Delivery stages
    FOR i IN 1..array_length(delivery_stages, 1) LOOP
      stage_text := delivery_stages[i];
      stage_completed := booking_record.tracking_stage = stage_text OR 
                        (i = 1 AND booking_record.tracking_stage = delivery_stages[2]);
      
      stage_timestamp := NULL;
      IF booking_record.stage_timestamps ? stage_text THEN
        stage_timestamp := (booking_record.stage_timestamps ->> stage_text)::TIMESTAMPTZ;
      END IF;
      
      stage_notes := '';
      IF booking_record.stage_notes ? stage_text THEN
        stage_notes := booking_record.stage_notes ->> stage_text;
      END IF;
      
      stage_name := stage_text;
      stage_label := CASE stage_text
        WHEN 'out_for_delivery' THEN 'Out for Delivery'
        WHEN 'delivered' THEN 'Delivered'
      END;
      
      RETURN NEXT;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_tracking_stage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tracking_progress(UUID) TO authenticated;

-- Create admin policy for updating tracking stages
CREATE POLICY "Admins can update tracking stages" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@cleaningservice.com', 'manager@cleaningservice.com')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_tracking_stage ON public.bookings(tracking_stage);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_option ON public.bookings(pickup_option);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON public.bookings(service_type);