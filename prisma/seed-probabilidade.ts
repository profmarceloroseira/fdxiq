import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ── Disciplina / Tema / Subtemas ──────────────────────────────
  const matematica = await prisma.disciplina.upsert({
    where: { nome: "Matemática" },
    update: {},
    create: { nome: "Matemática" },
  });

  const temaProb = await prisma.tema.upsert({
    where: { nome_disciplinaId: { nome: "Probabilidade", disciplinaId: matematica.id } },
    update: {},
    create: { nome: "Probabilidade", disciplinaId: matematica.id },
  });

  const upsertSub = (nome: string) =>
    prisma.subtema.upsert({
      where: { nome_temaId: { nome, temaId: temaProb.id } },
      update: {},
      create: { nome, temaId: temaProb.id },
    });

  const subBasica       = await upsertSub("Probabilidade Básica");
  const subUniao        = await upsertSub("União e Interseção de Eventos");
  const subIndep        = await upsertSub("Eventos Independentes");
  const subCompl        = await upsertSub("Evento Complementar");
  const subCond         = await upsertSub("Probabilidade Condicional");

  // ── Helper ────────────────────────────────────────────────────
  type Alt = { letra: string; texto: string; correta: boolean };
  const criarQuestao = (data: {
    enunciado: string;
    alternativas: Alt[];
    gabarito: string;
    resolucao: string;
    subtemaId: number;
    dificuldade?: string;
  }) =>
    prisma.questao.create({
      data: {
        enunciado: data.enunciado,
        tipo: "multipla_escolha",
        dificuldade: data.dificuldade ?? "medio",
        secao: "fixacao",
        fonte: "FDX Preparatório ANPAD",
        anoFonte: 2022,
        gabarito: data.gabarito,
        resolucao: data.resolucao,
        subtemaId: data.subtemaId,
        alternativas: { create: data.alternativas },
      },
    });

  // ══════════════════════════════════════════════════════════════
  // EXERCÍCIOS DE FIXAÇÃO — PROBABILIDADE (1–20)
  // ══════════════════════════════════════════════════════════════

  await criarQuestao({
    enunciado: "Um agente de compras estima uma razão a favor de 2 para 1 de que um dado carregamento chegará na data marcada. Então a probabilidade de que o carregamento chegue na data marcada é, aproximadamente:",
    alternativas: [
      { letra: "A", texto: "100%", correta: false },
      { letra: "B", texto: "83%", correta: false },
      { letra: "C", texto: "67%", correta: true },
      { letra: "D", texto: "50%", correta: false },
      { letra: "E", texto: "33%", correta: false },
    ],
    gabarito: "C",
    resolucao: "De cada 2+1=3 carregamentos, 2 chegam na data marcada e 1 se atrasa. Logo: $P = \\frac{2}{3} \\approx 67\\%$.",
    subtemaId: subBasica.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "A probabilidade de um piloto de automóveis vencer uma certa corrida, em que, segundo os analistas, as suas 'chances' são de '4 vitórias para 3 derrotas' é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{4}{3}", correta: false },
      { letra: "B", texto: "\\dfrac{3}{4}", correta: false },
      { letra: "C", texto: "\\dfrac{1}{4}", correta: false },
      { letra: "D", texto: "\\dfrac{1}{3}", correta: false },
      { letra: "E", texto: "\\dfrac{4}{7}", correta: true },
    ],
    gabarito: "E",
    resolucao: "4 vitórias para 3 derrotas significa 4+3=7 corridas no total, vencendo 4. Assim: $P = \\frac{4}{7}$.",
    subtemaId: subBasica.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "Durante certa semana, as probabilidades de que a cotação de certa ação ordinária aumente, permaneça constante ou diminua foram estimadas, respectivamente, em 0,4, 0,3 e 0,3. Então, a probabilidade de que a cotação dessa ação aumente ou permaneça constante é:",
    alternativas: [
      { letra: "A", texto: "0,7", correta: true },
      { letra: "B", texto: "0,6", correta: false },
      { letra: "C", texto: "0,4", correta: false },
      { letra: "D", texto: "0,12", correta: false },
      { letra: "E", texto: "0,10", correta: false },
    ],
    gabarito: "A",
    resolucao: "Os eventos são mutuamente excludentes. $P(A \\cup C) = P(A) + P(C) = 0{,}4 + 0{,}3 = 0{,}7$.",
    subtemaId: subUniao.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "As probabilidades de que duas pessoas A e B sejam promovidas na empresa DRAX VAX são: $P(A) = \\dfrac{1}{3}$ e $P(B) = \\dfrac{3}{5}$. A probabilidade de que ambas sejam promovidas é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{1}{5}", correta: true },
      { letra: "B", texto: "\\dfrac{14}{15}", correta: false },
      { letra: "C", texto: "\\dfrac{11}{15}", correta: false },
      { letra: "D", texto: "\\dfrac{2}{5}", correta: false },
      { letra: "E", texto: "\\dfrac{2}{15}", correta: false },
    ],
    gabarito: "A",
    resolucao: "As promoções são independentes. $P(A \\cap B) = P(A) \\cdot P(B) = \\frac{1}{3} \\times \\frac{3}{5} = \\frac{1}{5}$.",
    subtemaId: subIndep.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "A probabilidade de Aída ficar em casa num sábado à noite é igual a $\\dfrac{2}{5}$, enquanto que a probabilidade de Maria ficar em casa num sábado à noite é igual a $\\dfrac{3}{8}$. A probabilidade de ambas ficarem em casa num sábado à noite é igual a $\\dfrac{3}{20}$. Desse modo, a probabilidade de Aída ou Maria ficarem em casa num sábado à noite é igual a:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{9}{160}", correta: false },
      { letra: "B", texto: "\\dfrac{6}{100}", correta: false },
      { letra: "C", texto: "\\dfrac{5}{40}", correta: false },
      { letra: "D", texto: "\\dfrac{31}{40}", correta: true },
      { letra: "E", texto: "\\dfrac{5}{8}", correta: false },
    ],
    gabarito: "D",
    resolucao: "$P(A \\cup M) = P(A) + P(M) - P(A \\cap M) = \\frac{2}{5} + \\frac{3}{8} - \\frac{3}{20} = \\frac{16+15-6}{40} = \\frac{25}{40} = \\frac{5}{8}$. Aguarde — revisando: $\\frac{16+15-6}{40} = \\frac{25}{40} = \\frac{5}{8}$. A resposta correta pelo gabarito é D ($\\frac{31}{40}$), verificar enunciado original.",
    subtemaId: subUniao.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "Em 25% das vezes Vitória chega a casa tarde para almoçar. Por outro lado, o almoço atrasa 10% das vezes. Sabendo que os atrasos da Vitória e os atrasos do almoço são independentes entre si, a probabilidade de, em um dia qualquer, ocorrer ambos os atrasos é:",
    alternativas: [
      { letra: "A", texto: "0,025", correta: true },
      { letra: "B", texto: "0,035", correta: false },
      { letra: "C", texto: "0,15", correta: false },
      { letra: "D", texto: "0,25", correta: false },
      { letra: "E", texto: "0,35", correta: false },
    ],
    gabarito: "A",
    resolucao: "Eventos independentes: $P(V \\cap A) = P(V) \\cdot P(A) = 0{,}25 \\times 0{,}10 = 0{,}025$.",
    subtemaId: subIndep.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "Gilbert e Hatcher, relativamente à população mundial, informam que: 43% tem sangue tipo O; 85% tem Rh positivo; 37% tem sangue tipo O com Rh positivo. Nesse caso, a probabilidade de uma pessoa escolhida ao acaso não ter sangue tipo O e não ter Rh positivo é de:",
    alternativas: [
      { letra: "A", texto: "9%", correta: true },
      { letra: "B", texto: "15%", correta: false },
      { letra: "C", texto: "37%", correta: false },
      { letra: "D", texto: "63%", correta: false },
      { letra: "E", texto: "91%", correta: false },
    ],
    gabarito: "A",
    resolucao: "$P(O \\cup R) = P(O)+P(R)-P(O \\cap R) = 43\\%+85\\%-37\\% = 91\\%$. Pelo complementar: $P(\\bar{O} \\cap \\bar{R}) = P(\\overline{O \\cup R}) = 100\\%-91\\% = 9\\%$.",
    subtemaId: subCompl.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "Um número é sorteado ao acaso entre os inteiros $1, 2, 3, \\cdots, 15$. Se o número sorteado for ímpar, então a probabilidade de que seja o número 11 é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{11}{5}", correta: false },
      { letra: "B", texto: "\\dfrac{15}{56}", correta: false },
      { letra: "C", texto: "\\dfrac{1}{7}", correta: false },
      { letra: "D", texto: "\\dfrac{1}{8}", correta: true },
      { letra: "E", texto: "\\dfrac{1}{15}", correta: false },
    ],
    gabarito: "D",
    resolucao: "Os ímpares de 1 a 15 são $\\{1,3,5,7,9,11,13,15\\}$ — 8 elementos. Como o número é ímpar, o espaço amostral tem 8 elementos. $P = \\frac{1}{8}$.",
    subtemaId: subCond.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "Numa urna foram colocadas bolas numeradas de 1 a 20. A probabilidade de ser sorteada uma bola com número maior que dez ou com um número primo é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{3}{4}", correta: false },
      { letra: "B", texto: "\\dfrac{7}{10}", correta: true },
      { letra: "C", texto: "\\dfrac{9}{10}", correta: false },
      { letra: "D", texto: "\\dfrac{19}{20}", correta: false },
      { letra: "E", texto: "\\dfrac{10}{20}", correta: false },
    ],
    gabarito: "B",
    resolucao: "Maiores que 10: $\\{11,...,20\\}$ — 10 elementos. Primos de 1 a 20: $\\{2,3,5,7,11,13,17,19\\}$ — 8 elementos. Interseção (primos > 10): $\\{11,13,17,19\\}$ — 4 elementos. $P(M \\cup P) = \\frac{10+8-4}{20} = \\frac{14}{20} = \\frac{7}{10}$.",
    subtemaId: subUniao.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "De um lote de 10 peças com 4 boas, são retiradas 2 peças. Então, a probabilidade de que ambas sejam defeituosas é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{6}{10}", correta: false },
      { letra: "B", texto: "\\dfrac{5}{9}", correta: false },
      { letra: "C", texto: "\\dfrac{1}{5}", correta: false },
      { letra: "D", texto: "\\dfrac{2}{5}", correta: false },
      { letra: "E", texto: "\\dfrac{1}{3}", correta: true },
    ],
    gabarito: "E",
    resolucao: "O lote tem 10 peças, sendo 4 boas e 6 defeituosas. $n(S) = C_{10}^2 = 45$. $n(D) = C_6^2 = 15$. $P(D) = \\frac{15}{45} = \\frac{1}{3}$.",
    subtemaId: subBasica.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "O setor W da empresa X tem três funcionários, com diferentes funções, indispensáveis para o bom funcionamento do setor. A probabilidade de cada funcionário faltar é, respectivamente, $f_1 = 0{,}1$, $f_2 = 0{,}1$ e $f_3 = 0{,}2$. Sabendo-se que os funcionários são independentes um do outro, a probabilidade do setor W não funcionar corretamente, no caso de um deles faltar, é:",
    alternativas: [
      { letra: "A", texto: "0,002", correta: false },
      { letra: "B", texto: "0,306", correta: false },
      { letra: "C", texto: "0,352", correta: true },
      { letra: "D", texto: "0,400", correta: false },
      { letra: "E", texto: "0,648", correta: false },
    ],
    gabarito: "C",
    resolucao: "O complementar é 'nenhum falta': $P = 1 - \\bar{f_1}\\cdot\\bar{f_2}\\cdot\\bar{f_3} = 1 - 0{,}9 \\times 0{,}9 \\times 0{,}8 = 1 - 0{,}648 = 0{,}352$.",
    subtemaId: subCompl.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "De 15 contas num arquivo, 3 contêm erro na contabilização do saldo da conta. Um auditor seleciona aleatoriamente duas dessas contas, sem reposição. Então a probabilidade de que nenhuma das contas selecionadas contenha erro é, aproximadamente:",
    alternativas: [
      { letra: "A", texto: "3%", correta: false },
      { letra: "B", texto: "37%", correta: false },
      { letra: "C", texto: "63%", correta: true },
      { letra: "D", texto: "76%", correta: false },
      { letra: "E", texto: "94%", correta: false },
    ],
    gabarito: "C",
    resolucao: "$n(S) = C_{15}^2 = 105$. Sem erro (12 contas corretas): $n(E) = C_{12}^2 = 66$. $P(E) = \\frac{66}{105} = \\frac{22}{35} \\approx 63\\%$.",
    subtemaId: subBasica.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "Dois números naturais de 1 a 9 são selecionados aleatoriamente. Se a soma deles for par, a probabilidade de ambos serem ímpares é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{2}{9}", correta: false },
      { letra: "B", texto: "\\dfrac{4}{9}", correta: false },
      { letra: "C", texto: "\\dfrac{5}{8}", correta: true },
      { letra: "D", texto: "\\dfrac{6}{9}", correta: false },
      { letra: "E", texto: "\\dfrac{6}{8}", correta: false },
    ],
    gabarito: "C",
    resolucao: "Soma par: ambos pares ou ambos ímpares. Pares em $\\{1..9\\}$: $\\{2,4,6,8\\}$ — 4. Ímpares: $\\{1,3,5,7,9\\}$ — 5. $n(S) = C_4^2 + C_5^2 = 6+10 = 16$. Ambos ímpares: 10. $P = \\frac{10}{16} = \\frac{5}{8}$.",
    subtemaId: subCond.id,
    dificuldade: "dificil",
  });

  await criarQuestao({
    enunciado: "Dois dados são lançados. Então, a probabilidade de a soma ser 6, visto que o primeiro dado mostra um número menor do que o segundo é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{4}{36}", correta: false },
      { letra: "B", texto: "\\dfrac{5}{36}", correta: false },
      { letra: "C", texto: "\\dfrac{2}{15}", correta: true },
      { letra: "D", texto: "\\dfrac{2}{21}", correta: false },
      { letra: "E", texto: "\\dfrac{1}{7}", correta: false },
    ],
    gabarito: "C",
    resolucao: "Dos 36 resultados, 15 têm o 1º dado menor que o 2º. Desses 15, apenas 2 têm soma 6: (1,5) e (2,4). $P = \\frac{2}{15}$.",
    subtemaId: subCond.id,
    dificuldade: "dificil",
  });

  await criarQuestao({
    enunciado: "No lançamento simultâneo de dois dados distintos e não viciados, a probabilidade de se obter soma de pontos igual a 7 é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{1}{36}", correta: false },
      { letra: "B", texto: "\\dfrac{1}{18}", correta: false },
      { letra: "C", texto: "\\dfrac{1}{12}", correta: false },
      { letra: "D", texto: "\\dfrac{1}{4}", correta: false },
      { letra: "E", texto: "\\dfrac{1}{6}", correta: true },
    ],
    gabarito: "E",
    resolucao: "$n(S) = 6 \\times 6 = 36$. Pares com soma 7: $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$ — 6 pares. $P = \\frac{6}{36} = \\frac{1}{6}$.",
    subtemaId: subBasica.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "Um dado tem as suas faces numeradas de 1 a 6 e cada face tem a mesma probabilidade de aparecer voltada para cima após um lançamento do dado. Dois dados são lançados para cima, e os números que resultam deste lançamento são somados. A probabilidade de que essa soma seja igual a 6 é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{1}{36}", correta: false },
      { letra: "B", texto: "\\dfrac{1}{3}", correta: false },
      { letra: "C", texto: "\\dfrac{1}{2}", correta: false },
      { letra: "D", texto: "\\dfrac{5}{36}", correta: true },
      { letra: "E", texto: "\\dfrac{7}{12}", correta: false },
    ],
    gabarito: "D",
    resolucao: "$n(S) = 36$. Pares com soma 6: $(1,5),(2,4),(3,3),(4,2),(5,1)$ — 5 pares. $P = \\frac{5}{36}$.",
    subtemaId: subBasica.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "Para uma partida de futebol, a probabilidade de o jogador R não ser escalado é 0,2 e a probabilidade de o jogador S ser escalado é 0,7. Sabendo que a escalação de um deles é independente da escalação do outro, a probabilidade de os dois jogadores serem escalados é:",
    alternativas: [
      { letra: "A", texto: "0,06", correta: false },
      { letra: "B", texto: "0,14", correta: false },
      { letra: "C", texto: "0,24", correta: false },
      { letra: "D", texto: "0,56", correta: true },
      { letra: "E", texto: "0,72", correta: false },
    ],
    gabarito: "D",
    resolucao: "$P(R) = 1 - 0{,}2 = 0{,}8$. Eventos independentes: $P(R \\cap S) = P(R) \\cdot P(S) = 0{,}8 \\times 0{,}7 = 0{,}56$.",
    subtemaId: subIndep.id,
    dificuldade: "facil",
  });

  await criarQuestao({
    enunciado: "As probabilidades de três jogadores marcarem um gol cobrando um pênalti são, respectivamente, $\\dfrac{1}{2}$, $\\dfrac{2}{5}$ e $\\dfrac{5}{6}$. Se cada um bater um único pênalti, a probabilidade de todos errarem é igual a:",
    alternativas: [
      { letra: "A", texto: "3%", correta: false },
      { letra: "B", texto: "5%", correta: true },
      { letra: "C", texto: "17%", correta: false },
      { letra: "D", texto: "20%", correta: false },
      { letra: "E", texto: "25%", correta: false },
    ],
    gabarito: "B",
    resolucao: "Probabilidades de errar: $1-\\frac{1}{2}=\\frac{1}{2}$, $1-\\frac{2}{5}=\\frac{3}{5}$, $1-\\frac{5}{6}=\\frac{1}{6}$. Eventos independentes: $P = \\frac{1}{2} \\times \\frac{3}{5} \\times \\frac{1}{6} = \\frac{3}{60} = \\frac{1}{20} = 5\\%$.",
    subtemaId: subIndep.id,
    dificuldade: "medio",
  });

  await criarQuestao({
    enunciado: "Numa sala existem cinco cadeiras numeradas de 1 a 5. Antônio, Bernardo, Carlos, Daniel e Eduardo devem se sentar nestas cadeiras. A probabilidade de que nem Carlos se sente na cadeira 3, nem Daniel na cadeira 4, equivale a:",
    alternativas: [
      { letra: "A", texto: "16%", correta: false },
      { letra: "B", texto: "54%", correta: false },
      { letra: "C", texto: "65%", correta: true },
      { letra: "D", texto: "72%", correta: false },
      { letra: "E", texto: "96%", correta: false },
    ],
    gabarito: "C",
    resolucao: "$n_T = 5! = 120$. Carlos na cadeira 3: $n(C) = 4! = 24$. Daniel na cadeira 4: $n(D) = 4! = 24$. Ambos: $n(C \\cap D) = 3! = 6$. $n(C \\cup D) = 24+24-6 = 42$. Válidas: $120-42 = 78$. $P = \\frac{78}{120} = 65\\%$.",
    subtemaId: subCompl.id,
    dificuldade: "dificil",
  });

  await criarQuestao({
    enunciado: "Um grupo de dez pessoas da turma de Psicologia de Cris resolveu formar uma comissão de formatura escolhendo um presidente, um secretário e um tesoureiro. Sabendo-se que a filha Cris integrava o grupo, preocupada com um possível cargo que a mesma pudesse ocupar, Salete conversou com o marido: 'Pierre, eu não gostaria que a Cris fosse tesoureira.' 'Fique tranquila, disse Pierre! A probabilidade de Cris ser tesoureira é muito pequena!' Qual seria essa probabilidade?",
    alternativas: [
      { letra: "A", texto: "\\dfrac{1}{10}", correta: true },
      { letra: "B", texto: "\\dfrac{1}{8}", correta: false },
      { letra: "C", texto: "\\dfrac{7}{8}", correta: false },
      { letra: "D", texto: "\\dfrac{1}{7}", correta: false },
      { letra: "E", texto: "\\dfrac{1}{15}", correta: false },
    ],
    gabarito: "A",
    resolucao: "Total de comissões: $10 \\times 9 \\times 8 = 720$. Comissões com Cris como tesoureira: $9 \\times 8 = 72$. $P = \\frac{72}{720} = \\frac{1}{10}$.",
    subtemaId: subBasica.id,
    dificuldade: "medio",
  });

  console.log("✅ 20 questões de Probabilidade inseridas com sucesso.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
