/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
db.createUser({
  user: 'heroes',
  pwd: 'heroes',
  roles: [
    {
      role: 'readWrite',
      db: 'heroes',
    },
  ],
});
