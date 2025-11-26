import { AuthService } from "./classes/auth.service";
import { UserService } from "./classes/user.service";
import type {
  User,
  UserPassword,
  UserProfile,
  UserAvatar,
} from "./interfaces/user";

const authService = new AuthService();
const userService = new UserService();

const userName = document.getElementById("user-name") as HTMLHeadingElement;
const userEmail = document.getElementById("user-email") as HTMLParagraphElement;
const avatarImage = document.getElementById("avatar-image") as HTMLImageElement;
const avatarOverlay = document.getElementById(
  "avatar-image-overlay"
) as HTMLDivElement;
const avatarInput = document.getElementById(
  "avatar-upload"
) as HTMLInputElement;
const myPropertiesLink = document.getElementById(
  "my-properties-link"
) as HTMLAnchorElement;

const profileView = document.getElementById("profile-view") as HTMLDivElement;
const editButtonsContainer = document.getElementById(
  "edit-buttons"
) as HTMLDivElement;
const btnEditProfile = document.getElementById(
  "edit-profile-btn"
) as HTMLButtonElement;
const btnChangePassword = document.getElementById(
  "change-password-btn"
) as HTMLButtonElement;
const logoutButton = document.getElementById(
  "logout-link"
) as HTMLButtonElement;

const formEditProfile = document.getElementById(
  "edit-profile-form"
) as HTMLFormElement;
const formChangePassword = document.getElementById(
  "change-password-form"
) as HTMLFormElement;
const btnCancelEdit = document.getElementById(
  "cancel-edit-profile"
) as HTMLButtonElement;
const btnCancelPassword = document.getElementById(
  "cancel-change-password"
) as HTMLButtonElement;

const nameInput = document.getElementById("name") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const newPasswordInput = document.getElementById(
  "new-password"
) as HTMLInputElement;
const confirmPasswordInput = document.getElementById(
  "confirm-new-password"
) as HTMLInputElement;

logoutButton.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault();
  authService.logout();
  location.assign("index.html");
});

let currentUser: User | null = null;

async function init() {
  try {
    await authService.checkToken();
    console.log("El usuario tiene la sesión iniciada");

    const params = new URLSearchParams(location.search);
    const userId = params.get("id");

    await loadProfile(userId ? Number(userId) : undefined);
  } catch (error) {
    console.error("Error 5 con el checkToken", error);
    alert("El usuario no tiene la sesión iniciada");
    location.assign("index.html");
  }
}

await init();

async function loadProfile(id?: number) {
  try {
    currentUser = await userService.getProfile(id);
    renderProfile(currentUser);
  } catch (error) {
    console.error("Error cargando perfil:", error);
    alert("No se pudo cargar el perfil del usuario");
    location.assign("index.html");
  }
}

function renderProfile(user: User) {
  userName.textContent = user.name;
  userEmail.textContent = user.email;
  avatarImage.src = user.avatar || "img/default-avatar.png";

  nameInput.value = user.name;
  emailInput.value = user.email;

  myPropertiesLink.href = `index.html?seller=${user.id}`;

  if (user.me) {
    editButtonsContainer.classList.remove("hidden");
    avatarOverlay.classList.remove("hidden");
    avatarInput.disabled = false;
  } else {
    editButtonsContainer.classList.add("hidden");
    avatarOverlay.classList.add("hidden");
    avatarInput.disabled = true;

    formEditProfile.classList.add("hidden");
    formChangePassword.classList.add("hidden");
    profileView.classList.remove("hidden");
  }
}

function showForm(formToShow: HTMLElement) {
  profileView.classList.add("hidden");
  formEditProfile.classList.add("hidden");
  formChangePassword.classList.add("hidden");
  formToShow.classList.remove("hidden");
}

function hideForms() {
  profileView.classList.remove("hidden");
  formEditProfile.classList.add("hidden");
  formChangePassword.classList.add("hidden");

  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
}

btnEditProfile.addEventListener("click", () => showForm(formEditProfile));
btnChangePassword.addEventListener("click", () => showForm(formChangePassword));

btnCancelEdit.addEventListener("click", hideForms);
btnCancelPassword.addEventListener("click", hideForms);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error || new Error("Error reading file"));
  });
}

avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  try {
    const base64 = await fileToBase64(file);

    const avatarData: UserAvatar = {
      avatar: base64.split(",")[1],
    };
    const newAvatarUrl = await userService.saveAvatar(avatarData.avatar);
    avatarImage.src = newAvatarUrl || base64;
  } catch (error) {
    console.error("Error actualizando avatar", error);
    alert("Error al actualizar la imagen de perfil");
  }
});

formEditProfile.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  const updatedProfile: UserProfile = {
    name: nameInput.value,
    email: emailInput.value,
  };

  try {
    await userService.saveProfile(updatedProfile);

    userName.textContent = updatedProfile.name;
    userEmail.textContent = updatedProfile.email;

    alert("Perfil actualizado correctamente");
    hideForms();
  } catch (error) {
    console.error("Error actualizando datos", error);
    alert("Error al actualizar el perfil");
  }
});

formChangePassword.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  if (newPasswordInput.value !== confirmPasswordInput.value) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const passwordData: UserPassword = {
    password: newPasswordInput.value,
  };

  try {
    await userService.savePassword(passwordData);

    alert("Contraseña modificada correctamente");
    hideForms();
  } catch (error) {
    console.error("Error al actualizar contraseña", error);
    alert("Error al cambiar la contraseña");
  }
});
