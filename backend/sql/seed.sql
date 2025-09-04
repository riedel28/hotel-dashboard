-- Seed data for reservations and guests tables
-- Run this after creating the schema

-- Insert reservations
INSERT INTO reservations (
  id,
  state,
  guest_email,
  primary_guest_name,
  booking_nr,
  room_name,
  booking_from,
  booking_to,
  check_in_via,
  check_out_via,
  booking_id,
  completed_at,
  last_opened_at,
  received_at,
  updated_at,
  page_url,
  balance,
  adults,
  youth,
  children,
  infants,
  purpose,
  room
) VALUES
(1, 'done', 'sarah.wilson@email.com', 'Sarah Wilson', 'BK-2024-001', 'Deluxe Suite 101', '2024-12-15T14:00:00.000Z', '2024-12-18T11:00:00.000Z', 'web', 'station', 'BK001', '2024-12-18T10:30:00.000Z', '2024-12-18T10:30:00.000Z', '2024-12-10T09:15:00.000Z', '2024-12-18T10:30:00.000Z', 'https://hotel.com/checkin/BK001', 0, 2, 1, 1, 1, 'private', 'Deluxe Suite 101'),
(2, 'started', 'michael.chen@email.com', 'Michael Chen', 'BK-2024-002', 'Standard Room 205', '2024-12-20T15:00:00.000Z', '2024-12-23T11:00:00.000Z', 'android', 'ios', 'BK002', '2024-12-23T10:45:00.000Z', '2024-12-20T14:45:00.000Z', '2024-12-12T14:20:00.000Z', '2024-12-23T10:45:00.000Z', 'https://hotel.com/checkin/BK002', 450.00, 2, 1, 1, 1, 'business', 'Standard Room 205'),
(3, 'pending', 'anna.kowalski@email.com', 'Anna Kowalski', 'BK-2024-003', 'Premium Room 301', '2024-12-25T16:00:00.000Z', '2024-12-28T11:00:00.000Z', 'tv', 'web', 'BK003', '2024-12-28T10:00:00.000Z', '2024-12-14T11:30:00.000Z', '2024-12-14T11:30:00.000Z', NULL, 'https://hotel.com/checkin/BK003', 780.50, 2, 1, 1, 1, 'private', 'Premium Room 301'),
(4, 'done', 'james.rodriguez@email.com', 'James Rodriguez', 'BK-2024-004', 'Deluxe Suite 102', '2024-12-10T14:00:00.000Z', '2024-12-13T11:00:00.000Z', 'station', 'android', 'BK004', '2024-12-13T10:45:00.000Z', '2024-12-13T10:45:00.000Z', '2024-12-05T16:45:00.000Z', '2024-12-13T10:45:00.000Z', 'https://hotel.com/checkin/BK004', 0, 2, 1, 1, 1, 'private', 'Deluxe Suite 102'),
(5, 'started', 'emma.thompson@email.com', 'Emma Thompson', 'BK-2024-005', 'Standard Room 206', '2024-12-22T15:00:00.000Z', '2024-12-25T11:00:00.000Z', 'ios', 'tv', 'BK005', '2024-12-25T10:30:00.000Z', '2024-12-22T14:30:00.000Z', '2024-12-15T10:15:00.000Z', '2024-12-25T10:30:00.000Z', 'https://hotel.com/checkin/BK005', 320.75, 2, 1, 1, 1, 'business', 'Standard Room 206'),
(6, 'pending', 'david.kim@email.com', 'David Kim', 'BK-2024-006', 'Premium Room 302', '2024-12-28T16:00:00.000Z', '2025-01-02T11:00:00.000Z', 'web', 'station', 'BK006', '2025-01-02T10:30:00.000Z', '2024-12-18T13:20:00.000Z', '2024-12-18T13:20:00.000Z', NULL, 'https://hotel.com/checkin/BK006', 1250.00, 2, 1, 1, 1, 'private', 'Premium Room 302'),
(7, 'done', 'lisa.mueller@email.com', 'Lisa Mueller', 'BK-2024-007', 'Deluxe Suite 103', '2024-12-08T14:00:00.000Z', '2024-12-11T11:00:00.000Z', 'android', 'web', 'BK007', '2024-12-11T10:30:00.000Z', '2024-12-11T10:30:00.000Z', '2024-12-03T09:45:00.000Z', '2024-12-11T10:30:00.000Z', 'https://hotel.com/checkin/BK007', 0, 2, 1, 1, 1, 'private', 'Deluxe Suite 103'),
(8, 'started', 'robert.brown@email.com', 'Robert Brown', 'BK-2024-008', 'Standard Room 207', '2024-12-21T15:00:00.000Z', '2024-12-24T11:00:00.000Z', 'tv', 'ios', 'BK008', '2024-12-24T10:15:00.000Z', '2024-12-21T14:15:00.000Z', '2024-12-13T15:30:00.000Z', '2024-12-24T10:15:00.000Z', 'https://hotel.com/checkin/BK008', 280.25, 2, 1, 1, 1, 'business', 'Standard Room 207'),
(9, 'pending', 'maria.garcia@email.com', 'Maria Garcia', 'BK-2024-009', 'Premium Room 303', '2024-12-26T16:00:00.000Z', '2024-12-29T11:00:00.000Z', 'station', 'android', 'BK009', '2024-12-29T10:00:00.000Z', '2024-12-16T12:10:00.000Z', '2024-12-16T12:10:00.000Z', NULL, 'https://hotel.com/checkin/BK009', 890.00, 2, 1, 1, 1, 'private', 'Premium Room 303'),
(10, 'done', 'thomas.anderson@email.com', 'Thomas Anderson', 'BK-2024-010', 'Deluxe Suite 104', '2024-12-12T14:00:00.000Z', '2024-12-15T11:00:00.000Z', 'web', 'tv', 'BK010', '2024-12-15T10:15:00.000Z', '2024-12-15T10:15:00.000Z', '2024-12-07T11:25:00.000Z', '2024-12-15T10:15:00.000Z', 'https://hotel.com/checkin/BK010', 0, 2, 1, 1, 1, 'private', 'Deluxe Suite 104'),
(11, 'started', 'sophie.martin@email.com', 'Sophie Martin', 'BK-2024-011', 'Standard Room 208', '2024-12-23T15:00:00.000Z', '2024-12-26T11:00:00.000Z', 'ios', 'web', 'BK011', '2024-12-26T10:50:00.000Z', '2024-12-23T14:50:00.000Z', '2024-12-16T14:05:00.000Z', '2024-12-26T10:50:00.000Z', 'https://hotel.com/checkin/BK011', 410.50, 2, 1, 1, 1, 'business', 'Standard Room 208'),
(12, 'pending', 'alex.taylor@email.com', 'Alex Taylor', 'BK-2024-012', 'Premium Room 304', '2024-12-27T16:00:00.000Z', '2024-12-30T11:00:00.000Z', 'android', 'station', 'BK012', '2024-12-30T10:30:00.000Z', '2024-12-19T10:40:00.000Z', '2024-12-19T10:40:00.000Z', NULL, 'https://hotel.com/checkin/BK012', 950.75, 2, 1, 1, 1, 'private', 'Premium Room 304'),
(13, 'done', 'julia.weber@email.com', 'Julia Weber', 'BK-2024-013', 'Deluxe Suite 105', '2024-12-09T14:00:00.000Z', '2024-12-12T11:00:00.000Z', 'tv', 'ios', 'BK013', '2024-12-12T10:20:00.000Z', '2024-12-12T10:20:00.000Z', '2024-12-04T13:15:00.000Z', '2024-12-12T10:20:00.000Z', 'https://hotel.com/checkin/BK013', 0, 2, 1, 1, 1, 'private', 'Deluxe Suite 105'),
(14, 'started', 'daniel.lee@email.com', 'Daniel Lee', 'BK-2024-014', 'Standard Room 209', '2024-12-24T15:00:00.000Z', '2024-12-27T11:00:00.000Z', 'web', 'android', 'BK014', '2024-12-27T10:25:00.000Z', '2024-12-24T14:25:00.000Z', '2024-12-17T09:30:00.000Z', '2024-12-27T10:25:00.000Z', 'https://hotel.com/checkin/BK014', 365.00, 2, 1, 1, 1, 'business', 'Standard Room 209'),
(15, 'pending', 'olivia.davis@email.com', 'Olivia Davis', 'BK-2024-015', 'Premium Room 305', '2024-12-29T16:00:00.000Z', '2025-01-01T11:00:00.000Z', 'station', 'web', 'BK015', '2025-01-01T10:30:00.000Z', '2024-12-20T16:20:00.000Z', '2024-12-20T16:20:00.000Z', NULL, 'https://hotel.com/checkin/BK015', 1100.00, 2, 1, 1, 1, 'private', 'Premium Room 305');

-- Insert guests
INSERT INTO guests (
  id,
  reservation_id,
  first_name,
  last_name,
  email,
  nationality_code,
  created_at,
  updated_at
) VALUES
(1, 1, 'Sarah', 'Wilson', 'sarah.wilson@email.com', 'US', '2024-12-10T09:15:00.000Z', NULL),
(2, 2, 'Michael', 'Chen', 'michael.chen@email.com', 'US', '2024-12-12T14:20:00.000Z', NULL),
(3, 3, 'Anna', 'Kowalski', 'anna.kowalski@email.com', 'DE', '2024-12-14T11:30:00.000Z', NULL),
(4, 4, 'James', 'Rodriguez', 'james.rodriguez@email.com', 'US', '2024-12-05T16:45:00.000Z', NULL),
(5, 5, 'Emma', 'Thompson', 'emma.thompson@email.com', 'US', '2024-12-15T10:15:00.000Z', NULL),
(6, 6, 'David', 'Kim', 'david.kim@email.com', 'US', '2024-12-18T13:20:00.000Z', NULL),
(7, 7, 'Lisa', 'Mueller', 'lisa.mueller@email.com', 'DE', '2024-12-03T09:45:00.000Z', NULL),
(8, 8, 'Robert', 'Brown', 'robert.brown@email.com', 'US', '2024-12-13T15:30:00.000Z', NULL),
(9, 9, 'Maria', 'Garcia', 'maria.garcia@email.com', 'US', '2024-12-16T12:10:00.000Z', NULL),
(10, 10, 'Thomas', 'Anderson', 'thomas.anderson@email.com', 'US', '2024-12-07T11:25:00.000Z', NULL),
(11, 11, 'Sophie', 'Martin', 'sophie.martin@email.com', 'DE', '2024-12-16T14:05:00.000Z', NULL),
(12, 12, 'Alex', 'Taylor', 'alex.taylor@email.com', 'US', '2024-12-19T10:40:00.000Z', NULL),
(13, 13, 'Julia', 'Weber', 'julia.weber@email.com', 'DE', '2024-12-04T13:15:00.000Z', NULL),
(14, 14, 'Daniel', 'Lee', 'daniel.lee@email.com', 'US', '2024-12-17T09:30:00.000Z', NULL),
(15, 15, 'Olivia', 'Davis', 'olivia.davis@email.com', 'US', '2024-12-20T16:20:00.000Z', NULL);