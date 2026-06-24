import ApiResponse from "./apiResponse.js";

const sendToken = (user, statusCode, res, message) => {
  const accessToken = user.generateAccessToken();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(statusCode)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        statusCode,
        {
          user,
          accessToken,
          token: accessToken,
        },
        message
      )
    );
};

export default sendToken;