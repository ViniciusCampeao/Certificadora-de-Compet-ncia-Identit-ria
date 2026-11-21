const dateBR = (value) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "____/____/______";

// Escreve o conteúdo do termo de voluntariado no documento PDFKit recebido.
// Não chama doc.end(): quem controla o stream encerra o documento.
export const composeTerm = (doc, volunteer) => {
  doc
    .fillColor("#1e6949")
    .fontSize(20)
    .text("ELLP+ctrl", { continued: true })
    .fillColor("#173d30")
    .text("  ·  Projeto de Extensão", { align: "left" });

  doc
    .moveDown(1.5)
    .fillColor("#173d30")
    .fontSize(16)
    .text("Termo de Adesão ao Voluntariado", { align: "center" });

  doc
    .moveDown(1.5)
    .fillColor("#202820")
    .fontSize(11)
    .text(
      "Pelo presente termo, o(a) voluntário(a) abaixo identificado(a) declara " +
        "adesão às atividades do Projeto ELLP, de forma espontânea e não " +
        "remunerada, comprometendo-se a observar as orientações e os princípios " +
        "do projeto durante o período de participação.",
      { align: "justify" },
    );

  doc.moveDown(1.2);
  const line = (label, value) =>
    doc
      .fontSize(11)
      .fillColor("#7e8980")
      .text(`${label}: `, { continued: true })
      .fillColor("#202820")
      .text(value || "—");

  line("Nome", volunteer.name);
  line("Matrícula", volunteer.registration);
  line("Curso", volunteer.course);
  line("Período", volunteer.period);
  line("E-mail", volunteer.email);
  line("Data de entrada", dateBR(volunteer.joined));
  line("Situação do vínculo", volunteer.status);

  doc
    .moveDown(2)
    .fillColor("#202820")
    .fontSize(11)
    .text(
      "Declaro estar ciente das atividades que me foram designadas e concordo " +
        "com os termos de participação como voluntário(a) do Projeto ELLP.",
      { align: "justify" },
    );

  doc.moveDown(4);
  doc.fontSize(11).fillColor("#202820").text("__________________________________________", {
    align: "center",
  });
  doc.text(`${volunteer.name}`, { align: "center" });
  doc
    .fillColor("#7e8980")
    .fontSize(9)
    .text("Assinatura do(a) voluntário(a)", { align: "center" });

  doc
    .moveDown(3)
    .fontSize(8)
    .fillColor("#7e8980")
    .text(
      `Documento gerado pelo ELLP+ctrl em ${new Date().toLocaleString("pt-BR")}.`,
      { align: "center" },
    );
};
