use admin;
db.createUser(
  {
    user: "websenso",
    pwd: "websenso",
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
);
