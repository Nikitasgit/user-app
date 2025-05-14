import fs from "node:fs";
import path from "node:path";
const dirname = import.meta.dirname;
const usersFilePath = path.join(dirname, "../../data/users.json");

export function readUsersFromFile() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Erreur lors de la lecture du fichier JSON :", e);
    return [];
  }
}

export function writeUsersToFile(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur lors de l’écriture du fichier JSON :", e);
  }
}
