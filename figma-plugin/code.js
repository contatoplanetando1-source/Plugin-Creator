// Main thread — has access to Figma API
figma.showUI(__html__, { width: 420, height: 620, title: "Remove BG — Inside Jasson" });

// Export selected node as PNG bytes and send to UI
async function exportSelectedNode() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "error", message: "Selecione um layer de imagem no Figma primeiro." });
    return;
  }
  const node = sel[0];
  try {
    const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
    figma.ui.postMessage({
      type: "image-bytes",
      bytes: Array.from(bytes),
      name: node.name,
      width: "width" in node ? node.width : 400,
      height: "height" in node ? node.height : 400,
    });
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Não foi possível exportar o layer selecionado." });
  }
}

// Apply result PNG to Figma as a new layer
async function applyResultToFigma(bytes, originalName) {
  try {
    const imageHash = figma.createImage(new Uint8Array(bytes));
    const sel = figma.currentPage.selection;

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
    rect.name = `${originalName} — sem fundo`;
    rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: imageHash.hash }];

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);

    figma.ui.postMessage({ type: "applied" });
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Erro ao aplicar imagem no Figma: " + e.message });
  }
}

// Message handler from UI
figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case "get-selected":
      exportSelectedNode();
      break;
    case "apply-result":
      applyResultToFigma(msg.bytes, msg.name || "imagem");
      break;
    case "close":
      figma.closePlugin();
      break;
    case "notify":
      figma.notify(msg.message || "");
      break;
  }
};
