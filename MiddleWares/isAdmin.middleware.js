const isAdmin = async (req, res, next) => {
  try {
    if (req.body.userRole == "Admin") {
      next();
    } else {
      res.send({ msg: "You are not authorized to do this operation " });
    }
  } catch (error) {
    res.send({ error: `${error}` });
  }
};

module.exports = { isAdmin };
