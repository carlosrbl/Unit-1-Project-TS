import { PropertiesService } from "./properties.service.js";

const propertiesClass = new PropertiesService();
const template = document.getElementById("property-card-template");

getProperties();

async function getProperties() {
  try {
    const properties = await propertiesClass.getProperties();

    properties.forEach((p) => {
      const userHTML = template.content.cloneNode(true);

      userHTML.querySelector(".property-image").src = p.mainPhoto;
      userHTML.querySelector(".property-title").textContent = p.title;
      userHTML.querySelector(
        ".property-location"
      ).textContent = `${p.address}, ${p.town.name}, ${p.town.province.name}`;
      userHTML.querySelector(".property-description").textContent =
        p.description;

      const precioFormateado = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(p.price);
      userHTML.querySelector(".property-price").textContent = precioFormateado;

      userHTML.querySelector(
        ".property-sqmeters"
      ).textContent = `${p.sqmeters} sqm`;
      userHTML.querySelector(
        ".property-rooms"
      ).textContent = `${p.numRooms} beds`;
      userHTML.querySelector(
        ".property-baths"
      ).textContent = `${p.numBaths} baths`;

      const borrarPropiedad = userHTML.querySelector(".btn-delete");

      borrarPropiedad.addEventListener("click", (event) => {
        event.preventDefault();

        if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
          const idPropertie = p.id;
          propertiesClass.deleteProperty(idPropertie);
          borrarPropiedad.closest(".bg-white").remove();
        }
      });

      document.getElementById("property-listings").appendChild(userHTML);
    });
  } catch (error) {
    console.error(error);
  }
}
