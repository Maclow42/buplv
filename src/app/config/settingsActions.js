"use server";

import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? 'src/app/config/settings.json' : 'src/app/config/settingsDev.json';

export const getSettings = async () => {
  const settingsJSON = await verifySettings();
  return settingsJSON;
};

export const updateSettings = async (newSettings) => {
  await verifySettings();

  const data = JSON.stringify(newSettings, null, 4);

  try {
    await fs.writeFile('src/app/config/settings.json', data, 'utf8');

    return {
      success: true,
      msg: "Les paramètres du site ont été mises à jour.",
    };
  } catch (e) {
    console.error(e.message);
    return {
      success: false,
      msg: e.message,
    };
  };
};

export const verifySettings = async () => {
  // read file using fs module
  const data = await fs.readFile('src/app/config/settings.json', 'utf8');
  // parse JSON string to JSON object
  const settingsJSON = await JSON.parse(data);

  // verify if public access is allowed
  if (!settingsJSON.publicAccess) settingsJSON.allowArticleRegistration = false;

  // Verify if the register is closed
  const endRegisterDate = new Date(settingsJSON.endRegisterDate);
  if (Date.now() >= endRegisterDate) {
    settingsJSON.allowArticleRegistration = false;
  }

  return settingsJSON;
};