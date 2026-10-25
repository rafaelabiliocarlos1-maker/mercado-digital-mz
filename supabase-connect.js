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

     
      const subscriptionButton = document.createElement("button");
      subscriptionButton.type = "button";
      subscriptionButton.textContent = "A minha subscrição";
      subscriptionButton.style.cssText =
        "width:100%;padding:12px;border:1px solid #166534;border-radius:10px;background:white;color:#166534;font:inherit;font-weight:600;cursor:pointer;margin-top:8px";

      const subscriptionPanel = document.createElement("div");
      subscriptionPanel.hidden = true;
      subscriptionPanel.style.cssText =
        "margin-top:12px;padding:14px;border:1px solid #dce5dd;border-radius:12px;background:#f7fbf7;overflow-wrap:anywhere";

      subscriptionButton.addEventListener("click", async function () {
        subscriptionPanel.hidden = false;
        subscriptionPanel.textContent = "A consultar a subscrição...";

        try {
          const result = await db
            .from("subscriptions")
            .select("amount_mzn,status,starts_at,expires_at,created_at")
            .eq("user_id", activeSession.user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (result.error) throw result.error;

          subscriptionPanel.replaceChildren();

          const heading = document.createElement("h4");
          heading.textContent = "A minha subscrição";
          heading.style.color = "#166534";

          const amount = document.createElement("p");
          amount.textContent = "Valor mensal: 75 MT";

          const state = document.createElement("p");
          const dates = document.createElement("p");
          const payment = document.createElement("p");
          payment.textContent =
            "Número indicado para pagamento: 862 472 110.";

          const notice = document.createElement("p");
          notice.style.fontSize = "13px";
          notice.textContent =
            "A subscrição só deve ser ativada após confirmação real do pagamento. Esta página ainda não confirma pagamentos automaticamente.";

          if (!result.data || !result.data.length) {
            state.textContent =
              "Estado: nenhuma subscrição registada.";
            dates.textContent = "Validade: indisponível.";
          } else {
            const sub = result.data[0];
            const now = Date.now();
            const starts = sub.starts_at
              ? new Date(sub.starts_at).getTime()
              : null;
            const expires = sub.expires_at
              ? new Date(sub.expires_at).getTime()
              : null;

            const valid =
              sub.status === "active" &&
              starts !== null &&
              starts <= now &&
              expires !== null &&
              expires > now;

            state.textContent =
              "Estado: " +
              (valid
                ? "Ativa"
                : sub.status === "pending"
                  ? "Pendente de confirmação"
                  : "Expirada ou inativa");

            state.style.fontWeight = "600";
            state.style.color = valid ? "#15803d" : "#9a3412";

            const formatDate = function (value) {
              return value
                ? new Date(value).toLocaleString("pt-MZ", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })
                : "não definida";
            };

            dates.textContent =
              "Início: " + formatDate(sub.starts_at) +
              " · Validade até: " + formatDate(sub.expires_at);
          }

          subscriptionPanel.append(
            heading, amount, state, dates, payment, notice
          );
        } catch (error) {
          subscriptionPanel.textContent =
            "Não foi possível consultar a subscrição. Tenta novamente.";
          console.warn("Erro na subscrição:", error.message);
        }
      });
  const adminButton = document.createElement("button");
  adminButton.type = "button";
  adminButton.textContent = "Administração — subscrições";
  adminButton.hidden = true;
  adminButton.style.cssText =
    "width:100%;padding:12px;border:1px solid #166534;border-radius:10px;background:#f0fdf4;color:#166534;font:inherit;font-weight:600;cursor:pointer;margin-top:12px";

  const adminPanel = document.createElement("div");
  adminPanel.hidden = true;
  adminPanel.style.cssText =
    "margin-top:12px;padding:14px;border:1px solid #dce5dd;border-radius:12px;background:#f7fbf7;overflow-wrap:anywhere";

  adminButton.addEventListener("click", async function () {
    adminPanel.hidden = !adminPanel.hidden;
    if (adminPanel.hidden) return;

    adminPanel.textContent = "A consultar pedidos pendentes...";

    try {
      const result = await db
        .from("subscriptions")
        .select("id,user_id,amount_mzn,created_at,status")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (result.error) throw result.error;

      adminPanel.replaceChildren();

      const heading = document.createElement("h4");
      heading.textContent = "Pedidos de subscrição pendentes";
      heading.style.color = "#166534";
      adminPanel.appendChild(heading);

      if (!result.data || result.data.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Não existem pedidos pendentes neste momento.";
        adminPanel.appendChild(empty);
        return;
      }

      result.data.forEach(function (sub) {
        const card = document.createElement("div");
        card.style.cssText =
          "padding:12px 0;border-top:1px solid #dce5dd;margin-top:10px";

        const details = document.createElement("p");
        details.textContent =
          "Valor: " + sub.amount_mzn + " MT · Utilizador: " + sub.user_id +
          " · Data: " + new Date(sub.created_at).toLocaleString("pt-MZ");
        details.style.cssText = "font-size:13px;overflow-wrap:anywhere";
        card.appendChild(details);

        const provider = document.createElement("select");
        provider.style.cssText =
          "display:block;width:100%;padding:10px;border:1px solid #dce5dd;border-radius:8px;margin:8px 0;font:inherit;background:white;box-sizing:border-box";

        [
          ["mpesa", "M-Pesa"],
          ["emola", "e-Mola"]
        ].forEach(function (item) {
          const option = document.createElement("option");
          option.value = item[0];
          option.textContent = item[1];
          provider.appendChild(option);
        });

        const reference = document.createElement("input");
        reference.type = "text";
        reference.placeholder = "Referência real da transação";
        reference.maxLength = 160;
        reference.style.cssText =
          "display:block;width:100%;padding:10px;border:1px solid #dce5dd;border-radius:8px;margin:8px 0;font:inherit;box-sizing:border-box";

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.textContent = "Confirmar pagamento recebido";
        confirmButton.style.cssText =
          "width:100%;padding:11px;margin-top:8px;background:#166534;color:white;border:0;border-radius:9px;font:inherit;font-weight:600;cursor:pointer";

        confirmButton.addEventListener("click", async function () {
          const paymentReference = reference.value.trim();

          if (!paymentReference) {
            alert("Introduz a referência real do pagamento.");
            reference.focus();
            return;
          }

          if (!window.confirm(
            "Confirmas que verificaste o recebimento real dos 75 MT? Só continua se o dinheiro já foi recebido."
          )) return;

          confirmButton.disabled = true;
          confirmButton.textContent = "A confirmar...";

          try {
            const response = await db.rpc("admin_confirm_subscription", {
              p_subscription_id: sub.id,
              p_provider: provider.value,
              p_reference: paymentReference
            });

            if (response.error) throw response.error;

            alert("Subscrição ativada com sucesso.");
            adminButton.click();
            adminButton.click();
          } catch (error) {
            alert("Não foi possível confirmar: " + error.message);
            confirmButton.disabled = false;
            confirmButton.textContent = "Confirmar pagamento recebido";
          }
        });

        card.append(provider, reference, confirmButton);
        adminPanel.appendChild(card);
      });
    } catch (error) {
      adminPanel.textContent =
        "Erro ao consultar pedidos. Verifica as permissões no Supabase e tenta novamente.";
      console.warn("Erro administrativo:", error.message);
    }
  }); const signOutButton = document.createElement("button");
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
        subscriptionButton,
        subscriptionPanel,        adminButton,
        adminPanel,
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
         refreshAdminAccess(); }

   async function refreshAdminAccess() {
  if (!activeSession || !accountPanel) return;

  const adminButton =
    accountPanel.querySelector("#marketAdminButton") ||
    Array.from(accountPanel.querySelectorAll("button")).find(
      function (item) {
        return item.textContent === "Administração — subscrições";
      }
    );

  if (!adminButton) return;

  adminButton.hidden = true;

  try {
    const result = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", activeSession.user.id)
      .maybeSingle();

    if (result.error) throw result.error;

    adminButton.hidden = !(
      result.data && result.data.role === "admin"
    );
  } catch (error) {
    console.warn(
      "Não foi possível verificar o acesso administrativo:",
      error.message
    );
  }
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
  event.preventDefault();
  event.stopImmediatePropagation();

  const title = document.getElementById("modalTitle");
  const form = document.getElementById("interestForm");
  const backdrop = document.getElementById("modalBackdrop");
  const note = document.querySelector(".modal-note");

  if (!title || !form || !backdrop) return;

  if (activeSession) {
    openAccount();
    return;
  }

  if (accountPanel) accountPanel.hidden = true;

  title.textContent = "Entrar";

  const description = document.getElementById("modalDescription");
  if (description) {
    description.textContent =
      "Introduz o teu e-mail e a tua palavra-passe para entrar.";
  }

  form.hidden = false;
  if (note) note.hidden = true;

  updateFormMode();
  backdrop.hidden = false;
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

async function loadMarketListings() {
  const result = await db
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (result.error) {
    console.warn("Erro ao carregar anúncios:", result.error.message);
    return;
  }

  if (!result.data || result.data.length === 0) return;

  const liveProducts = result.data.map((row, index) => ({
    id: row.id || index + 1,
    name: row.product_name || "Produto alimentar",
    category: row.category || "Outros alimentos",
    province: row.province || "",
    district: row.district || row.location_description || "",
    price: Number(row.price_mzn) || 0,
    unit: row.sale_unit || "unidade",
    quantity: String(row.quantity ?? "A confirmar"),
    image: "",
    alt: row.product_name || "Produto alimentar",
    status: row.status === "unavailable" ? "unavailable" : "available",
    stamp: row.created_at
      ? new Date(row.created_at).getTime()
      : Date.now()
  }));

  products.splice(0, products.length, ...liveProducts);
  render();

  const line = document.getElementById("resultsLine");
  if (line) {
    line.innerHTML =
      `A mostrar <strong>${liveProducts.length} anúncios reais</strong> publicados.`;
  }
}

window.loadMarketListings = loadMarketListings;
loadMarketListings();  }
})();

