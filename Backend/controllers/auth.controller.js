import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
      
const generateAndStoreTokens = async (userId) => {
  try {
    const admin = await Admin.findById(userId);
    if (!admin) {
      throw new ApiError(404, "Admin not found!");
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("generateAndStoreTokens error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      `Token generation failed: ${error.message}`
    );
  }
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required!!");
  }

  const admin = await Admin.findOne({
    email,
  });

  if (!admin) {
    throw new ApiError(404, "Admin Does not Exist!!");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect!!");
  }
  const { accessToken, refreshToken } = await generateAndStoreTokens(admin._id);

  const loggedInAdmin = await Admin.findById(admin._id)
    .select("-password -refreshToken")
    .lean();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          loggedInAdmin,
        },
        "Admin logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.user._id, 

    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized, admin not found" });
  }
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

const accessRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request ! ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken._id);

    if (!admin) {
      throw new ApiError(401, "Invalid Refresh Token!");
    }

    if (incomingRefreshToken !== admin?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used.");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    const { accessToken, refreshToken } = await generateAndStoreTokens(
      admin._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: refreshToken,
          },
          "Access Token is refreshed successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid Refresh Token!");
  }
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, "Admin not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched Successfully."));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword and newPassword are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from the current password");
  }

  // Fetch with password field (req.user has it stripped)
  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isCorrect = await admin.isPasswordCorrect(currentPassword);
  if (!isCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  admin.password = newPassword; // pre-save hook will hash it
  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  login,
  logout,
  accessRefreshToken,
  getCurrentAdmin,
  changePassword,
  generateAndStoreTokens,
};
