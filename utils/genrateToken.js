import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SERECT, {
    expiresIn: "30d",
  });
};

export default generateToken;
