import { ProvincesService } from "./classes/provinces.service.ts";
import { PropertiesService } from "./classes/properties.service.ts";
import { MapService } from "./classes/map.service.ts";
import { MyGeolocation } from "./classes/my-geolocation.ts";
import { AuthService } from "./classes/auth.service.ts";
import type { PropertyInsert } from "./interfaces/property.ts";
import type { Province } from "./interfaces/province.ts";
import type { Town } from "./interfaces/town.ts";
import type { Coordinates } from "./interfaces/coordinates.ts";
import Feature from "ol/Feature";
import { Point } from "ol/geom";

const provincesService = new ProvincesService();
const propertiesService = new PropertiesService();
const authService = new AuthService();

const selectProvince = document.getElementById("province") as HTMLSelectElement;
const selectTown = document.getElementById("town") as HTMLSelectElement;
const form = document.getElementById("property-form") as HTMLFormElement;
const imgInput = document.getElementById("mainPhoto") as HTMLInputElement;
const imgPreview = document.getElementById("image-preview") as HTMLImageElement;
const logoutButton = document.getElementById(
  "logout-link"
) as HTMLButtonElement;

let towns: Town[] = [];
let mapaView: MapService | null = null;
let currentMarkerFeature: Feature | null = null;

async function init() {
  try {
    await authService.checkToken();

    setupLogout();
    await getProvinces();
    await getMyGeolocation();
  } catch (error) {
    console.error("Error con el inicio:", error);
    location.assign("login.html");
  }
}

await init();

function setupLogout() {
  if (logoutButton) {
    logoutButton.addEventListener("click", e => {
      e.preventDefault();
      authService.logout();
      location.assign("login.html");
    });
  }
}

function clearSelect(selectElement: HTMLSelectElement): void {
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }
}

async function getProvinces(): Promise<void> {
  try {
    const provinces: Province[] = await provincesService.getProvinces();

    provinces.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id.toString();
      option.textContent = p.name;
      selectProvince.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando provincias:", error);
  }
}

async function getMyGeolocation(): Promise<void> {
  try {
    const coordenadas: Coordinates = await MyGeolocation.getLocation();
    mapaView = new MapService(coordenadas, "map");

    currentMarkerFeature = mapaView.createMarker(coordenadas);
  } catch (error) {
    console.error("Error cargando geolocalización:", error);
  }
}

selectProvince.addEventListener("change", async () => {
  clearSelect(selectTown);
  towns = [];

  if (selectProvince.value === "") {
    return;
  }

  try {
    const provinceId = Number(selectProvince.value);
    towns = await provincesService.getTowns(provinceId);

    towns.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id.toString();
      option.textContent = t.name;
      selectTown.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando municipios:", error);
  }
});

selectTown.addEventListener("change", () => {
  if (!mapaView) return;

  const townId = Number(selectTown.value);
  const selectedTown = towns.find(t => t.id === townId);

  if (selectedTown) {
    const townCoordenadas: Coordinates = {
      latitude: selectedTown.latitude,
      longitude: selectedTown.longitude,
    };

    const newCoordinates = [selectedTown.longitude, selectedTown.latitude];

    if (currentMarkerFeature) {
      const geometry = currentMarkerFeature.getGeometry() as Point;
      geometry?.setCoordinates(newCoordinates);
      mapaView.view.setCenter(newCoordinates);
    } else {
      currentMarkerFeature = mapaView.createMarker(townCoordenadas);
    }
  }
});

imgInput.addEventListener("change", () => {
  const file = imgInput.files?.[0];

  if (!file) {
    imgPreview.src = "";
    imgPreview.classList.add("hidden");
    imgInput.setCustomValidity("");
    return;
  }

  if (!file.type.startsWith("image")) {
    imgInput.setCustomValidity("El archivo tiene que ser una imagen");
    imgPreview.src = "";
    imgPreview.classList.add("hidden");
  } else {
    imgInput.setCustomValidity("");
    const reader = new FileReader();
    reader.onload = e => {
      imgPreview.src = e.target?.result as string;
      imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
  imgInput.reportValidity();
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error || new Error("Error reading file"));
  });
}

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  const imagenFile = imgInput.files?.[0];
  const townId = selectTown.value;
  let base64Image = "";

  try {
    if (imagenFile) {
      base64Image = await fileToBase64(imagenFile);
      base64Image = base64Image.split(",")[1];
    }

    const propiedad: PropertyInsert = {
      townId: Number(townId),
      address: (document.getElementById("address") as HTMLInputElement).value,
      title: (document.getElementById("title") as HTMLInputElement).value,
      description: (
        document.getElementById("description") as HTMLTextAreaElement
      ).value,
      sqmeters: Number(
        (document.getElementById("sqmeters") as HTMLInputElement).value
      ),
      numRooms: Number(
        (document.getElementById("numRooms") as HTMLInputElement).value
      ),
      numBaths: Number(
        (document.getElementById("numBaths") as HTMLInputElement).value
      ),
      price: Number(
        (document.getElementById("price") as HTMLInputElement).value
      ),
      mainPhoto: base64Image || "",
    };

    await propertiesService.insertProperty(propiedad);
    location.assign("index.html");
  } catch (error) {
    console.error("Error añadiendo propiedad:", error);
    alert("Error añadiendo propiedad");
  }
});
