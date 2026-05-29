// Remove BG — Insider Jasson
// Detecta automaticamente o layer selecionado, sem upload manual

figma.showUI(__html__, { width: 360, height: 560, title: "Remove BG — Insider Jasson" });

let lastNodeId = null;

// Exporta o node selecionado e manda para a UI
async function exportSelection() {
  const sel = figma.currentPage.selection;
  if (!sel.length) {
    figma.ui.postMessage({ type: "no-selection" });
    return;
  }

  const node = sel[0];
  if (node.id === lastNodeId) return; // evita reexportar o mesmo
  lastNodeId = node.id;

  figma.ui.postMessage({ type: "loading-preview" });

  try {
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 },
    });
    figma.ui.postMessage({
      type: "image-ready",
      bytes: Array.from(bytes),
      name: node.name,
      width: "width" in node ? node.width : 400,
      height: "height" in node ? node.height : 400,
    });
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Não foi possível ler o layer selecionado." });
  }
}

// Detecta mudança de seleção em tempo real
figma.on("selectionchange", () => {
  lastNodeId = null; // permite reexportar
  exportSelection();
});

// Ao abrir o plugin, já tenta pegar a seleção atual
exportSelection();

// Mensagens vindas da UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {

    case "capture-element":
      // Reseta para deixar o usuário selecionar outro elemento
      lastNodeId = null;
      figma.notify("Clique em um elemento no Figma para capturá-lo…", { timeout: 3000 });
      figma.ui.postMessage({ type: "waiting-capture" });
      break;

    case "apply-result":
      try {
        const sel = figma.currentPage.selection;
        const imageHash = figma.createImage(new Uint8Array(msg.bytes));

        let x = 100, y = 100, w = 400, h = 400;
        if (sel.length > 0 && "x" in sel[0]) {
          x = sel[0].x + (sel[0].width || 400) + 20;
          y = sel[0].y;
          w = sel[0].width || 400;
          h = sel[0].height || 400;
        }

        const rect = figma.createRectangle();
        rect.resize(w, h);
        rect.x = x;
        rect.y = y;
        rect.name = (msg.name || "imagem") + " — sem fundo";
        rect.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: imageHash.hash }];

        figma.currentPage.appendChild(rect);
        figma.currentPage.selection = [rect];
        figma.viewport.scrollAndZoomIntoView([rect]);
        figma.ui.postMessage({ type: "applied" });
        figma.notify("✅ Imagem sem fundo inserida no Figma!");
      } catch (e) {
        figma.ui.postMessage({ type: "error", message: "Erro ao inserir no Figma: " + e.message });
      }
      break;

    case "close":
      figma.closePlugin();
      break;
  }
};
