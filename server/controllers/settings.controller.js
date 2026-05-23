const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const settingsService = require("../services/settings.service");

const DEFAULT_COUNTDOWN_HOURS = 80;

const getTimerSettings = asyncHandler(async (_req, res) => {
  let countdown = await settingsService.getCountdownSettings();

  if (!countdown || !countdown.expiresAt) {
    const expiresAt = new Date(Date.now() + DEFAULT_COUNTDOWN_HOURS * 60 * 60 * 1000).toISOString();
    countdown = { hours: DEFAULT_COUNTDOWN_HOURS, expiresAt };
  }

  return new ApiResponse(200, "Timer settings fetched.", countdown).send(res);
});

const updateTimerSettings = asyncHandler(async (req, res) => {
  const { hours } = req.body;
  if (hours === undefined || hours === null) {
    throw new ApiError(400, "Timer hours are required.");
  }
  if (typeof hours !== "number") {
    throw new ApiError(400, "Timer hours must be a number.");
  }
  if (hours <= 0 || hours > 1000) {
    throw new ApiError(400, "Timer hours must be between 1 and 1000.");
  }

  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const setting = await settingsService.upsertSetting("countdown", {
    hours,
    expiresAt,
    updatedAt: new Date().toISOString(),
  });

  return new ApiResponse(200, "Countdown timer updated.", setting.value).send(res);
});

module.exports = {
  getTimerSettings,
  updateTimerSettings,
};
