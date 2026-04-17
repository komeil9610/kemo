PRAGMA foreign_keys = ON;

UPDATE users
SET password_hash = '479dd476032a9fc2cc76ee20d4eb07fa5c124e7d883489409a97b7ca26c821bc'
WHERE email = 'tech01@tarkeebpro.internal';

UPDATE users
SET password_hash = '6efa1eca2a9ef3eac791426de7cfd9b4d541b5d084edc9891c4f8c531145e087'
WHERE email = 'tech02@tarkeebpro.internal';

UPDATE users
SET password_hash = '03af388c1f95bbe1a05c6e414fff2d5fda0ec2667384af99b041b06d7481619f'
WHERE email = 'tech03@tarkeebpro.internal';

UPDATE users
SET password_hash = 'ae271d219bc4980049711f2102842a0c2221bb24c844566a83a92c6ff50d6bda'
WHERE email = 'tech04@tarkeebpro.internal';

UPDATE users
SET password_hash = 'c96af2312dd226189d01459a667d9cf7c77cb9e2fa4103406cfbe9aa2257218d'
WHERE email = 'tech05@tarkeebpro.internal';

UPDATE users
SET password_hash = 'e86862ab3f9168379f70e3ab48bc1c78ab400002e240f71580006c3e506782e9'
WHERE email = 'tech06@tarkeebpro.internal';
