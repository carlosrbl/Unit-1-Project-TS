import { ProvincesService } from "./classes/provinces.service.ts";
import { PropertiesService } from "./classes/properties.service.ts";
import { MapService } from "./classes/map.service.ts";
import { MyGeolocation } from "./classes/my-geolocation.ts";

const selectProvince = document.getElementById("province") as HTMLSelectElement;
const selectTown = document.getElementById("town") as HTMLSelectElement;
const provincesClass = new ProvincesService();
const propertiesClass = new PropertiesService();
const mapa = document.getElementById("map") as HTMLElement;

let towns = [];
let mapaView = null;
let currentMarkerFeature = null;

function clearSelect(selectElement) {
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }
}

getProvinces();
getMyGeolocation();

async function getProvinces() {
  try {
    const provinces = await provincesClass.getProvinces();

    provinces.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.name;
      selectProvince.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

async function getMyGeolocation() {
  try {
    const coordenadas = await MyGeolocation.getLocation();
    mapaView = new MapService(coordenadas, mapa);

    currentMarkerFeature = mapaView.createMarker(coordenadas);
    mapaView.view;
  } catch (error) {
    console.error(error);
  }
}

selectProvince.addEventListener("change", () => {
  clearSelect(selectTown);
  towns = [];

  if (selectProvince.value === "") {
    return;
  }

  async function getTowns() {
    try {
      const provinceId = selectProvince.value;
      towns = await provincesClass.getTowns(provinceId);

      towns.forEach(t => {
        const option = document.createElement("option");
        option.value = t.id;
        option.textContent = t.name;
        selectTown.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }
  getTowns();
});

selectTown.addEventListener("change", () => {
  const townId = +selectTown.value;
  const selectedTown = towns.find(t => t.id === townId);

  const townCoordenadas = {
    latitude: selectedTown.latitude,
    longitude: selectedTown.longitude,
  };

  const newCoordinates = [selectedTown.longitude, selectedTown.latitude];

  if (currentMarkerFeature) {
    currentMarkerFeature.getGeometry().setCoordinates(newCoordinates);
  } else {
    currentMarkerFeature = mapaView.createMarker(townCoordenadas);
  }
  mapaView.view.setCenter(newCoordinates);
});

const form = document.getElementById("property-form");
const imgInput = document.getElementById("mainPhoto");
const imgPreview = document.getElementById("image-preview");

imgInput.addEventListener("change", () => {
  const file = imgInput.files[0];

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
      imgPreview.src = e.target.result;
      imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
  imgInput.reportValidity();
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

form.addEventListener("submit", agregarPropiedad);

async function agregarPropiedad(e) {
  e.preventDefault();

  const imagenFile = imgInput.files[0];
  const townId = selectTown.value;
  let base64Image = null;

  try {
    if (imagenFile) {
      base64Image = await fileToBase64(imagenFile);
      base64Image = base64Image.split(",")[1];
    }

    const propiedad = {
      townId: +townId,
      address: form.address.value,
      title: form.title.value,
      description: form.description.value,
      sqmeters: +form.sqmeters.value,
      numRooms: +form.numRooms.value,
      numBaths: +form.numBaths.value,
      price: +form.price.value,
      mainPhoto: base64Image,
    };

    await propertiesClass.insertProperty(propiedad);
    location.assign("index.html");
  } catch (error) {
    alert("Error añadiendo propiedad");
    form.reset(); // lo limpio para que sea más realista
    imgPreview.classList.add("hidden");
    console.error("Error añadiendo propiedad: " + error);
  }
}
