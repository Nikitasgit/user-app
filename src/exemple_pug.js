import pug from "pug";
import path from "node:path";

const dirname = import.meta.dirname;
const viewPath = path.join(dirname, "view");

const loggedUser = {
  name: {
    first: "Jean",
    last: "Dupont",
  },
  age: 36,
  birthdate: new Date("1986-04-18"),
  location: {
    zipcode: "77420",
    city: "Champs-sur-Marne",
  },
  isAdmin: true,
};
const compile = pug.compileFile(path.join(viewPath, "template.pug"), {
  pretty: true,
});

console.log(compile(loggedUser));
