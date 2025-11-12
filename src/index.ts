import { PropertiesService } from "./classes/properties.service.ts";
import type { Property } from "./interfaces/property.interfaces.ts";

document.addEventListener('DOMContentLoaded', async () => {
  const propertiesClass = new PropertiesService();
  const template = document.getElementById("property-card-template") as HTMLTemplateElement | null;

  if (!template) {
    throw new Error("Template not found");
  }

  try {
    await getProperties();
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
  }

  async function getProperties() {
    try {
      const properties: Property[] = await propertiesClass.getProperties();

      properties.forEach((p) => {
        const userHTML = template!.content.cloneNode(true) as DocumentFragment;

        const imageElement = userHTML.querySelector(".property-image") as HTMLImageElement;
        const titleElement = userHTML.querySelector(".property-title");
        const locationElement = userHTML.querySelector(".property-location");
        const descriptionElement = userHTML.querySelector(".property-description");
        const priceElement = userHTML.querySelector(".property-price");
        const sqmetersElement = userHTML.querySelector(".property-sqmeters");
        const roomsElement = userHTML.querySelector(".property-rooms");
        const bathsElement = userHTML.querySelector(".property-baths");

        const provinceName = typeof p.town.province === 'object' && p.town.province !== null ? p.town.province.name : 'Desconocido';

        if (imageElement) imageElement.src = p.mainPhoto;
        if (titleElement) titleElement.textContent = p.title;
        if (locationElement) locationElement.textContent = `${p.address}, ${p.town.name}, ${provinceName}`;
        if (descriptionElement) descriptionElement.textContent = p.description;

        const precioFormateado = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EUR",
        }).format(p.price);

        if (priceElement) priceElement.textContent = precioFormateado;
        if (sqmetersElement) sqmetersElement.textContent = `${p.sqmeters} sqm`;
        if (roomsElement) roomsElement.textContent = `${p.numRooms} beds`;
        if (bathsElement) bathsElement.textContent = `${p.numBaths} baths`;

        const borrarPropiedad = userHTML.querySelector(".btn-delete") as HTMLButtonElement;

        if (borrarPropiedad) {
          borrarPropiedad.addEventListener("click", (event: MouseEvent) => {
            event.preventDefault();

            if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
              const idPropertie = p.id;
              void propertiesClass.deleteProperty(idPropertie);
              borrarPropiedad.closest(".bg-white")?.remove();
            }
          });
        }

        document.getElementById("property-listings")?.appendChild(userHTML);
      });
    } catch (error) {
      console.error(error);
    }
  }
});
