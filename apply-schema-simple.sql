-- Apply Enhanced Order Tracking Schema
-- Copy and paste this entire file into your Supabase SQL Editor

-- Step 1: Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS tracking_stage TEXT DEFAULT 'sorting',
ADD COLUMN IF NOT EXISTS pickup_option TEXT DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stage_notes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tracking_history JSONB DEFAULT '[]';

-- Step 2: Update existing records
UPDATE bookings 
SET tracking_stage = 'sorting', pickup_option = 'pickup'
WHERE tracking_stage IS NULL AND service_type = 'dry_cleaning';

-- Step 3: Create the get_tracking_progress function
CREATE OR REPLACE FUNCTION get_tracking_progress(booking_id UUID)
RETURNS JSON AS $$
DECLARE
    booking_record RECORD;
    progress_data JSON;
BEGIN
    -- Get booking details
    SELECT * INTO booking_record
    FROM bookings
    WHERE id = booking_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Booking not found');
    END IF;
    
    -- Build progress data
    progress_data := json_build_object(
        'booking_id', booking_record.id,
        'tracking_stage', COALESCE(booking_record.tracking_stage, 'sorting'),
        'pickup_option', COALESCE(booking_record.pickup_option, 'pickup'),
        'stage_timestamps', COALESCE(booking_record.stage_timestamps, '{}'),
        'stage_notes', COALESCE(booking_record.stage_notes, '{}'),
        'tracking_history', COALESCE(booking_record.tracking_history, '[]'),
        'service_type', booking_record.service_type,
        'status', booking_record.status,
        'created_at', booking_record.created_at
    );
    
    RETURN progress_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the update_tracking_stage function
CREATE OR REPLACE FUNCTION update_tracking_stage(
    booking_id UUID,
    new_stage TEXT,
    stage_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    booking_record RECORD;
    updated_timestamps JSONB;
    updated_notes JSONB;
    updated_history JSONB;
    history_entry JSONB;
BEGIN
    -- Get current booking
    SELECT * INTO booking_record
    FROM bookings
    WHERE id = booking_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Booking not found');
    END IF;
    
    -- Update timestamps
    updated_timestamps := COALESCE(booking_record.stage_timestamps, '{}');
    updated_timestamps := updated_timestamps || json_build_object(new_stage, NOW());
    
    -- Update notes if provided
    updated_notes := COALESCE(booking_record.stage_notes, '{}');
    IF stage_note IS NOT NULL THEN
        updated_notes := updated_notes || json_build_object(new_stage, stage_note);
    END IF;
    
    -- Add to history
    updated_history := COALESCE(booking_record.tracking_history, '[]');
    history_entry := json_build_object(
        'stage', new_stage,
        'timestamp', NOW(),
        'note', stage_note
    );
    updated_history := updated_history || history_entry;
    
    -- Update the booking
    UPDATE bookings
    SET 
        tracking_stage = new_stage,
        stage_timestamps = updated_timestamps,
        stage_notes = updated_notes,
        tracking_history = updated_history,
        updated_at = NOW()
    WHERE id = booking_id;
    
    RETURN json_build_object(
        'success', true,
        'booking_id', booking_id,
        'new_stage', new_stage,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_tracking_stage ON bookings(tracking_stage);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_option ON bookings(pickup_option);

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_tracking_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tracking_stage(UUID, TEXT, TEXT) TO authenticated;

-- Verification query - run this to test
SELECT 'Schema applied successfully!' as message;