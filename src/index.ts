import { PropertiesService } from "./classes/properties.service.ts";
import { ProvincesService } from "./classes/provinces.service.ts";
import type { Property } from "./interfaces/property.ts";
import { AuthService } from "./classes/auth.service";

const propertiesClass = new PropertiesService();
const authService = new AuthService();

const logoutButton = document.getElementById(
  "logout-link"
) as HTMLButtonElement;
const loginButton = document.getElementById("login-link") as HTMLButtonElement;
const profileButton = document.getElementById("profile-link") as HTMLButtonElement;
const newPropertyButton = document.getElementById(
  "new-property-link"
) as HTMLButtonElement;

async function checkAlreadyLoggedIn() {
  try {
    await authService.checkToken();
    console.log("El usuario tiene la sesión iniciada");

    logoutButton.classList.remove("hidden");
    newPropertyButton.classList.remove("hidden");
    profileButton.classList.remove("hidden");
    loginButton.classList.add("hidden");
  } catch (error) {
    console.error("Error 1 con el checkToken", error);
  }
}

await checkAlreadyLoggedIn();

logoutButton.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault();
  authService.logout();
  location.assign("index.html");
});

const template = document.getElementById(
  "property-card-template"
) as HTMLTemplateElement | null;
const provincesClass = new ProvincesService();
const selectProvince = document.getElementById(
  "province-filter"
) as HTMLSelectElement;

if (!template) {
  throw new Error("Template not found");
}

try {
  await getProvinces();
} catch (error) {
  console.error("Error al cargar las provincias:", error);
}

try {
  await getProperties();
} catch (error) {
  console.error("Error al cargar las propiedades:", error);
}

async function getProvinces(): Promise<void> {
  try {
    const provinces = await provincesClass.getProvinces();

    provinces.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id + "";
      option.textContent = p.name;
      selectProvince.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener las provincias:", error);
  }
}

async function getProperties(): Promise<void> {
  try {
    const properties: Property[] = await propertiesClass.getProperties();

    properties.forEach(p => {
      const userHTML = template!.content.cloneNode(true) as DocumentFragment;

      const imageElement = userHTML.querySelector(
        ".property-image"
      ) as HTMLImageElement;
      const titleElement = userHTML.querySelector(
        ".property-title"
      ) as HTMLSelectElement;
      const locationElement = userHTML.querySelector(
        ".property-location"
      ) as HTMLSelectElement;
      const descriptionElement = userHTML.querySelector(
        ".property-description"
      ) as HTMLSelectElement;
      const priceElement = userHTML.querySelector(
        ".property-price"
      ) as HTMLSelectElement;
      const sqmetersElement = userHTML.querySelector(
        ".property-sqmeters"
      ) as HTMLSelectElement;
      const roomsElement = userHTML.querySelector(
        ".property-rooms"
      ) as HTMLSelectElement;
      const bathsElement = userHTML.querySelector(
        ".property-baths"
      ) as HTMLSelectElement;

      const provinceName =
        typeof p.town.province === "object" && p.town.province !== null
          ? p.town.province.name
          : "Desconocido";

      if (imageElement) imageElement.src = p.mainPhoto;
      if (titleElement) titleElement.textContent = p.title;
      if (locationElement)
        locationElement.textContent = `${p.address}, ${p.town.name}, ${provinceName}`;
      if (descriptionElement) descriptionElement.textContent = p.description;

      const precioFormateado = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(p.price);

      if (priceElement) priceElement.textContent = precioFormateado;
      if (sqmetersElement) sqmetersElement.textContent = `${p.sqmeters} sqm`;
      if (roomsElement) roomsElement.textContent = `${p.numRooms} beds`;
      if (bathsElement) bathsElement.textContent = `${p.numBaths} baths`;

      const borrarPropiedad = userHTML.querySelector(
        ".btn-delete"
      ) as HTMLButtonElement;

      if (!p.mine) {
        borrarPropiedad.classList.add("hidden");
      }
      
      if (borrarPropiedad && p.mine) {
        borrarPropiedad.addEventListener("click", (event: MouseEvent) => {
          event.preventDefault();

          if (
            confirm("¿Estás seguro de que quieres eliminar esta propiedad?")
          ) {
            const idPropertie = p.id;
            void propertiesClass.deleteProperty(idPropertie);
            borrarPropiedad.closest(".bg-white")?.remove();
          }
        });
      }

      document.getElementById("property-listings")?.appendChild(userHTML);
    });
  } catch (error) {
    console.error("Error al obtener las propiedades:", error);
  }
}
