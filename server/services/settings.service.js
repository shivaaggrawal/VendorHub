const Setting = require("../models/Setting.model");

const getSetting = async (key) => {
  return await Setting.findOne({ key }).lean();
};

const upsertSetting = async (key, value) => {
  return await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
};

const getCountdownSettings = async () => {
  const setting = await getSetting("countdown");
  if (!setting?.value) {
    return null;
  }
  return setting.value;
};

module.exports = {
  getSetting,
  upsertSetting,
  getCountdownSettings,
};
