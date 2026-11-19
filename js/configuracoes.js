/* =========================================================
   StudyFlow — configuracoes.js
   ========================================================= */
(function () {
  "use strict";

  var el = {
    temas: document.querySelectorAll("button.tema[data-tema]"), // o <html> também tem data-tema
    texto: document.getElementById("cfg-texto"),
    animacoes: document.getElementById("cfg-animacoes"),
    foco: document.getElementById("cfg-foco"),
    pausa: document.getElementById("cfg-pausa"),
    som: document.getElementById("cfg-som"),
    exportar: document.getElementById("btn-exportar"),
    apagar: document.getElementById("btn-apagar"),
    sair: document.getElementById("btn-sair"),
    matricula: document.getElementById("cfg-matricula"),
  };

  function salvo() {
    Layout.aviso("Salvo!", { icone: "check", tipo: "sucesso", duracao: 1500 });
  }

  function render() {
    var cfg = Config.ler();
    el.temas.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-tema") === cfg.tema));
    });
    el.texto.value = cfg.texto;
    el.animacoes.checked = !!cfg.reduzirAnimacoes;
    el.foco.value = String(cfg.foco);
    el.pausa.value = String(cfg.pausa);
    el.som.checked = !!cfg.som;
    el.matricula.textContent = Auth.usuario().matricula;
  }

  el.temas.forEach(function (b) {
    b.addEventListener("click", function () {
      Config.salvar({ tema: b.getAttribute("data-tema") });
      render();
      salvo();
    });
  });

  el.texto.addEventListener("change", function () {
    Config.salvar({ texto: el.texto.value });
    salvo();
  });

  el.animacoes.addEventListener("change", function () {
    Config.salvar({ reduzirAnimacoes: el.animacoes.checked });
    salvo();
  });

  el.som.addEventListener("change", function () {
    Config.salvar({ som: el.som.checked });
    salvo();
  });

  // Ao mudar os tempos, o cronômetro parado já começa com o novo tempo
  function ajustarPomodoro() {
    var p = Dados.ler("pomodoro", null);
    if (p && !p.rodando) {
      var cfg = Config.ler();
      p.restante = (p.modo === "pausa" ? cfg.pausa : cfg.foco) * 60;
      Dados.salvar("pomodoro", p);
    }
  }

  el.foco.addEventListener("change", function () {
    Config.salvar({ foco: parseInt(el.foco.value, 10) });
    ajustarPomodoro();
    salvo();
  });

  el.pausa.addEventListener("change", function () {
    Config.salvar({ pausa: parseInt(el.pausa.value, 10) });
    ajustarPomodoro();
    salvo();
  });

  el.exportar.addEventListener("click", function () {
    var dados = {
      app: "StudyFlow",
      exportadoEm: new Date().toISOString(),
      matricula: Auth.usuario().matricula,
      configuracoes: Config.ler(),
      dados: Dados.exportar(),
    };
    var blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "studyflow-" + Auth.usuario().matricula + "-" + Util.hojeISO() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  el.apagar.addEventListener("click", function () {
    var ok = confirm(
      "Apagar todos os seus dados deste navegador?\n\n" +
        "Eventos, planos, metas, conversas, moedas, conquistas e a Idebinha voltam ao começo. Isso não pode ser desfeito."
    );
    if (!ok) return;
    Dados.apagarTudo();
    // As fontes de estudo (PDFs, textos) ficam num banco separado (IndexedDB)
    try {
      indexedDB.deleteDatabase("studyflow-fontes-" + Auth.usuario().matricula);
    } catch (e) {}
    Layout.aviso("Dados apagados. Recomeçando…", { icone: "trash" });
    setTimeout(function () {
      window.location.href = "calendario.html";
    }, 900);
  });

  el.sair.addEventListener("click", function () {
    Auth.sair();
  });

  render();
})();
