use admin;
db.createUser(
  {
    user: "mongodb",
    pwd: "mongodb",
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
);
