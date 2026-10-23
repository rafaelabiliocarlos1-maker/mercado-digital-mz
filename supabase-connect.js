(function () {
  "use strict";

  const URL = "https://qnktdyjivwojgvshuddn.supabase.co";
  const KEY = "sb_publishable_RnF64qRX-V4OTt7HtIothw_GvMCtfBI";

  const library = document.createElement("script");
  library.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  library.onload = start;
  library.onerror = function () {
    alert("Não foi possível carregar o sistema de contas.");
  };
  document.head.appendChild(library);

  function start() {
    const db = window.supabase.createClient(URL, KEY);
    const form = document.getElementById("interestForm");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalNote = document.querySelector(".modal-note");
    const backdrop = document.getElementById("modalBackdrop");
    const modal = backdrop && backdrop.querySelector(".modal");
    const loginButton = document.getElementById("loginButton");
    const mobileAccount = document.getElementById("mobileAccount");

    if (!form || !modal || !modalTitle) {
      console.error("Não foi possível encontrar o formulário ou a janela da conta.");
      return;
    }

    const name = document.getElementById("interestName");
    const phone = document.getElementById("interestPhone");
    const button =
      form.querySelector('button[type="submit"]') ||
      form.querySelector("button");

    if (!name || !phone || !button) return;

    const originalFormDisplay = form.style.display;
    const originalNoteDisplay = modalNote ? modalNote.style.display : "";
    let activeSession = null;
    let accountPanel = null;
    let busy = false;

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

    const district = makeInput("text", "O seu distrito", "address-level3");
    district.id = "marketAuthDistrict";
    district.setAttribute("aria-label", "Distrito");

    form.insertBefore(makeLabel("E-mail", email), phone);
    form.insertBefore(email, phone);
    form.insertBefore(makeLabel("Palavra-passe", password), phone);
    form.insertBefore(password, phone);
    form.insertBefore(makeLabel("Província", province), button);
    form.insertBefore(province, button);
    form.insertBefore(makeLabel("Distrito", district), button);
    form.insertBefore(district, button);

    function setFieldVisibility(input, visible) {
      input.hidden = !visible;
      const label = form.querySelector('label[for="' + input.id + '"]');
      if (label) label.hidden = !visible;
    }

    function getMode() {
      const value = (modalTitle.textContent || "").toLowerCase();

      if (value.includes("minha conta")) return "account";
      if (value.includes("quero vender")) return "sell";
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

      if (mode === "account" || mode === "sell") {
        form.hidden = true;
        if (modalNote) modalNote.hidden = true;
        return;
      }

      form.hidden = false;
      if (modalNote) modalNote.hidden = false;

      if (mode === "login") {
        password.autocomplete = "current-password";
        button.textContent = "Entrar";
      } else if (registering) {
        password.autocomplete = "new-password";
        button.textContent = "Criar conta";
      }
    }

    function ensureAccountPanel() {
      if (accountPanel) return accountPanel;

      accountPanel = document.createElement("div");
      accountPanel.id = "marketAccountPanel";
      accountPanel.style.cssText =
        "padding:16px 0;color:#24352a;line-height:1.6;overflow-wrap:anywhere";

      const heading = document.createElement("h3");
      heading.textContent = "A minha conta";
      heading.style.cssText = "margin:0 0 12px;color:#166534";

      const emailLine = document.createElement("p");
      emailLine.style.margin = "8px 0";

      const nameLine = document.createElement("p");
      nameLine.style.margin = "8px 0";

      const locationLine = document.createElement("p");
      locationLine.style.margin = "8px 0";

      const statusLine = document.createElement("p");
      statusLine.textContent = "Sessão iniciada";
      statusLine.style.cssText = "color:#15803d;font-weight:600;margin:12px 0";

      const signOutButton = document.createElement("button");
      signOutButton.type = "button";
      signOutButton.textContent = "Terminar sessão";
      signOutButton.style.cssText =
        "width:100%;padding:12px;border:0;border-radius:10px;background:#166534;color:white;font:inherit;font-weight:600;cursor:pointer;margin-top:12px";

      signOutButton.addEventListener("click", async function () {
        signOutButton.disabled = true;
        signOutButton.textContent = "A terminar sessão...";
        const result = await db.auth.signOut();

        if (result.error) {
          alert("Não foi possível terminar a sessão: " + result.error.message);
          signOutButton.disabled = false;
          signOutButton.textContent = "Terminar sessão";
          return;
        }

        activeSession = null;
        if (typeof closeModal === "function") closeModal();
        refreshAccountButton();
        alert("Sessão terminada com sucesso.");
      });

      accountPanel.append(
        heading,
        emailLine,
        nameLine,
        locationLine,
        statusLine,
        signOutButton
      );

      modal.appendChild(accountPanel);
      return accountPanel;
    }

    function refreshAccountButton() {
      if (loginButton) {
        loginButton.textContent = activeSession ? "A minha conta" : "Entrar";
      }
      if (mobileAccount) {
        mobileAccount.textContent = activeSession ? "A minha conta" : "Conta";
      }
    }

    function openAccount() {
      if (!activeSession) return;

      const user = activeSession.user;
      const metadata = user.user_metadata || {};
      const panel = ensureAccountPanel();
      const lines = panel.querySelectorAll("p");

      lines[0].textContent = "E-mail: " + (user.email || "Não indicado");
      lines[1].textContent =
        "Nome: " + (metadata.full_name || "Ainda não indicado");

      const provinceValue = metadata.province || "";
      const districtValue = metadata.district || "";
      const phoneValue = metadata.phone || "";

      const details = [];
      if (phoneValue) details.push("Telefone: " + phoneValue);
      if (provinceValue) details.push("Província: " + provinceValue);
      if (districtValue) details.push("Distrito: " + districtValue);

      lines[2].textContent = details.length
        ? details.join(" · ")
        : "Ainda não foram indicados outros dados do perfil.";

      form.hidden = true;
      if (modalNote) modalNote.hidden = true;
      panel.hidden = false;

      modalTitle.textContent = "A minha conta";
      if (modalDescription) {
        modalDescription.textContent = "Os dados básicos da sua conta.";
      }

      if (backdrop) backdrop.hidden = false;
    }

    function restoreNormalModal() {
      if (getMode() !== "account" && getMode() !== "sell") {
        if (accountPanel) accountPanel.hidden = true;
        form.hidden = false;
        if (modalNote) modalNote.hidden = false;
        updateFormMode();
      }
    }

    updateFormMode();

    const titleObserver = new MutationObserver(function () {
      updateFormMode();
      restoreNormalModal();
    });
    titleObserver.observe(modalTitle, {
      childList: true,
      characterData: true,
      subtree: true
    });

    function accountClickHandler(event) {
      if (!activeSession) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openAccount();
    }

    if (loginButton) {
      loginButton.addEventListener("click", accountClickHandler, true);
    }
    if (mobileAccount) {
      mobileAccount.addEventListener("click", accountClickHandler, true);
    }

    form.addEventListener("submit", async function (event) {
      const mode = getMode();
      if (mode !== "login" && mode !== "register") return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (busy || !form.reportValidity()) return;

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

        if (result.data.session) {
          activeSession = result.data.session;
          if (typeof closeModal === "function") closeModal();
          refreshAccountButton();

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

    db.auth.onAuthStateChange(function (_event, session) {
      activeSession = session || null;
      refreshAccountButton();

      if (!activeSession && accountPanel) {
        accountPanel.hidden = true;
      }
    });

    db.auth.getSession().then(function (result) {
      if (result.error) {
        console.warn("Não foi possível verificar a sessão:", result.error.message);
        return;
      }

      activeSession = result.data.session || null;
      refreshAccountButton();
    });

    
    // Formulário de publicação de anúncios
    const sellButton = document.getElementById("sellButton");

    if (sellButton) {
      sellButton.addEventListener("click", function (event) {
        if (!activeSession) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        let publishForm = document.getElementById("marketPublishForm");

        if (!publishForm) {
          publishForm = document.createElement("form");
          publishForm.id = "marketPublishForm";
          publishForm.style.cssText = "padding:12px 0";

          const fields = [
            ["Nome do alimento", "product_name", "text"],
            ["Categoria", "category", "text"],
            ["Preço em MT", "price_mzn", "number"],
            ["Quantidade", "quantity", "number"],
            ["Unidade (kg, saco, caixa)", "sale_unit", "text"],
            ["Condição do produto", "quality_condition", "text"],
            ["Província", "province", "text"],
            ["Distrito", "district", "text"],
            ["Localização", "location_description", "text"],
            ["Descrição", "description", "text"]
          ];

fields.forEach(function (item) {
  const label = document.createElement("label");
  label.textContent = item[0];
  label.style.cssText =
    "display:block;margin-top:10px;font-weight:600";

  let input;

  if (item[1] === "category") {
    input = document.createElement("select");

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione uma categoria";
    placeholder.disabled = true;
    placeholder.selected = true;
    input.appendChild(placeholder);

    [
      "Cereais",
      "Hortícolas e verduras",
      "Frutas",
      "Tubérculos e raízes",
      "Leguminosas e oleaginosas",
      "Produtos de origem animal",
      "Alimentos processados",
      "Outros alimentos"
    ].forEach(function (category) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      input.appendChild(option);
    });
  } else {
    input = document.createElement("input");
    input.type = item[2];
  }

  input.name = item[1];
  input.required = item[1] !== "description";
  input.style.cssText =
    "display:block;width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;box-sizing:border-box;background:white";

  if (item[2] === "number") {
    input.min = "0.01";
    input.step = "0.01";
  }

  publishForm.append(label, input);
});

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Publicar anúncio";
          submit.style.cssText =
            "width:100%;padding:13px;margin-top:14px;background:#166534;color:white;border:0;border-radius:9px;font-weight:bold";

          publishForm.appendChild(submit);

          publishForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (!activeSession) {
              alert("Entra novamente na tua conta.");
              return;
            }

            submit.disabled = true;
            submit.textContent = "A publicar...";

            try {
              const now = new Date().toISOString();

              const sub = await db
                .from("subscriptions")
                .select("id")
                .eq("user_id", activeSession.user.id)
                .eq("status", "active")
                .lte("starts_at", now)
                .gt("expires_at", now)
                .limit(1);

              if (sub.error) throw sub.error;

              if (!sub.data || !sub.data.length) {
                throw new Error(
                  "Precisas de uma subscrição ativa de 75 MT/mês para publicar."
                );
              }

              const v = Object.fromEntries(
                new FormData(publishForm).entries()
              );

              const result = await db.from("listings").insert({
                seller_id: activeSession.user.id,
                product_name: v.product_name.trim(),
                category: v.category.trim(),
                price_mzn: Number(v.price_mzn),
                quantity: Number(v.quantity),
                sale_unit: v.sale_unit.trim(),
                quality_condition: v.quality_condition.trim(),
                province: v.province.trim(),
                district: v.district.trim(),
                location_description: v.location_description.trim(),
                description: v.description.trim(),
                status: "available"
              });

              if (result.error) throw result.error;

              alert("Anúncio publicado com sucesso!");
              publishForm.reset();
            } catch (err) {
              alert("Não foi possível publicar: " + err.message);
            } finally {
              submit.disabled = false;
              submit.textContent = "Publicar anúncio";
            }
          });

          document.querySelector("#modalBackdrop .modal")
            .appendChild(publishForm);
        }

        document.getElementById("interestForm").hidden = true;
        publishForm.hidden = false;
        document.getElementById("modalTitle").textContent =
          "Quero vender no Mercado Digital";
        document.getElementById("modalDescription").textContent =
          "Preenche os dados do produto para publicar.";
        document.getElementById("modalBackdrop").hidden = false;
      }, true);
    }
db.from("listings").select("*").limit(100).then(function (result) {
      if (result.error) {
        console.warn("Anúncios ainda não carregados:", result.error.message);
        return;
      }

      console.log("Ligação à tabela listings concluída:", result.data.length);
    });
  }
})();
