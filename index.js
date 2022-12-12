const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(cors());
app.listen(3000).address("0.0.0.0", () => {
  console.log("Running server");
});

app.post("/:busca", async (req, res) => {
  // rota de consulta
  const { gerarPDF, gerarPRINT } = req.body;
  const busca = req.params.busca;

  //biblioteca puppeteer para automação
  const Elementbusca = busca;
  const navegador = await puppeteer.launch(); // abrir navegador
  const pagina = await navegador.newPage(); // cria pagina de pesquisa

  await pagina.goto(
    `https://www.google.com/search?q=${Elementbusca}&oq=${Elementbusca}e&aqs=chrome.0.69i59l2j0i131i433i512j0i512j0i67i433j69i60l2j69i61.1420j0j7&sourceid=chrome&ie=UTF-8`
  ); //pagina de pesquisa, é possivel escolher qualquer pagina

  const pageContent = await pagina.evaluate(() => {
    return {
      title01: document.querySelectorAll(".yuRUbf a h3")[0].innerHTML,
      title02: document.querySelectorAll(".yuRUbf a h3")[1].innerHTML,
    };
  }); // selecionando o lugar(elemento html) que quero pegar os dados

  if (gerarPDF === "true") {
    await pagina.pdf({
      printBackground: true,
      path: "webpage.pdf",
      format: "Letter",
      margin: {
        top: "20px",
        bottom: "40px",
        left: "20px",
        right: "20px",
      },
    });
  } // caso o usuario queira gerar um PDF da pagina.

  if (gerarPRINT === "true") {
    await pagina.screenshot({ path: "./captura.png" }); // caso o usuario queira gerar um Screenshot da pagina.
  }

  const patchs = {
    patchPDF: __dirname + "/webpage.pdf",
    patchIMG: __dirname + "/captura.png",
  };

  if (gerarPRINT != "true" && gerarPDF != "true") {
    patchs.patchPDF = "PDF não Solicitado";
    patchs.patchIMG = "Screenshot não Solicitado";
  }
  if (gerarPRINT != "true") {
    patchs.patchIMG = "Screenshot não Solicitado";
  }
  if (gerarPDF  != "true") {
    patchs.patchPDF = "PDF não Solicitado";
  }

  const retorno = {
    pageContent,
    patchs,
  };
  console.log(retorno) // resultado tambem terá como saida um console.log()
  return res.send(retorno); // resultado em tela para requisição
});
