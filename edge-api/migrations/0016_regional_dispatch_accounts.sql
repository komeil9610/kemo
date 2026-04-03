PRAGMA foreign_keys = ON;

DELETE FROM technicians
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE email IN ('east@tarkeebpro.sa', 'west@tarkeebpro.sa', 'south@tarkeebpro.sa', 'central@tarkeebpro.sa')
);

DELETE FROM users
WHERE email IN ('east@tarkeebpro.sa', 'west@tarkeebpro.sa', 'south@tarkeebpro.sa', 'central@tarkeebpro.sa');
