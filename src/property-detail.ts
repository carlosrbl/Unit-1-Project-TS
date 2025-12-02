import { PropertiesService } from "./classes/properties.service";
import { AuthService } from "./classes/auth.service";
import { MapService } from "./classes/map.service";
import type { Property } from "./interfaces/property";
import type { RatingInsert } from "./interfaces/rating";
import Swal from "sweetalert2";

const propertiesService = new PropertiesService();
const authService = new AuthService();

const titleEl = document.getElementById("property-title") as HTMLElement;
const addressEl = document.getElementById("property-address") as HTMLElement;
const imageEl = document.getElementById("property-image") as HTMLImageElement;
const descriptionEl = document.getElementById(
  "property-description"
) as HTMLElement;
const priceEl = document.getElementById("property-price") as HTMLElement;
const sqmetersEl = document.getElementById("property-sqmeters") as HTMLElement;
const roomsEl = document.getElementById("property-rooms") as HTMLElement;
const bathsEl = document.getElementById("property-baths") as HTMLElement;

const sellerPhotoEl = document.getElementById(
  "seller-photo"
) as HTMLImageElement;
const sellerNameEl = document.getElementById(
  "seller-name"
) as HTMLAnchorElement;
const sellerEmailEl = document.getElementById("seller-email") as HTMLElement;

const loginLink = document.getElementById("login-link") as HTMLElement;
const logoutButton = document.getElementById("logout-link") as HTMLElement;
const profileLink = document.getElementById("profile-link") as HTMLElement;
const newPropertyLink = document.getElementById(
  "new-property-link"
) as HTMLElement;

const mortgageForm = document.getElementById(
  "mortgage-calculator"
) as HTMLFormElement;
const inputPropertyPrice = document.getElementById(
  "input-property-price"
) as HTMLInputElement;
const inputDownPayment = document.getElementById(
  "down-payment"
) as HTMLInputElement;
const inputLoanTerm = document.getElementById("loan-term") as HTMLInputElement;
const inputInterestRate = document.getElementById(
  "interest-rate"
) as HTMLInputElement;
const mortgageResult = document.getElementById(
  "mortgage-result"
) as HTMLElement;
const monthlyPaymentEl = document.getElementById(
  "monthly-payment"
) as HTMLElement;

const totalRatingEl = document.getElementById("total-rating") as HTMLElement;
const totalStarsEl = document.getElementById("total-stars") as HTMLElement;
const ratingFormContainer = document.getElementById(
  "rating-form-container"
) as HTMLElement;
const ratingForm = document.getElementById("rating-form") as HTMLFormElement;
const ratingsContainer = document.getElementById(
  "ratings-container"
) as HTMLElement;
const ratingTemplate = document.getElementById(
  "rating-template"
) as HTMLTemplateElement;

let currentProperty: Property | null = null;
let mapService: MapService | null = null;

async function init() {
  const params = new URLSearchParams(location.search);
  const idStr = params.get("id");
  const id = Number(idStr);

  try {
    currentProperty = await propertiesService.getPropertyById(id);

    renderProperty(currentProperty);

    loadMap(currentProperty);

    await checkAuthAndRatings(currentProperty);

    await loadRatings(id);
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: "error",
      title: "Info de Sesión",
      text: "No se pudo cargar la propiedad",
    });
    location.assign("index.html");
  }
}

await init();

function renderProperty(p: Property) {
  titleEl.textContent = p.title;

  const provinceName =
    p.town.province && typeof p.town.province === "object"
      ? p.town.province.name
      : "";
  addressEl.textContent = `${p.address}, ${p.town.name}, ${provinceName}`;

  imageEl.src = p.mainPhoto;
  descriptionEl.textContent = p.description;

  const priceFormatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(p.price);
  priceEl.textContent = priceFormatted;

  sqmetersEl.textContent = p.sqmeters.toString();
  roomsEl.textContent = p.numRooms.toString();
  bathsEl.textContent = p.numBaths.toString();

  if (p.seller) {
    sellerNameEl.textContent = p.seller.name;
    sellerEmailEl.textContent = p.seller.email;
    sellerPhotoEl.src = p.seller.avatar;

    sellerNameEl.href = `profile.html?id=${p.seller.id}`;
    sellerPhotoEl.parentElement!.setAttribute(
      "href",
      `profile.html?id=${p.seller.id}`
    );
  }

  if (inputPropertyPrice) {
    inputPropertyPrice.value = p.price.toString();
  }

  updateTotalRating(p.totalRating || 0);
}

function updateTotalRating(rating: number) {
  totalRatingEl.textContent = rating.toFixed(2);
  totalStarsEl.textContent = getStarsString(rating);
}

function getStarsString(rating: number): string {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function loadMap(p: Property) {
  const coords = { latitude: p.town.latitude, longitude: p.town.longitude };
  mapService = new MapService(coords, "map");
  mapService.createMarker(coords);
}

async function checkAuthAndRatings(p: Property) {
  try {
    await authService.checkToken();
    console.log("El usuario tiene la sesión iniciada");

    loginLink.classList.add("hidden");
    profileLink.classList.remove("hidden");
    newPropertyLink.classList.remove("hidden");
    logoutButton.classList.remove("hidden");

    logoutButton.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      authService.logout();
      await Swal.fire({
        icon: "success",
        title: "Info de Sesión",
        text: "Has cerrado la sesión",
      });
      location.reload();
    });

    if (p.rated === false) {
      ratingFormContainer.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error 6 con el checkToken", error);
  }
}

mortgageForm.addEventListener("submit", e => {
  e.preventDefault();

  const P = Number(inputPropertyPrice.value) - Number(inputDownPayment.value);
  const annualRate = Number(inputInterestRate.value);
  const years = Number(inputLoanTerm.value);

  const r = annualRate / 100 / 12;
  const n = years * 12;

  let M = 0;

  if (r === 0) {
    M = P / n;
  } else {
    M = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  if (!isNaN(M) && isFinite(M)) {
    monthlyPaymentEl.textContent = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(M);
    mortgageResult.classList.remove("hidden");
  }
});

async function loadRatings(propertyId: number) {
  try {
    const ratings = await propertiesService.getRatings(propertyId);

    ratingsContainer.replaceChildren();

    ratings.forEach(rating => {
      const clone = ratingTemplate.content.cloneNode(true) as DocumentFragment;

      const img = clone.querySelector(".rating-photo") as HTMLImageElement;
      const author = clone.querySelector(".rating-author") as HTMLAnchorElement;
      const stars = clone.querySelector(".rating-stars") as HTMLElement;
      const comment = clone.querySelector(".rating-comment") as HTMLElement;

      img.src = rating.user.avatar;
      img.parentElement!.setAttribute(
        "href",
        `profile.html?id=${rating.user.id}`
      );
      author.textContent = rating.user.name;
      author.href = `profile.html?id=${rating.user.id}`;
      stars.textContent = getStarsString(rating.rating);
      comment.textContent = rating.comment;

      ratingsContainer.prepend(clone);
    });
  } catch (error) {
    console.error("Error cargando ratings", error);
  }
}

if (ratingForm) {
  ratingForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!currentProperty) return;

    const ratingValue = Number(
      (ratingForm.elements.namedItem("rating") as RadioNodeList).value
    );
    const commentValue = (
      document.getElementById("review-comment") as HTMLTextAreaElement
    ).value;

    const newRating: RatingInsert = {
      rating: ratingValue,
      comment: commentValue,
    };

    try {
      await propertiesService.addRating(currentProperty.id, newRating);

      ratingFormContainer.classList.add("hidden");

      await loadRatings(currentProperty.id);

      await Swal.fire({
        icon: "success",
        title: "Info de Sesión",
        text: "Tu opinión ha sido registrada",
      });
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Info de Sesión",
        text: "No se pudo guardar tu opinión",
      });
    }
  });
}
