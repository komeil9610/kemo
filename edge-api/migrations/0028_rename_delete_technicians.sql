PRAGMA foreign_keys = ON;

UPDATE users SET name = 'W-J' WHERE email = 'tech01@tarkeebpro.internal';
UPDATE users SET name = 'D-M' WHERE email = 'tech02@tarkeebpro.internal';
UPDATE users SET name = 'H-R' WHERE email = 'tech03@tarkeebpro.internal';
UPDATE users SET name = 'R-A' WHERE email = 'tech04@tarkeebpro.internal';
UPDATE users SET name = 'H-G' WHERE email = 'tech05@tarkeebpro.internal';
UPDATE users SET name = 'A-D' WHERE email = 'tech06@tarkeebpro.internal';

UPDATE technicians
SET name = 'W-J', notes = 'الفني W-J'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech01@tarkeebpro.internal');

UPDATE technicians
SET name = 'D-M', notes = 'الفني D-M'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech02@tarkeebpro.internal');

UPDATE technicians
SET name = 'H-R', notes = 'الفني H-R'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech03@tarkeebpro.internal');

UPDATE technicians
SET name = 'R-A', notes = 'الفني R-A'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech04@tarkeebpro.internal');

UPDATE technicians
SET name = 'H-G', notes = 'الفني H-G'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech05@tarkeebpro.internal');

UPDATE technicians
SET name = 'A-D', notes = 'الفني A-D'
WHERE user_id = (SELECT id FROM users WHERE email = 'tech06@tarkeebpro.internal');

DELETE FROM users
WHERE email = 'moreme112982@gmail.com'
  AND role = 'technician';
