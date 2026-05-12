const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, password, email } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
};

const validateUserData = (req) => {
  validateSignupData(req);
  const allowedEdits = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "photoUrl",
  ];
  const isAllowed = Object.keys(req.body).every((key) =>
    allowedEdits.includes(key),
  );
  return isAllowed;
};

module.exports = { validateSignupData, validateUserData };
