
(function () {
  const URL = "https://qnktdyjivwojgvshuddn.supabase.co";
  const KEY = "sb_publishable_RnF64qRX-V4OTt7HtIothw_GvMCtfBI";

  const library = document.createElement("script");
  library.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  library.onload = start;
  library.onerror = () => alert("Não foi possível carregar o sistema de contas.");
  document.head.appendChild(library);

  function start() {
    const db = window.supabase.createClient(URL, KEY);
    const form = document.getElementById("interestForm");
    if (!form) return;

    const name = document.getElementById("interestName");
    const phone = document.getElementById("interestPhone");
    const button =
      form.querySelector('button[type="submit"]') ||
      form.querySelector("button");

    if (!name || !phone || !button) {
      console.error("Não foram encontrados os campos do formulário.");
      return;
    }

    function makeInput(type, placeholder, autocomplete) {
      const input = document.createElement("input");
      input.type = type;
      input.placeholder = placeholder;
      input.autocomplete = autocomplete;
      input.required = true;
      input.style.cssText =
        "display:block;width:100%;padding:12px;border:1px solid #dce5dd;border-radius:10px;margin:8px 0;font:inherit;box-sizing:border-box";
      return input;
    }

    function makeLabel(text, input) {
      const label = document.createElement("label");
      label.textContent = text;
      label.htmlFor = input.id;
      label.style.cssText =
        "display:block;margin-top:10px;font-size:14px;color:#334155";
      return label;
    }

    const email = makeInput("email", "O seu e-mail", "email");
    email.id = "marketAuthEmail";
    email.setAttribute("aria-label", "E-mail");

    const password = makeInput(
      "password",
      "Palavra-passe (mínimo 6 caracteres)",
      "current-password"
    );
    password.id = "marketAuthPassword";
    password.minLength = 6;
    password.setAttribute("aria-label", "Palavra-passe");

    const province = document.createElement("select");
    province.id = "marketAuthProvince";
    province.required = true;
    province.style.cssText =
      "display:block;width:100%;padding:12px;border:1px solid #dce5dd;border-radius:10px;margin:8px 0;font:inherit;background:white;box-sizing:border-box";
    province.setAttribute("aria-label", "Província");

    const provincePlaceholder = document.createElement("option");
    provincePlaceholder.value = "";
    provincePlaceholder.textContent = "Selecione a sua província";
    provincePlaceholder.disabled = true;
    provincePlaceholder.selected = true;
    province.appendChild(provincePlaceholder);

    [
      "Cabo Delgado",
      "Gaza",
      "Inhambane",
      "Manica",
      "Maputo Cidade",
      "Maputo Província",
      "Nampula",
      "Niassa",
      "Sofala",
      "Tete",
      "Zambézia"
    ].forEach(function (item) {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      province.appendChild(option);
    });

    const district = makeInput(
      "text",
      "O seu distrito",
      "address-level3"
    );
    district.id = "marketAuthDistrict";
    district.setAttribute("aria-label", "Distrito");

    form.insertBefore(makeLabel("E-mail", email), phone);
    form.insertBefore(email, phone);
    form.insertBefore(makeLabel("Palavra-passe", password), phone);
    form.insertBefore(password, phone);
    form.insertBefore(
      makeLabel("Província", province),
      button
    );
    form.insertBefore(province, button);
    form.insertBefore(
      makeLabel("Distrito", district),
      button
    );
    form.insertBefore(district, button);

    function setFieldVisibility(input, visible) {
      input.hidden = !visible;

      const label = form.querySelector(
        'label[for="' + input.id + '"]'
      );
      if (label) label.hidden = !visible;

      if (input === name || input === phone) {
        const existingLabel = form.querySelector(
          'label[for="' + input.id + '"]'
        );
        if (existingLabel) existingLabel.hidden = !visible;
      }
    }

    function getMode() {
      const title =
        document.getElementById("modalTitle")?.textContent || "";
      const value = title.toLowerCase();

      if (value.includes("entrar")) return "login";
      if (
        value.includes("criar") ||
        value.includes("registar") ||
        value.includes("registrar")
      ) return "register";

      return "other";
    }

    function updateFormMode() {
      const mode = getMode();
      const registering = mode === "register";
      const loggingIn = mode === "login";

      [name, phone, province, district].forEach(function (field) {
        setFieldVisibility(field, registering);
        field.required = registering;
      });

      [email, password].forEach(function (field) {
        setFieldVisibility(field, registering || loggingIn);
        field.required = registering || loggingIn;
      });

      if (mode === "login") {
        password.autocomplete = "current-password";
        button.textContent = "Entrar";
      } else if (registering) {
        password.autocomplete = "new-password";
        button.textContent = "Criar conta";
      }
    }

    updateFormMode();

    const titleElement = document.getElementById("modalTitle");
    if (titleElement) {
      new MutationObserver(updateFormMode).observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    let busy = false;

    form.addEventListener("submit", async function (event) {
      const mode = getMode();
      if (mode !== "login" && mode !== "register") return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (busy) return;
      if (!form.reportValidity()) return;

      busy = true;
      button.disabled = true;

      try {
        let result;

        if (mode === "login") {
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
                phone: phone.value.trim(),
                province: province.value,
                district: district.value.trim()
              }
            }
          });
        }

        if (result.error) throw result.error;

        if (typeof closeModal === "function") closeModal();

        if (result.data.session) {
          alert(
            mode === "login"
              ? "Sessão iniciada com sucesso!"
              : "Conta criada com sucesso!"
          );
        } else {
          alert(
            "Conta enviada com sucesso. Verifica o teu e-mail para confirmar a conta antes de entrar."
          );
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
        alert("Não foi possível concluir: " + error.message);
      } finally {
        busy = false;
        button.disabled = false;
      }
    }, true);

    db.auth.getSession().then(function ({ data, error }) {
      if (error) {
        console.warn("Não foi possível verificar a sessão:", error.message);
        return;
      }

      const loginButton = document.getElementById("loginButton");
      if (loginButton && data.session) {
        loginButton.textContent = "A minha conta";
      }
    });

    db.from("listings").select("*").limit(100).then(function (result) {
      if (result.error) {
        console.warn("Anúncios ainda não carregados:", result.error.message);
        return;
      }

      console.log(
        "Ligação à tabela listings concluída:",
        result.data.length
      );
    });
  }
})();
