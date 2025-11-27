import { AuthService } from "./classes/auth.service";
import type { Register } from "./interfaces/user";
import type { RegisterResponse } from "./interfaces/responses";
import Swal from "sweetalert2";

const authService = new AuthService();

const registerForm = document.getElementById(
  "register-form"
) as HTMLFormElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const passwordConfirmInput = document.getElementById(
  "password-confirm"
) as HTMLInputElement;
const avatarInput = document.getElementById("avatar") as HTMLInputElement;
const avatarPreview = document.getElementById(
  "avatar-preview"
) as HTMLImageElement;

async function checkAlreadyLoggedIn() {
  try {
    await authService.checkToken();
    console.log("El usuario tiene la sesión iniciada");
    await Swal.fire({
      icon: "info",
      title: "Info de Sesión",
      text: "El usuario tiene la sesión iniciada",
    });
    location.assign("index.html");
  } catch (error) {
    console.error("Error 4 con el checkToken", error);
  }
}

await checkAlreadyLoggedIn();

function validatePasswords() {
  if (passwordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity("Las contraseñas no coinciden");
  } else {
    passwordConfirmInput.setCustomValidity("");
  }
}

passwordInput.addEventListener("input", validatePasswords);
passwordConfirmInput.addEventListener("input", validatePasswords);

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) {
    avatarPreview.src = "";
    avatarPreview.classList.add("hidden");
    return;
  }

  if (!file.type.startsWith("image")) {
    avatarInput.setCustomValidity("El archivo debe ser una imagen");
    avatarPreview.classList.add("hidden");
  } else {
    avatarInput.setCustomValidity("");
    const reader = new FileReader();
    reader.onload = e => {
      avatarPreview.src = e.target?.result as string;
      avatarPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
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

if (registerForm) {
  registerForm.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const file = avatarInput.files?.[0];
    let base64Avatar = "";

    try {
      if (file) {
        base64Avatar = await fileToBase64(file);
        base64Avatar = base64Avatar.split(",")[1];
      }

      const newUser: Register = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        avatar: base64Avatar,
      };

      await authService.register(newUser);

      await Swal.fire({
        icon: "success",
        title: "Info de Sesión",
        text: "Acabas de ser registrado",
      });

      location.assign("login.html");
    } catch (problema) {
      const error = problema as RegisterResponse;
      await Swal.fire({
        icon: "error",
        title: "Info de Sesión",
        text: `${error.message}`,
      });
      console.error(error.error);
    }
  });
}
