-- Insert a test booking for debugging stage progression
INSERT INTO public.bookings (
  service_type,
  service_name,
  date,
  time,
  address,
  phone,
  status,
  total_amount,
  tracking_stage,
  pickup_option,
  stage_timestamps,
  item_count,
  created_at,
  updated_at
) VALUES (
  'dry_cleaning',
  'Dry Cleaning Service',
  '2024-01-15',
  '10:00:00',
  '123 Test Street, Test City, State 12345',
  '+1234567890',
  'in_progress',
  25.00,
  'stain_removing',
  'pickup',
  '{"sorting": "2024-01-15T09:00:00Z", "stain_removing": "2024-01-15T09:30:00Z"}',
  3,
  NOW(),
  NOW()
);

-- Check if the booking was inserted
SELECT id, service_name, tracking_stage, pickup_option, stage_timestamps 
FROM public.bookings 
WHERE service_type = 'dry_cleaning' 
ORDER BY created_at DESC 
LIMIT 5;