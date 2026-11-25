// Registration form -> leads API -> thank-you page.
// The project (Residencial / Hotelero / Senior) comes from the option picked
// in "Me interesa un apartamento"; each one has its own projectId and its own
// thank-you page. Used by index.html and the three landing pages.
(function () {
  const form = document.querySelector(".intro__form");
  if (!form) return;

  const API_URL =
    "https://paymentsummary.herokuapp.com/zonapublica/leads/ldxFWvlb0nLNRbC6xqz0NjA2QFUkI86l";
  const DEFAULT_ORIGIN_MEDIA = 130;

  // Option values start with the mode name ("Residencial de 69.5 m2", ...)
  const PROYECTOS = {
    Residencial: { id: 623, gracias: "gracias-residencial.html" },
    Hotelero: { id: 631, gracias: "gracias-hotelero.html" },
    Senior: { id: 632, gracias: "gracias-senior.html" },
  };

  // Extra CRM fields (same ids as the reference integration)
  const CAMPO_PLAZO = 224;
  const CAMPO_APARTAMENTO = 225;

  const nombre = form.querySelector("#nombre");
  const correo = form.querySelector("#email");
  const telefono = form.querySelector("#telefono");
  const apartamento = form.querySelector("#apartamento");
  const proposito = form.querySelector("#proposito");
  const plazo = form.querySelector("#plazo");
  const boton = form.querySelector(".intro__submit");

  // Allowed patterns
  const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,80}$/;
  const regexCorreo = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,185}\.[A-Za-z]{2,}$/;
  const regexTelefono = /^[0-9]{10}$/;
  const regexUtm = /^[A-Za-z0-9 _.+-]{1,100}$/;

  // Selects only accept the options defined in the HTML
  const opciones = (select) =>
    select ? Array.from(select.options).map((o) => o.value).filter(Boolean) : [];
  const opcionesApartamento = opciones(apartamento);
  const opcionesProposito = opciones(proposito);
  const opcionesPlazo = opciones(plazo);
  const valorLista = (select, lista) =>
    select && lista.includes(select.value) ? select.value : "";

  // Strips tags, control characters and symbols used in injections
  const limpiarTexto = (valor) =>
    String(valor || "")
      .replace(/<[^>]*>/g, "")
      .replace(/[\u0000-\u001F\u007F<>"'`{}\\;=]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const limpiarUtm = (valor) => {
    const limpio = limpiarTexto(valor);
    return regexUtm.test(limpio) ? limpio : null;
  };

  // UTMs from the landing URL
  const query = new URLSearchParams(location.search);
  const utmSource = limpiarUtm(query.get("utm_source"));
  const utmMedium = limpiarUtm(query.get("utm_medium"));
  const utmCampaign = limpiarUtm(query.get("utm_campaign"));
  const originMedia = /^[0-9]{1,6}$/.test(query.get("utm_origin_media") || "")
    ? Number(query.get("utm_origin_media"))
    : DEFAULT_ORIGIN_MEDIA;

  // Status line under the button (errors / sending)
  const estado = document.createElement("p");
  estado.className = "intro__form-status";
  estado.setAttribute("role", "alert");
  estado.hidden = true;
  boton.insertAdjacentElement("afterend", estado);
  const textoBoton = boton.textContent.trim();

  function mostrarEstado(texto) {
    estado.textContent = texto;
    estado.hidden = !texto;
  }

  // Custom messages for the browser's own validation bubbles
  function validarCampo(campo, ok, mensaje) {
    campo.setCustomValidity(ok ? "" : mensaje);
  }
  function validarNombre() {
    const v = nombre.value.replace(/\s+/g, " ").trim();
    validarCampo(
      nombre,
      v === "" || regexNombre.test(v),
      "El nombre solo puede contener letras y espacios (mínimo 3)."
    );
  }
  function validarCorreo() {
    const v = correo.value.trim();
    validarCampo(
      correo,
      v === "" || (v.length <= 254 && regexCorreo.test(v)),
      "Ingresa un correo válido."
    );
  }
  function validarTelefono() {
    const v = telefono.value.trim();
    validarCampo(
      telefono,
      v === "" || regexTelefono.test(v),
      "El teléfono debe tener 10 dígitos, solo números."
    );
  }
  nombre.addEventListener("input", validarNombre);
  correo.addEventListener("input", validarCorreo);
  telefono.addEventListener("input", () => {
    // Only digits, max 10
    const soloDigitos = telefono.value.replace(/\D/g, "").slice(0, 10);
    if (soloDigitos !== telefono.value) telefono.value = soloDigitos;
    validarTelefono();
  });

  let enviando = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;

    validarNombre();
    validarCorreo();
    validarTelefono();
    if (!form.reportValidity()) return;

    const valorNombre = limpiarTexto(nombre.value);
    const valorCorreo = correo.value.trim().toLowerCase();
    const valorTelefono = telefono.value.trim();
    const valorApartamento = valorLista(apartamento, opcionesApartamento);
    const valorProposito = valorLista(proposito, opcionesProposito);
    const valorPlazo = valorLista(plazo, opcionesPlazo);

    // Without the apartment question (home page) the form says which
    // project it belongs to: <form data-proyecto="Residencial">
    const modo = apartamento ? valorApartamento.split(" ")[0] : form.dataset.proyecto;
    const proyecto = PROYECTOS[modo];
    if (!proyecto || !valorProposito || !valorPlazo) {
      mostrarEstado("Revisa las opciones seleccionadas e intenta de nuevo.");
      return;
    }

    enviando = true;
    boton.disabled = true;
    boton.textContent = "Enviando…";
    mostrarEstado("");

    try {
      const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: valorNombre,
          lastname: "",
          email: valorCorreo,
          phone_number: valorTelefono,
          origin: 1,
          originMedia: originMedia,
          projectId: proyecto.id,
          camposAdicionalesVisita: [
            { IdCampo: CAMPO_PLAZO, Valor: valorPlazo },
            // "Me interesa comprar para" (valorProposito) has no IdCampo yet
          ].concat(
            valorApartamento ? [{ IdCampo: CAMPO_APARTAMENTO, Valor: valorApartamento }] : []
          ),
          fuenteReg: "Landing Estación 77 " + modo,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }),
      });

      // As in the reference: go to the thank-you page whenever the server
      // answers, even if it does not confirm the registration.
      const datos = await respuesta.json().catch(() => ({}));
      if (datos.success !== true) {
        console.log("Respuesta del registro:", respuesta.status, datos);
      }

      const params = new URLSearchParams({ name: valorNombre.split(" ")[0] });
      location.replace(proyecto.gracias + "?" + params.toString());
    } catch (error) {
      console.log(error);
      mostrarEstado("No fue posible enviar el formulario, intenta de nuevo.");
      boton.disabled = false;
      boton.textContent = textoBoton;
      enviando = false;
    }
  });
})();
