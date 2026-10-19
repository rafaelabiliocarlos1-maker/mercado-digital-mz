
(function () {
  const URL = "https://qnktdyjivwojgvshuddn.supabase.co";
  const KEY = "sb_publishable_RnF64qRX-V4OTt7HtIothw_GvMCtfBI";

  const library = document.createElement("script");
  library.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  library.onload = start;
  library.onerror = () => console.error("Não foi possível carregar o Supabase.");

  document.head.appendChild(library);

  function start() {
    const db = window.supabase.createClient(URL, KEY);
    const form = document.getElementById("interestForm");
    if (!form) return;

    const name = document.getElementById("interestName");
    const phone = document.getElementById("interestPhone");
    const button = form.querySelector('button[type="submit"]');

    const email = document.createElement("input");
    email.type = "email";
    email.placeholder = "O seu e-mail";
    email.autocomplete = "email";
    email.required = true;
    email.style.cssText =
      "width:100%;padding:12px;border:1px solid #dce5dd;border-radius:10px;margin:8px 0";
    email.setAttribute("aria-label", "E-mail");

    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Palavra-passe (mínimo 6 caracteres)";
    password.autocomplete = "new-password";
    password.minLength = 6;
    password.required = true;
    password.style.cssText = email.style.cssText;
    password.setAttribute("aria-label", "Palavra-passe");

    form.insertBefore(email, phone);
    form.insertBefore(password, phone);

    let busy = false;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (busy) return;
      busy = true;
      button.disabled = true;

      try {
        const title =
          document.getElementById("modalTitle")?.textContent || "";
        const login = title.toLowerCase().includes("entrar");
        let result;

        if (login) {
          result = await db.auth.signInWithPassword({
            email: email.value.trim(),
            password: password.value
          });
        } else {
          result = await db.auth.signUp({
            email: email.value.trim(),
            password: password.value,
            options: {
              data: {
                full_name: name.value.trim(),
                phone: phone.value.trim()
              }
            }
          });
        }

        if (result.error) throw result.error;

        if (typeof closeModal === "function") closeModal();

        if (result.data.session) {
          alert(login
            ? "Sessão iniciada com sucesso!"
            : "Conta criada com sucesso!");
        } else {
          alert("Verifica o teu e-mail para confirmar a conta.");
        }
      } catch (error) {
        alert("Não foi possível concluir: " + error.message);
      } finally {
        busy = false;
        button.disabled = false;
      }
    }, true);

    db.auth.getSession().then(({ data }) => {
      const loginButton = document.getElementById("loginButton");
      if (loginButton && data.session) {
        loginButton.textContent = "A minha conta";
      }
    });

    db.from("listings").select("*").limit(100).then(({ error, data }) => {
      if (error) {
        console.warn("Anúncios ainda não carregados:", error.message);
        return;
      }
      console.log("Ligação à tabela listings concluída:", data.length);
    });
  }
})();
