import { PropertiesService } from "./classes/properties.service.ts";
import { ProvincesService } from "./classes/provinces.service.ts";
import type { Property } from "./interfaces/property.ts";
import { AuthService } from "./classes/auth.service";
import { UserService } from "./classes/user.service.ts";
import Swal from "sweetalert2";

const propertiesClass = new PropertiesService();
const authService = new AuthService();
const provincesClass = new ProvincesService();
const userService = new UserService();

let currentPage = 1;
let currentSearch = "";
let currentProvince = "0";

const logoutButton = document.getElementById(
  "logout-link"
) as HTMLButtonElement;
const loginButton = document.getElementById("login-link") as HTMLButtonElement;
const profileButton = document.getElementById(
  "profile-link"
) as HTMLButtonElement;
const newPropertyButton = document.getElementById(
  "new-property-link"
) as HTMLButtonElement;
const filterInfo = document.getElementById("filter-Info") as HTMLDivElement;
const loadMoreBtn = document.getElementById(
  "load-more-btn"
) as HTMLButtonElement;
const searchForm = document.getElementById("search-form") as HTMLFormElement;
const searchInput = document.getElementById("search-text") as HTMLInputElement;
const propertyListings = document.getElementById(
  "property-listings"
) as HTMLDivElement;

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

logoutButton.addEventListener("click", async (e: MouseEvent) => {
  e.preventDefault();
  authService.logout();
  await Swal.fire({
    icon: "success",
    title: "Info de Sesión",
    text: "Has cerrado la sesión",
  });
  location.assign("index.html");
});

const template = document.getElementById(
  "property-card-template"
) as HTMLTemplateElement | null;
const selectProvince = document.getElementById(
  "province-filter"
) as HTMLSelectElement;

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
  const params = new URLSearchParams();
  params.append("page", String(currentPage));

  if (currentSearch) {
    params.append("search", currentSearch);
  }

  if (currentProvince && currentProvince !== "0") {
    params.append("province", currentProvince);
  }

  const urlParams = new URLSearchParams(location.search);
  const sellerId = urlParams.get("seller");
  if (sellerId) {
    params.append("seller", sellerId);
  }

  try {
    const activeFilters: string[] = [];

    if (currentSearch) {
      activeFilters.push(`Search: ${currentSearch}`);
    }

    if (currentProvince !== "0") {
      const selectedOption = selectProvince.querySelector(
        `option[value="${currentProvince}"]`
      );
      if (selectedOption) {
        activeFilters.push(`Province: ${selectedOption.textContent}`);
      }
    }

    if (sellerId) {
      try {
        const userSeller = await userService.getProfile(Number(sellerId));
        activeFilters.push(`Seller: ${userSeller.name}`);
      } catch {
        activeFilters.push(`Seller: Unknown`);
      }
    }

    if (activeFilters.length > 0) {
      filterInfo.textContent = activeFilters.join(". ") + ".";
    } else {
      filterInfo.textContent = "Showing all properties";
    }

    const response = await propertiesClass.getProperties(params);
    const properties: Property[] = response.properties;

    if (currentPage === 1) {
      propertyListings.replaceChildren();
    }

    if (properties.length === 0 && currentPage === 1) {
      filterInfo.textContent += " (No results found)";
    }

    if (!template) {
      throw new Error("Template not found");
    }

    properties.forEach(p => {
      const userHTML = template.content.cloneNode(true) as DocumentFragment;
      const detailUrl = `property-detail.html?id=${p.id}`;

      const imageElement = userHTML.querySelector(
        ".property-image"
      ) as HTMLImageElement;
      const titleElement = userHTML.querySelector(
        ".property-title"
      ) as HTMLAnchorElement;
      const locationElement = userHTML.querySelector(
        ".property-location"
      ) as HTMLElement;
      const priceElement = userHTML.querySelector(
        ".property-price"
      ) as HTMLElement;
      const sqmetersElement = userHTML.querySelector(
        ".property-sqmeters"
      ) as HTMLElement;
      const roomsElement = userHTML.querySelector(
        ".property-rooms"
      ) as HTMLElement;
      const bathsElement = userHTML.querySelector(
        ".property-baths"
      ) as HTMLElement;

      const provinceName =
        typeof p.town.province === "object" && p.town.province !== null
          ? p.town.province.name
          : "Desconocido";

      if (imageElement) {
        imageElement.src = p.mainPhoto;
        const imageParentLink = imageElement.parentElement as HTMLAnchorElement;
        if (imageParentLink) {
          imageParentLink.href = detailUrl;
        }
      }
      if (titleElement) {
        titleElement.textContent = p.title;
        titleElement.href = detailUrl;
      }
      if (locationElement)
        locationElement.textContent = `${p.address}, ${p.town.name}, ${provinceName}`;

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
      } else {
        borrarPropiedad.addEventListener("click", async (event: MouseEvent) => {
          event.preventDefault();

          const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
          });
          if (result.isConfirmed) {
            try {
              const idPropertie = p.id;
              await propertiesClass.deleteProperty(idPropertie);
              borrarPropiedad.closest(".bg-white")?.remove();

              await Swal.fire({
                icon: "success",
                title: "Info de Sesión",
                text: "La propiedad ha sido eliminada correctamente",
              });
            } catch (error) {
              console.error(error);
              await Swal.fire({
                icon: "error",
                title: "Info de Sesión",
                text: "No se pudo eliminar la propiedad",
              });
            }
          }
        });
      }

      propertyListings.appendChild(userHTML);
    });

    if (!response.more) {
      loadMoreBtn.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error al obtener las propiedades:", error);
  }
}

searchForm.addEventListener("submit", async (e: Event) => {
  e.preventDefault();

  currentPage = 1;
  currentSearch = searchInput.value;
  currentProvince = selectProvince.value;

  await getProperties();
});

loadMoreBtn.addEventListener("click", async () => {
  currentPage++;
  await getProperties();
});
