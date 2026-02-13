-- Delete all order history
DELETE FROM orders;

-- Delete order-related audit logs
DELETE FROM audit_logs WHERE action LIKE '%order%';

-- Reset the identity sequence for the id column
ALTER TABLE orders ALTER COLUMN id RESTART WITH 1;
