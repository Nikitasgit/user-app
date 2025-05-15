import http from "node:http";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import querystring from "node:querystring";
import {
  readUsersFromFile,
  writeUsersToFile,
} from "./controller/userController.js";
dotenv.config();

const { HOST, PORT } = process.env;
const dirname = import.meta.dirname;
const viewPath = path.join(dirname, "view");
const headerPath = path.join(viewPath, "__header.html");
const footerPath = path.join(viewPath, "__footer.html");

let customUsers = readUsersFromFile();

const server = http.createServer((req, res) => {
  const header = fs.readFileSync(headerPath, { encoding: "utf8" });
  const footer = fs.readFileSync(footerPath, { encoding: "utf8" });
  const url = req.url.replace("/", "");
  if (url === "favicon.ico") {
    res.writeHead(200, {
      "Content-type": "image/x-icon",
    });
    res.end();
    return;
  }
  if (url === "user/add" && req.method === "GET") {
    const page = fs.readFileSync(path.join(viewPath, "form.html"), {
      encoding: "utf8",
    });

    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end(page);
    return;
  }

  if (url === "user/add" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const data = querystring.parse(body);
      if (customUsers.some((user) => user.nom === data.nom.trim())) {
        res.writeHead(409, { "Content-type": "text/plain" });
        res.end("Un utilisateur a déjà ce nom.");
        return;
      }
      if (!data.nom || data.nom.trim() === "" || !data.email) {
        res.writeHead(401, { "Content-type": "text/plain" });
        res.end("Le champs nom ne peut pas être vide");
        return;
      }
      customUsers.push({ ...data, role: "admin" });
      writeUsersToFile(customUsers);

      res.writeHead(301, {
        Location: "/",
      });
      res.end();
      return;
    });
    return;
  }
  if (url.startsWith("user/delete/") && req.method === "POST") {
    const userName = decodeURIComponent(url.split("/")[2]);
    const user = customUsers.find((u) => u.nom === userName);
    if (user) {
      customUsers = customUsers.filter((u) => u.nom !== userName);
      writeUsersToFile(customUsers);
      res.writeHead(302, { Location: "/" });
      res.end();
    } else {
      res.writeHead(404, { "Content-type": "text/plain" });
      res.end("Utilisateur non trouvé");
    }
    return;
  }
  if (url.startsWith("user/profile")) {
    const userName = decodeURIComponent(url.split("/")[2]);
    const user = customUsers.find((u) => u.nom === userName);
    if (user) {
      res.writeHead(200, { "Content-type": "text/html" });
      res.end(`
      ${header}
      <h1>Profil de ${user.nom}</h1>
      <h3>Email: ${user.email}</h3>
      <h3>Role: ${user.role}</h3>
      <a href="/">Accueil</a>
      ${footer}
    `);
    }
    return;
  }
  res.writeHead(200, {
    "Content-type": "text/html; charset=utf8",
  });
  res.end(`
  ${header}
  <ul>
    ${customUsers
      .map(
        (u) => `
        <li>
          <a href="/user/profile/${u.nom}">${u.nom}</a>
          <form method="POST" action="/user/delete/${u.nom}">
            <button type="submit">Supprimer</button>
          </form>
        </li>`
      )
      .join("")}
  </ul>
  <a href="/user/add">Ajouter un utilisateur</a>
  ${footer}
`);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
