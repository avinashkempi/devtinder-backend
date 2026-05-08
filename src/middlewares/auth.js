const adminAuth = (req, res, next) => {
  let cookie = "xyz";
  let authenticated = cookie === "xyzq";
  if (authenticated) {
    next();
  } else {
    res.status(401).send("Admin Not authenticated");
  }
};

const userAuth = (req, res, next) => {
  let cookie = "xyz";
  let authenticated = cookie === "xyz";
  if (authenticated) {
    next();
  } else {
    res.status(401).send("User Not authenticated");
  }
};

module.exports = { adminAuth, userAuth };
