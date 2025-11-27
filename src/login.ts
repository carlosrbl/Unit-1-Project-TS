import { AuthService } from "./classes/auth.service";
import type { Login } from "./interfaces/user";
import type { LoginResponse } from "./interfaces/responses";
import Swal from "sweetalert2";

const authService = new AuthService();

const loginForm = document.getElementById("login-form") as HTMLFormElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

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
    console.error("Error 2 con el checkToken", error);
  }
}

await checkAlreadyLoggedIn();

if (loginForm) {
  loginForm.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const loginData: Login = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    try {
      await authService.login(loginData);

      await Swal.fire({
        icon: "success",
        title: "Info de Sesión",
        text: "Acabas de iniciar sesión",
      });

      location.assign("index.html");
    } catch (problema) {
      const error = problema as LoginResponse;
      await Swal.fire({
        icon: "error",
        title: "Info de Sesión",
        text: "Usuario o contraseña incorrectos",
      });
      console.error(error.error);
    }
  });
}
