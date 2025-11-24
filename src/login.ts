import { AuthService } from "./classes/auth.service";
import type { Login } from "./interfaces/user";
import type { LoginResponse } from "./interfaces/responses";

const authService = new AuthService();

const loginForm = document.getElementById("login-form") as HTMLFormElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

async function checkAlreadyLoggedIn() {
  try {
    await authService.checkToken();
  } catch (error) {
    console.error("El usuario tiene la sesión iniciada", error);
    location.assign("index.html");
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
      location.assign("index.html");
    } catch (problema) {
      const error = problema as LoginResponse;

      if (error.error) {
        alert(`Error: ${error.status}, ${error.error}`);
      }
    }
  });
}
