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
import Swal from "sweetalert2";
import type {
  LanguageDetectorFactory,
  TranslatorFactory,
  SummarizerFactory,
} from "./interfaces/ai.ts";

declare const LanguageDetector: LanguageDetectorFactory;
declare const Translator: TranslatorFactory;
declare const Summarizer: SummarizerFactory;

const provincesService = new ProvincesService();
const propertiesService = new PropertiesService();
const authService = new AuthService();

const selectProvince = document.getElementById("province") as HTMLSelectElement;
const selectTown = document.getElementById("town") as HTMLSelectElement;
const form = document.getElementById("property-form") as HTMLFormElement;
const imgInput = document.getElementById("mainPhoto") as HTMLInputElement;
const imgPreview = document.getElementById("image-preview") as HTMLImageElement;
const btnGenerate = document.getElementById(
  "generate-button"
) as HTMLButtonElement;
const btnTranslate = document.getElementById(
  "translate-button"
) as HTMLButtonElement;
const inputDescription = document.getElementById(
  "description"
) as HTMLTextAreaElement;
const inputTitle = document.getElementById("title") as HTMLInputElement;

const logoutButton = document.getElementById(
  "logout-link"
) as HTMLButtonElement;

let towns: Town[] = [];
let mapaView: MapService | null = null;
let currentMarkerFeature: Feature | null = null;

async function init() {
  try {
    await authService.checkToken();
    console.log("El usuario tiene la sesión iniciada");
    await getProvinces();
    await getMyGeolocation();
  } catch (error) {
    console.error("Error 3 con el checkToken", error);
    await Swal.fire({
      icon: "warning",
      title: "Info de Sesión",
      text: "Debes iniciar sesión para acceder a este apartado",
    });
    location.assign("index.html");
  }
}

await init();

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

async function detectLanguage(text: string): Promise<string> {
  const detector = await LanguageDetector.create({
    expectedInputLanguages: ["en", "es", "de", "fr", "it"],
  });

  const results = await detector.detect(text);
  return results[0]?.detectedLanguage ?? "en";
}

async function translate(
  text: string,
  inputLang: string,
  outputLang: string
): Promise<string> {
  const translator = await Translator.create({
    sourceLanguage: inputLang,
    targetLanguage: outputLang,
  });
  return await translator.translate(text);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

btnTranslate.addEventListener("click", async () => {
  btnTranslate.disabled = true;
  inputDescription.disabled = true;
  const originalText = inputDescription.value;

  try {
    const text = inputDescription.value;

    if (!text) {
      await Swal.fire({
        icon: "warning",
        title: "Info de Sesión",
        text: "No puedes utilizar esta función sin una descripción",
      });
      return;
    }
    inputDescription.value = "Translating...";
    await delay(1500);
    const inputLang = await detectLanguage(text);
    if (inputLang === "en") {
      await Swal.fire({
        icon: "warning",
        title: "Info de Sesión",
        text: "El texto ya está en inglés",
      });
      inputDescription.value = originalText;
      return;
    }
    inputDescription.value = await translate(text, inputLang, "en");
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: "error",
      title: "Info de Sesión",
      text: "No se puede traducir",
    });
  } finally {
    btnTranslate.disabled = false;
    inputDescription.disabled = false;
  }
});

async function summarize(text: string): Promise<string> {
  const summarizer = await Summarizer.create({
    sharedContext:
      "A general summary to help a user decide if the text is worth reading",
    type: "tldr",
    length: "short",
    format: "plain-text",
    expectedInputLanguages: ["en", "es"],
    outputLanguage: "es",
  });

  return await summarizer.summarize(text);
}

btnGenerate.addEventListener("click", async () => {
  btnGenerate.disabled = true;
  inputTitle.disabled = true;

  try {
    inputTitle.value = "Generating...";
    await delay(1500);
    const text = inputDescription.value;
    inputTitle.value = await summarize(text);
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: "error",
      title: "Info de Sesión",
      text: "No se puede generar un título con la IA",
    });
  } finally {
    btnGenerate.disabled = false;
    inputTitle.disabled = false;
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
    await Swal.fire({
      icon: "success",
      title: "Info de Sesión",
      text: "Se ha creado la propiedad correctamente",
    });
    location.assign("index.html");
  } catch (error) {
    console.error("Error añadiendo propiedad:", error);
    await Swal.fire({
      icon: "error",
      title: "Info de Sesión",
      text: "No se puede crear la propiedad",
    });
  }
});
